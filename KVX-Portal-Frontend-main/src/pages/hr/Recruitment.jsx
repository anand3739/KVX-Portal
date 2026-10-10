import { useState } from "react";
import toast from "react-hot-toast";
import {
  Briefcase, Users, Clock, Calendar, MapPin, DollarSign,
  FileText, Plus, Search, Filter, Eye, Download, Mail,
  Phone, CheckCircle, XCircle, AlertCircle, Star, X,
  MoreVertical, ChevronRight, RefreshCw, Send, Video,
  UserCheck, ArrowUpRight, Pencil, Trash2
} from "lucide-react";

/* ─── Post Job Modal ─────────────────────────────────────────────────────── */
const PostJobModal = ({ onClose, onPosted }) => {
  const [form, setForm] = useState({ title: "", department: "", location: "", type: "Full-time", salary: "", description: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onPosted(form);
      toast.success(`Job "${form.title}" posted successfully!`);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-xl"><Briefcase className="h-5 w-5 text-green-600" /></div>
            <h2 className="text-xl font-semibold text-gray-900">Post New Job</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
              placeholder="e.g. Senior Software Engineer" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Department *</label>
              <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white transition-all">
                <option value="">Select…</option>
                {["Engineering", "Marketing", "Sales", "HR", "Finance", "Operations", "Product"].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white transition-all">
                {["Full-time", "Part-time", "Contract", "Internship"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
              <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
                placeholder="City or Remote" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Salary Range</label>
              <input value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
                placeholder="$80k – $120k" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 resize-none transition-all"
              placeholder="Describe the role and requirements…" />
          </div>
          <div className="flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium disabled:opacity-60 transition-all flex items-center justify-center space-x-2">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              <span>{loading ? "Posting…" : "Post Job"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Schedule Interview Modal ───────────────────────────────────────────── */
const ScheduleInterviewModal = ({ applicant, onClose, onScheduled }) => {
  const [form, setForm] = useState({ date: "", time: "10:00", type: "Technical", interviewer: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onScheduled({ ...form, candidate: applicant.name });
      toast.success(`Interview scheduled for ${applicant.name}!`);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-xl"><Calendar className="h-5 w-5 text-purple-600" /></div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Schedule Interview</h2>
              <p className="text-sm text-gray-500">{applicant.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date *</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Time *</label>
              <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Interview Type</label>
            <div className="grid grid-cols-2 gap-2">
              {["Technical", "HR Round", "Portfolio Review", "Cultural Fit"].map(t => (
                <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                  className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-all ${form.type === t ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Interviewer</label>
            <input value={form.interviewer} onChange={e => setForm({ ...form, interviewer: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
              placeholder="e.g. John Smith" />
          </div>
          <div className="flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium disabled:opacity-60 transition-all flex items-center justify-center space-x-2">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
              <span>{loading ? "Scheduling…" : "Schedule Interview"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Main Recruitment Page ───────────────────────────────────────────────── */
const Recruitment = () => {
  const [activeTab, setActiveTab] = useState("jobs");
  const [searchTerm, setSearchTerm] = useState("");
  const [showPostJob, setShowPostJob] = useState(false);
  const [scheduleFor, setScheduleFor] = useState(null);

  const [jobPostings, setJobPostings] = useState([
    { id: 1, title: "Senior Software Engineer", department: "Engineering", location: "New York, NY", type: "Full-time", salary: "$120k – $150k", applicants: 24, posted: "2 days ago", status: "active", featured: true },
    { id: 2, title: "HR Business Partner", department: "Human Resources", location: "Remote", type: "Full-time", salary: "$85k – $105k", applicants: 18, posted: "5 days ago", status: "active", featured: false },
    { id: 3, title: "Marketing Manager", department: "Marketing", location: "San Francisco, CA", type: "Full-time", salary: "$90k – $120k", applicants: 31, posted: "1 week ago", status: "active", featured: true },
    { id: 4, title: "Financial Analyst", department: "Finance", location: "Chicago, IL", type: "Full-time", salary: "$75k – $95k", applicants: 12, posted: "3 days ago", status: "active", featured: false },
    { id: 5, title: "Product Designer", department: "Product", location: "Remote", type: "Contract", salary: "$60 – $80/hr", applicants: 42, posted: "1 day ago", status: "active", featured: true },
  ]);

  const [applicants, setApplicants] = useState([
    { id: 1, name: "Alice Johnson", position: "Senior Software Engineer", email: "alice.j@email.com", phone: "+1 (555) 123-4567", experience: "8 years", status: "interview", matchScore: 92, appliedDate: "2026-07-10" },
    { id: 2, name: "Bob Smith", position: "HR Business Partner", email: "bob.smith@email.com", phone: "+1 (555) 234-5678", experience: "5 years", status: "shortlisted", matchScore: 88, appliedDate: "2026-07-09" },
    { id: 3, name: "Carol White", position: "Marketing Manager", email: "carol.w@email.com", phone: "+1 (555) 345-6789", experience: "7 years", status: "review", matchScore: 76, appliedDate: "2026-07-08" },
    { id: 4, name: "David Brown", position: "Financial Analyst", email: "david.b@email.com", phone: "+1 (555) 456-7890", experience: "3 years", status: "new", matchScore: 65, appliedDate: "2026-07-11" },
    { id: 5, name: "Emily Davis", position: "Product Designer", email: "emily.d@email.com", phone: "+1 (555) 567-8901", experience: "6 years", status: "interview", matchScore: 94, appliedDate: "2026-07-07" },
  ]);

  const [interviews, setInterviews] = useState([
    { id: 1, candidate: "Alice Johnson", position: "Senior Software Engineer", date: "2026-07-15", time: "10:00 AM", interviewer: "John Smith", type: "Technical" },
    { id: 2, candidate: "Emily Davis", position: "Product Designer", date: "2026-07-15", time: "2:00 PM", interviewer: "Sarah Wilson", type: "Portfolio Review" },
    { id: 3, candidate: "Bob Smith", position: "HR Business Partner", date: "2026-07-16", time: "11:30 AM", interviewer: "Emma Davis", type: "Cultural Fit" },
  ]);

  const stats = {
    activeJobs: jobPostings.length,
    totalApplicants: applicants.length,
    interviewsScheduled: interviews.length,
    offersExtended: 8
  };

  const handlePosted = (form) => {
    const newJob = {
      id: Date.now(),
      title: form.title,
      department: form.department,
      location: form.location || "Remote",
      type: form.type,
      salary: form.salary || "Competitive",
      applicants: 0,
      posted: "Just now",
      status: "active",
      featured: false
    };
    setJobPostings(prev => [newJob, ...prev]);
  };

  const handleScheduled = (interview) => {
    const newInterview = { id: Date.now(), ...interview, time: interview.time + " AM" };
    setInterviews(prev => [newInterview, ...prev]);
    setApplicants(prev => prev.map(a => a.name === interview.candidate ? { ...a, status: "interview" } : a));
  };

  const handleApplicantAction = (id, newStatus) => {
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    const msg = { offered: "Offer sent!", rejected: "Applicant rejected", shortlisted: "Applicant shortlisted!", interview: "Interview stage set" };
    toast.success(msg[newStatus] || "Status updated!");
  };

  const handleEmail = (applicant) => toast.success(`Email draft opened for ${applicant.name}`);
  const handleCall = (applicant) => toast.success(`Calling ${applicant.name} at ${applicant.phone}…`);
  const handleResume = (applicant) => toast.success(`Downloading resume for ${applicant.name}…`);
  const handleJoinMeeting = (interview) => toast.success(`Joining video call for ${interview.candidate}'s interview…`);
  const handleReschedule = (interview) => toast(`Reschedule requested for ${interview.candidate}'s interview`, { icon: "📅" });
  const handleCloseJob = (id) => { setJobPostings(prev => prev.map(j => j.id === id ? { ...j, status: "closed" } : j)); toast.success("Job posting closed!"); };

  const getStatusColor = (status) => {
    const map = {
      active: 'bg-emerald-100 text-emerald-700',
      closed: 'bg-gray-100 text-gray-500',
      new: 'bg-blue-100 text-blue-700',
      review: 'bg-amber-100 text-amber-700',
      shortlisted: 'bg-purple-100 text-purple-700',
      interview: 'bg-indigo-100 text-indigo-700',
      offered: 'bg-green-100 text-green-700',
      rejected: 'bg-rose-100 text-rose-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-rose-600';
  };

  const filteredJobs = jobPostings.filter(j => j.title.toLowerCase().includes(searchTerm.toLowerCase()) || j.department.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredApplicants = applicants.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.position.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      {showPostJob && <PostJobModal onClose={() => setShowPostJob(false)} onPosted={handlePosted} />}
      {scheduleFor && <ScheduleInterviewModal applicant={scheduleFor} onClose={() => setScheduleFor(null)} onScheduled={handleScheduled} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recruitment</h1>
          <p className="text-gray-500 mt-1">Manage job postings, applicants, and interviews</p>
        </div>
        <button onClick={() => setShowPostJob(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center space-x-2 font-medium transition-all shadow-md shadow-green-500/25 w-fit">
          <Plus className="h-4 w-4" /><span>Post New Job</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Active Jobs", value: stats.activeJobs, sub: "+3 this week", icon: Briefcase, bg: "from-blue-500 to-blue-600" },
          { label: "Total Applicants", value: stats.totalApplicants, sub: "+24 this week", icon: Users, bg: "from-purple-500 to-purple-600" },
          { label: "Interviews Scheduled", value: stats.interviewsScheduled, sub: "Next: Today 10 AM", icon: Calendar, bg: "from-amber-500 to-orange-500" },
          { label: "Offers Extended", value: stats.offersExtended, sub: "5 pending acceptance", icon: CheckCircle, bg: "from-emerald-500 to-green-600" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${s.bg}`}><Icon className="h-5 w-5 text-white" /></div>
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm font-medium text-gray-600 mt-1">{s.label}</p>
              <p className="text-xs text-gray-400">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-1">
          {[
            { id: "jobs", label: "Job Postings", count: jobPostings.length },
            { id: "applicants", label: "Applicants", count: applicants.length },
            { id: "interviews", label: "Interviews", count: interviews.length }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center space-x-2 ${activeTab === tab.id ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              <span>{tab.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{tab.count}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder={`Search ${activeTab}…`} value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm transition-all" />
        </div>
      </div>

      {/* Job Postings */}
      {activeTab === "jobs" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredJobs.map(job => (
            <div key={job.id} className={`bg-white rounded-2xl border shadow-sm p-6 hover:shadow-md transition-all ${job.status === 'closed' ? 'opacity-60 border-gray-100' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <Briefcase className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.department}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {job.featured && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full flex items-center font-medium">
                      <Star className="h-3 w-3 mr-1 fill-current" />Featured
                    </span>
                  )}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(job.status)}`}>{job.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { Icon: MapPin, text: job.location },
                  { Icon: Clock, text: job.type },
                  { Icon: DollarSign, text: job.salary },
                  { Icon: Users, text: `${job.applicants} applicants` },
                ].map(({ Icon, text }, i) => (
                  <div key={i} className="flex items-center text-sm text-gray-600">
                    <Icon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />{text}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">Posted {job.posted}</span>
                <div className="flex items-center space-x-2">
                  <button onClick={() => toast.success(`Viewing applicants for "${job.title}"`)}
                    className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors font-medium flex items-center space-x-1">
                    <Eye className="h-4 w-4" /><span>View Applicants</span>
                  </button>
                  {job.status === 'active' && (
                    <button onClick={() => handleCloseJob(job.id)}
                      className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium">
                      Close Job
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Applicants */}
      {activeTab === "applicants" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Candidate", "Position", "Match", "Experience", "Status", "Applied", "Actions"].map(h => (
                    <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredApplicants.map(applicant => (
                  <tr key={applicant.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {applicant.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{applicant.name}</p>
                          <p className="text-xs text-gray-400">{applicant.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{applicant.position}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-1.5 rounded-full ${applicant.matchScore >= 90 ? 'bg-emerald-500' : applicant.matchScore >= 75 ? 'bg-blue-500' : 'bg-amber-500'}`}
                            style={{ width: `${applicant.matchScore}%` }} />
                        </div>
                        <span className={`text-sm font-bold ${getMatchScoreColor(applicant.matchScore)}`}>{applicant.matchScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{applicant.experience}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(applicant.status)}`}>{applicant.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">{applicant.appliedDate}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <button onClick={() => handleEmail(applicant)} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors" title="Email">
                          <Mail className="h-4 w-4 text-blue-600" />
                        </button>
                        <button onClick={() => handleCall(applicant)} className="p-1.5 hover:bg-green-50 rounded-lg transition-colors" title="Call">
                          <Phone className="h-4 w-4 text-green-600" />
                        </button>
                        <button onClick={() => handleResume(applicant)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Resume">
                          <FileText className="h-4 w-4 text-gray-500" />
                        </button>
                        <button onClick={() => setScheduleFor(applicant)} className="p-1.5 hover:bg-purple-50 rounded-lg transition-colors" title="Schedule Interview">
                          <Calendar className="h-4 w-4 text-purple-600" />
                        </button>
                        {applicant.status !== 'offered' && applicant.status !== 'rejected' && (
                          <button onClick={() => handleApplicantAction(applicant.id, 'offered')}
                            className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors" title="Extend Offer">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                          </button>
                        )}
                        {applicant.status !== 'rejected' && (
                          <button onClick={() => handleApplicantAction(applicant.id, 'rejected')}
                            className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors" title="Reject">
                            <XCircle className="h-4 w-4 text-rose-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interviews */}
      {activeTab === "interviews" && (
        <div className="grid grid-cols-1 gap-4">
          {interviews.map(interview => (
            <div key={interview.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    {interview.candidate.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{interview.candidate}</h3>
                    <p className="text-sm text-gray-500">{interview.position}</p>
                  </div>
                </div>
                <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{interview.type}</span>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 text-gray-400" /><span>{interview.date}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4 text-gray-400" /><span>{interview.time}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <UserCheck className="h-4 w-4 text-gray-400" /><span>{interview.interviewer}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button onClick={() => handleReschedule(interview)}
                  className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-600 transition-colors flex items-center space-x-2">
                  <Clock className="h-4 w-4" /><span>Reschedule</span>
                </button>
                <button onClick={() => handleJoinMeeting(interview)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 text-sm font-medium transition-all flex items-center space-x-2 shadow-md shadow-purple-500/25">
                  <Video className="h-4 w-4" /><span>Join Meeting</span>
                </button>
              </div>
            </div>
          ))}

          {interviews.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Calendar className="h-12 w-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No interviews scheduled</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Recruitment;