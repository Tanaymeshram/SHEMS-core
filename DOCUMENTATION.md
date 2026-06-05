# Smart Hospital Energy Management System (SHEMS) — Technical Reference & Operations Manual

SHEMS is a production-grade, AI-powered Building Energy Management System (BEMS) designed specifically for critical healthcare environments. It optimizes microgrid electricity routing, HVAC target setpoints, and standby medical equipment idle times in real-time without compromising patient safety, clinical comfort, or critical healthcare operations.

---

## 🏛️ 1. System Architecture & Core Microgrid Routing

```mermaid
graph TD
    subgraph Core Telemetry & Controls
        A[ESP32 Telemetry / MQTT Client] -->|Telemetry Post| B[FastAPI Backend Core app.py]
        S[IoT Telemetry Simulator] -->|Updates DB & State| B
        B -->|SQLAlchemy ORM| DB[(SQLite/MySQL Database)]
    end

    subgraph AI/ML Intelligence Pipelines
        B -->|Telemetry Data| ML[ML Engine ml_engine.py]
        ML -->|Random Forest Regressor| P[Energy Forecasting]
        ML -->|Isolation Forest / Autoencoder| AN[Outlier Anomaly Detection]
        ML -->|Logistic Failure Regression| M[Predictive Maintenance SOH/RUL]
    end

    subgraph Frontend Control Center
        UI[React SPA Dashboard] -->|Queries APIs / WS| B
        UI -->|Overrides Setpoints| B
    end
```

### 🔋 Smart Energy Routing Engine Hierarchy
The routing engine operates on a strict priority hierarchy to minimize utility grid draw and maximize renewable solar offsets:

1. **Solar Power (Priority 1):** Runs active loads directly during daylight hours. Excess solar generation is dynamically routed to charge the BESS battery cells.
2. **Battery Storage BESS (Priority 2):** Discharges stored solar energy during peak demand/high tariff windows (typically 2:00 PM - 6:00 PM).
3. **Primary Utility Grid (Priority 3):** Operated as the baseline grid importer to meet hospital draws when renewable solar and battery reserves are depleted.
4. **Emergency Generator Backup (Priority 4):** During grid outages or critical battery drops (<20%), generator systems activate automatically to maintain safe conditions in the ICU and OT blocks.

---

## 🧠 2. Machine Learning Pipeline Specifications

SHEMS integrates three core machine learning pipelines built on Scikit-Learn and Pandas:

### A. Energy Demand Forecaster (Random Forest & XGBoost Regressors)
- **Features:** `hour_of_day`, `day_of_week`, `occupancy_count`, `outdoor_temperature`.
- **Target:** `total_power_demand_kw`.
- **Models:**
  - **Random Forest:** Ensemble of 100 decision trees. Good generalized tabular regression.
  - **XGBoost Regressor:** Extreme gradient boosting. Highly responsive to sudden peak spikes.
  - **LSTM Network:** Long Short-Term Memory RNN. Smooth lag-aware sequential memory.
- **Logic:** Forecasts load curves over the next 24-hour window, enabling the system to schedule pre-charging windows during low-tariff mornings.

### B. Outlier Anomaly Detection (Isolation Forest & Autoencoders)
- **Features:** `total_power`, `grid_import`, `carbon_emitted`.
- **Logic:** Identifies statistical outliers representing abnormal grid spikes (e.g. heating leaks during summer) or line grounding faults.
- **Isolation Forest Score:**
  $$s(x, n) = 2^{-\frac{E(h(x))}{c(n)}}$$
- **Autoencoder Reconstruction Heatmap:** Maps wing-level draws against reconstruction loss, flagging abnormal draws like unauthorized crypto-mining workloads.

### C. Predictive Maintenance (Logistic Sigmoid Regression)
- **Features:** Mechanical vibration ($mm/s$), core temperature ($^\circ C$), oil pressure ($PSI$).
- **Sigmoid Failure Probability:**
  $$P(\text{failure}) = \frac{1}{1 + e^{-(\beta_1 \cdot \text{vibration} + \beta_2 \cdot \text{temp} - \beta_3 \cdot \text{oil})}}$$
  - *Weights:* $\beta_1 = 1.5$ (Vibration coefficient), $\beta_2 = 0.05$ (Core temperature coefficient), $\beta_3 = 0.02$ (Oil pressure offset).
