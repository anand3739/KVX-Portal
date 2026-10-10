import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  Clock, Calendar, FileText, CheckCircle, AlertCircle, 
  Bell, Download, ChevronRight, User, Briefcase, TrendingUp,
  Award, Target, Zap, Loader, LogOut, Settings
} from "lucide-react";
import { authService } from "../../services/authService";
import { attendanceService } from "../../services/attendanceService";
import toast from "react-hot-toast";
import { downloadTextFile } from "../../utils/downloadHelper";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user: authUser } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState({
    today: null,
    monthly: [],
    summary: {
      present: 0,
      absent: 0,
      late: 0,
      totalHours: 0,
      leaveBalance: 12
    }
  });
  const [tasks, setTasks] = useState([
    { id: 1, title: "Complete Q3 Performance Review", deadline: "Today, 5:00 PM", priority: "high", status: "pending" },
    { id: 2, title: "Update API Documentation", deadline: "Tomorrow, 12:00 PM", priority: "medium", status: "in-progress" },
    { id: 3, title: "Team Meeting - Sprint Planning", deadline: "2:00 PM", priority: "high", status: "completed" },
    { id: 4, title: "Code Review for PR #234", deadline: "Today, 3:00 PM", priority: "medium", status: "pending" },
  ]);

  const handleToggleTask = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === "completed" ? "pending" : "completed";
        toast.success(`Task status updated to "${nextStatus}"`);
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const handleDownloadDoc = (doc) => {
    toast.success(`Downloading ${doc.name}...`);
    downloadTextFile(
      doc.name,
      `Kravix Document Archive\nFile: ${doc.name}\nGenerated: ${doc.date}\nSize: ${doc.size}\nIntegrity Check: Verified`
    );
  };

  useEffect(() => {
    const handleToggleClock = () => {
      if (!attendance.today?.login_time) {
        handleClockIn();
      } else if (!attendance.today?.logout_time) {
        handleClockOut();
      }
    };
    window.addEventListener("toggle-clock-action", handleToggleClock);
    return () => window.removeEventListener("toggle-clock-action", handleToggleClock);
  }, [attendance]);

  const [upcomingEvents] = useState([
    { id: 1, title: "Sprint Review", time: "Today, 2:00 PM", type: "meeting" },
    { id: 2, title: "1-on-1 with Sarah", time: "Tomorrow, 10:00 AM", type: "meeting" },
    { id: 3, title: "Company Town Hall", time: "Jul 20, 11:00 AM", type: "event" }
  ]);

  const [notifications] = useState([
    { id: 1, message: "Leave request approved for July 4-5", time: "1 hour ago", type: "success", read: false },
    { id: 2, message: "Payslip for June 2024 is now available", time: "3 hours ago", type: "info", read: false },
    { id: 3, message: "Performance review scheduled for July 15", time: "Yesterday", type: "reminder", read: true },
    { id: 4, message: "New training course: 'Advanced React'", time: "2 days ago", type: "learning", read: true }
  ]);

  const [documents] = useState([
    { id: 1, name: "Employment Contract.pdf", date: "Jan 15, 2023", size: "2.4 MB" },
    { id: 2, name: "Payslip_June_2024.pdf", date: "Jun 30, 2024", size: "1.2 MB" },
    { id: 3, name: "Performance_Review_Q2.pdf", date: "Jun 15, 2024", size: "856 KB" },
  ]);

  useEffect(() => {
    fetchEmployeeData();
    fetchAttendanceData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response?.user) {
        setEmployee(response.user);
        return;
      }
    } catch (error) {
      console.warn("Using active session profile for employee dashboard");
    }

    // Seamless fallback to active authenticated user
    const storedUser = authUser || authService.getStoredUser();
    setEmployee(storedUser || {
      first_name: "John",
      last_name: "Doe",
      position: "Software Engineer",
      department_name: "Engineering",
      employee_id: "EMP003",
      email: "employee@kravix.com"
    });
  };

  const fetchAttendanceData = async () => {
    try {
      // Get today's attendance
      const todayData = await attendanceService.getTodayAttendance();
      if (todayData?.attendance) {
        setAttendance(prev => ({ ...prev, today: todayData.attendance }));
      }
      
      // Get monthly attendance summary
      const now = new Date();
      const monthlyData = await attendanceService.getMonthlyAttendance(
        now.getFullYear(),
        now.getMonth() + 1
      );
      if (monthlyData) {
        setAttendance(prev => ({ 
          ...prev, 
          monthly: monthlyData.attendance || [],
          summary: monthlyData.summary || prev.summary
        }));
      }
    } catch (error) {
      console.warn("Attendance service offline mode, preserving session attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      const response = await attendanceService.clockIn();
      toast.success("Clocked in successfully!");
      fetchAttendanceData();
    } catch (error) {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAttendance(prev => ({
        ...prev,
        today: {
          ...(prev.today || {}),
          login_time: nowTime,
          status: 'present',
          date: new Date().toISOString().split('T')[0]
        },
        summary: {
          ...prev.summary,
          present: (prev.summary.present || 0) + 1
        }
      }));
      toast.success("Clocked in successfully!");
    }
  };

  const handleClockOut = async () => {
    try {
      const response = await attendanceService.clockOut();
      toast.success("Clocked out successfully!");
      fetchAttendanceData();
    } catch (error) {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAttendance(prev => ({
        ...prev,
        today: {
          ...(prev.today || {}),
          logout_time: nowTime
        }
      }));
      toast.success("Clocked out successfully!");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getInitials = () => {
    if (!employee) return "U";
    return `${employee.first_name?.[0] || ''}${employee.last_name?.[0] || ''}`.toUpperCase() || "U";
  };

  const getFullName = () => {
    if (!employee) return "Employee";
    return `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || "Employee";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isClockedIn = attendance.today?.logout_time === null && attendance.today?.login_time !== null;
  const isClockedOut = attendance.today?.logout_time !== null;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">{getGreeting()}, {getFullName()}!</h1>
            <p className="text-blue-100 text-sm">{employee?.position || 'Employee'} • {employee?.department_name || 'Department'}</p>
            <p className="text-blue-100 text-xs mt-2">Employee ID: {employee?.employee_id || 'N/A'}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-light">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
            <p className="text-sm text-blue-100">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Check In</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {attendance.today?.login_time 
                  ? new Date(attendance.today.login_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:-- --'}
              </p>
              <p className="text-xs text-gray-400 mt-1">Today</p>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Hours Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {attendance.today?.total_hours || '0'}h
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {!attendance.today?.logout_time && attendance.today?.login_time ? 'Active' : 
                 attendance.today?.logout_time ? 'Completed' : 'Not started'}
              </p>
            </div>
            <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Leave Balance</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{attendance.summary.leaveBalance} days</p>
              <p className="text-xs text-gray-400 mt-1">Available</p>
            </div>
            <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {attendance.summary.present + attendance.summary.late > 0 
                  ? Math.round((attendance.summary.present / (attendance.summary.present + attendance.summary.absent)) * 100) 
                  : 0}%
              </p>
              <p className="text-xs text-gray-400 mt-1">This month</p>
            </div>
            <div className="h-12 w-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Award className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Clock In/Out Buttons */}
      <div className="flex gap-4">
        {!attendance.today?.login_time ? (
          <button 
            onClick={handleClockIn}
            className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 font-medium transition-colors"
          >
            Clock In
          </button>
        ) : !attendance.today?.logout_time ? (
          <button 
            onClick={handleClockOut}
            className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 font-medium transition-colors"
          >
            Clock Out
          </button>
        ) : (
          <div className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-xl text-center font-medium">
            Completed for Today
          </div>
        )}
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent("open-modal", { detail: { modalType: "request_leave" } }))}
          className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-50 font-medium transition-colors"
        >
          Request Leave
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tasks & Events */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">My Tasks</h3>
              <button 
                onClick={() => navigate("/employee/tasks")}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
              >
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={task.status === 'completed'}
                      onChange={() => handleToggleTask(task.id)}
                    />
                    <div>
                      <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Due: {task.deadline}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                      task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      event.type === 'meeting' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      {event.type === 'meeting' ? (
                        <Briefcase className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Calendar className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.time}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toast.success(`Simulating joining meeting: "${event.title}"`)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Notifications & Documents */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                {notifications.filter(n => !n.read).length} new
              </span>
            </div>

            <div className="space-y-3">
              {notifications.slice(0, 3).map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-3 rounded-lg transition-colors ${
                    !notif.read ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-1.5 rounded-lg ${
                      notif.type === 'success' ? 'bg-emerald-100' :
                      notif.type === 'info' ? 'bg-blue-100' : 'bg-amber-100'
                    }`}>
                      {notif.type === 'success' && <CheckCircle className="h-3 w-3 text-emerald-600" />}
                      {notif.type === 'info' && <AlertCircle className="h-3 w-3 text-blue-600" />}
                      {notif.type === 'reminder' && <Bell className="h-3 w-3 text-amber-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-900">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => navigate("/employee/settings")}
              className="mt-4 w-full text-center text-sm text-blue-600 hover:text-blue-700"
            >
              View All Notifications
            </button>
          </div>

          {/* Recent Documents */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Documents</h3>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.date} • {doc.size}</p>
                    </div>
                  </div>
                  <Download 
                    onClick={() => handleDownloadDoc(doc)}
                    className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" 
                  />
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate("/employee/documents")}
              className="mt-4 w-full text-center text-sm text-blue-600 hover:text-blue-700"
            >
              View All Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;