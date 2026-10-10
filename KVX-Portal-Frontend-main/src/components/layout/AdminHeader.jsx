import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  Menu, 
  Search, 
  Bell, 
  User,
  Settings,
  LogOut,
  ChevronDown,
  Zap,
  UserPlus,
  Database,
  FileText,
  Lock,
  X,
  Command,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
  Clock,
  AlertCircle,
  Sun,
  Moon,
  Palette,
  CheckCircle
} from "lucide-react";
import { logout } from "../../store/slices/authSlice";
import { notificationService } from "../../services/notificationService";
import toast from "react-hot-toast";
import ModalManager from "../common/modals/ModalManager";
import { useAdminTheme } from "../../contexts/AdminThemeContext";

const MOCK_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Database Backup Completed",
    message: "System database backup has been successfully uploaded to cloud storage.",
    read: false,
    created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    type: "success"
  },
  {
    id: "notif-2",
    title: "Unusual Login Attempt",
    message: "Multiple failed login attempts detected from IP 45.123.45.67 (China).",
    read: false,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    type: "warning"
  },
  {
    id: "notif-3",
    title: "New Employee Onboarded",
    message: "Robert Taylor (EMP007) has completed his portal registration.",
    read: true,
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    type: "info"
  },
  {
    id: "notif-4",
    title: "API Gateway Latency Spike",
    message: "API latency exceeded 500ms for a duration of 3 minutes.",
    read: true,
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    type: "error"
  }
];

