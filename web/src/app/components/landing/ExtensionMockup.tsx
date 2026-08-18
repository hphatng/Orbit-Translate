'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, Copy, Star, Bell, Settings, X, MessageSquare, AlignLeft, ChevronUp } from 'lucide-react';

/**
 * ExtensionMockup — Precise pixel-perfect recreation of the Orbit Translate extension popup
 * with robust Web Speech API audio synthesis, Chrome GC protection, and audio feedback.
 */

interface ExtensionMockupProps {
  mode?: 'word' | 'sentence';
  className?: string;
  theme?: 'dark' | 'light';
}

export default function ExtensionMockup({ mode = 'word', className = '', theme = 'dark' }: ExtensionMockupProps) {
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      activeUtteranceRef.current = null;
    };
  }, []);

  const playOnlineFallback = useCallback((text: string, lang: 'en-US' | 'vi-VN', key: string) => {
    try {
      const tl = lang === 'vi-VN' ? 'vi' : 'en';
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tl}&client=tw-ob&q=${encodeURIComponent(text.slice(0, 100))}`;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setSpeakingKey((curr) => (curr === key ? null : curr));
        audioRef.current = null;
      };
      audio.onerror = () => {
        setSpeakingKey((curr) => (curr === key ? null : curr));
        audioRef.current = null;
      };
      audio.play().catch(() => {
        setSpeakingKey(null);
      });
    } catch {
      setSpeakingKey(null);
    }
  }, []);

  const fallbackWebSpeech = useCallback((text: string, lang: 'en-US' | 'vi-VN', key: string) => {
    if (typeof window === 'undefined') {
      setSpeakingKey(null);
      return;
    }

    if ('speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(text.trim());
        utterance.lang = lang;
        utterance.rate = lang === 'vi-VN' ? 0.95 : 0.92;

        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          if (lang === 'vi-VN') {
            const viVoice = voices.find((v) => v.lang.includes('vi') || v.lang.includes('VI'));
            if (viVoice) utterance.voice = viVoice;
          } else {
            const enVoice = voices.find(
              (v) =>
                (v.lang === 'en-US' || v.lang.startsWith('en')) &&
                (v.name.includes('Google') ||
                  v.name.includes('Natural') ||
                  v.name.includes('David') ||
                  v.name.includes('Zira') ||
                  v.name.includes('Samantha') ||
                  v.name.includes('Microsoft'))
            ) || voices.find((v) => v.lang.startsWith('en'));
            if (enVoice) utterance.voice = enVoice;
          }
        }

        activeUtteranceRef.current = utterance;

        utterance.onend = () => {
          activeUtteranceRef.current = null;
          setSpeakingKey((curr) => (curr === key ? null : curr));
        };

        utterance.onerror = (e) => {
          activeUtteranceRef.current = null;
          if (e.error !== 'interrupted' && e.error !== 'canceled') {
            playOnlineFallback(text, lang, key);
          } else {
            setSpeakingKey((curr) => (curr === key ? null : curr));
          }
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch {
        playOnlineFallback(text, lang, key);
        return;
      }
    }

    playOnlineFallback(text, lang, key);
  }, [playOnlineFallback]);

  const speak = useCallback((text: string, lang: 'en-US' | 'vi-VN', key: string) => {
    if (typeof window === 'undefined' || !text?.trim()) return;

    // Stop currently playing sound
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setSpeakingKey(key);

    // 1. Check for authentic high-definition dictionary audio for headwords
    const AUDIO_PRESETS: Record<string, string> = {
      'development': 'https://api.dictionaryapi.dev/media/pronunciations/en/development-us.mp3',
      'phát triển': 'https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=ph%C3%A1t%20tri%E1%BB%83n',
    };

    if (AUDIO_PRESETS[text]) {
      try {
        const audio = new Audio(AUDIO_PRESETS[text]);
        audioRef.current = audio;
        audio.onended = () => {
          setSpeakingKey((curr) => (curr === key ? null : curr));
          audioRef.current = null;
        };
        audio.onerror = () => {
          fallbackWebSpeech(text, lang, key);
        };
        audio.play().catch(() => {
          fallbackWebSpeech(text, lang, key);
        });
        return;
      } catch {
        fallbackWebSpeech(text, lang, key);
        return;
      }
    }

    // 2. Direct Web Speech API Execution (Synchronous within click event)
    fallbackWebSpeech(text, lang, key);
  }, [fallbackWebSpeech]);

  if (mode === 'sentence') {
    return <SentenceMockup className={className} theme={theme} speak={speak} speakingKey={speakingKey} />;
  }
  return <WordMockup className={className} theme={theme} speak={speak} speakingKey={speakingKey} />;
}

function WordMockup({ 
  className, 
  theme, 
  speak, 
  speakingKey 
}: { 
  className: string; 
  theme: 'dark' | 'light';
  speak: (text: string, lang: 'en-US' | 'vi-VN', key: string) => void;
  speakingKey: string | null;
}) {
  const isDark = theme === 'dark';

  return (
    <div 
      className={`relative select-none text-left rounded-[20px] p-5 shadow-2xl border ${
        isDark 
          ? 'bg-[#141416] text-white border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]' 
          : 'bg-white text-gray-900 border-gray-200 shadow-xl'
      } ${className}`}
    >
      {/* Top Arrow Pointer */}
      <div 
        className={`w-3.5 h-3.5 rotate-45 absolute -top-1.5 left-1/2 -translate-x-1/2 border-t border-l ${
          isDark ? 'bg-[#141416] border-white/10' : 'bg-white border-gray-200'
        }`}
      />

      {/* Extension Header / Top Bar */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>English</span>
          <span className="text-gray-500 text-xs">⇄</span>
          <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>Tiếng Việt</span>
        </div>
        <div className="flex items-center gap-3 text-gray-400">
          <Bell className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
          <Settings className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
          <X className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        
        {/* Word + Phonetic + Tags */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-2xl font-bold tracking-tight text-white font-heading">development</h2>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-gray-400 hover:text-yellow-400 cursor-pointer transition-colors" />
              <span className="px-2 py-0.5 rounded-md bg-[#2563EB] text-white text-[11px] font-bold">
                noun
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#D97706] text-white text-[11px] font-bold">
                C1
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 font-mono-data">
            <span className="text-[#38BDF8]">/dɪˈvɛləpmənt/</span>
            <button
              type="button"
              onClick={() => speak('development', 'en-US', 'word-en')}
              title="Phát âm tiếng Anh chuẩn (en-US)"
              className="p-1 rounded-md hover:bg-white/10 transition-all focus:outline-none flex items-center gap-1 text-xs"
            >
              <Volume2 className={`w-3.5 h-3.5 transition-all ${
                speakingKey === 'word-en' 
                  ? 'text-indigo-400 animate-bounce scale-125' 
                  : 'text-gray-400 hover:text-[#3B82F6]'
              }`} />
              {speakingKey === 'word-en' && (
                <span className="text-[10px] text-indigo-400 font-bold animate-pulse">Playing US...</span>
              )}
            </button>
          </div>
        </div>

        {/* Translation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#3B82F6]">phát triển</h3>
            <div className="flex items-center gap-2 text-gray-400">
              <button
                type="button"
                onClick={() => speak('phát triển', 'vi-VN', 'word-vi')}
                title="Đọc tiếng Việt (vi-VN)"
                className="p-1 rounded-md hover:bg-white/10 transition-all focus:outline-none flex items-center gap-1 text-xs"
              >
                <Volume2 className={`w-4 h-4 transition-all ${
                  speakingKey === 'word-vi' 
                    ? 'text-indigo-400 animate-bounce scale-125' 
                    : 'hover:text-white'
                }`} />
                {speakingKey === 'word-vi' && (
                  <span className="text-[10px] text-indigo-400 font-bold animate-pulse">Playing VI...</span>
                )}
              </button>
              <Copy className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#059669]/15 border border-[#10B981]/30 text-[11px] font-semibold text-[#10B981]">
            <Star className="w-3 h-3 fill-[#10B981]" />
            AI Translated
          </div>
        </div>

        <hr className="border-white/5" />

        {/* Context Examples */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3B82F6]">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ví dụ ngữ cảnh</span>
          </div>

          <div className="space-y-3.5 text-[13px] leading-relaxed">
            <div className="space-y-1">
              <div className="flex justify-between items-start">
                <p className="text-gray-200">
                  The <strong className="font-bold text-white">development</strong> of this story has been slow.
                </p>
                <button
                  type="button"
                  onClick={() => speak('The development of this story has been slow.', 'en-US', 'ex-1')}
                  title="Đọc câu ví dụ tiếng Anh"
                  className="p-1 rounded-md hover:bg-white/10 transition-all focus:outline-none flex-shrink-0 ml-2"
                >
                  <Volume2 className={`w-3.5 h-3.5 transition-all ${
                    speakingKey === 'ex-1' 
                      ? 'text-indigo-400 animate-bounce scale-125' 
                      : 'text-gray-500 hover:text-white'
                  }`} />
                </button>
              </div>
              <p className="text-[#3B82F6] italic text-[12.5px]">
                Sự phát triển của câu chuyện này đã chậm.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-start">
                <p className="text-gray-200">
                  The organism has reached a crucial stage in its <strong className="font-bold text-white">development</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => speak('The organism has reached a crucial stage in its development.', 'en-US', 'ex-2')}
                  title="Đọc câu ví dụ tiếng Anh"
                  className="p-1 rounded-md hover:bg-white/10 transition-all focus:outline-none flex-shrink-0 ml-2"
                >
                  <Volume2 className={`w-3.5 h-3.5 transition-all ${
                    speakingKey === 'ex-2' 
                      ? 'text-indigo-400 animate-bounce scale-125' 
                      : 'text-gray-500 hover:text-white'
                  }`} />
                </button>
              </div>
              <p className="text-[#3B82F6] italic text-[12.5px]">
                Các sinh vật đã đạt đến một giai đoạn quan trọng trong sự phát triển của nó.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function SentenceMockup({ 
  className, 
  theme, 
  speak, 
  speakingKey 
}: { 
  className: string; 
  theme: 'dark' | 'light';
  speak: (text: string, lang: 'en-US' | 'vi-VN', key: string) => void;
  speakingKey: string | null;
}) {
  const isDark = theme === 'dark';

  return (
    <div 
      className={`relative select-none text-left rounded-[20px] p-5 shadow-2xl border ${
        isDark 
          ? 'bg-[#141416] text-white border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]' 
          : 'bg-white text-gray-900 border-gray-200 shadow-xl'
      } ${className}`}
    >
      {/* Top Arrow Pointer */}
      <div 
        className={`w-3.5 h-3.5 rotate-45 absolute -top-1.5 left-1/2 -translate-x-1/2 border-t border-l ${
          isDark ? 'bg-[#141416] border-white/10' : 'bg-white border-gray-200'
        }`}
      />

      {/* Extension Header / Top Bar */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>English</span>
          <span className="text-gray-500 text-xs">⇄</span>
          <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>Tiếng Việt</span>
        </div>
        <div className="flex items-center gap-3 text-gray-400">
          <Bell className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
          <Settings className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
          <X className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        
        {/* Selected Sentence */}
        <div className="flex items-start justify-between gap-3">
          <p className="text-[13.5px] text-gray-200 leading-relaxed font-normal">
            The product development system for teams and agents
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => speak('The product development system for teams and agents', 'en-US', 'sent-en')}
              title="Đọc câu tiếng Anh"
              className="p-1 rounded-md hover:bg-white/10 transition-all focus:outline-none"
            >
              <Volume2 className={`w-3.5 h-3.5 transition-all ${
                speakingKey === 'sent-en' 
                  ? 'text-indigo-400 animate-bounce scale-125' 
                  : 'text-gray-400 hover:text-white'
              }`} />
            </button>
            <Star className="w-4 h-4 text-gray-400 hover:text-yellow-400 cursor-pointer flex-shrink-0" />
          </div>
        </div>

        {/* Translation */}
        <div className="space-y-2">
          <h3 className="text-[15px] font-bold text-[#3B82F6] leading-relaxed">
            Hệ thống phát triển sản phẩm cho đội ngũ và đại lý
          </h3>
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#059669]/15 border border-[#10B981]/30 text-[11px] font-semibold text-[#10B981]">
              <Star className="w-3 h-3 fill-[#10B981]" />
              AI Translated
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <button
                type="button"
                onClick={() => speak('Hệ thống phát triển sản phẩm cho đội ngũ và đại lý', 'vi-VN', 'sent-vi')}
                title="Đọc bản dịch tiếng Việt"
                className="p-1 rounded-md hover:bg-white/10 transition-all focus:outline-none flex items-center gap-1 text-xs"
              >
                <Volume2 className={`w-4 h-4 transition-all ${
                  speakingKey === 'sent-vi' 
                    ? 'text-indigo-400 animate-bounce scale-125' 
                    : 'hover:text-white'
                }`} />
                {speakingKey === 'sent-vi' && (
                  <span className="text-[10px] text-indigo-400 font-bold animate-pulse">Playing VI...</span>
                )}
              </button>
              <Copy className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
        </div>

        <hr className="border-white/5" />

        {/* Deep NLP Grammar Breakdown */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#3B82F6]">
            <div className="flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Phân tích ngữ pháp</span>
            </div>
            <ChevronUp className="w-4 h-4 text-gray-400" />
          </div>

          <ul className="space-y-3 text-[12.5px] leading-relaxed pl-1">
            <li className="flex items-start gap-2">
              <span className="text-[#3B82F6] font-bold">•</span>
              <div>
                <strong className="text-[#3B82F6] font-bold">Noun Phrase (Cụm danh từ)</strong>: &apos;The product development system&apos; là một cụm danh từ phức hợp với &apos;system&apos; là danh từ chính, được bổ nghĩa bởi cụm danh từ ghép &apos;product development&apos;.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#3B82F6] font-bold">•</span>
              <div>
                <strong className="text-[#3B82F6] font-bold">Prepositional Phrase (Cụm giới từ)</strong>: &apos;for teams and agents&apos; là cụm giới từ đóng vai trò hậu tố bổ nghĩa cho danh từ &apos;system&apos;, nhằm xác định đối tượng mục tiêu của hệ thống.
              </div>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
