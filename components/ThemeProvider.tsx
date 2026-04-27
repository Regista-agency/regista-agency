'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextValue {
  dark: boolean;
  toggle: () => void;
}

const ThemeCtx = createContext<ThemeContextValue>({ dark: false, toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return <ThemeCtx.Provider value={{ dark, toggle }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}
