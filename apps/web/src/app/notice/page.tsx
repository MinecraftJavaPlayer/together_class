'use client';

import React, { useState } from 'react';
// @ts-ignore
import Link from 'next/link';
import { LANGUAGE_LIST } from '@dahamkke/shared';

export default function WebNoticePage() {
  const [selectedLang, setSelectedLang] = useState('ru');
  const [summary] = useState({
    dates: ['2026년 7월 30일(목) 09:00'],
    items: ['실내화', '개인 텀블러', '도시락'],
    deadlines: ['2026년 7월 28일(화) 17:00까지 제출'],
  });

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="brand-logo">
          <span style={{ fontSize: '32px' }}>📄</span>
          <span className="brand-title">가정통신문</span>
        </div>
        <ul className="nav-list">
          <li className="nav-item"><Link href="/">🏠 홈 대시보드</Link></li>
          <li className="nav-item"><Link href="/translate">📷 교과서 번역</Link></li>
          <li className="nav-item"><Link href="/interpret">🎙️ 실시간 통역</Link></li>
          <li className="nav-item"><Link href="/debate">💬 토론 친구</Link></li>
          <li className="nav-item"><Link href="/persona">🎭 인물 인터뷰</Link></li>
          <li className="nav-item active"><Link href="/notice">📄 가정통신문</Link></li>
          <li className="nav-item"><Link href="/records">📚 학습 기록</Link></li>
        </ul>
      </aside>

      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#EC4899' }}>📄 가정통신문 다국어 번역 & 핵심요약 (W7)</h1>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>학부모 및 이주배경 학생을 위해 가정통신문을 자동 번역하고 필수 준비사항을 요약합니다.</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#475569' }}>번역할 언어:</span>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                style={{
                  appearance: 'none',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '6px 36px 6px 14px',
                  fontSize: '14px',
                  fontWeight: '800',
                  color: '#0F172A',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                {LANGUAGE_LIST.filter(l => l.code !== 'ko').map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
              <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '12px', color: '#64748B', fontWeight: '900' }}>
                ∨
              </span>
            </div>
          </div>
        </div>

        {/* Workspace Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-soft)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>📄 가정통신문 업로드 (이미지/PDF)</h2>
            <div style={{ border: '2px dashed #FBCFE8', padding: '40px', borderRadius: '12px', textAlign: 'center', background: '#FDF2F8' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>📑</div>
              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '12px' }}>학교 가정통신문 원문 파일 업로드</p>
              <button style={{ backgroundColor: '#EC4899', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: '700' }}>
                📁 가정통신문 파일 선택
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Key Summary Card */}
            <div style={{ background: '#FFFBEB', padding: '24px', borderRadius: '16px', border: '1px solid #FDE68A' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#B45309', marginBottom: '12px' }}>📌 핵심 요약 (Key Summary)</h2>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', color: '#78350F' }}>📅 일시: </span>
                <span>{summary.dates.join(', ')}</span>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', color: '#78350F' }}>🎒 준비물: </span>
                <span>{summary.items.join(', ')}</span>
              </div>
              <div>
                <span style={{ fontWeight: '700', color: '#78350F' }}>⏰ 제출기한: </span>
                <span>{summary.deadlines.join(', ')}</span>
              </div>
            </div>

            {/* Translation Output Card */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-soft)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>🌐 다국어 번역본 ({selectedLang.toUpperCase()})</h2>
              <p style={{ fontSize: '15px', color: '#1F2937', lineHeight: '1.6' }}>
                Уважаемые родители! Приглашаем учеников на экскурсию 30 июля. Пожалуйста, подготовите личные вещи и обед.
              </p>
              <button
                onClick={() => alert('학부모 공유용 QR 코드 링크가 생성되었습니다!')}
                style={{ marginTop: '16px', backgroundColor: '#14B8A6', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: '700' }}
              >
                📲 학부모 공유 QR/링크 생성
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
