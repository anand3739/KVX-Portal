import { createContext, useContext, useState, useEffect, useCallback } from "react";

// ─── DARK THEME TOKENS ────────────────────────────────────────────────────────
const dark = {
  // Layout
  layoutBg:      '#070a13',
  // Sidebar
  sidebarBg:     'rgba(13, 17, 28, 0.95)',
  sidebarBorder: 'rgba(255,255,255,0.06)',
  sidebarShadow: '4px 0 30px rgba(0,0,0,0.6)',
  navActive:     'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))',
  navActiveBorder:'rgba(99, 102, 241, 0.35)',
  navActiveColor: '#a78bfa',
  navInactiveColor:'rgba(148, 163, 184, 0.8)',
  navHoverBg:    'rgba(255,255,255,0.04)',
  navGroupColor: '#64748b',
  activeIndicator:'linear-gradient(to bottom, #6366f1, #8b5cf6)',
  badgeBg:       'rgba(255,255,255,0.08)',
  badgeColor:    '#94a3b8',
  badgeActiveBg: 'rgba(139, 92, 246, 0.25)',
  badgeActiveColor:'#c084fc',
  userCardBg:    'rgba(255,255,255,0.03)',
  userNameColor: '#f8fafc',
  userRoleColor: '#64748b',
  dividerColor:  'rgba(255,255,255,0.06)',
  versionColor:  '#475569',
  // Header
  headerBg:      'rgba(7, 10, 19, 0.8)',
  headerBorder:  'rgba(255,255,255,0.06)',
  headerShadow:  '0 4px 20px rgba(0,0,0,0.5)',
  searchBg:      'rgba(15, 23, 42, 0.6)',
  searchBorder:  'rgba(255,255,255,0.08)',
  searchFocusBg: 'rgba(15, 23, 42, 0.8)',
  searchFocusBorder:'#6366f1',
  searchColor:   '#f8fafc',
  searchPlaceholder:'#475569',
  searchIconColor:'#475569',
  searchIconFocus:'#6366f1',
  iconBtnBg:     'rgba(255,255,255,0.03)',
  iconBtnBorder: 'rgba(255,255,255,0.06)',
  iconBtnColor:  '#cbd5e1',
  dropdownBg:    '#0e1322',
  dropdownBorder:'rgba(255,255,255,0.08)',
  dropdownShadow:'0 10px 30px rgba(0,0,0,0.7)',
  dropdownItemColor:'#94a3b8',
  dropdownItemHoverBg:'rgba(99, 102, 241, 0.12)',
  dropdownItemHoverColor:'#ffffff',
  dropdownLabelColor:'#475569',
  profileHeaderBg:'rgba(99, 102, 241, 0.08)',
  kbdBg:         '#1e293b',
  kbdColor:      '#64748b',
  clockColor:    '#f8fafc',
  clockSubColor: '#8b5cf6',
  notifUnreadBg: 'rgba(99, 102, 241, 0.12)',
  notifHoverBg:  'rgba(255,255,255,0.02)',
  notifTitleColor:'#f1f5f9',
  notifBodyColor:'#94a3b8',
  notifTimeColor:'#475569',
  notifEmptyColor:'#475569',
  markReadBg:    'rgba(99, 102, 241, 0.12)',
  markReadColor: '#818cf8',
  markReadHoverBg:'rgba(99, 102, 241, 0.22)',
  quickActLabelColor:'#64748b',
  // Main content
  cardBg:        'rgba(17, 24, 39, 0.75)',
  cardBorder:    'rgba(255,255,255,0.08)',
  cardShadow:    '0 8px 30px rgba(0, 0, 0, 0.3)',
  textPrimary:   '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted:     '#64748b',
  tableBg:       'transparent',
  tableHeaderBg: 'rgba(255,255,255,0.015)',
  tableHeaderColor:'#64748b',
  tableRowHoverBg:'rgba(255,255,255,0.02)',
  tableRowBorder:'rgba(255,255,255,0.06)',
  tableCellColor:'#cbd5e1',
  logRowBg:      'rgba(0,0,0,0.3)',
  logRowHoverBg: 'rgba(255,255,255,0.04)',
  logTimestampColor:'#475569',
  inputBg:       'rgba(15, 23, 42, 0.8)',
  inputBorder:   'rgba(255,255,255,0.1)',
  inputColor:    '#f8fafc',
  progressTrack: '#1e293b',
  sectionDivider:'rgba(255,255,255,0.06)',
  miniCardBg:    'rgba(255,255,255,0.02)',
  accentPurple:  '#a78bfa',
  accentBlue:    '#60a5fa',
  btnPrimaryBg:  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  btnPrimaryColor:'#ffffff',
  btnSecondaryBg:'rgba(255,255,255,0.08)',
  btnSecondaryBorder:'rgba(255,255,255,0.12)',
  btnSecondaryColor:'#e2e8f0',
  tabActiveBg:   'rgba(99, 102, 241, 0.15)',
  tabActiveColor:'#a78bfa',
  tabActiveBorder:'#8b5cf6',
  tabInactiveBg: 'transparent',
  tabInactiveColor:'#475569',
  chartGrid:     'rgba(255,255,255,0.05)',
  chartAxis:     '#475569',
  chartTickColor:'#64748b',
  tooltipBg:     '#0e1322',
  tooltipBorder: 'rgba(255,255,255,0.1)',
  pendingCardBg: 'rgba(17, 24, 39, 0.75)',
  pendingCardBorder:'rgba(255,255,255,0.06)',
  pendingCardHoverBg:'rgba(255,255,255,0.05)',
  heroBg:        'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 50%, rgba(15, 23, 42, 0) 100%)',
  heroBorder:    'rgba(99, 102, 241, 0.2)',
  heroShadow:    '0 20px 40px rgba(0,0,0,0.5)',
  heroQuickStatBg:'rgba(255,255,255,0.03)',
  heroQuickStatBorder:'rgba(255,255,255,0.06)',
  // Logout
  logoutColor:   '#f87171',
  logoutHoverColor:'#fca5a5',
  logoutHoverBg: 'rgba(239,68,68,0.12)',
};

