import { useState } from "react";
import {
  Shield,
  Users,
  Key,
  Lock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Save,
  Plus,
  Trash2,
  Search,
  Filter,
  X
} from "lucide-react";
import toast from "react-hot-toast";

const Permissions = () => {
  const [selectedRole, setSelectedRole] = useState("admin");
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newRole, setNewRole] = useState({
    name: "",
    description: ""
  });

  const [roleList, setRoleList] = useState([
    { id: "ceo", name: "CEO", color: "purple", users: 2, description: "Full access to all company data" },
    { id: "admin", name: "Admin", color: "blue", users: 3, description: "System administration and user management" },
    { id: "hr", name: "HR Manager", color: "green", users: 3, description: "Recruitment, payroll, employee relations" },
    { id: "manager", name: "Department Manager", color: "orange", users: 12, description: "Team management and performance reviews" },
    { id: "employee", name: "Employee", color: "gray", users: 156, description: "Basic access to personal information" },
    { id: "intern", name: "Intern", color: "cyan", users: 8, description: "Limited access with supervision" }
  ]);

  const [permissionState, setPermissionState] = useState({
    ceo: {
      dashboard: true,
      analytics: true,
      employees: true,
      departments: true,
      recruitment: true,
      payroll: true,
      performance: true,
      training: true,
      documents: true,
      reports: true,
      settings: true,
      security: true,
      logs: true,
      backup: true
    },
    admin: {
      dashboard: true,
      analytics: true,
      employees: true,
      departments: true,
      recruitment: true,
      payroll: true,
      performance: true,
      training: true,
      documents: true,
      reports: true,
      settings: true,
      security: true,
      logs: true,
      backup: true
    },
    hr: {
      dashboard: true,
      analytics: true,
      employees: true,
      departments: true,
      recruitment: true,
      payroll: true,
      performance: true,
      training: true,
      documents: true,
      reports: true,
      settings: false,
      security: false,
      logs: false,
      backup: false
    },
    manager: {
      dashboard: true,
      analytics: true,
      employees: true,
      departments: false,
      recruitment: false,
      payroll: false,
      performance: true,
      training: true,
      documents: true,
      reports: true,
      settings: false,
      security: false,
      logs: false,
      backup: false
    },
    employee: {
      dashboard: true,
      analytics: false,
      employees: false,
      departments: false,
      recruitment: false,
      payroll: true,
      performance: true,
      training: true,
      documents: true,
      reports: false,
      settings: true,
      security: false,
      logs: false,
      backup: false
    },
    intern: {
      dashboard: true,
      analytics: false,
      employees: false,
      departments: false,
      recruitment: false,
      payroll: false,
      performance: true,
      training: true,
      documents: true,
      reports: false,
      settings: false,
      security: false,
      logs: false,
      backup: false
    }
  });

  const permissionCategories = [
    {
      name: "Core Access",
      permissions: ["dashboard", "analytics", "reports"]
    },
    {
      name: "User Management",
      permissions: ["employees", "departments", "performance"]
    },
    {
      name: "HR Operations",
      permissions: ["recruitment", "payroll", "training"]
    },
    {
      name: "System",
      permissions: ["settings", "security", "logs", "backup", "documents"]
    }
  ];

  const getPermissionLabel = (perm) => {
    const labels = {
      dashboard: "Dashboard Access",
      analytics: "Analytics & Reports",
      employees: "Employee Management",
      departments: "Department Management",
      recruitment: "Recruitment",
      payroll: "Payroll Processing",
      performance: "Performance Reviews",
      training: "Training Management",
      documents: "Document Access",
      reports: "Report Generation",
      settings: "System Settings",
      security: "Security Settings",
      logs: "System Logs",
      backup: "Backup Management"
    };
    return labels[perm] || perm;
  };

  const getRoleColor = (color) => {
    const colors = {
      purple: 'from-purple-500 to-purple-600',
      blue: 'from-blue-500 to-blue-600',
      green: 'from-emerald-500 to-emerald-600',
      orange: 'from-orange-500 to-orange-600',
      gray: 'from-gray-500 to-gray-600',
      cyan: 'from-cyan-500 to-cyan-600'
    };
    return colors[color] || colors.blue;
  };

  const handlePermissionToggle = (perm) => {
    setPermissionState(prev => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [perm]: !prev[selectedRole]?.[perm]
      }
    }));
  };

  const handleCreateRole = () => {
    if (!newRole.name) {
      toast.error("Please enter a role name.");
      return;
    }
    const id = newRole.name.toLowerCase().replace(/\s+/g, "-");
    if (roleList.some(r => r.id === id)) {
      toast.error("A role with this name already exists.");
      return;
    }
    const newEntry = {
      id,
      name: newRole.name,
      color: ["purple", "blue", "green", "orange", "gray", "cyan"][roleList.length % 6],
      users: 0,
      description: newRole.description || "Custom created user role."
    };
    setRoleList([...roleList, newEntry]);
    setPermissionState(prev => ({
      ...prev,
      [id]: {
        dashboard: true,
        analytics: false,
        employees: false,
        departments: false,
        recruitment: false,
        payroll: false,
        performance: false,
        training: false,
        documents: false,
        reports: false,
        settings: false,
        security: false,
        logs: false,
        backup: false
      }
    }));
    setShowCreateModal(false);
    setNewRole({ name: "", description: "" });
    setSelectedRole(id);
    toast.success("New role created successfully!");
  };

  const filteredRoles = roleList.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-500 mt-1">Manage user roles and access controls</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center space-x-2 shadow-lg shadow-blue-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>Create Role</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Roles Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-2">
              {filteredRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role.id);
                    setEditMode(false);
                  }}
                  className={`w-full p-4 rounded-xl border transition-all ${selectedRole === role.id
                      ? `bg-gradient-to-r ${getRoleColor(role.color)} text-white shadow-lg`
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${selectedRole === role.id
                          ? 'bg-white/20'
                          : `bg-${role.color}-100`
                        }`}>
                        <Shield className={`h-5 w-5 ${selectedRole === role.id ? 'text-white' : `text-${role.color}-600`
                          }`} />
                      </div>
                      <div className="text-left">
                        <p className={`font-medium ${selectedRole === role.id ? 'text-white' : 'text-gray-900'
                          }`}>
                          {role.name}
                        </p>
                        <p className={`text-xs ${selectedRole === role.id ? 'text-white/80' : 'text-gray-500'
                          }`}>
                          {role.users} users
                        </p>
                      </div>
                    </div>
                    {selectedRole === role.id && (
                      <CheckCircle className="h-5 w-5 text-white" />
                    )}
                  </div>
                </button>
              ))}
              {filteredRoles.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No roles found.</p>
              )}
            </div>
          </div>

          {/* Role Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-gray-800">
            <h3 className="font-semibold text-gray-900 mb-2">About this role</h3>
            <p className="text-sm text-gray-600">
              {roleList.find(r => r.id === selectedRole)?.description || "No description."}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Total Users</span>
                <span className="font-medium text-gray-900">
                  {roleList.find(r => r.id === selectedRole)?.users || 0}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="text-gray-500">Last Modified</span>
                <span className="font-medium text-gray-900">2 days ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {roleList.find(r => r.id === selectedRole)?.name} Permissions
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Configure access levels for this role
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {editMode ? (
                    <>
                      <button
                        onClick={() => setEditMode(false)}
                        className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setEditMode(false);
                          toast.success("Permissions saved successfully!");
                        }}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center space-x-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit Permissions</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="p-6">
              {permissionCategories.map((category, idx) => (
                <div key={idx} className={idx > 0 ? "mt-8" : ""}>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">{category.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.permissions.map((perm) => (
                      <div
                        key={perm}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${permissionState[selectedRole]?.[perm]
                              ? 'bg-emerald-100'
                              : 'bg-gray-200'
                            }`}>
                            {permissionState[selectedRole]?.[perm] ? (
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {getPermissionLabel(perm)}
                          </span>
                        </div>
                        {editMode ? (
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={!!permissionState[selectedRole]?.[perm]}
                              onChange={() => handlePermissionToggle(perm)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        ) : (
                          <span className={`text-sm font-medium ${permissionState[selectedRole]?.[perm]
                              ? 'text-emerald-600'
                              : 'text-gray-400'
                            }`}>
                            {permissionState[selectedRole]?.[perm] ? 'Enabled' : 'Disabled'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Users with this role */}
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Users with this role</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                    JD
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">John Doe</p>
                    <p className="text-xs text-gray-500">john.doe@kravix.com</p>
                  </div>
                </div>
                <button
                  onClick={() => toast.success("Opening John Doe management...")}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Manage
                </button>
              </div>
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-medium">
                    JS
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Jane Smith</p>
                    <p className="text-xs text-gray-500">jane.smith@kravix.com</p>
                  </div>
                </div>
                <button
                  onClick={() => toast.success("Opening Jane Smith management...")}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Manage
                </button>
              </div>
            </div>
            <button
              onClick={() => toast.success("Navigating to Employee Directory...")}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all users →
            </button>
          </div>
        </div>
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Role</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sales Executive"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Describe the responsibilities of this role..."
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRole}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium"
                >
                  Create Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Permissions;