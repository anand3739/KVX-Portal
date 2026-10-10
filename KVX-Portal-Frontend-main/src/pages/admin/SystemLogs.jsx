import { useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Filter,
  Search,
  Calendar,
  User,
  Globe,
  Shield,
  AlertTriangle,
  Info,
  Eye,
  Trash2,
  X
} from "lucide-react";
import toast from "react-hot-toast";
import { downloadCSV } from "../../utils/downloadHelper";

const SystemLogs = () => {
  const [logLevel, setLogLevel] = useState("all");
  const [dateRange, setDateRange] = useState("today");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const [logList, setLogList] = useState([
    {
      id: 1,
      timestamp: "2026-06-09 09:45:23",
      level: "info",
      event: "User Login Successful",
      user: "admin@kravix.com",
      ip: "192.168.1.100",
      location: "New York, USA",
      device: "Chrome / Windows",
      details: "2FA authentication completed successfully. Session token generated."
    },
    {
      id: 2,
      timestamp: "2026-06-09 09:42:11",
      level: "success",
      event: "Database Backup Completed",
      user: "system",
      ip: "localhost",
      location: "System",
      device: "Cron Job",
      details: "Full database backup completed successfully. Size: 2.4 GB. Uploaded to secure S3 storage."
    },
    {
      id: 3,
      timestamp: "2026-06-08 14:38:45",
      level: "warning",
      event: "Permission Change",
      user: "hr@kravix.com",
      ip: "192.168.1.105",
      location: "London, UK",
      device: "Firefox / macOS",
      details: "Modified access rights for 3 users in Department Engineering. Added Performance Review permissions."
    },
    {
      id: 4,
      timestamp: "2026-06-08 09:35:22",
      level: "error",
      event: "Failed Login Attempt",
      user: "unknown",
      ip: "45.123.45.67",
      location: "Beijing, China",
      device: "Unknown Device",
      details: "5 failed authentication attempts detected in 2 minutes. IP blocked for 15 minutes."
    },
    {
      id: 5,
      timestamp: "2026-06-07 11:30:15",
      level: "info",
      event: "System Update",
      user: "admin",
      ip: "192.168.1.100",
      location: "New York, USA",
      device: "Chrome / Windows",
      details: "Vulnerability and security patches applied. System packages updated successfully."
    },
    {
      id: 6,
      timestamp: "2026-06-06 18:25:44",
      level: "success",
      event: "File Upload",
      user: "employee@kravix.com",
      ip: "192.168.1.110",
      location: "Singapore",
      device: "Safari / iOS",
      details: "Uploaded 5 employee contracts (12.4 MB) to HR secure document storage."
    },
    {
      id: 7,
      timestamp: "2026-06-05 10:20:33",
      level: "warning",
      event: "High CPU Usage",
      user: "system",
      ip: "localhost",
      location: "System",
      device: "Server",
      details: "Application server CPU usage peaked at 95% for 2 minutes. Re-balancing resources."
    },
    {
      id: 8,
      timestamp: "2026-06-04 15:15:22",
      level: "error",
      event: "API Timeout",
      user: "system",
      ip: "10.0.0.45",
      location: "AWS Server",
      device: "API Gateway",
      details: "External payment integration gateway timeout after 30 seconds. Operation automatically retried."
    }
  ]);

  const getLevelIcon = (level) => {
    switch(level) {
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-rose-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelBadge = (level) => {
    switch(level) {
      case 'info':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'success':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'warning':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'error':
        return 'bg-rose-100 text-rose-700 border border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const stats = {
    total: logList.length,
    info: logList.filter(l => l.level === 'info').length,
    success: logList.filter(l => l.level === 'success').length,
    warning: logList.filter(l => l.level === 'warning').length,
    error: logList.filter(l => l.level === 'error').length
  };

  const filteredLogs = logList.filter(log => {
    if (logLevel !== "all" && log.level !== logLevel) return false;
    if (searchTerm && !log.event.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !log.user.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !log.details.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    if (dateRange === "today") {
      return log.timestamp.startsWith("2026-06-09");
    } else if (dateRange === "yesterday") {
      return log.timestamp.startsWith("2026-06-08");
    } else if (dateRange === "week") {
      return log.timestamp.startsWith("2026-06-09") || log.timestamp.startsWith("2026-06-08") || log.timestamp.startsWith("2026-06-07") || log.timestamp.startsWith("2026-06-06") || log.timestamp.startsWith("2026-06-05") || log.timestamp.startsWith("2026-06-04");
    }
    return true;
  });

  const logsPerPage = 5;
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage) || 1;
  const currentPageClamped = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedLogs = filteredLogs.slice((currentPageClamped - 1) * logsPerPage, currentPageClamped * logsPerPage);

  const handleExportLogs = () => {
    if (logList.length === 0) {
      toast.error("No logs to export.");
      return;
    }
    const headers = ["Timestamp", "Level", "Event", "User", "IP Address", "Location", "Device", "Details"];
    const rows = logList.map(l => [l.timestamp, l.level, l.event, l.user, l.ip, l.location, l.device, l.details]);
    downloadCSV("system_logs.csv", headers, rows);
    toast.success("Logs exported successfully!");
  };

  const handleClearLogs = () => {
    setLogList([]);
    setShowClearConfirm(false);
    toast.success("System logs cleared successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
          <p className="text-gray-500 mt-1">Monitor system activity and security events</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportLogs}
            className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center space-x-2 bg-white shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span>Export Logs</span>
          </button>
          <button 
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2 border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 flex items-center space-x-2 bg-white shadow-sm"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Events</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-blue-100">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-blue-500" />
            <p className="text-sm text-gray-500">Info</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.info}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-emerald-100">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <p className="text-sm text-gray-500">Success</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.success}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-amber-100">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-sm text-gray-500">Warnings</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.warning}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-rose-100">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-rose-500" />
            <p className="text-sm text-gray-500">Errors</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.error}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs by event, user, details..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={logLevel}
              onChange={(e) => {
                setLogLevel(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm"
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 days</option>
            </select>
            <button 
              onClick={() => {
                setSearchTerm("");
                setLogLevel("all");
                setDateRange("all");
                setCurrentPage(1);
                toast.success("Filters reset");
              }}
              className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-center bg-white text-gray-500"
              title="Reset Filters"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{log.timestamp}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 w-fit ${getLevelBadge(log.level)}`}>
                      {getLevelIcon(log.level)}
                      <span className="ml-1 capitalize">{log.level}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{log.event}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{log.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate">
                    <span className="text-sm text-gray-600">{log.details}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4 text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No system logs found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {filteredLogs.length > 0 ? (currentPageClamped - 1) * logsPerPage + 1 : 0} to {Math.min(currentPageClamped * logsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
          </p>
          <div className="flex items-center space-x-2">
            <button 
              disabled={currentPageClamped <= 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  currentPageClamped === i + 1
                    ? "bg-blue-600 text-white font-medium"
                    : "border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              disabled={currentPageClamped >= totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Monitor */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Real-time Log Monitor</h3>
            <p className="text-sm text-slate-400">Live streaming of system events</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm text-slate-300">Live</span>
          </div>
        </div>
        <div className="space-y-2 font-mono text-sm">
          <p className="text-emerald-400">[10:32:45] ✓ Backup completed successfully</p>
          <p className="text-blue-400">[10:31:22] ℹ User admin logged in from 192.168.1.100</p>
          <p className="text-amber-400">[10:30:18] ⚠ High memory usage detected (85%)</p>
          <p className="text-rose-400">[10:29:55] ✗ Failed login attempt from 45.123.45.67</p>
          <p className="text-slate-500">...</p>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 relative text-gray-800">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getLevelBadge(selectedLog.level)}`}>
                {getLevelIcon(selectedLog.level)}
                <span className="ml-1 capitalize">{selectedLog.level}</span>
              </span>
              <span className="text-sm text-gray-500">{selectedLog.timestamp}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedLog.event}</h3>
            
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl text-sm border border-gray-100 mb-6">
              <div className="grid grid-cols-3">
                <span className="text-gray-500 font-medium">User:</span>
                <span className="text-gray-900 col-span-2">{selectedLog.user}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-gray-500 font-medium">IP Address:</span>
                <span className="text-gray-900 col-span-2">{selectedLog.ip}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-gray-500 font-medium">Location:</span>
                <span className="text-gray-900 col-span-2">{selectedLog.location}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-gray-500 font-medium">Device:</span>
                <span className="text-gray-900 col-span-2">{selectedLog.device}</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Detailed Log Message</h4>
              <p className="text-sm text-slate-100 font-mono bg-gray-900 p-4 rounded-xl whitespace-pre-wrap leading-relaxed">
                {selectedLog.details}
              </p>
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="w-full py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-xl text-sm transition-all"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* Clear Logs Confirm Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100 text-center text-gray-800">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Clear All Logs?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete all system logs? This action is permanent and cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleClearLogs}
                className="flex-1 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-xl text-sm font-medium transition-all"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemLogs;