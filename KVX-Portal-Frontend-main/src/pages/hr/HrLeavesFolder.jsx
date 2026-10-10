import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar, CheckCircle, XCircle, AlertCircle,
  Clock, Plus, Filter, Search, ChevronDown,
  FileText, Download, X, User, Briefcase, Mail
} from "lucide-react";
import toast from "react-hot-toast";

const HrLeaves = () => {
  const [activeTab, setActiveTab] = useState("dept-leaves");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [leaveForm, setLeaveForm] = useState({
    type: "Annual",
    startDate: "",
    endDate: "",
    reason: ""
  });

  // Leave balances for the logged-in HR Manager (Jane Smith)
  const leaveBalances = {
    annual: { total: 20, used: 2, remaining: 18 },
    sick: { total: 10, used: 1, remaining: 9 },
    personal: { total: 5, used: 0, remaining: 5 }
  };

  // Leaves of all HR department members (Jane Smith ID: 2, Sarah Connor ID: 11, Michael Scott ID: 12)
  const [deptLeaves, setDeptLeaves] = useState([
    { id: 101, hrId: 2, name: "Jane Smith", avatar: "JS", position: "HR Manager", type: "Annual", startDate: "2026-04-12", endDate: "2026-04-15", days: 3, status: "approved", reason: "Family trip" },
    { id: 102, hrId: 11, name: "Sarah Connor", avatar: "SC", position: "HR Recruiter", type: "Sick", startDate: "2026-05-15", endDate: "2026-05-16", days: 1, status: "approved", reason: "Medical checkup" },
    { id: 103, hrId: 12, name: "Michael Scott", avatar: "MS", position: "HR Generalist", type: "Personal", startDate: "2026-06-02", endDate: "2026-06-04", days: 2, status: "approved", reason: "Personal work" },
    { id: 104, hrId: 2, name: "Jane Smith", avatar: "JS", position: "HR Manager", type: "Sick", startDate: "2026-06-10", endDate: "2026-06-11", days: 1, status: "approved", reason: "Cold and fever" },
    { id: 105, hrId: 12, name: "Michael Scott", avatar: "MS", position: "HR Generalist", type: "Annual", startDate: "2026-06-20", endDate: "2026-06-25", days: 5, status: "pending", reason: "Summer vacation" }
  ]);

  // Personal leaves for Jane Smith
  const [myLeaves, setMyLeaves] = useState([
    { id: 201, type: "Annual", startDate: "2026-04-12", endDate: "2026-04-15", days: 3, status: "approved", reason: "Family trip", appliedOn: "2026-04-05" },
    { id: 202, type: "Sick", startDate: "2026-06-10", endDate: "2026-06-11", days: 1, status: "approved", reason: "Cold and fever", appliedOn: "2026-06-09" }
  ]);

  const handleApplyLeave = (e) => {
    e.preventDefault();
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const start = new Date(leaveForm.startDate);
      const end = new Date(leaveForm.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const newLeave = {
        id: Date.now(),
        type: leaveForm.type,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        days: diffDays,
        status: "pending",
        reason: leaveForm.reason,
        appliedOn: new Date().toISOString().split("T")[0]
      };

      // Add to personal leaves
      setMyLeaves([newLeave, ...myLeaves]);

      // Add to department leaves (Jane Smith ID: 2)
      const newDeptLeave = {
        id: Date.now() + 1,
        hrId: 2,
        name: "Jane Smith",
        avatar: "JS",
        position: "HR Manager",
        type: leaveForm.type,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        days: diffDays,
        status: "pending",
        reason: leaveForm.reason
      };
      setDeptLeaves([newDeptLeave, ...deptLeaves]);

      setSubmitting(false);
      setShowApplyModal(false);
      setLeaveForm({ type: "Annual", startDate: "", endDate: "", reason: "" });
      toast.success("Leave application submitted successfully!");
    }, 1000);
  };

  const handleApprove = (id) => {
    setDeptLeaves(prev => prev.map(l => l.id === id ? { ...l, status: "approved" } : l));
    toast.success("Leave request approved!");
  };

  const handleReject = (id) => {
    setDeptLeaves(prev => prev.map(l => l.id === id ? { ...l, status: "rejected" } : l));
    toast.error("Leave request rejected!");
  };

  const filteredDeptLeaves = deptLeaves.filter(leave => {
    const matchesSearch = leave.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || leave.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved": return "bg-emerald-100 text-emerald-700";
      case "pending": return "bg-amber-100 text-amber-700";
      case "rejected": return "bg-rose-100 text-rose-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const stats = {
    totalLeaves: deptLeaves.length,
    approved: deptLeaves.filter(l => l.status === "approved").length,
    pending: deptLeaves.filter(l => l.status === "pending").length,
    activeToday: deptLeaves.filter(l => {
      const today = new Date().toISOString().split("T")[0];
      return l.status === "approved" && today >= l.startDate && today <= l.endDate;
    }).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR Leaves</h1>
          <p className="text-gray-500 mt-1">Track leaves taken by the HR department and manage personal requests</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all flex items-center space-x-2 text-sm font-medium shadow-md shadow-green-500/25"
        >
          <Plus className="h-4 w-4" />
          <span>Apply For Leave</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Total Dept Leaves", value: stats.totalLeaves, icon: Calendar, bg: "bg-blue-50 text-blue-600" },
          { label: "Approved Leaves", value: stats.approved, icon: CheckCircle, bg: "bg-emerald-50 text-emerald-600" },
          { label: "Pending HR Requests", value: stats.pending, icon: Clock, bg: "bg-amber-50 text-amber-600" },
          { label: "On Leave Today", value: stats.activeToday, icon: AlertCircle, bg: "bg-purple-50 text-purple-600" }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center space-x-4">
              <div className={`p-3 ${stat.bg} rounded-xl`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("dept-leaves")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "dept-leaves"
                ? "border-green-600 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            HR Department Leaves
          </button>
          <button
            onClick={() => setActiveTab("my-leaves")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "my-leaves"
                ? "border-green-600 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            My Leave Requests
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "dept-leaves" ? (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search HR leave requests by name or reason…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm transition-all"
              />
            </div>
            <div className="flex space-x-3 w-full md:w-auto justify-end">
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 bg-white text-sm transition-all"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["HR Manager", "Leave Type", "Start Date", "End Date", "Days", "Status", "Reason", "Actions"].map(h => (
                      <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredDeptLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-400">No HR leave requests found.</td>
                    </tr>
                  ) : (
                    filteredDeptLeaves.map(leave => (
                      <tr key={leave.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {leave.avatar}
                            </div>
                            <div>
                              {/* Clickable name routing to their full details profile page */}
                              <Link to={`/hr/employees/${leave.hrId}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline block">
                                {leave.name}
                              </Link>
                              <span className="text-[10px] text-gray-400 block">{leave.position}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{leave.type}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{leave.startDate}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{leave.endDate}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{leave.days} day{leave.days > 1 ? 's' : ''}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(leave.status)}`}>
                            {leave.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-650 italic truncate max-w-[150px]" title={leave.reason}>{leave.reason}</td>
                        <td className="px-6 py-4">
                          {leave.status === "pending" ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleApprove(leave.id)}
                                className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(leave.id)}
                                className="px-2.5 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Columns - Leave History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">My Leave History</h3>
              <div className="space-y-4">
                {myLeaves.map(leave => (
                  <div key={leave.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900">{leave.type} Leave</span>
                        <span className="text-xs text-gray-400">Applied on {leave.appliedOn}</span>
                      </div>
                      <p className="text-sm text-gray-500">{leave.startDate} to {leave.endDate} ({leave.days} day{leave.days > 1 ? 's' : ''})</p>
                      <p className="text-xs text-gray-650 italic">Reason: {leave.reason}</p>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(leave.status)}`}>
                        {leave.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Leave Balance */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Balance</h3>
              <div className="space-y-4">
                {[
                  { label: "Annual Leaves", rem: leaveBalances.annual.remaining, tot: leaveBalances.annual.total, color: "bg-indigo-500" },
                  { label: "Sick Leaves", rem: leaveBalances.sick.remaining, tot: leaveBalances.sick.total, color: "bg-emerald-500" },
                  { label: "Personal Leaves", rem: leaveBalances.personal.remaining, tot: leaveBalances.personal.total, color: "bg-amber-500" }
                ].map((bal, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">{bal.label}</span>
                      <span className="font-semibold text-gray-900">{bal.rem} / {bal.tot} <span className="text-gray-400 text-xs font-normal">rem.</span></span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${bal.color} transition-all`} style={{ width: `${(bal.rem / bal.tot) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-xl text-green-600"><Calendar className="h-5 w-5" /></div>
                <h2 className="text-xl font-bold text-gray-900">Apply For Leave</h2>
              </div>
              <button onClick={() => setShowApplyModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Leave Type *</label>
                <select
                  value={leaveForm.type}
                  onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 bg-white transition-all text-sm"
                  disabled={submitting}
                >
                  <option value="Annual">Annual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Personal">Personal Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date *</label>
                  <input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-sm transition-all"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date *</label>
                  <input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-sm transition-all"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason *</label>
                <textarea
                  value={leaveForm.reason}
                  onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="State the reason for your leave request…"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-sm transition-all resize-none"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting…</span>
                    </>
                  ) : (
                    <span>Submit Application</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HrLeaves;
