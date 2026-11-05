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
  const [seasonChoice, setSeasonChoice] = useState<string>('auto');
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

    // Initial sound & season state
    setIsAudioOn(isAudioEnabled());
    setAudioVol(Math.round(getAudioVolume() * 100));

    const savedSeason = localStorage.getItem('dahamkke_season_override');
    setSeasonChoice(savedSeason || 'auto');

    const handleSeasonChange = () => {
      const cur = localStorage.getItem('dahamkke_season_override');
      setSeasonChoice(cur || 'auto');
    };
    window.addEventListener('dahamkke_season_changed', handleSeasonChange);

    const handleAudioChange = () => {
      setIsAudioOn(isAudioEnabled());
      setAudioVol(Math.round(getAudioVolume() * 100));
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
      window.removeEventListener('dahamkke_season_changed', handleSeasonChange);
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

  const handleSelectSeason = (val: string) => {
    if (val === 'auto') {
      localStorage.removeItem('dahamkke_season_override');
      setSeasonChoice('auto');
    } else {
      localStorage.setItem('dahamkke_season_override', val);
      setSeasonChoice(val);
    }
    window.dispatchEvent(new CustomEvent('dahamkke_season_changed', { detail: val }));
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
                        어두운 테마로 눈의 피로를 덜고 집중도를 높입니다.
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

                  {/* Seasonal Themes */}
                  <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1.5px solid var(--border-color)', padding: '24px 32px', boxShadow: 'var(--shadow-soft)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                      <div>
                        <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>🎨</span> 사계절 배경 테마
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                          봄(3~5월), 여름(6~8월), 가을(9~11월), 겨울(12~2월) 날짜에 따라 배경이 자동 반영됩니다.
                        </p>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '4px 10px', borderRadius: '10px' }}>
                        현재: {getCurrentSeasonConfig().icon} {getCurrentSeasonConfig().name} ({getCurrentSeasonConfig().dateRange})
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleSelectSeason('auto')}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '12px',
                          fontWeight: '800',
                          fontSize: '13px',
                          cursor: 'pointer',
                          backgroundColor: seasonChoice === 'auto' ? '#10B981' : 'var(--input-bg)',
                          color: seasonChoice === 'auto' ? '#FFF' : 'var(--text-main)',
                          border: seasonChoice === 'auto' ? '1.5px solid #10B981' : '1.5px solid var(--border-color)',
                        }}
                      >
                        🔄 날짜 기준 자동 (기본)
                      </button>
                      {(['spring', 'summer', 'autumn', 'winter'] as SeasonType[]).map((s) => {
                        const cfg = SEASONS[s];
                        const isSelected = seasonChoice === s;
                        return (
                          <button
                            key={s}
                            onClick={() => handleSelectSeason(s)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '12px',
                              fontWeight: '800',
                              fontSize: '13px',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? '#3B82F6' : 'var(--input-bg)',
                              color: isSelected ? '#FFF' : 'var(--text-main)',
                              border: isSelected ? '1.5px solid #3B82F6' : '1.5px solid var(--border-color)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>{cfg.icon}</span>
                            <span>{cfg.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* UI Glassmorphism Info */}
                  <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1.5px solid var(--border-color)', padding: '20px 32px', boxShadow: 'var(--shadow-soft)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '32px' }}>✨</span>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text-main)' }}>
                        60% 투명도 글래스모피즘(Glassmorphism) UI
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        모든 카드와 버튼의 투명도를 60%로 최적화하고 뷰포트 고정 배경을 적용하여, 모바일과 데스크톱 어디서나 탭 전환 시 배경 흔들림 없이 선명하게 투과됩니다.
                      </div>
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
                        <span>{isAudioOn ? '🔔' : '🔕'}</span> 전체 효과음
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                        버튼 클릭음, 퀴즈 정답/오답, 랭크 승급/강등 등 모든 시스템 효과음을 켜거나 끕니다.
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

                  {/* Sound Test Buttons */}
                  <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1.5px solid var(--border-color)', padding: '24px 32px', boxShadow: 'var(--shadow-soft)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 12px 0' }}>
                      🎵 효과음 미리듣기 테스트
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
              )}

              {/* 5. 패치노트 (Patch Notes) */}
              {settingsSubTab === 'patch' && (
                <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1.5px solid var(--border-color)', padding: '28px 36px', boxShadow: 'var(--shadow-soft)' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>🚀 Beta 1.0 패치노트</h4>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>현재 버전 · 첫 베타 출시</span>
                  </div>
                  {[
                    { title: '🏆 랭크 & 월간 시즌 시스템', items: ['언랭크(배치 미완료) 도입 — 배치 전 모든 계정은 언랭크로 시작', '10문항 평가 또는 1:1 대결 1회로 즉시 티어 배치 (브론즈 1 ~ 플레티넘 1)', '신규 랭크 플레티넘(민트) · 익스퍼트(주황) 추가 및 포인트 구간 정비', '랭크 그룹마다 고유 엠블럼 모양 및 티어 색상 리더보드 테두리 적용', '결과 화면 포인트 카운트업/카운트다운 사운드 및 애니메이션'] },
                    { title: '🎨 사계절 반응형 배경 & 글래스모피즘', items: ['봄(3~5월), 여름(6~8월), 가을(9~11월), 겨울(12~2월) 실시간 계절 배경 자동 반영', '뷰포트 고정(Fixed) 반응형 배경 — 모바일에서 탭(랭크, 학습, 기록, 설정)을 누를 때마다 배경이 흔들리거나 바뀌는 현상 원천 차단', 'UI 카드 및 버튼 60% 투명도 글래스모피즘(Glassmorphism) 적용'] },
                    { title: '👨‍🏫 교사 콘솔 (RAG 색인 & 페르소나)', items: ['선생님 계정 권한 제한 및 교사 전용 관리자 대시보드', '교사가 등록한 교과서 지문이 인물 인터뷰 및 토론 친구에 100% 실시간 반영', '지문 단락 개별 삭제 및 성격 페르소나 지침 설정'] },
                    { title: '🌐 다국어 학습 모듈', items: ['교과서 지문 OCR 촬영 및 6개국 언어 병렬 번역', '마이크 실시간 음성 통역 & 짝꿍 대화 모드', '가상 초등 한국인 친구 민준이와의 AI 존중 토론', '교과서 인물(흥부, 이순신 등) 1인칭 가상 인터뷰', '단어 듣고 쓰기 받아쓰기 및 글자 따라쓰기'] },
                    { title: '⚙️ 설정 세분화 & 사운드 엔진', items: ['설정을 비디오, 오디오, 인웹, 버그제보, 패치노트로 5단 세분화', '효과음 On/Off 토글 및 볼륨 슬라이더 조절 지원', '공식 디스코드 버그제보 채널 링크 연동'] },
                  ].map((sec) => (
                    <div key={sec.title} style={{ marginBottom: '18px' }}>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '8px' }}>{sec.title}</div>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8', color: 'var(--text-muted)', fontWeight: '600' }}>
                        {sec.items.map((it) => <li key={it}>{it}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
