import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Mail, Inbox, Send, Star, Trash2, Archive, Paperclip, Search,
  Filter, ChevronLeft, ChevronRight, Edit3, MoreVertical, User,
  Clock, CheckCircle, XCircle, AlertTriangle, Download, Reply,
  Forward, Printer, Tag, Folder, X, SendHorizontal
} from "lucide-react";
import toast from "react-hot-toast";
import { useAdminTheme } from "../../contexts/AdminThemeContext";

const Mailbox = ({ role = "employee" }) => {
  const location = useLocation();
  const { t, isDark } = useAdminTheme();
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [selectedMail, setSelectedMail] = useState(null);
  const [composeMode, setComposeMode] = useState(!!location.state?.composeTo);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeLabel, setActiveLabel] = useState("all");

  // Sample emails based on role
  const getEmails = () => {
    const baseEmails = [
      {
        id: 1,
        from: "HR Department",
        email: "hr@kravix.com",
        to: "all@kravix.com",
        subject: "Monthly Team Meeting",
        preview: "Join us for the monthly team meeting this Friday at 10 AM...",
        content: "Dear Team,\n\nJoin us for the monthly team meeting this Friday at 10 AM in the main conference room. We'll discuss Q3 goals, project updates, and upcoming events.\n\nAgenda:\n- Q3 Progress Review\n- New Project Updates\n- Team Building Activities\n- Q&A Session\n\nPlease bring your laptops and any questions you may have.\n\nBest regards,\nHR Team",
        date: "2024-07-15T09:30:00",
        read: false,
        starred: true,
        hasAttachments: true,
        folder: "inbox",
        labels: ["important"],
        role: ["all"]
      },
      {
        id: 2,
        from: "CEO Office",
        email: "ceo@kravix.com",
        to: "all@kravix.com",
        subject: "Company Updates - Q3 Goals",
        preview: "Exciting updates for Q3! We're launching new initiatives...",
        content: "Dear Team,\n\nI'm excited to share our Q3 goals and initiatives. We've seen tremendous growth and it's time to take things to the next level.\n\nKey Initiatives:\n1. Launch new product line\n2. Expand to European market\n3. Increase customer satisfaction to 95%\n4. Team expansion - hiring 20 new members\n\nLet's make this quarter our best yet!\n\nBest,\nCEO Office",
        date: "2024-07-14T14:15:00",
        read: true,
        starred: false,
        hasAttachments: false,
        folder: "inbox",
        labels: ["work"],
        role: ["all"]
      },
      {
        id: 3,
        from: "IT Support",
        email: "it@kravix.com",
        to: "all@kravix.com",
        subject: "System Maintenance This Weekend",
        preview: "Scheduled maintenance on Saturday, July 20th from 2 AM to 4 AM...",
        content: "Dear All,\n\nWe'll be performing scheduled maintenance on our servers this Saturday, July 20th from 2 AM to 4 AM. During this time, some systems may be temporarily unavailable.\n\nAffected Systems:\n- Email Service\n- VPN Access\n- Internal Portal\n\nPlease plan accordingly and save your work before the maintenance window.\n\nThank you for your understanding.\n\nIT Support Team",
        date: "2024-07-13T11:20:00",
        read: false,
        starred: true,
        hasAttachments: false,
        folder: "inbox",
        labels: ["important"],
        role: ["all"]
      },
      {
        id: 4,
        from: "Payroll Department",
        email: "payroll@kravix.com",
        to: "all@kravix.com",
        subject: "July Payslips Available",
        preview: "Your July 2024 payslips are now available in the portal...",
        content: "Dear Employee,\n\nYour July 2024 payslip is now available in the employee portal. You can download it from the Documents section.\n\nIf you have any questions about your payslip, please contact the payroll department.\n\nRegards,\nPayroll Team",
        date: "2024-07-12T16:45:00",
        read: true,
        starred: false,
        hasAttachments: true,
        folder: "inbox",
        labels: ["personal"],
        role: ["all"]
      }
    ];

    if (role === "hr") {
      baseEmails.push(
        {
          id: 5,
          from: "Recruitment Team",
          email: "recruitment@kravix.com",
          to: "hr@kravix.com",
          subject: "New Applicants - Senior Developer Position",
          preview: "12 new applicants for the Senior Developer position...",
          content: "Hi HR Team,\n\nWe've received 12 new applications for the Senior Developer position. Please review the candidates and schedule interviews for the shortlisted ones.\n\nTop Candidates:\n- Alice Johnson (8 years experience)\n- Bob Smith (6 years experience)\n- Carol White (7 years experience)\n\nBest,\nRecruitment Team",
          date: "2024-07-15T10:30:00",
          read: false,
          starred: true,
          hasAttachments: true,
          folder: "inbox",
          labels: ["important"],
          role: ["hr"]
        },
        {
          id: 6,
          from: "Employee Relations",
          email: "relations@kravix.com",
          to: "hr@kravix.com",
          subject: "Leave Request Approval Needed",
          preview: "3 pending leave requests require your approval...",
          content: "Hi HR Manager,\n\nThere are 3 pending leave requests that need your approval:\n\n1. Emma Wilson - Annual Leave (July 20-25)\n2. Frank Miller - Sick Leave (July 15-16)\n3. Grace Lee - Personal Leave (July 18)\n\nPlease review and take action.\n\nThanks,\nEmployee Relations",
          date: "2024-07-14T09:15:00",
          read: false,
          starred: false,
          hasAttachments: false,
          folder: "inbox",
          labels: ["work"],
          role: ["hr"]
        }
      );
    }

    if (role === "ceo") {
      baseEmails.push(
        {
          id: 7,
          from: "Board of Directors",
          email: "board@kravix.com",
          to: "ceo@kravix.com",
          subject: "Quarterly Board Meeting - July 25",
          preview: "The quarterly board meeting is scheduled for July 25th at 2 PM...",
          content: "Dear CEO,\n\nThe quarterly board meeting is scheduled for July 25th at 2 PM in the boardroom. Please prepare the Q2 performance report and Q3 projections.\n\nAgenda:\n- Q2 Financial Review\n- Q3 Strategic Initiatives\n- Market Expansion Plans\n- New Product Launch\n\nPlease send the presentation by July 23rd.\n\nRegards,\nBoard Secretary",
          date: "2024-07-15T08:00:00",
          read: false,
          starred: true,
          hasAttachments: false,
          folder: "inbox",
          labels: ["important"],
          role: ["ceo"]
        },
        {
          id: 8,
          from: "Finance Department",
          email: "finance@kravix.com",
          to: "ceo@kravix.com",
          subject: "Q2 Financial Report Ready for Review",
          preview: "The Q2 2024 financial report is ready for your review...",
          content: "Dear CEO,\n\nThe Q2 2024 financial report is ready for your review before the board meeting. Key highlights:\n\n- Revenue: $12.4M (+15.3%)\n- Profit: $16.1M (+12.4%)\n- New Clients: 24\n\nPlease let us know if you need any additional data.\n\nBest,\nFinance Team",
          date: "2024-07-13T14:30:00",
          read: true,
          starred: true,
          hasAttachments: true,
          folder: "inbox",
          labels: ["work"],
          role: ["ceo"]
        }
      );
    }

    if (role === "admin") {
      baseEmails.push(
        {
          id: 9,
          from: "Security Team",
          email: "security@kravix.com",
          to: "admin@kravix.com",
          subject: "Security Alert: Multiple Failed Login Attempts",
          preview: "23 failed login attempts detected from IP 45.123.45.67...",
          content: "Admin Team,\n\nWe've detected 23 failed login attempts from IP 45.123.45.67 in the last hour. This may indicate a brute force attack.\n\nAction Taken:\n- IP temporarily blocked\n- Enhanced monitoring enabled\n\nPlease review the security logs for more details.\n\nSecurity Team",
          date: "2024-07-15T07:45:00",
          read: false,
          starred: true,
          hasAttachments: false,
          folder: "inbox",
          labels: ["important"],
          role: ["admin"]
        },
        {
          id: 10,
          from: "System Monitor",
          email: "system@kravix.com",
          to: "admin@kravix.com",
          subject: "Server Performance Alert",
          preview: "CPU usage on production server has exceeded 85%...",
          content: "Admin Alert,\n\nCPU usage on production server (prod-01) has exceeded 85% for the last 15 minutes.\n\nCurrent Metrics:\n- CPU: 87%\n- Memory: 72%\n- Disk: 68%\n\nPlease investigate and optimize if necessary.\n\nSystem Monitor",
          date: "2024-07-14T22:15:00",
          read: true,
          starred: false,
          hasAttachments: false,
          folder: "inbox",
          labels: ["work"],
          role: ["admin"]
        }
      );
    }

    if (role === "employee") {
      baseEmails.push(
        {
          id: 11,
          from: "Team Lead",
          email: "teamlead@kravix.com",
          to: "employee@kravix.com",
          subject: "Project Update - Q3 Planning",
          preview: "Please review the Q3 planning document before tomorrow's meeting...",
          content: "Hi Team,\n\nPlease review the Q3 planning document attached before tomorrow's 10 AM meeting. We'll discuss resource allocation and timelines.\n\nKey Points:\n- New project kickoff\n- Sprint schedule\n- Team assignments\n\nLet me know if you have any questions.\n\nThanks,\nTeam Lead",
          date: "2024-07-15T11:20:00",
          read: false,
          starred: false,
          hasAttachments: true,
          folder: "inbox",
          labels: ["work"],
          role: ["employee"]
        },
        {
          id: 12,
          from: "Training Department",
          email: "training@kravix.com",
          to: "employee@kravix.com",
          subject: "New Training Course: Advanced React",
          preview: "A new training course 'Advanced React' is now available...",
          content: "Hi Employee,\n\nA new training course 'Advanced React' is now available in the Learning portal. This course covers:\n\n- React Hooks in depth\n- State management with Redux\n- Performance optimization\n- Testing React applications\n\nEnroll now to enhance your skills!\n\nTraining Department",
          date: "2024-07-12T13:40:00",
          read: true,
          starred: true,
          hasAttachments: false,
          folder: "inbox",
          labels: ["personal"],
          role: ["employee"]
        }
      );
    }

    return baseEmails.filter(email => 
      email.role.includes("all") || email.role.includes(role)
    );
  };

  const [emails, setEmails] = useState(() => {
    const key = `kvx_mailbox_${role}`;
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : getEmails();
    } catch {
      return getEmails();
    }
  });

  const saveEmails = (newEmails) => {
    setEmails(newEmails);
    localStorage.setItem(`kvx_mailbox_${role}`, JSON.stringify(newEmails));
  };

  const folders = [
    { id: "inbox", name: "Inbox", icon: Inbox, count: emails.filter(e => e.folder === "inbox" && !e.read).length },
    { id: "starred", name: "Starred", icon: Star, count: emails.filter(e => e.starred).length },
    { id: "sent", name: "Sent", icon: Send, count: emails.filter(e => e.folder === "sent").length },
    { id: "archive", name: "Archive", icon: Archive, count: emails.filter(e => e.folder === "archive").length },
    { id: "trash", name: "Trash", icon: Trash2, count: emails.filter(e => e.folder === "trash").length },
  ];

  const labels = [
    { id: "all", name: "All Messages", color: "bg-gray-400" },
    { id: "important", name: "Important", color: "bg-red-500" },
    { id: "work", name: "Work", color: "bg-blue-500" },
    { id: "personal", name: "Personal", color: "bg-emerald-500" },
  ];

  const [composeData, setComposeData] = useState({
    to: location.state?.composeTo || "",
    subject: "",
    message: ""
  });

  const filteredEmails = emails
    .filter(email => {
      if (activeFolder === "starred") return email.starred;
      return email.folder === activeFolder;
    })
    .filter(email => {
      if (activeLabel === "all") return true;
      return email.labels?.includes(activeLabel);
    })
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

  const markAsRead = (id) => {
    saveEmails(emails.map(email => 
      email.id === id ? { ...email, read: true } : email
    ));
  };

  const toggleStar = (id) => {
    saveEmails(emails.map(email => 
      email.id === id ? { ...email, starred: !email.starred } : email
    ));
  };

  const handleDelete = (id) => {
    saveEmails(emails.map(email => {
      if (email.id === id) {
        if (email.folder === "trash") {
          return null; // permanently deleted
        }
        return { ...email, folder: "trash" };
      }
      return email;
    }).filter(Boolean));
    setSelectedMail(null);
    toast.success("Email moved to trash 🗑️");
  };

  const handleArchive = (id) => {
    saveEmails(emails.map(email => 
      email.id === id ? { ...email, folder: "archive" } : email
    ));
    setSelectedMail(null);
    toast.success("Email archived 📦");
  };

  const handleSend = () => {
    if (!composeData.to || !composeData.subject || !composeData.message) {
      toast.error("Please fill in all fields.");
      return;
    }
    const newMail = {
      id: Date.now(),
      from: "Me",
      email: `${role}@kravix.com`,
      to: composeData.to,
      subject: composeData.subject,
      preview: composeData.message.substring(0, 60) + "...",
      content: composeData.message,
      date: new Date().toISOString(),
      read: true,
      starred: false,
      hasAttachments: false,
      folder: "sent",
      labels: ["work"],
      role: [role]
    };
    saveEmails([newMail, ...emails]);
    toast.success("Email sent successfully! 🚀");
    setComposeMode(false);
    setComposeData({ to: "", subject: "", message: "" });
  };

  const roleGradients = {
    ceo: "from-purple-500 to-indigo-500",
    admin: "from-blue-500 to-cyan-500",
    hr: "from-pink-500 to-rose-500",
    employee: "from-orange-500 to-amber-500"
  };

  const grad = roleGradients[role] || "from-blue-500 to-cyan-500";

  return (
    <div className="h-[calc(100vh-10rem)] rounded-3xl flex overflow-hidden relative shadow-2xl animate-fadeIn"
      style={{
        background: isDark ? "rgba(30, 41, 59, 0.4)" : "rgba(255, 255, 255, 0.8)",
        border: `1px solid ${t.cardBorder}`,
        backdropFilter: "blur(20px)"
      }}>
      
      {/* 1. Left Navigation panel (Folders & Labels) */}
      <div className="w-64 flex flex-col p-5 flex-shrink-0"
        style={{
          background: isDark ? "rgba(255, 255, 255, 0.01)" : "rgba(0, 0, 0, 0.01)",
          borderRight: `1px solid ${t.cardBorder}`
        }}>
        
        {/* Compose Button */}
        <button
          onClick={() => setComposeMode(true)}
          className={`w-full mb-6 py-3 rounded-2xl text-white font-bold tracking-wide flex items-center justify-center gap-2 hover:scale-[1.03] transition-all hover:opacity-90 shadow-lg bg-gradient-to-r ${grad}`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Compose</span>
        </button>

        {/* Folders */}
        <div className="space-y-1.5 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-2" style={{ color: t.textMuted }}>Mailboxes</p>
          {folders.map((folder) => {
            const Icon = folder.icon;
            const isSelected = activeFolder === folder.id;
            return (
              <button
                key={folder.id}
                onClick={() => { setActiveFolder(folder.id); setSelectedMail(null); }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
                style={{
                  background: isSelected ? (isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)") : "transparent",
                  color: isSelected ? t.textPrimary : t.textSecondary
                }}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" style={{ color: isSelected ? (isDark ? "#c084fc" : "#7c3aed") : t.textMuted }} />
                  <span className="text-sm font-medium">{folder.name}</span>
                </div>
                {folder.count > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: isSelected 
                        ? (isDark ? "rgba(139, 92, 246, 0.2)" : "rgba(124, 58, 237, 0.1)") 
                        : (isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)"),
                      color: isSelected 
                        ? (isDark ? "#d8b4fe" : "#7e22ce") 
                        : t.textMuted
                    }}>
                    {folder.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Labels Section */}
          <div className="pt-6">
            <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-3" style={{ color: t.textMuted }}>Labels</p>
            <div className="space-y-1">
              {labels.map(l => (
                <button
                  key={l.id}
                  onClick={() => setActiveLabel(l.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all"
                  style={{
                    background: activeLabel === l.id ? (isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)") : "transparent",
                    color: activeLabel === l.id ? t.textPrimary : t.textSecondary
                  }}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${l.color}`}></span>
                  <span className="text-sm font-medium">{l.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Space Indicator */}
        <div className="p-3.5 rounded-2xl mt-auto"
          style={{
            background: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)",
            border: `1px solid ${t.cardBorder}`
          }}>
          <div className="flex justify-between text-[10px] mb-1.5 font-semibold" style={{ color: t.textSecondary }}>
            <span>Storage Used</span>
            <span style={{ color: t.textPrimary }}>42% (6.3 GB)</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)" }}>
            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: "42%" }} />
          </div>
        </div>
      </div>

      {/* 2. Middle panel (Email List) */}
      <div className="w-[380px] flex flex-col flex-shrink-0"
        style={{
          borderRight: `1px solid ${t.cardBorder}`
        }}>
        
        {/* Search */}
        <div className="p-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${t.cardBorder}` }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: t.textMuted }} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              style={{
                background: t.inputBg,
                border: `1px solid ${t.inputBorder}`,
                color: t.inputColor
              }}
            />
          </div>
        </div>

        {/* Email list container */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1" style={{ scrollbarWidth: "thin" }}>
          {filteredEmails.map((email) => {
            const isSelected = selectedMail?.id === email.id;
            const fromInitial = email.from.split(' ').map(n => n[0]).join('').substring(0, 2);
            return (
              <div
                key={email.id}
                onClick={() => {
                  setSelectedMail(email);
                  markAsRead(email.id);
                }}
                className="p-3.5 rounded-2xl cursor-pointer transition-all relative border"
                style={{
                  background: isSelected 
                    ? (isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)") 
                    : (!email.read 
                        ? (isDark ? "rgba(139, 92, 246, 0.08)" : "rgba(124, 58, 237, 0.04)")
                        : "transparent"),
                  borderColor: isSelected 
                    ? (isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)") 
                    : "transparent"
                }}
              >
                {/* Unread indicator dot */}
                {!email.read && (
                  <span className="absolute top-4 left-3 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                )}

                <div className="flex items-start justify-between mb-1.5 pl-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br ${grad} shadow`}>
                      {fromInitial}
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight" style={{ color: t.textPrimary }}>{email.from}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: t.textMuted }}>{email.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleStar(email.id); }}
                      className="p-1 transition-colors"
                      style={{ color: email.starred ? "#fbbf24" : t.textMuted }}
                    >
                      <Star className={`w-3.5 h-3.5 ${email.starred ? "fill-current" : ""}`} />
                    </button>
                    <span className="text-[10px] font-medium" style={{ color: t.textMuted }}>{formatDate(email.date)}</span>
                  </div>
                </div>

                <div className="pl-10">
                  <h4 className="text-xs font-semibold line-clamp-1 mb-0.5" style={{ color: email.read ? t.textSecondary : t.textPrimary }}>{email.subject}</h4>
                  <p className="text-[11px] line-clamp-2 leading-relaxed" style={{ color: t.textMuted }}>{email.preview}</p>
                  
                  <div className="flex items-center gap-1.5 mt-2">
                    {email.labels?.map(lbl => {
                      const lConf = labels.find(x => x.id === lbl);
                      return (
                        <span key={lbl} className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border"
                          style={{
                            background: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
                            color: t.textSecondary,
                            borderColor: t.cardBorder
                          }}>
                          {lConf?.name || lbl}
                        </span>
                      );
                    })}
                    {email.hasAttachments && (
                      <span className="text-[10px] flex items-center gap-0.5 font-semibold" style={{ color: t.textMuted }}>
                        <Paperclip className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredEmails.length === 0 && (
            <div className="py-16 text-center">
              <Inbox className="w-10 h-10 mx-auto mb-3" style={{ color: t.textMuted }} />
              <p className="text-xs font-semibold" style={{ color: t.textSecondary }}>No conversations found</p>
              <p className="text-[10px] mt-1" style={{ color: t.textMuted }}>Try another search or folder</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Right panel (Email Reading Area) */}
      <div className="flex-1 flex flex-col bg-transparent">
        {selectedMail ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header controls */}
            <div className="p-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${t.cardBorder}` }}>
              <div className="flex items-center gap-2">
                <button onClick={() => handleArchive(selectedMail.id)} className="p-2 rounded-xl transition-all" style={{ color: t.textSecondary }} title="Archive"
                  onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <Archive className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(selectedMail.id)} className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-1">
                {[{ Icon: Reply }, { Icon: Forward }, { Icon: Printer }].map(({ Icon }, i) => (
                  <button key={i} className="p-2 rounded-xl transition-all" style={{ color: t.textSecondary }}
                    onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Email Message Detail */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-slideUpFade" style={{ scrollbarWidth: "thin" }}>
              {/* Title & Subject */}
              <div>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border mb-2 inline-block"
                  style={{
                    background: isDark ? "rgba(168, 85, 247, 0.15)" : "rgba(147, 51, 234, 0.1)",
                    color: isDark ? "#c084fc" : "#7e22ce",
                    borderColor: isDark ? "rgba(168, 85, 247, 0.2)" : "rgba(147, 51, 234, 0.2)"
                  }}>
                  {selectedMail.folder}
                </span>
                <h2 className="text-xl font-bold tracking-tight" style={{ color: t.textPrimary }}>{selectedMail.subject}</h2>
              </div>

              {/* Sender Details */}
              <div className="flex items-center justify-between p-4 rounded-2xl border"
                style={{
                  background: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.01)",
                  borderColor: t.cardBorder
                }}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold bg-gradient-to-br ${grad} shadow-lg`}>
                    {selectedMail.from.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: t.textPrimary }}>{selectedMail.from}</p>
                    <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>From: {selectedMail.email} · To: {selectedMail.to}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold" style={{ color: t.textSecondary }}>
                    {new Date(selectedMail.date).toLocaleDateString('en-US', { 
                      month: 'long', day: 'numeric', year: 'numeric' 
                    })}
                  </p>
                  <p className="text-[10px] mt-0.5 font-medium" style={{ color: t.textMuted }}>
                    {new Date(selectedMail.date).toLocaleTimeString('en-US', { 
                      hour: '2-digit', minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>

              {/* Message Content */}
              <div className="p-5 rounded-2xl border min-h-[180px]"
                style={{
                  background: isDark ? "rgba(255, 255, 255, 0.01)" : "rgba(255, 255, 255, 0.5)",
                  borderColor: t.cardBorder
                }}>
                <p className="text-sm whitespace-pre-line leading-relaxed tracking-wide" style={{ color: t.textSecondary }}>
                  {selectedMail.content}
                </p>
              </div>

              {/* Attachments */}
              {selectedMail.hasAttachments && (
                <div className="pt-4" style={{ borderTop: `1px solid ${t.cardBorder}` }}>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: t.textMuted }}>Attachments (2)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3.5 border rounded-2xl hover:scale-[1.01] transition-all"
                      style={{
                        background: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.01)",
                        borderColor: t.cardBorder
                      }}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-400">
                          <Paperclip className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate" style={{ color: t.textPrimary }}>Q3_Report_Draft.pdf</p>
                          <p className="text-[10px] mt-0.5" style={{ color: t.textMuted }}>2.4 MB</p>
                        </div>
                      </div>
                      <button onClick={() => toast.success("Downloading Q3_Report_Draft.pdf...")} className="p-2 rounded-xl" style={{ color: t.textMuted }}>
                        <Download className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3.5 border rounded-2xl hover:scale-[1.01] transition-all"
                      style={{
                        background: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.01)",
                        borderColor: t.cardBorder
                      }}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-500/10 border border-blue-500/20 text-blue-400">
                          <Paperclip className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate" style={{ color: t.textPrimary }}>Presentation_Slides.pptx</p>
                          <p className="text-[10px] mt-0.5" style={{ color: t.textMuted }}>5.1 MB</p>
                        </div>
                      </div>
                      <button onClick={() => toast.success("Downloading Presentation_Slides.pptx...")} className="p-2 rounded-xl" style={{ color: t.textMuted }}>
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Reply Bar */}
            <div className="p-4 flex gap-3 items-center" style={{ borderTop: `1px solid ${t.cardBorder}` }}>
              <input
                type="text"
                placeholder={`Reply to ${selectedMail.from}...`}
                className="flex-1 px-4 py-3 text-xs rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                style={{
                  background: t.inputBg,
                  border: `1px solid ${t.inputBorder}`,
                  color: t.inputColor
                }}
              />
              <button onClick={() => toast.success("Reply sent successfully!")} className={`p-3 rounded-xl text-white flex items-center justify-center bg-gradient-to-r ${grad} hover:opacity-90 shadow-md`}>
                <SendHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
              style={{
                background: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                border: `1px solid ${t.cardBorder}`
              }}>
              <Mail className="w-8 h-8" style={{ color: t.textMuted }} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: t.textSecondary }}>Select a Conversation</h3>
            <p className="text-[11px] mt-1 max-w-[200px]" style={{ color: t.textMuted }}>Click any message thread on the left pane to view detailed correspondence</p>
          </div>
        )}
      </div>

      {/* 4. Compose Dialog Overlay */}
      {composeMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: isDark ? "rgba(5, 5, 15, 0.65)" : "rgba(15, 23, 42, 0.3)",
            backdropFilter: "blur(8px)"
          }}>
          <div className="w-full max-w-xl rounded-3xl overflow-hidden p-6 shadow-2xl animate-scaleIn"
            style={{
              background: isDark ? "linear-gradient(135deg, #1b1735, #0a0e22)" : "#ffffff",
              border: `1px solid ${t.cardBorder}`
            }}>
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4" style={{ borderBottom: `1px solid ${t.cardBorder}` }}>
              <h3 className="text-base font-bold flex items-center gap-2" style={{ color: t.textPrimary }}>
                <Edit3 className="w-4 h-4 text-purple-500" />
                <span>New Correspondence</span>
              </h3>
              <button 
                onClick={() => setComposeMode(false)}
                className="p-1 rounded-lg hover:bg-black/05 dark:hover:bg-white/08"
                style={{ color: t.textMuted }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: t.textMuted }}>To</label>
                <input
                  type="email"
                  value={composeData.to}
                  onChange={(e) => setComposeData({...composeData, to: e.target.value})}
                  placeholder="name@kravix.com"
                  className="w-full px-4 py-3 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  style={{
                    background: t.inputBg,
                    border: `1px solid ${t.inputBorder}`,
                    color: t.inputColor
                  }}
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: t.textMuted }}>Subject</label>
                <input
                  type="text"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
                  placeholder="Topic of discussion..."
                  className="w-full px-4 py-3 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  style={{
                    background: t.inputBg,
                    border: `1px solid ${t.inputBorder}`,
                    color: t.inputColor
                  }}
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: t.textMuted }}>Body Content</label>
                <textarea
                  value={composeData.message}
                  onChange={(e) => setComposeData({...composeData, message: e.target.value})}
                  rows="6"
                  placeholder="Type message here..."
                  className="w-full px-4 py-3 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  style={{
                    background: t.inputBg,
                    border: `1px solid ${t.inputBorder}`,
                    color: t.inputColor
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-black/05 dark:hover:bg-white/05 transition-all"
                  style={{ color: t.textSecondary }}>
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Attach files</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setComposeMode(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl hover:bg-black/05 dark:hover:bg-white/05 transition-all"
                    style={{ color: t.textSecondary }}
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSend}
                    className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-lg bg-gradient-to-r ${grad} hover:opacity-95 hover:scale-[1.02] transition-all`}
                  >
                    Send message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Mailbox;