import { useState } from "react";
import {
  TrendingUp,
  Users,
  Award,
  Calendar,
  Clock,
  Star,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Download,
  Filter,
  Search,
  ChevronDown,
  BarChart3,
  Target,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";

const PerformanceReviews = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("q1-2024");

  const reviews = [
    {
      id: 1,
      employee: "John Doe",
      avatar: "JD",
      department: "Engineering",
      reviewer: "Sarah Johnson",
      date: "2024-03-15",
      rating: 4.5,
      status: "completed",
      kpi: 92,
      feedback: "Excellent performance, exceeded expectations"
    },
    {
      id: 2,
      employee: "Jane Smith",
      avatar: "JS",
      department: "HR",
      reviewer: "Mike Wilson",
      date: "2024-03-14",
      rating: 4.2,
      status: "completed",
      kpi: 88,
      feedback: "Good work, needs improvement in communication"
    },
    {
      id: 3,
      employee: "Mike Johnson",
      avatar: "MJ",
      department: "Sales",
      reviewer: "Emily Davis",
      date: "2024-03-20",
      rating: null,
      status: "pending",
      kpi: null,
      feedback: null
    },
    {
      id: 4,
      employee: "Sarah Wilson",
      avatar: "SW",
      department: "Marketing",
      reviewer: "David Brown",
      date: "2024-03-10",
      rating: 4.8,
      status: "completed",
      kpi: 95,
      feedback: "Outstanding creativity and results"
    },
    {
      id: 5,
      employee: "David Brown",
      avatar: "DB",
      department: "Finance",
      reviewer: "Robert Taylor",
      date: "2024-03-18",
      rating: null,
      status: "scheduled",
      kpi: null,
      feedback: null
    }
  ];

  const stats = {
    total: 45,
    completed: reviews.filter(r => r.status === 'completed').length,
    pending: reviews.filter(r => r.status === 'pending').length,
    scheduled: reviews.filter(r => r.status === 'scheduled').length,
    avgRating: 4.5
  };

  const getRatingStars = (rating) => {
    if (!rating) return null;
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating}</span>
      </div>
    );
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Reviews</h1>
          <p className="text-gray-500 mt-1">Manage employee performance evaluations</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800">
            New Review
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">Total Reviews</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
          <p className="text-sm text-gray-500">Scheduled</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Star className="h-8 w-8 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
          <p className="text-sm text-gray-500">Avg Rating</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="q1-2024">Q1 2024</option>
              <option value="q2-2024">Q2 2024</option>
              <option value="q3-2024">Q3 2024</option>
              <option value="q4-2024">Q4 2024</option>
            </select>
            <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
              <option>All Departments</option>
              <option>Engineering</option>
              <option>HR</option>
              <option>Sales</option>
            </select>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviewer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">KPI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {review.avatar}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{review.employee}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{review.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{review.reviewer}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{review.date}</td>
                  <td className="px-6 py-4">{getRatingStars(review.rating)}</td>
                  <td className="px-6 py-4">
                    {review.kpi ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${review.kpi}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-600">{review.kpi}%</span>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(review.status)}`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      {review.status === 'pending' ? 'Start Review' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Engineering</span>
                <span className="font-medium text-gray-900">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Sales</span>
                <span className="font-medium text-gray-900">88%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Marketing</span>
                <span className="font-medium text-gray-900">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">HR</span>
                <span className="font-medium text-gray-900">90%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 w-16">5 Stars</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '20%' }}></div>
              </div>
              <span className="text-sm text-gray-600">8</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 w-16">4 Stars</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <span className="text-sm text-gray-600">18</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 w-16">3 Stars</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                <div className="bg-amber-600 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
              <span className="text-sm text-gray-600">10</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 w-16">2 Stars</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '7%' }}></div>
              </div>
              <span className="text-sm text-gray-600">3</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 w-16">1 Star</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                <div className="bg-rose-600 h-2 rounded-full" style={{ width: '3%' }}></div>
              </div>
              <span className="text-sm text-gray-600">1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceReviews;