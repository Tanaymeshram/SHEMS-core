import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Monitor,
  AlertTriangle,
  Play,
  Moon,
  Power,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  Info,
  TrendingUp,
  Cpu,
  Zap,
  Lock,
  Search,
  Filter,
  Activity
} from 'lucide-react';

function EquipmentMonitoring({ liveData, userRole }) {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All'); // All, Critical, Semi-Critical, Non-Critical
  
  // Safety override Modal state
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [modalAsset, setModalAsset] = useState(null);

  const fetchEquipment = async () => {
    try {
      const data = await api.getEquipment();
      setEquipment(data);
    } catch (err) {
      console.error("Failed to fetch equipment:", err);
    }
  };

  useEffect(() => {
    fetchEquipment();
    
    // Periodically poll backend to show fluctuating telemetry
    const interval = setInterval(fetchEquipment, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatusClick = (eq, targetStatus) => {
    if (eq.is_critical && targetStatus !== "Active") {
      setError(`CLINICAL SAFETY EXCEPTION: Action blocked. "${eq.name}" is marked as a critical life-support asset and must remain ACTIVE.`);
      setTimeout(() => setError(''), 4000);
      return;
    }
    
    // If setting a semi-critical asset to standby/eco, we can do it directly or show confirmation.
    // If turning any asset completely OFF, we show the safety checklist confirmation.
    if (targetStatus === 'Off') {
      setModalAsset({ eq, targetStatus });
      setShowSafetyModal(true);
    } else {
      executeStatusUpdate(eq.name, targetStatus);
    }
  };

  const executeStatusUpdate = async (name, targetStatus) => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await api.updateEquipmentStatus(name, targetStatus);
      setMessage(`Telemetry Command Sent: Asset "${name}" transitioned to ${targetStatus.toUpperCase()}.`);
      setTimeout(() => setMessage(''), 3000);
      await fetchEquipment();
    } catch (err) {
      setError(err.message || 'Failed to update equipment state.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const confirmStatusUpdate = async () => {
    if (!modalAsset) return;
    const { eq, targetStatus } = modalAsset;
    setShowSafetyModal(false);
    setModalAsset(null);
    await executeStatusUpdate(eq.name, targetStatus);
  };

  // Summarize Live Stats
  const activeLoad = equipment
    .filter(eq => eq.status === 'Active')
    .reduce((sum, eq) => sum + eq.power_draw, 0);

  const standbyWastage = equipment
    .filter(eq => eq.status === 'Idle' || eq.status === 'Standby')
    .reduce((sum, eq) => sum + eq.standby_loss, 0);

  const criticalCount = equipment.filter(eq => eq.is_critical).length;
  const criticalActiveCount = equipment.filter(eq => eq.is_critical && eq.status === 'Active').length;
  const complianceRate = criticalCount > 0 ? (criticalActiveCount / criticalCount) * 100 : 100;

  // AI recommendations for semi-critical assets that are currently idle/active-idle
  const getAIRecommendations = () => {
    const recs = [];
    equipment.forEach(eq => {
      const isSemiCritical = ["MRI", "CT Scan", "X-Ray"].includes(eq.type);
      if (eq.status === 'Idle' && isSemiCritical && eq.idle_time > 0.0) {
        recs.push({
          asset: eq.name,
          type: eq.type,
          issue: `Idle for ${eq.idle_time.toFixed(1)} hours (Leakage draw: ${eq.standby_loss} kW)`,
          action: `Switch to Standby Mode`,
          targetStatus: "Standby",
          savings: `Offsets ${eq.standby_loss} kW (~$${(eq.standby_loss * 0.22).toFixed(2)}/hr)`
        });
      }
    });
    return recs;
  };

  const aiRecs = getAIRecommendations();

  // Helper to determine safety policies
  const getPolicyType = (eq) => {
    if (eq.is_critical || ["Ventilators", "ICU Monitors", "Infusion Pumps", "Emergency Systems", "Life Support Systems"].includes(eq.type)) return 'Critical';
    if (["MRI", "CT Scan", "X-Ray"].includes(eq.type)) return 'Semi-Critical';
    if (["Office PCs", "Printers", "TVs", "Displays"].includes(eq.type)) return 'Non-Critical';
    return 'Standard Monitored';
  };

  // Filtered Equipment List
  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          eq.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const policy = getPolicyType(eq);
    const matchesFilter = filterType === 'All' || 
                          (filterType === 'Critical' && policy === 'Critical') ||
                          (filterType === 'Semi-Critical' && policy === 'Semi-Critical') ||
                          (filterType === 'Non-Critical' && policy === 'Non-Critical') ||
                          (filterType === 'Monitored-Only' && policy === 'Standard Monitored');
                          
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <Monitor className="text-clinical-500 text-teal-400" size={28} />
            <span>Clinical Equipment Monitor & Eco-Management</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time operating analytics, active power draws, duty-cycle tracking, and clinical safety shield policies.
          </p>
        </div>
        
        {/* Policy Badges legend */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 flex items-center gap-1.5 font-semibold">
            <Lock size={12} /> Critical: Locked ON
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-yellow-950/40 border border-yellow-500/30 text-yellow-400 flex items-center gap-1.5 font-semibold">
            <ShieldCheck size={12} /> Semi-Critical: Auto-Standby
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5 font-semibold">
            <Power size={12} /> Non-Critical: Occupancy-OFF
          </span>
        </div>
      </div>

      {/* Stats KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Clinical Load</span>
            <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-teal-400">{activeLoad.toFixed(1)} <span className="text-sm font-semibold text-slate-400">kW</span></h3>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl">
            <Zap size={24} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Standby Loss Leakage</span>
            <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-yellow-500">{standbyWastage.toFixed(1)} <span className="text-sm font-semibold text-slate-400">kW</span></h3>
          </div>
          <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl">
            <AlertTriangle size={24} className={standbyWastage > 10 ? "animate-pulse" : ""} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Clinical Policy Lock</span>
            <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-emerald-500">{complianceRate.toFixed(0)}% <span className="text-sm font-semibold text-slate-400">Secure</span></h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <ShieldCheck size={24} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Optimization Actions</span>
            <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-purple-400">{aiRecs.length} <span className="text-sm font-semibold text-slate-400">Pending</span></h3>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <Cpu size={24} />
          </div>
        </div>

      </div>

      {/* AI Recommendations Panel */}
      {aiRecs.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/5 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-yellow-500">
              <Sparkles size={20} className="animate-pulse" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider">AI Equipment Idle-Time Recommendations</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-bold">OPTIMIZATION OPPORTUNITY</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiRecs.map((rec, i) => (
              <div key={i} className="p-4 bg-slate-950/70 rounded-xl border border-yellow-500/20 text-xs flex flex-col justify-between gap-4 hover:border-yellow-500/40 transition-all duration-300">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-yellow-400 text-sm">{rec.asset}</h4>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold uppercase">{rec.type}</span>
                  </div>
                  <p className="text-slate-300 font-medium pt-1">{rec.issue}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-2">Recommended Action:</p>
                  <p className="text-emerald-400 font-extrabold flex items-center gap-1">
                    <Moon size={12} /> {rec.action}
                  </p>
                </div>
                
                <div className="pt-3 border-t border-slate-900 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-slate-400 font-semibold">
                    SAVINGS: <span className="text-emerald-500 font-bold">{rec.savings}</span>
                  </div>
                  <button
                    onClick={() => executeStatusUpdate(rec.asset, rec.targetStatus)}
                    disabled={loading}
                    className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-extrabold rounded-lg text-[10px] tracking-wide uppercase transition-all shadow-md active:scale-95 flex items-center gap-1"
                  >
                    <Moon size={10} />
                    <span>Quick Apply</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-900/20 flex flex-col md:flex-row md:items-center gap-4 justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search assets by name or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold mr-1">
            <Filter size={12} /> Filters:
          </span>
          {['All', 'Critical', 'Semi-Critical', 'Non-Critical', 'Monitored-Only'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterType === type 
                  ? 'bg-teal-500 text-slate-950 shadow-md' 
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2 animate-shake">
          <AlertTriangle size={16} />
          <span className="font-semibold">{error}</span>
        </div>
      )}
      {message && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle size={16} />
          <span className="font-semibold">{message}</span>
        </div>
      )}

      {/* Main Grid: Card widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEquipment.map((eq) => {
          const policy = getPolicyType(eq);
          
          // Determine if asset is in active-idle waste state
          const isStandbyWasting = eq.status === 'Idle' && eq.standby_loss > 1.5;
          const livePowerDraw = eq.status === 'Active' 
            ? eq.power_draw 
            : (eq.status === 'Off' ? 0.0 : eq.standby_loss);

          return (
            <div
              key={eq.id}
              className={`glass-panel p-5 rounded-2xl border flex flex-col justify-between gap-5 transition-all duration-300 hover:scale-[1.02] ${
                isStandbyWasting
                  ? 'bg-yellow-950/10 border-yellow-500/40 hover:border-yellow-500/60 shadow-[0_0_15px_rgba(234,179,8,0.05)]'
                  : policy === 'Critical'
                  ? 'bg-slate-900/30 border-slate-800 hover:border-red-500/30'
                  : 'bg-slate-900/30 border-slate-800 hover:border-teal-500/30'
              }`}
            >
              {/* Card Header */}
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate">
                    <h4 className="text-sm font-bold text-slate-100 truncate flex items-center gap-1.5" title={eq.name}>
                      {eq.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold">{eq.type}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase border flex items-center gap-1 ${
                    eq.status === 'Active' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : eq.status === 'Off' 
                      ? 'bg-slate-950 text-slate-500 border-slate-800' 
                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse'
                  }`}>
                    {eq.status === 'Active' && <Activity size={8} className="animate-pulse" />}
                    {eq.status}
                  </span>
                </div>

                {/* Policy Badges & Indicators */}
                <div>
                  {policy === 'Critical' ? (
                    <span className="px-2 py-0.5 inline-flex items-center gap-1 text-[8px] font-extrabold uppercase bg-red-500/10 text-red-400 border border-red-500/20 rounded-md">
                      <Lock size={8} /> Life Support (Locked ON)
                    </span>
                  ) : policy === 'Semi-Critical' ? (
                    <span className="px-2 py-0.5 inline-flex items-center gap-1 text-[8px] font-extrabold uppercase bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-md">
                      <ShieldCheck size={8} /> Semi-Critical (Standby on Idle)
                    </span>
                  ) : policy === 'Non-Critical' ? (
                    <span className="px-2 py-0.5 inline-flex items-center gap-1 text-[8px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                      <Power size={8} /> Non-Critical (Auto-OFF on Occupancy)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 inline-flex items-center gap-1 text-[8px] font-extrabold uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-md animate-pulse">
                      <Activity size={8} /> Monitored-Only (Normal Operation)
                    </span>
                  )}
                </div>
              </div>

              {/* Core Analytics Tracker Section */}
              <div className="space-y-2.5 text-xs border-y border-slate-800/80 py-3 font-semibold text-slate-400">
                
                {/* Runtime Hours */}
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><Clock size={12} className="text-slate-500" /> Runtime</span>
                  <span className="text-slate-200 font-bold">{eq.operating_hours.toFixed(1)} hrs</span>
                </div>

                {/* Power Consumption */}
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><Zap size={12} className="text-slate-500" /> Power Draw</span>
                  <span className={`font-bold ${eq.status === 'Active' ? 'text-teal-400' : eq.status === 'Off' ? 'text-slate-500' : 'text-yellow-500'}`}>
                    {livePowerDraw.toFixed(2)} kW
                  </span>
                </div>

                {/* Utilization Rate */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5"><TrendingUp size={12} className="text-slate-500" /> Utilization Rate</span>
                    <span className="text-slate-200 font-bold">{eq.utilization_rate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        policy === 'Critical' ? 'bg-red-500' : eq.utilization_rate > 50 ? 'bg-teal-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${eq.utilization_rate}%` }}
                    ></div>
                  </div>
                </div>

                {/* Idle Timer */}
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} className="text-slate-500" /> Continuous Idle
                  </span>
                  <span className={`font-bold ${eq.status !== 'Active' && eq.idle_time > 0.0 ? 'text-yellow-500' : 'text-slate-600'}`}>
                    {eq.status !== 'Active' && eq.idle_time > 0.0 
                      ? `${eq.idle_time.toFixed(1)} hrs (${Math.round(eq.idle_time * 60)}m)` 
                      : '--'}
                  </span>
                </div>

              </div>

              {/* Action Buttons Panel */}
              <div className="flex justify-between gap-1.5">
                {policy === 'Critical' ? (
                  <div className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-bold uppercase tracking-wider">
                    <Lock size={12} />
                    <span>Safety Shield Active</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleUpdateStatusClick(eq, 'Active')}
                      disabled={eq.status === 'Active' || loading}
                      className="flex-1 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-slate-950 transition-all duration-200 disabled:opacity-20 disabled:hover:bg-emerald-500/10 text-[10px] font-extrabold uppercase flex items-center justify-center gap-1 shadow-sm active:scale-95"
                      title="Turn Active"
                    >
                      <Play size={10} />
                      <span>ON</span>
                    </button>

                    {policy === 'Semi-Critical' && (
                      <button
                        onClick={() => handleUpdateStatusClick(eq, 'Standby')}
                        disabled={eq.status === 'Standby' || loading}
                        className="flex-1 py-1.5 bg-yellow-500/10 text-yellow-400 rounded-xl hover:bg-yellow-500 hover:text-slate-950 transition-all duration-200 disabled:opacity-20 disabled:hover:bg-yellow-500/10 text-[10px] font-extrabold uppercase flex items-center justify-center gap-1 shadow-sm active:scale-95"
                        title="Set Standby"
                      >
                        <Moon size={10} />
                        <span>ECO</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleUpdateStatusClick(eq, 'Off')}
                      disabled={eq.status === 'Off' || loading}
                      className="flex-1 py-1.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-200 disabled:opacity-20 disabled:hover:bg-red-500/10 text-[10px] font-extrabold uppercase flex items-center justify-center gap-1 shadow-sm active:scale-95"
                      title="Power Off"
                    >
                      <Power size={10} />
                      <span>OFF</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Override Confirmation Modal */}
      {showSafetyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 bg-slate-950 border border-red-500/30 text-white rounded-2xl shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle size={28} className="animate-bounce" />
              <h3 className="text-lg font-bold tracking-wide">Emergency Override Action Checklist</h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              WARNING: You are triggering a complete power shutdown (OFF) override command. 
              Target asset: <span className="font-extrabold text-white">"{modalAsset?.eq.name}"</span>.
            </p>

            <div className="p-3 bg-red-950/20 border border-red-500/10 rounded-xl text-[10px] text-slate-300 leading-relaxed space-y-2">
              <p className="font-bold text-red-400">REQUIRED PRE-FLIGHT CHECKLIST:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Verify diagnostic session is fully completed & patients cleared.</li>
                <li>Confirm no emergency scans are scheduled in next 30 minutes.</li>
                <li>Ensure local technician is notified of asset deactivation.</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 text-xs pt-2">
              <button
                onClick={() => setShowSafetyModal(false)}
                className="px-4 py-2 border border-slate-800 rounded-xl hover:bg-slate-900 transition-colors font-bold text-slate-400 hover:text-white"
              >
                Abort Command
              </button>
              <button
                onClick={confirmStatusUpdate}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all shadow-md font-extrabold uppercase tracking-wider"
              >
                Confirm Shutdown
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default EquipmentMonitoring;
