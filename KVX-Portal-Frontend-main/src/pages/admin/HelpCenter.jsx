import { useState } from "react";
import {
  HelpCircle, BookOpen, FileText, Video, MessageCircle, Mail,
  Phone, Search, ChevronRight, ChevronDown, ExternalLink, Play,
  ThumbsUp, X, Send, CheckCircle, Star
} from "lucide-react";
import toast from "react-hot-toast";

const articles = [
  { id: 1, title: "Getting Started with KRAVIX Portal", description: "Learn the basics of navigating and using the employee portal", category: "getting-started", views: 2345, likes: 156, author: "Admin Team", date: "2024-01-10", content: "Welcome to KRAVIX Portal! This guide will walk you through the key features:\n\n1. **Dashboard Overview** – Your homepage shows your upcoming tasks, attendance summary, and recent announcements.\n\n2. **Navigation** – Use the left sidebar to access HR features, payroll, leave management, and more.\n\n3. **Profile Settings** – Click your avatar (top right) to update your profile, change password, or sign out.\n\n4. **Notifications** – The bell icon shows real-time alerts for leave approvals, payroll updates, and announcements.\n\nContact IT support at it@kravix.com if you need further assistance." },
  { id: 2, title: "How to Request Time Off", description: "Step-by-step guide for submitting and managing leave requests", category: "guides", views: 1892, likes: 98, author: "HR Department", date: "2024-01-12", content: "To request time off:\n\n1. Navigate to **Leave Management** in the sidebar.\n2. Click **Apply for Leave**.\n3. Select the leave type (Annual, Sick, Personal).\n4. Choose your start and end dates.\n5. Add a reason and any supporting documents.\n6. Click **Submit** – your manager will be notified automatically.\n\nLeave balances are shown on your dashboard. Approved leaves appear in your calendar." },
  { id: 3, title: "Understanding Your Payroll", description: "Complete guide to viewing and understanding your payslips", category: "guides", views: 1567, likes: 87, author: "Finance Team", date: "2024-01-08", content: "Your payslip breakdown:\n\n- **Basic Salary** – Your agreed fixed monthly pay\n- **HRA** – House Rent Allowance (if applicable)\n- **Deductions** – PF, professional tax, and TDS\n- **Net Pay** – What is credited to your account\n\nPayslips are generated on the 28th of each month and available under **Documents → Payslips**. Download as PDF or view online." },
  { id: 4, title: "Setting Up Two-Factor Authentication", description: "Secure your account with 2FA - step by step instructions", category: "guides", views: 3456, likes: 234, author: "IT Security", date: "2024-01-05", content: "Enable 2FA in 3 steps:\n\n1. Go to **Settings → Security**.\n2. Toggle **Two-Factor Authentication** on.\n3. Scan the QR code with Google Authenticator or Authy.\n\nEach login will now require your 6-digit OTP in addition to your password. Keep your backup codes in a safe place!" },
  { id: 5, title: "Navigating the Dashboard", description: "Video tutorial on using the main dashboard features", category: "tutorials", views: 4231, likes: 312, author: "Training Team", date: "2024-01-03", content: "This video tutorial covers:\n\n- Widgets overview and customization\n- Quick action shortcuts\n- Filtering and date range selection\n- Exporting dashboard data\n\nPause the video at any section and follow along in the portal." },
  { id: 6, title: "Common Login Issues", description: "Solutions for frequently encountered login problems", category: "faq", views: 5678, likes: 445, author: "Support Team", date: "2024-01-01", content: "**Cannot log in?**\n\n✔ Ensure CAPS LOCK is off\n✔ Use your company email (e.g., name@kravix.com)\n✔ Try 'Forgot Password' to reset your credentials\n\n**Locked out?**\nAfter 5 failed attempts, your account locks for 15 minutes. Contact HR or IT to manually unlock.\n\n**Browser issues?**\nClear your cache or try an incognito window. Supported: Chrome, Firefox, Edge (latest versions)." },
];

