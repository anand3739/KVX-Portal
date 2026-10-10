import { useState } from "react";
import toast from "react-hot-toast";
import {
  Settings, Bell, Shield, Globe, Mail, Save, Lock,
  User, Clock, Calendar, DollarSign, CheckCircle,
  AlertCircle, RefreshCw, ChevronRight, Eye, EyeOff,
  Sliders, Database, Zap, Users
} from "lucide-react";

const HRSettings = () => {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const [settings, setSettings] = useState({
    emailNotifications: true,
    leaveNotifications: true,
    payrollNotifications: false,
    performanceAlerts: true,
    leaveApproval: "manager",
    payrollSchedule: "monthly",
    attendanceCutoff: "09:30",
    workHours: "9",
    overtimeThreshold: "8",
    autoApproveLeave: false,
    twoFactorAuth: false,
    sessionTimeout: "30",
    passwordExpiry: "90",
    dataRetention: "365",
    timezone: "Asia/Kolkata",
    language: "en",
    dateFormat: "DD/MM/YYYY"
  });

  const updateSetting = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved successfully!");
    }, 1000);
  };

  const Toggle = ({ value, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={value} onChange={e => onChange(e.target.checked)} />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 shadow-inner" />
    </label>
  );

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "system", label: "System", icon: Database },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR Settings</h1>
          <p className="text-gray-500 mt-1">Configure HR policies and system preferences</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium disabled:opacity-60 transition-all flex items-center space-x-2 shadow-md shadow-green-500/25 w-fit">
          {saving ? <><RefreshCw className="h-4 w-4 animate-spin" /><span>Saving…</span></>
            : <><Save className="h-4 w-4" /><span>Save Changes</span></>}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? "border-green-600 text-green-600 bg-green-50/50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6 space-y-6">
          {/* ── General Tab ── */}
          {activeTab === "general" && (
            <>
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-green-600" /><span>Attendance Policy</span>
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Attendance Cutoff Time</label>
                      <input type="time" value={settings.attendanceCutoff}
                        onChange={e => updateSetting("attendanceCutoff", e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all" />
                      <p className="text-xs text-gray-400 mt-1">Late arrival threshold</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Standard Work Hours</label>
                      <select value={settings.workHours} onChange={e => updateSetting("workHours", e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white transition-all">
                        {["8", "9", "10"].map(h => <option key={h} value={h}>{h} hours/day</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Overtime Threshold</label>
                      <select value={settings.overtimeThreshold} onChange={e => updateSetting("overtimeThreshold", e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white transition-all">
                        {["8", "9", "10", "12"].map(h => <option key={h} value={h}>After {h}h</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-green-600" /><span>Leave Policy</span>
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Leave Approval Workflow</label>
                      <select value={settings.leaveApproval} onChange={e => updateSetting("leaveApproval", e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white transition-all">
                        <option value="manager">Manager Approval</option>
                        <option value="hr">HR Direct Approval</option>
                        <option value="both">Both Manager & HR</option>
                        <option value="auto">Auto Approve (≤2 days)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Payroll Schedule</label>
                      <select value={settings.payrollSchedule} onChange={e => updateSetting("payrollSchedule", e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white transition-all">
                        <option value="monthly">Monthly</option>
                        <option value="biweekly">Bi-Weekly</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex items-center space-x-3">
                      <Zap className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Auto-Approve Short Leaves</p>
                        <p className="text-xs text-gray-500">Automatically approve leaves of 1 day or less</p>
                      </div>
                    </div>
                    <Toggle value={settings.autoApproveLeave} onChange={v => updateSetting("autoApproveLeave", v)} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Notifications Tab ── */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
                <Bell className="h-4 w-4 text-green-600" /><span>Notification Preferences</span>
              </h3>
              {[
                { key: "emailNotifications", label: "Email Notifications", sub: "Receive email alerts for important HR activities", icon: Mail, color: "blue" },
                { key: "leaveNotifications", label: "Leave Request Alerts", sub: "Get notified when employees submit leave requests", icon: Calendar, color: "amber" },
                { key: "payrollNotifications", label: "Payroll Reminders", sub: "Alerts before payroll processing deadlines", icon: DollarSign, color: "green" },
                { key: "performanceAlerts", label: "Performance Review Alerts", sub: "Notifications for upcoming and overdue reviews", icon: Users, color: "purple" },
              ].map(item => {
                const Icon = item.icon;
                const colorMap = { blue: "bg-blue-50 text-blue-600", amber: "bg-amber-50 text-amber-600", green: "bg-green-50 text-green-600", purple: "bg-purple-50 text-purple-600" };
                return (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100/50 transition-colors border border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2.5 rounded-xl ${colorMap[item.color]}`}><Icon className="h-5 w-5" /></div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{item.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
                      </div>
                    </div>
                    <Toggle value={settings[item.key]} onChange={v => updateSetting(item.key, v)} />
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Security Tab ── */}
          {activeTab === "security" && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" /><span>Security Settings</span>
              </h3>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center space-x-4">
                  <div className="p-2.5 bg-blue-100 rounded-xl"><Lock className="h-5 w-5 text-blue-600" /></div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500 mt-0.5">Add extra layer of security for HR accounts</p>
                  </div>
                </div>
                <Toggle value={settings.twoFactorAuth} onChange={v => updateSetting("twoFactorAuth", v)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Session Timeout</label>
                  <select value={settings.sessionTimeout} onChange={e => updateSetting("sessionTimeout", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white transition-all">
                    {["15", "30", "60", "120"].map(v => <option key={v} value={v}>{v} minutes</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password Expiry</label>
                  <select value={settings.passwordExpiry} onChange={e => updateSetting("passwordExpiry", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white transition-all">
                    {["30", "60", "90", "180"].map(v => <option key={v} value={v}>Every {v} days</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Data Retention</label>
                  <select value={settings.dataRetention} onChange={e => updateSetting("dataRetention", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white transition-all">
                    {["180", "365", "730", "1825"].map(v => <option key={v} value={v}>{v === "1825" ? "5 years" : v + " days"}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── System Tab ── */}
          {activeTab === "system" && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
                <Globe className="h-4 w-4 text-green-600" /><span>System Preferences</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Timezone</label>
                  <select value={settings.timezone} onChange={e => updateSetting("timezone", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white transition-all">
                    <option value="Asia/Kolkata">India (IST) UTC+5:30</option>
                    <option value="America/New_York">New York (EST)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Asia/Dubai">Dubai (GST)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
                  <select value={settings.language} onChange={e => updateSetting("language", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white transition-all">
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date Format</label>
                  <select value={settings.dateFormat} onChange={e => updateSetting("dateFormat", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white transition-all">
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">System Status: All services operational</span>
                </div>
                <p className="text-xs text-emerald-600">Last backup: Today at 02:00 AM · Database version: v2.0.1</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
          <p className="text-xs text-gray-400">Changes are applied immediately after saving</p>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium disabled:opacity-60 transition-all flex items-center space-x-2 text-sm">
            {saving ? <><RefreshCw className="h-4 w-4 animate-spin" /><span>Saving…</span></>
              : <><Save className="h-4 w-4" /><span>Save Changes</span></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HRSettings;