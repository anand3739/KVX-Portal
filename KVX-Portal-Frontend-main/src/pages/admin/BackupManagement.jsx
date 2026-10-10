import { useState, useEffect } from "react";
import {
  Database,
  HardDrive,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  RefreshCw,
  Calendar,
  Settings,
  Server,
  Cloud,
  Trash2,
  Save,
  X
} from "lucide-react";
import toast from "react-hot-toast";

const BackupManagement = () => {
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState("daily");
  const [backupDestination, setBackupDestination] = useState("AWS S3");
  const [retentionPeriod, setRetentionPeriod] = useState("90 days");

  const [backupList, setBackupList] = useState([
    {
      id: 1,
      name: "Full System Backup",
      date: "2026-06-09 03:00",
      size: "2.4 GB",
      type: "Full",
      status: "success",
      location: "AWS S3"
    },
    {
      id: 2,
      name: "Database Backup",
      date: "2026-06-08 03:00",
      size: "1.8 GB",
      type: "Full",
      status: "success",
      location: "AWS S3"
    },
    {
      id: 3,
      name: "Incremental Backup",
      date: "2026-06-08 15:30",
      size: "156 MB",
      type: "Incremental",
      status: "success",
      location: "AWS S3"
    },
    {
      id: 4,
      name: "User Data Backup",
      date: "2026-06-07 03:00",
      size: "892 MB",
      type: "Full",
      status: "success",
      location: "AWS S3"
    }
  ]);

  // Backing up now progress modal
  const [backingUp, setBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  // Restore backup confirmation modal
  const [selectedRestoreBackup, setSelectedRestoreBackup] = useState(null);
  const [restoring, setRestoring] = useState(false);

  const handleRefresh = () => {
    toast.success("Backup list updated.");
  };

  const handleSaveConfig = () => {
    toast.success("Backup configuration saved successfully!");
  };

  const handleDownload = (backup) => {
    toast.success(`Initiated download for backup: ${backup.name} (${backup.size})`);
  };

  const handleDeleteBackup = (id, name) => {
    setBackupList(prev => prev.filter(b => b.id !== id));
    toast.success(`Backup '${name}' deleted successfully.`);
  };

  // Run the backup simulation
  const startBackup = () => {
    setBackingUp(true);
    setBackupProgress(0);
  };

  useEffect(() => {
    let interval;
    if (backingUp) {
      interval = setInterval(() => {
        setBackupProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setBackingUp(false);
              const now = new Date();
              const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
              const newBackup = {
                id: Date.now(),
                name: "Manual System Backup",
                date: formattedDate,
                size: "2.1 GB",
                type: "Full",
                status: "success",
                location: backupDestination
              };
              setBackupList([newBackup, ...backupList]);
              toast.success("System backup created successfully!");
            }, 500);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [backingUp]);

  // Run the restore simulation
  const handleRestoreBackup = () => {
    if (!selectedRestoreBackup) return;
    setRestoring(true);
    setTimeout(() => {
      setRestoring(false);
      setSelectedRestoreBackup(null);
      toast.success("System restored successfully from backup point.");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Backup Management</h1>
          <p className="text-gray-500 mt-1">Configure and manage system backups</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center space-x-2 bg-white shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button 
            onClick={startBackup}
            disabled={backingUp}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center space-x-2 shadow-lg shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Cloud className="h-4 w-4" />
            <span>Backup Now</span>
          </button>
        </div>
      </div>

      {/* Backup Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-gray-800">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Database className="h-8 w-8 text-blue-600" />
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Active</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{backupList.length}</p>
          <p className="text-sm text-gray-500">Total Backups</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <HardDrive className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">15.8 GB</p>
          <p className="text-sm text-gray-500">Storage Used</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">03:00</p>
          <p className="text-sm text-gray-500">Last Backup Time</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">99.9%</p>
          <p className="text-sm text-gray-500">Success Rate</p>
        </div>
      </div>

      {/* Backup Configuration */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-gray-800">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Backup Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Automatic Backups</p>
                  <p className="text-xs text-gray-500">Schedule regular backups</p>
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
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm"
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
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    defaultValue="03:00"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Destination
              </label>
              <select 
                value={backupDestination}
                onChange={(e) => setBackupDestination(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm"
              >
                <option value="AWS S3">AWS S3</option>
                <option value="Google Cloud Storage">Google Cloud Storage</option>
                <option value="Azure Blob Storage">Azure Blob Storage</option>
                <option value="Local Server">Local Server</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retention Period
              </label>
              <select 
                value={retentionPeriod}
                onChange={(e) => setRetentionPeriod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm"
              >
                <option value="30 days">30 days</option>
                <option value="90 days">90 days</option>
                <option value="180 days">180 days</option>
                <option value="1 year">1 year</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 mb-4 text-base">Backup Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Next Backup:</span>
                  <span className="text-blue-900 font-semibold">Today 03:00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Last Backup:</span>
                  <span className="text-blue-900 font-semibold">Today 03:00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Total Size:</span>
                  <span className="text-blue-900 font-semibold">15.8 GB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Available Space:</span>
                  <span className="text-blue-900 font-semibold">84.2 GB</span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleSaveConfig}
              className="mt-6 w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors shadow-md shadow-blue-500/10"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>

      {/* Recent Backups */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Recent Backups</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Backup Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {backupList.map((backup) => (
                <tr key={backup.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{backup.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{backup.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{backup.size}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{backup.type}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs capitalize">
                      {backup.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{backup.location}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleDownload(backup)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                        title="Download backup file"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setSelectedRestoreBackup(backup)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-blue-600"
                        title="Restore system from this backup"
                      >
                        <Upload className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteBackup(backup.id, backup.name)}
                        className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors text-rose-600"
                        title="Delete backup"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Backup Progress Modal */}
      {backingUp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100 text-center text-gray-800">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Cloud className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Creating System Backup</h3>
            <p className="text-sm text-gray-500 mb-6">
              Please wait while system snapshots and configurations are being packaged.
            </p>
            <div className="w-full bg-gray-150 h-2.5 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${backupProgress}%` }}
              />
            </div>
            <p className="text-sm font-semibold text-gray-800">{backupProgress}%</p>
          </div>
        </div>
      )}

      {/* Restore Backup Confirm Modal */}
      {selectedRestoreBackup && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100 text-center text-gray-800">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Restore Backup?</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to restore the system state from <strong>{selectedRestoreBackup.name}</strong> ({selectedRestoreBackup.date})? Current unsaved changes will be overwritten.
            </p>
            {restoring ? (
              <div className="space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-blue-600 font-medium">Restoring system snapshots...</p>
              </div>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedRestoreBackup(null)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestoreBackup}
                  className="flex-1 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-xl text-sm font-medium transition-all"
                >
                  Restore State
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupManagement;