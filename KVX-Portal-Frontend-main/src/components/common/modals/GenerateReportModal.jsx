import { useState, useEffect } from "react";
import BaseModal from "./BaseModal";
import { FileText, Download, Loader, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { downloadCSV } from "../../../utils/downloadHelper";

const GenerateReportModal = ({ isOpen, onClose }) => {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  const [options, setOptions] = useState({
    type: "activity",
    format: "csv",
    range: "30_days",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOptions(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    let interval;
    if (generating && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          const next = prev + Math.floor(Math.random() * 20) + 10;
          return next >= 100 ? 100 : next;
        });
      }, 150);
    } else if (generating && progress === 100) {
      setGenerating(false);
      setCompleted(true);
      toast.success("Report generated successfully!");

      // Trigger actual compiled CSV download
      triggerReportDownload();
    }
    return () => clearInterval(interval);
  }, [generating, progress]);

  const handleStartGeneration = (e) => {
    e.preventDefault();
    setGenerating(true);
    setProgress(0);
    setCompleted(false);
  };

  const triggerReportDownload = () => {
    const today = new Date().toISOString().split('T')[0];
    const filename = `kravix_${options.type}_report_${today}.${options.format}`;

    let headers = [];
    let rows = [];

    switch (options.type) {
      case "activity":
        headers = ["User", "Email", "Role", "Action", "IP Address", "Timestamp"];
        rows = [
          ["John Doe", "john.doe@kravix.com", "developer", "API Key Created", "192.168.1.104", `${today} 10:45 AM`],
          ["Jane Smith", "jane.smith@kravix.com", "hr", "Employee Record Added", "192.168.1.108", `${today} 09:30 AM`],
          ["Mike Wilson", "mike.wilson@kravix.com", "ceo", "Financial Statement Viewed", "192.168.1.102", `${today} 08:15 AM`],
          ["Sarah Connor", "s.connor@kravix.com", "employee", "Clocked In", "10.0.4.15", `${today} 08:00 AM`]
        ];
        break;
      case "system":
        headers = ["System Metric", "Average Load", "Peak Load", "Threshold Limit", "Status"];
        rows = [
          ["CPU Core Usage", "45%", "89%", "90%", "HEALTHY"],
          ["Memory Consumption", "62%", "78%", "95%", "HEALTHY"],
          ["Disk Allocation", "78%", "78%", "90%", "WARNING"],
          ["API Route Latency", "124ms", "245ms", "500ms", "HEALTHY"],
          ["Database Connectivity", "24/100", "42/100", "100/100", "HEALTHY"]
        ];
        break;
      case "payroll":
        headers = ["Payroll Group", "Headcount", "Gross Salary (USD)", "Taxes (USD)", "Net Disbursement (USD)"];
        rows = [
          ["Executive Office", "3", "55000", "11000", "44000"],
          ["Engineering Dept", "45", "325000", "65000", "260000"],
          ["Human Resources", "6", "40000", "8000", "32000"],
          ["Sales & Marketing", "12", "65000", "13000", "52000"]
        ];
        break;
      case "recruitment":
        headers = ["Position Title", "Department", "Applicants", "Interview Stage", "Offers Issued", "Status"];
        rows = [
          ["Senior Frontend Developer", "Engineering", "45", "12", "2", "OPEN"],
          ["HR Operations Coordinator", "Human Resources", "18", "4", "1", "CLOSED"],
          ["Sales Development Manager", "Sales & Marketing", "34", "8", "0", "OPEN"],
          ["Director of Finance", "Finance", "12", "2", "0", "INTERVIEWING"]
        ];
        break;
      default:
        headers = ["Metric", "Value"];
        rows = [["System Operational", "YES"]];
    }

    downloadCSV(filename, headers, rows);
  };

  const handleClose = () => {
    setGenerating(false);
    setProgress(0);
    setCompleted(false);
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Generate System Report" size="md">
      {generating ? (
        <div className="space-y-6 py-6 text-center">
          <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Compiling Report Data...</h4>
            <p className="text-sm text-gray-500 mt-1">Aggregating records and formatting tables</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600 font-semibold px-2">
              <span>Generating {options.format.toUpperCase()} file</span>
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
            <h4 className="text-xl font-bold text-gray-900">Report Ready!</h4>
            <p className="text-sm text-gray-500 mt-1">Your report was successfully compiled and downloaded.</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-left border text-sm space-y-2 max-w-sm mx-auto">
            <div className="flex justify-between"><span className="text-gray-500">Report Type:</span> <span className="font-semibold capitalize">{options.type} Report</span></div>
            <div className="flex justify-between"><span className="text-gray-500">File Format:</span> <span className="font-semibold uppercase">.{options.format}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Date Range:</span> <span className="font-semibold capitalize">{options.range.replace('_', ' ')}</span></div>
          </div>
          <button 
            onClick={handleClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleStartGeneration} className="space-y-4">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-start space-x-3 mb-2">
            <FileText className="h-5 w-5 text-slate-500 mt-0.5" />
            <div className="text-xs text-slate-600">
              Select the parameters to compile. Reports contain encrypted database aggregates formatted for local auditing.
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Report Type *</label>
            <select 
              name="type" 
              value={options.type} 
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all text-sm"
            >
              <option value="activity">User Activity & Audit Logs</option>
              <option value="system">System Health Monitor Metrics</option>
              <option value="payroll">Payroll Summary Grouping</option>
              <option value="recruitment">Recruitment & Applicant Pipeline</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">File Format</label>
              <select 
                name="format" 
                value={options.format} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all text-sm"
              >
                <option value="csv">Comma-Separated (CSV)</option>
                <option value="xlsx">Excel Workbook (XLSX)</option>
                <option value="pdf">Document Format (PDF)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date Range</label>
              <select 
                name="range" 
                value={options.range} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all text-sm"
              >
                <option value="7_days">Last 7 Days</option>
                <option value="30_days">Last 30 Days</option>
                <option value="90_days">Last 90 Days</option>
                <option value="all_time">All Time Record</option>
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
              <Download className="h-4 w-4" />
              <span>Compile & Download</span>
            </button>
          </div>
        </form>
      )}
    </BaseModal>
  );
};

export default GenerateReportModal;
