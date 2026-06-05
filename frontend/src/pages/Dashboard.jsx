import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Zap,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Sun,
  BatteryCharging,
  TrendingDown,
  ChevronRight,
  Cpu,
  Clock,
  Database,
  BarChart,
  Network,
  Eye,
  Server,
  DollarSign,
  Leaf,
  Layers,
  Thermometer,
  Wind
} from 'lucide-react';

function Dashboard({ liveData, alerts, onNavigate }) {
  const [activeTab, setActiveTab] = useState('executive'); // 'executive' or 'twin'
  const [selectedTwinRoom, setSelectedTwinRoom] = useState('ICU');
  const [streamBuffer, setStreamBuffer] = useState([]);
  
  // Handle streaming chart data buffering
  useEffect(() => {
    if (!liveData) return;
    
    setStreamBuffer(prev => {
      const nowStr = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const currentVal = {
        time: nowStr,
        power: liveData.renewables.total_power,
        solar: liveData.renewables.solar_gen,
        grid: liveData.renewables.grid_import
      };
      
      const newBuffer = [...prev, currentVal];
      if (newBuffer.length > 10) {
        newBuffer.shift(); // keep last 10 points
      }
      return newBuffer;
    });
  }, [liveData]);

  if (!liveData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="animate-spin-slow text-clinical-500">
          <Activity size={48} />
        </div>
        <p className="text-slate-400 font-semibold animate-pulse text-sm">Synchronizing Clinical Telemetry...</p>
      </div>
    );
  }

  // Active alarms list (unresolved)
  const activeAlarms = alerts.filter(a => !a.resolved);

  // Quick toggle helper
  const handleTogglePolicy = async (key) => {
    try {
      await api.toggleAutomation(key);
    } catch (err) {
      console.error(err);
    }
  };

  // Derive generator status from simulator generator maintenance variables
  const getGeneratorStatus = () => {
    const gen = liveData.maintenance.generator;
    const wingGen = liveData.wings["Generator Room"];
    if (gen.status !== "Healthy") {
      return { label: "ACTIVE", color: "text-red-400 border-red-500/20 bg-red-500/10", load: "45 kW" };
    }
    return { label: "STANDBY", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10", load: "0.2 kW" };
  };

  const genStatus = getGeneratorStatus();

  // Define BEMS Scores
  const sustainabilityScore = Math.min(100, Math.round(40 + (liveData.renewables.renewable_ratio * 0.6))).toString();
  const activeAlertsCount = activeAlarms.length;
  const energyHealthScore = Math.max(70, 100 - (activeAlertsCount * 6)).toString();

  // Digital Twin hospital rooms configuration
  const twinRooms = [
    { id: 'ICU', name: 'ICU Block', type: 'Clinical Zone', desc: 'Critical intensive care suite with high-priority life support ventilator grids.' },
    { id: 'OT', name: 'Operating Theater (OT)', type: 'Clinical Zone', desc: 'Surgical theaters demanding sterile, safety-locked continuous airflow.' },
    { id: 'Wards', name: 'General Wards', type: 'Patient Zone', desc: 'Patient recovery wards governed by occupancy-aware fan/lighting triggers.' },
    { id: 'Laboratories', name: 'Clinical Labs', type: 'Diagnostic Zone', desc: 'Pathology & hematology analysis nodes monitoring analyzer load profiles.' },
    { id: 'MRI Room', name: 'MRI Imaging Suite', type: 'Imaging Zone', desc: 'High-power magnetic resonance imaging scanner grid subject to idle leak alarms.' },
    { id: 'CT Scan Room', name: 'CT Scan Room', type: 'Imaging Zone', desc: 'High-speed tomography imaging systems tracking scanner standby draws.' },
    { id: 'Solar Plant', name: 'Rooftop Solar Plant', type: 'Energy Zone', desc: 'Clean renewable photovoltaic array generating green grid offsets.' },
    { id: 'Battery Storage Room', name: 'Battery Storage (BESS)', type: 'Energy Zone', desc: 'Grid peak-shaving storage bank monitoring battery state-of-charge.' },
    { id: 'Generator Room', name: 'Generator Block', type: 'Energy Zone', desc: 'Emergency generator block monitoring diesel genset engine stats.' },
    { id: 'Research Center', name: 'Research Center', type: 'Research Zone', desc: 'Academic and data research server racks tracking server power draws.' }
  ];

  return (
    <div className="space-y-6">
      
      {/* SYSTEM DIAGNOSTICS & VIEW NAVIGATION */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold w-full md:w-auto">
          <button
            onClick={() => setActiveTab('executive')}
            className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'executive'
                ? 'bg-clinical-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart size={14} />
            <span>Executive Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('twin')}
            className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'twin'
                ? 'bg-clinical-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers size={14} />
            <span>Hospital Digital Twin</span>
          </button>
        </div>

        {/* Database Status */}
        <div className="hidden xl:flex items-center gap-2 text-[10px] font-bold text-slate-500 tracking-wider">
          <Database size={12} className="text-emerald-400" />
          <span>MYSQL REPLICA ACTIVE: C:\Users\Lenovo\.gemini</span>
        </div>

        {/* Data collection modes status */}
        <div className="flex items-center gap-2 text-[10px] font-bold">
          <Cpu size={12} className="text-purple-400" />
          <span className={`px-2 py-0.5 border rounded-md uppercase ${
            liveData.data_collection_mode === 1 
              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
              : liveData.data_collection_mode === 2 
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            {liveData.data_collection_mode === 1 ? 'Mode 1: Infrastructure' : liveData.data_collection_mode === 2 ? 'Mode 2: IoT Grid' : 'Mode 3: Hybrid Mixer'}
          </span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: EXECUTIVE DASHBOARD                                               */}
      {/* ========================================================================= */}
      {activeTab === 'executive' && (
        <div className="space-y-6">
          
          {/* WELCOME BANNER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-clinical-600/10 to-emerald-600/10 dark:from-clinical-950/40 dark:to-emerald-950/40 p-6 rounded-2xl border border-clinical-500/20 shadow-sm">
            <div>
              <h2 className="text-xl font-bold tracking-wide">BEMS Executive Command Overview</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                Real-time energy efficiency metrics, environmental indexes, carbon footprint diagnostics, and grid configurations.
              </p>
            </div>
            
            <div className="glass-panel px-4 py-3 rounded-xl border border-clinical-500/30 flex items-center gap-3 animate-pulse-slow">
              <div className="p-2 bg-clinical-500/20 text-clinical-400 rounded-lg">
                <Cpu size={18} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-clinical-400 block tracking-widest">AI Status Report</span>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {liveData.renewables.battery_charge > 70 && new Date().getHours() >= 14 && new Date().getHours() <= 19
                    ? "Dispatching battery reserves to shave peak utility costs."
                    : "Grid import stable. No action required."}
                </p>
              </div>
            </div>
          </div>

          {/* 11 EXECUTIVE METRIC CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {/* Card 1: Total Energy Consumption */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-250 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Consumption</span>
                <div className="p-2 bg-clinical-500/10 text-clinical-400 rounded-xl"><BarChart size={18} /></div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-extrabold tracking-tight">
                  {(liveData.savings.daily_energy_kwh * 4.2).toFixed(1)} <span className="text-xs font-semibold text-slate-500">kWh</span>
                </h3>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase mt-2">Cumulative daily utility draw</span>
              </div>
            </div>

            {/* Card 2: Current Load */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-250 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Load</span>
                <div className="p-2 bg-clinical-500/10 text-clinical-400 rounded-xl"><Zap size={18} /></div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-extrabold tracking-tight">
                  {liveData.renewables.total_power} <span className="text-xs font-semibold text-slate-500">kW</span>
                </h3>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase mt-2">Active power load draw</span>
              </div>
            </div>

            {/* Card 3: Electricity Cost */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-250 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Electricity Cost</span>
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl"><DollarSign size={18} /></div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-extrabold tracking-tight text-emerald-500">
                  ${(liveData.savings.monthly_cost_usd).toFixed(2)}
                </h3>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase mt-2">Accrued bill this cycle</span>
              </div>
            </div>

            {/* Card 4: Carbon Emissions */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-250 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Carbon Footprint</span>
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl"><Leaf size={18} /></div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-extrabold tracking-tight text-amber-500">
                  {liveData.savings.carbon_kg} <span className="text-xs font-semibold">kg CO₂</span>
                </h3>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase mt-2">Accumulated emissions</span>
              </div>
            </div>

            {/* Card 5: Solar Generation */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-250 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Solar Generation</span>
                <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-xl"><Sun size={18} /></div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-extrabold tracking-tight">
                  {liveData.renewables.solar_gen} <span className="text-xs font-semibold text-slate-500">kW</span>
                </h3>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase mt-2">Solar panel output</span>
              </div>
            </div>

            {/* Card 6: Battery Status */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-250 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Battery Status</span>
                <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl"><BatteryCharging size={18} /></div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-extrabold tracking-tight">
                  {liveData.renewables.battery_charge}%
                </h3>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase mt-2">BESS state-of-charge</span>
              </div>
            </div>

            {/* Card 7: Grid Consumption */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-250 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Grid Consumption</span>
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl"><Server size={18} /></div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-extrabold tracking-tight text-cyan-400">
                  {liveData.renewables.grid_import} <span className="text-xs font-semibold">kW</span>
                </h3>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase mt-2">Active grid utility draw</span>
              </div>
            </div>

            {/* Card 8: Generator Status */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-250 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Generator Status</span>
                <div className="p-2 bg-slate-800 text-slate-400 rounded-xl"><Activity size={18} /></div>
              </div>
              <div className="mt-4">
                <span className={`px-2 py-0.5 border rounded-lg text-xs font-extrabold tracking-wider ${genStatus.color}`}>
                  {genStatus.label}
                </span>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase mt-3">Generator output: {genStatus.load}</span>
              </div>
            </div>

            {/* Card 9: Renewable Energy Percentage */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-250 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Renewable Ratio</span>
                <div className="p-2 bg-clinical-500/10 text-clinical-400 rounded-xl"><TrendingDown size={18} /></div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-extrabold tracking-tight">
                  {liveData.renewables.renewable_ratio}%
                </h3>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase mt-2">Green power load percentage</span>
              </div>
            </div>

            {/* Card 10: Sustainability Score */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-250 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sustainability Score</span>
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl"><ShieldCheck size={18} /></div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-extrabold tracking-tight text-emerald-500">
                  {sustainabilityScore} <span className="text-xs font-semibold text-slate-400">/ 100</span>
                </h3>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase mt-2">BEMS green efficiency rating</span>
              </div>
            </div>

            {/* Card 11: Energy Health Score */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-250 dark:border-slate-800 shadow-sm flex flex-col justify-between col-span-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Energy Health Score</span>
                <div className="p-2 bg-clinical-500/10 text-clinical-400 rounded-xl"><Activity size={18} /></div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-6">
                <div>
                  <h3 className="text-3xl font-extrabold tracking-tight text-clinical-400">
                    {energyHealthScore} <span className="text-xs font-semibold text-slate-500">/ 100</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase mt-2">Grid stability, load balance rating</span>
                </div>
                <div className="w-1/2 bg-slate-900 border border-slate-800 rounded-full h-3 p-0.5 overflow-hidden">
                  <div 
                    className="bg-clinical-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${energyHealthScore}%` }}
                  ></div>
                </div>
              </div>
            </div>

          </div>

          {/* CHARTS AND POLICIES SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Real-Time Load Chart */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold">Streaming Power Telemetry</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Real-time IoT grid monitoring (3s interval)</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-400">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                    <span>Grid Import</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-500">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span>Solar Output</span>
                  </div>
                </div>
              </div>

              <div className="h-64">
                {streamBuffer.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">Telemetry buffers aligning...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={streamBuffer} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorGrid" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#eab308" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)"/>
                      <XAxis dataKey="time" stroke="#475569" fontSize={8} />
                      <YAxis stroke="#475569" fontSize={8} domain={[0, 'auto']} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '10px', color: '#fff' }}/>
                      <Area type="monotone" dataKey="grid" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorGrid)"/>
                      <Area type="monotone" dataKey="solar" stroke="#eab308" strokeWidth={1.5} fillOpacity={1} fill="url(#colorSolar)"/>
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Automation Policies */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold mb-1">AI Automation Policy Engine</h3>
                <p className="text-[10px] text-slate-400 font-semibold mb-4">Enable occupancy-aware grid rules</p>
                
                <div className="space-y-4">
                  {/* Eco-cooling */}
                  <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/30 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">Smart HVAC Eco-Cooling</h4>
                      <p className="text-[9px] text-slate-400">Drift temperature in empty rooms</p>
                    </div>
                    <button
                      onClick={() => handleTogglePolicy('hvac_eco_mode')}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 relative ${
                        liveData.automation_active.hvac_eco_mode ? 'bg-clinical-500' : 'bg-slate-400'
                      }`}
                    >
                      <span className={`w-4.5 h-4.5 rounded-full bg-white block shadow-sm transform transition-transform duration-300 ${
                        liveData.automation_active.hvac_eco_mode ? 'translate-x-4.5' : ''
                      }`}></span>
                    </button>
                  </div>

                  {/* Occupancy-aware lights */}
                  <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/30 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">Occupancy Light Control</h4>
                      <p className="text-[9px] text-slate-400">Shut down lights in empty wings</p>
                    </div>
                    <button
                      onClick={() => handleTogglePolicy('lighting_occupancy_control')}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 relative ${
                        liveData.automation_active.lighting_occupancy_control ? 'bg-clinical-500' : 'bg-slate-400'
                      }`}
                    >
                      <span className={`w-4.5 h-4.5 rounded-full bg-white block shadow-sm transform transition-transform duration-300 ${
                        liveData.automation_active.lighting_occupancy_control ? 'translate-x-4.5' : ''
                      }`}></span>
                    </button>
                  </div>

                  {/* Battery Peak shaving */}
                  <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/30 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">Peak Load Power Balance</h4>
                      <p className="text-[9px] text-slate-400">Dispatch battery during peak rates</p>
                    </div>
                    <button
                      onClick={() => handleTogglePolicy('battery_peak_shaving')}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 relative ${
                        liveData.automation_active.battery_peak_shaving ? 'bg-clinical-500' : 'bg-slate-400'
                      }`}
                    >
                      <span className={`w-4.5 h-4.5 rounded-full bg-white block shadow-sm transform transition-transform duration-300 ${
                        liveData.automation_active.battery_peak_shaving ? 'translate-x-4.5' : ''
                      }`}></span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('settings')}
                className="w-full text-center text-xs font-bold text-clinical-400 flex items-center justify-center gap-1 hover:text-clinical-300 transition-colors mt-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/30"
              >
                <span>Configure All AI Rules</span>
                <ChevronRight size={14} />
              </button>
            </div>

          </div>

          {/* AI ANOMALY DETECTION PANEL */}
          <div className="glass-panel p-6 rounded-2xl border border-red-500/30 bg-red-500/5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle size={20} className="animate-pulse" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider">AI Anomaly & Power Leakage Control Centre</h3>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-extrabold text-slate-400 uppercase bg-slate-900 border border-slate-850 px-2 py-1 rounded-xl">
                <span>Model: Isolation Forest</span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full glow-active"></span>
              </div>
            </div>

            {activeAlarms.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-slate-100 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-350 dark:border-slate-800">
                <ShieldCheck size={28} className="text-emerald-500 mb-2" />
                <span className="text-xs font-bold">Grid Envelopes Stable</span>
                <p className="text-[10px] text-slate-400 mt-0.5">No abnormal voltage drifts or power leakage anomalies detected.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeAlarms.slice(0, 3).map((alarm) => (
                  <div key={alarm.id} className="p-4 bg-slate-900/60 border border-red-500/20 rounded-xl text-xs space-y-3">
                    <div className="flex justify-between items-center text-[9px] font-bold text-red-400 uppercase">
                      <span>{alarm.source} • {alarm.type}</span>
                      <span className="px-1.5 py-0.2 bg-red-500/15 rounded">UNRESOLVED</span>
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-200">{alarm.message}</p>
                      <p className="text-[10px] text-slate-500 mt-1 font-semibold flex items-center gap-1"><Clock size={10}/>Logged: {alarm.timestamp}</p>
                    </div>
                    <button
                      onClick={() => api.resolveAlert(alarm.id)}
                      className="w-full py-1.5 text-center text-[10px] font-bold bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg border border-slate-700/60"
                    >
                      Acknowledge & Force Resolve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: HOSPITAL DIGITAL TWIN DASHBOARD                                    */}
      {/* ========================================================================= */}
      {activeTab === 'twin' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* LEFT: INTERACTIVE HOSPITAL BLUEPRINT LAYOUT (2 Columns) */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm xl:col-span-2 space-y-4">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <Layers className="text-clinical-500" size={18} />
                <span>Interactive Hospital 2D Blueprint Layout</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                Click any sector node or room core below to synchronize telemetry feeds and equipment operations directly.
              </p>
            </div>

            {/* Visual Room Grid representing the floor plan */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {twinRooms.map((room) => {
                const liveRoom = liveData.wings[room.id] || { temp: 22.0, occupancy: 0, power: 0, lights: 0, hvac: 0, air_quality: 40.0 };
                const isSelected = selectedTwinRoom === room.id;
                
                // Styling colors based on zone category
                let borderTheme = "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700";
                let badgeColor = "bg-slate-200 dark:bg-slate-800 text-slate-400";
                
                if (room.type.includes('Clinical')) {
                  borderTheme = isSelected ? "ring-2 ring-red-500 border-red-500/80" : "border-red-500/20 bg-red-500/5 hover:border-red-500/40";
                  badgeColor = "bg-red-500/10 text-red-400";
                } else if (room.type.includes('Energy')) {
                  borderTheme = isSelected ? "ring-2 ring-yellow-500 border-yellow-500/80" : "border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/40";
                  badgeColor = "bg-yellow-500/10 text-yellow-500";
                } else if (room.type.includes('Diagnostic') || room.type.includes('Imaging')) {
                  borderTheme = isSelected ? "ring-2 ring-purple-500 border-purple-500/80" : "border-purple-500/20 bg-purple-500/5 hover:border-purple-500/40";
                  badgeColor = "bg-purple-500/10 text-purple-400";
                } else {
                  borderTheme = isSelected ? "ring-2 ring-clinical-500 border-clinical-500/80" : "border-clinical-500/20 bg-clinical-500/5 hover:border-clinical-500/40";
                  badgeColor = "bg-clinical-500/10 text-clinical-400";
                }

                const isCritAlert = activeAlarms.some(a => a.message.includes(room.id) || a.source === room.id);

                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedTwinRoom(room.id)}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between h-32 transition-all relative overflow-hidden ${
                      borderTheme
                    } ${isSelected ? 'shadow-lg bg-slate-900/10' : 'bg-slate-950/20'}`}
                  >
                    {/* Glowing indicator led */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {isCritAlert ? (
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                      ) : liveRoom.occupancy > 0 ? (
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse glow-active"></span>
                      ) : (
                        <span className="w-2 h-2 bg-slate-600 rounded-full"></span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${badgeColor}`}>
                        {room.type}
                      </span>
                      <h4 className="text-xs font-bold truncate pr-3">{room.name}</h4>
                    </div>

                    {/* Room Stats preview */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-800/30">
                      <span>{liveRoom.temp ? `${liveRoom.temp}°C` : 'N/A'}</span>
                      <span className="font-extrabold text-clinical-450">{liveRoom.power ? `${liveRoom.power} kW` : '0 kW'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: ROOM DETAILS PANEL DISPLAY */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            {(() => {
              const activeRoom = twinRooms.find(r => r.id === selectedTwinRoom);
              const roomState = liveData.wings[selectedTwinRoom] || { temp: 22.0, humidity: 50.0, occupancy: 0, power: 0, lights: 0, hvac: 0, air_quality: 40.0, equipment_status: "Bypass", displays_active: true, non_essential_disabled: false };
              
              if (!activeRoom) return <div className="text-center text-slate-400 py-12">Select a room core map.</div>;

              const isZeroOccSleep = roomState.occupancy === 0 && roomState.lights === 0 && roomState.hvac === 1;

              return (
                <div className="space-y-5 h-full flex flex-col justify-between">
                  
                  {/* Title Header */}
                  <div className="space-y-2 pb-4 border-b border-slate-800/80">
                    <div className="flex justify-between items-start">
                      <h3 className="text-base font-extrabold text-white">{activeRoom.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-lg bg-clinical-500/10 text-clinical-400 text-[9px] font-extrabold uppercase font-mono">
                        Twin Link: active
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">{activeRoom.desc}</p>
                  </div>

                  {/* Core Telemetry metrics details */}
                  <div className="space-y-3">
                    
                    {/* Climate */}
                    <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-850 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Thermometer size={16} className="text-cyan-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Climate Control</span>
                      </div>
                      <div className="text-right text-xs font-bold text-slate-200">
                        <span>Temp: {roomState.temp}°C</span>
                        <span className="mx-2 text-slate-600">|</span>
                        <span>Humid: {roomState.humidity}%</span>
                      </div>
                    </div>

                    {/* Occupants */}
                    <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-850 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-purple-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Zone Occupancy</span>
                      </div>
                      <span className="text-xs font-bold text-slate-200">{roomState.occupancy} active heads</span>
                    </div>

                    {/* Power usage */}
                    <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-850 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Zap size={16} className="text-yellow-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Active Power Draw</span>
                      </div>
                      <span className="text-xs font-bold text-yellow-500">{roomState.power} kW</span>
                    </div>

                    {/* HVAC status */}
                    <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-850 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Wind size={16} className="text-teal-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">HVAC Mode</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        roomState.hvac === 2 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : roomState.hvac === 1 
                            ? 'bg-amber-500/10 text-amber-400' 
                            : 'bg-red-500/10 text-red-400'
                      }`}>
                        {roomState.hvac === 2 ? 'Comfort' : roomState.hvac === 1 ? 'ECO' : 'AC OFF'}
                      </span>
                    </div>

                    {/* Connected assets status */}
                    <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-850 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Cpu size={16} className="text-clinical-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Connected Assets</span>
                      </div>
                      <span className="text-xs font-bold text-clinical-400">
                        {roomState.equipment_status || "Standard"}
                      </span>
                    </div>

                  </div>

                  {/* Operational details (Occupancy aware alerts) */}
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-850 space-y-2 mt-2">
                    <span className="text-[9px] font-extrabold text-slate-400 block uppercase tracking-wider">AI AUTOMATION SUMMARY</span>
                    
                    {isZeroOccSleep ? (
                      <div className="text-[10px] text-amber-400 leading-normal flex items-start gap-1.5 font-bold">
                        <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                        <span>BEMS Occupancy Rule triggered: Zero occupants detected. Lights/Fans turned OFF. Non-essential loads disabled to conserve grid power.</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-emerald-400 leading-normal flex items-start gap-1.5 font-bold">
                        <ShieldCheck size={12} className="mt-0.5 flex-shrink-0" />
                        <span>Room grid fully synchronized. HVAC in normal operation, connected displays active, and clinical safety shield active.</span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })()}
          </div>

        </div>
      )}

    </div>
  );
}

export default Dashboard;
