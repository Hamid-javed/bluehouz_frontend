//File: src\context\SnackbarContext.tsx

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';

export type SnackbarType = 'success' | 'error' | 'info' | 'warning';

interface Snackbar {
  id: number;
  message: string;
  type: SnackbarType;
  onUndo?: () => void;
}

interface SnackbarContextProps {
  showSnackbar: (message: string, type?: SnackbarType, onUndo?: () => void) => void;
}

const SnackbarContext = createContext<SnackbarContextProps | undefined>(undefined);

let idCounter = 0;

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snackbars, setSnackbars] = useState<Snackbar[]>([]);

  const removeSnackbar = (id: number) => {
    setSnackbars((prev) => prev.filter((snackbar) => snackbar.id !== id));
  };

  const showSnackbar = useCallback(
    (message: string, type: SnackbarType = 'info', onUndo?: () => void) => {
      const id = ++idCounter;
      setSnackbars((prev) => [...prev, { id, message, type, onUndo }]);
      setTimeout(() => removeSnackbar(id), 5000);
    },
    []
  );

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm w-full">
        {snackbars.map((snackbar) => {
          const styles = {
            success: {
              bg: 'bg-green-50 border border-green-300 text-gray-700',
              icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
            },
            error: {
              bg: 'bg-red-50 border border-red-300 text-gray-700',
              icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
            },
            info: {
              bg: 'bg-blue-50 border border-blue-300 text-gray-700',
              icon: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
            },
            warning: {
              bg: 'bg-yellow-50 border border-yellow-300 text-gray-700',
              icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />,
            },
          }[snackbar.type];

          return (
            <div
              key={snackbar.id}
              className={`flex items-start justify-between gap-3 rounded-md px-4 py-3 ${styles.bg}`}
            >
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 pt-0.5">{styles.icon}</div>
                <div className="text-sm font-medium leading-snug">{snackbar.message}</div>
              </div>
              {snackbar.onUndo && (
                <button
                  className="text-sm font-semibold underline hover:text-gray-900 transition"
                  onClick={() => {
                    snackbar.onUndo?.();
                    removeSnackbar(snackbar.id);
                  }}
                >
                  Undo
                </button>
              )}
            </div>
          );
        })}
      </div>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = (): SnackbarContextProps => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};
