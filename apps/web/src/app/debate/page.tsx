'use client';

import React, { useState, useEffect } from 'react';
// @ts-ignore
import Link from 'next/link';
import { SidebarNav } from '../components/SidebarNav';

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

  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    setIsDarkMode(localStorage.getItem('dahamkke_dark_mode') === 'true');
  }, []);

  const getDebateResponse = (query: string): { textKo: string; textUser: string; sources: string[] } => {
    const normQuery = query.toLowerCase();
    
    if (normQuery.includes('찬성') || normQuery.includes('법') || normQuery.includes('금지') || normQuery.includes('동의') || normQuery.includes('맞아') || normQuery.includes('필요')) {
      return {
        textKo: '일회용품을 법으로 강력히 금지해야 한다는 네 말에 정말 깊이 동의해! 국어 6-1 토론 단원에서도 쓰레기 매립 부족 문제와 미세 플라스틱으로 인한 동물 피해의 대안으로 규제 강화가 언급되거든. 그렇다면 종이 빨대나 텀블러 같은 대체품 사용을 더 의무화해야 할까?',
        textUser: 'Я полностью согласен с тем, что пластик должен быть запрещен законом! Должны ли мы сделать использование многоразовых стаканов обязательным?',
        sources: ['국어 6-1 (가) 1단원 (비판적 사고와 토론) 3문단'],
      };
    }
    
    if (normQuery.includes('반대') || normQuery.includes('불편') || normQuery.includes('힘들') || normQuery.includes('비싸') || normQuery.includes('상인') || normQuery.includes('부담')) {
      return {
        textKo: '일회용품 규제가 자영업자와 일반 시민에게 주는 과도한 불편함과 비용 부담도 간과해서는 안 돼. 사회 6-2 환경 교과서에서도 상생과 경제적 실용성을 균형 있게 다루고 있거든. 규제보다는 스스로 일회용품을 줄일 때 혜택을 주는 인센티브 제도가 더 효과적일까?',
        textUser: 'Мы также не должны игнорировать неудобства и финансовое бремя для бизнеса. Будет ли система поощрений лучше, чем запреты?',
        sources: ['사회 6-2 2단원 (환경 문제와 상생) 5문단'],
      };
    }
    
    if (normQuery.includes('해결') || normQuery.includes('대안') || normQuery.includes('방법') || normQuery.includes('생각') || normQuery.includes('의견')) {
      return {
        textKo: '양측의 절충안으로, 친환경 생분해 플라스틱 기술 개발에 정부가 적극적으로 보조금을 지급하고 분리배출 인프라를 대폭 개선하는 방법을 생각해볼 수 있어. 교과서에서도 자원 순환 경제를 모범 대안으로 꼽았거든. 이에 대해 추가적인 의견이 있니?',
        textUser: 'В качестве компромисса правительство могло бы субсидировать биоразлагаемые технологии. Есть ли у тебя дополнительные мысли на этот счет?',
        sources: ['사회 6-2 2단원 (자원 순환과 환경 기술) 6문단'],
      };
    }

    return {
      textKo: `흥미로운 의견 고마워! 교과서 토론 지문에 따르면 일회용품 법적 규제는 환경 보존과 경제적 편의라는 두 가치가 충돌하는 대표적 쟁점이야. 네 생각은 환경 보존과 경제 활성화 중 어느 쪽에 더 가깝니?`,
      textUser: `Интересное мнение. Твоя идея ближе к сохранению окружающей среды или к экономическому удобству?`,
      sources: ['국어 6-1 (가) 1단원 요약'],
    };
  };

  const handleSend = (textToSend?: string) => {
    const msg = textToSend || inputText;
    if (!msg) return;

    const res = getDebateResponse(msg);

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: 'user', textKo: msg, textUser: msg },
      {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        textKo: res.textKo,
        textUser: res.textUser,
        sources: res.sources,
      },
    ]);
    setInputText('');
  };

  return (
    <div className="dashboard-container" style={{ height: '100vh', overflow: 'hidden' }}>
      <SidebarNav />

      <main className="main-content" style={{ height: '100vh', overflow: 'hidden', display: 'flex', gap: '24px', padding: '20px 28px', backgroundColor: 'var(--bg-main)', transition: 'background-color 0.2s ease' }}>
        {/* Main Chat Thread Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ background: 'var(--highlight-dialog-bg)', padding: '16px 20px', borderRadius: '16px', border: '1.5px solid var(--highlight-dialog-border)', marginBottom: '20px', flexShrink: 0 }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--highlight-dialog-text)' }}>오늘의 교과서 토론 주제 (RAG 학습 완료)</span>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px', marginBottom: 0 }}>📌 {topic}</h2>
          </div>

          <div
            className="inner-scroll"
            style={{
              flex: 1,
              background: 'var(--card-bg)',
              border: '1.5px solid var(--border-color)',
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
                    backgroundColor: m.sender === 'user' ? '#3B82F6' : 'var(--input-bg)',
                    color: m.sender === 'user' ? '#FFF' : 'var(--text-main)',
                    border: m.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: '700', marginBottom: '4px', opacity: 0.8, color: m.sender === 'user' ? '#FFF' : 'var(--highlight-purple-text)' }}>
                    {m.sender === 'user' ? '나' : '👦🏻 민준 (교과서 RAG 학습 완료)'}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '700' }}>{m.textKo}</div>
                  {m.sender === 'ai' && <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '600' }}>↪ {m.textUser}</div>}
                  {m.sender === 'ai' && m.sources && (
                    <div style={{ marginTop: '8px' }}>
                      {m.sources.map((s, idx) => (
                        <span key={idx} style={{ background: 'var(--highlight-dialog-bg)', color: 'var(--highlight-dialog-text)', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' }}>
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
          <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
            <input
              type="text"
              placeholder="내 토론 의견을 입력하세요..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                border: '1.5px solid var(--border-color)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-main)',
                fontSize: '15px',
                outline: 'none',
              }}
            />
            <button
              onClick={() => handleSend()}
              style={{ backgroundColor: '#3B82F6', color: 'white', padding: '0 24px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', border: 'none' }}
            >
              의견 전송
            </button>
          </div>
        </div>

        {/* Right Side Panel: Debate Tips & Recommendations */}
        <div style={{ width: '300px', background: 'var(--card-bg)', border: '1.5px solid var(--border-color)', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-soft)', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-main)' }}>💡 교과서 토론 근거 가이드</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
            민준이는 5~6학년 국어/사회 교과서 지문을 학습하여 근거를 바탕으로 토론합니다.
          </p>

          <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>추천 답변 팁</h4>
          <div style={{ flex: 1, overflowY: 'auto' }} className="inner-scroll">
            {['환경 오염 문제를 줄이기 위해 찬성해!', '대체품 가격이 비싸서 완벽 금지는 힘들 것 같아.', '단계적으로 줄여가는 방안을 제안해.'].map((tip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(tip)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  backgroundColor: 'var(--highlight-warning-bg)',
                  border: '1px solid var(--highlight-warning-border)',
                  color: 'var(--highlight-warning-text)',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                }}
              >
                💡 {tip}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
