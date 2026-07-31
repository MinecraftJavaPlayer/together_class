'use client';

import React, { useState } from 'react';
// @ts-ignore
import Link from 'next/link';
import { SAMPLE_TEXTBOOKS } from '@dahamkke/shared';

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
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="brand-logo">
          <span style={{ fontSize: '32px' }}>🎭</span>
          <span className="brand-title">인물 인터뷰</span>
        </div>
        <ul className="nav-list">
          <li className="nav-item"><Link href="/">🏠 홈 대시보드</Link></li>
          <li className="nav-item"><Link href="/translate">📷 교과서 번역</Link></li>
          <li className="nav-item"><Link href="/interpret">🎙️ 실시간 통역</Link></li>
          <li className="nav-item"><Link href="/debate">💬 토론 친구</Link></li>
          <li className="nav-item active"><Link href="/persona">🎭 인물 인터뷰</Link></li>
          <li className="nav-item"><Link href="/notice">📄 가정통신문</Link></li>
          <li className="nav-item"><Link href="/records">📚 학습 기록</Link></li>
        </ul>
      </aside>

      <main className="main-content" style={{ display: 'flex', gap: '24px' }}>
        {/* Left Side: Character Picker */}
        <div style={{ width: '260px', background: 'white', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-soft)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>📖 교과서 인물 선택</h3>
          {SAMPLE_TEXTBOOKS.map((tb) => {
            const isSelected = selectedCharacter === tb.characterName;
            return (
              <div
                key={tb.id}
                onClick={() => setSelectedCharacter(tb.characterName)}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: isSelected ? '#F3E8FF' : '#F9FAFB',
                  border: `2px solid ${isSelected ? '#9333EA' : '#E5E7EB'}`,
                  cursor: 'pointer',
                  marginBottom: '12px',
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>🎭 {tb.characterName}</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>{tb.grade}</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{tb.unitTitle}</div>
              </div>
            );
          })}
        </div>

        {/* Center: Interview Chat Workspace */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#F3E8FF', padding: '16px 20px', borderRadius: '16px', border: '1px solid #D8B4FE', marginBottom: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#7E22CE' }}>선택된 페르소나 & RAG 기반 출처</span>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#6B21A8', marginTop: '4px' }}>
              🎭 {currentUnit.characterName} 인터뷰 ({currentUnit.unitTitle})
            </h2>
          </div>

          <div style={{ flex: 1, background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-soft)', overflowY: 'auto', marginBottom: '16px', minHeight: '340px' }}>
            {messages.map((m) => (
              <div key={m.id} style={{ background: '#F9FAFB', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#7E22CE', marginBottom: '4px' }}>🎭 {m.character} (1인칭 답변)</div>
                <div style={{ fontSize: '15px', color: '#1F2937', lineHeight: '1.6', fontWeight: '500' }}>{m.answer}</div>
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  {m.sources.map((s, idx) => (
                    <span key={idx} style={{ background: '#EDE9FE', color: '#5B21B6', fontSize: '11px', fontWeight: '600', padding: '4px 8px', borderRadius: '6px' }}>
                      🏷️ 근거: {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder={`${selectedCharacter}에게 무엇이든 질문해보세요...`}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '15px' }}
            />
            <button
              onClick={() => handleAsk()}
              style={{ backgroundColor: '#8B5CF6', color: 'white', padding: '0 24px', borderRadius: '12px', fontWeight: '700' }}
            >
              질문 전송
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
