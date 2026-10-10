import { useState } from "react";
import toast from "react-hot-toast";
import {
  BookOpen, Users, Calendar, Clock, Award, Download,
  Play, FileText, Video, CheckCircle, AlertCircle, Search,
  Filter, Plus, Star, TrendingUp, X, RefreshCw, Eye,
  Pause, BarChart3, Target, ArrowUpRight, UserCheck
} from "lucide-react";

/* ─── Create Training Modal ───────────────────────────────────────────────── */
const CreateTrainingModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    title: "", category: "Technical", type: "video",
    duration: "", instructor: "", description: "", deadline: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onCreated(form);
      toast.success(`Training "${form.title}" created successfully!`);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-xl"><BookOpen className="h-5 w-5 text-blue-600" /></div>
            <h2 className="text-xl font-semibold text-gray-900">Create Training Program</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Training Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              placeholder="e.g. Advanced React Development" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white transition-all">
                {["Technical", "Soft Skills", "Compliance", "Leadership", "Onboarding"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <div className="flex space-x-2">
                {[{ id: "video", icon: Video }, { id: "interactive", icon: BookOpen }].map(t => {
                  const Icon = t.icon;
                  return (
                    <button key={t.id} type="button" onClick={() => setForm({ ...form, type: t.id })}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium flex items-center justify-center space-x-1 transition-all ${form.type === t.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600"}`}>
                      <Icon className="h-4 w-4" /><span className="capitalize">{t.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration</label>
              <input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                placeholder="e.g. 4 hours" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Instructor</label>
              <input value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                placeholder="e.g. John Smith" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Deadline</label>
            <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none transition-all"
              placeholder="Describe the training objectives…" />
          </div>
          <div className="flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium disabled:opacity-60 transition-all flex items-center justify-center space-x-2">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              <span>{loading ? "Creating…" : "Create Training"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Training Detail Modal ───────────────────────────────────────────────── */
const TrainingDetailModal = ({ training, onClose }) => {
  if (!training) return null;
  const completionRate = Math.round((training.completed / training.enrolled) * 100);
  const participants = [
    { name: "Alice Johnson", progress: 100, status: "completed" },
    { name: "Bob Smith", progress: 75, status: "in-progress" },
    { name: "Carol White", progress: 45, status: "in-progress" },
    { name: "David Brown", progress: 0, status: "not-started" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{training.title}</h2>
            <p className="text-sm text-gray-500">{training.category} · {training.type}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Enrolled", value: training.enrolled },
              { label: "Completed", value: training.completed },
              { label: "Completion", value: `${completionRate}%` },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div className="h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
              style={{ width: `${completionRate}%` }} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Participant Progress</h4>
            <div className="space-y-3">
              {participants.map(p => (
                <div key={p.name} className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {p.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{p.name}</span>
                      <span className="text-gray-500">{p.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full transition-all ${p.status === 'completed' ? 'bg-emerald-500' : p.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'}`}
                        style={{ width: `${p.progress}%` }} />
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : p.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.status.replace('-', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex space-x-3">
            <button onClick={() => { toast.success(`Training materials for "${training.title}" downloaded!`); onClose(); }}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium flex items-center justify-center space-x-2 transition-colors">
              <Download className="h-4 w-4" /><span>Download Materials</span>
            </button>
            <button onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium transition-all">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Training Page ─────────────────────────────────────────────────── */
const Training = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [viewTraining, setViewTraining] = useState(null);

  const categories = ["All", "Technical", "Soft Skills", "Compliance", "Leadership", "Onboarding"];

  const [trainings, setTrainings] = useState([
    { id: 1, title: "Advanced React Development", description: "Master React hooks, context, and performance optimization", category: "Technical", type: "video", duration: "8 hours", enrolled: 45, completed: 32, rating: 4.8, status: "active", instructor: "John Smith", deadline: "2026-03-30" },
    { id: 2, title: "Effective Communication Skills", description: "Improve verbal and written communication in the workplace", category: "Soft Skills", type: "interactive", duration: "4 hours", enrolled: 78, completed: 56, rating: 4.6, status: "active", instructor: "Sarah Johnson", deadline: "2026-04-15" },
    { id: 3, title: "Workplace Safety Compliance", description: "Essential safety protocols and compliance requirements", category: "Compliance", type: "video", duration: "2 hours", enrolled: 120, completed: 98, rating: 4.9, status: "active", instructor: "Mike Wilson", deadline: "2026-03-20" },
    { id: 4, title: "Leadership Excellence", description: "Develop leadership skills and team management strategies", category: "Leadership", type: "interactive", duration: "12 hours", enrolled: 34, completed: 28, rating: 4.7, status: "active", instructor: "Emily Davis", deadline: "2026-05-01" },
    { id: 5, title: "New Employee Orientation", description: "Welcome to KRAVIX! Learn about our culture and processes", category: "Onboarding", type: "video", duration: "3 hours", enrolled: 156, completed: 145, rating: 4.5, status: "active", instructor: "HR Team", deadline: "2026-12-31" },
  ]);

  const [startingId, setStartingId] = useState(null);

  const stats = {
    total: trainings.length,
    enrolled: trainings.reduce((acc, t) => acc + t.enrolled, 0),
    completed: trainings.reduce((acc, t) => acc + t.completed, 0),
    avgRating: (trainings.reduce((acc, t) => acc + t.rating, 0) / trainings.length).toFixed(1)
  };

  const handleCreated = (form) => {
    const newTraining = {
      id: Date.now(),
      title: form.title,
      description: form.description || "No description provided",
      category: form.category,
      type: form.type,
      duration: form.duration || "TBD",
      enrolled: 0,
      completed: 0,
      rating: 0,
      status: "active",
      instructor: form.instructor || "TBD",
      deadline: form.deadline || "TBD"
    };
    setTrainings(prev => [newTraining, ...prev]);
  };

  const handleStart = (training) => {
    setStartingId(training.id);
    setTimeout(() => {
      setStartingId(null);
      toast.success(`Starting "${training.title}"… Redirecting to course platform`);
    }, 1000);
  };

  const handleDownload = (training) => {
    toast.success(`Downloading materials for "${training.title}"…`);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5" />;
      case 'interactive': return <BookOpen className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const filtered = trainings.filter(t =>
    (selectedCategory === "all" || t.category.toLowerCase() === selectedCategory.toLowerCase()) &&
    (t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.instructor.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {showCreate && <CreateTrainingModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
      {viewTraining && <TrainingDetailModal training={viewTraining} onClose={() => setViewTraining(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training & Development</h1>
          <p className="text-gray-500 mt-1">Create and manage employee learning programs</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center space-x-2 font-medium transition-all shadow-md shadow-blue-500/25 w-fit">
          <Plus className="h-4 w-4" /><span>Create Training</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Active Trainings", value: stats.total, icon: BookOpen, bg: "from-blue-500 to-blue-600" },
          { label: "Total Enrolled", value: stats.enrolled, icon: Users, bg: "from-emerald-500 to-green-600" },
          { label: "Completions", value: stats.completed, icon: Award, bg: "from-amber-500 to-orange-500" },
          { label: "Avg Rating", value: stats.avgRating, icon: Star, bg: "from-purple-500 to-purple-600" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${s.bg}`}><Icon className="h-5 w-5 text-white" /></div>
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search training programs…" value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat.toLowerCase())}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat.toLowerCase() ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Training Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(training => {
          const completionRate = training.enrolled > 0 ? Math.round((training.completed / training.enrolled) * 100) : 0;
          return (
            <div key={training.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 text-blue-600">
                  {getTypeIcon(training.type)}
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">{training.category}</span>
              </div>

              <h3 className="text-base font-bold text-gray-900 mb-1.5">{training.title}</h3>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{training.description}</p>

              <div className="space-y-2 mb-4">
                {[
                  { label: "Duration", value: training.duration },
                  { label: "Instructor", value: training.instructor },
                  { label: "Deadline", value: training.deadline },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="font-medium text-gray-700">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Completion Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-400">Progress</span>
                  <span className="font-semibold text-gray-700">{completionRate}% ({training.completed}/{training.enrolled})</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className={`h-2 rounded-full transition-all ${completionRate === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                    style={{ width: `${completionRate}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-1">
                  {training.rating > 0 ? (
                    <>
                      <Star className="h-4 w-4 text-amber-400 fill-current" />
                      <span className="text-sm font-semibold text-gray-700">{training.rating}</span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-300">No ratings yet</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => setViewTraining(training)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View Details">
                    <Eye className="h-4 w-4 text-gray-500" />
                  </button>
                  <button onClick={() => handleDownload(training)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Download">
                    <Download className="h-4 w-4 text-gray-500" />
                  </button>
                  <button onClick={() => handleStart(training)} disabled={startingId === training.id}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center space-x-1.5 text-sm font-medium transition-all disabled:opacity-60">
                    {startingId === training.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    <span>{startingId === training.id ? "Loading…" : "Start"}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <BookOpen className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No trainings found</p>
          <p className="text-sm text-gray-300 mt-1">Try a different category or search term</p>
        </div>
      )}

      {/* Progress Banner */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="relative">
          <h3 className="text-xl font-bold mb-5">Training Progress Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Overall Completion", value: `${Math.round((stats.completed / stats.enrolled) * 100)}%`, bar: true, width: Math.round((stats.completed / stats.enrolled) * 100) },
              { label: "Avg. Time to Complete", value: "5.2 days", bar: false },
              { label: "Certifications Earned", value: stats.completed, bar: false },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-blue-200 text-sm font-medium">{item.label}</p>
                <p className="text-3xl font-bold mt-2 mb-2">{item.value}</p>
                {item.bar && (
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: `${item.width}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Training;