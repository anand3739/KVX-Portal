import { useState, useRef } from "react";
import {
  Building2,
  Users,
  Briefcase,
  Calendar,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Target,
  BarChart3,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Departments = () => {
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState("engineering");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const detailsRef = useRef(null);

  const handleSelectDepartment = (deptId) => {
    setSelectedDepartment(deptId);
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingSubject, setMeetingSubject] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");

  // Form states
  const [newDept, setNewDept] = useState({
    name: "",
    head: "",
    budget: "",
    location: "San Francisco, CA",
    description: "",
    goals: ["", "", ""]
  });

  const [editDeptData, setEditDeptData] = useState(null);

  const [deptList, setDeptList] = useState([
    {
      id: "engineering",
      name: "Engineering",
      icon: Briefcase,
      color: "blue",
      head: "Dr. Sarah Johnson",
      headAvatar: "SJ",
      employees: 145,
      openPositions: 8,
      budget: "$2.4M",
      projects: 23,
      satisfaction: 94,
      location: "San Francisco, CA",
      email: "engineering@kravix.com",
      phone: "+1 (555) 123-4567",
      description: "Software development, infrastructure, and technical innovation",
      performance: "Excellent",
      goals: [
        "Launch Q2 product release",
        "Reduce technical debt by 20%",
        "Hire 5 senior developers"
      ]
    },
    {
      id: "hr",
      name: "Human Resources",
      icon: Users,
      color: "purple",
      head: "Michael Chen",
      headAvatar: "MC",
      employees: 28,
      openPositions: 3,
      budget: "$850K",
      projects: 12,
      satisfaction: 88,
      location: "New York, NY",
      email: "hr@kravix.com",
      phone: "+1 (555) 234-5678",
      description: "Recruitment, employee relations, payroll, and training",
      performance: "Good",
      goals: [
        "Complete Q2 hiring targets",
        "Implement new HRIS system",
        "Employee satisfaction survey"
      ]
    },
    {
      id: "sales",
      name: "Sales",
      icon: TrendingUp,
      color: "emerald",
      head: "Jessica Martinez",
      headAvatar: "JM",
      employees: 89,
      openPositions: 12,
      budget: "$3.2M",
      projects: 15,
      satisfaction: 86,
      location: "Chicago, IL",
      email: "sales@kravix.com",
      phone: "+1 (555) 345-6789",
      description: "Revenue generation, client relationships, and market expansion",
      performance: "Good",
      goals: [
        "Achieve $5M Q2 revenue",
        "Expand into APAC market",
        "Close 3 enterprise deals"
      ]
    },
    {
      id: "marketing",
      name: "Marketing",
      icon: Target,
      color: "pink",
      head: "David Wilson",
      headAvatar: "DW",
      employees: 42,
      openPositions: 5,
      budget: "$1.8M",
      projects: 18,
      satisfaction: 91,
      location: "Austin, TX",
      email: "marketing@kravix.com",
      phone: "+1 (555) 456-7890",
      description: "Brand management, digital marketing, and content strategy",
      performance: "Excellent",
      goals: [
        "Launch summer campaign",
        "Increase website traffic by 40%",
        "Social media engagement target"
      ]
    },
    {
      id: "finance",
      name: "Finance",
      icon: DollarSign,
      color: "amber",
      head: "Robert Taylor",
      headAvatar: "RT",
      employees: 35,
      openPositions: 2,
      budget: "$1.2M",
      projects: 8,
      satisfaction: 95,
      location: "Boston, MA",
      email: "finance@kravix.com",
      phone: "+1 (555) 567-8901",
      description: "Financial planning, accounting, and compliance",
      performance: "Excellent",
      goals: [
        "Complete Q2 audit",
        "Optimize budget allocation",
        "Implement new expense system"
      ]
    },
    {
      id: "product",
      name: "Product",
      icon: Target,
      color: "indigo",
      head: "Emily Davis",
      headAvatar: "ED",
      employees: 52,
      openPositions: 6,
      budget: "$2.1M",
      projects: 14,
      satisfaction: 92,
      location: "Seattle, WA",
      email: "product@kravix.com",
      phone: "+1 (555) 678-9012",
      description: "Product strategy, roadmap, and user experience",
      performance: "Excellent",
      goals: [
        "Q3 product roadmap",
        "User research completion",
        "Feature prioritization"
      ]
    },
    {
      id: "operations",
      name: "Operations",
      icon: Building2,
      color: "cyan",
      head: "Thomas Anderson",
      headAvatar: "TA",
      employees: 67,
      openPositions: 4,
      budget: "$1.5M",
      projects: 11,
      satisfaction: 87,
      location: "Denver, CO",
      email: "operations@kravix.com",
      phone: "+1 (555) 789-0123",
      description: "Facilities, logistics, and business operations",
      performance: "Good",
      goals: [
        "Office expansion project",
        "Supply chain optimization",
        "Process automation"
      ]
    }
  ]);

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-200",
        gradient: "from-blue-500 to-blue-600",
        light: "bg-blue-100"
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        border: "border-purple-200",
        gradient: "from-purple-500 to-purple-600",
        light: "bg-purple-100"
      },
      emerald: {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-200",
        gradient: "from-emerald-500 to-emerald-600",
        light: "bg-emerald-100"
      },
      pink: {
        bg: "bg-pink-50",
        text: "text-pink-600",
        border: "border-pink-200",
        gradient: "from-pink-500 to-pink-600",
        light: "bg-pink-100"
      },
      amber: {
        bg: "bg-amber-50",
        text: "text-amber-600",
        border: "border-amber-200",
        gradient: "from-amber-500 to-amber-600",
        light: "bg-amber-100"
      },
      indigo: {
        bg: "bg-indigo-50",
        text: "text-indigo-600",
        border: "border-indigo-200",
        gradient: "from-indigo-500 to-indigo-600",
        light: "bg-indigo-100"
      },
      cyan: {
        bg: "bg-cyan-50",
        text: "text-cyan-600",
        border: "border-cyan-200",
        gradient: "from-cyan-500 to-cyan-600",
        light: "bg-cyan-100"
      }
    };
    return colors[color] || colors.blue;
  };

  const getPerformanceColor = (performance) => {
    switch(performance) {
      case 'Excellent': return 'bg-emerald-100 text-emerald-700';
      case 'Good': return 'bg-blue-100 text-blue-700';
      case 'Average': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredDepartments = deptList.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.head.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedDeptData = deptList.find(d => d.id === selectedDepartment);

  const handleAddDepartment = () => {
    if (!newDept.name || !newDept.head) {
      toast.error("Please fill in department name and head.");
      return;
    }
    const id = newDept.name.toLowerCase().replace(/\s+/g, "-");
    const dept = {
      id,
      name: newDept.name,
      icon: Briefcase,
      color: ["blue", "purple", "emerald", "pink", "amber", "indigo", "cyan"][deptList.length % 7],
      head: newDept.head,
      headAvatar: newDept.head.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
      employees: 0,
      openPositions: 0,
      budget: newDept.budget ? `$${parseFloat(newDept.budget).toLocaleString()}` : "$0",
      projects: 0,
      satisfaction: 100,
      location: newDept.location,
      email: `${id}@kravix.com`,
      phone: "+1 (555) 000-0000",
      description: newDept.description,
      performance: "Good",
      goals: newDept.goals.filter(g => g !== "")
    };
    setDeptList([...deptList, dept]);
    setShowAddModal(false);
    setNewDept({ name: "", head: "", budget: "", location: "San Francisco, CA", description: "", goals: ["", "", ""] });
    toast.success("Department created successfully!");
  };

  const handleEditDepartment = () => {
    if (!editDeptData.name || !editDeptData.head) {
      toast.error("Please fill in department name and head.");
      return;
    }
    setDeptList(deptList.map(d => d.id === editDeptData.id ? editDeptData : d));
    setShowEditModal(false);
    toast.success("Department updated successfully!");
  };

  const handleDeleteDepartment = (id) => {
    setDeptList(deptList.filter(d => d.id !== id));
    if (selectedDepartment === id) {
      setSelectedDepartment(deptList.find(d => d.id !== id)?.id || "");
    }
    setShowDeleteConfirm(false);
    toast.success("Department deleted successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500 mt-1">Manage departments and team structures</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center space-x-2 shadow-lg shadow-blue-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Departments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{deptList.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Across all locations</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">458</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">+32 this quarter</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Open Positions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">40</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-xl">
              <Briefcase className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Across {deptList.length} departments</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Satisfaction</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">90.4%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">↑ 5% from last quarter</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-3">
            <select className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
              <option>All Locations</option>
              <option>San Francisco</option>
              <option>New York</option>
              <option>London</option>
              <option>Singapore</option>
            </select>
            <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50">
              <Filter className="h-5 w-5 text-gray-500" />
            </button>
            <div className="flex border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 ${viewMode === "grid" ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
              >
                <Building2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 ${viewMode === "list" ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
              >
                <BarChart3 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Departments Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((dept) => {
            const colors = getColorClasses(dept.color);
            const Icon = dept.icon;
            
            return (
              <div
                key={dept.id}
                onClick={() => handleSelectDepartment(dept.id)}
                className={`group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 cursor-pointer ${
                  selectedDepartment === dept.id
                    ? `border-${dept.color}-500`
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`h-32 rounded-t-xl bg-gradient-to-r ${colors.gradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/20 rounded-full"></div>
                  <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/20 rounded-full"></div>
                  <div className="relative p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">{dept.name}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm`}>
                        {dept.employees} employees
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${colors.gradient} flex items-center justify-center text-white font-medium`}>
                        {dept.headAvatar}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Department Head</p>
                        <p className="text-sm font-medium text-gray-900">{dept.head}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPerformanceColor(dept.performance)}`}>
                      {dept.performance}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{dept.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Budget</p>
                      <p className="text-sm font-semibold text-gray-900">{dept.budget}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Projects</p>
                      <p className="text-sm font-semibold text-gray-900">{dept.projects}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Open Positions</p>
                      <p className="text-sm font-semibold text-amber-600">{dept.openPositions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Satisfaction</p>
                      <p className="text-sm font-semibold text-emerald-600">{dept.satisfaction}%</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{dept.location}</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Head</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employees</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDepartments.map((dept) => {
                const colors = getColorClasses(dept.color);
                return (
                  <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 ${colors.light} rounded-lg`}>
                          <dept.icon className={`h-5 w-5 ${colors.text}`} />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{dept.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${colors.gradient} flex items-center justify-center text-white text-xs`}>
                          {dept.headAvatar}
                        </div>
                        <span className="text-sm text-gray-600">{dept.head}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{dept.employees}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{dept.budget}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{dept.projects}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPerformanceColor(dept.performance)}`}>
                        {dept.performance}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{dept.location}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleSelectDepartment(dept.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Department Details Modal/View */}
      {selectedDeptData && (
        <div ref={detailsRef} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 scroll-mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{selectedDeptData.name} Department Details</h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => { setEditDeptData({ ...selectedDeptData, goals: selectedDeptData.goals.slice() }); setShowEditModal(true); }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Edit className="h-5 w-5 text-gray-500" />
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Trash2 className="h-5 w-5 text-rose-500" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Goals */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Department Goals</h3>
                <div className="space-y-3">
                  {selectedDeptData.goals && selectedDeptData.goals.map((goal, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <span className="text-sm text-gray-700">{goal}</span>
                      <CheckCircle className="h-5 w-5 text-emerald-500 ml-auto" />
                    </div>
                  ))}
                  {(!selectedDeptData.goals || selectedDeptData.goals.length === 0) && (
                    <p className="text-sm text-gray-500">No goals defined yet.</p>
                  )}
                </div>
              </div>

              {/* Team Structure */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Team Structure</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Senior Leadership</p>
                    <p className="text-lg font-semibold text-gray-900">8</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Managers</p>
                    <p className="text-lg font-semibold text-gray-900">15</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Senior Contributors</p>
                    <p className="text-lg font-semibold text-gray-900">42</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Junior Contributors</p>
                    <p className="text-lg font-semibold text-gray-900">80</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedDeptData.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedDeptData.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedDeptData.location}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => navigate("/admin/employees")}
                    className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                  >
                    View all employees
                  </button>
                  <button 
                    onClick={() => setShowMeetingModal(true)}
                    className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                  >
                    Schedule meeting
                  </button>
                  <button 
                    onClick={() => toast.success(`Report generation triggered for ${selectedDeptData.name} department.`)}
                    className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                  >
                    Generate report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-4 text-gray-800">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-gray-900">Add Department</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  placeholder="e.g. Quality Assurance"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Head *</label>
                <input
                  type="text"
                  value={newDept.head}
                  onChange={(e) => setNewDept({ ...newDept, head: e.target.value })}
                  placeholder="e.g. John Miller"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                <input
                  type="number"
                  value={newDept.budget}
                  onChange={(e) => setNewDept({ ...newDept, budget: e.target.value })}
                  placeholder="e.g. 500000"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newDept.description}
                  onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                  placeholder="Department details..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-3 border-t">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDepartment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditModal && editDeptData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-4 text-gray-800">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-gray-900">Edit Department</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  value={editDeptData.name}
                  onChange={(e) => setEditDeptData({ ...editDeptData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Head *</label>
                <input
                  type="text"
                  value={editDeptData.head}
                  onChange={(e) => setEditDeptData({ ...editDeptData, head: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                <input
                  type="text"
                  value={editDeptData.budget}
                  onChange={(e) => setEditDeptData({ ...editDeptData, budget: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editDeptData.description}
                  onChange={(e) => setEditDeptData({ ...editDeptData, description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-3 border-t">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleEditDepartment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedDeptData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4 text-gray-800">
            <div className="text-center space-y-2">
              <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Department</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete the <strong>{selectedDeptData.name}</strong> department? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-3 pt-3 border-t">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDepartment(selectedDeptData.id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showMeetingModal && selectedDeptData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-4 text-gray-800">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-gray-900">Schedule Departmental Meeting</h3>
              <button onClick={() => setShowMeetingModal(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  readOnly
                  value={selectedDeptData.name}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  value={meetingSubject}
                  onChange={(e) => setMeetingSubject(e.target.value)}
                  placeholder="e.g. Q2 Performance Alignment"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                  <input
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-3 border-t">
              <button
                onClick={() => setShowMeetingModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!meetingSubject || !meetingDate || !meetingTime) {
                    toast.error("Please fill in all meeting details.");
                    return;
                  }
                  toast.success(`Meeting "${meetingSubject}" scheduled for ${selectedDeptData.name} department.`);
                  setShowMeetingModal(false);
                  setMeetingSubject("");
                  setMeetingDate("");
                  setMeetingTime("");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;