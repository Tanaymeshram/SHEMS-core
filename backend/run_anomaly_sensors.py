import requests
import json
import time
import sys

# BEMS Local server API URL
API_URL = "http://localhost:5000/api/ingestion/sensor"

def send_telemetry(payload):
    try:
        response = requests.post(API_URL, json=payload)
        if response.status_code == 200:
            print(f"[SUCCESS] Injected telemetry for {payload['room']}")
        else:
            print(f"[ERROR] Failed for {payload['room']}: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"[EXCEPTION] Failed to send telemetry for {payload['room']}: {e}")

def run_anomalies():
    # 1. Research Center Server - Abnormal Crypto Mining Draft Draw
    payload_rc = {
        "room": "Research Center",
        "temperature": 23.5,
        "humidity": 51.0,
        "air_quality": 44.0,
        "lux": 250.0,
        "pir_motion": 1,
        "occupancy_count": 15,
        "current": 120.0,  # 120 Amps * 220 Volts = 26.4 kW (exceeds 22kW normal threshold)
        "voltage": 220.0,
        "solar_irradiance": 400.0,
        "battery_percentage": 75.0,
        "vibration": 1.8,
        "core_temperature": 55.0,
        "lights_status": 1,
        "hvac_status": 1
    }
    send_telemetry(payload_rc)

    # 2. ICU Zone - Safe Temperature Breach
    payload_icu = {
        "room": "ICU",
        "temperature": 24.8,  # ICU must stay between 20.0C and 22.5C
        "humidity": 50.1,
        "air_quality": 42.0,
        "lux": 250.0,
        "pir_motion": 1,
        "occupancy_count": 10,
        "current": 12.0,
        "voltage": 220.0,
        "solar_irradiance": 400.0,
        "battery_percentage": 75.0,
        "vibration": 1.8,
        "core_temperature": 55.0,
        "lights_status": 1,
        "hvac_status": 2
    }
    send_telemetry(payload_icu)

    # 3. BESS / UPS Array - Critical Power Reserves Drop (< 20%)
    payload_bess = {
        "room": "Battery Storage Room",
        "temperature": 21.8,
        "humidity": 42.0,
        "air_quality": 32.0,
        "lux": 10.0,
        "pir_motion": 0,
        "occupancy_count": 0,
        "current": 5.0,
        "voltage": 220.0,
        "solar_irradiance": 200.0,
        "battery_percentage": 14.5,  # Drops battery to 14.5% (triggers <20% UI Red Banner)
        "vibration": 1.8,
        "core_temperature": 55.0,
        "lights_status": 0,
        "hvac_status": 1
    }
    send_telemetry(payload_bess)

    # 4. Main Water Chiller - Compressor High Vibration Breakdown Warning
    payload_chiller = {
        "room": "Solar Plant",
        "temperature": 26.8,
        "humidity": 40.0,
        "air_quality": 30.0,
        "lux": 850.0,
        "pir_motion": 0,
        "occupancy_count": 0,
        "current": 15.0,
        "voltage": 220.0,
        "solar_irradiance": 700.0,
        "battery_percentage": 75.0,
        "vibration": 4.15,  # Normal is 1.9 mm/s. 4.15 mm/s triggers ML failure warning.
        "core_temperature": 78.5,  # High core temp triggers alert
        "lights_status": 0,
        "hvac_status": 0
    }
    send_telemetry(payload_chiller)

if __name__ == "__main__":
    print("=========================================================")
    print(" BEMS Telemetry Anomaly Sensor Injector Loop ")
    print("=========================================================")
    print("Injecting anomalous telemetry every 2 seconds to keep anomalies ACTIVE.")
    print("Press Ctrl+C to stop.\n")
    try:
        while True:
            run_anomalies()
            time.sleep(2)
    except KeyboardInterrupt:
        print("\n[INFO] Stopped anomaly injection loop.")
