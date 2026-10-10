import { useState } from "react";
import {
  Calendar as CalendarIcon, Clock, MapPin, Plus, X,
  ChevronLeft, ChevronRight, Trash2, Video, Users,
  Bell, Sparkles, Tag, Star
} from "lucide-react";
import toast from "react-hot-toast";
import { useAdminTheme } from "../../contexts/AdminThemeContext";

const TYPE_CONFIG = {
  meeting:  { label: "Meeting",      color: "#3b82f6", bg: "rgba(59,130,246,0.15)",  border: "rgba(59,130,246,0.35)",  emoji: "📅" },
  holiday:  { label: "Holiday",      color: "#ef4444", bg: "rgba(239,68,68,0.15)",   border: "rgba(239,68,68,0.35)",   emoji: "🏖️" },
  training: { label: "Training",     color: "#10b981", bg: "rgba(16,185,129,0.15)",  border: "rgba(16,185,129,0.35)",  emoji: "📚" },
  event:    { label: "Social Event", color: "#a78bfa", bg: "rgba(167,139,250,0.15)", border: "rgba(167,139,250,0.35)", emoji: "🎉" },
  deadline: { label: "Deadline",     color: "#f59e0b", bg: "rgba(245,158,11,0.15)",  border: "rgba(245,158,11,0.35)",  emoji: "⏰" },
};

const INITIAL_EVENTS = [
  { id: 1, title: "Q3 Sprint Planning",      type: "meeting",  date: "2026-06-24", time: "10:00 AM", location: "Zoom Meeting",      desc: "Plan deliverables for Sprint 14 with the full engineering team.", organizer: "IT Team" },
  { id: 2, title: "Independence Day",         type: "holiday",  date: "2026-07-04", time: "All Day",  location: "Office Closed",     desc: "National holiday — office closed.",                              organizer: "HR" },
  { id: 3, title: "React Native Workshop",    type: "training", date: "2026-06-26", time: "2:00 PM",  location: "Training Room B",   desc: "Cross-platform mobile development deep-dive session.",          organizer: "L&D Team" },
  { id: 4, title: "Summer Team Lunch",        type: "event",    date: "2026-06-30", time: "1:00 PM",  location: "Rooftop Garden",    desc: "Company-sponsored lunch, games, and team bonding activities.",  organizer: "HR Team" },
  { id: 5, title: "Q2 Report Deadline",       type: "deadline", date: "2026-06-25", time: "5:00 PM",  location: "All Departments",   desc: "Final Q2 reports must be submitted to finance by EOD.",         organizer: "Finance" },
  { id: 6, title: "Board Meeting",            type: "meeting",  date: "2026-06-28", time: "9:00 AM",  location: "Conference Room A", desc: "Monthly board review and strategic alignment session.",          organizer: "CEO Office" },
];

