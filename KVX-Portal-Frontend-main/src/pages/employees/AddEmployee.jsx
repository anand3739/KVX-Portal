import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { 
  User, Mail, Phone, Briefcase, Calendar, MapPin, DollarSign,
  Upload, X, Save, ArrowLeft, Loader, Eye, EyeOff, Copy, CheckCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { mockCreateEmployee } from "../../services/mockAuthService";
import { validateFullName, validateEmail, validatePhone } from "../../utils";

const AddEmployee = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHrPath = location.pathname.startsWith("/admin/hr");
  const prefix = isHrPath ? "/admin/hr" : (location.pathname.startsWith("/hr") ? "/hr" : "/admin");
  const backUrl = isHrPath ? "/admin/hr" : `${prefix}/employees`;
  const [loading, setLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department_id: isHrPath ? "Human Resources" : "",
    position: isHrPath ? "HR Specialist" : "",
    join_date: new Date().toISOString().split('T')[0],
    salary: "",
    employment_type: "full-time",
    address: "",
    city: "",
    state: "",
    country: "India",
    postal_code: ""
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

  const handleSubmit = async (e) => {
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

    // Prepare data for API
    const employeeData = {
      email: formData.email.trim(),
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      role: isHrPath ? "hr" : "employee",
      phone: formData.phone || null,
      joining_date: formData.join_date,
      department_name: formData.department_id || null,
      position: formData.position || null,
      employment_type: formData.employment_type,
      salary: formData.salary ? parseFloat(formData.salary) : null,
      address: formData.address || null,
      city: formData.city || null,
      state: formData.state || null,
      country: formData.country,
      postal_code: formData.postal_code || null
    };

    console.log("📤 Creating employee:", employeeData);

    try {
      const response = mockCreateEmployee(employeeData);
      setGeneratedCredentials({
        employee_id: response.employee.employee_id,
        email: response.employee.email,
        temp_password: response.temp_password || "Welcome@123"
      });
      setShowCredentials(true);
      toast.success(isHrPath ? "HR Manager created successfully!" : "Employee created successfully!");
    } catch (error) {
      console.error("Creation error:", error);
      toast.error(error.message || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  // Success Screen
  if (showCredentials && generatedCredentials) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{isHrPath ? "HR Manager Created!" : "Employee Created!"}</h2>
            <p className="text-gray-500 mt-2">Login credentials generated</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
            <div>
              <label className="text-xs text-gray-500">Employee ID</label>
              <div className="flex items-center justify-between mt-1">
                <code className="bg-white px-3 py-2 rounded border text-sm font-mono">
                  {generatedCredentials.employee_id}
                </code>
                <button onClick={() => copyToClipboard(generatedCredentials.employee_id)} className="p-2 hover:bg-gray-200 rounded">
                  <Copy className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Email</label>
              <div className="flex items-center justify-between mt-1">
                <code className="bg-white px-3 py-2 rounded border text-sm">{generatedCredentials.email}</code>
                <button onClick={() => copyToClipboard(generatedCredentials.email)} className="p-2 hover:bg-gray-200 rounded">
                  <Copy className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Temporary Password</label>
              <div className="flex items-center justify-between mt-1">
                <code className="bg-white px-3 py-2 rounded border text-sm font-mono">
                  {showPassword ? generatedCredentials.temp_password : '••••••••'}
                </code>
                <div className="flex gap-1">
                  <button onClick={() => setShowPassword(!showPassword)} className="p-2 hover:bg-gray-200 rounded">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button onClick={() => copyToClipboard(generatedCredentials.temp_password)} className="p-2 hover:bg-gray-200 rounded">
                    <Copy className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button onClick={() => navigate(backUrl)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {isHrPath ? "Back to HR List" : "Back to Employee List"}
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
          <Link to={backUrl} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isHrPath ? "Add New HR Manager" : "Add New Employee"}</h1>
            <p className="text-gray-500 mt-1">{isHrPath ? "Create a new HR record" : "Create a new employee record"}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to={backUrl} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
          <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 flex items-center gap-2">
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? "Creating..." : (isHrPath ? "Create HR Manager" : "Create Employee")}
          </button>
        </div>
      </div>

      <form className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Employment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select name="department_id" value={formData.department_id} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg bg-white">
                <option value="">Select Department</option>
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" name="position" value={formData.position} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="date" name="join_date" value={formData.join_date} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
              <select name="employment_type" value={formData.employment_type} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg bg-white">
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salary</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="number" name="salary" value={formData.salary} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" placeholder="Annual salary" />
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Address Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
              </div>
            </div>
            <div><input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full px-4 py-2 border rounded-lg" /></div>
            <div><input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" className="w-full px-4 py-2 border rounded-lg" /></div>
            <div><input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} placeholder="Postal Code" className="w-full px-4 py-2 border rounded-lg" /></div>
            <div><input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Country" className="w-full px-4 py-2 border rounded-lg" /></div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;