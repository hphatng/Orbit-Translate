'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Mic, Shuffle, PlayCircle, BarChart3, Repeat, Settings2 } from 'lucide-react';
import { useLearningSettings } from '@/lib/practice/LearningSettingsContext';

interface LearningSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: string;
}

export default function LearningSettingsModal({ isOpen, onClose, currentMode }: LearningSettingsModalProps) {
  const { settings, updateSetting, resetToDefault } = useLearningSettings();

  const Toggle = ({ 
    label, 
    description, 
    checked, 
    onChange, 
    icon: Icon 
  }: { 
    label: string, 
    description?: string, 
    checked: boolean, 
    onChange: (val: boolean) => void,
    icon?: any
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 group">
      <div className="flex gap-3 items-center">
        {Icon && <Icon className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 transition-colors" />}
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#11131A] ${
          checked ? 'bg-indigo-500' : 'bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-4 top-20 bottom-4 w-[340px] bg-[#1A1D27] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
              <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-indigo-400" />
                Learning Settings
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 font-mono-data">Audio</h3>
                <div className="bg-white/[0.02] rounded-xl p-2 border border-white/5">
                  <Toggle
                    label="Sound effects"
                    description="Play sounds for correct/incorrect answers"
                    checked={settings.soundEffects}
                    onChange={(v) => updateSetting('soundEffects', v)}
                    icon={Volume2}
                  />
                  <Toggle
                    label="Auto-pronounce"
                    description="Speak vocabulary text automatically"
                    checked={settings.autoPronounce}
                    onChange={(v) => updateSetting('autoPronounce', v)}
                    icon={Mic}
                  />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 font-mono-data">Study Behavior</h3>
                <div className="bg-white/[0.02] rounded-xl p-2 border border-white/5">
                  <Toggle
                    label="Shuffle questions"
                    description="Randomize the order of vocabulary"
                    checked={settings.shuffleQuestions}
                    onChange={(v) => updateSetting('shuffleQuestions', v)}
                    icon={Shuffle}
                  />
                  <Toggle
                    label="Auto-advance"
                    description="Move to next question automatically"
                    checked={settings.autoAdvance}
                    onChange={(v) => updateSetting('autoAdvance', v)}
                    icon={PlayCircle}
                  />
                  <Toggle
                    label="Show progress"
                    description="Display the progress bar"
                    checked={settings.showProgress}
                    onChange={(v) => updateSetting('showProgress', v)}
                    icon={BarChart3}
                  />
                  {currentMode === 'quiz' && (
                    <Toggle
                      label="Repeat incorrect"
                      description="Ask wrong words again at the end"
                      checked={settings.repeatIncorrect}
                      onChange={(v) => updateSetting('repeatIncorrect', v)}
                      icon={Repeat}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-[#161821]">
              <button
                onClick={resetToDefault}
                className="w-full py-2.5 text-sm font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10"
              >
                Reset to default
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
