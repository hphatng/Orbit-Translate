'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface LearningSettings {
  soundEffects: boolean;
  autoPronounce: boolean;
  shuffleQuestions: boolean;
  autoAdvance: boolean;
  showProgress: boolean;
  repeatIncorrect: boolean;
}

const defaultSettings: LearningSettings = {
  soundEffects: true,
  autoPronounce: true,
  shuffleQuestions: true,
  autoAdvance: true,
  showProgress: true,
  repeatIncorrect: false,
};

interface LearningSettingsContextType {
  settings: LearningSettings;
  updateSetting: <K extends keyof LearningSettings>(key: K, value: LearningSettings[K]) => void;
  resetToDefault: () => void;
  isLoaded: boolean;
}

const LearningSettingsContext = createContext<LearningSettingsContextType>({
  settings: defaultSettings,
  updateSetting: () => {},
  resetToDefault: () => {},
  isLoaded: false,
});

export function LearningSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<LearningSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('orbit_learning_settings');
        if (stored) {
          return { ...defaultSettings, ...JSON.parse(stored) };
        }
      } catch {
        /* ignore */
      }
    }
    return defaultSettings;
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('orbit_learning_settings');
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Failed to load learning settings', e);
    }
    setIsLoaded(true);

    // Synchronize across multiple instances / tabs / modals
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'orbit_learning_settings' && e.newValue) {
        try {
          setSettings({ ...defaultSettings, ...JSON.parse(e.newValue) });
        } catch {
          /* ignore */
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const updateSetting = <K extends keyof LearningSettings>(key: K, value: LearningSettings[K]) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };
      try {
        localStorage.setItem('orbit_learning_settings', JSON.stringify(newSettings));
      } catch (e) {
        console.error('Failed to save learning settings', e);
      }
      return newSettings;
    });
  };

  const resetToDefault = () => {
    setSettings(defaultSettings);
    try {
      localStorage.setItem('orbit_learning_settings', JSON.stringify(defaultSettings));
    } catch {
      /* ignore */
    }
  };

  return (
    <LearningSettingsContext.Provider value={{ settings, updateSetting, resetToDefault, isLoaded }}>
      {children}
    </LearningSettingsContext.Provider>
  );
}

export function useLearningSettings() {
  return useContext(LearningSettingsContext);
}
