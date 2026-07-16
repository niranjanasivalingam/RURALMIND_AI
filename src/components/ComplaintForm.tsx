import React, { useState, useRef } from "react";
import { 
  Camera, Upload, Mic, MicOff, AlertCircle, RefreshCw, 
  CheckCircle2, HelpCircle, ShieldAlert, Sparkles, MapPin, Map
} from "lucide-react";
import { Complaint } from "../types";

interface ComplaintFormProps {
  userEmail: string;
  onComplaintSubmitted: (complaint: Complaint) => void;
  onClose: () => void;
}

export default function ComplaintForm({ userEmail, onComplaintSubmitted, onClose }: ComplaintFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [panchayat, setPanchayat] = useState("Kuttanad Panchayat");
  const [taluk, setTaluk] = useState("Kuttanad Taluk");
  const [address, setAddress] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'English' | 'Tamil'>('English');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [triageResult, setTriageResult] = useState<Complaint | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<any>(null);

  // Animated loading step strings
  const loadingSteps = [
    "Establishing secure connection to RuralMind AI Cluster...",
    "Analyzing text semantics & sentiment gravity...",
    "Running image object detection & structural damage analysis...",
    "Cross-referencing active Panchayat records to filter duplicates...",
    "Predicting municipal priority & compiling notification routes...",
    "Synchronizing secure database node..."
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      convertToBase64(file);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      convertToBase64(file);
    }
  };

  const convertToBase64 = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Voice recording simulation (High Fidelity)
  const toggleVoiceRecording = () => {
    if (isRecording) {
      clearInterval(timerRef.current);
      setIsRecording(false);
      setRecordingDuration(0);
      
      // Seed simulation text based on chosen language
      if (voiceLang === 'English') {
        setTitle("Repair broken water pump in Ward 2");
        setDescription("The main borewell pump opposite the tea shop has been leaking dirty water and stopped working completely this morning. Neighbors cannot get drinking water.");
      } else {
        setTitle("வார்டு 2 பழுதடைந்த குடிநீர் குழாய் சரிசெய்க");
        setDescription("டீ கடைக்கு எதிரே உள்ள வார்டு 2 குடிநீர் குழாயில் இருந்து அசுத்தமான தண்ணீர் கசிகிறது. இன்று காலை முதல் அது முற்றிலும் பழுதடைந்துள்ளது.");
      }
    } else {
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setIsLoading(true);
    setLoadingStep(0);

    // Dynamic loading screen animation intervals
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          return prev;
        }
      });
    }, 1500);

    try {
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          location: {
            panchayat,
            taluk,
            district: "Alappuzha",
            state: "Kerala",
            address,
          },
          imageUrl,
          userEmail,
          voiceLang: isRecording ? voiceLang : null,
        }),
      });

      if (response.ok) {
        const result: Complaint = await response.json();
        // Give some extra visual duration for the last loading state
        setTimeout(() => {
          clearInterval(stepInterval);
          setIsLoading(false);
          setTriageResult(result);
        }, 1200);
      } else {
        alert("Failed to submit complaint. Server offline.");
        setIsLoading(false);
        clearInterval(stepInterval);
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting complaint. Check server log.");
      setIsLoading(false);
      clearInterval(stepInterval);
    }
  };

  const handleAcceptTriage = () => {
    if (triageResult) {
      onComplaintSubmitted(triageResult);
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center text-white p-6">
        <div className="max-w-md w-full text-center space-y-8 animate-pulse">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mx-auto"></div>
            <Sparkles className="w-8 h-8 text-emerald-400 absolute top-6 left-6 animate-ping" />
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold tracking-wide">RuralMind AI Triage System</h3>
            <p className="text-emerald-400 text-xs font-mono font-medium">Step {loadingStep + 1} of {loadingSteps.length}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[90px] flex items-center justify-center">
            <p className="text-sm font-light text-slate-300 leading-relaxed italic">
              "{loadingSteps[loadingStep]}"
            </p>
          </div>

          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-1000" 
              style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (triageResult) {
    const isDup = triageResult.duplicateCheck?.isDuplicate;
    const severity = triageResult.imageAnalysis?.estimatedSeverity || triageResult.priority;

    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-emerald-100 dark:border-emerald-950 overflow-hidden shadow-2xl my-8">
          <div className="p-6 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold tracking-widest bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">Triage Complete</span>
              <h3 className="text-lg font-bold">AI Processing Audit Report</h3>
            </div>
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
            {/* Header Result Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                <span className="text-[9px] text-slate-400 block uppercase">Category</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{triageResult.category}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                <span className="text-[9px] text-slate-400 block uppercase">Priority</span>
                <span className={`text-xs font-extrabold ${
                  severity === 'CRITICAL' ? 'text-rose-600' : severity === 'HIGH' ? 'text-amber-600' : 'text-emerald-600'
                }`}>{severity}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                <span className="text-[9px] text-slate-400 block uppercase">Routed Level</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{triageResult.assignedAuthority}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                <span className="text-[9px] text-slate-400 block uppercase">Ticket ID</span>
                <span className="text-xs font-mono font-bold text-teal-600">{triageResult.id}</span>
              </div>
            </div>

            {/* Duplicate Check Warning */}
            {isDup && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-950 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400">Duplicate Incident Warning</h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
                    {triageResult.duplicateCheck?.explanation} (Linked to existing ticket: <span className="font-mono font-bold">{triageResult.duplicateCheck?.duplicateOfId}</span>).
                  </p>
                </div>
              </div>
            )}

            {/* Image analysis results if any */}
            {triageResult.imageAnalysis && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-200 dark:border-blue-950 space-y-2">
                <h4 className="text-xs font-bold text-blue-800 dark:text-blue-400 flex items-center gap-1.5">
                  <Camera className="w-4 h-4" /> AI Image Inspection Analytics
                </h4>
                <div className="grid grid-cols-2 gap-4 text-[11px]">
                  <div className="space-y-1">
                    <span className="text-slate-400 block">Detected Physical Attributes:</span>
                    <div className="flex flex-wrap gap-1">
                      {triageResult.imageAnalysis.detectedObjects.map((obj, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded text-[9px] font-mono">
                          {obj}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block">Authentic Public Damage:</span>
                    <span className={`font-bold ${triageResult.imageAnalysis.isAuthenticIssue ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {triageResult.imageAnalysis.isAuthenticIssue ? "Verified" : "Unverified / Ambiguous"}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 italic pt-1 border-t border-blue-100 dark:border-blue-900">
                  " {triageResult.imageAnalysis.imageDescription} "
                </p>
              </div>
            )}

            {/* Tracking Node details */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Municipal Audit Log</h4>
              <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-100 dark:border-slate-850 text-xs space-y-3 font-mono">
                {triageResult.trackingTimeline.map((node, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="text-emerald-600">●</div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{node.status} – {node.actor}</p>
                      <p className="text-slate-500 text-[10px]">{node.remarks}</p>
                      <span className="text-[9px] text-slate-400">{new Date(node.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850 flex justify-end gap-3">
            <button
              onClick={() => setTriageResult(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl"
            >
              Re-edit
            </button>
            <button
              onClick={handleAcceptTriage}
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-600/20"
            >
              Confirm and Log Ticket
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30">Citizens Desk</span>
            <h3 className="text-lg font-bold">Lodge Public Complaint</h3>
          </div>
          <button onClick={onClose} className="text-white hover:text-emerald-300 text-sm font-mono p-1">✕</button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          
          {/* Language Selector for Voice */}
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-850">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-emerald-600 animate-pulse" /> Voice Registration Assistant
              </span>
              <p className="text-[10px] text-slate-400">Record in your regional dialect for auto-transcription</p>
            </div>
            <div className="flex gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              {['English', 'Tamil'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setVoiceLang(lang as any)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                    voiceLang === lang 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:text-emerald-600 dark:text-slate-300'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Record Button area */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`p-5 rounded-full flex flex-col items-center justify-center gap-1 border-2 shadow-lg transition-all ${
                isRecording 
                  ? 'bg-rose-500 text-white border-rose-600 scale-105 animate-pulse' 
                  : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-slate-950 dark:border-slate-800 hover:bg-emerald-100'
              }`}
            >
              {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              <span className="text-[10px] uppercase font-bold tracking-wider">
                {isRecording ? `Stop (${formatDuration(recordingDuration)})` : 'Tap to Record voice'}
              </span>
            </button>
          </div>

          {/* Form Text inputs */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Complaint Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Broken Water pipeline opposite Library Ward 2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Complaint Description</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                placeholder="Describe the issue in detail. Explain how many families are impacted, when it occurred, and severity..."
              />
            </div>

            {/* Local Panchayat settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Gram Panchayat</label>
                <select
                  value={panchayat}
                  onChange={(e) => setPanchayat(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option>Kuttanad Panchayat</option>
                  <option>Vembanad Panchayat</option>
                  <option>Kumarakom Panchayat</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Taluk Headquarters</label>
                <select
                  value={taluk}
                  onChange={(e) => setTaluk(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option>Kuttanad Taluk</option>
                  <option>Cherthala Taluk</option>
                  <option>Karthikappally Taluk</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block font-mono">Detailed Landmark & Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                placeholder="e.g. House No. 45, Opposite Primary School Playgrounds, Ward 4"
              />
            </div>

            {/* Photo upload dropzone */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Attach Image for AI Visual Verification</label>
              
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 transition-all bg-slate-50 dark:bg-slate-950"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                
                {imageUrl ? (
                  <div className="space-y-3">
                    <img 
                      src={imageUrl} 
                      alt="Selected public concern" 
                      className="max-h-40 mx-auto rounded-xl object-contain border border-slate-200 dark:border-slate-800" 
                    />
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Image attached and ready for AI validation
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 text-slate-500">
                    <Upload className="w-8 h-8 mx-auto text-slate-400" />
                    <p className="text-xs">Drag and drop your ticket image here, or <span className="text-emerald-600 font-bold">browse files</span></p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest">Supports PNG, JPEG up to 10MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/60 flex gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-emerald-800 dark:text-emerald-400 leading-relaxed font-sans">
              By submitting this, RuralMind AI will inspect your concern, verify duplicate incident maps, classify severity level, and log automated notifications to assigned taluk engineers.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-all text-center uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/20 uppercase tracking-wider"
            >
              Scan & Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
