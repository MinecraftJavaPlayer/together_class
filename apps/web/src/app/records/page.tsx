'use client';

import React, { useState } from 'react';
// @ts-ignore
import Link from 'next/link';

export default function WebRecordsPage() {
  const [filter, setFilter] = useState<'all' | 'ocr' | 'dialog'>('all');

  const records = [
    { id: '1', type: 'ocr', title: '교과서 5학년 1학기 지문', lang: 'RU 🇷🇺', date: '2026-07-25', preview: '옛날 옛적 어느 마을에 흥부와 놀부 형제가...' },
    { id: '2', type: 'dialog', title: 'AI 토론 친구 (스마트폰 금지)', lang: 'RU 🇷🇺', date: '2026-07-25', preview: '찬성하는 입장의 이유를 잘 명시해줘서 고마워!' },
    { id: '3', type: 'ocr', title: '가정통신문 (현장체험학습)', lang: 'RU 🇷🇺', date: '2026-07-24', preview: '2026학년도 현장체험학습 안내 및 준수사항...' },
  ];

  const filteredRecords = filter === 'all' ? records : records.filter((r) => r.type === filter);

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="brand-logo">
          <span style={{ fontSize: '32px' }}>📚</span>
          <span className="brand-title">학습 기록</span>
        </div>
        <ul className="nav-list">
          <li className="nav-item"><Link href="/">🏠 홈 대시보드</Link></li>
          <li className="nav-item"><Link href="/translate">📷 교과서 번역</Link></li>
          <li className="nav-item"><Link href="/interpret">🎙️ 실시간 통역</Link></li>
          <li className="nav-item"><Link href="/debate">💬 토론 친구</Link></li>
          <li className="nav-item"><Link href="/persona">🎭 인물 인터뷰</Link></li>
          <li className="nav-item"><Link href="/notice">📄 가정통신문</Link></li>
          <li className="nav-item active"><Link href="/records">📚 학습 기록</Link></li>
        </ul>
      </aside>

      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#10B981' }}>📚 학습 기록 대시보드 (W8)</h1>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>저장된 번역 내역과 대화 기록을 조회하고 취약 표현을 AI 복습하세요.</p>
          </div>
          <button
            onClick={() => alert('🤖 AI 복습 도우미 분석: "토의", "원망", "찬성" 표현을 복습 퀴즈로 연습해보세요!')}
            style={{ backgroundColor: '#FBBF24', color: '#78350F', padding: '10px 20px', borderRadius: '8px', fontWeight: '700' }}
          >
            ✨ AI 맞춤 복습 퀴즈
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '600',
              backgroundColor: filter === 'all' ? '#10B981' : '#E5E7EB',
              color: filter === 'all' ? 'white' : '#374151',
            }}
          >
            전체 보기
          </button>
          <button
            onClick={() => setFilter('ocr')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '600',
              backgroundColor: filter === 'ocr' ? '#10B981' : '#E5E7EB',
              color: filter === 'ocr' ? 'white' : '#374151',
            }}
          >
            📷 번역 기록
          </button>
          <button
            onClick={() => setFilter('dialog')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '600',
              backgroundColor: filter === 'dialog' ? '#10B981' : '#E5E7EB',
              color: filter === 'dialog' ? 'white' : '#374151',
            }}
          >
            💬 대화 기록
          </button>
        </div>

        {/* Records Table */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: 'var(--shadow-soft)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB', color: '#6B7280', fontSize: '13px' }}>
                <th style={{ padding: '12px' }}>유형</th>
                <th style={{ padding: '12px' }}>제목 / 활동명</th>
                <th style={{ padding: '12px' }}>미리보기</th>
                <th style={{ padding: '12px' }}>언어</th>
                <th style={{ padding: '12px' }}>날짜</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: r.type === 'ocr' ? '#D1FAE5' : '#EDE9FE',
                        color: r.type === 'ocr' ? '#065F46' : '#5B21B6',
                      }}
                    >
                      {r.type === 'ocr' ? '번역' : '대화'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontWeight: '700', fontSize: '14px' }}>{r.title}</td>
                  <td style={{ padding: '12px', color: '#4B5563', fontSize: '13px' }}>{r.preview}</td>
                  <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600' }}>{r.lang}</td>
                  <td style={{ padding: '12px', color: '#9CA3AF', fontSize: '12px' }}>{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
