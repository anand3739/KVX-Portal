import { useState, useEffect } from "react";
import { 
  AlarmClock, Bell, Mail, MessageSquare, Plus, Trash2, Edit2, 
  Play, RefreshCw, Clock, CheckCircle2, AlertTriangle, Calendar,
  ArrowRight, Search, Sparkles
} from "lucide-react";
import { mockGetCurrentUser } from "../../services/mockAuthService";
import toast from "react-hot-toast";

const EventReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all | pending | triggered
  const [timeTicker, setTimeTicker] = useState(Date.now());

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [remindOffset, setRemindOffset] = useState("5"); // default 5 mins
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");

  // Load user profile & reminders
  useEffect(() => {
    try {
      const { user } = mockGetCurrentUser();
      setCurrentUser(user);
      if (user) {
        setEmail(user.email || "employee@kravix.com");
        setWhatsapp(user.phone || "+91 98765 43212");
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
    }
    loadReminders();
  }, []);

  // Set up ticker to update active countdown timers in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeTicker(Date.now());
    }, 10000); // Update every 10 seconds is plenty for minute-level accuracy
    return () => clearInterval(interval);
  }, []);

  const loadReminders = () => {
    const stored = localStorage.getItem("kvx_portal_event_reminders");
    if (stored) {
      setReminders(JSON.parse(stored));
    } else {
      // Mock initial reminders if empty
      const now = new Date();
      const mockInit = [
        {
          id: 1,
          title: "Sprint Review Meeting",
          eventTime: new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16), // 1 hr from now
          remindOffset: 15,
          notifyEmail: true,
          email: "employee@kravix.com",
          notifyWhatsApp: true,
          whatsapp: "+91 98765 43212",
          description: "Demo of completed Q3 sprints with the senior leadership team.",
          triggered: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: "Code Review with Senior Dev",
          eventTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString().slice(0, 16), // 2 hrs ago
          remindOffset: 5,
          notifyEmail: true,
          email: "employee@kravix.com",
          notifyWhatsApp: false,
          whatsapp: "",
          description: "Going through PR #104 migration schema review.",
          triggered: true,
          createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString()
        }
      ];
      setReminders(mockInit);
      localStorage.setItem("kvx_portal_event_reminders", JSON.stringify(mockInit));
    }
  };

  const saveToStorage = (updatedList) => {
    setReminders(updatedList);
    localStorage.setItem("kvx_portal_event_reminders", JSON.stringify(updatedList));
  };

  const resetForm = () => {
    setTitle("");
    // Default event time to tomorrow at 9 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setEventTime(tomorrow.toISOString().slice(0, 16));
    setRemindOffset("5");
    setNotifyEmail(true);
    setNotifyWhatsApp(true);
    setEmail(currentUser?.email || "employee@kravix.com");
    setWhatsapp(currentUser?.phone || "+91 98765 43212");
    setDescription("");
    setIsEditing(false);
    setEditId(null);
  };

  // Pre-fill form when user first clicks dashboard or resets
  useEffect(() => {
    if (currentUser) {
      resetForm();
    }
  }, [currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter an event title");
      return;
    }
    if (!eventTime) {
      toast.error("Please specify event date and time");
      return;
    }
    if (notifyEmail && !email.trim()) {
      toast.error("Email address is required for email alerts");
      return;
    }
    if (notifyWhatsApp && !whatsapp.trim()) {
      toast.error("WhatsApp number is required for WhatsApp alerts");
      return;
    }

    const reminderPayload = {
      id: isEditing ? editId : Date.now(),
      title: title.trim(),
      eventTime,
      remindOffset: parseInt(remindOffset, 10),
      notifyEmail,
      email: notifyEmail ? email.trim() : "",
      notifyWhatsApp,
      whatsapp: notifyWhatsApp ? whatsapp.trim() : "",
      description: description.trim(),
      triggered: isEditing ? reminders.find(r => r.id === editId)?.triggered : false,
      createdAt: isEditing ? reminders.find(r => r.id === editId)?.createdAt : new Date().toISOString()
    };

    let updatedList;
    if (isEditing) {
      updatedList = reminders.map(r => r.id === editId ? reminderPayload : r);
      toast.success("Event alarm updated successfully!");
    } else {
      updatedList = [reminderPayload, ...reminders];
      toast.success("Event alarm scheduled!");
    }

    saveToStorage(updatedList);
    resetForm();
  };

  const handleEditClick = (reminder) => {
    setIsEditing(true);
    setEditId(reminder.id);
    setTitle(reminder.title);
    setEventTime(reminder.eventTime);
    setRemindOffset(String(reminder.remindOffset));
    setNotifyEmail(reminder.notifyEmail);
    setNotifyWhatsApp(reminder.notifyWhatsApp);
    setEmail(reminder.email || currentUser?.email || "");
    setWhatsapp(reminder.whatsapp || currentUser?.phone || "");
    setDescription(reminder.description || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this event alarm?")) {
      const updated = reminders.filter(r => r.id !== id);
      saveToStorage(updated);
      toast.success("Alarm deleted.");
      if (editId === id) {
        resetForm();
      }
    }
  };

  // Immediate manual test trigger of the alarm
  const handleTestTrigger = (reminder) => {
    toast.success("Launching simulation test trigger...");
    
    // Append to system notifications in localStorage
    try {
      const storedNotifs = localStorage.getItem("mock_notifications");
      let notifs = [];
      if (storedNotifs) {
        notifs = JSON.parse(storedNotifs);
      }
      
      const newNotif = {
        id: Date.now(),
        type: "event_reminder",
        title: `[TEST] Reminder: ${reminder.title}`,
        message: `TEST TRIGGER: Event starts in ${reminder.remindOffset} minutes! (Target: ${new Date(reminder.eventTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}).`,
        time: new Date().toISOString(),
        read: false,
      };

      notifs.unshift(newNotif);
      localStorage.setItem("mock_notifications", JSON.stringify(notifs));
    } catch (e) {
      console.error(e);
    }

    // Set local storage alarm as triggered in list
    const updated = reminders.map(r => r.id === reminder.id ? { ...r, triggered: true } : r);
    saveToStorage(updated);

    // Dispatch the custom window event to wake up the ReminderManager to show the trigger modal instantly!
    // We achieve this by mutating the localStorage list and having ReminderManager check. Or, we can just trigger window.open directly!
    // Since ReminderManager is checking localStorage every 5s, we can make it trigger immediately by writing `triggered: false` and setting eventTime to now.
    // Let's force load a temporary reminder that triggers in ReminderManager by creating an alert trigger in localStorage.
    const testAlert = {
      ...reminder,
      id: Date.now(),
      eventTime: new Date(Date.now() + 5000).toISOString(), // set time 5 seconds from now
      remindOffset: 0, // trigger at the time
      triggered: false
    };

    const currentReminders = JSON.parse(localStorage.getItem("kvx_portal_event_reminders") || "[]");
    localStorage.setItem("kvx_portal_event_reminders", JSON.stringify([testAlert, ...currentReminders]));
    toast.success("Trigger queued! Modal will fire in 3 seconds.");
  };

  const getCountdownString = (eventTimeStr, offsetMins) => {
    const eventTimeMs = new Date(eventTimeStr).getTime();
    const offsetMs = offsetMins * 60 * 1000;
    const targetTimeMs = eventTimeMs - offsetMs;
    const diff = targetTimeMs - timeTicker;

    if (diff <= 0) return "Triggering...";

    const totalSeconds = Math.floor(diff / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const secs = totalSeconds % 60;

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }

    return `${hours}h ${mins}m ${secs}s remaining`;
  };

  const filteredReminders = reminders.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === "pending") return matchesSearch && !r.triggered;
    if (activeTab === "triggered") return matchesSearch && r.triggered;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-slate-800 dark:text-zinc-200">
      
      {/* Breadcrumbs & Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200/60 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs mb-1">
            <span className="text-slate-400 dark:text-zinc-550 font-medium">Dashboard</span>
            <span className="text-slate-350 dark:text-zinc-700">/</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">Event Reminders</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-905 dark:text-white tracking-tight">
            Event Reminders
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Configure alarms and get direct alerts in WhatsApp & Email when meetings or events come near.
          </p>
        </div>
        <button
          onClick={loadReminders}
          className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all shadow-sm active:scale-95 cursor-pointer"
          title="Refresh alarm states"
        >
          <RefreshCw className="h-4 w-4 text-slate-600 dark:text-zinc-350" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form Column (50%) */}
        <div className="lg:col-span-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/85 rounded-2xl shadow-sm overflow-hidden">
            {/* Form Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2.5 bg-slate-50/50 dark:bg-zinc-950/20">
              <AlarmClock className="h-5.5 w-5.5 text-blue-600 dark:text-blue-400" />
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isEditing ? "Modify Scheduled Alarm" : "Schedule New Event Alarm"}
                </h2>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                  Specify date, offset time, and contact parameters.
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Project Sync with CEO"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 text-sm font-medium transition-all"
                />
              </div>

              {/* Event Date/Time and Offset Time side-by-side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Event Date & Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Event Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 text-sm font-medium transition-all"
                  />
                </div>

                {/* Offset Remind dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Alert Offset Time</label>
                  <select
                    value={remindOffset}
                    onChange={(e) => setRemindOffset(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 text-sm font-medium transition-all"
                  >
                    <option value="0">At time of event (0 min before)</option>
                    <option value="1">1 minute before</option>
                    <option value="5">5 minutes before</option>
                    <option value="15">15 minutes before</option>
                    <option value="30">30 minutes before</option>
                    <option value="60">1 hour before</option>
                    <option value="1440">1 day before</option>
                  </select>
                </div>
              </div>

              {/* Channels side-by-side card items */}
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-3">
                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Alert Dispatch Channels</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email Channel Card */}
                  <div className="flex items-start gap-3 p-3 bg-slate-50/50 dark:bg-zinc-950/20 border border-slate-150 dark:border-zinc-800/70 rounded-xl">
                    <input
                      type="checkbox"
                      id="channel-email"
                      checked={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <label htmlFor="channel-email" className="text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5 cursor-pointer">
                        <Mail className="h-3.5 w-3.5 text-blue-500" />
                        <span>Email Alert</span>
                      </label>
                      {notifyEmail && (
                        <input
                          type="email"
                          required
                          placeholder="Recipient email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="mt-2 w-full px-2.5 py-1.5 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:ring-1 focus:ring-blue-500/30 bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-200"
                        />
                      )}
                    </div>
                  </div>

                  {/* WhatsApp Channel Card */}
                  <div className="flex items-start gap-3 p-3 bg-slate-50/50 dark:bg-zinc-950/20 border border-slate-150 dark:border-zinc-800/70 rounded-xl">
                    <input
                      type="checkbox"
                      id="channel-whatsapp"
                      checked={notifyWhatsApp}
                      onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <label htmlFor="channel-whatsapp" className="text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5 cursor-pointer">
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                        <span>WhatsApp Alert</span>
                      </label>
                      {notifyWhatsApp && (
                        <input
                          type="text"
                          required
                          placeholder="WhatsApp phone number"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          className="mt-2 w-full px-2.5 py-1.5 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:ring-1 focus:ring-blue-500/30 bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-200"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Event Notes / Description</label>
                <textarea
                  placeholder="e.g. Bring updated slides and Q3 review metrics report sheet."
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 text-sm font-medium transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-4">
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-350 hover:bg-slate-50 dark:hover:bg-zinc-800 font-bold text-sm transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-2 py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="h-4.5 w-4.5" />
                  <span>{isEditing ? "Save Changes" : "Create Alarm"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Prompt Note */}
          <div className="mt-4 p-4.5 bg-gradient-to-br from-indigo-50/50 to-blue-50/20 dark:from-zinc-900/60 dark:to-zinc-800/10 text-slate-800 dark:text-zinc-200 border border-indigo-100/50 dark:border-zinc-800/70 rounded-2xl flex gap-3 shadow-inner">
            <Sparkles className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-semibold">
              <strong className="text-indigo-600 dark:text-indigo-400">Test Alert Feature:</strong> You don't need to wait! Click the <Play className="h-3 w-3 inline text-blue-500 mx-0.5" /> icon on any alarm in the list to queue a test alert that executes in 3 seconds.
            </p>
          </div>
        </div>

        {/* Right Active List Column (50%) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Controls Panel */}
          <div className="bg-white dark:bg-zinc-900 p-4 border border-slate-200 dark:border-zinc-800/80 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-550" />
              <input
                type="text"
                placeholder="Search alarms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-slate-200 dark:border-zinc-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-550 text-xs font-semibold placeholder-slate-400"
              />
            </div>
            
            {/* Tabs */}
            <div className="flex bg-slate-50 dark:bg-zinc-950 p-1 rounded-xl border border-slate-150 dark:border-zinc-850">
              {[
                { id: "all", label: "All Alarms" },
                { id: "pending", label: "Active" },
                { id: "triggered", label: "Triggered" }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-3.5 py-1 text-xs font-extrabold rounded-lg capitalize transition-all cursor-pointer ${
                    activeTab === t.id
                      ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Alarm Cards List */}
          <div className="space-y-4">
            {filteredReminders.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
                <AlarmClock className="h-12 w-12 text-slate-300 dark:text-zinc-700 mx-auto mb-4" />
                <h4 className="text-base font-bold text-slate-700 dark:text-zinc-350">No Event Alarms Found</h4>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto">
                  {searchQuery ? "Try refining your search terms." : "Schedule an alarm on the left panel to begin receiving event notifications."}
                </p>
              </div>
            ) : (
              filteredReminders.map(rem => {
                const isPast = new Date(rem.eventTime).getTime() < Date.now();
                return (
                  <div 
                    key={rem.id} 
                    className={`bg-white dark:bg-zinc-900 border rounded-2xl shadow-sm overflow-hidden group/card transition-all duration-300 hover:shadow-md ${
                      rem.triggered 
                        ? "border-slate-150 dark:border-zinc-850 opacity-80" 
                        : "border-slate-200 dark:border-zinc-800/80"
                    }`}
                  >
                    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      {/* Left Block: Event Info */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-bold text-slate-905 dark:text-white truncate">
                            {rem.title}
                          </h4>
                          
                          {/* Trigger Status Badges */}
                          {rem.triggered ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-50 dark:bg-zinc-950/40 text-slate-500 dark:text-zinc-400 border border-slate-150 dark:border-zinc-850">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Triggered</span>
                            </span>
                          ) : isPast ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-450 border border-amber-100 dark:border-amber-900/30">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Past Event</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                              <Clock className="h-3 w-3" />
                              <span>Active Alarm</span>
                            </span>
                          )}
                        </div>

                        {/* Event Time */}
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>
                            {new Date(rem.eventTime).toLocaleString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                          <span className="text-slate-300 dark:text-zinc-700">|</span>
                          <span>Alert offset: {rem.remindOffset} mins</span>
                        </div>

                        {/* Description */}
                        {rem.description && (
                          <p className="text-xs text-slate-500 dark:text-zinc-455 line-clamp-2 leading-relaxed">
                            {rem.description}
                          </p>
                        )}

                        {/* Enabled channels */}
                        <div className="flex items-center gap-3.5 text-[10px] font-extrabold text-slate-450 uppercase tracking-wide pt-1">
                          <span className="flex items-center gap-1">
                            <Mail className={`h-3.5 w-3.5 ${rem.notifyEmail ? "text-blue-500" : "text-slate-300 dark:text-zinc-700"}`} />
                            <span className={rem.notifyEmail ? "text-slate-600 dark:text-zinc-300" : "text-slate-400 dark:text-zinc-600"}>
                              Email ({rem.notifyEmail ? rem.email || "Details" : "No"})
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className={`h-3.5 w-3.5 ${rem.notifyWhatsApp ? "text-emerald-500" : "text-slate-300 dark:text-zinc-700"}`} />
                            <span className={rem.notifyWhatsApp ? "text-slate-600 dark:text-zinc-300" : "text-slate-400 dark:text-zinc-600"}>
                              WhatsApp ({rem.notifyWhatsApp ? rem.whatsapp || "Details" : "No"})
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Right Block: Live Countdown & Actions */}
                      <div className="flex flex-col items-end justify-between gap-3 min-w-[150px] border-t border-slate-100 md:border-t-0 pt-3 md:pt-0">
                        {/* Countdown block */}
                        {!rem.triggered && !isPast && (
                          <div className="text-right">
                            <p className="text-[10px] font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">Countdown</p>
                            <p className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-200 mt-0.5">
                              {getCountdownString(rem.eventTime, rem.remindOffset)}
                            </p>
                          </div>
                        )}

                        {/* Actions row */}
                        <div className="flex items-center gap-1">
                          {/* Test Trigger Button */}
                          {!rem.triggered && (
                            <button
                              onClick={() => handleTestTrigger(rem)}
                              className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors cursor-pointer"
                              title="Test trigger alarm now"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                          
                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditClick(rem)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-350 rounded-lg transition-colors cursor-pointer"
                            title="Edit alarm details"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(rem.id)}
                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/25 text-rose-550 dark:text-rose-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete event alarm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default EventReminders;
