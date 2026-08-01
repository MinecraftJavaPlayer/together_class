'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getUserRank,
  isAllLearningCompleted,
  UserProfile,
  getCurrentUser,
} from '@dahamkke/shared';
import { SidebarNav } from './components/SidebarNav';
import { RankSVGIcon } from './components/RankSVGIcon';

type TabId = 'rank' | 'learning' | 'records' | 'settings';

export default function DashboardHome() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile>(getCurrentUser());
  const [activeTab, setActiveTab] = useState<TabId>('rank');

  useEffect(() => {
    setCurrentUser(getCurrentUser());

    const handleUserUpdate = (e: any) => {
      if (e.detail) {
        setCurrentUser(e.detail);
      }
    };

    window.addEventListener('dahamkke_user_updated', handleUserUpdate);
    return () => window.removeEventListener('dahamkke_user_updated', handleUserUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('dahamkke_current_user');
    alert('로그아웃 되었습니다.');
    router.push('/login');
  };

  const currentRank = getUserRank(currentUser);
  const isQuizUnlocked = isAllLearningCompleted(currentUser);

  // Tab configurations
  const tabs = [
    { id: 'rank', label: '랭크' },
    { id: 'learning', label: '학습 도우미' },
    { id: 'records', label: '연습 & 기록' },
    { id: 'settings', label: '설정' },
  ];

  return (
    <div className="dashboard-container" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Left Sidebar Nav Component */}
      <SidebarNav />

      {/* Main Content Area — 100% Zero Page Scroll */}
      <main className="main-content" style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '20px 28px', backgroundColor: '#F8FAFC' }}>
        
        {/* Top Header Card */}
        <div className="header-bar" style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '16px 24px', borderRadius: '18px', marginBottom: '20px', boxShadow: 'var(--shadow-soft)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <RankSVGIcon
              tierGroup={currentRank.tierGroup as any}
              subTier={currentRank.subTier || '1'}
              size={56}
            />

            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {currentUser.name.replace(/[()]/g, '')}님 환영합니다! 👋
                <span style={{ fontSize: '14px', fontWeight: '800', color: currentRank.color, background: currentRank.bgColor, border: `1px solid ${currentRank.color}`, padding: '3px 10px', borderRadius: '10px' }}>
                  {currentRank.name} [{currentUser.points} pt]
                </span>
              </h1>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: '2px 0 0 0' }}>
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

        {/* Tab Selection Bar — Rounded thick outlines */}
        <div style={{ flexShrink: 0, display: 'flex', gap: '16px', marginBottom: '24px' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: isActive ? '3.5px solid #00A3FF' : '3.5px solid #000000',
                  borderRadius: '24px',
                  color: isActive ? '#00A3FF' : '#000000',
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flex: 1, maxHeight: '360px' }}>
              {/* Leaderboard Card */}
              <div
                onClick={() => router.push('/rank')}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '24px',
                  boxShadow: 'var(--shadow-soft)',
                  border: '1.5px solid #E2E8F0',
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

                <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A' }}>리더보드</h3>
              </div>

              {/* 10-Question Quiz Card */}
              <div
                onClick={() => router.push(isQuizUnlocked ? '/quiz' : '/translate')}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '24px',
                  boxShadow: 'var(--shadow-soft)',
                  border: '1.5px solid #E2E8F0',
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

                <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A' }}>
                  {isQuizUnlocked ? '10문항 평가' : '🔒 10문항 평가 (잠김)'}
                </h3>
              </div>
            </div>
          )}

          {/* TAB 2: 학습 도우미 (Learning Assistants) */}
          {activeTab === 'learning' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', flex: 1, maxHeight: '360px' }}>
              {[
                { title: '📷 교과서 OCR 번역', desc: '지문 사진 촬영/업로드 텍스트 추출 및 다국어 번역', icon: '📷', href: '/translate', color: '#14B8A6' },
                { title: '🎙️ 실시간 통역', desc: '교실 짝꿍과의 양방향 실시간 음성 대화 통역', icon: '🎙️', href: '/interpret', color: '#FF7A59' },
                { title: '💬 토론 친구 (민준)', desc: '초등 눈높이 가상 한국인 친구 민준이와 교과서 토론', icon: '💬', href: '/debate', color: '#3B82F6' },
                { title: '🎭 인물 인터뷰', desc: '흥부·이순신 등 교과서 인물 페르소나 1인칭 대화 (RAG)', icon: '🎭', href: '/persona', color: '#8B5CF6' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => router.push(item.href)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    boxShadow: 'var(--shadow-soft)',
                    border: '1.5px solid #E2E8F0',
                    borderLeft: `6px solid ${item.color}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '20px 24px',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  <span style={{ fontSize: '36px', marginRight: '18px' }}>{item.icon}</span>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A', margin: 0 }}>{item.title}</h4>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: 기록 (Records) */}
          {activeTab === 'records' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', flex: 1, maxHeight: '360px' }}>
              {[
                { title: '✍️ 받아쓰기 연습', desc: '듣고 맞히는 한국어 단어 받아쓰기', icon: '✍️', href: '/dictation', color: '#F59E0B' },
                { title: '📄 가정통신문 번역', desc: '학교 알림장 다국어 번역 및 요약 QR', icon: '📄', href: '/notice', color: '#06B6D4' },
                { title: '📚 학습 기록 & 복습', desc: '저장된 번역/대화 기록 및 복습 퀴즈', icon: '📚', href: '/records', color: '#10B981' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => router.push(item.href)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    boxShadow: 'var(--shadow-soft)',
                    border: '1.5px solid #E2E8F0',
                    borderTop: `6px solid ${item.color}`,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    textAlign: 'center',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <span style={{ fontSize: '38px', marginBottom: '12px' }}>{item.icon}</span>
                  <h4 style={{ fontSize: '17px', fontWeight: '900', color: '#0F172A', margin: 0 }}>{item.title}</h4>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '6px 0 0 0', lineHeight: '1.4' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: 설정 (Settings) */}
          {activeTab === 'settings' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flex: 1, maxHeight: '360px' }}>
              {/* Teacher Console RAG */}
              <div
                onClick={() => router.push('/admin')}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  boxShadow: 'var(--shadow-soft)',
                  border: '1.5px solid #E2E8F0',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span style={{ fontSize: '48px', marginBottom: '12px' }}>👨‍🏫</span>
                <h4 style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', margin: 0 }}>교사 콘솔 (RAG)</h4>
                <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '6px' }}>교안 자료 파일 업로드 및 교실 콘텐츠 관리</p>
              </div>

              {/* User Session card */}
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  boxShadow: 'var(--shadow-soft)',
                  border: '1.5px solid #E2E8F0',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <h4 style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A', marginBottom: '12px' }}>내 정보 및 설정</h4>
                <div style={{ fontSize: '14px', color: '#334155', lineHeight: '1.8' }}>
                  <div>👤 <strong>이름:</strong> {currentUser.name.replace(/[()]/g, '')}</div>
                  <div>✉️ <strong>이메일:</strong> {currentUser.email}</div>
                  <div>🏆 <strong>현재 등급:</strong> {currentRank.name} ({currentUser.points} pt)</div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    marginTop: '16px',
                    backgroundColor: '#EF4444',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  🚪 로그아웃 실행
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
