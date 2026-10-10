import { useState } from "react";
import {
  Activity, AlertCircle, CheckCircle, Clock, Download, Filter,
  Search, Calendar, User, Globe, Shield, Eye, X, Info
} from "lucide-react";
import toast from "react-hot-toast";
import { downloadCSV } from "../../utils/downloadHelper";

const initialLogs = [
  { id: 1, timestamp: "2024-01-15 09:45:23", action: "User Created", user: "admin@kravix.com", target: "john.doe@kravix.com", ip: "192.168.1.100", status: "success", details: "New employee account created", module: "User Management" },
  { id: 2, timestamp: "2024-01-15 09:42:11", action: "Permission Changed", user: "admin@kravix.com", target: "hr@kravix.com", ip: "192.168.1.100", status: "success", details: "Added payroll access", module: "Permissions" },
  { id: 3, timestamp: "2024-01-15 09:38:45", action: "Role Modified", user: "admin@kravix.com", target: "Developer Role", ip: "192.168.1.100", status: "success", details: "Updated permissions for Developer role", module: "Permissions" },
  { id: 4, timestamp: "2024-01-15 09:35:22", action: "Data Export", user: "hr@kravix.com", target: "Employee Data", ip: "192.168.1.105", status: "warning", details: "Exported 150 employee records", module: "Reports" },
  { id: 5, timestamp: "2024-01-15 09:30:15", action: "System Setting Changed", user: "admin@kravix.com", target: "Email Settings", ip: "192.168.1.100", status: "success", details: "Updated SMTP configuration", module: "Settings" },
  { id: 6, timestamp: "2024-01-15 09:22:08", action: "Failed Login Attempt", user: "unknown@domain.com", target: "Auth System", ip: "45.33.32.156", status: "error", details: "Multiple failed login attempts detected from suspicious IP", module: "Security" },
  { id: 7, timestamp: "2024-01-15 09:15:34", action: "Backup Completed", user: "system", target: "Database", ip: "127.0.0.1", status: "success", details: "Full database backup completed (2.4 GB)", module: "Backup" },
  { id: 8, timestamp: "2024-01-15 09:10:02", action: "API Key Generated", user: "admin@kravix.com", target: "API Access", ip: "192.168.1.100", status: "success", details: "New API key generated for Integration service", module: "API Keys" },
  { id: 9, timestamp: "2024-01-15 08:58:17", action: "Account Deactivated", user: "hr@kravix.com", target: "jessica.l@kravix.com", ip: "192.168.1.105", status: "warning", details: "Employee account deactivated after inactivity", module: "User Management" },
  { id: 10, timestamp: "2024-01-15 08:45:00", action: "File Downloaded", user: "employee@kravix.com", target: "Payslip Q4-2023", ip: "192.168.1.200", status: "success", details: "Payslip PDF downloaded by employee", module: "Documents" },
];

const PAGE_SIZE = 6;

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [page, setPage] = useState(1);

  /* ── filtering ───────────────────────────────────────────── */
  const filtered = initialLogs.filter(log => {
    const matchSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || log.status === statusFilter;
    const matchDate = !dateFilter || log.timestamp.startsWith(dateFilter);
    return matchSearch && matchStatus && matchDate;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageLogs = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ── export ──────────────────────────────────────────────── */
  const handleExport = () => {
    const headers = ["Timestamp", "Action", "User", "Target", "Status", "IP Address", "Module", "Details"];
    const rows = filtered.map(l => [l.timestamp, l.action, l.user, l.target, l.status, l.ip, l.module, l.details]);
    downloadCSV("audit_logs.csv", headers, rows);
    toast.success("Audit logs exported!");
  };

  /* ── badge helpers ───────────────────────────────────────── */
  const getStatusBadge = (status) => ({
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    error: "bg-rose-100 text-rose-700"
  }[status] || "bg-gray-100 text-gray-700");

  const getStatusIcon = (status) => {
    if (status === "success") return <CheckCircle className="h-4 w-4 text-emerald-600" />;
    if (status === "warning") return <AlertCircle className="h-4 w-4 text-amber-500" />;
    return <AlertCircle className="h-4 w-4 text-rose-600" />;
  };

  const summary = {
    total: initialLogs.length,
    success: initialLogs.filter(l => l.status === "success").length,
    warning: initialLogs.filter(l => l.status === "warning").length,
    error: initialLogs.filter(l => l.status === "error").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500 mt-1">Track all system activities and changes</p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 flex items-center space-x-2 shadow-lg shadow-emerald-500/20"
        >
          <Download className="h-4 w-4" /><span>Export Logs</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text" placeholder="Search audit logs..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
            <input
              type="date" value={dateFilter}
              onChange={e => { setDateFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              onClick={() => { setSearchTerm(""); setStatusFilter("all"); setDateFilter(""); setPage(1); }}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50" title="Clear filters">
              <Filter className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
        {(searchTerm || statusFilter !== "all" || dateFilter) && (
          <p className="text-xs text-gray-500 mt-2">Showing {filtered.length} of {initialLogs.length} logs</p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Timestamp","Action","User","Target","Status","IP Address","Details",""].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageLogs.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">No logs match your filters.</td></tr>
              ) : pageLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{log.action}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.user}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.target}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(log.status)}`}>
                      {getStatusIcon(log.status)}{log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{log.ip}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{log.details}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => setSelectedLog(log)}
                      className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600" title="View details">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages} ({filtered.length} results)
            </p>
            <div className="flex items-center space-x-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40">← Prev</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i + 1} onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded-lg text-sm ${page === i + 1 ? "bg-blue-600 text-white" : "border border-gray-200 hover:bg-gray-50"}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Actions", value: summary.total, color: "blue", icon: Activity },
          { label: "Successful", value: summary.success, color: "emerald", icon: CheckCircle },
          { label: "Warnings", value: summary.warning, color: "amber", icon: AlertCircle },
          { label: "Errors", value: summary.error, color: "rose", icon: Shield }
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className={`bg-gradient-to-br from-${color}-50 to-${color}-100 rounded-xl p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm text-${color}-600`}>{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
              </div>
              <Icon className={`h-8 w-8 text-${color}-600`} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Log Detail Modal ─────────────────────────────────── */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Log Details</h2>
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                {getStatusIcon(selectedLog.status)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedLog.status)}`}>
                  {selectedLog.status.charAt(0).toUpperCase() + selectedLog.status.slice(1)}
                </span>
              </div>
              {[
                { label: "Action", value: selectedLog.action, icon: Activity },
                { label: "Timestamp", value: selectedLog.timestamp, icon: Clock },
                { label: "Performed By", value: selectedLog.user, icon: User },
                { label: "Target", value: selectedLog.target, icon: Shield },
                { label: "IP Address", value: selectedLog.ip, icon: Globe },
                { label: "Module", value: selectedLog.module, icon: Filter },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Icon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{label}</p>
                    <p className="text-sm text-gray-900 font-mono mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 font-medium mb-1">Details</p>
                <p className="text-sm text-gray-900">{selectedLog.details}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;