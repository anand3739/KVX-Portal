import { useState, useEffect, useRef } from "react";
import {
  Send,
  Search,
  Phone,
  Video,
  Paperclip,
  Smile,
  ArrowLeft,
  MoreVertical,
  File,
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileAudio,
  FileVideo,
  Trash,
  Plus,
  X,
  Check,
  CheckCheck
} from "lucide-react";
import { useAdminTheme } from "../../contexts/AdminThemeContext";
import { authService } from "../../services/authService";
import { messageService } from "../../services/messageService";
import {
  formatFileSize,
  getFileIcon as getFileIconName,
  getFileColor,
  validateFile,
  createAttachment,
  simulateUploadProgress,
  removeAttachmentById
} from "../../utils";
import { EMOJIS } from "../../constants";

const fileIconMap = {
  Image: File,
  File: File,
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileAudio,
  FileVideo
};

// Groups raw messages into day buckets so we can render WhatsApp-style
// "Today" / "Yesterday" / date dividers. Falls back gracefully if a
// message has no date field, so it never throws.
const groupMessagesByDay = (msgs) => {
  const groups = [];
  let currentKey = null;

  msgs.forEach((message) => {
    const rawDate = message.date || message.createdAt || null;
    let label = null;
    let key = "__no-date__";

    if (rawDate) {
      const d = new Date(rawDate);
      if (!Number.isNaN(d.getTime())) {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const sameDay = (a, b) =>
          a.getFullYear() === b.getFullYear() &&
          a.getMonth() === b.getMonth() &&
          a.getDate() === b.getDate();

        key = d.toDateString();
        if (sameDay(d, today)) label = "Today";
        else if (sameDay(d, yesterday)) label = "Yesterday";
        else
          label = d.toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined
          });
      }
    }

    if (key !== currentKey) {
      groups.push({ key, label, items: [] });
      currentKey = key;
    }
    groups[groups.length - 1].items.push(message);
  });

  return groups;
};

