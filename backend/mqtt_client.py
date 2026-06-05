import os
import json
import threading
import time

try:
    import paho.mqtt.client as mqtt
except ImportError:
    mqtt = None

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = lambda: None

load_dotenv()

MQTT_ENABLED = os.getenv("MQTT_ENABLED", "True").lower() == "true"
MQTT_BROKER = os.getenv("MQTT_BROKER", "broker.hivemq.com")  # public broker default
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_CLIENT_ID = os.getenv("MQTT_CLIENT_ID", "smart_hospital_bems_core")
MQTT_TOPIC_PREFIX = os.getenv("MQTT_TOPIC_PREFIX", "hospital/bems")

class BEMSMQTTClient:
    def __init__(self):
        self.client = None
        self.connected = False
        self.thread = None
        
    def start(self):
        if not MQTT_ENABLED or mqtt is None:
            if mqtt is None:
                print("[MQTT WARNING] 'paho-mqtt' is not installed. MQTT integration is disabled.")
            else:
                print("[MQTT] MQTT integration is disabled by environment settings.")
            return
            
        self.thread = threading.Thread(target=self._run_loop, daemon=True)
        self.thread.start()
        
    def _run_loop(self):
        print(f"[MQTT] Connecting to broker {MQTT_BROKER}:{MQTT_PORT}...")
        try:
            self.client = mqtt.Client(client_id=MQTT_CLIENT_ID, callback_api_version=mqtt.CallbackAPIVersion.VERSION1 if hasattr(mqtt, "CallbackAPIVersion") else None)
        except Exception:
            try:
                self.client = mqtt.Client(client_id=MQTT_CLIENT_ID)
            except Exception as e:
                print(f"[MQTT ERROR] Failed to instantiate client: {e}")
                return

        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect
        self.client.on_message = self._on_message
        
        try:
            self.client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
            self.client.loop_start()
        except Exception as e:
            print(f"[MQTT ERROR] Could not connect to broker: {e}")
            
    def _on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            self.connected = True
            print(f"[MQTT] Successfully connected to MQTT Broker ({MQTT_BROKER})")
            # Subscribe to remote overrides
            topic = f"{MQTT_TOPIC_PREFIX}/controls/+"
            self.client.subscribe(topic)
            print(f"[MQTT] Subscribed to incoming controls topic: {topic}")
        else:
            print(f"[MQTT ERROR] Connection failed with status code: {rc}")
            
    def _on_disconnect(self, client, userdata, rc):
        self.connected = False
        print("[MQTT] Disconnected from MQTT Broker.")
        
    def _on_message(self, client, userdata, msg):
        try:
            payload = json.loads(msg.payload.decode("utf-8"))
            topic = msg.topic
            print(f"[MQTT COMMAND] Message received on {topic}: {payload}")
            # Here commands can be processed, e.g., overriding settings
            # hospital/bems/controls/hvac -> {"eco_mode": false}
        except Exception as e:
            print(f"[MQTT ERROR] Failed to parse message payload: {e}")
            
    def publish(self, topic, data):
        if not self.connected or self.client is None:
            return False
            
        try:
            full_topic = f"{MQTT_TOPIC_PREFIX}/{topic}"
            payload = json.dumps(data)
            self.client.publish(full_topic, payload, qos=0)
            return True
        except Exception as e:
            print(f"[MQTT ERROR] Failed to publish message: {e}")
            return False

# Global instance
mqtt_client = BEMSMQTTClient()