const AdminHeader = ({ sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed, role }) => {
  const { isDark, t, toggle } = useAdminTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Theme colors
  const themeColors = [
    { name: "Blue", class: "theme-blue", bg: "bg-blue-600" },
    { name: "Purple", class: "theme-purple", bg: "bg-purple-600" },
    { name: "Emerald", class: "theme-emerald", bg: "bg-emerald-600" },
    { name: "Amber", class: "theme-amber", bg: "bg-amber-500" },
    { name: "Rose", class: "theme-rose", bg: "bg-rose-600" },
  ];

  const quickActionsRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileMenuRef = useRef(null);
  const colorPickerRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target)) setShowQuickActions(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) setShowNotifications(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) setShowProfileMenu(false);
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) setShowColorPicker(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getNotifications();
      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      const stored = localStorage.getItem("mock_notifications");
      let list = [];
      if (stored) {
        list = JSON.parse(stored);
      } else {
        list = MOCK_NOTIFICATIONS;
        localStorage.setItem("mock_notifications", JSON.stringify(list));
      }
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.read).length);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark as read:", error);
      const stored = localStorage.getItem("mock_notifications");
      if (stored) {
        const list = JSON.parse(stored).map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        );
        localStorage.setItem("mock_notifications", JSON.stringify(list));
        setNotifications(list);
        setUnreadCount(list.filter(n => !n.read).length);
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      const stored = localStorage.getItem("mock_notifications");
      if (stored) {
        const list = JSON.parse(stored).map(n => ({ ...n, read: true }));
        localStorage.setItem("mock_notifications", JSON.stringify(list));
        setNotifications(list);
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      }
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const getDisplayName = () => {
    if (user?.first_name && user?.last_name) return `${user.first_name} ${user.last_name}`;
    if (user?.first_name) return user.first_name;
    if (user?.name) return user.name;
    return 'Admin';
  };

  const getUserInitial = () => {
    if (user?.first_name) return user.first_name.charAt(0).toUpperCase();
    if (user?.name) return user.name.charAt(0).toUpperCase();
    return 'A';
  };

  const quickActions = [
    { name: "Add Employee", action: "add_employee", icon: UserPlus, color: "#4facfe" },
    { name: "Run Backup", action: "run_backup", icon: Database, color: "#43e97b" },
    { name: "Generate Report", action: "generate_report", icon: FileText, color: "#fa709a" },
    { name: "System Settings", action: "navigate_settings", icon: Settings, color: "#f093fb" },
  ];

  const handleActionClick = (item) => {
    setShowQuickActions(false);
    if (item.action.startsWith("navigate_")) {
      const page = item.action.replace("navigate_", "");
      navigate(`/${role}/${page}`);
    } else {
      window.dispatchEvent(new CustomEvent("open-modal", { detail: { modalType: item.action } }));
    }
  };

  const handleColorChange = (colorClass) => {
    localStorage.setItem("primaryColor", colorClass);
    document.documentElement.className = document.documentElement.className
      .split(' ')
      .filter(c => !c.startsWith('theme-'))
      .join(' ');
    document.documentElement.classList.add(colorClass);
    window.dispatchEvent(new Event("primaryColorChanged"));
    setShowColorPicker(false);
    toast.success("Theme color updated!");
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex-shrink-0 transition-all duration-300" style={{
        background: t.headerBg,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${t.headerBorder}`,
        boxShadow: t.headerShadow
      }}>
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Left: Mobile menu + breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg transition-all duration-200"
                style={{ background: t.iconBtnBg, border: `1px solid ${t.iconBtnBorder}`, color: t.iconBtnColor }}
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Search */}
              <div className="hidden md:flex items-center relative">
                <div className="relative flex items-center transition-all duration-300"
                  style={{ width: searchFocused ? '380px' : '260px' }}>
                  <Search className="absolute left-3 h-4 w-4 z-10 transition-colors"
                    style={{ color: searchFocused ? t.searchIconFocus : t.searchIconColor }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Search employees, reports, logs..."
                    className="w-full pl-10 pr-16 py-2 text-sm rounded-xl transition-all duration-300"
                    style={{
                      background: searchFocused ? t.searchFocusBg : t.searchBg,
                      border: `1px solid ${searchFocused ? t.searchFocusBorder : t.searchBorder}`,
                      color: t.searchColor,
                      outline: 'none',
                    }}
                  />
                  <div className="absolute right-3 flex items-center gap-1">
                    <kbd className="text-xs px-1.5 py-0.5 rounded" style={{ background: t.kbdBg, color: t.kbdColor, fontFamily: 'monospace' }}>
                      ⌘K
                    </kbd>
                  </div>
                </div>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2">
              
              {/* Live clock */}
              <div className="hidden lg:flex flex-col items-end mr-2">
                <span className="text-sm font-mono font-medium leading-tight transition-colors duration-300" style={{ color: t.clockColor }}>{formatTime(currentTime)}</span>
                <span className="text-xs leading-tight transition-colors duration-300" style={{ color: t.clockSubColor }}>{formatDate(currentTime)}</span>
              </div>

              {/* Quick Actions */}
              <div className="relative" ref={quickActionsRef}>
                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    background: showQuickActions ? t.tabActiveBg : t.iconBtnBg,
                    border: `1px solid ${showQuickActions ? t.tabActiveBorder : t.iconBtnBorder}`,
                    color: showQuickActions ? t.tabActiveColor : t.iconBtnColor,
                  }}
                >
                  <Zap className="h-4 w-4" />
                  <span>Quick Actions</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showQuickActions ? 'rotate-180' : ''}`} />
                </button>

                {showQuickActions && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden z-50 animate-fadeIn"
                    style={{
                      background: t.dropdownBg,
                      border: `1px solid ${t.dropdownBorder}`,
                      boxShadow: t.dropdownShadow,
                      backdropFilter: 'blur(20px)'
                    }}>
                    <div className="px-4 py-3 border-b" style={{ borderColor: t.dividerColor }}>
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: t.quickActLabelColor }}>Admin Actions</span>
                    </div>
                    <div className="p-2">
                      {quickActions.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.name}
                            onClick={() => handleActionClick(item)}
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-xl transition-all duration-200 text-left group"
                            style={{ color: t.dropdownItemColor }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = t.dropdownItemHoverBg;
                              e.currentTarget.style.color = t.dropdownItemHoverColor;
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = t.dropdownItemColor;
                            }}
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: `${item.color}20`, border: `1px solid ${item.color}30` }}>
                              <Icon className="h-4 w-4" style={{ color: item.color }} />
                            </div>
                            <span className="font-medium">{item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Color Picker Dropdown */}
              <div className="relative" ref={colorPickerRef}>
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="p-2.5 rounded-xl transition-all duration-200"
                  style={{
                    background: showColorPicker ? t.tabActiveBg : t.iconBtnBg,
                    border: `1px solid ${showColorPicker ? t.tabActiveBorder : t.iconBtnBorder}`,
                    color: t.iconBtnColor,
                  }}
                  title="Change Theme Color"
                >
                  <Palette className="h-5.5 w-5.5 text-indigo-400" />
                </button>

                {showColorPicker && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden z-50 animate-fadeIn"
                    style={{
                      background: t.dropdownBg,
                      border: `1px solid ${t.dropdownBorder}`,
                      boxShadow: t.dropdownShadow,
                      backdropFilter: 'blur(20px)'
                    }}>
                    <div className="px-4 py-3 border-b" style={{ borderColor: t.dividerColor }}>
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: t.quickActLabelColor }}>
                        Theme Color
                      </span>
                    </div>
                    <div className="p-2">
                      {themeColors.map((color) => {
                        const isActive = document.documentElement.classList.contains(color.class);
                        return (
                          <button
                            key={color.name}
                            onClick={() => handleColorChange(color.class)}
                            className="flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-xl transition-all duration-200 text-left group"
                            style={{ color: t.dropdownItemColor }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = t.dropdownItemHoverBg;
                              e.currentTarget.style.color = t.dropdownItemHoverColor;
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = t.dropdownItemColor;
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-4 h-4 rounded-full ${color.bg}`}></span>
                              <span className="font-medium">{color.name}</span>
                            </div>
                            {isActive && <CheckCircle className="h-4 w-4 text-blue-500" />}
                          </button>
                        );
                      })}
                    </div>
                    {/* Dark Mode Toggle */}
                    <div className="px-4 py-3 border-t" style={{ borderColor: t.dividerColor }}>
                      <span className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: t.quickActLabelColor }}>
                        Dark Mode
                      </span>
                      <button
                        onClick={() => { toggle(); }}
                        className="flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-xl transition-all duration-200"
                        style={{ color: t.dropdownItemColor }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = t.dropdownItemHoverBg;
                          e.currentTarget.style.color = t.dropdownItemHoverColor;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = t.dropdownItemColor;
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
                          <span className="font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                        </div>
                        <div className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-all duration-300 ${isDark ? 'bg-indigo-500' : 'bg-gray-300'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${isDark ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 rounded-xl transition-all duration-200"
                  style={{
                    background: showNotifications ? t.tabActiveBg : t.iconBtnBg,
                    border: `1px solid ${showNotifications ? t.tabActiveBorder : t.iconBtnBorder}`,
                    color: t.iconBtnColor
                  }}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                      style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', fontSize: '10px' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-96 rounded-2xl overflow-hidden z-50 animate-fadeIn"
                    style={{
                      background: t.dropdownBg,
                      border: `1px solid ${t.dropdownBorder}`,
                      boxShadow: t.dropdownShadow,
                      backdropFilter: 'blur(20px)'
                    }}>
                    <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: t.dividerColor }}>
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-purple-400" />
                        <h3 className="font-semibold" style={{ color: t.textPrimary }}>Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{ background: t.badgeActiveBg, color: t.badgeActiveColor }}>
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead}
                          className="text-xs flex items-center gap-1 px-2 py-1 rounded-lg transition-all"
                          style={{ color: t.markReadColor, background: t.markReadBg }}
                          onMouseEnter={e => e.currentTarget.style.background = t.markReadHoverBg}
                          onMouseLeave={e => e.currentTarget.style.background = t.markReadBg}
                        >
                          <CheckCheck className="w-3 h-3" />
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-12 text-center">
                          <Bell className="h-10 w-10 mx-auto mb-3 opacity-20" style={{ color: t.accentPurple }} />
                          <p className="text-sm" style={{ color: t.notifEmptyColor }}>All caught up! No new notifications.</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div key={notification.id} onClick={() => markAsRead(notification.id)}
                            className="px-5 py-4 border-b cursor-pointer transition-all duration-200"
                            style={{
                              borderColor: t.dividerColor,
                              background: !notification.read ? t.notifUnreadBg : 'transparent'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = t.notifHoverBg}
                            onMouseLeave={e => e.currentTarget.style.background = !notification.read ? t.notifUnreadBg : 'transparent'}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: t.markReadBg }}>
                                <AlertCircle className="w-4 h-4 text-purple-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: t.notifTitleColor }}>{notification.title}</p>
                                <p className="text-xs mt-0.5 line-clamp-2" style={{ color: t.notifBodyColor }}>{notification.message}</p>
                                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: t.notifTimeColor }}>
                                  <Clock className="w-3 h-3" />
                                  {new Date(notification.created_at).toLocaleString()}
                                </p>
                              </div>
                              {!notification.read && <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0 mt-1"></span>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="px-5 py-3 text-center border-t" style={{ borderColor: t.dividerColor }}>
                      <button onClick={() => { setShowNotifications(false); navigate('/admin/notifications'); }}
                        className="text-sm font-medium transition-colors"
                        style={{ color: t.markReadColor }}
                        onMouseEnter={e => e.currentTarget.style.color = t.accentPurple}
                        onMouseLeave={e => e.currentTarget.style.color = t.markReadColor}
                      >
                        View all notifications →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-200"
                  style={{
                    background: showProfileMenu ? t.tabActiveBg : t.iconBtnBg,
                    border: `1px solid ${showProfileMenu ? t.tabActiveBorder : t.iconBtnBorder}`,
                  }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                    {getUserInitial()}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold leading-tight" style={{ color: t.userNameColor }}>{getDisplayName()}</p>
                    <p className="text-xs leading-tight" style={{ color: t.userRoleColor }}>Administrator</p>
                  </div>
                  <ChevronDown className={`hidden md:block h-3.5 w-3.5 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}
                    style={{ color: t.iconBtnColor }} />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl overflow-hidden z-50 animate-fadeIn"
                    style={{
                      background: t.dropdownBg,
                      border: `1px solid ${t.dropdownBorder}`,
                      boxShadow: t.dropdownShadow,
                      backdropFilter: 'blur(20px)'
                    }}>
                    {/* Profile header */}
                    <div className="px-5 py-4 border-b" style={{ borderColor: t.dividerColor, background: t.profileHeaderBg }}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                          style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                          {getUserInitial()}
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: t.userNameColor }}>{getDisplayName()}</p>
                          <p className="text-xs" style={{ color: t.textSecondary }}>{user?.email}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span className="text-xs text-emerald-400">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      {[
                        { label: 'Profile', icon: User, path: '/admin/profile' },
                        { label: 'Change Password', icon: Lock, path: '/admin/change-password' },
                        { label: 'Settings', icon: Settings, path: '/admin/settings' },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button key={item.label}
                            onClick={() => { setShowProfileMenu(false); navigate(item.path); }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm rounded-xl transition-all duration-200 text-left"
                            style={{ color: t.dropdownItemColor }}
                            onMouseEnter={e => { e.currentTarget.style.background = t.dropdownItemHoverBg; e.currentTarget.style.color = t.dropdownItemHoverColor; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.dropdownItemColor; }}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="font-medium">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-2 border-t" style={{ borderColor: t.dividerColor }}>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm rounded-xl transition-all duration-200 text-left"
                        style={{ color: t.logoutColor }}
                        onMouseEnter={e => { e.currentTarget.style.background = t.logoutHoverBg; e.currentTarget.style.color = t.logoutHoverColor; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.logoutColor; }}
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      <ModalManager />
    </>
  );
};

export default AdminHeader;
