from fpdf import FPDF
import os

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

class SHEMSDocPDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font('Helvetica', 'I', 8)
            self.set_text_color(120, 120, 120)
            self.cell(100, 10, 'Smart Hospital Energy Management System (SHEMS) Technical Manual', 0, 0, 'L')
            self.cell(0, 10, f'Page {self.page_no()}', 0, 1, 'R')
            self.set_draw_color(200, 200, 200)
            self.line(15, 18, 195, 18)
            self.ln(6)

    def footer(self):
        if self.page_no() > 1:
            self.set_y(-15)
            self.set_font('Helvetica', 'I', 8)
            self.set_text_color(150, 150, 150)
            self.cell(100, 10, 'CONFIDENTIAL - SYSTEM DOCUMENTATION', 0, 0, 'L')
            self.cell(0, 10, 'Version 1.0.0', 0, 1, 'R')

    def add_section_header(self, text):
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(15, 23, 42) # Dark Slate
        self.cell(0, 10, text, 0, 1, 'L')
        self.set_draw_color(20, 184, 166) # Teal line
        self.set_line_width(0.8)
        self.line(self.get_x(), self.get_y(), self.get_x() + 180, self.get_y())
        self.ln(6)

    def add_subsection_header(self, text):
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(30, 41, 59)
        self.cell(0, 8, text, 0, 1, 'L')
        self.ln(2)

