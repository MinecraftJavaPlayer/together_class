'use client';

import React, { useState, useEffect } from 'react';
// @ts-ignore
import Link from 'next/link';
import {
  SAMPLE_TEXTBOOKS,
  getTeacherPersona,
  isCharacterConfiguredBad,
  generateTeacherPersonaResponse,
} from '@dahamkke/shared';
import { SidebarNav } from '../components/SidebarNav';
import { saveLearningRecord } from '../utils/recordsStore';

export default function WebPersonaPage() {
  const [selectedCharacter, setSelectedCharacter] = useState(SAMPLE_TEXTBOOKS[0].characterName);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; character: string; answer: string; sources: string[] }>>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const initCharacterGreeting = (character: string) => {
    const isBad = isCharacterConfiguredBad(character);
    const persona = getTeacherPersona(character);

    let answer = '';
    let sources: string[] = [];

    if (character === '흥부' && isBad) {
      answer = `크하하! 반갑구나 꼬마야! 나는 선생님의 교사 콘솔 설정에 따라 [나쁜 성격]으로 바뀐 흥부란다. 형 놀부의 재산을 다 빼앗고 제비 다리를 부러뜨릴 거란다! 어디 감히 나한테 질문해 보려무나!`;
      sources = [
        '👨‍🏫 교사 콘솔 설정 반영: "흥부는 나쁘다"',
        `성격 지침: ${persona.traitDescription}`,
      ];
    } else if (character === '흥부') {
      answer = `반갑구나! 나는 교과서 5학년 1학기 지문에 나오는 흥부란다. 선생님이 교사 콘솔에 올리신 교과서 지문도 학습했단다. 나에게 어떤 질문이든 해보렴.`;
      sources = ['국어 5-1 나 2단원 1문단', '📖 Teacher RAG Engine Active'];
    } else if (character === '이순신') {
      answer = `반갑소! 나는 조선의 수군통제사 이순신이라오. 학익진과 거북선, 그리고 나라를 지키기 위한 신념에 대해 무엇이든 물어보시오.`;
      sources = ['국어 6-1 가 1단원 1문단', '📖 Teacher RAG Engine Active'];
    } else {
      answer = `반갑습니다! 나는 ${character}입니다. 선생님께서 설정하신 페르소나 지침에 따라 대화할 준비가 되었답니다.`;
      sources = [`📖 교사 콘솔 연동: ${persona.traitDescription}`];
    }

    setMessages([
      {
        id: '1',
        character,
        answer,
        sources,
      },
    ]);
  };

  useEffect(() => {
    setIsDarkMode(localStorage.getItem('dahamkke_dark_mode') === 'true');
    initCharacterGreeting(selectedCharacter);

    const handlePersonaUpdated = () => {
      initCharacterGreeting(selectedCharacter);
    };
    window.addEventListener('dahamkke_persona_updated', handlePersonaUpdated);
    return () => window.removeEventListener('dahamkke_persona_updated', handlePersonaUpdated);
  }, [selectedCharacter]);

  const currentUnit = SAMPLE_TEXTBOOKS.find((t) => t.characterName === selectedCharacter) || SAMPLE_TEXTBOOKS[0];
  const isCharacterBad = isCharacterConfiguredBad(selectedCharacter);
  const currentPersona = getTeacherPersona(selectedCharacter);

  const getAIResponse = (character: string, query: string): { answer: string; sources: string[] } => {
    return generateTeacherPersonaResponse(character, query);
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

    saveLearningRecord(
      'dialog',
      `인물 인터뷰 (${selectedCharacter})`,
      '러시아어 🇷🇺',
      `질문: ${askText} ➔ 대답: ${res.answer}`
    );

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
          <div style={{ background: isCharacterBad ? '#FEF2F2' : 'var(--highlight-purple-bg)', padding: '16px 20px', borderRadius: '16px', border: `1.5px solid ${isCharacterBad ? '#FCA5A5' : 'var(--highlight-purple-border)'}`, marginBottom: '20px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: isCharacterBad ? '#DC2626' : 'var(--highlight-purple-text)' }}>
                {isCharacterBad ? '😈 교사 콘솔 성격 반전 적용 중: 악역 / 나쁜 성격' : '😇 교사 콘솔 연동: 기본 페르소나 적용 중'}
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px', marginBottom: 0 }}>
                🎭 {currentUnit.characterName} 인터뷰 ({currentUnit.unitTitle})
              </h2>
            </div>
            {isCharacterBad && (
              <span style={{ backgroundColor: '#DC2626', color: '#FFF', fontSize: '12px', fontWeight: '900', padding: '4px 12px', borderRadius: '10px' }}>
                선생님 설정 반영됨
              </span>
            )}
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
