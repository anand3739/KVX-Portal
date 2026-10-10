import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  MoreVertical,
  ChevronDown,
  UserPlus,
  FileText,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  Trash2,
  Edit,
  Eye
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { mockGetAllEmployees, mockDeleteEmployee } from "../../services/mockAuthService";
import { downloadCSV } from "../../utils/downloadHelper";
import toast from "react-hot-toast";

const EmployeeManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
    probation: 0
  });

  const departments = ["Engineering", "Human Resources", "Sales", "Marketing", "Finance", "Product", "Operations"];
  const statuses = ["active", "on-leave", "probation", "inactive"];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await mockGetAllEmployees();
      setEmployees(data.employees || []);
      
      const total = data.employees?.length || 0;
      const active = data.employees?.filter(e => e.status === 'active').length || 0;
      const onLeave = data.employees?.filter(e => e.status === 'on-leave').length || 0;
      const probation = data.employees?.filter(e => e.status === 'probation').length || 0;
      
      setStats({ total, active, onLeave, probation });
    } catch (error) {
      toast.error("Failed to fetch employees");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await mockDeleteEmployee(employeeId);
      toast.success("Employee deleted successfully");
      fetchEmployees();
      setShowDeleteConfirm(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete employee");
    }
  };

  const handleExport = () => {
    toast.success("Exporting employee list...");
    const headers = ["Employee ID", "Name", "Email", "Department", "Position", "Status", "Join Date"];
    const rows = filteredEmployees.map(emp => [
      emp.employee_id || "",
      `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
      emp.email || "",
      emp.department_name || "Unassigned",
      emp.position || "",
      emp.status || "",
      emp.join_date || emp.joining_date || ""
    ]);
    downloadCSV("employees_list.csv", headers, rows);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-emerald-100 text-emerald-700';
      case 'on-leave': return 'bg-amber-100 text-amber-700';
      case 'probation': return 'bg-orange-100 text-orange-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
    const matchesSearch = searchTerm === "" || 
      fullName.includes(searchTerm.toLowerCase()) ||
      (emp.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.department_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.position || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = selectedDepartment === "all" || (emp.department_name || '') === selectedDepartment;
    const matchesStatus = selectedStatus === "all" || (emp.status || '') === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-500 mt-1">Manage and view all employees</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExport}
            className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <Link
            to="/admin/employees/add"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center space-x-2 shadow-lg shadow-blue-500/20"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Employee</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-600 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">Active</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.active}</p>
            </div>
            <div className="p-3 bg-emerald-600 rounded-xl">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{stats.total ? ((stats.active/stats.total)*100).toFixed(1) : 0}% of workforce</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">On Leave</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.onLeave}</p>
            </div>
            <div className="p-3 bg-amber-600 rounded-xl">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Probation</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.probation}</p>
            </div>
            <div className="p-3 bg-orange-600 rounded-xl">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees by name, email, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="all">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50">
              <Filter className="h-5 w-5 text-gray-500" />
            </button>
            <div className="flex border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 ${viewMode === "grid" ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
              >
                <Users className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-3 ${viewMode === "table" ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
              >
                <FileText className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Grid/Table View */}
      {filteredEmployees.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEmployees.map((employee) => {
            const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'N/A';
            const initials = (employee.first_name?.[0] || '') + (employee.last_name?.[0] || '') || 'U';
            
            return (
              <div key={employee.id} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
                <div className="relative h-32 bg-gradient-to-r from-blue-600 to-purple-600">
                  <div className="absolute -bottom-12 left-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-xl bg-white p-1 shadow-lg">
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                          {initials}
                        </div>
                      </div>
                      <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                        employee.status === 'active' ? 'bg-emerald-500' :
                        employee.status === 'on-leave' ? 'bg-amber-500' :
                        employee.status === 'probation' ? 'bg-orange-500' : 'bg-gray-500'
                      }`}></span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-16 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {fullName}
                      </h3>
                      <p className="text-sm text-gray-500">{employee.position || 'No position'}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Link
                        to={`/admin/employees/${employee.id}`}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4 text-gray-500" />
                      </Link>
                      <Link
                        to={`/admin/employees/${employee.id}/edit`}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4 text-gray-500" />
                      </Link>
                      <button
                        onClick={() => setShowDeleteConfirm(employee.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600 truncate">{employee.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">{employee.department_name || 'Unassigned'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                        {employee.status ? employee.status.charAt(0).toUpperCase() + employee.status.slice(1) : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                      <span>ID: {employee.employee_id || 'N/A'}</span>
                      {employee.join_date && (
                        <span>Joined {new Date(employee.join_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEmployees.map((employee) => {
                  const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'N/A';
                  const initials = (employee.first_name?.[0] || '') + (employee.last_name?.[0] || '') || 'U';
                  
                  return (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{fullName}</p>
                            <p className="text-xs text-gray-500">{employee.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{employee.department_name || 'Unassigned'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{employee.position || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                          {employee.status ? employee.status.charAt(0).toUpperCase() + employee.status.slice(1) : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {employee.join_date ? new Date(employee.join_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/admin/employees/${employee.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View
                          </Link>
                          <Link
                            to={`/admin/employees/${employee.id}/edit`}
                            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setShowDeleteConfirm(employee.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
              <p className="text-gray-500 mt-1">Are you sure you want to delete this employee? This action cannot be undone.</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEmployee(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;