'use client';

import React, { useState } from 'react';
// @ts-ignore
import Link from 'next/link';

interface WebDebateMsg {
  id: string;
  sender: 'ai' | 'user';
  textKo: string;
  textUser: string;
  sources?: string[];
}

export default function WebDebatePage() {
  const [topic] = useState('환경 보호를 위해 일회용품 사용을 법으로 금지해야 하는가?');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<WebDebateMsg[]>([
    {
      id: '1',
      sender: 'ai',
      textKo: '안녕! 나는 국어 교과서로 공부한 반장 민준이야. 오늘의 토론 주제에 대해 넌 찬성하니, 반대하니?',
      textUser: 'Привет! Я Минжун. Ты за или против сегодняшней темы дебатов?',
      sources: ['국어 6-1 가 1단원 (비판적 사고와 토론) 2문단'],
    },
  ]);

  const handleSend = (textToSend?: string) => {
    const msg = textToSend || inputText;
    if (!msg) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: 'user', textKo: msg, textUser: msg },
      {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        textKo: `좋은 의견이야! 국어 교과서 지문(사회 6-2 2단원 4문단)에서도 일회용품 줄이기 운동의 중요성을 강조했어. "${msg}"라고 생각한 이유를 더 들어줄 수 있니?`,
        textUser: `Отличное мнение! Можешь приписать еще одно основание?`,
        sources: ['사회 6-2 2단원 (환경 문제) 4문단'],
      },
    ]);
    setInputText('');
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="brand-logo">
          <span style={{ fontSize: '32px' }}>💬</span>
          <span className="brand-title">AI 토론 친구 민준이</span>
        </div>
        <ul className="nav-list">
          <li className="nav-item"><Link href="/">🏠 홈 대시보드</Link></li>
          <li className="nav-item"><Link href="/translate">📷 교과서 번역</Link></li>
          <li className="nav-item"><Link href="/interpret">🎙️ 실시간 통역</Link></li>
          <li className="nav-item active"><Link href="/debate">💬 토론 친구</Link></li>
          <li className="nav-item"><Link href="/persona">🎭 인물 인터뷰</Link></li>
          <li className="nav-item"><Link href="/notice">📄 가정통신문</Link></li>
          <li className="nav-item"><Link href="/records">📚 학습 기록</Link></li>
        </ul>
      </aside>

      <main className="main-content" style={{ display: 'flex', gap: '24px' }}>
        {/* Main Chat Thread Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#EFF6FF', padding: '16px 20px', borderRadius: '16px', border: '1px solid #BFDBFE', marginBottom: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#1D4ED8' }}>오늘의 교과서 토론 주제 (RAG 학습 완료)</span>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1E40AF', marginTop: '4px' }}>📌 {topic}</h2>
          </div>

          <div
            style={{
              flex: 1,
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--shadow-soft)',
              overflowY: 'auto',
              marginBottom: '16px',
              minHeight: '340px',
            }}
          >
            {messages.map((m) => (
              <div key={m.id} style={{ marginBottom: '16px', textAlign: m.sender === 'user' ? 'right' : 'left' }}>
                <div
                  style={{
                    display: 'inline-block',
                    maxWidth: '80%',
                    padding: '14px 18px',
                    borderRadius: '16px',
                    backgroundColor: m.sender === 'user' ? '#3B82F6' : '#F3F4F6',
                    color: m.sender === 'user' ? '#FFF' : '#1F2937',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: '700', marginBottom: '4px', opacity: 0.8 }}>
                    {m.sender === 'user' ? '나' : '👦🏻 민준 (교과서 RAG 학습 완료)'}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '600' }}>{m.textKo}</div>
                  {m.sender === 'ai' && <div style={{ fontSize: '13px', color: '#4B5563', marginTop: '4px' }}>↪ {m.textUser}</div>}
                  {m.sender === 'ai' && m.sources && (
                    <div style={{ marginTop: '8px' }}>
                      {m.sources.map((s, idx) => (
                        <span key={idx} style={{ background: '#EEF2FF', color: '#4338CA', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' }}>
                          🏷️ 근거: {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="내 토론 의견을 입력하세요..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '15px' }}
            />
            <button
              onClick={() => handleSend()}
              style={{ backgroundColor: '#3B82F6', color: 'white', padding: '0 24px', borderRadius: '12px', fontWeight: '700' }}
            >
              의견 전송
            </button>
          </div>
        </div>

        {/* Right Side Panel: Debate Tips & Recommendations */}
        <div style={{ width: '300px', background: 'white', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-soft)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>💡 교과서 토론 근거 가이드</h3>
          <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.6', marginBottom: '16px' }}>
            민준이는 5~6학년 국어/사회 교과서 지문을 학습하여 근거를 바탕으로 토론합니다.
          </p>

          <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>추천 답변 팁</h4>
          {['환경 오염 문제를 줄이기 위해 찬성해!', '대체품 가격이 비싸서 완벽 금지는 힘들 것 같아.', '단계적으로 줄여가는 방안을 제안해.'].map((tip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(tip)}
              style={{
                width: '100%',
                textAlign: 'left',
                backgroundColor: '#FEF3C7',
                color: '#92400E',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '8px',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              💡 {tip}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