const videos = [
  { id: 1, title: "Getting Started Guide", duration: "5:30 min", thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=60" },
  { id: 2, title: "Leave Management", duration: "4:15 min", thumbnail: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&auto=format&fit=crop&q=60" },
  { id: 3, title: "Payroll Overview", duration: "6:45 min", thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=60" },
];

const faqs = [
  { question: "How do I reset my password?", answer: "Click on 'Forgot Password' on the login page and follow the instructions sent to your email.", category: "account" },
  { question: "What should I do if I'm locked out of my account?", answer: "Contact your HR administrator or IT support for assistance with account recovery.", category: "account" },
  { question: "How do I view my payslips?", answer: "Navigate to Employee Dashboard → Documents → Payslips section.", category: "payroll" },
  { question: "Can I access the portal on my phone?", answer: "Yes, the portal is fully responsive and works on all mobile devices.", category: "technical" },
  { question: "How do I update my emergency contact?", answer: "Go to My Profile → Personal Info → Emergency Contact and click Edit.", category: "account" },
  { question: "What are the supported browsers?", answer: "We support the latest versions of Chrome, Firefox, Microsoft Edge, and Safari.", category: "technical" },
];

const categories = [
  { id: "all", name: "All Topics", icon: HelpCircle, count: 45 },
  { id: "getting-started", name: "Getting Started", icon: BookOpen, count: 8 },
  { id: "guides", name: "User Guides", icon: FileText, count: 15 },
  { id: "tutorials", name: "Video Tutorials", icon: Video, count: 6 },
  { id: "faq", name: "FAQ", icon: MessageCircle, count: 12 },
  { id: "contact", name: "Contact Support", icon: Mail, count: 4 },
];

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [likedArticles, setLikedArticles] = useState(new Set());

  // Chat modal state
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { from: "agent", text: "Hi! 👋 I'm a KRAVIX support agent. How can I help you today?" }
  ]);
  const [chatInput, setChatInput] = useState("");

  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({ subject: "", message: "", priority: "normal" });

  const filteredArticles = articles.filter(a =>
    (activeCategory === "all" || a.category === activeCategory) &&
    (a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  /* ── Like ─────────────────────────────────────────────────── */
  const handleLike = (article) => {
    setLikedArticles(prev => {
      const next = new Set(prev);
      if (next.has(article.id)) { next.delete(article.id); toast("Like removed"); }
      else { next.add(article.id); toast.success("Thanks for your feedback!"); }
      return next;
    });
  };

  /* ── Chat ─────────────────────────────────────────────────── */
  const sendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = { from: "user", text: chatInput.trim() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setTimeout(() => {
      const responses = [
        "Thanks for reaching out! Let me check that for you.",
        "I understand. Could you give me a bit more detail?",
        "Got it! I'll escalate this to the right team.",
        "That's a great question. Here's what I know: please check the FAQ section for common answers.",
      ];
      const reply = { from: "agent", text: responses[Math.floor(Math.random() * responses.length)] };
      setChatMessages(prev => [...prev, reply]);
    }, 900);
  };

  /* ── Email ────────────────────────────────────────────────── */
  const sendEmail = () => {
    if (!emailForm.subject.trim() || !emailForm.message.trim()) {
      toast.error("Please fill in subject and message.");
      return;
    }
    toast.success("Email sent! We'll respond within 24 hours.");
    setShowEmailModal(false);
    setEmailForm({ subject: "", message: "", priority: "normal" });
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Help Center</h1>
        <p className="text-blue-100 mb-6">Find answers, get support, and learn how to use KRAVIX Portal</p>
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text" placeholder="Search for help articles, guides, and FAQs..."
            value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setActiveCategory("all"); }}
            className="w-full pl-12 pr-4 py-4 bg-white text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map(cat => {
          const Icon = cat.icon;
          return (
            <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setSearchTerm(""); }}
              className={`p-4 rounded-xl border transition-all text-center ${activeCategory === cat.id
                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25"
                : "bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm text-gray-700"}`}>
              <Icon className="h-6 w-6 mb-2 mx-auto" />
              <p className="text-sm font-medium">{cat.name}</p>
              <p className={`text-xs mt-1 ${activeCategory === cat.id ? "text-blue-200" : "text-gray-400"}`}>
                {cat.count} articles
              </p>
            </button>
          );
        })}
      </div>

      {/* Articles */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {searchTerm ? `Search results for "${searchTerm}"` : "Popular Articles"}
        </h2>
        {filteredArticles.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No articles found. Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredArticles.map(article => (
              <div key={article.id} onClick={() => setSelectedArticle(article)}
                className="p-4 border border-gray-100 rounded-lg hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{article.title}</h3>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0 ml-2" />
                </div>
                <p className="text-sm text-gray-500 mb-3">{article.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center space-x-3">
                    <span>{article.views.toLocaleString()} views</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <ThumbsUp className="h-3 w-3" /><span>{article.likes + (likedArticles.has(article.id) ? 1 : 0)}</span>
                    </span>
                  </div>
                  <span>{article.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-100 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-900">{faq.question}</span>
                {openFaqIndex === index
                  ? <ChevronDown className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  : <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />}
              </button>
              {openFaqIndex === index && (
                <div className="px-4 pb-4 text-sm text-gray-600 border-t border-gray-100 pt-3 bg-blue-50/30">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Video Tutorials */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Video Tutorials</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {videos.map(video => (
            <div key={video.id} onClick={() => setSelectedVideo(video)}
              className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-all">
              <div className="aspect-video bg-gray-100 overflow-hidden">
                <img src={video.thumbnail} alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                  <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 text-gray-900 ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900">{video.title}</p>
                <p className="text-xs text-gray-500 mt-1">{video.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Still Need Help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 flex items-start space-x-3 hover:shadow-sm transition-shadow">
            <div className="p-2 bg-blue-50 rounded-lg"><MessageCircle className="h-5 w-5 text-blue-600" /></div>
            <div>
              <h3 className="font-medium text-gray-900">Live Chat</h3>
              <p className="text-sm text-gray-500">Chat with support team</p>
              <button onClick={() => setShowChatModal(true)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                Start Chat →
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 flex items-start space-x-3 hover:shadow-sm transition-shadow">
            <div className="p-2 bg-purple-50 rounded-lg"><Mail className="h-5 w-5 text-purple-600" /></div>
            <div>
              <h3 className="font-medium text-gray-900">Email Support</h3>
              <p className="text-sm text-gray-500">Get reply within 24h</p>
              <button onClick={() => setShowEmailModal(true)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                Send Email →
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 flex items-start space-x-3 hover:shadow-sm transition-shadow">
            <div className="p-2 bg-emerald-50 rounded-lg"><Phone className="h-5 w-5 text-emerald-600" /></div>
            <div>
              <h3 className="font-medium text-gray-900">Phone Support</h3>
              <p className="text-sm text-gray-500">Mon–Fri, 9am–6pm</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">+1 (800) 123-4567</p>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Banner */}
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-blue-700 font-medium">Browse our complete documentation</span>
        </div>
        <button
          onClick={() => toast.success("Opening full documentation…")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          View Docs
        </button>
      </div>

      {/* ═══ Article Reader Modal ════════════════════════════ */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
              <div className="flex-1 pr-4">
                <h2 className="text-xl font-semibold text-gray-900">{selectedArticle.title}</h2>
                <p className="text-sm text-gray-500 mt-1">By {selectedArticle.author} · {selectedArticle.date}</p>
              </div>
              <button onClick={() => setSelectedArticle(null)} className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{selectedArticle.content}</p>
            </div>
            <div className="p-6 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{selectedArticle.views.toLocaleString()} views</span>
                <span>·</span>
                <button onClick={() => handleLike(selectedArticle)}
                  className={`flex items-center space-x-1 hover:text-blue-600 transition-colors ${likedArticles.has(selectedArticle.id) ? "text-blue-600 font-medium" : ""}`}>
                  <ThumbsUp className="h-4 w-4" />
                  <span>{selectedArticle.likes + (likedArticles.has(selectedArticle.id) ? 1 : 0)} helpful</span>
                </button>
              </div>
              <button onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Video Player Modal ══════════════════════════════ */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">{selectedVideo.title}</h2>
                <p className="text-sm text-gray-500">{selectedVideo.duration}</p>
              </div>
              <button onClick={() => setSelectedVideo(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="relative aspect-video bg-gray-900 overflow-hidden">
              <img src={selectedVideo.thumbnail} alt={selectedVideo.title} className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border border-white/30">
                  <Play className="h-10 w-10 text-white ml-1" />
                </div>
                <p className="text-lg font-semibold">{selectedVideo.title}</p>
                <p className="text-sm text-white/70 mt-1">Duration: {selectedVideo.duration}</p>
                <p className="text-xs text-white/50 mt-3 max-w-xs text-center">
                  Video playback requires the KRAVIX Training Platform subscription.
                </p>
              </div>
            </div>
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span>4.8 · 1.2k views</span>
              </div>
              <button onClick={() => setSelectedVideo(null)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Live Chat Modal ═════════════════════════════════ */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center sm:justify-end z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col" style={{ height: "520px" }}>
            <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">KRAVIX Support</p>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                    <p className="text-blue-100 text-xs">Online</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowChatModal(false)} className="p-1.5 hover:bg-white/20 rounded-lg">
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm shadow-sm ${msg.from === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-gray-200 bg-white rounded-b-xl flex items-center space-x-2">
              <input
                type="text" value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendChat()}
                placeholder="Type a message…"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button onClick={sendChat}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex-shrink-0">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Email Modal ═════════════════════════════════════ */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Send Email to Support</h2>
              <button onClick={() => setShowEmailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select value={emailForm.priority} onChange={e => setEmailForm(p => ({ ...p, priority: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white">
                  <option value="low">Low – General inquiry</option>
                  <option value="normal">Normal – Standard support</option>
                  <option value="high">High – Urgent issue</option>
                  <option value="critical">Critical – System down</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                <input type="text" value={emailForm.subject}
                  onChange={e => setEmailForm(p => ({ ...p, subject: e.target.value }))}
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea rows="5" value={emailForm.message}
                  onChange={e => setEmailForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Describe your issue in detail…"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
              </div>
              <p className="text-xs text-gray-400">We typically respond within 24 hours on business days.</p>
            </div>
            <div className="p-6 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
              <button onClick={sendEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 text-sm">
                <Send className="h-4 w-4" /><span>Send Email</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpCenter;