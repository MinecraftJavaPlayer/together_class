'use client';

import React, { useState, useEffect } from 'react';
// @ts-ignore
import { useRouter } from 'next/navigation';
import {
  getUserRank,
  getCurrentUser,
  isAllLearningCompleted,
  UserProfile,
} from '@dahamkke/shared';
import { SidebarNav } from './components/SidebarNav';
import { RankSVGIcon } from './components/RankSVGIcon';

type TabId = 'rank' | 'learning' | 'records' | 'settings';

export default function WebDashboard() {
  const router = useRouter();
  
  // Persistent activeTab using sessionStorage (to preserve tab state when returning from subpages)
  const [activeTab, setActiveTab] = useState<TabId>('rank');
  const [currentUser, setCurrentUser] = useState<UserProfile>(getCurrentUser());
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(false);

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

    // Watch user points updates
    const handleUserUpdate = (e: any) => {
      if (e.detail) {
        setCurrentUser(e.detail);
      }
    };
    window.addEventListener('dahamkke_user_updated', handleUserUpdate);
    return () => window.removeEventListener('dahamkke_user_updated', handleUserUpdate);
  }, []);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    sessionStorage.setItem('dahamkke_active_tab', tabId);
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

  const currentRank = currentUser ? getUserRank(currentUser) : { name: '브론즈 1', tierGroup: 'bronze', subTier: '1', minPoints: 0, maxPoints: 19, bgColor: '#FEF3C7', color: '#CD7F32' };
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
      <main className="main-content" style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '20px 28px', backgroundColor: 'var(--bg-main)', transition: 'background-color 0.2s ease' }}>
        
        {/* Top Header Card */}
        <div className="header-bar" style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--card-bg)', border: '1.5px solid var(--border-color)', padding: '16px 24px', borderRadius: '18px', marginBottom: '20px', boxShadow: 'var(--shadow-soft)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <RankSVGIcon
              tierGroup={currentRank.tierGroup as any}
              subTier={currentRank.subTier || '1'}
              size={56}
            />

            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                {currentUser?.name ? currentUser.name.replace(/[()]/g, '') : '로딩 중...'}님 환영합니다!
                  <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', background: currentRank.bgColor, border: `1px solid ${currentRank.color}`, padding: '3px 10px', borderRadius: '10px' }}>
                    {currentRank.name} [{currentUser?.points ?? 0} pt]
                  </span>
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                언어 장벽 없이 자유롭게 학습하고, 단원 학습을 마치고 10문항 성취도 평가를 풀어 랭크를 올려보세요.
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <div>
            <button
              onClick={handleLogout}
              style={{ backgroundColor: '#FEE2E2', color: '#EF4444', border: '1px solid #FCA5A5', padding: '9px 16px', borderRadius: '12px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              🚪 로그아웃
            </button>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div className="dashboard-tab-bar" style={{ flexShrink: 0, display: 'flex', gap: '16px', marginBottom: '24px' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className="dashboard-tab-btn"
                onClick={() => handleTabChange(tab.id as TabId)}
                style={{
                  backgroundColor: 'transparent',
                  border: isActive ? '3.5px solid #00A3FF' : '3.5px solid var(--border-color)',
                  borderRadius: '24px',
                  color: isActive ? '#00A3FF' : 'var(--text-muted)',
                  padding: '10px 32px',
                  fontSize: '24px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: isActive ? '0 6px 16px rgba(0, 163, 255, 0.15)' : 'none',
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
            <div className="tab-cards-grid rank-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flex: 1, maxHeight: '360px' }}>
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
                  padding: '32px',
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
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: '120px', gap: '4px', marginBottom: '24px' }}>
                  {/* 2nd place (Silver) */}
                  <div style={{ width: '44px', height: '80px', backgroundColor: '#D1D5DB', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 -10px 0 rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: '24px', fontWeight: '900', color: '#4B5563' }}>2</span>
                  </div>
                  {/* 1st place (Gold) */}
                  <div style={{ width: '48px', height: '110px', backgroundColor: '#FBBF24', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 -10px 0 rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: '28px', fontWeight: '900', color: '#D97706' }}>1</span>
                  </div>
                  {/* 3rd place (Bronze) */}
                  <div style={{ width: '40px', height: '60px', backgroundColor: '#CA8A04', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 -10px 0 rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: '20px', fontWeight: '900', color: '#78350F' }}>3</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>리더보드</h3>
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
                  padding: '32px',
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
                <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '24px' }}>
                  {/* Paper sheet */}
                  <div style={{ width: '80px', height: '100px', backgroundColor: '#F8FAFC', border: '2.5px solid #CBD5E1', borderRadius: '8px', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'absolute', left: '20px', top: '10px' }}>
                    {/* Binder rings (green dots) */}
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', position: 'absolute', top: '-6px', left: '16px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                    </div>
                    {/* Horizontal lines */}
                    <div style={{ width: '100%', height: '3px', backgroundColor: '#E2E8F0', borderRadius: '2px' }} />
                    <div style={{ width: '80%', height: '3px', backgroundColor: '#E2E8F0', borderRadius: '2px' }} />
                    <div style={{ width: '90%', height: '3px', backgroundColor: '#E2E8F0', borderRadius: '2px' }} />
                    <div style={{ width: '60%', height: '3px', backgroundColor: '#E2E8F0', borderRadius: '2px' }} />
                  </div>
                  {/* Diagonal Orange Pencil */}
                  <div style={{ position: 'absolute', top: '25px', right: '5px', width: '10px', height: '42px', backgroundColor: '#F97316', borderRadius: '2px', transform: 'rotate(45deg)', border: '1.5px solid #EA580C' }}>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#FCA5A5', borderTopLeftRadius: '2px', borderTopRightRadius: '2px' }} />
                  </div>
                </div>

                <h3 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>
                  {isQuizUnlocked ? '10문항 평가' : '🔒 10문항 평가 (잠김)'}
                </h3>
              </div>
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

          {/* TAB 4: 설정 (Settings) */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              
              {/* Row 1: 다크 모드 */}
              <div
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: '24px',
                  boxShadow: 'var(--shadow-soft)',
                  border: '2.5px solid var(--border-color)',
                  padding: '20px 36px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-main)' }}>다크 모드</span>
                
                {/* On/Off Switch */}
                <div
                  onClick={toggleDarkMode}
                  style={{
                    width: '80px',
                    height: '40px',
                    borderRadius: '20px',
                    border: '3px solid #000000',
                    backgroundColor: isDarkMode ? '#00A3FF' : '#C5C5C5',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      border: '3px solid #000000',
                      backgroundColor: '#FFFFFF',
                      position: 'absolute',
                      top: '2px',
                      left: isDarkMode ? '42px' : '2px',
                      transition: 'left 0.2s ease',
                    }}
                  />
                </div>
              </div>

              {/* Row 2: 교사 콘솔 */}
              <div>
                <div
                  onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '24px',
                    boxShadow: 'var(--shadow-soft)',
                    border: '2.5px solid var(--border-color)',
                    padding: '20px 36px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-main)' }}>교사 콘솔</span>
                  <span
                    style={{
                      fontSize: '36px',
                      fontWeight: '900',
                      color: 'var(--text-main)',
                      transform: isConsoleExpanded ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    ∨
                  </span>
                </div>

                {isConsoleExpanded && (
                  <div
                    style={{
                      backgroundColor: 'var(--bg-main)',
                      border: '1.5px solid var(--border-color)',
                      borderRadius: '24px',
                      padding: '24px 36px',
                      marginTop: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>👨‍🏫 교사용 RAG 관리자 대시보드</h4>
                      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px', marginBottom: 0 }}>
                        교안 자료(PDF) 파일을 업로드하여 AI 인물 인터뷰의 지식 범위를 학습 및 관리합니다.
                      </p>
                    </div>
                    <button
                      onClick={() => router.push('/admin')}
                      style={{
                        backgroundColor: '#4F46E5',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      교사 콘솔 이동 ➔
                    </button>
                  </div>
                )}
              </div>

              {/* Row 3: 내 정보 */}
              <div>
                <div
                  onClick={() => setIsInfoExpanded(!isInfoExpanded)}
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '24px',
                    boxShadow: 'var(--shadow-soft)',
                    border: '2.5px solid var(--border-color)',
                    padding: '20px 36px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-main)' }}>내 정보</span>
                  <span
                    style={{
                      fontSize: '36px',
                      fontWeight: '900',
                      color: 'var(--text-main)',
                      transform: isInfoExpanded ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    ∨
                  </span>
                </div>

                {isInfoExpanded && (
                  <div
                    style={{
                      backgroundColor: 'var(--bg-main)',
                      border: '1.5px solid var(--border-color)',
                      borderRadius: '24px',
                      padding: '24px 36px',
                      marginTop: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '15px', color: 'var(--text-main)', lineHeight: '2.0' }}>
                        👤 <strong>이름:</strong> {currentUser.name.replace(/[()]/g, '')}
                      </div>
                      <div style={{ fontSize: '15px', color: 'var(--text-main)', lineHeight: '2.0' }}>
                        ✉️ <strong>이메일:</strong> {currentUser.email}
                      </div>
                      <div style={{ fontSize: '15px', color: 'var(--text-main)', lineHeight: '2.0' }}>
                        🏆 <strong>현재 등급:</strong> {currentRank.name} ({currentUser.points} pt)
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      style={{
                        backgroundColor: '#EF4444',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: '800',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      🚪 로그아웃 실행
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
