import toast from "react-hot-toast";
import { useState } from "react";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Mail,
  MessageSquare,
  Calendar,
  Users,
  Briefcase,
  DollarSign,
  Shield,
  Settings,
  Star,
  Clock,
  Filter,
  Search,
  CheckCheck,
  Trash2,
  Send,
  Eye,
  MoreVertical,
  X
} from "lucide-react";

const Notifications = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    category: "system",
    priority: "medium",
    sender: "Admin Portal"
  });

  const [notificationList, setNotificationList] = useState([
    {
      id: 1,
      type: "success",
      title: "Payroll Processed Successfully",
      message: "June 2026 payroll has been processed for all employees",
      time: "5 minutes ago",
      read: false,
      icon: CheckCircle,
      category: "payroll",
      priority: "high",
      sender: "Finance Department"
    },
    {
      id: 2,
      type: "info",
      title: "New Leave Request",
      message: "John Doe requested 5 days of annual leave starting next Monday",
      time: "15 minutes ago",
      read: false,
      icon: Calendar,
      category: "leave",
      priority: "medium",
      sender: "HR System"
    },
    {
      id: 3,
      type: "warning",
      title: "System Update Required",
      message: "Security patch available for deployment on main server instance",
      time: "1 hour ago",
      read: false,
      icon: AlertTriangle,
      category: "system",
      priority: "high",
      sender: "IT Department"
    },
    {
      id: 4,
      type: "success",
      title: "New Hire Onboarding",
      message: "Sarah Johnson has completed all onboarding documents and checklists",
      time: "2 hours ago",
      read: true,
      icon: Users,
      category: "hr",
      priority: "medium",
      sender: "HR Team"
    },
    {
      id: 5,
      type: "info",
      title: "Performance Reviews",
      message: "Q2 performance reviews are due in 3 days. Please notify managers.",
      time: "3 hours ago",
      read: true,
      icon: Star,
      category: "performance",
      priority: "low",
      sender: "Management"
    },
    {
      id: 6,
      type: "warning",
      title: "Budget Alert",
      message: "Engineering department is nearing 90% of its quarterly budget limit",
      time: "5 hours ago",
      read: true,
      icon: DollarSign,
      category: "finance",
      priority: "high",
      sender: "Finance System"
    },
    {
      id: 7,
      type: "info",
      title: "New Job Posting",
      message: "Senior Frontend Developer position has been published on careers page",
      time: "1 day ago",
      read: true,
      icon: Briefcase,
      category: "recruitment",
      priority: "medium",
      sender: "Recruitment Team"
    },
    {
      id: 8,
      type: "success",
      title: "Security Audit Completed",
      message: "Quarterly external security audit passed with a high 98% score",
      time: "2 days ago",
      read: true,
      icon: Shield,
      category: "security",
      priority: "high",
      sender: "Security Team"
    }
  ]);

  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Company Town Hall Meeting",
      message: "Join us for the quarterly town hall meeting this Friday at 3 PM to review Q2 performance and update roadmap.",
      date: "2026-06-15",
      important: true,
      author: "CEO Office"
    },
    {
      id: 2,
      title: "New Benefits Package",
      message: "Updated health insurance policies and wellness program benefits are now available on the documents drive.",
      date: "2026-06-14",
      important: true,
      author: "HR Department"
    },
    {
      id: 3,
      title: "Holiday Schedule",
      message: "Independence Day holiday schedule, office closures, and support rotation details have been published.",
      date: "2026-06-13",
      important: false,
      author: "Operations"
    }
  ]);

  const getTypeIcon = (type) => {
    switch(type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'success': return 'bg-emerald-100 text-emerald-600';
      case 'warning': return 'bg-amber-100 text-amber-600';
      case 'info': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'high': return 'bg-rose-100 text-rose-700 border border-rose-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'low': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const unreadCount = notificationList.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotificationList(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read!");
  };

  const handleMarkOneRead = (id) => {
    setNotificationList(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    toast.success("Notification marked as read");
  };

  const handleDeleteNotification = (id) => {
    setNotificationList(prev => prev.filter(n => n.id !== id));
    toast.success("Notification deleted");
  };

  const handleComposeNotification = () => {
    if (!newNotification.title || !newNotification.message) {
      toast.error("Please fill in the title and message fields.");
      return;
    }

    const typeMapping = {
      system: "info",
      payroll: "success",
      leave: "info",
      hr: "success",
      security: "warning",
      performance: "info"
    };

    const iconMapping = {
      system: Info,
      payroll: DollarSign,
      leave: Calendar,
      hr: Users,
      security: Shield,
      performance: Star
    };

    const newEntry = {
      id: Date.now(),
      type: typeMapping[newNotification.category] || "info",
      title: newNotification.title,
      message: newNotification.message,
      time: "Just now",
      read: false,
      icon: iconMapping[newNotification.category] || Bell,
      category: newNotification.category,
      priority: newNotification.priority,
      sender: newNotification.sender
    };

    setNotificationList([newEntry, ...notificationList]);
    setShowComposeModal(false);
    setNewNotification({
      title: "",
      message: "",
      category: "system",
      priority: "medium",
      sender: "Admin Portal"
    });
    toast.success("Notification sent successfully!");
  };

  // Filter notifications based on tab, search, category, and priority
  const filteredNotifications = notificationList.filter(item => {
    if (activeTab === "unread" && item.read) return false;
    if (activeTab === "system" && item.category !== "system") return false;
    // Announcements tab is handled separately

    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    if (priorityFilter !== "all" && item.priority !== priorityFilter) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(term) ||
        item.message.toLowerCase().includes(term) ||
        item.sender.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">Stay updated with system alerts and announcements</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleMarkAllRead}
            className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center space-x-2 bg-white shadow-sm"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Mark all as read</span>
          </button>
          <button 
            onClick={() => setShowComposeModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center space-x-2 shadow-lg shadow-blue-500/10"
          >
            <Send className="h-4 w-4" />
            <span>Send Notification</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{notificationList.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Unread</p>
              <p className="text-3xl font-bold text-rose-600 mt-2">{unreadCount}</p>
            </div>
            <div className="p-3 bg-rose-100 rounded-xl">
              <AlertCircle className="h-6 w-6 text-rose-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Announcements</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{announcements.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">High Priority</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">
                {notificationList.filter(n => n.priority === "high").length}
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {['all', 'unread', 'announcements', 'system'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab !== "announcements" ? (
        <>
          {/* Search & Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="payroll">Payroll</option>
                  <option value="leave">Leave</option>
                  <option value="system">System</option>
                  <option value="hr">HR</option>
                  <option value="security">Security</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <button 
                  onClick={() => {
                    setCategoryFilter("all");
                    setPriorityFilter("all");
                    setSearchTerm("");
                    toast.success("Filters reset");
                  }}
                  className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 bg-white"
                  title="Reset Filters"
                >
                  <Filter className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.map((notification) => {
              const Icon = notification.icon || Bell;
              const typeColor = getTypeColor(notification.type);
              
              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl shadow-sm p-6 border transition-all hover:shadow-md ${
                    notification.read ? 'border-gray-100' : 'border-l-4 border-l-blue-500 border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${typeColor}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                          <p className="text-gray-600 mt-1">{notification.message}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${getPriorityBadge(notification.priority)}`}>
                          {notification.priority}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-500 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {notification.time}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-500">From: {notification.sender}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-500 capitalize">Category: {notification.category}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <button 
                              onClick={() => handleMarkOneRead(notification.id)}
                              className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg"
                              title="Mark as read"
                            >
                              <CheckCheck className="h-4 w-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => setSelectedNotification(notification)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredNotifications.length === 0 && (
              <div className="bg-white rounded-xl p-8 border border-gray-100 text-center text-gray-500">
                No notifications found.
              </div>
            )}
          </div>
        </>
      ) : (
        /* Announcements Section */
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Announcements</h2>
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100/50 transition-colors">
                <div className={`p-2 rounded-lg ${announcement.important ? 'bg-amber-100' : 'bg-blue-100'}`}>
                  <MessageSquare className={`h-5 w-5 ${announcement.important ? 'text-amber-600' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                    {announcement.important && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        Important
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{announcement.message}</p>
                  <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                    <span>{announcement.author}</span>
                    <span>•</span>
                    <span>{new Date(announcement.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notification Preferences */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-800">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Email Notifications</h3>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                <span className="text-sm text-gray-600">Payroll updates</span>
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" defaultChecked />
              </label>
              <label className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                <span className="text-sm text-gray-600">Leave requests</span>
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" defaultChecked />
              </label>
              <label className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                <span className="text-sm text-gray-600">System alerts</span>
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" defaultChecked />
              </label>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Push Notifications</h3>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                <span className="text-sm text-gray-600">Desktop alerts</span>
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" defaultChecked />
              </label>
              <label className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                <span className="text-sm text-gray-600">Mobile notifications</span>
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
              </label>
              <label className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                <span className="text-sm text-gray-600">Browser notifications</span>
                <input type="checkbox" className="rounded text-blue-600" defaultChecked />
              </label>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quiet Hours</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">From</label>
                <input type="time" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" defaultValue="22:00" />
              </div>
              <div>
                <label className="text-xs text-gray-500">To</label>
                <input type="time" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" defaultValue="07:00" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button 
            onClick={() => toast.success("Preferences saved successfully!")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/10 font-medium"
          >
            Save Preferences
          </button>
        </div>
      </div>

      {/* Compose Notification Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 relative text-gray-800">
            <button
              onClick={() => setShowComposeModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Send New Notification</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Server Maintenance Notice"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sender</label>
                <input
                  type="text"
                  value={newNotification.sender}
                  onChange={(e) => setNewNotification({ ...newNotification, sender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newNotification.category}
                    onChange={(e) => setNewNotification({ ...newNotification, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="system">System</option>
                    <option value="payroll">Payroll</option>
                    <option value="leave">Leave</option>
                    <option value="hr">HR</option>
                    <option value="security">Security</option>
                    <option value="performance">Performance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newNotification.priority}
                    onChange={(e) => setNewNotification({ ...newNotification, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  placeholder="Type the message for users..."
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowComposeModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleComposeNotification}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 relative text-gray-800">
            <button
              onClick={() => setSelectedNotification(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getPriorityBadge(selectedNotification.priority)}`}>
                {selectedNotification.priority} Priority
              </span>
              <span className="text-sm text-gray-500">{selectedNotification.time}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedNotification.title}</h3>
            <p className="text-sm text-gray-500 mb-4">From: {selectedNotification.sender}</p>

            <div className="bg-gray-50 p-4 rounded-xl text-sm border border-gray-100 mb-6 leading-relaxed">
              {selectedNotification.message}
            </div>

            <div className="flex space-x-3">
              {!selectedNotification.read && (
                <button
                  onClick={() => {
                    handleMarkOneRead(selectedNotification.id);
                    setSelectedNotification(null);
                  }}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium rounded-xl transition-all"
                >
                  Mark as Read
                </button>
              )}
              <button
                onClick={() => setSelectedNotification(null)}
                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
