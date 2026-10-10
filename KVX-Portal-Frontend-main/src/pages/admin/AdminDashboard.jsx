import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { downloadCSV } from "../../utils/downloadHelper";
import { 
  Users, 
  Shield, 
  Settings, 
  Activity,
  Server,
  HardDrive,
  AlertCircle,
  Bell,
  Download,
  UserPlus,
  Key,
  Database,
  Clock,
  TrendingUp,
  Lock,
  Cpu,
  Zap,
  ChevronRight,
  Globe,
  MoreHorizontal,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Radio,
  Wifi
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useAdminTheme } from "../../contexts/AdminThemeContext";

// Glass card component
const GlassCard = ({ children, className = "", style = {}, onClick, hover = true }) => {
  const { t } = useAdminTheme();
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl transition-all duration-300 ${hover ? 'hover:scale-[1.01]' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        background: t.cardBg,
        border: `1px solid ${t.cardBorder}`,
        backdropFilter: 'blur(10px)',
        boxShadow: t.cardShadow,
        ...style
      }}
    >
      {children}
    </div>
  );
};

// Animated counter
const AnimatedNumber = ({ value, suffix = "", prefix = "" }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    const duration = 1200;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
};

// Metric card
const MetricCard = ({ title, value, suffix = "", prefix = "", change, changeType, icon: Icon, gradient, delay = 0 }) => {
  const [visible, setVisible] = useState(false);
  const { t } = useAdminTheme();
  useEffect(() => { setTimeout(() => setVisible(true), delay); }, [delay]);
  
  return (
    <GlassCard
      className={`p-6 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{
        background: `linear-gradient(135deg, ${gradient[0]}15, ${gradient[1]}08)`,
        border: `1px solid ${gradient[0]}30`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl" style={{ background: `${gradient[0]}20`, border: `1px solid ${gradient[0]}30` }}>
          <Icon className="w-5 h-5" style={{ color: gradient[0] }} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
          changeType === 'up' ? 'text-emerald-400' : 'text-rose-400'
        }`} style={{ background: changeType === 'up' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)' }}>
          {changeType === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold mb-1 tabular-nums transition-colors duration-300" style={{ color: t.textPrimary }}>
          <AnimatedNumber value={value} suffix={suffix} prefix={prefix} />
        </p>
        <p className="text-sm font-medium transition-colors duration-300" style={{ color: t.textSecondary }}>{title}</p>
      </div>
      {/* Subtle glow line */}
      <div className="mt-4 h-1 rounded-full overflow-hidden" style={{ background: t.progressTrack }}>
        <div className="h-full rounded-full animate-pulse" style={{ 
          width: '60%', 
          background: `linear-gradient(90deg, ${gradient[0]}, ${gradient[1]})` 
        }}></div>
      </div>
    </GlassCard>
  );
};

// Custom Tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  const { t } = useAdminTheme();
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl px-4 py-3 transition-colors duration-300"
        style={{ background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, backdropFilter: 'blur(20px)' }}>
        <p className="text-xs mb-1" style={{ color: t.accentPurple }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-bold transition-colors duration-300" style={{ color: t.textPrimary }}>{p.value.toLocaleString()}</p>
        ))}
      </div>
    );
  }
  return null;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isDark, t } = useAdminTheme();
  const [activeTab, setActiveTab] = useState('hourly');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pulseIndex, setPulseIndex] = useState(0);

  const [systemHealth] = useState({
    cpu: 45, memory: 62, disk: 78, apiLatency: 124, network: 34, database: 89
  });

  const [stats] = useState({
    totalUsers: 1284, activeSessions: 847, systemUptime: 99.9,
    storageUsed: 2.4, newUsersToday: 32, alerts: 3
  });

  // Animate pulsing rows in log
  useEffect(() => {
    const timer = setInterval(() => setPulseIndex(p => (p + 1) % 6), 2000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => { setIsRefreshing(false); toast.success("Dashboard refreshed!"); }, 1200);
  };

  const userActivityData = [
    { hour: '00:00', users: 120, sessions: 85 },
    { hour: '04:00', users: 85, sessions: 60 },
    { hour: '08:00', users: 450, sessions: 380 },
    { hour: '10:00', users: 680, sessions: 590 },
    { hour: '12:00', users: 780, sessions: 650 },
    { hour: '14:00', users: 720, sessions: 600 },
    { hour: '16:00', users: 890, sessions: 740 },
    { hour: '18:00', users: 650, sessions: 510 },
    { hour: '20:00', users: 560, sessions: 420 },
    { hour: '22:00', users: 340, sessions: 260 },
    { hour: '24:00', users: 230, sessions: 180 },
  ];

  const weeklyData = [
    { day: 'Mon', users: 320, sessions: 280 },
    { day: 'Tue', users: 450, sessions: 390 },
    { day: 'Wed', users: 380, sessions: 340 },
    { day: 'Thu', users: 520, sessions: 470 },
    { day: 'Fri', users: 480, sessions: 420 },
    { day: 'Sat', users: 210, sessions: 180 },
    { day: 'Sun', users: 160, sessions: 130 },
  ];

  const userDistribution = [
    { name: 'Active', value: 847, color: '#6366f1' },
    { name: 'Idle', value: 325, color: '#06b6d4' },
    { name: 'Offline', value: 112, color: '#f59e0b' },
  ];

  const recentUsers = [
    { id: "EMP001", name: "John Doe", role: "Developer", status: "active", lastLogin: "2 min ago", avatar: "JD", department: "Engineering" },
    { id: "EMP002", name: "Jane Smith", role: "HR Manager", status: "active", lastLogin: "15 min ago", avatar: "JS", department: "Human Resources" },
    { id: "EMP003", name: "Mike Johnson", role: "Sales Lead", status: "offline", lastLogin: "2 days ago", avatar: "MJ", department: "Sales" },
    { id: "EMP004", name: "Sarah Wilson", role: "Marketing", status: "active", lastLogin: "1 hour ago", avatar: "SW", department: "Marketing" },
    { id: "EMP005", name: "David Brown", role: "Finance", status: "active", lastLogin: "30 min ago", avatar: "DB", department: "Finance" },
    { id: "EMP006", name: "Emily Davis", role: "Product Manager", status: "idle", lastLogin: "45 min ago", avatar: "ED", department: "Product" },
  ];

  const systemLogs = [
    { time: "09:45:23", event: "User login", user: "admin@kravix.com", status: "success", ip: "192.168.1.100", location: "New York" },
    { time: "09:42:11", event: "Database backup", user: "system", status: "success", ip: "localhost", location: "System" },
    { time: "09:38:45", event: "Permission change", user: "hr@kravix.com", status: "success", ip: "192.168.1.105", location: "London" },
    { time: "09:35:22", event: "Failed login attempt", user: "unknown", status: "failed", ip: "45.123.45.67", location: "China" },
    { time: "09:30:15", event: "System update", user: "admin", status: "success", ip: "192.168.1.100", location: "New York" },
    { time: "09:25:44", event: "File upload", user: "employee@kravix.com", status: "success", ip: "192.168.1.110", location: "Singapore" },
  ];

  const pendingRequests = [
    { id: 1, type: "Permission Change", user: "HR Manager", request: "Access to payroll module", time: "10 min ago", priority: "high", icon: Key },
    { id: 2, type: "Account Creation", user: "Admin", request: "New employee account setup", time: "25 min ago", priority: "medium", icon: UserPlus },
    { id: 3, type: "System Access", user: "Developer", request: "Database read access", time: "1 hour ago", priority: "low", icon: Database },
    { id: 4, type: "Security Alert", user: "Security", request: "Unusual login pattern", time: "2 hours ago", priority: "high", icon: Shield },
  ];

  const getStatusDot = (status) => {
    const map = { active: '#4ade80', idle: '#fbbf24', offline: '#94a3b8' };
    return map[status] || '#94a3b8';
  };

  const getPriorityStyle = (priority) => {
    const map = {
      high: { bg: 'rgba(248,113,113,0.15)', color: '#f87171', border: 'rgba(248,113,113,0.3)' },
      medium: { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
      low: { bg: 'rgba(52,211,153,0.15)', color: '#34d399', border: 'rgba(52,211,153,0.3)' },
    };
    return map[priority] || {};
  };

  const getHealthColor = (val) => {
    if (val < 50) return ['#4facfe', '#00f2fe'];
    if (val < 75) return ['#f093fb', '#f5576c'];
    return ['#fc5c7d', '#6a3093'];
  };

  const handleExportLogs = () => {
    toast.success("Downloading system activity logs...");
    const headers = ["Time", "Event", "User", "Status", "IP Address", "Location"];
    const rows = systemLogs.map(log => [log.time, log.event, log.user, log.status, log.ip, log.location]);
    downloadCSV("system_activity_logs.csv", headers, rows);
  };

  const handleDownloadRecentUsers = () => {
    toast.success("Downloading recent users list...");
    const headers = ["ID", "Name", "Role", "Department", "Status", "Last Login"];
    const rows = recentUsers.map(user => [user.id, user.name, user.role, user.department, user.status, user.lastLogin]);
    downloadCSV("recent_users.csv", headers, rows);
  };

  const avatarColors = [
    ['#6366f1', '#8b5cf6'],
    ['#06b6d4', '#0ea5e9'],
    ['#10b981', '#059669'],
    ['#f59e0b', '#ef4444'],
    ['#ec4899', '#f43f5e'],
    ['#22d3ee', '#6366f1'],
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* ===== HERO HEADER ===== */}
      <div className="relative overflow-hidden rounded-3xl p-8 transition-all duration-300"
        style={{
          background: t.heroBg,
          border: `1px solid ${t.heroBorder}`,
          backdropFilter: 'blur(20px)',
          boxShadow: t.heroShadow
        }}>
        {/* Background mesh */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl" style={{ opacity: isDark ? 0.15 : 0.08 }}>
          <div className="absolute w-64 h-64 rounded-full -top-16 -right-16" style={{ background: 'radial-gradient(circle, #f093fb, transparent)' }}></div>
          <div className="absolute w-48 h-48 rounded-full bottom-0 left-20" style={{ background: 'radial-gradient(circle, #4facfe, transparent)' }}></div>
          <div className="absolute w-32 h-32 rounded-full top-12 left-1/2" style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }}></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: t.badgeActiveBg, color: t.badgeActiveColor, border: `1px solid ${t.navActiveBorder}` }}>
                  🛡️ ADMIN CONTROL CENTER
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  All systems live
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight transition-colors duration-300" style={{ color: t.textPrimary }}>
                System Dashboard
              </h1>
              <p className="text-lg transition-colors duration-300" style={{ color: t.textSecondary }}>
                Complete visibility and control over your enterprise
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{ background: t.btnSecondaryBg, border: `1px solid ${t.btnSecondaryBorder}`, color: t.btnSecondaryColor }}
                onMouseEnter={e => e.currentTarget.style.background = t.navHoverBg}
                onMouseLeave={e => e.currentTarget.style.background = t.btnSecondaryBg}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-modal", { detail: { modalType: "generate_report" } }))}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{ background: t.btnSecondaryBg, border: `1px solid ${t.btnSecondaryBorder}`, color: t.btnSecondaryColor }}
                onMouseEnter={e => e.currentTarget.style.background = t.navHoverBg}
                onMouseLeave={e => e.currentTarget.style.background = t.btnSecondaryBg}
              >
                <Download className="h-4 w-4" />
                Export Report
              </button>
              <button
                onClick={() => navigate("/admin/settings")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{ background: t.btnPrimaryBg, color: t.btnPrimaryColor, boxShadow: isDark ? '0 4px 15px rgba(102,126,234,0.4)' : '0 4px 15px rgba(102,126,234,0.2)' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Settings className="h-4 w-4" />
                System Settings
              </button>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'System Uptime', value: '99.9%', color: '#34d399' },
              { label: 'Active Sessions', value: stats.activeSessions.toLocaleString(), color: '#4facfe' },
              { label: 'Pending Alerts', value: stats.alerts, color: '#fbbf24' },
              { label: 'Storage Used', value: `${stats.storageUsed} TB`, color: '#f093fb' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-2xl text-center transition-all duration-300"
                style={{ background: t.heroQuickStatBg, border: `1px solid ${t.heroQuickStatBorder}` }}>
                <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                <p className="text-xs mt-1 transition-colors duration-300" style={{ color: t.textSecondary }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== METRICS GRID ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Users"
          value={stats.totalUsers}
          change="+32 today"
          changeType="up"
          icon={Users}
          gradient={['#6366f1', '#8b5cf6']}
          delay={0}
        />
        <MetricCard
          title="System Health"
          value={98}
          suffix="%"
          change="+0.2%"
          changeType="up"
          icon={Server}
          gradient={['#10b981', '#06b6d4']}
          delay={100}
        />
        <MetricCard
          title="Security Score"
          value={97}
          suffix="%"
          change="No threats"
          changeType="up"
          icon={Shield}
          gradient={['#22d3ee', '#0ea5e9']}
          delay={200}
        />
        <MetricCard
          title="API Response"
          value={124}
          suffix="ms"
          change="-12ms"
          changeType="up"
          icon={Zap}
          gradient={['#f59e0b', '#ef4444']}
          delay={300}
        />
      </div>

      {/* ===== CHARTS ROW ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart - 2/3 */}
        <GlassCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold transition-colors duration-300" style={{ color: t.textPrimary }}>User Activity</h3>
              <p className="text-sm mt-0.5 transition-colors duration-300" style={{ color: t.textMuted }}>Real-time session tracking</p>
            </div>
            <div className="flex items-center gap-2">
              {['hourly', 'weekly'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200"
                  style={{
                    background: activeTab === tab ? t.tabActiveBg : t.tabInactiveBg,
                    color: activeTab === tab ? t.tabActiveColor : t.tabInactiveColor,
                    border: `1px solid ${activeTab === tab ? t.tabActiveBorder : 'transparent'}`
                  }}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeTab === 'hourly' ? userActivityData : weeklyData}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f093fb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f093fb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey={activeTab === 'hourly' ? 'hour' : 'day'} 
                  stroke={t.chartAxis} tick={{ fill: t.chartTickColor, fontSize: 11 }} />
                <YAxis stroke={t.chartAxis} tick={{ fill: t.chartTickColor, fontSize: 11 }} />
                <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="users" stroke="#667eea" strokeWidth={2.5} fill="url(#grad1)" dot={false} activeDot={{ r: 4, fill: '#667eea' }} />
                <Area type="monotone" dataKey="sessions" stroke="#f093fb" strokeWidth={2} fill="url(#grad2)" dot={false} activeDot={{ r: 4, fill: '#f093fb' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-4 pt-4" style={{ borderTop: `1px solid ${t.dividerColor}` }}>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: '#667eea' }}></span>
              <span className="text-xs transition-colors duration-300" style={{ color: t.textSecondary }}>Total Users</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: '#f093fb' }}></span>
              <span className="text-xs transition-colors duration-300" style={{ color: t.textSecondary }}>Active Sessions</span>
            </div>
          </div>
        </GlassCard>

        {/* Distribution Pie - 1/3 */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold transition-colors duration-300" style={{ color: t.textPrimary }}>User Status</h3>
              <p className="text-sm mt-0.5 transition-colors duration-300" style={{ color: t.textMuted }}>Distribution</p>
            </div>
            <div className="p-2 rounded-lg" style={{ background: t.badgeActiveBg }}>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={userDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                  {userDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke={isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.8)"} strokeWidth={1} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {userDistribution.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl transition-colors duration-300"
                style={{ background: isDark ? `${item.color}18` : `${item.color}08` }}>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}80` }}></span>
                  <span className="text-sm transition-colors duration-300" style={{ color: t.textSecondary }}>{item.name}</span>
                </div>
                <span className="text-sm font-bold transition-colors duration-300" style={{ color: t.textPrimary }}>{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* ===== SYSTEM HEALTH + PENDING REQUESTS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health - 2/3 */}
        <GlassCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold transition-colors duration-300" style={{ color: t.textPrimary }}>System Health Monitor</h3>
              <p className="text-sm mt-0.5 transition-colors duration-300" style={{ color: t.textMuted }}>Real-time infrastructure metrics</p>
            </div>
            <button onClick={() => navigate("/admin/logs")}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all"
              style={{ color: t.markReadColor, background: t.markReadBg }}
              onMouseEnter={e => e.currentTarget.style.background = t.markReadHoverBg}
              onMouseLeave={e => e.currentTarget.style.background = t.markReadBg}
            >
              View Logs <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {Object.entries(systemHealth).map(([key, value]) => {
              const [c1, c2] = getHealthColor(value);
              const displayVal = key === 'apiLatency' ? `${value}ms` : `${value}%`;
              const pct = key === 'apiLatency' ? (value / 200) * 100 : value;
              const label = key.replace(/([A-Z])/g, ' $1').trim();
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize transition-colors duration-300" style={{ color: t.textSecondary }}>{label}</span>
                    <span className="text-sm font-bold" style={{ color: c1 }}>{displayVal}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: t.progressTrack }}>
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${pct}%`, 
                        background: `linear-gradient(90deg, ${c1}, ${c2})`,
                        boxShadow: `0 0 8px ${c1}60`
                      }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* System Metrics Summary */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6" style={{ borderTop: `1px solid ${t.dividerColor}` }}>
            {[
              { label: 'DB Connections', value: '24/100', icon: Database, color: '#4facfe' },
              { label: 'Active Processes', value: '156', icon: Cpu, color: '#a78bfa' },
              { label: 'Error Rate', value: '0.02%', icon: Activity, color: '#34d399' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex flex-col items-center p-3 rounded-xl text-center transition-colors duration-300"
                  style={{ background: isDark ? `${item.color}10` : `${item.color}08`, border: `1px solid ${item.color}20` }}>
                  <Icon className="w-4 h-4 mb-2" style={{ color: item.color }} />
                  <p className="text-base font-bold transition-colors duration-300" style={{ color: t.textPrimary }}>{item.value}</p>
                  <p className="text-xs mt-0.5 transition-colors duration-300" style={{ color: t.textMuted }}>{item.label}</p>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Pending Requests - 1/3 */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold transition-colors duration-300" style={{ color: t.textPrimary }}>Pending</h3>
              <p className="text-sm mt-0.5 transition-colors duration-300" style={{ color: t.textMuted }}>Action required</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
              {pendingRequests.length} new
            </span>
          </div>
          <div className="space-y-3">
            {pendingRequests.map((req) => {
              const Icon = req.icon;
              const pStyle = getPriorityStyle(req.priority);
              return (
                <div key={req.id}
                  onClick={() => toast.success(`Loading "${req.type}" details...`)}
                  className="p-4 rounded-xl cursor-pointer transition-all duration-200 group"
                  style={{ background: t.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(100,116,139,0.04)', border: `1px solid ${t.dividerColor}` }}
                  onMouseEnter={e => { e.currentTarget.style.background = t.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(100,116,139,0.08)'; e.currentTarget.style.transform = 'translateX(3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = t.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(100,116,139,0.04)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg flex-shrink-0" style={{ background: pStyle.bg, border: `1px solid ${pStyle.border}` }}>
                      <Icon className="w-4 h-4" style={{ color: pStyle.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold transition-colors duration-300 truncate" style={{ color: t.textPrimary }}>{req.type}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize flex-shrink-0"
                          style={{ background: pStyle.bg, color: pStyle.color, border: `1px solid ${pStyle.border}` }}>
                          {req.priority}
                        </span>
                      </div>
                      <p className="text-xs mt-1 truncate transition-colors duration-300" style={{ color: t.textSecondary }}>{req.request}</p>
                      <p className="text-xs mt-1.5 flex items-center gap-1 transition-colors duration-300" style={{ color: t.textMuted }}>
                        <Clock className="w-3 h-3" /> {req.time}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => navigate("/admin/permissions")}
            className="w-full mt-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            style={{ background: t.markReadBg, color: t.markReadColor, border: `1px solid ${t.navActiveBorder}` }}
            onMouseEnter={e => e.currentTarget.style.background = t.markReadHoverBg}
            onMouseLeave={e => e.currentTarget.style.background = t.markReadBg}
          >
            View All Requests <ChevronRight className="w-4 h-4" />
          </button>
        </GlassCard>
      </div>

      {/* ===== RECENT USERS TABLE ===== */}
      <GlassCard className="overflow-hidden" hover={false}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${t.dividerColor}` }}>
          <div>
            <h3 className="text-lg font-bold transition-colors duration-300" style={{ color: t.textPrimary }}>Recent Users</h3>
            <p className="text-sm mt-0.5 transition-colors duration-300" style={{ color: t.textMuted }}>Showing 6 of {stats.totalUsers.toLocaleString()} total</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => toast.success("Filtering users...")}
              className="p-2 rounded-lg transition-all duration-200"
              style={{ background: t.iconBtnBg, color: t.iconBtnColor }}
              onMouseEnter={e => e.currentTarget.style.color = t.textPrimary}
              onMouseLeave={e => e.currentTarget.style.color = t.iconBtnColor}
            >
              <Filter className="h-4 w-4" />
            </button>
            <button onClick={handleDownloadRecentUsers}
              className="p-2 rounded-lg transition-all duration-200"
              style={{ background: t.iconBtnBg, color: t.iconBtnColor }}
              onMouseEnter={e => e.currentTarget.style.color = t.textPrimary}
              onMouseLeave={e => e.currentTarget.style.color = t.iconBtnColor}
            >
              <Download className="h-4 w-4" />
            </button>
            <button onClick={() => navigate("/admin/employees")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{ background: t.markReadBg, color: t.markReadColor, border: `1px solid ${t.navActiveBorder}` }}
              onMouseEnter={e => e.currentTarget.style.background = t.markReadHoverBg}
              onMouseLeave={e => e.currentTarget.style.background = t.markReadBg}
            >
              View All <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: t.tableHeaderBg, borderBottom: `1px solid ${t.dividerColor}` }}>
                {['Employee', 'ID', 'Department', 'Role', 'Status', 'Last Login', ''].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors duration-300"
                    style={{ color: t.tableHeaderColor }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user, index) => (
                <tr key={user.id}
                  className="group transition-all duration-200"
                  style={{ borderBottom: `1px solid ${t.tableRowBorder}` }}
                  onMouseEnter={e => e.currentTarget.style.background = t.tableRowHoverBg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                          style={{ background: `linear-gradient(135deg, ${avatarColors[index % avatarColors.length][0]}, ${avatarColors[index % avatarColors.length][1]})` }}>
                          {user.avatar}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
                          style={{ background: getStatusDot(user.status), borderColor: isDark ? 'rgba(15,12,41,0.9)' : '#fff' }}></span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold transition-colors duration-300 group-hover:text-purple-400" style={{ color: t.textPrimary }}>{user.name}</p>
                        <p className="text-xs transition-colors duration-300" style={{ color: t.textMuted }}>{user.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono transition-colors duration-300" style={{ color: t.textSecondary }}>{user.id}</td>
                  <td className="px-6 py-4 text-sm transition-colors duration-300" style={{ color: t.tableCellColor }}>{user.department}</td>
                  <td className="px-6 py-4 text-sm transition-colors duration-300" style={{ color: t.tableCellColor }}>{user.role}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize"
                      style={{
                        background: user.status === 'active' ? 'rgba(52,211,153,0.15)' : user.status === 'idle' ? 'rgba(251,191,36,0.15)' : t.isDark ? 'rgba(148,163,184,0.15)' : 'rgba(100,116,139,0.08)',
                        color: user.status === 'active' ? '#34d399' : user.status === 'idle' ? '#fbbf24' : t.textSecondary,
                        border: `1px solid ${user.status === 'active' ? 'rgba(52,211,153,0.3)' : user.status === 'idle' ? 'rgba(251,191,36,0.3)' : t.isDark ? 'rgba(148,163,184,0.2)' : 'rgba(100,116,139,0.12)'}`
                      }}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm transition-colors duration-300" style={{ color: t.textMuted }}>{user.lastLogin}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/admin/employees/${user.id}`)}
                      className="opacity-0 group-hover:opacity-100 transition-all duration-200 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: t.markReadBg, color: t.markReadColor, border: `1px solid ${t.navActiveBorder}` }}
                      onMouseEnter={e => e.currentTarget.style.background = t.markReadHoverBg}
                      onMouseLeave={e => e.currentTarget.style.background = t.markReadBg}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* ===== SYSTEM ACTIVITY LOG ===== */}
      <GlassCard className="p-6" hover={false}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold transition-colors duration-300" style={{ color: t.textPrimary }}>System Activity Log</h3>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>
              <Radio className="w-3 h-3 animate-pulse" /> LIVE
            </span>
          </div>
          <button onClick={handleExportLogs}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{ color: t.markReadColor, background: t.markReadBg }}
            onMouseEnter={e => e.currentTarget.style.background = t.markReadHoverBg}
            onMouseLeave={e => e.currentTarget.style.background = t.markReadBg}
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
        <div className="space-y-2">
          {systemLogs.map((log, index) => (
            <div key={index}
              className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden"
              style={{
                background: index === pulseIndex ? t.notifUnreadBg : (t.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(100,116,139,0.02)'),
                border: index === pulseIndex ? `1px solid ${t.navActiveBorder}` : '1px solid transparent',
              }}
              onMouseEnter={e => e.currentTarget.style.background = t.notifHoverBg}
              onMouseLeave={e => e.currentTarget.style.background = index === pulseIndex ? t.notifUnreadBg : (t.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(100,116,139,0.02)')}
            >
              <span className="text-xs font-mono w-20 flex-shrink-0 transition-colors duration-300" style={{ color: t.logTimestampColor }}>{log.time}</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0"
                style={{
                  background: log.status === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
                  color: log.status === 'success' ? '#34d399' : '#f87171',
                  border: `1px solid ${log.status === 'success' ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`
                }}>
                {log.status === 'success' ? '✓' : '✗'} {log.status}
              </span>
              <span className="text-sm font-medium flex-1 truncate transition-colors duration-300" style={{ color: t.textPrimary }}>{log.event}</span>
              <span className="text-xs flex-shrink-0 transition-colors duration-300" style={{ color: t.textSecondary }}>{log.user}</span>
              <span className="text-xs hidden lg:block flex-shrink-0 transition-colors duration-300" style={{ color: t.textMuted }}>{log.location}</span>
              <span className="text-xs hidden xl:block font-mono flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: t.accentPurple }}>{log.ip}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ===== QUICK ACTIONS GRID ===== */}
      <div>
        <h3 className="text-lg font-bold mb-4 transition-colors duration-300" style={{ color: t.textPrimary }}>Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Add Employee', sub: 'Create account', icon: UserPlus, gradient: ['#4facfe', '#00f2fe'], action: () => window.dispatchEvent(new CustomEvent("open-modal", { detail: { modalType: "add_employee" } })) },
            { label: 'Permissions', sub: 'Manage roles', icon: Key, gradient: ['#a78bfa', '#7c3aed'], action: () => navigate("/admin/permissions") },
            { label: 'Backup', sub: 'Run backup', icon: Database, gradient: ['#43e97b', '#38f9d7'], action: () => window.dispatchEvent(new CustomEvent("open-modal", { detail: { modalType: "run_backup" } })) },
            { label: 'Settings', sub: 'Configure', icon: Settings, gradient: ['#f093fb', '#f5576c'], action: () => navigate("/admin/settings") },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <button key={i} onClick={item.action}
                className="p-6 rounded-2xl text-left transition-all duration-300 group relative overflow-hidden"
                style={{
                  background: isDark ? `linear-gradient(135deg, ${item.gradient[0]}20, ${item.gradient[1]}10)` : `linear-gradient(135deg, ${item.gradient[0]}0c, ${item.gradient[1]}06)`,
                  border: isDark ? `1px solid ${item.gradient[0]}30` : `1px solid ${item.gradient[0]}20`,
                  boxShadow: `0 4px 20px ${item.gradient[0]}08`
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 12px 30px ${item.gradient[0]}20`;
                  e.currentTarget.style.border = `1px solid ${item.gradient[0]}50`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 20px ${item.gradient[0]}08`;
                  e.currentTarget.style.border = isDark ? `1px solid ${item.gradient[0]}30` : `1px solid ${item.gradient[0]}20`;
                }}
              >
                {/* Glow orb */}
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
                  style={{ background: `radial-gradient(circle, ${item.gradient[0]}, transparent)` }}></div>
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300"
                    style={{ background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`, boxShadow: `0 4px 15px ${item.gradient[0]}30` }}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-base transition-colors duration-300" style={{ color: t.textPrimary }}>{item.label}</p>
                  <p className="text-xs mt-1 transition-colors duration-300" style={{ color: t.textSecondary }}>{item.sub}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;