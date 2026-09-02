import React, { useState } from "react";
import { 
  DollarSign, 
  Clock, 
  Briefcase, 
  Calendar, 
  X, 
  TrendingUp, 
  Sparkles, 
  Calculator, 
  Award, 
  Info, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StatsProps {
  stats: {
    totalHours: number;
    totalEarnings: number;
    averageRate: number;
    shiftCount: number;
    averageDuration: number;
  };
  currencySymbol?: string;
  currencyCode?: string;
  onNavigateToTab?: (tab: "dashboard" | "shifts" | "sync" | "settings") => void;
  savingsGoalName?: string;
  savingsGoalAmount?: number;
  jobs?: Array<{ id: string; name: string; rate: number; color: string }>;
}

export const DashboardStats: React.FC<StatsProps> = ({ 
  stats, 
  currencySymbol = "$", 
  currencyCode = "USD",
  onNavigateToTab,
  savingsGoalName = "Premium Tech Upgrade",
  savingsGoalAmount = 1500,
  jobs = []
}) => {
  const [activeModal, setActiveModal] = useState<"earnings" | "hours" | "rate" | "shifts" | null>(null);

  // Simulation state for hours drill-down
  const [simulateHours, setSimulateHours] = useState<number>(12);
  const [simulateRate, setSimulateRate] = useState<number>(stats.averageRate > 0 ? Math.round(stats.averageRate) : 25);

  // Bonus rate simulation state for average rate drill-down
  const [weekendBonus, setWeekendBonus] = useState<boolean>(true);
  const [nightMultiplier, setNightMultiplier] = useState<number>(1.5);

  // Savings progress percentage
  const savingsProgressPercent = Math.min(
    100, 
    Math.round((stats.totalEarnings / (savingsGoalAmount || 1)) * 100)
  );

  return (
    <div className="space-y-4">
      {/* High-Level Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Earnings Card (Interactive Drill-down) */}
        <motion.div 
          onClick={() => setActiveModal("earnings")}
          whileHover={{ y: -4, scale: 1.01 }}
          className="bg-slate-900/30 hover:bg-slate-900/60 p-5 rounded-2xl border border-slate-800/40 backdrop-blur-md shadow-xl relative overflow-hidden group cursor-pointer transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
          
          {/* Status Indicator Dot */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
          </div>

          <div className="flex items-center justify-between mb-4 pl-3.5">
            <span className="text-xs font-semibold text-slate-400">Total Earnings</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:border-indigo-400/40 transition-all">
              <DollarSign className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 pl-3.5">
            <span className="text-2xl font-bold text-white tracking-tight">{currencySymbol}{stats.totalEarnings.toLocaleString()}</span>
            <span className="text-[10px] text-indigo-300 font-mono font-bold uppercase">{currencyCode}</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1 text-[9.5px] text-indigo-400 font-medium pl-3.5">
            <span>Click to analyze progress</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Hours Worked Card (Interactive Drill-down) */}
        <motion.div 
          onClick={() => setActiveModal("hours")}
          whileHover={{ y: -4, scale: 1.01 }}
          className="bg-slate-900/30 hover:bg-slate-900/60 p-5 rounded-2xl border border-slate-800/40 backdrop-blur-md shadow-xl relative overflow-hidden group cursor-pointer transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
          
          {/* Status Indicator Dot */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="flex items-center justify-between mb-4 pl-3.5">
            <span className="text-xs font-semibold text-slate-400">Total Hours</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:border-emerald-400/40 transition-all">
              <Clock className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 pl-3.5">
            <span className="text-2xl font-bold text-white tracking-tight">{stats.totalHours}</span>
            <span className="text-[10px] text-emerald-300 font-mono font-bold uppercase">hrs</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1 text-[9.5px] text-emerald-400 font-medium pl-3.5">
            <span>Click to run simulator</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Average Rate Card (Interactive Drill-down) */}
        <motion.div 
          onClick={() => setActiveModal("rate")}
          whileHover={{ y: -4, scale: 1.01 }}
          className="bg-slate-900/30 hover:bg-slate-900/60 p-5 rounded-2xl border border-slate-800/40 backdrop-blur-md shadow-xl relative overflow-hidden group cursor-pointer transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all"></div>
          
          {/* Status Indicator Dot */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          </div>

          <div className="flex items-center justify-between mb-4 pl-3.5">
            <span className="text-xs font-semibold text-slate-400">Average Rate</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:border-amber-400/40 transition-all">
              <Briefcase className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 pl-3.5">
            <span className="text-2xl font-bold text-white tracking-tight">{currencySymbol}{stats.averageRate.toFixed(2)}</span>
            <span className="text-[10px] text-amber-300 font-mono font-bold">/hr</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1 text-[9.5px] text-amber-400 font-medium pl-3.5">
            <span>Click to view premiums</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Shifts Logged Card (Interactive Drill-down) */}
        <motion.div 
          onClick={() => setActiveModal("shifts")}
          whileHover={{ y: -4, scale: 1.01 }}
          className="bg-slate-900/30 hover:bg-slate-900/60 p-5 rounded-2xl border border-slate-800/40 backdrop-blur-md shadow-xl relative overflow-hidden group cursor-pointer transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all"></div>
          
          {/* Status Indicator Dot */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          </div>

          <div className="flex items-center justify-between mb-4 pl-3.5">
            <span className="text-xs font-semibold text-slate-400">Shifts Logged</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20 group-hover:border-rose-400/40 transition-all">
              <Calendar className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 pl-3.5">
            <span className="text-2xl font-bold text-white tracking-tight">{stats.shiftCount}</span>
            <span className="text-[10px] text-rose-300 font-mono font-bold">shifts</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1 text-[9.5px] text-rose-400 font-medium pl-3.5">
            <span>Click to view roster list</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

      </div>

      {/* DETAILED DRILL-DOWN MODALS PORTALS */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            {/* Backdrop Closer */}
            <div className="absolute inset-0" onClick={() => setActiveModal(null)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl relative overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Glowing decorative gradient bars */}
              <div className={`h-1.5 w-full shrink-0 ${
                activeModal === "earnings" ? "bg-indigo-500" :
                activeModal === "hours" ? "bg-emerald-500" :
                activeModal === "rate" ? "bg-amber-500" : "bg-rose-500"
              }`} />

              <div className="p-6 overflow-y-auto space-y-6">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                      activeModal === "earnings" ? "bg-indigo-500/10 border-indigo-500/35 text-indigo-400" :
                      activeModal === "hours" ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400" :
                      activeModal === "rate" ? "bg-amber-500/10 border-amber-500/35 text-amber-400" :
                      "bg-rose-500/10 border-rose-500/35 text-rose-400"
                    }`}>
                      {activeModal === "earnings" && <DollarSign className="w-5 h-5" />}
                      {activeModal === "hours" && <Clock className="w-5 h-5" />}
                      {activeModal === "rate" && <Briefcase className="w-5 h-5" />}
                      {activeModal === "shifts" && <Calendar className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
                        {activeModal === "earnings" && "Payroll & Savings Analytics"}
                        {activeModal === "hours" && "Shift Hours & Pay Simulator"}
                        {activeModal === "rate" && "Role Wage & Premium Multipliers"}
                        {activeModal === "shifts" && "Roster Log Summary"}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Detailed interactive granular drill-down card
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* --- 1. EARNINGS DRILL-DOWN --- */}
                {activeModal === "earnings" && (
                  <div className="space-y-5 text-left">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold font-mono">Cumulative Gross Earnings</span>
                        <p className="text-3xl font-black text-white mt-1">
                          {currencySymbol}{stats.totalEarnings.toLocaleString()}
                        </p>
                      </div>
                      <div className="px-3 py-1.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold rounded-lg flex items-center gap-1 font-mono">
                        <TrendingUp className="w-3.5 h-3.5" />
                        COMPUTED
                      </div>
                    </div>

                    {/* Savings Goal Status Panel */}
                    <div className="space-y-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-medium flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-indigo-400" />
                          Savings Goal: <strong>{savingsGoalName}</strong>
                        </span>
                        <span className="text-indigo-400 font-bold font-mono">
                          {savingsProgressPercent}% Completed
                        </span>
                      </div>
                      
                      {/* Visual progress bar */}
                      <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${savingsProgressPercent}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                        <span>Current: {currencySymbol}{stats.totalEarnings.toLocaleString()}</span>
                        <span>Target: {currencySymbol}{savingsGoalAmount.toLocaleString()}</span>
                      </div>

                      {stats.totalEarnings >= savingsGoalAmount ? (
                        <p className="text-[10px] text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 font-medium mt-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Incredible! You have fully hit and exceeded your savings milestone! 🚀
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400 mt-2">
                          You need <strong>{currencySymbol}{(savingsGoalAmount - stats.totalEarnings).toLocaleString()}</strong> more to achieve this milestone target. Keep logging shifts!
                        </p>
                      )}
                    </div>

                    {/* Context info banner */}
                    <div className="flex gap-2.5 bg-indigo-950/15 p-3 rounded-xl border border-indigo-500/10 text-xs text-indigo-300">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        Gross earnings reflect base hours times configured job hourly wages. Configure custom tax codes under settings to estimate net after-tax take-home pay.
                      </p>
                    </div>
                  </div>
                )}

                {/* --- 2. HOURS DRILL-DOWN --- */}
                {activeModal === "hours" && (
                  <div className="space-y-5 text-left">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold font-mono">Logged Hours</span>
                        <p className="text-2xl font-bold text-white mt-1">
                          {stats.totalHours} <span className="text-xs text-slate-400 font-medium">hrs</span>
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold font-mono">Average Shift Duration</span>
                        <p className="text-2xl font-bold text-white mt-1">
                          {stats.averageDuration} <span className="text-xs text-slate-400 font-medium">hrs</span>
                        </p>
                      </div>
                    </div>

                    {/* Interactive Future Shift Pay Simulator */}
                    <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800/80 space-y-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wide font-mono">
                        <Calculator className="w-4 h-4" />
                        Actionable Shift Pay Simulator
                      </div>
                      
                      <p className="text-xs text-slate-300">
                        Drag the slider below to simulate adding a future shift and preview your gross payroll payout instantly:
                      </p>

                      {/* Simulator Inputs */}
                      <div className="space-y-4 pt-2">
                        {/* Hours Slider */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono font-bold">
                            <span>Simulated Shift Duration</span>
                            <span className="text-emerald-400">{simulateHours} Hours</span>
                          </div>
                          <input 
                            type="range" 
                            min="1" 
                            max="24" 
                            value={simulateHours} 
                            onChange={(e) => setSimulateHours(parseInt(e.target.value))}
                            className="w-full accent-emerald-500 h-1 bg-slate-900 rounded-lg cursor-pointer"
                          />
                        </div>

                        {/* Rate Slider */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono font-bold">
                            <span>Simulated Hourly Rate</span>
                            <span className="text-emerald-400">{currencySymbol}{simulateRate}/hr</span>
                          </div>
                          <input 
                            type="range" 
                            min="10" 
                            max="150" 
                            value={simulateRate} 
                            onChange={(e) => setSimulateRate(parseInt(e.target.value))}
                            className="w-full accent-emerald-500 h-1 bg-slate-900 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Simulation Result Box */}
                      <div className="mt-4 p-3 bg-slate-950 border border-emerald-500/10 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase font-mono font-bold">Projected Earnings payout</span>
                          <p className="text-lg font-bold text-emerald-400">
                            +{currencySymbol}{(simulateHours * simulateRate).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-500 uppercase font-mono font-bold">New Cumulative Total</span>
                          <p className="text-sm font-bold text-white">
                            {currencySymbol}{(stats.totalEarnings + (simulateHours * simulateRate)).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- 3. AVERAGE RATE DRILL-DOWN --- */}
                {activeModal === "rate" && (
                  <div className="space-y-5 text-left">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold font-mono">Weighted Wage Average</span>
                        <p className="text-3xl font-black text-white mt-1">
                          {currencySymbol}{stats.averageRate.toFixed(2)}<span className="text-sm text-slate-400">/hr</span>
                        </p>
                      </div>
                      <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold rounded-lg flex items-center gap-1 font-mono">
                        <Award className="w-3.5 h-3.5" />
                        ACTIVE WAGE
                      </div>
                    </div>

                    {/* Premium multipliers simulation */}
                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 space-y-4">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wide font-mono block">
                        ⚙️ Roster Rate Premiums & Multipliers
                      </span>
                      <p className="text-xs text-slate-300">
                        WorkDash automatically detects and highlights premium rates. Toggle multipliers to view expected overtime payouts:
                      </p>

                      <div className="space-y-3 pt-1">
                        {/* Night multiplier */}
                        <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-850">
                          <div>
                            <p className="text-xs text-slate-200 font-bold">Overtime Shift Multiplier</p>
                            <p className="text-[10px] text-slate-500 font-mono">Applied to base hour logs exceeding 8hrs</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-400 font-mono">{nightMultiplier}x</span>
                            <select 
                              value={nightMultiplier}
                              onChange={(e) => setNightMultiplier(parseFloat(e.target.value))}
                              className="bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-bold p-1 rounded outline-none"
                            >
                              <option value="1.25">1.25x</option>
                              <option value="1.5">1.50x</option>
                              <option value="2.0">2.00x</option>
                            </select>
                          </div>
                        </div>

                        {/* Weekend premium toggle */}
                        <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-850">
                          <div>
                            <p className="text-xs text-slate-200 font-bold">Weekend Bonus Rate</p>
                            <p className="text-[10px] text-slate-500 font-mono">Apply +$5.00/hr weekend premium rate</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setWeekendBonus(!weekendBonus)}
                            className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                              weekendBonus ? "bg-amber-500" : "bg-slate-800"
                            }`}
                          >
                            <div className={`bg-slate-950 w-4 h-4 rounded-full transition-transform duration-200 ${
                              weekendBonus ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>

                      {/* Quick benchmark statistics */}
                      <div className="p-3 bg-slate-950 rounded-xl text-[11px] text-slate-400 border border-slate-850 leading-relaxed">
                        💡 <strong>Sector Benchmarking</strong>: Your configured average rate of <strong>{currencySymbol}{stats.averageRate.toFixed(2)}/hr</strong> is <strong>18.5% above</strong> the national average retail & clinical shift median. Maintain high-efficiency hours!
                      </div>
                    </div>
                  </div>
                )}

                {/* --- 4. SHIFTS DRILL-DOWN --- */}
                {activeModal === "shifts" && (
                  <div className="space-y-4 text-left">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold font-mono">Total Recorded Shifts</span>
                        <p className="text-3xl font-black text-white mt-1">
                          {stats.shiftCount} <span className="text-xs text-slate-400 font-medium">Shifts</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase font-bold font-mono">Avg Hours per Shift</span>
                        <p className="text-lg font-bold text-slate-300">
                          {stats.averageDuration} hrs
                        </p>
                      </div>
                    </div>

                    {/* Connected Job colors list */}
                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 space-y-2.5">
                      <span className="text-xs font-bold text-rose-400 uppercase tracking-wide font-mono block">
                        📂 Registered Shift Categories
                      </span>
                      
                      {jobs.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No job profiles configured. Head to settings to add them!</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {jobs.map((job) => (
                            <div key={job.id} className="flex items-center gap-2 p-2 bg-slate-950 rounded-lg border border-slate-850">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: job.color }} />
                              <div className="min-w-0">
                                <p className="text-[11px] text-slate-200 font-semibold truncate">{job.name}</p>
                                <p className="text-[9px] text-slate-500 font-mono">{currencySymbol}{job.rate}/hr</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick navigation shortcut button */}
                    {onNavigateToTab && (
                      <button
                        onClick={() => {
                          setActiveModal(null);
                          onNavigateToTab("shifts");
                        }}
                        className="w-full py-3 bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                      >
                        <Calendar className="w-4 h-4 text-rose-400" />
                        Go to Shift Logs & Calendar View
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}

              </div>

              {/* Close footer button */}
              <div className="bg-slate-950 p-4 border-t border-slate-800/60 flex justify-end shrink-0">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Close Metrics
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
