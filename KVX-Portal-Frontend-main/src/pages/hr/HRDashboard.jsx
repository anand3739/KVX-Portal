import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Users,
  Briefcase,
  Clock,
  DollarSign,
  Calendar,
  UserCheck,
  UserX,
  TrendingUp,
  X,
  Plus,
  FileText,
  BarChart3,
  Download,
  ArrowUpRight,
  ChevronRight,
  Bell,
  CheckCircle,
  XCircle,
  Sparkles,
  Activity,
  Award
} from "lucide-react";

/* ─── Pro Max Post Job Modal ────────────────────────────────────────────── */
const PostJobModal = ({ onClose }) => {
  const [form, setForm] = useState({
    title: "", department: "", location: "", type: "Full-time",
    salary: "", description: ""
  });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.department) {
      toast.error("Job title and department are required");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(`Job "${form.title}" posted successfully!`);
      onClose();
    }, 1500);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${mounted ? 'bg-black/60 backdrop-blur-md opacity-100' : 'bg-transparent opacity-0'}`}>
      <div className={`bg-white dark:bg-gray-900/90 backdrop-blur-xl border border-white/50 dark:border-gray-800/50/20 rounded-3xl shadow-2xl shadow-indigo-500/20 w-full max-w-lg overflow-hidden transform transition-all duration-500 ${mounted ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
        <div className="relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600"></div>
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800/50">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl shadow-inner text-emerald-600 relative group">
                <div className="absolute inset-0 bg-emerald-400 rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <Briefcase className="h-6 w-6 relative z-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Post New Job</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Create a new opportunity</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2.5 bg-gray-100 dark:bg-gray-800/50 hover:bg-rose-100 hover:text-rose-600 rounded-xl transition-all duration-300">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2 group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5 group-focus-within:text-emerald-600 transition-colors">Job Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                  placeholder="e.g. Senior Software Engineer" required />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5 group-focus-within:text-emerald-600 transition-colors">Department *</label>
                <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 appearance-none" required>
                  <option value="">Select department</option>
                  {["Engineering", "Marketing", "Sales", "HR", "Finance", "Operations", "Product"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5 group-focus-within:text-emerald-600 transition-colors">Employment Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 appearance-none">
                  {["Full-time", "Part-time", "Contract", "Internship"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5 group-focus-within:text-emerald-600 transition-colors">Location</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                  placeholder="e.g. New York, NY or Remote" />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5 group-focus-within:text-emerald-600 transition-colors">Salary Range</label>
                <input value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                  placeholder="e.g. $80k – $120k" />
              </div>
              <div className="col-span-2 group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5 group-focus-within:text-emerald-600 transition-colors">Job Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3} className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 resize-none"
                  placeholder="Describe responsibilities, requirements…" />
              </div>
            </div>
            <div className="flex space-x-4 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-6 py-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-200 rounded-2xl font-bold transition-all duration-300">Cancel</button>
              <button type="submit" disabled={loading}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:transform-none flex items-center justify-center space-x-2 relative overflow-hidden group">
                <div className="absolute inset-0 w-full h-full bg-white dark:bg-gray-900/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                {loading ? <div className="animate-spin h-5 w-5 border-3 border-white/50 dark:border-gray-800/50 border-t-transparent rounded-full" />
                  : <><Sparkles className="h-5 w-5" /><span>Post Opportunity</span></>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ─── Pro Max Export Modal ────────────────────────────────────────────────── */
const ExportReportModal = ({ onClose }) => {
  const [type, setType] = useState("attendance");
  const [format, setFormat] = useState("pdf");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleExport = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report exported as ${format.toUpperCase()}!`);
      onClose();
    }, 1500);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${mounted ? 'bg-black/60 backdrop-blur-md opacity-100' : 'bg-transparent opacity-0'}`}>
      <div className={`bg-white dark:bg-gray-900/90 backdrop-blur-xl border border-white/50 dark:border-gray-800/50/20 rounded-3xl shadow-2xl shadow-blue-500/20 w-full max-w-md overflow-hidden transform transition-all duration-500 ${mounted ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
        <div className="relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600"></div>
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800/50">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl shadow-inner text-blue-600 relative group">
                <div className="absolute inset-0 bg-blue-400 rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <Download className="h-6 w-6 relative z-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Export Report</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-2.5 bg-gray-100 dark:bg-gray-800/50 hover:bg-rose-100 hover:text-rose-600 rounded-xl transition-all duration-300">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Report Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "attendance", label: "Attendance", icon: Clock },
                  { id: "payroll", label: "Payroll", icon: DollarSign },
                  { id: "recruitment", label: "Recruitment", icon: Briefcase },
                  { id: "leave", label: "Leave Analysis", icon: Calendar }
                ].map(r => {
                  const Icon = r.icon;
                  const isActive = type === r.id;
                  return (
                    <button key={r.id} onClick={() => setType(r.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${isActive ? "border-blue-500 bg-blue-50/50 text-blue-700 shadow-md shadow-blue-500/10 scale-105" : "border-gray-100 dark:border-gray-800 hover:border-blue-200 hover:bg-blue-50/30 text-gray-500 dark:text-gray-400"}`}>
                      <Icon className={`h-6 w-6 mb-2 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className="text-sm font-bold">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Export Format</label>
              <div className="flex space-x-3 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-2xl">
                {["pdf", "excel", "csv"].map(f => (
                  <button key={f} onClick={() => setFormat(f)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase transition-all duration-300 ${format === f ? "bg-white dark:bg-gray-900 text-indigo-600 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200 hover:bg-gray-200/50"}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex space-x-4 pt-2">
              <button onClick={onClose} className="flex-1 px-6 py-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-200 rounded-2xl font-bold transition-all duration-300">Cancel</button>
              <button onClick={handleExport} disabled={loading}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:transform-none flex items-center justify-center space-x-2 relative overflow-hidden group">
                <div className="absolute inset-0 w-full h-full bg-white dark:bg-gray-900/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                {loading ? <div className="animate-spin h-5 w-5 border-3 border-white/50 dark:border-gray-800/50 border-t-transparent rounded-full" />
                  : <><Download className="h-5 w-5" /><span>Export Now</span></>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Pro Max Main Dashboard ──────────────────────────────────────────────── */
const HRDashboard = () => {
  const navigate = useNavigate();
  const [showPostJob, setShowPostJob] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const [requestsList, setRequestsList] = useState([
    { id: 1, employee: "Emma Wilson", dept: "Engineering", type: "Annual", days: 5, status: "pending", avatar: "EW", color: "from-purple-400 to-purple-600" },
    { id: 2, employee: "Frank Miller", dept: "Marketing", type: "Sick", days: 2, status: "approved", avatar: "FM", color: "from-blue-400 to-blue-600" },
    { id: 3, employee: "Grace Lee", dept: "Sales", type: "Personal", days: 1, status: "pending", avatar: "GL", color: "from-emerald-400 to-emerald-600" },
    { id: 4, employee: "Henry Davis", dept: "Finance", type: "Annual", days: 10, status: "approved", avatar: "HD", color: "from-amber-400 to-amber-600" },
  ]);

  const attendanceData = [
    { day: 'Mon', present: 142, absent: 8, late: 5 },
    { day: 'Tue', present: 145, absent: 6, late: 4 },
    { day: 'Wed', present: 140, absent: 10, late: 7 },
    { day: 'Thu', present: 148, absent: 4, late: 3 },
    { day: 'Fri', present: 138, absent: 12, late: 6 },
  ];

  const maxPresent = Math.max(...attendanceData.map(d => d.present));

  const applicants = [
    { name: "Alice Johnson", position: "Senior Developer", status: "Interview", experience: "5 years", avatar: "AJ" },
    { name: "Bob Smith", position: "HR Associate", status: "Shortlisted", experience: "3 years", avatar: "BS" },
    { name: "Carol White", position: "Sales Manager", status: "Applied", experience: "7 years", avatar: "CW" },
    { name: "David Brown", position: "Marketing Lead", status: "Selected", experience: "6 years", avatar: "DB" },
  ];

  const statusColors = {
    Applied: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    Shortlisted: 'bg-blue-50 text-blue-600 border-blue-200',
    Interview: 'bg-purple-50 text-purple-600 border-purple-200',
    Selected: 'bg-emerald-50 text-emerald-600 border-emerald-200'
  };

  const handleLeaveAction = (id, status) => {
    setRequestsList(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    toast.success(`Leave request ${status === 'approved' ? '✅ Approved' : '❌ Rejected'}!`, {
      style: {
        borderRadius: '16px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  const statCards = [
    { title: "Open Positions", value: 23, sub: "+3 this week", icon: Briefcase, bg: "bg-gradient-to-br from-indigo-500 to-purple-600", shadow: "shadow-indigo-500/30", trend: "+12%" },
    { title: "Total Applicants", value: 187, sub: "+24 this month", icon: Users, bg: "bg-gradient-to-br from-blue-500 to-cyan-600", shadow: "shadow-blue-500/30", trend: "+18%" },
    { title: "Interviews Today", value: 8, sub: "Scheduled", icon: Calendar, bg: "bg-gradient-to-br from-amber-400 to-orange-500", shadow: "shadow-orange-500/30", trend: "Steady" },
    { title: "Offers Sent", value: 15, sub: "Pending responses", icon: Award, bg: "bg-gradient-to-br from-emerald-400 to-teal-500", shadow: "shadow-emerald-500/30", trend: "+5%" },
  ];

  return (
    <div className="space-y-8 pb-8">
      {showPostJob && <PostJobModal onClose={() => setShowPostJob(false)} />}
      {showExport && <ExportReportModal onClose={() => setShowExport(false)} />}

      {/* Hero Header */}
      <div className="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/50 dark:border-gray-800/50 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-black/50 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full blur-3xl opacity-30 -translate-y-20 translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-200 to-purple-200 rounded-full blur-3xl opacity-30 translate-y-20 -translate-x-10"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-full mb-3">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Live Dashboard</span>
            </div>
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 tracking-tight">HR Command Center</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium max-w-lg">Orchestrate recruitment, monitor attendance, and streamline payroll with real-time insights.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowExport(true)}
              className="px-5 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:bg-gray-800/50 hover:border-gray-300 hover:shadow-lg transition-all duration-300 flex items-center space-x-2 text-sm font-bold text-gray-700 dark:text-gray-200 group">
              <Download className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowPostJob(true)}
              className="px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl hover:from-black hover:to-gray-900 transition-all duration-300 flex items-center space-x-2 text-sm font-bold shadow-xl shadow-gray-900/20 hover:shadow-gray-900/40 hover:-translate-y-1 group">
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Post Job</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards - Floating Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="group relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-3xl border border-white/50 dark:border-gray-800/50 shadow-xl shadow-gray-200/40 dark:shadow-black/40 p-6 hover:-translate-y-2 transition-all duration-500">
              <div className={`absolute inset-0 ${card.bg} rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-2xl ${card.bg} shadow-lg ${card.shadow} transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full border bg-white dark:bg-gray-900 shadow-sm ${card.trend.includes('+') ? 'text-emerald-600 border-emerald-100' : 'text-amber-500 border-amber-100'}`}>
                  {card.trend.includes('+') ? <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> : <Activity className="h-3.5 w-3.5 mr-1" />}
                  {card.trend}
                </span>
              </div>
              <div>
                <h4 className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-1">{card.title}</h4>
                <div className="flex items-baseline space-x-2">
                  <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 transition-all">{card.value}</p>
                </div>
                <p className="text-xs font-medium text-gray-400 mt-2 bg-gray-50 dark:bg-gray-800/50 inline-block px-2 py-1 rounded-md">{card.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Charts & Leave */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Interactive Attendance Chart */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/50 dark:border-gray-800/50 shadow-xl shadow-gray-200/40 dark:shadow-black/40 rounded-3xl p-8 hover:shadow-2xl transition-shadow duration-500 group">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Attendance Pulse</h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Weekly workforce presence</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="flex items-center text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors">This Week</span>
              </div>
            </div>
            
            <div className="relative h-64 flex items-end justify-between gap-2 md:gap-6 pb-2">
              {/* Background grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="w-full h-px bg-gray-100 dark:bg-gray-800/80"></div>
                ))}
              </div>
              
              {attendanceData.map((d, i) => {
                const heightPercentage = (d.present / maxPresent) * 100;
                return (
                  <div key={i} className="relative z-10 flex-1 flex flex-col items-center justify-end h-full group/bar cursor-pointer">
                    {/* Tooltip */}
                    <div className="absolute -top-12 opacity-0 group-hover/bar:opacity-100 group-hover/bar:-translate-y-2 transition-all duration-300 bg-gray-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap z-20 pointer-events-none">
                      {d.present} Present
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                    
                    {/* Bar */}
                    <div className="w-full max-w-[3rem] relative flex items-end justify-center">
                      <div 
                        className="w-full rounded-2xl bg-gradient-to-t from-emerald-500 to-teal-400 group-hover/bar:from-emerald-400 group-hover/bar:to-teal-300 shadow-lg shadow-emerald-500/20 transition-all duration-700 ease-out transform group-hover/bar:scale-y-[1.02] origin-bottom"
                        style={{ height: `${heightPercentage}%`, minHeight: "20px" }} 
                      >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-transparent via-white/20 to-transparent -translate-y-full group-hover/bar:animate-[shimmer_1.5s_infinite]"></div>
                      </div>
                    </div>
                    
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-4 group-hover/bar:text-gray-900 dark:text-white transition-colors">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leave Requests - Glassmorphism List */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/50 dark:border-gray-800/50 shadow-xl shadow-gray-200/40 dark:shadow-black/40 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Action Required</h3>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Leave & Time-off Requests</p>
                </div>
              </div>
              <button onClick={() => navigate("/hr/leave")} className="text-sm text-indigo-600 font-bold hover:text-indigo-800 flex items-center space-x-1 group">
                <span>View All</span>
                <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="space-y-4">
              {requestsList.map((req, idx) => (
                <div key={req.id} 
                  className={`group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg
                  ${req.status === 'pending' ? 'bg-amber-50/30 border-amber-100 hover:border-amber-300' 
                  : req.status === 'approved' ? 'bg-emerald-50/30 border-emerald-100 hover:border-emerald-300' 
                  : 'bg-rose-50/30 border-rose-100 hover:border-rose-300'} 
                  `}
                  style={{ animationDelay: `${idx * 100}ms`, animation: 'fadeInUp 0.5s ease backwards' }}
                >
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${req.color} shadow-inner flex items-center justify-center text-white text-sm font-extrabold transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                      {req.avatar}
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-900 dark:text-white">{req.employee}</p>
                      <div className="flex items-center space-x-2 text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                        <span className="bg-white dark:bg-gray-900 px-2 py-0.5 rounded-md border shadow-sm">{req.dept}</span>
                        <span>•</span>
                        <span className="text-gray-600 dark:text-gray-300 font-semibold">{req.type}</span>
                        <span>•</span>
                        <span>{req.days} Day{req.days > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end sm:justify-start space-x-3">
                    <span className={`px-4 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider border shadow-sm
                      ${req.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' 
                      : req.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                      : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                      {req.status}
                    </span>
                    
                    {req.status === 'pending' && (
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-4 group-hover:translate-x-0">
                        <button onClick={() => handleLeaveAction(req.id, 'approved')}
                          className="p-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all duration-300 shadow-sm hover:shadow-emerald-500/40">
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleLeaveAction(req.id, 'rejected')}
                          className="p-2 bg-rose-100 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl transition-all duration-300 shadow-sm hover:shadow-rose-500/40">
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Payroll & Candidates */}
        <div className="space-y-8">
          
          {/* Pro Max Payroll Card */}
          <div className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-black rounded-3xl shadow-2xl shadow-gray-900/40 p-8 text-white overflow-hidden group">
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-blue-500/20 to-teal-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Payroll Run</h3>
                  <p className="text-gray-400 text-sm font-medium mt-1 flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" /> June 2026 Cycle
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-900/10 backdrop-blur-md rounded-2xl border border-white/50 dark:border-gray-800/50/10 shadow-inner">
                  <DollarSign className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
              
              <div className="space-y-6 mb-8">
                <div className="bg-white dark:bg-gray-900/5 border border-white/50 dark:border-gray-800/50/10 p-5 rounded-2xl backdrop-blur-sm">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Net Total</p>
                  <p className="text-4xl font-black text-white">$388,450<span className="text-xl text-gray-500 dark:text-gray-400 font-medium">.00</span></p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Gross</p>
                    <p className="text-xl font-bold text-gray-200">$485,000</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Taxes</p>
                    <p className="text-xl font-bold text-rose-400">-$97,550</p>
                  </div>
                </div>
              </div>
              
              <button onClick={() => navigate("/hr/payroll")}
                className="w-full py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl font-bold hover:bg-gray-100 dark:bg-gray-800 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 flex items-center justify-center space-x-2 group/btn">
                <BarChart3 className="h-5 w-5 text-gray-900 dark:text-white group-hover/btn:scale-110 transition-transform" />
                <span>Process Payroll</span>
              </button>
            </div>
          </div>

          {/* Candidates Pipeline */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/50 dark:border-gray-800/50 shadow-xl shadow-gray-200/40 dark:shadow-black/40 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Active Pipeline</h3>
              <button className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 rounded-xl transition-colors">
                <Users className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {applicants.map((a, i) => (
                <div key={i} className="group p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-300 hover:shadow-md bg-white dark:bg-gray-900 transition-all duration-300 cursor-pointer flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      {a.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">{a.name}</h4>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{a.position}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-extrabold rounded-lg border ${statusColors[a.status]}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate("/hr/recruitment")} className="w-full mt-6 py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold rounded-2xl hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-300">
              View Candidate Board
            </button>
          </div>
          
        </div>
      </div>
      
      {/* Global Animation Styles */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateY(100%); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default HRDashboard;