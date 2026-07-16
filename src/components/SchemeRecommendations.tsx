import React, { useState, useEffect } from "react";
import { 
  Award, Search, Filter, Cpu, CheckCircle2, AlertCircle, 
  ChevronRight, Sparkles, User, Database, Building2, RefreshCw
} from "lucide-react";
import { GovernmentScheme } from "../types";

interface SchemeRecommendationsProps {
  userDemographics: {
    age: number;
    annualIncome: number;
    occupation: string;
    landSize: string;
    hasBPLCard: boolean;
  };
  onUpdateDemographics: (demographics: any) => void;
}

interface AIResult {
  recommendedSchemeIds: string[];
  analysis: string;
  reasons: Array<{
    schemeId: string;
    reason: string;
    howToApply: string;
  }>;
}

export default function SchemeRecommendations({ userDemographics, onUpdateDemographics }: SchemeRecommendationsProps) {
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  
  // Local Demographics state for form tuning
  const [age, setAge] = useState(userDemographics.age || 30);
  const [annualIncome, setAnnualIncome] = useState(userDemographics.annualIncome || 120000);
  const [occupation, setOccupation] = useState(userDemographics.occupation || "Farmer");
  const [landSize, setLandSize] = useState(userDemographics.landSize || "2.5 Acres");
  const [hasBPLCard, setHasBPLCard] = useState(userDemographics.hasBPLCard || false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);

  useEffect(() => {
    fetch("/api/schemes")
      .then((res) => res.json())
      .then((data) => setSchemes(data))
      .catch((err) => console.error("Failed to load schemes:", err));
  }, []);

  const handleAIMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAiResult(null);

    // Save updated demographics to main App state
    const updatedDemo = { age, annualIncome, occupation, landSize, hasBPLCard };
    onUpdateDemographics(updatedDemo);

    try {
      const response = await fetch("/api/schemes/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demographics: updatedDemo }),
      });

      if (response.ok) {
        const result: AIResult = await response.json();
        setAiResult(result);
      } else {
        alert("Failed to fetch AI recommendations.");
      }
    } catch (err) {
      console.error(err);
      alert("Error matching schemes. Is backend server online?");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSchemes = schemes.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", "Agriculture", "Social Welfare", "Education", "Water & Sanitation"];

  return (
    <div className="space-y-8">
      {/* Schemes Grid + AI Generator layout */}
      <div className="grid lg:grid-cols-5 gap-8">
        
        {/* Left column: Demographic Setup Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg space-y-5">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">AI Recommendation Engine</span>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Cpu className="w-5 h-5 text-emerald-600" /> Eligibility Criteria
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tune your personal attributes below to have Google Gemini evaluate matching Central and State subsidies.
              </p>
            </div>

            <form onSubmit={handleAIMatch} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Citizen Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Annual Income (₹)</label>
                  <input
                    type="number"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Primary Occupation</label>
                <select
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                >
                  <option>Farmer</option>
                  <option>Agricultural Laborer</option>
                  <option>Unemployed Graduate</option>
                  <option>Self-Employed Artisan</option>
                  <option>Other / Student</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Agri Land Holding</label>
                  <select
                    value={landSize}
                    onChange={(e) => setLandSize(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option>0 Acres (Landless)</option>
                    <option>1.2 Acres (Marginal)</option>
                    <option>2.5 Acres (Small)</option>
                    <option>5.0 Acres (Medium)</option>
                    <option>10+ Acres (Large)</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end pb-1.5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">BPL Card Holder</span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={hasBPLCard}
                      onChange={(e) => setHasBPLCard(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>Yes, I hold BPL card</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating Subsidies...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Match Eligible Schemes
                  </>
                )}
              </button>
            </form>
          </div>

          {/* AI recommendations display if loaded */}
          {aiResult && (
            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4 animate-fade-in">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Sparkles className="w-5 h-5 animate-bounce" />
                <h4 className="text-sm uppercase tracking-wider">Gemini AI Audit Verdict</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {aiResult.analysis}
              </p>
              
              <div className="space-y-3 pt-2">
                {aiResult.reasons.map((rec, i) => {
                  const scheme = schemes.find((s) => s.id === rec.schemeId);
                  if (!scheme) return null;
                  return (
                    <div key={i} className="p-3.5 bg-white/5 border border-white/10 rounded-2xl text-xs space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-emerald-300">{scheme.name}</span>
                        <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-300 rounded text-[9px] uppercase font-mono">Matched</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{rec.reason}</p>
                      <div className="pt-1.5 border-t border-white/5 text-[10px] text-teal-300 font-mono">
                        <span className="font-bold block uppercase text-[8px] text-slate-500">Apply Checklist:</span>
                        {rec.howToApply}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Schemes Catalog Search and list */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Award className="w-6 h-6 text-emerald-600" /> Active Government Schemes
            </h3>
            
            {/* Category selection */}
            <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-850">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                    categoryFilter === cat 
                      ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-sm" 
                      : "text-slate-500 hover:text-emerald-600 dark:text-slate-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4.5 h-4.5 text-slate-400 absolute top-3 left-3.5" />
            <input
              type="text"
              placeholder="Search scheme name, eligibility keyword, or central subsidies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 shadow-sm"
            />
          </div>

          {/* Schemes List */}
          <div className="grid gap-4">
            {filteredSchemes.map((scheme) => (
              <div 
                key={scheme.id} 
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 bg-emerald-500/5 rounded-full">
                      {scheme.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">ID: {scheme.id}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base">{scheme.name}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{scheme.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-850 flex flex-wrap gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Financial Benefit</span>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{scheme.benefit}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Eligibility Criteria</span>
                    <p className="font-bold text-teal-600">
                      {scheme.eligibility.hasBPLCard ? "BPL Only" : ""} {scheme.eligibility.occupation ? `${scheme.eligibility.occupation}` : "Universal"} {scheme.eligibility.incomeLimit ? `(Income < ₹${scheme.eligibility.incomeLimit})` : ""}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {filteredSchemes.length === 0 && (
              <div className="text-center p-12 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-850">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No schemes matched your filters</h4>
                <p className="text-xs text-slate-400">Try cleaning search queries or modifying the category focus.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
