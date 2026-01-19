import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';
import type { AlertColor } from '@mui/material';

interface Toast {
  id: string;
  message: string;
  severity: AlertColor;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, severity?: AlertColor, duration?: number) => void;
  showMilestone: (goalName: string, percentage: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, severity: AlertColor = 'success', duration: number = 6000) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, severity, duration }]);
  };

  const showMilestone = (goalName: string, percentage: number) => {
    const emoji = percentage === 100 ? '🎉' : percentage === 75 ? '🔥' : percentage === 50 ? '💪' : '🌟';
    const message = percentage === 100
      ? `${emoji} Congratulations! "${goalName}" is complete! 🎊`
      : `${emoji} Milestone reached! "${goalName}" is ${percentage}% funded!`;
    
    showToast(message, 'success', 8000);
  };

  const handleClose = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, showMilestone }}>
      {children}
      {toasts.map((toast, index) => (
        <Snackbar
          key={toast.id}
          open={true}
          autoHideDuration={toast.duration}
          onClose={() => handleClose(toast.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ 
            mt: index * 7,
            zIndex: 9999,
          }}
        >
          <Alert
            onClose={() => handleClose(toast.id)}
            severity={toast.severity}
            variant="filled"
            sx={{
              minWidth: 300,
              fontSize: '1rem',
              fontWeight: 500,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
}
