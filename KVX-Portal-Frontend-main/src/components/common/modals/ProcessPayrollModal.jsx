import { useState, useEffect } from "react";
import BaseModal from "./BaseModal";
import { DollarSign, Check, Loader, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { downloadTextFile } from "../../../utils/downloadHelper";

const ProcessPayrollModal = ({ isOpen, onClose }) => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  
  const [confirm, setConfirm] = useState(false);
  const [method, setMethod] = useState("direct_deposit");

  useEffect(() => {
    let interval;
    if (processing && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          const next = prev + Math.floor(Math.random() * 25) + 5;
          return next >= 100 ? 100 : next;
        });
      }, 150);
    } else if (processing && progress === 100) {
      setProcessing(false);
      setCompleted(true);
      toast.success("Payroll processed successfully! Funds transferred.");
      
      // Trigger payout report download
      const today = new Date().toISOString().split('T')[0];
      const filename = `payroll_disbursement_${today}.csv`;
      const content = `Transaction ID,Employee,Account Number,Gross Pay,Taxes,Net Pay,Status\n` + 
                      `TXN784512,Emma Wilson,xxxx-4512,$12000,$2400,$9600,TRANSFERRED\n` +
                      `TXN784513,John Doe,xxxx-7845,$8500,$1700,$6800,TRANSFERRED\n` +
                      `TXN784514,Jane Smith,xxxx-9630,$9200,$1840,$7360,TRANSFERRED\n` +
                      `TXN784515,Bob Johnson,xxxx-1204,$6400,$1280,$5120,TRANSFERRED`;
      downloadTextFile(filename, content, "text/csv");
    }
    return () => clearInterval(interval);
  }, [processing, progress]);

  const handleStartProcess = (e) => {
    e.preventDefault();
    if (!confirm) {
      toast.error("Please confirm payroll validation checklist");
      return;
    }
    setProcessing(true);
    setProgress(0);
    setCompleted(false);
  };

  const handleClose = () => {
    setProcessing(false);
    setProgress(0);
    setCompleted(false);
    setConfirm(false);
    onClose();
  };

  return (
    BaseModal && (
      <BaseModal isOpen={isOpen} onClose={handleClose} title="Process Monthly Payroll" size="md">
        {processing ? (
          <div className="space-y-6 py-6 text-center">
            <Loader className="h-12 w-12 animate-spin text-emerald-600 mx-auto" />
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Processing Fund Disbursements...</h4>
              <p className="text-sm text-gray-500 mt-1">Settling bank ledger and posting pay receipts</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600 font-semibold px-2">
                <span>Disbursing via {method.replace('_', ' ').toUpperCase()}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
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
              <h4 className="text-xl font-bold text-gray-900">Payroll Settled!</h4>
              <p className="text-sm text-gray-500 mt-1">Disbursement file created and bank instructions dispatched.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-left border text-sm space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between"><span className="text-gray-500">Gross Payroll:</span> <span className="font-semibold text-gray-950">$485,000</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Deductions:</span> <span className="font-semibold text-gray-950">$97,000</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Net Disbursed:</span> <span className="font-semibold text-emerald-700">$388,000</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Disbursement Channel:</span> <span className="font-semibold capitalize">{method.replace('_', ' ')}</span></div>
            </div>
            <button 
              onClick={handleClose}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleStartProcess} className="space-y-5">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-100 p-4 rounded-xl">
              <div className="text-center">
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Gross Payroll</span>
                <p className="text-base font-bold text-gray-900 mt-1">$485K</p>
              </div>
              <div className="text-center border-x border-slate-200">
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Taxes / Ded.</span>
                <p className="text-base font-bold text-gray-900 mt-1">$97K</p>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Net Payout</span>
                <p className="text-base font-bold text-emerald-600 mt-1">$388K</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Disbursement Channel *</label>
              <select 
                value={method} 
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all text-sm"
              >
                <option value="direct_deposit">Automated Clearing House (ACH)</option>
                <option value="wire_transfer">Federal Wire Transfer (Immediate)</option>
                <option value="paper_checks">Check Register Compilation</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={confirm}
                  onChange={(e) => setConfirm(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-colors"
                />
                <span className="text-xs text-gray-600 select-none group-hover:text-gray-950 transition-colors">
                  I confirm that I have validated the attendance records, time cards, and deduction settings. I authorize the transfer of $388,000 for disbursement.
                </span>
              </label>
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
                disabled={!confirm}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center space-x-2"
              >
                <DollarSign className="h-4 w-4" />
                <span>Disburse Funds</span>
              </button>
            </div>
          </form>
        )}
      </BaseModal>
    )
  );
};

export default ProcessPayrollModal;
