/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, FormEvent, useRef } from "react";
import { 
  Briefcase, 
  Brain, 
  Calendar, 
  Clock, 
  DollarSign, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Edit2, 
  Settings, 
  Database, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Search, 
  AlertCircle, 
  HelpCircle,
  FileSpreadsheet,
  Layers,
  Info,
  Menu,
  X,
  LayoutDashboard,
  CalendarDays,
  FileCode,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Linkedin,
  Sparkles,
  Bot,
  Target,
  PiggyBank,
  ArrowRight,
  Percent,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  User,
  LogOut,
  Users,
  Check,
  Play,
  Mail,
  Coins,
  UserCheck,
  Radar
} from "lucide-react";
import { Hotspot } from "./components/Hotspot";
import { motion, AnimatePresence } from "motion/react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from "recharts";
import { Shift, JobConfig, ConnectionConfig, ImportLog } from "./types";
import { parseShiftsFromSheet, calculateShiftHours } from "./utils/parser";
import { DashboardStats } from "./components/DashboardStats";
import DriveSyncButton from "./components/DriveSyncButton";
import { RosterCalendar } from "./components/RosterCalendar";
import { SetupGuide } from "./components/SetupGuide";
import { HrExecutivePortal } from "./components/HrExecutivePortal";
import SupportPortal from "./components/SupportPortal";

// Pre-populated realistic shifts from the user's excel sheet image to showcase functionality immediately
const INITIAL_SHIFTS: Shift[] = [
  { id: "s1", date: "2026-06-15", job: "job1", start: "09:00", end: "17:00", hours: 8.0, notes: "Fictional day shift", hourlyRate: 18.50, earnings: 148.00 },
  { id: "s2", date: "2026-06-16", job: "Job 2", start: "14:00", end: "22:00", hours: 8.0, notes: "Special consulting task", hourlyRate: 24.00, earnings: 192.00 },
  { id: "s3", date: "2026-06-18", job: "job1", start: "09:00", end: "17:00", hours: 8.0, notes: "Weekday shift", hourlyRate: 18.50, earnings: 148.00 },
  { id: "s4", date: "2026-06-20", job: "Job 2", start: "12:00", end: "18:00", hours: 6.0, notes: "Weekend project milestone", hourlyRate: 24.00, earnings: 144.00 },
  { id: "s5", date: "2026-06-22", job: "job1", start: "08:30", end: "16:30", hours: 8.0, notes: "Morning routine tasks", hourlyRate: 18.50, earnings: 148.00 },
  { id: "s6", date: "2026-06-24", job: "Job 2", start: "16:00", end: "00:00", hours: 8.0, notes: "Evening deployment support", hourlyRate: 24.00, earnings: 192.00 }
];

const INITIAL_JOBS: JobConfig[] = [
  { name: "job1", hourlyRate: 18.50, color: "#10b981" }, // Emerald Green
  { name: "Job 2", hourlyRate: 24.00, color: "#6366f1" } // Indigo Blue
];

const DEFAULT_URL = "https://script.google.com/macros/s/AKfycbzFWvo4lZZczRLysibJJV7FwWUJsPj7Vm8qH0Z-Wxh5IiYjIET6T8YgqKqC19Gyla5a/exec";

const tourIcons = [
  { icon: Sparkles, label: "Welcome" },
  { icon: LayoutDashboard, label: "Command Center" },
  { icon: Percent, label: "Payroll Module" },
  { icon: CalendarDays, label: "Attendance/HR" }
];

// --- Custom Country Tax and Currency Configurations ---
export interface TaxBracket {
  limit: number | null; // null means no limit (infinity / top bracket)
  rate: number; // tax rate percentage (e.g. 15 for 15%)
}

export interface CountryConfig {
  name: string;
  code: string;
  currency: string;
  symbol: string;
  isProgressive: boolean;
  brackets: TaxBracket[];
  flatRate: number; // default rate if manual slider is adjusted, or used for flat tax countries
  referenceUrl: string;
  referenceName: string;
}

export const COUNTRY_TAX_DATA: CountryConfig[] = [
  {
    name: "United States",
    code: "USA",
    currency: "USD",
    symbol: "$",
    isProgressive: true,
    flatRate: 15,
    brackets: [
      { limit: 11600, rate: 10 },
      { limit: 47150, rate: 12 },
      { limit: 100525, rate: 22 },
      { limit: 191950, rate: 24 },
      { limit: null, rate: 32 }
    ],
    referenceUrl: "https://www.irs.gov/filing/federal-income-tax-rates-and-brackets",
    referenceName: "IRS Federal Tax Rates & Brackets"
  },
  {
    name: "Canada",
    code: "CAN",
    currency: "CAD",
    symbol: "$",
    isProgressive: true,
    flatRate: 15,
    brackets: [
      { limit: 55867, rate: 15 },
      { limit: 111733, rate: 20.5 },
      { limit: 173205, rate: 26 },
      { limit: 246752, rate: 29 },
      { limit: null, rate: 33 }
    ],
    referenceUrl: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html",
    referenceName: "Canada Revenue Agency (CRA) Guidelines"
  },
  {
    name: "Australia",
    code: "AUS",
    currency: "AUD",
    symbol: "$",
    isProgressive: true,
    flatRate: 16,
    brackets: [
      { limit: 18200, rate: 0 },
      { limit: 45000, rate: 16 },
      { limit: 120000, rate: 30 },
      { limit: 180000, rate: 37 },
      { limit: null, rate: 45 }
    ],
    referenceUrl: "https://www.ato.gov/tax-rates-and-codes/individual-income-tax-rates",
    referenceName: "Australian Taxation Office (ATO)"
  },
  {
    name: "United Kingdom",
    code: "GBR",
    currency: "GBP",
    symbol: "£",
    isProgressive: true,
    flatRate: 20,
    brackets: [
      { limit: 12570, rate: 0 },
      { limit: 50270, rate: 20 },
      { limit: 125140, rate: 40 },
      { limit: null, rate: 45 }
    ],
    referenceUrl: "https://www.gov.uk/income-tax-rates",
    referenceName: "HMRC Income Tax Rates"
  },
  {
    name: "Scotland",
    code: "SCO",
    currency: "GBP",
    symbol: "£",
    isProgressive: true,
    flatRate: 20,
    brackets: [
      { limit: 12570, rate: 0 },
      { limit: 14876, rate: 19 },
      { limit: 26561, rate: 20 },
      { limit: 43662, rate: 21 },
      { limit: 75000, rate: 42 },
      { limit: null, rate: 45 }
    ],
    referenceUrl: "https://www.gov.uk/scottish-income-tax",
    referenceName: "Scottish Government Rates"
  },
  {
    name: "Wales",
    code: "WAL",
    currency: "GBP",
    symbol: "£",
    isProgressive: true,
    flatRate: 20,
    brackets: [
      { limit: 12570, rate: 0 },
      { limit: 50270, rate: 20 },
      { limit: 125140, rate: 40 },
      { limit: null, rate: 45 }
    ],
    referenceUrl: "https://www.gov.uk/welsh-income-tax",
    referenceName: "Welsh Government Rates"
  },
  {
    name: "Sri Lanka",
    code: "LKA",
    currency: "LKR",
    symbol: "රු.",
    isProgressive: true,
    flatRate: 12,
    brackets: [
      { limit: 1200000, rate: 0 },
      { limit: 1800000, rate: 6 },
      { limit: 2400000, rate: 12 },
      { limit: 3000000, rate: 18 },
      { limit: 3600000, rate: 24 },
      { limit: null, rate: 30 }
    ],
    referenceUrl: "https://www.ird.gov.lk",
    referenceName: "Sri Lanka Inland Revenue"
  },
  {
    name: "India",
    code: "IND",
    currency: "INR",
    symbol: "₹",
    isProgressive: true,
    flatRate: 15,
    brackets: [
      { limit: 300000, rate: 0 },
      { limit: 600000, rate: 5 },
      { limit: 900000, rate: 10 },
      { limit: 1200000, rate: 15 },
      { limit: 1500000, rate: 20 },
      { limit: null, rate: 30 }
    ],
    referenceUrl: "https://www.incometax.gov.in",
    referenceName: "Income Tax Department of India"
  },
  {
    name: "UAE",
    code: "ARE",
    currency: "AED",
    symbol: "AED ",
    isProgressive: false,
    flatRate: 0,
    brackets: [
      { limit: null, rate: 0 }
    ],
    referenceUrl: "https://u.ae/en/information-and-services/finance-and-investment/taxation",
    referenceName: "UAE Finance Portal"
  },
  {
    name: "Japan",
    code: "JPN",
    currency: "JPY",
    symbol: "¥",
    isProgressive: true,
    flatRate: 10,
    brackets: [
      { limit: 1950000, rate: 5 },
      { limit: 3300000, rate: 10 },
      { limit: 6950000, rate: 20 },
      { limit: 9000000, rate: 23 },
      { limit: 18000000, rate: 33 },
      { limit: null, rate: 40 }
    ],
    referenceUrl: "https://www.nta.go.jp/english/",
    referenceName: "National Tax Agency Japan"
  },
  {
    name: "Mexico",
    code: "MEX",
    currency: "MXN",
    symbol: "$",
    isProgressive: true,
    flatRate: 10,
    brackets: [
      { limit: 10000, rate: 1.92 },
      { limit: 100000, rate: 6.4 },
      { limit: 250000, rate: 16 },
      { limit: 500000, rate: 23.52 },
      { limit: null, rate: 30 }
    ],
    referenceUrl: "https://www.sat.gob.mx",
    referenceName: "SAT Mexico Portal"
  },
  {
    name: "Brazil",
    code: "BRA",
    currency: "BRL",
    symbol: "R$",
    isProgressive: true,
    flatRate: 15,
    brackets: [
      { limit: 27000, rate: 0 },
      { limit: 33900, rate: 7.5 },
      { limit: 45000, rate: 15 },
      { limit: 55900, rate: 22.5 },
      { limit: null, rate: 27.5 }
    ],
    referenceUrl: "https://www.gov.br/receitafederal/pt-br",
    referenceName: "Receita Federal do Brasil"
  },
  {
    name: "Singapore",
    code: "SGP",
    currency: "SGD",
    symbol: "S$",
    isProgressive: true,
    flatRate: 5,
    brackets: [
      { limit: 20000, rate: 0 },
      { limit: 30000, rate: 2 },
      { limit: 40000, rate: 3.5 },
      { limit: 80000, rate: 7 },
      { limit: 120000, rate: 11.5 },
      { limit: null, rate: 15 }
    ],
    referenceUrl: "https://www.iras.gov.sg",
    referenceName: "IRAS Singapore Guidelines"
  }
];

export interface ProvinceConfig {
  name: string;
  code: string;
  brackets: TaxBracket[];
  referenceUrl: string;
  referenceName: string;
}

export const CANADA_PROVINCES: ProvinceConfig[] = [
  {
    name: "Federal Only (No Provincial)",
    code: "FED",
    brackets: [],
    referenceUrl: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html",
    referenceName: "CRA Federal Guidelines"
  },
  {
    name: "British Columbia (BC)",
    code: "BC",
    brackets: [
      { limit: 47549, rate: 5.06 },
      { limit: 95099, rate: 7.7 },
      { limit: 109127, rate: 10.5 },
      { limit: 129508, rate: 12.29 },
      { limit: 163030, rate: 14.7 },
      { limit: 227771, rate: 16.8 },
      { limit: null, rate: 20.5 }
    ],
    referenceUrl: "https://www2.gov.bc.ca/gov/content/taxes/income-taxes/personal/rates",
    referenceName: "BC Personal Income Tax Rates"
  },
  {
    name: "Alberta (AB)",
    code: "AB",
    brackets: [
      { limit: 148269, rate: 10 },
      { limit: 177923, rate: 12 },
      { limit: 237231, rate: 13 },
      { limit: 355846, rate: 14 },
      { limit: null, rate: 15 }
    ],
    referenceUrl: "https://www.alberta.ca/personal-income-tax",
    referenceName: "Alberta Personal Income Tax"
  },
  {
    name: "Ontario (ON)",
    code: "ON",
    brackets: [
      { limit: 51446, rate: 5.05 },
      { limit: 102895, rate: 9.15 },
      { limit: 150000, rate: 11.16 },
      { limit: 220000, rate: 12.16 },
      { limit: null, rate: 13.16 }
    ],
    referenceUrl: "https://www.ontario.ca/page/personal-income-tax-rates-and-brackets",
    referenceName: "Ontario Income Tax Rates"
  },
  {
    name: "Quebec (QC)",
    code: "QC",
    brackets: [
      { limit: 51780, rate: 14 },
      { limit: 103550, rate: 19 },
      { limit: 126010, rate: 24 },
      { limit: null, rate: 25.75 }
    ],
    referenceUrl: "https://www.revenuquebec.ca/en/citizens/income-tax-return/completing-your-income-tax-return/income-tax-rates/",
    referenceName: "Revenu Québec Income Tax Rates"
  },
  {
    name: "Manitoba (MB)",
    code: "MB",
    brackets: [
      { limit: 47000, rate: 10.8 },
      { limit: 100000, rate: 12.75 },
      { limit: null, rate: 17.4 }
    ],
    referenceUrl: "https://www.gov.mb.ca/finance/personal/p_tax_rates.html",
    referenceName: "Manitoba Finance Rates"
  },
  {
    name: "Saskatchewan (SK)",
    code: "SK",
    brackets: [
      { limit: 52057, rate: 10.5 },
      { limit: 148734, rate: 12.5 },
      { limit: null, rate: 14.5 }
    ],
    referenceUrl: "https://www.saskatchewan.ca/residents/taxes-and-licensing/personal-income-tax",
    referenceName: "Saskatchewan Personal Tax Rates"
  }
];

export function calculateProgressiveTax(
  grossIncome: number,
  brackets: TaxBracket[]
): { totalTax: number; effectiveRate: number; breakdown: { range: string; rate: number; taxableInBracket: number; taxInBracket: number }[] } {
  let remaining = grossIncome;
  let totalTax = 0;
  const breakdown: { range: string; rate: number; taxableInBracket: number; taxInBracket: number }[] = [];
  let previousLimit = 0;

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    const rate = bracket.rate / 100;
    
    let limit = bracket.limit;
    let taxableInBracket = 0;

    if (limit === null) {
      taxableInBracket = Math.max(0, remaining);
    } else {
      const bracketSpan = limit - previousLimit;
      taxableInBracket = Math.min(Math.max(0, remaining), bracketSpan);
    }

    const taxInBracket = taxableInBracket * rate;
    totalTax += taxInBracket;

    if (taxableInBracket > 0 || i === 0) {
      breakdown.push({
        range: limit === null ? `${previousLimit.toLocaleString()}+` : `${previousLimit.toLocaleString()} - ${limit.toLocaleString()}`,
        rate: bracket.rate,
        taxableInBracket,
        taxInBracket
      });
    }

    if (limit === null) {
      break;
    }
    
    remaining -= taxableInBracket;
    previousLimit = limit;
  }

  const effectiveRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0;
  return { totalTax, effectiveRate, breakdown };
}

