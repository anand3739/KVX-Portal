import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, MessageSquare, Clock, Bell, X, ExternalLink, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const ReminderManager = () => {
  const navigate = useNavigate();
  const [activeAlert, setActiveAlert] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Sound synthesis to run purely client-side without any file assets
  const playAlarmSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "triangle";

      osc1.frequency.setValueAtTime(650, ctx.currentTime);
      osc2.frequency.setValueAtTime(850, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);

      // Second beep
      setTimeout(() => {
        const ctx2 = new AudioCtx();
        const osc1b = ctx2.createOscillator();
        const osc2b = ctx2.createOscillator();
        const gain2 = ctx2.createGain();

        osc1b.type = "sine";
        osc2b.type = "triangle";

        osc1b.frequency.setValueAtTime(750, ctx2.currentTime);
        osc2b.frequency.setValueAtTime(950, ctx2.currentTime);

        gain2.gain.setValueAtTime(0.15, ctx2.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx2.currentTime + 0.35);

        osc1b.connect(gain2);
        osc2b.connect(gain2);
        gain2.connect(ctx2.destination);

        osc1b.start();
        osc2b.start();
        osc1b.stop(ctx2.currentTime + 0.4);
        osc2b.stop(ctx2.currentTime + 0.4);
      }, 250);
    } catch (err) {
      console.warn("Simulated audio context warning:", err);
    }
  };

  // Poll reminders
  useEffect(() => {
    // Get active user info
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    const checkAlarms = () => {
      const storedReminders = localStorage.getItem("kvx_portal_event_reminders");
      if (!storedReminders) return;

      const reminders = JSON.parse(storedReminders);
      const now = Date.now();
      let hasUpdates = false;

      const updatedReminders = reminders.map((reminder) => {
        if (reminder.triggered) return reminder;

        const eventTimeMs = new Date(reminder.eventTime).getTime();
        const offsetMs = (reminder.remindOffset || 0) * 60 * 1000;
        const alertTime = eventTimeMs - offsetMs;

        // If current time is past or equal to the alert target time
        if (now >= alertTime) {
          hasUpdates = true;
          reminder.triggered = true;
          
          // Trigger actions!
          triggerAlarm(reminder);
        }
        return reminder;
      });

      if (hasUpdates) {
        localStorage.setItem("kvx_portal_event_reminders", JSON.stringify(updatedReminders));
      }
    };

    // Run every 5 seconds
    const interval = setInterval(checkAlarms, 5000);
    checkAlarms(); // Run once initially

    return () => clearInterval(interval);
  }, []);

  const triggerAlarm = (reminder) => {
    // 1. Play premium synthesized sound
    playAlarmSound();

    // 2. Browser native push notification
    if (window.Notification && Notification.permission === "granted") {
      new Notification(`⏰ Event Alert: ${reminder.title}`, {
        body: `Event starts in ${reminder.remindOffset} mins!`,
      });
    }

    // 3. Append to system notifications in localStorage
    try {
      const storedNotifs = localStorage.getItem("mock_notifications");
      let notifs = [];
      if (storedNotifs) {
        notifs = JSON.parse(storedNotifs);
      }
      
      const newNotif = {
        id: Date.now(),
        type: "event_reminder",
        title: `Reminder: ${reminder.title}`,
        message: `Event starts soon at ${new Date(reminder.eventTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Details: ${reminder.description || "No description."}`,
        time: new Date().toISOString(),
        read: false,
      };

      notifs.unshift(newNotif);
      localStorage.setItem("mock_notifications", JSON.stringify(notifs));
    } catch (e) {
      console.error("Failed to append notification to local store:", e);
    }

    // 4. Open in-app details popup
    setActiveAlert(reminder);

    // 5. Direct WhatsApp Click-to-Chat trigger (if enabled)
    if (reminder.notifyWhatsApp && reminder.whatsapp) {
      const cleanedPhone = reminder.whatsapp.replace(/\D/g, ""); // Keep only digits
      const eventTimeStr = new Date(reminder.eventTime).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      
      const msg = `🔔 *KRAVIX PORTAL ALERT* 🔔\n\nHello! This is a reminder for your upcoming event:\n\n*Event:* ${reminder.title}\n*Time:* ${eventTimeStr}\n*Notes:* ${reminder.description || "N/A"}\n\n_Please join on time._`;
      
      const waUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(msg)}`;
      
      // Delay slightly to allow React state modal to open first
      setTimeout(() => {
        try {
          window.open(waUrl, "_blank");
          toast.success("Opening WhatsApp chat directly!");
        } catch (err) {
          console.warn("Popup blocked by browser. Redirection must be triggered via user click.", err);
        }
      }, 800);
    }
  };

  const handleDismiss = () => {
    setActiveAlert(null);
    toast.success("Alert acknowledged.");
  };

  const getWaRedirectUrl = (reminder) => {
    if (!reminder) return "#";
    const cleanedPhone = reminder.whatsapp.replace(/\D/g, "");
    const eventTimeStr = new Date(reminder.eventTime).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const msg = `🔔 *KRAVIX PORTAL ALERT* 🔔\n\nHello! This is a reminder for your upcoming event:\n\n*Event:* ${reminder.title}\n*Time:* ${eventTimeStr}\n*Notes:* ${reminder.description || "N/A"}\n\n_Please join on time._`;
    return `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(msg)}`;
  };

  if (!activeAlert) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      {/* Glow card wrapper */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-indigo-500/15 dark:bg-indigo-500/5 blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-150 dark:border-indigo-900/35">
              <Clock className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Alarm Triggered</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500">Event Time Reminder System</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-zinc-850 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Main Event info */}
          <div className="p-4 bg-slate-50/50 dark:bg-zinc-950/20 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-inner text-slate-800 dark:text-zinc-300">
            <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">Upcoming Event</span>
            <h4 className="text-xl font-bold text-slate-950 dark:text-white mt-0.5">{activeAlert.title}</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold mt-1">
              Time: {new Date(activeAlert.eventTime).toLocaleString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {activeAlert.description && (
              <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2.5 pt-2.5 border-t border-slate-200/50 dark:border-zinc-800 leading-relaxed italic">
                "{activeAlert.description}"
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email Dispatch Simulated Card */}
            <div className="p-4 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">Email System Alert</span>
                </div>
                {activeAlert.notifyEmail ? (
                  <div className="space-y-2 text-xs">
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      Dispatched to: {activeAlert.email}
                    </p>
                    {/* Tiny email preview box */}
                    <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded border border-slate-150 dark:border-zinc-850/60 text-[10px] text-slate-500 dark:text-zinc-400 font-mono space-y-1">
                      <p className="font-bold border-b border-slate-200/50 pb-1">Subject: Kravix Event: {activeAlert.title}</p>
                      <p className="pt-1">Hi {currentUser?.name || "Employee"}, your event starts soon.</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-zinc-550 italic">Channel not enabled</p>
                )}
              </div>
            </div>

            {/* WhatsApp Direct Chat Trigger Card */}
            <div className="p-4 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    <MessageSquare className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">WhatsApp Alert</span>
                </div>
                {activeAlert.notifyWhatsApp ? (
                  <div className="space-y-2 text-xs">
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      Direct Chat Target: {activeAlert.whatsapp}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-normal">
                      The alert details are sent directly to the WhatsApp chat window. If the popup didn't open automatically, click the dispatch button below.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-zinc-550 italic">Channel not enabled</p>
                )}
              </div>
              
              {activeAlert.notifyWhatsApp && (
                <a
                  href={getWaRedirectUrl(activeAlert)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3.5 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 transition-all active:scale-[0.98]"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Launch WhatsApp Chat</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-zinc-950/30 border-t border-slate-100 dark:border-zinc-800/80">
          <button
            onClick={() => {
              setActiveAlert(null);
              navigate("/employee/reminders");
            }}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Manage Alarms
          </button>
          
          <button
            onClick={handleDismiss}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-sm shadow-md hover:shadow-blue-500/10 active:scale-[0.97] transition-all cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderManager;
