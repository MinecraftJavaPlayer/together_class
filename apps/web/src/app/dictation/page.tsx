'use client';

import React, { useState, useEffect } from 'react';
// @ts-ignore
import Link from 'next/link';
import { PRACTICE_WORDS, playKoreanSpeech } from '@dahamkke/shared';
import { SidebarNav } from '../components/SidebarNav';

export default function WebDictationPage() {
  const [wordIdx, setWordIdx] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [score, setScore] = useState(0);

  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    setIsDarkMode(localStorage.getItem('dahamkke_dark_mode') === 'true');
  }, []);

  const current = PRACTICE_WORDS[wordIdx];

  const handlePlayTTS = () => {
    playKoreanSpeech(current.wordKo);
  };

  const handleCheck = () => {
    if (inputVal.trim() === current.wordKo) {
      setScore((prev) => prev + 20);
      alert(`🎉 정답입니다! "${current.wordKo}" (+20 포인트 획득!)`);
      setInputVal('');
      setWordIdx((prev) => (prev + 1) % PRACTICE_WORDS.length);
    } else {
      alert(`❌ 오답입니다. 정답은 "${current.wordKo}" 입니다.`);
    }
  };

  return (
    <div className="dashboard-container" style={{ height: '100vh', overflow: 'hidden' }}>
      <SidebarNav />

      <main className="main-content" style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '20px 28px', backgroundColor: 'var(--bg-main)', transition: 'background-color 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F59E0B' }}>✍️ 웹 받아쓰기 연습실</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>단어 발음을 듣고 키보드로 받아 적어보세요.</p>
          </div>
          <div style={{ background: 'var(--highlight-warning-bg)', border: '1px solid var(--highlight-warning-border)', padding: '12px 20px', borderRadius: '12px', fontWeight: '800', color: 'var(--highlight-warning-text)' }}>
            ⭐ 획득 포인트: {score} Pt
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
          <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border-color)', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '600px', boxShadow: 'var(--shadow-soft)', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#F59E0B', marginBottom: '8px' }}>
              단어 {wordIdx + 1} / {PRACTICE_WORDS.length}
            </div>

            <button
              onClick={handlePlayTTS}
              style={{ backgroundColor: '#F59E0B', color: 'white', padding: '16px 32px', borderRadius: '12px', fontSize: '18px', fontWeight: '800', marginBottom: '24px', cursor: 'pointer', border: 'none' }}
            >
              🔊 한국어 발음 다시 듣기 (TTS 재생)
            </button>

            <input
              type="text"
              placeholder="들린 단어를 입력하세요"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: '2px solid var(--border-color)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-main)',
                fontSize: '18px',
                textAlign: 'center',
                marginBottom: '20px',
                outline: 'none',
              }}
            />

            <button
              onClick={handleCheck}
              style={{ width: '100%', backgroundColor: '#14B8A6', color: 'white', padding: '14px', borderRadius: '12px', fontSize: '16px', fontWeight: '800', marginBottom: '16px', cursor: 'pointer', border: 'none' }}
            >
              정답 제출하기
            </button>

            <Link href="/quiz" style={{ display: 'inline-block', width: '100%', backgroundColor: '#EC4899', color: 'white', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: '800', textDecoration: 'none', boxSizing: 'border-box' }}>
              🎓 단원 학습 완료 & 10문항 평가 풀기 ➔
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
