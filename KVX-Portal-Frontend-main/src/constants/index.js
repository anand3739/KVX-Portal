// src/constants/index.js

export const MAX_FILE_SIZE = 50 * 1024 * 1024;

export const ALLOWED_FILE_TYPES = [
  'image/*', 
  'application/pdf', 
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 
  'application/zip', 
  'application/x-zip-compressed', 
  'video/*', 
  'audio/*'
];

export const EMOJIS = [
  "😀","😊","👍","🙌","❤️","🔥","✅","🎉","👏","😄","🤝","💪","🚀",
  "✨","💡","📊","📅","⏰","💬","🌟","🎯","⚡","💎","🏆","🌈"
];

export const CONTACTS = [
  { id: 1, name: "Sarah Johnson", role: "HR Manager", avatar: "SJ", color: "#ec4899", online: true, unread: 3, lastMsg: "Can you review the payroll report?", lastTime: "2m", typing: true },
  { id: 2, name: "Michael Chen", role: "CEO", avatar: "MC", color: "#8b5cf6", online: true, unread: 1, lastMsg: "Meeting confirmed ✓", lastTime: "15m", typing: false },
  { id: 3, name: "Emily Davis", role: "Developer", avatar: "ED", color: "#3b82f6", online: false, unread: 0, lastMsg: "The report is ready", lastTime: "1h", typing: false },
  { id: 4, name: "Robert Taylor", role: "Designer", avatar: "RT", color: "#f59e0b", online: true, unread: 0, lastMsg: "Designs uploaded ✓", lastTime: "2h", typing: false },
  { id: 5, name: "Lisa Wang", role: "Admin", avatar: "LW", color: "#10b981", online: false, unread: 0, lastMsg: "Thanks for the update", lastTime: "1d", typing: false },
];

export const GROUPS = [
  { id: 10, name: "Engineering Team", avatar: "ET", color: "#6366f1", members: 12, unread: 7, lastMsg: "Sprint review at 3pm 🚀", lastTime: "5m", typing: false },
  { id: 11, name: "HR Department", avatar: "HR", color: "#ec4899", members: 8, unread: 0, lastMsg: "New policy update shared", lastTime: "30m", typing: false },
  { id: 12, name: "All Company", avatar: "AC", color: "#14b8a6", members: 150, unread: 2, lastMsg: "Happy Birthday John! 🎉", lastTime: "1h", typing: false },
];

export const MESSAGES = {
  1: [
    { id: 1, from: "Sarah Johnson", text: "Hi! Can you review the Q2 payroll report when you get a chance?", time: "10:02 AM", mine: false, color: "#ec4899", avatar: "SJ", read: true },
    { id: 2, from: "me", text: "Sure! I'll take a look right away.", time: "10:04 AM", mine: true, read: true },
    { id: 3, from: "Sarah Johnson", text: "Great, I'll send you the spreadsheet now. It has all the details for Q2.", time: "10:05 AM", mine: false, color: "#ec4899", avatar: "SJ", read: true },
    { id: 4, from: "me", text: "Perfect. Can you also include the attendance data for cross-reference?", time: "10:07 AM", mine: true, read: true },
    { id: 5, from: "Sarah Johnson", text: "Can you review the payroll? 🙏", time: "10:08 AM", mine: false, color: "#ec4899", avatar: "SJ", read: false },
  ],
  2: [
    { id: 1, from: "Michael Chen", text: "Meeting confirmed for tomorrow at 10 AM", time: "09:30 AM", mine: false, color: "#8b5cf6", avatar: "MC", read: true },
    { id: 2, from: "me", text: "I'll be there! Should I prepare a presentation?", time: "09:32 AM", mine: true, read: true },
    { id: 3, from: "Michael Chen", text: "Yes please, cover Q2 KPIs and next quarter goals. Keep it crisp. ✅", time: "09:35 AM", mine: false, color: "#8b5cf6", avatar: "MC", read: true },
    { id: 4, from: "me", text: "On it! I'll have the deck ready by 9 AM.", time: "09:40 AM", mine: true, read: false },
  ],
  10: [
    { id: 1, from: "Team Bot", text: "🌅 Good morning team! Sprint 14 planning starts today.", time: "09:00 AM", mine: false, color: "#6366f1", avatar: "ET", read: true },
    { id: 2, from: "Emily Davis", text: "I'll have the demos ready by 2pm. Feature branch is merged.", time: "09:15 AM", mine: false, color: "#3b82f6", avatar: "ED", read: true },
    { id: 3, from: "me", text: "Great! I'll set up the meeting room and share the Zoom link.", time: "09:20 AM", mine: true, read: true },
    { id: 4, from: "Robert Taylor", text: "All design assets are in Figma. Ready for review 🎨", time: "09:30 AM", mine: false, color: "#f59e0b", avatar: "RT", read: true },
    { id: 5, from: "Team Bot", text: "🚀 Sprint review at 3pm today", time: "09:45 AM", mine: false, color: "#6366f1", avatar: "ET", read: false },
  ]
};

export const THEME = {
  dark: {
    textPrimary: "#f1f5f9",
    textSecondary: "#cbd5e1",
    textMuted: "#94a3b8",
    searchBg: "rgba(255,255,255,0.05)",
    searchBorder: "rgba(255,255,255,0.08)",
    searchColor: "#f1f5f9",
    searchIconColor: "#64748b",
    tabActiveBg: "rgba(99,102,241,0.2)",
    tabActiveColor: "#a78bfa",
    tabActiveBorder: "rgba(99,102,241,0.3)",
    inputBg: "rgba(255,255,255,0.05)",
    inputBorder: "rgba(255,255,255,0.08)",
    inputColor: "#f1f5f9",
    cardShadow: "0 8px 32px rgba(0,0,0,0.4)",
    cardBorder: "rgba(255,255,255,0.06)",
  },
  light: {
    textPrimary: "#0f172a",
    textSecondary: "#1e293b",
    textMuted: "#64748b",
    searchBg: "rgba(248,250,252,0.8)",
    searchBorder: "rgba(203,213,225,0.4)",
    searchColor: "#0f172a",
    searchIconColor: "#94a3b8",
    tabActiveBg: "rgba(99,102,241,0.1)",
    tabActiveColor: "#6366f1",
    tabActiveBorder: "rgba(99,102,241,0.2)",
    inputBg: "rgba(248,250,252,0.8)",
    inputBorder: "rgba(203,213,225,0.3)",
    inputColor: "#0f172a",
    cardShadow: "0 8px 32px rgba(0,0,0,0.06)",
    cardBorder: "rgba(226,232,240,0.8)",
  }
};