import { useState } from "react";
import {
  Settings, Shield, Bell, Palette, Lock, HardDrive,
  Globe, Slack, Linkedin, Github, Twitter, ChevronRight,
  CheckCircle, X, Zap, AlertCircle, Save, Trash2
} from "lucide-react";
import toast from "react-hot-toast";

const settingsTabs = [
  { id: "general", name: "General", icon: Settings },
  { id: "security", name: "Security", icon: Shield },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "appearance", name: "Appearance", icon: Palette },
  { id: "privacy", name: "Privacy", icon: Lock },
  { id: "backup", name: "Backup", icon: HardDrive },
];

const initialIntegrations = [
  { id: 1, name: "Slack", description: "Connect with Slack workspace for real-time notifications", icon: Slack, iconColor: "bg-[#4A154B]", connected: true, category: "Communication", workspace: "kravix-workspace", channel: "#general" },
  { id: 2, name: "LinkedIn", description: "Import employee profiles from LinkedIn", icon: Linkedin, iconColor: "bg-[#0A66C2]", connected: false, category: "Social", clientId: "", clientSecret: "" },
  { id: 3, name: "GitHub", description: "Link developer accounts and activity tracking", icon: Github, iconColor: "bg-[#333]", connected: true, category: "Development", orgName: "kravix-tech", token: "••••••••••••" },
  { id: 4, name: "Twitter", description: "Social media integration for announcements", icon: Twitter, iconColor: "bg-[#1DA1F2]", connected: false, category: "Social", apiKey: "", apiSecret: "" },
];

const Integrations = () => {
  const [activeTab, setActiveTab] = useState("integrations");
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [configTarget, setConfigTarget] = useState(null);
  const [configForm, setConfigForm] = useState({});
  const [disconnectTarget, setDisconnectTarget] = useState(null);

  /* ── connect / disconnect ─────────────────────────────── */
  const handleConnect = (integration) => {
    setConfigTarget(integration);
    setConfigForm({
      workspace: integration.workspace || "",
      channel: integration.channel || "",
      clientId: integration.clientId || "",
      clientSecret: integration.clientSecret || "",
      orgName: integration.orgName || "",
      token: "",
      apiKey: integration.apiKey || "",
      apiSecret: integration.apiSecret || "",
    });
  };

  const handleSaveConfig = () => {
    setIntegrations(prev => prev.map(i =>
      i.id === configTarget.id ? { ...i, ...configForm, connected: true } : i
    ));
    setConfigTarget(null);
    toast.success(`${configTarget.name} connected successfully!`);
  };

  const handleDisconnect = () => {
    setIntegrations(prev => prev.map(i =>
      i.id === disconnectTarget.id ? { ...i, connected: false } : i
    ));
    setDisconnectTarget(null);
    toast.success(`${disconnectTarget.name} disconnected.`);
  };

  /* ── config form fields per service ──────────────────── */
  const getConfigFields = (integration) => {
    switch (integration.name) {
      case "Slack":
        return [
          { key: "workspace", label: "Workspace Name", placeholder: "e.g., my-company" },
          { key: "channel", label: "Default Channel", placeholder: "#general" },
        ];
      case "LinkedIn":
        return [
          { key: "clientId", label: "Client ID", placeholder: "Enter LinkedIn App Client ID" },
          { key: "clientSecret", label: "Client Secret", placeholder: "Enter Client Secret", type: "password" },
        ];
      case "GitHub":
        return [
          { key: "orgName", label: "Organization Name", placeholder: "e.g., my-org" },
          { key: "token", label: "Personal Access Token", placeholder: "ghp_xxxxxxxxxxxx", type: "password" },
        ];
      case "Twitter":
        return [
          { key: "apiKey", label: "API Key", placeholder: "Enter Twitter API Key" },
          { key: "apiSecret", label: "API Secret", placeholder: "Enter API Secret", type: "password" },
        ];
      default:
        return [];
    }
  };

  const connected = integrations.filter(i => i.connected).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
            <p className="text-sm text-gray-500 mt-1">
              {connected} of {integrations.length} services connected
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">v2.1.4</span>
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">Up to date</span>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)] p-4">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">System Settings</h3>
            <div className="space-y-1">
              {settingsTabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === tab.id
                    ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`}>
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                  {activeTab === tab.id && <ChevronRight className="h-4 w-4 ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Connections</h3>
            <button onClick={() => setActiveTab("integrations")}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === "integrations"
                ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`}>
              <Globe className="h-4 w-4" />
              <span>Integrations</span>
              <span className="ml-auto bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">{connected}</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          {activeTab === "integrations" ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Third-Party Integrations</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>{connected} active</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {integrations.map(integration => {
                  const Icon = integration.icon;
                  return (
                    <div key={integration.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 ${integration.iconColor} rounded-lg text-white`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${integration.connected
                          ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                          {integration.connected ? "● Connected" : "○ Disconnected"}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{integration.name}</h3>
                      <p className="text-sm text-gray-500 mb-1">{integration.description}</p>
                      <span className="inline-block text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 mb-4">
                        {integration.category}
                      </span>

                      {integration.connected && (
                        <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                          <div className="flex items-center space-x-2 text-xs text-emerald-700">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Active since Jan 2024 · Syncing normally</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleConnect(integration)}
                          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${integration.connected
                            ? "border border-gray-200 text-gray-700 hover:bg-gray-50"
                            : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                          {integration.connected ? "Configure" : "Connect"}
                        </button>
                        {integration.connected && (
                          <button onClick={() => setDisconnectTarget(integration)}
                            className="p-2 border border-rose-200 text-rose-500 rounded-lg hover:bg-rose-50" title="Disconnect">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Configure {activeTab} settings in the main Settings page for full control.
              </p>
              <button onClick={() => toast.success(`Opening ${activeTab} settings…`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                Open {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Config Modal ─────────────────────────────────────── */}
      {configTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 ${configTarget.iconColor} rounded-lg text-white`}>
                  <configTarget.icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {configTarget.connected ? "Configure" : "Connect"} {configTarget.name}
                </h2>
              </div>
              <button onClick={() => setConfigTarget(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">{configTarget.description}</p>
              {getConfigFields(configTarget).map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                  <input
                    type={field.type || "text"}
                    value={configForm[field.key] || ""}
                    onChange={e => setConfigForm(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button onClick={() => setConfigTarget(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
              <button onClick={handleSaveConfig}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 text-sm">
                <Save className="h-4 w-4" /><span>{configTarget.connected ? "Save Changes" : "Connect"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Disconnect Confirmation ──────────────────────────── */}
      {disconnectTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-rose-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Disconnect {disconnectTarget.name}</h3>
                <p className="text-sm text-gray-500">This will stop all syncing.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to disconnect <strong>{disconnectTarget.name}</strong>?
              Any ongoing sync processes will be stopped.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button onClick={() => setDisconnectTarget(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
              <button onClick={handleDisconnect}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-sm">Disconnect</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white px-8 py-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>© 2026 KRAVIX TECH. All rights reserved.</div>
          <div className="flex items-center space-x-4">
            <button onClick={() => toast.success("Opening Privacy Policy…")} className="hover:text-gray-900">Privacy Policy</button>
            <span>·</span>
            <button onClick={() => toast.success("Opening Terms of Service…")} className="hover:text-gray-900">Terms of Service</button>
            <span>·</span>
            <span>Made with ❤️ by KRAVIX</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;