- **RUL Projection:** Computes Remaining Useful Life (RUL) in days:
  $$\text{RUL} = \max(5, 120 - 1.5 \cdot P(\text{failure}))$$

---

## 🏬 3. Departmental Rankings & Floor Allocation

The BEMS groups hospital energy draws by departments and floors to rank consumption patterns over a rolling 24-hour window:

| Department | Floor | Average Base Load | Peak Load Target | Classification |
| :--- | :--- | :--- | :--- | :--- |
| **Operating Theater (OT)** | Floor 2 | 48.2 kW | 85.0 kW | Life-Critical |
| **ICU Wing** | Floor 2 | 26.5 kW | 45.0 kW | Life-Critical |
| **Laboratories** | Floor 3 | 18.5 kW | 30.0 kW | Non-Critical |
| **Outpatient Clinic** | Floor 1 | 15.0 kW | 25.0 kW | Non-Critical |
| **General Wards** | Floor 1 | 28.0 kW | 40.0 kW | Semi-Critical |
| **Administration** | Floor 3 | 8.0 kW | 15.0 kW | Non-Critical |

---

## 🔌 4. API Endpoints & MQTT Telemetry Schemas

All endpoints are hosted on `http://localhost:5000/api/` and are fully interactive via Swagger Docs at `/docs`.

### REST API Endpoints
- **`GET /dashboard/live`**
  - *Returns:* Current live JSON state dictionary.
- **`POST /hvac/override`**
  - *Payload:* `{"room": "Research Center", "lights": 1, "hvac": 1, "fan_speed": 1}`
  - *Safety Guard:* Throws HTTP 400 Bad Request if overrides target ICU or OT shut-offs.
- **`GET /predictions/peak`**
  - *Returns:* Predicted peak load times, demand targets, and load distribution breakdowns.
- **`GET /maintenance/predictive`**
  - *Returns:* Failure probabilities, SOH, RUL, and next service dates.

### MQTT Telemetry Payload Schema
Broadcast Topic: `hospital/bems/telemetry/live` (JSON payload format published every 3s):
```json
{
  "room": "Research Center",
  "temperature": 23.5,
  "humidity": 51.0,
  "air_quality": 44.0,
  "lux": 250.0,
  "pir_motion": 1,
  "occupancy_count": 15,
  "current": 120.0,
  "voltage": 220.0,
  "solar_irradiance": 400.0,
  "battery_percentage": 75.0,
  "vibration": 1.8,
  "core_temperature": 55.0,
  "lights_status": 1,
  "hvac_status": 1
}
```

---

## 🔒 5. Clinical Safety & Automation Policies

### 🛡️ Clinical Safety Shield (Ventilator Lock)
To guarantee patient safety, the system implements hardcoded override shields at the model layer:
* **ICU & OT Target Locks:** Target temperatures are restricted to safe clinical brackets (ICU: $20^\circ C - 23^\circ C$, OT: $18^\circ C - 22^\circ C$).
* **Remote State Lock:** Remote shut-offs or standby commands are completely blocked for all critical life-support assets (Ventilators, Cardiac Monitors, Infusion Pumps).

### 🎛️ Occupancy-Aware Automation Rules
If a non-clinical zone's occupancy drops to $0$ for **10 minutes** (simulated at 30 seconds for evaluation):
- Lights & fans automatically transition to **OFF**.
- HVAC target shifts to **ECO Mode** ($24.5^\circ C$).
- Non-essential draws are disabled (cutting standby leakage).
- *On occupant re-entry, the zone instantly wakes up and restores Comfort Mode.*

---

## 🔧 6. Predictive Maintenance Status Matrix

Mechanical assets are classified under a three-tier status matrix based on ML-derived failure probabilities:

| Status | Failure Prob | Vibration Limit | Core Temp Limit | Oil Press Margin | Action Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Healthy** | 0% - 45% | < 2.5 mm/s | < 65 C | 40 - 55 PSI | Standard weekly inspection |
| **Warning** | 45% - 75% | 2.5 - 4.0 mm/s | 65C - 75C | 30 - 40 PSI | Schedule maintenance within 7 days |
| **Critical** | 75% - 100% | > 4.0 mm/s | > 75 C | < 30 PSI | Immediate automated shutdown & audit |

---

## 💬 7. AI Assistant NLP Prompt Mechanics

The BEMS integrates a local LLM companion (/assistant/ask) that maps natural language queries to SQL/Pandas analytics:
- **Query Mapping:** Parses triggers like "department energy", "predict tomorrow", "anomalies", or "hvac efficiency".
- **Dynamic Database Queries:** Runs real-time averages over `energy_readings` logs to answer departmental questions.
- **Actionable Advice:** Appends recommendation directives (e.g. BESS charging profiles) based on predicted demand spikes.

---

## 📊 8. Database Schema & Entity-Relationship Mapping

SHEMS utilizes SQLAlchemy ORM to communicate with SQLite or MySQL databases. The core schema consists of the following key tables:

### A. Core Tables & Attribute Lists

1. **`users` (User Account Registry)**
   - `id` (INTEGER, Primary Key, Autoincrement)
   - `username` (VARCHAR(100), Unique, Not Null)
   - `password` (VARCHAR(255), Not Null)
   - `role` (VARCHAR(100), Not Null) — *Technician, Administrator, Operator*
   - `name` (VARCHAR(255), Not Null)

2. **`settings` (System Configuration Key-Values)**
   - `key` (VARCHAR(100), Primary Key)
   - `value` (VARCHAR(255), Not Null)

3. **`rooms` (Hospital Rooms & Criticality Flags)**
   - `id` (INTEGER, Primary Key, Autoincrement)
   - `name` (VARCHAR(100), Unique, Not Null)
   - `department_id` (INTEGER, Nullable)
   - `room_type` (VARCHAR(100), Nullable)
   - `is_critical` (INTEGER, Default 0) — *1 represents ICU/OT*

4. **`energy_readings` (Historical Electrical Draw Logs)**
   - `id` (INTEGER, Primary Key, Autoincrement)
   - `timestamp` (VARCHAR(100), Unique, Not Null)
   - `total_power` (FLOAT, Not Null) — *Total hospital consumption (kW)*
   - `icu_power` (FLOAT, Not Null)
   - `ot_power` (FLOAT, Not Null)
   - `wards_power` (FLOAT, Not Null)
   - `outpatient_power` (FLOAT, Not Null)
   - `admin_power` (FLOAT, Not Null)
   - `solar_gen` (FLOAT, Not Null) — *Solar output (kW)*
   - `battery_charge` (FLOAT, Not Null) — *BESS State of Charge (%)*
   - `grid_import` (FLOAT, Not Null) — *Power drawn from grid (kW)*
   - `carbon_emitted` (FLOAT, Not Null) — *Estimated CO2 (kg/hr)*

5. **`equipment` (Medical & Infrastructure Electrical Assets)**
   - `id` (INTEGER, Primary Key, Autoincrement)
   - `name` (VARCHAR(100), Unique, Not Null)
   - `type` (VARCHAR(100), Not Null) — *Chiller, Ventilator, MRI, CT, Generator, etc.*
   - `is_critical` (INTEGER, Not Null) — *0 = Standard, 1 = Life-Support Critical*
   - `status` (VARCHAR(100), Not Null) — *Active, Standby, Idle, OFF*
   - `power_draw` (FLOAT, Not Null) — *Peak demand (kW)*
   - `standby_loss` (FLOAT, Not Null) — *Standby leakage power (kW)*
   - `operating_hours` (FLOAT, Not Null) — *Total operational runtime*
   - `maintenance_due` (VARCHAR(100), Not Null) — *Next inspection date*
   - `utilization_rate` (FLOAT, Default 0.0) — *Proportion of active vs idle time (%)*
   - `idle_time` (FLOAT, Default 0.0) — *Current continuous idle hours*

6. **`maintenance_logs` (Asset Mechanical Telemetry History)**
   - `id` (INTEGER, Primary Key, Autoincrement)
   - `timestamp` (VARCHAR(100), Not Null)
   - `asset_name` (VARCHAR(100), Not Null)
   - `vibration` (FLOAT, Not Null) — *Compressor casing displacement (mm/s)*
   - `temperature` (FLOAT, Not Null) — *Stator winding / core temperature (°C)*
   - `oil_pressure` (FLOAT, Not Null) — *Lube line pressure (PSI)*
   - `failure_prob` (FLOAT, Not Null) — *ML-regressed failure risk (%)*
   - `status` (VARCHAR(100), Not Null) — *Healthy, Warning, Critical*

