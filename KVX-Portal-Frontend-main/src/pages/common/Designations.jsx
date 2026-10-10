// Designations.jsx - Fully theme-aware
import { useState } from "react";
import {
  Plus, Search, Edit, Trash2, X, Award,
  TrendingUp
} from "lucide-react";
import toast from "react-hot-toast";
import { useAdminTheme } from "../../contexts/AdminThemeContext";

const DEPARTMENTS = [
  "Engineering", "Human Resources", "Finance", "Marketing",
  "Operations", "Design", "Sales", "Legal", "Product"
];
const LEVELS = [
  "Intern", "Junior", "Mid-Level", "Senior", "Lead",
  "Manager", "Director", "VP", "C-Level"
];

const DEPT_COLORS = {
  "Engineering":      { color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  gradient: "from-blue-500 to-cyan-500" },
  "Human Resources":  { color: "#ec4899", bg: "rgba(236,72,153,0.12)",  gradient: "from-pink-500 to-rose-500" },
  "Finance":          { color: "#10b981", bg: "rgba(16,185,129,0.12)",  gradient: "from-emerald-500 to-teal-500" },
  "Marketing":        { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  gradient: "from-yellow-500 to-orange-500" },
  "Operations":       { color: "#6366f1", bg: "rgba(99,102,241,0.12)",  gradient: "from-indigo-500 to-purple-500" },
  "Design":           { color: "#a78bfa", bg: "rgba(167,139,250,0.12)", gradient: "from-violet-500 to-purple-500" },
  "Sales":            { color: "#f97316", bg: "rgba(249,115,22,0.12)",  gradient: "from-orange-500 to-red-500" },
  "Legal":            { color: "#14b8a6", bg: "rgba(20,184,166,0.12)",  gradient: "from-teal-500 to-cyan-500" },
  "Product":          { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)",  gradient: "from-purple-500 to-violet-500" },
};

const INITIAL_DESIGNATIONS = [
  { id: 1,  title: "Software Engineer",        department: "Engineering",     level: "Mid-Level", salaryMin: 70000,  salaryMax: 100000, headcount: 24, icon: "💻" },
  { id: 2,  title: "HR Manager",               department: "Human Resources", level: "Manager",   salaryMin: 65000,  salaryMax: 90000,  headcount: 5,  icon: "👥" },
  { id: 3,  title: "Product Manager",          department: "Product",         level: "Senior",    salaryMin: 90000,  salaryMax: 130000, headcount: 8,  icon: "📋" },
  { id: 4,  title: "UI/UX Designer",           department: "Design",          level: "Senior",    salaryMin: 75000,  salaryMax: 105000, headcount: 10, icon: "🎨" },
  { id: 5,  title: "Financial Analyst",        department: "Finance",         level: "Mid-Level", salaryMin: 68000,  salaryMax: 95000,  headcount: 7,  icon: "📊" },
  { id: 6,  title: "Marketing Specialist",     department: "Marketing",       level: "Junior",    salaryMin: 45000,  salaryMax: 65000,  headcount: 12, icon: "📣" },
  { id: 7,  title: "DevOps Engineer",          department: "Engineering",     level: "Senior",    salaryMin: 95000,  salaryMax: 135000, headcount: 6,  icon: "⚙️" },
  { id: 8,  title: "Sales Representative",     department: "Sales",           level: "Mid-Level", salaryMin: 50000,  salaryMax: 80000,  headcount: 20, icon: "🤝" },
  { id: 9,  title: "Chief Technology Officer", department: "Engineering",     level: "C-Level",   salaryMin: 180000, salaryMax: 250000, headcount: 1,  icon: "🚀" },
  { id: 10, title: "Legal Counsel",            department: "Legal",           level: "Senior",    salaryMin: 120000, salaryMax: 160000, headcount: 3,  icon: "⚖️" },
  { id: 11, title: "Operations Manager",       department: "Operations",      level: "Manager",   salaryMin: 80000,  salaryMax: 110000, headcount: 4,  icon: "🏭" },
  { id: 12, title: "Data Scientist",           department: "Engineering",     level: "Senior",    salaryMin: 100000, salaryMax: 145000, headcount: 5,  icon: "🔬" },
];

