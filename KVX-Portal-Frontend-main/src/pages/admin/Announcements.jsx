import { useState } from "react";
import {
  Bell, Megaphone, Calendar, Clock, Users, Eye, Edit, Trash2,
  Plus, Pin, Send, Save, AlertCircle, CheckCircle, Filter,
  Search, X
} from "lucide-react";
import toast from "react-hot-toast";

const initialAnnouncements = [
  {
    id: 1, title: "Company Town Hall Meeting",
    content: "Join us for the quarterly town hall meeting to discuss company updates and future plans.",
    author: "CEO Office", date: "2024-01-15", time: "10:00 AM",
    priority: "high", audience: "All Employees", status: "published", views: 1245, pinned: true
  },
  {
    id: 2, title: "New HR Policy Updates",
    content: "Important updates to the company leave policy effective from next month.",
    author: "HR Department", date: "2024-01-14", time: "02:30 PM",
    priority: "medium", audience: "All Employees", status: "published", views: 892, pinned: false
  },
  {
    id: 3, title: "System Maintenance",
    content: "Scheduled maintenance this weekend. Portal will be unavailable for 2 hours.",
    author: "IT Team", date: "2024-01-16", time: "09:00 AM",
    priority: "high", audience: "All Users", status: "scheduled", views: 0, pinned: false
  },
  {
    id: 4, title: "Holiday Schedule 2024",
    content: "Company holidays and important dates for the year 2024.",
    author: "HR Department", date: "2024-01-10", time: "11:15 AM",
    priority: "low", audience: "All Employees", status: "published", views: 2103, pinned: true
  },
  {
    id: 5, title: "New Benefits Program",
    content: "Introducing new health and wellness benefits for all employees.",
    author: "HR Department", date: "2024-01-13", time: "03:45 PM",
    priority: "medium", audience: "All Employees", status: "draft", views: 0, pinned: false
  }
];

const emptyForm = {
  title: "", content: "", audience: "All Employees",
  priority: "medium", date: "", time: "", pinned: false
};

const Announcements = () => {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priority");
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  /* ── helpers ─────────────────────────────────────────────── */
  const getPriorityBadge = (p) => ({
    high: "bg-rose-100 text-rose-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-emerald-100 text-emerald-700"
  }[p] || "bg-gray-100 text-gray-700");

  const getStatusBadge = (s) => ({
    published: "bg-emerald-100 text-emerald-700",
    draft: "bg-gray-100 text-gray-700",
    scheduled: "bg-blue-100 text-blue-700"
  }[s] || "bg-gray-100 text-gray-700");

  const filtered = announcements.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "All Status" || a.status === statusFilter.toLowerCase();
    const matchPriority = priorityFilter === "All Priority" || a.priority === priorityFilter.toLowerCase();
    return matchSearch && matchStatus && matchPriority;
  });

  /* ── CRUD ───────────────────────────────────────────────── */
  const handleCreate = () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required.");
      return;
    }
    const now = new Date();
    const newAnn = {
      id: Date.now(), ...form,
      author: "Admin User",
      date: form.date || now.toISOString().split("T")[0],
      time: form.time || now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "draft", views: 0
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    setShowCreateModal(false);
    setForm(emptyForm);
    toast.success("Announcement created as draft!");
  };

  const openEdit = (ann) => {
    setEditTarget(ann);
    setEditForm({ title: ann.title, content: ann.content, audience: ann.audience, priority: ann.priority, date: ann.date, time: ann.time, pinned: ann.pinned });
  };

  const handleSaveEdit = () => {
    if (!editForm.title.trim() || !editForm.content.trim()) {
      toast.error("Title and content are required.");
      return;
    }
    setAnnouncements(prev => prev.map(a => a.id === editTarget.id ? { ...a, ...editForm } : a));
    setEditTarget(null);
    toast.success("Announcement updated!");
  };

  const handleDelete = () => {
    setAnnouncements(prev => prev.filter(a => a.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast.success("Announcement deleted.");
  };

  const handlePublish = (ann) => {
    setAnnouncements(prev => prev.map(a => a.id === ann.id ? { ...a, status: "published" } : a));
    toast.success(`"${ann.title}" published!`);
  };

  const togglePin = (ann) => {
    setAnnouncements(prev => prev.map(a => a.id === ann.id ? { ...a, pinned: !a.pinned } : a));
    toast.success(ann.pinned ? "Unpinned." : "Pinned!");
  };

  const stats = {
    total: announcements.length,
    totalViews: announcements.reduce((s, a) => s + a.views, 0),
    active: announcements.filter(a => a.status === "published").length,
    scheduled: announcements.filter(a => a.status === "scheduled").length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 mt-1">Manage company-wide announcements and notifications</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setShowCreateModal(true); }}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center space-x-2 shadow-lg shadow-blue-500/20"
        >
          <Plus className="h-4 w-4" /><span>New Announcement</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Megaphone, color: "blue", label: "Total Announcements", value: stats.total },
          { icon: Eye, color: "emerald", label: "Total Views", value: stats.totalViews.toLocaleString() },
          { icon: Bell, color: "amber", label: "Active Today", value: stats.active },
          { icon: Calendar, color: "purple", label: "Scheduled", value: stats.scheduled }
        ].map(({ icon: Icon, color, label, value }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Icon className={`h-8 w-8 text-${color}-600`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text" placeholder="Search announcements..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-3">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
              <option>All Status</option>
              <option>Published</option>
              <option>Draft</option>
              <option>Scheduled</option>
            </select>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
              <option>All Priority</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-100">
            <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No announcements match your filters.</p>
          </div>
        )}
        {filtered.map(ann => (
          <div key={ann.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {ann.pinned && <Pin className="h-4 w-4 text-amber-500" />}
                  <h3 className="text-lg font-semibold text-gray-900">{ann.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(ann.priority)}`}>{ann.priority}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(ann.status)}`}>{ann.status}</span>
                </div>
                <p className="text-gray-600 mb-4">{ann.content}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2"><Users className="h-4 w-4" /><span>{ann.audience}</span></div>
                  <div className="flex items-center space-x-2"><Calendar className="h-4 w-4" /><span>{ann.date}</span></div>
                  <div className="flex items-center space-x-2"><Clock className="h-4 w-4" /><span>{ann.time}</span></div>
                  <div className="flex items-center space-x-2"><Eye className="h-4 w-4" /><span>{ann.views} views</span></div>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <span className="text-sm text-gray-500">Posted by:</span>
                  <span className="text-sm font-medium text-gray-900">{ann.author}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button onClick={() => togglePin(ann)}
                  className={`p-2 rounded-lg hover:bg-gray-100 ${ann.pinned ? "text-amber-500" : "text-gray-400"}`}
                  title={ann.pinned ? "Unpin" : "Pin"}>
                  <Pin className="h-5 w-5" />
                </button>
                <button onClick={() => openEdit(ann)}
                  className="p-2 hover:bg-gray-100 rounded-lg" title="Edit">
                  <Edit className="h-5 w-5 text-gray-500" />
                </button>
                <button onClick={() => setDeleteTarget(ann)}
                  className="p-2 hover:bg-rose-50 rounded-lg" title="Delete">
                  <Trash2 className="h-5 w-5 text-rose-500" />
                </button>
                {ann.status === "draft" && (
                  <button onClick={() => handlePublish(ann)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 text-sm">
                    <Send className="h-4 w-4" /><span>Publish</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Create Modal ─────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Create New Announcement</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Enter announcement title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <textarea rows="4" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Enter announcement content" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Audience</label>
                  <select value={form.audience} onChange={e => setForm(p => ({ ...p, audience: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option>All Employees</option>
                    <option>Department Heads</option>
                    <option>HR Only</option>
                    <option>IT Team</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Time</label>
                  <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="pin" checked={form.pinned} onChange={e => setForm(p => ({ ...p, pinned: e.target.checked }))}
                  className="rounded text-blue-600" />
                <label htmlFor="pin" className="text-sm text-gray-700">Pin this announcement</label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Save className="h-4 w-4" /><span>Save as Draft</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ──────────────────────────────────────── */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Edit Announcement</h2>
              <button onClick={() => setEditTarget(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input type="text" value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <textarea rows="4" value={editForm.content} onChange={e => setEditForm(p => ({ ...p, content: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Audience</label>
                  <select value={editForm.audience} onChange={e => setEditForm(p => ({ ...p, audience: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option>All Employees</option><option>Department Heads</option>
                    <option>HR Only</option><option>IT Team</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select value={editForm.priority} onChange={e => setEditForm(p => ({ ...p, priority: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="editPin" checked={editForm.pinned} onChange={e => setEditForm(p => ({ ...p, pinned: e.target.checked }))}
                  className="rounded text-blue-600" />
                <label htmlFor="editPin" className="text-sm text-gray-700">Pin this announcement</label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button onClick={() => setEditTarget(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Save className="h-4 w-4" /><span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ─────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-rose-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delete Announcement</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <strong>"{deleteTarget.title}"</strong>?
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;