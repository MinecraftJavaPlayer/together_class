'use client';

import React, { useState } from 'react';
// @ts-ignore
import Link from 'next/link';
import { PRACTICE_WORDS, playKoreanSpeech } from '@dahamkke/shared';

export default function WebDictationPage() {
  const [wordIdx, setWordIdx] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [score, setScore] = useState(0);

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
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="brand-logo">
          <span style={{ fontSize: '32px' }}>✍️</span>
          <span className="brand-title">받아쓰기</span>
        </div>
        <ul className="nav-list">
          <li className="nav-item"><Link href="/">🏠 홈 대시보드</Link></li>
          <li className="nav-item"><Link href="/rank">🏆 랭크 & 시즌</Link></li>
          <li className="nav-item"><Link href="/quiz">📝 10문항 평가</Link></li>
          <li className="nav-item"><Link href="/translate">📷 교과서 번역</Link></li>
          <li className="nav-item"><Link href="/interpret">🎙️ 실시간 통역</Link></li>
          <li className="nav-item"><Link href="/debate">💬 토론 친구</Link></li>
          <li className="nav-item"><Link href="/persona">🎭 인물 인터뷰</Link></li>
          <li className="nav-item active"><Link href="/dictation">✍️ 받아쓰기</Link></li>
          <li className="nav-item"><Link href="/writing">✏️ 글자 따라쓰기</Link></li>
          <li className="nav-item"><Link href="/records">📚 학습 기록</Link></li>
        </ul>
      </aside>

      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F59E0B' }}>✍️ 웹 받아쓰기 연습실</h1>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>단어 발음을 듣고 키보드로 받아 적어보세요.</p>
          </div>
          <div style={{ background: '#FEF3C7', padding: '12px 20px', borderRadius: '12px', fontWeight: '800', color: '#B45309' }}>
            ⭐ 획득 포인트: {score} Pt
          </div>
        </div>

        <div style={{ background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '600px', margin: '0 auto', boxShadow: 'var(--shadow-soft)', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#F59E0B', marginBottom: '8px' }}>
            단어 {wordIdx + 1} / {PRACTICE_WORDS.length} (의미: {current.meaning})
          </div>

          <button
            onClick={handlePlayTTS}
            style={{ backgroundColor: '#F59E0B', color: 'white', padding: '16px 32px', borderRadius: '12px', fontSize: '18px', fontWeight: '800', marginBottom: '24px', cursor: 'pointer' }}
          >
            🔊 한국어 발음 다시 듣기 (TTS 재생)
          </button>

          <input
            type="text"
            placeholder="들린 단어를 입력하세요"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #E5E7EB', fontSize: '18px', textAlign: 'center', marginBottom: '20px' }}
          />

          <button
            onClick={handleCheck}
            style={{ width: '100%', backgroundColor: '#14B8A6', color: 'white', padding: '14px', borderRadius: '12px', fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}
          >
            정답 제출하기
          </button>

          <Link href="/quiz" style={{ display: 'inline-block', width: '100%', backgroundColor: '#EC4899', color: 'white', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', boxSizing: 'border-box' }}>
            🎓 단원 학습 완료 & 10문항 평가 풀기 ➔
          </Link>
        </div>
      </main>
    </div>
  );
}
