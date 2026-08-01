'use client';

import React, { useState, useEffect } from 'react';
// @ts-ignore
import Link from 'next/link';
import { SidebarNav } from '../components/SidebarNav';

export default function WebRecordsPage() {
  const [filter, setFilter] = useState<'all' | 'ocr' | 'dialog'>('all');

  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    setIsDarkMode(localStorage.getItem('dahamkke_dark_mode') === 'true');
  }, []);

  const records = [
    { id: '1', type: 'ocr', title: '교과서 5학년 1학기 지문', lang: 'RU 🇷🇺', date: '2026-07-25', preview: '옛날 옛적 어느 마을에 흥부와 놀부 형제가...' },
    { id: '2', type: 'dialog', title: 'AI 토론 친구 (스마트폰 금지)', lang: 'RU 🇷🇺', date: '2026-07-25', preview: '찬성하는 입장의 이유를 잘 명시해줘서 고마워!' },
    { id: '3', type: 'ocr', title: '가정통신문 (현장체험학습)', lang: 'RU 🇷🇺', date: '2026-07-24', preview: '2026학년도 현장체험학습 안내 및 준수사항...' },
  ];

  const filteredRecords = filter === 'all' ? records : records.filter((r) => r.type === filter);

  return (
    <div className="dashboard-container" style={{ height: '100vh', overflow: 'hidden' }}>
      <SidebarNav />

      <main className="main-content" style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '20px 28px', backgroundColor: 'var(--bg-main)', transition: 'background-color 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#10B981' }}>📚 학습 기록 대시보드 (W8)</h1>
            <p style={{ fontSize: '14px', color: isDarkMode ? '#94A3B8' : '#6B7280', margin: '4px 0 0 0' }}>저장된 번역 내역과 대화 기록을 조회하고 취약 표현을 AI 복습하세요.</p>
          </div>
          <button
            onClick={() => alert('🤖 AI 복습 도우미 분석: "토의", "원망", "찬성" 표현을 복습 퀴즈로 연습해보세요!')}
            style={{ backgroundColor: isDarkMode ? '#382F13' : '#FBBF24', border: isDarkMode ? '2px solid #78350F' : 'none', color: isDarkMode ? '#FBBF24' : '#78350F', padding: '10px 20px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}
          >
            ✨ AI 맞춤 복습 퀴즈
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexShrink: 0 }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '800',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filter === 'all' ? '#10B981' : (isDarkMode ? '#1E293B' : '#E5E7EB'),
              color: filter === 'all' ? 'white' : (isDarkMode ? '#F1F5F9' : '#374151'),
            }}
          >
            전체 보기
          </button>
          <button
            onClick={() => setFilter('ocr')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '800',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filter === 'ocr' ? '#10B981' : (isDarkMode ? '#1E293B' : '#E5E7EB'),
              color: filter === 'ocr' ? 'white' : (isDarkMode ? '#F1F5F9' : '#374151'),
            }}
          >
            📷 번역 기록
          </button>
          <button
            onClick={() => setFilter('dialog')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '800',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filter === 'dialog' ? '#10B981' : (isDarkMode ? '#1E293B' : '#E5E7EB'),
              color: filter === 'dialog' ? 'white' : (isDarkMode ? '#F1F5F9' : '#374151'),
            }}
          >
            💬 대화 기록
          </button>
        </div>

        {/* Records Table Card */}
        <div style={{ flex: 1, background: isDarkMode ? '#1E293B' : 'white', border: isDarkMode ? '2px solid #334155' : '1.5px solid #E2E8F0', borderRadius: '16px', padding: '16px', boxShadow: isDarkMode ? 'none' : 'var(--shadow-soft)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto' }} className="inner-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: isDarkMode ? '2px solid #334155' : '2px solid #E5E7EB', color: isDarkMode ? '#94A3B8' : '#6B7280', fontSize: '13px' }}>
                  <th style={{ padding: '12px' }}>유형</th>
                  <th style={{ padding: '12px' }}>제목 / 활동명</th>
                  <th style={{ padding: '12px' }}>미리보기</th>
                  <th style={{ padding: '12px' }}>언어</th>
                  <th style={{ padding: '12px' }}>날짜</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r.id} style={{ borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '800',
                          backgroundColor: r.type === 'ocr' ? (isDarkMode ? '#14532D' : '#D1FAE5') : (isDarkMode ? '#312E81' : '#EDE9FE'),
                          color: r.type === 'ocr' ? (isDarkMode ? '#4ADE80' : '#065F46') : (isDarkMode ? '#EEF2FF' : '#5B21B6'),
                        }}
                      >
                        {r.type === 'ocr' ? '번역' : '대화'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: '800', fontSize: '14px', color: isDarkMode ? '#F1F5F9' : '#0F172A' }}>{r.title}</td>
                    <td style={{ padding: '12px', color: isDarkMode ? '#E2E8F0' : '#4B5563', fontSize: '13px' }}>{r.preview}</td>
                    <td style={{ padding: '12px', fontSize: '13px', fontWeight: '800', color: isDarkMode ? '#F1F5F9' : '#000000' }}>{r.lang}</td>
                    <td style={{ padding: '12px', color: isDarkMode ? '#64748B' : '#9CA3AF', fontSize: '12px' }}>{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
