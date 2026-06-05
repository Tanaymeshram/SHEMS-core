import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Sun,
  Battery,
  Zap,
  ArrowRight,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Activity,
  Flame,
  Info
} from 'lucide-react';

function Renewables({ liveData }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      try {
        const data = await api.getSolarForecasts();
        setForecast(data);
      } catch (err) {
        console.error("Failed to load solar forecasts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, []);

  if (!liveData) {
    return <div className="text-center py-12 text-sm text-slate-400">Syncing Microgrid Feeds...</div>;
  }

  const { solar_gen, battery_charge, grid_import, total_power, renewable_ratio } = liveData.renewables;

  // Static specs matching requested examples
  const batteryCapacityKwh = 500;
  const batteryHealthPercent = 98.4;
  
  // Calculate current charge kwh
  const currentChargeKwh = Math.round((battery_charge / 100) * batteryCapacityKwh);
  
  // Derive charging/discharging rate based on live simulation solar gen
  const isCharging = solar_gen > total_power * 0.15;
  const bessFlowRateKw = isCharging 
    ? Math.round(solar_gen * 0.4) 
    : Math.round(total_power * 0.12);

  // Backup hours calculation (e.g. capacity left / current load or default 6h scale)
  const backupHours = Math.max(1.5, parseFloat(((currentChargeKwh) / Math.max(10.0, total_power * 0.2)).toFixed(1)));

  // Mock historical solar/battery tracking curves
  const mockDailyMicrogridData = Array.from({ length: 8 }).map((_, i) => {
    const hr = 8 + i * 2;
    const solarGen = hr >= 18 || hr <= 6 ? 0 : Math.sin((hr - 6) / 12 * Math.PI) * 45.0;
    const batCharge = hr >= 14 && hr <= 19 ? 85 - (hr - 14) * 12 : 45 + (hr - 8) * 6;
    return {
      time: `${hr}:00`,
      solar: parseFloat(solarGen.toFixed(1)),
      battery: parseFloat(Math.min(100, Math.max(10, batCharge)).toFixed(1))
    };
  });

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <Sun className="text-yellow-500 animate-spin-slow" size={28} />
          <span>Renewable Microgrid Command Center</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Monitor rooftop solar arrays, manage Battery Energy Storage Systems (BESS), and audit priority grid routing workflows.
        </p>
      </div>

      {/* Grid: 4 Core Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Solar Panel Indicator */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Solar Power Output</span>
            <Sun size={18} className="text-yellow-500 animate-pulse" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold tracking-tight text-yellow-500">{solar_gen} kW</h3>
            <span className="text-[9px] text-slate-400 font-semibold block uppercase mt-1.5">Efficiency: {solar_gen > 0 ? "19.8%" : "0.0%"}</span>
          </div>
        </div>

        {/* BESS Pack Indicator */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BESS Reserves</span>
            <Battery size={18} className="text-teal-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold tracking-tight text-teal-400">{battery_charge}%</h3>
            <span className="text-[9px] text-slate-400 font-semibold block uppercase mt-1.5">Capacity: {currentChargeKwh} / {batteryCapacityKwh} kWh</span>
          </div>
        </div>

        {/* Grid Import Substation */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grid Import Load</span>
            <Zap size={18} className="text-sky-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold tracking-tight text-sky-400">{grid_import} kW</h3>
            <span className="text-[9px] text-slate-400 font-semibold block uppercase mt-1.5">Substation import line</span>
          </div>
        </div>

        {/* Renewable Energy Percentage */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clean Energy Ratio</span>
            <TrendingUp size={18} className="text-emerald-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold tracking-tight text-emerald-500">{renewable_ratio}%</h3>
            <span className="text-[9px] text-slate-400 font-semibold block uppercase mt-1.5">Hospital net green share</span>
          </div>
        </div>

      </div>

      {/* Columns: BESS Details, AI Forecast & Priority Energy Routing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: BESS Spec & Solar Forecasting */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* BESS Pack Specifications */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
              <Battery size={16} />
              <span>BESS Pack Diagnostics</span>
            </h3>
            
            <div className="divide-y divide-slate-850 text-xs font-semibold text-slate-400 space-y-3">
              <div className="flex justify-between items-center py-2.5">
                <span>Total Capacity</span>
                <span className="text-slate-200 font-extrabold">{batteryCapacityKwh} kWh</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span>BESS Health (SOH)</span>
                <span className="text-emerald-500 font-extrabold">{batteryHealthPercent}%</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span>Active Flow Rate</span>
                <span className={`font-extrabold ${isCharging ? 'text-teal-400 animate-pulse' : 'text-slate-300'}`}>
                  {isCharging ? `Charging (+${bessFlowRateKw} kW)` : `Discharging (-${bessFlowRateKw} kW)`}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span>Autonomy Backup Time</span>
                <span className="text-teal-400 font-extrabold">{backupHours} Hours</span>
              </div>
            </div>
            
            {/* Example detail display matching prompt */}
            <div className="p-3 bg-teal-950/15 border border-teal-500/10 rounded-xl text-[10px] text-slate-400 leading-normal flex items-start gap-2">
              <Info size={14} className="text-teal-400 shrink-0 mt-0.5" />
              <p>
                <strong>BESS configuration:</strong> Excess solar output is dynamically shunted to battery storage racks to prevent line grid feedback wastage.
              </p>
            </div>
          </div>

          {/* AI Solar Forecasting */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} />
              <span>AI Solar Projections</span>
            </h3>

            {forecast ? (
              <div className="space-y-4 text-xs font-semibold text-slate-400">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block tracking-wider">Expected Tomorrow Gen</span>
                  <span className="text-xl font-extrabold text-yellow-500">{forecast.tomorrow_generation_kwh} kWh</span>
                </div>

                <div className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl space-y-2">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>BEST CHARGING SLOT</span>
                    <span className="text-teal-400">{forecast.best_charging_time}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>DISCHARGING OFFSET</span>
                    <span className="text-yellow-500">{forecast.best_discharging_time}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-850 text-[10px] text-slate-400 flex items-start gap-2 leading-relaxed">
                  <Info size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                  <p>
                    AI recommends charging BESS cells from <strong>11:00 AM to 3:00 PM</strong> tomorrow to maximize capture during peak irradiance.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-400">Loading AI Projections...</div>
            )}
          </div>

        </div>

        {/* Right Column: Smart Energy Routing Priority Engine (Flow Visualizer) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-md lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="text-emerald-400" size={16} />
              <h3 className="text-sm font-bold uppercase tracking-wider">Smart Energy Routing Engine</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold">ROUTING: AUTOMATIC</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-semibold">
            BEMS monitors real-time solar loads and battery charges. Power is routed continuously based on our priority dispatch tree:
          </p>

          {/* Interactive Routing Flow Visualizer */}
          <div className="space-y-3.5 pt-2">
            
            {/* Priority 1: Solar */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors ${
              solar_gen > 5.0
                ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.05)]'
                : 'bg-slate-950/80 border-slate-900 text-slate-500'
            }`}>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full border border-yellow-500/30 text-xs font-black flex items-center justify-center bg-slate-900 shrink-0">1</span>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider">Priority 1: Solar Arrays</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Primary grid load offsetting source during day</p>
                </div>
              </div>
              <div className="text-right text-[10px] font-bold">
                {solar_gen > 5.0 ? (
                  <span className="px-2 py-0.5 bg-yellow-500/15 rounded-md uppercase tracking-wider animate-pulse">
                    Active Load Ingress: {solar_gen} kW
                  </span>
                ) : (
                  <span className="text-slate-500">Standby (Nightmode)</span>
                )}
              </div>
            </div>

            {/* Priority 2: Battery Storage */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors ${
              solar_gen <= 5.0 && battery_charge > 20.0
                ? 'bg-teal-500/10 border-teal-500/40 text-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.05)]'
                : 'bg-slate-950/80 border-slate-900 text-slate-500'
            }`}>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full border border-teal-500/30 text-xs font-black flex items-center justify-center bg-slate-900 shrink-0">2</span>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider">Priority 2: Battery Storage (BESS)</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Peak-shaving reserve, active on daytime excesses and nights</p>
                </div>
              </div>
              <div className="text-right text-[10px] font-bold">
                {battery_charge > 20.0 ? (
                  <span className="px-2 py-0.5 bg-teal-500/15 rounded-md uppercase tracking-wider">
                    Online: {battery_charge}% Reserve
                  </span>
                ) : (
                  <span className="text-red-400">Critical Low (&lt; 20%)</span>
                )}
              </div>
            </div>

            {/* Priority 3: Utility Grid */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors ${
              grid_import > 5.0
                ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                : 'bg-slate-950/80 border-slate-900 text-slate-500'
            }`}>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full border border-sky-500/30 text-xs font-black flex items-center justify-center bg-slate-900 shrink-0">3</span>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider">Priority 3: Substation Utility Grid</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Bypasses to grid importing if solar gen is zero and battery falls below 20%</p>
                </div>
              </div>
              <div className="text-right text-[10px] font-bold">
                {grid_import > 5.0 ? (
                  <span className="px-2 py-0.5 bg-sky-500/15 rounded-md uppercase tracking-wider animate-pulse">
                    Import active: {grid_import} kW
                  </span>
                ) : (
                  <span className="text-slate-500">Standby (BESS active)</span>
                )}
              </div>
            </div>

            {/* Priority 4: Generator */}
            <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/80 text-slate-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full border border-slate-800 text-xs font-black flex items-center justify-center bg-slate-900 shrink-0">4</span>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider">Priority 4: Emergency Diesel Generator</h4>
                  <p className="text-[10px] text-slate-450 mt-0.5">Critical final failover active only during utility grid blackouts</p>
                </div>
              </div>
              <div className="text-right text-[10px] font-bold">
                <span className="px-2 py-0.5 bg-slate-900 text-slate-500 rounded border border-slate-850 uppercase tracking-wider">
                  Standby
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Historical Generation Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-md">
        <h3 className="text-base font-bold mb-4">Historical Microgrid Generation Profile</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockDailyMicrogridData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSolarRen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBatRen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)"/>
              <XAxis dataKey="time" stroke="#475569" fontSize={9} />
              <YAxis stroke="#475569" fontSize={9} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '11px', color: '#fff' }}/>
              <Legend wrapperStyle={{ fontSize: '10px', marginTop: '5px' }} />
              <Area type="monotone" name="Solar Array Output (kW)" dataKey="solar" stroke="#eab308" strokeWidth={2} fillOpacity={1} fill="url(#colorSolarRen)"/>
              <Area type="monotone" name="Battery Charge Reserve (%)" dataKey="battery" stroke="#2dd4bf" strokeWidth={1.5} fillOpacity={1} fill="url(#colorBatRen)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

export default Renewables;
