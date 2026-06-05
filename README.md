# Smart Hospital Energy Management System (SHEMS)

SHEMS is a production-grade, AI-powered building energy management system (BEMS) designed specifically for healthcare environments. It optimizes microgrid electricity usage, HVAC configurations, and standby medical equipment idle times in real time without compromising patient safety, clinical comfort, or critical healthcare operations.

---

## 🛠️ Technology Stack

* **Frontend:** React, Tailwind CSS (sleek dark mode design), Recharts (SVG streaming visualizations)
* **Backend:** FastAPI (Python), Uvicorn (ASGI Server)
* **Database:** MySQL 8.0 / SQLAlchemy ORM (with local SQLite zero-dependency fallback)
* **AI/ML Engine:** Scikit-Learn (Random Forest Regressor, Isolation Forest, Logistic Regression Classifiers)
* **Real-time Integration:** MQTT (paho-mqtt client) & WebSockets

---

## 🚀 Installation & Setup

### Option 1: Running with Docker Compose (Recommended)

To run the entire stack (FastAPI Backend, React Frontend static server, and MySQL 8.0 Database container) in one command:

1. Open a terminal at the project root.
2. Run:
   ```bash
   docker-compose up --build
   ```
3. Open `http://localhost:5000` in your web browser.

---

### Option 2: Running Locally (FastAPI + React Dev Server)

If you prefer executing services separately without Docker, follow these steps:

#### 1. Setup Backend:
1. Ensure Python 3.10+ is installed.
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Configure database connection in `backend/.env`. (Default is set to use MySQL with password `Tanay@232005`. If MySQL is unavailable, it automatically falls back to SQLite `hospital_energy.db` locally).
5. Start the FastAPI backend:
   ```bash
   python backend/app.py
   ```
   *The FastAPI server will launch on `http://localhost:5000`.*

#### 2. Setup Frontend:
1. Open a new terminal in the `frontend` folder.
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the React console at `http://localhost:5173`.

---

## 🔑 Default Seed Credentials

During initialization, the database seeds the following user roles for testing:

| Username | Password | Role | Full Name |
| :--- | :--- | :--- | :--- |
| **admin** | `admin123` | Admin | Dr. Sarah Jenkins (Chief Administrator) |
| **manager** | `manager123` | Energy Manager | Alex Rivera (Energy Operations Manager) |
| **tech** | `tech123` | Technician | Marcus Vance (HVAC & Facilities Tech) |

---

## 📊 Database Schema (SQLAlchemy Models)

SHEMS contains 18 defined tables mapping directly to the SQLAlchemy model schemas inside `backend/db_models.py`:

1. **`users`**: Manages credentials, password hashes, names, and administrative scopes.
2. **`settings`**: Active threshold target values, HVAC targets, and automation flags.
3. **`departments`**: Hospital departments (ICU, OT, General Wards, Outpatient Clinic, Administration).
4. **`rooms`**: Specific rooms mapped to departments and safety/critical classification profiles.
5. **`occupancy`**: Historical logs tracking ambient human counts per wing zone.
6. **`energy_readings`**: Hourly log of historical grid draws, wing draws, solar gen, and carbon scores.
7. **`hvac_data`**: Dynamic log of temperature, humidity, fan speeds, air quality, and cooling modes.
8. **`equipment`**: Inventory of ventilators, CT scanners, MRI machines, and core devices.
9. **`equipment_usage`**: Performance parameters, runtime hours, and standby loss factors.
10. **`solar_data`**: Flux tracking, daily generation tallies, and panel irradiance logs.
11. **`battery_data`**: Microgrid battery state of charge (SoC), charging speeds, and backup capacity estimates.
12. **`generator_data`**: Engine temperatures, active grid loads, and fuel level audits.
13. **`ups_data`**: Life support backups, battery health percentages, and load metrics.
14. **`alerts`**: Harvester warnings, climate drifts, critical system shutdowns, and resolution dates.
15. **`anomalies`**: Isolation Forest outlier records flagging energy spikes or micro-leaks.
16. **`maintenance_records`**: Vibration parameters, oil pressure levels, and failure probabilities.
17. **`carbon_metrics`**: Forest equivalent tree metrics and daily passenger car miles saved.
18. **`predictions`**: Future demand timelines computed by the Random Forest model.

---

## 📡 MQTT Integration (Telemetry Simulation)

The backend runs an optional MQTT integration (`backend/mqtt_client.py`) connecting to a broker (default: HiveMQ).

### MQTT Topics
* **Telemetry Broadcast:** `hospital/bems/telemetry/live` (publishes the full JSON sensor dict every 30s)
* **Critical Alerts Broadcast:** `hospital/bems/alerts/live` (publishes warning message logs)
* **Incoming Commands Topic:** `hospital/bems/controls/+` (listens to remote sensor overrides)

To change settings, set environment variables in `backend/.env`:
```env
MQTT_ENABLED=True
MQTT_BROKER=broker.hivemq.com
MQTT_PORT=1883
```

---

## 🧠 AI/ML Engine Models

The Scikit-Learn engine (`backend/ml_engine.py`) supervises three core intelligence pipelines:
1. **Demand Forecaster (Random Forest Regressor):** Learns hour-of-day, day-of-week, occupancy loads, and outdoor temperatures to forecast total building load over the next 24 hours.
2. **Outlier Detector (Isolation Forest):** Identifies abnormal grid draw spikes (e.g., active heating during summer or power thefts) and fires alert logs.
3. **Failure Predictor (Logistic Regression):** Regresses core chiller temperatures, compressor vibrations, and oil pressure values to calculate asset remaining useful life (RUL) and maintenance logs.

Interactive FastAPI API documentation is automatically accessible at `http://localhost:5000/docs`.
