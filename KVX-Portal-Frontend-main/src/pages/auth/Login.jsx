import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import { mockLogin } from "../../services/mockAuthService";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Shield,
  Users,
  Clock,
  DollarSign,
  ArrowRight,
  Building2
} from "lucide-react";

const Login = () => {
  const logoUrl = localStorage.getItem("companyLogo") || "/images/kravix.png";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = mockLogin(email, password);

      dispatch(setCredentials({ user: data.user, token: data.token }));

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      toast.success(`Welcome back, ${data.user.first_name}!`);

      const role = data.user.role;
      switch (role) {
        case "admin":    navigate("/admin/dashboard");    break;
        case "hr":       navigate("/hr/dashboard");       break;
        case "ceo":      navigate("/ceo/dashboard");      break;
        case "employee": navigate("/employee/dashboard"); break;
        default:         navigate("/employee/dashboard");
      }
    } catch (error) {
      toast.error(error.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role) => {
    const credentials = {
      admin:    { email: "admin@kravix.com",    password: "Admin@123" },
      hr:       { email: "hr@kravix.com",       password: "HR@123"    },
      employee: { email: "employee@kravix.com", password: "Emp@123"   },
      ceo:      { email: "ceo@kravix.com",      password: "CEO@123"   }
    };
    if (credentials[role]) {
      setEmail(credentials[role].email);
      setPassword(credentials[role].password);
      toast.success(`Demo credentials filled for ${role}`);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0a0f1e] via-[#0f1a2f] to-[#1a2b3f] flex-col justify-between p-16 relative overflow-hidden">
        <div className="relative z-10">
          <div className="mb-16">
            <img src={logoUrl} alt="KRAVIX TECH" className="h-16 w-auto object-contain" />
          </div>
          <div className="space-y-8 max-w-lg">
            <div className="space-y-3">
              <p className="text-sm font-medium tracking-[0.2em] text-blue-300/60 uppercase">Welcome to</p>
              <p className="text-4xl text-white/90 font-light leading-tight">
                You will be testing one of <span className="font-semibold text-white">KRAVIX's</span> core applications:
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  KRAVIX<span className="text-white/50 font-light">portal</span>
                </span>
                <span className="text-lg text-blue-300/50 font-medium">™</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-4 py-1.5 bg-white/5 backdrop-blur-sm rounded-full text-xs text-blue-200 border border-white/10">Enterprise Edition</span>
                <span className="px-4 py-1.5 bg-white/5 backdrop-blur-sm rounded-full text-xs text-blue-200 border border-white/10">v2.0.1</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <Users className="h-5 w-5 text-blue-400 mb-2" />
                <p className="text-xs text-blue-300/60">Employee Mgmt</p>
                <p className="text-xl font-semibold text-white">250+</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <Clock className="h-5 w-5 text-purple-400 mb-2" />
                <p className="text-xs text-blue-300/60">Attendance</p>
                <p className="text-xl font-semibold text-white">99.9%</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <DollarSign className="h-5 w-5 text-pink-400 mb-2" />
                <p className="text-xs text-blue-300/60">Payroll</p>
                <p className="text-xl font-semibold text-white">Secure</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4 text-xs">
            <span className="text-white/40">© 2025 KRAVIX TECH</span>
            <span className="w-1 h-1 bg-white/20 rounded-full"></span>
            <span className="text-white/40">All rights reserved</span>
            <span className="w-1 h-1 bg-white/20 rounded-full"></span>
            <span className="text-white/40">Enterprise Portal</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10 text-center">
            <img src={logoUrl} alt="KRAVIX TECH" className="h-12 w-auto mx-auto mb-4" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-light text-gray-900 mb-2">Sign in to KRAVIX™</h2>
            <p className="text-sm text-gray-500">Access your personalized enterprise dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200"
                  placeholder="admin@kravix.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 border-gray-300 rounded text-blue-600" />
                <span className="ml-2 text-xs text-gray-500">Remember me</span>
              </label>
              <button type="button" onClick={() => navigate("/forgot-password")} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Forgot password?</button>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25">
              {loading
                ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                : <><span>Sign In</span><ArrowRight className="h-4 w-4" /></>
              }
            </button>
          </form>

          {/* Demo Access */}
          <div className="mt-10">
            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center"><span className="px-4 bg-white text-xs font-medium text-gray-400 uppercase">Demo Access</span></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => fillDemoCredentials('admin')} className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-blue-200 text-left transition-colors">
                <div className="flex items-center space-x-2 mb-2"><div className="h-6 w-6 bg-blue-100 rounded-lg flex items-center justify-center"><Users className="h-3 w-3 text-blue-600" /></div><span className="text-sm font-medium text-gray-900">Admin</span></div>
                <p className="text-xs text-gray-500">admin@kravix.com</p>
              </button>
              <button onClick={() => fillDemoCredentials('hr')} className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-purple-200 text-left transition-colors">
                <div className="flex items-center space-x-2 mb-2"><div className="h-6 w-6 bg-purple-100 rounded-lg flex items-center justify-center"><Building2 className="h-3 w-3 text-purple-600" /></div><span className="text-sm font-medium text-gray-900">HR</span></div>
                <p className="text-xs text-gray-500">hr@kravix.com</p>
              </button>
              <button onClick={() => fillDemoCredentials('employee')} className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-green-200 text-left transition-colors">
                <div className="flex items-center space-x-2 mb-2"><div className="h-6 w-6 bg-green-100 rounded-lg flex items-center justify-center"><Clock className="h-3 w-3 text-green-600" /></div><span className="text-sm font-medium text-gray-900">Employee</span></div>
                <p className="text-xs text-gray-500">employee@kravix.com</p>
              </button>
              <button onClick={() => fillDemoCredentials('ceo')} className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-amber-200 text-left transition-colors">
                <div className="flex items-center space-x-2 mb-2"><div className="h-6 w-6 bg-amber-100 rounded-lg flex items-center justify-center"><DollarSign className="h-3 w-3 text-amber-600" /></div><span className="text-sm font-medium text-gray-900">CEO</span></div>
                <p className="text-xs text-gray-500">ceo@kravix.com</p>
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-gray-400">
            <Shield className="h-3 w-3" />
            <span>Secured by enterprise-grade encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;