import React, { useState, useEffect, useRef } from "react";
import { 
  HelpCircle, Send, AlertCircle, MessageSquare, CheckCircle2, Clock, 
  User, Mail, Plus, Search, ChevronDown, ChevronUp, RefreshCw, Sliders, 
  ShieldCheck, AlertTriangle, ArrowRight, Check, CheckSquare, Trash, CornerDownLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    category: "Payroll & Rates",
    question: "How is my gross and net payroll calculated?",
    answer: "WorkDash Pro calculates gross earnings based on your base hourly rate and actual hours worked. In the Settings & Rates panel, you can configure special multipliers: Overtime multiplier (e.g. 1.5x after 8 hours), Saturday/Sunday weekend multipliers (e.g. 1.25x), and public holiday rates (e.g. 2.0x). If tax deductions or superannuation are enabled, net earnings are automatically updated dynamically."
  },
  {
    category: "Google Sheets Sync",
    question: "How do I sync my rosters with Google Sheets?",
    answer: "To set up automatic cloud synchronization:\n1. Open the 'Cloud Synchronization' tab from the menu.\n2. Copy the pre-configured Google Apps Script code.\n3. Create a Google Sheet, select Extensions > Apps Script, paste the code, and deploy it as a 'Web App' accessible to 'Anyone'.\n4. Copy the deployment Web App URL and paste it into WorkDash's URL configuration field. Your roster data will auto-parse in real-time."
  },
  {
    category: "Security & PINs",
    question: "How does the PIN Security work?",
    answer: "PIN Security encrypts and locks your payroll session. Under Settings, you can set a secure numeric PIN. Once active, WorkDash restricts layout visibility when inactive, requiring verification of your PIN to safeguard sensitive wage, rates, and personal shift logs."
  },
  {
    category: "Demo vs Private Workspace",
    question: "What is the difference between Demo and Private workspace?",
    answer: "WorkDash features a dual-mode workspace:\n• 'Demo Mode' loads mock global profiles (shifts, interactive charts, and currencies) to showcase systems.\n• 'Private Mode' allows you to securely manage your actual personal shifts and corporate logs.\nYou can switch modes instantly using the Switcher in the Menu Drawer."
  },
  {
    category: "HR Intelligence",
    question: "What is the HR Intelligence executive workspace?",
    answer: "The HR Intelligence section is a high-fidelity workspace reserved for corporate managers and executives. It provides advanced compliant modeling, payroll structure simulations, automated roster audit telemetry, and predictive labor forecasting."
  },
  {
    category: "Exporting Data",
    question: "Can I export my pay slip reports or shifts?",
    answer: "Yes, in the Payroll Center, there are quick tools to export your summaries as beautifully formatted print sheets, copy reports to your clipboard, or push logs directly to your Google Sheets webhook."
  }
];

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Issue {
  id: string;
  name: string;
  email: string;
  issueType: string;
  description: string;
  status: "Pending" | "In Progress" | "Resolved";
  createdAt: string;
}

interface SupportPortalProps {
  userEmail: string;
  triggerToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

export default function SupportPortal({ userEmail, triggerToast }: SupportPortalProps) {
  // FAQs
  const [faqSearch, setFaqSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Chatbot
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am your WorkDash Pro AI virtual support assistant. Ask me anything about configuring pay rates, linking Google Sheets, or logging shifts. If I cannot resolve your issue, you can lodge an official support ticket directly below!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Issue Lodgment
  const [issueName, setIssueName] = useState("");
  const [issueEmail, setIssueEmail] = useState(userEmail || "");
  const [issueType, setIssueType] = useState("Shift Logger Bug");
  const [issueDesc, setIssueDesc] = useState("");
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

  // Tickets
  const [tickets, setTickets] = useState<Issue[]>([]);
  const [isTicketsLoading, setIsTicketsLoading] = useState(false);

  // Categories
  const categories = ["All", "Payroll & Rates", "Google Sheets Sync", "Security & PINs", "Demo vs Private Workspace", "HR Intelligence"];

  useEffect(() => {
    if (userEmail) {
      setIssueEmail(userEmail);
    }
    fetchTickets();
  }, [userEmail]);

  useEffect(() => {
    // Auto-scroll chat
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isAiLoading]);

  const fetchTickets = async () => {
    if (!userEmail) return;
    setIsTicketsLoading(true);
    try {
      const res = await fetch(`/api/support/issues?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.success) {
        setTickets(data.issues || []);
      }
    } catch (err) {
      console.error("Failed to load support tickets", err);
    } finally {
      setIsTicketsLoading(false);
    }
  };

  const handleAskAI = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMessage]);
    const originalQuery = chatInput;
    setChatInput("");
    setIsAiLoading(true);

    try {
      // Map history for API
      const apiHistory = chatHistory.map(h => ({
        role: h.role,
        content: h.content
      }));

      const response = await fetch("/api/support/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: originalQuery, history: apiHistory })
      });

      const data = await response.json();
      
      setChatHistory(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.text || "I apologize, I didn't get that. Please try rephrasing your question.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.error("AI error", err);
      setChatHistory(prev => [...prev, {
        id: `ai-err-${Date.now()}`,
        role: "assistant",
        content: "I'm having trouble reaching my knowledge network. Feel free to review the offline FAQs or submit a support ticket below!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleLodgeIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueName.trim() || !issueEmail.trim() || !issueDesc.trim()) {
      triggerToast("Please fill in all the required fields.", "error");
      return;
    }

    setIsSubmittingIssue(true);
    try {
      const res = await fetch("/api/support/lodge-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: issueName,
          email: issueEmail,
          issueType,
          description: issueDesc
        })
      });

      const data = await res.json();
      if (data.success) {
        triggerToast("Support Ticket lodged successfully! 🎟️ our engineering team has been notified.", "success");
        setIssueName("");
        setIssueDesc("");
        // Reload tickets list
        fetchTickets();
      } else {
        triggerToast(data.error || "Failed to lodge issue.", "error");
      }
    } catch (err) {
      console.error("Error lodging issue:", err);
      triggerToast("Failed to lodge support ticket. Please check connection.", "error");
    } finally {
      setIsSubmittingIssue(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/support/update-issue-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ticketId, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Ticket ${ticketId} status updated to ${newStatus}! ⚡`, "success");
        fetchTickets();
      } else {
        triggerToast(data.error || "Failed to update ticket", "error");
      }
    } catch (err) {
      console.error("Error updating ticket status", err);
      triggerToast("Connection error while updating status.", "error");
    }
  };

  // Filter FAQs
  const filteredFaqs = FAQ_ITEMS.filter(faq => {
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isAdmin = userEmail.toLowerCase().trim() === "shanukanishankodithuwakku@gmail.com";

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {/* Page Title Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-wider uppercase flex items-center gap-1.5">
              Support Center & Verified FAQs
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                AI Enabled
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Get intelligent answers instantly or file support tickets directly with our core engineering team.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Chatbot on Right, FAQs on Left */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: FAQS (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-extrabold text-slate-200 text-sm tracking-wider uppercase flex items-center gap-1.5">
                  Verified Platform Knowledgebase
                </h2>
                <p className="text-[11px] text-slate-500">
                  Select a category or search below to review pre-compiled guides.
                </p>
              </div>

              {/* FAQ Search */}
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search FAQ guides..."
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 pl-9 pr-4 py-2 rounded-xl text-xs outline-none focus:border-indigo-500 transition font-mono"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Accordion FAQ List */}
            <div className="space-y-3">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div 
                      key={idx}
                      className="bg-slate-950 border border-slate-800/50 rounded-xl overflow-hidden transition-all duration-300 hover:border-slate-800"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left transition hover:bg-white/[0.01] cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-[8px] bg-indigo-500/10 text-indigo-400 font-bold px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase font-mono tracking-widest">
                            {faq.category}
                          </span>
                          <span className="text-xs font-bold text-slate-200">
                            {faq.question}
                          </span>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-slate-900"
                          >
                            <p className="p-4 text-xs text-slate-400 leading-relaxed whitespace-pre-line font-medium bg-slate-900/10">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 bg-slate-950 rounded-xl border border-dashed border-slate-800/80">
                  <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-semibold font-mono">No matched FAQ guides found.</p>
                  <p className="text-[10px] text-slate-600 mt-1">Try typing a different search term or select another category filter.</p>
                </div>
              )}
            </div>
          </div>

          {/* MY SUPPORT TICKETS / SUBMITTED ISSUES */}
          {userEmail && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-extrabold text-slate-200 text-sm tracking-wider uppercase flex items-center gap-1.5">
                    {isAdmin ? "🔧 Core Master Issues Panel" : "🎟️ My Submitted Tickets"}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {isAdmin 
                      ? "Showing all user lodged tickets. As admin, update status or track complaints."
                      : "Check active status of your filed issues and engineering ticket logs."}
                  </p>
                </div>
                <button
                  onClick={fetchTickets}
                  className="p-1.5 bg-slate-950 text-slate-400 hover:text-white rounded-lg border border-slate-800 hover:border-slate-700 transition flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTicketsLoading ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {tickets.length > 0 ? (
                <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                  {tickets.map((t) => (
                    <div 
                      key={t.id} 
                      className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 hover:border-slate-800 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] text-indigo-400 font-extrabold font-mono uppercase tracking-wider">
                            {t.id}
                          </span>
                          <span className="text-slate-600 font-mono text-[10px]">•</span>
                          <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-350 px-2 py-0.5 rounded font-bold font-mono">
                            {t.issueType}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {t.status === "Pending" && (
                            <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-black tracking-wider uppercase flex items-center gap-1 font-mono">
                              <Clock className="w-2.5 h-2.5" />
                              Pending
                            </span>
                          )}
                          {t.status === "In Progress" && (
                            <span className="text-[9px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20 font-black tracking-wider uppercase flex items-center gap-1 font-mono">
                              <Sliders className="w-2.5 h-2.5 animate-pulse" />
                              Assigned
                            </span>
                          )}
                          {t.status === "Resolved" && (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-black tracking-wider uppercase flex items-center gap-1 font-mono">
                              <CheckSquare className="w-2.5 h-2.5" />
                              Resolved
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        {isAdmin && (
                          <div className="bg-indigo-950/20 px-2.5 py-1.5 rounded-lg border border-indigo-500/10 font-mono text-[10px] text-slate-400 space-y-0.5 mb-2">
                            <p><span className="text-indigo-400 font-bold">From:</span> {t.name} ({t.email})</p>
                            <p><span className="text-indigo-400 font-bold">Date:</span> {new Date(t.createdAt).toLocaleString()}</p>
                          </div>
                        )}
                        <p className="text-slate-300 font-medium break-words leading-relaxed">
                          {t.description}
                        </p>
                      </div>

                      {/* Admin Controls */}
                      {isAdmin && (
                        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-900">
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mr-1">Admin Action:</span>
                          <button
                            onClick={() => handleUpdateTicketStatus(t.id, "In Progress")}
                            className="px-2 py-1 bg-indigo-600/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold rounded-md hover:bg-indigo-600 hover:text-white transition cursor-pointer"
                          >
                            Assign/In Progress
                          </button>
                          <button
                            onClick={() => handleUpdateTicketStatus(t.id, "Resolved")}
                            className="px-2 py-1 bg-emerald-600/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold rounded-md hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                          >
                            Mark Resolved
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-950 rounded-xl border border-dashed border-slate-800/80">
                  <AlertCircle className="w-6 h-6 text-slate-750 mx-auto mb-1.5" />
                  <p className="text-[11px] text-slate-500 font-medium font-mono">No logged support issues yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: AI CHATBOT & CONTACT LODGE FORM (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* GEMINI AI CHATBOT PANEL */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md flex flex-col h-[460px] justify-between">
            {/* AI Title */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping shrink-0" />
                  <div>
                    <h3 className="font-extrabold text-white text-xs tracking-wider uppercase flex items-center gap-1">
                      Virtual AI Co-Pilot
                    </h3>
                    <p className="text-[9px] text-slate-500 font-semibold font-mono">MODEL: GEMINI-3.5-FLASH</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setChatHistory([
                      {
                        id: "welcome",
                        role: "assistant",
                        content: "Hello! I am your WorkDash Pro AI virtual support assistant. Ask me anything about configuring pay rates, linking Google Sheets, or logging shifts. If I cannot resolve your issue, you can lodge an official support ticket directly below!",
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    ]);
                  }}
                  className="text-[9px] border border-slate-800/80 hover:border-slate-700 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white px-2 py-1 rounded transition uppercase tracking-wider font-bold cursor-pointer"
                >
                  Clear Chat
                </button>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-grow overflow-y-auto space-y-3.5 pr-1.5 scrollbar-thin text-xs mb-3">
              {chatHistory.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-2 max-w-[85%] ${
                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  {/* Avatar */}
                  <div className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-black ${
                    msg.role === "user" 
                      ? "bg-indigo-600 text-white" 
                      : "bg-slate-950 border border-slate-850 text-indigo-400"
                  }`}>
                    {msg.role === "user" ? "ME" : "AI"}
                  </div>

                  {/* Message Bubble */}
                  <div className={`space-y-1 p-3 rounded-2xl break-words leading-relaxed font-medium ${
                    msg.role === "user" 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-slate-950 border border-slate-850 text-slate-300 rounded-tl-none"
                  }`}>
                    <p>{msg.content}</p>
                    <span className="block text-[8px] text-slate-500 text-right select-none">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {/* AI Loading state */}
              {isAiLoading && (
                <div className="flex gap-2 max-w-[80%] mr-auto items-center animate-pulse">
                  <div className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                    AI
                  </div>
                  <div className="bg-slate-950 border border-slate-850 p-3 rounded-2xl rounded-tl-none text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-[10px] font-mono text-slate-500">Consulting memory...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleAskAI} className="flex gap-2 bg-slate-950 border border-slate-800/80 p-1.5 rounded-xl">
              <input
                type="text"
                placeholder="Ask support bot... (e.g. how to sync Sheets)"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isAiLoading}
                className="flex-grow bg-transparent text-slate-200 outline-none px-2 py-1.5 text-xs font-medium"
              />
              <button
                type="submit"
                disabled={isAiLoading || !chatInput.trim()}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-lg transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* LODGE A SUPPORT ISSUE CONTACT FORM */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
            <div className="mb-4">
              <h2 className="font-extrabold text-slate-200 text-sm tracking-wider uppercase flex items-center gap-1.5">
                Still Need Help? Lodge an Issue
              </h2>
              <p className="text-[11px] text-slate-500">
                Lodge an official ticket with WorkDash engineers. We will review details immediately.
              </p>
            </div>

            <form onSubmit={handleLodgeIssue} className="space-y-4 text-xs">
              {/* Full Name */}
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-650" />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={issueName}
                    onChange={(e) => setIssueName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 pl-9 pr-4 py-2 rounded-xl text-xs outline-none focus:border-indigo-500 transition"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-650" />
                  <input
                    type="email"
                    placeholder="Enter email for contact"
                    value={issueEmail}
                    onChange={(e) => setIssueEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 pl-9 pr-4 py-2 rounded-xl text-xs outline-none focus:border-indigo-500 transition font-mono"
                    required
                  />
                </div>
              </div>

              {/* Issue Type */}
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1.5">Issue Classification</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl text-xs outline-none focus:border-indigo-500 cursor-pointer transition font-mono"
                >
                  <option value="Payroll Discrepancy">Payroll Discrepancy</option>
                  <option value="Google Sheets Sync Error">Google Sheets Sync Error</option>
                  <option value="Account/PIN Login Problem">Account/PIN Login Problem</option>
                  <option value="Shift Logger Bug">Shift Logger Bug</option>
                  <option value="Other General Inquiry">Other General Inquiry</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1.5">Issue Description</label>
                <textarea
                  placeholder="Tell us exactly what went wrong or how we can assist..."
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2.5 rounded-xl text-xs outline-none focus:border-indigo-500 transition min-h-[90px] leading-relaxed"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingIssue}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-extrabold rounded-xl text-[10px] tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/20 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmittingIssue ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Lodging Support Ticket...</span>
                  </>
                ) : (
                  <>
                    <CornerDownLeft className="w-3.5 h-3.5" />
                    <span>File Ticket with Engineering</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
