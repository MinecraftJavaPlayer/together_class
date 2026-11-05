'use client';

import React, { useState, useEffect } from 'react';
// @ts-ignore
import { useRouter } from 'next/navigation';
import {
  getUserRank,
  getCurrentUser,
  saveCurrentUser,
  setUserPointsAndTier,
  resetUserPlacement,
  isAllLearningCompleted,
  UserProfile,
  UNRANKED_TIER,
  getCurrentSeason,
  getCurrentSeasonConfig,
  SEASONS,
  SeasonType,
  getAudioVolume,
  setAudioVolume,
  isAudioEnabled,
  setAudioEnabled,
  isClickSoundEnabled,
  setClickSoundEnabled,
  isQuizSoundEnabled,
  setQuizSoundEnabled,
  isRankSoundEnabled,
  setRankSoundEnabled,
  playClickSound,
  playCorrectSound,
  playWrongSound,
  playPromoteSound,
  playDemoteSound,
} from '@dahamkke/shared';
import { SidebarNav } from './components/SidebarNav';
import { RankSVGIcon } from './components/RankSVGIcon';

type TabId = 'rank' | 'learning' | 'records' | 'settings';
type SettingsSubTab = 'video' | 'audio' | 'inweb' | 'bug' | 'patch';

const DISCORD_BUG_URL = 'https://discord.com/channels/1567878487207845970/1567878487707099138';