def create_pdf():
    pdf = SHEMSDocPDF(orientation='P', unit='mm', format='A4')
    pdf.set_margins(15, 20, 15)
    pdf.alias_nb_pages()
    
    # ----------------------------------------------------
    # PAGE 1: COVER PAGE
    # ----------------------------------------------------
    pdf.add_page()
    pdf.set_fill_color(15, 23, 42) # Slate background
    pdf.rect(0, 0, 210, 297, 'F')
    
    # Draw large background decorative rectangle
    pdf.set_fill_color(20, 184, 166) # Teal accent line
    pdf.rect(15, 60, 180, 4, 'F')
    
    pdf.set_y(80)
    pdf.set_font('Helvetica', 'B', 32)
    pdf.set_text_color(255, 255, 255)
    pdf.multi_cell(180, 12, 'SMART HOSPITAL\nENERGY MANAGEMENT\nSYSTEM (SHEMS)', 0, 'L')
    
    pdf.ln(12)
    pdf.set_font('Helvetica', '', 14)
    pdf.set_text_color(200, 200, 200)
    pdf.cell(0, 8, 'Production-Grade AI BEMS Architecture & Specifications Manual', 0, 1, 'L')
    
    pdf.set_y(210)
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_text_color(20, 184, 166)
    pdf.cell(0, 6, 'AUTHOR:', 0, 1, 'L')
    pdf.set_font('Helvetica', '', 11)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 6, 'Tanay Meshram (Full-Stack Energy BEMS Developer)', 0, 1, 'L')
    
    pdf.ln(4)
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_text_color(20, 184, 166)
    pdf.cell(0, 6, 'SYSTEM VERSION:', 0, 1, 'L')
    pdf.set_font('Helvetica', '', 11)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 6, 'v1.0.0 (FastAPI Core + React SPA + SQLite/MySQL Engine)', 0, 1, 'L')
    
    pdf.ln(4)
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_text_color(20, 184, 166)
    pdf.cell(0, 6, 'DATE OF COMPILATION:', 0, 1, 'L')
    pdf.set_font('Helvetica', '', 11)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 6, 'June 2026', 0, 1, 'L')

    # ----------------------------------------------------
    # PAGE 2: TABLE OF CONTENTS
    # ----------------------------------------------------
    pdf.add_page()
    pdf.add_section_header('Table of Contents')
    
    toc_items = [
        ("1. System Overview & Architecture", "Page 3"),
        ("2. Machine Learning Forecasting Models", "Page 4"),
        ("3. Outlier Anomaly Detection Model", "Page 5"),
        ("4. Predictive Maintenance Pipeline", "Page 6"),
        ("5. Departmental Rankings & Floor Allocation", "Page 7"),
        ("6. Clinical Safety Guards & Automation Policies", "Page 8"),
        ("7. API Route Directory (REST Endpoints)", "Page 9"),
        ("8. MQTT Telemetry & ESP32 Integration Specifications", "Page 10"),
        ("9. Database Schema & Entity-Relationship Mapping", "Page 11"),
        ("10. Local Setup & Multi-Platform Installation Guide", "Page 12"),
        ("11. Developer & Technical Interview Q&A", "Page 13")
    ]
    
    pdf.set_font('Helvetica', '', 11)
    pdf.set_text_color(30, 41, 59)
    for section, page in toc_items:
        # Draw dotted line connecting section and page
        w_section = pdf.get_string_width(section)
        pdf.cell(w_section + 2, 8, section, 0, 0, 'L')
        
        # Draw dots
        w_dots = 160 - w_section
        dots = "." * int(w_dots / 1.5)
        pdf.set_text_color(150, 150, 150)
        pdf.cell(w_dots, 8, dots, 0, 0, 'C')
        
        pdf.set_text_color(30, 41, 59)
        pdf.cell(0, 8, page, 0, 1, 'R')
        pdf.ln(1.5)

    # ----------------------------------------------------
    # PAGE 3: SYSTEM ARCHITECTURE & CORE ROUTING
    # ----------------------------------------------------
    pdf.add_page()
    pdf.add_section_header('1. System Overview & Architecture')
    
    pdf.set_font('Helvetica', '', 10.5)
    pdf.set_text_color(30, 41, 59)
    intro_txt = (
        "SHEMS is a production-grade, AI-powered building energy management system (BEMS) "
        "designed specifically for critical healthcare environments. It optimizes microgrid electricity "
        "routing, HVAC target temperatures, and standby medical equipment idle times in real time without "
        "compromising patient safety, clinical comfort, or critical life-support operations."
    )
    pdf.multi_cell(180, 5.5, intro_txt)
    pdf.ln(6)
    
    pdf.add_subsection_header('Smart Energy Routing Engine Hierarchy:')
    
    routing_steps = [
        ("Priority 1: Solar Power", "Directly offsets hospital active load draw during sunlight hours. Excess solar generation is dynamically routed to charge the BESS battery cells."),
        ("Priority 2: Battery Storage (BESS)", "During peak load hours or high-tariff windows (2:00 PM - 6:00 PM), BESS batteries discharge to run auxiliary systems, shaving grid imports."),
        ("Priority 3: Primary Utility Grid", "Operated as the baseline grid importer to meet hospital draws when renewable solar and battery reserves are depleted."),
        ("Priority 4: Emergency Generator Backup", "During grid outages or critical battery drops (<20%), generator systems activate automatically to maintain safe conditions in the ICU and OT blocks.")
    ]
    
    for title, desc in routing_steps:
        pdf.set_font('Helvetica', 'B', 10.5)
        pdf.cell(0, 6, f"* {title}", 0, 1, 'L')
        pdf.set_font('Helvetica', '', 10)
        pdf.multi_cell(180, 5, f"  {desc}")
        pdf.ln(2.5)

    # ----------------------------------------------------
    # PAGE 4: FORECASTING MODELS
    # ----------------------------------------------------
    pdf.add_page()
    pdf.add_section_header('2. Machine Learning Forecasting Models')
    
    pdf.set_font('Helvetica', '', 10.5)
    forecasting_intro = (
        "The BEMS demand forecasting module predicts total power demand (kW) over a rolling "
        "24-hour window, enabling intelligent microgrid scheduling. The model processes temporal features, "
        "occupancy numbers, and outdoor environmental temperatures to plan battery charging and load shifting."
    )
    pdf.multi_cell(180, 5.5, forecasting_intro)
    pdf.ln(4)
    
    pdf.add_subsection_header('Random Forest Regressor')
    rf_txt = (
        "The primary model constructs an ensemble of B = 50 decision trees. Features are defined as a vector "
        "X = [hour, dayofweek, avg_temp, total_occ], where hour is the hour of the day (0-23), dayofweek is the "
        "day of the week (0-6), avg_temp is the outdoor temperature, and total_occ is the total occupancy count.\n\n"
        "The regression prediction is the mean of individual tree outputs:\n"
        "    y_hat(X) = (1 / B) * Sum_{b=1}^{B} T_b(X)\n\n"
        "Model accuracy is calculated using R^2 Score and Mean Absolute Error (MAE):\n"
        "    R^2 = 1 - [ Sum_i (y_i - y_hat_i)^2 ] / [ Sum_i (y_i - y_mean)^2 ]\n"
        "    MAE = (1 / N) * Sum_{i=1}^{N} |y_i - y_hat_i|\n\n"
        "Baseline values: R^2 Score = 0.88, MAE = 5.2 kW. This model enables high-precision load curve alignment."
    )
    pdf.multi_cell(180, 5, rf_txt)
    pdf.ln(4)
    
    pdf.add_subsection_header('XGBoost & LSTM Regressor Models')
    xgb_lstm_txt = (
        "For multi-model comparisons: XGBoost Regressor is highly responsive to sudden occupancy spikes and temperature "
        "excursions, while LSTM (Long Short-Term Memory) network captures rolling, sequence-aware lagged dependencies "
        "over temporal boundaries."
    )
    pdf.multi_cell(180, 5, xgb_lstm_txt)

    # ----------------------------------------------------
    # PAGE 5: ANOMALY DETECTION
    # ----------------------------------------------------
    pdf.add_page()
    pdf.add_section_header('3. Outlier Anomaly Detection Model')
    
    pdf.set_font('Helvetica', '', 10.5)
    anomaly_intro = (
        "Anomalies in hospital grid imports often represent electrical grounding faults, HVAC air-flow leaks, "
        "or unauthorized power drains. SHEMS uses an Isolation Forest model and Autoencoders to identify "
        "unusual consumption profiles in real-time."
    )
    pdf.multi_cell(180, 5.5, anomaly_intro)
    pdf.ln(4)
    
    pdf.add_subsection_header('Isolation Forest')
    if_txt = (
        "The model isolates anomalies by randomly selecting a feature and a split value. The sample is passed "
        "down the tree. Outliers isolate closer to the root of the tree, yielding shorter path lengths.\n\n"
        "The anomaly score s(x, n) is calculated as:\n"
        "    s(x, n) = 2^{ - E(h(x)) / c(n) }\n\n"
        "Where:\n"
        "  * h(x) is the path length of sample x.\n"
        "  * E(h(x)) is the average path length across all isolation trees.\n"
        "  * c(n) = 2 * ln(n - 1) + 0.5772156649 - (2 * (n - 1) / n) is the average path length of an "
        "unsuccessful search in a Binary Search Tree.\n\n"
        "An anomaly score closer to 1 indicates a high probability of an anomaly. The threshold is set at s(x, n) > 0.60, "
        "triggering automatic alerts in the alerts directory."
    )
    pdf.multi_cell(180, 5, if_txt)
    pdf.ln(4)
    
    pdf.add_subsection_header('Autoencoder Reconstruction')
    ae_txt = (
        "Neural network autoencoders learn compressed representations of room-level energy draws. When abnormal draws "
        "occur (e.g. unauthorized server draws in the Research Center), reconstruction Mean Squared Error (MSE) "
        "spikes, flagging that room on the dashboard heatmap."
    )
    pdf.multi_cell(180, 5, ae_txt)

    # ----------------------------------------------------
    # PAGE 6: PREDICTIVE MAINTENANCE
    # ----------------------------------------------------
    pdf.add_page()
    pdf.add_section_header('4. Predictive Maintenance Pipeline')
    
    pdf.set_font('Helvetica', '', 10.5)
    pm_intro = (
        "SHEMS regresses sensor data (casing vibration, core temperature, oil pressure) to calculate "
        "asset State of Health (SOH) and Remaining Useful Life (RUL) for critical machinery."
    )
    pdf.multi_cell(180, 5.5, pm_intro)
    pdf.ln(4)
    
    pdf.add_subsection_header('Logistic Sigmoid Regression Formula')
    sigmoid_txt = (
        "The failure probability P(failure) of a mechanical asset is calculated via a Sigmoid activation:\n"
        "    P(failure) = 1 / [ 1 + e^{-z} ]\n"
        "    z = beta_0 + beta_1 * vibration + beta_2 * temp - beta_3 * oil_pressure\n\n"
        "Where mechanical variables and trained coefficients are defined as:\n"
        "  * beta_0 = -8.2 (intercept)\n"
        "  * beta_1 = 1.5 (Vibration multiplier, standard limit < 2.5 mm/s)\n"
        "  * beta_2 = 0.05 (Stator Core Temperature multiplier, standard limit < 65 C)\n"
        "  * beta_3 = 0.02 (Lube Oil Pressure offset, standard range 40 - 55 PSI)\n\n"
        "The Remaining Useful Life (RUL) in days is calculated dynamically as:\n"
        "    RUL = max(5, int(120 - 1.5 * failure_probability))"
    )
    pdf.multi_cell(180, 5, sigmoid_txt)
    pdf.ln(4)
    
    pdf.add_subsection_header('Predictive Risk Matrices')
    risk_txt = (
        "  * Healthy (0% - 45%): Standard inspection schedule.\n"
        "  * Warning (45% - 75%): Triggers technician dispatch within 7 days.\n"
        "  * Critical (75% - 100%): Triggers automated shutdown protocol and immediate service log entries."
    )
    pdf.multi_cell(180, 5, risk_txt)

    # ----------------------------------------------------
    # PAGE 7: DEPARTMENTAL RANKINGS
    # ----------------------------------------------------
    pdf.add_page()
    pdf.add_section_header('5. Departmental Rankings & Floor Allocation')
    
    pdf.set_font('Helvetica', '', 10.5)
    pdf.multi_cell(180, 5.5, "The BEMS groups hospital energy draws by departments and floors to rank consumption patterns over a rolling 24-hour window:")
    pdf.ln(4)
    
    # Render Table Header
    pdf.set_fill_color(220, 220, 220)
    pdf.set_font('Helvetica', 'B', 9.5)
    pdf.cell(50, 8, ' Department', 1, 0, 'L', True)
    pdf.cell(25, 8, ' Floor', 1, 0, 'C', True)
    pdf.cell(35, 8, ' Avg Load (kW)', 1, 0, 'C', True)
    pdf.cell(35, 8, ' Peak Load (kW)', 1, 0, 'C', True)
    pdf.cell(35, 8, ' Classification', 1, 1, 'C', True)
    
    # Table Content rows
    depts = [
        ("Operating Theater (OT)", "Floor 2", "48.2", "85.0", "Life-Critical"),
        ("ICU Wing", "Floor 2", "26.5", "45.0", "Life-Critical"),
        ("Laboratories", "Floor 3", "18.5", "30.0", "Non-Critical"),
        ("Outpatient Clinic", "Floor 1", "15.0", "25.0", "Non-Critical"),
        ("General Wards", "Floor 1", "28.0", "40.0", "Semi-Critical"),
        ("Administration", "Floor 3", "8.0", "15.0", "Non-Critical")
    ]
    
    pdf.set_font('Helvetica', '', 9.5)
    for name, floor, avg, peak, cls in depts:
        pdf.cell(50, 7.5, f" {name}", 1, 0, 'L')
        pdf.cell(25, 7.5, f" {floor}", 1, 0, 'C')
        pdf.cell(35, 7.5, f" {avg}", 1, 0, 'C')
        pdf.cell(35, 7.5, f" {peak}", 1, 0, 'C')
        pdf.cell(35, 7.5, f" {cls}", 1, 1, 'C')
    pdf.ln(6)
    
    pdf.add_subsection_header('Floor Distribution Details:')
    floor_txt = (
        "  * Floor 1 (Clinic & Wards): Base load averages ~43.0 kW. Suitable for occupancy-based ECO automation.\n"
        "  * Floor 2 (ICU & OT): Base load averages ~74.7 kW. Life-critical systems locked out of shutoff protocols.\n"
        "  * Floor 3 (Admin & Labs): Base load averages ~26.5 kW. High occupancy fluctuation, major source of standby savings."
    )
    pdf.multi_cell(180, 5, floor_txt)

    # ----------------------------------------------------
    # PAGE 8: SAFETY SHIELDS & AUTOMATION POLICIES
    # ----------------------------------------------------
    pdf.add_page()
    pdf.add_section_header('6. Safety Shields & Automation')
    
    pdf.add_subsection_header('Clinical Safety Shields (ICU & OT):')
    pdf.set_font('Helvetica', '', 10)
    safety_points = [
        "Patient safety always has the highest priority. ICU and OT blocks are locked continuously to comfort climate settings.",
        "Remote state modifications (standbys or shut-offs) are completely blocked for all critical life-support machines (Ventilators, Cardiac Monitors, Infusion Pumps, Emergency Lights).",
        "HVAC target temp setpoints in critical zones are restricted within tight clinical margins (ICU: 20C - 23C, OT: 18C - 22C). All out-of-bracket requests are rejected at the FastAPI core."
    ]
    
    for pt in safety_points:
        pdf.multi_cell(180, 5, f"- {pt}")
        pdf.ln(2)
        
    pdf.ln(2)
    pdf.add_subsection_header('Occupancy-Aware Automation Rules:')
    automation_desc = (
        "In non-critical wings (like Outpatient Clinic, General Wards, Admin offices), if occupancy count drops "
        "to 0 for 10 minutes (simulated at 30 seconds for quick validation):\n"
        "  - Lights & Fans are switched to OFF automatically.\n"
        "  - Displays & PC monitors are powered down to Standby.\n"
        "  - HVAC Target shifts to ECO Mode (24.5C), cutting HVAC load draw by up to 40%.\n"
        "  - Non-essential auxiliary draws are disabled.\n\n"
        "As soon as a new occupant enters the zone, BEMS immediately wakes up the systems and restores Comfort Mode."
    )
    pdf.multi_cell(180, 5, automation_desc)

    # ----------------------------------------------------
    # PAGE 9: API ROUTE DIRECTORY
    # ----------------------------------------------------
    pdf.add_page()
    pdf.add_section_header('7. API Route Directory')
    
    pdf.set_font('Helvetica', '', 10.5)
    pdf.multi_cell(180, 5.5, "FastAPI exposes the following core routes under http://localhost:5000/api:")
    pdf.ln(3)
    
    endpoints = [
        ("POST /auth/login", "Logs in a user. Expects JSON credentials, returns JWT bearer token."),
        ("GET /dashboard/live", "Returns current live state dictionary updated by simulator thread."),
        ("POST /hvac/settings", "Configures targets. Rejects out-of-boundary inputs for ICU (20-23C) and OT (18-22C)."),
        ("POST /hvac/override", "Applies immediate controls. Fails with 403 Forbidden for shutdowns of life-support systems."),
        ("GET /predictions/energy", "Exposes 24h/weekly load curves based on RF, XGBoost, and LSTM inference."),
        ("GET /predictions/peak", "Returns predicted peak hour (14:30), peak demand, and shifting advice."),
        ("GET /anomalies/heatmap", "Returns node status alerts (Green/Yellow/Red) for 10 distinct hospital wings."),
        ("GET /maintenance/predictive", "Provides failure probability, RUL, and service dates for all mechanical assets."),
        ("POST /settings/system", "Supports trigger payloads like 'retrain' and 'reset_db'."),
        ("GET /download/zip", "Natively returns the source code ZIP archive to bypass text viewer constraints."),
        ("GET /download/pdf", "Downloads this compiled technical reference PDF manual.")
    ]
    
    for endpoint, desc in endpoints:
        pdf.set_font('Helvetica', 'B', 9.5)
        pdf.cell(0, 5, f"  * {endpoint}", 0, 1, 'L')
        pdf.set_font('Helvetica', '', 9.5)
        pdf.multi_cell(180, 4.5, f"    {desc}")
        pdf.ln(1.5)

    # ----------------------------------------------------
    # PAGE 10: MQTT & NETWORK SPECS
    # ----------------------------------------------------
    pdf.add_page()
    pdf.add_section_header('8. MQTT Telemetry Specifications')
    
    pdf.set_font('Helvetica', '', 10.5)
    mqtt_intro = (
        "SHEMS uses MQTT to communicate with ESP32-based temperature, occupancy, and current sensors. "
        "A background daemon processes telemetry packets and logs values to the database."
    )
    pdf.multi_cell(180, 5.5, mqtt_intro)
    pdf.ln(4)
    
    pdf.add_subsection_header('Topic Structures')
    topics = [
        ("hospital/bems/telemetry/live", "Broadcasts raw sensor data from wings (temp, humidity, air quality, lux, motion, current, voltage). Published every 3s."),
        ("hospital/bems/alerts/live", "Publishes safety alerts (voltage drops, temp excursions, anomaly flags). QoS Level 1."),
        ("hospital/bems/control/overrides", "Carries control commands back to physical HVAC thermostats and lighting relays.")
    ]
    for topic, desc in topics:
        pdf.set_font('Helvetica', 'B', 10)
        pdf.cell(0, 5, f"  * {topic}", 0, 1, 'L')
        pdf.set_font('Helvetica', '', 9.5)
        pdf.multi_cell(180, 4.5, f"    {desc}")
        pdf.ln(2)
        
    pdf.ln(2)
    pdf.add_subsection_header('Network Keep-Alive & Buffering')
    network_txt = (
        "  - QoS Level: QoS 1 (At least once delivery) is configured for alerts and config commands.\n"
        "  - Keep-Alive: 60-second ping interval to monitor ESP32 link status.\n"
        "  - Local In-Memory Buffering: If Wi-Fi goes down, ESP32 nodes buffer up to 100 entries, flushing them on reconnect."
    )
    pdf.multi_cell(180, 5, network_txt)

    # ----------------------------------------------------
    # PAGE 11: DATABASE SCHEMA
    # ----------------------------------------------------
    pdf.add_page()
    pdf.add_section_header('9. Database Schema Mapping')
    
    pdf.set_font('Helvetica', '', 10.5)
    schema_intro = "The database is modeled using SQLAlchemy ORM. Important tables include:"
    pdf.multi_cell(180, 5.5, schema_intro)
    pdf.ln(4)
    
    tables_spec = [
        ("users", "id (PK), username (Unique, Not Null), password, role, name"),
        ("settings", "key (PK), value"),
        ("rooms", "id (PK), name (Unique), department_id, room_type, is_critical (0/1)"),
        ("energy_readings", "id (PK), timestamp (Unique), total_power, icu_power, ot_power, wards_power, outpatient_power, admin_power, solar_gen, battery_charge, grid_import, carbon_emitted"),
        ("equipment", "id (PK), name (Unique), type, is_critical, status, power_draw, standby_loss, operating_hours, maintenance_due, utilization_rate, idle_time"),
        ("maintenance_logs", "id (PK), timestamp, asset_name, vibration, temperature, oil_pressure, failure_prob, status"),
        ("alerts", "id (PK), timestamp, type, source, message, resolved (0/1)"),
        ("hvac_data", "id (PK), timestamp, room_name, temperature, humidity, fan_speed, air_quality, power_consumption, mode")
    ]
    
    for tbl, fields in tables_spec:
        pdf.set_font('Helvetica', 'B', 10.5)
        pdf.cell(0, 5, f"  * Table: {tbl}", 0, 1, 'L')
        pdf.set_font('Courier', '', 9.5)
        pdf.multi_cell(180, 4.5, f"    Fields: {fields}")
        pdf.ln(1.5)

    # ----------------------------------------------------
    # PAGE 12: LOCAL INSTALLATION
    # ----------------------------------------------------
    pdf.add_page()
    pdf.add_section_header('10. Local Installation & Setup')
    
    pdf.add_subsection_header('Python FastAPI Backend Setup:')
    install_txt = (
        "1. Create and Activate Virtual Environment:\n"
        "   $ cd smart-hospital-energy\n"
        "   $ python -m venv venv\n"
        "   $ venv\\Scripts\\activate          # Windows\n"
        "   $ source venv/bin/activate        # macOS/Linux\n\n"
        "2. Install Requirements:\n"
        "   $ pip install -r backend/requirements.txt\n\n"
        "3. Reset & Seed SQLite Database:\n"
        "   $ python backend/reset_equipment.py\n\n"
        "4. Launch API Service:\n"
        "   $ python backend/app.py           # Port 5000"
    )
    pdf.set_font('Courier', '', 9.5)
    pdf.multi_cell(180, 4.5, install_txt)
    pdf.ln(4)
    
    pdf.add_subsection_header('React Frontend SPA Setup:')
    react_txt = (
        "1. Navigate and Install Node Modules:\n"
        "   $ cd frontend\n"
        "   $ npm install\n\n"
        "2. Start Development Server:\n"
        "   $ npm run dev                     # Port 5173\n\n"
        "3. Build Static Assets for Backend Routing:\n"
        "   $ npm run build                   # Outputs to backend/dist"
    )
    pdf.multi_cell(180, 4.5, react_txt)

    # ----------------------------------------------------
    # PAGE 13: DEVELOPER & INTERVIEW Q&A
    # ----------------------------------------------------
    pdf.add_page()
    pdf.add_section_header('11. Developer & Technical Interview Q&A')
    
    qas = [
        ("Why FastAPI instead of Express for the backend?", 
         "FastAPI is built on Python, enabling direct integration of ML models (Scikit-Learn, Pandas) "
         "without the overhead of child process spawning. It provides built-in Pydantic type validation "
         "and generates Swagger UI docs automatically."),
        
        ("How does the system ensure patient safety during automated HVAC eco-toggling?", 
         "Critical zones (ICU and OT blocks) are hard-locked. The BEMS backend blocks remote standby, "
         "shutdown, or fan speed decreases for life-critical assets. Setpoint temperatures in critical blocks "
         "are capped within tight margins (ICU: 20-23C, OT: 18-22C) and validated on ingestion."),
        
        ("Explain the anomaly detection algorithm differences.", 
         "Isolation Forest separates abnormal imports and current spikes using path-length calculations on "
         "partitioned feature trees. Autoencoders compress and reconstruct wing-level consumption; "
         "unauthorized loads (e.g. crypto-mining in research rooms) trigger high reconstruction MSE loss, "
         "highlighting that wing on the dashboard heatmap."),
         
        ("How does the SPA handle refreshes on custom routes without returning 404?", 
         "FastAPI is configured with a wildcard catch-all route at the bottom of app.py. Any non-API requests "
         "default to returning the frontend's index.html, allowing the React Router library to resolve page navigation client-side.")
    ]
    
    for i, (q, a) in enumerate(qas, 1):
        pdf.set_font('Helvetica', 'B', 10)
        pdf.multi_cell(180, 5, f"Q{i}: {q}")
        pdf.set_font('Helvetica', '', 10)
        pdf.multi_cell(180, 5, f"A: {a}")
        pdf.ln(3)

    # Save PDF
    output_path = os.path.join(PROJECT_ROOT, "SHEMS_Documentation.pdf")
    pdf.output(output_path)
    print(f"[INFO] PDF Documentation generated at: {output_path}")

if __name__ == "__main__":
    create_pdf()
