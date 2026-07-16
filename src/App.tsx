import React, { useState, useEffect } from "react";
import { 
  Shield, LogIn, UserPlus, LogOut, Sun, Moon, Info, Sparkles, 
  HelpCircle, AlertCircle, FileText, CheckCircle2, RefreshCw, Eye, EyeOff
} from "lucide-react";

import { User, Complaint, PublicAsset, DevelopmentProject } from "./types";
import HomeView from "./components/HomeView";
import SchemeRecommendations from "./components/SchemeRecommendations";
import DashboardView from "./components/DashboardView";
import ComplaintForm from "./components/ComplaintForm";
import Chatbot from "./components/Chatbot";

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'schemes' | 'dashboard'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // App Master lists
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [projects, setProjects] = useState<DevelopmentProject[]>([]);
  const [assets, setAssets] = useState<PublicAsset[]>([]);

  // Auth fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRole, setLoginRole] = useState<any>("Citizen");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPanchayat, setRegPanchayat] = useState("Kuttanad Panchayat");
  const [regTaluk, setRegTaluk] = useState("Kuttanad Taluk");
  const [regAge, setRegAge] = useState(35);
  const [regIncome, setRegIncome] = useState(110000);
  const [regOccupation, setRegOccupation] = useState("Farmer");
  const [regLand, setRegLand] = useState("2.5 Acres");
  const [regBPL, setRegBPL] = useState(true);

  // Forgot Password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  // Trigger lodge complaint modal
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load backend static items on startup
  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(data => setProjects(data)).catch(err => console.error(err));
    fetch("/api/assets").then(r => r.json()).then(data => setAssets(data)).catch(err => console.error(err));
    
    // Check local storage for persistent session
    const savedUser = localStorage.getItem("rm_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      loadComplaintsForUser(parsed);
    }
  }, []);

  const loadComplaintsForUser = (currentUser: User) => {
    const query = `email=${currentUser.email}&role=${currentUser.role}&panchayat=${currentUser.location.panchayat || ''}&district=${currentUser.location.district || ''}`;
    fetch(`/api/complaints?${query}`)
      .then((res) => res.json())
      .then((data) => setComplaints(data))
      .catch((err) => console.error("Failed to load complaints:", err));
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        if (rememberMe) {
          localStorage.setItem("rm_user", JSON.stringify(data.user));
        }
        showToast(`Logged in successfully as ${data.user.role}!`, 'success');
        setAuthMode(null);
        setCurrentView('dashboard');
        loadComplaintsForUser(data.user);
      } else {
        const err = await response.json();
        showToast(err.message || "Invalid credentials.", 'error');
      }
    } catch (error) {
      showToast("Backend login API offline. Check connection.", 'error');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) return;

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          phone: regPhone,
          role: "Citizen",
          location: {
            panchayat: regPanchayat,
            taluk: regTaluk,
            district: "Alappuzha",
            state: "Kerala",
          },
          demographics: {
            age: regAge,
            annualIncome: regIncome,
            occupation: regOccupation,
            landSize: regLand,
            hasBPLCard: regBPL,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem("rm_user", JSON.stringify(data.user));
        showToast("Citizen Account registered successfully!", 'success');
        setAuthMode(null);
        setCurrentView('dashboard');
        loadComplaintsForUser(data.user);
      } else {
        const err = await response.json();
        showToast(err.message || "Registration failed.", 'error');
      }
    } catch (error) {
      showToast("Backend registration offline. Check connection.", 'error');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Password recovery link has been simulated & dispatched to ${forgotEmail}.`, 'success');
    setShowForgotModal(false);
    setForgotEmail("");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("rm_user");
    setComplaints([]);
    showToast("Session disconnected securely.", 'info');
    setCurrentView('home');
  };

  // Quick One-Click Logins for Sandbox convenience
  const handleQuickLogin = async (email: string, pass: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem("rm_user", JSON.stringify(data.user));
        showToast(`Instant Sandbox Login: ${data.user.role}!`, 'success');
        setAuthMode(null);
        setCurrentView('dashboard');
        loadComplaintsForUser(data.user);
      }
    } catch (e) {
      showToast("Instant login failed. Is backend online?", 'error');
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className={`min-h-screen font-sans bg-[#fafbf9] text-slate-850 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100 ${isDarkMode ? 'dark' : ''}`}>
      
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border text-xs font-semibold pointer-events-auto animate-slide-left ${
              t.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900' 
                : t.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900'
                : 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900'
            }`}
          >
            {t.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Main Portal Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-850 shadow-sm px-4 py-3.5 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
          <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-700 text-white rounded-xl shadow-md shadow-emerald-600/10">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight leading-none text-emerald-800 dark:text-emerald-400">RuralMind AI</h1>
            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Digital Public Service</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold tracking-wide text-slate-600 dark:text-slate-300">
          <button 
            onClick={() => { setCurrentView('home'); setAuthMode(null); }} 
            className={`hover:text-emerald-600 transition-all ${currentView === 'home' ? 'text-emerald-600' : ''}`}
          >
            Home Overview
          </button>
          <button 
            onClick={() => { setCurrentView('schemes'); setAuthMode(null); }} 
            className={`hover:text-emerald-600 transition-all ${currentView === 'schemes' ? 'text-emerald-600' : ''}`}
          >
            Welfare Schemes
          </button>
          
          {user && (
            <button 
              onClick={() => { setCurrentView('dashboard'); setAuthMode(null); }} 
              className={`hover:text-emerald-600 transition-all ${currentView === 'dashboard' ? 'text-emerald-600' : ''}`}
            >
              Control Portal
            </button>
          )}
        </nav>

        {/* Top Header Utilities */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4.5 h-4.5 text-yellow-400" /> : <Moon className="w-4.5 h-4.5 text-slate-600" />}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:block text-right">
                <p className="text-xs font-bold text-slate-850 dark:text-slate-100">{user.name}</p>
                <p className="text-[9px] text-slate-400 uppercase font-mono">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-rose-50 dark:bg-rose-950/25 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setAuthMode('login')}
                className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" /> Login
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/10 flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" /> Register
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative">
        
        {/* Auth Panels if triggering */}
        {authMode === 'login' && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl flex flex-col md:flex-row my-8">
              
              {/* Left sidebar: Instant Sandbox logins */}
              <div className="md:w-5/12 bg-gradient-to-br from-emerald-800 to-teal-950 text-white p-6 md:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-bold tracking-widest bg-emerald-500/20 px-2.5 py-0.5 rounded-full">Developer Sandbox</span>
                  <h3 className="text-xl font-bold">One-Click Mock Logins</h3>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Instantly login as any preloaded authority or citizen to inspect AI routing workflows and dashboard capabilities.
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    { label: "Rajesh Kumar (Citizen)", email: "citizen@ruralmind.gov.in", pass: "citizen123", color: "bg-white/5 border-white/10 hover:bg-white/10" },
                    { label: "Senthil (Panchayat Officer)", email: "panchayat@ruralmind.gov.in", pass: "officer123", color: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20" },
                    { label: "Meenakshi (Taluk Engineer)", email: "taluk@ruralmind.gov.in", pass: "officer123", color: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20" },
                    { label: "Dr. Ananya IAS (District Officer)", email: "district@ruralmind.gov.in", pass: "officer123", color: "bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20" },
                    { label: "System Administrator (Admin)", email: "admin@ruralmind.gov.in", pass: "admin123", color: "bg-pink-500/10 border-pink-500/20 hover:bg-pink-500/20" },
                  ].map((btn, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickLogin(btn.email, btn.pass)}
                      className={`w-full text-left p-2.5 border rounded-xl font-mono text-[10px] flex justify-between items-center transition-all ${btn.color}`}
                    >
                      <span>{btn.label}</span>
                      <span className="font-bold text-emerald-400">Login ➔</span>
                    </button>
                  ))}
                </div>

                <p className="text-[9px] text-slate-400 italic text-center">Simulates full Spring Security role authorization context.</p>
              </div>

              {/* Right Side: standard form */}
              <div className="md:w-7/12 p-6 md:p-10 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">Secure Gateway Login</h3>
                    <p className="text-xs text-slate-500">Sign in to report damages and verify government subsidies.</p>
                  </div>
                  <button onClick={() => setAuthMode(null)} className="text-slate-400 hover:text-rose-500 font-mono text-sm p-1">✕</button>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Portal Email Address</label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="citizen@ruralmind.gov.in"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Secure Pin / Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-emerald-600"
                      >
                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Utilities */}
                  <div className="flex justify-between items-center text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-500 font-medium">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded text-emerald-600 border-slate-300 w-4 h-4 focus:ring-0"
                      />
                      <span>Remember Me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                    >
                      Forgot Pin?
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10"
                  >
                    Authenticate Session
                  </button>
                </form>

                <p className="text-center text-xs text-slate-400">
                  New to RuralMind?{" "}
                  <button onClick={() => setAuthMode('register')} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                    Create Citizen Account
                  </button>
                </p>
              </div>

            </div>
          </div>
        )}

        {authMode === 'register' && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl my-8">
              
              <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold bg-emerald-500/20 px-2.5 py-0.5 rounded-full">Citizen Registration</span>
                  <h3 className="text-lg font-bold">Create Secure Citizen Account</h3>
                </div>
                <button onClick={() => setAuthMode(null)} className="text-white hover:text-emerald-300 text-sm font-mono p-1">✕</button>
              </div>

              <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh] text-xs">
                
                {/* Basic Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Rajesh Kumar"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Email Address</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="rajesh@gmail.com"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Mobile Number (SMS Updates)</label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Choose Secure PIN</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl"
                    />
                  </div>
                </div>

                {/* Village Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Gram Panchayat</label>
                    <select
                      value={regPanchayat}
                      onChange={(e) => setRegPanchayat(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl"
                    >
                      <option>Kuttanad Panchayat</option>
                      <option>Vembanad Panchayat</option>
                      <option>Kumarakom Panchayat</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Taluk Office</label>
                    <select
                      value={regTaluk}
                      onChange={(e) => setRegTaluk(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl"
                    >
                      <option>Kuttanad Taluk</option>
                      <option>Cherthala Taluk</option>
                    </select>
                  </div>
                </div>

                {/* Demographics */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850 space-y-3">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block font-mono">Demographic Profile (For AI scheme matching)</span>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400">Age</label>
                      <input
                        type="number"
                        value={regAge}
                        onChange={(e) => setRegAge(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400">Annual Income</label>
                      <input
                        type="number"
                        value={regIncome}
                        onChange={(e) => setRegIncome(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400">Occupation</label>
                      <select
                        value={regOccupation}
                        onChange={(e) => setRegOccupation(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none"
                      >
                        <option>Farmer</option>
                        <option>Agricultural Laborer</option>
                        <option>Unemployed Graduate</option>
                        <option>Self-Employed Artisan</option>
                        <option>Other / Student</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400">Agri Landholding</label>
                      <select
                        value={regLand}
                        onChange={(e) => setRegLand(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                      >
                        <option>0 Acres (Landless)</option>
                        <option>1.2 Acres (Marginal)</option>
                        <option>2.5 Acres (Small)</option>
                        <option>5.0 Acres (Medium)</option>
                      </select>
                    </div>
                    <div className="flex flex-col justify-end pb-1.5 space-y-1">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-bold">
                        <input
                          type="checkbox"
                          checked={regBPL}
                          onChange={(e) => setRegBPL(e.target.checked)}
                          className="rounded text-emerald-600 border-slate-300 w-4 h-4"
                        />
                        <span>Below Poverty Line (BPL) Card</span>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10"
                >
                  Confirm Registration
                </button>
              </form>
            </div>
          </div>
        )}

        {/* FORGOT PASSWORD MODAL */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <h4 className="font-bold text-slate-800 dark:text-slate-100">Recover Portal PIN</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Enter your registered email below. The system will dispatch an automated PIN reset OTP to your mobile and email.</p>
              
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="e.g. rajesh@gmail.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none"
                />
                
                <div className="flex gap-2 text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-950 rounded-xl text-slate-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-xl"
                  >
                    Send PIN Link
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* COMPLAINT REGISTRY FORM MODAL */}
        {showComplaintModal && user && (
          <ComplaintForm
            userEmail={user.email}
            onComplaintSubmitted={(newC) => {
              setComplaints((prev) => [newC, ...prev]);
              setShowComplaintModal(false);
              showToast("Complaint registered & routed successfully!", 'success');
            }}
            onClose={() => setShowComplaintModal(false)}
          />
        )}

        {/* View Router */}
        {currentView === 'home' && (
          <HomeView 
            onNavigateToAuth={(mode, role) => {
              setAuthMode(mode);
              if (role) setLoginRole(role);
            }} 
            stats={{
              totalComplaints: complaints.length || 3,
              resolvedComplaints: complaints.filter(c => c.status === "RESOLVED").length || 1,
              activeProjects: projects.length || 3,
              managedAssets: assets.length || 4,
            }}
          />
        )}

        {currentView === 'schemes' && (
          <SchemeRecommendations
            userDemographics={{
              age: user?.demographics?.age || regAge,
              annualIncome: user?.demographics?.annualIncome || regIncome,
              occupation: user?.demographics?.occupation || regOccupation,
              landSize: user?.demographics?.landSize || regLand,
              hasBPLCard: user?.demographics?.hasBPLCard || regBPL,
            }}
            onUpdateDemographics={(updatedDemo) => {
              if (user) {
                const updatedUser = { ...user, demographics: updatedDemo };
                setUser(updatedUser);
                localStorage.setItem("rm_user", JSON.stringify(updatedUser));
              }
            }}
          />
        )}

        {currentView === 'dashboard' && user && (
          <DashboardView
            user={user}
            onOpenComplaintForm={() => setShowComplaintModal(true)}
            complaints={complaints}
            onUpdateComplaints={(newTree) => setComplaints(newTree)}
            projects={projects}
            assets={assets}
            onAddProject={(newP) => setProjects((prev) => [newP, ...prev])}
            onAddAsset={(newA) => setAssets((prev) => [newA, ...prev])}
            onUpdateProject={(id, status, progress) => {
              fetch(`/api/projects/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, progress })
              })
                .then(r => r.json())
                .then(updated => {
                  setProjects((prev) => prev.map(p => p.id === updated.id ? updated : p));
                  showToast(`Project work advanced to ${progress}%`, 'success');
                });
            }}
          />
        )}

      </main>

      {/* Floating AI Chatbot */}
      <Chatbot user={user} />
    </div>
  );
}
