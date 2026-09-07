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
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS timer_state (
                device_id TEXT PRIMARY KEY,
                seconds_remaining INTEGER,
                total_seconds INTEGER,
                is_running INTEGER DEFAULT 0,
                task_id TEXT,
                updated_at TEXT
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS spotify_tokens (
                key TEXT PRIMARY KEY,
                access_token TEXT,
                refresh_token TEXT,
                token_type TEXT,
                expires_at INTEGER,
                scope TEXT,
                updated_at TEXT
            )
        ''')
        self.db.commit()

    def ensure_sheet_tabs(self):
        """Ensure 'tasks', 'focus_sessions', 'timer_state', and 'spotify_tokens' sheets exist"""
        meta = self.service.spreadsheets().get(spreadsheetId=self.spreadsheet_id).execute()
        existing_sheets = [s['properties']['title'] for s in meta.get('sheets', [])]
        
        requests = []
        if 'tasks' not in existing_sheets:
            requests.append({'addSheet': {'properties': {'title': 'tasks'}}})
        if 'focus_sessions' not in existing_sheets:
            requests.append({'addSheet': {'properties': {'title': 'focus_sessions'}}})
        if 'timer_state' not in existing_sheets:
            requests.append({'addSheet': {'properties': {'title': 'timer_state'}}})
        if 'spotify_tokens' not in existing_sheets:
            requests.append({'addSheet': {'properties': {'title': 'spotify_tokens'}}})
            
        if requests:
            self.service.spreadsheets().batchUpdate(
                spreadsheetId=self.spreadsheet_id,
                body={'requests': requests}
            ).execute()
            
        # Write headers if empty
        self._ensure_headers('tasks', ['id', 'title', 'notes', 'priority', 'category', 'due_date', 'completed', 'created_at', 'updated_at'])
        self._ensure_headers('focus_sessions', ['id', 'task_id', 'duration_minutes', 'started_at', 'completed_at', 'mode'])
        self._ensure_headers('timer_state', ['device_id', 'seconds_remaining', 'total_seconds', 'is_running', 'task_id', 'updated_at'])
        self._ensure_headers('spotify_tokens', ['key', 'access_token', 'refresh_token', 'token_type', 'expires_at', 'scope', 'updated_at'])

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

    # ── Timer State Sync ──────────────────────────────────────────────────────

    def get_latest_timer_state(self) -> Optional[Dict[str, Any]]:
        """Read the most recently updated timer row from Google Sheets directly."""
        try:
            res = self.service.spreadsheets().values().get(
                spreadsheetId=self.spreadsheet_id,
                range='timer_state!A1:F1000'
            ).execute()
            rows = res.get('values') or []
            if len(rows) < 2:
                return None
            headers = [h.strip().lower() for h in rows[0]]
            records = [dict(zip(headers, row + [''] * (len(headers) - len(row)))) for row in rows[1:]]
            # Return newest by updated_at
            records.sort(key=lambda r: r.get('updated_at', ''), reverse=True)
            r = records[0]
            return {
                'device_id':        r.get('device_id', ''),
                'seconds_remaining': int(r.get('seconds_remaining', 0) or 0),
                'total_seconds':     int(r.get('total_seconds', 2700) or 2700),
                'is_running':        str(r.get('is_running', '0')).lower() in ('1', 'true'),
                'task_id':           r.get('task_id', ''),
                'updated_at':        r.get('updated_at', ''),
            }
        except Exception as e:
            print(f'[Timer] get_latest_timer_state error: {e}')
            return None

    def save_timer_state(self, device_id: str, seconds_remaining: int,
                         total_seconds: int, is_running: bool,
                         task_id: str, updated_at: str):
        """Upsert this device's timer row in Google Sheets."""
        try:
            # Read current rows
            res = self.service.spreadsheets().values().get(
                spreadsheetId=self.spreadsheet_id,
                range='timer_state!A1:F1000'
            ).execute()
            rows = res.get('values') or []

            headers = ['device_id', 'seconds_remaining', 'total_seconds', 'is_running', 'task_id', 'updated_at']
            new_row = [device_id, str(seconds_remaining), str(total_seconds),
                       '1' if is_running else '0', task_id, updated_at]

            if not rows:
                # Write headers + first row
                self.service.spreadsheets().values().update(
                    spreadsheetId=self.spreadsheet_id,
                    range='timer_state!A1',
                    valueInputOption='RAW',
                    body={'values': [headers, new_row]}
                ).execute()
                return

            # Find existing row index for this device_id (column A)
            row_index = None
            for i, row in enumerate(rows[1:], start=2):
                if row and row[0] == device_id:
                    row_index = i
                    break

            if row_index is not None:
                self.service.spreadsheets().values().update(
                    spreadsheetId=self.spreadsheet_id,
                    range=f'timer_state!A{row_index}',
                    valueInputOption='RAW',
                    body={'values': [new_row]}
                ).execute()
            else:
                # Append new row
                self.service.spreadsheets().values().append(
                    spreadsheetId=self.spreadsheet_id,
                    range='timer_state!A1',
                    valueInputOption='RAW',
                    insertDataOption='INSERT_ROWS',
                    body={'values': [new_row]}
                ).execute()
        except Exception as e:
            print(f'[Timer] save_timer_state error: {e}')

    # ── Spotify Token Persistence & Auto-Refresh ─────────────────────────────

    def get_spotify_token(self) -> Optional[Dict[str, Any]]:
        """Read saved Spotify token row from Google Sheets tab."""
        try:
            res = self.service.spreadsheets().values().get(
                spreadsheetId=self.spreadsheet_id,
                range='spotify_tokens!A1:G10'
            ).execute()
            rows = res.get('values') or []
            if len(rows) < 2:
                return None
            headers = [h.strip().lower() for h in rows[0]]
            record = dict(zip(headers, rows[1] + [''] * (len(headers) - len(rows[1]))))
            return {
                'key': record.get('key', 'default'),
                'access_token': record.get('access_token', ''),
                'refresh_token': record.get('refresh_token', ''),
                'token_type': record.get('token_type', 'Bearer'),
                'expires_at': int(record.get('expires_at', 0) or 0),
                'scope': record.get('scope', ''),
                'updated_at': record.get('updated_at', ''),
            }
        except Exception as e:
            print(f'[Spotify Sheets] get_spotify_token error: {e}')
            return None

    def save_spotify_token(self, access_token: str, refresh_token: str = '',
                           token_type: str = 'Bearer', expires_in: int = 3600,
                           scope: str = '', key: str = 'default') -> bool:
        """Upsert Spotify token permanently into Google Sheets tab."""
        try:
            import time
            from datetime import datetime, timezone
            expires_at = int(time.time()) + expires_in
            updated_at = datetime.now(timezone.utc).isoformat()
            headers = ['key', 'access_token', 'refresh_token', 'token_type', 'expires_at', 'scope', 'updated_at']
            row = [key, access_token, refresh_token, token_type, str(expires_at), scope, updated_at]

            self.service.spreadsheets().values().update(
                spreadsheetId=self.spreadsheet_id,
                range='spotify_tokens!A1:G2',
                valueInputOption='RAW',
                body={'values': [headers, row]}
            ).execute()
            print(f'[Spotify Sheets] Token saved successfully (expires_at={expires_at})')
            return True
        except Exception as e:
            print(f'[Spotify Sheets] save_spotify_token error: {e}')
            return False

    def get_valid_spotify_token(self, client_id: str, client_secret: str) -> Optional[str]:
        """
        Get valid Spotify access token from Google Sheets.
        If expired, automatically refreshes via refresh_token or Client Credentials,
        updates Google Sheets, and returns fresh access token with ZERO user login required.
        """
        import time
        import base64
        import urllib.request
        import urllib.parse
        now = int(time.time())

        # 1. Check if token in Google Sheets is still valid (60s buffer)
        saved = self.get_spotify_token()
        if saved and saved.get('access_token') and saved.get('expires_at', 0) > now + 60:
            return saved['access_token']

        # 2. If we have a refresh_token, refresh the session
        if saved and saved.get('refresh_token'):
            try:
                auth = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
                body = urllib.parse.urlencode({
                    'grant_type': 'refresh_token',
                    'refresh_token': saved['refresh_token']
                }).encode()
                req = urllib.request.Request(
                    'https://accounts.spotify.com/api/token',
                    data=body,
                    headers={
                        'Authorization': f'Basic {auth}',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                )
                with urllib.request.urlopen(req, timeout=10) as resp:
                    data = json.loads(resp.read().decode())
                    new_access = data.get('access_token')
                    new_refresh = data.get('refresh_token', saved['refresh_token'])
                    exp_in = data.get('expires_in', 3600)
                    if new_access:
                        self.save_spotify_token(new_access, new_refresh, expires_in=exp_in)
                        return new_access
            except Exception as e:
                print(f'[Spotify Sheets] Refresh token failed: {e}')

        # 3. Fallback: Client Credentials flow using Client ID & Secret
        try:
            auth = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
            req = urllib.request.Request(
                'https://accounts.spotify.com/api/token',
                data=b'grant_type=client_credentials',
                headers={
                    'Authorization': f'Basic {auth}',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode())
                token = data.get('access_token')
                exp_in = data.get('expires_in', 3600)
                if token:
                    self.save_spotify_token(token, refresh_token='', expires_in=exp_in)
                    return token
        except Exception as e:
            print(f'[Spotify Sheets] Client credentials token fetch error: {e}')

        return None
