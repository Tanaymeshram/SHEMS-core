import React, { useState } from 'react';
import { api } from '../services/api';
import {
  UploadCloud,
  FileSpreadsheet,
  Cpu,
  Database,
  CheckCircle,
  AlertTriangle,
  Play,
  ToggleLeft,
  Settings,
  Activity,
  Server,
  Network,
  Wifi,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Flame,
  BatteryCharging
} from 'lucide-react';

function DataIngestion({ liveData }) {
  const [selectedMode, setSelectedMode] = useState(null);
  const [activeIntegration, setActiveIntegration] = useState('Modbus');
  
  const [csvText, setCsvText] = useState(
    `Timestamp,Total Power (kW),ICU Wing Draw (kW),OT Surgical Draw (kW),Solar Generation (kW),Battery Status (%),Grid Import (kW),Carbon Emitted (kg CO2)\n${
      new Date().toISOString().split('T')[0]
    } 14:00:00,125.4,26.2,45.8,25.0,75.0,75.4,31.6`
  );
  
  // Mode 1: Infrastructure Manual Entry Fields
  const [infraForm, setInfraForm] = useState({
    smart_energy_meter_kw: 120.0,
    hvac_load_kw: 42.0,
    bms_draw_kw: 28.5,
    solar_inverter_kw: 22.0,
    generator_power_kw: 0.0,
    generator_fuel_percentage: 95.0,
    ups_battery_charge_percentage: 85.0
  });

  // Mode 2: IoT Sensor Entry Fields (Simulated ESP32)
  const [sensorNode, setSensorNode] = useState({
    room: 'General Wards',
    temperature: 23.5,
    humidity: 50.0,
    air_quality: 45.0,
    lux: 250.0,
    pir_motion: 1, // 0 = No Motion, 1 = Motion Detected
    occupancy_count: 24,
    current: 12.0,
    voltage: 220.0,
    solar_irradiance: 400.0,
    battery_percentage: 75.0,
    vibration: 1.8,
    core_temperature: 55.0,
    lights_status: 1,
    hvac_status: 1
  });

  // Mode 3: Hybrid Ingress mapping configuration
  const [hybridMapping, setHybridMapping] = useState({
    hvac: 'infra', // 'infra' (Existing System) or 'iot' (IoT Sensor)
    solar: 'infra', // 'infra' (Existing Inverter) or 'iot' (Solar Irradiance)
    occupancy: 'iot', // 'infra' (BMS Attendance Log) or 'iot' (PIR/Camera Sensor)
    air_quality: 'iot', // 'infra' (Central System Filter) or 'iot' (IoT Sensor)
    equipment: 'iot' // 'infra' (Modbus Controller) or 'iot' (Vibration Sensor)
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync mode with database setting state
  const currentMode = selectedMode !== null ? selectedMode : (liveData?.data_collection_mode || 3);

  const handleModeChange = async (modeVal) => {
    setSelectedMode(modeVal);
    setMessage('');
    setError('');
    setSubmitting(true);
    try {
      const res = await api.toggleAutomation('data_collection_mode', modeVal.toString());
      setMessage(`Data ingestion active profile switched to Mode ${modeVal} successfully.`);
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to switch data collection mode.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCsvIngest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const res = await api.uploadCsvData(csvText);
      setMessage(res.message || 'CSV audit records parsed and logged successfully.');
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to ingest CSV records.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInfraIngest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        integration_protocol: activeIntegration,
        ...infraForm
      };
      const res = await api.ingestInfra(payload);
      setMessage(res.message || `Infrastructure telemetry parsed and written to DB via ${activeIntegration}.`);
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to transmit infrastructure parameters.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSensorIngest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const res = await api.sendSimulatedSensor(sensorNode);
      setMessage(res.message || 'ESP32 MQTT telemetry payload transmitted over broker.');
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to process ESP32 payload.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInfraValueChange = (field, val) => {
    setInfraForm(prev => ({
      ...prev,
      [field]: parseFloat(val) || 0
    }));
  };

  const handleSensorValueChange = (field, val) => {
    setSensorNode(prev => ({
      ...prev,
      [field]: field === 'room' 
        ? val 
        : ['lights_status', 'hvac_status', 'pir_motion', 'occupancy_count'].includes(field)
          ? parseInt(val)
          : (parseFloat(val) || 0)
    }));
  };

  const toggleMapping = (key) => {
    setHybridMapping(prev => ({
      ...prev,
      [key]: prev[key] === 'infra' ? 'iot' : 'infra'
    }));
  };

  // Calculate read-only smart meter load for IoT Node (Current * Voltage * sqrt(3) / 1000 for 3-phase, or simple V*I/1000)
  const calculatedIotKw = ((sensorNode.current * sensorNode.voltage) / 1000).toFixed(2);

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-wide flex items-center gap-2">
            <UploadCloud className="text-clinical-500" />
            <span>SHEMS Data Collection & Ingestion Center</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Configure data ingestion modes, route clinical telemetry parameters, and simulate physical infrastructure or IoT sensor feeds.
          </p>
        </div>
        
        <div className={`px-4 py-2 bg-slate-900 border rounded-2xl text-xs font-semibold text-center ${
          currentMode === 1 
            ? 'border-cyan-500/20 text-cyan-400' 
            : currentMode === 2 
              ? 'border-purple-500/20 text-purple-400' 
              : 'border-emerald-500/20 text-emerald-400'
        }`}>
          <span className="text-[10px] text-slate-500 block uppercase tracking-widest font-extrabold mb-0.5">Active Ingestion Profile</span>
          {currentMode === 1 
            ? "Mode 1: Infrastructure Integration" 
            : currentMode === 2 
              ? "Mode 2: ESP32 IoT Sensors Link" 
              : "Mode 3: Combined Hybrid Mixer"}
        </div>
      </div>

      {/* ALERTS */}
      {message && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 animate-pulse"><CheckCircle size={14}/>{message}</div>}
      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2"><AlertTriangle size={14}/>{error}</div>}

      {/* STEP 1: ACTIVE MODE SELECTOR (SEGMENTED CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            id: 1,
            title: "MODE 1: INFRASTRUCTURE MODE",
            icon: Database,
            color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-500/40",
            activeColor: "ring-2 ring-cyan-500 border-cyan-500/60 bg-cyan-500/10",
            desc: "Direct integration with central hospital facilities, generators, utility grid, and BEMS database.",
            specs: "Collects: HVAC load, BMS Draw, Smart Energy Meter, Solar Inverter, Emergency Gen, Critical UPS backups."
          },
          {
            id: 2,
            title: "MODE 2: IoT SENSOR MODE",
            icon: Cpu,
            color: "text-purple-400 border-purple-500/20 bg-purple-500/5 hover:border-purple-500/40",
            activeColor: "ring-2 ring-purple-500 border-purple-500/60 bg-purple-500/10",
            desc: "Wireless mesh architecture deploying Room/Equipment Microcontrollers directly to Wards and ICU blocks.",
            specs: "Collects: Temp, Humidity, AQI, Lux, PIR Motion, Camera Headcounts, Current/Voltage, Solar Irradiance, Battery SOC."
          },
          {
            id: 3,
            title: "MODE 3: HYBRID MODE",
            icon: Activity,
            color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40",
            activeColor: "ring-2 ring-emerald-500 border-emerald-500/60 bg-emerald-500/10",
            desc: "Optimized commercial mixing routing. Maps parameters dynamically between infrastructure and IoT room nodes.",
            specs: "Example: HVAC (Infra) + Solar (Inverter) + Occupancy (IoT PIR Sensor) + Equipment (IoT Vibration)."
          }
        ].map((mode) => {
          const IconComponent = mode.icon;
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              disabled={submitting}
              className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 relative overflow-hidden group ${
                isActive ? mode.activeColor : mode.color
              }`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none"></div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 ${isActive ? 'text-white' : ''}`}>
                    <IconComponent size={20} />
                  </div>
                  {isActive && (
                    <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase bg-emerald-500 text-slate-950 rounded-full tracking-wider animate-pulse">
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold tracking-wider">{mode.title}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{mode.desc}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/40 text-[9px] font-semibold text-slate-400 leading-normal">
                <span className="font-extrabold text-white block mb-0.5 uppercase tracking-wide">Data Matrix Scope:</span>
                {mode.specs}
              </div>
            </button>
          );
        })}
      </div>

      {/* MODE 3: HYBRID SOURCE ROUTER MIXER */}
      {currentMode === 3 && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="text-emerald-400 animate-spin-slow" size={16} />
            <h3 className="text-sm font-bold text-emerald-400">Hybrid Telemetry Ingress Router</h3>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
            Define active source links for BEMS automation controls. Set whether signals are acquired from central building utility controllers (BACnet/Modbus) or distributed ESP32 micro-sensors.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2 text-xs font-semibold">
            {[
              { key: 'hvac', label: 'HVAC System', infra: 'Existing Central HVAC', iot: 'ESP32 Room Sensor' },
              { key: 'solar', label: 'Solar Output', infra: 'Existing Inverter', iot: 'Solar Irradiance' },
              { key: 'occupancy', label: 'Occupancy', infra: 'BMS Attendance Log', iot: 'PIR Motion Sensor' },
              { key: 'air_quality', label: 'Air Quality', infra: 'HVAC Duct Filter', iot: 'IoT Air Sensor' },
              { key: 'equipment', label: 'Equipment Health', infra: 'Modbus Engine Audit', iot: 'IoT Vibration Sensor' }
            ].map(m => (
              <div key={m.key} className="p-3 bg-slate-100 dark:bg-slate-800/30 border border-slate-250 dark:border-slate-800/20 rounded-xl flex flex-col justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">{m.label}</span>
                  <span className="text-[9px] text-slate-500 block mt-1">
                    Route: <strong className={hybridMapping[m.key] === 'infra' ? 'text-cyan-400' : 'text-purple-400'}>
                      {hybridMapping[m.key] === 'infra' ? m.infra : m.iot}
                    </strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleMapping(m.key)}
                  className={`py-1 rounded-lg text-[10px] font-bold text-center border transition-all flex items-center justify-center gap-1 ${
                    hybridMapping[m.key] === 'infra'
                      ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                      : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                  }`}
                >
                  <ToggleLeft size={12} className={hybridMapping[m.key] === 'iot' ? 'rotate-180 transition-transform text-purple-400' : 'transition-transform text-cyan-400'} />
                  <span>{hybridMapping[m.key] === 'infra' ? 'Infrastructure' : 'IoT Sensor'}</span>
                </button>
              </div>
            ))}
          </div>

          {/* VISUAL DIAGRAM */}
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] text-slate-400 font-mono">
            <div className="flex flex-col gap-2 w-full md:w-1/3 p-3 bg-slate-950/50 rounded-lg border border-slate-850">
              <span className="text-cyan-400 font-extrabold uppercase border-b border-cyan-500/10 pb-1 flex items-center gap-1.5"><Server size={12}/>Infrastructure Trunk</span>
              <div className="space-y-1">
                <div className={`flex justify-between ${hybridMapping.hvac === 'infra' ? 'text-cyan-300 font-bold' : 'opacity-40'}`}>
                  <span>HVAC System</span><span>→ Modbus</span>
                </div>
                <div className={`flex justify-between ${hybridMapping.solar === 'infra' ? 'text-cyan-300 font-bold' : 'opacity-40'}`}>
                  <span>Solar Inverter</span><span>→ BACnet</span>
                </div>
                <div className={`flex justify-between ${hybridMapping.occupancy === 'infra' ? 'text-cyan-300 font-bold' : 'opacity-40'}`}>
                  <span>BMS Access Logs</span><span>→ REST API</span>
                </div>
                <div className={`flex justify-between ${hybridMapping.air_quality === 'infra' ? 'text-cyan-300 font-bold' : 'opacity-40'}`}>
                  <span>HVAC Air Filters</span><span>→ Modbus</span>
                </div>
                <div className={`flex justify-between ${hybridMapping.equipment === 'infra' ? 'text-cyan-300 font-bold' : 'opacity-40'}`}>
                  <span>Chiller Modbus</span><span>→ REST API</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <Network size={20} className="text-slate-500 mb-1" />
              <ChevronRight className="rotate-90 md:rotate-0 text-slate-600 hidden md:block" />
              <span className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500">BEMS CORE AGENT</span>
            </div>

            <div className="flex flex-col gap-2 w-full md:w-1/3 p-3 bg-slate-950/50 rounded-lg border border-slate-850">
              <span className="text-purple-400 font-extrabold uppercase border-b border-purple-500/10 pb-1 flex items-center gap-1.5"><Cpu size={12}/>ESP32 WiFi Node Grid</span>
              <div className="space-y-1">
                <div className={`flex justify-between ${hybridMapping.hvac === 'iot' ? 'text-purple-300 font-bold' : 'opacity-40'}`}>
                  <span>OT Temp / Humid</span><span>→ WiFi/MQTT</span>
                </div>
                <div className={`flex justify-between ${hybridMapping.solar === 'iot' ? 'text-purple-300 font-bold' : 'opacity-40'}`}>
                  <span>Irradiance Sensor</span><span>→ MQTT</span>
                </div>
                <div className={`flex justify-between ${hybridMapping.occupancy === 'iot' ? 'text-purple-300 font-bold' : 'opacity-40'}`}>
                  <span>PIR & Headcount</span><span>→ WiFi/MQTT</span>
                </div>
                <div className={`flex justify-between ${hybridMapping.air_quality === 'iot' ? 'text-purple-300 font-bold' : 'opacity-40'}`}>
                  <span>Room Air Quality</span><span>→ MQTT</span>
                </div>
                <div className={`flex justify-between ${hybridMapping.equipment === 'iot' ? 'text-purple-300 font-bold' : 'opacity-40'}`}>
                  <span>Vibration Logger</span><span>→ WiFi/MQTT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CORE WORKSPACE ENTRY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PANEL 1: INFRASTRUCTURE WORKSPACE */}
        {(currentMode === 1 || currentMode === 3) && (
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 relative overflow-hidden">
            
            {/* Top title */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="text-cyan-400 animate-pulse" size={18} />
                <div>
                  <h3 className="text-sm font-bold">Infrastructure Collection Dashboard</h3>
                  <p className="text-[10px] text-slate-400">Direct interface for central utility pipelines</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase bg-cyan-500/10 text-cyan-400 rounded-lg">
                Mode 1 Interface
              </span>
            </div>

            {/* Config: Supported Integrations selector */}
            <div className="bg-slate-150 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-3 rounded-xl space-y-2">
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Active Protocol Integration</label>
              <div className="grid grid-cols-5 gap-1.5 text-[10px] font-bold text-center">
                {['BACnet', 'Modbus', 'REST APIs', 'MQTT', 'CSV Import'].map(proto => (
                  <button
                    key={proto}
                    type="button"
                    onClick={() => setActiveIntegration(proto)}
                    className={`py-1 rounded-lg border transition-all ${
                      activeIntegration === proto
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                        : 'bg-slate-800/40 border-slate-700/30 text-slate-400 hover:bg-slate-850'
                    }`}
                  >
                    {proto}
                  </button>
                ))}
              </div>
            </div>

            {activeIntegration === 'CSV Import' ? (
              /* CSV Upload interface */
              <form onSubmit={handleCsvIngest} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-slate-400">CSV AUDIT SHEET (PASTE ROWS)</label>
                    <span className="text-[9px] font-mono text-cyan-400">Headers: Timestamp, TotalPower, ICU, OT, Solar, Battery...</span>
                  </div>
                  <textarea
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    rows="8"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none text-[10px] font-mono leading-normal dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-750 text-white font-bold rounded-xl transition-all shadow-md text-xs flex items-center justify-center gap-1.5"
                >
                  <FileSpreadsheet size={14} />
                  <span>{submitting ? 'Parsing Data Blocks...' : 'Import Ingress Audit Matrix'}</span>
                </button>
              </form>
            ) : (
              /* System Manual Input fields */
              <form onSubmit={handleInfraIngest} className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                  
                  {/* Smart Energy Meter */}
                  <div className="p-3 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-850 rounded-xl">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Smart Energy Meter</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={infraForm.smart_energy_meter_kw}
                        onChange={(e) => handleInfraValueChange('smart_energy_meter_kw', e.target.value)}
                        className="w-full bg-transparent border-b border-slate-700 focus:outline-none py-0.5 text-sm dark:text-white"
                      />
                      <span className="text-[10px] text-slate-500">kW</span>
                    </div>
                  </div>

                  {/* HVAC System Load */}
                  <div className={`p-3 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-850 rounded-xl transition-all ${
                    currentMode === 3 && hybridMapping.hvac !== 'infra' ? 'opacity-40' : 'ring-1 ring-cyan-500/20'
                  }`}>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">HVAC System Load</label>
                      {currentMode === 3 && (
                        <span className={`text-[8px] px-1 rounded font-bold uppercase ${
                          hybridMapping.hvac === 'infra' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {hybridMapping.hvac === 'infra' ? 'Routed' : 'Bypassed'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={infraForm.hvac_load_kw}
                        onChange={(e) => handleInfraValueChange('hvac_load_kw', e.target.value)}
                        className="w-full bg-transparent border-b border-slate-700 focus:outline-none py-0.5 text-sm dark:text-white"
                        disabled={currentMode === 3 && hybridMapping.hvac !== 'infra'}
                      />
                      <span className="text-[10px] text-slate-500">kW</span>
                    </div>
                  </div>

                  {/* Building Management System */}
                  <div className="p-3 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-850 rounded-xl">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">BMS Aux Draw</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={infraForm.bms_draw_kw}
                        onChange={(e) => handleInfraValueChange('bms_draw_kw', e.target.value)}
                        className="w-full bg-transparent border-b border-slate-700 focus:outline-none py-0.5 text-sm dark:text-white"
                      />
                      <span className="text-[10px] text-slate-500">kW</span>
                    </div>
                  </div>

                  {/* Solar Inverter Output */}
                  <div className={`p-3 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-850 rounded-xl transition-all ${
                    currentMode === 3 && hybridMapping.solar !== 'infra' ? 'opacity-40' : 'ring-1 ring-cyan-500/20'
                  }`}>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Solar Inverter</label>
                      {currentMode === 3 && (
                        <span className={`text-[8px] px-1 rounded font-bold uppercase ${
                          hybridMapping.solar === 'infra' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {hybridMapping.solar === 'infra' ? 'Routed' : 'Bypassed'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={infraForm.solar_inverter_kw}
                        onChange={(e) => handleInfraValueChange('solar_inverter_kw', e.target.value)}
                        className="w-full bg-transparent border-b border-slate-700 focus:outline-none py-0.5 text-sm dark:text-white"
                        disabled={currentMode === 3 && hybridMapping.solar !== 'infra'}
                      />
                      <span className="text-[10px] text-slate-500">kW</span>
                    </div>
                  </div>

                  {/* Generator Output */}
                  <div className={`p-3 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-850 rounded-xl transition-all ${
                    currentMode === 3 && hybridMapping.equipment !== 'infra' ? 'opacity-40' : 'ring-1 ring-cyan-500/20'
                  }`}>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Emergency Generator</label>
                      {currentMode === 3 && (
                        <span className={`text-[8px] px-1 rounded font-bold uppercase ${
                          hybridMapping.equipment === 'infra' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {hybridMapping.equipment === 'infra' ? 'Routed' : 'Bypassed'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <span className="text-[8px] text-slate-500 block uppercase">Load kW</span>
                        <input
                          type="number"
                          step="0.1"
                          value={infraForm.generator_power_kw}
                          onChange={(e) => handleInfraValueChange('generator_power_kw', e.target.value)}
                          className="w-full bg-transparent border-b border-slate-700 focus:outline-none text-xs dark:text-white"
                          disabled={currentMode === 3 && hybridMapping.equipment !== 'infra'}
                        />
                      </div>
                      <div className="w-1/2">
                        <span className="text-[8px] text-slate-500 block uppercase">Fuel %</span>
                        <input
                          type="number"
                          step="1"
                          value={infraForm.generator_fuel_percentage}
                          onChange={(e) => handleInfraValueChange('generator_fuel_percentage', e.target.value)}
                          className="w-full bg-transparent border-b border-slate-700 focus:outline-none text-xs dark:text-white"
                          disabled={currentMode === 3 && hybridMapping.equipment !== 'infra'}
                        />
                      </div>
                    </div>
                  </div>

                  {/* UPS Monitoring */}
                  <div className="p-3 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-850 rounded-xl">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">UPS Backup Battery</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        value={infraForm.ups_battery_charge_percentage}
                        onChange={(e) => handleInfraValueChange('ups_battery_charge_percentage', e.target.value)}
                        className="w-full bg-transparent border-b border-slate-700 focus:outline-none py-0.5 text-sm dark:text-white"
                      />
                      <span className="text-[10px] text-slate-500">%</span>
                    </div>
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-750 text-white font-bold rounded-xl transition-all shadow-md text-xs flex items-center justify-center gap-1.5 mt-2"
                >
                  <Play size={12} />
                  <span>{submitting ? 'Parsing REST Registries...' : `Transmit ${activeIntegration} Ingress`}</span>
                </button>
              </form>
            )}

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/60 font-mono text-[9px] text-slate-400">
              <span className="font-extrabold text-cyan-400 block uppercase mb-1">Endpoint API Specifications</span>
              <code className="block p-2 bg-slate-900 border border-slate-850 rounded-lg select-all overflow-x-auto text-slate-300">
                POST /api/ingestion/infra
              </code>
            </div>

          </div>
        )}

        {/* PANEL 2: IoT SENSORS WORKSPACE */}
        {(currentMode === 2 || currentMode === 3) && (
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 relative overflow-hidden">
            
            {/* Top title */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="text-purple-400 animate-pulse" size={18} />
                <div>
                  <h3 className="text-sm font-bold">ESP32 Telemetry Node Link</h3>
                  <p className="text-[10px] text-slate-400">Emulate room-level micro-sensor mesh packets</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase bg-purple-500/10 text-purple-400 rounded-lg">
                Mode 2 Interface
              </span>
            </div>

            {/* Controller and Com Spec status card */}
            <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative"></div>
                <span>ESP32 controller: active</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Wifi size={12}/>WiFi Link</span>
                <span className="text-purple-400 font-bold uppercase">MQTT Broker</span>
              </div>
            </div>

            <form onSubmit={handleSensorIngest} className="space-y-4">
              
              {/* Node Zone Selector */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Ingestion Target Ward Zone</label>
                <select
                  value={sensorNode.room}
                  onChange={(e) => handleSensorValueChange('room', e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none font-semibold text-xs text-slate-800 dark:text-white"
                >
                  <option value="ICU">ICU Core Block</option>
                  <option value="OT">Operating Theater (OT)</option>
                  <option value="General Wards">General Wards</option>
                  <option value="Outpatient Clinic">Outpatient Clinic</option>
                  <option value="Administration">Administration Wing</option>
                </select>
              </div>

              {/* Categorized Sensors */}
              <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                
                {/* CATEGORY 1: Environment Sensors */}
                <div className="col-span-2 border-b border-slate-800/60 pb-1 mt-1">
                  <span className="text-[9px] font-extrabold text-purple-400 block uppercase">Environment Sensors</span>
                </div>
                
                {/* Temp */}
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-850 rounded-xl">
                  <label className="block text-[8px] text-slate-400 uppercase mb-0.5">Temperature Sensor</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      value={sensorNode.temperature}
                      onChange={(e) => handleSensorValueChange('temperature', e.target.value)}
                      className="w-full bg-transparent border-b border-slate-700 focus:outline-none py-0.5 text-xs dark:text-white"
                    />
                    <span className="text-[9px] text-slate-500">°C</span>
                  </div>
                </div>

                {/* Humidity */}
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-850 rounded-xl">
                  <label className="block text-[8px] text-slate-400 uppercase mb-0.5">Humidity Sensor</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="1"
                      value={sensorNode.humidity}
                      onChange={(e) => handleSensorValueChange('humidity', e.target.value)}
                      className="w-full bg-transparent border-b border-slate-700 focus:outline-none py-0.5 text-xs dark:text-white"
                    />
                    <span className="text-[9px] text-slate-500">%</span>
                  </div>
                </div>

                {/* Air Quality */}
                <div className={`p-2.5 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-850 rounded-xl ${
                  currentMode === 3 && hybridMapping.air_quality !== 'iot' ? 'opacity-40' : ''
                }`}>
                  <div className="flex justify-between items-center mb-0.5">
                    <label className="block text-[8px] text-slate-400 uppercase">Air Quality Sensor</label>
                    {currentMode === 3 && (
                      <span className={`text-[7px] px-1 rounded font-bold uppercase ${
                        hybridMapping.air_quality === 'iot' ? 'bg-purple-500/10 text-purple-450' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {hybridMapping.air_quality === 'iot' ? 'Active' : 'Bypass'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="1"
                      value={sensorNode.air_quality}
                      onChange={(e) => handleSensorValueChange('air_quality', e.target.value)}
                      className="w-full bg-transparent border-b border-slate-700 focus:outline-none py-0.5 text-xs dark:text-white"
                      disabled={currentMode === 3 && hybridMapping.air_quality !== 'iot'}
                    />
                    <span className="text-[9px] text-slate-500">AQI</span>
                  </div>
                </div>

                {/* Lux Sensor */}
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-850 rounded-xl">
                  <label className="block text-[8px] text-slate-400 uppercase mb-0.5">Lux Light Sensor</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="1"
                      value={sensorNode.lux}
                      onChange={(e) => handleSensorValueChange('lux', e.target.value)}
                      className="w-full bg-transparent border-b border-slate-700 focus:outline-none py-0.5 text-xs dark:text-white"
                    />
                    <span className="text-[9px] text-slate-500">lux</span>
                  </div>
                </div>

                {/* CATEGORY 2: Occupancy Sensors */}
                <div className="col-span-2 border-b border-slate-800/60 pb-1 mt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-extrabold text-purple-400 block uppercase">Occupancy Sensors</span>
                    {currentMode === 3 && (
                      <span className={`text-[7px] px-1 rounded font-bold uppercase ${
                        hybridMapping.occupancy === 'iot' ? 'bg-purple-500/10 text-purple-450' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {hybridMapping.occupancy === 'iot' ? 'BEMS Route: IoT' : 'BEMS Route: Attendance Log'}
                      </span>
                    )}
                  </div>
                </div>

                {/* PIR Motion */}
                <div className={`p-2.5 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-850 rounded-xl ${
                  currentMode === 3 && hybridMapping.occupancy !== 'iot' ? 'opacity-40' : ''
                }`}>
                  <label className="block text-[8px] text-slate-400 uppercase mb-1">PIR Motion Sensor</label>
                  <select
                    value={sensorNode.pir_motion}
                    onChange={(e) => handleSensorValueChange('pir_motion', e.target.value)}
                    className="w-full bg-transparent border-b border-slate-700 focus:outline-none py-0.5 text-xs font-semibold text-slate-800 dark:text-white"
                    disabled={currentMode === 3 && hybridMapping.occupancy !== 'iot'}
                  >
                    <option value="1" className="bg-slate-905">Motion Detected</option>
                    <option value="0" className="bg-slate-905">Idle (No Motion)</option>
                  </select>
                </div>

                {/* Camera occupancy headcount */}
                <div className={`p-2.5 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-850 rounded-xl ${
                  currentMode === 3 && hybridMapping.occupancy !== 'iot' ? 'opacity-40' : ''
                }`}>
                  <label className="block text-[8px] text-slate-400 uppercase mb-0.5">Camera Occupancy headcount</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="1"
                      value={sensorNode.occupancy_count}
                      onChange={(e) => handleSensorValueChange('occupancy_count', e.target.value)}
                      className="w-full bg-transparent border-b border-slate-700 focus:outline-none py-0.5 text-xs dark:text-white"
                      disabled={currentMode === 3 && hybridMapping.occupancy !== 'iot'}
                    />
                    <span className="text-[9px] text-slate-500">heads</span>
                  </div>
                </div>

                {/* CATEGORY 3: Energy Sensors */}
                <div className="col-span-2 border-b border-slate-800/60 pb-1 mt-1">
                  <span className="text-[9px] font-extrabold text-purple-400 block uppercase">Energy & Current Sensors</span>
                </div>

                {/* Current */}
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-850 rounded-xl">
                  <label className="block text-[8px] text-slate-400 uppercase mb-0.5">Current Sensor</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      value={sensorNode.current}
                      onChange={(e) => handleSensorValueChange('current', e.target.value)}
                      className="w-full bg-transparent border-b border-slate-700 focus:outline-none py-0.5 text-xs dark:text-white"
                    />
                    <span className="text-[9px] text-slate-500">Amps</span>
                  </div>
                </div>

                {/* Voltage */}
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-850 rounded-xl">
                  <label className="block text-[8px] text-slate-400 uppercase mb-0.5">Voltage Sensor</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="1"
                      value={sensorNode.voltage}
                      onChange={(e) => handleSensorValueChange('voltage', e.target.value)}
                      className="w-full bg-transparent border-b border-slate-700 focus:outline-none py-0.5 text-xs dark:text-white"
                    />
                    <span className="text-[9px] text-slate-500">V</span>
                  </div>
                </div>

                {/* Calculated Smart Power Meter */}
                <div className="col-span-2 p-2.5 bg-purple-500/5 border border-purple-500/10 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-purple-300 block uppercase">Smart Power Meter (Calculated)</span>
                    <span className="text-[8px] text-slate-400">Formulated dynamically from simulated Volts & Amps</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-purple-300">{calculatedIotKw}</span>
                    <span className="text-[9px] text-slate-400 ml-1">kW</span>
                  </div>
                </div>

                {/* CATEGORY 4: Renewable Sensors */}
                <div className="col-span-2 border-b border-slate-800/60 pb-1 mt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-extrabold text-purple-400 block uppercase">Renewable Energy Sensors</span>
                    {currentMode === 3 && (
                      <span className={`text-[7px] px-1 rounded font-bold uppercase ${
                        hybridMapping.solar === 'iot' ? 'bg-purple-500/10 text-purple-450' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {hybridMapping.solar === 'iot' ? 'BEMS Solar: Irradiance' : 'BEMS Solar: Inverter'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Solar Irradiance */}
                <div className={`p-2.5 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-850 rounded-xl ${
                  currentMode === 3 && hybridMapping.solar !== 'iot' ? 'opacity-40' : ''
                }`}>
                  <label className="block text-[8px] text-slate-400 uppercase mb-0.5">Solar Irradiance Sensor</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="10"
                      value={sensorNode.solar_irradiance}
                      onChange={(e) => handleSensorValueChange('solar_irradiance', e.target.value)}
                      className="w-full bg-transparent border-b border-slate-700 focus:outline-none py-0.5 text-xs dark:text-white"
                      disabled={currentMode === 3 && hybridMapping.solar !== 'iot'}
                    />
                    <span className="text-[9px] text-slate-500">W/m²</span>
                  </div>
                </div>

                {/* Battery SOC */}
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-850 rounded-xl">
                  <label className="block text-[8px] text-slate-400 uppercase mb-0.5">Battery Monitoring Sensor (SOC)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.5"
                      value={sensorNode.battery_percentage}
                      onChange={(e) => handleSensorValueChange('battery_percentage', e.target.value)}
                      className="w-full bg-transparent border-b border-slate-700 focus:outline-none py-0.5 text-xs dark:text-white"
                    />
                    <span className="text-[9px] text-slate-500">%</span>
                  </div>
                </div>

                {/* CATEGORY 5: Equipment Health Sensors */}
                <div className="col-span-2 border-b border-slate-800/60 pb-1 mt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-extrabold text-purple-400 block uppercase">Equipment Health Sensors (Chiller)</span>
                    {currentMode === 3 && (
                      <span className={`text-[7px] px-1 rounded font-bold uppercase ${
                        hybridMapping.equipment === 'iot' ? 'bg-purple-500/10 text-purple-450' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {hybridMapping.equipment === 'iot' ? 'BEMS: IoT Vibration' : 'BEMS: Modbus Audit'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Vibration */}
                <div className={`p-2.5 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-850 rounded-xl ${
                  currentMode === 3 && hybridMapping.equipment !== 'iot' ? 'opacity-40' : ''
                }`}>
                  <label className="block text-[8px] text-slate-400 uppercase mb-0.5">Vibration Sensor</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.01"
                      value={sensorNode.vibration}
                      onChange={(e) => handleSensorValueChange('vibration', e.target.value)}
                      className="w-full bg-transparent border-b border-slate-700 focus:outline-none py-0.5 text-xs dark:text-white"
                      disabled={currentMode === 3 && hybridMapping.equipment !== 'iot'}
                    />
                    <span className="text-[9px] text-slate-500">mm/s</span>
                  </div>
                </div>

                {/* Equipment core temperature */}
                <div className={`p-2.5 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-850 rounded-xl ${
                  currentMode === 3 && hybridMapping.equipment !== 'iot' ? 'opacity-40' : ''
                }`}>
                  <label className="block text-[8px] text-slate-400 uppercase mb-0.5">Temperature Sensor (Core)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.5"
                      value={sensorNode.core_temperature}
                      onChange={(e) => handleSensorValueChange('core_temperature', e.target.value)}
                      className="w-full bg-transparent border-b border-slate-700 focus:outline-none py-0.5 text-xs dark:text-white"
                      disabled={currentMode === 3 && hybridMapping.equipment !== 'iot'}
                    />
                    <span className="text-[9px] text-slate-500">°C</span>
                  </div>
                </div>

                {/* Interactive controller outputs */}
                <div className="col-span-2 border-t border-slate-800/60 pt-2 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[8px] text-slate-400 uppercase mb-1">Lights Control Link</label>
                    <select
                      value={sensorNode.lights_status}
                      onChange={(e) => handleSensorValueChange('lights_status', e.target.value)}
                      className="w-full bg-transparent border-b border-slate-700 focus:outline-none py-0.5 text-xs font-semibold text-slate-850 dark:text-white"
                    >
                      <option value="1">Active (ON)</option>
                      <option value="0">Idle (OFF)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] text-slate-400 uppercase mb-1">AC Compressor Link</label>
                    <select
                      value={sensorNode.hvac_status}
                      onChange={(e) => handleSensorValueChange('hvac_status', e.target.value)}
                      className="w-full bg-transparent border-b border-slate-700 focus:outline-none py-0.5 text-xs font-semibold text-slate-850 dark:text-white"
                      disabled={sensorNode.room === 'ICU' || sensorNode.room === 'OT'}
                    >
                      {sensorNode.room === 'ICU' || sensorNode.room === 'OT' ? (
                        <option value="2">Safety Locked Comfort</option>
                      ) : (
                        <>
                          <option value="2">Comfort Mode (High)</option>
                          <option value="1">ECO Mode (Low)</option>
                          <option value="0">AC Turned OFF</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-750 text-white font-bold rounded-xl transition-all shadow-md text-xs flex items-center justify-center gap-1.5 border border-purple-500/20 mt-2"
              >
                <Play size={12} />
                <span>{submitting ? 'Transmitting WiFi Telemetry...' : 'Transmit ESP32 MQTT Payload'}</span>
              </button>
            </form>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/60 font-mono text-[9px] text-slate-400">
              <span className="font-extrabold text-purple-400 block uppercase mb-1">MQTT Publish Registry</span>
              <code className="block p-2 bg-slate-900 border border-slate-850 rounded-lg select-all overflow-x-auto text-slate-300">
                POST /api/ingestion/sensor
              </code>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}

export default DataIngestion;
