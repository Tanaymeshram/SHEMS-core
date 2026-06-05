import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  ShieldAlert,
  Sliders,
  CheckCircle,
  AlertOctagon,
  Wrench,
  Gauge,
  Thermometer,
  Zap,
  Download,
  Sun,
  Battery,
  Wind,
  Snowflake,
  Calendar
} from 'lucide-react';

function Maintenance({ liveData, userRole }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPredictiveData = async () => {
      setLoading(true);
      try {
        const data = await api.getPredictiveMaintenance();
        setAssets(data.assets || []);
      } catch (err) {
        console.error("Failed to load predictive maintenance:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictiveData();
  }, [liveData]);

  if (!liveData) {
    return <div className="text-center py-12 text-sm text-slate-400">Locking Diagnostic Feeds...</div>;
  }

  const { chiller, generator } = liveData.maintenance;

  // Mock standard maintenance checklists
  const chillerChecks = [
    { id: 1, task: "Inspect compressor lubricant oil viscosity", done: true },
    { id: 2, task: "Flush condenser coil mineral deposits", done: true },
    { id: 3, task: "Calibrate expansion valve expansion rates", done: false },
    { id: 4, task: "Audit motor vibration high-frequency harmonics", done: false }
  ];

  const generatorChecks = [
    { id: 1, task: "Verify fuel reserve levels (above 85%)", done: true },
    { id: 2, task: "Check battery cranking starter charge", done: true },
    { id: 3, task: "Inspect engine coolant levels & radiator hoses", done: true },
    { id: 4, task: "Log crankcase oil pressure logs", done: false }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-wide flex items-center gap-2">
            <Wrench className="text-clinical-500 animate-pulse-slow" />
            <span>Predictive Maintenance & Health Diagnostics</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Machine learning failure indicators analyzing mechanical stress factors, temperature shifts, and breakdown weights.
          </p>
        </div>

        <div className="flex gap-2">
          {/* CSV Exporter */}
          <a
            href={api.getReportExportUrl('maintenance')}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center gap-2 transition-all"
          >
            <Download size={14} />
            <span>Download Audit Dataset</span>
          </a>
        </div>
      </div>

      {/* Breakdown Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Main Water Chiller Asset Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold">Main Water Chiller</h3>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">Asset ID: CH-COM-01</span>
              </div>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase ${
                chiller.status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400' :
                chiller.status === 'Warning' ? 'bg-yellow-500/15 text-yellow-500 animate-pulse' : 'bg-red-500/20 text-red-400 glow-alarm'
              }`}>
                {chiller.status}
              </span>
            </div>

            {/* Live variables */}
            <div className="grid grid-cols-3 gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4 mb-4">
              <div className="text-center bg-slate-100 dark:bg-slate-800/30 p-2.5 rounded-xl">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">Vibration</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{chiller.vibration} mm/s</span>
              </div>
              <div className="text-center bg-slate-100 dark:bg-slate-800/30 p-2.5 rounded-xl">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">Core Temp</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{chiller.temp}°C</span>
              </div>
              <div className="text-center bg-slate-100 dark:bg-slate-800/30 p-2.5 rounded-xl">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">Oil Press</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{chiller.oil} PSI</span>
              </div>
            </div>

            {/* Breakdown probability gauge */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Fail Probability (ML Model)</span>
                <p className="text-xs text-slate-400 mt-0.5">Logistic breakdown risk coefficient</p>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-extrabold ${chiller.failure_prob > 50 ? 'text-red-400' : 'text-emerald-500'}`}>
                  {chiller.failure_prob}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Generator Asset Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold">Emergency Generator 1</h3>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">Asset ID: GEN-EM-01</span>
              </div>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase ${
                generator.status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/15 text-yellow-500 animate-pulse'
              }`}>
                {generator.status}
              </span>
            </div>

            {/* Live variables */}
            <div className="grid grid-cols-3 gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4 mb-4">
              <div className="text-center bg-slate-100 dark:bg-slate-800/30 p-2.5 rounded-xl">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">Vibration</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{generator.vibration} mm/s</span>
              </div>
              <div className="text-center bg-slate-100 dark:bg-slate-800/30 p-2.5 rounded-xl">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">Core Temp</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{generator.temp}°C</span>
              </div>
              <div className="text-center bg-slate-100 dark:bg-slate-800/30 p-2.5 rounded-xl">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">Oil Press</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{generator.oil} PSI</span>
              </div>
            </div>

            {/* Breakdown probability gauge */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Fail Probability (ML Model)</span>
                <p className="text-xs text-slate-400 mt-0.5">Logistic breakdown risk coefficient</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-emerald-500">
                  {generator.failure_prob}%
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Task Checklists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Chiller Tasks */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold mb-4">Chiller Operational Checklist</h3>
          <div className="space-y-3">
            {chillerChecks.map(c => (
              <div key={c.id} className="flex items-start gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={c.done}
                  readOnly
                  className="mt-0.5 accent-clinical-500 bg-slate-200 border-none rounded cursor-default"
                />
                <span className={c.done ? 'line-through text-slate-400 dark:text-slate-500' : ''}>{c.task}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Generator Tasks */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold mb-4">Emergency Generator Checklist</h3>
          <div className="space-y-3">
            {generatorChecks.map(c => (
              <div key={c.id} className="flex items-start gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={c.done}
                  readOnly
                  className="mt-0.5 accent-clinical-500 bg-slate-200 border-none rounded cursor-default"
                />
                <span className={c.done ? 'line-through text-slate-400 dark:text-slate-500' : ''}>{c.task}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* AI Predictive Diagnostics Directory */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <ShieldAlert className="text-teal-400" size={18} />
              <span>AI Predictive Diagnostics Directory</span>
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              ML neural predictions estimating Remaining Useful Life (RUL) and structural stress failures.
            </p>
          </div>
          <span className="text-[9px] font-black uppercase bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2.5 py-0.5 rounded-lg tracking-wider">
            Machine Learning Core
          </span>
        </div>

        {loading && assets.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-550 font-bold">Recalculating failure matrices...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
            {assets.map((asset) => {
              // Icon mapping by asset type
              const getAssetIcon = (type) => {
                switch (type.toLowerCase()) {
                  case 'chiller':
                    return <Snowflake size={16} className="text-sky-400" />;
                  case 'generator':
                    return <Zap size={16} className="text-amber-500" />;
                  case 'hvac':
                    return <Wind size={16} className="text-teal-450" />;
                  case 'ups':
                    return <Battery size={16} className="text-purple-400" />;
                  case 'solar inverter':
                    return <Sun size={16} className="text-yellow-500" />;
                  default:
                    return <Wrench size={16} className="text-slate-400" />;
                }
              };

              const failProb = asset.failure_probability || 0;
              const isWarning = failProb > 45;
              const isCritical = failProb > 75;

              return (
                <div
                  key={asset.id}
                  className="p-4 bg-slate-955/70 border border-slate-850 hover:border-slate-800 rounded-xl flex flex-col justify-between gap-4 transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="p-1.5 bg-slate-900 border border-slate-850 rounded-lg">
                        {getAssetIcon(asset.type)}
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        isCritical ? 'bg-red-500/20 text-red-400' :
                        isWarning ? 'bg-yellow-550/20 text-yellow-555' :
                        'bg-emerald-500/20 text-emerald-450'
                      }`}>
                        {asset.status || (isCritical ? 'Critical' : isWarning ? 'Warning' : 'Healthy')}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{asset.name}</h4>
                      <span className="text-[8px] text-slate-500 font-bold block">{asset.id}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Failure Probability Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold">
                        <span className="text-slate-500">FAIL RISK</span>
                        <span className={isCritical ? 'text-red-400' : isWarning ? 'text-yellow-500' : 'text-emerald-400'}>
                          {failProb.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isCritical ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${failProb}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* RUL & Service Date info */}
                    <div className="pt-2 border-t border-slate-900 space-y-1 text-[9px] font-bold text-slate-400">
                      <div className="flex justify-between">
                        <span className="text-slate-500">RUL:</span>
                        <span className="text-slate-200">{asset.remaining_useful_life_days} Days</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500 font-medium">
                        <span className="flex items-center gap-0.5"><Calendar size={8} /> NEXT RUN:</span>
                        <span className="text-[8px] text-slate-305 font-bold">{asset.next_maintenance_date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

export default Maintenance;
