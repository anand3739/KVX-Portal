import { useState, useEffect } from "react";
import BaseModal from "./BaseModal";
import { Database, Cloud, Loader, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { downloadTextFile } from "../../../utils/downloadHelper";

const RunBackupModal = ({ isOpen, onClose }) => {
  const [backingUp, setBackingUp] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  
  const [settings, setSettings] = useState({
    type: "full",
    destination: "s3",
    compression: "zip",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    let interval;
    if (backingUp && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          const next = prev + Math.floor(Math.random() * 15) + 5;
          return next >= 100 ? 100 : next;
        });
      }, 200);
    } else if (backingUp && progress === 100) {
      setBackingUp(false);
      setCompleted(true);
      toast.success("System backup completed successfully!");
      
      // Trigger actual dummy ZIP download
      const today = new Date().toISOString().split('T')[0];
      const filename = `kravix_backup_${settings.type}_${today}.zip`;
      const dummyContent = `Kravix Tech System Backup File\nDate: ${today}\nType: ${settings.type.toUpperCase()}\nDestination: ${settings.destination.toUpperCase()}\nCompression: ${settings.compression.toUpperCase()}\nStatus: SUCCESS\nIntegrity Hash: ${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
      
      downloadTextFile(filename, dummyContent);
    }
    return () => clearInterval(interval);
  }, [backingUp, progress]);

  const handleStartBackup = (e) => {
    e.preventDefault();
    setBackingUp(true);
    setProgress(0);
    setCompleted(false);
  };

  const handleClose = () => {
    setBackingUp(false);
    setProgress(0);
    setCompleted(false);
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Run System Backup" size="md">
      {backingUp ? (
        <div className="space-y-6 py-6 text-center">
          <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Backing Up System...</h4>
            <p className="text-sm text-gray-500 mt-1">Please do not close this window</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600 font-semibold px-2">
              <span>Compressing database & files</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      ) : completed ? (
        <div className="space-y-6 py-4 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-emerald-100 mb-2 animate-bounce">
            <CheckCircle className="h-7 w-7 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-900">Backup Complete!</h4>
            <p className="text-sm text-gray-500 mt-1">Backup archive was compiled and download was initiated.</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-left border text-sm space-y-2 max-w-sm mx-auto">
            <div className="flex justify-between"><span className="text-gray-500">File Type:</span> <span className="font-semibold">{settings.type.toUpperCase()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Compression:</span> <span className="font-semibold">.{settings.compression}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Target Location:</span> <span className="font-semibold">{settings.destination.toUpperCase()}</span></div>
          </div>
          <button 
            onClick={handleClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleStartBackup} className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start space-x-3 mb-2">
            <Database className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-800">
              Running a full system backup includes system configurations, active databases, audit logs, and uploaded documents.
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Backup Scope *</label>
            <select 
              name="type" 
              value={settings.type} 
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all text-sm"
            >
              <option value="full">Full System (Database & Uploads)</option>
              <option value="database">Database Only (PostgreSQL dump)</option>
              <option value="files">Files Only (Uploads and assets)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Destination</label>
              <div className="relative">
                <Cloud className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                <select 
                  name="destination" 
                  value={settings.destination} 
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all text-sm"
                >
                  <option value="s3">AWS S3 Bucket</option>
                  <option value="gcs">Google Cloud Storage</option>
                  <option value="azure">Azure Blob</option>
                  <option value="local">Local Storage (Host Download)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Archive Compression</label>
              <select 
                name="compression" 
                value={settings.compression} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all text-sm"
              >
                <option value="zip">ZIP (Fast/Standard)</option>
                <option value="tar.gz">TAR.GZ (High Compression)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={handleClose} 
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center space-x-2"
            >
              <span>Start Backup</span>
            </button>
          </div>
        </form>
      )}
    </BaseModal>
  );
};

export default RunBackupModal;
