import { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  Award,
  Clock,
  FileText,
  Edit,
  Download,
  MessageCircle,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  User,
  Building2
} from "lucide-react";
import { mockGetEmployeeById, mockGetMonthlyAttendance } from "../../services/mockAuthService";
import { downloadCSV } from "../../utils/downloadHelper";
import toast from "react-hot-toast";

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isHrPath = location.pathname.startsWith("/admin/hr");
  const prefix = isHrPath ? "/admin/hr" : (location.pathname.startsWith("/hr") ? "/hr" : "/admin");
  const backUrl = isHrPath ? "/admin/hr" : `${prefix}/employees`;
  const editUrl = isHrPath ? `/admin/hr/${id}/edit` : `${prefix}/employees/${id}/edit`;
  const mailboxPrefix = isHrPath ? "/admin" : prefix;

  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchEmployeeData();
  }, [id]);

  const fetchEmployeeData = () => {
    try {
      setLoading(true);
      const data = mockGetEmployeeById(id);
      setEmployee(data.employee);
      
      // Fetch recent attendance
      const attendanceData = mockGetMonthlyAttendance(
        new Date().getFullYear(),
        new Date().getMonth() + 1
      );
      setAttendance(attendanceData.attendance || []);
    } catch (error) {
      toast.error("Failed to fetch employee data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    if (employee?.email) {
      navigate(`${mailboxPrefix}/mailbox`, { state: { composeTo: employee.email } });
    } else {
      navigate(`${mailboxPrefix}/mailbox`);
    }
  };

  const handleExport = () => {
    if (!employee) return;
    const name = `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'N/A';
    const filename = `${name.replace(/\s+/g, '_')}_profile.csv`;
    
    const headers = ["Field", "Value"];
    const rows = [
      ["Employee ID", employee.employee_id || "N/A"],
      ["First Name", employee.first_name || ""],
      ["Last Name", employee.last_name || ""],
      ["Email", employee.email || "N/A"],
      ["Phone", employee.phone || "N/A"],
      ["Department", employee.department_name || "Unassigned"],
      ["Position", employee.position || "N/A"],
      ["Join Date", employee.join_date || employee.joining_date || "N/A"],
      ["Employment Type", employee.employment_type || "N/A"],
      ["Salary", employee.salary ? `$${Number(employee.salary).toLocaleString()}` : "N/A"],
      ["Status", employee.status || "N/A"],
      ["Address", employee.address || "N/A"],
      ["City", employee.city || "N/A"],
      ["State", employee.state || "N/A"],
      ["Country", employee.country || "N/A"],
      ["Postal Code", employee.postal_code || "N/A"],
      ["Emergency Contact Name", employee.emergency_contact_name || "N/A"],
      ["Emergency Contact Phone", employee.emergency_contact_phone || "N/A"],
      ["Emergency Contact Relationship", employee.emergency_contact_relationship || "N/A"]
    ];

    toast.success(`Exporting profile for ${name}...`);
    downloadCSV(filename, headers, rows);
  };

  const tabs = [
    { id: "overview", name: "Overview" },
    { id: "documents", name: "Documents" },
    { id: "attendance", name: "Attendance" },
    { id: "leave", name: "Leave" },
    { id: "performance", name: "Performance" },
    { id: "payroll", name: "Payroll" }
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center"><CheckCircle className="h-3 w-3 mr-1" /> Active</span>;
      case 'inactive':
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center"><XCircle className="h-3 w-3 mr-1" /> Inactive</span>;
      case 'probation':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center"><AlertCircle className="h-3 w-3 mr-1" /> Probation</span>;
      case 'on-leave':
        return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center"><Clock className="h-3 w-3 mr-1" /> On Leave</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">{isHrPath ? "HR Manager not found" : "Employee not found"}</h3>
      </div>
    );
  }

  const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'N/A';
  const initials = (employee.first_name?.[0] || '') + (employee.last_name?.[0] || '') || 'U';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to={backUrl}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isHrPath ? "HR Profile" : "Employee Profile"}</h1>
            <p className="text-gray-500 mt-1">{isHrPath ? "View and manage HR details" : "View and manage employee details"}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleMessage}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Message
          </button>
          <button 
            onClick={handleExport}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <Link
            to={editUrl}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group">
        {/* Banner with Hover Edit */}
        <div 
          className="h-48 relative cursor-pointer"
          style={{
            background: employee.banner_url ? `url(${employee.banner_url}) center/cover no-repeat` : `url(https://picsum.photos/seed/${employee.id || 'default'}/1200/400) center/cover no-repeat`
          }}
          onClick={() => navigate(editUrl)}
        >
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white flex items-center font-medium">
              <Edit className="h-4 w-4 mr-2" /> Edit Banner & Profile
            </div>
          </div>
        </div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row md:items-end -mt-16">
            <div className="flex items-end space-x-6 z-10">
              {/* Profile Picture with Hover Edit */}
              <div 
                className="h-32 w-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg relative cursor-pointer group/pfp"
                onClick={() => navigate(editUrl)}
              >
                {employee.profile_picture_url ? (
                  <img src={employee.profile_picture_url} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                    {initials}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/pfp:opacity-100 transition-opacity flex items-center justify-center">
                  <Edit className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mb-2">
                <h2 className="text-3xl font-bold text-gray-900">{fullName}</h2>
                <p className="text-lg text-indigo-600 font-medium mt-1">{employee.position || 'No position'} • {employee.department_name || 'Unassigned'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-6 md:mt-0 md:ml-auto md:mb-4">
              {getStatusBadge(employee.status)}
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors shadow-sm border border-gray-100 bg-white">
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              {/* Personal Information */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{employee.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{employee.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900">{employee.city || 'N/A'}, {employee.country || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Join Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {employee.join_date || employee.joining_date ? new Date(employee.join_date || employee.joining_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Employee ID</p>
                    <p className="text-sm font-medium text-gray-900">{employee.employee_id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="text-sm font-medium text-gray-900">{employee.department_name || 'Unassigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Position</p>
                    <p className="text-sm font-medium text-gray-900">{employee.position || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Employment Type</p>
                    <p className="text-sm font-medium text-gray-900">{employee.employment_type || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Salary</p>
                    <p className="text-sm font-medium text-gray-900">
                      {employee.salary ? `$${Number(employee.salary).toLocaleString()}` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Attendance Tab */}
          {activeTab === "attendance" && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance History</h3>
              {attendance.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No attendance records found</p>
              ) : (
                <div className="space-y-3">
                  {attendance.slice(0, 10).map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {record.login_time ? new Date(record.login_time).toLocaleTimeString() : 'N/A'} - 
                          {record.logout_time ? new Date(record.logout_time).toLocaleTimeString() : 'N/A'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === 'present' ? 'bg-green-100 text-green-700' :
                        record.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                        record.status === 'absent' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {record.status || 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Quick Info */}
        <div className="space-y-6">
          {/* Emergency Contact */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-sm font-medium text-gray-900">{employee.emergency_contact_name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-900">{employee.emergency_contact_phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Relationship</p>
                <p className="text-sm font-medium text-gray-900">{employee.emergency_contact_relationship || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Attendance Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {attendance.length > 0 ? 
                    `${((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(1)}%` : 
                    'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Leave Balance</span>
                <span className="text-sm font-medium text-gray-900">12 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;