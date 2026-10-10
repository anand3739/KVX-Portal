import { useState } from "react";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  Calendar,
  Users,
  DollarSign,
  Briefcase,
  Clock,
  FileText,
  Filter,
  Printer,
  Mail,
  Share2,
  Star,
  Award,
  Activity,
  ChevronRight,
  Eye,
  Percent,
  Plus
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import toast from "react-hot-toast";
import { downloadCSV } from "../../utils/downloadHelper";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState("overview");
  const [dateRange, setDateRange] = useState("month");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // Sample data for charts
  const revenueData = [
    { month: 'Jan', revenue: 450000, expenses: 320000, profit: 130000 },
    { month: 'Feb', revenue: 520000, expenses: 345000, profit: 175000 },
    { month: 'Mar', revenue: 480000, expenses: 330000, profit: 150000 },
    { month: 'Apr', revenue: 590000, expenses: 360000, profit: 230000 },
    { month: 'May', revenue: 620000, expenses: 380000, profit: 240000 },
    { month: 'Jun', revenue: 680000, expenses: 410000, profit: 270000 }
  ];

  const employeeGrowthData = [
    { month: 'Jan', employees: 420, hires: 12, attrition: 5 },
    { month: 'Feb', employees: 435, hires: 18, attrition: 3 },
    { month: 'Mar', employees: 448, hires: 15, attrition: 2 },
    { month: 'Apr', employees: 465, hires: 20, attrition: 3 },
    { month: 'May', employees: 482, hires: 22, attrition: 5 },
    { month: 'Jun', employees: 498, hires: 19, attrition: 3 }
  ];

  const departmentDistribution = [
    { name: 'Engineering', value: 145, color: '#3b82f6' },
    { name: 'Sales', value: 89, color: '#10b981' },
    { name: 'Marketing', value: 42, color: '#f59e0b' },
    { name: 'HR', value: 28, color: '#8b5cf6' },
    { name: 'Finance', value: 35, color: '#ec4899' },
    { name: 'Product', value: 52, color: '#6366f1' },
    { name: 'Operations', value: 67, color: '#14b8a6' }
  ];

  const attendanceData = [
    { day: 'Mon', present: 445, absent: 23, late: 12 },
    { day: 'Tue', present: 452, absent: 18, late: 10 },
    { day: 'Wed', present: 448, absent: 22, late: 15 },
    { day: 'Thu', present: 458, absent: 15, late: 8 },
    { day: 'Fri', present: 435, absent: 28, late: 18 }
  ];

  const performanceData = [
    { department: 'Engineering', score: 94 },
    { department: 'Sales', score: 88 },
    { department: 'Marketing', score: 86 },
    { department: 'HR', score: 92 },
    { department: 'Finance', score: 95 },
    { department: 'Product', score: 91 },
    { department: 'Operations', score: 87 }
  ];

  const recruitmentFunnel = [
    { stage: 'Applied', candidates: 250, color: '#3b82f6' },
    { stage: 'Screened', candidates: 120, color: '#6366f1' },
    { stage: 'Interview', candidates: 45, color: '#f59e0b' },
    { stage: 'Offer', candidates: 12, color: '#10b981' },
    { stage: 'Hired', candidates: 8, color: '#ec4899' }
  ];

  const reports = [
    {
      id: "overview",
      name: "Company Overview",
      icon: BarChart3,
      description: "High-level company metrics and KPIs",
      color: "blue"
    },
    {
      id: "financial",
      name: "Financial Report",
      icon: DollarSign,
      description: "Revenue, expenses, and profitability analysis",
      color: "emerald"
    },
    {
      id: "hr",
      name: "HR Analytics",
      icon: Users,
      description: "Employee statistics, turnover, and demographics",
      color: "purple"
    },
    {
      id: "attendance",
      name: "Attendance Report",
      icon: Clock,
      description: "Employee attendance, leave, and punctuality",
      color: "amber"
    },
    {
      id: "performance",
      name: "Performance Review",
      icon: Star,
      description: "Employee performance metrics and ratings",
      color: "pink"
    },
    {
      id: "recruitment",
      name: "Recruitment Pipeline",
      icon: Briefcase,
      description: "Hiring metrics and candidate tracking",
      color: "indigo"
    }
  ];

  const getColorClass = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      emerald: 'bg-emerald-100 text-emerald-600',
      purple: 'bg-purple-100 text-purple-600',
      amber: 'bg-amber-100 text-amber-600',
      pink: 'bg-pink-100 text-pink-600',
      indigo: 'bg-indigo-100 text-indigo-600'
    };
    return colors[color] || colors.blue;
  };

  const handleExportReport = () => {
    let headers = [];
    let rows = [];
    let filename = `${selectedReport}_report.csv`;

    if (selectedReport === "overview" || selectedReport === "financial") {
      headers = ["Month", "Revenue ($)", "Expenses ($)", "Profit ($)"];
      rows = revenueData.map(d => [d.month, d.revenue, d.expenses, d.profit]);
    } else if (selectedReport === "hr") {
      headers = ["Month", "Total Employees", "Hires", "Attrition"];
      rows = employeeGrowthData.map(d => [d.month, d.employees, d.hires, d.attrition]);
    } else if (selectedReport === "attendance") {
      headers = ["Day", "Present", "Absent", "Late"];
      rows = attendanceData.map(d => [d.day, d.present, d.absent, d.late]);
    } else if (selectedReport === "performance") {
      headers = ["Department", "Score (%)"];
      rows = performanceData.map(d => [d.department, d.score]);
    } else if (selectedReport === "recruitment") {
      headers = ["Stage", "Candidates"];
      rows = recruitmentFunnel.map(d => [d.stage, d.candidates]);
    }

    downloadCSV(filename, headers, rows);
    toast.success(`${selectedReport.toUpperCase()} report exported successfully!`);
  };

  const handleApplyFilters = () => {
    toast.success(`Filters applied for: ${dateRange} range and department: ${selectedDepartment}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleMailReport = () => {
    toast.success("Report emailed to administrative team!");
  };

  const handleShareReport = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Share link copied to clipboard!");
  };

  const handleDateRangeOpen = () => {
    toast.success("Date range selector opened! Defaulted to June 2026.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Generate insights and track company performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleDateRangeOpen}
            className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center space-x-2 bg-white shadow-sm font-medium"
          >
            <Calendar className="h-4 w-4" />
            <span>Jun 1 - Jun 30, 2026</span>
          </button>
          <button 
            onClick={handleExportReport}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center space-x-2 shadow-lg shadow-blue-500/10 font-medium"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedReport === report.id
                  ? `border-blue-500 bg-blue-50/50 shadow-md`
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
              }`}
            >
              <div className={`p-2 rounded-lg ${getColorClass(report.color)} w-fit mb-2`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{report.name}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{report.description}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 90 days</option>
            <option value="year">Last 12 months</option>
          </select>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm"
          >
            <option value="all">All Departments</option>
            <option value="engineering">Engineering</option>
            <option value="sales">Sales</option>
            <option value="marketing">Marketing</option>
            <option value="hr">HR</option>
          </select>

          <button 
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 text-sm font-medium"
          >
            <Filter className="h-4 w-4" />
            <span>Apply Filters</span>
          </button>

          <div className="ml-auto flex items-center space-x-2">
            <button 
              onClick={handlePrint}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white text-gray-500"
              title="Print"
            >
              <Printer className="h-4.5 w-4.5" />
            </button>
            <button 
              onClick={handleMailReport}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white text-gray-500"
              title="Email"
            >
              <Mail className="h-4.5 w-4.5" />
            </button>
            <button 
              onClick={handleShareReport}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white text-gray-500"
              title="Share"
            >
              <Share2 className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Report Content */}
      {selectedReport === "overview" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-gray-800">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">$3.24M</p>
              <p className="text-xs text-emerald-600 mt-1">↑ 12.5% vs last month</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-gray-800">
              <p className="text-sm text-gray-500">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">498</p>
              <p className="text-xs text-emerald-600 mt-1">↑ 16 new hires</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-gray-800">
              <p className="text-sm text-gray-500">Avg Performance</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">91%</p>
              <p className="text-xs text-emerald-600 mt-1">↑ 3% vs last quarter</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-gray-800">
              <p className="text-sm text-gray-500">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">94.2%</p>
              <p className="text-xs text-emerald-600 mt-1">↑ 1.2% vs last month</p>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue ($)" />
                  <Bar dataKey="expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Expenses ($)" />
                  <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} name="Profit ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Growth</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={employeeGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="employees" stroke="#3b82f6" strokeWidth={2} name="Total Employees" />
                    <Line type="monotone" dataKey="hires" stroke="#10b981" strokeWidth={2} name="New Hires" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={departmentDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {departmentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {departmentDistribution.slice(0, 6).map((dept) => (
                  <div key={dept.name} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }}></div>
                    <span className="text-xs text-gray-600">{dept.name}: {dept.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedReport === "financial" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-gray-800">
                <p className="text-sm text-blue-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">$3.24M</p>
                <p className="text-xs text-blue-600 mt-1">↑ 12.5% vs last quarter</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg text-gray-800">
                <p className="text-sm text-amber-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">$2.15M</p>
                <p className="text-xs text-amber-600 mt-1">↑ 5.2% vs last quarter</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg text-gray-800">
                <p className="text-sm text-emerald-600">Net Profit</p>
                <p className="text-2xl font-bold text-gray-900">$1.09M</p>
                <p className="text-xs text-emerald-600 mt-1">↑ 8.3% vs last quarter</p>
              </div>
            </div>
            
            <div className="h-80 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="profit" stroke="#10b981" fill="url(#revenueGrad)" strokeWidth={2} name="Net Profit ($)" />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue ($)" />
                  <Line type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={2} name="Expenses ($)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <button 
              onClick={() => toast.success("Generating detailed PDF report...")}
              className="w-full text-center py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Generate Detailed Financial Report
            </button>
          </div>
        </div>
      )}

      {selectedReport === "hr" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hires vs Attrition</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={employeeGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hires" fill="#10b981" name="New Hires" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="attrition" fill="#ef4444" name="Attrition" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={departmentDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {departmentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedReport === "attendance" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Attendance Breakdown</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceData}>
                  <defs>
                    <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="present" stroke="#3b82f6" fill="url(#attendanceGrad)" strokeWidth={2} name="Present" />
                  <Line type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} name="Late" />
                  <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} name="Absent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {selectedReport === "performance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Performance Score by Department</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="department" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#8b5cf6" name="Score (%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Ranking</h3>
              <div className="space-y-4">
                {[...performanceData].sort((a,b) => b.score - a.score).map((dept, index) => (
                  <div key={dept.department} className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-gray-400 w-5">#{index+1}</span>
                      <span className="text-sm font-medium text-gray-900">{dept.department}</span>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">{dept.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedReport === "recruitment" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recruitment Pipeline Funnel</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recruitmentFunnel} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="candidates" name="Candidates count" fill="#6366f1" radius={[0, 4, 4, 0]}>
                    {recruitmentFunnel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Saved Reports */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Saved Reports</h3>
          <button 
            onClick={() => toast.success("Opening saved reports directory...")}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer bg-white">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Q2 2026 Report</h4>
                <p className="text-xs text-gray-500 mt-0.5">Generated Jun 30, 2026</p>
              </div>
            </div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer bg-white">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-emerald-600" />
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Employee Satisfaction</h4>
                <p className="text-xs text-gray-500 mt-0.5">Generated Jun 25, 2026</p>
              </div>
            </div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer bg-white">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-purple-600" />
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Recruitment Funnel</h4>
                <p className="text-xs text-gray-500 mt-0.5">Generated Jun 20, 2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