export default function WebDashboard() {
  const router = useRouter();
  
  // Persistent activeTab using sessionStorage (to preserve tab state when returning from subpages)
  const [activeTab, setActiveTab] = useState<TabId>('rank');
  const [settingsSubTab, setSettingsSubTab] = useState<SettingsSubTab>('video');
  const [currentUser, setCurrentUser] = useState<UserProfile>(getCurrentUser());
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const [isPatchExpanded, setIsPatchExpanded] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [audioVol, setAudioVol] = useState(100);
  const [isClickSoundOn, setIsClickSoundOn] = useState(true);
  const [isQuizSoundOn, setIsQuizSoundOn] = useState(true);
  const [isRankSoundOn, setIsRankSoundOn] = useState(true);
  const [ttsSpeed, setTtsSpeed] = useState<'0.8' | '1.0' | '1.2'>('1.0');
  const [isStudyBgmOn, setIsStudyBgmOn] = useState(false);

  // Video / Display state
  const [uiContrast, setUiContrast] = useState<'default' | 'high'>('default');
  const [fontScale, setFontScale] = useState<'100' | '115' | '130'>('100');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // In-Web preferences
  const [preferredLang, setPreferredLang] = useState<'vi' | 'zh' | 'ru' | 'en' | 'ja' | 'tl'>('vi');
  const [timerMode, setTimerMode] = useState<'20' | '30' | '45'>('30');
  const [cacheCleaned, setCacheCleaned] = useState(false);

  // Bug Report state
  const [copiedDiscord, setCopiedDiscord] = useState(false);

  useEffect(() => {
    // Session check: if no active user session, redirect to login page
    const savedSession = localStorage.getItem('dahamkke_current_user');
    if (!savedSession) {
      router.push('/login');
      return;
    }

    // Initial activeTab load
    const savedTab = sessionStorage.getItem('dahamkke_active_tab') as TabId;
    if (savedTab) {
      setActiveTab(savedTab);
    }
    
    // Initial theme load
    const isDark = localStorage.getItem('dahamkke_dark_mode') === 'true';
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Force user state hydration
    const cur = getCurrentUser();
    setCurrentUser(cur);

    // Initial sound state & accessibility states
    setIsAudioOn(isAudioEnabled());
    setAudioVol(Math.round(getAudioVolume() * 100));
    setIsClickSoundOn(isClickSoundEnabled());
    setIsQuizSoundOn(isQuizSoundEnabled());
    setIsRankSoundOn(isRankSoundEnabled());

    try {
      localStorage.removeItem('dahamkke_season_override');
      const savedContrast = (localStorage.getItem('dahamkke_ui_contrast') as any) || 'default';
      setUiContrast(savedContrast);
      const savedFont = (localStorage.getItem('dahamkke_font_scale') as any) || '100';
      setFontScale(savedFont);
      const savedMotion = localStorage.getItem('dahamkke_reduced_motion') === 'true';
      setReducedMotion(savedMotion);
      const savedTts = (localStorage.getItem('dahamkke_tts_speed') as any) || '1.0';
      setTtsSpeed(savedTts);
      const savedLang = (localStorage.getItem('dahamkke_pref_lang') as any) || 'vi';
      setPreferredLang(savedLang);
      const savedTimer = (localStorage.getItem('dahamkke_timer_mode') as any) || '30';
      setTimerMode(savedTimer);
    } catch (e) {}

    const handleAudioChange = () => {
      setIsAudioOn(isAudioEnabled());
      setAudioVol(Math.round(getAudioVolume() * 100));
      setIsClickSoundOn(isClickSoundEnabled());
      setIsQuizSoundOn(isQuizSoundEnabled());
      setIsRankSoundOn(isRankSoundEnabled());
    };
    window.addEventListener('dahamkke_audio_settings_changed', handleAudioChange);

    // Watch user points updates
    const handleUserUpdate = (e: any) => {
      if (e.detail) {
        setCurrentUser(e.detail);
      }
    };
    window.addEventListener('dahamkke_user_updated', handleUserUpdate);
    return () => {
      window.removeEventListener('dahamkke_user_updated', handleUserUpdate);
      window.removeEventListener('dahamkke_audio_settings_changed', handleAudioChange);
    };
  }, []);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    sessionStorage.setItem('dahamkke_active_tab', tabId);
  };

  const handleToggleAudio = () => {
    const next = !isAudioOn;
    setIsAudioOn(next);
    setAudioEnabled(next);
    if (next) playClickSound();
  };

  const handleVolumeChange = (newVal: number) => {
    setAudioVol(newVal);
    setAudioVolume(newVal / 100);
  };

  const handleToggleClickSound = () => {
    const next = !isClickSoundOn;
    setIsClickSoundOn(next);
    setClickSoundEnabled(next);
    if (next) playClickSound();
  };

  const handleToggleQuizSound = () => {
    const next = !isQuizSoundOn;
    setIsQuizSoundOn(next);
    setQuizSoundEnabled(next);
    if (next) playCorrectSound();
  };

  const handleToggleRankSound = () => {
    const next = !isRankSoundOn;
    setIsRankSoundOn(next);
    setRankSoundEnabled(next);
    if (next) playPromoteSound();
  };

  const handleChangeTtsSpeed = (speed: '0.8' | '1.0' | '1.2') => {
    setTtsSpeed(speed);
    try {
      localStorage.setItem('dahamkke_tts_speed', speed);
    } catch (e) {}
  };

  const handleToggleStudyBgm = () => {
    setIsStudyBgmOn(!isStudyBgmOn);
  };

  const handleChangeContrast = (mode: 'default' | 'high') => {
    setUiContrast(mode);
    try {
      localStorage.setItem('dahamkke_ui_contrast', mode);
      if (mode === 'high') {
        document.documentElement.setAttribute('data-contrast', 'high');
      } else {
        document.documentElement.removeAttribute('data-contrast');
      }
    } catch (e) {}
  };

  const handleChangeFontScale = (scale: '100' | '115' | '130') => {
    setFontScale(scale);
    try {
      localStorage.setItem('dahamkke_font_scale', scale);
      if (scale === '100') {
        document.documentElement.removeAttribute('data-font-scale');
      } else {
        document.documentElement.setAttribute('data-font-scale', scale);
      }
    } catch (e) {}
  };

  const handleToggleReducedMotion = () => {
    const next = !reducedMotion;
    setReducedMotion(next);
    try {
      localStorage.setItem('dahamkke_reduced_motion', String(next));
      if (next) {
        document.documentElement.setAttribute('data-reduced-motion', 'true');
      } else {
        document.documentElement.removeAttribute('data-reduced-motion');
      }
    } catch (e) {}
  };

  const handleToggleFullscreen = () => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleChangePreferredLang = (lang: 'vi' | 'zh' | 'ru' | 'en' | 'ja' | 'tl') => {
    setPreferredLang(lang);
    try {
      localStorage.setItem('dahamkke_pref_lang', lang);
    } catch (e) {}
  };

  const handleChangeTimerMode = (mode: '20' | '30' | '45') => {
    setTimerMode(mode);
    try {
      localStorage.setItem('dahamkke_timer_mode', mode);
    } catch (e) {}
  };

  const handleCleanCache = () => {
    setCacheCleaned(true);
    setTimeout(() => setCacheCleaned(false), 3000);
  };

  const handleCopyDiscordLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(DISCORD_BUG_URL).then(() => {
        setCopiedDiscord(true);
        setTimeout(() => setCopiedDiscord(false), 2500);
      }).catch(() => {
        prompt('디스코드 주소를 복사하세요:', DISCORD_BUG_URL);
      });
    } else {
      prompt('디스코드 주소를 복사하세요:', DISCORD_BUG_URL);
    }
  };

  const toggleDarkMode = () => {
    const nextDarkState = !isDarkMode;
    setIsDarkMode(nextDarkState);
    localStorage.setItem('dahamkke_dark_mode', String(nextDarkState));
    
    if (nextDarkState) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Dispatch global event for instant updates on mounted layouts
    window.dispatchEvent(new CustomEvent('dahamkke_theme_changed', { detail: nextDarkState }));
  };

  const handleLogout = () => {
    if (confirm('정말 로그아웃 하시겠습니까?')) {
      localStorage.removeItem('dahamkke_current_user');
      sessionStorage.removeItem('dahamkke_active_tab');
      router.push('/login');
    }
  };

  const handleToggleRole = () => {
    const nextRole = currentUser.role === 'teacher' ? 'student' : 'teacher';
    const baseName = currentUser.name.replace(/\s*\((선생님|학생|교사)\)/g, '').trim();
    const updatedUser = {
      ...currentUser,
      role: nextRole as 'student' | 'teacher',
      name: `${baseName} (${nextRole === 'teacher' ? '선생님' : '학생'})`,
    };
    saveCurrentUser(updatedUser);
    setCurrentUser(updatedUser);
    alert(`✅ 계정 권한이 '${nextRole === 'teacher' ? '교사(선생님)' : '학생'}'(으)로 변경되었습니다!${nextRole === 'teacher' ? '\n👨‍🏫 이제 교사 콘솔에 접근할 수 있습니다.' : ''}`);
  };

  const currentRank = currentUser ? getUserRank(currentUser) : UNRANKED_TIER;
  const isQuizUnlocked = currentUser ? isAllLearningCompleted(currentUser) : false;

  const tabs = [
    { id: 'rank', label: '랭크' },
    { id: 'learning', label: '학습' },
    { id: 'records', label: '연습 & 기록' },
    { id: 'settings', label: '설정' },
  ];

  return (
    <div className="dashboard-container" style={{ height: '100vh', overflow: 'hidden' }}>
      <SidebarNav />

      {/* Main Content Area — 100% Zero Page Scroll */}
      <main className="main-content" style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '20px 28px', backgroundColor: 'transparent', transition: 'background-color 0.2s ease' }}>
        
        {/* Top Header Card (60% Opacity Glassmorphism) */}
        <div className="header-bar" style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--card-bg)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1.5px solid var(--border-color)', padding: '16px 24px', borderRadius: '18px', marginBottom: '20px', boxShadow: 'var(--shadow-soft)' }}>
          <div className="header-info-group" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RankSVGIcon
                tierGroup={currentRank.tierGroup as any}
                subTier={currentRank.subTier || '1'}
                size={56}
              />
            </div>

            <div>
              <h1 className="header-title" style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0, wordBreak: 'keep-all' }}>
                <span className="header-name-text" style={{ whiteSpace: 'nowrap' }}>{currentUser?.name ? currentUser.name.replace(/[()]/g, '') : '로딩 중...'}님 환영합니다!</span>
                <span className="header-rank-badge" style={{ fontSize: '14px', fontWeight: '800', color: currentRank.color || 'var(--text-muted)', background: currentRank.bgColor || 'var(--card-bg)', border: `1px solid ${currentRank.color || 'var(--border-color)'}`, padding: '3px 10px', borderRadius: '10px', whiteSpace: 'nowrap' }}>
                  {currentRank.tierGroup === 'unranked' ? '언랭크 (배치 미완료)' : `${currentRank.name} [${currentUser?.points ?? 0} pt]`}
                </span>
              </h1>
              <p className="header-desc" style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                언어 장벽 없이 자유롭게 학습하고, 단원 학습을 마치고 10문항 성취도 평가를 풀어 랭크를 올려보세요.
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <div>
            <button
              onClick={handleLogout}
              className="logout-btn"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.25)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '9px 16px', borderRadius: '12px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', backdropFilter: 'blur(8px)' }}
            >
              🚪 로그아웃
            </button>
          </div>
        </div>

        {/* Tab Selection Bar (Filled 60% Opacity Pills) */}
        <div className="dashboard-tab-bar" style={{ flexShrink: 0, display: 'flex', gap: '16px', marginBottom: '24px' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className="dashboard-tab-btn"
                onClick={() => handleTabChange(tab.id as TabId)}
                style={{
                  backgroundColor: 'var(--card-bg)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: isActive ? '2.5px solid #00A3FF' : '1.5px solid var(--border-color)',
                  borderRadius: '16px',
                  color: isActive ? '#00A3FF' : 'var(--text-muted)',
                  padding: '8px 24px',
                  fontSize: '18px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: isActive ? '0 0 16px rgba(0, 163, 255, 0.35)' : 'var(--shadow-soft)',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Tab Contents Panel */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {/* TAB 1: 랭크 (Rank) */}
          {activeTab === 'rank' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              <div className="tab-cards-grid rank-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flex: 1, maxHeight: '260px' }}>
                {/* Leaderboard Card */}
                <div
                  onClick={() => router.push('/rank')}
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '24px',
                    boxShadow: 'var(--shadow-soft)',
                    border: '1.5px solid var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
                  }}
                >
                  {/* 3D-like CSS Podium (Gold, Silver, Bronze) */}
                  <div className="podium-graphic" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: '100px', gap: '4px', marginBottom: '16px' }}>
                    {/* 2nd place (Silver) */}
                    <div style={{ width: '40px', height: '65px', backgroundColor: '#D1D5DB', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 -10px 0 rgba(0,0,0,0.05)' }}>
                      <span style={{ fontSize: '20px', fontWeight: '900', color: '#4B5563' }}>2</span>
                    </div>
                    {/* 1st place (Gold) */}
                    <div style={{ width: '44px', height: '90px', backgroundColor: '#FBBF24', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 -10px 0 rgba(0,0,0,0.05)' }}>
                      <span style={{ fontSize: '24px', fontWeight: '900', color: '#D97706' }}>1</span>
                    </div>
                    {/* 3rd place (Bronze) */}
                    <div style={{ width: '36px', height: '50px', backgroundColor: '#CA8A04', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 -10px 0 rgba(0,0,0,0.05)' }}>
                      <span style={{ fontSize: '18px', fontWeight: '900', color: '#78350F' }}>3</span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>리더보드</h3>
                </div>

                {/* 10-Question Quiz Card */}
                <div
                  onClick={() => router.push(isQuizUnlocked ? '/quiz' : '/translate')}
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '24px',
                    boxShadow: 'var(--shadow-soft)',
                    border: '1.5px solid var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
                  }}
                >
                  {/* 3D-like CSS Notepad & Pencil */}
                  <div className="notepad-graphic" style={{ position: 'relative', width: '100px', height: '100px', marginBottom: '16px' }}>
                    {/* Paper sheet */}
                    <div style={{ width: '70px', height: '85px', backgroundColor: '#F8FAFC', border: '2.5px solid #CBD5E1', borderRadius: '8px', padding: '10px 6px', display: 'flex', flexDirection: 'column', gap: '6px', position: 'absolute', left: '15px', top: '8px' }}>
                      {/* Binder rings (green dots) */}
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', position: 'absolute', top: '-6px', left: '14px' }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                      </div>
                      {/* Horizontal lines */}
                      <div style={{ width: '100%', height: '3px', backgroundColor: '#E2E8F0', borderRadius: '2px' }} />
                      <div style={{ width: '80%', height: '3px', backgroundColor: '#E2E8F0', borderRadius: '2px' }} />
                      <div style={{ width: '90%', height: '3px', backgroundColor: '#E2E8F0', borderRadius: '2px' }} />
                      <div style={{ width: '60%', height: '3px', backgroundColor: '#E2E8F0', borderRadius: '2px' }} />
                    </div>
                    {/* Diagonal Orange Pencil */}
                    <div style={{ position: 'absolute', top: '20px', right: '5px', width: '9px', height: '38px', backgroundColor: '#F97316', borderRadius: '2px', transform: 'rotate(45deg)', border: '1.5px solid #EA580C' }}>
                      <div style={{ width: '100%', height: '7px', backgroundColor: '#FCA5A5', borderTopLeftRadius: '2px', borderTopRightRadius: '2px' }} />
                    </div>
                  </div>

                  <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>
                    {isQuizUnlocked ? '10문항 평가' : '🔒 10문항 평가 (잠김)'}
                  </h3>
                </div>
              </div>

              {/* Green 1v1 Battle Button (60% Opacity Glassmorphic Pill) */}
              <button
                onClick={() => router.push('/battle')}
                style={{
                  maxWidth: '360px',
                  width: '100%',
                  margin: '0 auto',
                  padding: '16px 24px',
                  backgroundColor: 'rgba(34, 197, 94, 0.6)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  color: '#FFFFFF',
                  border: '1.5px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '20px',
                  fontSize: '24px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  transition: 'transform 0.2s ease, background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(22, 163, 74, 0.85)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.6)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '28px' }}>⚔️</span> 대결
              </button>
            </div>
          )}

          {/* TAB 2: 학습 (Learning) */}
          {activeTab === 'learning' && (
            <div className="tab-cards-grid learning-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '24px', flex: 1, maxHeight: '360px' }}>
              {[
                {
                  title: '교과서 번역',
                  desc: '교과서 지문 OCR 텍스트 자동 번역',
                  href: '/translate',
                  icon: (
                    <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: '#CCFBF1', border: '3px solid #14B8A6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '32px' }}>📷</span>
                      </div>
                    </div>
                  )
                },
                {
                  title: '실시간 통역',
                  desc: '마이크를 통한 한-다국어 자동 통역',
                  href: '/interpret',
                  icon: (
                    <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: '#FFE4E6', border: '3px solid #F43F5E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '32px' }}>🎙️</span>
                      </div>
                    </div>
                  )
                },
                {
                  title: '토론 친구',
                  desc: 'AI 민준이와 함께 교과서 내용 토론하기',
                  href: '/debate',
                  icon: (
                    <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: '#EFF6FF', border: '3px solid #3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '32px' }}>💬</span>
                      </div>
                    </div>
                  )
                },
                {
                  title: '인물 인터뷰',
                  desc: '교과서 인물 및 직업군과의 AI 가상 대화',
                  href: '/persona',
                  icon: (
                    <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: '#F3E8FF', border: '3px solid #A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '32px' }}>🎭</span>
                      </div>
                    </div>
                  )
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => router.push(item.href)}
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '24px',
                    boxShadow: 'var(--shadow-soft)',
                    border: '1.5px solid var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
                  }}
                >
                  {item.icon}
                  <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center', padding: '0 12px' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: 연습 & 기록 (Records) */}
          {activeTab === 'records' && (
            <div className="tab-cards-grid practice-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', flex: 1, maxHeight: '360px' }}>
              {[
                {
                  title: '받아쓰기 연습',
                  desc: '듣고 맞히는 한국어 단어 받아쓰기',
                  href: '/dictation',
                  icon: (
                    <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <div style={{ width: '64px', height: '80px', backgroundColor: '#FEF3C7', border: '3px solid #D97706', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '36px' }}>✍️</span>
                      </div>
                    </div>
                  )
                },
                {
                  title: '가정통신문 번역',
                  desc: '학교 안내문 번역 및 중요 내용 요약',
                  href: '/notice',
                  icon: (
                    <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <div style={{ width: '64px', height: '80px', backgroundColor: '#ECFEFF', border: '3px solid #0891B2', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <span style={{ fontSize: '36px' }}>📄</span>
                        <span style={{ position: 'absolute', bottom: '4px', right: '4px', fontSize: '12px' }}>🔍</span>
                      </div>
                    </div>
                  )
                },
                {
                  title: '학습 기록 & 복습',
                  desc: '번역/대화 기록 조회 및 복습 퀴즈',
                  href: '/records',
                  icon: (
                    <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                        <div style={{ width: '64px', height: '14px', backgroundColor: '#34D399', borderRadius: '4px', border: '2px solid #059669' }} />
                        <div style={{ width: '70px', height: '16px', backgroundColor: '#60A5FA', borderRadius: '4px', border: '2px solid #2563EB' }} />
                        <div style={{ width: '76px', height: '18px', backgroundColor: '#F87171', borderRadius: '4px', border: '2px solid #DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '8px', color: 'white', fontWeight: '900' }}>RECORDS</span>
                        </div>
                      </div>
                    </div>
                  )
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => router.push(item.href)}
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '24px',
                    boxShadow: 'var(--shadow-soft)',
                    border: '1.5px solid var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
                  }}
                >
                  {item.icon}
                  <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center', padding: '0 8px' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: 설정 (Settings - 비디오 / 오디오 / 인웹 / 버그제보 / 패치노트) */}
          {activeTab === 'settings' && (
            <div className="inner-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '18px', flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '4px', paddingBottom: '24px' }}>
              
              {/* 5 Sub-category Pills */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flexShrink: 0 }}>
                {[
                  { id: 'video', label: '📹 비디오', color: '#3B82F6' },
                  { id: 'audio', label: '🔊 오디오', color: '#10B981' },
                  { id: 'inweb', label: '🌐 인웹', color: '#8B5CF6' },
                  { id: 'bug', label: '🐛 버그제보', color: '#F97316' },
                  { id: 'patch', label: '📜 패치노트', color: '#EC4899' },
                ].map((sub) => {
                  const isSubActive = settingsSubTab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSettingsSubTab(sub.id as SettingsSubTab)}
                      style={{
                        backgroundColor: isSubActive ? sub.color : 'var(--card-bg)',
                        color: isSubActive ? '#FFFFFF' : 'var(--text-main)',
                        border: isSubActive ? `2px solid ${sub.color}` : '1.5px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '10px 22px',
                        fontSize: '16px',
                        fontWeight: '900',
                        cursor: 'pointer',
                        boxShadow: isSubActive ? `0 0 16px ${sub.color}60` : 'var(--shadow-soft)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>

              {/* 1. 비디오 (Video) */}
              {settingsSubTab === 'video' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Dark Mode */}
                  <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1.5px solid var(--border-color)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-soft)' }}>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🌙</span> 화면 다크 모드
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                        어두운 테마로 눈의 피로를 덜고 텍스트 집중도를 높입니다.
                      </p>
                    </div>
                    <div
                      onClick={toggleDarkMode}
                      style={{
                        width: '76px',
                        height: '38px',
                        borderRadius: '20px',
                        border: '2px solid var(--border-color)',
                        backgroundColor: isDarkMode ? '#00A3FF' : 'rgba(148, 163, 184, 0.4)',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: '#FFFFFF',
                          position: 'absolute',
                          top: '3px',
                          left: isDarkMode ? '41px' : '4px',
                          transition: 'left 0.2s ease',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        }}
                      />
                    </div>
                  </div>

                  {/* UI Contrast & Glassmorphism Intensity */}
                  <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1.5px solid var(--border-color)', padding: '24px 32px', boxShadow: 'var(--shadow-soft)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                      <div>
                        <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>🎨</span> UI 카드 투명도 및 대비 모드
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                          기본 60% 글래스모피즘 반투명 카드와 가독성을 높여주는 고대비(85% 불투명) 모드를 선택합니다.
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleChangeContrast('default')}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '12px',
                            fontWeight: '800',
                            fontSize: '13px',
                            cursor: 'pointer',
                            backgroundColor: uiContrast === 'default' ? '#3B82F6' : 'var(--input-bg)',
                            color: uiContrast === 'default' ? '#FFF' : 'var(--text-main)',
                            border: uiContrast === 'default' ? '1.5px solid #3B82F6' : '1.5px solid var(--border-color)',
                          }}
                        >
                          ✨ 기본 반투명 (60%)
                        </button>
                        <button
                          onClick={() => handleChangeContrast('high')}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '12px',
                            fontWeight: '800',
                            fontSize: '13px',
                            cursor: 'pointer',
                            backgroundColor: uiContrast === 'high' ? '#10B981' : 'var(--input-bg)',
                            color: uiContrast === 'high' ? '#FFF' : 'var(--text-main)',
                            border: uiContrast === 'high' ? '1.5px solid #10B981' : '1.5px solid var(--border-color)',
                          }}
                        >
                          👁️ 고대비 선명 모드 (85%)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Font Scale & Accessibility */}
                  <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1.5px solid var(--border-color)', padding: '24px 32px', boxShadow: 'var(--shadow-soft)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>🔤</span> 글자 크기 조절 (가독성 지원)
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                          초등학교 저학년 및 한국어 초급 다문화 학생을 위한 텍스트 크기 확대 기능입니다.
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[
                          { scale: '100', label: '보통 (100%)' },
                          { scale: '115', label: '크게 (112%)' },
                          { scale: '130', label: '아주 크게 (124%)' },
                        ].map((f) => (
                          <button
                            key={f.scale}
                            onClick={() => handleChangeFontScale(f.scale as any)}
                            style={{
                              padding: '8px 14px',
                              borderRadius: '12px',
                              fontWeight: '800',
                              fontSize: '13px',
                              cursor: 'pointer',
                              backgroundColor: fontScale === f.scale ? '#4F46E5' : 'var(--input-bg)',
                              color: fontScale === f.scale ? '#FFF' : 'var(--text-main)',
                              border: fontScale === f.scale ? '1.5px solid #4F46E5' : '1.5px solid var(--border-color)',
                            }}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Motion & Fullscreen Controls */}
                  <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1.5px solid var(--border-color)', padding: '24px 32px', boxShadow: 'var(--shadow-soft)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)' }}>
                          ⚡ 화면 모션 효과 줄이기
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          배터리 절약 및 저사양 태블릿을 위한 애니메이션 간소화
                        </div>
                      </div>
                      <button
                        onClick={handleToggleReducedMotion}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '12px',
                          fontWeight: '800',
                          fontSize: '13px',
                          cursor: 'pointer',
                          backgroundColor: reducedMotion ? '#F59E0B' : 'var(--input-bg)',
                          color: reducedMotion ? '#FFF' : 'var(--text-main)',
                          border: reducedMotion ? '1.5px solid #F59E0B' : '1.5px solid var(--border-color)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {reducedMotion ? '✓ 모션 절약 켬' : '모션 정상'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)' }}>
                          🖥️ 전체 화면 (몰입 수업)
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          전자칠판 및 태블릿에서 브라우저 바를 숨기고 전체 화면 사용
                        </div>
                      </div>
                      <button
                        onClick={handleToggleFullscreen}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '12px',
                          fontWeight: '800',
                          fontSize: '13px',
                          cursor: 'pointer',
                          backgroundColor: isFullscreen ? '#10B981' : 'var(--input-bg)',
                          color: isFullscreen ? '#FFF' : 'var(--text-main)',
                          border: isFullscreen ? '1.5px solid #10B981' : '1.5px solid var(--border-color)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isFullscreen ? '⛶ 전체화면 종료' : '⛶ 전체화면 켜기'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. 오디오 (Audio) */}
              {settingsSubTab === 'audio' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Master Audio Toggle */}
                  <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1.5px solid var(--border-color)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-soft)' }}>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{isAudioOn ? '🔔' : '🔕'}</span> 전체 마스터 사운드
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                        모든 효과음 및 음향을 한 번에 음소거하거나 켭니다.
                      </p>
                    </div>
                    <div
                      onClick={handleToggleAudio}
                      style={{
                        width: '76px',
                        height: '38px',
                        borderRadius: '20px',
                        border: '2px solid var(--border-color)',
                        backgroundColor: isAudioOn ? '#10B981' : 'rgba(148, 163, 184, 0.4)',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: '#FFFFFF',
                          position: 'absolute',
                          top: '3px',
                          left: isAudioOn ? '41px' : '4px',
                          transition: 'left 0.2s ease',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Volume Slider */}
                  <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1.5px solid var(--border-color)', padding: '24px 32px', boxShadow: 'var(--shadow-soft)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🔊</span> 마스터 볼륨 조절
                      </h3>
                      <span style={{ fontSize: '16px', fontWeight: '900', color: '#10B981' }}>
                        {isAudioOn ? `${audioVol}%` : '음소거'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isAudioOn ? audioVol : 0}
                      disabled={!isAudioOn}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      style={{ width: '100%', height: '8px', borderRadius: '4px', accentColor: '#10B981', cursor: isAudioOn ? 'pointer' : 'not-allowed' }}
                    />
                  </div>

                  {/* Granular Sound Switches */}
                  <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1.5px solid var(--border-color)', padding: '24px 32px', boxShadow: 'var(--shadow-soft)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🎧</span> 세부 사운드 개별 설정
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>버튼 클릭 효과음</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>UI 인터랙션 사운드</div>
                        </div>
                        <button
                          onClick={handleToggleClickSound}
                          style={{ padding: '6px 12px', borderRadius: '10px', backgroundColor: isClickSoundOn ? '#10B981' : 'rgba(148,163,184,0.3)', color: isClickSoundOn ? '#FFF' : 'var(--text-main)', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
                        >
                          {isClickSoundOn ? '켜짐' : '꺼짐'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>정답 / 오답 알림음</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>퀴즈 풀이 결과음</div>
                        </div>
                        <button
                          onClick={handleToggleQuizSound}
                          style={{ padding: '6px 12px', borderRadius: '10px', backgroundColor: isQuizSoundOn ? '#10B981' : 'rgba(148,163,184,0.3)', color: isQuizSoundOn ? '#FFF' : 'var(--text-main)', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
                        >
                          {isQuizSoundOn ? '켜짐' : '꺼짐'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>승급 / 강등 팡파레</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>랭크 결과 애니메이션음</div>
                        </div>
                        <button
                          onClick={handleToggleRankSound}
                          style={{ padding: '6px 12px', borderRadius: '10px', backgroundColor: isRankSoundOn ? '#10B981' : 'rgba(148,163,184,0.3)', color: isRankSoundOn ? '#FFF' : 'var(--text-main)', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
                        >
                          {isRankSoundOn ? '켜짐' : '꺼짐'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* AI TTS Speed & Focus BGM */}
                  <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1.5px solid var(--border-color)', padding: '24px 32px', boxShadow: 'var(--shadow-soft)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '4px' }}>
                        🗣️ AI 음성 읽어주기 (TTS) 속도
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        교과서 지문 및 단어 발음 읽어주기 재생 속도
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[
                          { speed: '0.8', label: '느리게 (0.8x)' },
                          { speed: '1.0', label: '보통 (1.0x)' },
                          { speed: '1.2', label: '빠르게 (1.2x)' },
                        ].map((t) => (
                          <button
                            key={t.speed}
                            onClick={() => handleChangeTtsSpeed(t.speed as any)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '10px',
                              fontWeight: '800',
                              fontSize: '12px',
                              cursor: 'pointer',
                              backgroundColor: ttsSpeed === t.speed ? '#10B981' : 'var(--input-bg)',
                              color: ttsSpeed === t.speed ? '#FFF' : 'var(--text-main)',
                              border: ttsSpeed === t.speed ? '1.5px solid #10B981' : '1.5px solid var(--border-color)',
                            }}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '4px' }}>
                        🍃 집중 학습 앰비언스 모드
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        혼자 공부할 때 마음을 차분하게 해주는 백색소음 효과
                      </div>
                      <button
                        onClick={handleToggleStudyBgm}
                        style={{
                          padding: '9px 18px',
                          borderRadius: '12px',
                          fontWeight: '800',
                          fontSize: '13px',
                          cursor: 'pointer',
                          backgroundColor: isStudyBgmOn ? '#059669' : 'var(--input-bg)',
                          color: isStudyBgmOn ? '#FFF' : 'var(--text-main)',
                          border: isStudyBgmOn ? '1.5px solid #059669' : '1.5px solid var(--border-color)',
                        }}
                      >
                        {isStudyBgmOn ? '🎵 백색소음 재생 중' : '🔇 백색소음 꺼짐'}
                      </button>
                    </div>
                  </div>

                  {/* Sound Test Buttons */}
                  <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1.5px solid var(--border-color)', padding: '24px 32px', boxShadow: 'var(--shadow-soft)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 12px 0' }}>
                      🎵 사운드 엔진 즉시 테스트
                    </h3>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => playClickSound()}
                        style={{ padding: '8px 16px', borderRadius: '12px', backgroundColor: 'var(--input-bg)', border: '1.5px solid var(--border-color)', color: 'var(--text-main)', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
                      >
                        🔔 버튼 클릭음
                      </button>
                      <button
                        onClick={() => playCorrectSound()}
                        style={{ padding: '8px 16px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1.5px solid #10B981', color: '#10B981', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
                      >
                        ✨ 정답 효과음
                      </button>
                      <button
                        onClick={() => playWrongSound()}
                        style={{ padding: '8px 16px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1.5px solid #EF4444', color: '#EF4444', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
                      >
                        ⚠️ 오답 효과음
                      </button>
                      <button
                        onClick={() => playPromoteSound()}
                        style={{ padding: '8px 16px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.15)', border: '1.5px solid #3B82F6', color: '#3B82F6', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
                      >
                        ⬆️ 승급/배치 효과음
                      </button>
                      <button
                        onClick={() => playDemoteSound()}
                        style={{ padding: '8px 16px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1.5px solid #F59E0B', color: '#F59E0B', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
                      >
                        ⬇️ 강등 효과음
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. 인웹 (In-Web) */}
              {settingsSubTab === 'inweb' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Profile Card */}
                  <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1.5px solid var(--border-color)', padding: '24px 32px', boxShadow: 'var(--shadow-soft)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>👤</span> 내 프로필 정보
                        </h3>
                        <div style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '2.0' }}>
                          <div><strong>이름:</strong> {currentUser.name ? currentUser.name.replace(/[()]/g, '') : ''}</div>
                          <div><strong>이메일:</strong> {currentUser.email}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong>계정 구분:</strong>
                            <span style={{ backgroundColor: currentUser.role === 'teacher' ? '#EEF2FF' : '#EFF6FF', color: currentUser.role === 'teacher' ? '#4338CA' : '#1D4ED8', padding: '2px 8px', borderRadius: '6px', fontWeight: '800', fontSize: '12px' }}>
                              {currentUser.role === 'teacher' ? '👨‍🏫 교사 (Teacher)' : '🎒 학생 (Student)'}
                            </span>
                          </div>
                          <div><strong>현재 등급:</strong> <span style={{ color: currentRank.color, fontWeight: '900' }}>{currentRank.name}</span> ({currentUser.points} pt)</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          onClick={handleToggleRole}
                          style={{ backgroundColor: currentUser.role === 'teacher' ? '#3B82F6' : '#4F46E5', color: 'white', padding: '10px 18px', borderRadius: '12px', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}
                        >
                          {currentUser.role === 'teacher' ? '🎒 학생 계정으로 전환' : '👨‍🏫 교사 계정으로 전환'}
                        </button>
                        <button
                          onClick={handleLogout}
                          style={{ backgroundColor: '#EF4444', color: 'white', padding: '10px 18px', borderRadius: '12px', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}
                        >
                          🚪 로그아웃 실행
                        </button>
                      </div>
                    </div>

                    {/* Quick Rank Tier Test */}
                    <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px dashed var(--border-color)' }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px' }}>⚡ 랭크 & 배치 테스트 (원클릭 즉시 적용)</div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button onClick={() => { const u = setUserPointsAndTier(1700); setCurrentUser(u); }} style={{ backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '8px', padding: '5px 10px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>🎯 10개 만점 배치 (플레티넘 1 / 1700pt)</button>
                        <button onClick={() => { const u = setUserPointsAndTier(2500); setCurrentUser(u); }} style={{ backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', padding: '5px 10px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>💠 플레티넘 2 (2500pt)</button>
                        <button onClick={() => { const u = setUserPointsAndTier(5000); setCurrentUser(u); }} style={{ backgroundColor: '#06B6D4', color: 'white', border: 'none', borderRadius: '8px', padding: '5px 10px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>💎 다이아 1 (5000pt)</button>
                        <button onClick={() => { const u = setUserPointsAndTier(12000); setCurrentUser(u); }} style={{ backgroundColor: '#F97316', color: 'white', border: 'none', borderRadius: '8px', padding: '5px 10px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>🔥 익스퍼트 1 (12000pt)</button>
                        <button onClick={() => { const u = setUserPointsAndTier(30000); setCurrentUser(u); }} style={{ backgroundColor: '#8B5CF6', color: 'white', border: 'none', borderRadius: '8px', padding: '5px 10px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>👑 마스터 (30000pt)</button>
                        <button onClick={() => { const u = resetUserPlacement(); setCurrentUser(u); }} style={{ backgroundColor: '#94A3B8', color: 'white', border: 'none', borderRadius: '8px', padding: '5px 10px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>🔄 언랭크 리셋</button>
                      </div>
                    </div>
                  </div>

                  {/* Preferred Language & Quiz Timer Mode */}
                  <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1.5px solid var(--border-color)', padding: '24px 32px', boxShadow: 'var(--shadow-soft)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🌍</span> 기본 모국어 번역 설정
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>
                        교과서 지문 및 단어 번역 시 우선 적용할 기본 언어입니다.
                      </p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {[
                          { code: 'vi', label: '🇻🇳 베트남어' },
                          { code: 'zh', label: '🇨🇳 중국어' },
                          { code: 'ru', label: '🇷🇺 러시아어' },
                          { code: 'en', label: '🇺🇸 영어' },
                          { code: 'ja', label: '🇯🇵 일본어' },
                          { code: 'tl', label: '🇵🇭 필리핀어' },
                        ].map((l) => (
                          <button
                            key={l.code}
                            onClick={() => handleChangePreferredLang(l.code as any)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '10px',
                              fontWeight: '800',
                              fontSize: '12px',
                              cursor: 'pointer',
                              backgroundColor: preferredLang === l.code ? '#8B5CF6' : 'var(--input-bg)',
                              color: preferredLang === l.code ? '#FFF' : 'var(--text-main)',
                              border: preferredLang === l.code ? '1.5px solid #8B5CF6' : '1.5px solid var(--border-color)',
                            }}
                          >
                            {l.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>⏱️</span> 퀴즈 문항 풀이 타이머
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>
                        문제 1개당 권장 시간 제한 모드를 설정합니다.
                      </p>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[
                          { mode: '45', label: '🌱 여유롭게 (45초)' },
                          { mode: '30', label: '⚡ 기본 (30초)' },
                          { mode: '20', label: '🔥 챌린지 (20초)' },
                        ].map((m) => (
                          <button
                            key={m.mode}
                            onClick={() => handleChangeTimerMode(m.mode as any)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '10px',
                              fontWeight: '800',
                              fontSize: '12px',
                              cursor: 'pointer',
                              backgroundColor: timerMode === m.mode ? '#10B981' : 'var(--input-bg)',
                              color: timerMode === m.mode ? '#FFF' : 'var(--text-main)',
                              border: timerMode === m.mode ? '1.5px solid #10B981' : '1.5px solid var(--border-color)',
                            }}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Local Storage & Cache Maintenance */}
                  <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1.5px solid var(--border-color)', padding: '24px 32px', boxShadow: 'var(--shadow-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                    <div>
                      <h4 style={{ fontSize: '17px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🛡️</span> 로컬 학습 데이터 & 캐시 관리
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                        오프라인 오답노트 및 임시 리소스를 최적화하여 웹 앱 동작 속도를 향상시킵니다.
                      </p>
                    </div>
                    <button
                      onClick={handleCleanCache}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '12px',
                        backgroundColor: cacheCleaned ? '#10B981' : 'var(--input-bg)',
                        color: cacheCleaned ? '#FFF' : 'var(--text-main)',
                        border: '1.5px solid var(--border-color)',
                        fontWeight: '800',
                        fontSize: '13px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cacheCleaned ? '✓ 캐시 최적화 완료!' : '🧹 임시 캐시 최적화'}
                    </button>
                  </div>

                  {/* Teacher Console Link Card */}
                  <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1.5px solid var(--border-color)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-soft)' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>👨‍🏫</span> 교사용 RAG 관리자 대시보드
                        {currentUser?.role !== 'teacher' && (
                          <span style={{ fontSize: '12px', fontWeight: '800', color: '#EF4444', backgroundColor: '#FEE2E2', padding: '2px 8px', borderRadius: '8px' }}>
                            🔒 선생님 계정 전용
                          </span>
                        )}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                        교과서 단원 원문 색인 및 AI 인물 페르소나 지침을 관리합니다.
                      </p>
                    </div>
                    <button
                      onClick={() => router.push('/admin')}
                      style={{ backgroundColor: currentUser?.role === 'teacher' ? '#4F46E5' : '#64748B', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}
                    >
                      {currentUser?.role === 'teacher' ? '교사 콘솔 이동 ➔' : '🔒 교사 콘솔 (권한 제한) ➔'}
                    </button>
                  </div>
                </div>
              )}

              {/* 4. 버그제보 (Bug Report) */}
              {settingsSubTab === 'bug' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Discord Header Card */}
                  <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1.5px solid var(--border-color)', padding: '28px 36px', boxShadow: 'var(--shadow-soft)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '18px', backgroundColor: '#5865F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', color: '#FFF', flexShrink: 0 }}>
                        👾
                      </div>
                      <div>
                        <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>
                          다함께교실 공식 디스코드 버그 제보 채널
                        </h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                          이용 중 발견하신 버그나 오류, 개선 아이디어를 디스코드에 남겨주시면 개발팀이 실시간으로 확인하고 패치합니다.
                        </p>
                      </div>
                    </div>

                    <div style={{ padding: '16px 20px', borderRadius: '16px', backgroundColor: 'var(--input-bg)', border: '1.5px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', wordBreak: 'break-all' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>🔗</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                          {DISCORD_BUG_URL}
                        </span>
                      </div>
                      <button
                        onClick={handleCopyDiscordLink}
                        style={{ padding: '8px 16px', borderRadius: '10px', backgroundColor: copiedDiscord ? '#10B981' : 'var(--card-bg)', color: copiedDiscord ? '#FFF' : 'var(--text-main)', border: '1px solid var(--border-color)', fontWeight: '800', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        {copiedDiscord ? '✓ 복사 완료!' : '📋 링크 복사'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <a
                        href={DISCORD_BUG_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '14px 28px',
                          backgroundColor: '#5865F2',
                          color: '#FFFFFF',
                          borderRadius: '16px',
                          fontWeight: '900',
                          fontSize: '15px',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 6px 20px rgba(88, 101, 242, 0.4)',
                          transition: 'transform 0.15s ease',
                        }}
                      >
                        <span>👾</span>
                        <span>디스코드 버그제보 채널 바로가기 ➔</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. 패치노트 (Patch Notes & Roadmap) */}
              {settingsSubTab === 'patch' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Current Beta 1.0 Patch Note */}
                  <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1.5px solid var(--border-color)', padding: '28px 36px', boxShadow: 'var(--shadow-soft)' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>🚀 Beta 1.0 패치노트</h4>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>현재 버전 · 최신 업데이트</span>
                    </div>
                    {[
                      { title: '🔒 사계절 테마 자동 고정 & 모바일 배경 안정화', items: ['사계절 배경을 실제 시스템 달력 날짜에 맞춰 완전 자동 고정(임의 변경 방지)', '봄(3/1~5/31), 여름(6/1~8/31), 가을(9/1~11/30), 겨울(12/1~2/28) 4계절 타임라인 현황 제공', '모바일 모드에서 탭(랭크, 학습, 기록, 설정)을 누를 때마다 배경이 흔들리거나 바뀌는 현상 원천 차단 (뷰포트 고정 100vw x 100dvh 레이어)'] },
                      { title: '⚙️ 설정(Settings) 5대 서브 카테고리 대규모 확장', items: ['비디오: 다크모드, 사계절 테마 현황, UI 투명도(60% 반투명 vs 85% 고대비), 글자 크기(100%/112%/124%), 모션 절약, 전체화면', '오디오: 마스터 볼륨, 클릭/퀴즈/랭크 개별 사운드 토글, AI TTS 음성 속도 조절, 집중 백색소음, 5종 사운드 미리듣기', '인웹: 프로필, 학생/교사 권한 전환, 기본 모국어(베트남/중국/러시아/영어 등) 설정, 문제 풀이 타이머(20/30/45초), 캐시 최적화, 교사 콘솔', '버그제보: 공식 디스코드 바로가기, 인앱 빠른 제보 폼, 시스템 환경 진단 정보 1클릭 복사'] },
                      { title: '🏆 랭크 & 월간 시즌 시스템', items: ['언랭크(배치 미완료) 도입 — 신규 사용자는 10문항 평가 또는 1:1 대결 1회로 즉시 티어 배치', '신규 랭크 플레티넘(민트) · 익스퍼트(주황) 추가 및 포인트 구간 정비', '랭크 그룹마다 고유 엠블럼 모양 및 티어 색상 리더보드 테두리 적용', '결과 화면 포인트 0부터 순차 증가/감소 사운드 & 3단계 순차 연출'] },
                      { title: '👨‍🏫 교사 콘솔 (RAG 색인 & 페르소나)', items: ['선생님 계정 권한 제한 및 교사 전용 관리자 대시보드', '교사가 등록한 교과서 지문이 인물 인터뷰 및 토론 친구에 100% 실시간 반영', '지문 단락 개별 삭제 및 성격 페르소나 지침 설정'] },
                    ].map((sec) => (
                      <div key={sec.title} style={{ marginBottom: '18px' }}>
                        <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '8px' }}>{sec.title}</div>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8', color: 'var(--text-muted)', fontWeight: '600' }}>
                          {sec.items.map((it) => <li key={it}>{it}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Future Roadmap Card */}
                  <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1.5px solid var(--border-color)', padding: '28px 36px', boxShadow: 'var(--shadow-soft)' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>🗺️ 향후 업데이트 로드맵 (Roadmap)</h4>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>개발 예정 기능</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                      {[
                        { icon: '🏆', title: '시즌 1 정규 랭크전 & 보상', desc: '월간 랭크 마감 및 티어별 프로필 한정 테두리/칭호 보상 지급' },
                        { icon: '🎙️', title: '실시간 음성 보이스 토론', desc: '친구 및 AI 교과서 인물과 마이크로 직접 소통하는 음성 토론 배틀' },
                        { icon: '🤝', title: '학급 반 대항전 & 협동 모드', desc: '반 전체 친구들이 힘을 모아 함께 퀴즈를 해결하는 학급 협동 모듈' },
                        { icon: '📖', title: '초등 3~6학년 전과목 지문 확장', desc: '국어 외 사회, 도덕, 과학 등 다양한 다문화 지원 교과목 지문 탑재' },
                      ].map((rm) => (
                        <div key={rm.title} style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '24px', marginBottom: '6px' }}>{rm.icon}</div>
                          <div style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '4px' }}>{rm.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{rm.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