7. **`alerts` (System Safety & Excursion Alerts)**
   - `id` (INTEGER, Primary Key, Autoincrement)
   - `timestamp` (VARCHAR(100), Not Null)
   - `type` (VARCHAR(100), Not Null) — *Info, Warning, Critical*
   - `source` (VARCHAR(100), Not Null) — *Grid, HVAC, BESS, ICU*
   - `message` (TEXT, Not Null)
   - `resolved` (INTEGER, Default 0) — *0 = Unresolved, 1 = Resolved*

---

## 📈 9. Mathematical Formulations & ML Preprocessing

This section outlines the statistical algorithms driving BEMS forecasting, anomaly detection, and predictive maintenance modules.

### A. Random Forest Regressor (24h Demand Forecasting)
The forecaster constructs an ensemble of $B = 50$ regression decision trees. Feature selection is defined as a vector $X = [h, d, T_{out}, O]$ representing the hour of day ($h \in [0, 23]$), day of week ($d \in [0, 6]$), outdoor temperature ($T_{out} \in \mathbb{R}$), and occupancy headcount ($O \in \mathbb{N}$).
The regression prediction $\hat{y}$ (total power demand) is the mean of individual tree outputs:
$$\hat{y}(X) = \frac{1}{B} \sum_{b=1}^{B} T_b(X)$$
Model accuracy is evaluated using $R^2$ Score and Mean Absolute Error (MAE):
$$R^2 = 1 - \frac{\sum_i (y_i - \hat{y}_i)^2}{\sum_i (y_i - \bar{y})^2}$$
$$\text{MAE} = \frac{1}{N} \sum_{i=1}^{N} |y_i - \hat{y}_i|$$

### B. Isolation Forest (Telemetry Outlier Detection)
To isolate electrical anomalies (grounding faults, power leaks, unauthorized consumption), the BEMS evaluates incoming power records. An anomaly score $s(x, n)$ is calculated for each sample $x$ against a dataset of size $n$:
$$s(x, n) = 2^{-\frac{E(h(x))}{c(n)}}$$
Where:
- $h(x)$ is the path length of sample $x$ in an isolation tree.
- $E(h(x))$ is the average path length across a forest of 100 isolation trees.
- $c(n) = 2 \ln(n - 1) + 0.5772156649 - \frac{2(n - 1)}{n}$ is the average path length of an unsuccessful search in a Binary Search Tree (BST).
If $s(x, n) \to 1$, the sample is classified as an anomaly ($s(x, n) > 0.60$ flags an immediate warning alert).

### C. Logistic Sigmoid Regression (Asset Failure Probability)
The mechanical health of critical infrastructure assets is evaluated by mapping variables (vibration $v$, stator core temperature $t$, oil line pressure $p$) to a binary target variable $Y \in \{0, 1\}$, where $Y=1$ indicates failure warning/critical state.
The logistic regression model computes the failure probability $P(Y=1 | v, t, p)$ via the Sigmoid activation function:
$$P(\text{failure}) = \sigma(z) = \frac{1}{1 + e^{-z}}$$
$$z = \beta_0 + \beta_1 v + \beta_2 t - \beta_3 p$$
Where the weights are trained and baseline-calibrated to:
$$\beta_0 = -8.2, \quad \beta_1 = 1.5, \quad \beta_2 = 0.05, \quad \beta_3 = 0.02$$
The Remaining Useful Life (RUL) in days is derived dynamically:
$$\text{RUL} = \max(5, \lfloor 120 - 1.5 \cdot (100 \cdot \sigma(z)) \rfloor)$$
This safety clamp guarantees a minimum of 5 days lead time for replacement dispatching.

---

## 📡 10. End-to-End API Route Directory

All routes are prefix-bound to `/api` and authenticate via JWT bearer tokens where specified.

### A. Authentication Module
* **`POST /api/auth/register`**
  - *Payload:* `{"username": "tanay", "password": "securepassword", "name": "Tanay Meshram", "role": "Administrator"}`
  - *Response:* `{"message": "Registration successful. Please proceed to login."}`
