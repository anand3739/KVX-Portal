import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, CheckCircle, Calendar, FileText,
  BookOpen, Mail, Clock, AlertCircle,
  CheckCheck, Trash2, Filter, Search,
  ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";

// ── Notification type → icon + color + redirect path ─────────────────────────
const NOTIFICATION_CONFIG = {
  leave_approved:   { icon: CheckCircle, color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400", label: "Leave",       path: "/employee/leave"      },
  leave_rejected:   { icon: AlertCircle, color: "bg-rose-100 dark:bg-rose-900/30 text-rose-650 dark:text-rose-400",       label: "Leave",       path: "/employee/leave"      },
  leave_pending:    { icon: Clock,       color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",     label: "Leave",       path: "/employee/leave"      },
  payslip:          { icon: FileText,    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",       label: "Documents",   path: "/employee/documents"  },
  task_assigned:    { icon: CheckCircle, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",   label: "Tasks",       path: "/employee/tasks"      },
  task_due:         { icon: AlertCircle, color: "bg-rose-100 dark:bg-rose-900/30 text-rose-650 dark:text-rose-400",       label: "Tasks",       path: "/employee/tasks"      },
  training:         { icon: BookOpen,    color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",   label: "Learning",    path: "/employee/learning"   },
  attendance:       { icon: Clock,       color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",     label: "Attendance",  path: "/employee/attendance" },
  message:          { icon: Mail,        color: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400",       label: "Mailbox",     path: "/employee/mailbox"    },
  announcement:     { icon: Bell,        color: "bg-orange-100 dark:bg-orange-900/30 text-orange-650 dark:text-orange-400",   label: "General",     path: "/employee/dashboard"  },
  event_reminder:   { icon: Bell,        color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-650 dark:text-indigo-400",   label: "Reminder",    path: "/employee/reminders"  },
  general:          { icon: Bell,        color: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300",       label: "General",     path: "/employee/dashboard"  },
};

// ── Mock notifications store ──────────────────────────────────────────────────
const NOTIF_KEY = "mock_notifications";

const DEFAULT_NOTIFICATIONS = [
  {
    id: 1,
    type: "leave_approved",
    title: "Leave Request Approved",
    message: "Your leave request for July 4–5 has been approved by HR.",
    time: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  },
  {
    id: 2,
    type: "payslip",
    title: "June Payslip Available",
    message: "Your June 2024 payslip is now available. Download it from Documents.",
    time: new Date(Date.now() - 10800000).toISOString(),
    read: false,
  },
  {
    id: 3,
    type: "task_assigned",
    title: "New Task Assigned",
    message: "Sarah Johnson assigned you 'Complete Q3 Performance Review'. Due: Today, 5 PM.",
    time: new Date(Date.now() - 86400000).toISOString(),
    read: false,
  },
  {
    id: 4,
    type: "training",
    title: "New Course Available",
    message: "A new course 'Advanced React Development' is available in Learning portal.",
    time: new Date(Date.now() - 172800000).toISOString(),
    read: true,
  },
  {
    id: 5,
    type: "attendance",
    title: "Attendance Reminder",
    message: "You have not clocked in today. Please mark your attendance.",
    time: new Date(Date.now() - 259200000).toISOString(),
    read: true,
  },
  {
    id: 6,
    type: "task_due",
    title: "Task Due Soon",
    message: "Task 'Code Review for PR #234' is due today at 3:00 PM.",
    time: new Date(Date.now() - 345600000).toISOString(),
    read: true,
  },
  {
    id: 7,
    type: "leave_rejected",
    title: "Leave Request Rejected",
    message: "Your leave request for June 20 was rejected. Reason: Critical sprint week.",
    time: new Date(Date.now() - 432000000).toISOString(),
    read: true,
  },
  {
    id: 8,
    type: "message",
    title: "New Message from HR",
    message: "HR Department sent you a message regarding updated company policies.",
    time: new Date(Date.now() - 518400000).toISOString(),
    read: true,
  },
  {
    id: 9,
    type: "announcement",
    title: "Company Town Hall",
    message: "Quarterly town hall meeting scheduled for July 20 at 11:00 AM.",
    time: new Date(Date.now() - 604800000).toISOString(),
    read: true,
  },
  {
    id: 10,
    type: "payslip",
    title: "May Payslip Available",
    message: "Your May 2024 payslip has been uploaded to Documents.",
    time: new Date(Date.now() - 691200000).toISOString(),
    read: true,
  },
];

export const getNotifications = () => {
  try {
    const stored = localStorage.getItem(NOTIF_KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
    return DEFAULT_NOTIFICATIONS;
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
};

export const saveNotifications = (data) => {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(data));
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatTime = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// ── Component ─────────────────────────────────────────────────────────────────
const EmployeeNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(getNotifications);
  const [filter, setFilter] = useState("all"); // all | unread | read
  const [search, setSearch] = useState("");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    const matchFilter =
      filter === "all" ? true : filter === "unread" ? !n.read : n.read;
    const matchSearch =
      search === "" ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const markRead = (id) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    saveNotifications(updated);
  };

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
    toast.success("All notifications marked as read");
  };

  const deleteNotif = (id, e) => {
    e.stopPropagation();
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    saveNotifications(updated);
    toast.success("Notification removed");
  };

  const handleClick = (notif) => {
    // Mark as read first
    markRead(notif.id);
    // Navigate to the relevant page
    const config = NOTIFICATION_CONFIG[notif.type] || NOTIFICATION_CONFIG.general;
    navigate(config.path);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-slate-700 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-750 transition-all duration-200"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center hover:shadow-md transition-all duration-200">
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{notifications.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/40 p-4 text-center hover:shadow-md transition-all duration-200">
          <p className="text-2xl font-semibold text-blue-700 dark:text-blue-300">{unreadCount}</p>
          <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">Unread</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center hover:shadow-md transition-all duration-200">
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{notifications.length - unreadCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Read</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <div className="flex gap-2">
            {["all", "unread", "read"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 capitalize ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-305 hover:bg-gray-50 dark:hover:bg-slate-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications list */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-450 font-medium">No notifications found</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              {search ? "Try a different search term" : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
            {filtered.map((notif) => {
              const config = NOTIFICATION_CONFIG[notif.type] || NOTIFICATION_CONFIG.general;
              const Icon = config.icon;
              return (
                <div
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={`flex items-start gap-4 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-all duration-150 group ${
                    !notif.read ? "bg-blue-50/50 dark:bg-blue-950/10" : ""
                  }`}
                >
                  {/* Icon */}
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${!notif.read ? "text-gray-900 dark:text-white font-semibold" : "text-gray-700 dark:text-gray-300"}`}>
                        {notif.title}
                      </p>
                      <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0">
                        {formatTime(notif.time)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-blue-500 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 flex items-center gap-1 transition-colors">
                        View details <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>

                  {/* Unread dot + delete */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    {!notif.read && (
                      <span className="h-2 w-2 rounded-full bg-blue-500 mt-1" />
                    )}
                    <button
                      onClick={(e) => deleteNotif(notif.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-rose-950/30 rounded transition-all duration-150"
                    >
                      <Trash2 className="h-4 w-4 text-rose-450 dark:text-rose-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeNotifications;