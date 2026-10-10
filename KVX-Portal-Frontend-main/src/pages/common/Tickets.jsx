import { useState } from "react";
import {
  Plus, Search, X, Clock, CheckCircle, AlertCircle,
  MessageSquare, Send, MoreVertical, Ticket,
  RefreshCcw, Filter, User, Circle, Tag
} from "lucide-react";
import toast from "react-hot-toast";
import { useAdminTheme } from "../../contexts/AdminThemeContext";

const CATEGORIES = ["Technical", "HR", "Admin", "Finance", "IT Support", "Security", "General"];

const PRIORITIES = {
  critical: { label: "Critical", color: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.3)"  },
  high:     { label: "High",     color: "#f97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.3)" },
  medium:   { label: "Medium",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" },
  low:      { label: "Low",      color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)" },
};

const STATUSES = {
  open:       { label: "Open",        color: "#6366f1", bg: "rgba(99,102,241,0.12)",  Icon: Circle     },
  inprogress: { label: "In Progress", color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  Icon: RefreshCcw },
  resolved:   { label: "Resolved",    color: "#10b981", bg: "rgba(16,185,129,0.12)",  Icon: CheckCircle },
  closed:     { label: "Closed",      color: "#6b7280", bg: "rgba(107,114,128,0.12)", Icon: X          },
};

const INITIAL_TICKETS = [
  { id: "TKT-001", title: "Unable to access payroll portal", category: "Technical", priority: "high", status: "open", description: "Getting 403 error when trying to access the payroll section. This is blocking me from processing month-end payroll.", submittedBy: "Sarah Johnson", assignedTo: "IT Team", created: "2026-06-22", comments: [{ from: "IT Team", text: "Looking into the issue now. Checking server access logs.", time: "10:30 AM" }] },
  { id: "TKT-002", title: "Request for laptop upgrade", category: "IT Support", priority: "medium", status: "inprogress", description: "My current laptop (2019 model) is very slow and affecting productivity. Requesting a hardware upgrade.", submittedBy: "Michael Chen", assignedTo: "Admin", created: "2026-06-21", comments: [] },
  { id: "TKT-003", title: "Leave balance discrepancy", category: "HR", priority: "high", status: "open", description: "My leave balance shows 5 days remaining but according to my calculations it should be 12 days. Please verify.", submittedBy: "Emily Davis", assignedTo: "HR Team", created: "2026-06-20", comments: [{ from: "HR Team", text: "We'll review your leave history and revert within 24 hours.", time: "2:00 PM" }] },
  { id: "TKT-004", title: "Software license renewal", category: "Finance", priority: "medium", status: "resolved", description: "Adobe Creative Suite license expires next week. Need renewal approved and processed.", submittedBy: "Robert Taylor", assignedTo: "Finance", created: "2026-06-18", comments: [{ from: "Finance", text: "Approved and renewed. License key has been sent to your email.", time: "4:00 PM" }] },
  { id: "TKT-005", title: "WiFi connectivity issues — Floor 3", category: "IT Support", priority: "critical", status: "inprogress", description: "Multiple employees on floor 3 are experiencing severe WiFi drops throughout the day affecting productivity.", submittedBy: "Lisa Wang", assignedTo: "IT Team", created: "2026-06-22", comments: [] },
  { id: "TKT-006", title: "VPN access request", category: "Security", priority: "low", status: "closed", description: "Requesting VPN access for the upcoming international travel to Singapore office.", submittedBy: "James Brown", assignedTo: "Security", created: "2026-06-15", comments: [{ from: "Security", text: "VPN credentials have been provisioned. Check your email.", time: "9:00 AM" }] },
];

function TicketDetailModal({ ticket, onClose, onUpdateStatus, role, t, isDark }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(ticket.comments || []);
  const [currentStatus, setCurrentStatus] = useState(ticket.status);
  const status = STATUSES[currentStatus];
  const priority = PRIORITIES[ticket.priority];

  const addComment = () => {
    if (!comment.trim()) return;
    const c = { from: (role || "user").toUpperCase(), text: comment, time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) };
    setComments(p => [...p, c]);
    setComment("");
    toast.success("Comment added!");
  };

  const changeStatus = (s) => { setCurrentStatus(s); onUpdateStatus(ticket.id, s); };

  const modalBg = isDark ? "linear-gradient(145deg,#0d0b1e,#1a1537)" : "#ffffff";
  const dividerColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(100,116,139,0.12)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(5,5,20,0.75)", backdropFilter: "blur(16px)" }}>
      <div className="w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col shadow-2xl max-h-[90vh]"
        style={{ background: modalBg, border: `1px solid ${t.cardBorder}`, animation: "scaleIn 0.3s ease-out" }}>

        {/* Header */}
        <div className="px-6 py-5" style={{ borderBottom: `1px solid ${dividerColor}`, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(248,250,252,0.8)" }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: t.miniCardBg, color: t.textMuted }}>{ticket.id}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: priority.bg, color: priority.color, border: `1px solid ${priority.border}` }}>
                  ● {priority.label}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: status.bg, color: status.color }}>
                  {status.label}
                </span>
              </div>
              <h3 className="font-bold text-lg leading-tight" style={{ color: t.textPrimary }}>{ticket.title}</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ml-4"
              style={{ color: t.textMuted }}
              onMouseEnter={e => e.currentTarget.style.background = t.iconBtnBg}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(167,139,250,0.2) transparent" }}>
          {/* Meta grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Category", value: ticket.category, color: "#818cf8" },
              { label: "Submitted by", value: ticket.submittedBy, color: "#a78bfa" },
              { label: "Assigned to", value: ticket.assignedTo, color: "#34d399" },
              { label: "Created", value: ticket.created, color: "#f59e0b" },
            ].map(m => (
              <div key={m.label} className="rounded-xl p-3" style={{ background: t.miniCardBg, border: `1px solid ${t.cardBorder}` }}>
                <p className="text-[10px] mb-1 uppercase tracking-widest font-semibold" style={{ color: t.textMuted }}>{m.label}</p>
                <p className="text-sm font-semibold" style={{ color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="rounded-2xl p-4" style={{ background: t.miniCardBg, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs mb-2 uppercase tracking-widest font-semibold" style={{ color: t.textMuted }}>Description</p>
            <p className="text-sm leading-relaxed" style={{ color: t.textSecondary }}>{ticket.description}</p>
          </div>

          {/* Status Update (admin/hr/ceo) */}
          {(role === "admin" || role === "hr" || role === "ceo") && (
            <div className="rounded-2xl p-4" style={{ background: t.miniCardBg, border: `1px solid ${t.cardBorder}` }}>
              <p className="text-xs mb-3 uppercase tracking-widest font-semibold" style={{ color: t.textMuted }}>Update Status</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(STATUSES).map(([key, val]) => (
                  <button key={key} onClick={() => changeStatus(key)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                    style={{
                      background: currentStatus === key ? val.bg : t.tabInactiveBg,
                      color: currentStatus === key ? val.color : t.tabInactiveColor,
                      border: `1px solid ${currentStatus === key ? val.color + "55" : "transparent"}`
                    }}>
                    {val.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <p className="text-xs mb-3 uppercase tracking-widest font-semibold" style={{ color: t.textMuted }}>Comments ({comments.length})</p>
            <div className="space-y-3">
              {comments.length === 0 && (
                <p className="text-xs text-center py-4" style={{ color: t.textMuted }}>No comments yet. Be the first to comment.</p>
              )}
              {comments.map((c, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                    {c.from.charAt(0)}
                  </div>
                  <div className="flex-1 rounded-xl p-3" style={{ background: t.miniCardBg, border: `1px solid ${t.cardBorder}` }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold" style={{ color: t.textPrimary }}>{c.from}</span>
                      <span className="text-[10px]" style={{ color: t.textMuted }}>{c.time}</span>
                    </div>
                    <p className="text-sm" style={{ color: t.textSecondary }}>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comment Input */}
        <div className="px-6 py-4" style={{ borderTop: `1px solid ${dividerColor}` }}>
          <div className="flex items-center gap-3 p-2.5 rounded-2xl" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}` }}>
            <input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === "Enter" && addComment()}
              placeholder="Add a comment..." className="flex-1 bg-transparent text-sm focus:outline-none"
              style={{ color: t.inputColor }} />
            <button onClick={addComment} disabled={!comment.trim()}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110 flex-shrink-0"
              style={{ background: comment.trim() ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : t.tabInactiveBg }}>
              <Send className="w-3.5 h-3.5" style={{ color: comment.trim() ? "white" : t.textMuted }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RaiseTicketModal({ onSave, onClose, role, t, isDark }) {
  const [form, setForm] = useState({ title: "", category: "Technical", priority: "medium", description: "" });
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const modalBg = isDark ? "linear-gradient(145deg,#1a1537,#0f1629)" : "#ffffff";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(5,5,20,0.75)", backdropFilter: "blur(16px)" }}>
      <div className="w-full max-w-md rounded-3xl p-6 shadow-2xl" style={{ background: modalBg, border: `1px solid ${t.cardBorder}`, animation: "scaleIn 0.3s ease-out" }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-lg" style={{ color: t.textPrimary }}>Raise a Ticket</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ color: t.textMuted }}
            onMouseEnter={e => e.currentTarget.style.background = t.iconBtnBg}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={e => {
          e.preventDefault();
          const id = `TKT-${String(Math.floor(Math.random() * 9000) + 1000)}`;
          onSave({ ...form, id, status: "open", submittedBy: `${(role || "user")[0].toUpperCase() + (role || "user").slice(1)} User`, assignedTo: "Support Team", created: new Date().toISOString().split("T")[0], comments: [] });
          onClose();
        }} className="space-y-4">
          <div>
            <label className="text-xs font-semibold mb-1.5 block uppercase tracking-widest" style={{ color: t.textMuted }}>Subject *</label>
            <input required value={form.title} onChange={f("title")} placeholder="Brief description of the issue..."
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/40"
              style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputColor }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1.5 block uppercase tracking-widest" style={{ color: t.textMuted }}>Category</label>
              <select value={form.category} onChange={f("category")} className="w-full px-3 py-3 rounded-xl text-sm focus:outline-none"
                style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputColor, colorScheme: isDark ? "dark" : "light" }}>
                {CATEGORIES.map(c => <option key={c} value={c} style={{ background: isDark ? "#1a1537" : "#fff" }}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block uppercase tracking-widest" style={{ color: t.textMuted }}>Priority</label>
              <select value={form.priority} onChange={f("priority")} className="w-full px-3 py-3 rounded-xl text-sm focus:outline-none"
                style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputColor, colorScheme: isDark ? "dark" : "light" }}>
                {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k} style={{ background: isDark ? "#1a1537" : "#fff" }}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block uppercase tracking-widest" style={{ color: t.textMuted }}>Description *</label>
            <textarea required value={form.description} onChange={f("description")} rows={5}
              placeholder="Describe the issue in detail — include any error messages, steps to reproduce, and impact..."
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
              🎫 Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Tickets({ role }) {
  const { t, isDark } = useAdminTheme();
  const [tickets, setTickets] = useState(() => {
    try { const s = localStorage.getItem("kvx_tickets"); return s ? JSON.parse(s) : INITIAL_TICKETS; } catch { return INITIAL_TICKETS; }
  });
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [selected, setSelected] = useState(null);
  const [showRaise, setShowRaise] = useState(false);

  const save = d => { setTickets(d); localStorage.setItem("kvx_tickets", JSON.stringify(d)); };
  const addTicket = tk => { save([tk, ...tickets]); toast.success("Ticket submitted! 🎫"); };
  const updateStatus = (id, s) => {
    save(tickets.map(tk => tk.id === id ? { ...tk, status: s } : tk));
    toast.success(`Status updated to ${STATUSES[s].label}`);
  };

  const filtered = tickets.filter(tk => {
    const matchSearch = tk.title.toLowerCase().includes(search.toLowerCase()) || tk.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || tk.status === filterStatus;
    const matchPriority = filterPriority === "all" || tk.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const counts = Object.keys(STATUSES).reduce((a, s) => ({ ...a, [s]: tickets.filter(tk => tk.status === s).length }), {});

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: t.textPrimary }}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              <Ticket className="w-5 h-5 text-white" />
            </div>
            Support Tickets
          </h1>
          <p className="mt-1 ml-1" style={{ color: t.textMuted }}>Raise, track and manage support requests</p>
        </div>
        <button onClick={() => setShowRaise(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}>
          <Plus className="w-4 h-4" /> Raise Ticket
        </button>
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(STATUSES).map(([key, val]) => {
          const { Icon } = val;
          const isActive = filterStatus === key;
          return (
            <button key={key} onClick={() => setFilterStatus(isActive ? "all" : key)}
              className="rounded-2xl p-4 flex items-center gap-4 transition-all text-left hover:scale-[1.02]"
              style={{
                background: isActive ? val.bg : t.cardBg,
                border: `1px solid ${isActive ? val.color + "55" : t.cardBorder}`
              }}>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: val.bg }}>
                <Icon className="w-5 h-5" style={{ color: val.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: t.textPrimary }}>{counts[key] || 0}</p>
                <p className="text-xs" style={{ color: t.textMuted }}>{val.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: t.searchIconColor }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets by title or ID..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
            style={{ background: t.searchBg, border: `1px solid ${t.searchBorder}`, color: t.searchColor }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[["all", "All Priority"], ...Object.entries(PRIORITIES).map(([k, v]) => [k, v.label])].map(([k, l]) => {
            const isActive = filterPriority === k;
            const color = PRIORITIES[k]?.color || "#a78bfa";
            return (
              <button key={k} onClick={() => setFilterPriority(k)}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: isActive ? `${color}22` : t.tabInactiveBg,
                  color: isActive ? color : t.tabInactiveColor,
                  border: isActive ? `1px solid ${color}55` : "1px solid transparent"
                }}>{l}</button>
            );
          })}
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {filtered.map(ticket => {
          const status = STATUSES[ticket.status];
          const priority = PRIORITIES[ticket.priority];
          const { Icon: StatusIcon } = status;
          return (
            <button key={ticket.id} onClick={() => setSelected(ticket)}
              className="w-full rounded-2xl p-5 transition-all duration-200 text-left flex items-start gap-4 group"
              style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderLeft: `3px solid ${status.color}` }}
              onMouseEnter={e => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.07)" : "rgba(99,102,241,0.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = t.cardBg; }}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: status.bg }}>
                <StatusIcon className="w-5 h-5" style={{ color: status.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="text-xs font-bold" style={{ color: t.textMuted }}>{ticket.id}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: priority.bg, color: priority.color, border: `1px solid ${priority.border}` }}>● {priority.label}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(129,140,248,0.12)", color: "#818cf8" }}>{ticket.category}</span>
                </div>
                <h4 className="font-bold text-sm mb-1.5" style={{ color: t.textPrimary }}>{ticket.title}</h4>
                <p className="text-xs line-clamp-1 mb-2" style={{ color: t.textSecondary }}>{ticket.description}</p>
                <div className="flex items-center gap-4 text-[11px]" style={{ color: t.textMuted }}>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{ticket.submittedBy}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ticket.created}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{ticket.comments.length} comments</span>
                </div>
              </div>
              <span className="text-xs px-3 py-1.5 rounded-full font-semibold flex-shrink-0" style={{ background: status.bg, color: status.color }}>
                {status.label}
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-3xl p-16 text-center" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
            <Ticket className="w-12 h-12 mx-auto mb-4" style={{ color: t.textMuted }} />
            <p className="text-sm font-medium" style={{ color: t.textSecondary }}>No tickets found</p>
            <p className="text-xs mt-1" style={{ color: t.textMuted }}>Try adjusting your filters</p>
          </div>
        )}
      </div>

      {selected && <TicketDetailModal ticket={selected} onClose={() => setSelected(null)} onUpdateStatus={updateStatus} role={role} t={t} isDark={isDark} />}
      {showRaise && <RaiseTicketModal onSave={addTicket} onClose={() => setShowRaise(false)} role={role} t={t} isDark={isDark} />}

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