* **`POST /api/auth/login`**
  - *Payload:* `{"username": "tanay", "password": "securepassword"}`
  - *Response:* `{"message": "Login successful", "access_token": "JWT_TOKEN", "token_type": "bearer", "user": {...}}`

### B. HVAC & Automation Controls
* **`GET /api/hvac/settings`**
  - *Returns:* Target temperature setpoints for ICU, Operating Theater, Wards, Outpatient, Admin.
* **`POST /api/hvac/settings`**
  - *Payload:* `{"icu_target_temp": 21.5, "ot_target_temp": 20.0}`
  - *HTTP 400 validation:* Fails if ICU target is outside $[20.0, 23.0]^\circ C$ or OT is outside $[18.0, 22.0]^\circ C$.
* **`POST /api/hvac/override`**
  - *Payload:* `{"room": "ICU", "lights": 1, "hvac": 1, "fan_speed": 2}`
  - *Safety Guard:* Rejects HVAC shutdown (`hvac=0`) or Fan stoppage (`fan_speed=0`) inside critical blocks.
* **`POST /api/automation/toggle`**
  - *Payload:* `{"key": "hvac_eco_mode", "value": "1"}`
  - *Keys supported:* `hvac_eco_mode`, `lighting_occupancy_control`, `battery_peak_shaving`, `idle_equipment_alerts`.

### C. Predictive Analytics & Heatmaps
* **`GET /api/predictions/energy?model=random_forest&horizon=day`**
  - *Parameters:* `model` (`random_forest`, `xgboost`, `lstm`), `horizon` (`hour`, `day`, `week`, `month`).
  - *Returns:* Projections list and metrics dictionary ($R^2$, MAE, estimated costs, peak indicators).
* **`GET /api/predictions/peak`**
  - *Returns:* Predicted daily peak hour (e.g. `14:30`), peak demand in kW, sub-load distribution ratios, and AI recommendation strings.
* **`GET /api/anomalies/heatmap`**
  - *Returns:* Node statuses (`normal`, `warning`, `critical`) for all 10 zones and specific active anomaly lists.
* **`GET /api/maintenance/predictive`**
  - *Returns:* Multi-asset diagnostic matrix containing chiller, generator, UPS, inverter failure likelihoods, RULs, and service dates.

### D. System Controls & Ingestion
* **`POST /api/settings/system`**
  - *Payload:* `{"action": "retrain"}` (Triggers background training threads) or `{"action": "reset_db"}` (Wipes and seeds default database state).
* **`POST /api/ingestion/csv`**
  - *Payload:* `{"csv_data": "Timestamp,Total,ICU,OT,Solar,Battery,Grid,Carbon\n..."}`
  - *Returns:* Parse result and seeds historical records to retrain ML algorithms.
* **`POST /api/ingestion/sensor`**
  - *Payload:* Full MQTT JSON telemetry structure from physical sensor nodes.

---

## 🔌 11. MQTT Telemetry & ESP32 Integration Specs

### A. Network Telemetry Architecture
The system integrates with HiveMQ or local Mosquitto brokers. Local ESP32 microcontrollers deployed in physical zones (e.g. ICU Wing, Research Center) broadcast telemetry readings over Wi-Fi.

```
[ ESP32 Sensor Nodes ] --- (WiFi / MQTT Broker) ---> [ MQTT Client Daemon ] ---> [ FastAPI app.py ]
```

### B. Topic Hierarchy
- **`hospital/bems/telemetry/live`**: Input topic for raw zone metrics.
- **`hospital/bems/alerts/live`**: Output topic for broadcasting high-priority anomaly alarms.
- **`hospital/bems/control/overrides`**: Output topic carrying HVAC valve and relay actuator states.

### C. Transmission Intervals & Fallbacks
- **Frequency:** Telemetry published every 3 seconds.
- **QoS Level 1:** Guaranteed delivery for telemetry and alerts.
- **Offline Buffer:** ESP32 nodes preserve up to 100 historical readings in local flash memory during Wi-Fi drops, pushing buffered logs as a batch on reconnection.

---

## 💻 12. Local Setup & Multi-Platform Installation Guide

### A. Prerequisites
- **Python 3.10+** (FastAPI Core)
- **Node.js v18+ & npm** (Vite + React SPA)
- **SQLite** (Default database) or **MySQL / MariaDB**

