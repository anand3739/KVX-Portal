import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, X, ChevronRight, ChevronLeft, LogOut,
  Users, Building2, Shield, Settings, Activity, Bell, PieChart,
  Database, Key, Lock, Globe, HelpCircle, Mail, ChevronDown, Sparkles, Zap,
  MessageSquare, CheckCircle, Award, Ticket, Calendar, User
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { useAdminTheme } from "../../contexts/AdminThemeContext";

const navGroups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, badge: null },
      { name: "My Profile", href: "/admin/profile", icon: User, badge: null },
    ]
  },
  {
    label: "Management",
    items: [
      { name: "Employees", href: "/admin/employees", icon: Users, badge: "1.2k" },
      { name: "HR Management", href: "/admin/hr", icon: Users, badge: null },
      { name: "Departments", href: "/admin/departments", icon: Building2, badge: null },
      { name: "Designations", href: "/admin/designations", icon: Award, badge: null },
      { name: "Roles & Permissions", href: "/admin/roles", icon: Shield, badge: null },
      { name: "Tasks", href: "/admin/tasks", icon: CheckCircle, badge: null },
    ]
  },
  {
    label: "Communication",
    items: [
      { name: "Mailbox", href: "/admin/mailbox", icon: Mail, badge: "5" },
      { name: "Chat", href: "/admin/chat", icon: MessageSquare, badge: null },
      { name: "Notifications", href: "/admin/notifications", icon: Bell, badge: "3" },
      { name: "Tickets", href: "/admin/tickets", icon: Ticket, badge: null },
      { name: "Events", href: "/admin/events", icon: Calendar, badge: null },
    ]
  },
  {
    label: "System",
    items: [
      { name: "System Logs", href: "/admin/logs", icon: Activity, badge: null },
      { name: "Reports", href: "/admin/reports", icon: PieChart, badge: null },
      { name: "Security", href: "/admin/security", icon: Lock, badge: null },
      { name: "Backup", href: "/admin/backup", icon: Database, badge: null },
      { name: "API Management", href: "/admin/api", icon: Key, badge: null },
      { name: "Integrations", href: "/admin/integrations", icon: Globe, badge: null },
    ]
  },
  {
    label: "Configuration",
    items: [
      { name: "Settings", href: "/admin/settings", icon: Settings, badge: null },
      { name: "Help Center", href: "/admin/help", icon: HelpCircle, badge: null },
    ]
  }
];