const ICONS = ["💻","👥","📋","🎨","📊","📣","⚙️","🤝","🚀","💼","🔐","📱","🌐","📈","🏆","⚖️","🔬","🏭","🎯","💡","📌","🧠","🌟","⚡"];

/* ─── Modal ─────────────────────────────────────────────────── */
function DesignationModal({ designation, onSave, onClose }) {
  const { t, isDark } = useAdminTheme();
  const [form, setForm] = useState(
    designation || { title: "", department: "Engineering", level: "Mid-Level", salaryMin: "", salaryMax: "", headcount: "", icon: "💼" }
  );
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const labelStyle = { color: t.textMuted, fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: isDark ? "rgba(5,5,20,0.80)" : "rgba(15,23,42,0.5)", backdropFilter: "blur(16px)" }}
    >
      <div
        className="w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-scaleIn"
        style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: t.btnPrimaryBg }}
            >
              <Award className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-lg" style={{ color: t.textPrimary }}>
              {designation ? "Edit Designation" : "New Designation"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ color: t.textMuted, background: "transparent" }}
            onMouseEnter={e => { e.currentTarget.style.background = t.iconBtnBg; e.currentTarget.style.color = t.textPrimary; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.textMuted; }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            onSave({
              ...form,
              id: designation?.id || Date.now(),
              headcount: Number(form.headcount) || 0,
              salaryMin: Number(form.salaryMin) || 0,
              salaryMax: Number(form.salaryMax) || 0
            });
            onClose();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block" style={labelStyle}>Job Title *</label>
              <input
                required
                value={form.title}
                onChange={f("title")}
                placeholder="e.g. Software Engineer"
                className="w-full px-3 py-3 rounded-xl text-sm focus:outline-none transition-all"
                style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputColor }}
              />
            </div>
            <div>
              <label className="mb-1.5 block" style={labelStyle}>Department</label>
              <select
                value={form.department}
                onChange={f("department")}
                className="w-full px-3 py-3 rounded-xl text-sm focus:outline-none"
                style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.textPrimary }}
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d} style={{ background: isDark ? "#1e293b" : "#fff" }}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1.5 block" style={labelStyle}>Level</label>
              <select
                value={form.level}
                onChange={f("level")}
                className="w-full px-3 py-3 rounded-xl text-sm focus:outline-none"
                style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.textPrimary }}
              >
                {LEVELS.map(l => (
                  <option key={l} value={l} style={{ background: isDark ? "#1e293b" : "#fff" }}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block" style={labelStyle}>Min Salary ($)</label>
              <input
                type="number"
                value={form.salaryMin}
                onChange={f("salaryMin")}
                placeholder="50000"
                className="w-full px-3 py-3 rounded-xl text-sm focus:outline-none"
                style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputColor }}
              />
            </div>
            <div>
              <label className="mb-1.5 block" style={labelStyle}>Max Salary ($)</label>
              <input
                type="number"
                value={form.salaryMax}
                onChange={f("salaryMax")}
                placeholder="80000"
                className="w-full px-3 py-3 rounded-xl text-sm focus:outline-none"
                style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputColor }}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block" style={labelStyle}>Headcount</label>
            <input
              type="number"
              value={form.headcount}
              onChange={f("headcount")}
              placeholder="Number of employees in this role"
              className="w-full px-3 py-3 rounded-xl text-sm focus:outline-none"
              style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputColor }}
            />
          </div>

          <div>
            <label className="mb-2 block" style={labelStyle}>Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, icon }))}
                  className="w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: form.icon === icon ? t.tabActiveBg : t.inputBg,
                    border: form.icon === icon ? `2px solid ${t.accentPurple}` : `1px solid ${t.inputBorder}`
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ border: `1px solid ${t.inputBorder}`, color: t.textMuted, background: "transparent" }}
              onMouseEnter={e => { e.currentTarget.style.background = t.iconBtnBg; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: t.btnPrimaryBg, boxShadow: isDark ? "0 4px 20px rgba(99,102,241,0.35)" : "0 4px 15px rgba(37,99,235,0.25)" }}
            >
              {designation ? "✏️ Update" : "✅ Create"} Designation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function Designations({ role }) {
  const { t, isDark } = useAdminTheme();
  const [designations, setDesignations] = useState(() => {
    try {
      const s = localStorage.getItem("kvx_designations");
      return s ? JSON.parse(s) : INITIAL_DESIGNATIONS;
    } catch {
      return INITIAL_DESIGNATIONS;
    }
  });
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const save = d => {
    setDesignations(d);
    localStorage.setItem("kvx_designations", JSON.stringify(d));
  };

  const handleSave = d => {
    if (d.id && designations.find(x => x.id === d.id)) {
      save(designations.map(x => (x.id === d.id ? d : x)));
      toast.success("Designation updated! ✏️");
    } else {
      save([...designations, d]);
      toast.success("Designation created! 🎉");
    }
  };

  const handleDelete = id => {
    if (window.confirm("Delete this designation?")) {
      save(designations.filter(d => d.id !== id));
      toast.success("Deleted");
    }
  };

  const filtered = designations.filter(d =>
    (filterDept === "All" || d.department === filterDept) &&
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  const canEdit = role === "admin" || role === "ceo";
  const totalHeadcount = designations.reduce((s, d) => s + (d.headcount || 0), 0);
  const avgSalary = Math.round(
    designations.reduce((s, d) => s + ((d.salaryMin + d.salaryMax) / 2), 0) / designations.length
  );
  const departments = [...new Set(designations.map(d => d.department))];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: t.textPrimary }}>
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: t.btnPrimaryBg }}
            >
              <Award className="w-5 h-5 text-white" />
            </div>
            Designations
          </h1>
          <p className="mt-1 ml-1 text-sm" style={{ color: t.textMuted }}>
            Manage job titles and roles across your organisation
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => { setEditTarget(null); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold transition-all hover:scale-105 hover:opacity-90"
            style={{
              background: t.btnPrimaryBg,
              boxShadow: isDark ? "0 4px 20px rgba(99,102,241,0.35)" : "0 4px 15px rgba(37,99,235,0.2)"
            }}
          >
            <Plus className="w-4 h-4" /> New Designation
          </button>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Roles",     value: designations.length,  icon: "🏆", color: "#8b5cf6", bg: isDark ? "rgba(139,92,246,0.12)" : "rgba(139,92,246,0.08)" },
          { label: "Total Headcount", value: totalHeadcount,       icon: "👥", color: "#10b981", bg: isDark ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.08)" },
          { label: "Departments",     value: departments.length,   icon: "🏢", color: "#3b82f6", bg: isDark ? "rgba(59,130,246,0.12)" : "rgba(59,130,246,0.08)" },
          { label: "Avg Salary",      value: `$${Math.round(avgSalary/1000)}k`, icon: "💰", color: "#f59e0b", bg: isDark ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.08)" },
        ].map(s => (
          <div
            key={s.label}
            className="rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 hover:scale-[1.02]"
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: s.bg }}
            >
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs font-medium" style={{ color: t.textMuted }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: t.searchIconColor }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search job titles..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
            style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputColor }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", ...DEPARTMENTS].map(dept => {
            const dc = DEPT_COLORS[dept];
            const active = filterDept === dept;
            return (
              <button
                key={dept}
                onClick={() => setFilterDept(dept)}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                style={{
                  background: active ? (dc?.bg || t.tabActiveBg) : t.tabInactiveBg,
                  color: active ? (dc?.color || t.tabActiveColor) : t.tabInactiveColor,
                  border: active ? `1px solid ${(dc?.color || t.accentPurple)}50` : `1px solid ${t.cardBorder}`
                }}
              >
                {dept}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Department Overview ── */}
      {filterDept === "All" && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {departments.slice(0, 10).map(dept => {
            const dc = DEPT_COLORS[dept] || { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" };
            const count = designations.filter(d => d.department === dept).length;
            const headcount = designations.filter(d => d.department === dept).reduce((s, d) => s + d.headcount, 0);
            return (
              <button
                key={dept}
                onClick={() => setFilterDept(dept)}
                className="rounded-2xl p-4 text-left transition-all duration-200 hover:scale-[1.03]"
                style={{ background: dc.bg, border: `1px solid ${dc.color}25` }}
                onMouseEnter={e => (e.currentTarget.style.border = `1px solid ${dc.color}55`)}
                onMouseLeave={e => (e.currentTarget.style.border = `1px solid ${dc.color}25`)}
              >
                <p className="text-sm font-bold truncate" style={{ color: dc.color }}>{dept}</p>
                <p className="text-xs mt-1 font-medium" style={{ color: t.textMuted }}>
                  {count} roles · {headcount} staff
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Designation Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((d, idx) => {
          const dc = DEPT_COLORS[d.department] || { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", gradient: "from-purple-500 to-violet-500" };
          const salaryMid = (d.salaryMin + d.salaryMax) / 2;
          const barPct = Math.min(100, Math.round((salaryMid / 250000) * 100));

          return (
            <div
              key={d.id}
              className="group rounded-3xl p-5 transition-all duration-200 relative animate-fadeIn"
              style={{
                background: t.cardBg,
                border: `1px solid ${t.cardBorder}`,
                borderLeft: `3px solid ${dc.color}`,
                boxShadow: t.cardShadow,
                animationDelay: `${idx * 40}ms`
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${dc.color}50`;
                e.currentTarget.style.boxShadow = `0 8px 24px ${dc.color}15`;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = t.cardBorder;
                e.currentTarget.style.boxShadow = t.cardShadow;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Top Row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br ${dc.gradient}`}
                    style={{ width: "52px", height: "52px", flexShrink: 0, boxShadow: `0 6px 16px ${dc.color}30` }}
                  >
                    {d.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight" style={{ color: t.textPrimary }}>
                      {d.title}
                    </h3>
                    <p className="text-xs mt-0.5 font-medium" style={{ color: dc.color }}>{d.department}</p>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditTarget(d); setShowModal(true); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                      style={{ color: t.textMuted }}
                      onMouseEnter={e => { e.currentTarget.style.background = t.iconBtnBg; e.currentTarget.style.color = t.textPrimary; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.textMuted; }}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                      style={{ color: "#f87171" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Level & Headcount badges */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{
                    background: isDark ? "rgba(139,92,246,0.15)" : "rgba(139,92,246,0.10)",
                    color: "#8b5cf6",
                    border: "1px solid rgba(139,92,246,0.25)"
                  }}
                >
                  {d.level}
                </span>
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{
                    background: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.10)",
                    color: "#10b981",
                    border: "1px solid rgba(16,185,129,0.25)"
                  }}
                >
                  👥 {d.headcount} employees
                </span>
              </div>

              {/* Salary Range */}
              <div
                className="rounded-2xl p-3.5"
                style={{
                  background: isDark ? "rgba(255,255,255,0.03)" : "rgba(241,245,249,0.8)",
                  border: `1px solid ${t.cardBorder}`
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium flex items-center gap-1" style={{ color: t.textMuted }}>
                    <TrendingUp className="w-3 h-3" /> Salary Range
                  </span>
                  <span className="text-sm font-bold" style={{ color: t.textPrimary }}>
                    ${(d.salaryMin / 1000).toFixed(0)}k – ${(d.salaryMax / 1000).toFixed(0)}k
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: t.progressTrack }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${barPct}%`,
                      background: `linear-gradient(90deg, ${dc.color}80, ${dc.color})`
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] font-medium" style={{ color: t.textMuted }}>Entry</span>
                  <span className="text-[10px] font-medium" style={{ color: t.textMuted }}>C-Level</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div
            className="col-span-3 rounded-3xl p-16 text-center"
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}
          >
            <Award className="w-12 h-12 mx-auto mb-4" style={{ color: t.textMuted, opacity: 0.4 }} />
            <p className="text-sm font-medium" style={{ color: t.textMuted }}>No designations found</p>
            {canEdit && (
              <p className="text-xs mt-1" style={{ color: t.textMuted, opacity: 0.6 }}>
                Click "New Designation" to add one
              </p>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <DesignationModal
          designation={editTarget}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
        />
      )}
    </div>
  );
}
