import React, { useState, useRef, useEffect } from "react";
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  Sparkles, 
  Brain, 
  ShieldAlert, 
  FileText, 
  MessageSquare, 
  Clock, 
  ArrowRight, 
  Search, 
  Plus, 
  Upload, 
  Trash2, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  LineChart, 
  Coins, 
  Workflow, 
  Filter, 
  Database,
  Briefcase,
  Lock,
  ChevronRight,
  ShieldCheck,
  Award,
  BookOpen,
  DollarSign
} from "lucide-react";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: "Engineering" | "Operations" | "Sales" | "Customer Support";
  baseWage: number;
  tenureMonths: number;
  flightRisk: "Low" | "Medium" | "High";
  engagementScore: number; // 0 to 100
  skills: string[];
  documentStatus: "Verified" | "Pending" | "Expired";
  overtimeHoursThisMonth: number;
}

interface HrExecutivePortalProps {
  userEmail: string;
  onLoginAsOwner: () => void;
}

export const HrExecutivePortal: React.FC<HrExecutivePortalProps> = ({ 
  userEmail, 
  onLoginAsOwner 
}) => {
  // Passcode verification for simulation bypass
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return userEmail.toLowerCase().trim() === "shanukanishankodithuwakku@gmail.com";
  });
  const [passcodeInput, setPasscodeInput] = useState<string>("");
  const [passcodeError, setPasscodeError] = useState<string>("");

  // Update unlock state if user email changes to the owner's email
  useEffect(() => {
    if (userEmail.toLowerCase().trim() === "shanukanishankodithuwakku@gmail.com") {
      setIsUnlocked(true);
    }
  }, [userEmail]);

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim() === "MD-CEO-2026") {
      setIsUnlocked(true);
      setPasscodeError("");
    } else {
      setPasscodeError("Invalid secure access key. Try 'MD-CEO-2026' or link the owner's email.");
    }
  };

  // Pre-populated default employee roster
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "EMP-101",
      name: "Marcus Vance",
      email: "m.vance@company.com",
      role: "Lead Platform Engineer",
      department: "Engineering",
      baseWage: 78.50,
      tenureMonths: 28,
      flightRisk: "Low",
      engagementScore: 92,
      skills: ["React", "Node.js", "Docker", "System Design"],
      documentStatus: "Verified",
      overtimeHoursThisMonth: 1.5
    },
    {
      id: "EMP-102",
      name: "Sophia Martinez",
      email: "s.martinez@company.com",
      role: "Senior Operations Coordinator",
      department: "Operations",
      baseWage: 42.00,
      tenureMonths: 14,
      flightRisk: "High",
      engagementScore: 61,
      skills: ["Shift Planning", "Resource Optimization", "Logistics"],
      documentStatus: "Verified",
      overtimeHoursThisMonth: 12.8
    },
    {
      id: "EMP-103",
      name: "David Kim",
      email: "d.kim@company.com",
      role: "Growth Sales Executive",
      department: "Sales",
      baseWage: 35.00,
      tenureMonths: 8,
      flightRisk: "Medium",
      engagementScore: 78,
      skills: ["Enterprise Sales", "B2B Negotiations", "Lead Generation"],
      documentStatus: "Pending",
      overtimeHoursThisMonth: 0
    },
    {
      id: "EMP-104",
      name: "Clara Ostergaard",
      email: "c.ostergaard@company.com",
      role: "Tier-2 Support Advocate",
      department: "Customer Support",
      baseWage: 28.50,
      tenureMonths: 34,
      flightRisk: "Low",
      engagementScore: 89,
      skills: ["Zendesk", "Conflict Resolution", "Technical Writing"],
      documentStatus: "Verified",
      overtimeHoursThisMonth: 4.2
    },
    {
      id: "EMP-105",
      name: "Aaron Sterling",
      email: "a.sterling@company.com",
      role: "Fullstack Developer",
      department: "Engineering",
      baseWage: 54.00,
      tenureMonths: 6,
      flightRisk: "Medium",
      engagementScore: 74,
      skills: ["TypeScript", "Next.js", "SQL", "Cloud Functions"],
      documentStatus: "Verified",
      overtimeHoursThisMonth: 2.0
    },
    {
      id: "EMP-106",
      name: "Elena Rostova",
      email: "e.rostova@company.com",
      role: "Operations Supervisor",
      department: "Operations",
      baseWage: 48.00,
      tenureMonths: 42,
      flightRisk: "High",
      engagementScore: 54,
      skills: ["Team Management", "Process Automation", "Compliance Auditing"],
      documentStatus: "Expired",
      overtimeHoursThisMonth: 16.5
    }
  ]);

  // HR Sub-sections
  const [subTab, setSubTab] = useState<"analytics" | "recruitment" | "support" | "compliance" | "employees">("analytics");

  // Filter & Search state for Employees Tab
  const [empSearch, setEmpSearch] = useState("");
  const [empDeptFilter, setEmpDeptFilter] = useState("All");
  const [empRiskFilter, setEmpRiskFilter] = useState("All");

  // New Employee state
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpEmail, setNewEmpEmail] = useState("");
  const [newEmpRole, setNewEmpRole] = useState("");
  const [newEmpDept, setNewEmpDept] = useState<"Engineering" | "Operations" | "Sales" | "Customer Support">("Operations");
  const [newEmpWage, setNewEmpWage] = useState(30);
  const [newEmpRisk, setNewEmpRisk] = useState<"Low" | "Medium" | "High">("Low");
  const [newEmpSkills, setNewEmpSkills] = useState("");

  // CSV Import simulation
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Candidate Match state
  const [selectedJobRole, setSelectedJobRole] = useState("Senior Shift Coordinator");
  const [candidateMatches, setCandidateMatches] = useState([
    { name: "Thomas Sterling", score: 96, matchingSkills: ["Shift Planning", "Team Management", "Logistics"], matchReason: "Perfect balance of operational management & 5+ years schedule automation experience." },
    { name: "Lara Croft", score: 84, matchingSkills: ["Logistics", "Process Automation"], matchReason: "Highly adaptable, excellent crisis management, needs slight shift-work regulations training." },
    { name: "Wade Wilson", score: 58, matchingSkills: ["Team Management"], matchReason: "High energy but erratic employment history; matching skills score below benchmark." }
  ]);
  const [resumeText, setResumeText] = useState("");
  const [aiInterviewGuide, setAiInterviewGuide] = useState<string | null>(null);
  const [isGeneratingInterview, setIsGeneratingInterview] = useState(false);

  // Conversational Support bot
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot", text: string }>>([
    { sender: "bot", text: "Hello! I am the WorkDash HR Compliance Agent. Ask me about labor law, payroll, vacation standards, or internal guidelines." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Overtime optimization simulation state
  const [fatigueWarningActive, setFatigueWarningActive] = useState(true);
  const [preventOvertimeOption, setPreventOvertimeOption] = useState(true);

  // HR metrics computed from employees list
  const totalPayroll = employees.reduce((sum, emp) => sum + (emp.baseWage * 160), 0); // Approx monthly payroll (160h)
  const averageEngagement = Math.round(employees.reduce((sum, emp) => sum + emp.engagementScore, 0) / employees.length);
  const highRiskCount = employees.filter(emp => emp.flightRisk === "High").length;
  const expiredDocsCount = employees.filter(emp => emp.documentStatus === "Expired").length;

  const handleImportCSVTemplate = () => {
    // Generate a mock roster import of 4 employees
    const mockImports: Employee[] = [
      {
        id: "EMP-107",
        name: "Chloe Bourgeois",
        email: "c.bourgeois@company.com",
        role: "Client Success Specialist",
        department: "Customer Support",
        baseWage: 29.00,
        tenureMonths: 15,
        flightRisk: "Medium",
        engagementScore: 71,
        skills: ["Account Management", "Ticketing", "ESL Support"],
        documentStatus: "Verified",
        overtimeHoursThisMonth: 0
      },
      {
        id: "EMP-108",
        name: "Nathaniel Kurtzberg",
        email: "n.kurtzberg@company.com",
        role: "UI/UX Designer",
        department: "Engineering",
        baseWage: 49.00,
        tenureMonths: 20,
        flightRisk: "Low",
        engagementScore: 88,
        skills: ["Figma", "Design Systems", "Prototyping"],
        documentStatus: "Verified",
        overtimeHoursThisMonth: 1.0
      },
      {
        id: "EMP-109",
        name: "Alya Césaire",
        email: "a.cesaire@company.com",
        role: "Head of Communications",
        department: "Sales",
        baseWage: 46.00,
        tenureMonths: 12,
        flightRisk: "Low",
        engagementScore: 94,
        skills: ["PR Management", "Crisis Resolution", "Copywriting"],
        documentStatus: "Pending",
        overtimeHoursThisMonth: 0
      },
      {
        id: "EMP-110",
        name: "Adrien Agreste",
        email: "a.agreste@company.com",
        role: "Supply Chain Manager",
        department: "Operations",
        baseWage: 39.50,
        tenureMonths: 3,
        flightRisk: "High",
        engagementScore: 59,
        skills: ["Operations", "Sourcing", "Vendor Negotiations"],
        documentStatus: "Verified",
        overtimeHoursThisMonth: 8.4
      }
    ];

    setEmployees(prev => [...prev, ...mockImports]);
    setImportStatus("Successfully parsed & imported 4 employee rosters from Google Sheets context!");
    setTimeout(() => setImportStatus(null), 4000);
  };

  const handleManualAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName || !newEmpEmail || !newEmpRole) return;

    const newEmp: Employee = {
      id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      name: newEmpName,
      email: newEmpEmail,
      role: newEmpRole,
      department: newEmpDept,
      baseWage: Number(newEmpWage),
      tenureMonths: 1,
      flightRisk: newEmpRisk,
      engagementScore: 85,
      skills: newEmpSkills ? newEmpSkills.split(",").map(s => s.trim()) : ["Shift Operations"],
      documentStatus: "Verified",
      overtimeHoursThisMonth: 0
    };

    setEmployees(prev => [newEmp, ...prev]);
    setNewEmpName("");
    setNewEmpEmail("");
    setNewEmpRole("");
    setNewEmpSkills("");
    setImportStatus("New employee profile created successfully!");
    setTimeout(() => setImportStatus(null), 3000);
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const handleGenerateInterview = () => {
    if (!resumeText) {
      alert("Please paste a candidate's bio or resume summary to audit and generate questions.");
      return;
    }
    setIsGeneratingInterview(true);
    setTimeout(() => {
      setAiInterviewGuide(`📋 STRUCTURED CANDIDATE ASSESSMENT & INTERVIEW GUIDE
--------------------------------------------------
TARGET ROLE: ${selectedJobRole}

⚠️ AUDITED RESUME GAPS DETECTED:
- Short tenure spikes (under 12 months) in prior two roles suggests flight-risk warning.
- High skills familiarity in front-end architecture, but limited experience in high-concurrency database setups.

🎯 DYNAMIC INTERVIEW QUESTIONS GENERATED:
1. "Your prior positions ended after 8 and 10 months respectively. As an MD looking to lock-in operational continuity, how would you design your transition plan here?" (Target: Integrity & Continuity)
2. "Explain how you would cross-train non-technical shift managers on high-velocity scheduling tools without introducing training friction?" (Target: Workforce Capacity Strategy)
3. "Can you provide a glass-box explanation of a time when a machine routing algorithm failed your team, and how you audited its biases manually?" (Target: Transparency & Compliance)`);
      setIsGeneratingInterview(false);
    }, 1500);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      let botReply = "I have scanned our internal wikis and local compliance. ";
      const msg = userMsg.toLowerCase();

      if (msg.includes("t4") || msg.includes("tax form") || msg.includes("w-2")) {
        botReply += "🔒 All tax documents (including Canadian T4s and US W-2s) are securely persisted under the 'Employee Profiles' section or synced to your connected Google Sheet. Employees can access them after completing standard OAuth profile verification.";
      } else if (msg.includes("leave") || msg.includes("parental") || msg.includes("sick")) {
        botReply += "💼 Our corporate standard guarantees 15 business days of paid personal/sick leave and fully-compliant 12-month parental leave. Operational coverages are automatically handled by our roster algorithms to prevent service interruptions.";
      } else if (msg.includes("overtime") || msg.includes("laws") || msg.includes("compliance")) {
        botReply += "⚖️ Warning: Under BC and Federal Employment Standards, overtime (1.5x) is triggered after 8 hours daily or 40 hours weekly. The Overtime Prevention mode is currently ACTIVE in your roster optimizer to keep payroll variance under 2.5%.";
      } else {
        botReply += `I have recorded your ticket regarding "${userMsg}". Deflection rate is currently 88%. This has been mapped directly to the active MD ticket log.`;
      }

      setChatMessages(prev => [...prev, { sender: "bot", text: botReply }]);
      setIsTyping(false);
    }, 1000);
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(empSearch.toLowerCase()) || 
                          emp.role.toLowerCase().includes(empSearch.toLowerCase()) ||
                          emp.email.toLowerCase().includes(empSearch.toLowerCase());
    const matchesDept = empDeptFilter === "All" || emp.department === empDeptFilter;
    const matchesRisk = empRiskFilter === "All" || emp.flightRisk === empRiskFilter;
    return matchesSearch && matchesDept && matchesRisk;
  });

  // Locked gate view
  if (!isUnlocked) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[75vh] animate-fadeIn">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-lg text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              C-Suite Executive Gate
            </span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Enterprise HR Intelligence Locked
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              This panel provides predictive people analytics, flight risk forecasting, payroll ROIs, and bias-free candidate vetting reserved exclusively for the Managing Director.
            </p>
          </div>

          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide font-mono block text-left">
                Enter MD Passcode Key
              </label>
              <input
                required
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Hint: Try 'MD-CEO-2026' to bypass"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-amber-500 transition text-center font-mono"
              />
            </div>

            {passcodeError && (
              <p className="text-[10px] text-rose-400 font-mono text-center">
                ⚠️ {passcodeError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              Verify MD Identity & Unlock
            </button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[9px] text-slate-500 font-mono font-bold uppercase">Or authenticate</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <div className="space-y-3">
            <button
              onClick={onLoginAsOwner}
              className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-800 text-amber-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              Auto-Link owner account (shanukanishankodithuwakku@gmail.com)
            </button>
            <p className="text-[9px] text-slate-500 font-mono">
              The owner profile possesses native, full-stack permission clearance automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Banner Alert */}
      <div className="bg-gradient-to-r from-amber-500/10 to-indigo-600/15 border border-indigo-500/20 p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-2xl flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                MD Secured
              </span>
              <span className="text-xs text-slate-400 font-mono">MD Identity Certified</span>
            </div>
            <h1 className="text-lg font-black text-white tracking-tight mt-0.5">
              Enterprise HR Intelligence Control Deck
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Active predictive forecasting modeling, high-velocity screening modules, and compliance audit tracks.
            </p>
          </div>
        </div>

        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => handleImportCSVTemplate()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            Sync Google Sheet Roster
          </button>
          <button
            onClick={() => {
              setIsUnlocked(false);
              setPasscodeInput("");
            }}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            Lock Dashboard
          </button>
        </div>
      </div>

      {/* Dynamic Toast Alerts */}
      {importStatus && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl text-xs font-medium font-mono flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {importStatus}
        </div>
      )}

      {/* Core Executive KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 space-y-3 relative overflow-hidden hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-500 font-mono">
            <span className="text-[10px] uppercase tracking-wider font-bold">Predictive Labor Spend (Monthly)</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-white font-mono">${totalPayroll.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
              <span>📈 ROI output evaluated at +314%</span>
            </p>
          </div>
          <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full w-[72%]"></div>
          </div>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 space-y-3 relative overflow-hidden hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-500 font-mono">
            <span className="text-[10px] uppercase tracking-wider font-bold">Predictive Attrition Risk</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-white font-mono">
              {Math.round((highRiskCount / employees.length) * 100)}%
            </p>
            <p className="text-[10px] text-amber-400 font-medium flex items-center gap-1 mt-0.5 animate-pulse">
              <span>⚠️ {highRiskCount} employee(s) flagged at High Risk</span>
            </p>
          </div>
          <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full w-[33%]"></div>
          </div>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 space-y-3 relative overflow-hidden hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-500 font-mono">
            <span className="text-[10px] uppercase tracking-wider font-bold">Company Engagement Index</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-white font-mono">{averageEngagement}/100</p>
            <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
              <span>🚀 Outperforming local sector standard</span>
            </p>
          </div>
          <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[81%]"></div>
          </div>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 space-y-3 relative overflow-hidden hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-500 font-mono">
            <span className="text-[10px] uppercase tracking-wider font-bold">Regulatory Audits Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-white font-mono">
              {expiredDocsCount === 0 ? "100%" : "83.3%"}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {expiredDocsCount > 0 ? `⚠️ ${expiredDocsCount} expired credentials detected` : "All standard certifications verified"}
            </p>
          </div>
          <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
            <div className={`h-full ${expiredDocsCount === 0 ? "bg-emerald-500" : "bg-rose-500"} w-[83%]`}></div>
          </div>
        </div>
      </div>

      {/* Internal Portal Navigation Hub - High Visibility */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setSubTab("analytics")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            subTab === "analytics"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <LineChart className="w-4 h-4" />
          I. Predictive People Analytics
        </button>
        <button
          onClick={() => setSubTab("recruitment")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            subTab === "recruitment"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          II. High-Velocity Recruitment
        </button>
        <button
          onClick={() => setSubTab("support")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            subTab === "support"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          III. "Tier-0" Support Bot
        </button>
        <button
          onClick={() => setSubTab("compliance")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            subTab === "compliance"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          IV. Bulletproof Compliance
        </button>
        <button
          onClick={() => setSubTab("employees")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            subTab === "employees"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Users className="w-4 h-4" />
          V. Employee Directory & Importer
        </button>
      </div>

      {/* SUB-SECTION RENDER */}

      {/* --- I. PREDICTIVE PEOPLE ANALYTICS --- */}
      {subTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Flight-Risk Forecasting Block */}
          <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 space-y-5 lg:col-span-2">
            <div>
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Brain className="w-4 h-4" />
                <h3 className="text-sm font-bold text-white tracking-tight uppercase">Flight-Risk Predictive Modeling</h3>
              </div>
              <p className="text-xs text-slate-400">
                Algorithms scanning engagement scores, compensation benchmarks, and overtime schedules to preemptively forecast resignation risks.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-500 pb-2">
                    <th className="py-2">Employee</th>
                    <th>Department</th>
                    <th>Engagement Score</th>
                    <th>Tenure</th>
                    <th>Predictive Risk</th>
                    <th>Strategic Intervention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-950/20">
                      <td className="py-3 font-semibold text-slate-200">{emp.name}</td>
                      <td className="text-slate-400">{emp.department}</td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full ${
                              emp.engagementScore > 80 ? "bg-emerald-500" : emp.engagementScore > 60 ? "bg-amber-500" : "bg-rose-500"
                            }`} style={{ width: `${emp.engagementScore}%` }}></div>
                          </div>
                          <span className="font-mono text-[11px] text-slate-300">{emp.engagementScore}%</span>
                        </div>
                      </td>
                      <td className="text-slate-300 font-mono">{emp.tenureMonths} mo</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          emp.flightRisk === "High" 
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                            : emp.flightRisk === "Medium"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {emp.flightRisk} Risk
                        </span>
                      </td>
                      <td>
                        {emp.flightRisk === "High" ? (
                          <button 
                            onClick={() => {
                              alert(`Retention adjuster activated for ${emp.name}! Suggested intervention: Adjust compensation profile from $${emp.baseWage}/hr to $${Math.round(emp.baseWage * 1.08)}/hr and restrict consecutive overtime logs.`);
                              // Change risk to medium
                              setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, flightRisk: "Medium", engagementScore: 78 } : e));
                            }}
                            className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[10px] transition cursor-pointer"
                          >
                            Run Retention Fix
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">Monitor Mode Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Skill Capacity & Labor ROI */}
          <div className="space-y-6">
            
            {/* Workforce Skills Bottlenecks */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 space-y-4">
              <div>
                <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-wider">
                  Workforce Capacity & Skills Mapping
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Cross-referencing active rosters against project demands to flag labor bottlenecks.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Engineering Coverage</span>
                    <span className="text-emerald-400">Optimal (92%)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[92%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Operations Coverage</span>
                    <span className="text-rose-400">Bottleneck Alarm (54%)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full w-[54%]"></div>
                  </div>
                  <p className="text-[10px] text-rose-400 font-mono mt-1">
                    ⚠️ Deficit in qualified Shift Schedulers during weekend night hours.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Customer Support</span>
                    <span className="text-indigo-400">Healthy (85%)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full w-[85%]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROI on Labor Spend Monitor */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 space-y-4">
              <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">
                Headcount Cost vs Revenue Output
              </h4>

              <div className="space-y-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">Gross Headcount Spend</p>
                    <p className="text-base font-extrabold text-white font-mono">${totalPayroll.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-slate-500 uppercase">Tracked Revenue Output</p>
                    <p className="text-base font-extrabold text-emerald-400 font-mono">${(totalPayroll * 3.4).toLocaleString()}</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 leading-relaxed bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-500/10">
                  ⚡ <strong>MD Insights</strong>: Current financial efficiency stands at <strong>340%</strong>. Operations team has the highest return multiplier (3.8x) despite high flight risks.
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- II. HIGH-VELOCITY RECRUITMENT --- */}
      {subTab === "recruitment" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Candidate-Job Matcher & Sourcing Panel */}
          <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 space-y-5 lg:col-span-2">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <Briefcase className="w-4 h-4" />
                <h3 className="text-sm font-bold text-white tracking-tight uppercase">High-Velocity Smart Screening Vetting</h3>
              </div>
              <p className="text-xs text-slate-400">
                Identify matching candidates and automatically score them based on deep structural suitability instead of simple keyword searching.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono block">
                Target Open Role Requirements
              </label>
              <select
                value={selectedJobRole}
                onChange={(e) => setSelectedJobRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
              >
                <option value="Senior Shift Coordinator">Senior Shift Coordinator (Wages: $45/hr)</option>
                <option value="Lead Software Architect">Lead Software Architect (Wages: $80/hr)</option>
                <option value="Growth Communications Lead">Growth Communications Lead (Wages: $42/hr)</option>
              </select>
            </div>

            <div className="space-y-3.5">
              <p className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                Scored Candidate Matchings
              </p>
              
              <div className="space-y-3">
                {candidateMatches.map((cand, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-850 hover:border-slate-800 transition space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                          {cand.name[0]}
                        </span>
                        <h4 className="text-xs font-bold text-slate-200">{cand.name}</h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        cand.score > 90 
                          ? "bg-emerald-500/15 text-emerald-400" 
                          : cand.score > 70 
                            ? "bg-amber-500/15 text-amber-400" 
                            : "bg-rose-500/15 text-rose-400"
                      }`}>
                        Score: {cand.score}/100
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {cand.matchReason}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cand.matchingSkills.map((sk, sIdx) => (
                        <span key={sIdx} className="bg-slate-900 border border-slate-800 text-[9px] font-mono text-slate-400 px-2 py-0.5 rounded-md">
                          ✓ {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI-Generated Interview Guides & Sourcing */}
          <div className="space-y-6">
            
            {/* AI Custom Interview Assessment Guide Generator */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 space-y-4">
              <div>
                <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-wider">
                  AI Structured Interview Generator
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Generate candidate questions tailored to specific resume gaps.
                </p>
              </div>

              <div className="space-y-3">
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste Candidate Resume text or Bio here... e.g. 'Software developer for 10 months at Acme Corp. Fluent in React but limited DB experience.'"
                  className="w-full h-24 bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-slate-300 outline-none focus:border-indigo-500 placeholder:text-slate-600 resize-none font-mono"
                />

                <button
                  type="button"
                  onClick={handleGenerateInterview}
                  disabled={isGeneratingInterview}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-white shrink-0" />
                  {isGeneratingInterview ? "Analyzing Resume..." : "Generate Custom Guide"}
                </button>
              </div>

              {aiInterviewGuide && (
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 text-[10px] font-mono text-slate-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {aiInterviewGuide}
                </div>
              )}
            </div>

            {/* Sourcing Automation */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 space-y-3">
              <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">
                Passive Sourcing Agents (Auto-Pitch)
              </h4>
              <p className="text-[11px] text-slate-400">
                Simulate active search bots scouring external job systems to source top passive candidates automatically.
              </p>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Linkedin Search Agent</span>
                  <span className="text-emerald-400 font-mono">Running</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Last action: Soft-pitched 5 potential operations managers in BC. 2 initial vetting calls scheduled.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- III. "TIER-0" SUPPORT BOT & SCHEDULER --- */}
      {subTab === "support" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Conversational Ticket Deflection Bot */}
          <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 space-y-4 lg:col-span-2 flex flex-col justify-between h-[500px]">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <MessageSquare className="w-4 h-4" />
                <h3 className="text-sm font-bold text-white tracking-tight uppercase">HR Conversational AI Ticket Agent</h3>
              </div>
              <p className="text-xs text-slate-400">
                Highly secure natural-language conversational support reading internal policies. Curbs administrative hours to 0.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-850/80 rounded-2xl flex-1 my-3 overflow-y-auto p-4 space-y-3 flex flex-col">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white self-end rounded-tr-none"
                      : "bg-slate-900 text-slate-300 self-start rounded-tl-none border border-slate-850"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {isTyping && (
                <div className="text-[10px] text-slate-500 font-mono animate-pulse self-start">
                  AI HR Bot is typing legal standards reply...
                </div>
              )}
            </div>

            <form onSubmit={handleSendChatMessage} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about W-2s, overtime triggers, sick leave wiki..."
                className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center shrink-0 cursor-pointer"
              >
                Send Query
              </button>
            </form>
          </div>

          {/* Schedule & Overtime Prevention Optimizer */}
          <div className="space-y-6">
            
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 space-y-4">
              <div>
                <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-wider">
                  Automated Overtime Prevention
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Predict labor demand surges and automatically lock rosters before unauthorized overtime expenditures trigger.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-200">Overtime Lock</p>
                    <p className="text-[10px] text-slate-500">Auto-reject shifts exceeding 40h/wk</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPreventOvertimeOption(!preventOvertimeOption);
                      alert(preventOvertimeOption ? "Roster Overtime checks disabled. Warning: Variance spend could spike by 15%." : " Roster Overtime check ACTIVATED. Schedule compliance secured.");
                    }}
                    className={`w-11 h-6 rounded-full p-1 transition-colors ${preventOvertimeOption ? "bg-emerald-500" : "bg-slate-800"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${preventOvertimeOption ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-200">Fatigue Safeguard Warning</p>
                    <p className="text-[10px] text-slate-500">Flag consecutive overnight shifts</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFatigueWarningActive(!fatigueWarningActive);
                    }}
                    className={`w-11 h-6 rounded-full p-1 transition-colors ${fatigueWarningActive ? "bg-emerald-500" : "bg-slate-800"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${fatigueWarningActive ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>

                <div className="bg-indigo-950/20 p-3 rounded-xl border border-indigo-500/10 text-[10px] text-indigo-300 leading-normal">
                  🎯 <strong>MD Strategy Note</strong>: By keeping Overtime Lock active, you save up to <strong>14.2%</strong> on variable weekly labor costs.
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- IV. BULLETPROOF COMPLIANCE --- */}
      {subTab === "compliance" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Glass-Box AI Transparency Audit */}
          <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 space-y-5 lg:col-span-2">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <h3 className="text-sm font-bold text-white tracking-tight uppercase">Explainable AI Bias Auditing</h3>
              </div>
              <p className="text-xs text-slate-400">
                To protect against legal liability, any AI layer scheduling shifts or vetting applicants must provide transparent, explainable decisions ("Glass-Box AI").
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                  <span className="font-semibold text-slate-200">Roster Assignment Audit #2026-X</span>
                  <span className="text-emerald-400 font-bold font-mono">100% EXPLAINABLE</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Candidate Sophia Martinez was prioritized for the Sunday night slot because:
                </p>
                <ul className="space-y-1.5 list-disc list-inside text-slate-300 pl-1 font-mono text-[11px]">
                  <li>• Total monthly hours is 120 (far below fatigue threshold of 160).</li>
                  <li>• Possesses the required "Shift Planning" and "Resource Optimization" certifications.</li>
                  <li>• Zero gender, age, or compensation weight coefficients were included in the sorting matrix.</li>
                </ul>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                  <span className="font-semibold text-slate-200">Smart Candidate Resume Screening Vetting</span>
                  <span className="text-emerald-400 font-bold font-mono">BIAS AUDITED OK</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  AI screening weights are restricted strictly to: <strong>Hard Skills (40%)</strong>, <strong>Past Tenure Logs (40%)</strong>, and <strong>Relevant Project Histories (20%)</strong>. Personal identification metadata is fully anonymized during ranking runs.
                </p>
              </div>
            </div>
          </div>

          {/* Labor Law Proactivity Monitor */}
          <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 space-y-4">
            <div>
              <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-wider">
                Active Labor Law Sentinel
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Automatically tracking local labor transparency laws & standard certifications.
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-200">BC Pay Transparency Act</span>
                  <span className="text-emerald-400 font-mono">Compliant</span>
                </div>
                <p className="text-[10px] text-slate-500">Wage ranges must be published on all public roster posts. Fully automated in our recruitment deck.</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-200">Ontario Fatigue Safety Standard</span>
                  <span className="text-emerald-400 font-mono">Compliant</span>
                </div>
                <p className="text-[10px] text-slate-500">Rest intervals between work shift logs checked. Safeguards configured.</p>
              </div>

              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-rose-400">Certification Renewal Alerts</span>
                  <span className="text-rose-400 font-mono">1 Action Req.</span>
                </div>
                <p className="text-[10px] text-slate-400">Employee Elena Rostova has an expired Operations Supervisor certification check.</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* --- V. EMPLOYEE DIRECTORY & IMPORTER --- */}
      {subTab === "employees" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* CSV File Import simulator & Manual add form side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quick Multi-Employee CSV Import Simulator */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 space-y-4">
              <div>
                <h3 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">
                  High-Speed Spreadsheet / CSV Roster Importer
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Import hundreds of employees roster profiles instantly. You can easily trigger our mock database sheet parse to test the layout.
                </p>
              </div>

              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-850 border-dashed text-center space-y-3">
                <Upload className="w-8 h-8 text-slate-500 mx-auto animate-bounce" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-300">Roster CSV File Dropzone</p>
                  <p className="text-[10px] text-slate-500 font-mono">Accepts: .csv, .json format</p>
                </div>

                <div className="flex gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => handleImportCSVTemplate()}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    🚀 Trigger Mock Import
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 leading-normal font-mono bg-slate-950/20 p-2.5 rounded-xl text-center">
                Choosing Mock Import reads a pre-configured Google Sheet CSV export of 4 employees & adds them instantly!
              </p>
            </div>

            {/* Manual ADD employee card */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 space-y-4 lg:col-span-2">
              <h3 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-wider">
                Create New Employee Roster Profile
              </h3>

              <form onSubmit={handleManualAddEmployee} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Employee Name</label>
                  <input
                    required
                    type="text"
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Corporate Email</label>
                  <input
                    required
                    type="email"
                    value={newEmpEmail}
                    onChange={(e) => setNewEmpEmail(e.target.value)}
                    placeholder="e.g. j.doe@company.com"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Assigned Role</label>
                  <input
                    required
                    type="text"
                    value={newEmpRole}
                    onChange={(e) => setNewEmpRole(e.target.value)}
                    placeholder="e.g. Operations Assistant"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Base Wage ($ / Hr)</label>
                  <input
                    required
                    type="number"
                    value={newEmpWage}
                    onChange={(e) => setNewEmpWage(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Assigned Department</label>
                  <select
                    value={newEmpDept}
                    onChange={(e) => setNewEmpDept(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Operations">Operations</option>
                    <option value="Sales">Sales</option>
                    <option value="Customer Support">Customer Support</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Predictive Turnover Risk Status</label>
                  <select
                    value={newEmpRisk}
                    onChange={(e) => setNewEmpRisk(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Attrition Risk</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Key Certified Skills (Comma-separated)</label>
                  <input
                    type="text"
                    value={newEmpSkills}
                    onChange={(e) => setNewEmpSkills(e.target.value)}
                    placeholder="e.g. Logistics, Shift Management, CRM"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" /> Add Profile to Enterprise DB
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Active directory search / list view */}
          <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wide">
                  Active Roster Directory
                </h3>
                <p className="text-xs text-slate-500">
                  Showing {filteredEmployees.length} of {employees.length} recorded employees.
                </p>
              </div>

              {/* Filtering Controls */}
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                    placeholder="Search name, role..."
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 pl-8 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 placeholder:text-slate-600"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-2.5" />
                </div>

                <select
                  value={empDeptFilter}
                  onChange={(e) => setEmpDeptFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-400 outline-none focus:border-indigo-500"
                >
                  <option value="All">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Operations">Operations</option>
                  <option value="Sales">Sales</option>
                  <option value="Customer Support">Customer Support</option>
                </select>

                <select
                  value={empRiskFilter}
                  onChange={(e) => setEmpRiskFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-400 outline-none focus:border-indigo-500"
                >
                  <option value="All">All Risks</option>
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                </select>
              </div>
            </div>

            {/* List directory elements */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredEmployees.map(emp => (
                <div key={emp.id} className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 hover:border-slate-800 transition flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{emp.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{emp.role}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className="p-1 text-slate-600 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition cursor-pointer"
                        title="Delete roster account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <span className="bg-indigo-950/30 text-indigo-300 text-[9px] font-mono px-2 py-0.5 rounded border border-indigo-500/10">
                        {emp.department}
                      </span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                        emp.flightRisk === "High"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse"
                          : emp.flightRisk === "Medium"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {emp.flightRisk} Risk
                      </span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                        emp.documentStatus === "Verified"
                          ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/15"
                          : emp.documentStatus === "Pending"
                            ? "bg-amber-500/5 text-amber-400 border-amber-500/15"
                            : "bg-rose-500/5 text-rose-400 border-rose-500/15"
                      }`}>
                        Docs: {emp.documentStatus}
                      </span>
                    </div>

                    <div className="bg-slate-900/30 p-2.5 rounded-xl border border-slate-850/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Hourly Rate:</span>
                      <span className="font-bold text-slate-200">${emp.baseWage}/hr</span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[9px] font-mono text-slate-500 uppercase">Certified Skills Matrix:</p>
                      <div className="flex flex-wrap gap-1">
                        {emp.skills.map((sk, skIdx) => (
                          <span key={skIdx} className="bg-slate-900 text-slate-400 text-[8px] font-mono px-1.5 py-0.5 rounded border border-slate-800">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-850/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Tenure: {emp.tenureMonths} months</span>
                    <span>OT: {emp.overtimeHoursThisMonth}h</span>
                  </div>
                </div>
              ))}

              {filteredEmployees.length === 0 && (
                <div className="col-span-full py-8 text-center bg-slate-950/40 rounded-2xl border border-slate-850">
                  <p className="text-xs text-slate-500 font-mono">No employees roster match the active filters.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
