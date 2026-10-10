import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Save,
  Download,
  Filter,
  Search,
  Loader
} from "lucide-react";
import { leaveService } from "../../services/leaveService";
import { mockLogin } from "../../services/mockAuthService";
import toast from "react-hot-toast";

const LeaveApplication = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("apply");
  const [leaveBalance, setLeaveBalance] = useState({
    annual: { total: 20, used: 0, remaining: 20 },
    sick: { total: 10, used: 0, remaining: 10 },
    personal: { total: 5, used: 0, remaining: 5 }
  });
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [formData, setFormData] = useState({
    leave_type: "annual",
    start_date: "",
    end_date: "",
    reason: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      const [balanceResponse, historyResponse] = await Promise.all([
        leaveService.getLeaveBalance(),
        leaveService.getMyLeaves()
      ]);
      setLeaveBalance(balanceResponse.balance || leaveBalance);
      setLeaveHistory(historyResponse.requests || []);
    } catch (error) {
      console.error("Failed to fetch leave data:", error);
      toast.error("Failed to load leave data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await leaveService.applyLeave(formData);
      toast.success("Leave request submitted successfully!");
      setFormData({ leave_type: "annual", start_date: "", end_date: "", reason: "" });
      fetchLeaveData();
    } catch (error) {
      toast.error(error.message || "Failed to submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'rejected': return 'bg-rose-100 text-rose-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const calculateDays = () => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Application</h1>
          <p className="text-gray-500 mt-1">Request and manage your leave</p>
        </div>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-8 w-8 text-blue-100" />
            <span className="text-blue-100 text-sm">Annual</span>
          </div>
          <p className="text-3xl font-bold">{leaveBalance.annual.remaining}</p>
          <p className="text-blue-100 text-sm mt-1">Days remaining</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-8 w-8 text-emerald-100" />
            <span className="text-emerald-100 text-sm">Sick</span>
          </div>
          <p className="text-3xl font-bold">{leaveBalance.sick.remaining}</p>
          <p className="text-emerald-100 text-sm mt-1">Days remaining</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <FileText className="h-8 w-8 text-amber-100" />
            <span className="text-amber-100 text-sm">Personal</span>
          </div>
          <p className="text-3xl font-bold">{leaveBalance.personal.remaining}</p>
          <p className="text-amber-100 text-sm mt-1">Days remaining</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button onClick={() => setActiveTab("apply")} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "apply" ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Apply for Leave</button>
          <button onClick={() => setActiveTab("history")} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "history" ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Leave History</button>
        </nav>
      </div>

      {/* Apply for Leave Form */}
      {activeTab === "apply" && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Request Time Off</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                <select value={formData.leave_type} onChange={(e) => setFormData({...formData, leave_type: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white">
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Days</label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">{calculateDays()}</span>
                  <span className="text-sm text-gray-500 ml-2">days</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Leave</label>
              <textarea rows="4" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-lg" placeholder="Please provide details about your leave request..." required />
            </div>
            <div className="flex items-center justify-end">
              <button type="submit" disabled={submitting} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium flex items-center space-x-2">
                {submitting && <Loader className="h-4 w-4 animate-spin" />}
                <Send className="h-4 w-4" />
                <span>Submit Request</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leave History */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {leaveHistory.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No leave requests found</h3>
              <p className="text-gray-500 mt-2">Your leave history will appear here</p>
            </div>
          ) : (
            leaveHistory.map((leave) => (
              <div key={leave.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{leave.leave_type}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(leave.status)}`}>{leave.status}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div><p className="text-gray-500">Start Date</p><p className="font-medium text-gray-900">{new Date(leave.start_date).toLocaleDateString()}</p></div>
                      <div><p className="text-gray-500">End Date</p><p className="font-medium text-gray-900">{new Date(leave.end_date).toLocaleDateString()}</p></div>
                      <div><p className="text-gray-500">Duration</p><p className="font-medium text-gray-900">{leave.total_days} days</p></div>
                      <div><p className="text-gray-500">Approved By</p><p className="font-medium text-gray-900">{leave.approved_by_name || 'Pending'}</p></div>
                    </div>
                    <div className="mt-3"><p className="text-gray-500 text-sm">Reason</p><p className="text-gray-900 text-sm mt-1">{leave.reason}</p></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LeaveApplication;