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

  const getAIResponse = (character: string, query: string): { answer: string; sources: string[] } => {
    const normQuery = query.toLowerCase();
    
    if (character === '흥부') {
      if (normQuery.includes('놀부') || normQuery.includes('형')) {
        return {
          answer: '놀부 형님은 욕심이 많아 부모님의 재산을 혼자 독차지하고 저희 가족을 내쫓았단다. 하지만 나는 형님을 원망하지 않고 늘 잘되시길 바라고 있단다.',
          sources: ['국어 5-1 (나) 2단원 1문단'],
        };
      }
      if (normQuery.includes('제비') || normQuery.includes('다리') || normQuery.includes('구렁이')) {
        return {
          answer: '처마 밑에 살던 새끼 제비가 구렁이를 피하려다 떨어져 다리가 부러졌단다. 너무 불쌍해서 내가 정성껏 다리를 매어주고 돌보아 주었더니, 다음 해에 은혜를 갚으러 박씨를 물어다 주었단다.',
          sources: ['국어 5-1 (나) 2단원 2문단', '국어 5-1 (나) 2단원 3문단'],
        };
      }
      if (normQuery.includes('박') || normQuery.includes('부자') || normQuery.includes('보물') || normQuery.includes('비단')) {
        return {
          answer: '제비가 준 박씨를 심어 열린 커다란 박을 탔더니, 놀랍게도 그 속에서 수많은 금은보화와 비단이 쏟아져 나와 부자가 되었단다. 다 착한 마음씨 덕분에 하늘이 내린 선물이라 생각한단다.',
          sources: ['국어 5-1 (나) 2단원 3문단'],
        };
      }
      if (normQuery.includes('가난') || normQuery.includes('돈') || normQuery.includes('힘') || normQuery.includes('식구') || normQuery.includes('가족')) {
        return {
          answer: '가난해서 먹을 것도 부족하고 살기 팍팍했지만, 온 가족이 서로 아끼고 사랑하며 마음만큼은 따뜻하고 행복하게 지냈단다. 너도 힘들 때일수록 가족을 먼저 챙기렴.',
          sources: ['국어 5-1 (나) 2단원 2문단'],
        };
      }
      return {
        answer: `반갑구나! 나는 흥부란다. 교과서에 나오는 대로 가난하지만 착하게 살아온 인물이지. "${query}"에 대해서는 내 교과서 지문에 자세히 나오지 않는단다. 제비 다리를 고쳐준 이야기나 놀부 형님과의 이야기를 물어봐주면 더 자세히 답해줄 수 있단다.`,
        sources: ['국어 5-1 (나) 2단원 요약'],
      };
    } else if (character === '이순신') {
      if (normQuery.includes('학익진') || normQuery.includes('전술') || normQuery.includes('전법')) {
        return {
          answer: '학익진(鶴翼陣)은 학이 날개를 편 모양으로 왜군의 전선을 둥글게 에워싸고 집중 포격하는 전법이라오. 한산도 대첩에서 이 전술로 왜군의 큰 군함을 격파하여 대승을 거두었소.',
          sources: ['국어 6-1 (가) 1단원 1문단'],
        };
      }
      if (normQuery.includes('거북선') || normQuery.includes('배') || normQuery.includes('군함') || normQuery.includes('함선')) {
        return {
          answer: '거북선은 등판에 철갑과 송곳을 꽂아 왜군이 배에 기어오르지 못하게 하고, 용머리에서 대포와 연기를 뿜어 왜선을 혼란에 빠뜨리는 무적의 돌격선이라오.',
          sources: ['국어 6-1 (가) 1단원 1문단'],
        };
      }
      if (normQuery.includes('한산도') || normQuery.includes('승리') || normQuery.includes('대첩') || normQuery.includes('전투')) {
        return {
          answer: '한산도 앞바다에서 학익진과 거북선을 조화롭게 운용하여 침략한 왜선들을 궤멸시켰소. 우리 해역의 제해권을 지키고 나라의 안위를 보존한 뜻깊은 대첩이라오.',
          sources: ['국어 6-1 (가) 1단원 1문단'],
        };
      }
      if (normQuery.includes('신념') || normQuery.includes('생즉사') || normQuery.includes('살') || normQuery.includes('죽')) {
        return {
          answer: '나에게는 "필사즉생 필생즉사(必死即生 必生即死)", 즉 죽고자 하면 살 것이요 살고자 하면 죽을 것이라는 강한 군인정신과 나라를 향한 일편단심의 신념이 있소. 이 마음으로 위기를 헤쳐나갔소.',
          sources: ['국어 6-1 (가) 1단원 2문단'],
        };
      }
      if (normQuery.includes('백성') || normQuery.includes('군사') || normQuery.includes('부하') || normQuery.includes('나라')) {
        return {
          answer: '어떠한 절체절명의 위기 상황에서도 내 한 몸보다 무고한 백성들의 목숨과 생사고락을 함께하는 군사들을 먼저 생각하는 것이 장수의 도리라고 믿소.',
          sources: ['국어 6-1 (가) 1단원 2문단'],
        };
      }
      return {
        answer: `반갑소. 나는 조선의 수군통제사 이순신이라오. "${query}"에 대해서는 교과서 지문에 적혀있지 않소. 한산도 대첩의 승리 비결이나 거북선, 그리고 나의 나라사랑 신념에 대해 물어보면 성심껏 답하겠소.`,
        sources: ['국어 6-1 (가) 1단원 요약'],
      };
    }
    
    return {
      answer: '교과서 기반으로 답변 중입니다.',
      sources: ['교과서 공통'],
    };
  };

  const handleAsk = (qText?: string) => {
    const askText = qText || question;
    if (!askText) return;

    const res = getAIResponse(selectedCharacter, askText);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        character: selectedCharacter,
        answer: res.answer,
        sources: res.sources,
      },
    ]);
    setQuestion('');
  };

  return (
    <div className="dashboard-container" style={{ height: '100vh', overflow: 'hidden' }}>
      <SidebarNav />

      <main className="main-content" style={{ height: '100vh', overflow: 'hidden', display: 'flex', gap: '24px', padding: '20px 28px', backgroundColor: 'var(--bg-main)', transition: 'background-color 0.2s ease' }}>
        {/* Left Side: Character Picker */}
        <div style={{ width: '260px', background: 'var(--card-bg)', padding: '20px', borderRadius: '16px', border: '1.5px solid var(--border-color)', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-main)', flexShrink: 0 }}>📖 교과서 인물 선택</h3>
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
                    backgroundColor: isSelected ? 'var(--highlight-purple-bg)' : 'var(--input-bg)',
                    border: `2px solid ${isSelected ? 'var(--highlight-purple-border)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    marginBottom: '12px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px', color: 'var(--text-main)' }}>🎭 {tb.characterName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>{tb.grade}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', opacity: 0.85 }}>{tb.unitTitle}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Interview Chat Workspace */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Persona banner */}
          <div style={{ background: 'var(--highlight-purple-bg)', padding: '16px 20px', borderRadius: '16px', border: '1.5px solid var(--highlight-purple-border)', marginBottom: '20px', flexShrink: 0 }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--highlight-purple-text)' }}>선택된 페르소나 & RAG 기반 출처</span>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px', marginBottom: 0 }}>
              🎭 {currentUnit.characterName} 인터뷰 ({currentUnit.unitTitle})
            </h2>
          </div>

          {/* Chat Messages */}
          <div style={{ flex: 1, background: 'var(--card-bg)', border: '1.5px solid var(--border-color)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-soft)', overflowY: 'auto', marginBottom: '16px', minHeight: '340px' }} className="inner-scroll">
            {messages.map((m) => (
              <div key={m.id} style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--highlight-purple-text)', marginBottom: '6px' }}>🎭 {m.character} (1인칭 답변)</div>
                <div style={{ fontSize: '15px', color: 'var(--text-main)', lineHeight: '1.6', fontWeight: '600' }}>{m.answer}</div>
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {m.sources.map((s, idx) => (
                    <span key={idx} style={{ background: 'var(--highlight-purple-bg)', color: 'var(--highlight-purple-text)', fontSize: '11px', fontWeight: '700', padding: '4px 8px', borderRadius: '6px' }}>
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
                border: '1.5px solid var(--border-color)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-main)',
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
