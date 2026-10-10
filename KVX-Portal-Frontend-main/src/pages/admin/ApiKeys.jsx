import { useState } from "react";
import {
  Key,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Globe,
  Lock,
  RefreshCw,
  X
} from "lucide-react";
import toast from "react-hot-toast";

const ApiKeys = () => {
  const [showKey, setShowKey] = useState({});
  
  const [keyList, setKeyList] = useState([
    {
      id: 1,
      name: "Production API Key",
      key: "kravix_prod_7x9k2m4n8q1w5e3r",
      created: "2026-01-01",
      expires: "2027-01-01",
      lastUsed: "2 minutes ago",
      status: "active",
      permissions: ["read", "write", "delete"],
      requests: "12.4K"
    },
    {
      id: 2,
      name: "Staging API Key",
      key: "kravix_staging_2b5n7m9k1q3w6e8r",
      created: "2026-01-01",
      expires: "2026-07-01",
      lastUsed: "1 hour ago",
      status: "active",
      permissions: ["read", "write"],
      requests: "3.2K"
    },
    {
      id: 3,
      name: "Development API Key",
      key: "kravix_dev_4d8f2h6j9k1l3m5n",
      created: "2026-01-05",
      expires: "2026-04-05",
      lastUsed: "5 hours ago",
      status: "active",
      permissions: ["read"],
      requests: "856"
    },
    {
      id: 4,
      name: "Mobile App Key",
      key: "kravix_mobile_7h9j2k4m6n8q1w3e",
      created: "2025-12-15",
      expires: "2026-08-15",
      lastUsed: "1 day ago",
      status: "expiring",
      permissions: ["read", "write"],
      requests: "8.7K"
    }
  ]);

  // Modal states
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedRotateKey, setSelectedRotateKey] = useState(null);

  // Form states
  const [newKeyForm, setNewKeyForm] = useState({
    name: "",
    permissions: {
      read: true,
      write: false,
      delete: false
    }
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("API Key copied to clipboard!");
  };

  const handleGenerateKey = () => {
    if (!newKeyForm.name) {
      toast.error("Please enter a key name.");
      return;
    }
    const perms = Object.keys(newKeyForm.permissions).filter(
      p => newKeyForm.permissions[p]
    );
    if (perms.length === 0) {
      toast.error("Please select at least one permission.");
      return;
    }

    const randomStr = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const keyString = `kravix_key_${randomStr}`;

    const now = new Date();
    const expiry = new Date();
    expiry.setFullYear(now.getFullYear() + 1);

    const formattedDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const newEntry = {
      id: Date.now(),
      name: newKeyForm.name,
      key: keyString,
      created: formattedDate(now),
      expires: formattedDate(expiry),
      lastUsed: "Never",
      status: "active",
      permissions: perms,
      requests: "0"
    };

    setKeyList([newEntry, ...keyList]);
    setShowGenerateModal(false);
    setNewKeyForm({
      name: "",
      permissions: { read: true, write: false, delete: false }
    });
    toast.success("New API key generated successfully!");
  };

  const handleRotateKey = () => {
    if (!selectedRotateKey) return;
    const randomStr = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const rotatedString = `kravix_key_rotated_${randomStr}`;

    setKeyList(prev => prev.map(k => {
      if (k.id === selectedRotateKey.id) {
        return {
          ...k,
          key: rotatedString,
          lastUsed: "Just now"
        };
      }
      return k;
    }));

    setSelectedRotateKey(null);
    toast.success("API key rotated successfully!");
  };

  const handleDeleteKey = (id, name) => {
    setKeyList(prev => prev.filter(k => k.id !== id));
    toast.success(`API Key '${name}' revoked and deleted.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-500 mt-1">Manage API access and authentication</p>
        </div>
        <button 
          onClick={() => setShowGenerateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center space-x-2 shadow-lg shadow-blue-500/10 font-medium animate-fade-in"
        >
          <Plus className="h-4 w-4" />
          <span>Generate New Key</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-gray-800">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Key className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{keyList.length}</p>
          <p className="text-sm text-gray-500">Active Keys</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Globe className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">124.8K</p>
          <p className="text-sm text-gray-500">Total Requests</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">245ms</p>
          <p className="text-sm text-gray-500">Avg Response</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="h-8 w-8 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {keyList.filter(k => k.status === "expiring").length}
          </p>
          <p className="text-sm text-gray-500">Expiring Soon</p>
        </div>
      </div>

      {/* API Keys List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-gray-800">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Your API Keys</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {keyList.map((apiKey) => (
            <div key={apiKey.id} className="p-6 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 col-span-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-bold text-gray-900">{apiKey.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${
                      apiKey.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {apiKey.status}
                    </span>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">API Key</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg font-mono tracking-tight text-slate-800">
                          {showKey[apiKey.id] ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                        </code>
                        <button
                          onClick={() => setShowKey({ ...showKey, [apiKey.id]: !showKey[apiKey.id] })}
                          className="p-1 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
                          title={showKey[apiKey.id] ? "Hide key" : "Show key"}
                        >
                          {showKey[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(apiKey.key)}
                          className="p-1 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
                          title="Copy key"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="text-sm font-medium text-gray-950 mt-1">{apiKey.created}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Expires</p>
                      <p className="text-sm font-medium text-gray-950 mt-1">{apiKey.expires}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center space-x-6 border-t border-gray-50 pt-3">
                    <div>
                      <p className="text-xs text-gray-500">Last Used</p>
                      <p className="text-sm text-gray-600 mt-0.5">{apiKey.lastUsed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Requests</p>
                      <p className="text-sm text-gray-600 mt-0.5">{apiKey.requests}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Permissions</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {apiKey.permissions.map((perm, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-xs font-semibold uppercase tracking-wider">
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setSelectedRotateKey(apiKey)}
                    className="p-2 hover:bg-gray-100 hover:text-blue-600 rounded-lg text-gray-500 transition-all"
                    title="Rotate Key"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteKey(apiKey.id, apiKey.name)}
                    className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-gray-500 transition-all"
                    title="Revoke Key"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Documentation */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">API Documentation</h3>
            <p className="text-sm text-slate-400">Learn how to integrate with our API</p>
          </div>
          <Lock className="h-8 w-8 text-slate-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-sm font-medium mb-2 text-slate-300">Base URL</p>
            <code className="text-xs bg-black/30 px-2 py-1 rounded font-mono text-emerald-300">https://api.kravix.com/v1</code>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-sm font-medium mb-2 text-slate-300">Authentication</p>
            <code className="text-xs bg-black/30 px-2 py-1 rounded font-mono text-emerald-300">Bearer {`{api_key}`}</code>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-sm font-medium mb-2 text-slate-300">Rate Limit</p>
            <code className="text-xs bg-black/30 px-2 py-1 rounded font-mono text-emerald-300">1000 requests/hour</code>
          </div>
        </div>
      </div>

      {/* Generate API Key Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 relative text-gray-800">
            <button
              onClick={() => setShowGenerateModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Generate API Key</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jenkins CI Key"
                  value={newKeyForm.name}
                  onChange={(e) => setNewKeyForm({ ...newKeyForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scope Permissions</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={newKeyForm.permissions.read}
                      onChange={(e) => setNewKeyForm({
                        ...newKeyForm,
                        permissions: { ...newKeyForm.permissions, read: e.target.checked }
                      })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Read Access</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={newKeyForm.permissions.write}
                      onChange={(e) => setNewKeyForm({
                        ...newKeyForm,
                        permissions: { ...newKeyForm.permissions, write: e.target.checked }
                      })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Write Access</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={newKeyForm.permissions.delete}
                      onChange={(e) => setNewKeyForm({
                        ...newKeyForm,
                        permissions: { ...newKeyForm.permissions, delete: e.target.checked }
                      })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Delete Access</span>
                  </label>
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateKey}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rotate Key Confirmation Modal */}
      {selectedRotateKey && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100 text-center text-gray-800">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Rotate API Key?</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to rotate the credentials for <strong>{selectedRotateKey.name}</strong>? Any services currently using this specific key string will stop working immediately.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedRotateKey(null)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRotateKey}
                className="flex-1 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-xl text-sm font-medium transition-all"
              >
                Rotate Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeys;