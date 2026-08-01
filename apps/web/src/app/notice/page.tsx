'use client';

import React, { useState, useEffect } from 'react';
// @ts-ignore
import Link from 'next/link';
import { LANGUAGE_LIST } from '@dahamkke/shared';
import { SidebarNav } from '../components/SidebarNav';

export default function WebNoticePage() {
  const [selectedLang, setSelectedLang] = useState('ru');
  const [summary] = useState({
    dates: ['2026년 7월 30일(목) 09:00'],
    items: ['실내화', '개인 텀블러', '도시락'],
    deadlines: ['2026년 7월 28일(화) 17:00까지 제출'],
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    setIsDarkMode(localStorage.getItem('dahamkke_dark_mode') === 'true');
  }, []);

  return (
    <div className="dashboard-container" style={{ height: '100vh', overflow: 'hidden' }}>
      <SidebarNav />

      <main className="main-content" style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '20px 28px', backgroundColor: 'var(--bg-main)', transition: 'background-color 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#EC4899' }}>📄 가정통신문 다국어 번역 & 핵심요약 (W7)</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>학부모 및 이주배경 학생을 위해 가정통신문을 자동 번역하고 필수 준비사항을 요약합니다.</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)' }}>번역할 언어:</span>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                style={{
                  appearance: 'none',
                  backgroundColor: 'var(--card-bg)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '6px 36px 6px 14px',
                  fontSize: '14px',
                  fontWeight: '800',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  outline: 'none',
                }}
              >
                {LANGUAGE_LIST.filter(l => l.code !== 'ko').map((l) => (
                  <option key={l.code} value={l.code} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-main)' }}>
                    {l.name}
                  </option>
                ))}
              </select>
              <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '900' }}>
                ∨
              </span>
            </div>
          </div>
        </div>

        {/* Workspace Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flex: 1, minHeight: 0 }}>
          {/* Upload panel */}
          <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '16px', border: '1.5px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-main)' }}>📄 가정통신문 업로드 (이미지/PDF)</h2>
            <div style={{ border: '2px dashed var(--highlight-danger-border)', padding: '40px', borderRadius: '12px', textAlign: 'center', background: 'var(--highlight-danger-bg)', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>📑</div>
              <p style={{ fontSize: '14px', color: 'var(--highlight-danger-text)', marginBottom: '12px', fontWeight: '600' }}>학교 가정통신문 원문 파일 업로드</p>
              <button style={{ backgroundColor: '#EC4899', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', border: 'none' }}>
                📁 가정통신문 파일 선택
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Key Summary Card */}
            <div style={{ background: 'var(--highlight-warning-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--highlight-warning-border)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--highlight-warning-text)', marginBottom: '12px' }}>📌 핵심 요약 (Key Summary)</h2>
              <div style={{ marginBottom: '8px', color: 'var(--highlight-warning-text)' }}>
                <span style={{ fontWeight: '700' }}>📅 일시: </span>
                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{summary.dates.join(', ')}</span>
              </div>
              <div style={{ marginBottom: '8px', color: 'var(--highlight-warning-text)' }}>
                <span style={{ fontWeight: '700' }}>🎒 준비물: </span>
                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{summary.items.join(', ')}</span>
              </div>
              <div style={{ color: 'var(--highlight-warning-text)' }}>
                <span style={{ fontWeight: '700' }}>⏰ 제출기한: </span>
                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{summary.deadlines.join(', ')}</span>
              </div>
            </div>

            {/* Translation Output Card */}
            <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '16px', border: '1.5px solid var(--border-color)', flex: 1 }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-main)' }}>🌐 다국어 번역본 ({selectedLang.toUpperCase()})</h2>
              <p style={{ fontSize: '15px', color: 'var(--text-main)', lineHeight: '1.6' }}>
                Уважаемые родители! Приглашаем учеников на экскурсию 30 июля. Пожалуйста, подготовите личные вещи и обед.
              </p>
              <button
                onClick={() => alert('학부모 공유용 QR 코드 링크가 생성되었습니다!')}
                style={{ marginTop: '16px', backgroundColor: '#14B8A6', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', border: 'none' }}
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
