import {
  LayoutDashboard,
  Users,
  Building2,
  Shield,
  Settings,
  Activity,
  Bell,
  FileText,
  Database,
  Key,
  Lock,
  Globe,
  HelpCircle,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  UserCheck,
  BookOpen,
  Mail,
  Download,
  PieChart,
  Server,
  HardDrive,
  AlertCircle,
  CheckCircle,
  User,
  FileSpreadsheet,
  FolderOpen,
  MessageSquare,
  Ticket,
  Award
} from "lucide-react";

export const ADMIN_NAVIGATION = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  {
    name: "Employee Management",
    href: "/admin/employees",
    icon: Users,
    submenu: [
      { name: "All Employees", href: "/admin/employees" },
      { name: "Add Employee", href: "/admin/employees/add" },
      { name: "Departments", href: "/admin/departments" },
    ]
  },
  {
    name: "HR Management",
    href: "/admin/hr",
    icon: User,
    submenu: [
      { name: "All HRs", href: "/admin/hr" },
      { name: "Add HR", href: "/admin/hr/add" },
      { name: "HR Dashboard", href: "/admin/hr-management" },
      { name: "Recruitment", href: "/admin/hr/recruitment" },
      { name: "Payroll", href: "/admin/hr/payroll" },
      { name: "Performance Reviews", href: "/admin/hr/performance" },
    ],
  },

  {
    name: "Departments",
    href: "/admin/departments",
    icon: Building2,
    submenu: [
      { name: "All Departments", href: "/admin/departments" },
      { name: "Add Department", href: "/admin/departments/add" },
    ]
  },
  {
    name: "Roles & Permissions",
    href: "/admin/roles",
    icon: Shield,
    submenu: [
      { name: "All Roles", href: "/admin/roles" },
      { name: "Permissions", href: "/admin/permissions" },
    ]
  },
  {
    name: "System Logs",
    href: "/admin/logs",
    icon: Activity,
    submenu: [
      { name: "Activity Logs", href: "/admin/logs" },
      { name: "Audit Logs", href: "/admin/logs/audit" },
      { name: "Security Logs", href: "/admin/logs/security" },
    ]
  },
  {
    name: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    submenu: [
      { name: "All Notifications", href: "/admin/notifications" },
      { name: "Announcements", href: "/admin/announcements" },
      { name: "Settings", href: "/admin/notifications/settings" },
    ]
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: PieChart,
    submenu: [
      { name: "Generate Report", href: "/admin/reports/generate" },
      { name: "User Reports", href: "/admin/reports/users" },
      { name: "System Reports", href: "/admin/reports/system" },
      { name: "Security Reports", href: "/admin/reports/security" },
    ]
  },
  {
    name: "Security",
    href: "/admin/security",
    icon: Lock,
    submenu: [
      { name: "Security Overview", href: "/admin/security" },
      { name: "2FA Settings", href: "/admin/security/2fa" },
      { name: "Audit Trail", href: "/admin/security/audit" },
    ]
  },
  {
    name: "Backup",
    href: "/admin/backup",
    icon: Database,
    submenu: [
      { name: "Backup Manager", href: "/admin/backup" },
      { name: "Restore", href: "/admin/backup/restore" },
    ]
  },
  {
    name: "API Management",
    href: "/admin/api",
    icon: Key,
    submenu: [
      { name: "API Keys", href: "/admin/api/keys" },
      { name: "API Logs", href: "/admin/api/logs" },
    ]
  },
  {
    name: "Integrations",
    href: "/admin/integrations",
    icon: Globe
  },
  { name: "Mailbox", href: "/admin/mailbox", icon: Mail },
  { name: "Chat", href: "/admin/chat", icon: MessageSquare },
  { name: "Tasks", href: "/admin/tasks", icon: CheckCircle },
  { name: "Designations", href: "/admin/designations", icon: Award },
  { name: "Tickets", href: "/admin/tickets", icon: Ticket },
  { name: "Events", href: "/admin/events", icon: Calendar },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    submenu: [
      { name: "General", href: "/admin/settings/general" },
      { name: "Security", href: "/admin/settings/security" },
      { name: "Backup", href: "/admin/settings/backup" },
      { name: "API", href: "/admin/settings/api" },
      { name: "Integrations", href: "/admin/settings/integrations" },
    ]
  },
  { name: "Help Center", href: "/admin/help", icon: HelpCircle },
];

export const CEO_NAVIGATION = [
  { name: "Dashboard", href: "/ceo/dashboard", icon: LayoutDashboard },
  { name: "Company Analytics", href: "/ceo/analytics", icon: TrendingUp },
  { name: "Financial Overview", href: "/ceo/financial", icon: DollarSign },
  { name: "Performance Reports", href: "/ceo/performance", icon: FileText },
  { name: "Employees", href: "/ceo/employees", icon: Users },
  { name: "Departments", href: "/ceo/departments", icon: Building2 },
  { name: "Security", href: "/ceo/security", icon: Shield },
  { name: "Reports", href: "/ceo/reports", icon: PieChart },
  { name: "Mailbox", href: "/ceo/mailbox", icon: Mail },
  { name: "Chat", href: "/ceo/chat", icon: MessageSquare },
  { name: "Settings", href: "/ceo/settings", icon: Settings },
];

export const HR_NAVIGATION = [
  { name: "Dashboard", href: "/hr/dashboard", icon: LayoutDashboard },
  { name: "My Profile", href: "/hr/profile", icon: User },
  { name: "Employees", href: "/hr/employees", icon: Users },
  { name: "Recruitment", href: "/hr/recruitment", icon: Briefcase },
  { name: "Attendance", href: "/hr/attendance", icon: Clock },
  { name: "Leave Management", href: "/hr/leave", icon: Calendar },
  { name: "HR Leaves", href: "/hr/leaves", icon: FolderOpen },
  { name: "Notifications", href: "/hr/notifications", icon: Bell },
  { name: "Payroll", href: "/hr/payroll", icon: DollarSign },
  { name: "Performance Reviews", href: "/hr/performance", icon: TrendingUp },
  { name: "Training", href: "/hr/training", icon: BookOpen },
  { name: "Reports", href: "/hr/reports", icon: FileText },
  { name: "Excel Sheets", href: "/hr/excel-sheets", icon: FileSpreadsheet },
  { name: "Mailbox", href: "/hr/mailbox", icon: Mail },
  { name: "Chat", href: "/hr/chat", icon: MessageSquare },
  { name: "Settings", href: "/hr/settings", icon: Settings },
];

export const EMPLOYEE_NAVIGATION = [
  { name: "Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
  { name: "Attendance", href: "/employee/attendance", icon: Clock },
  { name: "Leave Requests", href: "/employee/leave", icon: Calendar },
  { name: "Tasks", href: "/employee/tasks", icon: CheckCircle },
  { name: "Documents", href: "/employee/documents", icon: FileText },
  { name: "Learning", href: "/employee/learning", icon: BookOpen },
  { name: "Mailbox", href: "/employee/mailbox", icon: Mail },
  { name: "Chat", href: "/employee/chat", icon: MessageSquare },
  { name: "Settings", href: "/employee/settings", icon: Settings },
];