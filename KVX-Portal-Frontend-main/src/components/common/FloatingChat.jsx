import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  MessageSquare, X, Send, Search, Phone, Video,
  Smile, ArrowLeft, MoreVertical, Check, CheckCheck
} from "lucide-react";
import { useAdminTheme } from "../../contexts/AdminThemeContext";
import { messageService } from "../../services/messageService";
import { authService } from "../../services/authService";
import { EMOJIS } from "../../constants";

export default function FloatingChat() {
  const { t } = useAdminTheme();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState("direct");
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [inChat, setInChat] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const endRef = useRef(null);
  const emojiRef = useRef(null);

  const hideOnPaths = ["/login", "/forgot-password", "/reset-password", "/change-password"];
  const isAuthPage = hideOnPaths.some(path => location.pathname.startsWith(path));

  const list = tab === "direct" ? contacts : groups;
  const filtered = list.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));
  const chatMsgs = messages[selected?.id] || [];
  const totalUnread = contacts.reduce((s, c) => s + (c.unread || 0), 0) + groups.reduce((s, c) => s + (c.unread || 0), 0);

  const [currentUser, setCurrentUser] = useState(authService.getStoredUser());

  const inputStyle = {
    background: t.inputBg,
    borderColor: t.inputBorder,
    color: t.inputColor
  };

  const iconButtonStyle = {
    background: t.btnSecondaryBg,
    borderColor: t.btnSecondaryBorder,
    color: t.btnSecondaryColor
  };

  const primaryButtonStyle = {
    background: t.btnPrimaryBg,
    color: t.btnPrimaryColor
  };

  const chatBackgroundStyle = {
    background: t.cardBg,
    backgroundImage: `radial-gradient(${t.cardBorder} 0.6px, transparent 0.6px)`,
    backgroundSize: "18px 18px",
    backgroundPosition: "0 0"
  };

  const renderAvatarContent = (avatarValue, roundingClass = "rounded-full") => {
    if (!avatarValue) return "?";
    if (
      typeof avatarValue === "string" &&
      (avatarValue.startsWith("data:") ||
        avatarValue.startsWith("http:") ||
        avatarValue.startsWith("https:") ||
        avatarValue.includes("/") ||
        avatarValue.includes("."))
    ) {
      return (
        <img
          src={avatarValue}
          alt=""
          className={`h-full w-full object-cover ${roundingClass}`}
        />
      );
    }
    return String(avatarValue).slice(0, 2);
  };

  const normalizeConversation = (conversation, userObj = currentUser) => {
    return (conversation.messages || []).map((message) => ({
      ...message,
      text: message.content || message.subject || "",
      mine: message.sender_id === userObj?.id,
      avatar:
        message.sender_id === userObj?.id
          ? message.sender_avatar
          : message.sender_avatar || message.sender_name?.[0] || "U",
      time: new Date(message.created_at || message.updated_at || Date.now()).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      })
    }));
  };

  useEffect(() => {
    if (!isAuthenticated || !isOpen) return;

    const loadContacts = async () => {
      let activeUser = currentUser;
      try {
        const response = await authService.getCurrentUser();
        const realUser = response?.user || response;
        if (realUser && realUser.id) {
          authService.updateStoredUser(realUser);
          setCurrentUser(realUser);
          activeUser = realUser;
        }
      } catch (err) {
        console.error("Failed to fetch real current user in FloatingChat:", err);
      }

      try {
        const { contacts: backendContacts } = await messageService.getContacts();
        const enriched = backendContacts.map((contact) => {
          const idNum = typeof contact.id === "string" 
            ? contact.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) 
            : contact.id;
          return {
            ...contact,
            name: contact.name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.email || 'Unknown',
            avatar:
              contact.profile_picture_url ||
              `${contact.first_name?.[0] || "?"}${contact.last_name?.[0] || ""}`.toUpperCase(),
            color: `hsl(${(idNum % 12) * 30}, 70%, 50%)`,
            online: true,
            unread: contact.unread !== undefined ? contact.unread : 0,
            lastMsg: contact.lastMsg || "Say hi to start the chat!",
            lastTime: contact.lastTime || "Now"
          };
        });

        setContacts(enriched);
        setGroups([]);

        if (enriched.length > 0) {
          if (!selected) {
            setSelected(enriched[0]);
            const conversation = await messageService.getConversation(enriched[0].id);
            setMessages((prev) => ({ ...prev, [enriched[0].id]: normalizeConversation(conversation, activeUser) }));
          }
        }
      } catch (error) {
        console.error("Unable to load chat contacts in FloatingChat:", error);
      }
    };

    loadContacts();
  }, [isAuthenticated, isOpen]);

  useEffect(() => {
    if (!selected || !isOpen) return;

    const loadConversation = async () => {
      try {
        const conversation = await messageService.getConversation(selected.id);
        setMessages((prev) => ({ ...prev, [selected.id]: normalizeConversation(conversation) }));
        
        // Mark unread as 0 locally
        setContacts(prev => prev.map(c => c.id === selected.id ? { ...c, unread: 0 } : c));
      } catch (error) {
        console.error("Unable to load conversation in FloatingChat:", error);
      }
    };

    loadConversation();
  }, [selected?.id, isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [chatMsgs, isOpen]);

  if (!isAuthenticated || isAuthPage) return null;

  const openChat = () => setIsOpen(true);

  const closeChat = () => {
    setIsAnimatingOut(true);
    setTimeout(() => { setIsOpen(false); setIsAnimatingOut(false); }, 280);
  };

  const send = async () => {
    if (!input.trim() || !selected) return;
    const messageText = input.trim();
    try {
      const sentMessage = await messageService.sendMessage(selected.id, "", messageText);
      const outgoing = {
        ...sentMessage,
        text: sentMessage.content || messageText,
        time: new Date(sentMessage.created_at || Date.now()).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit"
        }),
        mine: true,
        avatar:
          sentMessage.sender_avatar ||
          `${currentUser?.first_name?.[0] || "?"}${currentUser?.last_name?.[0] || ""}`.toUpperCase(),
        read: true
      };

      setMessages((prev) => ({
        ...prev,
        [selected.id]: [...(prev[selected.id] || []), outgoing]
      }));

      // Update last message in the sidebar
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === selected.id
            ? {
                ...contact,
                lastMsg: outgoing.text,
                lastTime: outgoing.time
              }
            : contact
        )
      );

      setInput("");
      setShowEmoji(false);
    } catch (error) {
      console.error("Send message failed in FloatingChat:", error);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          id="floating-chat-btn"
          onClick={openChat}
          className="fixed bottom-6 right-6 z-[999] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group"
          style={{
            background: t.btnPrimaryBg,
            color: t.btnPrimaryColor,
            boxShadow: `0 8px 32px ${t.btnPrimaryBg}55`,
            animation: "chatBounce 3s ease-in-out infinite"
          }}
        >
          <MessageSquare className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" />
          {totalUnread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white animate-pulse shadow-lg">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </button>
      )}

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[998] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
          onClick={(e) => e.target === e.currentTarget && closeChat()}
        >
          {/* Chat Window Container */}
          <div
            className="w-full h-[85vh] max-w-[1000px] flex overflow-hidden rounded-3xl border shadow-2xl transition-all"
            style={{
              borderColor: t.cardBorder,
              background: t.cardBg,
              animation: isAnimatingOut ? "chatScaleOut 0.28s cubic-bezier(0.4,0,1,1) forwards" : "chatScaleIn 0.35s cubic-bezier(0,0,0.2,1) forwards"
            }}
          >
            {/* ═══ LEFT PANEL — Sidebar ═══ */}
            <aside
              className={`w-full md:w-[320px] shrink-0 border-b md:border-b-0 md:border-r flex-col ${inChat ? "hidden md:flex" : "flex"}`}
              style={{ background: t.cardBg, borderColor: t.cardBorder }}
            >
              <div className="border-b px-5 py-4" style={{ borderColor: t.cardBorder }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: t.textPrimary }}>
                      Team Chat
                    </p>
                    <p className="text-xs" style={{ color: t.textSecondary }}>
                      {totalUnread > 0 ? `${totalUnread} unread messages` : "Active workspace"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeChat}
                    className="rounded-full p-2 transition"
                    style={iconButtonStyle}
                    aria-label="Close chat"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative mt-4">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: t.textSecondary }}
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search conversation..."
                    className="w-full rounded-full border py-2 pl-9 pr-3 text-xs outline-none"
                    style={inputStyle}
                  />
                </div>

                <div className="mt-3 flex gap-2">
                  {[
                    { key: "direct", label: "Direct" },
                    { key: "groups", label: "Groups" }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTab(item.key)}
                      className="flex-1 rounded-full py-1.5 text-xs font-medium transition"
                      style={{
                        background: tab === item.key ? t.btnPrimaryBg : t.inputBg,
                        color: tab === item.key ? t.btnPrimaryColor : t.textSecondary,
                        borderWidth: 1,
                        borderStyle: "solid",
                        borderColor: tab === item.key ? t.btnPrimaryBg : t.btnSecondaryBorder
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-2">
                {filtered.length === 0 && (
                  <div className="px-5 py-8 text-center text-xs" style={{ color: t.textSecondary }}>
                    No conversations found.
                  </div>
                )}
                {filtered.map((item) => {
                  const isSelected = selected?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { setSelected(item); setInChat(true); }}
                      className="w-full px-5 py-3 text-left transition relative"
                      style={{ background: isSelected ? t.inputBg : "transparent" }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <div
                            className="flex h-11 w-11 items-center justify-center rounded-full text-xs font-semibold text-white overflow-hidden"
                            style={{ background: item.color || t.btnPrimaryBg }}
                          >
                            {renderAvatarContent(item.avatar)}
                          </div>
                          {item.online && (
                            <span
                              className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2"
                              style={{ background: "#22c55e", borderColor: t.cardBg }}
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-xs font-semibold" style={{ color: t.textPrimary }}>
                              {item.name}
                            </p>
                            <span className="text-[10px] shrink-0" style={{ color: t.textSecondary }}>
                              {item.lastTime}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center justify-between gap-2">
                            <p className="truncate text-[11px]" style={{ color: t.textMuted }}>
                              {item.lastMsg}
                            </p>
                            {!!item.unread && (
                              <span
                                className="flex h-4 min-w-[1rem] shrink-0 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
                                style={primaryButtonStyle}
                              >
                                {item.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* ═══ RIGHT PANEL — Conversation Pane ═══ */}
            <section
              className={`flex min-w-0 flex-1 flex-col overflow-hidden ${!inChat ? "hidden md:flex" : "flex"}`}
              style={{ background: t.cardBg }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between gap-3 border-b px-5 py-3.5"
                style={{ borderColor: t.cardBorder }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    className="rounded-full p-2 transition md:hidden"
                    style={iconButtonStyle}
                    onClick={() => setInChat(false)}
                    aria-label="Back to chat list"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white overflow-hidden"
                    style={{ background: selected?.color || t.btnPrimaryBg }}
                  >
                    {renderAvatarContent(selected?.avatar)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold" style={{ color: t.textPrimary }}>
                      {selected?.name || "Select a chat"}
                    </p>
                    <p className="truncate text-[11px]" style={{ color: t.textSecondary }}>
                      {selected
                        ? selected.members
                          ? `${selected.members} members`
                          : selected.online
                          ? "Online"
                          : selected.role
                        : "Pick someone to message"}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    className="rounded-full p-1.5 transition"
                    style={iconButtonStyle}
                    aria-label="Voice call"
                  >
                    <Phone className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className="rounded-full p-1.5 transition"
                    style={iconButtonStyle}
                    aria-label="Video call"
                  >
                    <Video className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className="rounded-full p-1.5 transition"
                    style={iconButtonStyle}
                    onClick={closeChat}
                    aria-label="Close"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Message Thread */}
              <div
                className="flex-1 overflow-y-auto px-5 py-5"
                style={{ ...chatBackgroundStyle, minHeight: 0 }}
              >
                {!selected ? (
                  <div
                    className="rounded-2xl border px-6 py-8 text-center text-xs"
                    style={{ borderColor: t.cardBorder, color: t.textSecondary, background: t.cardBg }}
                  >
                    Select a conversation to start chatting.
                  </div>
                ) : chatMsgs.length === 0 ? (
                  <div
                    className="rounded-2xl border px-6 py-8 text-center text-xs"
                    style={{ borderColor: t.cardBorder, color: t.textSecondary, background: t.cardBg }}
                  >
                    No messages yet. Start the conversation.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatMsgs.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-2 ${message.mine ? "justify-end" : "justify-start"}`}
                      >
                        {!message.mine && (
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center self-end rounded-full text-[10px] font-semibold text-white overflow-hidden"
                            style={{ background: selected?.color || t.btnPrimaryBg }}
                          >
                            {renderAvatarContent(message.avatar || message.from?.[0] || "U")}
                          </div>
                        )}
                        <div
                          className="relative max-w-[78%] rounded-2xl px-3.5 py-2 shadow-sm sm:max-w-[70%]"
                          style={{
                            background: message.mine ? t.btnPrimaryBg : t.inputBg,
                            color: message.mine ? t.btnPrimaryColor : t.textPrimary
                          }}
                        >
                          {message.text && (
                            <p className="whitespace-pre-wrap break-words text-xs leading-5">{message.text}</p>
                          )}
                          <div
                            className="mt-1 flex items-center justify-end gap-1 text-[10px]"
                            style={{ color: message.mine ? t.btnPrimaryColor : t.textMuted, opacity: 0.85 }}
                          >
                            <span>{message.time}</span>
                            {message.mine && (
                              message.read ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {/* Input Area */}
              <div className="border-t px-4 py-3" style={{ borderColor: t.cardBorder }}>
                <div className="relative">
                  <div
                    className="flex items-center gap-1 rounded-full border px-2 py-1.5"
                    style={{ borderColor: t.inputBorder, background: t.inputBg }}
                  >
                    <button
                      type="button"
                      onClick={() => setShowEmoji((prev) => !prev)}
                      className="shrink-0 rounded-full p-1.5 transition"
                      style={iconButtonStyle}
                      aria-label="Choose an emoji"
                    >
                      <Smile className="h-4 w-4" />
                    </button>
                    <input
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          send();
                        }
                      }}
                      placeholder={selected ? "Type a message" : "Select a chat to start typing"}
                      disabled={!selected}
                      className="min-w-0 flex-1 bg-transparent px-2 text-xs outline-none disabled:cursor-not-allowed"
                      style={{ color: t.inputColor }}
                    />
                    <button
                      type="button"
                      className={`flex shrink-0 items-center justify-center rounded-full p-2 transition ${
                        input.trim() ? "" : "opacity-50 cursor-not-allowed"
                      }`}
                      style={primaryButtonStyle}
                      onClick={send}
                      disabled={!input.trim()}
                      aria-label="Send message"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {showEmoji && (
                    <div
                      ref={emojiRef}
                      className="absolute bottom-full left-0 right-0 z-10 mx-auto mb-3 w-full rounded-2xl border p-3 shadow-2xl"
                      style={{ background: t.cardBg, borderColor: t.cardBorder }}
                    >
                      <div className="grid grid-cols-10 gap-1.5">
                        {EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => { setInput((prev) => `${prev}${emoji}`); }}
                            className="rounded-xl p-1.5 text-base transition hover:scale-110"
                            style={{ color: t.textPrimary, background: t.inputBg }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Keyframe Animations */}
      <style>{`
        @keyframes chatBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.02); }
        }
        @keyframes chatScaleIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes chatScaleOut {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to { opacity: 0; transform: scale(0.92) translateY(12px); }
        }
      `}</style>
    </>
  );
}
