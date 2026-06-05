from fpdf import FPDF
import os

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

class SHEMSDocPDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font('Helvetica', 'I', 8)
            self.set_text_color(120, 120, 120)
            self.cell(100, 10, 'Smart Hospital Energy Management System (SHEMS)', 0, 0, 'L')
            self.cell(0, 10, f'Page {self.page_no()}', 0, 1, 'R')
            # Thin gray line
            self.set_draw_color(200, 200, 200)
            self.line(10, 18, 200, 18)
            self.ln(6)

    def footer(self):
        if self.page_no() > 1:
            self.set_y(-15)
            self.set_font('Helvetica', 'I', 8)
            self.set_text_color(150, 150, 150)
            self.cell(100, 10, 'CONFIDENTIAL - PROJECT SHOWCASE PORTFOLIO', 0, 0, 'L')
            self.cell(0, 10, 'Version 1.0', 0, 1, 'R')

def create_pdf():
    pdf = SHEMSDocPDF(orientation='P', unit='mm', format='A4')
    pdf.set_margins(15, 20, 15)
    pdf.alias_nb_pages()
    
    # ----------------------------------------------------
    # PAGE 1: COVER PAGE
    # ----------------------------------------------------
    pdf.add_page()
    pdf.set_fill_color(15, 23, 42) # Dark Slate Blue matching our BEMS theme
    pdf.rect(0, 0, 210, 297, 'F')
    
    # Title Banner Accent
    pdf.set_fill_color(20, 184, 166) # Teal accent line
    pdf.rect(15, 60, 180, 4, 'F')
    
    pdf.set_y(75)
    pdf.set_font('Helvetica', 'B', 28)
    pdf.set_text_color(255, 255, 255)
    pdf.multi_cell(180, 12, 'SMART HOSPITAL\nENERGY MANAGEMENT\nSYSTEM (SHEMS)', 0, 'L')
    
    pdf.ln(10)
    pdf.set_font('Helvetica', '', 14)
    pdf.set_text_color(200, 200, 200)
    pdf.cell(0, 8, 'Production-Grade AI BEMS Architecture & Specifications Manual', 0, 1, 'L')
    
    # Draw Meta Block
    pdf.set_y(220)
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_text_color(20, 184, 166) # Teal
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
    # PAGE 2: SYSTEM ARCHITECTURE & MICROGRID ROUTING
    # ----------------------------------------------------
    pdf.add_page()
    pdf.set_text_color(30, 41, 59) # Return to dark gray text for white page
    
    pdf.set_font('Helvetica', 'B', 18)
    pdf.cell(0, 10, '1. System Overview & Architecture', 0, 1, 'L')
    pdf.ln(4)
    
    pdf.set_font('Helvetica', '', 10.5)
    intro_txt = (
        "SHEMS is a production-grade, AI-powered building energy management system (BEMS) "
        "designed specifically for critical healthcare environments. It optimizes microgrid electricity "
        "routing, HVAC target temperatures, and standby medical equipment idle times in real time without "
        "compromising patient safety, clinical comfort, or critical life-support operations."
    )
    pdf.multi_cell(180, 5.5, intro_txt)
    pdf.ln(6)
    
    pdf.set_font('Helvetica', 'B', 13)
    pdf.cell(0, 8, 'Hybrid Microgrid Routing Engine Hierarchy:', 0, 1, 'L')
    pdf.ln(2)
    
    routing_steps = [
        ("Priority 1: Solar Power", "Directly offsets hospital active load draw during sunlight hours. Excess solar generation is dynamically routed to charge the BESS battery cells."),
        ("Priority 2: Battery Storage (BESS)", "During peak load hours or high-tariff windows (2:00 PM - 6:00 PM), BESS batteries discharge to run auxiliary systems, shaving grid imports."),
        ("Priority 3: Primary Utility Grid", "Operated as the baseline grid importer to meet hospital draws when renewable solar and battery reserves are depleted."),
        ("Priority 4: Emergency Generator Backup", "During grid outages or critical battery drops (<20%), generator systems activate automatically to maintain safe conditions in the ICU and OT blocks.")
    ]
    
    pdf.set_font('Helvetica', '', 10)
    for title, desc in routing_steps:
        pdf.set_font('Helvetica', 'B', 10)
        pdf.cell(0, 6, f"  * {title}", 0, 1, 'L')
        pdf.set_font('Helvetica', '', 10)
        pdf.multi_cell(180, 5, f"    {desc}")
        pdf.ln(2)

    # ----------------------------------------------------
    # PAGE 3: MACHINE LEARNING INTELLIGENCE PIPELINES
    # ----------------------------------------------------
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 18)
    pdf.cell(0, 10, '2. Machine Learning Intelligence Pipelines', 0, 1, 'L')
    pdf.ln(4)
    
    pipelines = [
        ("A. Demand Forecaster (Random Forest Regressor)", 
         "Learns hour-of-day, day-of-week, occupancy levels, and outdoor temperatures. It projects a "
         "continuous load forecast curve over the next 24 hours, letting the smart routing engine schedule "
         "pre-charging windows during low-tariff mornings."),
        
        ("B. Outlier Anomaly Detector (Isolation Forest)", 
         "Analyzes live grid import, carbon indices, and total draws. It detects statistical anomalies "
         "representing power spikes or line grounding faults. The autoencoder model also maps room-level "
         "draws to flag abnormal server draws (e.g. crypto-mining draft load in the Research Center)."),
        
        ("C. Predictive Maintenance (Logistic Sigmoid Regression)", 
         "Computes asset State of Health (SOH) and Remaining Useful Life (RUL) using mechanical variables: "
         "compressor vibration (mm/s), core temperature (C), and oil pressure (PSI). If failure probability "
         "rises above 65%, a critical maintenance alert is automatically written to the database.")
    ]
    
    for title, desc in pipelines:
        pdf.set_font('Helvetica', 'B', 12)
        pdf.cell(0, 8, title, 0, 1, 'L')
        pdf.ln(1)
        pdf.set_font('Helvetica', '', 10)
        pdf.multi_cell(180, 5, desc)
        pdf.ln(6)

    # ----------------------------------------------------
    # PAGE 4: REST API & TELEMETRY SCHEMAS
    # ----------------------------------------------------
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 18)
    pdf.cell(0, 10, '3. API Endpoints & MQTT Telemetry', 0, 1, 'L')
    pdf.ln(4)
    
    pdf.set_font('Helvetica', 'B', 12)
    pdf.cell(0, 8, 'Key REST API Endpoints:', 0, 1, 'L')
    pdf.ln(2)
    
    endpoints = [
        ("GET /api/dashboard/live", "Returns current live JSON telemetry dict (occupancy, temperatures, powers)."),
        ("POST /api/hvac/override", "Allows manual target overrides (room, lights, hvac mode, fan speed). Blocks overrides that violate ICU/OT patient safety shields."),
        ("GET /api/predictions/peak", "Returns predicted peak time, projected peak demand (kW), and load distributions."),
        ("GET /api/maintenance/predictive", "Exposes failure probabilities, RUL, and next service dates for Chillers, HVAC, Generators, UPS, and Inverters.")
    ]
    
    pdf.set_font('Helvetica', '', 10)
    for endpoint, desc in endpoints:
        pdf.set_font('Helvetica', 'B', 10)
        pdf.cell(0, 6, f"  * {endpoint}", 0, 1, 'L')
        pdf.set_font('Helvetica', '', 10)
        pdf.multi_cell(180, 5, f"    {desc}")
        pdf.ln(2.5)
        
    pdf.ln(4)
    pdf.set_font('Helvetica', 'B', 12)
    pdf.cell(0, 8, 'MQTT Broker Topics ( HiveMQ Integration ):', 0, 1, 'L')
    pdf.ln(2)
    
    mqtt_topics = [
        ("hospital/bems/telemetry/live", "Publishes the full JSON sensor telemetry dict every 3 seconds to keep UI visual graphs synchronized."),
        ("hospital/bems/alerts/live", "Publishes active critical warning messages when temperature drifts or power spikes occur.")
    ]
    
    for topic, desc in mqtt_topics:
        pdf.set_font('Helvetica', 'B', 10)
        pdf.cell(0, 6, f"  * Topic: {topic}", 0, 1, 'L')
        pdf.set_font('Helvetica', '', 10)
        pdf.multi_cell(180, 5, f"    {desc}")
        pdf.ln(2)

    # ----------------------------------------------------
    # PAGE 5: CLINICAL SAFETY SHIELDS & AUTOMATION
    # ----------------------------------------------------
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 18)
    pdf.cell(0, 10, '4. Clinical Safety Guards & Automation', 0, 1, 'L')
    pdf.ln(4)
    
    pdf.set_font('Helvetica', 'B', 12)
    pdf.cell(0, 8, 'Clinical Safety Shield Locks ( ICU & OT ):', 0, 1, 'L')
    pdf.ln(2)
    
    safety_points = [
        "Patient safety always has the highest priority. ICU and OT blocks are locked continuously to comfort climate settings.",
        "Remote state modifications (standbys or shut-offs) are completely blocked for all critical life-support machines (Ventilators, Cardiac Monitors, Infusion Pumps, Emergency Lights).",
        "HVAC target temp setpoints in critical zones are restricted within tight clinical margins (ICU: 20C - 23C, OT: 18C - 22C). All out-of-bracket requests are rejected at the FastAPI core."
    ]
    
    pdf.set_font('Helvetica', '', 10)
    for pt in safety_points:
        pdf.multi_cell(180, 5, f"- {pt}")
        pdf.ln(2.5)
        
    pdf.ln(4)
    pdf.set_font('Helvetica', 'B', 12)
    pdf.cell(0, 8, 'Occupancy-Aware Automation Rules:', 0, 1, 'L')
    pdf.ln(2)
    
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
    # PAGE 6: DATABASE SCHEMA & INSTALLATION GUIDE
    # ----------------------------------------------------
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 18)
    pdf.cell(0, 10, '5. Schema Specifications & Local Installation', 0, 1, 'L')
    pdf.ln(4)
    
    pdf.set_font('Helvetica', 'B', 12)
    pdf.cell(0, 8, 'SQLAlchemy Database Schema Overview:', 0, 1, 'L')
    pdf.ln(2)
    
    schema_txt = (
        "SHEMS uses MySQL 8.0 (with a local zero-dependency SQLite fallback) mapped through SQLAlchemy:\n"
        "  * users: Admin, Energy Manager, and HVAC Tech accounts.\n"
        "  * settings: Toggles for BESS shaving, occupancy audits, and HVAC target variables.\n"
        "  * energy_readings: Log table tracking grid imports, solar generation, and carbon metrics.\n"
        "  * equipment: List of critical, semi-critical, and non-critical assets with runtime and utilization tracking."
    )
    pdf.set_font('Helvetica', '', 10)
    pdf.multi_cell(180, 5, schema_txt)
    pdf.ln(4)
    
    pdf.set_font('Helvetica', 'B', 12)
    pdf.cell(0, 8, 'Local Installation Guide:', 0, 1, 'L')
    pdf.ln(2)
    
    install_txt = (
        "1. Start Backend FastAPI:\n"
        "   $ cd smart-hospital-energy\n"
        "   $ python -m venv venv\n"
        "   $ venv\\Scripts\\activate   # On Windows\n"
        "   $ pip install -r backend/requirements.txt\n"
        "   $ python backend/app.py    # Launches on http://localhost:5000\n\n"
        "2. Start Frontend React:\n"
        "   $ cd frontend\n"
        "   $ npm install\n"
        "   $ npm run build            # Packages assets to backend/dist\n"
        "   $ npm run dev              # Launches hot-reload on http://localhost:5173"
    )
    pdf.set_font('Courier', '', 9.5)
    pdf.multi_cell(180, 5, install_txt)
    
    # Save PDF
    output_path = os.path.join(PROJECT_ROOT, "SHEMS_Documentation.pdf")
    pdf.output(output_path)
    print(f"[INFO] PDF Documentation generated at: {output_path}")

if __name__ == "__main__":
    create_pdf()
