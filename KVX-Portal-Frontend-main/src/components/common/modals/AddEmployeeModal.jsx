import { useState } from "react";
import BaseModal from "./BaseModal";
import { User, Mail, Phone, Briefcase, DollarSign, Calendar, Copy, CheckCircle, Eye, EyeOff, Loader, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { validateFullName, validateEmail, validatePhone } from "../../../utils";

const AddEmployeeModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    role: "employee",
    salary: "",
  });

  const departments = [
    "Engineering", "Human Resources", "Sales", "Marketing", "Finance", "Operations"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Strict Validations
    const firstVal = validateFullName(formData.first_name);
    if (!firstVal.isValid) {
      toast.error(`First Name: ${firstVal.error}`);
      setLoading(false);
      return;
    }

    const lastVal = validateFullName(formData.last_name);
    if (!lastVal.isValid) {
      toast.error(`Last Name: ${lastVal.error}`);
      setLoading(false);
      return;
    }

    const emailVal = validateEmail(formData.email);
    if (!emailVal.isValid) {
      toast.error(emailVal.error);
      setLoading(false);
      return;
    }

    if (formData.phone && formData.phone.trim()) {
      const phoneVal = validatePhone(formData.phone);
      if (!phoneVal.isValid) {
        toast.error(phoneVal.error);
        setLoading(false);
        return;
      }
    }

    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      const generatedId = `EMP${Math.floor(100 + Math.random() * 900)}`;
      const tempPass = Math.random().toString(36).slice(-8).toUpperCase() + "@" + Math.floor(10 + Math.random() * 90);
      
      setCredentials({
        employee_id: generatedId,
        email: formData.email.trim(),
        temp_password: tempPass,
      });
      toast.success("Employee created successfully!");
    }, 1200);
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      role: "employee",
      salary: "",
    });
    setCredentials(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Add New Employee" size="lg">
      {credentials ? (
        <div className="space-y-6 py-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-emerald-100 mb-4 animate-bounce">
              <CheckCircle className="h-7 w-7 text-emerald-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900">Employee Account Created!</h4>
            <p className="text-sm text-gray-500 mt-1">Temporary credentials are ready for use</p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Employee ID</span>
              <div className="flex items-center justify-between mt-1 bg-white p-2 rounded-lg border border-slate-200">
                <code className="text-sm font-mono font-bold text-slate-800">{credentials.employee_id}</code>
                <button 
                  onClick={() => copyToClipboard(credentials.employee_id)} 
                  className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</span>
              <div className="flex items-center justify-between mt-1 bg-white p-2 rounded-lg border border-slate-200">
                <code className="text-sm text-slate-800">{credentials.email}</code>
                <button 
                  onClick={() => copyToClipboard(credentials.email)} 
                  className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Temporary Password</span>
              <div className="flex items-center justify-between mt-1 bg-white p-2 rounded-lg border border-slate-200">
                <code className="text-sm font-mono font-bold text-slate-800">
                  {showPassword ? credentials.temp_password : '••••••••'}
                </code>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button 
                    onClick={() => copyToClipboard(credentials.temp_password)} 
                    className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/10 transition-all"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                <input 
                  type="text" 
                  name="first_name" 
                  value={formData.first_name} 
                  onChange={handleChange} 
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  placeholder="John"
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                <input 
                  type="text" 
                  name="last_name" 
                  value={formData.last_name} 
                  onChange={handleChange} 
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  placeholder="Doe"
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  placeholder="john.doe@company.com"
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
              <select 
                name="department" 
                value={formData.department} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all text-sm"
              >
                <option value="">Select Department</option>
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Position</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                <input 
                  type="text" 
                  name="position" 
                  value={formData.position} 
                  onChange={handleChange} 
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  placeholder="Software Engineer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">System Role</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange} 
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all text-sm"
                >
                  <option value="employee">Employee</option>
                  <option value="hr">HR Specialist</option>
                  <option value="admin">Administrator</option>
                  <option value="ceo">CEO</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Annual Salary (USD)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                <input 
                  type="number" 
                  name="salary" 
                  value={formData.salary} 
                  onChange={handleChange} 
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  placeholder="75000"
                />
              </div>
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
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Employee</span>
              )}
            </button>
          </div>
        </form>
      )}
    </BaseModal>
  );
};

export default AddEmployeeModal;
