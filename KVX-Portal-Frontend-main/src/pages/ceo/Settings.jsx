import { useState } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Globe,
  Save,
  Building2,
  Mail,
  Phone,
  MapPin,
  Palette,
  Monitor,
  Moon,
  Sun,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("company");
  const [saving, setSaving] = useState(false);

  const [companyInfo, setCompanyInfo] = useState({
    name: "KRAVIX TECH",
    email: "contact@kravix.com",
    phone: "+1 (800) 123-4567",
    address: "123 Enterprise Avenue, New York, NY 10001",
    website: "https://kravix.com",
    timezone: "EST",
    fiscalYear: "2026-01",
    industry: "Technology",
    employeeCount: "150-500",
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    weeklyDigest: true,
    performanceAlerts: true,
    securityAlerts: true,
    budgetAlerts: false,
    newHireAlerts: true,
    systemUpdates: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    sessionTimeout: "30",
    passwordExpiry: "90",
    loginNotifications: true,
    ipWhitelist: false,
  });

  const [display, setDisplay] = useState({
    theme: "light",
    compactMode: false,
    animationsEnabled: true,
    defaultDashboard: "overview",
    language: "en",
    dateFormat: "MM/DD/YYYY",
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved successfully!");
    }, 1000);
  };

  const tabs = [
    { id: "company", label: "Company Info", icon: Building2 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "display", label: "Display", icon: Palette },
  ];

  const Toggle = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
      </label>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Company Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 flex items-center transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <svg
                className="animate-spin h-4 w-4 mr-2"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab Navigation */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-purple-50 text-purple-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* Company Info Tab */}
          {activeTab === "company" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Company Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                      value={companyInfo.name}
                      onChange={(e) =>
                        setCompanyInfo({ ...companyInfo, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Industry
                    </label>
                    <select
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      value={companyInfo.industry}
                      onChange={(e) =>
                        setCompanyInfo({
                          ...companyInfo,
                          industry: e.target.value,
                        })
                      }
                    >
                      <option>Technology</option>
                      <option>Finance</option>
                      <option>Healthcare</option>
                      <option>Manufacturing</option>
                      <option>Retail</option>
                      <option>Education</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        value={companyInfo.email}
                        onChange={(e) =>
                          setCompanyInfo({
                            ...companyInfo,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        value={companyInfo.phone}
                        onChange={(e) =>
                          setCompanyInfo({
                            ...companyInfo,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        value={companyInfo.address}
                        onChange={(e) =>
                          setCompanyInfo({
                            ...companyInfo,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Timezone
                    </label>
                    <select
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      value={companyInfo.timezone}
                      onChange={(e) =>
                        setCompanyInfo({
                          ...companyInfo,
                          timezone: e.target.value,
                        })
                      }
                    >
                      <option>EST</option>
                      <option>PST</option>
                      <option>GMT</option>
                      <option>IST</option>
                      <option>CET</option>
                      <option>JST</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Fiscal Year Start
                    </label>
                    <input
                      type="month"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      value={companyInfo.fiscalYear}
                      onChange={(e) =>
                        setCompanyInfo({
                          ...companyInfo,
                          fiscalYear: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Notification Preferences
              </h2>
              <p className="text-sm text-gray-500">
                Control which notifications you receive as CEO
              </p>
              <div className="divide-y divide-gray-100">
                <Toggle
                  checked={notifications.emailAlerts}
                  onChange={(v) =>
                    setNotifications({ ...notifications, emailAlerts: v })
                  }
                  label="Email Alerts"
                  description="Receive important updates via email"
                />
                <Toggle
                  checked={notifications.weeklyDigest}
                  onChange={(v) =>
                    setNotifications({ ...notifications, weeklyDigest: v })
                  }
                  label="Weekly Digest"
                  description="Get a weekly summary of company metrics"
                />
                <Toggle
                  checked={notifications.performanceAlerts}
                  onChange={(v) =>
                    setNotifications({
                      ...notifications,
                      performanceAlerts: v,
                    })
                  }
                  label="Performance Alerts"
                  description="Alerts when KPIs deviate from targets"
                />
                <Toggle
                  checked={notifications.securityAlerts}
                  onChange={(v) =>
                    setNotifications({ ...notifications, securityAlerts: v })
                  }
                  label="Security Alerts"
                  description="Immediate alerts for security incidents"
                />
                <Toggle
                  checked={notifications.budgetAlerts}
                  onChange={(v) =>
                    setNotifications({ ...notifications, budgetAlerts: v })
                  }
                  label="Budget Alerts"
                  description="Notifications when departments exceed budget"
                />
                <Toggle
                  checked={notifications.newHireAlerts}
                  onChange={(v) =>
                    setNotifications({ ...notifications, newHireAlerts: v })
                  }
                  label="New Hire Alerts"
                  description="Get notified when new employees are onboarded"
                />
                <Toggle
                  checked={notifications.systemUpdates}
                  onChange={(v) =>
                    setNotifications({ ...notifications, systemUpdates: v })
                  }
                  label="System Updates"
                  description="Notifications about platform updates"
                />
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Security Preferences
              </h2>
              <div className="divide-y divide-gray-100">
                <Toggle
                  checked={security.twoFactor}
                  onChange={(v) =>
                    setSecurity({ ...security, twoFactor: v })
                  }
                  label="Two-Factor Authentication"
                  description="Require 2FA for all logins"
                />
                <Toggle
                  checked={security.loginNotifications}
                  onChange={(v) =>
                    setSecurity({ ...security, loginNotifications: v })
                  }
                  label="Login Notifications"
                  description="Get notified of new login sessions"
                />
                <Toggle
                  checked={security.ipWhitelist}
                  onChange={(v) =>
                    setSecurity({ ...security, ipWhitelist: v })
                  }
                  label="IP Whitelisting"
                  description="Restrict access to approved IP addresses"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Session Timeout (minutes)
                  </label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    value={security.sessionTimeout}
                    onChange={(e) =>
                      setSecurity({
                        ...security,
                        sessionTimeout: e.target.value,
                      })
                    }
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password Expiry (days)
                  </label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    value={security.passwordExpiry}
                    onChange={(e) =>
                      setSecurity({
                        ...security,
                        passwordExpiry: e.target.value,
                      })
                    }
                  >
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                    <option value="never">Never</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Display Tab */}
          {activeTab === "display" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Display Preferences
              </h2>



              <div className="divide-y divide-gray-100">
                <Toggle
                  checked={display.compactMode}
                  onChange={(v) =>
                    setDisplay({ ...display, compactMode: v })
                  }
                  label="Compact Mode"
                  description="Reduce spacing for more content on screen"
                />
                <Toggle
                  checked={display.animationsEnabled}
                  onChange={(v) =>
                    setDisplay({ ...display, animationsEnabled: v })
                  }
                  label="Animations"
                  description="Enable smooth transitions and animations"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Language
                  </label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    value={display.language}
                    onChange={(e) =>
                      setDisplay({ ...display, language: e.target.value })
                    }
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date Format
                  </label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    value={display.dateFormat}
                    onChange={(e) =>
                      setDisplay({ ...display, dateFormat: e.target.value })
                    }
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;