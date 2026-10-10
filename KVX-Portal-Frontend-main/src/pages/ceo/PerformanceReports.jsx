import { useState } from "react";
import {
  FileText,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Filter,
  Search,
  Star,
  Award,
  Target,
  BarChart3,
  PieChart,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Printer,
  Share2
} from "lucide-react";

const PerformanceReports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const reports = [
    {
      id: 1,
      name: "Q2 2024 Executive Summary",
      type: "Executive",
      date: "Jul 10, 2024",
      size: "2.4 MB",
      category: "executive",
      author: "CEO Office",
      pages: 24,
      trend: "up",
      metrics: { revenue: "+15.3%", profit: "+12.4%", growth: "+23%" }
    },
    {
      id: 2,
      name: "Financial Performance Report",
      type: "Financial",
      date: "Jul 08, 2024",
      size: "3.1 MB",
      category: "financial",
      author: "Finance Dept",
      pages: 32,
      trend: "up",
      metrics: { revenue: "$48.2M", expenses: "$32.1M", profit: "$16.1M" }
    },
    {
      id: 3,
      name: "Employee Satisfaction Survey",
      type: "HR",
      date: "Jul 05, 2024",
      size: "1.8 MB",
      category: "hr",
      author: "HR Department",
      pages: 18,
      trend: "up",
      metrics: { satisfaction: "4.2/5", participation: "78%", retention: "94%" }
    },
    {
      id: 4,
      name: "Sales Performance Q2",
      type: "Sales",
      date: "Jul 03, 2024",
      size: "2.9 MB",
      category: "sales",
      author: "Sales Team",
      pages: 22,
      trend: "up",
      metrics: { revenue: "$18.5M", deals: "124", pipeline: "$45M" }
    },
    {
      id: 5,
      name: "Marketing ROI Analysis",
      type: "Marketing",
      date: "Jul 01, 2024",
      size: "2.2 MB",
      category: "marketing",
      author: "Marketing Dept",
      pages: 20,
      trend: "up",
      metrics: { roi: "324%", leads: "2,847", conversion: "12.4%" }
    },
    {
      id: 6,
      name: "Product Development Update",
      type: "Product",
      date: "Jun 28, 2024",
      size: "4.5 MB",
      category: "product",
      author: "Product Team",
      pages: 28,
      trend: "up",
      metrics: { features: "8", completion: "76%", timeline: "On Track" }
    },
    {
      id: 7,
      name: "Customer Success Report",
      type: "Customer",
      date: "Jun 25, 2024",
      size: "1.9 MB",
      category: "customer",
      author: "Customer Success",
      pages: 16,
      trend: "up",
      metrics: { satisfaction: "4.8/5", retention: "96%", tickets: "342" }
    },
    {
      id: 8,
      name: "Operational Efficiency Report",
      type: "Operations",
      date: "Jun 22, 2024",
      size: "2.7 MB",
      category: "operations",
      author: "Operations Team",
      pages: 26,
      trend: "down",
      metrics: { efficiency: "86%", costs: "-8%", productivity: "+12%" }
    },
  ];

  const categories = [
    { id: "all", name: "All Reports", count: reports.length },
    { id: "executive", name: "Executive", count: reports.filter(r => r.category === "executive").length },
    { id: "financial", name: "Financial", count: reports.filter(r => r.category === "financial").length },
    { id: "sales", name: "Sales", count: reports.filter(r => r.category === "sales").length },
    { id: "marketing", name: "Marketing", count: reports.filter(r => r.category === "marketing").length },
    { id: "hr", name: "HR", count: reports.filter(r => r.category === "hr").length },
    { id: "product", name: "Product", count: reports.filter(r => r.category === "product").length },
    { id: "operations", name: "Operations", count: reports.filter(r => r.category === "operations").length },
  ];

  const scheduledReports = [
    { name: "Weekly Sales Report", frequency: "Every Monday", nextRun: "Jul 15, 2024", recipients: "Sales Team" },
    { name: "Monthly Financial Summary", frequency: "1st of Month", nextRun: "Aug 01, 2024", recipients: "Executive Team" },
    { name: "Quarterly Review", frequency: "Quarterly", nextRun: "Oct 01, 2024", recipients: "Board Members" },
  ];

  const reportTemplates = [
    { name: "Executive Dashboard", category: "Executive", uses: 156, lastUsed: "Today" },
    { name: "Financial Analysis", category: "Financial", uses: 98, lastUsed: "Yesterday" },
    { name: "Sales Performance", category: "Sales", uses: 203, lastUsed: "Today" },
  ];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Reports</h1>
          <p className="text-gray-500 mt-1">Access and generate comprehensive performance reports</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Schedule Report</span>
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Generate Report
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">48</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Generated This Month</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Scheduled Reports</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Templates</p>
              <p className="text-2xl font-bold text-gray-900">15</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Award className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          <div className="flex items-center space-x-2 overflow-x-auto">
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-medium ${
                  report.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {report.trend === 'up' ? '+' : '-'}12%
                </span>
                {report.trend === 'up' ? 
                  <ArrowUpRight className="h-4 w-4 text-emerald-600" /> : 
                  <ArrowDownRight className="h-4 w-4 text-rose-600" />
                }
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1">{report.name}</h3>
            <p className="text-sm text-gray-500 mb-2">{report.type} • {report.pages} pages</p>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
              <span>{report.date}</span>
              <span>•</span>
              <span>{report.size}</span>
              <span>•</span>
              <span>By {report.author}</span>
            </div>

            {/* Key Metrics */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(report.metrics).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-gray-500 capitalize">{key}</p>
                    <p className="text-sm font-semibold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg" title="Download">
                  <Download className="h-4 w-4 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg" title="View">
                  <Eye className="h-4 w-4 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg" title="Share">
                  <Share2 className="h-4 w-4 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg" title="Print">
                  <Printer className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                View Report
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Scheduled Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Scheduled Reports</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {scheduledReports.map((report, index) => (
            <div key={index} className="p-6 flex items-center justify-between hover:bg-gray-50">
              <div>
                <h4 className="text-sm font-medium text-gray-900">{report.name}</h4>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-gray-500">Frequency: {report.frequency}</span>
                  <span className="text-xs text-gray-500">Next: {report.nextRun}</span>
                  <span className="text-xs text-gray-500">To: {report.recipients}</span>
                </div>
              </div>
              <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                Edit Schedule
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Report Templates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportTemplates.map((template, index) => (
            <div key={index} className="p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <Award className="h-5 w-5 text-purple-600" />
                <span className="text-xs text-gray-400">Used {template.uses} times</span>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">{template.name}</h4>
              <p className="text-xs text-gray-500 mb-3">{template.category}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Last used {template.lastUsed}</span>
                <button className="text-purple-600 hover:text-purple-700 text-xs font-medium">
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceReports;