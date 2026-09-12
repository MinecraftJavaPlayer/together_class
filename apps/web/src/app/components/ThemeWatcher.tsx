'use client';

import { useEffect } from 'react';
import { playClickSound } from '@dahamkke/shared';

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

    // 3. Global button click sound effect (Loud volume)
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('button, a, [role="button"], input[type="button"], input[type="submit"], .dashboard-tab-btn, .tab-cards-grid > div, .card, .btn');
      if (interactive) {
        playClickSound();
      }
    };

    window.addEventListener('dahamkke_theme_changed', handleThemeChange as any);
    window.addEventListener('click', handleGlobalClick, true);

    return () => {
      window.removeEventListener('dahamkke_theme_changed', handleThemeChange as any);
      window.removeEventListener('click', handleGlobalClick, true);
    };
  }, []);

  return null;
}

