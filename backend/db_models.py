from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(100), nullable=False)
    name = Column(String(255), nullable=False)

class Setting(Base):
    __tablename__ = "settings"
    
    key = Column(String(100), primary_key=True)
    value = Column(String(255), nullable=False)

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    floor = Column(Integer, nullable=True)
    description = Column(String(255), nullable=True)

class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    department_id = Column(Integer, nullable=True)
    room_type = Column(String(100), nullable=True)
    is_critical = Column(Integer, default=0) # 0 for false, 1 for true

class Occupancy(Base):
    __tablename__ = "occupancy"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String(100), nullable=False)
    room_id = Column(Integer, nullable=False)
    occupancy_count = Column(Integer, nullable=False)

class EnergyReading(Base):
    __tablename__ = "energy_readings"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String(100), unique=True, nullable=False)
    total_power = Column(Float, nullable=False)
    icu_power = Column(Float, nullable=False)
    ot_power = Column(Float, nullable=False)
    wards_power = Column(Float, nullable=False)
    outpatient_power = Column(Float, nullable=False)
    admin_power = Column(Float, nullable=False)
    solar_gen = Column(Float, nullable=False)
    battery_charge = Column(Float, nullable=False)
    grid_import = Column(Float, nullable=False)
    carbon_emitted = Column(Float, nullable=False)

class HvacData(Base):
    __tablename__ = "hvac_data"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String(100), nullable=False)
    room_name = Column(String(100), nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    fan_speed = Column(Integer, nullable=False)
    air_quality = Column(Float, nullable=False)
    power_consumption = Column(Float, nullable=False)
    mode = Column(String(50), nullable=False)

class Equipment(Base):
    __tablename__ = "equipment"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    type = Column(String(100), nullable=False)
    is_critical = Column(Integer, nullable=False) # 0 = False, 1 = True
    status = Column(String(100), nullable=False)
    power_draw = Column(Float, nullable=False)
    standby_loss = Column(Float, nullable=False)
    operating_hours = Column(Float, nullable=False)
    maintenance_due = Column(String(100), nullable=False)
    utilization_rate = Column(Float, default=0.0, nullable=True)
    idle_time = Column(Float, default=0.0, nullable=True)

class EquipmentUsage(Base):
    __tablename__ = "equipment_usage"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String(100), nullable=False)
    equipment_id = Column(Integer, nullable=False)
    runtime_hours = Column(Float, nullable=False)
    power_consumed = Column(Float, nullable=False)
    utilization_rate = Column(Float, nullable=False)
    idle_time_hours = Column(Float, nullable=False)

class SolarData(Base):
    __tablename__ = "solar_data"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String(100), nullable=False)
    current_generation = Column(Float, nullable=False)
    daily_generation = Column(Float, nullable=False)
    efficiency = Column(Float, nullable=False)
    irradiance = Column(Float, nullable=False)

class BatteryData(Base):
    __tablename__ = "battery_data"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String(100), nullable=False)
    charge_percentage = Column(Float, nullable=False)
    health_percentage = Column(Float, nullable=False)
    charge_rate = Column(Float, nullable=False)
    discharge_rate = Column(Float, nullable=False)
    backup_time_hours = Column(Float, nullable=False)

class GeneratorData(Base):
    __tablename__ = "generator_data"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String(100), nullable=False)
    fuel_level_percentage = Column(Float, nullable=False)
    runtime_hours = Column(Float, nullable=False)
    engine_temperature = Column(Float, nullable=False)
    load_percentage = Column(Float, nullable=False)

class UpsData(Base):
    __tablename__ = "ups_data"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String(100), nullable=False)
    status = Column(String(100), nullable=False)
    backup_time_minutes = Column(Float, nullable=False)
    battery_health = Column(Float, nullable=False)
    load_percentage = Column(Float, nullable=False)

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String(100), nullable=False)
    type = Column(String(100), nullable=False)
    source = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    resolved = Column(Integer, default=0) # 0 = False, 1 = True

class Anomaly(Base):
    __tablename__ = "anomalies"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String(100), nullable=False)
    type = Column(String(100), nullable=False)
    severity = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    resolved = Column(Integer, default=0)

class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String(100), nullable=False)
    asset_name = Column(String(100), nullable=False)
    vibration = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    oil_pressure = Column(Float, nullable=False)
    failure_probability = Column(Float, nullable=False)
    status = Column(String(100), nullable=False)

class CarbonMetric(Base):
    __tablename__ = "carbon_metrics"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String(100), nullable=False)
    co2_emissions_kg = Column(Float, nullable=False)
    co2_savings_kg = Column(Float, nullable=False)
    renewable_contribution_percentage = Column(Float, nullable=False)
    trees_equivalent = Column(Integer, nullable=False)

class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String(100), nullable=False)
    target = Column(String(100), nullable=False)
    value = Column(Float, nullable=False)
    horizon = Column(String(50), nullable=False)

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    priority = Column(String(50), nullable=False)
    is_applied = Column(Integer, default=0) # 0 = False, 1 = True

# Legacy maintenance_logs mapping for compatibility
class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String(100), nullable=False)
    asset_name = Column(String(100), nullable=False)
    vibration = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    oil_pressure = Column(Float, nullable=False)
    failure_prob = Column(Float, nullable=False)
    status = Column(String(100), nullable=False)

# Legacy sensor_logs mapping for compatibility
class SensorLog(Base):
    __tablename__ = "sensor_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String(100), nullable=False)
    room = Column(String(100), nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    occupancy_count = Column(Integer, nullable=False)
    lights_status = Column(Integer, nullable=False)
    hvac_status = Column(Integer, nullable=False)