const renderAttachment = (attachment, t, showRemove = false, onRemove) => {
  const Icon = fileIconMap[getFileIconName(attachment.file || attachment)] || File;
  return (
    <div
      key={attachment.id}
      className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3"
      style={{ borderColor: t.cardBorder, background: t.inputBg }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className={`rounded-2xl p-3 ${getFileColor(attachment.file || attachment)}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold" style={{ color: t.textPrimary }}>
            {attachment.name}
          </p>
          <p className="text-xs" style={{ color: t.textSecondary }}>
            {formatFileSize(attachment.size)}
          </p>
        </div>
      </div>
      {showRemove && (
        <button
          type="button"
          onClick={() => onRemove?.(attachment.id)}
          className="rounded-full p-2 transition"
          style={{ color: t.textSecondary }}
          aria-label={`Remove ${attachment.name}`}
        >
          <Trash className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

const ChatSystem = ({ role = "admin" }) => {
  const { t, isDark } = useAdminTheme();
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [tab, setTab] = useState("direct");
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState({});
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [fileError, setFileError] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatType, setNewChatType] = useState("direct");
  const [newChatName, setNewChatName] = useState("");
  const [newChatTarget, setNewChatTarget] = useState(null);
  const [newChatMembers, setNewChatMembers] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const endRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const emojiRef = useRef(null);
  const fileInputRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(authService.getStoredUser());

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
    const initChat = async () => {
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
        console.error("Failed to fetch real current user:", err);
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

        // Only pre-select the first contact that has actual messages
        const firstWithMsg = enriched.find(c => c.lastMsg && c.lastMsg !== "Say hi to start the chat!");
        if (firstWithMsg) {
          setSelectedId(firstWithMsg.id);
          const conversation = await messageService.getConversation(firstWithMsg.id);
          setMessages((prev) => ({ ...prev, [firstWithMsg.id]: normalizeConversation(conversation, activeUser) }));
        }
      } catch (error) {
        console.error("Unable to load chat contacts:", error);
        setStatusMessage("Unable to load chat contacts. Please try again.");
      }
    };

    initChat();
  }, []);

  // Close the emoji picker on outside click.
  useEffect(() => {
    if (!showEmoji) return undefined;
    const handleClick = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showEmoji]);

  const currentList = tab === "direct" ? contacts : groups;
  // Show contacts that: have real messages OR are currently selected (just opened)
  const sidebarList = currentList.filter(
    (item) => item.id === selectedId || (item.lastMsg && item.lastMsg !== "Say hi to start the chat!")
  );
  const filteredList = sidebarList.filter((item) =>
    (item.name || "").toLowerCase().includes(search.toLowerCase())
  );
  // All contacts (for New Chat modal)
  const allContacts = contacts;

  const selectedChat = [...contacts, ...groups].find((item) => item.id === selectedId) || null;
  const chatMessages = messages[selectedId] || [];
  const messageGroups = groupMessagesByDay(chatMessages);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [chatMessages, selectedId]);

  const currentAvatarStyle = {
    background: selectedChat?.color || t.btnPrimaryBg
  };

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

  // Subtle repeating pattern for the message pane background, built only
  // from the existing theme border color so no new colors are introduced.
  const chatBackgroundStyle = {
    background: t.cardBg,
    backgroundImage: `radial-gradient(${t.cardBorder} 0.6px, transparent 0.6px)`,
    backgroundSize: "18px 18px",
    backgroundPosition: "0 0"
  };

  // Helper methods moved to top of component

  const loadConversation = async (chatId) => {
    try {
      const conversation = await messageService.getConversation(chatId);
      setMessages((prev) => ({ ...prev, [chatId]: normalizeConversation(conversation) }));
    } catch (error) {
      console.error("Unable to load conversation:", error);
      setStatusMessage("Unable to load conversation. Please try again.");
    }
  };

  const selectChat = async (id) => {
    setSelectedId(id);
    setShowEmoji(false);
    setFileError("");
    setStatusMessage("");
    await loadConversation(id);
  };

  const changeTab = (newTab) => {
    setTab(newTab);
    setSearch("");
    const list = newTab === "direct" ? contacts : groups;
    setSelectedId(list[0]?.id ?? null);
  };

  const sendMessage = async () => {
    if (!selectedId) return;
    if (!input.trim() && attachments.length === 0) {
      setFileError("Type a message or attach a file first.");
      return;
    }

    const messageText = input.trim();

    try {
      const sentMessage = await messageService.sendMessage(selectedId, "", messageText);
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
        [selectedId]: [...(prev[selectedId] || []), outgoing]
      }));

      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === selectedId
            ? {
                ...contact,
                lastMsg: outgoing.text || "Sent a message",
                lastTime: outgoing.time,
                unread: 0
              }
            : contact
        )
      );

      setInput("");
      setAttachments([]);
      setFileError("");
      setStatusMessage("");
    } catch (error) {
      console.error("Send message failed:", error);
      setStatusMessage(error.message || "Unable to send message. Please try again.");
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setFileError(validation.error);
      return;
    }

    setFileError("");
    const attachment = createAttachment(file);
    setAttachments((prev) => [...prev, attachment]);
    simulateUploadProgress(attachment.id, setUploadProgress);
  };

  const removeAttachment = (attachmentId) => {
    setAttachments((prev) => removeAttachmentById(prev, attachmentId));
    setUploadProgress((prev) => {
      const next = { ...prev };
      delete next[attachmentId];
      return next;
    });
  };

  const addEmoji = (emoji) => {
    setInput((prev) => `${prev}${emoji}`);
  };

  const createChat = async () => {
    if (newChatType === "direct") {
      if (!newChatTarget) {
        setFileError("Please select an employee to chat with.");
        return;
      }
      // Mark this contact as an active chat so it shows in sidebar
      setContacts((prev) =>
        prev.map((c) =>
          c.id === newChatTarget.id
            ? { ...c, lastMsg: c.lastMsg === "Say hi to start the chat!" ? "\u200b" : c.lastMsg }
            : c
        )
      );
      setSelectedId(newChatTarget.id);
      // Load existing messages if any
      try {
        const conversation = await messageService.getConversation(newChatTarget.id);
        setMessages((prev) => ({ ...prev, [newChatTarget.id]: normalizeConversation(conversation) }));
      } catch (e) {
        setMessages((prev) => ({ ...prev, [newChatTarget.id]: [] }));
      }
      closeNewChatModal();
      setTab("direct");
      return;
    }

    // Group chat
    if (!newChatName.trim()) {
      setFileError("Enter a group name.");
      return;
    }
    if (newChatMembers.length === 0) {
      setFileError("Select at least one member for the group chat.");
      return;
    }

    const created = {
      id: Date.now(),
      name: newChatName.trim(),
      members: newChatMembers.length,
      color: t.btnPrimaryBg,
      unread: 0,
      lastMsg: "\u200b",
      lastTime: "Now",
      avatar: `${newChatName.trim()[0] || "?"}`.toUpperCase()
    };
    setGroups((prev) => [created, ...prev]);
    setMessages((prev) => ({ ...prev, [created.id]: [] }));
    setSelectedId(created.id);
    closeNewChatModal();
    setTab("groups");
  };

  const closeNewChatModal = () => {
    setShowNewChatModal(false);
    setNewChatName("");
    setNewChatTarget(null);
    setNewChatMembers([]);
    setFileError("");
  };

  const handleActionClick = (label) => {
    setStatusMessage(`${label} isn't available in this demo yet.`);
  };

  const canSend = input.trim().length > 0 || attachments.length > 0;

  return (
    <div className="flex h-full flex-col px-4 py-6 md:px-8 lg:px-10" style={{ background: t.layoutBg }}>
      <div
        className="mx-auto flex w-full max-w-[1400px] overflow-hidden rounded-3xl border shadow-2xl"
        style={{ borderColor: t.cardBorder, background: t.cardBg, height: 'calc(100vh - 120px)' }}
      >
        <div className="flex h-full w-full flex-col md:flex-row overflow-hidden">
          {/* Sidebar */}
          <aside
            className={`w-full border-b md:w-[340px] md:border-b-0 md:border-r ${
              selectedId != null ? "hidden md:flex md:flex-col" : "flex flex-col"
            }`}
            style={{ background: t.cardBg, borderColor: t.cardBorder }}
          >
            <div className="border-b px-5 py-5" style={{ borderColor: t.cardBorder }}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold" style={{ color: t.textPrimary }}>
                    Team Chat
                  </p>
                  <p className="text-xs" style={{ color: t.textSecondary }}>
                    {role.charAt(0).toUpperCase() + role.slice(1)} workspace
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setShowNewChatModal(true);
                    if (contacts.length === 0) {
                      try {
                        const { contacts: bc } = await messageService.getContacts();
                        const enriched = bc.map((c) => {
                          const idNum = typeof c.id === "string"
                            ? c.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
                            : c.id;
                          return {
                            ...c,
                            name: c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.email || 'Unknown',
                            avatar: c.profile_picture_url || `${c.first_name?.[0] || '?'}${c.last_name?.[0] || ''}`.toUpperCase(),
                            color: `hsl(${(idNum % 12) * 30}, 70%, 50%)`,
                            online: true,
                            unread: c.unread !== undefined ? c.unread : 0,
                            lastMsg: c.lastMsg || "Say hi to start the chat!",
                            lastTime: c.lastTime || "Now"
                          };
                        });
                        setContacts(enriched);
                      } catch (err) {
                        console.error("Failed to reload contacts:", err);
                      }
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold transition"
                  style={iconButtonStyle}
                >
                  <Plus className="h-4 w-4" />
                  New chat
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
                  placeholder="Search or start a new chat"
                  className="w-full rounded-full border py-2.5 pl-10 pr-3 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              <div className="mt-4 flex gap-2">
                {[
                  { key: "direct", label: "Direct" },
                  { key: "groups", label: "Groups" }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => changeTab(item.key)}
                    className="flex-1 rounded-full py-2 text-sm font-medium transition"
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
              {filteredList.length === 0 && (
                <div className="px-5 py-8 text-sm text-center" style={{ color: t.textSecondary }}>
                  No conversations yet.<br />
                  <span className="text-xs opacity-70">Click "+ New chat" to start one.</span>
                </div>
              )}
              {filteredList.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectChat(item.id)}
                    className="w-full px-5 py-3 text-left transition"
                    style={{ background: isSelected ? t.inputBg : "transparent" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white overflow-hidden"
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
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-semibold" style={{ color: t.textPrimary }}>
                            {item.name}
                          </p>
                          <span className="text-[11px] shrink-0" style={{ color: t.textSecondary }}>
                            {item.lastTime}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p className="truncate text-xs" style={{ color: t.textMuted }}>
                            {item.lastMsg}
                          </p>
                          {!!item.unread && (
                            <span
                              className="flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold"
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

          {/* Conversation pane */}
          <section
            className={`flex min-w-0 flex-1 flex-col overflow-hidden ${selectedId != null ? "flex" : "hidden md:flex"}`}
            style={{ background: t.cardBg }}
          >
            <div
              className="flex items-center justify-between gap-3 border-b px-6 py-4"
              style={{ borderColor: t.cardBorder }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  className="rounded-full p-2 transition md:hidden"
                  style={iconButtonStyle}
                  onClick={() => setSelectedId(null)}
                  aria-label="Back to chat list"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white overflow-hidden"
                  style={currentAvatarStyle}
                >
                  {renderAvatarContent(selectedChat?.avatar)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold" style={{ color: t.textPrimary }}>
                    {selectedChat?.name || "Select a chat"}
                  </p>
                  <p className="truncate text-xs" style={{ color: t.textSecondary }}>
                    {selectedChat
                      ? selectedChat.members
                        ? `${selectedChat.members} members`
                        : selectedChat.online
                        ? "Online"
                        : selectedChat.role
                      : "Pick someone to message"}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  className="rounded-full p-2 transition"
                  style={iconButtonStyle}
                  onClick={() => handleActionClick("Voice call")}
                  aria-label="Voice call"
                >
                  <Phone className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded-full p-2 transition"
                  style={iconButtonStyle}
                  onClick={() => handleActionClick("Video call")}
                  aria-label="Video call"
                >
                  <Video className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded-full p-2 transition"
                  style={iconButtonStyle}
                  onClick={() => handleActionClick("More options")}
                  aria-label="More options"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-6 py-6"
              style={{ ...chatBackgroundStyle, minHeight: 0 }}
            >
              {statusMessage && (
                <div
                  className="mb-4 rounded-2xl px-4 py-3 text-center text-sm"
                  style={{ background: t.inputBg, color: t.textPrimary }}
                >
                  {statusMessage}
                </div>
              )}
              {selectedId == null ? (
                <div
                  className="rounded-3xl border px-8 py-10 text-center"
                  style={{ borderColor: t.cardBorder, color: t.textSecondary, background: t.cardBg }}
                >
                  Select a conversation to start chatting.
                </div>
              ) : chatMessages.length === 0 ? (
                <div
                  className="rounded-3xl border px-8 py-10 text-center"
                  style={{ borderColor: t.cardBorder, color: t.textSecondary, background: t.cardBg }}
                >
                  No messages yet. Start the conversation.
                </div>
              ) : (
                <div className="space-y-1">
                  {messageGroups.map((group) => (
                    <div key={group.key}>
                      {group.label && (
                        <div className="my-4 flex justify-center">
                          <span
                            className="rounded-full px-3 py-1 text-[11px] font-medium"
                            style={{ background: t.inputBg, color: t.textSecondary }}
                          >
                            {group.label}
                          </span>
                        </div>
                      )}
                      {group.items.map((message) => (
                        <div
                          key={message.id}
                          className={`mb-2 flex gap-2 ${message.mine ? "justify-end" : "justify-start"}`}
                        >
                          {!message.mine && (
                            <div
                              className="flex h-8 w-8 shrink-0 items-center justify-center self-end rounded-full text-xs font-semibold text-white overflow-hidden"
                              style={{ background: selectedChat?.color || t.btnPrimaryBg }}
                            >
                              {renderAvatarContent(message.avatar || message.from?.[0] || "U")}
                            </div>
                          )}
                          <div
                            className="relative max-w-[78%] rounded-2xl px-4 py-2 shadow-sm sm:max-w-[65%]"
                            style={{
                              background: message.mine ? t.btnPrimaryBg : t.inputBg,
                              color: message.mine ? t.btnPrimaryColor : t.textPrimary
                            }}
                          >
                            {message.text && (
                              <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.text}</p>
                            )}
                            {message.attachments?.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map((attachment) => renderAttachment(attachment, t, false))}
                              </div>
                            )}
                            <div
                              className="mt-1 flex items-center justify-end gap-1 text-[11px]"
                              style={{ color: message.mine ? t.btnPrimaryColor : t.textMuted, opacity: 0.85 }}
                            >
                              <span>{message.time}</span>
                              {message.mine &&
                                (message.read ? (
                                  <CheckCheck className="h-3.5 w-3.5" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="border-t px-4 py-3 md:px-6 md:py-4" style={{ borderColor: t.cardBorder }}>
              {attachments.length > 0 && (
                <div className="mb-3 space-y-2">
                  {attachments.map((attachment) => renderAttachment(attachment, t, true, removeAttachment))}
                </div>
              )}
              {fileError && (
                <p className="mb-2 text-xs" style={{ color: "#ef4444" }}>
                  {fileError}
                </p>
              )}

              <div className="relative">
                <div
                  className="flex items-center gap-1 rounded-full border px-2 py-1.5"
                  style={{ borderColor: t.inputBorder, background: t.inputBg }}
                >
                  <button
                    type="button"
                    onClick={() => setShowEmoji((prev) => !prev)}
                    className="shrink-0 rounded-full p-2 transition"
                    style={iconButtonStyle}
                    aria-label="Choose an emoji"
                  >
                    <Smile className="h-4 w-4" />
                  </button>
                  <label
                    className="shrink-0 cursor-pointer rounded-full p-2 transition"
                    style={iconButtonStyle}
                    aria-label="Attach a file"
                  >
                    <Paperclip className="h-4 w-4" />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                      onClick={(event) => {
                        event.target.value = null;
                      }}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder={selectedId ? "Type a message" : "Select a chat to start typing"}
                    disabled={!selectedId}
                    className="min-w-0 flex-1 bg-transparent px-1 text-sm outline-none disabled:cursor-not-allowed"
                    style={{ color: t.inputColor }}
                  />
                  <button
                    type="button"
                    className={`flex shrink-0 items-center justify-center rounded-full p-2.5 transition ${
                      canSend ? "" : "opacity-50 cursor-not-allowed"
                    }`}
                    style={primaryButtonStyle}
                    onClick={sendMessage}
                    disabled={!canSend}
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>

                {showEmoji && (
                  <div
                    ref={emojiRef}
                    className="absolute bottom-full left-0 right-0 z-10 mx-auto mb-3 w-full max-w-[760px] rounded-3xl border p-4 shadow-2xl"
                    style={{ background: t.cardBg, borderColor: t.cardBorder }}
                  >
                    <div className="grid grid-cols-8 gap-2">
                      {EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => addEmoji(emoji)}
                          className="rounded-2xl p-2 text-lg transition"
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

      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl border p-6"
            style={{ background: t.cardBg, borderColor: t.cardBorder }}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: t.textPrimary }}>
                  New Chat
                </h2>
                <p className="text-sm" style={{ color: t.textSecondary }}>
                  Create a direct message or group chat.
                </p>
              </div>
              <button
                type="button"
                className="rounded-full p-2"
                style={iconButtonStyle}
                onClick={closeNewChatModal}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: t.textPrimary }}>
                  Chat type
                </label>
                <div className="flex gap-2">
                  {[
                    { key: "direct", label: "Direct" },
                    { key: "groups", label: "Group" }
                  ].map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => {
                        setNewChatType(option.key);
                        setNewChatTarget(null);
                        setNewChatMembers([]);
                        setNewChatName("");
                      }}
                      className="flex-1 rounded-2xl border px-4 py-3 text-sm font-medium transition"
                      style={{
                        background: newChatType === option.key ? t.btnPrimaryBg : t.inputBg,
                        color: newChatType === option.key ? t.btnPrimaryColor : t.textPrimary,
                        borderColor: newChatType === option.key ? t.btnPrimaryBg : t.inputBorder
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: t.textPrimary }}>
                  Chat name
                </label>
                <input
                  value={newChatName}
                  onChange={(event) => setNewChatName(event.target.value)}
                  placeholder="Enter name"
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              {newChatType === "direct" && (
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: t.textPrimary }}>
                    Choose employee
                  </label>
                  {contacts.length === 0 ? (
                    <p className="text-sm py-4 text-center" style={{ color: t.textSecondary }}>
                      Loading employees…
                    </p>
                  ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {contacts.map((contact) => {
                      const selected = newChatTarget?.id === contact.id;
                      return (
                        <button
                          key={contact.id}
                          type="button"
                          onClick={() => {
                            setNewChatTarget(contact);
                            setNewChatName(contact.name);
                            setFileError("");
                          }}
                          className="w-full rounded-2xl border px-4 py-3 text-left text-sm transition"
                          style={{
                            borderColor: selected ? t.btnPrimaryBg : t.inputBorder,
                            background: selected ? t.inputBg : "transparent"
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white overflow-hidden"
                              style={{ background: contact.color || t.btnPrimaryBg }}
                            >
                              {renderAvatarContent(contact.avatar)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium" style={{ color: t.textPrimary }}>
                                {contact.name}
                              </p>
                              <p className="truncate text-xs" style={{ color: t.textSecondary }}>
                                {contact.role}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  )}
                </div>
              )}
              {newChatType === "groups" && (
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: t.textPrimary }}>
                    Group members
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {contacts.map((contact) => {
                      const selected = newChatMembers.includes(contact.name);
                      return (
                        <button
                          key={contact.id}
                          type="button"
                          onClick={() => {
                            setNewChatMembers((prev) =>
                              prev.includes(contact.name)
                                ? prev.filter((name) => name !== contact.name)
                                : [...prev, contact.name]
                            );
                          }}
                          className="w-full rounded-2xl border px-4 py-3 text-left text-sm transition"
                          style={{
                            borderColor: selected ? t.btnPrimaryBg : t.inputBorder,
                            background: selected ? t.inputBg : "transparent"
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white overflow-hidden"
                              style={{ background: contact.color || t.btnPrimaryBg }}
                            >
                              {renderAvatarContent(contact.avatar)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium" style={{ color: t.textPrimary }}>
                                {contact.name}
                              </p>
                              <p className="truncate text-xs" style={{ color: t.textSecondary }}>
                                {contact.role}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="rounded-2xl px-4 py-2 text-sm font-semibold transition"
                  style={iconButtonStyle}
                  onClick={closeNewChatModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-2xl px-4 py-2 text-sm font-semibold transition"
                  style={primaryButtonStyle}
                  onClick={createChat}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSystem;