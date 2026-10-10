import { useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  MessageSquare,
  Paperclip,
  ArrowRight,
  Send,
  Smile,
  CheckSquare,
  CircleDot,
  Sparkles
} from "lucide-react";
import { useAdminTheme } from "../../contexts/AdminThemeContext";

const TASKS = [
  {
    id: 1,
    title: "Q2 Financial Report Review",
    status: "in-progress",
    priority: "high",
    assignee: "Sarah Johnson",
    dueDate: "Jun 28, 2026",
    startDate: "Jun 22, 2026",
    loggedHours: 12,
    description: "Review and approve the Q2 financial statements before board submission.",
    progress: 72,
    comments: 9,
    attachments: 4,
    tags: ["Finance", "Review"],
    checklist: [
      { label: "Review revenue summary", done: true },
      { label: "Validate expense reconciliation", done: true },
      { label: "Approve final draft", done: false }
    ],
    activity: [
      "Sarah uploaded latest spreadsheet",
      "Michael requested updated tax notes",
      "You added a comment to section 3"
    ]
  },
  {
    id: 2,
    title: "Redesign Dashboard UI",
    status: "pending",
    priority: "medium",
    assignee: "Lisa Wang",
    dueDate: "Jul 05, 2026",
    startDate: "Jun 28, 2026",
    loggedHours: 8,
    description: "Implement the approved dashboard designs across mobile and desktop with smooth transitions.",
    progress: 40,
    comments: 12,
    attachments: 6,
    tags: ["UI", "Design"],
    checklist: [
      { label: "Export Figma assets", done: true },
      { label: "Build React components", done: false },
      { label: "QA visual tests", done: false }
    ],
    activity: [
      "Design team shared component notes",
      "You scheduled a handoff meeting",
      "Prototype approved for review"
    ]
  },
  {
    id: 3,
    title: "Team Building Event Planning",
    status: "completed",
    priority: "low",
    assignee: "Robert Taylor",
    dueDate: "Jun 18, 2026",
    startDate: "Jun 12, 2026",
    loggedHours: 4,
    description: "Finalize event logistics for the summer team building retreat.",
    progress: 100,
    comments: 4,
    attachments: 2,
    tags: ["HR", "Events"],
    checklist: [
      { label: "Confirm venue", done: true },
      { label: "Share agenda", done: true },
      { label: "Send invites", done: true }
    ],
    activity: [
      "Venue confirmed",
      "Catering options approved",
      "Event reminders scheduled"
    ]
  },
  {
    id: 4,
    title: "Server Migration Planning",
    status: "in-progress",
    priority: "high",
    assignee: "Michael Chen",
    dueDate: "Jul 10, 2026",
    startDate: "Jul 01, 2026",
    loggedHours: 18,
    description: "Plan the migration to the new AWS infrastructure with zero downtime.",
    progress: 58,
    comments: 5,
    attachments: 3,
    tags: ["DevOps", "Servers"],
    checklist: [
      { label: "Audit current systems", done: true },
      { label: "Create rollback plan", done: false },
      { label: "Run dry run", done: false }
    ],
    activity: [
      "Infrastructure audit completed",
      "Rollback plan drafted",
      "Environment setup in progress"
    ]
  }
];

const CHAT_THREADS = {
  1: [
    { id: 1, author: "Sarah Johnson", text: "Hey, can you confirm the tax line items?", time: "10:12 AM", mine: false },
    { id: 2, author: "me", text: "Yes — I’m checking the payroll section now.", time: "10:15 AM", mine: true },
    { id: 3, author: "Sarah Johnson", text: "Perfect. Then I’ll update the final PDF.", time: "10:21 AM", mine: false }
  ],
  2: [
    { id: 1, author: "Lisa Wang", text: "Can we add a floating action button to the mobile layout?", time: "09:05 AM", mine: false },
    { id: 2, author: "me", text: "Yes, I’ll prototype it in the next sprint.", time: "09:10 AM", mine: true }
  ],
  3: [
    { id: 1, author: "Robert Taylor", text: "All event visuals are live in the shared folder.", time: "Yesterday", mine: false },
    { id: 2, author: "me", text: "Thanks — I’ll review them tonight.", time: "Yesterday", mine: true }
  ],
  4: [
    { id: 1, author: "Michael Chen", text: "We need a second migration window this week.", time: "8:45 AM", mine: false },
    { id: 2, author: "me", text: "I’m booking the operations team for Thursday.", time: "8:49 AM", mine: true }
  ]
};

const PRIORITY = {
  high: { label: "High", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  medium: { label: "Medium", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  low: { label: "Low", color: "#10b981", bg: "rgba(16,185,129,0.12)" }
};

const STATUS = {
  completed: { label: "Completed", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  "in-progress": { label: "In Progress", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  pending: { label: "Pending", color: "#6366f1", bg: "rgba(99,102,241,0.12)" }
};

function AddTaskModal({ onAdd, onClose }) {
  const { t, isDark } = useAdminTheme();
  const [form, setForm] = useState({ title: "", description: "", assignee: "", dueDate: "", priority: "medium", tags: "" });
  const update = key => e => setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(5,5,20,0.6)", backdropFilter: "blur(16px)" }}>
      <div className="w-full max-w-lg rounded-3xl p-6 shadow-2xl" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-semibold text-slate-500">Add new task</p>
            <h3 className="text-2xl font-bold" style={{ color: t.textPrimary }}>Quick task creation</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition-colors">✕</button>
        </div>

        <form onSubmit={e => {
          e.preventDefault();
          if (!form.title.trim()) return;
          onAdd({
            id: Date.now(),
            title: form.title,
            status: "pending",
            priority: form.priority,
            assignee: form.assignee || "Unassigned",
            dueDate: form.dueDate || "TBD",
            description: form.description || "New task created from the task board.",
            progress: 0,
            comments: 0,
            attachments: 0,
            tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
            checklist: [],
            activity: ["Task created"]
          });
          onClose();
        }} className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
              <span>Task</span>
              <span className="text-slate-400">/ type for commands</span>
            </div>
            <input value={form.title} onChange={update("title")} className="w-full rounded-3xl border border-slate-300/70 bg-slate-900/10 px-4 py-4 text-lg font-semibold text-white outline-none placeholder:text-slate-500" placeholder="Task Name or type '/' for commands" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.05)", borderColor: t.inputBorder, color: t.inputColor }} />
            <textarea value={form.description} onChange={update("description")} rows={4} className="w-full rounded-3xl border px-4 py-4 text-sm outline-none" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputColor }} placeholder="Add description, or write with AI"></textarea>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border p-4" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(243,244,246,0.9)", borderColor: t.cardBorder }}>
              <div className="flex items-center justify-between mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                <span>Details</span>
                <span className="text-indigo-500">Required</span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] mb-1" style={{ color: t.textSecondary }}>Assignee</p>
                  <input value={form.assignee} onChange={update("assignee")} className="w-full rounded-2xl border px-3 py-2 text-sm outline-none" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputColor }} placeholder="Assign to" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] mb-1" style={{ color: t.textSecondary }}>Due date</p>
                  <input type="date" value={form.dueDate} onChange={update("dueDate")} className="w-full rounded-2xl border px-3 py-2 text-sm outline-none" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputColor }} />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] mb-1" style={{ color: t.textSecondary }}>Priority</p>
                  <select value={form.priority} onChange={update("priority")} className="w-full rounded-2xl border px-3 py-2 text-sm outline-none" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputColor }}>
                    {Object.entries(PRIORITY).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border p-4" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(243,244,246,0.9)", borderColor: t.cardBorder }}>
              <div className="flex items-center justify-between mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                <span>Fields</span>
                <button type="button" onClick={() => setForm(prev => ({ ...prev, tags: prev.tags ? `${prev.tags},New field` : "New field" }))} className="text-indigo-500 text-xs font-semibold hover:text-indigo-400 transition-colors">+ Create new field</button>
              </div>
              <div className="space-y-3">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-2 text-xs text-slate-700 dark:bg-white/10 dark:text-slate-200">TO DO</span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-2 text-xs text-slate-700 dark:bg-white/10 dark:text-slate-200">Assignee</span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-2 text-xs text-slate-700 dark:bg-white/10 dark:text-slate-200">Due date</span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-2 text-xs text-slate-700 dark:bg-white/10 dark:text-slate-200">Priority</span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-2 text-xs text-slate-700 dark:bg-white/10 dark:text-slate-200">Tags</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs uppercase tracking-[0.18em] mb-2 text-slate-500">Tags</label>
              <input value={form.tags} onChange={update("tags")} className="w-full rounded-2xl border px-3 py-2 text-sm outline-none" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputColor }} placeholder="Enter tags separated by commas" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 rounded-3xl border py-3 text-sm font-semibold" style={{ borderColor: t.cardBorder, color: t.textSecondary }}>Cancel</button>
            <button type="submit" className="flex-1 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white">Create Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskDetailModal({ task, onClose }) {
  const { t, isDark } = useAdminTheme();
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(5,5,20,0.65)", backdropFilter: "blur(16px)" }}>
      <div className="w-full max-w-2xl rounded-3xl p-6 shadow-2xl" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Task details</p>
            <h2 className="mt-2 text-3xl font-bold" style={{ color: t.textPrimary }}>{task.title}</h2>
            <p className="mt-2 text-sm" style={{ color: t.textSecondary }}>{task.description}</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-800 transition-colors">✕</button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 mb-5">
          <div className="rounded-3xl p-4" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(243,244,246,0.9)", border: `1px solid ${t.cardBorder}` }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</span>
              <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: STATUS[task.status].bg, color: STATUS[task.status].color }}>{STATUS[task.status].label}</span>
            </div>
            <p className="text-sm font-semibold" style={{ color: t.textPrimary }}>Assignee</p>
            <p className="text-sm text-slate-500 mb-3">{task.assignee}</p>
            <p className="text-sm font-semibold" style={{ color: t.textPrimary }}>Priority</p>
            <p className="text-sm text-slate-500 mb-3"><span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: PRIORITY[task.priority].bg, color: PRIORITY[task.priority].color }}>{PRIORITY[task.priority].label}</span></p>
            <p className="text-sm font-semibold" style={{ color: t.textPrimary }}>Due</p>
            <p className="text-sm text-slate-500">{task.dueDate}</p>
          </div>
          <div className="rounded-3xl p-4" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(243,244,246,0.9)", border: `1px solid ${t.cardBorder}` }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Activity</span>
              <span className="text-xs text-indigo-500 font-semibold">{task.activity.length} updates</span>
            </div>
            <div className="space-y-3 text-sm" style={{ color: t.textSecondary }}>
              {task.activity.map(event => (
                <div key={event} className="rounded-3xl px-4 py-3" style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.85)" }}>
                  {event}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-5">
          <div className="rounded-3xl p-4" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.85)" }}>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Comments</p>
            <p className="mt-2 text-2xl font-semibold" style={{ color: t.textPrimary }}>{task.comments}</p>
          </div>
          <div className="rounded-3xl p-4" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.85)" }}>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Files</p>
            <p className="mt-2 text-2xl font-semibold" style={{ color: t.textPrimary }}>{task.attachments}</p>
          </div>
          <div className="rounded-3xl p-4" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.85)" }}>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Progress</p>
            <p className="mt-2 text-2xl font-semibold" style={{ color: t.textPrimary }}>{task.progress}%</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-3xl border px-5 py-3 text-sm font-semibold" style={{ borderColor: t.cardBorder, color: t.textSecondary }}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function TaskBoard({ role }) {
  const { t, isDark } = useAdminTheme();
  const [tasks, setTasks] = useState(TASKS);
  const [selectedTaskId, setSelectedTaskId] = useState(TASKS[0].id);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [chatText, setChatText] = useState("");
  const [chatFiles, setChatFiles] = useState([]);
  const [threads, setThreads] = useState(CHAT_THREADS);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const fileInputRef = useRef(null);
  const chatInputRef = useRef(null);

  const selectedTask = useMemo(() => tasks.find(task => task.id === selectedTaskId) || tasks[0], [tasks, selectedTaskId]);
  const chatMessages = threads[selectedTask?.id] || [];

  const filteredTasks = useMemo(() => tasks.filter(task => {
    const lowerSearch = search.toLowerCase();
    const matchesSearch = task.title.toLowerCase().includes(lowerSearch) || task.assignee.toLowerCase().includes(lowerSearch) || task.tags.some(tag => tag.toLowerCase().includes(lowerSearch));
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [search, statusFilter, tasks]);

  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(task => task.status === "completed").length,
    inProgress: tasks.filter(task => task.status === "in-progress").length,
    pending: tasks.filter(task => task.status === "pending").length
  }), [tasks]);

  const addTask = newTask => {
    setTasks(prev => [...prev, newTask]);
    setSelectedTaskId(newTask.id);
  };

  const updateTask = updates => {
    setTasks(prev => prev.map(task => task.id === selectedTask.id ? { ...task, ...updates } : task));
  };

  const addTaskField = () => updateTask({ tags: [...(selectedTask.tags || []), "New field"] });
  const addSubtask = () => updateTask({ checklist: [...(selectedTask.checklist || []), { label: "New subtask", done: false }] });
  const addDependency = () => updateTask({ activity: [...(selectedTask.activity || []), "Added dependency link"] });
  const createChecklist = () => updateTask({ checklist: [...(selectedTask.checklist || []), { label: "New checklist item", done: false }] });
  const viewTaskBoard = () => {
    setStatusFilter("all");
    setSearch("");
    if (chatInputRef.current) chatInputRef.current.focus();
  };

  const attachFiles = files => {
    if (!files?.length) return;
    setChatFiles(Array.from(files));
  };

  const sendChat = () => {
    if ((!chatText.trim() && chatFiles.length === 0) || !selectedTask) return;
    const message = {
      id: Date.now(),
      author: "me",
      text: chatText.trim(),
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      mine: true,
      attachments: chatFiles.map(file => ({ name: file.name, size: file.size }))
    };
    setThreads(prev => ({ ...prev, [selectedTask.id]: [...(prev[selectedTask.id] || []), message] }));
    setChatText("");
    setChatFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-6 py-10" style={{ perspective: 1400 }}>
      <div className="w-full max-w-[1700px] animate-floatIn">
        <div className="space-y-8 pb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 rounded-3xl px-5 py-4 shadow-soft" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
                <div className="w-12 h-12 rounded-3xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 18px 35px rgba(99,102,241,0.25)" }}>
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: t.textSecondary }}>Welcome back,</p>
                  <h1 className="text-3xl font-bold" style={{ color: t.textPrimary }}>{role === "admin" ? "Team Task Workspace" : "Your Task Workspace"}</h1>
                </div>
              </div>
              <p className="max-w-2xl text-sm" style={{ color: t.textSecondary }}>Manage tasks, track progress, and chat with teammates directly from the task page. The interface works in both light and dark themes.</p>
            </div>
            <button type="button" onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 rounded-3xl px-5 py-3 font-semibold text-white btn-3d" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 20px 40px rgba(99,102,241,0.25)" }}>
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_1.4fr_0.9fr]">
        <section className="rounded-3xl p-4 shadow-soft tilt-3d" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em]" style={{ color: t.textSecondary }}>Tasks</p>
              <h2 className="mt-2 text-2xl font-bold" style={{ color: t.textPrimary }}>Live Task Board</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {[ ["all", "All"], ["in-progress", "In Progress"], ["pending", "Pending"], ["completed", "Completed"] ].map(([key, label]) => (
                <button key={key} onClick={() => setStatusFilter(key)} className="rounded-full px-4 py-2 text-sm font-semibold transition-all" style={{ background: statusFilter === key ? (isDark ? "rgba(99,102,241,0.18)" : "rgba(99,102,241,0.14)") : "transparent", color: statusFilter === key ? (isDark ? "#a78bfa" : "#1f2937") : t.textSecondary, border: statusFilter === key ? `1px solid ${isDark ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.18)"}` : `1px solid ${t.cardBorder}` }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks, assignees or tags" className="w-full rounded-3xl border px-12 py-3 text-sm outline-none" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputColor }} />
          </div>

          <div className="space-y-4 max-h-[780px] overflow-y-auto pr-1">
            {filteredTasks.map(task => {
              const active = task.id === selectedTaskId;
              const status = STATUS[task.status];
              return (
                <button key={task.id} onClick={() => { setSelectedTaskId(task.id); setShowDetail(true); }} className={`w-full rounded-[2rem] p-4 text-left transition-all ${active ? "ring-1 ring-indigo-400/40" : "hover:shadow-soft"}`} style={{ background: active ? (isDark ? "rgba(255,255,255,0.04)" : "rgba(99,102,241,0.06)") : t.cardBg, border: `1px solid ${active ? (isDark ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.12)") : t.cardBorder}` }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-semibold" style={{ color: t.textPrimary }}>{task.title}</span>
                        <span className="rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: status.bg, color: status.color }}>{status.label}</span>
                      </div>
                      <p className="text-sm leading-6" style={{ color: t.textSecondary }}>{task.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {task.tags.map(tag => (
                          <span key={tag} className="rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.04)", color: t.textSecondary }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: status.bg, color: status.color }}>
                        <CircleDot className="w-3 h-3" />{task.priority}
                      </div>
                      <div className="text-xs" style={{ color: t.textSecondary }}>Due {task.dueDate}</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div className="inline-flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(228,232,240,0.7)" }}>
                      <MessageSquare className="w-4 h-4" /> {task.comments} comments
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(228,232,240,0.7)" }}>
                      <Paperclip className="w-4 h-4" /> {task.attachments} files
                    </div>
                  </div>
                </button>
              );
            })}
            {filteredTasks.length === 0 && (
              <div className="rounded-3xl p-8 text-center" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
                <p className="text-sm font-semibold" style={{ color: t.textSecondary }}>No matching tasks found.</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl p-6 shadow-soft tilt-3d task-card-glow animate-floatIn" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <p className="text-sm font-semibold" style={{ color: t.textSecondary }}>Selected Task</p>
              <h2 className="mt-2 text-2xl font-bold" style={{ color: t.textPrimary }}>{selectedTask?.title}</h2>
            </div>
            <div className="inline-flex items-center gap-3 rounded-full px-4 py-2" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(99,102,241,0.08)" }}>
              <span className="text-sm font-semibold" style={{ color: t.textSecondary }}>Assigned to</span>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-200">{selectedTask?.assignee}</span>
            </div>
          </div>

          <div className="rounded-3xl p-4 mb-5" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.9)", border: `1px solid ${t.cardBorder}` }}>
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] items-start">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</span>
                  {Object.entries(STATUS).map(([key, value]) => (
                    <button key={key} onClick={() => updateTask({ status: key })}
                      className={`rounded-full px-3 py-2 text-xs font-semibold transition-all ${selectedTask?.status === key ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`}
                      style={{ border: `1px solid ${t.cardBorder}` }}>
                      {value.label}
                    </button>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl p-4" style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(243,244,246,0.95)" }}>
                    <p className="text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: t.textSecondary }}>Dates</p>
                    <p className="text-sm font-semibold" style={{ color: t.textPrimary }}>Start</p>
                    <p className="text-sm" style={{ color: t.textSecondary }}>{selectedTask?.startDate || "TBD"}</p>
                    <p className="text-sm font-semibold mt-3" style={{ color: t.textPrimary }}>Due</p>
                    <p className="text-sm" style={{ color: t.textSecondary }}>{selectedTask?.dueDate}</p>
                  </div>
                  <div className="rounded-3xl p-4" style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(243,244,246,0.95)" }}>
                    <p className="text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: t.textSecondary }}>Tracking</p>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold" style={{ color: t.textPrimary }}>{selectedTask?.loggedHours} hrs</span>
                      <span className="text-xs text-slate-500">logged</span>
                    </div>
                    <button type="button" onClick={() => updateTask({ loggedHours: (selectedTask?.loggedHours || 0) + 1 })}
                      className="mt-4 rounded-full px-4 py-2 text-xs font-semibold text-white btn-3d" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                      Log 1 hour
                    </button>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-dashed p-4" style={{ borderColor: t.cardBorder }}>
                <p className="text-sm font-semibold mb-3" style={{ color: t.textPrimary }}>Quick settings</p>
                <div className="space-y-3 text-sm" style={{ color: t.textSecondary }}>
                  <div className="flex items-center justify-between gap-4">
                    <span>Status</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">{STATUS[selectedTask?.status]?.label}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Priority</span>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: PRIORITY[selectedTask?.priority]?.bg, color: PRIORITY[selectedTask?.priority]?.color }}>{PRIORITY[selectedTask?.priority]?.label}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Assignee</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">{selectedTask?.assignee}</span>
                  </div>
                </div>
                <div className="mt-5 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <button type="button" onClick={addTaskField} className="w-full text-left btn-3d hover:text-indigo-600 transition-colors">+ Add field</button>
                  <button type="button" onClick={addSubtask} className="w-full text-left btn-3d hover:text-indigo-600 transition-colors">+ Add subtask</button>
                  <button type="button" onClick={addDependency} className="w-full text-left btn-3d hover:text-indigo-600 transition-colors">+ Relate items or add dependencies</button>
                  <button type="button" onClick={createChecklist} className="w-full text-left btn-3d hover:text-indigo-600 transition-colors">+ Create checklist</button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-5">
            <div className="rounded-3xl p-4" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.85)" }}>
              <p className="text-sm font-semibold mb-3" style={{ color: t.textSecondary }}>Progress</p>
              <div className="rounded-full bg-gray-200 h-3 overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb" }}>
                <div className="h-full rounded-full" style={{ width: `${selectedTask?.progress || 0}%`, background: "linear-gradient(90deg,#6366f1,#10b981)" }} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-semibold" style={{ color: t.textSecondary }}>
                <span>{selectedTask?.progress || 0}% complete</span>
                <span>{selectedTask?.dueDate}</span>
              </div>
            </div>
            <div className="grid gap-3">
              {[
                { label: "Comments", value: selectedTask?.comments, icon: MessageSquare },
                { label: "Files", value: selectedTask?.attachments, icon: Paperclip }
              ].map(item => (
                <div key={item.label} className="rounded-3xl p-4 flex items-center gap-3" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.85)" }}>
                  <div className="w-11 h-11 rounded-3xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.12)" }}>
                    <item.icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: t.textPrimary }}>{item.value}</p>
                    <p className="text-xs" style={{ color: t.textSecondary }}>{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-semibold mb-3" style={{ color: t.textSecondary }}>Overview</p>
            <p className="text-sm leading-7" style={{ color: t.textSecondary }}>{selectedTask?.description}</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 mb-6">
            <div className="rounded-3xl p-4" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.85)" }}>
              <p className="text-sm font-semibold mb-3" style={{ color: t.textSecondary }}>Checklist</p>
              <div className="space-y-3">
                {selectedTask?.checklist.map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full grid place-items-center text-xs ${item.done ? "bg-emerald-500 text-white" : "border border-current text-transparent"}`}>
                      {item.done ? <CheckSquare className="w-4 h-4" /> : ""}
                    </span>
                    <span style={{ color: t.textPrimary }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl p-4" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.85)" }}>
              <p className="text-sm font-semibold mb-3" style={{ color: t.textSecondary }}>Recent Activity</p>
              <div className="space-y-3 text-sm" style={{ color: t.textSecondary }}>
                {selectedTask?.activity.map(event => (
                  <div key={event} className="rounded-3xl px-4 py-3" style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(243,244,246,0.9)" }}>
                    <p>{event}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-4" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.85)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold" style={{ color: t.textPrimary }}>Task details</p>
                <p className="text-xs" style={{ color: t.textSecondary }}>Add notes, tags, and deadlines inline.</p>
              </div>
              <button type="button" onClick={viewTaskBoard} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold btn-3d" style={{ background: "rgba(99,102,241,0.12)", color: "#4f46e5" }}>
                <ArrowRight className="w-4 h-4" /> View task board
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl p-4" style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(243,244,246,0.9)" }}>
                <p className="text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: t.textSecondary }}>Assignee</p>
                <p className="font-semibold" style={{ color: t.textPrimary }}>{selectedTask?.assignee}</p>
              </div>
              <div className="rounded-3xl p-4" style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(243,244,246,0.9)" }}>
                <p className="text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: t.textSecondary }}>Priority</p>
                <span className="rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: PRIORITY[selectedTask?.priority]?.bg, color: PRIORITY[selectedTask?.priority]?.color }}>{PRIORITY[selectedTask?.priority]?.label}</span>
              </div>
            </div>
          </div>
        </section>

        <aside className="rounded-3xl p-5 shadow-soft chat-surface tilt-3d" style={{ backdropFilter: "blur(18px)", border: `1px solid ${t.cardBorder}`, minHeight: "680px" }}>
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <p className="text-sm font-semibold" style={{ color: t.textSecondary }}>Task Chat</p>
              <h2 className="mt-2 text-xl font-bold" style={{ color: t.textPrimary }}>Team discussion</h2>
            </div>
            <button onClick={() => chatInputRef.current?.focus()} className="inline-flex items-center gap-2 rounded-3xl px-4 py-3 text-sm font-semibold text-white btn-3d" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              <MessageSquare className="w-4 h-4" /> Message
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            {tasks.map(task => (
              <button key={task.id} onClick={() => { setSelectedTaskId(task.id); setShowDetail(true); }} className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${selectedTaskId === task.id ? "bg-indigo-600 text-white" : "bg-white/80 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`} style={{ border: `1px solid ${t.cardBorder}` }}>
                {task.title}
              </button>
            ))}
          </div>

          <div className="space-y-4 overflow-y-auto pr-1 mb-4" style={{ maxHeight: "calc(100% - 180px)" }}>
            {chatMessages.map(message => (
              <div key={message.id} className={`rounded-3xl p-4 ${message.mine ? "ml-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white" : "bg-white/90 text-slate-900 dark:bg-white/10 dark:text-slate-200"}`} style={{ maxWidth: "90%", border: message.mine ? "none" : `1px solid ${t.cardBorder}` }}>
                <div className="flex items-center gap-2 mb-2 text-[11px] uppercase tracking-[0.18em] font-semibold" style={{ color: message.mine ? "rgba(255,255,255,0.85)" : t.textSecondary }}>
                  {!message.mine && <span>{message.author}</span>}
                  <span>{message.time}</span>
                </div>
                <p className="text-sm leading-7">{message.text}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-current px-4 py-4" style={{ borderColor: t.cardBorder }}>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-full p-2 text-slate-500 hover:text-indigo-500 transition-colors" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.05)" }}>
                <Paperclip className="w-5 h-5" />
              </button>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => attachFiles(e.target.files)} />
              <input ref={chatInputRef} value={chatText} onChange={e => setChatText(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} placeholder="Write a reply..." className="flex-1 bg-transparent text-sm outline-none" style={{ color: t.inputColor }} />
              <button type="button" onClick={sendChat} className="inline-flex h-11 w-11 items-center justify-center rounded-3xl text-white btn-3d" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                <Send className="w-5 h-5" />
              </button>
            </div>
            {chatFiles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                {chatFiles.map(file => (
                  <span key={file.name} className="rounded-full bg-slate-100 px-3 py-2 text-slate-700 dark:bg-white/10 dark:text-slate-200">{file.name}</span>
                ))}
              </div>
            )}
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">This chat is linked to the selected task so comments stay contextual.</div>
          </div>
        </aside>
      </div>
    </div>

    {showModal && <AddTaskModal onAdd={addTask} onClose={() => setShowModal(false)} />}
    {showDetail && <TaskDetailModal task={selectedTask} onClose={() => setShowDetail(false)} />}
    </div>
  </div>
  );
}
