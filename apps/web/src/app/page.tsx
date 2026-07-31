'use client';

import React, { useState, useEffect } from 'react';
// @ts-ignore
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getUserRank,
  isAllLearningCompleted,
  UserProfile,
  getCurrentUser,
} from '@dahamkke/shared';
import { SidebarNav } from './components/SidebarNav';
import { RankSVGIcon } from './components/RankSVGIcon';

export default function DashboardHome() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile>(getCurrentUser());

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

  const features = [
    { title: '🏆 랭크 & 월간 시즌', desc: `현재 랭크: ${currentRank.name} (${currentUser.points} pt)`, icon: '🏆', href: '/rank', color: '#F59E0B', highlight: true },
    {
      title: isQuizUnlocked ? '📝 학습 평가 10문항' : '🔒 학습 평가 10문항 (학습 후 해제)',
      desc: isQuizUnlocked ? '🔓 단원 학습 완료! 10문제 풀고 성취도 0~20pt 획득' : '🔒 단원 학습(번역, 통역, 토론 등)을 최소 1개 완성해야 해제됩니다',
      icon: isQuizUnlocked ? '📝' : '🔒',
      href: isQuizUnlocked ? '/quiz' : '/translate',
      color: isQuizUnlocked ? '#EC4899' : '#94A3B8',
      highlight: isQuizUnlocked,
    },
    { title: '교과서 OCR 번역', desc: '지문 사진 촬영/업로드 텍스트 추출 및 다국어 번역', icon: '📷', href: '/translate', color: '#14B8A6' },
    { title: '실시간 통역', desc: '교실 짝꿍과의 양방향 실시간 음성 대화 통역', icon: '🎙️', href: '/interpret', color: '#FF7A59' },
    { title: 'AI 토론 친구', desc: '초등 눈높이 가상 한국인 친구 민준이와 교과서 토론', icon: '💬', href: '/debate', color: '#3B82F6' },
    { title: '교과서 인물 인터뷰', desc: '흥부·이순신 등 교과서 인물 페르소나 1인칭 대화 (RAG)', icon: '🎭', href: '/persona', color: '#8B5CF6' },
    { title: '가정통신문 번역', desc: '학교 알림장 다국어 번역 및 주요 일정 요약 QR', icon: '📄', href: '/notice', color: '#06B6D4' },
    { title: '받아쓰기 연습', desc: '듣고 맞히는 한국어 단어 받아쓰기 및 포인트 획득', icon: '✍️', href: '/dictation', color: '#F59E0B' },
    { title: '학습 기록 & 복습', desc: '저장된 번역/대화 기록 조회 및 AI 복습 퀴즈', icon: '📚', href: '/records', color: '#10B981' },
  ];

  return (
    <div className="dashboard-container" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Left Sidebar Nav Component */}
      <SidebarNav />

      {/* Main Content Area — 100% Zero Page Scroll */}
      <main className="main-content" style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '20px 28px' }}>
        <div className="header-bar" style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '16px 24px', borderRadius: '18px', marginBottom: '16px', boxShadow: 'var(--shadow-soft)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            {/* SVG Rank Icon */}
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
              style={{ backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', padding: '9px 16px', borderRadius: '12px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
            >
              🚪 로그아웃
            </button>
          </div>
        </div>

        {/* Feature Grid — Fits 100vh 3x3 layout without scroll */}
        <h2 style={{ flexShrink: 0, fontSize: '17px', fontWeight: '800', marginBottom: '12px' }}>🎯 주요 학습 & 랭크 평가 기능</h2>
        <div style={{ flex: 1, height: 0, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: '12px' }}>
          {features.map((item, idx) => (
            <Link href={item.href} key={idx} style={{ height: '100%', display: 'block' }}>
              <div className="feature-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '14px 18px', borderRadius: '14px', borderLeftColor: item.color, backgroundColor: item.highlight ? '#FAFAFA' : 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '26px' }}>{item.icon}</span>
                  {item.highlight && <span style={{ background: item.color, color: 'white', fontSize: '10px', fontWeight: '800', padding: '2px 7px', borderRadius: '6px' }}>추천</span>}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '4px', color: '#0F172A' }}>{item.title}</h3>
                <p style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.4', margin: 0 }}>{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