// ─── LIGHT THEME TOKENS ───────────────────────────────────────────────────────
const light = {
  // Layout
  layoutBg:      '#f8fafc',
  // Sidebar
  sidebarBg:     'rgba(255, 255, 255, 0.85)',
  sidebarBorder: '#e2e8f0',
  sidebarShadow: '1px 0 10px rgba(0,0,0,0.02)',
  navActive:     '#eff6ff',
  navActiveBorder:'#bfdbfe',
  navActiveColor: '#1d4ed8',
  navInactiveColor:'#64748b',
  navHoverBg:    '#f1f5f9',
  navGroupColor: '#94a3b8',
  activeIndicator:'#3b82f6',
  badgeBg:       '#f1f5f9',
  badgeColor:    '#64748b',
  badgeActiveBg: '#dbeafe',
  badgeActiveColor:'#1d4ed8',
  userCardBg:    '#f8fafc',
  userNameColor: '#0f172a',
  userRoleColor: '#64748b',
  dividerColor:  '#e2e8f0',
  versionColor:  '#cbd5e1',
  // Header
  headerBg:      'rgba(255, 255, 255, 0.85)',
  headerBorder:  '#e2e8f0',
  headerShadow:  '0 1px 3px rgba(0,0,0,0.05)',
  searchBg:      '#f1f5f9',
  searchBorder:  '#e2e8f0',
  searchFocusBg: '#ffffff',
  searchFocusBorder:'#3b82f6',
  searchColor:   '#0f172a',
  searchPlaceholder:'#94a3b8',
  searchIconColor:'#94a3b8',
  searchIconFocus:'#3b82f6',
  iconBtnBg:     '#ffffff',
  iconBtnBorder: '#e2e8f0',
  iconBtnColor:  '#475569',
  dropdownBg:    '#ffffff',
  dropdownBorder:'#e2e8f0',
  dropdownShadow:'0 4px 12px rgba(0,0,0,0.1)',
  dropdownItemColor:'#475569',
  dropdownItemHoverBg:'#f1f5f9',
  dropdownItemHoverColor:'#1e293b',
  dropdownLabelColor:'#94a3b8',
  profileHeaderBg:'#f8fafc',
  kbdBg:         '#f1f5f9',
  kbdColor:      '#64748b',
  clockColor:    '#0f172a',
  clockSubColor: '#3b82f6',
  notifUnreadBg: '#eff6ff',
  notifHoverBg:  '#f8fafc',
  notifTitleColor:'#0f172a',
  notifBodyColor:'#64748b',
  notifTimeColor:'#94a3b8',
  notifEmptyColor:'#94a3b8',
  markReadBg:    '#eff6ff',
  markReadColor: '#2563eb',
  markReadHoverBg:'#dbeafe',
  quickActLabelColor:'#94a3b8',
  // Main content
  cardBg:        '#ffffff',
  cardBorder:    '#e2e8f0',
  cardShadow:    '0 1px 3px rgba(0,0,0,0.05)',
  textPrimary:   '#0f172a',
  textSecondary: '#475569',
  textMuted:     '#94a3b8',
  tableBg:       'transparent',
  tableHeaderBg: '#f8fafc',
  tableHeaderColor:'#64748b',
  tableRowHoverBg:'#f8fafc',
  tableRowBorder:'#e2e8f0',
  tableCellColor:'#334155',
  logRowBg:      '#fcfcfc',
  logRowHoverBg: '#f1f5f9',
  logTimestampColor:'#94a3b8',
  inputBg:       '#ffffff',
  inputBorder:   '#cbd5e1',
  inputColor:    '#0f172a',
  progressTrack: '#e2e8f0',
  sectionDivider:'#e2e8f0',
  miniCardBg:    '#ffffff',
  accentPurple:  '#7c3aed',
  accentBlue:    '#2563eb',
  btnPrimaryBg:  '#2563eb',
  btnPrimaryColor:'#ffffff',
  btnSecondaryBg:'#f1f5f9',
  btnSecondaryBorder:'transparent',
  btnSecondaryColor:'#1e293b',
  tabActiveBg:   '#eff6ff',
  tabActiveColor:'#1d4ed8',
  tabActiveBorder:'#3b82f6',
  tabInactiveBg: 'transparent',
  tabInactiveColor:'#64748b',
  chartGrid:     '#f1f5f9',
  chartAxis:     '#e2e8f0',
  chartTickColor:'#94a3b8',
  tooltipBg:     '#ffffff',
  tooltipBorder: '#e2e8f0',
  pendingCardBg: '#f8fafc',
  pendingCardBorder:'#e2e8f0',
  pendingCardHoverBg:'#f1f5f9',
  heroBg:        'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
  heroBorder:    '#e2e8f0',
  heroShadow:    '0 4px 15px rgba(0,0,0,0.05)',
  heroQuickStatBg:'#ffffff',
  heroQuickStatBorder:'#e2e8f0',
  // Logout
  logoutColor:   '#dc2626',
  logoutHoverColor:'#b91c1c',
  logoutHoverBg: 'rgba(220,38,38,0.08)',
};

