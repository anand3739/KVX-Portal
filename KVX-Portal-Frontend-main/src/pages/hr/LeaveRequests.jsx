import { useState } from "react";
import toast from "react-hot-toast";
import {
  Calendar, Users, Clock, CheckCircle, XCircle,
  AlertCircle, Search, Filter, Download, User,
  FileText, MessageSquare, ThumbsUp, ThumbsDown,
  Eye, X, ChevronDown, RefreshCw, Send
} from "lucide-react";

/* ─── Leave Detail Modal ─────────────────────────────────────────────────── */
const LeaveDetailModal = ({ request, onClose, onAction }) => {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(null);

  const handleAction = (status) => {
    setLoading(status);
    setTimeout(() => {
      setLoading(null);
      onAction(request.id, status, comment);
      toast.success(`Leave request ${status === 'approved' ? '✅ Approved' : '❌ Rejected'}!`);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              {request.employee.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{request.employee}</h2>
              <p className="text-sm text-gray-500">{request.department} · {request.type}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="h-5 w-5 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Leave Type", value: request.type },
              { label: "Duration", value: `${request.days} day${request.days > 1 ? 's' : ''}` },
              { label: "From", value: new Date(request.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
              { label: "To", value: new Date(request.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
              { label: "Applied On", value: new Date(request.appliedOn).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
              { label: "Status", value: request.status.charAt(0).toUpperCase() + request.status.slice(1) },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-xs font-medium text-blue-600 mb-1">Reason</p>
            <p className="text-sm text-gray-700">{request.reason}</p>
          </div>
          {request.status === 'pending' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">HR Comment (Optional)</label>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2}
                  placeholder="Add a comment for the employee…"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 resize-none text-sm transition-all" />
              </div>
              <div className="flex space-x-3">
                <button onClick={() => handleAction('rejected')} disabled={!!loading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl hover:from-rose-600 hover:to-rose-700 font-medium disabled:opacity-60 transition-all flex items-center justify-center space-x-2">
                  {loading === 'rejected' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ThumbsDown className="h-4 w-4" />}
                  <span>Reject</span>
                </button>
                <button onClick={() => handleAction('approved')} disabled={!!loading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 font-medium disabled:opacity-60 transition-all flex items-center justify-center space-x-2">
                  {loading === 'approved' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                  <span>Approve</span>
                </button>
              </div>
            </>
          )}
          {request.status !== 'pending' && (
            <button onClick={onClose} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Page ───────────────────────────────────────────────────────────── */
const LeaveRequests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const [leaveRequests, setLeaveRequests] = useState([
    { id: 1, employee: "Emma Wilson", department: "Engineering", type: "Annual Leave", startDate: "2026-07-20", endDate: "2026-07-25", days: 5, reason: "Family vacation planned for the summer holidays", status: "pending", appliedOn: "2026-07-10" },
    { id: 2, employee: "Frank Miller", department: "Marketing", type: "Sick Leave", startDate: "2026-07-15", endDate: "2026-07-16", days: 2, reason: "Medical appointment and recovery", status: "approved", appliedOn: "2026-07-12" },
    { id: 3, employee: "Grace Lee", department: "Sales", type: "Personal Leave", startDate: "2026-07-18", endDate: "2026-07-18", days: 1, reason: "Personal matters requiring attention", status: "pending", appliedOn: "2026-07-11" },
    { id: 4, employee: "Henry Davis", department: "Finance", type: "Annual Leave", startDate: "2026-07-25", endDate: "2026-08-03", days: 8, reason: "International trip planned in advance", status: "pending", appliedOn: "2026-07-09" },
    { id: 5, employee: "Ivy Chen", department: "HR", type: "Sick Leave", startDate: "2026-07-14", endDate: "2026-07-15", days: 2, reason: "Flu recovery – doctor's advice", status: "rejected", appliedOn: "2026-07-08" },
    { id: 6, employee: "Jack Taylor", department: "Operations", type: "Annual Leave", startDate: "2026-07-22", endDate: "2026-07-26", days: 4, reason: "Family event", status: "approved", appliedOn: "2026-07-07" },
  ]);

  const leaveSummary = {
    pending: leaveRequests.filter(r => r.status === 'pending').length,
    approved: leaveRequests.filter(r => r.status === 'approved').length,
    rejected: leaveRequests.filter(r => r.status === 'rejected').length,
    total: leaveRequests.length
  };

  const leaveBalance = [
    { type: "Annual Leave", total: 20, used: 12, remaining: 8, color: "from-blue-500 to-blue-600" },
    { type: "Sick Leave", total: 10, used: 3, remaining: 7, color: "from-amber-500 to-orange-500" },
    { type: "Personal Leave", total: 5, used: 2, remaining: 3, color: "from-purple-500 to-purple-600" },
    { type: "Unpaid Leave", total: 0, used: 0, remaining: 0, color: "from-gray-400 to-gray-500" },
  ];

  const handleAction = (id, status) => {
    setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const handleInlineAction = (id, status) => {
    setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    toast.success(`Leave request ${status === 'approved' ? '✅ Approved' : '❌ Rejected'}!`);
  };

  const handleExport = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      toast.success("Leave report exported successfully!");
    }, 1200);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      case 'rejected': return 'bg-rose-100 text-rose-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Annual Leave': return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'Sick Leave': return <AlertCircle className="h-4 w-4 text-amber-600" />;
      case 'Personal Leave': return <User className="h-4 w-4 text-purple-600" />;
      default: return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredRequests = leaveRequests.filter(req =>
    (selectedTab === "all" || req.status === selectedTab) &&
    (req.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const tabs = [
    { id: "pending", label: "Pending", count: leaveSummary.pending, color: "amber" },
    { id: "approved", label: "Approved", count: leaveSummary.approved, color: "emerald" },
    { id: "rejected", label: "Rejected", count: leaveSummary.rejected, color: "rose" },
    { id: "all", label: "All Requests", count: leaveSummary.total, color: "blue" },
  ];

  return (
    <div className="space-y-6">
      {selectedRequest && (
        <LeaveDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onAction={handleAction}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Requests</h1>
          <p className="text-gray-500 mt-1">Manage and track employee time-off requests</p>
        </div>
        <button onClick={handleExport} disabled={downloading}
          className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium flex items-center space-x-2 transition-all shadow-md shadow-green-500/25 disabled:opacity-60 w-fit">
          {downloading ? <><RefreshCw className="h-4 w-4 animate-spin" /><span>Exporting…</span></>
            : <><Download className="h-4 w-4" /><span>Export Report</span></>}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pending", value: leaveSummary.pending, icon: Clock, bg: "from-amber-50 to-orange-50", iconBg: "bg-amber-100", iconColor: "text-amber-600", sub: "Requires attention" },
          { label: "Approved", value: leaveSummary.approved, icon: CheckCircle, bg: "from-emerald-50 to-green-50", iconBg: "bg-emerald-100", iconColor: "text-emerald-600", sub: "This month" },
          { label: "Rejected", value: leaveSummary.rejected, icon: XCircle, bg: "from-rose-50 to-red-50", iconBg: "bg-rose-100", iconColor: "text-rose-600", sub: "This month" },
          { label: "Total Requests", value: leaveSummary.total, icon: FileText, bg: "from-blue-50 to-indigo-50", iconBg: "bg-blue-100", iconColor: "text-blue-600", sub: "Year to date" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`bg-gradient-to-br ${s.bg} rounded-2xl p-5 border border-white shadow-sm`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{s.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${s.iconBg}`}><Icon className={`h-5 w-5 ${s.iconColor}`} /></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leave Balance */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {leaveBalance.map((item, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{item.type}</h3>
            <div className="flex items-end justify-between mb-2">
              <span className="text-2xl font-bold text-gray-900">{item.remaining}</span>
              <span className="text-xs text-gray-400">/ {item.total} days</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${item.color} rounded-full transition-all`}
                style={{ width: item.total > 0 ? `${(item.used / item.total) * 100}%` : '0%' }} />
            </div>
            <p className="text-xs text-gray-400 mt-2">{item.used} used · {item.remaining} remaining</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center space-x-2 ${selectedTab === tab.id ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              <span>{tab.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${selectedTab === tab.id ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search by employee or leave type…" value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Employee", "Leave Type", "Duration", "Days", "Reason", "Applied On", "Status", "Actions"].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRequests.map(request => (
                <tr key={request.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {request.employee.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{request.employee}</p>
                        <p className="text-xs text-gray-400">{request.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-gray-100 rounded-lg">{getTypeIcon(request.type)}</div>
                      <span className="text-sm text-gray-600">{request.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      <div>{new Date(request.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                      <div className="text-xs text-gray-400">to {new Date(request.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{request.days}d</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-[160px] truncate">{request.reason}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(request.appliedOn).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {request.status === 'pending' ? (
                      <div className="flex items-center space-x-1">
                        <button onClick={() => handleInlineAction(request.id, 'approved')}
                          className="p-1.5 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors" title="Approve">
                          <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />
                        </button>
                        <button onClick={() => handleInlineAction(request.id, 'rejected')}
                          className="p-1.5 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors" title="Reject">
                          <ThumbsDown className="h-3.5 w-3.5 text-rose-600" />
                        </button>
                        <button onClick={() => setSelectedRequest(request)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View Details">
                          <Eye className="h-3.5 w-3.5 text-gray-500" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setSelectedRequest(request)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View Details">
                        <Eye className="h-3.5 w-3.5 text-gray-500" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRequests.length === 0 && (
            <div className="text-center py-16">
              <Calendar className="h-12 w-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No leave requests found</p>
              <p className="text-sm text-gray-300 mt-1">Try adjusting the filter or search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveRequests;