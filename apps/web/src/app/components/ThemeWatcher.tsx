'use client';

import { useEffect } from 'react';
import { playClickSound, unlockAudio, getCurrentSeason, SeasonType } from '@dahamkke/shared';

export function ThemeWatcher() {
  useEffect(() => {
    // Unlock audio engine on mount
    unlockAudio();

    // 1. Initial theme load on client-side mount
    const applyTheme = () => {
      const isDark = localStorage.getItem('dahamkke_dark_mode') === 'true';
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // 2. Initial season load on client-side mount (Strictly calendar-based, locked)
    const applySeason = () => {
      try {
        localStorage.removeItem('dahamkke_season_override');
      } catch (e) {}
      const season: SeasonType = getCurrentSeason();
      document.documentElement.setAttribute('data-season', season);
      document.documentElement.style.setProperty('--season-bg-desktop', `url('/backgrounds/desktop_${season}.jpg')`);
      document.documentElement.style.setProperty('--season-bg-mobile', `url('/backgrounds/mobile_${season}.jpg')`);
    };
    
    applyTheme();
    applySeason();

    // 3. Listen to custom theme change event
    const handleThemeChange = (e: any) => {
      if (e.detail === true) {
        document.documentElement.classList.add('dark');
      } else if (e.detail === false) {
        document.documentElement.classList.remove('dark');
      }
    };

    // 4. Listen to custom season change event
    const handleSeasonChange = () => {
      applySeason();
    };

    // 5. Global button click sound effect (Loud volume)
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        'button, a, [role="button"], input, select, label, .card, .clickable, .dashboard-tab-btn, .tab-cards-grid > div, .btn, [onclick]'
      );
      if (interactive) {
        playClickSound();
      }
    };

    window.addEventListener('dahamkke_theme_changed', handleThemeChange as any);
    window.addEventListener('dahamkke_season_changed', handleSeasonChange as any);
    window.addEventListener('click', handleGlobalClick, true);

    return () => {
      window.removeEventListener('dahamkke_theme_changed', handleThemeChange as any);
      window.removeEventListener('dahamkke_season_changed', handleSeasonChange as any);
      window.removeEventListener('click', handleGlobalClick, true);
    };
  }, []);

  return null;
}
