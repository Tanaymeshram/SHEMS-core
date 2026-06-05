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
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Cpu,
  DollarSign,
  AlertOctagon,
  Sliders,
  RefreshCw,
  Download,
  Zap,
  Clock,
  Sparkles,
  ZapOff
} from 'lucide-react';

function EnergyPrediction({ liveData }) {
  const [outdoorTemp, setOutdoorTemp] = useState(24.0);
  const [model, setModel] = useState('random_forest'); // random_forest, xgboost, lstm
  const [horizon, setHorizon] = useState('day'); // hour, day, week, month
  const [predictionsData, setPredictionsData] = useState(null);
  const [peakPredictions, setPeakPredictions] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const data = await api.getEnergyPredictions(model, horizon, outdoorTemp);
      setPredictionsData(data);
      const peakData = await api.getPeakLoadPredictions();
      setPeakPredictions(peakData);
    } catch (err) {
      console.error("Failed to fetch predictions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [model, horizon, outdoorTemp]);

  if (!predictionsData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-4">
        <RefreshCw size={40} className="animate-spin text-teal-400" />
        <span className="text-sm font-semibold">Initializing Machine Learning Projections...</span>
      </div>
    );
  }

  const { predictions, metrics } = predictionsData;

  // Model Descriptions for Card selection
  const modelSpecs = [
    {
      id: 'random_forest',
      name: 'Random Forest',
      desc: 'Ensemble decision trees. Good generalized tabular regression.',
      accuracy: '88.0%',
      speed: '< 0.8s',
      color: 'border-teal-500/30 text-teal-400'
    },
    {
      id: 'xgboost',
      name: 'XGBoost Regressor',
      desc: 'Extreme gradient boosting. Highly responsive to peak spikes.',
      accuracy: '91.2%',
      speed: '~1.2s',
      color: 'border-purple-500/30 text-purple-400'
    },
    {
      id: 'lstm',
      name: 'LSTM Network',
      desc: 'Long Short-Term Memory RNN. Smooth lag-aware sequential memory.',
      accuracy: '89.5%',
      speed: '~8.4s',
      color: 'border-blue-500/30 text-blue-400'
    }
  ];

  // Horizon Labels
  const horizonSpecs = [
    { id: 'hour', name: 'Next Hour', desc: '5-minute logs' },
    { id: 'day', name: 'Next Day', desc: 'Hourly logs' },
    { id: 'week', name: 'Next Week', desc: 'Daily logs' },
    { id: 'month', name: 'Monthly Forecast', desc: 'Daily logs' }
  ];

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <TrendingUp className="text-teal-400" size={28} />
            <span>AI Energy Predictions Dashboard</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Machine learning time-series forecasting loads, pricing envelopes, and clean energy offsets.
          </p>
        </div>

        <div className="flex gap-2">
          <a
            href={api.getReportExportUrl('energy')}
            className="px-4 py-2 border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-350 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
          >
            <Download size={14} />
            <span>Download Train Data</span>
          </a>
        </div>
      </div>

      {/* Model Selection Row */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Select Machine Learning Core Model</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modelSpecs.map((spec) => {
            const isActive = model === spec.id;
            return (
              <button
                key={spec.id}
                onClick={() => setModel(spec.id)}
                className={`glass-panel p-5 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all duration-300 relative ${
                  isActive 
                    ? 'bg-slate-900 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.08)]' 
                    : 'bg-slate-900/30 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                      <Cpu size={16} className={isActive ? 'text-teal-400' : 'text-slate-500'} />
                      <span>{spec.name}</span>
                    </h4>
                    {isActive && (
                      <span className="text-[8px] font-black uppercase bg-teal-500/25 text-teal-400 px-1.5 py-0.5 rounded-md tracking-wider flex items-center gap-1">
                        <Sparkles size={8} /> Active Core
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed pt-1">{spec.desc}</p>
                </div>
                
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-bold">
                  <span>ACCURACY: <span className="text-emerald-500 font-extrabold">{spec.accuracy} R²</span></span>
                  <span>LATENCY: <span className="text-slate-300 font-extrabold">{spec.speed}</span></span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Horizon & Weather Slider Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Forecast Horizon Selector */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-md flex flex-col justify-between gap-4 col-span-1">
          <div className="space-y-1">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Clock size={16} className="text-teal-400" />
              <span>Forecast Horizon</span>
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold leading-normal">
              Select time-series prediction boundaries. Intervals scale dynamically.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {horizonSpecs.map((spec) => {
              const isActive = horizon === spec.id;
              return (
                <button
                  key={spec.id}
                  onClick={() => setHorizon(spec.id)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all ${
                    isActive 
                      ? 'bg-teal-500 text-slate-950 border-teal-400 font-bold shadow-md' 
                      : 'bg-slate-950/80 hover:bg-slate-900 border-slate-850 text-slate-400'
                  }`}
                >
                  <span className="text-xs font-extrabold">{spec.name}</span>
                  <span className={`text-[9px] ${isActive ? 'text-slate-950/80' : 'text-slate-500'} font-semibold`}>{spec.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ambient Thermodynamic Controls */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-md flex flex-col justify-between gap-4 col-span-1">
          <div className="space-y-1">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Sliders size={16} className="text-teal-400" />
              <span>Ambient Outdoor Temperature</span>
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold leading-normal">
              Adjust temp to predict thermodynamic chiller compressor load swings.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span>OUTDOOR SETPOINT</span>
              <span className="text-teal-400 font-black">{outdoorTemp}°C</span>
            </div>
            <input
              type="range"
              min="16"
              max="38"
              step="0.5"
              value={outdoorTemp}
              onChange={(e) => setOutdoorTemp(parseFloat(e.target.value))}
              className="w-full accent-teal-500 bg-slate-950 h-2 rounded-lg cursor-pointer border border-slate-850"
            />
            <div className="flex justify-between text-[8px] text-slate-500 font-bold tracking-wide mt-1">
              <span>SPRING COOL (16°C)</span>
              <span>PEAK SUMMER (38°C)</span>
            </div>
          </div>
        </div>

        {/* Pricing Estimator score card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-md grid grid-cols-2 gap-4 items-center col-span-1">
          <div className="space-y-1.5 sm:border-r border-slate-850/80 pr-2">
            <div className="p-1.5 bg-teal-500/10 text-teal-400 rounded-lg w-fit">
              <DollarSign size={14} />
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Forecasted Cost</span>
            <h3 className="text-xl font-black text-slate-100">${metrics.estimated_cost_usd}</h3>
            <p className="text-[9px] text-slate-500 font-semibold">For chosen horizon</p>
          </div>

          <div className="space-y-1.5 pl-2">
            <div className="p-1.5 bg-yellow-500/10 text-yellow-500 rounded-lg w-fit">
              <TrendingDown size={14} />
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Solar Peak Offset</span>
            <h3 className="text-xl font-black text-yellow-500">${metrics.estimated_savings_usd}</h3>
            <p className="text-[9px] text-slate-500 font-semibold">Green solar savings</p>
          </div>
        </div>

      </div>

      {/* Model Scoreboard Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-500 uppercase">Model accuracy (R²)</span>
          <span className="text-xl font-extrabold text-emerald-500 mt-1">{(metrics.r2_score * 100).toFixed(1)}%</span>
        </div>
        <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-500 uppercase">Mean Absolute Error</span>
          <span className="text-xl font-extrabold text-teal-400 mt-1">{metrics.mae_kw.toFixed(2)} kW</span>
        </div>
        <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-500 uppercase">Peak Forecasted Load</span>
          <span className="text-xl font-extrabold text-red-400 mt-1">{metrics.peak_predicted_kw.toFixed(1)} kW</span>
        </div>
        <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-500 uppercase">Forecast Training Speed</span>
          <span className="text-xl font-extrabold text-purple-400 mt-1">{metrics.training_time}</span>
        </div>
      </div>

      {/* Forecast Line Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Sparkles size={16} className="text-teal-400" />
            <span>Predicted Load Profile Curve</span>
          </h3>
          <span className="text-xs text-slate-400 uppercase tracking-widest font-bold bg-slate-950 px-2.5 py-1 border border-slate-855 rounded-xl flex items-center gap-1.5">
            <Zap size={12} className="text-teal-400" /> Model: {modelSpecs.find(s => s.id === model)?.name}
          </span>
        </div>
        
        <div className="h-80 relative">
          {loading && (
            <div className="absolute inset-0 bg-slate-955/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
              <RefreshCw size={32} className="animate-spin text-teal-400" />
            </div>
          )}
          
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={predictions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="predictionPowerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="predictionSolarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)"/>
              <XAxis dataKey="time" stroke="#475569" fontSize={9} />
              <YAxis stroke="#475569" fontSize={9} domain={[0, 'auto']}/>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '11px', color: '#fff' }}/>
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
              <Area type="monotone" name="Predicted Total Load (kW)" dataKey="predicted_power" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#predictionPowerGrad)"/>
              <Area type="monotone" name="Solar Offsetting Feed (kW)" dataKey="predicted_solar" stroke="#eab308" strokeWidth={2} fillOpacity={1} fill="url(#predictionSolarGrad)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Peak Load Predictions Section */}
      {peakPredictions && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-md space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <AlertOctagon size={18} className="text-yellow-500 animate-pulse" />
                <span>AI Peak Load Prediction & Grid Mitigation</span>
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Proactive load distribution diagnostics and grid-shaving recommendations.
              </p>
            </div>
            <span className="text-[9px] font-black uppercase bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-lg tracking-wider">
              High Load Horizon
            </span>
          </div>

          {/* Peak Load Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl flex items-center gap-3">
              <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
                <Clock size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Predicted Peak Time</span>
                <span className="text-lg font-black text-slate-100">{peakPredictions.peak_time || "14:30"}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl flex items-center gap-3">
              <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl">
                <Zap size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Projected Peak Demand</span>
                <span className="text-lg font-black text-teal-450">{peakPredictions.peak_demand_kw || 145.0} kW</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                <Sliders size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Active Power Balance</span>
                <span className="text-lg font-black text-purple-400">Optimizing</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Load Distribution Donut Chart */}
            <div className="p-5 bg-slate-950/45 border border-slate-850 rounded-2xl flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider mb-4">
                  Predicted Peak Load Distribution
                </h4>
                <div className="h-56 flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(peakPredictions.distribution || {}).map(([key, val]) => ({
                          name: key,
                          value: val
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {[
                          '#0ea5e9', // Blue
                          '#14b8a6', // Teal
                          '#ef4444', // Red
                          '#8b5cf6'  // Purple
                        ].map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Absolute Center Text */}
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total Peak</span>
                    <span className="text-sm font-black text-slate-100">{peakPredictions.peak_demand_kw} kW</span>
                  </div>
                </div>
              </div>

              {/* Legend with matching colors */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-900 text-xs">
                {Object.entries(peakPredictions.distribution || {}).map(([key, val], idx) => {
                  const colors = ['bg-sky-500', 'bg-teal-500', 'bg-red-500', 'bg-violet-500'];
                  return (
                    <div key={key} className="flex items-center gap-2 text-slate-400">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colors[idx % colors.length]}`}></span>
                      <span className="truncate">{key}: <strong className="text-slate-200">{val}%</strong></span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Recommendations for Peak Load Mitigation */}
            <div className="p-5 bg-slate-950/45 border border-slate-850 rounded-2xl flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-teal-400" />
                  <span>AI Shifting & Demand Response Directives</span>
                </h4>
                
                <div className="space-y-3">
                  {(peakPredictions.recommendations || []).map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-slate-900/40 border border-slate-850/60 rounded-xl hover:border-slate-800 transition-colors">
                      <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md mt-0.5">
                        0{index + 1}
                      </span>
                      <p className="text-[11px] text-slate-350 font-semibold leading-relaxed">
                        {rec}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-900 text-[10px] text-slate-500 font-bold flex items-center gap-1.5">
                <CheckCircle size={12} className="text-emerald-500" />
                <span>Recommendations applied automatically when Grid Shaving Automation is ACTIVE.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnergyPrediction;
