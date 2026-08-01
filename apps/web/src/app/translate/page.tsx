'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SidebarNav } from '../components/SidebarNav';
import { LANGUAGE_LIST, LanguageCode, markModuleCompleted } from '@dahamkke/shared';
import { saveLearningRecord } from '../utils/recordsStore';
import { translateSourceText } from '../utils/translationHelper';

export default function WebTranslatePage() {
  const [sourceLang, setSourceLang] = useState<LanguageCode>('ko');
  const [targetLang, setTargetLang] = useState<LanguageCode>('ru');
  const [sourceText, setSourceText] = useState(
    '옛날 옛적 어느 마을에 흥부와 놀부 형제가 살고 있었습니다. 흥부는 가난했지만 온 가족이 서로 아끼며 살았습니다.'
  );
  
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    setIsDarkMode(localStorage.getItem('dahamkke_dark_mode') === 'true');
  }, []);

  const triggerTranslation = async (text: string, lang: string) => {
    setLoading(true);
    try {
      const translated = await translateSourceText(text, lang);
      setTranslatedText(`[${lang.toUpperCase()} 번역 결과]\n${translated}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Run translation on load and when target language changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      triggerTranslation(sourceText, targetLang);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [sourceText, targetLang]);

  const handleTranslate = () => {
    triggerTranslation(sourceText, targetLang);
    markModuleCompleted('translate');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLoading(true);
      setTimeout(() => {
        const lowerName = file.name.toLowerCase();
        let newSource = '';
        if (lowerName.includes('lee') || lowerName.includes('sun') || lowerName.includes('이순신') || lowerName.includes('대첩')) {
          newSource = '조선 선조 때, 왜군이 수많은 군함을 끌고 우리 바다를 침략해 왔습니다. 이순신 장군은 학이 날개를 편 모양의 \'학익진\' 전법과 거북선을 활용하여 한산도 대첩에서 큰 승리를 거두었습니다.';
        } else {
          newSource = '옛날 옛적 어느 마을에 흥부와 놀부 형제가 살고 있었습니다. 흥부는 가난했지만 온 가족이 서로 아끼며 살았습니다.';
        }
        setSourceText(newSource);
      }, 700);
    }
  };

  const handleTargetLangChange = (newLang: LanguageCode) => {
    setTargetLang(newLang);
  };

  return (
    <div className="dashboard-container" style={{ height: '100vh', overflow: 'hidden' }}>
      <SidebarNav />

      <main className="main-content" style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '20px 28px', backgroundColor: 'var(--bg-main)', transition: 'background-color 0.2s ease' }}>
        {/* Header Title Section */}
        <div style={{ marginBottom: '20px', flexShrink: 0 }}>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#14B8A6', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📷</span> 교과서 OCR 번역 (W3)
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px', marginBottom: 0 }}>
            교과서 지문 이미지를 업로드하고 다국어 병렬 비교 번역을 확인하세요.
          </p>
        </div>

        {/* Two Column Side-by-side Workspace */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flex: 1, minHeight: 0 }}>
          {/* Left Column: Input & Upload */}
          <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border-color)', padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column' }}>
            {/* Left Header with Source Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexShrink: 0 }}>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>
                <span style={{ color: '#14B8A6' }}>KR</span> 1. 교과서 이미지 & 한국어 원문
              </h2>

              {/* Source Language Selector with Arrow Button */}
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value as LanguageCode)}
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
                    outline: 'none',
                  }}
                >
                  {LANGUAGE_LIST.map((l) => (
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

            {/* Upload Box */}
            <div
              style={{
                border: '2px dashed var(--highlight-foreign-border)',
                padding: '28px',
                borderRadius: '16px',
                textAlign: 'center',
                marginBottom: '18px',
                backgroundColor: 'var(--highlight-foreign-bg)',
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: '38px', marginBottom: '6px' }}>📖</div>
              <p style={{ fontSize: '13px', color: 'var(--highlight-foreign-text)', marginBottom: '14px', fontWeight: '800' }}>
                교과서 이미지 파일 (JPG/PNG)을 드래그하거나 선택하세요
              </p>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  backgroundColor: '#14B8A6',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '14px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)',
                  cursor: 'pointer',
                }}
              >
                📁 이미지 업로드 (OCR)
              </button>
            </div>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px', flexShrink: 0 }}>
              인식된 한국어 텍스트 (수정 가능)
            </label>
            <textarea
              rows={6}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
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

            <button
              onClick={handleTranslate}
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: '#14B8A6',
                color: 'white',
                padding: '14px',
                borderRadius: '12px',
                fontWeight: '900',
                fontSize: '16px',
                marginTop: '16px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(20, 184, 166, 0.25)',
                flexShrink: 0,
              }}
            >
              {loading ? '⚡ 번역 진행 중...' : '⚡ 번역 실행하기'}
            </button>
          </div>

          {/* Right Column: Result Comparison */}
          <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border-color)', padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column' }}>
            {/* Right Header with Target Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexShrink: 0 }}>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>
                <span style={{ color: '#3B82F6' }}>🌐</span> 2. 다국어 번역 결과 ({targetLang.toUpperCase()})
              </h2>

              {/* Target Language Selector with Arrow Button */}
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <select
                  value={targetLang}
                  onChange={(e) => handleTargetLangChange(e.target.value as LanguageCode)}
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
                    outline: 'none',
                  }}
                >
                  {LANGUAGE_LIST.map((l) => (
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

            <div
              style={{
                flex: 1,
                background: 'var(--input-bg)',
                padding: '22px',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                fontSize: '15px',
                lineHeight: '1.7',
                color: 'var(--text-main)',
                overflowY: 'auto',
              }}
            >
              {loading ? (
                <div style={{ color: '#14B8A6', fontWeight: '700', textAlign: 'center', marginTop: '80px' }}>
                  ⚡ AI 다국어 번역을 생성하는 중입니다...
                </div>
              ) : translatedText ? (
                <div style={{ whiteSpace: 'pre-wrap', fontWeight: '600' }}>{translatedText}</div>
              ) : (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '80px' }}>
                  좌측에서 번역 실행 버튼을 누르면 이 영역에 번역 결과가 표시됩니다.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '18px', flexShrink: 0 }}>
              <button
                onClick={() => {
                  const targetLangName = LANGUAGE_LIST.find(l => l.code === targetLang)?.name || targetLang.toUpperCase();
                  const targetLangFlag = LANGUAGE_LIST.find(l => l.code === targetLang)?.flag || '🌐';
                  saveLearningRecord(
                    'ocr',
                    '교과서 번역 (' + targetLangName + ')',
                    targetLangName + ' ' + targetLangFlag,
                    translatedText.replace(/^\[.*?\]\n/, '')
                  );
                  markModuleCompleted('translate');
                  alert('⭐ 학습 기록에 번역 내역이 저장되었습니다.');
                }}
                style={{
                  width: '100%',
                  backgroundColor: '#E06A55',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: '800',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(224, 106, 85, 0.2)',
                }}
              >
                ⭐ 학습 기록에 저장
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
