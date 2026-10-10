import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  ChevronDown,
  Download,
  Users,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { mockGetAllEmployees, mockDeleteEmployee } from "../../services/mockAuthService";
import toast from "react-hot-toast";

const EmployeeDirectory = () => {
  const location = useLocation();
  const prefix = location.pathname.startsWith("/hr") ? "/hr" : "/admin";

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdownId(null);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchEmployees = () => {
    try {
      setLoading(true);
      const data = mockGetAllEmployees();
      setEmployees(data.employees || []);
    } catch (error) {
      toast.error("Failed to load employees");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employeeId) => {
    try {
      mockDeleteEmployee(employeeId);
      toast.success("Employee deleted successfully");
      fetchEmployees();
      setShowDeleteConfirm(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete employee");
    }
  };

  const departments = ["All", "Engineering", "Human Resources", "Sales", "Marketing", "Finance", "Product", "Operations"];

  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         (emp.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (emp.department_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Normalize department selection for comparison
    const deptFilter = selectedDepartment.toLowerCase();
    const empDept = (emp.department_name || '').toLowerCase();
    
    // Support matching "Human Resources" with "hr" department selection
    const matchesDept = selectedDepartment === "all" || 
                        empDept === deptFilter ||
                        (deptFilter === "hr" && empDept === "human resources") ||
                        (deptFilter === "human resources" && empDept === "hr");
                        
    return matchesSearch && matchesDept;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'on-leave':
        return 'bg-yellow-100 text-yellow-700';
      case 'probation':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Directory</h1>
          <p className="text-gray-500 mt-1">Manage and view all employees</p>
        </div>
        <Link
          to={`${prefix}/employees/add`}
          className="px-4 py-2 gradient-bg text-white rounded-lg text-sm font-medium hover:opacity-90 flex items-center shadow-md shadow-blue-500/25"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees by name, email, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
              >
                <option value="all">All Departments</option>
                {departments.slice(1).map(dept => (
                  <option key={dept} value={dept.toLowerCase()}>{dept}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter className="h-5 w-5 text-gray-500" />
            </button>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => {
          const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'N/A';
          const initials = (employee.first_name?.[0] || '') + (employee.last_name?.[0] || '') || 'U';
          const joinDate = employee.joining_date || employee.join_date;

          return (
            <Link
              key={employee.id}
              to={`${prefix}/employees/${employee.id}`}
              className="bg-white rounded-xl shadow-soft hover:shadow-medium transition-shadow duration-200 overflow-hidden group block border border-gray-100"
            >
              <div className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full gradient-bg flex items-center justify-center text-white font-semibold text-lg">
                      {employee.avatar || initials.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {fullName}
                      </h3>
                      <p className="text-sm text-gray-500">{employee.position || 'No Position'}</p>
                    </div>
                  </div>
                  
                  {/* Three-dots menu */}
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveDropdownId(activeDropdownId === employee.id ? null : employee.id);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors relative z-10"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    
                    {activeDropdownId === employee.id && (
                      <div 
                        onClick={(e) => e.stopPropagation()} 
                        className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150"
                      >
                        <Link
                          to={`${prefix}/employees/${employee.id}`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                        >
                          <Eye className="h-4 w-4 mr-2 text-gray-400" />
                          View Profile
                        </Link>
                        <Link
                          to={`${prefix}/employees/${employee.id}/edit`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                        >
                          <Edit className="h-4 w-4 mr-2 text-gray-400" />
                          Edit Profile
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setShowDeleteConfirm(employee.id);
                            setActiveDropdownId(null);
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-rose-600 hover:bg-rose-50/50 font-medium text-left"
                        >
                          <Trash2 className="h-4 w-4 mr-2 text-rose-500" />
                          Delete Employee
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-600 truncate">{employee.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-600">{employee.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Briefcase className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-600">{employee.department_name || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-600">
                      Joined {joinDate ? new Date(joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                    {employee.status ? (employee.status.charAt(0).toUpperCase() + employee.status.slice(1)) : 'Unknown'}
                  </span>
                  <span className="text-sm text-gray-500">{employee.city || employee.location || "Hyderabad"}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredEmployees.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-soft">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedDepartment("all");
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 text-rose-600 mb-4">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Employee</h3>
              <p className="text-gray-500 mt-2 text-sm">
                Are you sure you want to delete this employee? This action is permanent and cannot be undone.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-gray-700 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 font-medium transition-colors text-sm"
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

export default EmployeeDirectory;