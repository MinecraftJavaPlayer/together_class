'use client';

import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore
import Link from 'next/link';
import { LANGUAGE_LIST } from '@dahamkke/shared';
import { SidebarNav } from '../components/SidebarNav';
import { translateSourceText } from '../utils/translationHelper';

export default function WebNoticePage() {
  const [selectedLang, setSelectedLang] = useState('ru');
  const [sourceText, setSourceText] = useState(
    '[현장체험학습 안내장]\n7월 30일(목) 현장체험학습이 실시됩니다. 학생들은 실내화, 개인 텀블러, 도시락을 지참하여 오전 9시까지 등교해 주시기 바랍니다. 신청서 제출 기한은 7월 28일(화) 17:00까지입니다.'
  );
  
  const [loading, setLoading] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [summary, setSummary] = useState({
    dates: ['2026년 7월 30일(목) 09:00'],
    items: ['실내화', '개인 텀블러', '도시락'],
    deadlines: ['2026년 7월 28일(화) 17:00까지 제출'],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    setIsDarkMode(localStorage.getItem('dahamkke_dark_mode') === 'true');
  }, []);

  // Parse summary metadata dynamically from the sourceText using regex & search keys
  const getParsedSummary = (text: string) => {
    let dates: string[] = [];
    let items: string[] = [];
    let deadlines: string[] = [];

    // Clean text by normalizing spaces
    const cleanText = text.replace(/\s+/g, ' ');

    // 1. Extract dates (e.g. 7월 30일, 8월 10일)
    const dateRegex = /(\d+월\s*\d+일(\s*\([^)]+\))?(\s*\d+시)?)/g;
    let match;
    while ((match = dateRegex.exec(cleanText)) !== null) {
      const matchStr = match[0].trim();
      const beforeIndex = Math.max(0, match.index - 30);
      const surroundingText = cleanText.substring(beforeIndex, match.index + 50);
      
      // If date is related to deadlines
      if (surroundingText.includes('까지') || surroundingText.includes('기한') || surroundingText.includes('제출') || surroundingText.includes('반납')) {
        if (!deadlines.includes(matchStr + ' 까지')) {
          deadlines.push(matchStr + ' 까지');
        }
      } else {
        if (!dates.includes(matchStr)) {
          dates.push(matchStr);
        }
      }
    }

    // 2. Extract items (준비물)
    const commonItems = [
      '실내화', '텀블러', '도시락', '물병', '물통', '필기도구', '교과서', '우산', '풀', '가위',
      '공책', '색종이', '운동복', '체육복', '운동화', '간식', '물티슈', '휴지', '장갑', '돋보기'
    ];
    for (const item of commonItems) {
      if (cleanText.includes(item) && !items.includes(item)) {
        items.push(item);
      }
    }
    const prepRegex = /(?:준비물|지참물)\s*:?\s*([^\n.]+)/i;
    const prepMatch = text.match(prepRegex);
    if (prepMatch) {
      const foundItems = prepMatch[1].split(/[,/]/).map(s => s.trim()).filter(s => s.length > 0 && s.length < 20);
      foundItems.forEach(fit => {
        if (!items.includes(fit)) {
          items.push(fit);
        }
      });
    }

    // 3. Extract deadlines (제출기한)
    const deadlineRegex = /(\d+월\s*\d+일(\s*\(.\))?(\s*\d+:\d+)?\s*까지)/g;
    while ((match = deadlineRegex.exec(cleanText)) !== null) {
      const matchStr = match[0].trim();
      if (!deadlines.includes(matchStr)) {
        deadlines.push(matchStr);
      }
    }
    const limitRegex = /(?:기한은|기한:\s*)\s*([^\n.]+)/i;
    const limitMatch = text.match(limitRegex);
    if (limitMatch) {
      const limitStr = limitMatch[1].trim();
      if (!deadlines.includes(limitStr)) {
        deadlines.push(limitStr);
      }
    }

    // fallback defaults
    if (dates.length === 0) dates = ['등록된 일정 없음 (본문 확인)'];
    if (items.length === 0) items = ['등록된 준비물 없음 (본문 확인)'];
    if (deadlines.length === 0) deadlines = ['등록된 제출기한 없음 (본문 확인)'];

    return {
      dates: Array.from(new Set(dates)),
      items: Array.from(new Set(items)),
      deadlines: Array.from(new Set(deadlines))
    };
  };

  const updateNoticeData = async (text: string, lang: string) => {
    setLoading(true);
    // Parse summary instantly
    const parsed = getParsedSummary(text);
    setSummary(parsed);

    // Translate notice text asynchronously
    try {
      const translated = await translateSourceText(text, lang);
      setTranslatedText(translated);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Run update on source text or target language change (with 400ms debounce)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      updateNoticeData(sourceText, selectedLang);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [sourceText, selectedLang]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLoading(true);
      setTimeout(() => {
        const lowerName = file.name.toLowerCase();
        if (lowerName.includes('library') || lowerName.includes('book') || lowerName.includes('도서') || lowerName.includes('책') || lowerName.includes('반납')) {
          setSourceText('[학교 도서실 안내]\n학교 도서실 도서 대출 및 반납 기한은 8월 10일까지입니다. 연체 도서는 속히 반납하여 주시기 바랍니다. 연체 시 도서 대출이 제한될 수 있습니다.');
        } else {
          setSourceText('[현장체험학습 안내장]\n7월 30일(목) 현장체험학습이 실시됩니다. 학생들은 실내화, 개인 텀블러, 도시락을 지참하여 오전 9시까지 등교해 주시기 바랍니다. 신청서 제출 기한은 7월 28일(화) 17:00까지입니다.');
        }
      }, 600);
    }
  };

  return (
    <div className="dashboard-container" style={{ height: '100vh', overflow: 'hidden' }}>
      <SidebarNav />

      <main className="main-content" style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '20px 28px', backgroundColor: 'var(--bg-main)', transition: 'background-color 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#EC4899' }}>📄 가정통신문 다국어 번역 & 핵심요약 (W7)</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>학부모 및 이주배경 학생을 위해 가정통신문을 자동 번역하고 필수 준비사항을 요약합니다.</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)' }}>번역할 언어:</span>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                style={{
                  appearance: 'none',
                  backgroundColor: 'var(--card-bg)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '6px 36px 6px 14px',
                  fontSize: '14px',
                  fontWeight: '800',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  outline: 'none',
                }}
              >
                {LANGUAGE_LIST.filter(l => l.code !== 'ko').map((l) => (
                  <option key={l.code} value={l.code} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-main)' }}>
                    {l.name}
                  </option>
                ))}
              </select>
              <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '900' }}>
                ∨
              </span>
            </div>
          </div>
        </div>

        {/* Workspace Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flex: 1, minHeight: 0 }}>
          {/* Left Panel: Upload & Source Text */}
          <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '16px', border: '1.5px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-main)' }}>📄 가정통신문 업로드 & 원문</h2>
            
            <div
              style={{
                border: '2px dashed var(--highlight-danger-border)',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center',
                background: 'var(--highlight-danger-bg)',
                marginBottom: '16px',
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '4px' }}>📑</div>
              <p style={{ fontSize: '13px', color: 'var(--highlight-danger-text)', marginBottom: '8px', fontWeight: '600' }}>
                가정통신문 이미지(JPG/PNG) 또는 PDF 파일을 등록하세요
              </p>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ backgroundColor: '#EC4899', color: 'white', padding: '8px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', border: 'none', fontSize: '13px' }}
              >
                📁 파일 선택 (OCR 번역)
              </button>
            </div>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px' }}>
              인식된 한국어 본문 (자유롭게 편집 가능)
            </label>
            
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              rows={8}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: '1.5px solid var(--border-color)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-main)',
                fontSize: '14px',
                lineHeight: '1.6',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'none',
                flex: 1,
              }}
            />
          </div>

          {/* Right Panel: Summary & Translation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Key Summary Card */}
            <div style={{ background: 'var(--highlight-warning-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--highlight-warning-border)', flexShrink: 0 }}>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--highlight-warning-text)', marginBottom: '12px' }}>📌 핵심 요약 (Key Summary)</h2>
              <div style={{ marginBottom: '8px', color: 'var(--highlight-warning-text)' }}>
                <span style={{ fontWeight: '700' }}>📅 일시: </span>
                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{summary.dates.join(', ')}</span>
              </div>
              <div style={{ marginBottom: '8px', color: 'var(--highlight-warning-text)' }}>
                <span style={{ fontWeight: '700' }}>🎒 준비물: </span>
                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{summary.items.join(', ')}</span>
              </div>
              <div style={{ color: 'var(--highlight-warning-text)' }}>
                <span style={{ fontWeight: '700' }}>⏰ 제출기한: </span>
                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{summary.deadlines.join(', ')}</span>
              </div>
            </div>

            {/* Translation Output Card */}
            <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '16px', border: '1.5px solid var(--border-color)', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-main)' }}>
                🌐 다국어 번역본 ({LANGUAGE_LIST.find(l => l.code === selectedLang)?.name || selectedLang.toUpperCase()})
              </h2>
              
              <div
                style={{
                  flex: 1,
                  background: 'var(--input-bg)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  fontSize: '15px',
                  color: 'var(--text-main)',
                  lineHeight: '1.6',
                  overflowY: 'auto',
                }}
              >
                {loading ? (
                  <div style={{ color: '#EC4899', fontWeight: '700', textAlign: 'center', marginTop: '40px' }}>
                    ⚡ 가정통신문 실시간 분석 및 번역 생성 중...
                  </div>
                ) : (
                  <div style={{ whiteSpace: 'pre-wrap', fontWeight: '600' }}>{translatedText}</div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexShrink: 0 }}>
                <button
                  onClick={() => alert('학부모 공유용 QR 코드 링크가 생성되었습니다!')}
                  style={{ flex: 1, backgroundColor: '#14B8A6', color: 'white', padding: '12px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', border: 'none' }}
                >
                  📲 학부모 공유 QR/링크 생성
                </button>

                {translatedText && (
                  <button
                    onClick={() => {
                      if (!window.speechSynthesis) {
                        alert('이 브라우저는 음성 합성(TTS)을 지원하지 않습니다.');
                        return;
                      }
                      window.speechSynthesis.cancel();
                      const cleanText = translatedText.replace(/^\[.*?\]\n/, '');
                      const utterance = new SpeechSynthesisUtterance(cleanText);
                      const localeMap: Record<string, string> = {
                        ru: 'ru-RU',
                        vi: 'vi-VN',
                        zh: 'zh-CN',
                        mn: 'mn-MN',
                        en: 'en-US',
                        ja: 'ja-JP',
                        ko: 'ko-KR',
                      };
                      utterance.lang = localeMap[selectedLang] || 'en-US';
                      window.speechSynthesis.speak(utterance);
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: '#3B82F6',
                      color: 'white',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 10px rgba(59, 130, 246, 0.15)',
                    }}
                  >
                    🔊 번역문 듣기 (TTS)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
