import { useState } from "react";
import toast from "react-hot-toast";
import {
  DollarSign, Users, Search, Download, CheckCircle,
  Clock, AlertCircle, X, Eye, RefreshCw, Send,
  TrendingUp, CreditCard, ArrowUpRight, ChevronRight,
  BarChart3, FileText, Filter
} from "lucide-react";

/* ─── Payslip Modal ──────────────────────────────────────────────────────── */
const PayslipModal = ({ employee, onClose }) => {
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success(`Payslip sent to ${employee.name} via email!`);
    }, 1000);
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      toast.success(`Payslip for ${employee.name} downloaded!`);
    }, 800);
  };

  const items = [
    { label: "Basic Salary", amount: employee.grossPay * 0.7, type: "earning" },
    { label: "House Rent Allowance", amount: employee.grossPay * 0.2, type: "earning" },
    { label: "Transport Allowance", amount: employee.grossPay * 0.1, type: "earning" },
    { label: "Income Tax", amount: employee.deductions * 0.5, type: "deduction" },
    { label: "Provident Fund", amount: employee.deductions * 0.3, type: "deduction" },
    { label: "Professional Tax", amount: employee.deductions * 0.2, type: "deduction" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-xl"><CreditCard className="h-5 w-5 text-green-600" /></div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Payslip</h2>
              <p className="text-sm text-gray-500">{employee.name} · July 2026</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="h-5 w-5 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Employee", value: employee.name },
              { label: "Department", value: employee.department },
              { label: "Position", value: employee.position },
              { label: "Employee ID", value: `EMP00${employee.id}` },
              { label: "Pay Period", value: "July 2026" },
              { label: "Pay Date", value: "31 July 2026" },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Earnings & Deductions</h4>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Description</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-emerald-600">Earnings</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-rose-600">Deductions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 text-sm text-gray-600">{item.label}</td>
                      <td className="px-4 py-2.5 text-right text-sm font-medium text-emerald-600">
                        {item.type === 'earning' ? `$${item.amount.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right text-sm font-medium text-rose-600">
                        {item.type === 'deduction' ? `$${item.amount.toFixed(2)}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">${employee.grossPay.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-rose-600">${employee.deductions.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-4 text-white flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs font-medium">Net Pay</p>
              <p className="text-2xl font-bold">${employee.netPay.toFixed(2)}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-200" />
          </div>

          <div className="flex space-x-3">
            <button onClick={handleSend} disabled={sending}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-60">
              {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>{sending ? "Sending…" : "Send to Employee"}</span>
            </button>
            <button onClick={handleDownload} disabled={downloading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium transition-all flex items-center justify-center space-x-2 disabled:opacity-60">
              {downloading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span>{downloading ? "Downloading…" : "Download PDF"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Process Payroll Modal ───────────────────────────────────────────────── */
const ProcessPayrollModal = ({ onClose, onProcess }) => {
  const [loading, setLoading] = useState(false);

  const handleProcess = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onProcess();
      toast.success("Payroll processed successfully for all employees!");
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 rounded-xl"><DollarSign className="h-5 w-5 text-amber-600" /></div>
            <h2 className="text-xl font-semibold text-gray-900">Process Payroll</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Confirm Payroll Processing</p>
                <p className="text-xs text-amber-700 mt-1">This will process payroll for all 156 employees for July 2026. Total disbursement: <strong>$388,000</strong>. This action cannot be undone.</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: "Employees to process", value: "156" },
              { label: "Gross payroll", value: "$485,000" },
              { label: "Total deductions", value: "$97,000" },
              { label: "Net disbursement", value: "$388,000" },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="flex space-x-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors">Cancel</button>
            <button onClick={handleProcess} disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium disabled:opacity-60 transition-all flex items-center justify-center space-x-2">
              {loading ? <><RefreshCw className="h-4 w-4 animate-spin" /><span>Processing…</span></>
                : <><CheckCircle className="h-4 w-4" /><span>Confirm & Process</span></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Page ───────────────────────────────────────────────────────────── */
const PayrollManagement = () => {
  const [selectedMonth, setSelectedMonth] = useState("July 2026");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewPayslip, setViewPayslip] = useState(null);
  const [showProcess, setShowProcess] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const payrollSummary = {
    totalEmployees: 156,
    grossPayroll: 485000,
    netPayroll: 388000,
    deductions: 97000,
    processed: 142,
    pending: 14
  };

  const [employees, setEmployees] = useState([
    { id: 1, name: "John Doe", department: "Engineering", position: "Senior Developer", grossPay: 7083.33, deductions: 1416.67, netPay: 5666.66, status: "processed" },
    { id: 2, name: "Jane Smith", department: "Marketing", position: "Marketing Manager", grossPay: 6250.00, deductions: 1250.00, netPay: 5000.00, status: "processed" },
    { id: 3, name: "Mike Johnson", department: "Sales", position: "Sales Lead", grossPay: 6666.67, deductions: 1333.33, netPay: 5333.34, status: "pending" },
    { id: 4, name: "Sarah Wilson", department: "HR", position: "HR Manager", grossPay: 6000.00, deductions: 1200.00, netPay: 4800.00, status: "processed" },
    { id: 5, name: "David Brown", department: "Finance", position: "Finance Analyst", grossPay: 5833.33, deductions: 1166.67, netPay: 4666.66, status: "pending" },
  ]);

  const handleProcessIndividual = (id) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: "processed" } : e));
    toast.success("Payroll processed for employee!");
  };

  const handleBulkProcess = () => {
    setEmployees(prev => prev.map(e => ({ ...e, status: "processed" })));
  };

  const handleExport = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      toast.success("Payroll report downloaded successfully!");
    }, 1200);
  };

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {viewPayslip && <PayslipModal employee={viewPayslip} onClose={() => setViewPayslip(null)} />}
      {showProcess && <ProcessPayrollModal onClose={() => setShowProcess(false)} onProcess={handleBulkProcess} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-500 mt-1">Process salaries, manage deductions, and generate payslips</p>
        </div>
        <div className="flex items-center space-x-3">
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 bg-white text-sm font-medium">
            {["July 2026", "June 2026", "May 2026"].map(m => <option key={m}>{m}</option>)}
          </select>
          <button onClick={handleExport} disabled={downloading}
            className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-medium flex items-center space-x-2 transition-colors disabled:opacity-60">
            {downloading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            <span>Export</span>
          </button>
          <button onClick={() => setShowProcess(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 text-sm font-medium flex items-center space-x-2 transition-all shadow-md shadow-green-500/25">
            <CheckCircle className="h-4 w-4" />
            <span>Process Payroll</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Gross Payroll", value: fmt(payrollSummary.grossPayroll), sub: "Total earnings", icon: DollarSign, bg: "from-blue-500 to-blue-600" },
          { label: "Net Payroll", value: fmt(payrollSummary.netPayroll), sub: "After deductions", icon: TrendingUp, bg: "from-emerald-500 to-green-600" },
          { label: "Total Deductions", value: fmt(payrollSummary.deductions), sub: "Tax + PF + other", icon: BarChart3, bg: "from-amber-500 to-orange-500" },
          { label: "Employees", value: payrollSummary.totalEmployees, sub: `${payrollSummary.processed} processed`, icon: Users, bg: "from-purple-500 to-purple-600" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${s.bg}`}><Icon className="h-5 w-5 text-white" /></div>
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm font-medium text-gray-600 mt-1">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Payroll Progress — {selectedMonth}</h3>
          <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            {Math.round((payrollSummary.processed / payrollSummary.totalEmployees) * 100)}% complete
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
            style={{ width: `${(payrollSummary.processed / payrollSummary.totalEmployees) * 100}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>{payrollSummary.processed} employees processed</span>
          <span>{payrollSummary.pending} pending</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search employees by name or department…" value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm transition-all" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Employee Payroll</h3>
          <span className="text-sm text-gray-400">{filtered.length} employees</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Employee", "Department", "Gross Pay", "Deductions", "Net Pay", "Status", "Actions"].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-400">{emp.position}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{emp.department}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">${emp.grossPay.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-rose-600 font-medium">-${emp.deductions.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-700">${emp.netPay.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${emp.status === 'processed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => setViewPayslip(emp)}
                        className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors" title="View Payslip">
                        <Eye className="h-4 w-4 text-blue-600" />
                      </button>
                      {emp.status === 'pending' && (
                        <button onClick={() => handleProcessIndividual(emp.id)}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors font-medium">
                          Process
                        </button>
                      )}
                      {emp.status === 'processed' && (
                        <button onClick={() => { setViewPayslip(emp); setTimeout(() => toast.success(`Payslip sent to ${emp.name}!`), 100); }}
                          className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50 transition-colors font-medium">
                          Send Slip
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayrollManagement;