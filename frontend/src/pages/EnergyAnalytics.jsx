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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  BarChart as BarIcon,
  Clock,
  Calendar,
  Grid,
  Cpu,
  Download,
  Building,
  Zap,
  TrendingUp,
  Activity,
  Maximize2
} from 'lucide-react';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function EnergyAnalytics({ liveData }) {
  const [timeframe, setTimeframe] = useState('hourly'); // hourly, daily, weekly, monthly
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const data = await api.getEnergyAnalytics();
        setAnalyticsData(data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-4">
        <Activity size={40} className="animate-spin text-teal-400" />
        <span className="text-sm font-semibold">Aggregating historical utility logs...</span>
      </div>
    );
  }

  // Get active chart data based on selected timeframe
  const getChartData = () => {
    switch (timeframe) {
      case 'hourly':
        return analyticsData.hourly;
      case 'daily':
        return analyticsData.daily;
      case 'weekly':
        return analyticsData.weekly;
      case 'monthly':
        return analyticsData.monthly;
      default:
        return analyticsData.hourly;
    }
  };

  const activeChartData = getChartData();

  // Find totals & averages
  const avgLoad = activeChartData.reduce((sum, item) => sum + item.power, 0) / activeChartData.length;
  const maxLoad = Math.max(...activeChartData.map(item => item.power));
  const totalSolar = activeChartData.reduce((sum, item) => sum + (item.solar || 0), 0);

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <BarIcon className="text-teal-450 text-teal-400" size={28} />
            <span>Energy Analytics Dashboard</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Historical utility tracking, multi-dimensional load distributions, and floor/equipment allocations.
          </p>
        </div>

        {/* Exporter Controls */}
        <div className="flex items-center gap-3 bg-slate-900/60 p-2 border border-slate-800 rounded-xl">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="bg-slate-950 text-xs font-bold text-slate-300 border border-slate-800 px-2 py-1.5 rounded-lg focus:outline-none"
          >
            <option value="csv">Standard CSV</option>
            <option value="excel">MS Excel (.xls)</option>
          </select>
          <a
            href={api.getReportExportUrl('energy', exportFormat)}
            download
            className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md"
          >
            <Download size={14} />
            <span>Download Data</span>
          </a>
        </div>
      </div>

      {/* Timeframe Selector & Chart Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="text-teal-400" size={16} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Consumption Profile over Time</h3>
          </div>
          
          {/* Timeframe Tab Buttons */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
            {['hourly', 'daily', 'weekly', 'monthly'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  timeframe === tf 
                    ? 'bg-teal-500 text-slate-950 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Metric Cards inside Chart */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-400">
          <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-900">
            <span className="text-[10px] text-slate-500 block uppercase">Average Load</span>
            <span className="text-base font-extrabold text-slate-100">{avgLoad.toFixed(1)} kW/h</span>
          </div>
          <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-900">
            <span className="text-[10px] text-slate-500 block uppercase">Peak Demand</span>
            <span className="text-base font-extrabold text-red-400">{maxLoad.toFixed(1)} kW</span>
          </div>
          <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-900">
            <span className="text-[10px] text-slate-500 block uppercase">Total Solar Offset</span>
            <span className="text-base font-extrabold text-yellow-500">{totalSolar.toFixed(1)} kWh</span>
          </div>
        </div>

        {/* Large Profile Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsPowerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="analyticsSolarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)"/>
              <XAxis dataKey="label" stroke="#475569" fontSize={9} />
              <YAxis stroke="#475569" fontSize={9} domain={[0, 'auto']}/>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '11px', color: '#fff' }}/>
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
              <Area type="monotone" name="Total Power Draw (kW)" dataKey="power" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#analyticsPowerGrad)"/>
              <Area type="monotone" name="Solar Offsetting Feed (kW)" dataKey="solar" stroke="#eab308" strokeWidth={2} fillOpacity={1} fill="url(#analyticsSolarGrad)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Department Wise Allocation */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-md space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
            <Building className="text-teal-400" size={16} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Department Wise Load</h3>
          </div>
          
          <div className="h-60 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.departments}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {analyticsData.departments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(1)} kWh`} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', fontSize: '11px', color: '#fff' }}/>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center label */}
            <div className="absolute flex flex-col items-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Weekly Total</span>
              <span className="text-lg font-black text-slate-100">
                {analyticsData.departments.reduce((sum, item) => sum + item.value, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="text-[9px] text-slate-500 font-bold uppercase">kWh</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-400">
            {analyticsData.departments.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="truncate" title={item.name}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Floor Wise Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-md space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
            <Grid className="text-teal-400" size={16} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Floor Wise Distribution</h3>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.floors} margin={{ left: -20, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" stroke="#475569" fontSize={8} />
                <YAxis stroke="#475569" fontSize={9} />
                <Tooltip formatter={(value) => `${value.toFixed(1)} kWh`} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', fontSize: '11px', color: '#fff' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={35}>
                  {analyticsData.floors.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] text-slate-500 font-medium leading-normal text-center">
            Floor 2 containing high-intensity ICU ventilators & OT surgery suites accounts for the highest draw ratio.
          </div>
        </div>

        {/* 3. Top Equipment Energy Consumers */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-md space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
            <Cpu className="text-teal-400" size={16} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Top Equipment Ranks</h3>
          </div>

          <div className="h-60 flex flex-col justify-center gap-3.5 pr-2">
            {analyticsData.equipment.map((item, idx) => {
              const maxVal = analyticsData.equipment[0].value;
              const ratio = (item.value / maxVal) * 100;
              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-slate-200 truncate pr-2 max-w-[150px]">{item.name}</span>
                    <span className="text-slate-400 text-[10px] font-extrabold">{item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })} kWh</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden flex">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-teal-500 to-teal-400" 
                      style={{ width: `${ratio}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-500 font-medium text-center border-t border-slate-850 pt-2 flex items-center justify-center gap-1">
            <Zap size={10} className="text-yellow-500 animate-pulse" />
            <span>Cumulative consumption is tracked as (Runtime * Power draw).</span>
          </div>
        </div>

      </div>

    </div>
  );
}

export default EnergyAnalytics;
