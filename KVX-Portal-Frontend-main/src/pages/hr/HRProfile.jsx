import { useState, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Edit2,
  Save,
  Camera,
  X,
  Image,
  CheckCircle,
  Star,
  Clock,
  Award,
  Shield,
  TrendingUp,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";

const HRProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "Jane",
    lastName: "Smith",
    email: "hr@kravix.com",
    phone: "+1 (555) 987-6543",
    position: "HR Manager",
    department: "Human Resources",
    employeeId: "HR-001",
    joinDate: "2022-06-15",
    address: "456 Business Ave",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    bio: "Passionate HR professional with 8+ years of experience in talent acquisition, employee relations, and organizational development. Champion of workplace culture and employee well-being.",
    linkedin: "linkedin.com/in/janesmith-hr",
    twitter: "@janesmith_hr",
    skills: ["Talent Acquisition", "Employee Relations", "Payroll Management", "HRIS Systems", "Training & Development"],
  });

  // Profile picture state
  const [pfpSrc, setPfpSrc] = useState(null);
  const pfpRef = useRef(null);

  // Banner state
  const [bannerSrc, setBannerSrc] = useState(null);
  const bannerRef = useRef(null);

  const handlePfpChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPfpSrc(URL.createObjectURL(file));
      toast.success("Profile picture updated!");
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerSrc(URL.createObjectURL(file));
      toast.success("Banner updated!");
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profile saved successfully!");
  };

  const handleCancel = () => {
    setIsEditing(false);
    toast("Changes discarded", { icon: "↩️" });
  };

  const stats = [
    { icon: Clock,     label: "Years of Experience", value: "8 yrs",  color: "#6366f1" },
    { icon: Star,      label: "Performance Score",    value: "4.8/5",  color: "#f59e0b" },
    { icon: Calendar,  label: "Leave Balance",        value: "12 days",color: "#10b981" },
    { icon: Award,     label: "Certifications",       value: "5",      color: "#06b6d4" },
    { icon: TrendingUp,label: "Team Members",         value: "38",     color: "#8b5cf6" },
    { icon: Shield,    label: "Compliance Score",     value: "98%",    color: "#ec4899" },
  ];

  const Field = ({ label, fieldKey, type = "text", readOnly = false, fullWidth = false }) => (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748b" }}>
        {label}
      </label>
      {isEditing && !readOnly ? (
        <input
          type={type}
          value={profile[fieldKey] || ""}
          onChange={(e) => setProfile({ ...profile, [fieldKey]: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.3)",
            color: "#1e293b",
          }}
          onFocus={e => e.currentTarget.style.border = "1px solid rgba(99,102,241,0.6)"}
          onBlur={e => e.currentTarget.style.border = "1px solid rgba(99,102,241,0.3)"}
        />
      ) : (
        <p className="text-sm font-medium py-2.5" style={{ color: "#1e293b" }}>
          {profile[fieldKey] || <span className="text-slate-400 italic">Not set</span>}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6 pb-10">

      {/* ═══════════════ BANNER ═══════════════ */}
      <div className="relative rounded-3xl overflow-hidden" style={{ height: "220px" }}>
        {/* Banner background */}
        {bannerSrc ? (
          <img src={bannerSrc} alt="Profile banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full"
            style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #1e3a5f 65%, #0c4a6e 100%)" }}>
            {/* Decorative blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute w-56 h-56 rounded-full -top-16 -right-16 opacity-25"
                style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />
              <div className="absolute w-40 h-40 rounded-full bottom-0 left-32 opacity-20"
                style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />
              <div className="absolute w-28 h-28 rounded-full top-8 left-1/3 opacity-15"
                style={{ background: "radial-gradient(circle, #ec4899, transparent)" }} />
            </div>
            {/* Pattern dots */}
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          </div>
        )}

        {/* Change Banner button */}
        {isEditing && (
          <button
            onClick={() => bannerRef.current?.click()}
            className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "rgba(0,0,0,0.5)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}>
            <Image className="h-4 w-4" /> Change Banner
          </button>
        )}
        <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />

        {/* Avatar — overlapping banner */}
        <div className="absolute -bottom-14 left-8">
          <div className="relative">
            {/* Avatar circle */}
            <div className="w-28 h-28 rounded-2xl overflow-hidden ring-4 ring-white shadow-2xl"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              {pfpSrc ? (
                <img src={pfpSrc} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-4xl font-black">
                  {profile.firstName[0]}{profile.lastName[0]}
                </div>
              )}
            </div>
            {/* Camera icon */}
            {isEditing && (
              <button
                onClick={() => pfpRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-all"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "2px solid #fff" }}
                title="Change profile picture">
                <Camera className="h-4 w-4 text-white" />
              </button>
            )}
            {/* Online dot */}
            {!isEditing && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-white" />
            )}
            <input ref={pfpRef} type="file" accept="image/*" className="hidden" onChange={handlePfpChange} />
          </div>
        </div>
      </div>

      {/* ═══════════════ NAME + ACTIONS STRIP ═══════════════ */}
      <div className="flex items-end justify-between pt-10 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black" style={{ color: "#0f172a" }}>
              {profile.firstName} {profile.lastName}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: "rgba(16,185,129,0.12)", color: "#059669", border: "1px solid rgba(16,185,129,0.25)" }}>
              ● Active
            </span>
          </div>
          <p className="text-base font-semibold mt-0.5" style={{ color: "#6366f1" }}>{profile.position}</p>
          <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>{profile.department} · ID: {profile.employeeId}</p>
        </div>

        <div className="flex items-center gap-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => toast.success("Downloading profile PDF…")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }}>
                <Upload className="h-4 w-4" /> Export
              </button>
              <button
                id="edit-profile-btn"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 15px rgba(99,102,241,0.35)" }}>
                <Edit2 className="h-4 w-4" /> Edit Profile
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }}>
                <X className="h-4 w-4" /> Cancel
              </button>
              <button
                id="save-profile-btn"
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 15px rgba(16,185,129,0.35)" }}>
                <Save className="h-4 w-4" /> Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* ═══════════════ STATS STRIP ═══════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="rounded-2xl p-4 text-center transition-all hover:scale-[1.02]"
              style={{ background: "#fff", border: `1px solid ${s.color}20`, boxShadow: `0 4px 15px ${s.color}08` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ background: `${s.color}15` }}>
                <Icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
              <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-tight">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* ═══════════════ MAIN CONTENT GRID ═══════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Personal + Contact + Work info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Bio */}
          <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <h2 className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: "#0f172a" }}>
              <User className="h-4 w-4" style={{ color: "#6366f1" }} /> About Me
            </h2>
            {isEditing ? (
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none transition-all"
                style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.3)", color: "#1e293b" }}
              />
            ) : (
              <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{profile.bio}</p>
            )}
          </div>

          {/* Personal Info */}
          <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: "#0f172a" }}>
              <User className="h-4 w-4" style={{ color: "#6366f1" }} /> Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="First Name"   fieldKey="firstName" />
              <Field label="Last Name"    fieldKey="lastName" />
              <Field label="Employee ID"  fieldKey="employeeId"  readOnly />
              <Field label="Join Date"    fieldKey="joinDate"    type="date" />
            </div>
          </div>

          {/* Contact Details */}
          <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: "#0f172a" }}>
              <Mail className="h-4 w-4" style={{ color: "#06b6d4" }} /> Contact Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Email Address" fieldKey="email"   readOnly />
              <Field label="Phone Number"  fieldKey="phone"   type="tel" />
              <Field label="LinkedIn"      fieldKey="linkedin" />
              <Field label="Twitter / X"   fieldKey="twitter" />
              <Field label="Address"       fieldKey="address" fullWidth />
              <Field label="City"   fieldKey="city" />
              <Field label="State"  fieldKey="state" />
              <Field label="ZIP Code" fieldKey="zipCode" />
            </div>
          </div>

          {/* Work Info */}
          <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: "#0f172a" }}>
              <Briefcase className="h-4 w-4" style={{ color: "#10b981" }} /> Work Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Position"   fieldKey="position"   readOnly />
              <Field label="Department" fieldKey="department" readOnly />
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">

          {/* Skills */}
          <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: "#0f172a" }}>
              <Star className="h-4 w-4" style={{ color: "#f59e0b" }} /> Skills & Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, i) => {
                const colors = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"];
                const c = colors[i % colors.length];
                return (
                  <span key={i} className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: `${c}12`, color: c, border: `1px solid ${c}25` }}>
                    {skill}
                  </span>
                );
              })}
            </div>
            {isEditing && (
              <p className="text-xs text-slate-400 mt-3">Contact admin to update skills</p>
            )}
          </div>

          {/* Account Status */}
          <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: "#0f172a" }}>
              <Shield className="h-4 w-4" style={{ color: "#10b981" }} /> Account Status
            </h2>
            <div className="space-y-3">
              {[
                { label: "Account Status",    value: "Active",    color: "#10b981" },
                { label: "Role",              value: "HR Manager", color: "#6366f1" },
                { label: "2FA Enabled",       value: "Yes",       color: "#06b6d4" },
                { label: "Last Login",        value: "Today, 9:12 AM", color: "#f59e0b" },
                { label: "Profile Visibility",value: "Organization", color: "#8b5cf6" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{item.label}</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: `${item.color}12`, color: item.color }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: "#0f172a" }}>
              <Award className="h-4 w-4" style={{ color: "#ec4899" }} /> Certifications
            </h2>
            <div className="space-y-3">
              {[
                { name: "SHRM-CP", year: "2023", color: "#6366f1" },
                { name: "PHR Certified", year: "2022", color: "#10b981" },
                { name: "HRIS Specialist", year: "2021", color: "#f59e0b" },
                { name: "Payroll Compliance", year: "2020", color: "#06b6d4" },
                { name: "Talent Acquisition Pro", year: "2019", color: "#ec4899" },
              ].map((cert, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${cert.color}15` }}>
                    <CheckCircle className="h-4 w-4" style={{ color: cert.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#0f172a" }}>{cert.name}</p>
                    <p className="text-xs text-slate-400">Issued {cert.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRProfile;