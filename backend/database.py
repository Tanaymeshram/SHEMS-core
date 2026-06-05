import os
import random
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from db_models import Base, User, Setting, Equipment, EnergyReading, SensorLog, MaintenanceLog, Alert

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = lambda: None

# Load environment variables
load_dotenv()

DB_TYPE = os.getenv("DB_TYPE", "sqlite").lower()
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "smart_hospital_energy")

SQLITE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hospital_energy.db")

from urllib.parse import quote_plus

# Setup SQLAlchemy connection string and engine
if DB_TYPE == "mysql":
    try:
        import pymysql
        # Verify connection and create database if not exists
        conn = pymysql.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD
        )
        with conn.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{MYSQL_DATABASE}`")
        conn.commit()
        conn.close()

        password_encoded = quote_plus(MYSQL_PASSWORD)
        DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{password_encoded}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"
        engine = create_engine(DATABASE_URL, pool_recycle=3600, echo=False)
        print(f"[DB] Initialized with MySQL engine at {MYSQL_HOST}:{MYSQL_PORT}")
    except Exception as e:
        print(f"[DB ERROR] MySQL connection failed: {e}. Falling back to SQLite local database.")
        DB_TYPE = "sqlite"
        DATABASE_URL = f"sqlite:///{SQLITE_PATH}"
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    DATABASE_URL = f"sqlite:///{SQLITE_PATH}"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    print("[DB] Initialized with SQLite engine.")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_db_connection():
    """Keep compatibility with legacy cursor-based components (e.g. ml_engine, reports)"""
    import sqlite3
    import pymysql
    if DB_TYPE == "mysql":
        try:
            return pymysql.connect(
                host=MYSQL_HOST,
                port=MYSQL_PORT,
                user=MYSQL_USER,
                password=MYSQL_PASSWORD,
                database=MYSQL_DATABASE,
                cursorclass=pymysql.cursors.DictCursor
            )
        except Exception as e:
            conn = sqlite3.connect(SQLITE_PATH)
            conn.row_factory = sqlite3.Row
            return conn
    else:
        conn = sqlite3.connect(SQLITE_PATH)
        conn.row_factory = sqlite3.Row
        return conn

def execute_query(conn, query, params=None):
    """Keep compatibility with legacy components"""
    cursor = conn.cursor()
    try:
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        return cursor
    except Exception as e:
        print(f"[DB ERROR] Query failed: {query} | Error: {e}")
        raise e

def init_db():
    print("[DB] Initializing database tables and default values...")
    # Create all tables defined in db_models
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Seed Users
        if db.query(User).count() == 0:
            default_users = [
                User(username="admin", password="admin123", role="Admin", name="Dr. Sarah Jenkins (Chief Administrator)"),
                User(username="manager", password="manager123", role="Energy Manager", name="Alex Rivera (Energy Operations Manager)"),
                User(username="tech", password="tech123", role="Technician", name="Marcus Vance (HVAC & Facilities Tech)")
            ]
            db.add_all(default_users)
            db.commit()
            print("[DB] Default users seeded.")

        # 2. Seed Settings
        if db.query(Setting).count() == 0:
            default_settings = [
                Setting(key="hvac_eco_mode", value="1"),
                Setting(key="lighting_occupancy_control", value="1"),
                Setting(key="battery_peak_shaving", value="1"),
                Setting(key="idle_equipment_alerts", value="1"),
                Setting(key="icu_target_temp", value="21.5"),
                Setting(key="ot_target_temp", value="20.5"),
                Setting(key="wards_target_temp", value="23.0"),
                Setting(key="outpatient_target_temp", value="24.0"),
                Setting(key="admin_target_temp", value="24.0"),
                Setting(key="data_collection_mode", value="3") # Mode 1: Infra, Mode 2: IoT Sensors, Mode 3: Hybrid
            ]
            db.add_all(default_settings)
            db.commit()
            print("[DB] Default settings seeded.")

        # 3. Seed Equipment
        if db.query(Equipment).count() == 0:
            default_equipment = [
                Equipment(name="ICU Ventilator Suite A", type="Ventilators", is_critical=1, status="Active", power_draw=1.2, standby_loss=0.1, operating_hours=4820.5, maintenance_due="2026-08-15", utilization_rate=95.5, idle_time=0.0),
                Equipment(name="ICU Ventilator Suite B", type="Ventilators", is_critical=1, status="Active", power_draw=1.2, standby_loss=0.1, operating_hours=4120.0, maintenance_due="2026-08-15", utilization_rate=92.4, idle_time=0.0),
                Equipment(name="Cardiac Monitor Suite", type="ICU Monitors", is_critical=1, status="Active", power_draw=0.3, standby_loss=0.05, operating_hours=12050.2, maintenance_due="2026-09-01", utilization_rate=99.1, idle_time=0.0),
                Equipment(name="Emergency Infusion Pump", type="Infusion Pumps", is_critical=1, status="Active", power_draw=0.15, standby_loss=0.02, operating_hours=2350.4, maintenance_due="2026-09-01", utilization_rate=88.5, idle_time=0.0),
                Equipment(name="OT Emergency Lighting", type="Emergency Systems", is_critical=1, status="Active", power_draw=0.8, standby_loss=0.1, operating_hours=1450.8, maintenance_due="2026-07-20", utilization_rate=100.0, idle_time=0.0),
                Equipment(name="Life Support System Core", type="Life Support Systems", is_critical=1, status="Active", power_draw=2.5, standby_loss=0.5, operating_hours=21050.5, maintenance_due="2026-10-01", utilization_rate=100.0, idle_time=0.0),
                Equipment(name="MRI Express 3T", type="MRI", is_critical=0, status="Idle", power_draw=4.2, standby_loss=12.5, operating_hours=8750.1, maintenance_due="2026-06-10", utilization_rate=42.5, idle_time=1.5),
                Equipment(name="High-Speed CT Scanner", type="CT Scan", is_critical=0, status="Standby", power_draw=1.8, standby_loss=4.5, operating_hours=5420.3, maintenance_due="2026-06-25", utilization_rate=38.0, idle_time=2.1),
                Equipment(name="Digital X-Ray Wing B", type="X-Ray", is_critical=0, status="Off", power_draw=1.5, standby_loss=2.1, operating_hours=3100.2, maintenance_due="2026-07-05", utilization_rate=29.4, idle_time=4.5),
                Equipment(name="Clinical Dialysis Unit 1", type="Dialysis Units", is_critical=0, status="Active", power_draw=0.9, standby_loss=0.1, operating_hours=6200.5, maintenance_due="2026-08-01", utilization_rate=65.2, idle_time=0.0),
                Equipment(name="Research Server Node A", type="Research Equipment", is_critical=0, status="Active", power_draw=1.4, standby_loss=0.3, operating_hours=9120.4, maintenance_due="2026-07-15", utilization_rate=84.5, idle_time=0.0),
                Equipment(name="Hematology Analyzer Lab 1", type="Laboratory Equipment", is_critical=0, status="Active", power_draw=0.7, standby_loss=0.12, operating_hours=5240.2, maintenance_due="2026-08-01", utilization_rate=52.0, idle_time=0.0),
                Equipment(name="Admin Workstation PC 1", type="Office PCs", is_critical=0, status="Active", power_draw=0.25, standby_loss=0.02, operating_hours=3200.5, maintenance_due="2026-09-01", utilization_rate=45.0, idle_time=0.0),
                Equipment(name="Lobby LaserJet 500", type="Printers", is_critical=0, status="Active", power_draw=0.35, standby_loss=0.04, operating_hours=1850.1, maintenance_due="2026-08-15", utilization_rate=15.5, idle_time=0.0),
                Equipment(name="Wards Entertainment TV", type="TVs", is_critical=0, status="Active", power_draw=0.18, standby_loss=0.01, operating_hours=7200.8, maintenance_due="2026-09-10", utilization_rate=78.0, idle_time=0.0),
                Equipment(name="Lobby Information Display", type="Displays", is_critical=0, status="Active", power_draw=0.22, standby_loss=0.02, operating_hours=4210.0, maintenance_due="2026-09-15", utilization_rate=90.0, idle_time=0.0)
            ]
            db.add_all(default_equipment)
            db.commit()
            print("[DB] Default equipment seeded.")


        # 4. Seed 30-Day Historical Data
        if db.query(EnergyReading).count() == 0:
            print("[DB] Seeding 30 days of hourly historical BEMS sensor entries...")
            start_time = datetime.now() - timedelta(days=30)
            
            readings_to_insert = []
            sensors_to_insert = []
            
            for hour_offset in range(30 * 24):
                current_time = start_time + timedelta(hours=hour_offset)
                ts = current_time.strftime("%Y-%m-%d %H:00:00")
                
                hour = current_time.hour
                weekday = current_time.weekday()
                is_weekend = weekday >= 5
                
                icu_occ = random.randint(8, 12)
                icu_power = 25.0 + icu_occ * 0.8 + random.uniform(-2, 2)
                
                ot_active = (9 <= hour <= 17) and not is_weekend
                ot_occ = random.randint(5, 15) if ot_active else 0
                ot_power = (45.0 + ot_occ * 1.5 + random.uniform(-3, 3)) if ot_active else (10.0 + random.uniform(-1, 1))
                
                ward_occ = random.randint(25, 40) if 14 <= hour <= 20 else random.randint(15, 25)
                wards_power = 15.0 + ward_occ * 0.4 + (8.0 if 12 <= hour <= 18 else 2.0)
                
                outpatient_active = (8 <= hour <= 18) and not is_weekend
                outpatient_occ = random.randint(30, 80) if outpatient_active else 0
                outpatient_power = (20.0 + outpatient_occ * 0.3 + random.uniform(-2, 2)) if outpatient_active else (3.0 + random.uniform(-0.5, 0.5))
                
                admin_active = (9 <= hour <= 17) and not is_weekend
                admin_occ = random.randint(10, 25) if admin_active else 0
                admin_power = (12.0 + admin_occ * 0.2 + random.uniform(-1, 1)) if admin_active else (2.0 + random.uniform(-0.3, 0.3))
                
                # Intermittent anomalies
                if hour_offset % 97 == 0:
                    outpatient_power += 25.0
                if hour_offset % 133 == 0:
                    admin_power += 15.0
                
                # Solar gen
                solar_gen = 0.0
                if 6 <= hour <= 18:
                    solar_factor = 1.0 - abs(hour - 12) / 6.0
                    if solar_factor > 0:
                        solar_gen = 35.0 * solar_factor * random.uniform(0.7, 1.0)
                
                # Battery Logic
                base_battery = 50.0
                battery_charge = base_battery
                if len(readings_to_insert) > 0:
                    prev_charge = readings_to_insert[-1].battery_charge
                    if 14 <= hour <= 19:
                        battery_charge = max(10.0, prev_charge - random.uniform(10, 15))
                    elif solar_gen > 25.0:
                        battery_charge = min(100.0, prev_charge + random.uniform(5, 12))
                    elif hour >= 23 or hour <= 5:
                        battery_charge = min(90.0, prev_charge + random.uniform(2, 4))
                    else:
                        battery_charge = prev_charge
                
                raw_total = icu_power + ot_power + wards_power + outpatient_power + admin_power
                net_total = raw_total - solar_gen
                battery_contribution = 0.0
                if len(readings_to_insert) > 0:
                    battery_diff = readings_to_insert[-1].battery_charge - battery_charge
                    battery_contribution = battery_diff
                
                grid_import = max(5.0, net_total - battery_contribution)
                total_power = grid_import + solar_gen + (battery_contribution if battery_contribution < 0 else 0)
                carbon_emitted = grid_import * 0.42
                
                readings_to_insert.append(EnergyReading(
                    timestamp=ts, total_power=total_power, icu_power=icu_power, ot_power=ot_power,
                    wards_power=wards_power, outpatient_power=outpatient_power, admin_power=admin_power,
                    solar_gen=solar_gen, battery_charge=battery_charge, grid_import=grid_import, carbon_emitted=carbon_emitted
                ))
                
                sensors_to_insert.append(SensorLog(timestamp=ts, room="ICU", temperature=21.0 + random.uniform(-0.5, 0.5), humidity=50.0 + random.uniform(-2, 2), occupancy_count=icu_occ, lights_status=1, hvac_status=2))
                sensors_to_insert.append(SensorLog(timestamp=ts, room="OT", temperature=20.0 + random.uniform(-0.3, 0.3) if ot_active else 22.0 + random.uniform(-1, 1), humidity=48.0 + random.uniform(-1, 1), occupancy_count=ot_occ, lights_status=1 if ot_active else 0, hvac_status=2 if ot_active else 1))
                sensors_to_insert.append(SensorLog(timestamp=ts, room="General Wards", temperature=23.0 + random.uniform(-0.8, 0.8), humidity=52.0 + random.uniform(-3, 3), occupancy_count=ward_occ, lights_status=1, hvac_status=1))
                sensors_to_insert.append(SensorLog(timestamp=ts, room="Outpatient Clinic", temperature=24.0 + random.uniform(-1.0, 1.0) if outpatient_active else 25.0 + random.uniform(-2, 2), humidity=54.0 + random.uniform(-4, 4), occupancy_count=outpatient_occ, lights_status=1 if outpatient_active else 0, hvac_status=1 if outpatient_active else 0))
                sensors_to_insert.append(SensorLog(timestamp=ts, room="Administration", temperature=24.0 + random.uniform(-1.0, 1.0) if admin_active else 25.0 + random.uniform(-2, 2), humidity=53.0 + random.uniform(-4, 4), occupancy_count=admin_occ, lights_status=1 if admin_active else 0, hvac_status=1 if admin_active else 0))

            db.bulk_save_objects(readings_to_insert)
            db.bulk_save_objects(sensors_to_insert)
            db.commit()
            print(f"[DB] Seeding completed: {len(readings_to_insert)} energy readings & {len(sensors_to_insert)} sensor entries.")

        # 5. Seed Maintenance Logs
        if db.query(MaintenanceLog).count() == 0:
            base_time = datetime.now() - timedelta(days=5)
            m_logs = []
            for i in range(120):
                current_time = base_time + timedelta(hours=i)
                ts = current_time.strftime("%Y-%m-%d %H:00:00")
                
                ch_vibration = 1.8 + (i * 0.015) + random.uniform(-0.1, 0.1)
                ch_temp = 58.0 + (i * 0.05) + random.uniform(-0.5, 0.5)
                ch_oil = 42.0 - (i * 0.01) + random.uniform(-0.3, 0.3)
                ch_fail_prob = min(99.0, max(5.0, (ch_vibration - 1.5) * 20.0 + (ch_temp - 55.0) * 2.0))
                ch_status = "Healthy"
                if ch_fail_prob > 60:
                    ch_status = "Critical"
                elif ch_fail_prob > 35:
                    ch_status = "Warning"
                m_logs.append(MaintenanceLog(timestamp=ts, asset_name="Main Water Chiller", vibration=ch_vibration, temperature=ch_temp, oil_pressure=ch_oil, failure_prob=ch_fail_prob, status=ch_status))
                
                gen_vib = 2.1 + random.uniform(-0.15, 0.15)
                gen_temp = 72.0 + random.uniform(-1, 1)
                gen_oil = 50.0 + random.uniform(-2, 2)
                gen_fail_prob = min(99.0, max(1.0, (gen_vib - 2.0) * 10.0 + random.uniform(-3, 3)))
                gen_status = "Healthy"
                if gen_fail_prob > 40:
                    gen_status = "Warning"
                m_logs.append(MaintenanceLog(timestamp=ts, asset_name="Emergency Generator 1", vibration=gen_vib, temperature=gen_temp, oil_pressure=gen_oil, failure_prob=gen_fail_prob, status=gen_status))
                
            db.bulk_save_objects(m_logs)
            db.commit()
            print("[DB] Default maintenance logs seeded.")

        # 6. Seed Alerts
        if db.query(Alert).count() == 0:
            default_alerts = [
                Alert(timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"), type="Warning", source="Equipment", message="MRI Express 3T has been in standby mode for over 4 hours, wasting 50.0 kWh.", resolved=0),
                Alert(timestamp=(datetime.now() - timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S"), type="Critical", source="HVAC", message="Critical temperature deviation detected in Admin wing (27.2°C). ECO mode overridden.", resolved=1),
                Alert(timestamp=(datetime.now() - timedelta(hours=5)).strftime("%Y-%m-%d %H:%M:%S"), type="Critical", source="Grid", message="Grid voltage dip detected. Transitioned critical ICU load to Battery backup.", resolved=1),
                Alert(timestamp=(datetime.now() - timedelta(hours=10)).strftime("%Y-%m-%d %H:%M:%S"), type="Warning", source="HVAC", message="Main Chiller compressor vibration levels exceeded threshold (3.1 mm/s). Maintenance recommended.", resolved=0)
            ]
            db.add_all(default_alerts)
            db.commit()
            print("[DB] Default alerts seeded.")

        db.commit()
        print(f"[DB] Database fully initialized and seeded. Active backend: {DB_TYPE.upper()}")
    except Exception as e:
        db.rollback()
        print(f"[DB ERROR] Seeding failed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
