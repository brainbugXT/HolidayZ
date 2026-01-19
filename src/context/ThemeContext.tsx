import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import type { PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

interface ThemeContextType {
  mode: PaletteMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }
  return context;
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  // Load theme preference from localStorage
  const [mode, setMode] = useState<PaletteMode>(() => {
    const saved = localStorage.getItem('holidayz-theme-mode');
    return (saved as PaletteMode) || 'light';
  });

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('holidayz-theme-mode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#4F46E5',
            light: '#7C3AED',
            dark: '#3730A3',
          },
          secondary: {
            main: '#10B981',
            light: '#34D399',
            dark: '#059669',
          },
          error: {
            main: '#EF4444',
          },
          warning: {
            main: '#F59E0B',
          },
          success: {
            main: '#10B981',
          },
          background: {
            default: mode === 'light' ? '#F9FAFB' : '#111827',
            paper: mode === 'light' ? '#FFFFFF' : '#1F2937',
          },
        },
        shape: {
          borderRadius: 12,
        },
        typography: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: mode === 'light' 
                  ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                  : '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
