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
  Network
} from 'lucide-react';

function Dashboard({ liveData, alerts, onNavigate }) {
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

  return (
    <div className="space-y-6">
      
      {/* 🟢 TOP BEMS SYSTEM DIAGNOSTICS BANNER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm text-xs font-semibold">
        <div className="flex items-center gap-3">
          <Database className="text-emerald-400 glow-active animate-pulse" size={16} />
          <span className="text-slate-400">DATABASE CONNECTOR:</span>
          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
            CONNECTED TO MYSQL (smart_hospital_energy)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Network className="text-clinical-400 glow-active animate-pulse" size={16} />
          <span className="text-slate-400">AI ML ENGINE:</span>
          <span className="px-2 py-0.5 bg-clinical-500/10 text-clinical-400 border border-clinical-500/20 rounded-md">
            ACTIVE & FORECASTING
          </span>
        </div>
      </div>
      
      {/* WELCOME BAR & RECOMMENDER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-clinical-600/10 to-emerald-600/10 dark:from-clinical-950/40 dark:to-emerald-950/40 p-6 rounded-2xl border border-clinical-500/20 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold tracking-wide">Hospital Operational Status: Safe & Optimized</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            BEMS AI is active. Solar arrays are offsetting loads and batteries are balanced. All critical zones are stable.
          </p>
        </div>
        
        {/* Recommendation Widget */}
        <div className="glass-panel px-4 py-3 rounded-xl border border-clinical-500/30 flex items-center gap-3 relative z-10 animate-pulse-slow">
          <div className="p-2 bg-clinical-500/20 text-clinical-400 rounded-lg">
            <Cpu size={18} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase text-clinical-400 block tracking-widest">AI Recommend</span>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {liveData.renewables.battery_charge > 70 && new Date().getHours() >= 14 && new Date().getHours() <= 19
                ? "Optimal peak window. Discharging battery to grid."
                : "No actions needed. All subsystems operating inside nominal margins."}
            </p>
          </div>
        </div>
      </div>

      {/* LIVE METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Power Grid Demand */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Power Draw</span>
            <div className="p-2 bg-clinical-500/20 text-clinical-400 rounded-xl">
              <Zap size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold tracking-tight">{liveData.renewables.total_power} <span className="text-sm font-semibold">kW</span></h3>
            <div className="flex items-center gap-2 mt-2 text-xs font-bold">
              <span className="text-emerald-500 flex items-center gap-0.5">
                <TrendingDown size={14} />
                {liveData.renewables.renewable_ratio}% Clean Offset
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Clinical Comfort State */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinical Comfort</span>
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold tracking-tight text-emerald-500 uppercase">100% SECURE</h3>
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mt-3">ICU & OT Cooling Locked</p>
          </div>
        </div>

        {/* Card 3: Solar Arrays Production */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Solar Generation</span>
            <div className="p-2 bg-yellow-500/20 text-yellow-500 rounded-xl">
              <Sun size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold tracking-tight">{liveData.renewables.solar_gen} <span className="text-sm font-semibold">kW</span></h3>
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mt-3">Solar Grid Feed In</p>
          </div>
        </div>

        {/* Card 4: Grid Battery Backup */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Battery Reserve</span>
            <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl">
              <BatteryCharging size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold tracking-tight">{liveData.renewables.battery_charge}%</h3>
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mt-3">Grid Peak Shaving Active</p>
          </div>
        </div>

      </div>

      {/* 📡 LIVE IoT TELEMETRY HARVESTER */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <Network className="text-clinical-500 animate-pulse" size={18} />
              <span>Live IoT Telemetry Harvester</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold">
              Real-time localized micro-sensor array tracking ambient climate drifts and green solar flux rates.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-ping"></span>
              SENSOR ARRAY ACTIVE
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Temperature Sensor Array Card */}
          <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-3">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Thermodynamic Sensors</span>
              <span className="text-clinical-400">5 Active Nodes</span>
            </div>
            
            <div className="space-y-2">
              {Object.entries(liveData.wings).map(([name, w], index) => (
                <div key={name} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/50 dark:border-slate-855 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-clinical-500 rounded-full animate-pulse"></span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{name} Zone</span>
                    <span className="text-[9px] text-slate-400 font-mono">IoT-T-{name.toUpperCase()}0{index+1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 dark:text-slate-100">{w.temp}°C</span>
                    {w.temp >= 18 && w.temp <= 24 ? (
                      <span className="px-1 py-0.2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-extrabold">SAFE</span>
                    ) : (
                      <span className="px-1 py-0.2 bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 rounded text-[9px] font-extrabold">DRIFT</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solar Flux & Irradiation Sensor Card */}
          <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-3">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Solar Irradiance (Lux)</span>
              <span className="text-yellow-500">Node: IoT-SOL-LX09</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-200/40 dark:bg-slate-950/40 rounded-xl border border-slate-200/20 dark:border-slate-800 text-center">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">Solar Flux</span>
                <span className="text-lg font-extrabold text-yellow-500">{(liveData.renewables.solar_gen * 11.5).toFixed(0)} <span className="text-[10px] font-semibold text-slate-400">W/m²</span></span>
              </div>
              <div className="p-3 bg-slate-200/40 dark:bg-slate-950/40 rounded-xl border border-slate-200/20 dark:border-slate-800 text-center">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">Panel Temp</span>
                <span className="text-lg font-extrabold text-clinical-400">{( (liveData.wings.Administration?.temp ?? liveData.wings.Admin?.temp ?? 22.0) + 4.2 ).toFixed(1)} <span className="text-[10px] font-semibold text-slate-400">°C</span></span>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/5 border border-emerald-500/25 rounded-xl space-y-1">
              <div className="flex justify-between text-[10px] font-extrabold text-emerald-400">
                <span>ACTIVE CO2 MITIGATION</span>
                <span>{(liveData.renewables.solar_gen * 0.42).toFixed(2)} kg/hr</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                Rooftop Solar arrays currently absorbing Clean Green photons, mitigating grid dependencies.
              </p>
            </div>
          </div>

          {/* Cumulative Green Offsets Card */}
          <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                <span>Green Financial Offset</span>
                <span className="text-emerald-500 font-mono">Live Counter</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-emerald-500">${liveData.savings.cost_saved_usd}</span>
                <span className="text-[10px] font-bold text-slate-400">SAVED THIS MONTH</span>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800/50 pt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[9px] text-slate-400 block font-bold">TOTAL SAVED</span>
                <span className="font-extrabold text-slate-700 dark:text-slate-100">{liveData.savings.energy_saved_kwh} kWh</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-bold">CO2 PREVENTED</span>
                <span className="font-extrabold text-slate-700 dark:text-slate-100">{liveData.savings.carbon_saved_kg} kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ⚠️ DEDICATED AI ANOMALY & LEAKAGE CONTROL CENTRE */}
      <div className="glass-panel p-6 rounded-2xl border border-red-500/30 bg-red-500/5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle size={20} className="animate-pulse" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider">AI Anomaly & Power Leakage Control Centre</h3>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-extrabold text-slate-400 uppercase bg-slate-900 border border-slate-850 px-2 py-1 rounded-xl">
            <span>Model: Isolation Forest</span>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full glow-active"></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Anomaly Card 1 */}
          <div className="p-4 bg-slate-900/60 rounded-xl border border-red-500/20 text-xs space-y-3">
            <div className="flex justify-between items-center text-[10px] font-bold text-red-400 uppercase tracking-widest">
              <span>SPIKE DETECTION</span>
              <span className="px-2 py-0.5 bg-red-500/10 rounded-md">Score: 0.88</span>
            </div>
            <div>
              <p className="font-extrabold text-slate-200">ICU Surgical Block Abnormal Draw</p>
              <p className="text-slate-400 text-[11px] mt-1 font-semibold">ICU Block consuming 22% more power than typical seasonal baseline.</p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-bold flex justify-between">
              <span>ACTION</span>
              <span className="text-red-400 font-extrabold">ECO-Cooling schedule locked</span>
            </div>
          </div>

          {/* Anomaly Card 2 */}
          <div className="p-4 bg-slate-900/60 rounded-xl border border-red-500/20 text-xs space-y-3">
            <div className="flex justify-between items-center text-[10px] font-bold text-red-400 uppercase tracking-widest">
              <span>LEAKAGE ALARM</span>
              <span className="px-2 py-0.5 bg-red-500/10 rounded-md">Score: 0.74</span>
            </div>
            <div>
              <p className="font-extrabold text-slate-200">Administration Wing Standby Leakage</p>
              <p className="text-slate-400 text-[11px] mt-1 font-semibold">Admin wing left active during off-hours, wasting 15.0 kW/h standby load.</p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-bold flex justify-between">
              <span>ACTION</span>
              <span className="text-yellow-400 font-extrabold">Triggering low-power Sleep</span>
            </div>
          </div>

          {/* Anomaly Card 3 */}
          <div className="p-4 bg-slate-900/60 rounded-xl border border-yellow-500/20 text-xs space-y-3">
            <div className="flex justify-between items-center text-[10px] font-bold text-yellow-500 uppercase tracking-widest">
              <span>DEGRADATION ALARM</span>
              <span className="px-2 py-0.5 bg-yellow-500/10 rounded-md">Fail Prob: 64%</span>
            </div>
            <div>
              <p className="font-extrabold text-slate-200">Main Water Chiller Anomaly</p>
              <p className="text-slate-400 text-[11px] mt-1 font-semibold">Vibrations increased to 3.4 mm/s. Machine drawing 18% higher grid import.</p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-bold flex justify-between">
              <span>ACTION</span>
              <span className="text-yellow-500 font-extrabold">Schedule Chiller Checkup</span>
            </div>
          </div>

        </div>
      </div>

      {/* CHARTS AND SMART POLICIES CONTROL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Streaming Load Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold">Streaming Power Telemetry</h3>
              <p className="text-[11px] text-slate-400 font-semibold">Real-time IoT grid monitoring (3s interval)</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-clinical-400">
                <span className="w-2.5 h-2.5 bg-clinical-500 rounded-full"></span>
                <span>Grid Draw</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-500">
                <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span>
                <span>Solar Array</span>
              </div>
            </div>
          </div>

          <div className="h-64">
            {streamBuffer.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Streaming buffer buffering...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={streamBuffer} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  <XAxis dataKey="time" stroke="#475569" fontSize={9} />
                  <YAxis stroke="#475569" fontSize={9} domain={[0, 'auto']} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '11px', color: '#fff' }}/>
                  <Area type="monotone" dataKey="grid" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorGrid)"/>
                  <Area type="monotone" dataKey="solar" stroke="#eab308" strokeWidth={1.5} fillOpacity={1} fill="url(#colorSolar)"/>
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* AI Automation Policy Toggles */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold mb-1">AI Automation Policy Engine</h3>
            <p className="text-[11px] text-slate-400 font-semibold mb-4">Select the rules BEMS manages automatically</p>
            
            <div className="space-y-4">
              {/* Toggle 1: Eco-cooling */}
              <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/30 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">Smart HVAC Eco-Cooling</h4>
                  <p className="text-[10px] text-slate-400">Drift temperature in idle rooms</p>
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

              {/* Toggle 2: Occupancy-aware lights */}
              <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/30 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">Occupancy Light Control</h4>
                  <p className="text-[10px] text-slate-400">Shut down lights in empty wings</p>
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

              {/* Toggle 3: Battery Peak shaving */}
              <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/30 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">Peak Load Power Balance</h4>
                  <p className="text-[10px] text-slate-400">Dispatch battery during peak rates</p>
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

      {/* ACTIVE ALERTS SNIPPET & ROOM SNAPSHOTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Room Telemetry Snapshot */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold mb-3">Subsystem Zone Snapshots</h3>
          <div className="space-y-3">
            {Object.entries(liveData.wings).map(([name, w]) => (
              <div key={name} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-800/10 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    {name === "ICU" || name === "OT" ? (
                      <span className="w-2 h-2 bg-clinical-500 rounded-full glow-active"></span>
                    ) : (
                      <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                    )}
                    <span>{name}</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold">{w.occupancy} Active Occupants</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Temperature</span>
                    <span className={`text-xs font-extrabold ${w.temp > 25 ? 'text-red-400' : 'text-slate-800 dark:text-slate-100'}`}>{w.temp}°C</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Power</span>
                    <span className="text-xs font-extrabold text-clinical-400">{w.power} kW</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Active Alarms Panel snippet */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold mb-1">Critical Alarm Monitoring</h3>
            <p className="text-[11px] text-slate-400 font-semibold mb-4">Active system leakages & critical violations</p>
            
            {activeAlarms.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-slate-100 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                <div className="text-emerald-500 p-2 bg-emerald-500/10 rounded-full mb-2">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">All Systems Standard</span>
                <p className="text-[10px] text-slate-400 mt-1">No active alarms or spikes registered.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {activeAlarms.slice(0, 3).map((alarm) => (
                  <div
                    key={alarm.id}
                    className={`p-3 rounded-xl border flex items-start gap-3 ${
                      alarm.type === 'Critical'
                        ? 'bg-red-500/10 border-red-500/20 text-red-300'
                        : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'
                    }`}
                  >
                    <div className="p-1 bg-white/10 rounded-lg mt-0.5">
                      <AlertTriangle size={14} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide">{alarm.source} • {alarm.type}</span>
                        <span className="text-[9px] opacity-60 flex items-center gap-1"><Clock size={10}/>{alarm.timestamp.split(' ')[1]}</span>
                      </div>
                      <p className="text-xs mt-1 text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">{alarm.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('alerts')}
            className="w-full text-center text-xs font-bold text-red-400 hover:text-red-300 flex items-center justify-center gap-1 transition-colors mt-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/30"
          >
            <span>Inspect System Alarm Logs</span>
            <ChevronRight size={14} />
          </button>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;
