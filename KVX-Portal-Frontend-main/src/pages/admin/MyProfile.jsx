import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Edit2,
  Save,
  Camera,
  Award,
  Loader,
  AlertCircle,
  Lock,
  Shield,
  X
} from "lucide-react";
import { authService } from "../../services/authService";
import { documentService } from "../../services/documentService";
import toast from "react-hot-toast";

const MyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [passwordData, setPasswordData] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const tabs = [
    { id: "personal", name: "Personal Info", icon: User },
    { id: "employment", name: "Employment", icon: Briefcase },
    { id: "skills", name: "Skills", icon: Award },
    { id: "emergency", name: "Emergency Contact", icon: Phone },
    { id: "security", name: "Security", icon: Shield }
  ];

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const storedUser = authService.getStoredUser();
      let response;
      try {
        response = await authService.getCurrentUser();
      } catch (err) {
        response = storedUser ? { user: storedUser } : null;
      }
      const user = response?.user || response;

      if (user) {
        setProfile(user);
        if (user.profile_picture_url) setProfileImage(user.profile_picture_url);
        if (user.banner_url) setBannerImage(user.banner_url);
      } else {
        setError("Unable to load profile data. Please try again.");
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError(err.message || "Failed to load profile data");
      const storedUser = authService.getStoredUser();
      if (storedUser) {
        setProfile(storedUser);
        toast.warning("Using cached profile data. Some information may be outdated.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await authService.updateProfile(profile);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
      fetchUserProfile();
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const getUploadUrl = (result) => {
    const data = result?.data || result;
    return (
      data?.profile_picture_url ||
      data?.banner_url ||
      data?.file_url ||
      data?.fileUrl ||
      data?.url ||
      data?.path ||
      data?.location ||
      data?.data?.file_url ||
      data?.data?.fileUrl ||
      data?.data?.url ||
      null
    );
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    e.target.value = null;
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setUploadingPhoto(true);
    try {
      const response = await documentService.uploadProfilePhoto(file, "profile");
      const profilePicUrl = getUploadUrl(response);
      if (!profilePicUrl) throw new Error("Upload returned no URL");
      const updatedProfile = { ...profile, profile_picture_url: profilePicUrl };
      setProfile(updatedProfile);
      setProfileImage(profilePicUrl);
      await authService.updateProfile(updatedProfile);
      toast.success("Profile photo updated!");
    } catch (err) {
      toast.error(err.message || "Failed to upload photo");
      console.error(err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    e.target.value = null;
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setUploadingBanner(true);
    try {
      const response = await documentService.uploadProfilePhoto(file, "banner");
      const bannerUrl = getUploadUrl(response);
      if (!bannerUrl) throw new Error("Upload returned no URL");
      const updatedProfile = { ...profile, banner_url: bannerUrl };
      setProfile(updatedProfile);
      setBannerImage(bannerUrl);
      await authService.updateProfile(updatedProfile);
      toast.success("Banner photo updated!");
    } catch (err) {
      toast.error(err.message || "Failed to upload banner image");
      console.error(err);
    } finally {
      setUploadingBanner(false);
    }
  };

  const triggerBannerInput = () => bannerInputRef.current?.click();

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdatePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("New passwords do not match!");
      return;
    }
    if (passwordData.new_password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setChangingPassword(true);
    try {
      await authService.changePassword(passwordData.current_password, passwordData.new_password);
      toast.success("Password changed successfully!");
      setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const getInitials = () => {
    if (!profile) return "U";
    const firstName = profile.first_name || profile.name?.split(" ")[0] || "";
    const lastName = profile.last_name || profile.name?.split(" ")[1] || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";
  };

  const getFullName = () => {
    if (!profile) return "User";
    const firstName = profile.first_name || profile.name?.split(" ")[0] || "";
    const lastName = profile.last_name || profile.name?.split(" ")[1] || "";
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) return fullName;
    if (profile.email) return profile.email.split("@")[0];
    return "User";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <Loader className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-slate-100">
        <div className="rounded-3xl bg-white p-8 shadow-soft text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Unable to load profile</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <div className="flex justify-center gap-3">
            <button onClick={fetchUserProfile} className="rounded-3xl bg-indigo-600 px-5 py-3 text-white btn-3d">Retry</button>
            <button onClick={() => window.location.href = "/login"} className="rounded-3xl border border-slate-200 px-5 py-3 text-slate-700 hover:bg-slate-50">Login</button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="rounded-3xl bg-white p-8 shadow-soft text-center">
          <User className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Profile not found</h2>
          <p className="text-slate-600 mb-6">Please contact your administrator to complete your profile.</p>
          <button onClick={fetchUserProfile} className="rounded-3xl bg-indigo-600 px-5 py-3 text-white btn-3d">Reload</button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950/5 px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.20),_transparent_45%),radial-gradient(circle_at_top_right,_rgba(132,204,22,0.12),_transparent_38%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(circle_at_bottom,_rgba(99,102,241,0.18),_transparent_55%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.12),_transparent_40%)]" />
      <div className="mx-auto max-w-[1400px] space-y-8 relative">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-900 via-indigo-950 to-sky-900 p-8 shadow-[0_32px_90px_-20px_rgba(15,23,42,0.7)] tilt-3d animate-fadeIn text-white">
          {bannerImage && (
            <div className="absolute inset-0 overflow-hidden">
              <img src={bannerImage} alt="Profile banner" className="h-full w-full object-cover object-center opacity-65" />
              <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-2xl" />
            </div>
          )}
          <div className="absolute -right-24 -top-24 h-44 w-44 rounded-full bg-cyan-400/10 blur-[80px]" />
          <div className="absolute -left-24 bottom-[-44px] h-56 w-56 rounded-full bg-fuchsia-400/10 blur-[90px]" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/30 to-transparent" />
          <div className="relative grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-sky-100/80">Profile Center</p>
              <h1 className="text-4xl font-bold leading-tight text-white drop-shadow-[0_2px_20px_rgba(255,255,255,0.15)]">Your profile and account settings in one place.</h1>
              <p className="max-w-2xl text-sm text-slate-100/90">Update personal details, manage employment information, edit security preferences, and keep everything consistent with a modern 3D dashboard design.</p>
            </div>
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-soft backdrop-blur-xl glass-panel">
              <div className="relative flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-[2.5rem] border border-white/15 bg-white/10 shadow-[0_18px_60px_-30px_rgba(255,255,255,0.9)] backdrop-blur-xl">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">{getInitials()}</div>
                  )}
                  <button type="button" onClick={triggerFileInput} className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 rounded-full bg-white p-3 text-indigo-700 shadow-2xl transition hover:bg-slate-100">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-sky-100/75">Welcome back</p>
                  <p className="text-2xl font-semibold">{getFullName()}</p>
                </div>
              </div>
              <div className="mt-6 space-y-3 text-sm text-slate-100/85">
                <p><span className="font-semibold">Role:</span> {profile.role || 'Employee'}</p>
                <p><span className="font-semibold">Department:</span> {profile.department_name || 'N/A'}</p>
                <p><span className="font-semibold">Employee ID:</span> {profile.employee_id || 'N/A'}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" onClick={triggerBannerInput} disabled={uploadingBanner} className="inline-flex items-center gap-2 rounded-3xl bg-white/10 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(255,255,255,0.85)] transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60">
                  {uploadingBanner ? <Loader className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  {uploadingBanner ? 'Uploading...' : 'Update Banner'}
                </button>
                <button type="button" onClick={triggerFileInput} disabled={uploadingPhoto} className="inline-flex items-center gap-2 rounded-3xl bg-white/10 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(255,255,255,0.85)] transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60">
                  {uploadingPhoto ? <Loader className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  {uploadingPhoto ? 'Uploading...' : 'Update Avatar'}
                </button>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={() => setIsEditing(prev => !prev)} className="inline-flex items-center gap-2 rounded-3xl bg-indigo-600 px-5 py-3 text-white btn-3d shadow-soft">
                  {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
                {isEditing && (
                  <button type="button" onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-5 py-3 text-white btn-3d shadow-soft disabled:opacity-60">
                    {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                  </button>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                      <Icon className="h-4 w-4" />
                      {tab.name}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 space-y-6">
                {activeTab === 'personal' && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 p-5 shadow-sm">
                      <label className="block text-sm font-medium text-slate-600 mb-2">First Name</label>
                      {isEditing ? (
                        <input type="text" value={profile.first_name || ''} onChange={(e) => handleInputChange('first_name', e.target.value)} className="w-full rounded-3xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="First name" />
                      ) : (
                        <p className="text-slate-900">{profile.first_name || 'Not set'}</p>
                      )}
                    </div>

                    <div className="rounded-3xl border border-slate-200 p-5 shadow-sm">
                      <label className="block text-sm font-medium text-slate-600 mb-2">Last Name</label>
                      {isEditing ? (
                        <input type="text" value={profile.last_name || ''} onChange={(e) => handleInputChange('last_name', e.target.value)} className="w-full rounded-3xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Last name" />
                      ) : (
                        <p className="text-slate-900">{profile.last_name || 'Not set'}</p>
                      )}
                    </div>

                    <div className="rounded-3xl border border-slate-200 p-5 shadow-sm">
                      <label className="block text-sm font-medium text-slate-600 mb-2">Email Address</label>
                      <div className="flex items-center gap-2 text-slate-900">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span>{profile.email || 'Not set'}</span>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 p-5 shadow-sm">
                      <label className="block text-sm font-medium text-slate-600 mb-2">Phone</label>
                      {isEditing ? (
                        <input type="tel" value={profile.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} className="w-full rounded-3xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Phone number" />
                      ) : (
                        <div className="flex items-center gap-2 text-slate-900">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span>{profile.phone || 'Not set'}</span>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2 rounded-3xl border border-slate-200 p-5 shadow-sm">
                      <label className="block text-sm font-medium text-slate-600 mb-2">Address</label>
                      {isEditing ? (
                        <input type="text" value={profile.address || ''} onChange={(e) => handleInputChange('address', e.target.value)} className="w-full rounded-3xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Address" />
                      ) : (
                        <div className="flex items-center gap-2 text-slate-900">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span>{profile.address || 'Not set'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'employment' && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 p-5 shadow-sm">
                      <p className="text-sm text-slate-500 mb-2">Position</p>
                      <p className="text-slate-900">{profile.position || 'Not set'}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 p-5 shadow-sm">
                      <p className="text-sm text-slate-500 mb-2">Department</p>
                      <p className="text-slate-900">{profile.department_name || 'Not set'}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 p-5 shadow-sm">
                      <p className="text-sm text-slate-500 mb-2">Employee ID</p>
                      <p className="text-slate-900">{profile.employee_id || 'N/A'}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 p-5 shadow-sm">
                      <p className="text-sm text-slate-500 mb-2">Employment Type</p>
                      <p className="text-slate-900">{profile.employment_type || 'Not specified'}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 p-5 shadow-sm">
                      <p className="text-sm text-slate-500 mb-2">Joined</p>
                      <p className="text-slate-900">{profile.join_date ? new Date(profile.join_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 p-5 shadow-sm">
                      <p className="text-sm text-slate-500 mb-2">Status</p>
                      <p className="text-slate-900 capitalize">{profile.status || 'N/A'}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'skills' && (
                  <div className="rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4 text-slate-900">
                      <Award className="h-5 w-5 text-indigo-600" />
                      <h3 className="text-lg font-semibold">Skills</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {profile.skills && profile.skills.length > 0 ? profile.skills.map(skill => (
                        <span key={skill} className="rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm text-indigo-700">{skill}</span>
                      )) : (
                        <p className="text-slate-500">No skills saved yet.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'emergency' && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 p-5 shadow-sm">
                      <p className="text-sm text-slate-500 mb-2">Contact Name</p>
                      <p className="text-slate-900">{profile.emergency_contact?.name || 'Not set'}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 p-5 shadow-sm">
                      <p className="text-sm text-slate-500 mb-2">Relationship</p>
                      <p className="text-slate-900">{profile.emergency_contact?.relationship || 'Not set'}</p>
                    </div>
                    <div className="md:col-span-2 rounded-3xl border border-slate-200 p-5 shadow-sm">
                      <p className="text-sm text-slate-500 mb-2">Phone</p>
                      <p className="text-slate-900">{profile.emergency_contact?.phone || 'Not set'}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-200 p-6 shadow-sm">
                      <div className="flex items-center gap-3 mb-4 text-slate-900">
                        <Shield className="h-5 w-5 text-indigo-600" />
                        <h3 className="text-lg font-semibold">Security</h3>
                      </div>
                      <div className="grid gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-2">Current Password</label>
                          <input type="password" value={passwordData.current_password} onChange={(e) => handlePasswordChange('current_password', e.target.value)} className="w-full rounded-3xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-2">New Password</label>
                          <input type="password" value={passwordData.new_password} onChange={(e) => handlePasswordChange('new_password', e.target.value)} className="w-full rounded-3xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-2">Confirm Password</label>
                          <input type="password" value={passwordData.confirm_password} onChange={(e) => handlePasswordChange('confirm_password', e.target.value)} className="w-full rounded-3xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                        </div>
                      </div>
                      <button type="button" onClick={handleUpdatePassword} disabled={changingPassword} className="mt-4 inline-flex items-center gap-2 rounded-3xl bg-indigo-600 px-5 py-3 text-white btn-3d shadow-soft disabled:opacity-60">
                        {changingPassword ? <Loader className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                        Update Password
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="rounded-[2rem] bg-slate-950/95 p-6 shadow-[0_32px_80px_-30px_rgba(15,23,42,0.55)] tilt-3d animate-floatIn border border-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Profile preview</p>
                <h3 className="text-xl font-semibold text-white">Quick summary</h3>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/75 backdrop-blur-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" /> Live
              </span>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_-28px_rgba(255,255,255,0.35)] backdrop-blur-xl">
              <div className="flex items-center gap-4 mb-5">
                <div className="h-16 w-16 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-indigo-500 to-sky-500 shadow-[0_15px_40px_-26px_rgba(59,130,246,0.75)] flex items-center justify-center text-white text-2xl font-bold">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    getInitials()
                  )}
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">{getFullName()}</p>
                  <p className="text-sm text-slate-300">{profile.position || 'Position not set'}</p>
                </div>
              </div>
              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-cyan-300" />
                  <span>{profile.email || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-cyan-300" />
                  <span>{profile.phone || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-cyan-300" />
                  <span>{profile.address || 'Not set'}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <p className="text-sm font-semibold text-slate-300 mb-3">Quick actions</p>
              <div className="grid gap-3">
                <button onClick={triggerFileInput} className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-left text-sm font-semibold text-white btn-3d hover:bg-slate-800">Upload profile photo</button>
                <button onClick={triggerBannerInput} className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-left text-sm font-semibold text-white btn-3d hover:bg-slate-800">Update banner image</button>
                <button onClick={() => setActiveTab('security')} className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-left text-sm font-semibold text-white btn-3d hover:bg-slate-800">Review security preferences</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
      <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
    </div>
  );
};

export default MyProfile;