const AdminSidebar = ({ isOpen, setIsOpen, collapsed, setCollapsed, role }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { t, isDark } = useAdminTheme();
  const [expandedGroups, setExpandedGroups] = useState(["Overview","Management","Communication","System","Configuration"]);

  const [logoUrl, setLogoUrl] = useState(() => localStorage.getItem("companyLogo") || "/images/kravix.png");

  useEffect(() => {
    const h = () => setLogoUrl(localStorage.getItem("companyLogo") || "/images/kravix.png");
    window.addEventListener("logoChanged", h);
    return () => window.removeEventListener("logoChanged", h);
  }, []);

  const handleLogout = () => { dispatch(logout()); navigate("/login"); };

  const getDisplayName = () => {
    if (user?.first_name && user?.last_name) return `${user.first_name} ${user.last_name}`;
    if (user?.first_name) return user.first_name;
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'Admin';
  };

  const getUserInitial = () => {
    if (user?.first_name) return user.first_name.charAt(0).toUpperCase();
    if (user?.name) return user.name.charAt(0).toUpperCase();
    return 'A';
  };

  const toggleGroup = (label) => {
    if (collapsed) return;
    setExpandedGroups(prev => prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]);
  };

  return (
    <>
      <div
        className="fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0"
        style={{
          width: collapsed ? '80px' : '280px',
          transform: isOpen ? 'translateX(0)' : undefined,
          background: t.sidebarBg,
          backdropFilter: 'blur(20px)',
          borderRight: `1px solid ${t.sidebarBorder}`,
          boxShadow: t.sidebarShadow,
        }}
      >
        {/* Logo Header */}
        <div className="flex items-center justify-between px-4 py-5 transition-colors duration-300"
          style={{ borderBottom: `1px solid ${t.sidebarBorder}`, minHeight: '72px' }}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <img src={logoUrl} alt="KRAVIX" className="w-7 h-7 object-contain" onError={(e) => { e.target.style.display='none'; }} />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400"
                  style={{ border: `2px solid ${isDark ? '#0f0c29' : '#fff'}` }}></span>
              </div>
              <div>
                <div className="font-bold text-base leading-tight tracking-wide" style={{ color: t.textPrimary }}>KRAVIX</div>
                <div className="text-xs font-medium tracking-widest" style={{ color: t.accentPurple }}>ADMIN PORTAL</div>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="flex items-center gap-1">
            <button onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200"
              style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: t.textSecondary }}
              onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
            >
              {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => setIsOpen(false)}
              className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg"
              style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: t.textSecondary }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Profile */}
        {!collapsed ? (
          <div className="px-4 py-4 transition-colors duration-300" style={{ borderBottom: `1px solid ${t.dividerColor}` }}>
            <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: t.userCardBg }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                {getUserInitial()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: t.userNameColor }}>{getDisplayName()}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                  <p className="text-xs" style={{ color: t.userRoleColor }}>Administrator</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-2 py-4 flex justify-center" style={{ borderBottom: `1px solid ${t.dividerColor}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              {getUserInitial()}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3" style={{ scrollbarWidth: 'none' }}>
          {navGroups.map((group) => (
            <div key={group.label} className="mb-1">
              {!collapsed ? (
                <button onClick={() => toggleGroup(group.label)}
                  className="flex items-center justify-between w-full px-3 py-2 mb-1 rounded-lg transition-all duration-200"
                  style={{ color: t.navGroupColor }}>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{group.label}</span>
                  <ChevronDown className="w-3 h-3 transition-transform duration-200"
                    style={{ transform: expandedGroups.includes(group.label) ? 'rotate(0deg)' : 'rotate(-90deg)' }} />
                </button>
              ) : (
                <div className="my-2 mx-2 h-px" style={{ background: t.dividerColor }}></div>
              )}

              {(collapsed || expandedGroups.includes(group.label)) && group.items.map((item) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                return (
                  <NavLink key={item.name} to={item.href} onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-200 group relative"
                    style={{
                      background: isActive ? t.navActive : 'transparent',
                      color: isActive ? t.navActiveColor : t.navInactiveColor,
                      border: isActive ? `1px solid ${t.navActiveBorder}` : '1px solid transparent',
                      transform: 'translateX(0)',
                    }}
                    onMouseEnter={e => { 
                      if (!isActive) { 
                        e.currentTarget.style.background = t.navHoverBg; 
                        e.currentTarget.style.color = t.textPrimary;
                        e.currentTarget.style.transform = 'translateX(2px)';
                      } 
                    }}
                    onMouseLeave={e => { 
                      if (!isActive) { 
                        e.currentTarget.style.background = 'transparent'; 
                        e.currentTarget.style.color = t.navInactiveColor;
                        e.currentTarget.style.transform = 'translateX(0)';
                      } 
                    }}
                    title={collapsed ? item.name : ''}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                        style={{ background: t.activeIndicator }}></span>
                    )}
                    <item.icon className={`flex-shrink-0 transition-all duration-200 ${collapsed ? 'mx-auto' : ''}`}
                      style={{
                        width: '18px', height: '18px',
                        color: isActive ? t.accentPurple : 'inherit',
                        filter: isActive ? `drop-shadow(0 0 6px ${t.accentPurple}60)` : 'none'
                      }} />
                    {!collapsed && (
                      <>
                        <span className="text-sm font-medium flex-1 truncate">{item.name}</span>
                        {item.badge && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0"
                            style={{
                              background: isActive ? t.badgeActiveBg : t.badgeBg,
                              color: isActive ? t.badgeActiveColor : t.badgeColor,
                              fontSize: '10px'
                            }}>
                            {item.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: t.accentPurple }} />}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="px-3 py-4" style={{ borderTop: `1px solid ${t.dividerColor}` }}>
          {!collapsed && (
            <div className="mb-3 p-3 rounded-xl transition-all duration-300"
              style={{ 
                background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.06)', 
                border: isDark ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(16,185,129,0.15)' 
              }}>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
                </div>
                <div>
                  <p style={{ color: isDark ? 'rgb(52,211,153)' : '#059669' }} className="text-xs font-semibold">System Healthy</p>
                  <p style={{ color: isDark ? 'rgba(52,211,153,0.7)' : '#10b981' }} className="text-xs opacity-80">All services operational</p>
                </div>
              </div>
            </div>
          )}

          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200"
            style={{ color: t.logoutColor, background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.background = t.logoutHoverBg; e.currentTarget.style.color = t.logoutHoverColor; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.logoutColor; }}
            title={collapsed ? 'Logout' : ''}
          >
            <LogOut className={`flex-shrink-0 ${collapsed ? 'mx-auto' : ''}`} style={{ width: '18px', height: '18px' }} />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>

          {!collapsed && (
            <div className="mt-3 text-center">
              <p className="text-xs" style={{ color: t.versionColor }}>v2.0.1 · KVX Admin</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
