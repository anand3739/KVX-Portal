import { useState, useEffect } from "react";
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp,
  Activity,
  Clock,
  Target,
  AlertTriangle
} from "lucide-react";
import StatCard from "../../components/common/StatCard";
import ChartWidget from "../../components/common/ChartWidget";
import DataTable from "../../components/common/DataTable";
import ActivityFeed from "../../components/common/ActivityFeed";

const CEODashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 1250,
    activeProjects: 48,
    monthlyRevenue: 1250000,
    openPositions: 23,
    employeeGrowth: 12.5,
    revenueGrowth: 8.3,
    avgProductivity: 87,
    profitMargin: 24.5
  });

  // Company growth data
  const employeeGrowthData = [
    { month: 'Jan', employees: 1150 },
    { month: 'Feb', employees: 1180 },
    { month: 'Mar', employees: 1210 },
    { month: 'Apr', employees: 1240 },
    { month: 'May', employees: 1250 },
    { month: 'Jun', employees: 1280 }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 950000 },
    { month: 'Feb', revenue: 1020000 },
    { month: 'Mar', revenue: 1150000 },
    { month: 'Apr', revenue: 1180000 },
    { month: 'May', revenue: 1220000 },
    { month: 'Jun', revenue: 1250000 }
  ];

  // Department performance
  const departmentData = [
    { department: 'Engineering', employees: 450, kpi: 94, status: 'Excellent', budget: 450000 },
    { department: 'Sales', employees: 180, kpi: 88, status: 'Good', budget: 320000 },
    { department: 'Marketing', employees: 95, kpi: 82, status: 'Good', budget: 280000 },
    { department: 'HR', employees: 42, kpi: 91, status: 'Excellent', budget: 120000 },
    { department: 'Finance', employees: 38, kpi: 96, status: 'Excellent', budget: 150000 },
    { department: 'Operations', employees: 445, kpi: 85, status: 'Average', budget: 380000 }
  ];

  // Recent activities
  const recentActivities = [
    { id: 1, user: "John Smith", action: "Completed Q2 review", time: "5 min ago", type: "task" },
    { id: 2, user: "Sarah Johnson", action: "New hire: Senior Developer", time: "15 min ago", type: "hire" },
    { id: 3, user: "Mike Wilson", action: "Budget approval pending", time: "1 hour ago", type: "alert" },
    { id: 4, user: "Emily Brown", action: "Security audit completed", time: "2 hours ago", type: "security" },
    { id: 5, user: "David Lee", action: "New client signed", time: "3 hours ago", type: "success" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CEO Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, here's your company overview</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent("open-modal", { detail: { modalType: "generate_report" } }))}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees.toLocaleString()}
          change={stats.employeeGrowth}
          icon={Users}
          color="purple"
          trend="up"
          subtitle="Active workforce"
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          change={15}
          icon={Briefcase}
          color="blue"
          trend="up"
          subtitle="Across departments"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(stats.monthlyRevenue / 1000000).toFixed(1)}M`}
          change={stats.revenueGrowth}
          icon={DollarSign}
          color="green"
          trend="up"
          subtitle="+12.3% vs last month"
        />
        <StatCard
          title="Open Positions"
          value={stats.openPositions}
          change={-5}
          icon={Target}
          color="orange"
          trend="down"
          subtitle="Critical roles"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget
          type="area"
          title="Employee Growth Trend"
          data={employeeGrowthData}
          dataKey="employees"
          xAxisKey="month"
          colors={["#8b5cf6"]}
          height={350}
        />
        <ChartWidget
          type="area"
          title="Revenue Growth"
          data={revenueData}
          dataKey="revenue"
          xAxisKey="month"
          colors={["#10b981"]}
          height={350}
        />
      </div>

      {/* Department Performance Table */}
      <DataTable
        title="Department Performance Overview"
        columns={[
          { header: "Department", accessor: "department" },
          { header: "Employees", accessor: "employees" },
          { 
            header: "KPI Score", 
            accessor: "kpi",
            render: (value) => (
              <div className="flex items-center">
                <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                  <div 
                    className="h-2 bg-purple-600 rounded-full"
                    style={{ width: `${value}%` }}
                  />
                </div>
                <span>{value}%</span>
              </div>
            )
          },
          { 
            header: "Status", 
            accessor: "status",
            render: (value) => (
              <span className={`px-3 py-1 rounded-full text-xs font-medium
                ${value === 'Excellent' ? 'bg-green-100 text-green-700' :
                  value === 'Good' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'}`}>
                {value}
              </span>
            )
          },
          { 
            header: "Budget", 
            accessor: "budget",
            render: (value) => `$${(value / 1000).toFixed(0)}K`
          }
        ]}
        data={departmentData}
      />

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Metrics */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Company Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-2 text-green-600 mb-2">
                <Activity className="h-4 w-4" />
                <span className="text-xs font-medium">Online</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">847</p>
              <p className="text-xs text-gray-500">employees active</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-2 text-blue-600 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">Today</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">92%</p>
              <p className="text-xs text-gray-500">attendance rate</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-2 text-purple-600 mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Productivity</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">87%</p>
              <p className="text-xs text-gray-500">current index</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-2 text-orange-600 mb-2">
                <Target className="h-4 w-4" />
                <span className="text-xs font-medium">Tasks</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">1,284</p>
              <p className="text-xs text-gray-500">completed today</p>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg
                  ${activity.type === 'task' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'hire' ? 'bg-green-100 text-green-600' :
                    activity.type === 'alert' ? 'bg-red-100 text-red-600' :
                    'bg-purple-100 text-purple-600'}`}>
                  {activity.type === 'task' && <Activity className="h-4 w-4" />}
                  {activity.type === 'hire' && <Users className="h-4 w-4" />}
                  {activity.type === 'alert' && <AlertTriangle className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.user}</p>
                  <p className="text-xs text-gray-500">{activity.action}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Monitoring */}
      <div className="bg-white rounded-2xl shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Security Monitoring</h3>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            System Secure
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 border border-gray-100 rounded-xl">
            <p className="text-sm text-gray-500">Active Sessions</p>
            <p className="text-2xl font-bold text-gray-900">1,247</p>
            <p className="text-xs text-green-600 mt-1">+123 from yesterday</p>
          </div>
          <div className="p-4 border border-gray-100 rounded-xl">
            <p className="text-sm text-gray-500">Failed Logins</p>
            <p className="text-2xl font-bold text-gray-900">23</p>
            <p className="text-xs text-red-600 mt-1">-5 from yesterday</p>
          </div>
          <div className="p-4 border border-gray-100 rounded-xl">
            <p className="text-sm text-gray-500">Suspicious Activities</p>
            <p className="text-2xl font-bold text-gray-900">3</p>
            <p className="text-xs text-yellow-600 mt-1">Under review</p>
          </div>
          <div className="p-4 border border-gray-100 rounded-xl">
            <p className="text-sm text-gray-500">2FA Enabled</p>
            <p className="text-2xl font-bold text-gray-900">98%</p>
            <p className="text-xs text-blue-600 mt-1">of employees</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CEODashboard;