function AddEventModal({ onAdd, onClose, t, isDark }) {
  const [form, setForm] = useState({ title: "", type: "meeting", date: "", time: "", location: "", desc: "" });
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(5,5,20,0.7)", backdropFilter: "blur(16px)" }}>
      <div className="w-full max-w-md rounded-3xl p-6 shadow-2xl" style={{ background: isDark ? "linear-gradient(145deg,#1a1537,#0f1629)" : "#ffffff", border: `1px solid ${t.cardBorder}`, animation: "scaleIn 0.3s ease-out" }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-lg" style={{ color: t.textPrimary }}>Add Event</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all" style={{ color: t.textMuted }}
            onMouseEnter={e => e.currentTarget.style.background = t.iconBtnBg}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={e => { e.preventDefault(); if (!form.title.trim() || !form.date) return; onAdd({ ...form, id: Date.now(), organizer: "Admin" }); onClose(); }} className="space-y-4">
          <div>
            <label className="text-xs font-semibold mb-1.5 block uppercase tracking-widest" style={{ color: t.textMuted }}>Event Title *</label>
            <input required value={form.title} onChange={f("title")} placeholder="e.g. Q3 Townhall Meeting"
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputColor }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1.5 block uppercase tracking-widest" style={{ color: t.textMuted }}>Type</label>
              <select value={form.type} onChange={f("type")} className="w-full px-3 py-3 rounded-xl text-sm focus:outline-none"
                style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputColor, colorScheme: isDark ? "dark" : "light" }}>
                {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k} style={{ background: isDark ? "#1a1537" : "#fff" }}>{v.emoji} {v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block uppercase tracking-widest" style={{ color: t.textMuted }}>Date *</label>
              <input required type="date" value={form.date} onChange={f("date")}
                className="w-full px-3 py-3 rounded-xl text-sm focus:outline-none"
                style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputColor, colorScheme: isDark ? "dark" : "light" }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1.5 block uppercase tracking-widest" style={{ color: t.textMuted }}>Time</label>
              <input value={form.time} onChange={f("time")} placeholder="e.g. 10:00 AM"
                className="w-full px-3 py-3 rounded-xl text-sm focus:outline-none"
                style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputColor }} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block uppercase tracking-widest" style={{ color: t.textMuted }}>Location</label>
              <input value={form.location} onChange={f("location")} placeholder="Zoom / Office"
                className="w-full px-3 py-3 rounded-xl text-sm focus:outline-none"
                style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputColor }} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block uppercase tracking-widest" style={{ color: t.textMuted }}>Description</label>
            <textarea value={form.desc} onChange={f("desc")} rows={3} placeholder="Brief description..."
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none resize-none"
              style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputColor }} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ border: `1px solid ${t.inputBorder}`, color: t.textSecondary }}>Cancel</button>
            <button type="submit"
              className="flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}>
              🚀 Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Events({ role }) {
  const { t, isDark } = useAdminTheme();
  const [events, setEvents] = useState(() => {
    try { const s = localStorage.getItem("kvx_events"); return s ? JSON.parse(s) : INITIAL_EVENTS; } catch { return INITIAL_EVENTS; }
  });
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1));
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [activeType, setActiveType] = useState("all");

  const save = (d) => { setEvents(d); localStorage.setItem("kvx_events", JSON.stringify(d)); };
  const addEvent = (ev) => { save([...events, ev]); toast.success("Event created! 🎉"); };
  const deleteEvent = (id) => { save(events.filter(e => e.id !== id)); toast.success("Event removed"); };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const today = new Date();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getDayEvents = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => e.date === dateStr);
  };

  const displayEvents = selectedDay
    ? getDayEvents(selectedDay)
    : (activeType === "all" ? events : events.filter(e => e.type === activeType))
        .sort((a, b) => a.date.localeCompare(b.date));

  const canEdit = role === "admin" || role === "ceo" || role === "hr";

  const stats = [
    { label: "Total Events", value: events.length, color: "#a78bfa", bg: "rgba(167,139,250,0.15)", emoji: "📅" },
    { label: "This Month",   value: events.filter(e => e.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)).length, color: "#34d399", bg: "rgba(52,211,153,0.15)", emoji: "📆" },
    { label: "Upcoming",     value: events.filter(e => new Date(e.date) >= today).length, color: "#60a5fa", bg: "rgba(96,165,250,0.15)", emoji: "🔮" },
    { label: "Event Types",  value: Object.keys(TYPE_CONFIG).length, color: "#f59e0b", bg: "rgba(245,158,11,0.15)", emoji: "🏷️" },
  ];

  const calCardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)";
  const calCardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(100,116,139,0.12)";
  const dayCellBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(248,250,252,0.8)";
  const dayCellBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(100,116,139,0.1)";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: t.textPrimary }}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            Events Calendar
          </h1>
          <p className="mt-1 ml-1" style={{ color: t.textMuted }}>Schedule and manage company events across all departments</p>
        </div>
        {canEdit && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold transition-all hover:scale-105 hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}>
            <Plus className="w-4 h-4" /> Add Event
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl p-4 flex items-center gap-4 transition-all hover:scale-[1.02]"
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: s.bg }}>
              {s.emoji}
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs" style={{ color: t.textMuted }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Calendar */}
        <div className="xl:col-span-2 rounded-3xl p-6" style={{ background: calCardBg, border: `1px solid ${calCardBorder}` }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ color: t.textPrimary }}>{monthName} {year}</h2>
            <div className="flex gap-2">
              {[
                { label: "‹", action: () => setCurrentDate(new Date(year, month - 1, 1)) },
                { label: "Today", action: () => { setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDay(null); } },
                { label: "›", action: () => setCurrentDate(new Date(year, month + 1, 1)) },
              ].map(b => (
                <button key={b.label} onClick={b.action}
                  className="px-3 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                  style={{ background: t.iconBtnBg, color: t.iconBtnColor }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.25)"; e.currentTarget.style.color = "#a78bfa"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = t.iconBtnBg; e.currentTarget.style.color = t.iconBtnColor; }}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="text-center text-xs font-bold py-2" style={{ color: t.textMuted }}>{d}</div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day, idx) => {
              const dayEvents = getDayEvents(day);
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = day === selectedDay;
              const isPast = day && new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
              return (
                <button key={idx} onClick={() => day && setSelectedDay(day === selectedDay ? null : day)} disabled={!day}
                  className="rounded-2xl p-2 flex flex-col transition-all duration-200 text-left min-h-[76px]"
                  style={{
                    background: isSelected ? "rgba(99,102,241,0.25)" : isToday ? "rgba(99,102,241,0.15)" : dayCellBg,
                    border: isSelected ? "1px solid rgba(99,102,241,0.6)" : isToday ? "1px solid rgba(99,102,241,0.4)" : `1px solid ${dayCellBorder}`,
                    opacity: !day ? 0 : isPast ? 0.55 : 1,
                    cursor: day ? "pointer" : "default",
                  }}
                  onMouseEnter={e => { if (day && !isSelected) e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.07)" : "rgba(99,102,241,0.06)"; }}
                  onMouseLeave={e => { if (day && !isSelected) e.currentTarget.style.background = isToday ? "rgba(99,102,241,0.15)" : dayCellBg; }}
                >
                  {day && (
                    <>
                      <span className={`text-xs font-bold mb-1 w-6 h-6 rounded-lg flex items-center justify-center`}
                        style={{ background: isToday ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "transparent", color: isToday ? "#fff" : t.textSecondary }}>
                        {day}
                      </span>
                      <div className="space-y-0.5 w-full">
                        {dayEvents.slice(0, 2).map(e => {
                          const tc = TYPE_CONFIG[e.type];
                          return (
                            <div key={e.id} className="text-[9px] px-1.5 py-0.5 rounded-md truncate font-semibold"
                              style={{ background: tc.bg, color: tc.color, borderLeft: `2px solid ${tc.color}` }}>
                              {tc.emoji} {e.title}
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && <div className="text-[9px] font-semibold pl-1" style={{ color: t.textMuted }}>+{dayEvents.length - 2} more</div>}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-5 pt-4" style={{ borderTop: `1px solid ${calCardBorder}` }}>
            {Object.entries(TYPE_CONFIG).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1.5">
                <span className="text-sm">{v.emoji}</span>
                <span className="text-[11px] font-medium" style={{ color: v.color }}>{v.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Events Panel */}
        <div className="rounded-3xl p-6 flex flex-col gap-4" style={{ background: calCardBg, border: `1px solid ${calCardBorder}` }}>
          <div>
            <h3 className="text-base font-bold mb-3" style={{ color: t.textPrimary }}>
              {selectedDay ? `Events — ${selectedDay} ${monthName}` : "All Events"}
            </h3>

            {!selectedDay && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {[["all", "All", "#a78bfa"], ...Object.entries(TYPE_CONFIG).map(([k, v]) => [k, v.emoji, v.color])].map(([k, l, c]) => (
                  <button key={k} onClick={() => setActiveType(k)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                    style={{
                      background: activeType === k ? `${c}25` : t.tabInactiveBg,
                      color: activeType === k ? c : t.tabInactiveColor,
                      border: activeType === k ? `1px solid ${c}50` : "1px solid transparent"
                    }}>{l}</button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px]" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(167,139,250,0.2) transparent" }}>
            {displayEvents.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="w-10 h-10 mx-auto mb-3" style={{ color: t.textMuted }} />
                <p className="text-sm" style={{ color: t.textMuted }}>No events</p>
              </div>
            ) : displayEvents.map(ev => {
              const tc = TYPE_CONFIG[ev.type];
              return (
                <div key={ev.id} className="group rounded-2xl p-4 transition-all duration-200"
                  style={{ background: t.miniCardBg, border: `1px solid ${t.cardBorder}`, borderLeft: `3px solid ${tc.color}` }}
                  onMouseEnter={el => el.currentTarget.style.background = isDark ? "rgba(255,255,255,0.07)" : "rgba(99,102,241,0.04)"}
                  onMouseLeave={el => el.currentTarget.style.background = t.miniCardBg}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                      {tc.emoji} {tc.label}
                    </span>
                    {canEdit && (
                      <button onClick={() => deleteEvent(ev.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all hover:bg-red-500/15 text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <h4 className="text-sm font-bold mb-1" style={{ color: t.textPrimary }}>{ev.title}</h4>
                  <p className="text-xs mb-3 leading-relaxed line-clamp-2" style={{ color: t.textSecondary }}>{ev.desc}</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px]" style={{ color: t.textMuted }}>
                      <Clock className="w-3 h-3 flex-shrink-0" style={{ color: tc.color }} />
                      {new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {ev.time}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]" style={{ color: t.textMuted }}>
                      <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: tc.color }} />
                      {ev.location}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedDay && (
            <button onClick={() => setSelectedDay(null)}
              className="w-full py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: t.miniCardBg, border: `1px solid ${t.cardBorder}`, color: t.textSecondary }}>
              ← Show All Events
            </button>
          )}
        </div>
      </div>

      {showModal && <AddEventModal onAdd={addEvent} onClose={() => setShowModal(false)} t={t} isDark={isDark} />}

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
