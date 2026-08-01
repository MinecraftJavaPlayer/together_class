'use client';

import { useEffect } from 'react';

export function ThemeWatcher() {
  useEffect(() => {
    // 1. Initial theme load on client-side mount
    const applyTheme = () => {
      const isDark = localStorage.getItem('dahamkke_dark_mode') === 'true';
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    applyTheme();

    // 2. Listen to custom theme change event
    const handleThemeChange = (e: any) => {
      if (e.detail === true) {
        document.documentElement.classList.add('dark');
      } else if (e.detail === false) {
        document.documentElement.classList.remove('dark');
      }
    };

    window.addEventListener('dahamkke_theme_changed', handleThemeChange as any);
    return () => window.removeEventListener('dahamkke_theme_changed', handleThemeChange as any);
  }, []);

  return null;
}
