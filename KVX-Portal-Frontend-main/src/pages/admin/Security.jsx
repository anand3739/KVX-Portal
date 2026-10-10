import { useState } from "react";
import {
  Shield,
  Lock,
  Key,
  Fingerprint,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Globe,
  Smartphone,
  Mail,
  Clock,
  Users,
  Activity,
  Download,
  RefreshCw,
  Laptop,
  X,
  Trash2,
  LockKeyhole
} from "lucide-react";
import toast from "react-hot-toast";
import { downloadCSV } from "../../utils/downloadHelper";

const Security = () => {
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [loginAttempts, setLoginAttempts] = useState("5");

  const [ipWhitelist, setIpWhitelist] = useState([
    { id: 1, ip: "192.168.1.100", label: "Office Main Gate", current: true },
    { id: 2, ip: "10.0.0.45", label: "AWS Backup Sync Server", current: false },
    { id: 3, ip: "172.16.0.0/12", label: "Dev VPC VPN", current: false }
  ]);

  const [activeSessions, setActiveSessions] = useState([
    { id: 1, device: "iPhone 14 Pro", location: "New York, USA", time: "Current session", current: true },
    { id: 2, device: "MacBook Pro M2", location: "London, UK", time: "2 hours ago", current: false },
    { id: 3, device: "Chrome / Windows PC", location: "Singapore", time: "1 day ago", current: false }
  ]);

  const [passwordPolicy, setPasswordPolicy] = useState({
    minLength: 8,
    requireUpperLower: true,
    requireNumbersSymbols: true,
    expiresDays: 90,
    noReuse: 5
  });

  const [securityEvents, setSecurityEvents] = useState([
    {
      id: 1,
      event: "New Login",
      location: "New York, USA",
      device: "Chrome / Windows",
      time: "5 minutes ago",
      status: "success"
    },
    {
      id: 2,
      event: "Failed Login Attempt",
      location: "Beijing, China",
      device: "Unknown Device",
      time: "15 minutes ago",
      status: "failed"
    },
    {
      id: 3,
      event: "Password Changed",
      location: "London, UK",
      device: "Firefox / macOS",
      time: "2 hours ago",
      status: "success"
    },
    {
      id: 4,
      event: "2FA Enabled",
      location: "New York, USA",
      device: "Chrome / Windows",
      time: "1 day ago",
      status: "success"
    }
  ]);

  // Modal states
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showAddIpModal, setShowAddIpModal] = useState(false);
  
  // Form input states
  const [newIp, setNewIp] = useState({ ip: "", label: "" });
  const [policyForm, setPolicyForm] = useState({ ...passwordPolicy });

  const handleExportSecurityReport = () => {
    const headers = ["ID", "Event", "Location", "Device", "Time", "Status"];
    const rows = securityEvents.map(e => [e.id, e.event, e.location, e.device, e.time, e.status]);
    downloadCSV("security_report.csv", headers, rows);
    toast.success("Security report exported successfully!");
  };

  const handleToggle2FA = (checked) => {
    setTwoFactor(checked);
    if (checked) {
      toast.success("Two-Factor Authentication configuration initiated.");
    } else {
      toast.success("Two-Factor Authentication disabled.");
    }
  };

  const handleRevokeSession = (id, deviceName) => {
    setActiveSessions(prev => prev.filter(s => s.id !== id));
    toast.success(`Session for ${deviceName} revoked successfully.`);
  };

  const handleAddIp = () => {
    if (!newIp.ip) {
      toast.error("Please enter a valid IP address or CIDR range.");
      return;
    }
    const newEntry = {
      id: Date.now(),
      ip: newIp.ip,
      label: newIp.label || "Custom whitelisted IP",
      current: false
    };
    setIpWhitelist([...ipWhitelist, newEntry]);
    setNewIp({ ip: "", label: "" });
    setShowAddIpModal(false);
    toast.success("IP address added to whitelist.");
  };

  const handleDeleteIp = (id, ipVal) => {
    setIpWhitelist(prev => prev.filter(item => item.id !== id));
    toast.success(`IP ${ipVal} removed from whitelist.`);
  };

  const handleUpdatePolicy = () => {
    setPasswordPolicy({ ...policyForm });
    setShowPolicyModal(false);
    toast.success("Password policy updated successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security</h1>
          <p className="text-gray-500 mt-1">Manage security settings and monitor threats</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportSecurityReport}
            className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center space-x-2 bg-white shadow-sm font-medium"
          >
            <Download className="h-4 w-4" />
            <span>Security Report</span>
          </button>
        </div>
      </div>

      {/* Security Score */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg shadow-emerald-500/15">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm">Security Score</p>
            <p className="text-4xl font-bold mt-2">92/100</p>
            <p className="text-emerald-100 text-sm mt-1">Good - No critical vulnerabilities detected</p>
          </div>
          <Shield className="h-16 w-16 text-emerald-200" />
        </div>
      </div>

      {/* Security Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Authentication Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center space-x-3">
                  <Fingerprint className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Two-Factor Authentication (2FA)</p>
                    <p className="text-xs text-gray-500">Requires authenticator code on login</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={twoFactor}
                    onChange={(e) => handleToggle2FA(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout (minutes)
                </label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => {
                    setSessionTimeout(e.target.value);
                    toast.success(`Session timeout updated to ${e.target.value} minutes.`);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm text-gray-800"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="120">2 hours</option>
                  <option value="240">4 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Login Attempts
                </label>
                <select
                  value={loginAttempts}
                  onChange={(e) => {
                    setLoginAttempts(e.target.value);
                    toast.success(`Max login attempts set to ${e.target.value} attempts.`);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm text-gray-800"
                >
                  <option value="3">3 attempts</option>
                  <option value="5">5 attempts</option>
                  <option value="10">10 attempts</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Password Policy */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Password Policy</h2>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-700">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-sm">Minimum {passwordPolicy.minLength} characters</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                {passwordPolicy.requireUpperLower ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                )}
                <span className="text-sm">Require uppercase & lowercase letters</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                {passwordPolicy.requireNumbersSymbols ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                )}
                <span className="text-sm">Require numbers & special symbols</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-sm">Password expires every {passwordPolicy.expiresDays} days</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-sm">No password reuse (last {passwordPolicy.noReuse} passwords)</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              setPolicyForm({ ...passwordPolicy });
              setShowPolicyModal(true);
            }}
            className="mt-6 w-full py-2 bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-xl text-sm font-semibold transition-colors"
          >
            Update Password Policy
          </button>
        </div>

        {/* IP Whitelist */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">IP Whitelist</h2>
            
            <div className="space-y-3">
              {ipWhitelist.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-sm font-medium text-gray-800">{item.ip}</span>
                      <p className="text-[10px] text-gray-500">{item.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.current && (
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-100">Current IP</span>
                    )}
                    <button 
                      onClick={() => handleDeleteIp(item.id, item.ip)}
                      className="p-1 hover:bg-rose-50 text-rose-600 rounded transition-colors"
                      title="Remove IP Whitelist"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setShowAddIpModal(true)}
            className="mt-6 w-full py-2 bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-xl text-sm font-semibold transition-colors"
          >
            + Add IP Address
          </button>
        </div>

        {/* Active Sessions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Sessions</h2>
            
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-1">
                  <div className="flex items-center space-x-3">
                    {session.device.toLowerCase().includes("mac") || session.device.toLowerCase().includes("pc") ? (
                      <Laptop className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Smartphone className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{session.device}</p>
                      <p className="text-xs text-gray-500">{session.location} • {session.time}</p>
                    </div>
                  </div>
                  {session.current ? (
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-100">Active Now</span>
                  ) : (
                    <button 
                      onClick={() => handleRevokeSession(session.id, session.device)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold hover:underline"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Security Events */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Recent Security Events</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {securityEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{event.event}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{event.location}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{event.device}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{event.time}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize tracking-wide ${
                      event.status === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 relative text-gray-800">
            <button
              onClick={() => setShowPolicyModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2 mb-4 text-blue-600">
              <LockKeyhole className="h-6 w-6" />
              <h3 className="text-lg font-bold text-gray-900">Update Password Policy</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Length</label>
                <input
                  type="number"
                  min="6"
                  max="32"
                  value={policyForm.minLength}
                  onChange={(e) => setPolicyForm({ ...policyForm, minLength: parseInt(e.target.value) || 8 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policyForm.requireUpperLower}
                    onChange={(e) => setPolicyForm({ ...policyForm, requireUpperLower: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 font-medium">Require Uppercase & Lowercase letters</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policyForm.requireNumbersSymbols}
                    onChange={(e) => setPolicyForm({ ...policyForm, requireNumbersSymbols: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 font-medium">Require Numbers & Special Characters</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry (days)</label>
                <input
                  type="number"
                  min="30"
                  max="365"
                  value={policyForm.expiresDays}
                  onChange={(e) => setPolicyForm({ ...policyForm, expiresDays: parseInt(e.target.value) || 90 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prevent Reuse (history limit)</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={policyForm.noReuse}
                  onChange={(e) => setPolicyForm({ ...policyForm, noReuse: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowPolicyModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePolicy}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium transition-all"
                >
                  Save Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add IP Whitelist Modal */}
      {showAddIpModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 relative text-gray-800">
            <button
              onClick={() => setShowAddIpModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2 mb-4 text-blue-600">
              <Globe className="h-6 w-6" />
              <h3 className="text-lg font-bold text-gray-900">Add IP to Whitelist</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IP Address or CIDR Block</label>
                <input
                  type="text"
                  placeholder="e.g. 192.168.1.50 or 10.0.0.0/24"
                  value={newIp.ip}
                  onChange={(e) => setNewIp({ ...newIp, ip: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Remote Dev Office"
                  value={newIp.label}
                  onChange={(e) => setNewIp({ ...newIp, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowAddIpModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddIp}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium transition-all"
                >
                  Add IP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;