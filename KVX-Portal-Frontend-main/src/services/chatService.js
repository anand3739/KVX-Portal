// src/services/chatService.js

import { CONTACTS, GROUPS, MESSAGES, THEME } from '../constants';
import { validateFile, createAttachment, simulateUploadProgress } from '../utils';
import { cleanupRecording } from '../utils/audioUtils';

class ChatService {
  constructor() {
    // Initialize with mock data
    this.contacts = [...CONTACTS];
    this.groups = [...GROUPS];
    this.messages = { ...MESSAGES };
    this.mediaRecorder = null;
    this.stream = null;
    this.audioChunks = [];
    this.recordingPromise = null;
    this._resolveRecording = null;
    this._rejectRecording = null;
    this._recordingTimeout = null;
    this._onStopCallback = null;
    this.isRecordingFinalized = false;
    this.theme = 'light';
  }

  // ─── CONTACT MANAGEMENT ──────────────────────────────────────────────
  
  getContacts() {
    return this.contacts;
  }

  getGroups() {
    return this.groups;
  }

  getContactById(id) {
    return this.contacts.find(c => c.id === id) || this.groups.find(g => g.id === id);
  }

  addContact(contactData) {
    const newContact = {
      id: Date.now(),
      name: contactData.name,
      avatar: contactData.name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      color: contactData.color || '#6366f1',
      online: contactData.online ?? true,
      unread: contactData.unread ?? 0,
      lastMsg: contactData.lastMsg || "Say hi to start the chat!",
      lastTime: contactData.lastTime || "Now",
      typing: false,
      role: contactData.role || "Member",
      ...contactData
    };
    this.contacts = [newContact, ...this.contacts];
    return newContact;
  }

  addGroup(groupData) {
    const memberCount = Array.isArray(groupData.members)
      ? groupData.members.length
      : Number(groupData.members) || 1;

    const newGroup = {
      id: Date.now(),
      name: groupData.name,
      avatar: groupData.name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      color: groupData.color || '#6366f1',
      members: memberCount,
      unread: 0,
      lastMsg: "Group created 🎉",
      lastTime: "now",
      typing: false,
      ...groupData
    };
    this.groups = [newGroup, ...this.groups];
    return newGroup;
  }

  // ─── MESSAGE MANAGEMENT ──────────────────────────────────────────────
  
  getMessages(chatId) {
    return this.messages[chatId] || [];
  }

  sendMessage(chatId, messageData) {
    const newMessage = {
      id: Date.now(),
      from: "me",
      text: messageData.text || '',
      time: new Date().toLocaleTimeString("en-US", { 
        hour: "2-digit", 
        minute: "2-digit" 
      }),
      mine: true,
      read: false,
      attachments: messageData.attachments || [],
      audio: messageData.audio || null,
      sent: true,
      delivered: true,
      ...messageData
    };

    // Initialize messages array if it doesn't exist
    if (!this.messages[chatId]) {
      this.messages[chatId] = [];
    }
    this.messages[chatId] = [...this.messages[chatId], newMessage];
    
    // Update last message in contact/group
    this.updateLastMessage(chatId, newMessage);
    
    return newMessage;
  }

  updateLastMessage(chatId, message) {
    const contact = this.contacts.find(c => c.id === chatId);
    if (contact) {
      contact.lastMsg = message.text || '📎 File attached';
      contact.lastTime = message.time;
      contact.unread = (contact.unread || 0) + 1;
      return;
    }
    
    const group = this.groups.find(g => g.id === chatId);
    if (group) {
      group.lastMsg = message.text || '📎 File attached';
      group.lastTime = message.time;
      group.unread = (group.unread || 0) + 1;
    }
  }

  markAsRead(chatId) {
    const contact = this.contacts.find(c => c.id === chatId);
    if (contact) {
      contact.unread = 0;
      return;
    }
    const group = this.groups.find(g => g.id === chatId);
    if (group) {
      group.unread = 0;
    }
  }

  // ─── FILE HANDLING ──────────────────────────────────────────────────
  
  validateAndAttachFile(file) {
    const validation = validateFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    const attachment = createAttachment(file);
    return { success: true, attachment };
  }

  simulateFileUpload(attachmentId, onProgress) {
    return simulateUploadProgress(attachmentId, onProgress);
  }

  removeAttachment(attachmentId, attachments) {
    return attachments.filter(a => a.id !== attachmentId);
  }

  // ─── AUDIO RECORDING ──────────────────────────────────────────────────
  
  async startRecording(onStop) {
    try {
      this.audioChunks = [];
      this.isRecordingFinalized = false;
      this._resolveRecording = null;
      this._rejectRecording = null;
      this._onStopCallback = onStop;
      this.recordingPromise = new Promise((resolve, reject) => {
        this._resolveRecording = resolve;
        this._rejectRecording = reject;
      });

      const { mediaRecorder, stream } = await import('../utils/audioUtils')
        .then((module) => module.startAudioRecording(
          (chunk) => this.audioChunks.push(chunk),
          (blob, url) => {
            if (this.isRecordingFinalized) return;
            const finalized = this._finalizeRecording(blob, url);
            if (this._onStopCallback) {
              this._onStopCallback(finalized.blob, finalized.url, this.audioChunks);
            }
          }
        ));

      this.mediaRecorder = mediaRecorder;
      this.stream = stream;
      this._recordingTimeout = window.setTimeout(() => {
        if (!this.isRecordingFinalized) {
          const finalized = this._finalizeRecording();
          if (this._onStopCallback) {
            this._onStopCallback(finalized.blob, finalized.url, this.audioChunks);
          }
        }
      }, 12000);

      return { success: true, mediaRecorder };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  _finalizeRecording(blob, url) {
    if (this.isRecordingFinalized) return { blob, url };
    this.isRecordingFinalized = true;
    clearTimeout(this._recordingTimeout);
    this._recordingTimeout = null;

    if (!blob) {
      const fallbackType = this.audioChunks[0]?.type || 'audio/webm';
      blob = new Blob(this.audioChunks, { type: fallbackType });
      url = URL.createObjectURL(blob);
    }

    if (this._resolveRecording) {
      this._resolveRecording({ blob, url, audioChunks: this.audioChunks });
      this._resolveRecording = null;
    }

    return { blob, url };
  }

  async stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      try {
        const result = await this.recordingPromise;
        return result;
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  cancelRecording() {
    cleanupRecording(this.mediaRecorder, this.recordingTimer);
    this.audioChunks = [];
    this.mediaRecorder = null;
    this.recordingTimer = null;
  }

  // ─── UTILITY ──────────────────────────────────────────────────────────
  
  getTotalUnread() {
    const contactUnread = this.contacts.reduce((sum, c) => sum + (c.unread || 0), 0);
    const groupUnread = this.groups.reduce((sum, g) => sum + (g.unread || 0), 0);
    return contactUnread + groupUnread;
  }

  searchContacts(query) {
    const all = [...this.contacts, ...this.groups];
    return all.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  // ─── THEME ─────────────────────────────────────────────────────────────
  
  getTheme(isDark) {
    return isDark ? THEME.dark : THEME.light;
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    return this.theme;
  }
}

// Create singleton instance
const chatService = new ChatService();
export default chatService;