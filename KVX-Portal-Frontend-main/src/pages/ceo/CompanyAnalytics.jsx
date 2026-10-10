import { useState } from "react";
import {
  TrendingUp,
  Users,
  DollarSign,
  Building2,
  Activity,
  Download,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Target,
  Award,
  PieChart,
  BarChart3,
  LineChart,
  Globe
} from "lucide-react";

const CompanyAnalytics = () => {
  const [timeRange, setTimeRange] = useState("monthly");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  const kpis = [
    { label: "Revenue", value: "$12.4M", change: "+15.3%", trend: "up", icon: DollarSign, color: "green" },
    { label: "Active Users", value: "8,247", change: "+12.5%", trend: "up", icon: Users, color: "blue" },
    { label: "Growth Rate", value: "23.4%", change: "+5.2%", trend: "up", icon: TrendingUp, color: "purple" },
    { label: "Market Share", value: "18.2%", change: "+2.1%", trend: "up", icon: Globe, color: "amber" },
  ];

  const revenueData = [
    { month: "Jan", revenue: 8.2, target: 7.5, profit: 2.1 },
    { month: "Feb", revenue: 8.9, target: 8.0, profit: 2.4 },
    { month: "Mar", revenue: 9.4, target: 8.5, profit: 2.8 },
    { month: "Apr", revenue: 10.1, target: 9.0, profit: 3.1 },
    { month: "May", revenue: 10.8, target: 9.5, profit: 3.3 },
    { month: "Jun", revenue: 11.5, target: 10.0, profit: 3.6 },
    { month: "Jul", revenue: 12.4, target: 10.5, profit: 3.9 },
  ];

  const userGrowthData = [
    { month: "Jan", users: 5200, new: 380 },
    { month: "Feb", users: 5600, new: 400 },
    { month: "Mar", users: 6100, new: 500 },
    { month: "Apr", users: 6700, new: 600 },
    { month: "May", users: 7200, new: 500 },
    { month: "Jun", users: 7800, new: 600 },
    { month: "Jul", users: 8247, new: 447 },
  ];

  const departmentPerformance = [
    { dept: "Engineering", budget: "$2.5M", revenue: "$4.2M", efficiency: 94, headcount: 45 },
    { dept: "Sales", budget: "$1.8M", revenue: "$5.1M", efficiency: 89, headcount: 35 },
    { dept: "Marketing", budget: "$1.2M", revenue: "$2.8M", efficiency: 86, headcount: 28 },
    { dept: "HR", budget: "$0.8M", revenue: "$1.2M", efficiency: 92, headcount: 12 },
    { dept: "Finance", budget: "$1.0M", revenue: "$1.8M", efficiency: 95, headcount: 15 },
    { dept: "Operations", budget: "$1.5M", revenue: "$2.3M", efficiency: 88, headcount: 22 },
  ];

  const topProducts = [
    { name: "Enterprise Suite", revenue: "$4.2M", growth: "+24%", share: "34%" },
    { name: "Pro Platform", revenue: "$3.1M", growth: "+18%", share: "25%" },
    { name: "Business Cloud", revenue: "$2.8M", growth: "+32%", share: "22%" },
    { name: "Analytics Pro", revenue: "$1.5M", growth: "+15%", share: "12%" },
    { name: "Mobile App", revenue: "$0.8M", growth: "+8%", share: "7%" },
  ];

  const competitors = [
    { name: "KRAVIX", share: 18.2, trend: "up" },
    { name: "Competitor A", share: 15.4, trend: "down" },
    { name: "Competitor B", share: 12.8, trend: "up" },
    { name: "Competitor C", share: 10.5, trend: "down" },
    { name: "Others", share: 43.1, trend: "stable" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Analytics</h1>
          <p className="text-gray-500 mt-1">Comprehensive overview of company performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
            <button 
              onClick={() => setTimeRange("weekly")}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                timeRange === "weekly" ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Weekly
            </button>
            <button 
              onClick={() => setTimeRange("monthly")}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                timeRange === "monthly" ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setTimeRange("quarterly")}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                timeRange === "quarterly" ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Quarterly
            </button>
          </div>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Download className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-start justify-between">
                <div className={`p-3 bg-${kpi.color}-50 rounded-lg`}>
                  <Icon className={`h-6 w-6 text-${kpi.color}-600`} />
                </div>
                <span className={`flex items-center text-sm font-medium ${
                  kpi.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {kpi.change}
                  {kpi.trend === 'up' ? 
                    <ArrowUpRight className="h-4 w-4 ml-1" /> : 
                    <ArrowDownRight className="h-4 w-4 ml-1" />
                  }
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-4">{kpi.value}</p>
              <p className="text-sm text-gray-500 mt-1">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
            <select className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
              <option>Revenue vs Target</option>
              <option>Revenue vs Profit</option>
              <option>Year over Year</option>
            </select>
          </div>
          <div className="h-64">
            {/* Simple bar chart representation */}
            <div className="flex items-end h-48 space-x-4">
              {revenueData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-purple-100 rounded-t-lg relative" style={{ height: `${(item.revenue/15)*100}%` }}>
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-900">
                      ${item.revenue}M
                    </div>
                  </div>
                  <div className="w-full bg-purple-600 rounded-t-lg mt-1" style={{ height: `${(item.target/15)*100}%` }}></div>
                  <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center space-x-4 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-100 rounded mr-2"></div>
                <span className="text-xs text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-600 rounded mr-2"></div>
                <span className="text-xs text-gray-600">Target</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
            <button className="text-sm text-purple-600 hover:text-purple-700">View Details →</button>
          </div>
          <div className="h-64">
            <div className="flex items-end h-48 space-x-4">
              {userGrowthData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-blue-100 rounded-t-lg" style={{ height: `${(item.users/10000)*100}%` }}>
                    <div className="w-full bg-blue-600 rounded-t-lg" style={{ height: `${(item.new/1000)*100}%` }}></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center space-x-4 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                <span className="text-xs text-gray-600">Total Users</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-100 rounded mr-2"></div>
                <span className="text-xs text-gray-600">New Users</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Department Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Headcount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {departmentPerformance.map((dept, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{dept.dept}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dept.budget}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dept.revenue}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-emerald-600">
                      {((parseInt(dept.revenue.replace('$', '').replace('M', '')) / 
                         parseInt(dept.budget.replace('$', '').replace('M', ''))) * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dept.headcount}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">{dept.efficiency}%</span>
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full">
                        <div 
                          className="h-1.5 bg-purple-600 rounded-full"
                          style={{ width: `${dept.efficiency}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.revenue} • {product.share} share</p>
                </div>
                <span className="text-sm font-medium text-emerald-600">{product.growth}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Market Share */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Share Analysis</h3>
          <div className="space-y-4">
            {competitors.map((comp, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{comp.name}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">{comp.share}%</span>
                  {comp.trend === 'up' && <ArrowUpRight className="h-4 w-4 text-emerald-600" />}
                  {comp.trend === 'down' && <ArrowDownRight className="h-4 w-4 text-rose-600" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyAnalytics;