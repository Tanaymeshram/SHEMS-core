import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  AlertOctagon,
  Cpu,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  TrendingUp,
  RefreshCw,
  Search,
  Grid
} from 'lucide-react';

function AnomalyDetection() {
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('all'); // all, isolation_forest, autoencoder
  const [searchWing, setSearchWing] = useState('');

  const fetchHeatmap = async () => {
    setLoading(true);
    try {
      const data = await api.getAnomalyHeatmap();
      setHeatmapData(data);
    } catch (err) {
      console.error("Failed to fetch anomaly heatmap:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmap();
    // Poll every 5 seconds for live anomalies
    const interval = setInterval(fetchHeatmap, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!heatmapData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-450 space-y-4">
        <RefreshCw size={40} className="animate-spin text-red-500" />
        <span className="text-sm font-semibold">Running ML Anomaly Scanners...</span>
      </div>
    );
  }

  const { models, heatmap, active_anomalies } = heatmapData;

  // Filter anomalies based on selected model filter and search query
  const filteredAnomalies = active_anomalies.filter(anom => {
    const matchesModel = selectedModel === 'all' || 
                         (selectedModel === 'isolation_forest' && anom.detected_by.includes('Isolation Forest')) ||
                         (selectedModel === 'autoencoder' && anom.detected_by.includes('Autoencoder'));
    const matchesSearch = anom.wing.toLowerCase().includes(searchWing.toLowerCase()) || 
                          anom.type.toLowerCase().includes(searchWing.toLowerCase());
    return matchesModel && matchesSearch;
  });

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <AlertOctagon className="text-red-500 animate-pulse" size={28} />
            <span>AI Anomaly Detection Center</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time machine learning monitoring for energy leakages, power theft, wiring failures, and anomalous equipment draws.
          </p>
        </div>

        <button
          onClick={fetchHeatmap}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Force Model Run</span>
        </button>
      </div>

      {/* Model Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Isolation Forest Card */}
        <div className={`glass-panel p-5 rounded-2xl border flex flex-col justify-between gap-3 transition-all duration-300 ${
          selectedModel === 'isolation_forest' ? 'border-red-500 bg-red-500/5 ring-1 ring-red-500/25' : 'border-slate-800 bg-slate-900/10'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu size={18} className="text-red-400" />
              <h3 className="text-sm font-extrabold uppercase">Isolation Forest Classifier</h3>
            </div>
            <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              {models.isolation_forest}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
            Unsupervised partitioning algorithm mapping multi-dimensional current / voltage spikes. Detects faulty wiring and rapid thermal drift load surges.
          </p>
          <button
            onClick={() => setSelectedModel(selectedModel === 'isolation_forest' ? 'all' : 'isolation_forest')}
            className="w-full mt-2 py-1.5 border border-slate-800 hover:border-slate-700 bg-slate-950/60 rounded-xl text-[10px] font-extrabold uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
          >
            {selectedModel === 'isolation_forest' ? 'Show All Detections' : 'Filter by Isolation Forest'}
          </button>
        </div>

        {/* Autoencoder Card */}
        <div className={`glass-panel p-5 rounded-2xl border flex flex-col justify-between gap-3 transition-all duration-300 ${
          selectedModel === 'autoencoder' ? 'border-red-500 bg-red-500/5 ring-1 ring-red-500/25' : 'border-slate-800 bg-slate-900/10'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-red-400" />
              <h3 className="text-sm font-extrabold uppercase">Deep Autoencoder Network</h3>
            </div>
            <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              {models.autoencoder}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
            Deep reconstruction loss model flagging long-term leakage draws and abnormal background equipment cycles. Discovers hidden utility leaks.
          </p>
          <button
            onClick={() => setSelectedModel(selectedModel === 'autoencoder' ? 'all' : 'autoencoder')}
            className="w-full mt-2 py-1.5 border border-slate-800 hover:border-slate-700 bg-slate-950/60 rounded-xl text-[10px] font-extrabold uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
          >
            {selectedModel === 'autoencoder' ? 'Show All Detections' : 'Filter by Autoencoder'}
          </button>
        </div>

      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Heatmap Grid Visualizer */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-md lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <div className="flex items-center gap-2">
              <Grid className="text-red-500" size={16} />
              <h3 className="text-sm font-bold uppercase">Wing Anomaly Heatmap</h3>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded bg-slate-905 border border-slate-800 text-slate-400 font-extrabold">LIVE</span>
          </div>
          
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Real-time thermodynamic and power reconstruction heat grid mapping hospital wings. Red and yellow indicators highlight anomalous draw parameters.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {Object.entries(heatmap).map(([wingName, status]) => {
              const bgColor = status === 'critical' 
                ? 'bg-red-500/15 border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                : status === 'warning'
                ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
                
              const labelColor = status === 'critical'
                ? 'bg-red-500'
                : status === 'warning'
                ? 'bg-yellow-500'
                : 'bg-emerald-500';

              return (
                <div 
                  key={wingName} 
                  onClick={() => setSearchWing(wingName)}
                  className={`p-4 rounded-xl border text-center cursor-pointer transition-all duration-300 hover:scale-[1.03] select-none ${bgColor}`}
                >
                  <div className="flex justify-center mb-2">
                    <span className={`w-2 h-2 rounded-full ${labelColor} animate-pulse`}></span>
                  </div>
                  <h4 className="text-xs font-black truncate">{wingName}</h4>
                  <span className="text-[8px] font-bold block uppercase mt-1 opacity-70">
                    {status.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-between text-[8px] font-extrabold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Normal</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> Warning</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Critical</span>
          </div>

        </div>

        {/* Active Detections Feed */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-md lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase">Live ML Detections Feed</h3>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Active anomalies registered by Isolation Forest & Autoencoders</p>
            </div>

            {/* Local Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
              <input
                type="text"
                placeholder="Search wing/anomaly..."
                value={searchWing}
                onChange={(e) => setSearchWing(e.target.value)}
                className="pl-7 pr-3 py-1 bg-slate-950/80 border border-slate-800 text-[10px] rounded-lg text-slate-200 focus:outline-none focus:border-red-500 transition-colors w-40"
              />
            </div>
          </div>

          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            {filteredAnomalies.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                No active anomalies match your selection filter.
              </div>
            ) : (
              filteredAnomalies.map((anom, i) => {
                const badgeStyle = anom.severity === 'Critical' 
                  ? 'bg-red-500/15 border-red-500/30 text-red-400 glow-alarm'
                  : 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400';

                return (
                  <div key={i} className="p-4 bg-slate-100 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-800/10 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold border ${badgeStyle}`}>
                          {anom.severity}
                        </span>
                        <h4 className="text-xs font-extrabold text-slate-100">{anom.type}</h4>
                      </div>
                      <span className="text-[9px] text-slate-450 font-bold uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-850">
                        {anom.wing}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                      {anom.description}
                    </p>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800/40 text-[9px] text-slate-450 font-mono">
                      <span>DETECTION METHOD:</span>
                      <span className="text-red-400 font-extrabold">{anom.detected_by}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

export default AnomalyDetection;
