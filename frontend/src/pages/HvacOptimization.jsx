import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Thermometer,
  ShieldAlert,
  Save,
  CheckCircle,
  Wind,
  Flame,
  Power,
  Activity,
  Sparkles,
  CloudSun,
  Eye
} from 'lucide-react';

function HvacOptimization({ liveData, userRole }) {
  const [setpoints, setSetpoints] = useState({});
  const [originalSetpoints, setOriginalSetpoints] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [selectedWing, setSelectedWing] = useState(null);
  const [pendingValue, setPendingValue] = useState(null);

  const handleDeviceOverride = async (room, field, val) => {
    setMessage('');
    setError('');
    try {
      const payload = { [field]: val };
      await api.overrideHvac(room, payload);
      setMessage(`Telemetry override successfully applied: ${room} ${field} set to ${val}.`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Override was rejected by clinical safety rules.');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Load current target setpoints from database
  useEffect(() => {
    const fetchHvacSettings = async () => {
      try {
        const data = await api.getHvacSettings();
        setSetpoints(data);
        setOriginalSetpoints(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHvacSettings();
  }, []);

  if (!liveData || Object.keys(setpoints).length === 0) {
    return <div className="text-center py-12 text-sm text-slate-400">Loading Clinical Setpoints...</div>;
  }

  // Handle local value changes
  const handleSetpointChange = (key, value) => {
    setSetpoints(prev => ({
      ...prev,
      [key]: parseFloat(value)
    }));
  };

  // Safe checks & Commit updates
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    
    try {
      await api.setHvacSettings(setpoints);
      setOriginalSetpoints(setpoints);
      setMessage('Target clinical setpoints applied successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update setpoints.');
      setSetpoints(originalSetpoints); // rollback
    } finally {
      setSaving(false);
    }
  };

  // Open clinical shield warning before letting user adjust ICU/OT
  const handleTriggerSecurityOverride = (key, wingName, val) => {
    setSelectedWing({ key, name: wingName });
    setPendingValue(parseFloat(val));
    setShowWarningModal(true);
  };

  const confirmSecurityOverride = () => {
    if (selectedWing) {
      handleSetpointChange(selectedWing.key, pendingValue);
    }
    setShowWarningModal(false);
    setSelectedWing(null);
    setPendingValue(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold tracking-wide flex items-center gap-2">
          <Thermometer className="text-clinical-500" />
          <span>Smart HVAC Optimization & Climate Controls</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Monitor room temperatures, humidity, air quality index, and fan speed draws while enforcing patient-safety rules.
        </p>
      </div>

      {/* 🔴 CLINICAL PATIENT SAFETY COMPLIANCE RULES BANNER */}
      <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-red-500/20 rounded-xl text-red-400">
          <ShieldAlert size={20} className="animate-pulse" />
        </div>
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-red-400">Clinical Safe Environment Compliance Act</h4>
          <p className="text-slate-300 text-xs mt-1.5 leading-relaxed font-semibold">
            1. **ICU and OT Zone Lock:** ICU and OT wings must always maintain strict temperature and humidity margins. Remote shutdowns and fan deactivations in these surgical wings are blocked by BEMS firmware.
          </p>
          <p className="text-slate-300 text-xs mt-1.5 leading-relaxed font-semibold">
            2. **Patient Safety Priority:** Patients thermal comfort holds highest priority. Automation scripts will override Eco-Mode instantly if occupancy is detected or clinical parameters drift.
          </p>
        </div>
      </div>

      {/* BEMS AI HVAC FEATURES DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Occupancy-Aware Cooling",
            icon: Sparkles,
            color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
            desc: "Monitors real-time PIR and headcount nodes. Drifts target temperature in empty areas (saving base loads) and triggers normal comfort cooling instantly when occupants arrive.",
            stat: "34.5% Active Savings"
          },
          {
            title: "Weather-Aware Cooling",
            icon: CloudSun,
            color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
            desc: "Tracks regional ambient humidity and outdoor temperature drifts. Proactively pre-cools wards before summer solar load peaks, preventing grid shocks and grid import bills.",
            stat: "Forecast Pre-cool Active"
          },
          {
            title: "HVAC Energy Optimization",
            icon: Wind,
            color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            desc: "Adapts fan speeds dynamically. Combines variable speed controllers and compressor states to optimize daily airflow demand without breaching clinical margins.",
            stat: "PID Throttling Active"
          }
        ].map((feat, index) => {
          const IconComp = feat.icon;
          return (
            <div key={index} className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl border ${feat.color}`}>
                    <IconComp size={16} />
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-extrabold uppercase font-mono tracking-wider animate-pulse">
                    Enabled
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{feat.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/40 text-[9px] font-extrabold text-slate-300 uppercase tracking-widest flex items-center justify-between">
                <span>SYSTEM STATUS</span>
                <span>{feat.stat}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Wing Telemetries and Setpoint Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Target Setpoint Config Form */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-1">
          <h3 className="text-base font-bold mb-4">Set Target Setpoints</h3>
          
          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{error}</div>}
          {message && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2"><CheckCircle size={14}/>{message}</div>}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            
            {/* ICU Setpoint */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 flex justify-between">
                <span>ICU TARGET SETPOINT</span>
                <span className="text-[10px] text-red-400 font-extrabold uppercase tracking-widest">Safe Lock</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="20.0"
                  max="23.0"
                  value={setpoints.icu_target_temp}
                  onChange={(e) => handleSetpointChange('icu_target_temp', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-clinical-500 text-sm font-semibold"
                />
                <span className="flex items-center px-3 bg-slate-200 dark:bg-slate-800 rounded-xl text-slate-400 text-sm font-bold">°C</span>
              </div>
            </div>

            {/* OT Setpoint */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 flex justify-between">
                <span>SURGICAL OT SETPOINT</span>
                <span className="text-[10px] text-red-400 font-extrabold uppercase tracking-widest">Safe Lock</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="18.0"
                  max="22.0"
                  value={setpoints.ot_target_temp}
                  onChange={(e) => handleSetpointChange('ot_target_temp', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-clinical-500 text-sm font-semibold"
                />
                <span className="flex items-center px-3 bg-slate-200 dark:bg-slate-800 rounded-xl text-slate-400 text-sm font-bold">°C</span>
              </div>
            </div>

            {/* General Wards */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">GENERAL WARDS SETPOINT</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="18.0"
                  max="28.0"
                  value={setpoints.wards_target_temp}
                  onChange={(e) => handleSetpointChange('wards_target_temp', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-clinical-500 text-sm font-semibold"
                />
                <span className="flex items-center px-3 bg-slate-200 dark:bg-slate-800 rounded-xl text-slate-400 text-sm font-bold">°C</span>
              </div>
            </div>

            {/* Outpatient */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">LABS / IMAGING SETPOINTS</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="18.0"
                  max="28.0"
                  value={setpoints.outpatient_target_temp}
                  onChange={(e) => handleSetpointChange('outpatient_target_temp', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-clinical-500 text-sm font-semibold"
                />
                <span className="flex items-center px-3 bg-slate-200 dark:bg-slate-800 rounded-xl text-slate-400 text-sm font-bold">°C</span>
              </div>
            </div>

            {userRole === 'Technician' ? (
              <div className="p-3 bg-slate-800/40 rounded-xl text-slate-400 text-[10px] font-semibold text-center border border-slate-800">
                ADMIN OR ENERGY MANAGER CREDENTIALS REQUIRED TO SET TARGETS
              </div>
            ) : (
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-clinical-600 hover:bg-clinical-500 disabled:bg-slate-600 text-white font-bold rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2"
              >
                <Save size={16} />
                <span>{saving ? 'Applying Policies...' : 'Commit HVAC Setpoints'}</span>
              </button>
            )}
          </form>
        </div>

        {/* Right: Live Climate Telemetry Grid (expanded for 10 rooms/areas) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Hospital Climate & HVAC Airflow Telemetry</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-clinical-500/10 text-clinical-400 border border-clinical-500/20">
              <span className="w-1.5 h-1.5 bg-clinical-400 rounded-full mr-1.5 animate-ping"></span>
              Real-time Ingress
            </span>
          </div>
          
          <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1">
            {Object.entries(liveData.wings).map(([name, w]) => {
              const setpointKey = name === "ICU" ? "icu_target_temp" :
                                 name === "OT" ? "ot_target_temp" :
                                 name === "Wards" ? "wards_target_temp" :
                                 ["Laboratories", "MRI Room", "CT Scan Room"].includes(name) ? "outpatient_target_temp" : "admin_target_temp";
              
              const currentTarget = setpoints[setpointKey];
              const tempDiff = Math.abs(w.temp - currentTarget);

              const isPlantRoom = ["Solar Plant", "Battery Storage Room", "Generator Room"].includes(name);

              return (
                <div key={name} className="p-4 bg-slate-100 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-800/10 rounded-2xl flex flex-col gap-3">
                  
                  {/* Top Line: Zone Name & Load */}
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-800/40">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-150 flex items-center gap-1.5">
                        <span>{name}</span>
                        {name === "ICU" || name === "OT" ? (
                          <span className="px-1.5 py-0.2 text-[8px] font-extrabold uppercase bg-red-500/10 text-red-400 border border-red-500/20 rounded">ICU/OT Lock</span>
                        ) : isPlantRoom ? (
                          <span className="px-1.5 py-0.2 text-[8px] font-extrabold uppercase bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded">Utility Block</span>
                        ) : (
                          <span className="px-1.5 py-0.2 text-[8px] font-extrabold uppercase bg-slate-200 dark:bg-slate-800 text-slate-400 rounded">Standard</span>
                        )}
                      </h4>
                    </div>
                    <div className="text-right text-[10px] font-bold">
                      <span className="text-slate-400 mr-1.5">HVAC LOAD:</span>
                      <span className="text-clinical-450">{w.power} kW</span>
                    </div>
                  </div>

                  {/* Telemetries block */}
                  <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold bg-slate-200/30 dark:bg-slate-900/30 p-2.5 rounded-xl">
                    <div>
                      <span className="text-[8px] text-slate-400 block uppercase">Temperature</span>
                      <span className={`text-xs font-extrabold ${tempDiff > 1.5 && !isPlantRoom ? 'text-red-400 animate-pulse' : 'text-slate-850 dark:text-slate-150'}`}>{w.temp}°C</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 block uppercase">Humidity</span>
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-350">{w.humidity}%</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 block uppercase">Fan Speed</span>
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-350">
                        {w.fan_speed === 3 ? 'HIGH' : w.fan_speed === 2 ? 'MED' : w.fan_speed === 1 ? 'LOW' : 'OFF'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 block uppercase">Air Quality</span>
                      <span className={`text-xs font-extrabold ${w.air_quality > 100 ? 'text-amber-400' : 'text-emerald-400'}`}>{w.air_quality} AQI</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 block uppercase">Occupancy</span>
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-350">{w.occupancy} heads</span>
                    </div>
                  </div>

                  {/* Overrides console (only for configurable rooms) */}
                  {!isPlantRoom && (
                    <div className="pt-1 space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        
                        {/* AC MODE SELECT */}
                        <div className="space-y-1">
                          <span className="text-[8px] text-slate-450 block uppercase font-extrabold">AC MODE</span>
                          <div className="flex bg-slate-200/60 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-250 dark:border-slate-800">
                            {[
                              { val: 0, label: "OFF" },
                              { val: 1, label: "ECO" },
                              { val: 2, label: "COMF" }
                            ].map(opt => {
                              const active = w.hvac === opt.val;
                              const disabled = opt.val === 0 && (name === "ICU" || name === "OT");
                              return (
                                <button
                                  key={opt.val}
                                  type="button"
                                  disabled={disabled}
                                  onClick={() => handleDeviceOverride(name, 'hvac', opt.val)}
                                  className={`flex-1 py-0.5 rounded-md text-[8px] font-bold ${
                                    active
                                      ? opt.val === 2
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : opt.val === 1
                                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                      : 'text-slate-450 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* FAN SPEED SELECT */}
                        <div className="space-y-1">
                          <span className="text-[8px] text-slate-455 block uppercase font-extrabold">FAN POWER</span>
                          <div className="flex bg-slate-200/60 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-250 dark:border-slate-800">
                            {[
                              { val: 0, label: "OFF" },
                              { val: 1, label: "LOW" },
                              { val: 2, label: "MED" },
                              { val: 3, label: "HIGH" }
                            ].map(opt => {
                              const active = w.fan_speed === opt.val;
                              const disabled = opt.val === 0 && (name === "ICU" || name === "OT");
                              return (
                                <button
                                  key={opt.val}
                                  type="button"
                                  disabled={disabled}
                                  onClick={() => handleDeviceOverride(name, 'fan_speed', opt.val)}
                                  className={`flex-1 py-0.5 rounded-md text-[8px] font-bold ${
                                    active
                                      ? 'bg-clinical-500/15 text-clinical-400 border border-clinical-500/25'
                                      : 'text-slate-450 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* LIGHTS SWITCH */}
                        <div className="space-y-1">
                          <span className="text-[8px] text-slate-455 block uppercase font-extrabold">LIGHTING</span>
                          <div className="flex bg-slate-200/60 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-250 dark:border-slate-800">
                            {[
                              { val: 0, label: "OFF" },
                              { val: 1, label: "ON" }
                            ].map(opt => {
                              const active = w.lights === opt.val;
                              return (
                                <button
                                  key={opt.val}
                                  type="button"
                                  onClick={() => handleDeviceOverride(name, 'lights', opt.val)}
                                  className={`flex-1 py-0.5 rounded-md text-[8px] font-bold ${
                                    active
                                      ? opt.val === 1
                                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                        : 'bg-slate-800 text-slate-400'
                                      : 'text-slate-450 hover:text-slate-200'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Warning Override Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 bg-slate-900 border border-red-500/30 text-white rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <ShieldAlert size={24} />
              <h3 className="text-lg font-bold">Clinical Safety Shield Confirmed</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              WARNING: You are modifying the environmental conditions inside the critical **{selectedWing?.name}**. Drifting target thresholds outside of standard clinical settings can impact patient health and medical tool metrics.
            </p>
            <div className="flex justify-end gap-3 text-sm">
              <button
                onClick={() => setShowWarningModal(false)}
                className="px-4 py-2 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors font-bold"
              >
                Cancel
              </button>
              <button
                onClick={confirmSecurityOverride}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all shadow-md font-bold"
              >
                Acknowledge Safety Warnings
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default HvacOptimization;