const AdminThemeContext = createContext({ isDark: true, t: dark, toggle: () => {} });

export const AdminThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("adminTheme");
    if (stored !== null) return stored === "dark";
    // Fall back to the global darkMode setting
    return localStorage.getItem("darkMode") === "true";
  });

  // Sync with external dark-mode changes (e.g., from Settings page)
  useEffect(() => {
    const onStorage = () => {
      const stored = localStorage.getItem("adminTheme");
      let darkVal = false;
      if (stored !== null) {
        darkVal = stored === "dark";
      } else {
        darkVal = localStorage.getItem("darkMode") === "true";
      }
      setIsDark(darkVal);
      if (darkVal) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };
    
    // Initial DOM sync on mount
    const stored = localStorage.getItem("adminTheme");
    const initialDark = stored !== null 
      ? stored === "dark" 
      : localStorage.getItem("darkMode") === "true";
    if (initialDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("adminThemeChanged", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("adminThemeChanged", onStorage);
    };
  }, []);

  const toggle = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem("adminTheme", next ? "dark" : "light");
      localStorage.setItem("darkMode", next ? "true" : "false");
      
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      
      window.dispatchEvent(new Event("adminThemeChanged"));
      return next;
    });
  }, []);

  return (
    <AdminThemeContext.Provider value={{ isDark, t: isDark ? dark : light, toggle }}>
      {children}
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => useContext(AdminThemeContext);
export default AdminThemeContext;
