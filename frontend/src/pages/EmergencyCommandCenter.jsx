import React, { useState } from 'react';
import {
  ShieldAlert,
  Battery,
  Flame,
  Activity,
  AlertOctagon,
  Zap,
  CheckCircle,
  Play,
  Heart
} from 'lucide-react';

function EmergencyCommandCenter({ liveData }) {
  const [loadSheddingActive, setLoadSheddingActive] = useState(false);
  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), message: "ICU Primary Grid connection: NOMINAL." },
    { time: new Date().toLocaleTimeString(), message: "Surgical block backing loops: STANDARD." }
  ]);

  if (!liveData) {
    return <div className="text-center py-12 text-sm text-slate-400">Syncing Emergency Command loops...</div>;
  }

  // Critical values calculations
  const batterySoc = liveData.renewables.battery_charge;
  const isBatteryCritical = batterySoc < 20.0;
  
  // Simulated UPS level (degrades if grid connection has anomalous spikes)
  const upsCharge = batterySoc > 50 ? 94 : Math.round(batterySoc * 1.5);
  const isUpsCritical = upsCharge < 20;

  // Simulated Generator fuel level
  const genFuel = liveData.maintenance.generator.oil > 45 ? 82 : 28;
  const isGenCritical = genFuel < 30;

  const handleTriggerShedding = () => {
    setLoadSheddingActive(true);
    const newLogs = [
      { time: new Date().toLocaleTimeString(), message: "⚡ EMERGENCY COMMAND: LOAD SHEDDING ACTIVE." },
      { time: new Date().toLocaleTimeString(), message: "📴 Shutting down non-critical Admin Wing lights & displays." },
      { time: new Date().toLocaleTimeString(), message: "📉 Outpatient Clinic HVAC switched to standby Eco-Mode." },
      { time: new Date().toLocaleTimeString(), message: "🔋 Redirecting 100% solar and BESS reserves to ICU and OT." },
      ...logs
    ];
    setLogs(newLogs);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-wide flex items-center gap-2">
            <ShieldAlert className="text-red-500 animate-pulse" />
            <span>Clinical Emergency Command Center</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Supervise life-critical backup energy resources, manage load distribution, and activate contingency systems.
          </p>
        </div>

        <div>
          <button
            onClick={handleTriggerShedding}
            disabled={loadSheddingActive}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg ${
              loadSheddingActive
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-600 hover:bg-red-500 text-white animate-bounce-slow'
            }`}
          >
            <Zap size={14} />
            <span>{loadSheddingActive ? "Shedding Plan Active" : "Trigger Emergency Load Shedding"}</span>
          </button>
        </div>
      </div>

      {/* Critical Status Alerts */}
      {(isUpsCritical || isGenCritical || loadSheddingActive) && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
            <AlertOctagon size={16} />
            <span>Active Contingency Warnings</span>
          </div>
          <ul className="text-xs space-y-1 list-disc list-inside text-slate-300">
            {isUpsCritical && <li>ICU UPS battery reserves dropped below 20% critical threshold!</li>}
            {isGenCritical && <li>Emergency generator fuel levels are low. Schedule audit.</li>}
            {loadSheddingActive && <li>Load shedding is active. Comfort cooling in ICU/OT remains priority locked.</li>}
          </ul>
        </div>
      )}

      {/* Grid of Monitors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* ICU Power */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ICU Core Power</span>
            <span className="w-2 h-2 bg-emerald-500 rounded-full glow-active"></span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{liveData.wings.ICU.power} <span className="text-sm font-semibold">kW</span></h3>
            <p className="text-slate-400 text-[9px] font-semibold uppercase tracking-wider mt-1.5 flex items-center gap-1">
              <Heart size={10} className="text-red-500" />
              <span>Life-Support Line: nominal</span>
            </p>
          </div>
        </div>

        {/* Operating Theater Power */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Surgical OT Power</span>
            <span className="w-2 h-2 bg-emerald-500 rounded-full glow-active"></span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{liveData.wings.OT.power} <span className="text-sm font-semibold">kW</span></h3>
            <p className="text-slate-400 text-[9px] font-semibold uppercase tracking-wider mt-1.5 flex items-center gap-1">
              <Activity size={10} className="text-clinical-400" />
              <span>Theater Loops: ACTIVE</span>
            </p>
          </div>
        </div>

        {/* Generator Fuel Level & Diagnostics */}
        <div className={`glass-panel p-5 rounded-2xl border shadow-sm flex flex-col justify-between transition-all duration-300 ${
          isGenCritical ? 'border-red-500/30 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-slate-800 hover:border-slate-700'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Generator System</span>
              <Flame size={14} className={isGenCritical ? 'text-red-400 animate-bounce' : 'text-amber-500'} />
            </div>
            
            <div className="mt-3 flex items-baseline gap-2">
              <h3 className={`text-3xl font-black tracking-tight ${isGenCritical ? 'text-red-400' : 'text-slate-100'}`}>
                {genFuel}%
              </h3>
              <span className="text-[10px] text-slate-400 font-bold">Fuel Level</span>
            </div>

            {/* Generator Diagnostic Grid */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-400 border-t border-slate-800/80 pt-3">
              <div className="space-y-0.5">
                <span className="text-[8px] text-slate-550 block uppercase font-medium">Core Temp</span>
                <span className="text-slate-200">{(liveData.maintenance?.generator?.temp || 72.5).toFixed(1)}°C</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] text-slate-550 block uppercase font-medium">Current Load</span>
                <span className="text-slate-200">
                  {liveData.wings?.["Generator Room"]?.power > 1.0 ? "45%" : "0% (Standby)"}
                </span>
              </div>
              <div className="space-y-0.5 mt-2">
                <span className="text-[8px] text-slate-550 block uppercase font-medium">Accum. Run</span>
                <span className="text-slate-200">125.4 Hrs</span>
              </div>
              <div className="space-y-0.5 mt-2">
                <span className="text-[8px] text-slate-550 block uppercase font-medium">RUL Health</span>
                <span className="text-slate-200">
                  {Math.max(10, Math.round(180 - (liveData.maintenance?.generator?.failure_prob || 8.5) * 2.0))} Days
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-800/40 text-[9px] font-extrabold text-slate-400">
            {isGenCritical ? (
              <span className="text-red-400 animate-pulse uppercase tracking-wider block">⚠️ FUEL CRITICAL: SCHEDULE REFILL</span>
            ) : (
              <span className="text-emerald-450">SYSTEM: ONLINE (STANDBY)</span>
            )}
          </div>
        </div>

        {/* Life-Support UPS & BESS */}
        <div className={`glass-panel p-5 rounded-2xl border shadow-sm flex flex-col justify-between transition-all duration-300 ${
          isUpsCritical ? 'border-red-500/50 bg-red-950/30 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse' : 'border-slate-800 hover:border-slate-700'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">UPS Battery Array</span>
              <Battery size={14} className={isUpsCritical ? 'text-red-400 animate-pulse' : 'text-teal-400'} />
            </div>

            {isUpsCritical && (
              <div className="mt-2 bg-red-500/25 border border-red-500/35 rounded-lg px-2.5 py-1 text-[8px] font-black text-red-300 uppercase tracking-wider animate-pulse">
                🚨 CRITICAL: BESS RESERVES BELOW 20%
              </div>
            )}

            <div className="mt-3 flex items-baseline gap-2">
              <h3 className={`text-3xl font-black tracking-tight ${isUpsCritical ? 'text-red-400' : 'text-slate-100'}`}>
                {upsCharge}%
              </h3>
              <span className="text-[10px] text-slate-400 font-bold">Charge SoC</span>
            </div>

            {/* UPS Diagnostic Grid */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-400 border-t border-slate-800/80 pt-3">
              <div className="space-y-0.5">
                <span className="text-[8px] text-slate-550 block uppercase font-medium">BESS Temp</span>
                <span className="text-slate-200">{(liveData.wings?.["Battery Storage Room"]?.temp || 20.2).toFixed(1)}°C</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] text-slate-550 block uppercase font-medium">BESS Load</span>
                <span className="text-slate-200">12.5%</span>
              </div>
              <div className="space-y-0.5 mt-2">
                <span className="text-[8px] text-slate-550 block uppercase font-medium">Battery SOH</span>
                <span className="text-slate-200">98.0%</span>
              </div>
              <div className="space-y-0.5 mt-2">
                <span className="text-[8px] text-slate-550 block uppercase font-medium">Cells RUL</span>
                <span className="text-slate-200">210 Days</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-800/40 text-[9px] font-extrabold text-slate-450 flex justify-between">
            <span>BACKUP TIME:</span>
            <span className={isUpsCritical ? 'text-red-400 font-black' : 'text-slate-200'}>
              {isUpsCritical ? `${Math.round(upsCharge * 1.6)} Mins` : '2.4 Hours'}
            </span>
          </div>
        </div>

      </div>

      {/* Grid: Actions Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Power routing diagram */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-1 space-y-4">
          <h3 className="text-base font-bold">Priority Grid Routing</h3>
          <p className="text-[11px] text-slate-400 font-semibold">Central BEMS energy dispatcher hierarchy</p>
          
          <div className="space-y-2.5 text-xs font-semibold">
            <div className="flex items-center justify-between p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
              <span>1. Solar Arrays</span>
              <span className="font-extrabold">{liveData.renewables.solar_gen > 0 ? "ON" : "OFF"}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-clinical-500/10 text-clinical-400 border border-clinical-500/20 rounded-xl">
              <span>2. Battery Storage (BESS)</span>
              <span className="font-extrabold">{batterySoc}% SoC</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span>3. Primary Utility Grid</span>
              <span className="font-extrabold">{liveData.renewables.grid_import} kW</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-xl">
              <span>4. Emergency Generator</span>
              <span className="font-extrabold">STANDBY</span>
            </div>
          </div>
        </div>

        {/* Live event logs */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold mb-1">Emergency Operations Log</h3>
            <p className="text-[11px] text-slate-400 font-semibold mb-3">Audit logs from central load balancer</p>
            
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {logs.map((log, index) => (
                <div key={index} className="flex gap-2.5 text-xs py-1 border-b border-slate-200/50 dark:border-slate-800/30 last:border-0 font-mono text-slate-600 dark:text-slate-350">
                  <span className="text-clinical-400 font-bold shrink-0">{log.time}</span>
                  <span className="leading-relaxed">{log.message}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800/60 text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mt-4">
            <CheckCircle size={12} className="text-emerald-500" />
            <span>Automatic safety system supervising ventilator backup reserves.</span>
          </div>
        </div>

      </div>

    </div>
  );
}

export default EmergencyCommandCenter;
