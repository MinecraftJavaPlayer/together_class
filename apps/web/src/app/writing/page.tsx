'use client';

import React from 'react';
// @ts-ignore
import Link from 'next/link';

export default function WebWritingPage() {
  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="brand-logo">
          <span style={{ fontSize: '32px' }}>📱</span>
          <span className="brand-title">모바일 전용 기능</span>
        </div>
        <ul className="nav-list">
          <li className="nav-item"><Link href="/">🏠 홈 대시보드</Link></li>
          <li className="nav-item"><Link href="/rank">🏆 랭크 & 시즌</Link></li>
          <li className="nav-item"><Link href="/quiz">📝 10문항 평가</Link></li>
          <li className="nav-item"><Link href="/translate">📷 교과서 번역</Link></li>
          <li className="nav-item"><Link href="/interpret">🎙️ 실시간 통역</Link></li>
          <li className="nav-item"><Link href="/debate">💬 토론 친구</Link></li>
          <li className="nav-item"><Link href="/persona">🎭 인물 인터뷰</Link></li>
          <li className="nav-item"><Link href="/dictation">✍️ 받아쓰기</Link></li>
          <li className="nav-item"><Link href="/records">📚 학습 기록</Link></li>
        </ul>
      </aside>

      <main className="main-content">
        <div style={{ background: 'white', padding: '48px', borderRadius: '24px', maxWidth: '600px', margin: '40px auto', textAlign: 'center', boxShadow: 'var(--shadow-soft)' }}>
          <span style={{ fontSize: '72px' }}>📱</span>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', marginTop: '16px', marginBottom: '12px' }}>
            모바일(Expo App) 전용 기능입니다
          </h1>
          <p style={{ fontSize: '15px', color: '#64748B', lineHeight: '1.6', marginBottom: '28px' }}>
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
