import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, X, ChevronRight, LogOut, Briefcase, Users, Building2,
  Shield, Settings, Activity, Bell, FileText, Database, Key, Lock, Globe,
  HelpCircle, Calendar, Clock, DollarSign, TrendingUp, UserCheck, BookOpen,
  Mail, PieChart, Server, HardDrive, AlertCircle, CheckCircle, ChevronDown, User
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { useAdminTheme } from "../../contexts/AdminThemeContext";

const Sidebar = ({ navigation, isOpen, setIsOpen, role }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { t, isDark } = useAdminTheme();

  const [expanded, setExpanded] = useState({});
  const [logoUrl, setLogoUrl] = useState(() => {
    return localStorage.getItem("companyLogo") || "/images/kravix.png";
  });

  // Expand the submenu if the current route matches a child
  useEffect(() => {
    if (navigation) {
      const currentPath = location.pathname;
      navigation.forEach(item => {
        if (item.submenu && item.submenu.some(sub => currentPath.startsWith(sub.href))) {
          setExpanded(prev => ({ ...prev, [item.name]: true }));
        }
      });
    }
  }, [navigation, location.pathname]);

  useEffect(() => {
    const handleLogoChange = () => {
      setLogoUrl(localStorage.getItem("companyLogo") || "/images/kravix.png");
    };
    window.addEventListener("logoChanged", handleLogoChange);
    return () => window.removeEventListener("logoChanged", handleLogoChange);
  }, []);

  const roleColors = {
    ceo: "from-purple-600 to-indigo-600",
    admin: "from-blue-600 to-cyan-600",
    hr: "from-emerald-500 to-teal-600",
    employee: "from-orange-500 to-amber-600"
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const getDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.first_name) return user.first_name;
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getUserInitial = () => {
    if (user?.first_name) return user.first_name.charAt(0).toUpperCase();
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  const getRoleDisplay = () => {
    if (role === 'employee') return 'Employee';
    if (role === 'admin') return 'Administrator';
    if (role === 'hr') return 'HR Manager';
    if (role === 'ceo') return 'CEO';
    return role || 'User';
  };

  const toggleExpand = (name, e) => {
    e.preventDefault();
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <>
      {/* Mobile backdrop with advanced blur */}
      {isOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-md lg:hidden z-40 transition-all duration-500 bg-black/60"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Pro Max Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 w-72 
          transform transition-all duration-500 ease-out lg:translate-x-0
          flex flex-col overflow-hidden
          ${isOpen ? 'translate-x-0 shadow-[20px_0_40px_rgba(0,0,0,0.3)]' : '-translate-x-full lg:shadow-none'}
        `}
        style={{
          background: t.sidebarBg,
          backdropFilter: 'blur(40px)',
          borderRight: `1px solid ${t.sidebarBorder}`,
        }}
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>

        {/* Logo Section */}
        <div className="h-24 flex items-center px-6 relative z-10">
          <div className="flex items-center space-x-3 w-full">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg shadow-indigo-500/20"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}>
              <img 
                src={logoUrl} 
                alt="KRAVIX" 
                className="h-7 w-auto object-contain brightness-0 invert"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-baseline space-x-0.5">
                <span className="text-2xl font-black tracking-tight" style={{ color: t.textPrimary }}>KRAVIX</span>
                <span className="text-[0.65rem] font-bold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">TECH</span>
              </div>
              <span className="text-xs text-gray-500 font-medium">Enterprise Portal</span>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-xl bg-gray-100/10 hover:bg-white/20 transition-colors ml-auto"
            style={{ color: t.textSecondary }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-5 mb-4 relative z-10">
          <div className="flex items-center space-x-3 p-3.5 rounded-2xl border border-white/5 shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer group"
               style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
            <div className={`relative h-11 w-11 rounded-xl bg-gradient-to-br ${roleColors[role] || 'from-gray-700 to-gray-900'} flex items-center justify-center text-white font-bold text-lg shadow-inner group-hover:scale-105 transition-transform duration-300`}>
              {getUserInitial()}
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white dark:border-gray-900 rounded-full"></div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate group-hover:text-indigo-500 transition-colors" style={{ color: t.userNameColor }}>{getDisplayName()}</p>
              <p className="text-xs font-medium truncate mt-0.5 opacity-80" style={{ color: t.userRoleColor }}>{getRoleDisplay()}</p>
            </div>
            <Settings className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 overflow-y-auto px-4 pb-6 relative z-10 custom-scrollbar" style={{ scrollbarWidth: 'none' }}>
          <ul className="space-y-1.5">
            {navigation?.map((item) => {
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isExpanded = expanded[item.name];
              const isChildActive = hasSubmenu && item.submenu.some(sub => location.pathname.startsWith(sub.href));

              return (
                <li key={item.name} className="relative">
                  <NavLink
                    to={hasSubmenu ? "#" : item.href}
                    onClick={(e) => {
                      if (hasSubmenu) {
                        toggleExpand(item.name, e);
                      } else {
                        setIsOpen(false);
                      }
                    }}
                    className={({ isActive }) => `
                      flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl
                      transition-all duration-300 group relative overflow-hidden
                      ${(isActive && !hasSubmenu) || isChildActive ? 'active-nav-item' : ''}
                    `}
                    style={({ isActive }) => {
                      const active = (isActive && !hasSubmenu) || isChildActive;
                      return {
                        background: active ? `linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.15) 100%)` : 'transparent',
                        color: active ? (isDark ? '#fff' : '#4f46e5') : t.navInactiveColor,
                        boxShadow: active ? 'inset 0 0 0 1px rgba(99,102,241,0.2)' : 'none',
                      };
                    }}
                    onMouseEnter={e => {
                      if (!e.currentTarget.classList.contains('active-nav-item')) {
                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
                        e.currentTarget.style.color = t.textPrimary;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!e.currentTarget.classList.contains('active-nav-item')) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = t.navInactiveColor;
                      }
                    }}
                  >
                    {({ isActive }) => {
                      const active = (isActive && !hasSubmenu) || isChildActive;
                      return (
                        <>
                          {/* Active Indicator Bar */}
                          {active && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-full bg-gradient-to-b from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]"></span>
                          )}
                          
                          {/* Animated Background on hover */}
                          <div className="absolute inset-0 w-full h-full bg-white/10 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
                          
                          <item.icon className={`
                            h-5 w-5 mr-3.5 transition-all duration-300 group-hover:scale-110
                            ${active ? 'text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'opacity-70 group-hover:opacity-100 group-hover:text-indigo-400'}
                          `} />
                          
                          <span className="flex-1 truncate">{item.name}</span>
                          
                          {hasSubmenu ? (
                            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-indigo-500' : 'opacity-50'}`} />
                          ) : (
                            active && <ChevronRight className="h-4 w-4 text-indigo-500 opacity-50" />
                          )}
                        </>
                      );
                    }}
                  </NavLink>

                  {/* Submenu rendering */}
                  {hasSubmenu && (
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}
                    >
                      <ul className="pl-11 pr-2 py-1 space-y-1">
                        {item.submenu.map((sub) => (
                          <li key={sub.name}>
                            <NavLink
                              to={sub.href}
                              onClick={() => setIsOpen(false)}
                              className={({ isActive }) => `
                                block px-4 py-2.5 text-xs font-semibold rounded-xl
                                transition-all duration-200 relative group
                              `}
                              style={({ isActive }) => ({
                                background: isActive ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.08)') : 'transparent',
                                color: isActive ? (isDark ? '#fff' : '#4f46e5') : t.navInactiveColor,
                              })}
                              onMouseEnter={e => {
                                const isAct = e.currentTarget.style.background !== 'transparent';
                                if (!isAct) {
                                  e.currentTarget.style.color = t.textPrimary;
                                }
                              }}
                              onMouseLeave={e => {
                                const isAct = e.currentTarget.style.background !== 'transparent';
                                if (!isAct) {
                                  e.currentTarget.style.color = t.navInactiveColor;
                                }
                              }}
                            >
                              {({ isActive }) => (
                                <>
                                  <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-all duration-300
                                    ${isActive ? 'bg-indigo-500 scale-100' : 'bg-gray-400 scale-0 group-hover:scale-100 opacity-50'}
                                  `}></span>
                                  {sub.name}
                                </>
                              )}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer / Logout */}
        <div className="p-5 relative z-10" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 group relative overflow-hidden"
            style={{ color: '#f43f5e', background: isDark ? 'rgba(244, 63, 94, 0.05)' : 'rgba(244, 63, 94, 0.05)' }}
            onMouseEnter={e => { 
              e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'; 
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(244, 63, 94, 0.15)';
            }}
            onMouseLeave={e => { 
              e.currentTarget.style.background = isDark ? 'rgba(244, 63, 94, 0.05)' : 'rgba(244, 63, 94, 0.05)'; 
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div className="absolute inset-0 w-full h-full bg-rose-500/10 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
            <LogOut className="h-5 w-5 mr-3 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>Sign Out</span>
          </button>
          
          <div className="mt-4 flex items-center justify-center space-x-2 text-[10px] font-semibold tracking-widest uppercase opacity-40">
            <span>v2.0.1</span>
            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
            <span>KVX System</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;