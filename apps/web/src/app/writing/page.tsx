'use client';

import React, { useState, useEffect } from 'react';
// @ts-ignore
import Link from 'next/link';
import { SidebarNav } from '../components/SidebarNav';

export default function WebWritingPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    setIsDarkMode(localStorage.getItem('dahamkke_dark_mode') === 'true');
  }, []);

  return (
    <div className="dashboard-container" style={{ height: '100vh', overflow: 'hidden' }}>
      <SidebarNav />

      <main className="main-content" style={{ height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 28px', backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', transition: 'background-color 0.2s ease' }}>
        <div style={{ background: isDarkMode ? '#1E293B' : 'white', border: isDarkMode ? '2px solid #334155' : 'none', padding: '48px', borderRadius: '24px', maxWidth: '600px', width: '100%', textAlign: 'center', boxShadow: isDarkMode ? 'none' : 'var(--shadow-soft)' }}>
          <span style={{ fontSize: '72px' }}>📱</span>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: isDarkMode ? '#F1F5F9' : '#0F172A', marginTop: '16px', marginBottom: '12px' }}>
            모바일(Expo App) 전용 기능입니다
          </h1>
          <p style={{ fontSize: '15px', color: isDarkMode ? '#94A3B8' : '#64748B', lineHeight: '1.6', marginBottom: '28px', fontWeight: '600' }}>
            ✏️ **글자 따라쓰기 연습**은 터치 스크린 및 스마트펜 드로잉이 가능한 <strong>모바일 앱(Expo Go)</strong> 환경에서만 지원되는 전용 학습 기능입니다.
          </p>

          <Link href="/" style={{ display: 'inline-block', backgroundColor: '#14B8A6', color: 'white', padding: '14px 32px', borderRadius: '12px', fontWeight: '800', textDecoration: 'none' }}>
            🏠 홈 대시보드로 돌아가기
          </Link>
        </div>
      </main>
    </div>
  );
}
