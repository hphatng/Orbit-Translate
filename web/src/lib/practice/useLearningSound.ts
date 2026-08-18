'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useLearningSettings } from './LearningSettingsContext';

// Regex to detect Vietnamese characters
const VIETNAMESE_REGEX = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

export function useLearningSound() {
  const { settings } = useLearningSettings();
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const pendingSpeakTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and cache voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      try {
        const available = window.speechSynthesis.getVoices();
        if (available && available.length > 0) {
          voicesRef.current = available;
        }
      } catch {
        /* ignore */
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (pendingSpeakTimeoutRef.current) {
        clearTimeout(pendingSpeakTimeoutRef.current);
      }
    };
  }, []);

  const playTone = useCallback((frequency: number, type: OscillatorType, duration: number, vol = 0.08) => {
    if (!settings.soundEffects || typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(vol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);

      setTimeout(() => {
        try {
          ctx.close();
        } catch {
          /* ignore */
        }
      }, (duration + 0.1) * 1000);
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  }, [settings.soundEffects]);

  const playCorrect = useCallback(() => {
    // Pleasant ascending arpeggio (C5 -> E5)
    playTone(523.25, 'sine', 0.12, 0.08);
    setTimeout(() => playTone(659.25, 'sine', 0.22, 0.12), 90);
  }, [playTone]);

  const playIncorrect = useCallback(() => {
    // Low dull thud (G3 -> E3)
    playTone(196.00, 'triangle', 0.15, 0.12);
    setTimeout(() => playTone(164.81, 'triangle', 0.22, 0.12), 90);
  }, [playTone]);

  const playComplete = useCallback(() => {
    // Victory arpeggio (C5 -> E5 -> G5 -> C6)
    playTone(523.25, 'sine', 0.1, 0.08);
    setTimeout(() => playTone(659.25, 'sine', 0.1, 0.08), 80);
    setTimeout(() => playTone(783.99, 'sine', 0.1, 0.08), 160);
    setTimeout(() => playTone(1046.50, 'sine', 0.35, 0.12), 240);
  }, [playTone]);

  // Core speak engine with Chrome deadlock avoidance and language routing
  const executeSpeak = useCallback((text: string, explicitLang?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text?.trim()) return;

    if (pendingSpeakTimeoutRef.current) {
      clearTimeout(pendingSpeakTimeoutRef.current);
      pendingSpeakTimeoutRef.current = null;
    }

    // Determine target language (Vietnamese vs English)
    const isVi = explicitLang === 'vi-VN' || VIETNAMESE_REGEX.test(text);
    const targetLang = isVi ? 'vi-VN' : (explicitLang || 'en-US');

    // Chrome unpause safety check
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // Cancel active speech with a micro-timeout to avoid Chrome audio queue deadlock
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    pendingSpeakTimeoutRef.current = setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(text.trim());
        utterance.lang = targetLang;
        utterance.rate = isVi ? 1.0 : 0.95;
        utterance.pitch = 1.0;

        // Best voice matching
        const voices = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          if (isVi) {
            const viVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VI'));
            if (viVoice) utterance.voice = viVoice;
          } else {
            const enVoice = voices.find(v => (v.lang === 'en-US' || v.lang === 'en-GB') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Microsoft')));
            if (enVoice) utterance.voice = enVoice;
          }
        }

        // Prevent Chrome GC bug by holding reference until utterance ends
        (window as any).__orbit_active_utterance = utterance;

        utterance.onend = () => {
          (window as any).__orbit_active_utterance = null;
        };

        utterance.onerror = (e) => {
          (window as any).__orbit_active_utterance = null;
          // Ignore interruption errors when user quickly clicks next
          if (e.error !== 'interrupted' && e.error !== 'canceled') {
            console.warn('SpeechSynthesis error:', e.error);
          }
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('TTS execution error:', err);
      }
    }, 40);
  }, []);

  const speak = useCallback((text: string, lang?: string) => {
    if (!settings.autoPronounce) return;
    executeSpeak(text, lang);
  }, [settings.autoPronounce, executeSpeak]);

  const forceSpeak = useCallback((text: string, lang?: string) => {
    executeSpeak(text, lang);
  }, [executeSpeak]);

  return { playCorrect, playIncorrect, playComplete, speak, forceSpeak };
}
