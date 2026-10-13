import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  UserCheck,
  UserX,
  Coffee,
  Home,
  Briefcase,
  Loader
} from "lucide-react";
import { attendanceService } from "../../services/attendanceService";
import { authService } from "../../services/authService";
import { mockLogin } from "../../services/mockAuthService";
import toast from "react-hot-toast";

const Attendance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState({
    summary: {
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      workFromHome: 0,
      totalWorkingDays: 0,
      totalHours: 0,
      averageHours: 0,
      overtime: 0
    },
    monthly: [],
    leaveBalance: {
      annual: { total: 20, used: 0, remaining: 20 },
      sick: { total: 10, used: 0, remaining: 10 },
      personal: { total: 5, used: 0, remaining: 5 },
      unpaid: { total: 0, used: 0, remaining: 0 }
    }
  });
  const [todayStatus, setTodayStatus] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUserData();
    fetchAttendanceData();
  }, [currentMonth]);

  const fetchUserData = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response?.user) {
        setUser(response.user);
        return;
      }
    } catch (error) {
      console.warn("Using stored session user for attendance profile");
    }
    const storedUser = authService.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      
      const response = await attendanceService.getMonthlyAttendance(year, month);
      setAttendanceData({
        summary: response.summary || attendanceData.summary,
        monthly: response.attendance || [],
        leaveBalance: response.leaveBalance || attendanceData.leaveBalance
      });
      
      const todayResponse = await attendanceService.getTodayAttendance();
      setTodayStatus(todayResponse.attendance);
      
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
      toast.error("Failed to load attendance data");
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
      toast.error(error.message || "Failed to clock in");
    }
  };

  const handleClockOut = async () => {
    try {
      const response = await attendanceService.clockOut();
      toast.success("Clocked out successfully!");
      fetchAttendanceData();
    } catch (error) {
      toast.error(error.message || "Failed to clock out");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'absent': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'late': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'halfday':
      case 'half-day': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'wfh': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'weekend': return 'bg-gray-100 text-gray-500 border-gray-200';
      case 'upcoming': return 'bg-gray-50 text-gray-400 border-gray-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getRecordDateString = (record) => {
    if (!record) return '';
    if (record.login_time) {
      const d = new Date(record.login_time);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    if (record.date) {
      if (typeof record.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
        return record.date;
      }
      const d = new Date(record.date);
      const adjusted = new Date(d.getTime() + 6 * 3600 * 1000);
      return `${adjusted.getFullYear()}-${String(adjusted.getMonth() + 1).padStart(2, '0')}-${String(adjusted.getDate()).padStart(2, '0')}`;
    }
    return '';
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const formatMonth = () => {
    return currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth();
    const firstDay = getFirstDayOfMonth();
    const days = [];
    const monthData = attendanceData.monthly || [];

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<td key={`empty-${i}`} className="p-2"></td>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = monthData.find(d => getRecordDateString(d) === dateStr);
      const dayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isFuture = dateStr > todayStr;
      const isToday = dateStr === todayStr;

      let status = 'absent';
      if (dayData?.status) {
        status = dayData.status;
      } else if (isWeekend) {
        status = 'weekend';
      } else if (isFuture) {
        status = 'upcoming';
      }

      days.push(
        <td 
          key={day} 
          className={`p-2 border ${isToday ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100'}`}
        >
          <div className={`h-20 p-2 rounded-lg transition-all ${getStatusColor(status)}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{day}</span>
              {isToday && (
                <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-medium">
                  Today
                </span>
              )}
            </div>
            {dayData && status !== 'weekend' ? (
              <div className="mt-1 text-xs">
                <div className="truncate">
                  {dayData.login_time ? new Date(dayData.login_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'} 
                  {dayData.logout_time ? ` - ${new Date(dayData.logout_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                </div>
                <div className="font-medium mt-1">
                  {dayData.total_hours || dayData.net_hours || '0'}h • <span className="capitalize">{status}</span>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-xs capitalize text-gray-500 font-medium">
                {status}
              </div>
            )}
          </div>
        </td>
      );
    }

    // Split into weeks
    const weeks = [];
    let week = [];
    for (let i = 0; i < days.length; i++) {
      week.push(days[i]);
      if (week.length === 7 || i === days.length - 1) {
        weeks.push(<tr key={weeks.length}>{week}</tr>);
        week = [];
      }
    }

    return weeks;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isClockedIn = todayStatus?.logout_time === null && todayStatus?.login_time !== null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500 mt-1">Track your attendance and leave balance</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Today's Status */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Today's Status</p>
            <p className="text-3xl font-bold mt-1">
              {todayStatus?.login_time ? (todayStatus?.logout_time ? 'Completed' : 'Working') : 'Not Started'}
            </p>
            <p className="text-blue-100 mt-2">
              {todayStatus?.login_time ? `Check In: ${new Date(todayStatus.login_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not clocked in'}
              {todayStatus?.logout_time ? ` • Check Out: ${new Date(todayStatus.logout_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-light">{new Date().getDate()}</p>
            <p className="text-sm text-blue-100">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
          </div>
        </div>
        <div className="mt-4 flex space-x-3">
          {!todayStatus?.login_time ? (
            <button onClick={handleClockIn} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm">
              Clock In
            </button>
          ) : !todayStatus?.logout_time ? (
            <button onClick={handleClockOut} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm">
              Clock Out
            </button>
          ) : null}
          <button 
            onClick={() => navigate("/employee/leave")}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm font-medium"
          >
            Request Leave
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Present Days</p>
              <p className="text-2xl font-bold text-gray-900">{attendanceData.summary.present}</p>
              <p className="text-xs text-gray-400 mt-1">This month</p>
            </div>
            <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Absent Days</p>
              <p className="text-2xl font-bold text-gray-900">{attendanceData.summary.absent}</p>
              <p className="text-xs text-gray-400 mt-1">This month</p>
            </div>
            <div className="h-10 w-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <UserX className="h-5 w-5 text-rose-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Late Days</p>
              <p className="text-2xl font-bold text-gray-900">{attendanceData.summary.late}</p>
              <p className="text-xs text-gray-400 mt-1">This month</p>
            </div>
            <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">{attendanceData.summary.totalHours}h</p>
              <p className="text-xs text-gray-400 mt-1">Avg: {attendanceData.summary.averageHours}h/day</p>
            </div>
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Attendance Calendar</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="flex items-center text-xs"><span className="h-3 w-3 bg-emerald-500 rounded-full mr-1"></span> Present</span>
              <span className="flex items-center text-xs"><span className="h-3 w-3 bg-rose-500 rounded-full mr-1"></span> Absent</span>
              <span className="flex items-center text-xs"><span className="h-3 w-3 bg-amber-500 rounded-full mr-1"></span> Late</span>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="font-medium">{formatMonth()}</span>
              <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2 text-sm font-medium text-gray-500">Sun</th>
              <th className="p-2 text-sm font-medium text-gray-500">Mon</th>
              <th className="p-2 text-sm font-medium text-gray-500">Tue</th>
              <th className="p-2 text-sm font-medium text-gray-500">Wed</th>
              <th className="p-2 text-sm font-medium text-gray-500">Thu</th>
              <th className="p-2 text-sm font-medium text-gray-500">Fri</th>
              <th className="p-2 text-sm font-medium text-gray-500">Sat</th>
            </tr>
          </thead>
          <tbody>
            {renderCalendar()}
          </tbody>
        </table>
      </div>

      {/* Leave Balance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Balance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(attendanceData.leaveBalance).map(([key, value]) => (
            <div key={key} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 capitalize">{key} Leave</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{value.remaining} days</p>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Used: {value.used}</span>
                  <span>Total: {value.total}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full">
                  <div 
                    className={`h-1.5 rounded-full ${
                      key === 'annual' ? 'bg-blue-600' :
                      key === 'sick' ? 'bg-green-600' :
                      key === 'personal' ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                    style={{ width: `${(value.used / value.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Attendance;