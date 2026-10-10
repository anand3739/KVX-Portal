import { useState } from "react";
import {
  Mail,
  Inbox,
  Send,
  Star,
  Trash2,
  Archive,
  Paperclip,
  Search,
  Edit3,
  XCircle,
  Download,
  Reply,
  Forward,
  Printer,
  Tag,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Filter
} from "lucide-react";

const Mailbox = () => {
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [selectedMail, setSelectedMail] = useState(null);
  const [composeMode, setComposeMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Sample emails for employee
  const emails = [
    {
      id: 1,
      from: "HR Department",
      email: "hr@kravix.com",
      to: "employee@kravix.com",
      subject: "Updated Company Policies",
      preview: "Please review the updated employee handbook with new policies...",
      content: "Dear Employee,\n\nPlease review the updated employee handbook which includes new policies regarding remote work, flexible hours, and benefits. The key changes are summarized below:\n\n1. Remote Work Policy - Up to 3 days per week\n2. Flexible Hours - Core hours 10 AM - 3 PM\n3. New Benefits - Mental health support added\n\nPlease acknowledge receipt by end of week.\n\nBest regards,\nHR Department",
      date: "2024-03-15T10:30:00",
      read: false,
      starred: true,
      hasAttachments: true,
      folder: "inbox",
      labels: ["important", "hr"],
      priority: "high"
    },
    {
      id: 2,
      from: "IT Support",
      email: "it@kravix.com",
      to: "employee@kravix.com",
      subject: "System Maintenance Tomorrow",
      preview: "Scheduled maintenance will occur on March 16th from 2-4 AM...",
      content: "Dear All,\n\nScheduled maintenance will occur on March 16th from 2-4 AM. During this time, the following systems may be unavailable:\n\n- Email Service\n- VPN Access\n- Internal Portal\n\nPlease save your work before the maintenance window.\n\nThank you,\nIT Support Team",
      date: "2024-03-14T15:45:00",
      read: true,
      starred: false,
      hasAttachments: false,
      folder: "inbox",
      labels: ["it", "maintenance"],
      priority: "medium"
    },
    {
      id: 3,
      from: "Sarah Johnson",
      email: "sarah.j@kravix.com",
      to: "employee@kravix.com",
      subject: "Project Update - Q2 Planning",
      preview: "Please review the Q2 planning document before tomorrow's meeting...",
      content: "Hi Team,\n\nPlease review the attached Q2 planning document before tomorrow's 10 AM meeting. We'll discuss resource allocation, timelines, and key deliverables.\n\nKey Points:\n- New project kickoff\n- Sprint schedule\n- Team assignments\n\nLet me know if you have any questions.\n\nThanks,\nSarah",
      date: "2024-03-14T09:20:00",
      read: false,
      starred: true,
      hasAttachments: true,
      folder: "inbox",
      labels: ["project", "meeting"],
      priority: "high"
    },
    {
      id: 4,
      from: "Payroll Department",
      email: "payroll@kravix.com",
      to: "employee@kravix.com",
      subject: "March Payslip Available",
      preview: "Your March 2024 payslip is now available in the portal...",
      content: "Dear Employee,\n\nYour March 2024 payslip is now available. You can download it from the Documents section or access it directly from this email.\n\nIf you have any questions about your payslip, please contact the payroll department.\n\nRegards,\nPayroll Team",
      date: "2024-03-13T14:15:00",
      read: true,
      starred: false,
      hasAttachments: true,
      folder: "inbox",
      labels: ["payroll", "documents"],
      priority: "medium"
    },
    {
      id: 5,
      from: "Learning & Development",
      email: "learning@kravix.com",
      to: "employee@kravix.com",
      subject: "New Training Course: Advanced Excel",
      preview: "A new training course 'Advanced Excel' is now available...",
      content: "Hi Employee,\n\nA new training course 'Advanced Excel for Business' is now available in the Learning portal. This course covers:\n\n- Advanced formulas and functions\n- Pivot tables and data analysis\n- Macros and automation\n- Data visualization\n\nEnroll now to enhance your skills!\n\nTraining Department",
      date: "2024-03-12T11:30:00",
      read: false,
      starred: false,
      hasAttachments: false,
      folder: "inbox",
      labels: ["training", "learning"],
      priority: "low"
    },
    {
      id: 6,
      from: "Facilities Management",
      email: "facilities@kravix.com",
      to: "employee@kravix.com",
      subject: "Office Closure - March 25",
      preview: "The office will be closed on March 25th for maintenance...",
      content: "Dear All,\n\nThe office will be closed on March 25th for scheduled maintenance. All employees are requested to work remotely on this day.\n\nIf you need access to the building, please coordinate with your manager.\n\nThanks,\nFacilities Team",
      date: "2024-03-11T16:40:00",
      read: true,
      starred: false,
      hasAttachments: false,
      folder: "inbox",
      labels: ["office", "announcement"],
      priority: "low"
    }
  ];

  const [mailData, setMailData] = useState(emails);

  const folders = [
    { id: "inbox", name: "Inbox", icon: Inbox, count: mailData.filter(e => e.folder === "inbox" && !e.read).length },
    { id: "starred", name: "Starred", icon: Star, count: mailData.filter(e => e.starred).length },
    { id: "sent", name: "Sent", icon: Send, count: 0 },
    { id: "archive", name: "Archive", icon: Archive, count: 0 },
    { id: "trash", name: "Trash", icon: Trash2, count: 0 },
  ];

  const [composeData, setComposeData] = useState({
    to: "",
    subject: "",
    message: ""
  });

  const stats = {
    total: mailData.length,
    unread: mailData.filter(e => !e.read).length,
    starred: mailData.filter(e => e.starred).length,
    sent: 8
  };

  const filteredEmails = mailData
    .filter(email => 
      (activeFolder === "inbox" && email.folder === "inbox") ||
      (activeFolder === "starred" && email.starred) ||
      (activeFolder === "sent" && email.folder === "sent") ||
      (activeFolder === "archive" && email.folder === "archive") ||
      (activeFolder === "trash" && email.folder === "trash")
    )
    .filter(email =>
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.preview.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'high': return 'bg-rose-100 text-rose-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'low': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const markAsRead = (id) => {
    setMailData(mailData.map(email => 
      email.id === id ? { ...email, read: true } : email
    ));
  };

  const toggleStar = (id) => {
    setMailData(mailData.map(email => 
      email.id === id ? { ...email, starred: !email.starred } : email
    ));
  };

  const handleSend = () => {
    alert("Email sent successfully!");
    setComposeMode(false);
    setComposeData({ to: "", subject: "", message: "" });
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mailbox</h1>
          <p className="text-gray-500 mt-1">Manage your internal messages</p>
        </div>
        <button
          onClick={() => setComposeMode(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2"
        >
          <Edit3 className="h-4 w-4" />
          <span>Compose</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Unread</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.unread}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Starred</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.starred}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600 fill-current" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Sent</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.sent}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <Send className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Mailbox Area */}
      <div className="h-[600px] bg-white rounded-xl shadow-sm border border-gray-200 flex overflow-hidden">
        {/* Left Sidebar - Folders */}
        <div className="w-64 border-r border-gray-200 bg-gray-50 p-4">
          <div className="space-y-1">
            {folders.map((folder) => {
              const Icon = folder.icon;
              return (
                <button
                  key={folder.id}
                  onClick={() => setActiveFolder(folder.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    activeFolder === folder.id
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{folder.name}</span>
                  </div>
                  {folder.count > 0 && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      activeFolder === folder.id
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {folder.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Labels */}
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Labels</h3>
            <div className="space-y-2">
              <button className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg w-full">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Important</span>
              </button>
              <button className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg w-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Work</span>
              </button>
              <button className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg w-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Personal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Middle - Email List */}
        <div className="w-96 border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-y-auto">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => {
                  setSelectedMail(email);
                  markAsRead(email.id);
                }}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedMail?.id === email.id ? 'bg-orange-50' : ''
                } ${!email.read ? 'bg-blue-50/30' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center text-white text-xs font-medium">
                      {getInitials(email.from)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{email.from}</p>
                      <p className="text-xs text-gray-500">{email.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityBadge(email.priority)}`}>
                      {email.priority}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(email.date)}</span>
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">{email.subject}</h4>
                <p className="text-xs text-gray-500 line-clamp-2">{email.preview}</p>
                {email.hasAttachments && (
                  <div className="flex items-center mt-2">
                    <Paperclip className="h-3 w-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-400">Attachments</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right - Email Content */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedMail ? (
            <>
              {/* Email Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{selectedMail.subject}</h2>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => toggleStar(selectedMail.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Star className={`h-4 w-4 ${selectedMail.starred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Reply className="h-4 w-4 text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Forward className="h-4 w-4 text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center text-white font-medium">
                      {getInitials(selectedMail.from)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedMail.from}</p>
                      <p className="text-xs text-gray-500">To: {selectedMail.to}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{new Date(selectedMail.date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</p>
                    <p className="text-xs text-gray-400">{new Date(selectedMail.date).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</p>
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{selectedMail.content}</p>
                </div>

                {selectedMail.hasAttachments && (
                  <div className="mt-8">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Attachments</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Paperclip className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Employee_Handbook_2024.pdf</p>
                            <p className="text-xs text-gray-500">2.4 MB</p>
                          </div>
                        </div>
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <Download className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Paperclip className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Policy_Updates.docx</p>
                            <p className="text-xs text-gray-500">1.1 MB</p>
                          </div>
                        </div>
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <Download className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Select a message to read</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {composeMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">New Message</h3>
              <button onClick={() => setComposeMode(false)}>
                <XCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <input
                  type="email"
                  value={composeData.to}
                  onChange={(e) => setComposeData({...composeData, to: e.target.value})}
                  placeholder="recipient@kravix.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
                  placeholder="Enter subject"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={composeData.message}
                  onChange={(e) => setComposeData({...composeData, message: e.target.value})}
                  rows="6"
                  placeholder="Write your message here..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-3">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Paperclip className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setComposeMode(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mailbox;