import { useState, useEffect, useRef } from "react";
import {
  Settings as SettingsIcon, Bell, Shield, Globe, Mail, Lock, Users,
  Database, Clock, Palette, Save, RefreshCw, AlertCircle, CheckCircle,
  Moon, Sun, Smartphone, Eye, Key, Fingerprint, Upload, Trash2,
  Download, Github, Twitter, Slack, Linkedin, Zap, Cloud, Plus, X
} from "lucide-react";
import toast from "react-hot-toast";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const [twoFactor, setTwoFactor] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [slackNotif, setSlackNotif] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState("daily");
  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem("primaryColor") || "blue";
  });
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem("fontSize") || "medium";
  });
  const [layoutDensity, setLayoutDensity] = useState(() => {
    return localStorage.getItem("layoutDensity") || "Standard";
  });
  const [companyLogo, setCompanyLogo] = useState(() => {
    return localStorage.getItem("companyLogo") || "";
  });
  const [ipList, setIpList] = useState(["192.168.1.100", "10.0.0.45"]);
  const [newIp, setNewIp] = useState("");
  const [connectedApps, setConnectedApps] = useState({ slack: true, linkedin: false, github: true, twitter: false });
  const [backingUp, setBackingUp] = useState(false);
  const [apiKey, setApiKey] = useState("••••••••••••••••");

  const fileInputRef = useRef(null);

  const updateAppearanceDOM = ({ dark, color, size, density }) => {
    // Dark mode
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Primary Color
    document.documentElement.className = document.documentElement.className
      .split(' ')
      .filter(c => !c.startsWith('theme-'))
      .join(' ');
    document.documentElement.classList.add('theme-' + color);

    // Font Size
    document.documentElement.className = document.documentElement.className
      .split(' ')
      .filter(c => !c.startsWith('font-size-'))
      .join(' ');
    document.documentElement.classList.add('font-size-' + size);

    // Layout Density
    document.documentElement.className = document.documentElement.className
      .split(' ')
      .filter(c => !c.startsWith('density-'))
      .join(' ');
    document.documentElement.classList.add('density-' + density.toLowerCase());
  };

  useEffect(() => {
    updateAppearanceDOM({
      dark: darkMode,
      color: primaryColor,
      size: fontSize,
      density: layoutDensity
    });
  }, [darkMode, primaryColor, fontSize, layoutDensity]);

  const tabs = [
    { id: "general", name: "General", icon: SettingsIcon },
    { id: "security", name: "Security", icon: Lock },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "appearance", name: "Appearance", icon: Palette },
    { id: "privacy", name: "Privacy", icon: Eye },
    { id: "backup", name: "Backup", icon: Database },
    { id: "users", name: "User Management", icon: Users },
    { id: "integrations", name: "Integrations", icon: Globe }
  ];

  const handleSave = () => {
    localStorage.setItem("darkMode", darkMode);
    localStorage.setItem("primaryColor", primaryColor);
    localStorage.setItem("fontSize", fontSize);
    localStorage.setItem("layoutDensity", layoutDensity);
    localStorage.setItem("companyLogo", companyLogo);

    setSaveSuccess(true);
    toast.success("Settings saved successfully!");
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    setDarkMode(false);
    setTwoFactor(false);
    setBiometric(false);
    setEmailNotifications(true);
    setPushNotifications(true);
    setAutoBackup(true);
    setPrivacyMode(false);
    setBackupFrequency("daily");
    setPrimaryColor("blue");
    setFontSize("medium");
    setLayoutDensity("Standard");
    setCompanyLogo("");

    localStorage.setItem("darkMode", "false");
    localStorage.setItem("primaryColor", "blue");
    localStorage.setItem("fontSize", "medium");
    localStorage.setItem("layoutDensity", "Standard");
    localStorage.removeItem("companyLogo");

    window.dispatchEvent(new Event("logoChanged"));

    toast.success("Settings reset to defaults!");
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size exceeds 2MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setCompanyLogo(base64String);
      localStorage.setItem("companyLogo", base64String);
      window.dispatchEvent(new Event("logoChanged"));
      toast.success("Company logo updated!");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setCompanyLogo("");
    localStorage.removeItem("companyLogo");
    window.dispatchEvent(new Event("logoChanged"));
    toast.success("Company logo removed!");
  };

  const handleBackupNow = () => {
    setBackingUp(true);
    toast.loading("Backup in progress…");
    setTimeout(() => { setBackingUp(false); toast.dismiss(); toast.success("Backup completed! (2.4 GB)"); }, 2500);
  };

  const handleAddIp = () => {
    if (!newIp.trim()) return;
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$|^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    if (!ipRegex.test(newIp.trim())) { toast.error("Invalid IP address format."); return; }
    if (ipList.includes(newIp.trim())) { toast.error("IP already whitelisted."); return; }
    setIpList(prev => [...prev, newIp.trim()]);
    setNewIp("");
    toast.success("IP address added to whitelist!");
  };

  const handleRemoveIp = (ip) => {
    setIpList(prev => prev.filter(i => i !== ip));
    toast.success(`Removed ${ip} from whitelist.`);
  };

  const handleRegenerateApiKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const newKey = Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setApiKey(newKey);
    toast.success("New API key generated!");
  };

  const handleTestWebhook = () => {
    toast.loading("Sending test event…");
    setTimeout(() => { toast.dismiss(); toast.success("Webhook test successful! ✓ 200 OK"); }, 1500);
  };

  const handleConnectApp = (app) => {
    setConnectedApps(prev => { const next = { ...prev, [app]: !prev[app] }; return next; });
    const action = connectedApps[app] ? "Disconnected" : "Connected";
    toast.success(`${action} ${app.charAt(0).toUpperCase() + app.slice(1)} successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Configure system preferences and security</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={handleReset} className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center space-x-2 shadow-lg shadow-blue-500/20"
          >
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center space-x-3 animate-fadeIn">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <p className="text-sm text-emerald-700">Settings saved successfully!</p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 sticky top-20">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-amber-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-amber-600 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-xs font-medium">SYSTEM STATUS</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Last Backup</span>
                    <span className="text-gray-900 font-medium">Today 03:00</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">System Version</span>
                    <span className="text-gray-900 font-medium">v2.1.4</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Security Patch</span>
                    <span className="text-emerald-600 font-medium">Up to date</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            {/* General Settings */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      defaultValue="KRAVIX TECH"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      System Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      defaultValue="admin@kravix.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                      <option>UTC-08:00 Pacific Time</option>
                      <option>UTC-05:00 Eastern Time</option>
                      <option selected>UTC+00:00 Greenwich Mean Time</option>
                      <option>UTC+05:30 Indian Standard Time</option>
                      <option>UTC+08:00 Singapore Time</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Format
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                      <option>MM/DD/YYYY</option>
                      <option selected>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                      <option selected>English (US)</option>
                      <option>English (UK)</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Japanese</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                      <option selected>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                      <option>JPY (¥)</option>
                      <option>INR (₹)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Lock className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Require 2FA for all admin users</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={twoFactor}
                        onChange={(e) => setTwoFactor(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Fingerprint className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">Biometric Login</p>
                        <p className="text-sm text-gray-500">Enable fingerprint/face recognition</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={biometric} onChange={e => setBiometric(e.target.checked)} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Password Policy</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                          <span className="text-sm text-gray-700">Minimum 8 characters</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                          <span className="text-sm text-gray-700">Require uppercase & lowercase</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                          <span className="text-sm text-gray-700">Require numbers & symbols</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded text-blue-600" />
                          <span className="text-sm text-gray-700">Force password change every 90 days</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Session Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Session Timeout</label>
                        <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                          <option>30 minutes</option>
                          <option selected>60 minutes</option>
                          <option>120 minutes</option>
                          <option>Never</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Max Login Attempts</label>
                        <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                          <option>3 attempts</option>
                          <option selected>5 attempts</option>
                          <option>10 attempts</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">IP Whitelist</h3>
                    <div className="space-y-2">
                      {ipList.map(ip => (
                        <div key={ip} className="flex items-center space-x-2">
                          <div className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 font-mono">{ip}</div>
                          <button onClick={() => handleRemoveIp(ip)} className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center space-x-2 mt-2">
                        <input type="text" value={newIp} onChange={e => setNewIp(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && handleAddIp()}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          placeholder="e.g. 192.168.1.101" />
                        <button onClick={handleAddIp} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Appearance Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center space-x-3">
                      {["blue","purple","emerald","amber","rose"].map(c => {
                        const colorHex = {
                          blue: "#2563eb",
                          purple: "#9333ea",
                          emerald: "#059669",
                          amber: "#d97706",
                          rose: "#e11d48"
                        };
                        return (
                          <button 
                            key={c} 
                            onClick={() => { setPrimaryColor(c); toast.success(`Theme changed to ${c}!`); }}
                            style={{ backgroundColor: colorHex[c] }}
                            className={`w-10 h-10 rounded-lg cursor-pointer transition-transform hover:scale-110 ${
                              primaryColor === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""
                            }`} 
                          />
                        );
                      })}
                    </div>
                    {primaryColor !== "blue" && (
                      <p className="text-xs text-gray-500 mt-2">Active: <span className="font-medium capitalize">{primaryColor}</span> theme</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Size
                    </label>
                    <div className="flex items-center space-x-4">
                      {["small","medium","large"].map(s => (
                        <button key={s} onClick={() => { setFontSize(s); toast.success(`Font size set to ${s}!`); }}
                          className={`px-4 py-2 rounded-lg capitalize text-sm transition-colors ${
                            fontSize === s ? "bg-blue-600 text-white" : "border border-gray-200 hover:bg-gray-50"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Layout Density
                    </label>
                    <select 
                      value={layoutDensity}
                      onChange={(e) => { setLayoutDensity(e.target.value); toast.success(`Layout density set to ${e.target.value}!`); }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    >
                      <option value="Comfortable">Comfortable</option>
                      <option value="Standard">Standard</option>
                      <option value="Compact">Compact</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Logo
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                        {companyLogo ? (
                          <img src={companyLogo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          "KT"
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleLogoUpload} 
                            accept="image/*" 
                            className="hidden" 
                          />
                          <button onClick={() => fileInputRef.current.click()}
                            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                            <Upload className="h-4 w-4" />
                            <span>Upload New Logo</span>
                          </button>
                          {companyLogo && (
                            <button onClick={handleRemoveLogo}
                              className="px-4 py-2 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-lg flex items-center space-x-2 border border-rose-100">
                              <Trash2 className="h-4 w-4" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">Recommended size: 200x200px (Max 2MB)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive system alerts via email</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">Push Notifications</p>
                        <p className="text-sm text-gray-500">Browser and mobile alerts</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={pushNotifications} onChange={e => setPushNotifications(e.target.checked)} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Email Preferences</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                          <span className="text-sm text-gray-700">Security alerts</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                          <span className="text-sm text-gray-700">System updates</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                          <span className="text-sm text-gray-700">User activities</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded text-blue-600" />
                          <span className="text-sm text-gray-700">Marketing emails</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Notification Channels</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2"><Slack className="h-5 w-5 text-[#4A154B]" /><span className="text-sm text-gray-700">Slack</span></div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={slackNotif} onChange={e => setSlackNotif(e.target.checked)} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2"><Mail className="h-5 w-5 text-gray-500" /><span className="text-sm text-gray-700">Email Digest</span></div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={emailDigest} onChange={e => setEmailDigest(e.target.checked)} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2"><Smartphone className="h-5 w-5 text-gray-500" /><span className="text-sm text-gray-700">SMS Alerts</span></div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={smsAlerts} onChange={e => setSmsAlerts(e.target.checked)} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Privacy Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Eye className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">Privacy Mode</p>
                        <p className="text-sm text-gray-500">Hide sensitive information in UI</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={privacyMode}
                        onChange={(e) => setPrivacyMode(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Data Collection</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                          <span className="text-sm text-gray-700">Analytics and usage data</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                          <span className="text-sm text-gray-700">Error reporting</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded text-blue-600" />
                          <span className="text-sm text-gray-700">Personalized recommendations</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Data Retention</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Log retention period</label>
                        <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                          <option>30 days</option>
                          <option selected>90 days</option>
                          <option>180 days</option>
                          <option>1 year</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">User data retention</label>
                        <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                          <option>1 year after account closure</option>
                          <option selected>3 years after account closure</option>
                          <option>5 years after account closure</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => toast.error("Data deletion requested. Admin verification required.")}
                    className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Delete all collected data
                  </button>
                </div>
              </div>
            )}

            {/* Backup Settings */}
            {activeTab === "backup" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Backup Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Database className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">Automatic Backups</p>
                        <p className="text-sm text-gray-500">Schedule regular system backups</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={autoBackup}
                        onChange={(e) => setAutoBackup(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {autoBackup && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Backup Frequency
                        </label>
                        <select
                          value={backupFrequency}
                          onChange={(e) => setBackupFrequency(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        >
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Backup Time
                        </label>
                        <input
                          type="time"
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          defaultValue="03:00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Backup Location
                        </label>
                        <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                          <option>AWS S3</option>
                          <option>Google Cloud Storage</option>
                          <option>Azure Blob Storage</option>
                          <option>Local Server</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Recent Backups</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span>Full backup - Today 03:00</span>
                        </div>
                        <span className="text-gray-500">2.4 GB</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span>Full backup - Yesterday 03:00</span>
                        </div>
                        <span className="text-gray-500">2.4 GB</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span>Incremental backup - 6 hours ago</span>
                        </div>
                        <span className="text-gray-500">156 MB</span>
                      </div>
                    </div>
                    <button onClick={() => toast.success("Opening full backup history…")}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View all backups
                    </button>
                  </div>

                  <button onClick={() => { handleBackupNow(); toast.success("Backup process started."); }} disabled={backingUp}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-60">
                    <Cloud className="h-4 w-4" />
                    <span>{backingUp ? "Backing up…" : "Backup Now"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* User Management Settings */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Default User Role</h3>
                    <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                      <option>Employee</option>
                      <option>Manager</option>
                      <option selected>HR</option>
                      <option>Admin</option>
                    </select>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Registration Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                          <span className="text-sm text-gray-700">Allow self-registration</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                          <span className="text-sm text-gray-700">Require email verification</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded text-blue-600" />
                          <span className="text-sm text-gray-700">Require admin approval</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Account Deletion</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Inactive account timeout</label>
                        <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                          <option>30 days</option>
                          <option selected>90 days</option>
                          <option>180 days</option>
                          <option>1 year</option>
                        </select>
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded text-blue-600" />
                          <span className="text-sm text-gray-700">Automatically delete inactive accounts</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations Settings */}
            {activeTab === "integrations" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Integrations</h2>
                
                <div className="space-y-4">
                  {[
                    { key: "slack", name: "Slack", desc: "Connect with Slack workspace", icon: Slack, bg: "bg-[#4A154B]" },
                    { key: "linkedin", name: "LinkedIn", desc: "Import employee profiles", icon: Linkedin, bg: "bg-[#0A66C2]" },
                    { key: "github", name: "GitHub", desc: "Link developer accounts", icon: Github, bg: "bg-[#333]" },
                    { key: "twitter", name: "Twitter", desc: "Social media integration", icon: Twitter, bg: "bg-[#1DA1F2]" },
                  ].map(({ key, name, desc, icon: Icon, bg }) => (
                    <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-200 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 ${bg} rounded-lg`}><Icon className="h-6 w-6 text-white" /></div>
                        <div>
                          <p className="font-medium text-gray-900">{name}</p>
                          <p className="text-sm text-gray-500">{desc}</p>
                          {connectedApps[key] && <p className="text-xs text-emerald-600 mt-0.5">● Connected</p>}
                        </div>
                      </div>
                      <button onClick={() => handleConnectApp(key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          connectedApps[key]
                            ? "border border-gray-200 text-gray-700 hover:bg-gray-50"
                            : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                        {connectedApps[key] ? "Disconnect" : "Connect"}
                      </button>
                    </div>
                  ))}

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">API Access</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">API Key</p>
                          <p className="text-xs text-gray-500 font-mono">{apiKey.length > 16 ? apiKey : "••••••••••••••••"}</p>
                        </div>
                        <button onClick={handleRegenerateApiKey} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Regenerate</button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Webhook URL</p>
                          <p className="text-xs text-gray-500">https://api.kravix.com/webhook</p>
                        </div>
                        <button onClick={handleTestWebhook} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Test</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;