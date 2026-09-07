"""
REST API & SQL Server for Todobar Google Sheets Backend
Provides /api/tasks, /api/sql, and /api/health endpoints.
"""

import os
import json
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from typing import Any
from sheets_sql import SheetsSQLEngine

# Resolve paths
SERVER_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.dirname(SERVER_DIR)
KEY_PATH = os.path.join(APP_DIR, 'service-account.json')
ENV_PATH = os.path.join(APP_DIR, '.env')

def load_sheet_id():
    sheet_id = os.environ.get('VITE_GOOGLE_SHEET_ID') or os.environ.get('GOOGLE_SHEET_ID')
    if not sheet_id and os.path.exists(ENV_PATH):
        with open(ENV_PATH, 'r', encoding='utf-8') as f:
            for line in f:
                if line.startswith('VITE_GOOGLE_SHEET_ID=') or line.startswith('GOOGLE_SHEET_ID='):
                    sheet_id = line.strip().split('=', 1)[1].strip('"\' ')
                    break
    # Default fallback to newly created sheet
    return sheet_id or '1b9OitPeSDeBhtrx_bZ2ovrByLMXfmEJfcSP8S4PEAGI'

SHEET_ID = load_sheet_id()
engine = None

def get_engine():
    global engine
    if engine is None:
        try:
            env_json = os.environ.get('SERVICE_ACCOUNT_JSON')
            if env_json:
                import tempfile
                with tempfile.NamedTemporaryFile('w', delete=False, suffix='.json') as tmp:
                    tmp.write(env_json)
                    tmp_path = tmp.name
                engine = SheetsSQLEngine(tmp_path, SHEET_ID)
            elif os.path.exists(KEY_PATH):
                engine = SheetsSQLEngine(KEY_PATH, SHEET_ID)
            else:
                print(f"[Sheets SQL Backend] No credentials found at {KEY_PATH} or in SERVICE_ACCOUNT_JSON")
                return None
            engine.ensure_sheet_tabs()
            engine.pull_from_sheets()
            print(f"[Sheets SQL Backend] Connected to Google Sheet: {SHEET_ID}")
        except Exception as e:
            print(f"[Sheets SQL Backend] Note: Make sure the sheet is shared with the service account: {e}")
    return engine

class RequestHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def _send_json(self, status: int, data: Any):
        body = json.dumps(data, indent=2).encode('utf-8')
        self.send_response(status)
        self._send_cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/api/health':
            eng = get_engine()
            return self._send_json(200, {
                'status': 'online',
                'service_account': 'todobar-sheets-backend@utility-melody-390608.iam.gserviceaccount.com',
                'spreadsheet_id': SHEET_ID,
                'connected': eng is not None
            })

        if path == '/api/tasks':
            eng = get_engine()
            if not eng:
                return self._send_json(503, {'error': 'Google Sheets backend not connected. Check service-account.json and sheet permissions.'})
            try:
                tasks = eng.execute_sql('SELECT * FROM tasks ORDER BY created_at DESC')
                return self._send_json(200, {'tasks': tasks})
            except Exception as e:
                return self._send_json(500, {'error': str(e)})

        self._send_json(404, {'error': 'Endpoint not found'})

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length).decode('utf-8') if length > 0 else '{}'
        data = json.loads(body) if body else {}

        if path == '/api/sql':
            eng = get_engine()
            if not eng:
                return self._send_json(503, {'error': 'Google Sheets backend not connected.'})
            query = data.get('query', '')
            if not query:
                return self._send_json(400, {'error': 'Query required'})
            try:
                rows = eng.execute_sql(query)
                return self._send_json(200, {'query': query, 'rows': rows})
            except Exception as e:
                return self._send_json(400, {'error': str(e)})

        if path == '/api/tasks/delete' or (path == '/api/tasks' and data.get('action') == 'delete'):
            eng = get_engine()
            if not eng:
                return self._send_json(503, {'error': 'Backend not connected.'})
            try:
                task_id = data.get('id')
                if not task_id:
                    return self._send_json(400, {'error': 'Task id required'})
                eng.execute_sql('DELETE FROM tasks WHERE id = ?', (task_id,))
                return self._send_json(200, {'success': True, 'deleted': task_id})
            except Exception as e:
                return self._send_json(500, {'error': str(e)})

        if path == '/api/tasks':
            eng = get_engine()
            if not eng:
                return self._send_json(503, {'error': 'Backend not connected.'})
            try:
                eng.execute_sql('''
                    INSERT OR REPLACE INTO tasks 
                    (id, title, notes, priority, category, due_date, completed, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    data.get('id'),
                    data.get('title', ''),
                    data.get('notes', ''),
                    data.get('priority', 'medium'),
                    data.get('category', 'Personal'),
                    data.get('due_date', ''),
                    1 if data.get('completed') else 0,
                    data.get('created_at', ''),
                    data.get('updated_at', '')
                ))
                return self._send_json(201, {'success': True, 'task': data})
            except Exception as e:
                return self._send_json(500, {'error': str(e)})

        self._send_json(404, {'error': 'Endpoint not found'})

def run_server(port=None):
    if port is None:
        port = int(os.environ.get('PORT', 5050))
    server = HTTPServer(('0.0.0.0', port), RequestHandler)
    print(f"Todobar Sheets SQL Server running on 0.0.0.0:{port}")
    server.serve_forever()

if __name__ == '__main__':
    run_server()