### B. Python Virtual Environment Setup (Backend)
1. Navigate to the project root directory:
   ```bash
   cd smart-hospital-energy
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Seed database assets and train baseline models:
   ```bash
   python backend/reset_equipment.py
   ```
5. Launch the FastAPI server:
   ```bash
   python backend/app.py
   ```
   *The server binds to port `5000` (interactive documentation is available at `http://localhost:5000/docs`).*

### C. React Application Setup (Frontend)
1. Open a new terminal session and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the hot-reloading development server:
   ```bash
   npm run dev
   ```
   *The client dashboard launches on `http://localhost:5173`.*
4. To build production assets and bundle them into FastAPI static routing:
   ```bash
   npm run build
   ```
   *This exports the compiled static bundle directly to `backend/dist`, allowing FastAPI to host both API and UI on a single port (5000).*

---

## 🛠️ 13. Troubleshooting & Core FAQ

#### Q1: Port 5000 is already in use (Errno 10048).
**A:** Locate the process holding port 5000 and terminate it:
* **Windows (PowerShell):**
  ```powershell
  netstat -ano | findstr :5000
  taskkill /F /PID <PID_NUMBER>
  ```
* **macOS / Linux:**
  ```bash
  lsof -i :5000
  kill -9 <PID_NUMBER>
  ```

#### Q2: The Live Dashboard telemetry remains static.
**A:** The telemetry simulator daemon needs to be running. If it is paused, run the background injector script:
```bash
python backend/run_anomaly_sensors.py
```

#### Q3: Database changes or overrides fail with locked database errors.
**A:** SQLite is single-write only. To support high-concurrency production setups, configure a MySQL connection string in `backend/.env`:
```env
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/shems_db
```

---

## 🎓 14. High-Impact Developer & Interview Preparation Q&A

### Q1: Why did you choose FastAPI over Node.js Express for the BEMS backend?
**A:** FastAPI is highly suited for data-intensive and ML applications. Key advantages include:
1. **Native Python Ecosystem:** It allows direct integration of Scikit-Learn, Pandas, and NumPy models without spawning slow sub-processes or REST communication between a Node server and a Python ML engine.
2. **Speed & Asynchrony:** FastAPI is built on ASGI (uvicorn/starlette) and supports high-concurrency async operations.
3. **Pydantic Validation:** Inputs are validated dynamically at runtime.
4. **Auto-Generated Documentation:** It outputs Swagger UI specifications (/docs) out of the box.

### Q2: How does the system guarantee clinical safety when using automated HVAC Eco-toggling?
**A:** Safety is enforced at the database and routing controller layers:
1. **Critical Zone Exclusion:** The ICU and OT blocks are excluded from occupancy-based shutdowns.
2. **Safety Shield Validator:** The FastAPI endpoint `/hvac/settings` validates target setpoints using hardcoded limits. The `/hvac/override` endpoint rejects any manual requests to turn off HVAC fans or compressor loops inside critical clinical rooms.
3. **Hardware Fallback:** On the telemetry simulator layer, critical medical equipment (Ventilators, ICU Monitors) are locked to `Active` state and cannot be written to Standby or OFF.

### Q3: How do the Isolation Forest and Autoencoder models distinguish normal peak grid draws from actual energy anomalies?
**A:**
1. **Isolation Forest:** Trained exclusively on standard historical load datasets (grid import/solar ratio). The model partitions data points by randomly selecting a feature and a split value. Normal peak loads occur gradually and align with high occupancy and hot temperature variables, grouping near the top of the isolation trees. Abnormal sudden spikes or baseline shifts are isolated closer to the root of the trees, yielding a high anomaly score ($s(x, n) > 0.60$).
2. **Autoencoders:** The autoencoder neural network is trained to reconstruct normal room-level draw profiles. When unauthorized high loads (such as crypto-mining servers) occur, the reconstruction error (Mean Squared Error between input draw and output reproduction) spikes significantly, flagging the zone on the frontend heatmap.

### Q4: How does the Single Page Application (SPA) avoid route collision (404 errors) when a user refreshes the page on a custom URL?
**A:** The FastAPI server mounts static assets at `/assets` and handles all API traffic under `/api`. A custom fallback wildcard route `@app.get("/{fallback:path}")` catches all other non-API routes and returns the React index page (`frontend/dist/index.html`). This allows React Router to handle page rendering client-side.
