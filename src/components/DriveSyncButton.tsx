import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Cloud, CheckCircle, Loader2, Target, AlertCircle } from 'lucide-react';

interface DriveSyncProps {
  shifts: any[];
  stats: {
    totalEarnings: number;
  };
  savingsGoalAmount: number;
}

export const DriveSyncButton: React.FC<DriveSyncProps> = ({ shifts, stats, savingsGoalAmount }) => {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setStatus("loading");
      try {
        const res = await fetch("/api/drive/save-shifts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: tokenResponse.access_token,
            shifts,
            stats
          }),
        });

        const data = await res.json();
        if (data.success) {
          setStatus("success");
          setShowAnalysis(true);
        } else {
          setStatus("error");
          setErrorMessage(data.error || "Failed to save");
        }
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message);
      }
    },
    onError: (error) => {
      setStatus("error");
      setErrorMessage("Google Login Failed");
      console.error(error);
    },
    scope: 'https://www.googleapis.com/auth/drive.file'
  });

  const difference = stats.totalEarnings - savingsGoalAmount;
  const isSurplus = difference >= 0;

  return (
    <div className="space-y-4 w-full">
      <button
        onClick={() => login()}
        disabled={status === "loading" || shifts.length === 0}
        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white py-3 px-6 rounded-xl font-semibold transition-all border border-slate-700 shadow-sm"
      >
        {status === "loading" ? (
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
        ) : status === "success" ? (
          <CheckCircle className="w-5 h-5 text-emerald-400" />
        ) : (
          <Cloud className="w-5 h-5 text-indigo-400" />
        )}
        {status === "loading" ? "Saving to Drive..." : status === "success" ? "Saved to Drive" : "Backup Shifts to Google Drive"}
      </button>

      {status === "error" && (
        <p className="text-xs text-rose-400 text-center font-medium bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMessage}
        </p>
      )}

      {showAnalysis && (
        <div className="bg-slate-900/50 p-5 rounded-2xl border border-indigo-500/30 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Target className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-200">Financial Snapshot Saved</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Total Earnings</span>
              <span className="text-lg font-bold text-white">${stats.totalEarnings.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Target Goal</span>
              <span className="text-lg font-bold text-white">${savingsGoalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isSurplus ? "bg-emerald-500/10 border-emerald-500/30" : "bg-amber-500/10 border-amber-500/30"
          }`}>
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider block ${isSurplus ? "text-emerald-400" : "text-amber-400"}`}>
                {isSurplus ? "Goal Surpassed (Surplus)" : "Goal Deficit"}
              </span>
              <span className={`text-2xl font-black ${isSurplus ? "text-emerald-300" : "text-amber-300"}`}>
                ${Math.abs(difference).toLocaleString()}
              </span>
            </div>
            {isSurplus ? (
              <CheckCircle className="w-8 h-8 text-emerald-400 opacity-80" />
            ) : (
              <AlertCircle className="w-8 h-8 text-amber-400 opacity-80" />
            )}
          </div>
          
          {!isSurplus && (
            <p className="text-[11px] text-slate-400 leading-relaxed pt-2">
              You are currently ${Math.abs(difference).toLocaleString()} short of your savings target. Consider logging additional shifts to close the gap.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
export default DriveSyncButton;
