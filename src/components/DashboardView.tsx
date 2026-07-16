import React, { useState, useEffect } from "react";
import { 
  FileText, CheckCircle, Activity, Layers, AlertTriangle, 
  MapPin, Clock, Search, Filter, Sparkles, Plus, Send, 
  TrendingUp, Award, MessageSquare, ShieldAlert, Star, RefreshCw, BarChart2,
  Phone, Mail, Settings, CheckCircle2, User, Users
} from "lucide-react";
import { Complaint, PublicAsset, DevelopmentProject, User as UserType, OfficerPerformance, NotificationLog } from "../types";

interface DashboardViewProps {
  user: UserType;
  onOpenComplaintForm: () => void;
  complaints: Complaint[];
  onUpdateComplaints: (updated: Complaint[]) => void;
  projects: DevelopmentProject[];
  assets: PublicAsset[];
  onAddProject: (p: DevelopmentProject) => void;
  onAddAsset: (a: PublicAsset) => void;
  onUpdateProject: (id: string, status: any, progress: number) => void;
}

export default function DashboardView({
  user,
  onOpenComplaintForm,
  complaints,
  onUpdateComplaints,
  projects,
  assets,
  onAddProject,
  onAddAsset,
  onUpdateProject
}: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<'complaints' | 'assets' | 'projects' | 'analytics' | 'officers' | 'notifications' | 'users'>('complaints');
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  
  // Officer interaction states
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [remarksText, setRemarksText] = useState("");
  const [transitionStatus, setTransitionStatus] = useState<any>("IN_PROGRESS");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Citizen feedback state
  const [showFeedbackModal, setShowFeedbackModal] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [feedbackRemarks, setFeedbackRemarks] = useState("");

  // AI Report State
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);

  // Officer stats and Logs
  const [officers, setOfficers] = useState<OfficerPerformance[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);

  // New Asset Form State
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: "", category: "Water Supply", location: "", healthStatus: "GOOD" as any, description: "" });

  // New Project Form State
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "", budget: "₹5,00,000", completionDate: "2026-10-30" });

  useEffect(() => {
    // Fetch logs, officers, and all users for Admin
    fetch("/api/officers").then(r => r.json()).then(data => setOfficers(data)).catch(err => console.error(err));
    fetch("/api/logs").then(r => r.json()).then(data => setLogs(data)).catch(err => console.error(err));
    
    // Set mock local users just for administrative view
    setAllUsers([
      { id: "u-1", name: "Rajesh Kumar", email: "citizen@ruralmind.gov.in", role: "Citizen", phone: "+91 98765 43210", location: { panchayat: "Kuttanad Panchayat", taluk: "Kuttanad Taluk", district: "Alappuzha", state: "Kerala" } },
      { id: "u-2", name: "Senthil Balaji", email: "panchayat@ruralmind.gov.in", role: "Panchayat Officer", phone: "+91 98765 43211", location: { panchayat: "Kuttanad Panchayat", taluk: "Kuttanad Taluk", district: "Alappuzha", state: "Kerala" } },
      { id: "u-3", name: "Meenakshi Sundaram", email: "taluk@ruralmind.gov.in", role: "Taluk Officer", phone: "+91 98765 43212", location: { panchayat: "Kuttanad Panchayat", taluk: "Kuttanad Taluk", district: "Alappuzha", state: "Kerala" } },
      { id: "u-4", name: "Dr. Ananya Nair IAS", email: "district@ruralmind.gov.in", role: "District Officer", phone: "+91 98765 43213", location: { panchayat: "Kuttanad Panchayat", taluk: "Kuttanad Taluk", district: "Alappuzha", state: "Kerala" } },
    ]);
  }, []);

  // Filter complaints list
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Complaint statistics
  const pendingCount = complaints.filter(c => c.status === "PENDING" || c.status === "ASSIGNED").length;
  const progressCount = complaints.filter(c => c.status === "IN_PROGRESS").length;
  const resolvedCount = complaints.filter(c => c.status === "RESOLVED").length;

  const handleStatusTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/complaints/${selectedComplaint.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: transitionStatus,
          remarks: remarksText,
          actor: user.name + ` (${user.role})`
        })
      });

      if (response.ok) {
        const updatedObj: Complaint = await response.json();
        // Update local complaint tree
        const newTree = complaints.map((c) => c.id === updatedObj.id ? updatedObj : c);
        onUpdateComplaints(newTree);
        setSelectedComplaint(null);
        setRemarksText("");
        // Reload logs
        fetch("/api/logs").then(r => r.json()).then(data => setLogs(data));
      } else {
        alert("Status update failed.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showFeedbackModal) return;

    try {
      const response = await fetch(`/api/complaints/${showFeedbackModal}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: ratingValue,
          remarks: feedbackRemarks
        })
      });

      if (response.ok) {
        const updatedObj: Complaint = await response.json();
        const newTree = complaints.map((c) => c.id === updatedObj.id ? updatedObj : c);
        onUpdateComplaints(newTree);
        setShowFeedbackModal(null);
        setFeedbackRemarks("");
      } else {
        alert("Feedback submission failed.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAIReportGenerate = async () => {
    setIsGeneratingReport(true);
    setAiReport(null);

    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panchayatName: user.location.panchayat || "Kuttanad Panchayat" })
      });

      if (res.ok) {
        const data = await res.json();
        setAiReport(data);
      } else {
        alert("Failed to generate strategic AI report.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleAddAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAsset.name,
          category: newAsset.category,
          location: newAsset.location || (user.location.panchayat || "Kuttanad Ward 1"),
          healthStatus: newAsset.healthStatus,
          description: newAsset.description,
        })
      });
      if (res.ok) {
        const created = await res.json();
        onAddAsset(created);
        setShowAddAssetModal(false);
        setNewAsset({ name: "", category: "Water Supply", location: "", healthStatus: "GOOD", description: "" });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProject.name,
          description: newProject.description,
          budget: newProject.budget,
          completionDate: newProject.completionDate,
          authority: user.role,
        })
      });
      if (res.ok) {
        const created = await res.json();
        onAddProject(created);
        setShowAddProjectModal(false);
        setNewProject({ name: "", description: "", budget: "₹5,00,000", completionDate: "2026-10-30" });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic welcome header bar */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-950 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl"></div>
        
        <div className="space-y-1.5">
          <span className="text-[9px] uppercase font-bold tracking-widest bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
            {user.role} Console
          </span>
          <h2 className="text-2xl font-bold">Welcome, {user.name}</h2>
          <p className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" /> 
            {user.location.panchayat ? `${user.location.panchayat}, ` : ""}{user.location.taluk ? `${user.location.taluk}, ` : ""}{user.location.district ? `${user.location.district}, ` : ""}{user.location.state}
          </p>
        </div>

        {user.role === "Citizen" ? (
          <button
            onClick={onOpenComplaintForm}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Lodge Complaint Ticket
          </button>
        ) : (
          <button
            onClick={handleAIReportGenerate}
            disabled={isGeneratingReport}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0"
          >
            {isGeneratingReport ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" /> Fetching AI Review...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> AI Strategic Report
              </>
            )}
          </button>
        )}
      </div>

      {/* KPI stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Tickets</span>
          <span className="text-2xl font-mono font-bold text-slate-800 dark:text-slate-100">{complaints.length}</span>
          <div className="text-[9px] text-slate-400 mt-1 uppercase">Village cumulative database</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-rose-400 block tracking-wider">Pending / Assigned</span>
          <span className="text-2xl font-mono font-bold text-rose-600">{pendingCount}</span>
          <div className="text-[9px] text-rose-400 mt-1 uppercase">Immediate actions required</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-blue-400 block tracking-wider">In Progress</span>
          <span className="text-2xl font-mono font-bold text-blue-600">{progressCount}</span>
          <div className="text-[9px] text-blue-400 mt-1 uppercase">Active labor dispatched</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">Resolved</span>
          <span className="text-2xl font-mono font-bold text-emerald-600">{resolvedCount}</span>
          <div className="text-[9px] text-emerald-400 mt-1 uppercase">Fully repaired & completed</div>
        </div>
      </div>

      {/* Segment tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-850 gap-4 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('complaints')}
          className={`pb-3.5 px-1 transition-all ${
            activeTab === 'complaints' 
              ? "border-b-2 border-emerald-600 text-emerald-600 dark:text-emerald-400" 
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          Complaint Tickets
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`pb-3.5 px-1 transition-all ${
            activeTab === 'assets' 
              ? "border-b-2 border-emerald-600 text-emerald-600 dark:text-emerald-400" 
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          Public Asset Register
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3.5 px-1 transition-all ${
            activeTab === 'projects' 
              ? "border-b-2 border-emerald-600 text-emerald-600 dark:text-emerald-400" 
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          Development Projects
        </button>

        {user.role !== "Citizen" && (
          <button
            onClick={() => setActiveTab('officers')}
            className={`pb-3.5 px-1 transition-all ${
              activeTab === 'officers' 
                ? "border-b-2 border-emerald-600 text-emerald-600 dark:text-emerald-400" 
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            Officer Performance
          </button>
        )}

        {user.role === "Admin" && (
          <>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`pb-3.5 px-1 transition-all ${
                activeTab === 'notifications' 
                  ? "border-b-2 border-emerald-600 text-emerald-600 dark:text-emerald-400" 
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              SMS & Email Dispatch Logs
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-3.5 px-1 transition-all ${
                activeTab === 'users' 
                  ? "border-b-2 border-emerald-600 text-emerald-600 dark:text-emerald-400" 
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              User Management
            </button>
          </>
        )}
      </div>

      {/* AI STRATEGIC REPORT DISPLAY */}
      {aiReport && (
        <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4 animate-fade-in relative">
          <button 
            onClick={() => setAiReport(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white font-mono text-sm"
          >
            ✕
          </button>
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <h4 className="text-sm uppercase tracking-wider">AI Strategist Review & Budget recommendation</h4>
          </div>
          
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-[10.5px] font-mono text-teal-300">
            <span className="font-bold block uppercase text-[8px] text-slate-500">Suggested Action Budget Shift:</span>
            {aiReport.recommendedBudgetShifts}
          </div>

          <div className="text-xs text-slate-300 leading-relaxed max-h-96 overflow-y-auto space-y-3 font-mono border-t border-white/5 pt-4">
            {/* Extremely simple formatter for MD lines to avoid packages */}
            {aiReport.markdownReport.split("\n").map((line: string, i: number) => {
              if (line.startsWith("###")) {
                return <h5 key={i} className="font-bold text-sm text-emerald-300 pt-2">{line.replace("###", "")}</h5>;
              }
              if (line.startsWith("**")) {
                return <p key={i} className="font-semibold text-slate-100 pt-1">{line}</p>;
              }
              return <p key={i}>{line}</p>;
            })}
          </div>
        </div>
      )}

      {/* Tab Contents: Complaints */}
      {activeTab === 'complaints' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Search ticket ID or text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-850 dark:text-white focus:outline-none"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 focus:outline-none"
              >
                <option>All</option>
                <option>Water Supply</option>
                <option>Roads & Transport</option>
                <option>Sanitation & Waste</option>
                <option>Streetlights</option>
                <option>Public Health</option>
                <option>Education</option>
              </select>
            </div>
            
            <p className="text-xs font-mono text-slate-400">Showing {filteredComplaints.length} tickets</p>
          </div>

          {/* Active Complaint Grid */}
          <div className="grid md:grid-cols-5 gap-8">
            {/* List */}
            <div className="md:col-span-3 space-y-4">
              {filteredComplaints.map((c) => {
                const isDup = c.duplicateCheck?.isDuplicate;
                return (
                  <div 
                    key={c.id} 
                    onClick={() => setSelectedComplaint(c)}
                    className={`p-5 bg-white dark:bg-slate-900 rounded-2xl border transition-all cursor-pointer shadow-sm flex flex-col justify-between ${
                      selectedComplaint?.id === c.id 
                        ? "border-emerald-600 shadow-md shadow-emerald-600/5 bg-slate-50/20" 
                        : "border-slate-200 dark:border-slate-800 hover:border-emerald-400/30"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-[9px] uppercase font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
                            {c.category}
                          </span>
                          <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full ${
                            c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : c.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {c.status}
                          </span>
                          {isDup && (
                            <span className="text-[9px] uppercase font-mono px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> Duplicate Grouped
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 uppercase">{c.id}</span>
                      </div>
                      
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base">{c.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{c.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {c.location.address}</span>
                      <span>{new Date(c.createdDate).toLocaleDateString()}</span>
                    </div>

                    {/* Submit Citizen Rating Button */}
                    {user.role === "Citizen" && c.status === "RESOLVED" && !c.feedback && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFeedbackModal(c.id);
                        }}
                        className="mt-3 py-1.5 w-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" /> Share Repair Feedback & Rating
                      </button>
                    )}
                  </div>
                );
              })}

              {filteredComplaints.length === 0 && (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-850">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No complaints registered</h4>
                  <p className="text-xs text-slate-400">Click Lodge Complaint above to create your first AI-routed concern.</p>
                </div>
              )}
            </div>

            {/* Sidebar Details Panel */}
            <div className="md:col-span-2">
              {selectedComplaint ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-850 shadow-md space-y-5 sticky top-28">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base">Audit Timeline Review</h3>
                    <span className="text-[10px] font-mono text-teal-600 font-bold uppercase">Active Ticket</span>
                  </div>

                  {selectedComplaint.imageUrl && (
                    <img 
                      src={selectedComplaint.imageUrl} 
                      alt="Uploaded incident concern" 
                      className="rounded-xl max-h-48 w-full object-cover border border-slate-200 dark:border-slate-800"
                    />
                  )}

                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase">Assigned Authority Target</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{selectedComplaint.assignedAuthority}</p>
                  </div>

                  {/* If officer, show Status Transition Controls */}
                  {user.role !== "Citizen" && selectedComplaint.status !== "RESOLVED" && (
                    <form onSubmit={handleStatusTransition} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-3">
                      <span className="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block font-mono">Transition Ticket Status</span>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <select
                          value={transitionStatus}
                          onChange={(e) => setTransitionStatus(e.target.value as any)}
                          className="px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                        >
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="RESOLVED">RESOLVED / REPAIRED</option>
                          <option value="REJECTED">REJECTED / OUT-OF-SCOPE</option>
                        </select>
                        <button
                          type="submit"
                          disabled={isUpdatingStatus}
                          className="py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg uppercase text-[10px] tracking-wider transition-all"
                        >
                          {isUpdatingStatus ? "Updating..." : "Commit Status"}
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400 block">Status Remarks</label>
                        <input
                          type="text"
                          required
                          value={remarksText}
                          onChange={(e) => setRemarksText(e.target.value)}
                          placeholder="e.g. Dispatched local plumber to repair the pump."
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        />
                      </div>
                    </form>
                  )}

                  {/* Real-time Tracking Timeline */}
                  <div className="space-y-3">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Historical Audit Trails</span>
                    
                    <div className="relative pl-4 border-l border-slate-200 dark:border-slate-800 space-y-4 text-xs font-mono">
                      {selectedComplaint.trackingTimeline.map((node, i) => (
                        <div key={i} className="relative">
                          <span className="absolute -left-[20.5px] top-1.5 bg-emerald-600 text-white rounded-full w-3 h-3 border-2 border-white dark:border-slate-950"></span>
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-slate-400">{new Date(node.timestamp).toLocaleString()}</span>
                            <p className="font-bold text-slate-800 dark:text-slate-100">{node.status} – {node.actor}</p>
                            <p className="text-slate-500 text-[10px]">{node.remarks}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Details if resolved */}
                  {selectedComplaint.feedback && (
                    <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="font-bold text-emerald-800 dark:text-emerald-400">Citizen Rating Feedback</span>
                        <div className="flex text-amber-500">
                          {Array.from({ length: selectedComplaint.feedback.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 italic">" {selectedComplaint.feedback.remarks} "</p>
                    </div>
                  )}

                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-dashed border-slate-200 dark:border-slate-850 text-center text-xs text-slate-400 min-h-[300px] flex flex-col items-center justify-center space-y-2 sticky top-28">
                  <Clock className="w-8 h-8 text-slate-300" />
                  <h4 className="font-bold text-slate-700 dark:text-slate-300">No ticket selected</h4>
                  <p className="max-w-[200px] mx-auto">Click any registered complaint ticket on the left to verify its real-time AI-routing logs, coordinates and damage report.</p>
                </div>
              )}
            </div>
          </div>

          {/* INTEGRATED INTERACTIVE SVG MAP SECTION */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">Kuttanad Ward Map</span>
              <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                <MapPin className="w-5 h-5 text-emerald-600" /> Village Complaint Incident Heat Map
              </h3>
              <p className="text-xs text-slate-500">
                Vectorized GIS coordinates plotting active public utility leaks, pothole counts, and blackout streetlights across Kuttanad's administrative divisions.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 items-center">
              {/* GIS visual representation */}
              <div className="md:col-span-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 flex justify-center">
                <svg viewBox="0 0 500 220" className="w-full max-w-lg">
                  {/* Ward polygons */}
                  <polygon points="50,20 150,15 130,100 40,80" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.5" />
                  <text x="90" y="50" fontSize="8" fill="#14532d" fontWeight="bold">Ward 1 (Library)</text>

                  <polygon points="150,15 280,30 250,110 130,100" fill="#f0f9ff" stroke="#7dd3fc" strokeWidth="1.5" />
                  <text x="190" y="60" fontSize="8" fill="#0c4a6e" fontWeight="bold">Ward 2 (Borewell)</text>

                  <polygon points="40,80 130,100 110,190 20,170" fill="#faf5ff" stroke="#d8b4fe" strokeWidth="1.5" />
                  <text x="70" y="140" fontSize="8" fill="#581c87" fontWeight="bold">Ward 3 (Canals)</text>

                  <polygon points="130,100 250,110 230,200 110,190" fill="#fdf2f8" stroke="#fbcfe8" strokeWidth="1.5" />
                  <text x="170" y="150" fontSize="8" fill="#701a75" fontWeight="bold">Ward 4 (Primary School)</text>

                  <polygon points="280,30 460,50 420,180 250,110" fill="#fffbeb" stroke="#fde047" strokeWidth="1.5" />
                  <text x="350" y="100" fontSize="8" fill="#713f12" fontWeight="bold">Ward 5 (Wetlands)</text>

                  {/* Plot active complaints on Map based on ID */}
                  {complaints.map((c, idx) => {
                    // map coordinates based on index
                    const coords = [
                      { x: 170, y: 145 }, // Ward 4
                      { x: 190, y: 70 },  // Ward 2
                      { x: 100, y: 40 },  // Ward 1
                    ];
                    const pos = coords[idx % coords.length];
                    return (
                      <g key={c.id} className="cursor-pointer" onClick={() => setSelectedComplaint(c)}>
                        <circle cx={pos.x} cy={pos.y} r="5" fill="#f43f5e" className="animate-ping" />
                        <circle cx={pos.x} cy={pos.y} r="3" fill="#e11d48" />
                        <text x={pos.x + 6} y={pos.y + 3} fontSize="7" fill="#be123c" fontWeight="bold" className="font-mono">{c.id}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Map Legend info */}
              <div className="space-y-3 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">GIS Map Legend:</span>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 block shrink-0" />
                    <p className="text-[11px] text-slate-500">Active Complaint Pin</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#f0fdf4] border border-[#86efac] block shrink-0" />
                    <p className="text-[11px] text-slate-500">Gram Panchayat Ward W1</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#f0f9ff] border border-[#7dd3fc] block shrink-0" />
                    <p className="text-[11px] text-slate-500">Gram Panchayat Ward W2</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Contents: Assets */}
      {activeTab === 'assets' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Activity className="w-6 h-6 text-emerald-600" /> Public Asset Register
            </h3>

            {user.role !== "Citizen" && (
              <button
                onClick={() => setShowAddAssetModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Public Asset
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {assets.map((asset) => (
              <div key={asset.id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] uppercase font-mono px-2 py-0.5 bg-teal-500/10 text-teal-600 rounded-full">{asset.category}</span>
                    <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded ${
                      asset.healthStatus === 'EXCELLENT' ? 'bg-emerald-100 text-emerald-800' : asset.healthStatus === 'GOOD' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>{asset.healthStatus}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">{asset.name}</h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">{asset.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>Location: {asset.location}</span>
                  <span>Maint: {asset.lastMaintained}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Contents: Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Layers className="w-6 h-6 text-emerald-600" /> Panchayat Development Projects
            </h3>

            {user.role !== "Citizen" && (
              <button
                onClick={() => setShowAddProjectModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Civil Work Project
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div key={proj.id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] uppercase font-mono px-2.5 py-0.5 bg-cyan-500/10 text-cyan-600 rounded-full">{proj.status}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{proj.budget}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{proj.name}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{proj.description}</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>Progress Index</span>
                    <span>{proj.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full transition-all" style={{ width: `${proj.progress}%` }}></div>
                  </div>
                </div>

                {/* Adjust progress controls for officer */}
                {user.role !== "Citizen" && proj.status !== "COMPLETED" && (
                  <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                    <button
                      onClick={() => onUpdateProject(proj.id, 'IN_PROGRESS', Math.min(proj.progress + 15, 100))}
                      className="flex-1 py-1 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded text-[9px] font-bold border border-slate-200 uppercase tracking-wide cursor-pointer"
                    >
                      +15% Progress
                    </button>
                    <button
                      onClick={() => onUpdateProject(proj.id, 'COMPLETED', 100)}
                      className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[9px] font-bold uppercase tracking-wide cursor-pointer"
                    >
                      Complete Work
                    </button>
                  </div>
                )}

                <div className="pt-2 text-[10px] text-slate-400 font-mono flex justify-between">
                  <span>Start: {proj.startDate}</span>
                  <span>Target: {proj.completionDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Contents: Officers (Performance KPI) */}
      {activeTab === 'officers' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Award className="w-6 h-6 text-emerald-600" /> Officer Performance Metrics
          </h3>

          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-100 dark:border-slate-850">
                <tr>
                  <th className="p-4">Officer Name</th>
                  <th className="p-4">Administrative Focus</th>
                  <th className="p-4 text-center">Resolved Tickets</th>
                  <th className="p-4 text-center">Pending Tickets</th>
                  <th className="p-4 text-center">On-Time Index</th>
                  <th className="p-4 text-center">Citizen Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-800 dark:text-slate-200">
                {officers.map((off, idx) => (
                  <tr key={idx}>
                    <td className="p-4 font-bold">{off.name}</td>
                    <td className="p-4">{off.role} ({off.department})</td>
                    <td className="p-4 text-center font-mono font-bold text-emerald-600">{off.resolved}</td>
                    <td className="p-4 text-center font-mono font-bold text-rose-600">{off.pending}</td>
                    <td className="p-4 text-center font-mono font-bold text-teal-600">{off.onTimeCompletion}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 text-amber-600 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        ★ {off.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Contents: Admin Notification Logs */}
      {activeTab === 'notifications' && (
        <div className="space-y-6 animate-fade-in">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Mail className="w-6 h-6 text-emerald-600" /> Automated SMS & Email Dispatch Logs
          </h3>

          <div className="grid gap-4 font-mono text-xs">
            {logs.map((log) => (
              <div key={log.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      log.type === 'SMS' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>{log.type}</span>
                    <span className="text-slate-700 dark:text-slate-300 font-bold">To: {log.recipient}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Subject: {log.subject}</p>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px] whitespace-pre-wrap">{log.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Contents: Admin User Management */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Users className="w-6 h-6 text-emerald-600" /> User & Role Management Board
          </h3>

          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-sm">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-100 dark:border-slate-850">
                <tr>
                  <th className="p-4">User Name</th>
                  <th className="p-4">Secure Email</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Assigned Panchayat Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-800 dark:text-slate-200">
                {allUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="p-4 font-bold">{u.name}</td>
                    <td className="p-4 font-mono text-teal-600">{u.email}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full font-semibold text-[10px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 font-mono">{u.phone}</td>
                    <td className="p-4">{u.location?.panchayat || "All Wards"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FEEDBACK CITIZEN MODAL */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-850 shadow-2xl space-y-4">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Submit Resolution Feedback
            </h4>
            <p className="text-xs text-slate-500">Your rating confirms if the work was completed on-time and with durable materials.</p>
            
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Rating Speed & Quality</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRatingValue(val)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        ratingValue >= val ? "border-amber-500 bg-amber-50 text-amber-600 dark:bg-amber-950/20" : "border-slate-200"
                      }`}
                    >
                      ★ {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Review Remarks</label>
                <input
                  type="text"
                  required
                  value={feedbackRemarks}
                  onChange={(e) => setFeedbackRemarks(e.target.value)}
                  placeholder="e.g. Pipeline was fixed beautifully! No leaks now."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(null)}
                  className="flex-1 py-2 bg-slate-100 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-xl"
                >
                  Submit Audit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ASSET MODAL */}
      {showAddAssetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-850 shadow-2xl space-y-4">
            <h4 className="font-bold text-slate-800 dark:text-slate-100">Add Public Asset Node</h4>
            
            <form onSubmit={handleAddAssetSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Asset Name</label>
                <input
                  type="text"
                  required
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  placeholder="e.g. Ward 3 Paddy De-watering pump"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Category</label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl"
                  >
                    <option>Water Supply</option>
                    <option>Education</option>
                    <option>Streetlights</option>
                    <option>Public Health</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Health Status</label>
                  <select
                    value={newAsset.healthStatus}
                    onChange={(e) => setNewAsset({ ...newAsset, healthStatus: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl"
                  >
                    <option value="EXCELLENT">EXCELLENT</option>
                    <option value="GOOD">GOOD</option>
                    <option value="NEEDS_REPAIR">NEEDS REPAIR</option>
                    <option value="BROKEN">BROKEN</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Panchayat Location</label>
                <input
                  type="text"
                  required
                  value={newAsset.location}
                  onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                  placeholder="e.g. Ward 2, Kuttanad"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Asset Description</label>
                <input
                  type="text"
                  required
                  value={newAsset.description}
                  onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                  placeholder="e.g. Core de-watering generator to secure paddy fields."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl"
                />
              </div>

              <div className="flex gap-2 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAssetModal(false)}
                  className="flex-1 py-2 bg-slate-100 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-xl"
                >
                  Log Public Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PROJECT MODAL */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-850 shadow-2xl space-y-4">
            <h4 className="font-bold text-slate-800 dark:text-slate-100">Add Civil Work Project</h4>
            
            <form onSubmit={handleAddProjectSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Project Name</label>
                <input
                  type="text"
                  required
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="e.g. Constructing concrete bridge Ward 4"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Project Budget Allocation</label>
                <input
                  type="text"
                  required
                  value={newProject.budget}
                  onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                  placeholder="e.g. ₹12,50,000"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Target Completion Date</label>
                <input
                  type="date"
                  required
                  value={newProject.completionDate}
                  onChange={(e) => setNewProject({ ...newProject, completionDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Project Description</label>
                <textarea
                  rows={3}
                  required
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Constructing clean water pipeline layouts join all households..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl"
                />
              </div>

              <div className="flex gap-2 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="flex-1 py-2 bg-slate-100 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-xl"
                >
                  Launch Civil Work
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
