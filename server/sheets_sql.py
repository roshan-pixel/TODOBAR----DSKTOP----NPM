"""
Google Sheets SQL Backend Engine for Todobar
Uses Google Sheets API v4 with Service Account authentication.
Mirrors sheets into an SQLite relational engine for instant SQL querying.
"""

import os
import json
import sqlite3
from typing import List, Dict, Any, Optional
from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
]

class SheetsSQLEngine:
    def __init__(self, key_path: str, spreadsheet_id: str):
        self.key_path = key_path
        self.spreadsheet_id = spreadsheet_id
        self.creds = service_account.Credentials.from_service_account_file(
            key_path, scopes=SCOPES
        )
        self.service = build('sheets', 'v4', credentials=self.creds)
        self.db = sqlite3.connect(':memory:', check_same_thread=False)
        self.db.row_factory = sqlite3.Row
        self._init_sqlite_schema()

    def _init_sqlite_schema(self):
        cursor = self.db.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                notes TEXT,
                priority TEXT DEFAULT 'medium',
                category TEXT DEFAULT 'Personal',
                due_date TEXT,
                completed INTEGER DEFAULT 0,
                created_at TEXT,
                updated_at TEXT
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS focus_sessions (
                id TEXT PRIMARY KEY,
                task_id TEXT,
                duration_minutes INTEGER,
                started_at TEXT,
                completed_at TEXT,
                mode TEXT
            )
        ''')
        self.db.commit()

    def ensure_sheet_tabs(self):
        """Ensure 'tasks' and 'focus_sessions' sheets exist in Google Spreadsheet"""
        meta = self.service.spreadsheets().get(spreadsheetId=self.spreadsheet_id).execute()
        existing_sheets = [s['properties']['title'] for s in meta.get('sheets', [])]
        
        requests = []
        if 'tasks' not in existing_sheets:
            requests.append({'addSheet': {'properties': {'title': 'tasks'}}})
        if 'focus_sessions' not in existing_sheets:
            requests.append({'addSheet': {'properties': {'title': 'focus_sessions'}}})
            
        if requests:
            self.service.spreadsheets().batchUpdate(
                spreadsheetId=self.spreadsheet_id,
                body={'requests': requests}
            ).execute()
            
        # Write headers if empty
        self._ensure_headers('tasks', ['id', 'title', 'notes', 'priority', 'category', 'due_date', 'completed', 'created_at', 'updated_at'])
        self._ensure_headers('focus_sessions', ['id', 'task_id', 'duration_minutes', 'started_at', 'completed_at', 'mode'])

    def _ensure_headers(self, sheet_name: str, headers: List[str]):
        res = self.service.spreadsheets().values().get(
            spreadsheetId=self.spreadsheet_id,
            range=f'{sheet_name}!A1:Z1'
        ).execute()
        values = res.get('values') or []
        if not values or not values[0]:
            self.service.spreadsheets().values().update(
                spreadsheetId=self.spreadsheet_id,
                range=f'{sheet_name}!A1',
                valueInputOption='RAW',
                body={'values': [headers]}
            ).execute()

    def pull_from_sheets(self):
        """Pull data from Google Sheets into the local in-memory SQLite database"""
        res = self.service.spreadsheets().values().get(
            spreadsheetId=self.spreadsheet_id,
            range='tasks!A1:Z1000'
        ).execute()
        rows = res.get('values') or []
        if len(rows) > 1:
            headers = [h.strip().lower() for h in rows[0]]
            cursor = self.db.cursor()
            cursor.execute('DELETE FROM tasks')
            for row in rows[1:]:
                # pad row
                row_data = row + [''] * (len(headers) - len(row))
                item = dict(zip(headers, row_data))
                cursor.execute('''
                    INSERT OR REPLACE INTO tasks 
                    (id, title, notes, priority, category, due_date, completed, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    item.get('id', ''),
                    item.get('title', ''),
                    item.get('notes', ''),
                    item.get('priority', 'medium'),
                    item.get('category', 'Personal'),
                    item.get('due_date', ''),
                    1 if str(item.get('completed', '')).lower() in ('1', 'true') else 0,
                    item.get('created_at', ''),
                    item.get('updated_at', '')
                ))
            self.db.commit()
        return self.execute_sql('SELECT * FROM tasks')

    def push_tasks_to_sheet(self):
        """Overwrite Google Sheets tasks tab with SQLite state"""
        cursor = self.db.cursor()
        cursor.execute('SELECT id, title, notes, priority, category, due_date, completed, created_at, updated_at FROM tasks')
        db_rows = cursor.fetchall()
        
        headers = ['id', 'title', 'notes', 'priority', 'category', 'due_date', 'completed', 'created_at', 'updated_at']
        sheet_data = [headers]
        for r in db_rows:
            sheet_data.append([
                str(r[0]),
                str(r[1]),
                str(r[2] or ''),
                str(r[3] or 'medium'),
                str(r[4] or 'Personal'),
                str(r[5] or ''),
                'true' if r[6] else 'false',
                str(r[7] or ''),
                str(r[8] or '')
            ])
            
        self.service.spreadsheets().values().clear(
            spreadsheetId=self.spreadsheet_id,
            range='tasks!A:Z'
        ).execute()
        
        self.service.spreadsheets().values().update(
            spreadsheetId=self.spreadsheet_id,
            range='tasks!A1',
            valueInputOption='RAW',
            body={'values': sheet_data}
        ).execute()

    def execute_sql(self, sql_query: str, params: Optional[tuple] = None) -> List[Dict[str, Any]]:
        """Run standard SQL query against tasks/focus_sessions table"""
        cursor = self.db.cursor()
        if params:
            cursor.execute(sql_query, params)
        else:
            cursor.execute(sql_query)
            
        is_mutation = any(sql_query.strip().upper().startswith(k) for k in ['INSERT', 'UPDATE', 'DELETE', 'REPLACE'])
        if is_mutation:
            self.db.commit()
            self.push_tasks_to_sheet()
            return [{'affected_rows': cursor.rowcount}]
        else:
            rows = cursor.fetchall()
            return [dict(r) for r in rows]
