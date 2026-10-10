import { useState } from "react";
import { 
  FileSpreadsheet, Upload, Download, Trash2, Eye, 
  Search, Filter, Plus, ChevronDown, CheckCircle, 
  X, Grid, FileText, HardDrive, ShieldCheck, Database
} from "lucide-react";
import toast from "react-hot-toast";

const ExcelSheetsFolder = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedSheet, setSelectedSheet] = useState(null);
  
  const [newFile, setNewFile] = useState({
    name: "",
    category: "Payroll"
  });

  const categories = ["Payroll", "Attendance", "Leaves", "Recruitment", "Training", "General"];

  const [excelFiles, setExcelFiles] = useState([
    { id: 1, name: "KVX_Payroll_Calculation_June.xlsx", size: "124 KB", category: "Payroll", uploadDate: "2026-06-15", uploadedBy: "Jane Smith", rows: 5, cols: 6,
      data: [
        ["Emp ID", "Name", "Department", "Base Salary", "Deductions", "Net Salary"],
        ["EMP001", "John Doe", "Engineering", "$6,500", "$450", "$6,050"],
        ["EMP002", "Jane Smith", "Human Resources", "$5,800", "$380", "$5,420"],
        ["EMP003", "Mike Johnson", "Sales", "$4,200", "$210", "$3,990"],
        ["EMP004", "Sarah Wilson", "Marketing", "$4,500", "$280", "$4,220"],
        ["EMP005", "David Brown", "Finance", "$5,000", "$310", "$4,690"]
      ]
    },
    { id: 2, name: "Employee_Attendance_June_2026.xlsx", size: "45 KB", category: "Attendance", uploadDate: "2026-06-12", uploadedBy: "Sarah Connor", rows: 6, cols: 6,
      data: [
        ["Emp ID", "Name", "Present Days", "Absent Days", "Late Days", "Attendance Rate"],
        ["EMP001", "John Doe", "11", "0", "0", "100%"],
        ["EMP002", "Jane Smith", "11", "0", "0", "100%"],
        ["EMP003", "Mike Johnson", "10", "1", "1", "90.9%"],
        ["EMP004", "Sarah Wilson", "8", "3", "0", "72.7%"],
        ["EMP005", "David Brown", "11", "0", "0", "100%"],
        ["EMP006", "Emily Davis", "10", "1", "1", "90.9%"]
      ]
    },
    { id: 3, name: "HR_Team_Leaves_Q2.xlsx", size: "18 KB", category: "Leaves", uploadDate: "2026-06-10", uploadedBy: "Jane Smith", rows: 4, cols: 5,
      data: [
        ["Name", "Leave Type", "Start Date", "Total Days", "Status"],
        ["Jane Smith", "Annual Leave", "2026-04-12", "3", "Approved"],
        ["Sarah Connor", "Sick Leave", "2026-05-15", "1", "Approved"],
        ["Michael Scott", "Personal Leave", "2026-06-02", "2", "Approved"],
        ["Jane Smith", "Sick Leave", "2026-06-10", "1", "Approved"]
      ]
    },
    { id: 4, name: "Recruitment_Pipeline_Active.xlsx", size: "58 KB", category: "Recruitment", uploadDate: "2026-06-14", uploadedBy: "Michael Scott", rows: 5, cols: 5,
      data: [
        ["Candidate", "Applied For", "Source", "Current Stage", "Recruiter"],
        ["Alice Johnson", "Senior Developer", "LinkedIn", "Technical Interview", "Sarah Connor"],
        ["Bob Smith", "HR Associate", "Indeed", "Offer Extended", "Jane Smith"],
        ["Carol White", "Sales Manager", "Referral", "Screening Passed", "Michael Scott"],
        ["David Brown", "Marketing Lead", "LinkedIn", "Final Round", "Sarah Connor"],
        ["Eva Green", "UI/UX Designer", "Behance", "Technical Interview", "Sarah Connor"]
      ]
    },
    { id: 5, name: "Training_Status_All.xlsx", size: "32 KB", category: "Training", uploadDate: "2026-06-08", uploadedBy: "Sarah Connor", rows: 4, cols: 4,
      data: [
        ["Training Program", "Instructor", "Start Date", "Completion Rate"],
        ["Cybersecurity Awareness", "Sarah Connor", "2026-05-10", "94%"],
        ["Customer Success 101", "Michael Scott", "2026-05-18", "88%"],
        ["React Native Advanced", "John Doe", "2026-06-01", "72%"],
        ["HR Policy Update", "Jane Smith", "2026-06-05", "100%"]
      ]
    }
  ]);

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!newFile.name) {
      toast.error("Please enter a file name");
      return;
    }
    
    let fileName = newFile.name.trim();
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls") && !fileName.endsWith(".csv")) {
      fileName += ".xlsx";
    }

    setUploading(true);
    setUploadProgress(10);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const addedFile = {
              id: Date.now(),
              name: fileName,
              size: `${Math.floor(Math.random() * 100) + 15} KB`,
              category: newFile.category,
              uploadDate: new Date().toISOString().split("T")[0],
              uploadedBy: "Jane Smith",
              rows: 3,
              cols: 4,
              data: [
                ["Col A", "Col B", "Col C", "Col D"],
                ["Mock Data 1", "Mock Data 2", "Mock Data 3", "Mock Data 4"],
                ["Row 2 Col A", "Row 2 Col B", "Row 2 Col C", "Row 2 Col D"],
                ["Row 3 Col A", "Row 3 Col B", "Row 3 Col C", "Row 3 Col D"]
              ]
            };
            setExcelFiles([addedFile, ...excelFiles]);
            setUploading(false);
            setShowUploadModal(false);
            setNewFile({ name: "", category: "Payroll" });
            toast.success(`Spreadsheet "${fileName}" uploaded successfully!`);
          }, 500);
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  const handleDeleteFile = (id, name) => {
    setExcelFiles(prev => prev.filter(f => f.id !== id));
    toast.success(`"${name}" deleted successfully`);
  };

  const handleDownloadFile = (name) => {
    toast.success(`Downloading "${name}"...`);
  };

  const filteredFiles = excelFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          file.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (cat) => {
    switch (cat) {
      case "Payroll": return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "Attendance": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Leaves": return "bg-amber-50 text-amber-700 border-amber-100";
      case "Recruitment": return "bg-purple-50 text-purple-700 border-purple-100";
      case "Training": return "bg-pink-50 text-pink-700 border-pink-100";
      default: return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Excel Sheets Folder</h1>
          <p className="text-gray-500 mt-1">Manage, upload, preview, and download administrative spreadsheets</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all flex items-center space-x-2 text-sm font-medium shadow-md shadow-green-500/25"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Spreadsheet</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[
          { label: "Total Spreadsheets", value: excelFiles.length, sub: "In 6 categories", icon: FileSpreadsheet, bg: "from-blue-500 to-indigo-600", text: "text-blue-600" },
          { label: "Storage Used", value: "277 KB", sub: "Capacity: 100 MB", icon: HardDrive, bg: "from-indigo-500 to-purple-600", text: "text-indigo-600" },
          { label: "Verified Safe", value: "100%", sub: "Virus scanned", icon: ShieldCheck, bg: "from-emerald-500 to-green-600", text: "text-emerald-600" },
          { label: "Total Rows Loaded", value: excelFiles.reduce((acc, f) => acc + f.rows, 0), sub: "Across all sheets", icon: Database, bg: "from-amber-500 to-orange-500", text: "text-amber-600" }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center space-x-4">
              <div className={`p-3 bg-gradient-to-br ${stat.bg} rounded-xl text-white`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and search bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search spreadsheets by name or author…" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm transition-all" 
            />
          </div>
          <div className="flex items-center space-x-3">
            <select 
              value={selectedCategory} 
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 bg-white text-sm transition-all"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Files */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <FileSpreadsheet className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800">No spreadsheets found</h3>
          <p className="text-gray-400 max-w-xs mx-auto mt-1">Try adjusting your filters or search terms, or upload a new file.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiles.map(file => (
            <div 
              key={file.id} 
              className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all hover:border-green-200 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50/20 rounded-full translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform" />
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-green-50 rounded-xl text-green-600">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryColor(file.category)}`}>
                    {file.category}
                  </span>
                </div>
                
                <h3 className="font-bold text-gray-900 text-base leading-tight mb-2 truncate group-hover:text-green-700 transition-colors" title={file.name}>
                  {file.name}
                </h3>
                
                <div className="grid grid-cols-2 gap-y-2 mt-4 pb-4 border-b border-gray-50 text-xs text-gray-500">
                  <div>
                    <span className="block text-gray-400">File Size</span>
                    <span className="font-semibold text-gray-800">{file.size}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400">Rows x Columns</span>
                    <span className="font-semibold text-gray-800">{file.rows} x {file.cols}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400">Upload Date</span>
                    <span className="font-semibold text-gray-800">{file.uploadDate}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400">Uploaded By</span>
                    <span className="font-semibold text-gray-800 truncate block max-w-[100px]">{file.uploadedBy}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 mt-4 pt-2">
                <button 
                  onClick={() => setSelectedSheet(file)}
                  className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1.5 text-xs font-semibold"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview</span>
                </button>
                <button 
                  onClick={() => handleDownloadFile(file.name)}
                  className="px-3 py-2 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center text-xs font-semibold"
                  title="Download File"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => handleDeleteFile(file.id, file.name)}
                  className="px-3 py-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors flex items-center justify-center text-xs font-semibold"
                  title="Delete File"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Spreadsheet Preview Modal */}
      {selectedSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-green-50 rounded-xl text-green-600"><FileSpreadsheet className="h-5.5 w-5.5" /></div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">{selectedSheet.name}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{selectedSheet.category} Spreadsheet · {selectedSheet.size} · Uploaded by {selectedSheet.uploadedBy} on {selectedSheet.uploadDate}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSheet(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body / Spreadsheet Grid */}
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm h-full flex flex-col">
                <div className="overflow-auto flex-1">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100/80 sticky top-0 border-b border-gray-200">
                        {/* Index Column */}
                        <th className="w-12 py-2 border-r border-gray-200 bg-gray-200/50 text-center text-[10px] font-bold text-gray-500 sticky left-0 z-10"></th>
                        {/* Spreadsheet Column Headers (A, B, C...) */}
                        {Array.from({ length: selectedSheet.data[0]?.length || 0 }).map((_, idx) => (
                          <th key={idx} className="px-4 py-2 border-r border-gray-200 text-center text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-150">
                            {String.fromCharCode(65 + idx)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-250">
                      {selectedSheet.data.map((row, rowIdx) => (
                        <tr key={rowIdx} className={rowIdx === 0 ? "bg-gray-50 font-semibold" : "hover:bg-green-50/20"}>
                          {/* Row Index Number */}
                          <td className="py-2 border-r border-gray-250 bg-gray-100 text-center text-[10px] font-bold text-gray-400 sticky left-0 z-10">
                            {rowIdx + 1}
                          </td>
                          {/* Row Cell Data */}
                          {row.map((cell, cellIdx) => (
                            <td 
                              key={cellIdx} 
                              className={`px-4 py-2.5 border-r border-gray-200 text-sm ${rowIdx === 0 ? "font-bold text-gray-800 bg-gray-50/50" : "text-gray-600"}`}
                            >
                              <div className="min-w-[120px] max-w-[200px] truncate" title={cell}>
                                {cell}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end space-x-3 rounded-b-2xl">
              <button 
                onClick={() => setSelectedSheet(null)}
                className="px-5 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-colors"
              >
                Close Preview
              </button>
              <button 
                onClick={() => { handleDownloadFile(selectedSheet.name); setSelectedSheet(null); }}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-all flex items-center space-x-2 shadow-sm"
              >
                <Download className="h-4 w-4" />
                <span>Download File</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Upload Spreadsheet Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-xl text-green-600"><Upload className="h-5 w-5" /></div>
                <h2 className="text-xl font-bold text-gray-900">Upload Spreadsheet</h2>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">File Name *</label>
                <input 
                  type="text" 
                  value={newFile.name}
                  onChange={e => setNewFile({ ...newFile, name: e.target.value })}
                  placeholder="e.g. Employee_Bonuses_Q2"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                  required
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select 
                  value={newFile.category}
                  onChange={e => setNewFile({ ...newFile, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 bg-white transition-all text-sm"
                  disabled={uploading}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Drag and Drop Zone */}
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center bg-gray-50 hover:bg-gray-100/50 hover:border-green-400 transition-all cursor-pointer">
                <FileSpreadsheet className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <span className="block text-sm font-medium text-gray-600">Drag & drop spreadsheet here</span>
                <span className="text-xs text-gray-400 mt-1 block">Supports .xlsx, .xls, .csv up to 10MB</span>
              </div>

              {uploading && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-150 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing…</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Upload</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelSheetsFolder;
