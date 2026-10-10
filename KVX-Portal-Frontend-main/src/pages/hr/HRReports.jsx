import { useState } from "react";
import toast from "react-hot-toast";
import {
  FileText, Download, Calendar, Users, DollarSign,
  TrendingUp, BarChart3, Clock, RefreshCw, X, Eye,
  CheckCircle, AlertCircle, Filter, Search, ChevronRight,
  ArrowUpRight, PieChart
} from "lucide-react";

/* ─── Generate Report Modal ──────────────────────────────────────────────── */
const GenerateReportModal = ({ onClose, onGenerated }) => {
  const [form, setForm] = useState({ type: "attendance", period: "monthly", department: "all", format: "pdf" });
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onGenerated(form);
      toast.success(`${form.type.charAt(0).toUpperCase() + form.type.slice(1)} report generated successfully!`);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-xl"><BarChart3 className="h-5 w-5 text-green-600" /></div>
            <h2 className="text-xl font-semibold text-gray-900">Generate New Report</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="h-5 w-5 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "attendance", label: "Attendance Report", icon: Clock },
                { id: "payroll", label: "Payroll Summary", icon: DollarSign },
                { id: "recruitment", label: "Recruitment Pipeline", icon: TrendingUp },
                { id: "leave", label: "Leave Analysis", icon: Calendar },
                { id: "performance", label: "Performance Review", icon: BarChart3 },
                { id: "training", label: "Training Progress", icon: Users },
              ].map(r => {
                const Icon = r.icon;
                return (
                  <button key={r.id} onClick={() => setForm({ ...form, type: r.id })}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center space-x-2 ${form.type === r.id ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}>
                    <Icon className="h-4 w-4" /><span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Period</label>
              <select value={form.period} onChange={e => setForm({ ...form, period: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 bg-white">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
              <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 bg-white">
                <option value="all">All Departments</option>
                {["Engineering", "Marketing", "Sales", "HR", "Finance"].map(d => (
                  <option key={d} value={d.toLowerCase()}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
            <div className="flex space-x-3">
              {["pdf", "excel", "csv"].map(f => (
                <button key={f} onClick={() => setForm({ ...form, format: f })}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium uppercase transition-all ${form.format === f ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex space-x-3 pt-1">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors">Cancel</button>
            <button onClick={handleGenerate} disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium disabled:opacity-60 transition-all flex items-center justify-center space-x-2">
              {loading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                : <><BarChart3 className="h-4 w-4" /><span>Generate Report</span></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── View Report Modal ───────────────────────────────────────────────────── */
const ViewReportModal = ({ report, onClose }) => {
  if (!report) return null;
  const Icon = report.icon;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-xl"><Icon className="h-5 w-5 text-green-600" /></div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{report.name}</h2>
              <p className="text-sm text-gray-500">{report.type} · Generated {report.date}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="h-5 w-5 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-6">
          {/* Simulated Report Data */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Records", value: "1,247" },
              { label: "Coverage", value: "98.4%" },
              { label: "Period", value: report.type },
            ].map((s, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Summary Breakdown</h4>
            <div className="space-y-3">
              {["Engineering", "Marketing", "Sales", "HR", "Finance"].map((dept, i) => (
                <div key={dept} className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 w-28">{dept}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                      style={{ width: `${[92, 85, 78, 95, 88][i]}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-10">{[92, 85, 78, 95, 88][i]}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex space-x-3">
            <button onClick={() => { toast.success(`Downloading ${report.name}...`); onClose(); }}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium transition-all flex items-center justify-center space-x-2">
              <Download className="h-4 w-4" /><span>Download PDF</span>
            </button>
            <button onClick={onClose} className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Reports Page ───────────────────────────────────────────────────── */
const HRReports = () => {
  const [showGenerate, setShowGenerate] = useState(false);
  const [viewReport, setViewReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [reports, setReports] = useState([
    { id: 1, name: "Attendance Report", icon: Users, date: "Jun 12, 2026", type: "Monthly", size: "2.4 MB", status: "ready", downloads: 18 },
    { id: 2, name: "Payroll Summary", icon: DollarSign, date: "Jun 12, 2026", type: "Monthly", size: "1.8 MB", status: "ready", downloads: 24 },
    { id: 3, name: "Recruitment Pipeline", icon: TrendingUp, date: "Jun 11, 2026", type: "Weekly", size: "0.9 MB", status: "ready", downloads: 7 },
    { id: 4, name: "Leave Analysis", icon: Calendar, date: "Jun 10, 2026", type: "Monthly", size: "1.2 MB", status: "ready", downloads: 12 },
    { id: 5, name: "Performance Review", icon: BarChart3, date: "Jun 8, 2026", type: "Quarterly", size: "3.1 MB", status: "ready", downloads: 31 },
    { id: 6, name: "Training Progress", icon: Users, date: "Jun 5, 2026", type: "Monthly", size: "1.5 MB", status: "ready", downloads: 9 },
  ]);

  const [downloading, setDownloading] = useState(null);

  const handleDownload = (report) => {
    setDownloading(report.id);
    setTimeout(() => {
      setDownloading(null);
      setReports(prev => prev.map(r => r.id === report.id ? { ...r, downloads: r.downloads + 1 } : r));
      toast.success(`"${report.name}" downloaded successfully!`);
    }, 1200);
  };

  const handleGenerated = (form) => {
    const names = {
      attendance: "Attendance Report", payroll: "Payroll Summary",
      recruitment: "Recruitment Pipeline", leave: "Leave Analysis",
      performance: "Performance Review", training: "Training Progress"
    };
    const icons = {
      attendance: Users, payroll: DollarSign, recruitment: TrendingUp,
      leave: Calendar, performance: BarChart3, training: Users
    };
    const newReport = {
      id: Date.now(),
      name: names[form.type] || "Custom Report",
      icon: icons[form.type] || FileText,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      type: form.period.charAt(0).toUpperCase() + form.period.slice(1),
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      status: "ready",
      downloads: 0
    };
    setReports(prev => [newReport, ...prev]);
  };

  const filtered = reports.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDownloads = reports.reduce((acc, r) => acc + r.downloads, 0);

  return (
    <div className="space-y-6">
      {showGenerate && <GenerateReportModal onClose={() => setShowGenerate(false)} onGenerated={handleGenerated} />}
      {viewReport && <ViewReportModal report={viewReport} onClose={() => setViewReport(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Generate and download HR reports</p>
        </div>
        <button onClick={() => setShowGenerate(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all flex items-center space-x-2 font-medium shadow-md shadow-green-500/25 w-fit">
          <BarChart3 className="h-4 w-4" />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[
          { label: "Total Reports", value: reports.length, icon: FileText, color: "blue", bg: "from-blue-500 to-blue-600" },
          { label: "Ready to Download", value: reports.filter(r => r.status === 'ready').length, icon: CheckCircle, color: "emerald", bg: "from-emerald-500 to-green-600" },
          { label: "Total Downloads", value: totalDownloads, icon: Download, color: "purple", bg: "from-purple-500 to-purple-600" },
          { label: "This Month", value: reports.filter(r => r.date.includes("Jun")).length, icon: Calendar, color: "amber", bg: "from-amber-500 to-orange-500" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center space-x-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${s.bg} flex-shrink-0`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search reports..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all" />
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(report => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 group">
              <div className="flex items-start justify-between mb-5">
                <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <Icon className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex items-center space-x-1">
                  <button onClick={() => setViewReport(report)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Preview">
                    <Eye className="h-4 w-4 text-gray-500" />
                  </button>
                  <button onClick={() => handleDownload(report)}
                    className={`p-2 rounded-lg transition-all ${downloading === report.id ? 'bg-green-100' : 'hover:bg-green-50'}`}
                    title="Download" disabled={downloading === report.id}>
                    {downloading === report.id
                      ? <RefreshCw className="h-4 w-4 text-green-600 animate-spin" />
                      : <Download className="h-4 w-4 text-gray-500 hover:text-green-600 transition-colors" />}
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1">{report.name}</h3>
              <p className="text-sm text-gray-500 mb-4">Last generated: {report.date}</p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{report.type}</span>
                  <span className="text-xs text-gray-400">{report.size}</span>
                </div>
                <button onClick={() => setViewReport(report)}
                  className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                  <span>View</span><ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex items-center space-x-1.5">
                <Download className="h-3.5 w-3.5 text-gray-300" />
                <span className="text-xs text-gray-400">{report.downloads} downloads</span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">No reports found</p>
          <p className="text-sm text-gray-300 mt-1">Try a different search or generate a new report</p>
        </div>
      )}
    </div>
  );
};

export default HRReports;