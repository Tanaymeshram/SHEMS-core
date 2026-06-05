from database import SessionLocal
from db_models import Equipment

def reseed():
    db = SessionLocal()
    try:
        # Clear existing equipment rows
        db.query(Equipment).delete()
        db.commit()
        print("[Reseed] Cleared equipment table.")
        
        # Add new default equipment
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
        print("[Reseed] Successfully re-seeded equipment table with new fields.")
    except Exception as e:
        db.rollback()
        print(f"[Reseed ERROR] Seeding failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reseed()
