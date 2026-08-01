'use client';

import React, { useState, useEffect } from 'react';
// @ts-ignore
import Link from 'next/link';
import { SAMPLE_TEXTBOOKS } from '@dahamkke/shared';
import { SidebarNav } from '../components/SidebarNav';

export default function WebPersonaPage() {
  const [selectedCharacter, setSelectedCharacter] = useState(SAMPLE_TEXTBOOKS[0].characterName);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      character: '흥부',
      answer: '반갑구나! 나는 교과서 5학년 1학기 지문에 나오는 흥부란다. 착하게 살면 언젠가 좋은 일이 찾아온단다. 나에게 어떤 질문이든 해보렴.',
      sources: ['국어 5-1 나 2단원 1문단', '국어 5-1 나 2단원 3문단'],
    },
  ]);

  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    setIsDarkMode(localStorage.getItem('dahamkke_dark_mode') === 'true');
  }, []);

  const currentUnit = SAMPLE_TEXTBOOKS.find((t) => t.characterName === selectedCharacter) || SAMPLE_TEXTBOOKS[0];

  const handleAsk = (qText?: string) => {
    const askText = qText || question;
    if (!askText) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        character: selectedCharacter,
        answer: `'${askText}'라고 물어봐주었구나. 교과서 내용에 따르면 정성껏 제비를 보살폈기에 마음이 따뜻했단다.`,
        sources: [`${currentUnit.grade} ${currentUnit.unitTitle} 2문단`],
      },
    ]);
    setQuestion('');
  };

  return (
    <div className="dashboard-container" style={{ height: '100vh', overflow: 'hidden' }}>
      <SidebarNav />

      <main className="main-content" style={{ height: '100vh', overflow: 'hidden', display: 'flex', gap: '24px', padding: '20px 28px', backgroundColor: 'var(--bg-main)', transition: 'background-color 0.2s ease' }}>
        {/* Left Side: Character Picker */}
        <div style={{ width: '260px', background: isDarkMode ? '#1E293B' : 'white', padding: '20px', borderRadius: '16px', border: isDarkMode ? '2px solid #334155' : '1.5px solid #E2E8F0', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: isDarkMode ? '#F1F5F9' : '#0F172A', flexShrink: 0 }}>📖 교과서 인물 선택</h3>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }} className="inner-scroll">
            {SAMPLE_TEXTBOOKS.map((tb) => {
              const isSelected = selectedCharacter === tb.characterName;
              return (
                <div
                  key={tb.id}
                  onClick={() => setSelectedCharacter(tb.characterName)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? (isDarkMode ? '#3B2754' : '#F3E8FF') : (isDarkMode ? '#111827' : '#F9FAFB'),
                    border: `2px solid ${isSelected ? (isDarkMode ? '#A855F7' : '#9333EA') : (isDarkMode ? '#334155' : '#E5E7EB')}`,
                    cursor: 'pointer',
                    marginBottom: '12px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px', color: isDarkMode ? '#F1F5F9' : '#0F172A' }}>🎭 {tb.characterName}</div>
                  <div style={{ fontSize: '12px', color: isDarkMode ? '#94A3B8' : '#6B7280', fontWeight: '700' }}>{tb.grade}</div>
                  <div style={{ fontSize: '11px', color: isDarkMode ? '#64748B' : '#9CA3AF' }}>{tb.unitTitle}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Interview Chat Workspace */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Persona banner */}
          <div style={{ background: isDarkMode ? '#3B2754' : '#F3E8FF', padding: '16px 20px', borderRadius: '16px', border: isDarkMode ? '2px solid #6B21A8' : '1px solid #D8B4FE', marginBottom: '20px', flexShrink: 0 }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: isDarkMode ? '#D8B4FE' : '#7E22CE' }}>선택된 페르소나 & RAG 기반 출처</span>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: isDarkMode ? '#F1F5F9' : '#6B21A8', marginTop: '4px', marginBottom: 0 }}>
              🎭 {currentUnit.characterName} 인터뷰 ({currentUnit.unitTitle})
            </h2>
          </div>

          {/* Chat Messages */}
          <div style={{ flex: 1, background: isDarkMode ? '#1E293B' : 'white', border: isDarkMode ? '2px solid #334155' : '1.5px solid #E2E8F0', padding: '24px', borderRadius: '16px', boxShadow: isDarkMode ? 'none' : 'var(--shadow-soft)', overflowY: 'auto', marginBottom: '16px', minHeight: '340px' }} className="inner-scroll">
            {messages.map((m) => (
              <div key={m.id} style={{ background: isDarkMode ? '#111827' : '#F9FAFB', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: isDarkMode ? '1.5px solid #334155' : '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: isDarkMode ? '#D8B4FE' : '#7E22CE', marginBottom: '6px' }}>🎭 {m.character} (1인칭 답변)</div>
                <div style={{ fontSize: '15px', color: isDarkMode ? '#E2E8F0' : '#1F2937', lineHeight: '1.6', fontWeight: '500' }}>{m.answer}</div>
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {m.sources.map((s, idx) => (
                    <span key={idx} style={{ background: isDarkMode ? '#4C1D95' : '#EDE9FE', color: isDarkMode ? '#DDD6FE' : '#5B21B6', fontSize: '11px', fontWeight: '700', padding: '4px 8px', borderRadius: '6px' }}>
                      🏷️ 근거: {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Input field */}
          <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
            <input
              type="text"
              placeholder={`${selectedCharacter}에게 무엇이든 질문해보세요...`}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                border: isDarkMode ? '2px solid #334155' : '1.5px solid #CBD5E1',
                backgroundColor: isDarkMode ? '#111827' : 'white',
                color: isDarkMode ? '#F1F5F9' : '#0F172A',
                fontSize: '15px',
                outline: 'none',
              }}
            />
            <button
              onClick={() => handleAsk()}
              style={{ backgroundColor: '#8B5CF6', color: 'white', padding: '0 24px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', border: 'none' }}
            >
              질문 전송
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
