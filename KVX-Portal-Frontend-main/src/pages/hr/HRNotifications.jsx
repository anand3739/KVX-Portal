import { useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  CalendarDays,
  Users,
  Briefcase,
  ShieldCheck,
  FileText,
} from "lucide-react";

const initialNotifications = [
  {
    id: 1,
    title: "3 leave requests need review",
    message: "Please review the pending annual leave requests before the end of the day.",
    time: "10 min ago",
    type: "warning",
    read: false,
    category: "leave",
  },
  {
    id: 2,
    title: "New onboarding checklist submitted",
    message: "The onboarding package for Maya Chen is ready for your approval.",
    time: "32 min ago",
    type: "info",
    read: false,
    category: "onboarding",
  },
  {
    id: 3,
    title: "Recruitment interview scheduled",
    message: "A candidate interview for the Frontend Developer role has been booked for tomorrow.",
    time: "1 hour ago",
    type: "success",
    read: true,
    category: "recruitment",
  },
  {
    id: 4,
    title: "Payroll review reminder",
    message: "The payroll summary for this month needs a final HR check.",
    time: "2 hours ago",
    type: "info",
    read: true,
    category: "payroll",
  },
  {
    id: 5,
    title: "Security policy update",
    message: "The latest HR compliance reminder has been published for all team leads.",
    time: "Yesterday",
    type: "warning",
    read: true,
    category: "policy",
  },
];

const typeStyles = {
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-sky-100 text-sky-700",
};

const categoryIcons = {
  leave: CalendarDays,
  onboarding: Users,
  recruitment: Briefcase,
  payroll: FileText,
  policy: ShieldCheck,
};

const HRNotifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeFilter, setActiveFilter] = useState("all");

  const unreadCount = notifications.filter((item) => !item.read).length;

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return notifications;
    return notifications.filter((item) => item.category === activeFilter);
  }, [activeFilter, notifications]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">HR Center</p>
            <h1 className="text-2xl font-semibold text-slate-900">HR Notifications</h1>
            <p className="mt-2 text-sm text-slate-600">
              Keep track of leave approvals, onboarding updates, recruitment tasks, and compliance reminders.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <span className="font-semibold">{unreadCount}</span> unread
            </div>
            <button
              onClick={markAllRead}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              Mark all read
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { label: "All", value: "all" },
          { label: "Leave", value: "leave" },
          { label: "Onboarding", value: "onboarding" },
          { label: "Recruitment", value: "recruitment" },
          { label: "Payroll", value: "payroll" },
          { label: "Policy", value: "policy" },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeFilter === filter.value
                ? "bg-emerald-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredNotifications.map((item) => {
          const Icon = categoryIcons[item.category] || Bell;
          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 shadow-sm transition ${item.read ? "border-slate-200 bg-white" : "border-emerald-200 bg-emerald-50/70"}`}
            >
              <div className="flex items-start gap-3">
                <div className={`rounded-2xl p-2 ${typeStyles[item.type] || "bg-slate-100 text-slate-600"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="font-semibold text-slate-900">{item.title}</h2>
                      <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span>{item.time}</span>
                      {!item.read && (
                        <button
                          onClick={() => markAsRead(item.id)}
                          className="rounded-full bg-white px-3 py-1 font-medium text-emerald-700 shadow-sm"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HRNotifications;
