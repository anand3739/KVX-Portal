import { describe, expect, it } from 'vitest';
import { getSupportedMimeType } from './audioUtils';

describe('getSupportedMimeType', () => {
  it('returns null when MediaRecorder is unavailable', () => {
    const originalMediaRecorder = global.MediaRecorder;
    delete global.MediaRecorder;

    try {
      expect(getSupportedMimeType()).toBeNull();
    } finally {
      global.MediaRecorder = originalMediaRecorder;
    }
  });

  it('prefers a supported mime type', () => {
    const originalMediaRecorder = global.MediaRecorder;
    global.MediaRecorder = class {
      static isTypeSupported(type) {
        return type === 'audio/webm;codecs=opus';
      }
    };

    try {
      expect(getSupportedMimeType()).toBe('audio/webm;codecs=opus');
    } finally {
      global.MediaRecorder = originalMediaRecorder;
    }
  });
});
