'use client';

import React, { useState, useRef } from 'react';
import { SidebarNav } from '../components/SidebarNav';
import { LANGUAGE_LIST, LanguageCode, markModuleCompleted } from '@dahamkke/shared';

const TRANSLATION_MAP: Record<string, string> = {
  ru: 'Давным-давно в одной деревне жили братья Хынбу и Нолбу. Хынбу был беден, но вся семья жила дружно.',
  vi: 'Ngày xưa ở một ngôi làng nọ có hai anh em Heungbu và Nolbu. Heungbu tuy nghèo nhưng cả gia đình sống rất hòa thuận.',
  zh: '很久以前，在一个村庄里住着兴夫和甭夫兄弟。兴夫虽然贫穷，但全家人互相珍惜，和睦生活。',
  mn: 'Эрт урьд цагт нэгэн тосгонд Хынбү, Нолбү хоёр ах дүү амьдардаг байжээ. Хынбү ядуу байсан ч гэр бүлээрээ бие биеэ хайрлан амьдардаг байв.',
  en: 'Once upon a time in a village, brothers Heungbu and Nolbu lived together. Although Heungbu was poor, the whole family cherished each other and lived happily.',
  ja: '昔々ある村にフンブとノルブという兄弟が住んでいました。フンブは貧しかったですが、家族みんなでお互いを大切に暮らしていました。',
  ko: '옛날 옛적 어느 마을에 흥부와 놀부 형제가 살고 있었습니다. 흥부는 가난했지만 온 가족이 서로 아끼며 살았습니다.',
};

export default function WebTranslatePage() {
  const [sourceLang, setSourceLang] = useState<LanguageCode>('ko');
  const [targetLang, setTargetLang] = useState<LanguageCode>('ru');
  const [sourceText, setSourceText] = useState(
    '옛날 옛적 어느 마을에 흥부와 놀부 형제가 살고 있었습니다. 흥부는 가난했지만 온 가족이 서로 아끼며 살았습니다.'
  );
  const [translatedText, setTranslatedText] = useState(
    `[RU 번역 결과]\n${TRANSLATION_MAP.ru}`
  );
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTranslate = () => {
    setLoading(true);
    setTimeout(() => {
      const translated = TRANSLATION_MAP[targetLang] || TRANSLATION_MAP.ru;
      setTranslatedText(`[${targetLang.toUpperCase()} 번역 결과]\n${translated}`);
      markModuleCompleted('translate');
      setLoading(false);
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLoading(true);
      setTimeout(() => {
        setSourceText(`[OCR 인식 완료 - ${file.name}]\n옛날 옛적 어느 마을에 흥부와 놀부 형제가 살고 있었습니다. 흥부는 가난했지만 온 가족이 서로 아끼며 살았습니다.`);
        setLoading(false);
      }, 700);
    }
  };

  const handleTargetLangChange = (newLang: LanguageCode) => {
    setTargetLang(newLang);
    const translated = TRANSLATION_MAP[newLang] || TRANSLATION_MAP.ru;
    setTranslatedText(`[${newLang.toUpperCase()} 번역 결과]\n${translated}`);
  };

  return (
    <div className="dashboard-container">
      <SidebarNav />

      <main className="main-content" style={{ overflowY: 'auto' }}>
        {/* Header Title Section */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#14B8A6', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📷</span> 교과서 OCR 번역 (W3)
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
            교과서 지문 이미지를 업로드하고 다국어 병렬 비교 번역을 확인하세요.
          </p>
        </div>

        {/* Two Column Side-by-side Workspace */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Left Column: Input & Upload */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: 'var(--shadow-soft)' }}>
            {/* Left Header with Source Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
                <span style={{ color: '#14B8A6' }}>KR</span> 1. 교과서 이미지 & 한국어 원문
              </h2>

              {/* Source Language Selector with Arrow Button */}
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value as LanguageCode)}
                  style={{
                    appearance: 'none',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '12px',
                    padding: '6px 36px 6px 14px',
                    fontSize: '14px',
                    fontWeight: '800',
                    color: '#0F172A',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  {LANGUAGE_LIST.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '12px', color: '#64748B', fontWeight: '900' }}>
                  ∨
                </span>
              </div>
            </div>

            {/* Upload Box */}
            <div
              style={{
                border: '2px dashed #99F6E4',
                padding: '28px',
                borderRadius: '16px',
                textAlign: 'center',
                marginBottom: '18px',
                backgroundColor: '#F0FDFA',
              }}
            >
              <div style={{ fontSize: '38px', marginBottom: '6px' }}>📖</div>
              <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '14px', fontWeight: '600' }}>
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

            <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
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
                border: '1.5px solid #E2E8F0',
                fontSize: '14px',
                lineHeight: '1.6',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical',
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
              }}
            >
              {loading ? '⚡ 번역 진행 중...' : '⚡ 번역 실행하기'}
            </button>
          </div>

          {/* Right Column: Result Comparison */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: 'var(--shadow-soft)' }}>
            {/* Right Header with Target Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
                <span style={{ color: '#3B82F6' }}>🌐</span> 2. 다국어 번역 결과 ({targetLang.toUpperCase()})
              </h2>

              {/* Target Language Selector with Arrow Button */}
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <select
                  value={targetLang}
                  onChange={(e) => handleTargetLangChange(e.target.value as LanguageCode)}
                  style={{
                    appearance: 'none',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '12px',
                    padding: '6px 36px 6px 14px',
                    fontSize: '14px',
                    fontWeight: '800',
                    color: '#0F172A',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  {LANGUAGE_LIST.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '12px', color: '#64748B', fontWeight: '900' }}>
                  ∨
                </span>
              </div>
            </div>

            <div
              style={{
                minHeight: '260px',
                background: '#F8FAFC',
                padding: '22px',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#1E293B',
              }}
            >
              {loading ? (
                <div style={{ color: '#14B8A6', fontWeight: '700', textAlign: 'center', marginTop: '80px' }}>
                  ⚡ AI 다국어 번역을 생성하는 중입니다...
                </div>
              ) : translatedText ? (
                <div style={{ whiteSpace: 'pre-wrap' }}>{translatedText}</div>
              ) : (
                <div style={{ color: '#9CA3AF', textAlign: 'center', marginTop: '80px' }}>
                  좌측에서 번역 실행 버튼을 누르면 이 영역에 번역 결과가 표시됩니다.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '18px' }}>
              <button
                onClick={() => {
                  markModuleCompleted('translate');
                  alert('⭐ 학습 기록에 번역 내역이 저장되었습니다.');
                }}
                style={{
                  flex: 1,
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
