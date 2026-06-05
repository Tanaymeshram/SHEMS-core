import os
from sqlalchemy import text
from database import engine

def upgrade():
    print("[DB Upgrade] Connecting to database to inspect schema...")
    with engine.connect() as conn:
        # Check database type
        db_name = conn.dialect.name
        print(f"[DB Upgrade] Dialect is: {db_name}")
        
        # Check and add utilization_rate
        try:
            # We try to query the column first to see if it exists
            conn.execute(text("SELECT utilization_rate FROM equipment LIMIT 1"))
            print("[DB Upgrade] Column 'utilization_rate' already exists in table 'equipment'.")
        except Exception:
            print("[DB Upgrade] Adding column 'utilization_rate' to table 'equipment'...")
            try:
                conn.execute(text("ALTER TABLE equipment ADD COLUMN utilization_rate DOUBLE DEFAULT 0.0"))
                conn.commit()
                print("[DB Upgrade] Successfully added 'utilization_rate'.")
            except Exception as e:
                print(f"[DB Upgrade ERROR] Failed to add utilization_rate: {e}")

        # Check and add idle_time
        try:
            conn.execute(text("SELECT idle_time FROM equipment LIMIT 1"))
            print("[DB Upgrade] Column 'idle_time' already exists in table 'equipment'.")
        except Exception:
            print("[DB Upgrade] Adding column 'idle_time' to table 'equipment'...")
            try:
                conn.execute(text("ALTER TABLE equipment ADD COLUMN idle_time DOUBLE DEFAULT 0.0"))
                conn.commit()
                print("[DB Upgrade] Successfully added 'idle_time'.")
            except Exception as e:
                print(f"[DB Upgrade ERROR] Failed to add idle_time: {e}")

if __name__ == "__main__":
    upgrade()
