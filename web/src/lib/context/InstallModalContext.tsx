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
