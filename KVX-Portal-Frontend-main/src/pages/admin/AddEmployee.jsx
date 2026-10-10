import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, Briefcase, Calendar, MapPin, DollarSign,
  Upload, X, Save, ArrowLeft, Loader, Eye, EyeOff, Copy, CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { mockCreateEmployee } from "../../services/mockAuthService";

const AddEmployee = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department_name: "",
    position: "",
    joining_date: new Date().toISOString().split("T")[0],
    salary: "",
    employment_type: "Full-time",
    date_of_birth: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    postal_code: "",
    reports_to: ""
  });

  const departments = [
    "Engineering", "Human Resources", "Sales", "Marketing",
    "Finance", "Operations", "Legal", "Product"
  ];

  const managers = [
    { id: "m1", name: "Sarah Johnson" },
    { id: "m2", name: "Michael Brown" },
    { id: "m3", name: "David Wilson" },
    { id: "m4", name: "Emily Davis" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(() => {});
    toast.success("Copied to clipboard!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast.error("Please fill in all required fields (first name, last name, email).");
      setLoading(false);
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      // Simulate short async delay (as if calling an API)
      await new Promise(r => setTimeout(r, 700));
      const response = mockCreateEmployee(formData);
      const tempPassword = `Kravix@${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedCredentials({
        employee_id: response.employee.employee_id,
        email: response.employee.email,
        temp_password: tempPassword
      });
      setShowCredentials(true);
      toast.success("Employee created successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to create employee.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success Screen ──────────────────────────────────────────
  if (showCredentials && generatedCredentials) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Employee Created!</h2>
            <p className="text-gray-500 mt-2">Login credentials have been generated.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
            {[
              { label: "Employee ID", value: generatedCredentials.employee_id },
              { label: "Email", value: generatedCredentials.email },
              { label: "Temporary Password", value: generatedCredentials.temp_password, masked: true }
            ].map(({ label, value, masked }) => (
              <div key={label}>
                <label className="text-xs text-gray-500 font-medium">{label}</label>
                <div className="flex items-center justify-between mt-1">
                  <code className="bg-white px-3 py-2 rounded border text-sm font-mono flex-1 mr-2 truncate">
                    {masked && !showPassword ? "••••••••" : value}
                  </code>
                  <div className="flex gap-1">
                    {masked && (
                      <button onClick={() => setShowPassword(!showPassword)}
                        className="p-2 hover:bg-gray-200 rounded-lg">
                        {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                      </button>
                    )}
                    <button onClick={() => copyToClipboard(value)} className="p-2 hover:bg-gray-200 rounded-lg">
                      <Copy className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-3 mb-4 border border-amber-100">
            ⚠️ Share these credentials with the employee securely. They should change their password on first login.
          </p>

          <div className="space-y-3">
            <button onClick={() => navigate("/admin/employees")}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium">
              Back to Employee List
            </button>
            <button onClick={() => {
              setShowCredentials(false);
              setGeneratedCredentials(null);
              setFormData({
                first_name: "", last_name: "", email: "", phone: "", department_name: "",
                position: "", joining_date: new Date().toISOString().split("T")[0],
                salary: "", employment_type: "Full-time", date_of_birth: "",
                address: "", city: "", state: "", country: "India", postal_code: "", reports_to: ""
              });
            }}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-700">
              Add Another Employee
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/admin/employees" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Employee</h1>
            <p className="text-gray-500 mt-1">Create a new employee record in the system</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/admin/employees"
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg shadow-blue-500/20">
            {loading ? (
              <><Loader className="h-4 w-4 animate-spin" /><span>Creating...</span></>
            ) : (
              <><Save className="h-4 w-4" /><span>Create Employee</span></>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <span>Basic Information</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Enter first name" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Enter last name" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="name@kravix.com" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="+91 98765 43210" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <span>Employment Details</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select name="department_name" value={formData.department_name} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                <option value="">Select Department</option>
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position / Job Title</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" name="position" value={formData.position} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="e.g. Software Engineer" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="date" name="joining_date" value={formData.joining_date} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
              <select name="employment_type" value={formData.employment_type} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Intern</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Annual Salary (₹)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="number" name="salary" value={formData.salary} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="e.g. 600000" min="0" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reports To (Manager)</label>
              <select name="reports_to" value={formData.reports_to} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                <option value="">Select Manager</option>
                {managers.map(mgr => <option key={mgr.id} value={mgr.id}>{mgr.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span>Address Information</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" name="address" value={formData.address} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Enter street address" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="City" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="State" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
              <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Postal Code" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input type="text" name="country" value={formData.country} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Country" />
            </div>
          </div>
        </div>

        {/* Submit row (mobile-friendly) */}
        <div className="flex items-center justify-end space-x-3 pb-6">
          <Link to="/admin/employees"
            className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 flex items-center space-x-2 shadow-lg shadow-blue-500/20">
            {loading ? (
              <><Loader className="h-4 w-4 animate-spin" /><span>Creating...</span></>
            ) : (
              <><Save className="h-4 w-4" /><span>Create Employee</span></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;