import { useState, useEffect, useRef } from "react";
import {
  Users, Search, Filter, Plus, Download, UserPlus, FileText, Award, Clock,
  CheckCircle, AlertCircle, Loader, Trash2, Edit, Eye, User, TrendingUp,
  TrendingDown, Activity, Zap, Building2, MapPin, Calendar, Star, ArrowUpRight,
  ChevronDown, Briefcase, Heart, BarChart3, Target, MessageSquare, UserCheck, Bell,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { mockGetAllEmployees, mockDeleteEmployee } from "../../services/mockAuthService";
import { downloadCSV } from "../../utils/downloadHelper";
import toast from "react-hot-toast";

const DEPARTMENTS = [
  { name: "Engineering", color: "#6366f1", employees: 450, retention: 94, openPositions: 12, promotions: 8, hiring: "Active", icon: "⚙️" },
  { name: "Sales",       color: "#f59e0b", employees: 180, retention: 91, openPositions: 6,  promotions: 4, hiring: "Active", icon: "📈" },
  { name: "Marketing",   color: "#ec4899", employees: 95,  retention: 84, openPositions: 3,  promotions: 2, hiring: "Slow",   icon: "📣" },
  { name: "Finance",     color: "#10b981", employees: 38,  retention: 97, openPositions: 1,  promotions: 1, hiring: "Active", icon: "💰" },
  { name: "Operations",  color: "#ef4444", employees: 445, retention: 78, openPositions: 8,  promotions: 3, hiring: "Critical", icon: "🏭" },
  { name: "People",      color: "#8b5cf6", employees: 42,  retention: 96, openPositions: 2,  promotions: 2, hiring: "Active", icon: "🤝" },
];

const INSIGHTS = [
  { icon: Target,      title: "Hiring Target Achieved",    status: "Achieved",  statusColor: "#059669", bg: "#ecfdf5", border: "#a7f3d0", desc: "Q2 hiring target of 150 positions exceeded ahead of schedule. Engineering and Sales are leading with top talent onboarding." },
  { icon: TrendingDown,title: "Attrition Alert",           status: "Alert",     statusColor: "#e11d48", bg: "#fff1f2", border: "#fecdd3", desc: "Operations attrition up to 9.4%. Retention strategy review strongly recommended before Q3 planning." },
  { icon: UserPlus,    title: "Executive Hiring Pending",  status: "Pending",   statusColor: "#d97706", bg: "#fffbeb", border: "#fde68a", desc: "VP Sales and VP Engineering offers awaiting approval. All shortlisted candidates are ready for final rounds." },
  { icon: Heart,       title: "Employee Satisfaction",     status: "Improved",  statusColor: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe", desc: "NPS score reached 81 — up 14 points from Q1. Enterprise segment is leading satisfaction gains company-wide." },
];

const ACTIVITIES = [
  { icon: UserCheck,    color: "#4f46e5", title: "Employee Onboarding",   desc: "18 new hires onboarded across departments",        time: "2 hours ago" },
  { icon: Award,        color: "#d97706", title: "Executive Promotion",    desc: "VP of Sales promoted to Senior VP",                time: "4 hours ago" },
  { icon: AlertCircle,  color: "#e11d48", title: "Resignation Received",  desc: "3 senior engineers submitted resignations",         time: "1 day ago" },
  { icon: FileText,     color: "#059669", title: "Policy Update",          desc: "Remote work policy updated for 17 jurisdictions",  time: "1 day ago" },
  { icon: Calendar,     color: "#7c3aed", title: "Interview Scheduled",    desc: "10 executive candidates lined up for interviews",   time: "2 days ago" },
  { icon: CheckCircle,  color: "#0891b2", title: "CEO Approval",           desc: "VP Sales hiring request approved by CEO",           time: "2 days ago" },
];

const AI_INSIGHTS = [
  { title: "Hiring Trend", body: "Q2 hiring exceeds forecast by 14%. Engineering and Sales are leading the growth across all verticals." },
  { title: "Retention Alert", body: "Operations attrition at 9.4%. A retention strategy review is strongly recommended for Q3." },
  { title: "Executive Recommendation", body: "Prioritize VP Sales and VP Engineering hiring to support the planned Q3 expansion rollout." },
];

// ────────────── Mini sparkline ──────────────
const Sparkline = ({ color = "#ffffff", up = true }) => {
  const pts = up
    ? "0,28 8,24 16,26 24,20 32,22 40,16 48,18 56,12 64,10 72,6"
    : "0,8 8,10 16,14 24,12 32,18 40,16 48,22 56,24 64,28 72,30";
  return (
    <svg width="80" height="36" viewBox="0 0 80 36" fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ────────────── Department bar ──────────────
const DeptBar = ({ name, value, max, color }) => (
  <div className="flex items-center gap-3 mb-2">
    <span className="text-xs w-20 truncate text-slate-500 font-medium">{name}</span>
    <div className="flex-1 h-2 rounded-full bg-slate-100">
      <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, background: color }} />
    </div>
    <span className="text-xs font-bold w-8 text-right text-slate-700">{value}</span>
  </div>
);

// ────────────── Hiring status pill ──────────────
const HiringPill = ({ status }) => {
  const map = {
    Active:   { bg: "#d1fae5", color: "#059669" },
    Slow:     { bg: "#fef3c7", color: "#d97706" },
    Critical: { bg: "#ffe4e6", color: "#e11d48" },
  };
  const s = map[status] || map["Active"];
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
};

const HrManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hrList, setHrList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showSummary, setShowSummary] = useState(true);

  useEffect(() => { fetchHrs(); }, []);

  const fetchHrs = async () => {
    try {
      setLoading(true);
      const data = await mockGetAllEmployees();
      const hrs = (data.employees || []).filter(
        emp => emp.role === "hr" || emp.department_name === "Human Resources"
      );
      setHrList(hrs);
    } catch (error) {
      toast.error("Failed to fetch HR team");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHr = async (hrId) => {
    try {
      await mockDeleteEmployee(hrId);
      toast.success("HR record deleted");
      fetchHrs();
      setShowDeleteConfirm(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete HR record");
    }
  };

  const handleExport = () => {
    const headers = ["Employee ID", "Name", "Email", "Department", "Position", "Status", "Join Date"];
    const rows = filteredHrs.map(emp => [
      emp.employee_id || "",
      `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
      emp.email || "",
      emp.department_name || "Human Resources",
      emp.position || "",
      emp.status || "",
      emp.join_date || emp.joining_date || "",
    ]);
    downloadCSV("hr_list.csv", headers, rows);
    toast.success("Exporting HR list…");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":    return { bg: "#d1fae5", color: "#059669" };
      case "on-leave":  return { bg: "#fef3c7", color: "#d97706" };
      case "probation": return { bg: "#e0e7ff", color: "#4f46e5" };
      case "inactive":  return { bg: "#f1f5f9", color: "#475569" };
      default:          return { bg: "#f1f5f9", color: "#475569" };
    }
  };

  const statusLabel = (s) => {
    if (!s) return "Unknown";
    const map = { active: "Active", "on-leave": "On Leave", probation: "Probation", inactive: "Inactive" };
    return map[s] || s.charAt(0).toUpperCase() + s.slice(1);
  };

  const filteredHrs = hrList.filter(emp => {
    const fullName = `${emp.first_name || ""} ${emp.last_name || ""}`.toLowerCase();
    const matchSearch = !searchTerm || fullName.includes(searchTerm.toLowerCase()) ||
      (emp.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.position || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "All Statuses" || (emp.status || "") === statusFilter.toLowerCase().replace(" ", "-");
    return matchSearch && matchStatus;
  });

  const avatarGradients = [
    ["#6366f1", "#8b5cf6"], ["#06b6d4", "#0ea5e9"], ["#10b981", "#059669"],
    ["#f59e0b", "#ef4444"], ["#ec4899", "#8b5cf6"], ["#8b5cf6", "#6366f1"],
    ["#f59e0b", "#f97316"], ["#06b6d4", "#6366f1"],
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">

      {/* ═══════════════ HERO HEADER ═══════════════ */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-md"
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 35%, #1e3a5f 65%, #0f172a 100%)",
        }}>
        {/* Mesh blobs */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute w-72 h-72 rounded-full -top-20 -right-20 opacity-30"
            style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />
          <div className="absolute w-48 h-48 rounded-full bottom-0 left-24 opacity-20"
            style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />
          <div className="absolute w-32 h-32 rounded-full top-8 left-1/2 opacity-20"
            style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "rgba(99,102,241,0.25)", color: "#c7d2fe", border: "1px solid rgba(99,102,241,0.4)" }}>
                  ⚡ Executive Workforce Intelligence • Live
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">HR Management</h1>
              <p className="text-indigo-100 text-lg max-w-xl">
                Monitor workforce performance, hiring, retention, executive approvals, and organizational health across the enterprise.
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm text-indigo-200">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  HR Systems Active
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-white/10 text-white hover:bg-white/20 border border-white/20">
                <Download className="h-4 w-4" /> Export
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-white shadow-lg hover:shadow-indigo-500/30"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                <MessageSquare className="h-4 w-4" /> HR Strategy
              </button>
              <Link to="/admin/hr/add"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-white shadow-lg hover:shadow-cyan-500/30"
                style={{ background: "linear-gradient(135deg, #06b6d4, #0ea5e9)" }}>
                <UserPlus className="h-4 w-4" /> Add Member
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ BIG STAT CARDS ═══════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {/* Today's Summary floating panel */}
        {showSummary && (
          <div className="fixed bottom-24 right-6 z-40 w-72 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.25)] border border-slate-200 dark:border-slate-800 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500 animate-pulse" />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Today's Executive Summary</span>
              </div>
              <button onClick={() => setShowSummary(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-xs">✕</button>
            </div>
            <div className="space-y-2">
              {[
                { label: "Employees Joined", value: "+3 today", color: "#10b981" },
                { label: "Promotions", value: "2 pending", color: "#6366f1" },
                { label: "Resignations", value: "1 logged", color: "#f43f5e" },
                { label: "CEO HR Approvals", value: "4 waiting", color: "#f59e0b" },
                { label: "HR Health Status", value: "● Stable", color: "#10b981" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{item.label}</span>
                  <span className="text-xs font-bold" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Card 1 — Total Employees */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-sm border border-indigo-100"
          style={{ background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)" }}>
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-white/20">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/20 text-white">
              <TrendingUp className="h-3 w-3" /> +38 this month
            </span>
          </div>
          <p className="text-5xl font-black text-white mb-1">1,725</p>
          <p className="text-indigo-100 text-sm mb-4">Active workforce across all departments</p>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">Stable Workforce</span>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-indigo-100 mb-1 font-medium">
              <span>Workforce Capacity</span><span>78%</span>
            </div>
            <div className="h-1.5 rounded-full bg-indigo-900/30">
              <div className="h-full rounded-full bg-white" style={{ width: "78%" }} />
            </div>
          </div>
          <div className="absolute bottom-4 right-4 opacity-40">
            <Sparkline color="#ffffff" up={true} />
          </div>
        </div>

        {/* Card 2 — New Hires */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-sm border border-emerald-100"
          style={{ background: "linear-gradient(135deg, #059669 0%, #10b981 100%)" }}>
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-white/20">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/20 text-white">
              <TrendingUp className="h-3 w-3" /> +12% vs last month
            </span>
          </div>
          <p className="text-5xl font-black text-white mb-1">38</p>
          <p className="text-emerald-100 text-sm mb-4">New talent acquisition this quarter</p>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">Hiring Target 76%</span>
          <div className="mt-4 flex items-center gap-3">
            <div className="relative w-12 h-12">
              <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ffffff" strokeWidth="3" strokeDasharray="76 24" strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">76%</span>
            </div>
            <div className="text-xs font-medium text-emerald-100">of quarterly target reached</div>
          </div>
          <div className="absolute bottom-4 right-4 opacity-40">
            <Sparkline color="#ffffff" up={true} />
          </div>
        </div>

        {/* Card 3 — Attrition */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-sm border border-rose-100"
          style={{ background: "linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)" }}>
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-white/20">
              <TrendingDown className="h-5 w-5 text-white" />
            </div>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/20 text-white">
              <TrendingUp className="h-3 w-3" /> +1.3% vs last quarter
            </span>
          </div>
          <p className="text-5xl font-black text-white mb-1">9.4%</p>
          <p className="text-rose-100 text-sm mb-4">Employee turnover this quarter</p>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">Needs Attention</span>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-rose-100 mb-1 font-medium">
              <span>Retention Health</span><span>90.6%</span>
            </div>
            <div className="h-1.5 rounded-full bg-rose-900/30">
              <div className="h-full rounded-full bg-white" style={{ width: "90.6%" }} />
            </div>
          </div>
          <div className="absolute bottom-4 right-4 opacity-40">
            <Sparkline color="#ffffff" up={false} />
          </div>
        </div>
      </div>

      {/* ═══════════════ HR INSIGHTS STRIP ═══════════════ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-amber-500" />
          <h2 className="text-xl font-bold text-slate-800">HR Insights</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {INSIGHTS.map((ins, i) => {
            const Icon = ins.icon;
            return (
              <div key={i} className="rounded-2xl p-5 transition-all hover:shadow-md border"
                style={{ background: ins.bg, borderColor: ins.border }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-white shadow-sm border border-white/50">
                    <Icon className="h-5 w-5" style={{ color: ins.statusColor }} />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/60 backdrop-blur-sm"
                    style={{ color: ins.statusColor }}>
                    {ins.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1.5">{ins.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{ins.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════ DEPARTMENT ANALYTICS + AI INSIGHTS ═══════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department analytics 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              Workforce Analytics
            </h2>
            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All →</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department distribution */}
            <div className="rounded-xl p-5 bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Department Distribution</p>
              {DEPARTMENTS.map((d, i) => (
                <DeptBar key={i} name={d.name} value={d.employees} max={450} color={d.color} />
              ))}
            </div>
            {/* Remote vs Office */}
            <div className="rounded-xl p-5 bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Remote vs Office</p>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600 font-medium flex items-center gap-1.5">
                      <span className="text-indigo-500">🌐</span> Remote
                    </span>
                    <span className="font-bold text-slate-800">42%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200">
                    <div className="h-full rounded-full" style={{ width: "42%", background: "linear-gradient(90deg, #8b5cf6, #6366f1)" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600 font-medium flex items-center gap-1.5">
                      <span className="text-cyan-500">🏢</span> Office
                    </span>
                    <span className="font-bold text-slate-800">58%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200">
                    <div className="h-full rounded-full" style={{ width: "58%", background: "linear-gradient(90deg, #06b6d4, #0ea5e9)" }} />
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                {[
                  { label: "Avg Tenure", value: "4.2 yrs", color: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe" },
                  { label: "Gender Ratio", value: "52 / 48", color: "#db2777", bg: "#fdf2f8", border: "#fbcfe8" },
                  { label: "Avg Age", value: "34 yrs", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
                  { label: "Contract %", value: "18%", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-xl text-center border"
                    style={{ background: s.bg, borderColor: s.border }}>
                    <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: s.color }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights 1/3 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-5">
            <Zap className="h-5 w-5 text-amber-500" />
            AI Workforce Insights
          </h2>
          <div className="space-y-4">
            {AI_INSIGHTS.map((ins, i) => (
              <div key={i} className="pb-4 border-b border-slate-100 last:border-0">
                <p className="text-sm font-bold text-slate-800 mb-1">{ins.title}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{ins.body}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-indigo-500/30"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            onClick={() => toast.success("Generating HR Summary…")}>
            <FileText className="h-4 w-4" /> Generate HR Summary
          </button>
        </div>
      </div>

      {/* ═══════════════ DEPARTMENT WORKFORCE ANALYTICS ═══════════════ */}
      <div>
        <div className="flex items-center justify-between mb-4 mt-2">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-500" />
            Department Analytics
          </h2>
          <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All →</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DEPARTMENTS.map((dept, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 transition-all hover:shadow-md hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2 rounded-xl bg-slate-50 border border-slate-100">{dept.icon}</span>
                  <span className="text-base font-bold text-slate-800">{dept.name}</span>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: `${dept.color}15`, color: dept.color }}>
                  {dept.employees} emp
                </span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-500">Retention</span>
                  <span style={{ color: dept.color }}>{dept.retention}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-full rounded-full" style={{ width: `${dept.retention}%`, background: dept.color }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Open</p>
                  <p className="text-base font-bold text-slate-800">{dept.openPositions}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Promoted</p>
                  <p className="text-base font-bold text-slate-800">{dept.promotions}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-0.5">Status</p>
                  <HiringPill status={dept.hiring} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════ HR LEADERSHIP TEAM ═══════════════ */}
      <div>
        <div className="flex items-center gap-2 mb-4 mt-2">
          <User className="h-6 w-6 text-indigo-500" />
          <h2 className="text-xl font-bold text-slate-800">HR Leadership Team</h2>
        </div>

        {/* HR Summary bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
            <div>
              <p className="text-lg font-bold text-slate-800">HR Team Summary</p>
              <p className="text-sm text-slate-500 font-medium">Overview of Human Resources leadership team</p>
            </div>
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ● HR Health: Excellent
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {[
              { label: "Total HR Employees", value: filteredHrs.length || 7, color: "#4f46e5" },
              { label: "CHRO", value: 1, color: "#d97706" },
              { label: "HR Managers", value: 3, color: "#059669" },
              { label: "Recruiters", value: 2, color: "#0ea5e9" },
              { label: "HR Executives", value: 1, color: "#8b5cf6" },
              { label: "L&D Team", value: 1, color: "#ec4899" },
            ].map((s, i) => (
              <div key={i} className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs font-bold text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search HR team..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            {[
              { label: roleFilter,   options: ["All Roles","CHRO","HR Manager","Recruiter","HR Director"],  setter: setRoleFilter },
              { label: deptFilter,   options: ["All Departments","People & Culture","Talent Acquisition"],  setter: setDeptFilter },
              { label: statusFilter, options: ["All Statuses","Active","On Leave","Probation","Inactive"],  setter: setStatusFilter },
            ].map((f, i) => (
              <div key={i} className="relative">
                <select value={f.label} onChange={e => f.setter(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 rounded-xl text-sm outline-none cursor-pointer bg-white border border-slate-200 text-slate-700 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm">
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>

        {/* HR Cards */}
        {filteredHrs.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="p-4 bg-slate-50 rounded-full inline-block mb-4">
              <Users className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No HR team members found</h3>
            <p className="text-slate-500 font-medium">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredHrs.map((hr, index) => {
              const fullName = `${hr.first_name || ""} ${hr.last_name || ""}`.trim() || "N/A";
              const initials = ((hr.first_name?.[0] || "") + (hr.last_name?.[0] || "")).toUpperCase() || "U";
              const [g1, g2] = avatarGradients[index % avatarGradients.length];
              const statusStyle = getStatusColor(hr.status);
              const experience = Math.floor(Math.random() * 15) + 2;
              const locations = ["San Francisco, CA", "New York, NY", "Austin, TX", "Denver, CO", "Seattle, WA", "Boston, MA"];
              const location = locations[index % locations.length];

              return (
                <div key={hr.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-inner"
                          style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}>
                          {initials}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-800">{fullName}</h3>
                          <p className="text-sm font-semibold text-slate-500">{hr.position || "HR Specialist"}</p>
                          <p className="text-xs font-medium text-slate-400 mt-0.5 flex items-center gap-1">
                            <Briefcase className="h-3 w-3" /> {hr.employee_id || "HR-00" + (index + 1)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs mb-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <p className="text-slate-500 mb-1 font-medium flex items-center gap-1">
                          <Award className="h-3.5 w-3.5" /> Experience
                        </p>
                        <p className="text-slate-800 font-bold">{experience} years</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1 font-medium flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" /> Dept
                        </p>
                        <p className="font-bold truncate" style={{ color: g1 }}>{hr.department_name || "People"}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1 font-medium flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> Location
                        </p>
                        <p className="text-slate-800 font-bold truncate">{location}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1 font-medium flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" /> Status
                        </p>
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider"
                          style={{ background: statusStyle.bg, color: statusStyle.color }}>
                          {statusLabel(hr.status)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to={`/admin/hr/${hr.id}`}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-center transition-all bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
                        <Eye className="h-4 w-4 inline mr-1.5" /> View Profile
                      </Link>
                      <Link to={`/admin/hr/${hr.id}/edit`}
                        className="p-2.5 rounded-xl transition-all bg-amber-50 text-amber-600 hover:bg-amber-100">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button onClick={() => setShowDeleteConfirm(hr.id)}
                        className="p-2.5 rounded-xl transition-all bg-rose-50 text-rose-600 hover:bg-rose-100">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══════════════ RECENT HR ACTIVITIES ═══════════════ */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Activity className="h-6 w-6 text-indigo-500" />
          Recent HR Activities
        </h2>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ACTIVITIES.map((act, i) => {
              const Icon = act.icon;
              return (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl transition-all border border-slate-100 hover:border-slate-300 hover:shadow-sm bg-slate-50 cursor-pointer">
                  <div className="p-3 rounded-2xl flex-shrink-0 bg-white shadow-sm" style={{ color: act.color }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-bold text-slate-800">{act.title}</p>
                      <span className="text-xs font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">{act.time}</span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium truncate">{act.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Confirm Deletion</h3>
              <p className="text-slate-500 mt-2 text-sm font-medium">Are you sure you want to delete this HR record? This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all">
                Cancel
              </button>
              <button onClick={() => handleDeleteHr(showDeleteConfirm)}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 transition-all shadow-md shadow-rose-500/20">
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HrManagement;
