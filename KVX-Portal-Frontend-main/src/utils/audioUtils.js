// src/utils/audioUtils.js

export const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getSupportedMimeType = () => {
  if (typeof MediaRecorder === 'undefined') {
    return null;
  }

  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
    'audio/mpeg'
  ];

  for (const mimeType of candidates) {
    if (MediaRecorder.isTypeSupported?.(mimeType)) {
      return mimeType;
    }
  }

  return null;
};

export const startAudioRecording = async (onDataAvailable, onStop) => {
  if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
    throw new Error('This browser does not support microphone access.');
  }

  if (typeof MediaRecorder === 'undefined') {
    throw new Error('This browser does not support audio recording.');
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    const mimeType = getSupportedMimeType();
    const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data?.size > 0) {
        audioChunks.push(event.data);
        if (onDataAvailable) onDataAvailable(event.data);
      }
    };

    mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event.error || event);
    };

    mediaRecorder.onstop = () => {
      try {
        const fallbackType = audioChunks[0]?.type || mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunks, { type: fallbackType });
        const url = URL.createObjectURL(audioBlob);
        if (onStop) onStop(audioBlob, url, audioChunks);
      } finally {
        stream.getTracks().forEach(track => track.stop());
      }
    };

    mediaRecorder.start(100);

    return {
      mediaRecorder,
      stream,
      audioChunks
    };
  } catch (error) {
    console.error('Microphone access denied:', error);
    if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
      throw new Error('Microphone access is required to record audio. Please allow microphone access in your browser settings.');
    }
    throw new Error('Failed to start recording: ' + (error?.message || 'Unknown error'));
  }
};

export const cleanupRecording = (mediaRecorder, timerInterval, url) => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
  }
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  if (url) {
    URL.revokeObjectURL(url);
  }
};

export const setupAudioPlayer = (audioElement, url, onProgress, onEnd, onError) => {
  if (!audioElement) return null;
  
  audioElement.pause();
  audioElement.currentTime = 0;
  audioElement.src = url;
  audioElement.load();
  
  const handleTimeUpdate = () => {
    if (audioElement && !isNaN(audioElement.duration) && audioElement.duration > 0) {
      const progress = (audioElement.currentTime / audioElement.duration) * 100;
      if (onProgress) onProgress(Math.min(progress, 100));
    }
  };
  
  const handleEnded = () => {
    audioElement.currentTime = 0;
    if (onEnd) onEnd();
  };
  
  const handleError = (e) => {
    console.error('Audio playback error:', e);
    if (onError) onError(e);
  };
  
  audioElement.addEventListener('timeupdate', handleTimeUpdate);
  audioElement.addEventListener('ended', handleEnded);
  audioElement.addEventListener('error', handleError);
  
  return () => {
    audioElement.removeEventListener('timeupdate', handleTimeUpdate);
    audioElement.removeEventListener('ended', handleEnded);
    audioElement.removeEventListener('error', handleError);
    audioElement.pause();
    audioElement.currentTime = 0;
  };
};

export const getAudioDuration = (url) => {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
    });
    audio.addEventListener('error', () => {
      reject(new Error('Failed to load audio'));
    });
    audio.load();
  });
};