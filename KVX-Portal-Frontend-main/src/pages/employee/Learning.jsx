import { useState } from "react";
import {
  BookOpen,
  Video,
  Award,
  Clock,
  Play,
  Download,
  Star,
  Filter,
  Search,
  ChevronRight,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Users,
  Calendar
} from "lucide-react";

const Learning = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["All", "Technical", "Soft Skills", "Leadership", "Compliance"];

  const courses = [
    {
      id: 1,
      title: "Advanced React Development",
      description: "Master React hooks, context, and performance optimization",
      category: "Technical",
      type: "video",
      duration: "8 hours",
      lessons: 24,
      progress: 65,
      rating: 4.8,
      enrolled: 1245,
      instructor: "John Smith",
      image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 2,
      title: "Effective Communication",
      description: "Improve verbal and written communication skills",
      category: "Soft Skills",
      type: "interactive",
      duration: "4 hours",
      lessons: 12,
      progress: 30,
      rating: 4.6,
      enrolled: 892,
      instructor: "Sarah Johnson",
      image: "https://images.unsplash.com/photo-1552581234-26160f608093?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 3,
      title: "Leadership Excellence",
      description: "Develop leadership skills and team management",
      category: "Leadership",
      type: "video",
      duration: "12 hours",
      lessons: 36,
      progress: 0,
      rating: 4.9,
      enrolled: 567,
      instructor: "Mike Wilson",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 4,
      title: "Workplace Compliance",
      description: "Essential compliance training for all employees",
      category: "Compliance",
      type: "video",
      duration: "2 hours",
      lessons: 8,
      progress: 100,
      rating: 4.7,
      enrolled: 2341,
      instructor: "HR Team",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
    }
  ];

  const myLearning = [
    {
      id: 1,
      title: "Advanced React Development",
      progress: 65,
      nextLesson: "Custom Hooks",
      deadline: "2024-04-15"
    },
    {
      id: 2,
      title: "Effective Communication",
      progress: 30,
      nextLesson: "Active Listening",
      deadline: "2024-03-30"
    }
  ];

  const achievements = [
    {
      id: 1,
      title: "Quick Learner",
      description: "Completed 5 courses",
      icon: Award,
      earned: true,
      date: "2024-02-15"
    },
    {
      id: 2,
      title: "Tech Expert",
      description: "Completed all technical courses",
      icon: Award,
      earned: false,
      progress: 75
    },
    {
      id: 3,
      title: "Leadership Ready",
      description: "Completed leadership track",
      icon: Award,
      earned: false,
      progress: 30
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning & Development</h1>
          <p className="text-gray-500 mt-1">Enhance your skills and knowledge</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">12</p>
          <p className="text-sm text-gray-500">Enrolled Courses</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">5</p>
          <p className="text-sm text-gray-500">Completed</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">24h</p>
          <p className="text-sm text-gray-500">Learning Hours</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Award className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">3</p>
          <p className="text-sm text-gray-500">Certifications</p>
        </div>
      </div>

      {/* My Learning Progress */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-xl font-semibold mb-4">Continue Learning</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myLearning.map((item) => (
            <div key={item.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-medium mb-2">{item.title}</h3>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{item.progress}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mb-3">
                <div
                  className="bg-white h-2 rounded-full"
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Next: {item.nextLesson}</span>
                <span>Due: {item.deadline}</span>
              </div>
              <button className="mt-3 w-full bg-white text-blue-600 rounded-lg py-2 text-sm font-medium hover:bg-blue-50">
                Continue
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100"
          >
            <div className="h-40 overflow-hidden">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {course.category}
                </span>
              </div>
              
              <p className="text-sm text-gray-500 mb-4">{course.description}</p>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-medium text-gray-900">{course.duration}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Lessons:</span>
                  <span className="font-medium text-gray-900">{course.lessons}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Instructor:</span>
                  <span className="font-medium text-gray-900">{course.instructor}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-amber-400 fill-current" />
                  <span className="text-sm font-medium text-gray-900">{course.rating}</span>
                  <span className="text-sm text-gray-500">({course.enrolled} students)</span>
                </div>
              </div>

              {course.progress > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium text-gray-900">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              ) : null}

              <button className={`w-full mt-4 px-4 py-2 rounded-lg font-medium ${
                course.progress > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
              }`}>
                {course.progress > 0 ? 'Continue' : 'Start Course'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border ${
                achievement.earned
                  ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-full ${
                  achievement.earned ? 'bg-amber-600' : 'bg-gray-400'
                }`}>
                  <achievement.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className={`font-semibold ${
                    achievement.earned ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm ${
                    achievement.earned ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {achievement.description}
                  </p>
                  {!achievement.earned && achievement.progress && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{achievement.progress}% complete</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Learning;