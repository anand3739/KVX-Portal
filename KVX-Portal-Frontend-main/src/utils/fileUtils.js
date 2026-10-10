// src/utils/fileUtils.js

import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '../constants';

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (file) => {
  const type = file.type || '';
  const name = file.name || '';
  
  if (type.startsWith('image/')) return 'Image';
  if (type === 'application/pdf') return 'FileText';
  if (type.includes('word') || type.includes('document')) return 'FileText';
  if (type.includes('excel') || type.includes('spreadsheet')) return 'FileSpreadsheet';
  if (type.includes('powerpoint') || type.includes('presentation')) return 'FileText';
  if (type.startsWith('video/')) return 'FileVideo';
  if (type.startsWith('audio/')) return 'FileAudio';
  if (type.includes('zip') || type.includes('archive')) return 'FileArchive';
  return 'File';
};

export const getFileColor = (file) => {
  const type = file.type || '';
  
  if (type.startsWith('image/')) return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20';
  if (type === 'application/pdf') return 'text-red-500 bg-red-50 dark:bg-red-900/20';
  if (type.includes('word') || type.includes('document')) return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
  if (type.includes('excel') || type.includes('spreadsheet')) return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
  if (type.includes('powerpoint') || type.includes('presentation')) return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
  if (type.startsWith('video/')) return 'text-rose-500 bg-rose-50 dark:bg-rose-900/20';
  if (type.startsWith('audio/')) return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
  if (type.includes('zip') || type.includes('archive')) return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
  return 'text-gray-500 bg-gray-50 dark:bg-gray-800/30';
};

export const validateFile = (file) => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File "${file.name}" is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`
    };
  }
  
  const isValidType = ALLOWED_FILE_TYPES.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -2));
    }
    return file.type === type || file.name.endsWith(type.slice(1));
  });
  
  if (!isValidType) {
    return {
      valid: false,
      error: `File type "${file.type || file.name.split('.').pop()}" is not supported.`
    };
  }
  
  return { valid: true, error: null };
};

export const createAttachment = (file) => ({
  file,
  id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  name: file.name,
  size: file.size,
  type: file.type,
  url: URL.createObjectURL(file),
  progress: 100,
  status: 'ready'
});

export const simulateUploadProgress = (attachmentId, setUploadProgress) => {
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15 + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
    }
    setUploadProgress(prev => ({ 
      ...prev, 
      [attachmentId]: Math.min(progress, 100) 
    }));
  }, 150);
  
  return interval;
};

export const removeAttachmentById = (attachments, id) => {
  return attachments.filter(a => a.id !== id);
};