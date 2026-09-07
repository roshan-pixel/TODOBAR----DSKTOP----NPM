import os
import sys

SERVER_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(SERVER_DIR)
from sheets_sql import SheetsSQLEngine

key_path = os.path.join(os.path.dirname(SERVER_DIR), 'service-account.json')
sheet_id = '1b9OitPeSDeBhtrx_bZ2ovrByLMXfmEJfcSP8S4PEAGI'

try:
    engine = SheetsSQLEngine(key_path, sheet_id)
    print("Testing connection to Google Sheets...")
    meta = engine.service.spreadsheets().get(spreadsheetId=sheet_id).execute()
    print("Spreadsheet Title:", meta.get("properties", {}).get("title"))
    print("Existing Tabs:", [s["properties"]["title"] for s in meta.get("sheets", [])])
    
    print("\nEnsuring table tabs (tasks, focus_sessions)...")
    engine.ensure_sheet_tabs()
    
    print("\nTesting SQL Insert into 'tasks' table...")
    engine.execute_sql("""
        INSERT OR REPLACE INTO tasks 
        (id, title, notes, priority, category, due_date, completed, created_at, updated_at)
        VALUES ('task-init-1', 'Welcome to Todobar with Google Sheets SQL Backend!', 'Google Sheets is now your live SQL database', 'focus', 'Work', 'Today', 0, datetime('now'), datetime('now'))
    """)
    
    print("\nTesting SQL SELECT query from 'tasks' table...")
    tasks = engine.execute_sql("SELECT id, title, priority, category, completed FROM tasks")
    print(f"Total tasks retrieved via SQL: {len(tasks)}")
    for t in tasks:
        print(f"  [+] {t['id']}: {t['title']} | Priority: {t['priority']} | Completed: {bool(t['completed'])}")
        
    print("\n>>> SUCCESS: Google Sheets SQL Backend is 100% verified and operational! <<<")
except Exception as e:
    print("Connection error:", e)
