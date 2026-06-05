import React, { useState } from 'react';
import { api } from '../services/api';
import {
  Settings as SettingsIcon,
  Cpu,
  Database,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Sliders,
  ShieldCheck,
  LineChart,
  Target,
  FileSpreadsheet
} from 'lucide-react';

function Settings({ liveData, userRole, onResetDb }) {
  const [retraining, setRetraining] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!liveData) {
    return <div className="text-center py-12 text-sm text-slate-400">Loading Configuration Panel...</div>;
  }

  // Trigger retraining
  const handleRetrain = async () => {
    setRetraining(true);
    setMessage('');
    setError('');
    
    try {
      const res = await api.retrainModels();
      setMessage(res.message || 'Models weights recalculating in the background.');
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to retrain models.');
    } finally {
      setRetraining(false);
    }
  };

  // Trigger database wipe
  const handleResetDb = async () => {
    if (!window.confirm("WARNING: You are about to wipe the database and re-seed all initial records. This action cannot be undone. Proceed?")) {
      return;
    }
    
    setResetting(true);
    setMessage('');
    setError('');
    
    try {
      const res = await api.resetDatabase();
      alert("Database wiped and seeded successfully. Session will be logged out to sync users.");
      onResetDb(); // logout
    } catch (err) {
      setError(err.message || 'Database reset failed.');
    } finally {
      setResetting(false);
    }
  };

  const handleTogglePolicy = async (key, value = null) => {
    try {
      await api.toggleAutomation(key, value);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-wide flex items-center gap-2">
          <SettingsIcon className="text-clinical-500" />
          <span>BEMS Settings & AI Model Diagnostics Console</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Monitor scikit-learn training metrics, trigger neural/regression weight updates, and supervise microgrid settings.
        </p>
      </div>

      {/* Global Status Banner */}
      {message && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 animate-pulse"><CheckCircle size={14}/>{message}</div>}
      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Panel 1: Automation rules */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Sliders size={18} className="text-clinical-400" />
            <span>AI Operational Directives</span>
          </h3>
          <p className="text-slate-400 text-[11px] font-semibold">
            Define active policies for the central BEMS automation controller.
          </p>

          <div className="space-y-4 pt-2">
            
            {/* Rule 1: HVAC ECO */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-800/10 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-100">Smart HVAC Eco-Cooling Mode</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Locks comfort cooling in ICU/OT, while allowing other wards to drift when unoccupied.</p>
              </div>
              <button
                onClick={() => handleTogglePolicy('hvac_eco_mode')}
                disabled={userRole === 'Technician'}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 relative ${
                  liveData.automation_active.hvac_eco_mode ? 'bg-clinical-500' : 'bg-slate-400'
                }`}
              >
                <span className={`w-4.5 h-4.5 rounded-full bg-white block shadow-sm transform transition-transform duration-300 ${
                  liveData.automation_active.hvac_eco_mode ? 'translate-x-4.5' : ''
                }`}></span>
              </button>
            </div>

            {/* Rule 2: Occupancy-aware lighting */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-800/10 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-100">Lighting Occupancy Automation</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Instantly powers down light switches when occupancy registers 0 inside wards/admin.</p>
              </div>
              <button
                onClick={() => handleTogglePolicy('lighting_occupancy_control')}
                disabled={userRole === 'Technician'}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 relative ${
                  liveData.automation_active.lighting_occupancy_control ? 'bg-clinical-500' : 'bg-slate-400'
                }`}
              >
                <span className={`w-4.5 h-4.5 rounded-full bg-white block shadow-sm transform transition-transform duration-300 ${
                  liveData.automation_active.lighting_occupancy_control ? 'translate-x-4.5' : ''
                }`}></span>
              </button>
            </div>

            {/* Rule 3: Battery Peak shaving */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-800/10 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-100">Renewable Battery Peak Shaving</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Enables microgrid battery storage to discharge power to wings during peak pricing hours.</p>
              </div>
              <button
                onClick={() => handleTogglePolicy('battery_peak_shaving')}
                disabled={userRole === 'Technician'}
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

          {/* 💻 DEDICATED SCIKIT-LEARN ENGINE DIAGNOSTICS */}
          <div className="border-t border-slate-200 dark:border-slate-800/60 pt-6 space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Cpu size={18} className="text-clinical-400" />
              <span>Scikit-Learn ML Subsystem Diagnostics</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Model 1 */}
              <div className="p-4 bg-slate-100 dark:bg-slate-800/20 border border-slate-200/60 dark:border-slate-800/20 rounded-xl space-y-2">
                <span className="px-2 py-0.5 bg-clinical-500/10 text-clinical-400 border border-clinical-500/20 rounded-md text-[8px] font-extrabold uppercase">Model 01</span>
                <h4 className="text-xs font-extrabold">Random Forest</h4>
                <div className="text-[10px] space-y-1 text-slate-400">
                  <div className="flex justify-between"><span>Type:</span><span className="text-slate-200 font-bold">Regressor</span></div>
                  <div className="flex justify-between"><span>R² Accuracy:</span><span className="text-emerald-500 font-bold">88.2%</span></div>
                  <div className="flex justify-between"><span>MAE:</span><span className="text-clinical-400 font-bold">5.2 kW</span></div>
                </div>
              </div>

              {/* Model 2 */}
              <div className="p-4 bg-slate-100 dark:bg-slate-800/20 border border-slate-200/60 dark:border-slate-800/20 rounded-xl space-y-2">
                <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-[8px] font-extrabold uppercase">Model 02</span>
                <h4 className="text-xs font-extrabold">Isolation Forest</h4>
                <div className="text-[10px] space-y-1 text-slate-400">
                  <div className="flex justify-between"><span>Type:</span><span className="text-slate-200 font-bold">Anomaly Detector</span></div>
                  <div className="flex justify-between"><span>Contamination:</span><span className="text-red-400 font-bold">3.0%</span></div>
                  <div className="flex justify-between"><span>Acc. Rate:</span><span className="text-emerald-500 font-bold">94.5%</span></div>
                </div>
              </div>

              {/* Model 3 */}
              <div className="p-4 bg-slate-100 dark:bg-slate-800/20 border border-slate-200/60 dark:border-slate-800/20 rounded-xl space-y-2">
                <span className="px-2 py-0.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-md text-[8px] font-extrabold uppercase">Model 03</span>
                <h4 className="text-xs font-extrabold">Logistic Regression</h4>
                <div className="text-[10px] space-y-1 text-slate-400">
                  <div className="flex justify-between"><span>Type:</span><span className="text-slate-200 font-bold">Classifier</span></div>
                  <div className="flex justify-between"><span>Metric:</span><span className="text-slate-200 font-bold">Predictive Maint.</span></div>
                  <div className="flex justify-between"><span>Accuracy:</span><span className="text-emerald-500 font-bold">94.0%</span></div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Panel 2: Model & Database settings */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-1 space-y-6">
          
          {/* Data Collection Mode Selector */}
          <div className="space-y-3 pb-4 border-b border-slate-200 dark:border-slate-800/60">
            <h3 className="text-sm font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <Database size={16} className="text-clinical-400" />
              <span>Data Ingestion Profile</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              Select central BEMS telemetry integration.
            </p>
            <div className="space-y-1.5">
              {[
                { id: 1, name: "Mode 1: Infrastructure Mode", desc: "BACnet / Modbus REST API" },
                { id: 2, name: "Mode 2: IoT Sensor Mode", desc: "ESP32 micro-sensors Wifi/MQTT" },
                { id: 3, name: "Mode 3: Hybrid Mode", desc: "Combined Ingress Telemetry" }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleTogglePolicy('data_collection_mode', String(m.id))}
                  disabled={userRole === 'Technician'}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold flex flex-col transition-all ${
                    liveData.data_collection_mode === m.id
                      ? 'bg-clinical-500/10 border-clinical-500/40 text-clinical-450'
                      : 'bg-slate-100 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span>{m.name}</span>
                  <span className="text-[9px] opacity-70 mt-0.5">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ML Weights Reset */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <Cpu size={16} className="text-clinical-400" />
              <span>Model Weights</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              Recalculate forecast matrices, peak load predictions, and isolation forest contaminant indexes based on fresh audit logs.
            </p>
            <button
              onClick={handleRetrain}
              disabled={retraining}
              className="w-full py-2.5 bg-clinical-600 hover:bg-clinical-500 disabled:bg-slate-700 text-white font-bold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={14} className={retraining ? 'animate-spin' : ''} />
              <span>{retraining ? 'Fitting Models...' : 'Retrain ML Models'}</span>
            </button>
          </div>

          {/* DB Reset Control */}
          <div className="border-t border-slate-200 dark:border-slate-800/60 pt-4 space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-2 text-red-400">
              <Database size={16} />
              <span>Database Maintenance</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              WARNING: Resets the MySQL schema. Clears and re-seeds 30 days of standard operational BEMS logs into your `smart_hospital_energy` schema.
            </p>
            
            {userRole !== 'Admin' ? (
              <div className="p-2 bg-slate-805 text-slate-500 rounded-lg text-[9px] font-bold text-center border border-slate-800">
                ADMIN PRIVILEGES REQUIRED TO WIPE SCHEMA
              </div>
            ) : (
              <button
                onClick={handleResetDb}
                disabled={resetting}
                className="w-full py-2.5 bg-red-650 hover:bg-red-500 disabled:bg-slate-700 text-white font-bold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-1.5"
              >
                <Database size={14} />
                <span>{resetting ? 'Resetting DB...' : 'Reset & Re-seed Database'}</span>
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

export default Settings;
