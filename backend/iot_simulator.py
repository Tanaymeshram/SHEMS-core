import random
import time
import threading
from datetime import datetime, timedelta
import json
from database import SessionLocal
from db_models import Setting, Equipment, EnergyReading, SensorLog, MaintenanceLog, Alert
from ml_engine import ml_engine
from mqtt_client import mqtt_client

# Equipment location rooms map
EQUIPMENT_ROOMS = {
    "ICU Ventilator Suite A": "ICU",
    "ICU Ventilator Suite B": "ICU",
    "Cardiac Monitor Suite": "ICU",
    "Emergency Infusion Pump": "ICU",
    "OT Emergency Lighting": "OT",
    "Life Support System Core": "ICU",
    "MRI Express 3T": "MRI Room",
    "High-Speed CT Scanner": "CT Scan Room",
    "Clinical Dialysis Unit 1": "Wards",
    "Research Server Node A": "Research Center",
    "Hematology Analyzer Lab 1": "Laboratories",
    "Admin Workstation PC 1": "Research Center",
    "Lobby LaserJet 500": "Research Center",
    "Wards Entertainment TV": "Wards",
    "Lobby Information Display": "Wards",
    "Digital X-Ray Wing B": "Wards"
}

class IoTSimulator(threading.Thread):
    def __init__(self):
        super(IoTSimulator, self).__init__()
        self.daemon = True
        self.running = False
        
        # Initial live state with the 10 zones requested
        self.state = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "data_collection_mode": 3, # 1: Infrastructure, 2: IoT Sensors, 3: Hybrid
            "wings": {
                "ICU": {"temp": 21.2, "humidity": 50.1, "occupancy": 10, "lights": 1, "hvac": 2, "fan_speed": 2, "power": 26.5, "equipment_status": "Ventilators: Active", "zero_occ_time": 0, "displays_active": True, "non_essential_disabled": False, "air_quality": 42.0},
                "OT": {"temp": 20.4, "humidity": 48.5, "occupancy": 8, "lights": 1, "hvac": 2, "fan_speed": 2, "power": 48.2, "equipment_status": "Surgical Light: Active", "zero_occ_time": 0, "displays_active": True, "non_essential_disabled": False, "air_quality": 35.0},
                "Wards": {"temp": 23.1, "humidity": 52.0, "occupancy": 32, "lights": 1, "hvac": 1, "fan_speed": 1, "power": 28.0, "equipment_status": "Patient TVs: Active", "zero_occ_time": 0, "displays_active": True, "non_essential_disabled": False, "air_quality": 45.0},
                "Laboratories": {"temp": 22.0, "humidity": 49.0, "occupancy": 12, "lights": 1, "hvac": 1, "fan_speed": 1, "power": 18.5, "equipment_status": "Analyzer Lab: Active", "zero_occ_time": 0, "displays_active": True, "non_essential_disabled": False, "air_quality": 48.0},
                "MRI Room": {"temp": 19.5, "humidity": 45.0, "occupancy": 3, "lights": 1, "hvac": 2, "fan_speed": 2, "power": 38.0, "equipment_status": "MRI Scanner: Standby", "zero_occ_time": 0, "displays_active": True, "non_essential_disabled": False, "air_quality": 40.0},
                "CT Scan Room": {"temp": 20.0, "humidity": 46.5, "occupancy": 2, "lights": 1, "hvac": 1, "fan_speed": 1, "power": 24.5, "equipment_status": "CT Scanner: Active", "zero_occ_time": 0, "displays_active": True, "non_essential_disabled": False, "air_quality": 41.0},
                "Solar Plant": {"temp": 26.8, "humidity": 40.0, "occupancy": 0, "lights": 0, "hvac": 0, "fan_speed": 0, "power": -35.5, "equipment_status": "Inverters: Active", "zero_occ_time": 0, "displays_active": False, "non_essential_disabled": True, "air_quality": 30.0},
                "Battery Storage Room": {"temp": 20.2, "humidity": 42.0, "occupancy": 0, "lights": 0, "hvac": 2, "fan_speed": 1, "power": 4.5, "equipment_status": "BESS Racks: Balance", "zero_occ_time": 0, "displays_active": False, "non_essential_disabled": True, "air_quality": 32.0},
                "Generator Room": {"temp": 24.5, "humidity": 50.0, "occupancy": 0, "lights": 0, "hvac": 0, "fan_speed": 0, "power": 0.0, "equipment_status": "Genset: Standby", "zero_occ_time": 0, "displays_active": False, "non_essential_disabled": True, "air_quality": 55.0},
                "Research Center": {"temp": 23.5, "humidity": 51.0, "occupancy": 15, "lights": 1, "hvac": 1, "fan_speed": 1, "power": 15.0, "equipment_status": "BEMS Servers: Normal", "zero_occ_time": 0, "displays_active": True, "non_essential_disabled": False, "air_quality": 44.0}
            },
            "equipment": {},
            "renewables": {
                "solar_gen": 18.5,
                "battery_charge": 65.0, # % (out of 100 kWh)
                "grid_import": 110.2,
                "total_power": 128.7,
                "renewable_ratio": 14.3
            },
            "maintenance": {
                "chiller": {"vibration": 1.9, "temp": 59.5, "oil": 41.5, "failure_prob": 12.5, "status": "Healthy"},
                "generator": {"vibration": 2.2, "temp": 72.5, "oil": 49.0, "failure_prob": 8.5, "status": "Healthy"}
            },
            "automation_active": {
                "hvac_eco_mode": True,
                "lighting_occupancy_control": True,
                "battery_peak_shaving": True,
                "idle_equipment_alerts": True
            },
            "savings": {
                "daily_energy_kwh": 342.5,
                "monthly_cost_usd": 1520.0,
                "carbon_kg": 143.8,
                "cost_saved_usd": 1520.0,
                "energy_saved_kwh": 342.5,
                "carbon_saved_kg": 143.8
            }
        }
        
        self.load_automation_settings()
        self.sync_equipment_states()

    def load_automation_settings(self):
        try:
            db = SessionLocal()
            rows = db.query(Setting).all()
            for row in rows:
                k, v = row.key, row.value
                if k in ["hvac_eco_mode", "lighting_occupancy_control", "battery_peak_shaving", "idle_equipment_alerts"]:
                    self.state["automation_active"][k] = (v == "1")
                elif k == "data_collection_mode":
                    self.state["data_collection_mode"] = int(v)
            db.close()
        except Exception as e:
            print(f"[IoT ERROR] Failed to load automation settings: {e}")

    def sync_equipment_states(self):
        try:
            db = SessionLocal()
            rows = db.query(Equipment).all()
            for row in rows:
                self.state["equipment"][row.name] = {
                    "type": row.type,
                    "is_critical": bool(row.is_critical),
                    "status": row.status,
                    "power_draw": row.power_draw,
                    "standby_loss": row.standby_loss,
                    "operating_hours": row.operating_hours,
                    "idle_seconds": int((row.idle_time or 0.0) * 15.0), # convert hours back to seconds for simulation scale (30s = 2h, so 15s = 1h)
                    "runtime": row.operating_hours,
                    "utilization_rate": row.utilization_rate or 0.0,
                    "idle_time": row.idle_time or 0.0
                }
            db.close()
        except Exception as e:
            print(f"[IoT ERROR] Failed to sync equipment: {e}")

    def run(self):
        self.running = True
        print("[IoT] Simulator thread started.")
        
        tick_count = 0
        
        # Start MQTT loop in background if enabled
        mqtt_client.start()
        
        while self.running:
            try:
                self.simulate_live_step()
                
                # Check for anomalies or alerts and write to DB occasionally (every 10 ticks = 30 seconds)
                tick_count += 1
                if tick_count >= 10:
                    self.log_step_to_db()
                    tick_count = 0
                    
                time.sleep(3) # Update live state every 3 seconds
            except Exception as e:
                print(f"[IoT ERROR] Loop error: {e}")
                time.sleep(5)

    def stop(self):
        self.running = False
        print("[IoT] Simulator thread stopping.")

    def simulate_live_step(self):
        now = datetime.now()
        hour = now.hour
        weekday = now.weekday()
        is_weekend = weekday >= 5
        
        self.state["timestamp"] = now.strftime("%Y-%m-%d %H:%M:%S")
        
        # 1. Fluctuating outdoor environment / Solar generation
        sim_hour = hour
        if hour >= 18 or hour < 6:
            sim_hour = 13  # Fixed at 1 PM for active solar power during night demos
            
        solar_gen = 0.0
        if 6 <= sim_hour <= 18:
            solar_factor = 1.0 - abs(sim_hour - 12) / 6.0
            if solar_factor > 0:
                solar_gen = 45.0 * solar_factor * random.uniform(0.85, 1.0)
        self.state["renewables"]["solar_gen"] = round(solar_gen, 2)
        
        # 2. Simulate Wing Occupancies dynamically
        op_active = (8 <= hour <= 18) and not is_weekend
        
        self.state["wings"]["ICU"]["occupancy"] = random.randint(8, 14)
        
        ot_active = (9 <= hour <= 16) and not is_weekend
        self.state["wings"]["OT"]["occupancy"] = random.randint(6, 12) if ot_active else random.randint(0, 2)
        
        self.state["wings"]["Wards"]["occupancy"] = random.randint(25, 45) if 14 <= hour <= 21 else random.randint(15, 25)
        
        self.state["wings"]["Laboratories"]["occupancy"] = random.randint(8, 20) if op_active else 0
        
        mri_active = (8 <= hour <= 20)
        self.state["wings"]["MRI Room"]["occupancy"] = random.randint(1, 5) if mri_active else 0
        
        self.state["wings"]["CT Scan Room"]["occupancy"] = random.randint(1, 4) if mri_active else 0
        
        self.state["wings"]["Research Center"]["occupancy"] = random.randint(5, 22) if op_active else 0
        
        # Plant rooms remain unoccupied normally unless a drift triggers maintenance checks
        self.state["wings"]["Solar Plant"]["occupancy"] = 1 if (random.random() < 0.05) else 0
        self.state["wings"]["Battery Storage Room"]["occupancy"] = 1 if (random.random() < 0.02) else 0
        self.state["wings"]["Generator Room"]["occupancy"] = 1 if (random.random() < 0.03) else 0

        # 3. Automation Policies: Lighting & HVAC Occupancy control
        for wing_name, wing in self.state["wings"].items():
            occ = wing["occupancy"]
            
            # Initialize parameters if not present
            if "fan_speed" not in wing:
                wing["fan_speed"] = 1
            if "zero_occ_time" not in wing:
                wing["zero_occ_time"] = 0
            if "displays_active" not in wing:
                wing["displays_active"] = True
            if "non_essential_disabled" not in wing:
                wing["non_essential_disabled"] = False
            if "air_quality" not in wing:
                wing["air_quality"] = 40.0
                
            # Simulate slight drift in air quality
            wing["air_quality"] = round(max(15.0, min(150.0, wing["air_quality"] + random.uniform(-2, 3))), 1)
                
            # PATIENT SAFETY TRUMPS ALL RULES: ICU and OT are locked into safe environments
            if wing_name in ["ICU", "OT"]:
                wing["lights"] = 1
                wing["hvac"] = 2 # Comfort mode
                wing["fan_speed"] = 2 # Med
                wing["zero_occ_time"] = 0
                wing["displays_active"] = True
                wing["non_essential_disabled"] = False
                wing["equipment_status"] = "Active (Safe Lock)"
                target_temp = 21.0 if wing_name == "ICU" else 20.0
            elif wing_name in ["Solar Plant", "Generator Room"]:
                # Plant rooms with no standard occupants
                wing["lights"] = 0
                wing["hvac"] = 0
                wing["fan_speed"] = 0
                wing["zero_occ_time"] = 0
                wing["displays_active"] = False
                wing["non_essential_disabled"] = True
                wing["equipment_status"] = "Active (Inverters)" if wing_name == "Solar Plant" else "Standby (Automatic)"
                target_temp = 25.5
            elif wing_name == "Battery Storage Room":
                # Storage room requires thermal ventilation for safety
                wing["lights"] = 0
                wing["fan_speed"] = 1
                wing["zero_occ_time"] = 0
                wing["displays_active"] = False
                wing["non_essential_disabled"] = True
                # Battery HVAC is triggered dynamically by core temperature
                wing["hvac"] = 2 if wing["temp"] > 21.5 else 1
                target_temp = 20.0
                wing["equipment_status"] = "BESS Racks: Balance"
            else:
                # Standard zones subject to Occupancy-Aware Automation rules
                if self.state["automation_active"]["lighting_occupancy_control"]:
                    if occ == 0:
                        wing["zero_occ_time"] += 3 # 3 seconds per simulation tick
                        
                        # Trigger occupancy-aware shutdown rules if empty for 10 min (demonstrated here at 30 seconds for quick validation)
                        if wing["zero_occ_time"] >= 30:
                            wing["lights"] = 0
                            wing["fan_speed"] = 0
                            wing["hvac"] = 1 # ECO Mode
                            wing["displays_active"] = False
                            wing["non_essential_disabled"] = True
                            wing["equipment_status"] = "Standby (Idle Sleep)"
                    else:
                        # Occupant detected: Restore immediately
                        wing["zero_occ_time"] = 0
                        wing["lights"] = 1
                        wing["hvac"] = 2 # Comfort Mode
                        wing["displays_active"] = True
                        wing["non_essential_disabled"] = False
                        wing["equipment_status"] = "Active (Woken Up)"
                        if wing["fan_speed"] == 0:
                            wing["fan_speed"] = 1 # LOW speed
                
                # Target Temp Setpoint
                if wing["hvac"] == 0:
                    target_temp = 26.5
                elif wing["hvac"] == 1:
                    target_temp = 24.5
                else:
                    target_temp = 22.5

            # Temperature drifting towards setpoint
            drift_direction = 1 if wing["temp"] < target_temp else -1
            cooling_power = 0.4 if wing["hvac"] == 2 else (0.2 if wing["hvac"] == 1 else 0.05)
            wing["temp"] = round(wing["temp"] + (drift_direction * cooling_power * random.uniform(0.1, 0.4)), 2)
            
            # Enforce safety bounds
            if wing_name == "ICU":
                wing["temp"] = max(20.0, min(22.5, wing["temp"]))
            elif wing_name == "OT":
                wing["temp"] = max(19.0, min(21.5, wing["temp"]))
            else:
                wing["temp"] = max(18.0, min(28.0, wing["temp"]))
                
            # Power consumption calculation
            base_draw = 8.0
            if wing["non_essential_disabled"]:
                base_draw = 2.0 # Substantially reduced standby draw
            
            hvac_draw = 15.0 if wing["hvac"] == 2 else (8.0 if wing["hvac"] == 1 else 0.5)
            lighting_draw = 3.5 if wing["lights"] == 1 else 0.2
            fan_draw = wing.get("fan_speed", 1) * 1.5 if wing.get("fan_speed", 1) > 0 else 0.1
            occ_draw = occ * 0.15
            
            wing["power"] = round(base_draw + hvac_draw + lighting_draw + fan_draw + occ_draw + random.uniform(-0.5, 0.5), 2)
            
            # Solar Plant generates power (negative load representation)
            if wing_name == "Solar Plant":
                wing["power"] = -round(solar_gen, 2)

        # 4. Medical Equipment simulation & Policy Enforcement
        for eq_name, eq in self.state["equipment"].items():
            # Classify equipment category/policy
            is_critical_type = eq["is_critical"] or eq["type"] in ["Ventilators", "ICU Monitors", "Infusion Pumps", "Emergency Systems", "Life Support Systems"]
            is_semi_critical_type = eq["type"] in ["MRI", "CT Scan", "X-Ray"]
            is_non_critical_type = eq["type"] in ["Office PCs", "Printers", "TVs", "Displays"]

            # Initialize tracking parameters in state if not present
            if "idle_seconds" not in eq:
                eq["idle_seconds"] = 0
            if "runtime" not in eq:
                eq["runtime"] = eq.get("operating_hours", 1000.0)
            if "utilization_rate" not in eq:
                eq["utilization_rate"] = eq.get("utilization_rate", 50.0)
            if "idle_time" not in eq:
                eq["idle_time"] = eq.get("idle_time", 0.0)

            # Retrieve room occupancy variables
            room_name = EQUIPMENT_ROOMS.get(eq_name, "Research Center")
            room_occ = self.state["wings"].get(room_name, {}).get("occupancy", 0)
            room_zero_occ_time = self.state["wings"].get(room_name, {}).get("zero_occ_time", 0)

            # Enforce CRITICAL EQUIPMENT POLICY: Never Turn OFF
            if is_critical_type:
                eq["status"] = "Active"
                eq["idle_seconds"] = 0
                eq["idle_time"] = 0.0
                eq["runtime"] += 3.0 / 3600.0 # increment runtime in hours
                eq["utilization_rate"] = min(100.0, round(eq["utilization_rate"] + random.uniform(0.1, 0.3), 1))

            # Enforce SEMI-CRITICAL POLICY: Idle -> Standby Mode
            elif is_semi_critical_type:
                if eq["status"] == "Active":
                    eq["runtime"] += 3.0 / 3600.0
                    eq["idle_seconds"] = 0
                    eq["idle_time"] = 0.0
                    eq["utilization_rate"] = min(100.0, round(eq["utilization_rate"] + random.uniform(0.1, 0.4), 1))
                    # Drifts randomly to Idle for testing
                    if random.random() < 0.03:
                        eq["status"] = "Idle"
                elif eq["status"] == "Idle":
                    eq["idle_seconds"] += 3
                    eq["idle_time"] = round(eq["idle_seconds"] / 15.0, 2)
                    eq["utilization_rate"] = max(5.0, round(eq["utilization_rate"] - random.uniform(0.1, 0.4), 1))
                    # Rule: Idle > 2 hours (demonstrated here at 30 seconds for quick validation)
                    if eq["idle_seconds"] >= 30:
                        eq["status"] = "Standby"
                        self.create_db_alert("Warning", "Equipment", f"AI Idle-Time Optimization: Semi-critical asset '{eq_name}' was idle for > 2 hours. Switched to Standby Mode to save leakage.")
                elif eq["status"] == "Standby":
                    eq["idle_seconds"] += 3
                    eq["idle_time"] = round(eq["idle_seconds"] / 15.0, 2)
                    eq["utilization_rate"] = max(5.0, round(eq["utilization_rate"] - random.uniform(0.1, 0.4), 1))
                    # Let it stay in Standby until overridden or randomly activated
                    if random.random() < 0.02:
                        eq["status"] = "Active"

            # Enforce NON-CRITICAL POLICY: Occupancy = 0 -> Auto OFF
            elif is_non_critical_type:
                if room_occ > 0:
                    # If room has people, operate normally
                    if eq["status"] == "Off":
                        eq["status"] = "Active"
                    
                    if eq["status"] == "Active":
                        eq["runtime"] += 3.0 / 3600.0
                        eq["idle_seconds"] = 0
                        eq["idle_time"] = 0.0
                        eq["utilization_rate"] = min(100.0, round(eq["utilization_rate"] + random.uniform(0.1, 0.4), 1))
                        if random.random() < 0.05:
                            eq["status"] = "Idle"
                    elif eq["status"] == "Idle":
                        eq["idle_seconds"] += 3
                        eq["idle_time"] = round(eq["idle_seconds"] / 15.0, 2)
                        eq["utilization_rate"] = max(5.0, round(eq["utilization_rate"] - random.uniform(0.1, 0.4), 1))
                else:
                    # If room has zero occupancy for 10 min (demonstrated here at 30s)
                    if room_zero_occ_time >= 30:
                        if eq["status"] != "Off":
                            eq["status"] = "Off"
                            self.create_db_alert("Warning", "Equipment", f"AI Auto-OFF Policy: Non-critical asset '{eq_name}' turned OFF automatically due to zero occupancy in '{room_name}'.")
                    
                    if eq["status"] == "Off":
                        eq["idle_seconds"] += 3
                        eq["idle_time"] = round(eq["idle_seconds"] / 15.0, 2)
                        eq["utilization_rate"] = max(5.0, round(eq["utilization_rate"] - random.uniform(0.1, 0.4), 1))

            # Monitored Standard Equipment (Research Equipment, Laboratory Equipment, Dialysis Units)
            else:
                if eq["status"] == "Active":
                    eq["runtime"] += 3.0 / 3600.0
                    eq["idle_seconds"] = 0
                    eq["idle_time"] = 0.0
                    eq["utilization_rate"] = min(100.0, round(eq["utilization_rate"] + random.uniform(0.1, 0.3), 1))
                    if random.random() < 0.03:
                        eq["status"] = "Idle"
                elif eq["status"] == "Idle":
                    eq["idle_seconds"] += 3
                    eq["idle_time"] = round(eq["idle_seconds"] / 15.0, 2)
                    eq["utilization_rate"] = max(5.0, round(eq["utilization_rate"] - random.uniform(0.1, 0.3), 1))
                    if random.random() < 0.03:
                        eq["status"] = "Active"
                else:
                    # Keep standby or off status if overridden
                    eq["idle_seconds"] += 3
                    eq["idle_time"] = round(eq["idle_seconds"] / 15.0, 2)

            # Sync equipment status back to room description for Digital Twin map
            if "MRI" in eq_name:
                self.state["wings"]["MRI Room"]["equipment_status"] = f"MRI: {eq['status']}"
            elif "CT" in eq_name:
                self.state["wings"]["CT Scan Room"]["equipment_status"] = f"CT Scanner: {eq['status']}"
            elif "Lab" in eq_name or "Analyzer" in eq_name:
                self.state["wings"]["Laboratories"]["equipment_status"] = f"Lab Analyzer: {eq['status']}"
            elif "Research" in eq_name:
                self.state["wings"]["Research Center"]["equipment_status"] = f"Servers: {eq['status']}"

        # 5. Renewable energy & Battery backup management
        raw_loads = sum(wing["power"] for wing_name, wing in self.state["wings"].items() if wing_name != "Solar Plant")
        eq_loads = sum(eq["power_draw"] if eq["status"] == "Active" else (eq["standby_loss"] if eq["status"] in ["Idle", "Standby"] else 0.0) for eq in self.state["equipment"].values())
        total_loads = raw_loads + eq_loads
        
        battery = self.state["renewables"]["battery_charge"]
        battery_contrib = 0.0
        
        if self.state["automation_active"]["battery_peak_shaving"] and (14 <= hour <= 19) and battery > 15.0:
            battery_contrib = min(20.0, total_loads)
            battery = max(10.0, battery - (battery_contrib / 100.0 * 5.0))
        elif solar_gen > total_loads:
            charge_amount = (solar_gen - total_loads) / 100.0 * 8.0
            battery = min(100.0, battery + charge_amount)
        elif hour >= 23 or hour <= 4:
            battery = min(90.0, battery + random.uniform(0.3, 0.7))
            
        self.state["renewables"]["battery_charge"] = round(battery, 2)
        grid_import = max(5.0, total_loads - solar_gen - battery_contrib)
        self.state["renewables"]["grid_import"] = round(grid_import, 2)
        self.state["renewables"]["total_power"] = round(total_loads, 2)
        
        renew_contrib = solar_gen + (battery_contrib if battery_contrib > 0 else 0)
        self.state["renewables"]["renewable_ratio"] = round(min(100.0, (renew_contrib / max(1.0, total_loads)) * 100), 1)

        # 6. Maintenance Health parameters drift
        ch = self.state["maintenance"]["chiller"]
        gen = self.state["maintenance"]["generator"]
        
        ch["vibration"] = max(1.0, min(4.5, round(ch["vibration"] + random.uniform(-0.05, 0.08), 2)))
        ch["temp"] = max(40.0, min(80.0, round(ch["temp"] + random.uniform(-0.1, 0.2), 2)))
        ch["oil"] = max(25.0, min(60.0, round(ch["oil"] + random.uniform(-0.15, 0.1), 2)))
        
        ch["failure_prob"] = ml_engine.predict_maintenance_status(ch["vibration"], ch["temp"], ch["oil"])
        ch["status"] = "Critical" if ch["failure_prob"] > 75 else ("Warning" if ch["failure_prob"] > 45 else "Healthy")
            
        gen["vibration"] = round(2.0 + random.uniform(-0.1, 0.1), 2)
        gen["temp"] = round(70.0 + random.uniform(-0.5, 0.5), 2)
        gen["oil"] = round(52.0 + random.uniform(-1, 1), 2)
        gen["failure_prob"] = ml_engine.predict_maintenance_status(gen["vibration"], gen["temp"], gen["oil"])
        gen["status"] = "Healthy"
        
        # Generator Active Output representation
        if gen["status"] != "Healthy":
            self.state["wings"]["Generator Room"]["equipment_status"] = "Genset: Active Generator Load"
            self.state["wings"]["Generator Room"]["power"] = 45.0
        else:
            self.state["wings"]["Generator Room"]["equipment_status"] = "Genset: Standby"
            self.state["wings"]["Generator Room"]["power"] = 0.2

        # 7. Check for anomalies & fire alerts
        self.trigger_live_alerts(total_loads, grid_import)

        # 8. Dynamic daily savings updates (aligned keys to prevent frontend warnings)
        self.state["savings"]["daily_energy_kwh"] = round(self.state["savings"]["daily_energy_kwh"] + (solar_gen * 0.05), 1)
        self.state["savings"]["monthly_cost_usd"] = round(self.state["savings"]["monthly_cost_usd"] + (solar_gen * 0.015), 1)
        self.state["savings"]["carbon_kg"] = round(self.state["savings"]["carbon_kg"] + (solar_gen * 0.02), 1)
        
        self.state["savings"]["cost_saved_usd"] = self.state["savings"]["monthly_cost_usd"]
        self.state["savings"]["energy_saved_kwh"] = self.state["savings"]["daily_energy_kwh"]
        self.state["savings"]["carbon_saved_kg"] = self.state["savings"]["carbon_kg"]

    def trigger_live_alerts(self, total_loads, grid_import):
        is_anomalous = ml_engine.check_anomaly(total_loads)
        if is_anomalous:
            self.create_db_alert("Critical", "Grid", f"ML Engine flagged abnormal energy load spike detected: {total_loads:.1f} kW.")
            
        ch_fail = self.state["maintenance"]["chiller"]["failure_prob"]
        if ch_fail > 65:
            self.create_db_alert("Critical", "HVAC", f"Main Water Chiller failure probability reached {ch_fail:.1f}%. Immediate vibration audit required.")
        elif ch_fail > 45:
            self.create_db_alert("Warning", "HVAC", f"Chiller compressor high-frequency vibration detected ({self.state['maintenance']['chiller']['vibration']:.2f} mm/s). Scheduled maintenance due.")

        if self.state["automation_active"]["idle_equipment_alerts"]:
            if "MRI Express 3T" in self.state["equipment"] and self.state["equipment"]["MRI Express 3T"]["status"] == "Idle":
                self.create_db_alert("Warning", "Equipment", "MRI Express 3T has been in standby mode, wasting 12.5 kW. Send standby warning to Technician.")

        icu_temp = self.state["wings"]["ICU"]["temp"]
        if icu_temp > 22.5 or icu_temp < 19.5:
            self.create_db_alert("Critical", "HVAC", f"ICU Clinical temperature zone breached safe margins: {icu_temp:.2f}°C! Safety system adjusting HVAC override.")

    def create_db_alert(self, alert_type, source, message):
        try:
            db = SessionLocal()
            count_val = db.query(Alert).filter(Alert.source == source, Alert.message == message, Alert.resolved == 0).count()
            
            if count_val == 0:
                ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                new_alert = Alert(
                    timestamp=ts,
                    type=alert_type,
                    source=source,
                    message=message,
                    resolved=0
                )
                db.add(new_alert)
                db.commit()
                print(f"[Alert System] {alert_type.upper()} alert fired from {source}: {message}")
                
                # Publish alert through MQTT
                mqtt_client.publish("alerts/live", {
                    "timestamp": ts,
                    "type": alert_type,
                    "source": source,
                    "message": message,
                    "resolved": 0
                })
            db.close()
        except Exception as e:
            print(f"[IoT ERROR] Failed to record alert: {e}")

    def log_step_to_db(self):
        try:
            db = SessionLocal()
            ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            r = self.state["renewables"]
            w = self.state["wings"]
            
            # Log Energy Readings
            reading = EnergyReading(
                timestamp=ts,
                total_power=r["total_power"],
                icu_power=w.get("ICU", {}).get("power", 25.0),
                ot_power=w.get("OT", {}).get("power", 40.0),
                wards_power=w.get("Wards", {}).get("power", 20.0),
                outpatient_power=(
                    w.get("Laboratories", {}).get("power", 15.0) +
                    w.get("MRI Room", {}).get("power", 25.0) +
                    w.get("CT Scan Room", {}).get("power", 20.0)
                ),
                admin_power=w.get("Research Center", {}).get("power", 10.0),
                solar_gen=r["solar_gen"],
                battery_charge=r["battery_charge"],
                grid_import=r["grid_import"],
                carbon_emitted=r["grid_import"] * 0.42
            )
            db.add(reading)
            
            # Log Wing Sensor Readings
            for name, wing in w.items():
                sensor = SensorLog(
                    timestamp=ts,
                    room=name,
                    temperature=wing["temp"],
                    humidity=wing["humidity"],
                    occupancy_count=wing["occupancy"],
                    lights_status=wing["lights"],
                    hvac_status=wing["hvac"]
                )
                db.add(sensor)
            
            # Log Maintenance parameter snapshots
            for asset_name, item in self.state["maintenance"].items():
                full_asset_name = "Main Water Chiller" if asset_name == "chiller" else "Emergency Generator 1"
                m_log = MaintenanceLog(
                    timestamp=ts,
                    asset_name=full_asset_name,
                    vibration=item["vibration"],
                    temperature=item["temp"],
                    oil_pressure=item["oil"],
                    failure_prob=item["failure_prob"],
                    status=item["status"]
                )
                db.add(m_log)
                
            # Log & Sync Equipment status and operating hours
            for eq_name, item in self.state["equipment"].items():
                db_eq = db.query(Equipment).filter(Equipment.name == eq_name).first()
                if db_eq:
                    db_eq.status = item["status"]
                    db_eq.operating_hours = round(item["runtime"], 1)
                    db_eq.utilization_rate = round(item.get("utilization_rate", 0.0), 1)
                    db_eq.idle_time = round(item.get("idle_time", 0.0), 1)

            db.commit()
            db.close()
            print("[IoT DB Sync] Live simulation snapshot recorded to database via SQLAlchemy.")
            
            # Publish state through MQTT
            mqtt_client.publish("telemetry/live", self.state)
        except Exception as e:
            print(f"[IoT ERROR] Database log step failed: {e}")

# Global instance
iot_simulator = IoTSimulator()
