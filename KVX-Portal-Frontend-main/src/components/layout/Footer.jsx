import { Heart } from "lucide-react";
import { useAdminTheme } from "../../contexts/AdminThemeContext";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useAdminTheme();

  return (
    <footer className="transition-all duration-300" style={{ borderTop: `1px solid ${t.headerBorder}`, background: t.headerBg }}>
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: t.textMuted }}>
            © {currentYear} KRAVIX TECH. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <a href="#" className="text-xs transition-colors" style={{ color: t.textSecondary }}
               onMouseEnter={e => e.currentTarget.style.color = t.textPrimary}
               onMouseLeave={e => e.currentTarget.style.color = t.textSecondary}>
              Privacy Policy
            </a>
            <span className="w-1 h-1 rounded-full" style={{ background: t.dividerColor }}></span>
            <a href="#" className="text-xs transition-colors" style={{ color: t.textSecondary }}
               onMouseEnter={e => e.currentTarget.style.color = t.textPrimary}
               onMouseLeave={e => e.currentTarget.style.color = t.textSecondary}>
              Terms of Service
            </a>
            <span className="w-1 h-1 rounded-full" style={{ background: t.dividerColor }}></span>
            <div className="flex items-center space-x-1 text-xs" style={{ color: t.textMuted }}>
              <span>Made with</span>
              <Heart className="h-3 w-3 text-red-500 fill-current animate-pulse" />
              <span>by KRAVIX</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;