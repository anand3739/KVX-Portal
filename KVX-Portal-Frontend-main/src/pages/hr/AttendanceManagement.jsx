import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Clock, Calendar, Users, CheckCircle, XCircle,
  AlertCircle, Download, Filter, Search, ChevronDown,
  UserCheck, UserX, Clock3, Coffee, Timer, TrendingUp,
  RefreshCw, X, Eye, MapPin, Phone, Edit2
} from "lucide-react";

/* ─── Employee Detail Modal ──────────────────────────────────────────────── */
const AttendanceDetailModal = ({ employee, onClose }) => {
  if (!employee) return null;
  const weekDays = [
    { day: "Mon", status: "present", checkIn: "09:00 AM", checkOut: "06:00 PM", hours: "9h" },
    { day: "Tue", status: "present", checkIn: "08:55 AM", checkOut: "05:45 PM", hours: "8.8h" },
    { day: "Wed", status: employee.status === 'absent' ? 'absent' : "late", checkIn: employee.status === 'absent' ? "—" : "09:35 AM", checkOut: employee.status === 'absent' ? "—" : "06:10 PM", hours: employee.status === 'absent' ? "0h" : "8.6h" },
    { day: "Thu", status: "present", checkIn: "09:00 AM", checkOut: "06:00 PM", hours: "9h" },
    { day: "Fri", status: "present", checkIn: "08:50 AM", checkOut: "05:50 PM", hours: "9h" },
  ];

  const statusColors = { present: "bg-emerald-100 text-emerald-700", absent: "bg-rose-100 text-rose-700", late: "bg-amber-100 text-amber-700", "on-leave": "bg-purple-100 text-purple-700" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
              {employee.avatar}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{employee.name}</h2>
              <p className="text-sm text-gray-500">{employee.department}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Today Check-In", value: employee.checkIn || "—" },
              { label: "Today Check-Out", value: employee.checkOut || "—" },
              { label: "Total Hours", value: employee.hours },
              { label: "Status", value: employee.status.replace('-', ' ') },
              { label: "Overtime", value: employee.overtime },
              { label: "Late Today", value: employee.late ? "Yes" : "No" },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">{item.label}</p>
                <p className={`text-sm font-semibold mt-0.5 capitalize ${item.label === 'Status' ? (employee.status === 'present' ? 'text-emerald-600' : employee.status === 'absent' ? 'text-rose-600' : 'text-amber-600') : 'text-gray-900'}`}>{item.value}</p>
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">This Week</h4>
            <div className="grid grid-cols-5 gap-2">
              {weekDays.map(d => (
                <div key={d.day} className="text-center">
                  <p className="text-xs text-gray-400 mb-1">{d.day}</p>
                  <div className={`h-10 rounded-lg flex items-center justify-center text-xs font-medium ${statusColors[d.status] || 'bg-gray-100 text-gray-500'}`}>
                    {d.status === 'present' ? '✓' : d.status === 'absent' ? '✗' : d.status === 'late' ? 'L' : '—'}
                  </div>
                  <p className="text-xs text-gray-300 mt-1">{d.hours}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <button onClick={() => { toast.success(`Attendance report for ${employee.name} downloaded!`); onClose(); }}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors flex items-center justify-center space-x-2">
              <Download className="h-4 w-4" /><span>Download Report</span>
            </button>
            <button onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-medium transition-all">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Page ───────────────────────────────────────────────────────────── */
const AttendanceManagement = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const departments = ["Engineering", "HR", "Sales", "Marketing", "Finance", "Operations"];

  const attendanceData = [
    { id: 1, name: "John Doe", avatar: "JD", department: "Engineering", checkIn: "09:00 AM", checkOut: "06:00 PM", status: "present", hours: "9h", late: false, overtime: "0h" },
    { id: 2, name: "Jane Smith", avatar: "JS", department: "HR", checkIn: "08:45 AM", checkOut: "05:30 PM", status: "present", hours: "8.75h", late: false, overtime: "0h" },
    { id: 3, name: "Mike Johnson", avatar: "MJ", department: "Sales", checkIn: "09:30 AM", checkOut: null, status: "present", hours: "6.5h", late: true, overtime: "0h" },
    { id: 4, name: "Sarah Wilson", avatar: "SW", department: "Marketing", checkIn: null, checkOut: null, status: "absent", hours: "0h", late: false, overtime: "0h" },
    { id: 5, name: "David Brown", avatar: "DB", department: "Finance", checkIn: "08:30 AM", checkOut: "06:30 PM", status: "present", hours: "10h", late: false, overtime: "2h" },
    { id: 6, name: "Emily Davis", avatar: "ED", department: "Engineering", checkIn: "09:15 AM", checkOut: null, status: "present", hours: "7h", late: true, overtime: "0h" },
    { id: 7, name: "Robert Taylor", avatar: "RT", department: "Operations", checkIn: null, checkOut: null, status: "on-leave", hours: "0h", late: false, overtime: "0h" },
  ];

  const stats = {
    total: 156,
    present: attendanceData.filter(e => e.status === 'present').length,
    absent: attendanceData.filter(e => e.status === 'absent').length,
    late: attendanceData.filter(e => e.late).length,
    onLeave: attendanceData.filter(e => e.status === 'on-leave').length,
    overtime: attendanceData.filter(e => e.overtime !== "0h").length
  };

  const filtered = attendanceData.filter(e =>
    (selectedDepartment === "all" || e.department === selectedDepartment) &&
    (e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExport = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      toast.success("Attendance report exported successfully!");
    }, 1200);
  };

  const getStatusBadge = (status) => {
    const map = {
      present: 'bg-emerald-100 text-emerald-700',
      absent: 'bg-rose-100 text-rose-700',
      'on-leave': 'bg-amber-100 text-amber-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {selectedEmployee && <AttendanceDetailModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-500 mt-1">Track and manage employee attendance in real-time</p>
        </div>
        <button onClick={handleExport} disabled={downloading}
          className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium flex items-center space-x-2 transition-all shadow-md shadow-green-500/25 disabled:opacity-60 w-fit">
          {downloading ? <><RefreshCw className="h-4 w-4 animate-spin" /><span>Exporting…</span></>
            : <><Download className="h-4 w-4" /><span>Export Report</span></>}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { Icon: Users, color: "text-blue-600", bg: "bg-blue-50", value: stats.total, label: "Total" },
          { Icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50", value: stats.present, label: "Present" },
          { Icon: UserX, color: "text-rose-600", bg: "bg-rose-50", value: stats.absent, label: "Absent" },
          { Icon: Clock3, color: "text-amber-600", bg: "bg-amber-50", value: stats.late, label: "Late" },
          { Icon: Coffee, color: "text-purple-600", bg: "bg-purple-50", value: stats.onLeave, label: "On Leave" },
          { Icon: Timer, color: "text-indigo-600", bg: "bg-indigo-50", value: stats.overtime, label: "Overtime" },
        ].map(({ Icon, color, bg, value, label }, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className={`p-2 ${bg} rounded-lg w-fit mb-2`}><Icon className={`h-5 w-5 ${color}`} /></div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Attendance Rate Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm font-medium">Today's Attendance Rate</p>
            <p className="text-5xl font-bold mt-1">{Math.round((stats.present / (stats.present + stats.absent)) * 100)}%</p>
            <p className="text-emerald-200 text-sm mt-1">
              {stats.present} present · {stats.absent} absent · {stats.late} late arrivals
            </p>
          </div>
          <div className="text-right">
            <div className="w-24 h-24 relative flex items-center justify-center">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="white" strokeWidth="3"
                  strokeDasharray={`${Math.round((stats.present / (stats.present + stats.absent)) * 100)} 100`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute text-center">
                <TrendingUp className="h-5 w-5 mx-auto text-white/80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search employees…" value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm transition-all" />
          </div>
          <div className="flex items-center space-x-3">
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-sm transition-all" />
            <select value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 bg-white text-sm transition-all">
              <option value="all">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Employee", "Department", "Check In", "Check Out", "Hours", "Status", "Actions"].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(employee => (
                <tr key={employee.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {employee.avatar}
                      </div>
                      <Link to={`/hr/employees/${employee.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                        {employee.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">{employee.department}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${employee.late ? 'text-rose-600 font-semibold' : 'text-gray-900'}`}>
                      {employee.checkIn || '—'}
                    </span>
                    {employee.late && <span className="ml-1.5 text-xs bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full">Late</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{employee.checkOut || '—'}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{employee.hours}</span>
                    {employee.overtime !== "0h" && (
                      <span className="ml-1.5 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">+{employee.overtime} OT</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(employee.status)}`}>
                      {employee.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => setSelectedEmployee(employee)}
                      className="flex items-center space-x-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                      <Eye className="h-3.5 w-3.5" /><span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-5">Attendance Summary</h3>
          <div className="space-y-4">
            {[
              { label: "Present", value: stats.present, total: stats.present + stats.absent, color: "bg-emerald-500" },
              { label: "Absent", value: stats.absent, total: stats.present + stats.absent, color: "bg-rose-500" },
              { label: "Late", value: stats.late, total: stats.present + stats.absent, color: "bg-amber-500" },
              { label: "On Leave", value: stats.onLeave, total: stats.present + stats.absent, color: "bg-purple-500" },
            ].map(({ label, value, total, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-600 font-medium">{label}</span>
                  <span className="font-semibold text-gray-900">{value} <span className="text-gray-400 font-normal">/ {total}</span></span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${(value / total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-5">Department Attendance</h3>
          <div className="space-y-3">
            {departments.map((dept, i) => {
              const rate = [92, 95, 78, 85, 88, 90][i];
              return (
                <div key={dept} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 w-24">{dept}</span>
                  <div className="flex items-center space-x-3 flex-1 ml-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-2 rounded-full transition-all ${rate >= 90 ? 'bg-emerald-500' : rate >= 80 ? 'bg-blue-500' : 'bg-amber-500'}`}
                        style={{ width: `${rate}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-10 text-right">{rate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;