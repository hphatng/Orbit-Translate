'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface InstallModalContextType {
  isOpen: boolean;
  openInstallModal: () => void;
  closeInstallModal: () => void;
}

const InstallModalContext = createContext<InstallModalContextType | undefined>(undefined);

export function InstallModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openInstallModal = useCallback(() => setIsOpen(true), []);
  const closeInstallModal = useCallback(() => setIsOpen(false), []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkParams = () => {
      const params = new URLSearchParams(window.location.search);
      const hasDownloadParam =
        params.has('download') ||
        params.has('install') ||
        params.get('action') === 'install' ||
        params.get('action') === 'download' ||
        window.location.hash.includes('install') ||
        window.location.hash.includes('download');

      if (hasDownloadParam) {
        setIsOpen(true);
      }
    };

    checkParams();
    window.addEventListener('hashchange', checkParams);
    window.addEventListener('popstate', checkParams);
    return () => {
      window.removeEventListener('hashchange', checkParams);
      window.removeEventListener('popstate', checkParams);
    };
  }, []);

  return (
    <InstallModalContext.Provider value={{ isOpen, openInstallModal, closeInstallModal }}>
      {children}
    </InstallModalContext.Provider>
  );
}

export function useInstallModal() {
  const context = useContext(InstallModalContext);
  if (!context) {
    throw new Error('useInstallModal must be used within an InstallModalProvider');
  }
  return context;
}
