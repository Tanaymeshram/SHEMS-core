import React, { useState, useEffect } from 'react';
import { api } from './services/api';

// Page imports
import Dashboard from './pages/Dashboard';
import HvacOptimization from './pages/HvacOptimization';
import EnergyPrediction from './pages/EnergyPrediction';
import EquipmentMonitoring from './pages/EquipmentMonitoring';
import OccupancyAnalytics from './pages/OccupancyAnalytics';
import Renewables from './pages/Renewables';
import CarbonFootprint from './pages/CarbonFootprint';
import AlertsPanel from './pages/AlertsPanel';
import Maintenance from './pages/Maintenance';
import Settings from './pages/Settings';
import AIAssistant from './pages/AIAssistant';
import EmergencyCommandCenter from './pages/EmergencyCommandCenter';
import ResearchAnalytics from './pages/ResearchAnalytics';
import DataIngestion from './pages/DataIngestion';
import EnergyAnalytics from './pages/EnergyAnalytics';
import AnomalyDetection from './pages/AnomalyDetection';

// Icons
import {
  Activity,
  Thermometer,
  TrendingUp,
  Monitor,
  Users,
  Sun,
  Shield,
  Bell,
  Settings as SettingsIcon,
  LogOut,
  Moon,
  SunDim,
  User,
  Zap,
  Leaf,
  Bot,
  ShieldAlert,
  BarChart,
  UploadCloud,
  BookOpen,
  AlertOctagon
} from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [theme, setTheme] = useState('dark'); // Sleek hospital dark mode by default
  const [alerts, setAlerts] = useState([]);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
  const [liveData, setLiveData] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  
  // Auth state inputs
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState('Technician');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Check login on startup
  useEffect(() => {
    const activeUser = api.getCurrentUser();
    if (activeUser) {
      setUser(activeUser);
    }
    
    // Set default dark class on document
    document.documentElement.classList.add('dark');
  }, []);

  // Fetch live dashboard & alerts periodically
  useEffect(() => {
    if (!user) return;

    const fetchLiveStats = async () => {
      try {
        const data = await api.getLiveDashboard();
        setLiveData(data);
        
        const allAlerts = await api.getAlerts();
        setAlerts(allAlerts);
        setUnreadAlertsCount(allAlerts.filter(a => !a.resolved).length);
      } catch (err) {
        console.error("Live statistics fetch error:", err);
      }
    };

    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 3000); // Pool every 3 seconds for active charts
    return () => clearInterval(interval);
  }, [user]);

  // Toggle Theme
  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    } else {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  };

  // Authenticate user
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const loggedUser = await api.login(usernameInput, passwordInput);
      setUser(loggedUser);
      setUsernameInput('');
      setPasswordInput('');
    } catch (err) {
      setAuthError(err.message || 'Login failed.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    try {
      await api.register(usernameInput, passwordInput, nameInput, roleInput);
      setAuthSuccess('Account registered successfully! Please log in.');
      setAuthMode('login');
      setNameInput('');
      setUsernameInput('');
      setPasswordInput('');
    } catch (err) {
      setAuthError(err.message || 'Registration failed.');
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setCurrentPage('dashboard');
  };

  // Resolve alert directly from top panel
  const handleResolveAlert = async (id) => {
    try {
      await api.resolveAlert(id);
      const allAlerts = await api.getAlerts();
      setAlerts(allAlerts);
      setUnreadAlertsCount(allAlerts.filter(a => !a.resolved).length);
    } catch (err) {
      console.error(err);
    }
  };

  // Navigation Panel List
  const navItems = [
    { id: 'dashboard', name: 'Dashboard Home', icon: Activity },
    { id: 'ingestion', name: 'Data Ingestion', icon: UploadCloud },
    { id: 'analytics', name: 'Energy Analytics', icon: BarChart },
    { id: 'hvac', name: 'HVAC Optimization', icon: Thermometer },
    { id: 'predictions', name: 'AI Predictions', icon: TrendingUp },
    { id: 'equipment', name: 'Medical Equipment', icon: Monitor },
    { id: 'occupancy', name: 'Occupancy Analytics', icon: Users },
    { id: 'research', name: 'Research Analytics', icon: BookOpen },
    { id: 'renewables', name: 'Renewable Power', icon: Sun },
    { id: 'carbon', name: 'Carbon Tracking', icon: Leaf },
    { id: 'maintenance', name: 'Predictive Health', icon: Shield },
    { id: 'anomalies', name: 'Anomaly Scanners', icon: AlertOctagon },
    { id: 'emergency', name: 'Emergency Grid', icon: ShieldAlert },
    { id: 'alerts', name: 'Alerts & Logs', icon: Bell, badge: true },
    { id: 'assistant', name: 'AI Copilot Chat', icon: Bot },
    { id: 'settings', name: 'BEMS Settings', icon: SettingsIcon }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans relative overflow-hidden">
        {/* Animated Background Lights */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl animate-pulse-slow"></div>

        <div className="w-full max-w-md p-8 rounded-2xl glass-panel relative z-10 border border-slate-700/50 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="p-4 bg-clinical-600/20 rounded-2xl mb-3 text-cyan-400 glow-active">
              <Zap size={36} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              SHEMS Admin Console
            </h1>
            <p className="text-slate-400 text-xs mt-1 text-center">
              AI-Powered Smart Hospital Energy Optimization
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded-lg text-red-300 text-sm text-center">
              {authError}
            </div>
          )}

          {authSuccess && (
            <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm text-center">
              {authSuccess}
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">USERNAME</label>
                <input
                  type="text"
                  required
                  placeholder="admin, manager, or tech"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">PASSWORD</label>
                <input
                  type="password"
                  required
                  placeholder="admin123, manager123, or tech123"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg text-sm"
              >
                Access Dashboard
              </button>
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(''); }}
                  className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  Create technician account
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">FULL NAME</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">USERNAME</label>
                <input
                  type="text"
                  required
                  placeholder="johndoe"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">PASSWORD</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ROLE</label>
                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm text-white"
                >
                  <option value="Technician">Technician</option>
                  <option value="Energy Manager">Energy Manager</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg text-sm"
              >
                Register Credentials
              </button>
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  Back to login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Active page renderer
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard liveData={liveData} alerts={alerts} onNavigate={setCurrentPage} />;
      case 'ingestion':
        return <DataIngestion liveData={liveData} />;
      case 'analytics':
        return <EnergyAnalytics liveData={liveData} />;
      case 'hvac':
        return <HvacOptimization liveData={liveData} userRole={user.role} />;
      case 'predictions':
        return <EnergyPrediction liveData={liveData} />;
      case 'equipment':
        return <EquipmentMonitoring liveData={liveData} userRole={user.role} />;
      case 'occupancy':
        return <OccupancyAnalytics liveData={liveData} />;
      case 'research':
        return <ResearchAnalytics liveData={liveData} />;
      case 'renewables':
        return <Renewables liveData={liveData} />;
      case 'carbon':
        return <CarbonFootprint liveData={liveData} />;
      case 'alerts':
        return <AlertsPanel alerts={alerts} onResolveAlert={handleResolveAlert} />;
      case 'maintenance':
        return <Maintenance liveData={liveData} userRole={user.role} />;
      case 'anomalies':
        return <AnomalyDetection />;
      case 'emergency':
        return <EmergencyCommandCenter liveData={liveData} />;
      case 'assistant':
        return <AIAssistant />;
      case 'settings':
        return <Settings liveData={liveData} userRole={user.role} onResetDb={() => handleLogout()} />;
      default:
        return <Dashboard liveData={liveData} alerts={alerts} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-300 font-sans`}>
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-md flex flex-col justify-between fixed h-full z-20">
        <div>
          {/* Logo Header */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
            <div className="p-2 bg-clinical-500/20 text-clinical-500 rounded-xl glow-active">
              <Zap size={22} />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight tracking-wide bg-gradient-to-r from-clinical-400 to-emerald-400 bg-clip-text text-transparent">
                SHEMS Core
              </h2>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-widest mt-0.5">
                Hospital BEMS
              </span>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="p-4 m-3 bg-slate-100 dark:bg-slate-800/40 rounded-xl flex items-center gap-3 border border-slate-200 dark:border-slate-800/20">
            <div className="p-2 bg-clinical-500/20 text-clinical-400 rounded-full">
              <User size={18} />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{user.name}</h4>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">{user.role}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 mt-4 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] pr-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-clinical-600 to-clinical-500 text-white shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-clinical-400'} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && unreadAlertsCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-red-500 text-white rounded-full scale-95 glow-alarm">
                      {unreadAlertsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN LAYOUT SHELL */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        
        {/* Top bar header */}
        <header className="h-16 px-8 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse glow-active"></span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Live IoT Feed Connected
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Clock Widget */}
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
              {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-500 dark:text-slate-400 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <SunDim size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification Badge */}
            <button
              onClick={() => setCurrentPage('alerts')}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-500 dark:text-slate-400 transition-colors relative"
            >
              <Bell size={18} />
              {unreadAlertsCount > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full glow-alarm"></span>
              )}
            </button>
          </div>
        </header>

        {/* Page Mounting Container */}
        <main className="flex-1 p-8 overflow-y-auto">
          {renderPage()}
        </main>
      </div>

    </div>
  );
}

export default App;