export default function App() {
  // --- Persistent State ---
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("workdash_demo_mode");
    return saved ? JSON.parse(saved) : true;
  });

  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem("workdash_shifts");
    const hasOldData = saved && (saved.includes('"BK"') || saved.includes('"DNA"'));
    if (hasOldData) {
      localStorage.removeItem("workdash_shifts");
      return INITIAL_SHIFTS;
    }
    return saved ? JSON.parse(saved) : INITIAL_SHIFTS;
  });

  const [jobs, setJobs] = useState<JobConfig[]>(() => {
    const saved = localStorage.getItem("workdash_jobs");
    const hasOldData = saved && (saved.includes('"BK"') || saved.includes('"DNA"'));
    if (hasOldData) {
      localStorage.removeItem("workdash_jobs");
      return INITIAL_JOBS;
    }
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  const [connection, setConnection] = useState<ConnectionConfig>(() => {
    const saved = localStorage.getItem("workdash_conn");
    const isDemo = localStorage.getItem("workdash_demo_mode") !== "false";
    if (isDemo) {
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.webAppUrl === DEFAULT_URL) {
          parsed.webAppUrl = "";
        }
        return parsed;
      }
      return { webAppUrl: "" };
    } else {
      return saved ? JSON.parse(saved) : { webAppUrl: DEFAULT_URL };
    }
  });

  // Check if current connection URL is the master developer URL and blocked in demo mode
  const isSheetUrlBlocked = () => {
    const url = connection.webAppUrl.trim();
    if (!url) return true;
    if (isDemoMode) {
      return url === DEFAULT_URL || url.toLowerCase().includes("akfycbzfwvo4lzzczrlysibjjv7fwwujspj7vm8qh0z-wxh5iiyjiet6tygqkqc19gyla5a");
    }
    return false;
  };

  // Toggle workspace mode with secure passkey lock for private spreadsheet protection
  const toggleWorkspaceMode = () => {
    if (isDemoMode) {
      setPinInput("");
      setShowPinModal(true);
    } else {
      setIsDemoMode(true);
      setConnection({ webAppUrl: "" });
      triggerToast("Switched to Public Demo Mode. Google Sheet unlinked safely. ✓", "success");
    }
  };

  // PIN Verification Modal State
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");

  const handlePinSubmit = (e: FormEvent) => {
    e.preventDefault();
    const pin = pinInput.trim();
    if (pin === "Apple@12345" || pin === "shanuka") {
      setIsDemoMode(false);
      setConnection({ webAppUrl: DEFAULT_URL });
      setShowPinModal(false);
      setPinInput("");
      triggerToast("Welcome back Shanuka! Private Google Sheet sync unlocked. ✓", "success");
    } else {
      triggerToast("Incorrect Security PIN. Access denied.", "error");
    }
  };

  // --- Local UI State ---
  const [activeTab, setActiveTab] = useState<"home" | "dashboard" | "shifts" | "sync" | "settings" | "hr">("home");
  const [hoveredMenu, setHoveredMenu] = useState<"payroll" | "attendance" | "recruitment" | "sync" | "settings" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobFilter, setSelectedJobFilter] = useState("ALL");
  const [dateFilterRange, setDateFilterRange] = useState({ start: "", end: "" });
  
  // Pay Period Selections
  const [payPeriodType, setPayPeriodType] = useState<"all" | "weekly" | "bi-weekly" | "monthly" | "yearly">("all");
  const [selectedPeriodValue, setSelectedPeriodValue] = useState<string>("ALL");
  
  // Modals & Editors
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<ImportLog | null>(null);
  
  // Job Config Editing
  const [newJobName, setNewJobName] = useState("");
  const [newJobRate, setNewJobRate] = useState(15.00);
  const [newJobColor, setNewJobColor] = useState("#10b981");

  // Form State (Manual Shift Creator)
  const [formDate, setFormDate] = useState("");
  const [formJob, setFormJob] = useState("job1");
  const [formStart, setFormStart] = useState("09:00");
  const [formEnd, setFormEnd] = useState("17:00");
  const [formHours, setFormHours] = useState("");
  const [formNotes, setFormNotes] = useState("");
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewType, setViewType] = useState<"list" | "calendar">("list");
  const [currentCalendarDate, setCurrentCalendarDate] = useState(() => {
    // default to June 2026, where the initial user shifts are
    return new Date(2026, 5); 
  });

  // Operation Indicators
  const [isTesting, setIsTesting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [clearAllConfirm, setClearAllConfirm] = useState(false);

  // --- Premium Intelligent Features & AI Co-Pilot State ---
  const [taxRate, setTaxRate] = useState<number>(15);
  const [savingsGoalName, setSavingsGoalName] = useState<string>("Premium Gadget / Tech Invest");
  const [savingsGoalAmount, setSavingsGoalAmount] = useState<number>(1500);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(() => {
    return localStorage.getItem("workdash_selected_country") || "USA";
  });
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>(() => {
    return localStorage.getItem("workdash_selected_province") || "BC";
  });
  const [useProgressiveTax, setUseProgressiveTax] = useState<boolean>(() => {
    const saved = localStorage.getItem("workdash_use_progressive");
    return saved ? JSON.parse(saved) : true;
  });
  const [isTaxBreakdownOpen, setIsTaxBreakdownOpen] = useState<boolean>(false);

  // User Profile & Authentication states
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem("workdash_user_email") || "";
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [authTab, setAuthTab] = useState<"signin" | "signup" | "recover">("signin");
  const [authPassword, setAuthPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [recoverySentMessage, setRecoverySentMessage] = useState<string | null>(null);
  const [isAdminStatsOpen, setIsAdminStatsOpen] = useState<boolean>(false);
  const [adminStats, setAdminStats] = useState<{ totalUsers: number; users: any[] }>({ totalUsers: 0, users: [] });

  // Discovery Hotspots states
  const [isDiscoveryMode, setIsDiscoveryMode] = useState<boolean>(() => {
    return localStorage.getItem("workdash_discovery_mode") !== "false";
  });
  const [dismissedHotspots, setDismissedHotspots] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("workdash_dismissed_hotspots") || "[]");
    } catch {
      return [];
    }
  });

  const handleDismissHotspot = (id: string) => {
    const updated = [...dismissedHotspots, id];
    setDismissedHotspots(updated);
    localStorage.setItem("workdash_dismissed_hotspots", JSON.stringify(updated));
    triggerToast(`Hotspot dismissed! Re-enable anytime from the Top Bar. 💡`, "info");
  };

  const toggleDiscoveryMode = () => {
    const nextVal = !isDiscoveryMode;
    setIsDiscoveryMode(nextVal);
    localStorage.setItem("workdash_discovery_mode", String(nextVal));
    if (nextVal) {
      triggerToast("Discovery Mode activated! Look for pulsing green hotspots. 🟢", "success");
    } else {
      triggerToast("Discovery Mode deactivated.", "info");
    }
  };

  const handleResetHotspots = () => {
    setDismissedHotspots([]);
    localStorage.setItem("workdash_dismissed_hotspots", "[]");
    setIsDiscoveryMode(true);
    localStorage.setItem("workdash_discovery_mode", "true");
    triggerToast("All discovery hotspots have been reset! 🟢", "success");
  };

  // Guided Tour Onboarding & Welcome states
  const [isWelcomeScreenOpen, setIsWelcomeScreenOpen] = useState<boolean>(() => {
    return !localStorage.getItem("workdash_user_email") && localStorage.getItem("workdash_welcome_dismissed") !== "true";
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    const welcomeActive = !localStorage.getItem("workdash_user_email") && localStorage.getItem("workdash_welcome_dismissed") !== "true";
    return !welcomeActive && localStorage.getItem("workdash_onboarded") !== "true";
  });
  const [onboardingStep, setOnboardingStep] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Measure target elements for the onboarding tour
  useEffect(() => {
    if (!isOnboardingOpen) {
      setTargetRect(null);
      return;
    }

    const updateTargetRect = () => {
      let targetId = "";
      if (onboardingStep === 1) targetId = "tour-dashboard-analytics";
      if (onboardingStep === 2) targetId = "tour-tax-card";
      if (onboardingStep === 3) targetId = "tour-calendar";

      if (targetId) {
        const el = document.getElementById(targetId);
        if (el) {
          const rect = el.getBoundingClientRect();
          setTargetRect(rect);
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          setTargetRect(null);
        }
      } else {
        setTargetRect(null);
      }
    };

    // Auto navigate tabs/views
    if (onboardingStep === 1 || onboardingStep === 2) {
      setActiveTab("dashboard");
    } else if (onboardingStep === 3) {
      setActiveTab("shifts");
      setViewType("calendar");
    }

    const timer = setTimeout(updateTargetRect, 300);

    window.addEventListener("resize", updateTargetRect);
    // Use capture to trace scroll in any nested view
    window.addEventListener("scroll", updateTargetRect, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect, true);
    };
  }, [onboardingStep, isOnboardingOpen, activeTab, viewType]);

  const [isAiCoPilotOpen, setIsAiCoPilotOpen] = useState<boolean>(false);
  const [aiInput, setAiInput] = useState<string>("");
  const [aiMessages, setAiMessages] = useState<Array<{ sender: "user" | "ai"; text: string; timestamp: Date }>>([
    {
      sender: "ai",
      text: "🤖 **Welcome to the WorkDash Intelligent AI Co-Pilot!**\n\nI am configured specifically to help you navigate, test, and master this software workspace. Ask me to open a view, log a shift, or configure features!\n\n**Quick Guided Actions:**\n1. Type **'take a tour'** or click below to launch the Dashboard Tour.\n2. Type **'calendar'** to view the interactive monthly calendar.\n3. Type **'add shift'** to trigger the manual shift entry modal.\n4. Type **'sheets'** to configure automatic Google Sheets integration.\n5. Type **'reset demo'** to restore all mock rosters instantly.",
      timestamp: new Date()
    }
  ]);

  const handleAiCommand = (text: string) => {
    if (!text.trim()) return;
    const cleaned = text.toLowerCase().trim();
    let reply = "";
    let actionRun = false;

    // Add user message immediately
    setAiMessages(prev => [...prev, { sender: 'user', text, timestamp: new Date() }]);

    // Match keywords
    if (cleaned.includes("tour") || cleaned.includes("dashboard") || cleaned.includes("analytics") || cleaned.includes("metrics")) {
      setActiveTab("dashboard");
      reply = "📊 **Navigating to Dashboard Analytics!**\n\nI have switched your view to the main WorkDash Command Center. Here you can see:\n\n1. **High-Level Statistics**: Total earnings, work hours, average pay rate, and remaining days in the pay period.\n2. **Dynamic Visual Charts**: Interactive earnings distribution by job profile, and trend lines of your historical rosters.\n3. **Quick Insights**: Projections showing how shifts translate to estimated net pay after standard tax withholdings.";
      actionRun = true;
    } else if (cleaned.includes("add") || cleaned.includes("new shift") || cleaned.includes("create shift") || cleaned.includes("manual") || cleaned.includes("log shift")) {
      setActiveTab("shifts");
      setIsAddModalOpen(true);
      reply = "➕ **Opening the Manual Shift Creator for you!**\n\nI've navigated to the **Work Shifts Log** tab and triggered the manual shift editor. You can now:\n- Select the date of your shift.\n- Choose a pre-defined Job profile (or add new ones in Settings).\n- Specify your Start and End times. The system will automatically parse overnight boundaries and calculate total hours & estimated earnings in real-time!";
      actionRun = true;
    } else if (cleaned.includes("calendar") || cleaned.includes("view shift") || cleaned.includes("roster") || cleaned.includes("grid")) {
      setActiveTab("shifts");
      setViewType("calendar");
      reply = "📅 **Opening your Work Shifts Log Calendar!**\n\nI have navigated to the roster list and interactive calendar. \n\n- **Roster Calendar Grid**: In this view, you can see all your scheduled shifts mapped visually onto the days of the week, with custom color-coded indicators representing different job roles.\n- **Manual Entry**: Click the **'Add Shift Manually'** button in the top-right corner to log any ad-hoc shifts instantly!";
      actionRun = true;
    } else if (cleaned.includes("sync") || cleaned.includes("google sheet") || cleaned.includes("link") || cleaned.includes("apps script") || cleaned.includes("sheet")) {
      setActiveTab("sync");
      setTimeout(() => {
        document.getElementById("apps-script-instructions")?.scrollIntoView({ behavior: "smooth" });
      }, 500);
      reply = "🔄 **Opening the Cloud Synchronization Dashboard!**\n\nTo safeguard private payroll data, the default master spreadsheet is safely unlinked in demo mode. \n\n**To connect your own Google Sheet:**\n1. Scroll down to the **Google Apps Script Integration Guide**.\n2. Copy the provided spreadsheet structure & code snippet.\n3. Deploy as a Web App, and paste your `.exec` URL in the connection box above. You will unlock direct 2-way roster parsing!";
      actionRun = true;
    } else if (cleaned.includes("settings") || cleaned.includes("rates") || cleaned.includes("jobs") || cleaned.includes("hourly") || cleaned.includes("pay cycle")) {
      setActiveTab("settings");
      reply = "⚙️ **Opening Settings & Hourly Rates configuration!**\n\nHere you can fully customize the calculations for your earnings:\n- **Define custom Job Profiles**: Add as many jobs as you work (e.g. consulting, retail, medical rosters).\n- **Set custom hourly pay rates**: Define precise base rates. All metrics are recalculated dynamically!\n- **Select Pay Cycles**: Align the system with your real-world pay period (Weekly, Bi-weekly, Monthly, etc.) to get precise pay forecasts.";
      actionRun = true;
    } else if (cleaned.includes("clear") || cleaned.includes("reset") || cleaned.includes("dummy") || cleaned.includes("demo state") || cleaned.includes("restore")) {
      localStorage.removeItem("workdash_shifts");
      localStorage.removeItem("workdash_jobs");
      setShifts(INITIAL_SHIFTS);
      setJobs(INITIAL_JOBS);
      setActiveTab("dashboard");
      reply = "🧹 **Resetting workspace to clean Demo State!**\n\nI have successfully cleared all custom states from your local browser storage and loaded the clean fictional test data:\n- **job1** (base rate of $18.50/hr)\n- **Job 2** (base rate of $24.00/hr)\n- Beautiful dummy shifts showcasing immediate statistics on the interactive charts.";
      actionRun = true;
    } else if (cleaned.includes("pin") || cleaned.includes("unlock") || cleaned.includes("private") || cleaned.includes("original") || cleaned.includes("security") || cleaned.includes("apple")) {
      if (isDemoMode) {
        setPinInput("");
        setShowPinModal(true);
        reply = "🔒 **Triggering Private Workspace Security Gate!**\n\nTo switch to Shanuka's private Google Sheet integration, enter your secure developer password (`Apple@12345`) in the popup dialog. This will safely link the live cloud spreadsheet.";
      } else {
        reply = "🔒 **You are already in Shanuka's Private Workspace!**\n\nYou have secure, authorized access. Direct cloud synchronization to Shanuka's master Google Sheet is fully operational.";
      }
      actionRun = true;
    } else if (cleaned.includes("hello") || cleaned.includes("hi") || cleaned.includes("hey") || cleaned.includes("help") || cleaned.includes("assistant") || cleaned.includes("who")) {
      reply = "🤖 **Hello! I'm your WorkDash AI Co-Pilot & Interactive Guide!**\n\nI can help you operate and master this workspace instantly. Try typing commands or clicking the quick-actions below:\n\n- **'show calendar'** to open the interactive monthly roster grid\n- **'add shift'** to trigger the manual shift logging window\n- **'sync sheets'** to configure Google Spreadsheet automation\n- **'view rates'** to customize hourly pay rules\n- **'reset demo'** to load a clean set of mock data";
    } else {
      reply = `🤖 **WorkDash Co-Pilot here!** I parsed your query: *"_` + text + `_"*.\n\nI am configured to help you navigate and master this application. Try typing one of these actions to see me execute them on your screen:\n- **"Show dashboard analytics"**\n- **"Log a new shift"**\n- **"Sync with Google Sheets"**\n- **"Configure hourly job rates"**\n- **"Reset to default mock data"**`;
    }

    // Set AI response with a short delay for simulated intelligence
    setTimeout(() => {
      setAiMessages(prev => [...prev, { sender: 'ai', text: reply, timestamp: new Date() }]);
      if (actionRun) {
        triggerToast("🤖 AI executed command: " + text, "info");
      }
    }, 600);
    setAiInput("");
  };

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem("workdash_shifts", JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem("workdash_jobs", JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem("workdash_demo_mode", JSON.stringify(isDemoMode));
  }, [isDemoMode]);

  useEffect(() => {
    localStorage.setItem("workdash_selected_country", selectedCountryCode);
  }, [selectedCountryCode]);

  useEffect(() => {
    localStorage.setItem("workdash_selected_province", selectedProvinceCode);
  }, [selectedProvinceCode]);

  useEffect(() => {
    localStorage.setItem("workdash_use_progressive", JSON.stringify(useProgressiveTax));
  }, [useProgressiveTax]);

  // Synchronize profile data to server-side database when logged in (debounced)
  useEffect(() => {
    if (!userEmail) return;
    const delayDebounce = setTimeout(async () => {
      try {
        await fetch("/api/profile/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            profileData: {
              shifts,
              jobs,
              taxRate,
              selectedCountryCode,
              selectedProvinceCode,
              savingsGoalName,
              savingsGoalAmount,
              payPeriodType,
              useProgressiveTax
            }
          })
        });
      } catch (err) {
        console.error("Failed to auto-sync profile to server", err);
      }
    }, 1500);

    return () => clearTimeout(delayDebounce);
  }, [userEmail, shifts, jobs, taxRate, selectedCountryCode, selectedProvinceCode, savingsGoalName, savingsGoalAmount, payPeriodType, useProgressiveTax]);

  useEffect(() => {
    if (isDemoMode && connection.webAppUrl === DEFAULT_URL) {
      localStorage.setItem("workdash_conn", JSON.stringify({ ...connection, webAppUrl: "" }));
    } else {
      localStorage.setItem("workdash_conn", JSON.stringify(connection));
    }
  }, [connection, isDemoMode]);

  // Toast auto-clear
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Profile Account & Admin statistics functions
  const handleAuthAction = async (emailToLogin: string, psw: string, actionType: "signin" | "signup" | "recover") => {
    if (!emailToLogin || !emailToLogin.includes("@")) {
      triggerToast("Please enter a valid email address.", "error");
      return;
    }

    const cleanEmail = emailToLogin.toLowerCase().trim();

    if (actionType === "recover") {
      try {
        const res = await fetch("/api/auth/recover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail })
        });
        const data = await res.json();
        if (data.success) {
          setRecoverySentMessage(data.message);
          triggerToast("Password recovery link sent successfully!", "success");
        } else {
          triggerToast(data.error || "Failed to initiate recovery", "error");
        }
      } catch (err: any) {
        triggerToast(`Error: ${err.message || "Failed to reach server"}`, "error");
      }
      return;
    }

    if (!psw || psw.length < 4) {
      triggerToast("Password must be at least 4 characters long.", "error");
      return;
    }

    try {
      const endpoint = actionType === "signup" ? "/api/auth/signup" : "/api/auth/signin";
      const payload: any = {
        email: cleanEmail,
        password: psw
      };

      if (actionType === "signup") {
        payload.profileData = {
          shifts,
          jobs,
          taxRate,
          selectedCountryCode,
          selectedProvinceCode,
          savingsGoalName,
          savingsGoalAmount,
          payPeriodType,
          useProgressiveTax
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        setUserEmail(cleanEmail);
        if (rememberMe) {
          localStorage.setItem("workdash_user_email", cleanEmail);
        } else {
          localStorage.removeItem("workdash_user_email");
        }

        if (actionType === "signin" && data.user.profileData) {
          const pd = data.user.profileData;
          if (pd.shifts) setShifts(pd.shifts);
          if (pd.jobs) setJobs(pd.jobs);
          if (pd.taxRate !== undefined) setTaxRate(pd.taxRate);
          if (pd.selectedCountryCode) setSelectedCountryCode(pd.selectedCountryCode);
          if (pd.selectedProvinceCode) setSelectedProvinceCode(pd.selectedProvinceCode);
          if (pd.savingsGoalName) setSavingsGoalName(pd.savingsGoalName);
          if (pd.savingsGoalAmount !== undefined) setSavingsGoalAmount(pd.savingsGoalAmount);
          if (pd.payPeriodType) setPayPeriodType(pd.payPeriodType);
          if (pd.useProgressiveTax !== undefined) setUseProgressiveTax(pd.useProgressiveTax);
          triggerToast(`Logged in successfully! Welcome back ${cleanEmail} ✓`, "success");
        } else {
          triggerToast(`Signed up successfully! Profile connected and secured ✓`, "success");
        }
        
        setIsProfileModalOpen(false);
      } else {
        triggerToast(data.error || "Authentication failed", "error");
      }
    } catch (err: any) {
      triggerToast(`Network error: ${err.message || "Could not connect to server"}`, "error");
    }
  };

  const handleProfileLogin = async (emailToLogin: string, actionType: "upload" | "load") => {
    if (!emailToLogin || !emailToLogin.includes("@")) {
      triggerToast("Please enter a valid email address.", "error");
      return;
    }
    const cleanEmail = emailToLogin.toLowerCase().trim();
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          profileData: actionType === "upload" ? {
            shifts,
            jobs,
            taxRate,
            selectedCountryCode,
            selectedProvinceCode,
            savingsGoalName,
            savingsGoalAmount,
            payPeriodType,
            useProgressiveTax
          } : null
        })
      });
      const data = await res.json();
      if (data.success) {
        setUserEmail(cleanEmail);
        localStorage.setItem("workdash_user_email", cleanEmail);
        
        if (actionType === "load" && data.user.profileData) {
          const pd = data.user.profileData;
          if (pd.shifts) setShifts(pd.shifts);
          if (pd.jobs) setJobs(pd.jobs);
          if (pd.taxRate !== undefined) setTaxRate(pd.taxRate);
          if (pd.selectedCountryCode) setSelectedCountryCode(pd.selectedCountryCode);
          if (pd.selectedProvinceCode) setSelectedProvinceCode(pd.selectedProvinceCode);
          if (pd.savingsGoalName) setSavingsGoalName(pd.savingsGoalName);
          if (pd.savingsGoalAmount !== undefined) setSavingsGoalAmount(pd.savingsGoalAmount);
          if (pd.payPeriodType) setPayPeriodType(pd.payPeriodType);
          if (pd.useProgressiveTax !== undefined) setUseProgressiveTax(pd.useProgressiveTax);
          triggerToast("Cloud profile loaded successfully! ✓", "success");
        } else {
          triggerToast("Profile connected & synced successfully! ✓", "success");
        }
        setIsProfileModalOpen(false);
      } else {
        triggerToast(data.error || "Failed to register profile", "error");
      }
    } catch (err: any) {
      triggerToast(`Network error: ${err.message || "Could not connect to server"}`, "error");
    }
  };

  const handleSignOut = () => {
    setUserEmail("");
    localStorage.removeItem("workdash_user_email");
    triggerToast("Logged out of profile. Returned to local sandbox mode.", "info");
  };

  const fetchAdminStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.users) {
        setAdminStats(data);
      }
    } catch (err) {
      console.error("Failed to load admin stats", err);
    }
  };

  useEffect(() => {
    if (userEmail.toLowerCase().trim() === "shanukanishankodithuwakku@gmail.com") {
      fetchAdminStats();
    }
  }, [userEmail]);

  // Set default form values on modal open
  useEffect(() => {
    if (isAddModalOpen) {
      const today = new Date().toISOString().split("T")[0];
      setFormDate(today);
      if (jobs.length > 0) {
        setFormJob(jobs[0].name);
      }
      setFormStart("09:00");
      setFormEnd("17:00");
      setFormHours("");
      setFormNotes("");
    }
  }, [isAddModalOpen, jobs]);

  // Set form values when editing a shift
  const startEditing = (shift: Shift) => {
    setEditingShift(shift);
    setFormDate(shift.date);
    setFormJob(shift.job);
    setFormStart(shift.start);
    setFormEnd(shift.end);
    setFormHours(String(shift.hours));
    setFormNotes(shift.notes);
  };

  const handleCloseEdit = () => {
    setEditingShift(null);
    setFormDate("");
    setFormNotes("");
  };

  // --- Helper to trigger a visual toast ---
  const triggerToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  };

  // --- Core Business Logic: Sync Operations ---

  // 1. Test Apps Script Connection
  const testConnection = async () => {
    if (isSheetUrlBlocked()) {
      triggerToast("⚠️ Demo Mode: Master Google Sheet is unlinked to protect private data. Paste your own Apps Script URL above to test synchronization!", "info");
      return;
    }

    if (!connection.webAppUrl.trim()) {
      triggerToast("Please enter a valid Google Apps Script Web App URL", "error");
      return;
    }

    setIsTesting(true);
    try {
      // Direct GET without custom headers to avoid CORS preflight block
      const res = await fetch(connection.webAppUrl, {
        method: "GET",
        mode: "cors",
        redirect: "follow"
      });
      
      const data = await res.json();
      if (data && (data.status || data.headers)) {
        triggerToast("Connected to WorkDash Apps Script successfully! ✓", "success");
      } else {
        triggerToast("Connected, but Apps Script returned an unexpected response structure.", "info");
      }
    } catch (err: any) {
      console.error(err);
      triggerToast("Failed to connect. Ensure your Apps Script is deployed as a Web App with 'Anyone' access and CORS is supported.", "error");
    } finally {
      setIsTesting(false);
    }
  };

  // 2. Import (Pull) Shifts from Sheet
  const handleImportShifts = async () => {
    if (isSheetUrlBlocked()) {
      triggerToast("⚠️ Demo Mode: Master Google Sheet is unlinked to protect private data. Paste your own Apps Script URL above to test synchronization!", "info");
      return;
    }

    if (!connection.webAppUrl.trim()) {
      triggerToast("Please configure a valid Google Apps Script URL first.", "error");
      return;
    }

    setIsImporting(true);
    try {
      // Append the 'import' action parameter
      const importUrl = `${connection.webAppUrl}${connection.webAppUrl.includes("?") ? "&" : "?"}action=import`;
      
      const res = await fetch(importUrl, {
        method: "GET",
        mode: "cors",
        redirect: "follow"
      });

      const data = await res.json();
      
      if (!data || !data.headers || !data.rows) {
        throw new Error("Invalid response format. Expected headers and rows arrays.");
      }

      // Process the data through our robust parsing suite
      const parsed = parseShiftsFromSheet(data.headers, data.rows, jobs);
      
      // Update shifts, merging duplicates (by unique ID based on date, job, and start time)
      if (parsed.shifts.length > 0) {
        setShifts(prev => {
          const merged = [...prev];
          let updatedCount = 0;
          let addedCount = 0;

          parsed.shifts.forEach(newShift => {
            // Find match by exact ID OR combination of date, job name (case-insensitive), and start time
            const index = merged.findIndex(s => 
              s.id === newShift.id || 
              (s.date === newShift.date && 
               s.job.replace(/\s+/g, "").toLowerCase() === newShift.job.replace(/\s+/g, "").toLowerCase() && 
               s.start.replace(/\s+/g, "") === newShift.start.replace(/\s+/g, ""))
            );
            if (index !== -1) {
              // Merge details, maintaining the original ID if it was manually added or pre-populated
              merged[index] = { 
                ...merged[index], 
                ...newShift, 
                id: merged[index].id 
              }; 
              updatedCount++;
            } else {
              merged.push(newShift); // add
              addedCount++;
            }
          });

          // Strict global deduplication pass to ensure absolute zero replication under any state sequence
          const uniqueMap = new Map<string, Shift>();
          merged.forEach(s => {
            const key = `${s.date}_${s.job.replace(/\s+/g, "").toLowerCase()}_${s.start.replace(/[^0-9]/g, "")}`;
            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, s);
            } else {
              const existing = uniqueMap.get(key)!;
              // prefer the more complete shift data if there is an option
              if (!existing.earnings && s.earnings) {
                uniqueMap.set(key, s);
              }
            }
          });
          
          const deduplicated = Array.from(uniqueMap.values());
          triggerToast(`Imported ${addedCount} new shifts, updated ${updatedCount} shifts successfully!`, "success");
          return deduplicated;
        });

        const newLog: ImportLog = {
          timestamp: new Date().toLocaleTimeString(),
          success: true,
          totalRows: data.rows.length,
          importedCount: parsed.successCount,
          skippedCount: parsed.skippedDetails.length,
          skippedDetails: parsed.skippedDetails
        };
        setLogs(newLog);
        setShowLogs(true);
        
        // Update connection timestamp
        setConnection(prev => ({ ...prev, lastImported: new Date().toLocaleString() }));
      } else {
        const newLog: ImportLog = {
          timestamp: new Date().toLocaleTimeString(),
          success: true,
          totalRows: data.rows.length,
          importedCount: 0,
          skippedCount: parsed.skippedDetails.length,
          skippedDetails: parsed.skippedDetails
        };
        setLogs(newLog);
        setShowLogs(true);
        triggerToast("Zero shifts imported. All rows in the spreadsheet were filtered or skipped.", "info");
      }

    } catch (err: any) {
      console.error(err);
      triggerToast(`Import failed: ${err.message || "Network Error"}. Ensure Apps Script is running properly.`, "error");
      
      const errorLog: ImportLog = {
        timestamp: new Date().toLocaleTimeString(),
        success: false,
        totalRows: 0,
        importedCount: 0,
        skippedCount: 1,
        skippedDetails: [`Connection/Parsing error: ${err.message || "Failed to fetch. This may be due to CORS on unauthorized URLs. Try checking the Web App deployment setup in Extensions > Apps Script."}`]
      };
      setLogs(errorLog);
      setShowLogs(true);
    } finally {
      setIsImporting(false);
    }
  };

  // 3. Export (Push) Shifts to Sheet
  const handleExportShifts = async () => {
    if (isSheetUrlBlocked()) {
      triggerToast("⚠️ Demo Mode: Master Google Sheet is unlinked to protect private data. Paste your own Apps Script URL above to test synchronization!", "info");
      return;
    }

    if (!connection.webAppUrl.trim()) {
      triggerToast("Please configure a valid Google Apps Script URL first.", "error");
      return;
    }

    if (shifts.length === 0) {
      triggerToast("No shifts found to export.", "info");
      return;
    }

    setIsExporting(true);
    try {
      // Build spreadsheet layout
      const headers = ["Date", "Job", "Start", "End", "Hours", "Notes"];
      // Sort shifts by date ascending so the spreadsheet stays organized
      const sortedShifts = [...shifts].sort((a, b) => a.date.localeCompare(b.date));
      const rows = sortedShifts.map(s => [s.date, s.job, s.start, s.end, s.hours, s.notes]);

      const payload = { headers, rows };

      // Crucial: Send POST without Setting Content-Type header to bypass CORS preflight blocking!
      // Apps Script reads the raw body anyway via e.postData.contents
      const res = await fetch(connection.webAppUrl, {
        method: "POST",
        mode: "cors",
        redirect: "follow",
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (data && data.success) {
        triggerToast(`Exported ${data.rowsWritten} shifts to Google Sheets successfully! ✓`, "success");
        setConnection(prev => ({ ...prev, lastExported: new Date().toLocaleString() }));
      } else {
        throw new Error(data.error || "Spreadsheet write failed");
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(`Export failed: ${err.message || "Ensure Apps Script has permission to write."}`, "error");
    } finally {
      setIsExporting(false);
    }
  };

  // --- Manual Shifts Operations ---

  // Add a brand new shift
  const handleAddShift = (e: FormEvent) => {
    e.preventDefault();
    if (!formDate || !formJob || !formStart || !formEnd) {
      triggerToast("Please fill in all core shift fields.", "error");
      return;
    }

    const calculatedHours = formHours ? parseFloat(formHours) : calculateShiftHours(formStart, formEnd);
    if (isNaN(calculatedHours) || calculatedHours <= 0) {
      triggerToast("Please enter a valid shift duration.", "error");
      return;
    }

    const jobConfig = jobs.find(jc => jc.name.toLowerCase() === formJob.toLowerCase());
    const rate = jobConfig ? jobConfig.hourlyRate : 15.00;
    const earnings = parseFloat((calculatedHours * rate).toFixed(2));

    const newShift: Shift = {
      id: `manual_${Date.now()}_${formJob}`,
      date: formDate,
      job: formJob,
      start: formStart,
      end: formEnd,
      hours: calculatedHours,
      notes: formNotes,
      hourlyRate: rate,
      earnings: earnings
    };

    setShifts(prev => [newShift, ...prev]);
    setIsAddModalOpen(false);
    triggerToast("Shift added successfully!", "success");
  };

  // Update an existing shift
  const handleUpdateShift = (e: FormEvent) => {
    e.preventDefault();
    if (!editingShift) return;

    if (!formDate || !formJob || !formStart || !formEnd) {
      triggerToast("Please fill in all core shift fields.", "error");
      return;
    }

    const calculatedHours = formHours ? parseFloat(formHours) : calculateShiftHours(formStart, formEnd);
    if (isNaN(calculatedHours) || calculatedHours <= 0) {
      triggerToast("Please enter a valid shift duration.", "error");
      return;
    }

    const jobConfig = jobs.find(jc => jc.name.toLowerCase() === formJob.toLowerCase());
    const rate = jobConfig ? jobConfig.hourlyRate : 15.00;
    const earnings = parseFloat((calculatedHours * rate).toFixed(2));

    setShifts(prev => prev.map(s => {
      if (s.id === editingShift.id) {
        return {
          ...s,
          date: formDate,
          job: formJob,
          start: formStart,
          end: formEnd,
          hours: calculatedHours,
          notes: formNotes,
          hourlyRate: rate,
          earnings: earnings
        };
      }
      return s;
    }));

    handleCloseEdit();
    triggerToast("Shift updated successfully!", "success");
  };

  // Delete a shift
  const handleDeleteShift = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteShift = () => {
    if (deleteConfirmId) {
      setShifts(prev => prev.filter(s => s.id !== deleteConfirmId));
      setDeleteConfirmId(null);
      triggerToast("Shift deleted.", "info");
    }
  };

  // Clear all shifts locally
  const handleClearAllShifts = () => {
    setClearAllConfirm(true);
  };

  const confirmClearAllShifts = () => {
    setShifts([]);
    setClearAllConfirm(false);
    triggerToast("Local shifts cleared.", "info");
  };

  // --- Job Configurations Operations ---
  const handleAddJob = (e: FormEvent) => {
    e.preventDefault();
    const cleanName = newJobName.trim().toUpperCase();
    if (!cleanName) return;

    if (jobs.some(j => j.name.toUpperCase() === cleanName)) {
      triggerToast("A job with this name already exists.", "error");
      return;
    }

    const newJob: JobConfig = {
      name: cleanName,
      hourlyRate: newJobRate,
      color: newJobColor
    };

    setJobs(prev => [...prev, newJob]);
    setNewJobName("");
    setNewJobRate(15.00);
    triggerToast(`Added Job Config: ${cleanName}`, "success");
  };

  const handleDeleteJob = (name: string) => {
    if (jobs.length <= 1) {
      triggerToast("You must keep at least one active Job configuration.", "error");
      return;
    }
    setJobs(prev => prev.filter(j => j.name !== name));
    triggerToast(`Deleted configuration for ${name}`, "info");
  };

  const handleUpdateJobRate = (name: string, newRate: number) => {
    if (isNaN(newRate) || newRate < 0) return;
    
    setJobs(prev => prev.map(j => {
      if (j.name === name) return { ...j, hourlyRate: newRate };
      return j;
    }));

    // Re-calculate earnings for all matching shifts using this updated rate
    setShifts(prev => prev.map(s => {
      if (s.job.toUpperCase() === name.toUpperCase()) {
        const calculatedEarnings = parseFloat((s.hours * newRate).toFixed(2));
        return { ...s, hourlyRate: newRate, earnings: calculatedEarnings };
      }
      return s;
    }));

    triggerToast(`Updated hourly rate for ${name} to $${newRate.toFixed(2)}`, "success");
  };

  // --- Filtering & Searching logic ---
  const filteredShifts = useMemo(() => {
    // Sort shifts newest first by date
    let list = [...shifts].sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      // if same date, sort by start time descending
      return b.start.localeCompare(a.start);
    });

    // 1. Job Filter
    if (selectedJobFilter !== "ALL") {
      list = list.filter(s => s.job.toUpperCase() === selectedJobFilter.toUpperCase());
    }

    // 2. Note Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => 
        s.notes.toLowerCase().includes(q) || 
        s.job.toLowerCase().includes(q) || 
        s.date.includes(q)
      );
    }

    // 3. Date Range Filter
    if (dateFilterRange.start) {
      list = list.filter(s => s.date >= dateFilterRange.start);
    }
    if (dateFilterRange.end) {
      list = list.filter(s => s.date <= dateFilterRange.end);
    }

    return list;
  }, [shifts, selectedJobFilter, searchQuery, dateFilterRange]);

  // --- Month Navigation & Calendar Grid Helpers ---
  const handlePrevMonth = () => {
    setCurrentCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const calendarDays = useMemo(() => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    
    const days: Array<{ dateString: string; dayNumber: number; isCurrentMonth: boolean }> = [];
    
    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDayNum = prevMonthTotalDays - i;
      const prevMonthObj = new Date(year, month - 1, prevDayNum);
      const mStr = String(prevMonthObj.getMonth() + 1).padStart(2, "0");
      const dStr = String(prevMonthObj.getDate()).padStart(2, "0");
      days.push({
        dateString: `${prevMonthObj.getFullYear()}-${mStr}-${dStr}`,
        dayNumber: prevDayNum,
        isCurrentMonth: false
      });
    }
    
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const mStr = String(month + 1).padStart(2, "0");
      const dStr = String(i).padStart(2, "0");
      days.push({
        dateString: `${year}-${mStr}-${dStr}`,
        dayNumber: i,
        isCurrentMonth: true
      });
    }
    
    // Next month filler days to complete standard 6-week grid
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthObj = new Date(year, month + 1, i);
      const mStr = String(nextMonthObj.getMonth() + 1).padStart(2, "0");
      const dStr = String(nextMonthObj.getDate()).padStart(2, "0");
      days.push({
        dateString: `${nextMonthObj.getFullYear()}-${mStr}-${dStr}`,
        dayNumber: i,
        isCurrentMonth: false
      });
    }
    
    return days;
  }, [currentCalendarDate]);

  const shiftsByDate = useMemo(() => {
    const map: Record<string, Shift[]> = {};
    shifts.forEach(s => {
      if (!map[s.date]) {
        map[s.date] = [];
      }
      map[s.date].push(s);
    });
    return map;
  }, [shifts]);

  const handleCalendarDayClick = (dateStr: string) => {
    setFormDate(dateStr);
    if (jobs.length > 0) {
      setFormJob(jobs[0].name);
    }
    setFormStart("09:00");
    setFormEnd("17:00");
    setFormHours("");
    setFormNotes("");
    setIsAddModalOpen(true);
  };

  // --- Periodic Pay Dashboard Period Generator & Filter ---
  const periodOptions = useMemo(() => {
    if (payPeriodType === "all") {
      return [];
    }

    const optionsMap: Record<string, { value: string; label: string; start: string; end: string }> = {};

    shifts.forEach(s => {
      const dateParts = s.date.split("-");
      if (dateParts.length !== 3) return;
      const yr = parseInt(dateParts[0], 10);
      const mo = parseInt(dateParts[1], 10) - 1;
      const dy = parseInt(dateParts[2], 10);
      const shiftDate = new Date(yr, mo, dy);

      if (payPeriodType === "weekly") {
        // Start of week (Sunday)
        const sunday = new Date(shiftDate);
        sunday.setDate(shiftDate.getDate() - shiftDate.getDay());
        const sunStr = sunday.toISOString().split("T")[0];
        
        const saturday = new Date(sunday);
        saturday.setDate(sunday.getDate() + 6);
        const satStr = saturday.toISOString().split("T")[0];

        if (!optionsMap[sunStr]) {
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const startLabel = `${months[sunday.getMonth()]} ${sunday.getDate()}, ${sunday.getFullYear()}`;
          const endLabel = `${months[saturday.getMonth()]} ${saturday.getDate()}, ${saturday.getFullYear()}`;
          const label = `Week of ${startLabel} to ${endLabel}`;
          optionsMap[sunStr] = { value: sunStr, label, start: sunStr, end: satStr };
        }
      } else if (payPeriodType === "bi-weekly") {
        // Fortnights anchored on Sunday Jan 4, 2026
        const anchor = new Date(2026, 0, 4); // Sunday, Jan 4, 2026
        const diffTime = shiftDate.getTime() - anchor.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const fortnightIndex = Math.floor(diffDays / 14);
        
        const fortStart = new Date(anchor);
        fortStart.setDate(anchor.getDate() + fortnightIndex * 14);
        const fortStartStr = fortStart.toISOString().split("T")[0];

        const fortEnd = new Date(fortStart);
        fortEnd.setDate(fortStart.getDate() + 13);
        const fortEndStr = fortEnd.toISOString().split("T")[0];

        if (!optionsMap[fortStartStr]) {
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const startLabel = `${months[fortStart.getMonth()]} ${fortStart.getDate()}`;
          const endLabel = `${months[fortEnd.getMonth()]} ${fortEnd.getDate()}, ${fortEnd.getFullYear()}`;
          const label = `Bi-week: ${startLabel} – ${endLabel}`;
          optionsMap[fortStartStr] = { value: fortStartStr, label, start: fortStartStr, end: fortEndStr };
        }
      } else if (payPeriodType === "monthly") {
        const monthKey = s.date.substring(0, 7); // "YYYY-MM"
        if (!optionsMap[monthKey]) {
          const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          const label = `${months[mo]} ${yr}`;
          
          const firstDay = `${monthKey}-01`;
          const lastDayObj = new Date(yr, mo + 1, 0);
          const lastDay = `${monthKey}-${String(lastDayObj.getDate()).padStart(2, "0")}`;
          
          optionsMap[monthKey] = { value: monthKey, label, start: firstDay, end: lastDay };
        }
      } else if (payPeriodType === "yearly") {
        const yearKey = s.date.substring(0, 4); // "YYYY"
        if (!optionsMap[yearKey]) {
          const label = `Year ${yearKey}`;
          optionsMap[yearKey] = { value: yearKey, label, start: `${yearKey}-01-01`, end: `${yearKey}-12-31` };
        }
      }
    });

    // Sort descending chronologically
    return Object.values(optionsMap).sort((a, b) => b.value.localeCompare(a.value));
  }, [shifts, payPeriodType]);

  // Sync selected period value
  useEffect(() => {
    if (payPeriodType !== "all" && periodOptions.length > 0) {
      const hasValue = periodOptions.some(opt => opt.value === selectedPeriodValue);
      if (!hasValue) {
        setSelectedPeriodValue(periodOptions[0].value);
      }
    } else {
      setSelectedPeriodValue("ALL");
    }
  }, [payPeriodType, periodOptions]);

  // Filter shifts specifically for the dashboard stats/charts
  const dashboardShifts = useMemo(() => {
    if (payPeriodType === "all" || selectedPeriodValue === "ALL") {
      return shifts;
    }
    const selectedOpt = periodOptions.find(o => o.value === selectedPeriodValue);
    if (!selectedOpt) return shifts;
    return shifts.filter(s => s.date >= selectedOpt.start && s.date <= selectedOpt.end);
  }, [shifts, payPeriodType, selectedPeriodValue, periodOptions]);

  // Dashboard Stats
  const dashboardStats = useMemo(() => {
    let totalHours = 0;
    let totalEarnings = 0;
    
    dashboardShifts.forEach(s => {
      totalHours += s.hours;
      totalEarnings += s.earnings || 0;
    });

    const averageRate = totalHours > 0 ? (totalEarnings / totalHours) : 0;
    const shiftCount = dashboardShifts.length;
    const averageDuration = shiftCount > 0 ? (totalHours / shiftCount) : 0;

    return {
      totalHours: parseFloat(totalHours.toFixed(2)),
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      averageRate: parseFloat(averageRate.toFixed(2)),
      shiftCount,
      averageDuration: parseFloat(averageDuration.toFixed(2))
    };
  }, [dashboardShifts]);

  // Find active country tax config
  const activeCountry = useMemo(() => {
    return COUNTRY_TAX_DATA.find(c => c.code === selectedCountryCode) || COUNTRY_TAX_DATA[0];
  }, [selectedCountryCode]);

  // Pay period scaling factor for progressive tax
  const payPeriodFactor = useMemo(() => {
    switch (payPeriodType) {
      case "weekly": return 52;
      case "bi-weekly": return 26;
      case "monthly": return 12;
      case "yearly": return 1;
      case "all": default: return 52;
    }
  }, [payPeriodType]);

  // Compute live tax calculations based on progressive/flat rules and country selection
  const taxCalculation = useMemo(() => {
    const gross = dashboardStats.totalEarnings;
    const isProgressive = useProgressiveTax && activeCountry.isProgressive;

    if (!isProgressive) {
      // Flat Rate calculations
      const rate = (!activeCountry.isProgressive) ? activeCountry.flatRate : taxRate;
      const totalTax = gross * (rate / 100);
      return {
        totalTax: parseFloat(totalTax.toFixed(2)),
        effectiveRate: rate,
        breakdown: [
          {
            range: "Flat Rate Limit",
            rate: rate,
            taxableInBracket: gross,
            taxInBracket: totalTax
          }
        ],
        annualGross: parseFloat((gross * payPeriodFactor).toFixed(2)),
        annualTax: parseFloat((gross * payPeriodFactor * (rate / 100)).toFixed(2))
      };
    }

    const annualGross = gross * payPeriodFactor;

    // Standard country progressive tax (Federal)
    const fedTaxResult = calculateProgressiveTax(annualGross, activeCountry.brackets);

    if (activeCountry.code === "CAN") {
      // Find selected province
      const province = CANADA_PROVINCES.find(p => p.code === selectedProvinceCode) || CANADA_PROVINCES[1]; // default to BC
      const provTaxResult = province.brackets.length > 0 
        ? calculateProgressiveTax(annualGross, province.brackets)
        : { totalTax: 0, effectiveRate: 0, breakdown: [] };

      const totalAnnualTax = fedTaxResult.totalTax + provTaxResult.totalTax;
      const combinedEffectiveRate = annualGross > 0 ? (totalAnnualTax / annualGross) * 100 : 0;

      // Map breakdowns scaled to current pay period
      const combinedBreakdown: any[] = [];
      fedTaxResult.breakdown.forEach(b => {
        combinedBreakdown.push({
          range: `Fed: ${b.range}`,
          rate: b.rate,
          taxableInBracket: parseFloat((b.taxableInBracket / payPeriodFactor).toFixed(2)),
          taxInBracket: parseFloat((b.taxInBracket / payPeriodFactor).toFixed(2))
        });
      });

      provTaxResult.breakdown.forEach(b => {
        combinedBreakdown.push({
          range: `${province.code}: ${b.range}`,
          rate: b.rate,
          taxableInBracket: parseFloat((b.taxableInBracket / payPeriodFactor).toFixed(2)),
          taxInBracket: parseFloat((b.taxInBracket / payPeriodFactor).toFixed(2))
        });
      });

      return {
        totalTax: parseFloat((totalAnnualTax / payPeriodFactor).toFixed(2)),
        effectiveRate: parseFloat(combinedEffectiveRate.toFixed(2)),
        breakdown: combinedBreakdown,
        annualGross: parseFloat(annualGross.toFixed(2)),
        annualTax: parseFloat(totalAnnualTax.toFixed(2))
      };
    }

    // Default Progressive Brackets calculations for other countries
    const { totalTax: annualTax, effectiveRate, breakdown: annualBreakdown } = calculateProgressiveTax(annualGross, activeCountry.brackets);
    
    const totalTax = annualTax / payPeriodFactor;
    const periodBreakdown = annualBreakdown.map(b => ({
      range: b.range,
      rate: b.rate,
      taxableInBracket: parseFloat((b.taxableInBracket / payPeriodFactor).toFixed(2)),
      taxInBracket: parseFloat((b.taxInBracket / payPeriodFactor).toFixed(2))
    }));

    return {
      totalTax: parseFloat(totalTax.toFixed(2)),
      effectiveRate: parseFloat(effectiveRate.toFixed(2)),
      breakdown: periodBreakdown,
      annualGross: parseFloat(annualGross.toFixed(2)),
      annualTax: parseFloat(annualTax.toFixed(2))
    };
  }, [dashboardStats.totalEarnings, activeCountry, useProgressiveTax, taxRate, payPeriodFactor, selectedProvinceCode]);

  // Dashboard charts
  const dashboardChartDataTrends = useMemo(() => {
    const chronologicalShifts = [...dashboardShifts].sort((a, b) => a.date.localeCompare(b.date));
    const dateMap: Record<string, { date: string; Hours: number; Earnings: number }> = {};
    
    chronologicalShifts.forEach(s => {
      const dateLabel = s.date.substring(5); // Format as "MM-DD"
      if (!dateMap[dateLabel]) {
        dateMap[dateLabel] = { date: dateLabel, Hours: 0, Earnings: 0 };
      }
      dateMap[dateLabel].Hours += s.hours;
      dateMap[dateLabel].Earnings += s.earnings || 0;
    });

    return Object.values(dateMap);
  }, [dashboardShifts]);

  const dashboardChartDataJobs = useMemo(() => {
    const jobGroupMap: Record<string, { name: string; value: number }> = {};
    
    dashboardShifts.forEach(s => {
      const name = s.job.toUpperCase();
      if (!jobGroupMap[name]) {
        jobGroupMap[name] = { name, value: 0 };
      }
      jobGroupMap[name].value += s.earnings || 0;
    });

    return Object.values(jobGroupMap).map(item => ({
      ...item,
      value: parseFloat(item.value.toFixed(2))
    }));
  }, [dashboardShifts]);

  // --- Derived Statistics ---
  const stats = useMemo(() => {
    let totalHours = 0;
    let totalEarnings = 0;
    
    filteredShifts.forEach(s => {
      totalHours += s.hours;
      totalEarnings += s.earnings || 0;
    });

    const averageRate = totalHours > 0 ? (totalEarnings / totalHours) : 0;
    const shiftCount = filteredShifts.length;
    const averageDuration = shiftCount > 0 ? (totalHours / shiftCount) : 0;

    return {
      totalHours: parseFloat(totalHours.toFixed(2)),
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      averageRate: parseFloat(averageRate.toFixed(2)),
      shiftCount,
      averageDuration: parseFloat(averageDuration.toFixed(2))
    };
  }, [filteredShifts]);

  // --- Recharts Chart Formatting ---

  // 1. Data for Trend Chart (Hours worked by date)
  const chartDataTrends = useMemo(() => {
    // We want chronologically ordered dates for the trend line
    const chronologicalShifts = [...filteredShifts].sort((a, b) => a.date.localeCompare(b.date));
    
    // Group hours by date
    const dateMap: Record<string, { date: string; Hours: number; Earnings: number }> = {};
    
    chronologicalShifts.forEach(s => {
      const dateLabel = s.date.substring(5); // Format as "MM-DD" instead of "YYYY-MM-DD" for readability
      if (!dateMap[dateLabel]) {
        dateMap[dateLabel] = { date: dateLabel, Hours: 0, Earnings: 0 };
      }
      dateMap[dateLabel].Hours += s.hours;
      dateMap[dateLabel].Earnings += s.earnings || 0;
    });

    return Object.values(dateMap);
  }, [filteredShifts]);

  // 2. Data for Job Earnings breakdown (Pie Chart)
  const chartDataJobs = useMemo(() => {
    const jobGroupMap: Record<string, { name: string; value: number }> = {};
    
    filteredShifts.forEach(s => {
      const name = s.job.toUpperCase();
      if (!jobGroupMap[name]) {
        jobGroupMap[name] = { name, value: 0 };
      }
      jobGroupMap[name].value += s.earnings || 0;
    });

    // Format to 2 decimals
    return Object.values(jobGroupMap).map(item => ({
      ...item,
      value: parseFloat(item.value.toFixed(2))
    }));
  }, [filteredShifts]);

  // Map job name to color classes/values
  const getJobColor = (jobName: string) => {
    const job = jobs.find(j => j.name.toUpperCase() === jobName.toUpperCase());
    return job ? job.color : "#a1a1aa"; // default zinc
  };

  return (
    <div className="min-h-screen relative text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 flex flex-col md:flex-row overflow-x-hidden">
      {/* Immersive 3D/depth-of-field teamwork collaboration background video with image fallback */}
      <div className="fixed inset-0 z-0 pointer-events-none transition-all duration-700 opacity-[0.22] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop&blur=2"
        >
          <source 
            src="https://assets.mixkit.co/videos/preview/mixkit-office-workers-brainstorming-ideas-together-41588-large.mp4" 
            type="video/mp4" 
          />
          <source 
            src="https://assets.mixkit.co/videos/preview/mixkit-business-people-meeting-in-a-modern-office-41584-large.mp4" 
            type="video/mp4" 
          />
        </video>
      </div>
      {/* Deep Rich Purple and Midnight Blue glowing ambient background mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-br from-indigo-950/40 via-slate-950/95 to-purple-950/40" />
      {/* 80% opacity Dark Slate / Blue overlay protection layer as recommended for maximum readability */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[#0F172A]/80 backdrop-blur-[2px]" />
      
      {/* Relative content wrapper to sit on top of fixed background elements */}
      <div className="fixed inset-0 z-0 pointer-events-none border border-indigo-500/5 shadow-[inset_0_0_80px_rgba(79,70,229,0.05)]" />

      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 max-w-sm">
          <div className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 backdrop-blur-md ${
            toast.type === "success" 
              ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-200" 
              : toast.type === "error"
                ? "bg-rose-950/90 border-rose-500/30 text-rose-200"
                : "bg-slate-900/95 border-slate-700/50 text-slate-100"
          }`}>
            {toast.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === "error" && <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === "info" && <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />}
            <div>
              <p className="font-semibold text-sm text-slate-200">System Notification</p>
              <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="ml-auto text-xs hover:opacity-100 opacity-60">✕</button>
          </div>
        </div>
      )}

      {/* Universal Floating Top Navigation Header (Tesla-Style) */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 h-16 md:h-20 flex items-center justify-between px-4 md:px-12 transition-all duration-300 border-b border-white/5 backdrop-blur-md bg-slate-950/45"
        onMouseLeave={() => setHoveredMenu(null)}
      >
        {/* Left Side: Logo */}
        <div 
          onClick={() => { setActiveTab("home"); setHoveredMenu(null); }} 
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/10 group-hover:bg-indigo-600 transition-all duration-300">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-black tracking-[0.25em] text-white uppercase font-sans">
            WorkDash <span className="text-[9px] text-indigo-400 font-mono tracking-normal lowercase ml-1">pro</span>
          </span>
        </div>

        {/* Right Side: 'Get Started' Button & Hamburger Menu */}
        <div className="flex items-center gap-2">
          {/* 'Get Started' Button */}
          <button
            id="get-started-btn"
            onClick={() => {
              if (!userEmail) {
                setAuthTab("signup");
                setIsProfileModalOpen(true);
                triggerToast("Please sign up to get started! 🚀", "info");
              } else {
                setIsOnboardingOpen(true);
                setOnboardingStep(0);
                triggerToast("Launching your interactive WorkDash product tour! 🌟", "success");
              }
            }}
            className="px-4 py-2 bg-transparent hover:bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold rounded-full text-xs tracking-wider uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Get Started</span>
          </button>

          {/* Hamburger Menu Toggle */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-full text-xs font-bold tracking-wider uppercase transition flex items-center gap-1 cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span>Menu</span>
          </button>
        </div>

        {/* --- Mega Menu Hover Dropdown Panels --- */}
        <AnimatePresence>
          {hoveredMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 top-full bg-slate-950/95 border-b border-slate-800/80 shadow-2xl backdrop-blur-2xl py-10 px-8 md:px-24 grid grid-cols-1 md:grid-cols-3 gap-8 z-50 text-left cursor-default pointer-events-auto"
              onMouseEnter={() => setHoveredMenu(hoveredMenu)}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              {hoveredMenu === "payroll" && (
                <>
                  <div className="space-y-3 border-r border-slate-800/50 pr-6">
                    <span className="text-[10px] font-bold text-indigo-400 font-mono tracking-wider uppercase bg-indigo-500/10 px-2 py-1 rounded-full">
                      MODULE I • COMPENSATIONS
                    </span>
                    <h3 className="text-xl font-black text-white leading-none tracking-tight">AUTONOMOUS PAYROLL</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Analyze active earnings, configure customizable job scales, and preview regional progressive income tax brackets instantly.
                    </p>
                  </div>
                  <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/40 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono uppercase">Current Period Gross</span>
                      <div className="text-2xl font-black text-white tracking-tight mt-1">
                        {activeCountry.symbol}{stats.totalEarnings.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-indigo-300 font-mono mt-0.5 block">
                        Using {activeCountry.name} Tax Bracket Config
                      </span>
                    </div>
                    <button 
                      onClick={() => { setActiveTab("dashboard"); setHoveredMenu(null); }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5 mt-4 group"
                    >
                      Enter Earnings Dashboard 
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  <div className="space-y-3.5 py-2">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Quick Links</span>
                    <div className="flex flex-col gap-2.5 text-xs font-semibold">
                      <button onClick={() => { setActiveTab("dashboard"); setHoveredMenu(null); }} className="text-slate-300 hover:text-indigo-300 text-left transition">Calculate Base Wages</button>
                      <button onClick={() => { setActiveTab("settings"); setHoveredMenu(null); }} className="text-slate-300 hover:text-indigo-300 text-left transition">Adjust Hourly Salary Scales</button>
                      <button onClick={() => { setActiveTab("settings"); setHoveredMenu(null); }} className="text-slate-300 hover:text-indigo-300 text-left transition">Progressive Income Tax Options</button>
                    </div>
                  </div>
                </>
              )}

              {hoveredMenu === "attendance" && (
                <>
                  <div className="space-y-3 border-r border-slate-800/50 pr-6">
                    <span className="text-[10px] font-bold text-rose-400 font-mono tracking-wider uppercase bg-rose-500/10 px-2 py-1 rounded-full">
                      MODULE II • ATTENDANCE
                    </span>
                    <h3 className="text-xl font-black text-white leading-none tracking-tight">ROSTER SCHEDULING</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Coordinate staff availability, record overnight shifts, and visually map rosters using full interactive grid and list logs.
                    </p>
                  </div>
                  <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/40 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono uppercase">Shift Logs Captured</span>
                      <div className="text-2xl font-black text-white tracking-tight mt-1">
                        {shifts.length} Active Shifts
                      </div>
                      <span className="text-[10px] text-rose-300 font-mono mt-0.5 block">
                        Accumulated: {stats.totalHours} Hours Worked
                      </span>
                    </div>
                    <button 
                      onClick={() => { setActiveTab("shifts"); setHoveredMenu(null); }}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1.5 mt-4 group"
                    >
                      Open Calendar Log
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  <div className="space-y-3.5 py-2">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Quick Actions</span>
                    <div className="flex flex-col gap-2.5 text-xs font-semibold">
                      <button onClick={() => { setIsAddModalOpen(true); setHoveredMenu(null); }} className="text-slate-300 hover:text-rose-300 text-left transition">Log Rapid Manual Shift</button>
                      <button onClick={() => { setActiveTab("shifts"); setViewType("calendar"); setHoveredMenu(null); }} className="text-slate-300 hover:text-rose-300 text-left transition">View Interactive Roster Grid</button>
                      <button onClick={() => { setActiveTab("shifts"); setViewType("list"); setHoveredMenu(null); }} className="text-slate-300 hover:text-rose-300 text-left transition">Audit Raw Shifts List</button>
                    </div>
                  </div>
                </>
              )}

              {hoveredMenu === "recruitment" && (
                <>
                  <div className="space-y-3 border-r border-slate-800/50 pr-6">
                    <span className="text-[10px] font-bold text-amber-400 font-mono tracking-wider uppercase bg-amber-500/10 px-2 py-1 rounded-full">
                      MODULE III • RECRUITMENT AI
                    </span>
                    <h3 className="text-xl font-black text-white leading-none tracking-tight">TALENT INTELLIGENCE</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Leverage executive intelligence algorithms to parse candidate resumes, auto-generate candidate summaries, and detect team skill gaps.
                    </p>
                  </div>
                  <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/40 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono uppercase">Access Authorization</span>
                      <div className="text-2xl font-black text-amber-400 tracking-tight mt-1 flex items-center gap-1.5">
                        <UserCheck className="w-5 h-5 shrink-0" />
                        MD SECURED
                      </div>
                      <span className="text-[10px] text-amber-300/80 font-mono mt-0.5 block">
                        Advanced predictive modeling ready
                      </span>
                    </div>
                    <button 
                      onClick={() => { setActiveTab("hr"); setHoveredMenu(null); }}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 mt-4 group"
                    >
                      Enter Sourcing Portal
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  <div className="space-y-3.5 py-2">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Talent Tools</span>
                    <div className="flex flex-col gap-2.5 text-xs font-semibold">
                      <button onClick={() => { setActiveTab("hr"); setHoveredMenu(null); }} className="text-slate-300 hover:text-amber-300 text-left transition">AI Roster Gap Finder</button>
                      <button onClick={() => { setActiveTab("hr"); setHoveredMenu(null); }} className="text-slate-300 hover:text-amber-300 text-left transition">Automated Bio Summarizer</button>
                      <button onClick={() => { setIsAiCoPilotOpen(true); setHoveredMenu(null); }} className="text-slate-300 hover:text-amber-300 text-left transition">Consult AI Copilot Guide</button>
                    </div>
                  </div>
                </>
              )}

              {hoveredMenu === "sync" && (
                <>
                  <div className="space-y-3 border-r border-slate-800/50 pr-6">
                    <span className="text-[10px] font-bold text-emerald-400 font-mono tracking-wider uppercase bg-emerald-500/10 px-2 py-1 rounded-full">
                      MODULE IV • CLOUDSHEETS
                    </span>
                    <h3 className="text-xl font-black text-white leading-none tracking-tight">SPREADSHEET INTERFACE</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Deploy premium Google Apps Script macros to link your local platform rosters with standard spreadsheets in 2-way live syncs.
                    </p>
                  </div>
                  <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/40 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono uppercase">API Connection State</span>
                      <div className="text-lg font-bold text-slate-200 mt-1 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${connection.webAppUrl ? "bg-emerald-500 animate-pulse" : "bg-slate-500"}`}></span>
                        {connection.webAppUrl ? "SYNC LINKED" : "OFFLINE / LOCAL"}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block truncate max-w-[200px]">
                        URL: {connection.webAppUrl || "Not Configured"}
                      </span>
                    </div>
                    <button 
                      onClick={() => { setActiveTab("sync"); setHoveredMenu(null); }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5 mt-4 group"
                    >
                      Configure Cloud Synchronization
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  <div className="space-y-3.5 py-2">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Sync Utilities</span>
                    <div className="flex flex-col gap-2.5 text-xs font-semibold">
                      <button onClick={() => { handleImportShifts(); setHoveredMenu(null); }} className="text-slate-300 hover:text-emerald-300 text-left transition flex items-center gap-1">Pull Roster Shifts <Download className="w-3 h-3" /></button>
                      <button onClick={() => { handleExportShifts(); setHoveredMenu(null); }} className="text-slate-300 hover:text-emerald-300 text-left transition flex items-center gap-1">Push Roster Shifts <Upload className="w-3 h-3" /></button>
                      <button onClick={() => { setActiveTab("sync"); setHoveredMenu(null); }} className="text-slate-300 hover:text-emerald-300 text-left transition">View Deployment Instruction Manual</button>
                    </div>
                  </div>
                </>
              )}

              {hoveredMenu === "settings" && (
                <>
                  <div className="space-y-3 border-r border-slate-800/50 pr-6">
                    <span className="text-[10px] font-bold text-indigo-400 font-mono tracking-wider uppercase bg-indigo-500/10 px-2 py-1 rounded-full">
                      MODULE V • PREFERENCES
                    </span>
                    <h3 className="text-xl font-black text-white leading-none tracking-tight">SYSTEM CONFIG</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Configure dynamic base wages, register custom corporate roles, select international tax laws, or load default demo values.
                    </p>
                  </div>
                  <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/40 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono uppercase">Roster Classes Defined</span>
                      <div className="text-2xl font-black text-white tracking-tight mt-1">
                        {jobs.length} Job Titles
                      </div>
                      <span className="text-[10px] text-indigo-300 font-mono mt-0.5 block">
                        Base: {activeCountry.symbol}{activeCountry.flatRate}/hr Flat Rate
                      </span>
                    </div>
                    <button 
                      onClick={() => { setActiveTab("settings"); setHoveredMenu(null); }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5 mt-4 group"
                    >
                      Open Settings Dashboard
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  <div className="space-y-3.5 py-2">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Configurations</span>
                    <div className="flex flex-col gap-2.5 text-xs font-semibold">
                      <button onClick={() => { setActiveTab("settings"); setHoveredMenu(null); }} className="text-slate-300 hover:text-indigo-300 text-left transition">Register Corporate Job Profile</button>
                      <button onClick={() => { toggleWorkspaceMode(); setHoveredMenu(null); }} className="text-slate-300 hover:text-indigo-300 text-left transition">Toggle PIN Security Key</button>
                      <button onClick={() => { setIsOnboardingOpen(true); setOnboardingStep(0); setHoveredMenu(null); }} className="text-slate-300 hover:text-indigo-300 text-left transition">Trigger Guided Interactive Tour</button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Universal Sliding Navigation Menu Drawer (Tesla Style) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-[4px] z-50"
            />
            {/* Slide-out Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 right-0 w-80 md:w-96 bg-slate-950 border-l border-slate-800/80 z-50 flex flex-col justify-between p-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex flex-col gap-6 overflow-y-auto max-h-[85vh] pr-2 scrollbar-none">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
                      <Layers className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-sm font-extrabold text-white tracking-wider flex items-center gap-1 uppercase">
                        WorkDash <span className="text-[8px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded-full border border-indigo-500/30">PRO</span>
                      </h1>
                      <p className="text-[9px] text-slate-500">
                        Human Resource Management
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-full border border-slate-800/60 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <nav className="flex flex-col gap-1.5 mt-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-2">Navigation Links</span>
                  <button
                    onClick={() => { setActiveTab("home"); setIsSidebarOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left ${
                      activeTab === "home" 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                    Home Landing Overview
                  </button>
                  <button
                    onClick={() => { setActiveTab("dashboard"); setIsSidebarOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left ${
                      activeTab === "dashboard" 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                    }`}
                  >
                    <Coins className="w-4 h-4 text-indigo-400" />
                    Payroll Center
                  </button>
                  <button
                    onClick={() => { setActiveTab("shifts"); setIsSidebarOpen(false); }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left ${
                      activeTab === "shifts" 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <CalendarDays className="w-4 h-4 text-indigo-400" />
                      Work Shifts Log
                    </span>
                    <span className="text-[10px] bg-slate-950/40 text-slate-400 font-semibold px-2 py-0.5 rounded-md">
                      {shifts.length}
                    </span>
                  </button>
                  <button
                    onClick={() => { setActiveTab("sync"); setIsSidebarOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left ${
                      activeTab === "sync" 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                    }`}
                  >
                    <Database className="w-4 h-4 text-emerald-400" />
                    Cloud Synchronization
                  </button>
                  <button
                    onClick={() => { setActiveTab("settings"); setIsSidebarOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left ${
                      activeTab === "settings" 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                    }`}
                  >
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    Settings & Rates
                  </button>
                  <button
                    onClick={() => { setActiveTab("support"); setIsSidebarOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left ${
                      activeTab === "support" 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 text-indigo-400" />
                    Support & FAQ System
                  </button>
                  <button
                    onClick={() => { setActiveTab("hr"); setIsSidebarOpen(false); }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-left border ${
                      activeTab === "hr" 
                        ? "bg-gradient-to-r from-amber-500/20 to-indigo-600/20 border-indigo-500/40 text-amber-300 shadow-md" 
                        : "text-amber-400/90 hover:text-amber-300 hover:bg-slate-900/40 border-amber-500/10"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Brain className="w-4 h-4 text-amber-400 shrink-0" />
                      HR Intelligence (MD)
                    </span>
                    <span className="text-[8px] bg-amber-500/20 text-amber-400 font-black px-1.5 py-0.5 rounded border border-amber-500/30 font-mono">
                      MD Only
                    </span>
                  </button>
                </nav>

                <div className="flex flex-col gap-2.5 mt-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">System Tools</span>
                  
                  {/* Co-Pilot guide */}
                  <button
                    onClick={() => { setIsAiCoPilotOpen(true); setIsSidebarOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 bg-indigo-950/30 hover:bg-indigo-900/40 text-indigo-300 hover:text-white border border-indigo-500/20 hover:border-indigo-500/40 shadow-sm rounded-xl text-xs font-bold transition-all text-left"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse shrink-0" />
                    <span>AI Co-Pilot Guide</span>
                    <span className="ml-auto text-[8px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded-full border border-indigo-500/30">
                      LIVE
                    </span>
                  </button>

                  {/* Guided Tour */}
                  <button
                    onClick={() => { setIsOnboardingOpen(true); setOnboardingStep(0); setIsSidebarOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 bg-slate-900/40 hover:bg-slate-900/60 text-slate-300 hover:text-white border border-slate-800/80 rounded-xl text-xs font-semibold transition-all text-left"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Launch Quick Tour</span>
                  </button>

                  {/* Profile Connection */}
                  <button
                    onClick={() => { setIsProfileModalOpen(true); setIsSidebarOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 border rounded-xl text-xs font-semibold transition-all text-left ${
                      userEmail
                        ? "bg-indigo-950/30 border-indigo-500/20 text-indigo-300"
                        : "bg-slate-900/40 border-slate-800/80 text-slate-300"
                    }`}
                  >
                    <User className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="truncate">{userEmail ? userEmail : "Link Account Profile"}</span>
                  </button>

                  {/* Demo/Private Workspace Switcher inside Drawer */}
                  <button
                    onClick={() => { toggleWorkspaceMode(); setIsSidebarOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 border rounded-xl text-xs font-bold transition-all text-left ${
                      isDemoMode
                        ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                        : "bg-indigo-950/20 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10"
                    }`}
                  >
                    <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{isDemoMode ? "🔒 Switch to Private" : "🟢 Switch to Demo"}</span>
                  </button>

                  {/* Discovery Mode Toggle inside Drawer */}
                  <button
                    onClick={() => { toggleDiscoveryMode(); }}
                    className={`flex items-center gap-3 px-4 py-3 border rounded-xl text-xs font-bold transition-all text-left ${
                      isDiscoveryMode
                        ? "bg-[#00B388]/10 border-[#00B388]/20 text-[#00B388]"
                        : "bg-slate-900/40 border-slate-800/80 text-slate-300"
                    }`}
                  >
                    <Radar className={`w-4 h-4 ${isDiscoveryMode ? "animate-spin" : ""}`} style={{ animationDuration: "6s" }} />
                    <span>Discovery Mode: {isDiscoveryMode ? "On" : "Off"}</span>
                  </button>

                  {/* Reset Hotspots inside Drawer */}
                  {dismissedHotspots.length > 0 && isDiscoveryMode && (
                    <button
                      onClick={() => { handleResetHotspots(); setIsSidebarOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 bg-slate-900/40 hover:bg-slate-900/60 text-slate-300 hover:text-white border border-slate-800/80 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Reset Dismissed Tips ({dismissedHotspots.length})</span>
                    </button>
                  )}

                  {/* Admin Stats Panel (Shanuka only) inside drawer */}
                  {userEmail.toLowerCase().trim() === "shanukanishankodithuwakku@gmail.com" && (
                    <button
                      onClick={() => { fetchAdminStats(); setIsAdminStatsOpen(true); setIsSidebarOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-bold transition-all text-left animate-pulse"
                    >
                      <Users className="w-4 h-4 shrink-0" />
                      <span>Host Insights Portal</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Drawer Footer Widgets */}
              <div className="flex flex-col gap-3 pt-4 border-t border-slate-800/60 mt-4">
                <div className="bg-slate-900/30 p-3 rounded-xl border border-slate-800/40">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${connection.webAppUrl ? "bg-emerald-500" : "bg-slate-600 animate-pulse"}`}></div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase font-mono">
                      {connection.webAppUrl ? "Sheets Live Linked" : "Sync Offline"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Automated Google Sheets roster parsing enabled.
                  </p>
                </div>

                {/* Creator Card */}
                <div className="bg-indigo-950/20 p-3 rounded-xl border border-indigo-500/10 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center text-[8px] font-extrabold text-slate-950">
                      SK
                    </div>
                    <span className="text-[10px] font-bold text-slate-200">Shanuka Kodithuwakku</span>
                  </div>
                  <a 
                    href="https://www.linkedin.com/in/shanuka-kodithuwakku/?skipRedirect=true" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 py-1 bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 rounded-lg text-[9px] font-bold transition text-center"
                  >
                    <Linkedin className="w-2.5 h-2.5" />
                    LinkedIn Connection
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Pane */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-screen relative z-10 ${activeTab === "home" ? "pt-0" : "pt-16 md:pt-20"}`}>
        
        {/* Content Box */}
        <main className={activeTab === "home" ? "w-full min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)]" : "flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6"}>
          
          {/* Dynamic Full Frontpage Snapping Slides when on Home view */}
          {activeTab === "home" && (
            <div className="relative h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] w-full">
              {/* Floating Slide Navigation Indicators */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3.5 z-40 hidden md:flex">
                {[
                  { id: "landing-slide-1", title: "Core Command", img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=90&w=200&auto=format&fit=crop" },
                  { id: "landing-slide-2", title: "Payroll Engine", img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=90&w=200&auto=format&fit=crop" },
                  { id: "landing-slide-3", title: "Roster Schedulers", img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=90&w=200&auto=format&fit=crop" },
                  { id: "landing-slide-4", title: "Google Cloud Sync", img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=90&w=200&auto=format&fit=crop" },
                  { id: "landing-slide-5", title: "Recruitment AI", img: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=90&w=200&auto=format&fit=crop" }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="group relative flex items-center justify-end gap-3 outline-none cursor-pointer"
                  >
                    {/* Tooltip on hover */}
                    <span className="opacity-0 group-hover:opacity-100 bg-slate-950/95 border border-slate-800 text-slate-200 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-lg transition-all duration-300 shadow-2xl pointer-events-none translate-x-2 group-hover:translate-x-0 font-mono">
                      {item.title}
                    </span>
                    {/* Circle thumbnail image border */}
                    <div className="w-10 h-10 rounded-full border-2 border-slate-800/80 hover:border-indigo-500 overflow-hidden shadow-2xl transition-all duration-300 hover:scale-110 bg-slate-950 ring-2 ring-transparent hover:ring-indigo-500/20">
                      <img 
                        src={item.img} 
                        alt={item.title} 
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </button>
                ))}
              </div>

              <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth scrollbar-none z-10">
                
                {/* Slide 1: General Core Command Overview */}
                <section 
                  id="landing-slide-1"
                  className="h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] w-full snap-start relative flex flex-col justify-between items-center py-12 md:py-16 px-4 text-center select-none overflow-hidden bg-cover bg-center transition-all duration-700"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=95&w=2560&auto=format&fit=crop')` }}
                >
                  <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[1px] z-0" />
                  
                  <div className="space-y-2 z-10 mt-6 md:mt-8">
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-[0.2em] uppercase font-sans animate-fadeIn">
                      WORKDASH PRO
                    </h2>
                    <p className="text-xs md:text-sm text-indigo-200 tracking-[0.1em] font-bold uppercase max-w-xl mx-auto">
                      The Next-Generation HRM & Workforce Orchestrator
                    </p>
                  </div>

                  <div className="z-10 grid grid-cols-3 gap-4 md:gap-6 max-w-md w-full mx-auto py-4 bg-slate-950/50 backdrop-blur-md px-6 rounded-2xl border border-white/5 shadow-2xl">
                    <div>
                      <span className="block text-[9px] text-slate-500 font-mono uppercase">Rosters</span>
                      <span className="text-sm md:text-base font-extrabold text-white font-mono">{shifts.length} Active</span>
                    </div>
                    <div className="border-x border-slate-800">
                      <span className="block text-[9px] text-slate-500 font-mono uppercase">Period Gross</span>
                      <span className="text-sm md:text-base font-extrabold text-emerald-400 font-mono">{activeCountry.symbol}{stats.totalEarnings.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500 font-mono uppercase">Security</span>
                      <span className="text-sm md:text-base font-extrabold text-indigo-400 font-mono">Secured</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md z-10 px-4">
                    <button
                      onClick={() => { setActiveTab("dashboard"); triggerToast("Roster Analytics workspace activated! ✓", "success"); }}
                      className="flex-1 bg-white text-slate-950 hover:bg-slate-100 py-3 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-xl cursor-pointer"
                    >
                      Launch Workspace
                    </button>
                    <button
                      onClick={() => { setIsOnboardingOpen(true); setOnboardingStep(0); }}
                      className="flex-1 bg-slate-900/60 border border-white/10 hover:bg-white/10 text-white py-3 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-300 backdrop-blur-md cursor-pointer"
                    >
                      Interactive Tour
                    </button>
                  </div>
                </section>

                {/* Slide 2: Autonomous Payroll Engine */}
                <section 
                  id="landing-slide-2"
                  className="h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] w-full snap-start relative flex flex-col justify-between items-center py-12 md:py-16 px-4 text-center select-none overflow-hidden bg-cover bg-center"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=95&w=2560&auto=format&fit=crop')` }}
                >
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1.5px] z-0" />
                  
                  <div className="space-y-2 z-10 mt-6 md:mt-8">
                    <span className="text-[10px] font-bold text-indigo-400 font-mono uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">Module I • Financials</span>
                    <h2 className="text-2xl md:text-4xl font-black text-white tracking-[0.15em] uppercase mt-2">
                      PAYROLL ENGINE
                    </h2>
                    <p className="text-xs md:text-sm text-slate-300 tracking-[0.05em] max-w-xl mx-auto leading-relaxed">
                      Real-time progressive tax computation, live overtime scaling, and local flat-rate overrides.
                    </p>
                  </div>

                  <div className="z-10 bg-slate-950/50 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-xl max-w-sm w-full mx-auto flex items-center justify-around">
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 font-mono uppercase block">Total Gross</span>
                      <span className="text-base font-black text-emerald-400 font-mono">{activeCountry.symbol}{stats.totalEarnings.toLocaleString()}</span>
                    </div>
                    <div className="h-8 w-px bg-slate-800" />
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 font-mono uppercase block">Avg Roster Rate</span>
                      <span className="text-base font-black text-white font-mono">{activeCountry.symbol}{stats.averageRate.toFixed(2)}/hr</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md z-10 px-4">
                    <button
                      onClick={() => setActiveTab("dashboard")}
                      className="flex-1 bg-white text-slate-950 hover:bg-slate-100 py-3 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-lg cursor-pointer"
                    >
                      Analyze Payroll
                    </button>
                    <button
                      onClick={() => setActiveTab("settings")}
                      className="flex-1 bg-slate-900/60 border border-white/10 hover:bg-white/10 text-white py-3 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-300 backdrop-blur-md cursor-pointer"
                    >
                      Configure Rates
                    </button>
                  </div>
                </section>

                {/* Slide 3: High-Fidelity Roster Schedulers */}
                <section 
                  id="landing-slide-3"
                  className="h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] w-full snap-start relative flex flex-col justify-between items-center py-12 md:py-16 px-4 text-center select-none overflow-hidden bg-cover bg-center"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=95&w=2560&auto=format&fit=crop')` }}
                >
                  <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[1.5px] z-0" />
                  
                  <div className="space-y-2 z-10 mt-6 md:mt-8">
                    <span className="text-[10px] font-bold text-rose-400 font-mono uppercase tracking-widest bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">Module II • Attendance</span>
                    <h2 className="text-2xl md:text-4xl font-black text-white tracking-[0.15em] uppercase mt-2">
                      ROSTER CALENDAR
                    </h2>
                    <p className="text-xs md:text-sm text-slate-300 tracking-[0.05em] max-w-xl mx-auto leading-relaxed">
                      Visual shift mapping calendars, night shifts tracking, and color badges.
                    </p>
                  </div>

                  <div className="z-10 bg-slate-950/50 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-xl max-w-sm w-full mx-auto flex items-center justify-around">
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 font-mono uppercase block">Active Roster</span>
                      <span className="text-base font-black text-indigo-400 font-mono">{shifts.length} Shifts</span>
                    </div>
                    <div className="h-8 w-px bg-slate-800" />
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 font-mono uppercase block">Roster Duration</span>
                      <span className="text-base font-black text-white font-mono">{stats.totalHours} Hours</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md z-10 px-4">
                    <button
                      onClick={() => setActiveTab("shifts")}
                      className="flex-1 bg-white text-slate-950 hover:bg-slate-100 py-3 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-lg cursor-pointer"
                    >
                      Open Calendar
                    </button>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="flex-1 bg-slate-900/60 border border-white/10 hover:bg-white/10 text-white py-3 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-300 backdrop-blur-md cursor-pointer"
                    >
                      Log Rapid Shift
                    </button>
                  </div>
                </section>

                {/* Slide 4: Google Sheets Cloud Synchronization */}
                <section 
                  id="landing-slide-4"
                  className="h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] w-full snap-start relative flex flex-col justify-between items-center py-12 md:py-16 px-4 text-center select-none overflow-hidden bg-cover bg-center"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=95&w=2560&auto=format&fit=crop')` }}
                >
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1.5px] z-0" />
                  
                  <div className="space-y-2 z-10 mt-6 md:mt-8">
                    <span className="text-[10px] font-bold text-emerald-400 font-mono uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Module III • Synchronization</span>
                    <h2 className="text-2xl md:text-4xl font-black text-white tracking-[0.15em] uppercase mt-2">
                      CLOUDSHEET CONNECTION
                    </h2>
                    <p className="text-xs md:text-sm text-slate-300 tracking-[0.05em] max-w-xl mx-auto leading-relaxed">
                      Deploy secure Google Apps Script macros to link spreadsheet files with direct 2-way sync pipelines.
                    </p>
                  </div>

                  <div className="z-10 bg-slate-950/50 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-xl max-w-xs w-full mx-auto flex items-center gap-3 justify-center">
                    <span className={`w-2 h-2 rounded-full ${connection.webAppUrl ? "bg-emerald-500 animate-pulse" : "bg-slate-500"}`}></span>
                    <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                      {connection.webAppUrl ? "Sheets Live Synced" : "Local Database Mode"}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md z-10 px-4">
                    <button
                      onClick={handleImportShifts}
                      disabled={isImporting}
                      className="flex-1 bg-white text-slate-950 hover:bg-slate-100 disabled:opacity-50 py-3 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-lg cursor-pointer"
                    >
                      {isImporting ? "Syncing..." : "Pull Sync Now"}
                    </button>
                    <button
                      onClick={() => setActiveTab("sync")}
                      className="flex-1 bg-slate-900/60 border border-white/10 hover:bg-white/10 text-white py-3 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-300 backdrop-blur-md cursor-pointer"
                    >
                      Setup Sync Hub
                    </button>
                  </div>
                </section>

                {/* Slide 5: Recruitment Intelligence AI */}
                <section 
                  id="landing-slide-5"
                  className="h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] w-full snap-start relative flex flex-col justify-between items-center py-12 md:py-16 px-4 text-center select-none overflow-hidden bg-cover bg-center"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1551434678-e076c223a692?q=95&w=2560&auto=format&fit=crop')` }}
                >
                  <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[1.5px] z-0" />
                  
                  <div className="space-y-2 z-10 mt-6 md:mt-8">
                    <span className="text-[10px] font-bold text-amber-400 font-mono uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">Module IV • Sourcing</span>
                    <h2 className="text-2xl md:text-4xl font-black text-white tracking-[0.15em] uppercase mt-2">
                      RECRUITMENT INTELLIGENCE
                    </h2>
                    <p className="text-xs md:text-sm text-slate-300 tracking-[0.05em] max-w-xl mx-auto leading-relaxed">
                      AI-powered skills parsing, automated profile matching, and strategic team roster gap calculations.
                    </p>
                  </div>

                  <div className="z-10 bg-slate-950/50 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-xl max-w-xs w-full mx-auto flex items-center gap-3 justify-center">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">
                      AI Talent Sourcing Active
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md z-10 px-4">
                    <button
                      onClick={() => setActiveTab("hr")}
                      className="flex-1 bg-white text-slate-950 hover:bg-slate-100 py-3 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-lg cursor-pointer"
                    >
                      Enter HR Portal
                    </button>
                    <button
                      onClick={() => setIsAiCoPilotOpen(true)}
                      className="flex-1 bg-slate-900/60 border border-white/10 hover:bg-white/10 text-white py-3 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-300 backdrop-blur-md cursor-pointer"
                    >
                      AI Co-Pilot Guide
                    </button>
                  </div>
                </section>

              </div>
            </div>
          )}
          
          {/* Synchronization Tab Content */}
          {activeTab === "sync" && (
            <div className="space-y-6 animate-fadeIn">
              {isDemoMode && (
                <div className="bg-indigo-950/40 border border-indigo-500/30 p-5 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-xl">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs font-mono uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                      Interactive Demo Mode Active
                    </div>
                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                      To safeguard private data, the master Google Spreadsheet is <strong>safely unlinked</strong> in this view. 
                      However, this application is <strong>100% free and fully functional</strong> for anyone! Connect your own 
                      Google Sheet instantly by following the <strong>Setup Guide</strong> below.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      document.getElementById("apps-script-instructions")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="shrink-0 px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 font-bold text-xs rounded-xl shadow-md transition"
                  >
                    View Setup Guide
                  </button>
                </div>
              )}

              {/* Direct Sheets synchronization card */}
              <div className="relative">
                {isDiscoveryMode && !dismissedHotspots.includes("sync-section") && (
                  <Hotspot
                    id="sync-section"
                    tip="The Sync Hub automates roster data loading from external Google Sheets using your custom Apps Script web app."
                    actionText="Check Guide"
                    onActionClick={() => {
                      document.getElementById("apps-script-instructions")?.scrollIntoView({ behavior: "smooth" });
                      triggerToast("Viewing Google Sheets Integration Guide! 📋", "info");
                    }}
                    className="absolute -top-3 -right-3 z-30"
                    tooltipPosition="left"
                    onDismiss={() => handleDismissHotspot("sync-section")}
                  />
                )}
                <div id="tour-sync-section" className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 shadow-sm relative overflow-hidden" style={{ background: "linear-gradient(135deg, #161C24 0%, #0c352a 100%)" }}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="space-y-1 max-w-2xl text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Database className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-bold text-sm tracking-tight text-slate-900">Google Sheets Direct Synchronization</h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Fetch raw roster shifts dynamically from your connected Google Sheet or write custom logs back instantly.
                      Our parser reads date formats (e.g. <strong>"16-Jun"</strong>), time durations (e.g. <strong>"17:00"</strong>), 
                      and calculates precise shifts, resolving overnight intervals on the fly.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch shrink-0">
                    <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      </div>
                      <input
                        type="text"
                        placeholder={isDemoMode ? "Paste your own Apps Script URL to sync for free!" : "Enter Apps Script Web App .exec URL"}
                        value={isDemoMode && connection.webAppUrl === DEFAULT_URL ? "" : connection.webAppUrl}
                        onChange={(e) => setConnection(prev => ({ ...prev, webAppUrl: e.target.value }))}
                        className="w-full bg-white text-xs text-slate-800 pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition shadow-sm font-medium"
                      />
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={testConnection}
                        disabled={isTesting}
                        className="px-3.5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500" /> : <RefreshCw className="w-3.5 h-3.5 text-slate-500" />}
                        Test Link
                      </button>
                      <button
                        onClick={handleImportShifts}
                        disabled={isImporting}
                        className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {isImporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        Pull Sync
                      </button>
                      <button
                        onClick={handleExportShifts}
                        disabled={isExporting}
                        className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500" /> : <Upload className="w-3.5 h-3.5" />}
                        Push Sync
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step-by-step documentation card */}
              <div id="apps-script-instructions" className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
                <div className="flex items-center gap-2.5 mb-3">
                  <FileSpreadsheet className="w-5.5 h-5.5 text-emerald-400" />
                  <h3 className="font-bold text-sm text-slate-100">Setup Guide: Deploy Your Connected Google Sheet Backend</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  To enable automated 2-way sync with your personal rosters, deploy a Google Apps Script linked to your active spreadsheet.
                  Follow these simple steps:
                </p>

                <div className="space-y-4 text-xs">
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center font-bold text-indigo-400 border border-slate-800 text-[10px] shrink-0 font-mono">1</div>
                    <div>
                      <p className="font-bold text-slate-200">Create Sheet</p>
                      <p className="text-slate-400 mt-0.5 leading-relaxed">Create a Google Sheet and name your active rosters tab <code className="text-indigo-300 font-mono bg-slate-950 px-1 py-0.5 rounded text-[11px]">WorkDash Import</code> with headers: Date, Job, Start, End, Hours, Notes.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center font-bold text-indigo-400 border border-slate-800 text-[10px] shrink-0 font-mono">2</div>
                    <div>
                      <p className="font-bold text-slate-200">Open Script Editor</p>
                      <p className="text-slate-400 mt-0.5 leading-relaxed">Click <strong className="text-slate-300">Extensions &gt; Apps Script</strong> inside Google Sheets, clean out the script editor, and paste the code below.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center font-bold text-indigo-400 border border-slate-800 text-[10px] shrink-0 font-mono">3</div>
                    <div>
                      <p className="font-bold text-slate-200">Deploy as Web App</p>
                      <p className="text-slate-400 mt-0.5 leading-relaxed">Tap <strong className="text-slate-300">Deploy &gt; New deployment</strong>, select <strong className="text-slate-300">Web app</strong>, change "Execute as" to <strong className="text-slate-300">Me</strong>, and "Who has access" to <strong className="text-indigo-400">Anyone</strong>. Approve the spreadsheet permission request, copy the generated Web App URL, and paste it into our dashboard above.</p>
                    </div>
                  </div>
                </div>

                {/* Code Panel */}
                <div className="mt-5 p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-900">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Google Apps Script Source Code</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(
`const PUSH_SHEET = "WorkDash Export";
const IMPORT_SHEET = "WorkDash Import";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(PUSH_SHEET);
    if (!sheet) sheet = ss.insertSheet(PUSH_SHEET);

    sheet.clearContents();
    sheet.appendRow(data.headers);
    data.rows.forEach(row => sheet.appendRow(row));

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, rowsWritten: data.rows.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'import') {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(IMPORT_SHEET);

    if (!sheet) {
      sheet = ss.insertSheet(IMPORT_SHEET);
      const headers = ["Date", "Job", "Start", "End", "Hours", "Notes"];
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
      return ContentService
        .createTextOutput(JSON.stringify({ headers, rows: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(String);
    const rows = data.slice(1).filter(row => row[0] !== '' && row[0] !== null);

    return ContentService
      .createTextOutput(JSON.stringify({ headers, rows }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'WorkDash Pro connected ✓' }))
    .setMimeType(ContentService.MimeType.JSON);
}`
                        );
                        triggerToast("Apps Script code copied to clipboard! ✓", "success");
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold px-2 py-0.5 rounded border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20"
                    >
                      Copy Script Code
                    </button>
                  </div>
                  <pre className="text-[10px] text-slate-500 font-mono overflow-x-auto p-1 leading-relaxed max-h-48">
{`const PUSH_SHEET = "WorkDash Export";
const IMPORT_SHEET = "WorkDash Import";

// Called by WorkDash to WRITE shifts into your sheet
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(PUSH_SHEET);
    if (!sheet) sheet = ss.insertSheet(PUSH_SHEET);

    sheet.clearContents();
    sheet.appendRow(data.headers);
    data.rows.forEach(row => sheet.appendRow(row));

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, rowsWritten: data.rows.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Called by WorkDash to READ shifts from your "WorkDash Import" tab
function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'import') {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(IMPORT_SHEET);

    // Auto-create the import sheet with headers if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(IMPORT_SHEET);
      const headers = ["Date", "Job", "Start", "End", "Hours", "Notes"];
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
      return ContentService
        .createTextOutput(JSON.stringify({ headers, rows: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(String);
    const rows = data.slice(1).filter(row => row[0] !== '' && row[0] !== null);

    return ContentService
      .createTextOutput(JSON.stringify({ headers, rows }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'WorkDash Pro connected ✓' }))
    .setMimeType(ContentService.MimeType.JSON);
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Audit Debug Logs Accordion */}
          {showLogs && logs && (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl overflow-hidden animate-fadeIn">
              <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 text-indigo-400" />
                  <h4 className="text-xs font-bold text-slate-200 font-mono">Sync Analysis Logger — {logs.timestamp}</h4>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-mono">
                    Rows: <strong className="text-white">{logs.totalRows}</strong> | 
                    Parsed: <strong className="text-emerald-400">{logs.importedCount}</strong> | 
                    Skipped: <strong className="text-rose-400">{logs.skippedCount}</strong>
                  </span>
                  <button 
                    onClick={() => setShowLogs(false)} 
                    className="text-xs text-slate-500 hover:text-slate-300 px-2 py-0.5 rounded border border-slate-800"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              <div className="p-4 bg-slate-950/80 text-xs font-mono text-slate-400 max-h-60 overflow-y-auto">
                {logs.skippedDetails.length === 0 ? (
                  <p className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> 
                    All rows processed flawlessly! 100% data fidelity preserved. No shifts skipped.
                  </p>
                ) : (
                  <div className="space-y-1 text-[11px] leading-relaxed">
                    <p className="text-amber-400 font-semibold mb-2">Notice: Some rows were parsed with adjustments or skipped due to invalid inputs:</p>
                    {logs.skippedDetails.map((detail, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-rose-500 shrink-0">▸</span>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Dashboard Tab Content */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Tech Hero Welcome Card (appealing tech blue styling) */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6" style={{ background: "linear-gradient(135deg, #161C24 0%, #0c352a 100%)" }}>
              <div className="space-y-3 z-10 max-w-xl text-left">
                <span className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase font-mono bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 flex items-center gap-1.5 max-w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Roster Parsing & Analytics Engine v2.4
                </span>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none mb-1 md:mb-2">
                  WELCOME TO WORKDASH COMMAND CENTER
                </h1>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Analyze payroll cycles, configure job profiles, and perform cloud spreadsheet syncs directly. 
                  Choose a custom periodic pay window below to filter all metrics and trend visualizations.
                </p>
                <div className="mt-3.5 flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 max-w-fit shadow-sm">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-[10px] font-extrabold text-white shrink-0">
                    SK
                  </div>
                  <div className="text-[10px] leading-tight text-slate-700">
                    <span className="font-semibold text-slate-850">Designed & Engineered by</span>{" "}
                    <a 
                      href="https://www.linkedin.com/in/shanuka-kodithuwakku/?skipRedirect=true" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-500 font-bold underline decoration-indigo-600/40 transition inline-flex items-center gap-0.5"
                    >
                      Shanuka Kodithuwakku
                      <Linkedin className="w-2.5 h-2.5 inline" />
                    </a>
                    <span className="block text-[9.5px] text-slate-500 font-medium italic mt-0.5">
                      "Simplify roster planning, master payroll insights."
                    </span>
                  </div>
                </div>
                <div className="mt-3.5 md:mt-4 flex gap-4 text-[10px] text-slate-400 font-mono">
                  <span>SYSTEM STATUS: <span className="text-emerald-600 font-bold">SECURE & SYNCED</span></span>
                  <span>ACTIVE ROSTERS: <span className="text-indigo-600 font-bold">{shifts.length}</span></span>
                </div>
              </div>
              <div className="hidden md:block w-48 h-32 relative shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=400&h=300&q=80" 
                  alt="Tech Illustration" 
                  className="w-full h-full object-cover rounded-xl border border-slate-150 shadow-sm"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Modular Organization Command Center (Payroll, Attendance, Recruitment) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Payroll Segment */}
              <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 flex flex-col justify-between hover:border-indigo-500/30 transition-all duration-300 group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold font-mono text-indigo-300 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                      Module I • Payroll
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      <Coins className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-200 tracking-tight group-hover:text-indigo-300 transition-colors">
                      Wage & Tax Center
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Analyze total earnings, preview region-specific progressive income tax codes, and track hourly wage rates.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-850 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Gross: <strong className="text-slate-300">{activeCountry.symbol}{dashboardStats.totalEarnings.toLocaleString()}</strong>
                  </span>
                  <button 
                    onClick={() => setActiveTab("settings")}
                    className="text-[10px] text-indigo-400 font-bold hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    Configure Payroll
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Attendance Segment */}
              <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 flex flex-col justify-between hover:border-rose-500/30 transition-all duration-300 group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold font-mono text-rose-300 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      Module II • Attendance
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-200 tracking-tight group-hover:text-rose-300 transition-colors">
                      Roster & Attendance Log
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Log hours, monitor active shifts, and visually coordinate consulting or clinical rosters on the calendar.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-850 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Total: <strong className="text-slate-300">{shifts.length} Shifts</strong>
                  </span>
                  <button 
                    onClick={() => setActiveTab("shifts")}
                    className="text-[10px] text-rose-400 font-bold hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    Open Attendance Log
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Recruitment Segment */}
              <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 flex flex-col justify-between hover:border-amber-500/30 transition-all duration-300 group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold font-mono text-amber-300 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Module III • Recruitment
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                      <UserCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-200 tracking-tight group-hover:text-amber-300 transition-colors">
                      Smart Recruitment (MD)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Source top passive talent, parse candidate bios, and auto-detect structured resume gaps utilizing AI models.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-850 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Gate: <strong className="text-amber-400 font-bold">MD Secured</strong>
                  </span>
                  <button 
                    onClick={() => setActiveTab("hr")}
                    className="text-[10px] text-amber-400 font-bold hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    Access HR Portal
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

            </div>

            {/* Pay Periodic Selector Panel */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col lg:flex-row gap-5 justify-between lg:items-center">
              <div>
                <h3 className="font-bold text-sm text-slate-200">Pay Periodic Workspace</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Filter analytics and charts by a specific pay cycle</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                {/* Period Type Selection */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setPayPeriodType("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      payPeriodType === "all" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    All-Time
                  </button>
                  <button
                    onClick={() => setPayPeriodType("weekly")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      payPeriodType === "weekly" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setPayPeriodType("bi-weekly")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      payPeriodType === "bi-weekly" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Bi-Weekly
                  </button>
                  <button
                    onClick={() => setPayPeriodType("monthly")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      payPeriodType === "monthly" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setPayPeriodType("yearly")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      payPeriodType === "yearly" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Yearly
                  </button>
                </div>

                {/* Specific Period Dropdown */}
                {payPeriodType !== "all" && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase font-mono shrink-0">Select Range:</span>
                    <select
                      value={selectedPeriodValue}
                      onChange={(e) => setSelectedPeriodValue(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-xl outline-none cursor-pointer focus:border-indigo-500 font-mono w-full sm:w-64"
                    >
                      {periodOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                      {periodOptions.length === 0 && (
                        <option value="ALL">No periods found</option>
                      )}
                    </select>
                  </div>
                )}
              </div>
            </div>
            
            {/* Core KPI Metrics Grid */}
            <div id="tour-dashboard-analytics" className="relative">
              {isDiscoveryMode && !dismissedHotspots.includes("dashboard-analytics") && (
                <Hotspot
                  id="dashboard-analytics"
                  tip="The Command Center displays live cross-border metrics, real-time rosters, and instant compliance indicators."
                  actionText="View Details"
                  onActionClick={() => triggerToast("Exploring Live Command Stats! 📊", "info")}
                  className="absolute -top-3 right-4 z-30"
                  tooltipPosition="bottom"
                  onDismiss={() => handleDismissHotspot("dashboard-analytics")}
                />
              )}
              <DashboardStats 
                stats={dashboardStats} 
                currencySymbol={activeCountry.symbol} 
                currencyCode={activeCountry.currency} 
                onNavigateToTab={setActiveTab}
                savingsGoalName={savingsGoalName}
                savingsGoalAmount={savingsGoalAmount}
                jobs={jobs}
              />
            </div>

            {/* Cloud Sync Backup & Goal Tracker */}
            <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
              <DriveSyncButton 
                shifts={filteredShifts} 
                stats={dashboardStats} 
                savingsGoalAmount={savingsGoalAmount} 
              />
            </div>

            {/* Main Visualizations / Analytics Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Daily / Weekly Trend Chart */}
              <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">Work Hours & Earnings Trend</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">Chronological roster shift load</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <span className="w-2.5 h-2.5 rounded bg-indigo-500"></span> Earnings
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Hours
                      </span>
                    </div>
                  </div>

                  <div className="h-64 mt-4 text-xs font-mono">
                    {dashboardChartDataTrends.length === 0 ? (
                      <div className="h-full w-full flex items-center justify-center text-slate-600">
                        No shift data within active filter settings to render trends.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboardChartDataTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                          <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "10px" }}
                            labelClassName="text-slate-100 font-bold text-xs"
                          />
                          <Bar dataKey="Hours" fill="#10b981" radius={[4, 4, 0, 0]} barSize={14} />
                          <Bar dataKey="Earnings" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={14} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              {/* Job / Employer Distribution Chart */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-lg">
                <div>
                  <h4 className="font-bold text-sm text-slate-200">Earnings Distribution by Job</h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">Contribution by job profiles</p>
                  
                  <div className="h-48 mt-4 flex items-center justify-center">
                    {dashboardChartDataJobs.length === 0 ? (
                      <span className="text-xs text-slate-600">No data available</span>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboardChartDataJobs}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {dashboardChartDataJobs.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getJobColor(entry.name)} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`$${value}`, "Earnings"]}
                            contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "10px" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className="space-y-2 mt-4">
                    {dashboardChartDataJobs.map((jobData, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getJobColor(jobData.name) }}></span>
                          <span className="font-semibold text-slate-300">{jobData.name}</span>
                        </div>
                        <div className="text-slate-400 font-mono">
                          ${jobData.value.toFixed(2)} 
                          <span className="text-[10px] text-slate-600 ml-1.5">
                            ({((jobData.value / (dashboardStats.totalEarnings || 1)) * 100).toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Premium Intelligent Financial Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Tax withholding Estimator */}
              <div id="tour-tax-card" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative" style={{ background: "linear-gradient(135deg, #161C24 0%, #0c352a 100%)" }}>
                {isDiscoveryMode && !dismissedHotspots.includes("tax-card") && (
                  <Hotspot
                    id="tax-card"
                    tip="The Region-Aware Tax Estimator applies real-time local withholding rates dynamically based on active regions."
                    actionText="Tune Rates"
                    onActionClick={() => triggerToast("Use the rate slider below to live-test withholdings! 💸", "info")}
                    className="absolute -top-3 -right-3 z-30"
                    tooltipPosition="left"
                    onDismiss={() => handleDismissHotspot("tax-card")}
                  />
                )}
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <Percent className="w-5 h-5" />
                      <h4 className="font-bold text-sm text-slate-850">Region-Aware Tax Estimator</h4>
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 font-mono font-bold px-2 py-1 rounded border border-indigo-100 uppercase">
                      {activeCountry.currency} ({activeCountry.symbol})
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Shift workers must account for taxes. Select your region to dynamically apply official local tax codes and currency symbols.
                  </p>
                  
                  {/* Country Selector Dropdown */}
                  <div className="space-y-1.5 mb-5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 font-mono">
                      <Globe className="w-3 h-3 text-indigo-500" />
                      Select Region / Currency Context
                    </label>
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => setSelectedCountryCode(e.target.value)}
                      className="w-full bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-medium transition cursor-pointer shadow-sm"
                    >
                      {COUNTRY_TAX_DATA.map((c) => (
                        <option key={c.code} value={c.code} className="bg-white text-slate-800">
                          {c.name} ({c.currency} - {c.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Canada Province Selector Dropdown */}
                  {selectedCountryCode === "CAN" && useProgressiveTax && (
                    <div className="space-y-1.5 mb-5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                        Canadian Province / Territory Context
                      </label>
                      <select
                        value={selectedProvinceCode}
                        onChange={(e) => setSelectedProvinceCode(e.target.value)}
                        className="w-full bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-medium transition cursor-pointer shadow-sm"
                      >
                        {CANADA_PROVINCES.map((p) => (
                          <option key={p.code} value={p.code} className="bg-white text-slate-800">
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Progressive Tax Selector Mode (only if country supports progressive) */}
                  {activeCountry.isProgressive && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-5 flex flex-col sm:flex-row gap-3 justify-between items-center text-xs">
                      <span className="text-slate-600 font-medium">Tax Calculation Engine:</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setUseProgressiveTax(true)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            useProgressiveTax
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "bg-white border border-slate-200 text-slate-650 hover:bg-slate-50 hover:text-slate-800"
                          }`}
                        >
                          📈 Progressive Brackets
                        </button>
                        <button
                          type="button"
                          onClick={() => setUseProgressiveTax(false)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            !useProgressiveTax
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "bg-white border border-slate-200 text-slate-650 hover:bg-slate-50 hover:text-slate-800"
                          }`}
                        >
                          🎛️ Custom Flat
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Slider Control for Manual/Flat Tax */}
                  {(!activeCountry.isProgressive || !useProgressiveTax) && (
                    <div className="mt-4 mb-5 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-600">Manual Simulated Tax Rate:</span>
                        <span className="text-indigo-600 font-bold">{(!activeCountry.isProgressive) ? activeCountry.flatRate : taxRate}%</span>
                      </div>
                      {activeCountry.isProgressive ? (
                        <input 
                          type="range" 
                          min="0" 
                          max="50" 
                          value={taxRate} 
                          onChange={(e) => setTaxRate(Number(e.target.value))}
                          style={{ background: '#232D3B' }}
                          className="w-full accent-indigo-600 h-1.5 rounded-lg appearance-none cursor-pointer"
                        />
                      ) : (
                        <div className="text-[10px] text-slate-500 font-mono italic">
                          This region operates on a flat standard personal rate of {activeCountry.flatRate}%. Slider is locked.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Financial Metrics Summary Table */}
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 font-mono text-xs text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Gross Earnings ({activeCountry.currency}):</span>
                      <span className="text-slate-800 font-semibold">{activeCountry.symbol}{dashboardStats.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-150 pt-2.5">
                      <span className="text-slate-500 flex items-center gap-1">
                        Withholding Tax:
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.2 rounded border border-indigo-100 font-bold">
                          {taxCalculation.effectiveRate.toFixed(1)}%
                        </span>
                      </span>
                      <span className="text-rose-600 font-semibold">-{activeCountry.symbol}{taxCalculation.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                      <span className="text-slate-700 font-bold">Estimated Net Pay:</span>
                      <span className="text-emerald-600 text-sm font-black">{activeCountry.symbol}{(dashboardStats.totalEarnings - taxCalculation.totalTax).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Interactive Progressive Breakdown Section */}
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setIsTaxBreakdownOpen(!isTaxBreakdownOpen)}
                      className="w-full flex items-center justify-between text-[11px] font-semibold text-indigo-600 hover:text-indigo-500 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl border border-slate-200 transition"
                    >
                      <span className="flex items-center gap-1.5">
                        📈 {useProgressiveTax && activeCountry.isProgressive ? "View progressive bracket breakdown" : "View simple withholding breakdown"}
                      </span>
                      {isTaxBreakdownOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <AnimatePresence>
                      {isTaxBreakdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 p-4 bg-white rounded-xl border border-slate-200 space-y-3 text-left font-mono text-[11px]">
                            <div className="flex justify-between border-b border-slate-100 pb-2 text-slate-500">
                              <span>Annual Projection Gross:</span>
                              <span className="text-slate-850 font-bold">{activeCountry.symbol}{taxCalculation.annualGross.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2 text-slate-500">
                              <span>Annual Projection Tax:</span>
                              <span className="text-rose-600 font-bold">{activeCountry.symbol}{taxCalculation.annualTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>

                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider pt-1 border-b border-slate-100 pb-1">
                              Tax Brackets Applied (Scaled to Active Roster):
                            </p>
                            
                            <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                              {taxCalculation.breakdown.map((bracket, idx) => (
                                <div key={idx} className="flex justify-between text-slate-600 leading-normal">
                                  <div>
                                    <span className="text-slate-700">{bracket.range}</span> @ <span className="text-indigo-600 font-bold">{bracket.rate}%</span>
                                  </div>
                                  <div className="text-slate-700 font-semibold">
                                    {activeCountry.symbol}{bracket.taxInBracket.toFixed(2)}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Reference Link */}
                            <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-1 text-[10px]">
                              <span className="text-slate-400 italic font-sans">Official references for tax structures:</span>
                              <a
                                href={activeCountry.referenceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-500 hover:underline font-semibold"
                              >
                                <span>🔗 {activeCountry.referenceName}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>
                <div className="text-[10px] text-slate-500 mt-5 leading-normal italic text-left">
                  *Taxes are scaled dynamically using your selected pay cycle. For planning purposes only.
                </div>
              </div>

              {/* Savings Goal Progress & Roster Planning Forecast */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" style={{ background: "linear-gradient(135deg, #161C24 0%, #0c352a 100%)" }}>
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 mb-2 border-b border-emerald-50 pb-3">
                    <PiggyBank className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-sm text-slate-850">Roster Savings Goal Tracker</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed text-left">
                    Set a financial milestone. Our engine will dynamically calculate how many hours you need to work to purchase your target tech gadgets, travel plans, or investments!
                  </p>

                  {/* Inputs for customized goal */}
                  <div className="mt-4 grid grid-cols-2 gap-3 text-left">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Goal Name</label>
                      <input 
                        type="text"
                        value={savingsGoalName}
                        onChange={(e) => setSavingsGoalName(e.target.value)}
                        className="w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 rounded-xl text-xs px-3.5 py-2 outline-none text-slate-800 font-medium transition shadow-sm"
                        placeholder="e.g. New Mac Studio"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Target Amount ({activeCountry.symbol})</label>
                      <input 
                        type="number"
                        value={savingsGoalAmount || ""}
                        onChange={(e) => setSavingsGoalAmount(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 rounded-xl text-xs px-3.5 py-2 outline-none text-slate-800 font-medium transition shadow-sm font-mono"
                        placeholder="e.g. 1500"
                      />
                    </div>
                  </div>

                  {/* Goal progress indicator */}
                  {savingsGoalAmount > 0 && (
                    <div className="mt-5 space-y-2 animate-fadeIn text-left">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-600">Progress to <span className="text-slate-850 font-bold">{savingsGoalName || "Goal"}</span>:</span>
                        <span className="text-emerald-600 font-bold">
                          {((dashboardStats.totalEarnings / savingsGoalAmount) * 100).toFixed(0)}%
                        </span>
                      </div>
                      
                      {/* Progress Bar Container */}
                      <div style={{ backgroundColor: '#e2e8f0' }} className="w-full rounded-full h-2.5 overflow-hidden border border-slate-200">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (dashboardStats.totalEarnings / savingsGoalAmount) * 100)}%` }}
                        ></div>
                      </div>

                      {/* Calculations */}
                      <div className="mt-4 text-xs font-mono text-slate-600 space-y-1.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                        {dashboardStats.totalEarnings >= savingsGoalAmount ? (
                          <div className="text-emerald-600 font-bold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                            🎉 Milestone Achieved! You have fully funded this goal!
                          </div>
                        ) : (
                          <>
                            <div>
                              Remaining Target: <strong className="text-slate-800">{activeCountry.symbol}{(savingsGoalAmount - dashboardStats.totalEarnings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1 font-sans">
                              👉 You need to schedule approx <strong className="text-indigo-600">{Math.ceil((savingsGoalAmount - dashboardStats.totalEarnings) / (dashboardStats.averageRate || 20))} hours</strong> more of roster shifts (about <strong className="text-indigo-600">{Math.ceil((savingsGoalAmount - dashboardStats.totalEarnings) / ((dashboardStats.averageRate || 20) * (dashboardStats.averageDuration || 7)))} shifts</strong>) at your average rate of <span className="font-bold text-slate-700">{activeCountry.symbol}{dashboardStats.averageRate.toFixed(2)}/hr</span>.
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>

            {/* Quick Filter Section & Mini Table */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
              <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                  <h4 className="font-bold text-sm text-slate-200">Recent Roster Activity</h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">Showing active dynamic filtered shifts</p>
                </div>
                <button
                  onClick={() => setActiveTab("shifts")}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  Manage Shifts Log <span className="text-sm">→</span>
                </button>
              </div>

              <div className="p-4 flex flex-wrap gap-3 bg-slate-900/40">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by notes or job..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800/80 rounded-lg text-xs pl-8 pr-3 py-1.5 outline-none focus:border-indigo-500 text-slate-300"
                  />
                </div>
                {/* Job Config selector */}
                <select
                  value={selectedJobFilter}
                  onChange={(e) => setSelectedJobFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800/80 text-slate-300 text-xs px-3 py-1.5 rounded-lg outline-none cursor-pointer focus:border-indigo-500"
                >
                  <option value="ALL">All Jobs</option>
                  {jobs.map(j => (
                    <option key={j.name} value={j.name}>{j.name}</option>
                  ))}
                </select>
                {/* Clear local cache */}
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedJobFilter("ALL");
                    setDateFilterRange({ start: "", end: "" });
                  }}
                  className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-xs font-medium transition"
                >
                  Clear Filters
                </button>
              </div>

              {/* Shift Table Widget */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs text-slate-450">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-500 font-mono">
                      <th className="px-5 py-3 font-semibold">Shift Date</th>
                      <th className="px-5 py-3 font-semibold">Job Badge</th>
                      <th className="px-5 py-3 font-semibold">Duration Hours</th>
                      <th className="px-5 py-3 font-semibold">Shift Time</th>
                      <th className="px-5 py-3 font-semibold">Rate</th>
                      <th className="px-5 py-3 font-semibold">Est. Earnings</th>
                      <th className="px-5 py-3 font-semibold">Notes / Roster Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredShifts.slice(0, 6).map((shift) => (
                      <tr key={shift.id} className="hover:bg-slate-800/30 transition">
                        <td className="px-5 py-3.5 text-slate-200 font-medium font-mono">{shift.date}</td>
                        <td className="px-5 py-3.5">
                          <span 
                            className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                            style={{ 
                              color: getJobColor(shift.job), 
                              borderColor: `${getJobColor(shift.job)}40`,
                              backgroundColor: `${getJobColor(shift.job)}10` 
                            }}
                          >
                            {shift.job.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-200 font-mono">{shift.hours} hrs</td>
                        <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">{shift.start} - {shift.end}</td>
                        <td className="px-5 py-3.5 text-slate-500 font-mono">${(shift.hourlyRate || 0).toFixed(2)}</td>
                        <td className="px-5 py-3.5 text-emerald-400 font-semibold font-mono">${(shift.earnings || 0).toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-slate-500 italic max-w-xs truncate">{shift.notes || "N/A"}</td>
                      </tr>
                    ))}

                    {filteredShifts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-600 font-mono">
                          No shifts matched your current criteria. Import shifts from Google Sheets or tap "Add Shift" to get started manually!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Shifts Management Tab Content */}
        {activeTab === "shifts" && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Table Controller Header Card */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
              <div>
                <h3 className="font-bold text-base text-slate-100">Work Shifts Log</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Manage, filter, add, edit, or delete roster logs</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Segmented View Toggle */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 mr-2">
                  <button
                    onClick={() => setViewType("list")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      viewType === "list" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    List Logs
                  </button>
                  <button
                    onClick={() => setViewType("calendar")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      viewType === "calendar" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Roster Calendar
                  </button>
                </div>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/10 transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Shift Manually
                </button>
                <button
                  onClick={handleClearAllShifts}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 hover:border-rose-900/50 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Clear Local Cache
                </button>
              </div>
            </div>

            {/* Conditionally Render List View or Calendar View */}
            {viewType === "list" ? (
              <>
                {/* Shift Search and Filters Panel */}
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800/80 flex flex-wrap gap-4 items-end shadow-lg">
                  
                  {/* Note Query */}
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1.5">Search Notes or Job</label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search by keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs pl-8 pr-3 py-2 outline-none focus:border-indigo-500 text-slate-300"
                      />
                    </div>
                  </div>

                  {/* Job Filter */}
                  <div className="w-full sm:w-auto min-w-[120px]">
                    <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1.5">Job Filter</label>
                    <select
                      value={selectedJobFilter}
                      onChange={(e) => setSelectedJobFilter(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-lg outline-none cursor-pointer focus:border-indigo-500"
                    >
                      <option value="ALL">All Jobs</option>
                      {jobs.map(j => (
                        <option key={j.name} value={j.name}>{j.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Start Date */}
                  <div className="w-full sm:w-auto">
                    <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1.5">Start Date</label>
                    <input
                      type="date"
                      value={dateFilterRange.start}
                      onChange={(e) => setDateFilterRange(prev => ({ ...prev, start: e.target.value }))}
                      className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  {/* End Date */}
                  <div className="w-full sm:w-auto">
                    <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={dateFilterRange.end}
                      onChange={(e) => setDateFilterRange(prev => ({ ...prev, end: e.target.value }))}
                      className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  {/* Reset Button */}
                  <button 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedJobFilter("ALL");
                      setDateFilterRange({ start: "", end: "" });
                    }}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-xs font-semibold transition shrink-0"
                  >
                    Reset Filters
                  </button>

                </div>

                {/* Complete Interactive Table */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800/80 overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs text-slate-400">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-800 text-slate-500 font-mono">
                          <th className="px-5 py-3.5 font-semibold">Date</th>
                          <th className="px-5 py-3.5 font-semibold">Job</th>
                          <th className="px-5 py-3.5 font-semibold">Hours Worked</th>
                          <th className="px-5 py-3.5 font-semibold">Shift Interval</th>
                          <th className="px-5 py-3.5 font-semibold">Hourly Rate</th>
                          <th className="px-5 py-3.5 font-semibold">Est. Earnings</th>
                          <th className="px-5 py-3.5 font-semibold">Notes / Roster Detail</th>
                          <th className="px-5 py-3.5 font-semibold text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredShifts.map((shift) => (
                          <tr key={shift.id} className="hover:bg-slate-800/30 transition">
                            <td className="px-5 py-4 text-slate-100 font-semibold font-mono">{shift.date}</td>
                            <td className="px-5 py-4">
                              <span 
                                className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                                style={{ 
                                  color: getJobColor(shift.job), 
                                  borderColor: `${getJobColor(shift.job)}40`,
                                  backgroundColor: `${getJobColor(shift.job)}10` 
                                }}
                              >
                                {shift.job.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-slate-100 font-semibold font-mono">{shift.hours} hrs</td>
                            <td className="px-5 py-4 text-slate-300 font-mono text-[11px]">{shift.start} - {shift.end}</td>
                            <td className="px-5 py-4 text-slate-500 font-mono">${(shift.hourlyRate || 15).toFixed(2)}/hr</td>
                            <td className="px-5 py-4 text-emerald-400 font-bold font-mono">${(shift.earnings || 0).toLocaleString()}</td>
                            <td className="px-5 py-4 text-slate-400 italic max-w-xs truncate">{shift.notes || "—"}</td>
                            <td className="px-5 py-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => startEditing(shift)}
                                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                                  title="Edit Shift"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteShift(shift.id)}
                                  className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded transition"
                                  title="Delete Shift"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {filteredShifts.length === 0 && (
                          <tr>
                            <td colSpan={8} className="text-center py-12 text-slate-650 font-mono">
                              No roster logs matched your query. Sync with your Google Sheet or add manual logs!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div id="tour-calendar" className="relative">
                {isDiscoveryMode && !dismissedHotspots.includes("calendar") && (
                  <Hotspot
                    id="calendar"
                    tip="The interactive calendar showcases daily rosters, scheduled shifts, and earnings forecasts clearly."
                    actionText="Add Shift"
                    onActionClick={() => triggerToast("Click any cell in the calendar to log a shift! 📅", "info")}
                    className="absolute top-2 right-4 z-30"
                    tooltipPosition="left"
                    onDismiss={() => handleDismissHotspot("calendar")}
                  />
                )}
                <RosterCalendar
                  currentCalendarDate={currentCalendarDate}
                  calendarDays={calendarDays}
                  shiftsByDate={shiftsByDate}
                  getJobColor={getJobColor}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                  onReset={() => setCurrentCalendarDate(new Date(2026, 5))}
                  onCellClick={handleCalendarDayClick}
                  onBadgeClick={startEditing}
                />
              </div>
            )}
          </div>
        )}

        {/* Settings Tab Content */}
        {activeTab === "settings" && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Job configuration rate manager */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Rate configuration list */}
              <div id="tour-settings-jobs" className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg relative">
                {isDiscoveryMode && !dismissedHotspots.includes("settings-jobs") && (
                  <Hotspot
                    id="settings-jobs"
                    tip="The Job Configuration Workspace lets you customize wages, assign color-coded labels, and test multi-role compliance."
                    actionText="Configure"
                    onActionClick={() => triggerToast("Use the controls below to edit active jobs! 🛠️", "info")}
                    className="absolute -top-3 -right-3 z-30"
                    tooltipPosition="left"
                    onDismiss={() => handleDismissHotspot("settings-jobs")}
                  />
                )}
                <h3 className="font-bold text-sm text-slate-200 mb-1">Job Configuration Workspace</h3>
                <p className="text-xs text-slate-500 font-mono mb-4">Set hourly wages and custom themes</p>

                <div className="space-y-4">
                  {jobs.map(j => (
                    <div key={j.name} className="p-4 bg-slate-950 rounded-xl border border-slate-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: j.color }}></span>
                        <div>
                          <p className="font-bold text-xs text-slate-200">{j.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">Estimated Wage Config</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                          <span className="text-xs text-slate-500 font-mono mr-1">$</span>
                          <input
                            type="number"
                            step="0.1"
                            value={j.hourlyRate}
                            onChange={(e) => handleUpdateJobRate(j.name, parseFloat(e.target.value))}
                            className="bg-transparent text-xs text-slate-200 font-semibold font-mono w-16 focus:outline-none"
                          />
                        </div>
                        
                        <button
                          onClick={() => handleDeleteJob(j.name)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition"
                          title="Delete Job Color & Rate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add job config */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
                <h3 className="font-bold text-sm text-slate-200 mb-1">Add Job Category</h3>
                <p className="text-xs text-slate-500 font-mono mb-4">Introduce custom shift codes</p>

                <form onSubmit={handleAddJob} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1.5">Job Name / Shift Code</label>
                    <input
                      type="text"
                      placeholder="e.g. SUBWAY, STG, Uber"
                      value={newJobName}
                      onChange={(e) => setNewJobName(e.target.value)}
                      className="w-full bg-slate-950 text-xs text-slate-300 px-3 py-2 rounded-xl border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1.5">Hourly Wage ($)</label>
                      <input
                        type="number"
                        step="0.05"
                        value={newJobRate}
                        onChange={(e) => setNewJobRate(parseFloat(e.target.value))}
                        className="w-full bg-slate-950 text-xs text-slate-300 px-3 py-2 rounded-xl border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1.5">Visual Badge Accent</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newJobColor}
                          onChange={(e) => setNewJobColor(e.target.value)}
                          className="w-10 h-8 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer p-0.5"
                        />
                        <span className="text-xs text-slate-400 font-mono uppercase">{newJobColor}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-semibold shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Save Job Config
                  </button>
                </form>
              </div>

            </div>

            {/* End of Settings */}
          </div>
        )}

        {/* HR Executive Tab Content */}
        {activeTab === "hr" && (
          <HrExecutivePortal 
            userEmail={userEmail} 
            onLoginAsOwner={() => handleProfileLogin("shanukanishankodithuwakku@gmail.com", "load")} 
          />
        )}

        {/* Support Portal & FAQs Tab Content */}
        {activeTab === "support" && (
          <SupportPortal 
            userEmail={userEmail} 
            triggerToast={triggerToast} 
          />
        )}

      </main>

      </div> {/* closes Main Content Pane */}

      {/* Manual Add / Edit Modal Overlay */}
      {(isAddModalOpen || editingShift) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-slate-950/50 animate-scaleUp">
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                <Calendar className="w-4.5 h-4.5 text-indigo-400" />
                {editingShift ? "Edit Shift Record" : "Add Shift Manually"}
              </h3>
              <button 
                onClick={() => {
                  setIsAddModalOpen(false);
                  handleCloseEdit();
                }} 
                className="text-slate-500 hover:text-slate-300 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingShift ? handleUpdateShift : handleAddShift} className="space-y-4 text-xs">
              
              {/* Date */}
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1.5">Shift Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition font-mono"
                  required
                />
              </div>

              {/* Job selection */}
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1.5">Job Category</label>
                <select
                  value={formJob}
                  onChange={(e) => setFormJob(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer transition"
                >
                  {jobs.map(j => (
                    <option key={j.name} value={j.name}>{j.name}</option>
                  ))}
                </select>
              </div>

              {/* Start & End times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1.5">Start Time (HH:MM)</label>
                  <input
                    type="time"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1.5">End Time (HH:MM)</label>
                  <input
                    type="time"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition font-mono"
                    required
                  />
                </div>
              </div>

              {/* Override Hours */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] text-slate-500 uppercase font-mono">Total Hours Worked</label>
                  <span className="text-[10px] text-slate-650 font-mono italic">Leave empty to auto-calculate</span>
                </div>
                <input
                  type="number"
                  step="0.05"
                  placeholder="Calculated duration fallback"
                  value={formHours}
                  onChange={(e) => setFormHours(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition font-mono"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1.5">Shift Notes / Description</label>
                <textarea
                  placeholder="e.g. Emerald Princess dock support"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition min-h-[60px]"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    handleCloseEdit();
                  }}
                  className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-850 text-slate-400 rounded-xl font-semibold transition border border-slate-800/80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-md shadow-indigo-600/10 transition"
                >
                  {editingShift ? "Apply Changes" : "Save Shift"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl shadow-slate-950/50 animate-scaleUp">
            <div className="flex items-center gap-3 mb-4 text-rose-400">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="font-bold text-sm text-slate-100">Confirm Shift Deletion</h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Are you sure you want to delete this shift? This action cannot be undone on your local log.
            </p>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 bg-slate-950 hover:bg-slate-850 text-slate-400 rounded-xl font-semibold transition border border-slate-800/80 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteShift}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold shadow-md shadow-rose-600/10 transition text-xs"
              >
                Delete Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {clearAllConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-slate-950/50 animate-scaleUp">
            <div className="flex items-center gap-3 mb-4 text-rose-400">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <AlertCircle className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="font-bold text-sm text-slate-100">Clear Local Cache</h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              <strong className="text-rose-400 block mb-1">CRITICAL ACTIONS REQUIRED</strong>
              This will remove all shifts locally. It will <span className="underline">NOT</span> delete shifts on your connected Google Sheet.
            </p>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setClearAllConfirm(false)}
                className="flex-1 py-2 bg-slate-950 hover:bg-slate-850 text-slate-400 rounded-xl font-semibold transition border border-slate-800/80 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmClearAllShifts}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold shadow-md shadow-rose-600/10 transition text-xs"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom PIN Entry Modal for Developer Workspace Unlock */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl shadow-slate-950/60 animate-scaleUp">
            <div className="flex items-center gap-3 mb-3 text-indigo-400">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <Sliders className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">Unlock Workspace</h3>
                <p className="text-[10px] text-slate-400">Restricted for Shanuka's private sync</p>
              </div>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Enter your security PIN or developer password to link the default spreadsheet safely:
              </p>

              <div>
                <input
                  type="password"
                  placeholder="Enter Security PIN"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-2.5 rounded-xl text-center font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition tracking-widest placeholder:tracking-normal placeholder:text-slate-600"
                  autoFocus
                  required
                />
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setPinInput("");
                  }}
                  className="flex-1 py-2 bg-slate-950 hover:bg-slate-850 text-slate-400 rounded-xl font-semibold transition border border-slate-800/80 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-md shadow-indigo-600/20 transition text-xs"
                >
                  Confirm PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Co-Pilot Slide-out Console Panel */}
      <AnimatePresence>
        {isAiCoPilotOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAiCoPilotOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
            />

            {/* Slide-out Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col justify-between text-left"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <Bot className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                      WorkDash AI Co-Pilot
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-300 font-semibold px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                        ONLINE
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono">Interactive Navigation System</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAiCoPilotOpen(false)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Conversation History */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-900/50 custom-scrollbar">
                {aiMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.sender === "ai" && (
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                        <Bot className="w-4 h-4 text-indigo-400" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                        msg.sender === "user"
                          ? "bg-indigo-600 text-white rounded-tr-none font-medium"
                          : "bg-slate-950 border border-slate-850/80 text-slate-300 rounded-tl-none"
                      }`}
                    >
                      {/* Simple Markdown Render Support (Bold, lists, links) */}
                      <p className="whitespace-pre-line">
                        {msg.text.split("\n").map((line, lIdx) => {
                          let rendered = line;
                          // Simple bold parsing **bold**
                          if (rendered.includes("**")) {
                            const parts = rendered.split("**");
                            return (
                              <span key={lIdx} className="block mt-1">
                                {parts.map((p, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="text-white font-extrabold">{p}</strong> : p)}
                              </span>
                            );
                          }
                          return <span key={lIdx} className="block">{rendered}</span>;
                        })}
                      </p>
                      <span className="block text-[9px] text-slate-500 mt-2 text-right font-mono">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Suggested Guidance Actions */}
              <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-850 flex flex-col gap-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Interactive Actions</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleAiCommand("Show dashboard metrics")}
                    className="text-[10px] bg-slate-900 hover:bg-slate-850 text-indigo-300 hover:text-white border border-slate-800 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 font-semibold"
                  >
                    📊 Tour Dashboard
                  </button>
                  <button
                    onClick={() => handleAiCommand("Show calendar and shift planner")}
                    className="text-[10px] bg-slate-900 hover:bg-slate-850 text-indigo-300 hover:text-white border border-slate-800 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 font-semibold"
                  >
                    📅 View Calendar
                  </button>
                  <button
                    onClick={() => handleAiCommand("Guide me how to add a shift")}
                    className="text-[10px] bg-slate-900 hover:bg-slate-850 text-indigo-300 hover:text-white border border-slate-800 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 font-semibold"
                  >
                    ➕ Manual Shift Entry
                  </button>
                  <button
                    onClick={() => handleAiCommand("Sync Google Sheets")}
                    className="text-[10px] bg-slate-900 hover:bg-slate-850 text-emerald-400 hover:text-emerald-300 border border-slate-800 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 font-semibold"
                  >
                    🔄 Link Spreadsheet
                  </button>
                  <button
                    onClick={() => handleAiCommand("Configure job rates")}
                    className="text-[10px] bg-slate-900 hover:bg-slate-850 text-indigo-300 hover:text-white border border-slate-800 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 font-semibold"
                  >
                    ⚙️ Edit Hourly Rates
                  </button>
                  <button
                    onClick={() => handleAiCommand("Unlock Shanuka's private sheet")}
                    className="text-[10px] bg-slate-900 hover:bg-slate-850 text-amber-400 hover:text-amber-300 border border-slate-800 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 font-semibold"
                  >
                    🔒 Enter Security Password
                  </button>
                </div>
              </div>

              {/* Chat Input form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAiCommand(aiInput);
                }}
                className="p-4 border-t border-slate-800 bg-slate-950 flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Type a navigation command... (e.g., 'calendar')"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 text-left transition"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all flex items-center justify-center gap-1.5"
                >
                  Ask
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- STARTUP WELCOME & REGISTRATION PAGE --- */}
      <AnimatePresence>
        {isWelcomeScreenOpen && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 z-50 overflow-y-auto">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800/80 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden"
            >
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                    <Layers className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center justify-center gap-1.5">
                      WorkDash <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">PRO</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      Secure, high-tech roster parsing & automated pay computations for modern shift workers.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl space-y-2 text-left">
                  <p className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                    🔐 Connect Secure Profile First
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Connecting with your email allows you to secure your job categories, hourly rates, and synced spreadsheet settings to the cloud. You'll also immediately unlock custom tracking profiles!
                  </p>
                </div>

                {/* Email inputs */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const emailInput = form.elements.namedItem("welcomeEmail") as HTMLInputElement;
                    const email = emailInput.value.trim();
                    if (email) {
                      handleProfileLogin(email, "load");
                      setIsWelcomeScreenOpen(false);
                      // Auto start the tour since they connected!
                      setIsOnboardingOpen(true);
                      setOnboardingStep(0);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide font-mono block">
                      Roster Account Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        required
                        type="email"
                        name="welcomeEmail"
                        placeholder="e.g. name@domain.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition text-left"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-white shrink-0" />
                    Register / Connect Cloud Profile
                  </button>
                </form>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-mono font-bold uppercase">Or try it out</span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem("workdash_welcome_dismissed", "true");
                      setIsWelcomeScreenOpen(false);
                      // Start the tour
                      setIsOnboardingOpen(true);
                      setOnboardingStep(0);
                      triggerToast("Sandbox loaded! Follow the Quick Tour guide. 🚀", "info");
                    }}
                    className="w-full py-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-850 text-slate-300 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Skip & Use Local Sandbox (Try First)
                  </button>
                  <p className="text-[9px] text-slate-500 font-mono text-center">
                    You can easily connect your email later via the "Link Profile" button in the top-bar header.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- PULSING SPOTLIGHT FOR ACTIVE GUIDED TOUR --- */}
      {isOnboardingOpen && targetRect && (
        <div 
          className="fixed border-2 border-indigo-500 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.6)] pointer-events-none z-50 transition-all duration-300 animate-pulse"
          style={{
            top: `${targetRect.top - 4}px`,
            left: `${targetRect.left - 4}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`,
          }}
        />
      )}

      {/* --- STEP-BY-STEP DIALOG ONBOARDING TOUR --- */}
      <AnimatePresence>
        {isOnboardingOpen && (
          <div className="fixed inset-0 bg-slate-950/15 z-40 pointer-events-none">
            <div className="absolute inset-0 pointer-events-auto" />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.18 }}
              className={`fixed bg-white border border-slate-200 rounded-2xl shadow-2xl pointer-events-auto z-50 flex flex-col max-h-[75vh] sm:max-h-[80vh] ${
                !targetRect || onboardingStep === 0
                  ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[310px] sm:w-[350px] max-w-[calc(100vw-24px)]"
                  : "bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 w-auto sm:w-[310px] max-w-[calc(100vw-24px)]"
              }`}
            >
              <div className="p-4 sm:p-4.5 flex flex-col h-full min-h-0 space-y-3">
                {/* Header progress bar */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-wider">
                      WorkDash Tour Guide
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    Step {onboardingStep + 1} of 4
                  </span>
                </div>

                {/* Progress bar line */}
                <div style={{ backgroundColor: '#e2e8f0' }} className="w-full h-1 rounded-full overflow-hidden shrink-0">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-300"
                    style={{ width: `${((onboardingStep + 1) / 4) * 100}%` }}
                  ></div>
                </div>

                {/* SHOWCASING ALL ICONS INDICATION ROW */}
                <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-xl border border-slate-200 gap-1 shrink-0">
                  {tourIcons.map((item, idx) => {
                    const IconComponent = item.icon;
                    const isActive = onboardingStep === idx;
                    const isCompleted = onboardingStep > idx;
                    return (
                      <div 
                        key={idx} 
                        className={`flex flex-col items-center flex-1 transition-all ${
                          isActive 
                            ? "text-indigo-600 scale-105" 
                            : isCompleted 
                              ? "text-emerald-600" 
                              : "text-slate-400"
                        }`}
                        title={item.label}
                      >
                        <div className={`p-1 rounded-lg transition-colors ${
                          isActive 
                            ? "bg-indigo-50 border border-indigo-100" 
                            : isCompleted 
                              ? "bg-emerald-50 border border-emerald-100" 
                              : "bg-transparent border border-transparent"
                        }`}>
                          <IconComponent className="w-3 h-3" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Scrollable Step Contents Viewport */}
                <div className="flex-1 overflow-y-auto max-h-[140px] sm:max-h-[160px] pr-1 min-h-0 space-y-2.5 custom-scrollbar">
                  {onboardingStep === 0 && (
                    <div className="space-y-2 animate-fadeIn text-left">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-600 text-sm font-black shadow-sm">
                        👋
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                        Welcome to WorkDash Professional!
                      </h3>
                      <p className="text-[11px] text-slate-700 leading-relaxed">
                        This interactive guide will walk you through the three key segments of our modern HR roster analytics platform.
                      </p>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        We've built direct cloud-sheet integration, region-specific tax computing, and personal scheduling dashboards. Let's explore how it works!
                      </p>
                    </div>
                  )}

                  {onboardingStep === 1 && (
                    <div className="space-y-2 animate-fadeIn text-left">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-600 shadow-sm">
                        <LayoutDashboard className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                        1. The Command Center
                      </h3>
                      <p className="text-[11px] text-slate-700 leading-relaxed">
                        The core visual cockpit of your application. Calculates primary active metrics on the fly:
                      </p>
                      <ul className="text-[10px] text-slate-600 space-y-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-medium">
                        <li>• <strong>Gross Earnings</strong>: Instant roster payroll computation.</li>
                        <li>• <strong>Work Hours</strong>: Aggregated real-time role tracking.</li>
                        <li>• <strong>Savings Progress</strong>: Elegant financial goal tracking meters.</li>
                      </ul>
                    </div>
                  )}

                  {onboardingStep === 2 && (
                    <div className="space-y-2 animate-fadeIn text-left">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-150 flex items-center justify-center text-emerald-600 shadow-sm">
                        <Coins className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                        2. The Payroll Module
                      </h3>
                      <p className="text-[11px] text-slate-700 leading-relaxed">
                        Equipped with smart country-specific tax calculators:
                      </p>
                      <ul className="text-[10px] text-slate-600 space-y-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono">
                        <li>• <strong>Canada (CRA)</strong>: Auto progressive federal and provincial rates.</li>
                        <li>• <strong>USA & Australia</strong>: Adaptable flat and tiered withholdings.</li>
                      </ul>
                    </div>
                  )}

                  {onboardingStep === 3 && (
                    <div className="space-y-2 animate-fadeIn text-left">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-600 shadow-sm">
                        <CalendarDays className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                        3. The Attendance/HR Module
                      </h3>
                      <p className="text-[11px] text-slate-700 leading-relaxed">
                        A full visual roster calendar for logging and auditing shift schedules:
                      </p>
                      <ul className="text-[10px] text-slate-600 space-y-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <li>• <strong>Category Mapping</strong>: Job profiles highlighted by custom color tags.</li>
                        <li>• <strong>Instant Logs</strong>: Simply click any calendar cell to record a shift.</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
                  <button
                    onClick={() => {
                      localStorage.setItem("workdash_onboarded", "true");
                      setIsOnboardingOpen(false);
                    }}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-bold font-mono transition cursor-pointer font-semibold"
                  >
                    Skip Tour
                  </button>

                  <div className="flex gap-2">
                    {onboardingStep > 0 && (
                      <button
                        onClick={() => {
                          const prevStep = onboardingStep - 1;
                          setOnboardingStep(prevStep);
                        }}
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-750 rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        Back
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (onboardingStep < 3) {
                          const nextStep = onboardingStep + 1;
                          setOnboardingStep(nextStep);
                        } else {
                          localStorage.setItem("workdash_onboarded", "true");
                          setIsOnboardingOpen(false);
                          triggerToast("Roster workspace unlocked! Click 'Get Started' anytime to relaunch this tour. 🔓", "success");
                        }
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      {onboardingStep === 3 ? "Finish & Explore 🔓" : "Next Step"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- ACCOUNT PROFILING & SYNC MODAL --- */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-sm text-slate-200">
                      {userEmail ? "Manage Synced Profile" : "WorkDash Secure Gateway"}
                    </h3>
                  </div>
                  <button 
                    onClick={() => {
                      setIsProfileModalOpen(false);
                      setRecoverySentMessage(null);
                    }}
                    className="p-1 text-slate-400 hover:text-white rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {userEmail ? (
                  // Logged In Status Card
                  <div className="space-y-5">
                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-850 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
                        <Check className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Active Profile</p>
                        <p className="text-sm font-bold text-white mt-0.5">{userEmail}</p>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase font-mono bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/15">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        Auto-Synchronized to Cloud
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed text-center">
                      Every change you make (shifts, rates, custom jobs, and settings) is instantly backed up and synced to your secure cloud database. Access your workspace from any device!
                    </p>

                    <button
                      onClick={handleSignOut}
                      className="w-full py-2.5 bg-slate-950 hover:bg-rose-950/20 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Disconnect Profile (Sandbox Mode)
                    </button>
                  </div>
                ) : (
                  // SignUp / Login Tabbed Interface
                  <div className="space-y-5">
                    {/* Tabs */}
                    {authTab !== "recover" && (
                      <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850">
                        <button
                          onClick={() => setAuthTab("signin")}
                          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            authTab === "signin"
                              ? "bg-indigo-600 text-white shadow"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          Sign In
                        </button>
                        <button
                          onClick={() => setAuthTab("signup")}
                          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            authTab === "signup"
                              ? "bg-indigo-600 text-white shadow"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          Sign Up
                        </button>
                      </div>
                    )}

                    {authTab === "recover" ? (
                      // Password Recovery State
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const emailVal = (form.elements.namedItem("recEmail") as HTMLInputElement).value;
                          handleAuthAction(emailVal, "", "recover");
                        }}
                        className="space-y-4"
                      >
                        <h4 className="text-xs font-bold text-slate-200">Reset Your Password</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Enter your account email address below, and we will dispatch a secure link to reset your password.
                        </p>

                        {recoverySentMessage ? (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs leading-relaxed">
                            {recoverySentMessage}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide font-mono">
                              Account Email Address
                            </label>
                            <input
                              required
                              type="email"
                              name="recEmail"
                              placeholder="name@domain.com"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition text-left"
                            />
                          </div>
                        )}

                        <div className="flex flex-col gap-2 pt-2">
                          {!recoverySentMessage && (
                            <button
                              type="submit"
                              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
                            >
                              Send Recovery Link
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setAuthTab("signin");
                              setRecoverySentMessage(null);
                            }}
                            className="w-full py-2.5 bg-transparent hover:bg-slate-850 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold transition"
                          >
                            Back to Sign In
                          </button>
                        </div>
                      </form>
                    ) : (
                      // Sign In / Sign Up Form
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const emailVal = (form.elements.namedItem("authEmail") as HTMLInputElement).value;
                          const passwordVal = (form.elements.namedItem("authPassword") as HTMLInputElement).value;
                          handleAuthAction(emailVal, passwordVal, authTab);
                        }}
                        className="space-y-4 text-left"
                      >
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide font-mono">
                              Email Address
                            </label>
                            <input
                              required
                              type="email"
                              name="authEmail"
                              placeholder="name@domain.com"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition text-left"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide font-mono">
                                Password
                              </label>
                              {authTab === "signin" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAuthTab("recover");
                                    setRecoverySentMessage(null);
                                  }}
                                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold font-mono transition"
                                >
                                  Forgot Password?
                                </button>
                              )}
                            </div>
                            <input
                              required
                              type="password"
                              name="authPassword"
                              placeholder="••••••••"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition text-left"
                            />
                          </div>
                        </div>

                        {/* Remember Me checkbox toggle */}
                        <div className="flex items-center justify-between pt-1">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-800 text-emerald-500 bg-slate-950 focus:ring-emerald-500"
                            />
                            <span className="text-[11px] font-bold text-slate-400 font-sans">Remember Me</span>
                          </label>
                        </div>

                        <div className="flex flex-col gap-2.5 pt-3">
                          <button
                            type="submit"
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
                          >
                            {authTab === "signin" ? "Sign In & Sync ✓" : "Create Secure Profile ✓"}
                          </button>

                          {authTab === "signin" && (
                            <div className="space-y-2">
                              <div className="relative flex py-1.5 items-center">
                                <div className="flex-grow border-t border-slate-850"></div>
                                <span className="flex-shrink mx-3 text-[9px] text-slate-500 font-mono font-bold uppercase">No Account? Try Demo</span>
                                <div className="flex-grow border-t border-slate-850"></div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setIsDemoMode(true);
                                  setUserEmail("");
                                  setShifts(INITIAL_SHIFTS);
                                  setJobs(INITIAL_JOBS);
                                  localStorage.setItem("workdash_demo_mode", "true");
                                  localStorage.setItem("workdash_user_email", "");
                                  setIsProfileModalOpen(false);
                                  triggerToast("Sandbox free demo loaded successfully! Read-only mode activated. 🟢", "success");
                                }}
                                className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                                View Free Demo (Read-Only)
                              </button>
                            </div>
                          )}
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- GLOBAL HOST STATISTICS INSIGHTS PANEL --- */}
      <AnimatePresence>
        {isAdminStatsOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-sm text-slate-200">
                      Global User Analytics (Developer Host Board)
                    </h3>
                  </div>
                  <button 
                    onClick={() => setIsAdminStatsOpen(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* KPI stats widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-850">
                    <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Registered Profiles</p>
                    <p className="text-2xl font-sans font-black text-white mt-1">{adminStats.totalUsers}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tied to real email identities</p>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-850">
                    <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Global Roster Count</p>
                    <p className="text-2xl font-sans font-black text-emerald-400 mt-1">
                      {adminStats.users?.reduce((sum, u) => sum + (u.shiftsCount || 0), 0) || 0}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Total shifts registered in cloud</p>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-850">
                    <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Average Shifts/User</p>
                    <p className="text-2xl font-sans font-black text-indigo-400 mt-1">
                      {adminStats.totalUsers > 0 
                        ? (adminStats.users?.reduce((sum, u) => sum + (u.shiftsCount || 0), 0) / adminStats.totalUsers).toFixed(1)
                        : "0.0"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Active data density coefficient</p>
                  </div>
                </div>

                {/* Users List Table */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Registered Profile Records
                  </h4>
                  <div className="border border-slate-850 rounded-2xl overflow-hidden bg-slate-950/40 max-h-64 overflow-y-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold sticky top-0">
                        <tr>
                          <th className="p-3">User Email</th>
                          <th className="p-3">Country</th>
                          <th className="p-3 text-center">Shifts</th>
                          <th className="p-3 text-right">Proj. Earnings</th>
                          <th className="p-3 text-right">Last Active</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {adminStats.users?.length > 0 ? (
                          adminStats.users.map((u, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/30 text-slate-300">
                              <td className="p-3 font-semibold text-white max-w-[150px] truncate" title={u.email}>
                                {u.email}
                              </td>
                              <td className="p-3 text-indigo-300">{u.country || "USA"}</td>
                              <td className="p-3 text-center text-slate-400 font-bold">{u.shiftsCount}</td>
                              <td className="p-3 text-right text-emerald-400 font-bold">
                                ${Number(u.earnings || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </td>
                              <td className="p-3 text-right text-slate-500 text-[10px]">
                                {u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleDateString() : "N/A"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-slate-600">
                              No synced user profile accounts found on server.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-800 pt-4">
                  <button
                    onClick={() => setIsAdminStatsOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Close Panel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
