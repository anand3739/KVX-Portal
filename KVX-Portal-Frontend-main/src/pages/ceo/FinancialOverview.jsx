import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Download,
  Calendar,
  CreditCard,
  Wallet,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Shield,
  AlertCircle,
  CheckCircle
} from "lucide-react";

const FinancialOverview = () => {
  const [selectedQuarter, setSelectedQuarter] = useState("Q2 2024");

  const financialSummary = {
    revenue: { value: "$48.2M", change: "+15.3%", trend: "up" },
    expenses: { value: "$32.1M", change: "+8.2%", trend: "up" },
    profit: { value: "$16.1M", change: "+12.4%", trend: "up" },
    margin: { value: "33.4%", change: "+2.1%", trend: "up" },
  };

  const revenueStreams = [
    { name: "Enterprise License", amount: "$24.5M", percentage: 51, trend: "up" },
    { name: "SaaS Subscriptions", amount: "$12.8M", percentage: 27, trend: "up" },
    { name: "Professional Services", amount: "$6.2M", percentage: 13, trend: "up" },
    { name: "Maintenance & Support", amount: "$4.7M", percentage: 9, trend: "down" },
  ];

  const expensesByCategory = [
    { category: "Salaries & Benefits", amount: "$15.2M", percentage: 47, trend: "up" },
    { category: "Infrastructure", amount: "$5.8M", percentage: 18, trend: "up" },
    { category: "Marketing & Sales", amount: "$4.5M", percentage: 14, trend: "up" },
    { category: "R&D", amount: "$3.8M", percentage: 12, trend: "up" },
    { category: "Administrative", amount: "$2.1M", percentage: 7, trend: "down" },
    { category: "Other", amount: "$0.7M", percentage: 2, trend: "down" },
  ];

  const quarterlyData = [
    { quarter: "Q1 2024", revenue: 42.5, expenses: 28.2, profit: 14.3 },
    { quarter: "Q2 2024", revenue: 48.2, expenses: 32.1, profit: 16.1 },
    { quarter: "Q3 2024", revenue: 52.8, expenses: 34.5, profit: 18.3 },
    { quarter: "Q4 2024", revenue: 58.4, expenses: 37.8, profit: 20.6 },
  ];

  const cashFlow = {
    operating: "$12.4M",
    investing: "-$3.2M",
    financing: "-$1.8M",
    net: "$7.4M"
  };

  const financialRatios = [
    { name: "Current Ratio", value: "2.4", benchmark: "> 2.0", status: "good" },
    { name: "Debt-to-Equity", value: "0.6", benchmark: "< 1.0", status: "good" },
    { name: "ROI", value: "18.5%", benchmark: "> 15%", status: "good" },
    { name: "Gross Margin", value: "42.3%", benchmark: "> 40%", status: "good" },
  ];

  const upcomingPayments = [
    { vendor: "Cloud Services Inc.", amount: "$245,000", due: "Jul 15, 2024", status: "pending" },
    { vendor: "Office Rent", amount: "$180,000", due: "Jul 20, 2024", status: "pending" },
    { vendor: "Payroll", amount: "$1,250,000", due: "Jul 25, 2024", status: "scheduled" },
    { vendor: "Vendor Payments", amount: "$95,000", due: "Jul 30, 2024", status: "pending" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
          <p className="text-gray-500 mt-1">Real-time financial metrics and analysis</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option>Q2 2024</option>
            <option>Q1 2024</option>
            <option>Q4 2023</option>
            <option>Q3 2023</option>
          </select>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Download className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
            <span className="flex items-center text-sm font-medium text-emerald-600">
              {financialSummary.revenue.change}
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{financialSummary.revenue.value}</p>
          <p className="text-sm text-gray-500">Total Revenue</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="h-5 w-5 text-amber-600" />
            <span className="flex items-center text-sm font-medium text-amber-600">
              {financialSummary.expenses.change}
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{financialSummary.expenses.value}</p>
          <p className="text-sm text-gray-500">Total Expenses</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <span className="flex items-center text-sm font-medium text-emerald-600">
              {financialSummary.profit.change}
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{financialSummary.profit.value}</p>
          <p className="text-sm text-gray-500">Net Profit</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Percent className="h-5 w-5 text-blue-600" />
            <span className="flex items-center text-sm font-medium text-emerald-600">
              {financialSummary.margin.change}
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{financialSummary.margin.value}</p>
          <p className="text-sm text-gray-500">Profit Margin</p>
        </div>
      </div>

      {/* Revenue vs Expenses Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Quarterly Performance</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-600 rounded mr-2"></div>
              <span className="text-xs text-gray-600">Revenue</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-amber-400 rounded mr-2"></div>
              <span className="text-xs text-gray-600">Expenses</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-emerald-400 rounded mr-2"></div>
              <span className="text-xs text-gray-600">Profit</span>
            </div>
          </div>
        </div>
        <div className="flex items-end h-48 space-x-8">
          {quarterlyData.map((item, idx) => (
            <div key={idx} className="flex-1">
              <div className="relative h-40">
                <div 
                  className="absolute bottom-0 w-full bg-purple-600 rounded-t"
                  style={{ height: `${(item.revenue/70)*100}%` }}
                ></div>
                <div 
                  className="absolute bottom-0 w-full bg-amber-400 rounded-t opacity-70"
                  style={{ height: `${(item.expenses/70)*100}%` }}
                ></div>
                <div 
                  className="absolute bottom-0 w-full bg-emerald-400 rounded-t opacity-70"
                  style={{ height: `${(item.profit/70)*100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">{item.quarter}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Streams & Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Streams</h3>
          <div className="space-y-4">
            {revenueStreams.map((stream, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{stream.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{stream.percentage}%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-900">{stream.amount}</span>
                    {stream.trend === 'up' ? 
                      <ArrowUpRight className="h-4 w-4 text-emerald-600 ml-2" /> : 
                      <ArrowDownRight className="h-4 w-4 text-rose-600 ml-2" />
                    }
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div 
                    className="h-2 bg-purple-600 rounded-full"
                    style={{ width: `${stream.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Categories</h3>
          <div className="space-y-4">
            {expensesByCategory.map((expense, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{expense.category}</span>
                    <span className="text-xs text-gray-500 ml-2">{expense.percentage}%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-900">{expense.amount}</span>
                    {expense.trend === 'up' ? 
                      <ArrowUpRight className="h-4 w-4 text-amber-600 ml-2" /> : 
                      <ArrowDownRight className="h-4 w-4 text-emerald-600 ml-2" />
                    }
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div 
                    className="h-2 bg-amber-400 rounded-full"
                    style={{ width: `${expense.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cash Flow & Ratios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Operating</span>
              <span className="text-sm font-medium text-emerald-600">{cashFlow.operating}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Investing</span>
              <span className="text-sm font-medium text-rose-600">{cashFlow.investing}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Financing</span>
              <span className="text-sm font-medium text-amber-600">{cashFlow.financing}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm font-semibold text-gray-900">Net Cash Flow</span>
              <span className="text-sm font-bold text-purple-600">{cashFlow.net}</span>
            </div>
          </div>
        </div>

        {/* Financial Ratios */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Ratios</h3>
          <div className="space-y-3">
            {financialRatios.map((ratio, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-600">{ratio.name}</span>
                  <span className="text-xs text-gray-400 ml-2">({ratio.benchmark})</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">{ratio.value}</span>
                  {ratio.status === 'good' ? 
                    <CheckCircle className="h-4 w-4 text-emerald-600" /> : 
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Payments */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Payments</h3>
          <div className="space-y-3">
            {upcomingPayments.map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs font-medium text-gray-900">{payment.vendor}</p>
                  <p className="text-xs text-gray-500">Due {payment.due}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-900">{payment.amount}</p>
                  <span className="text-xs text-gray-400">{payment.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview;