'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SidebarNav } from '../components/SidebarNav';
import { LANGUAGE_LIST, LanguageCode, markModuleCompleted } from '@dahamkke/shared';
import { saveLearningRecord } from '../utils/recordsStore';

const TRANSLATION_MAP: Record<string, string> = {
  ru: 'Давным-давно в одной деревне жили братья Хынбу и Нолбу. Хынбу был беден, но вся семья жила дружно.',
  vi: 'Ngày xưa ở một ngôi làng nọ có hai anh em Heungbu và Nolbu. Heungbu tuy nghèo nhưng cả gia đình sống rất hòa thuận.',
  zh: '很久以前，在一个村庄里住着兴夫和甭夫兄弟。兴夫虽然贫穷，但全家人互相珍惜，和睦生活。',
  mn: 'Эрт урьд цагт нэгэн тосгонд Хынбү, Нолбү хоёр ах дүү амьдардаг байжээ. Хынбү ядуу байсан ч гэр бүлээрээ бие биеэ хайрлан амьдардаг байв.',
  en: 'Once upon a time in a village, brothers Heungbu and Nolbu lived together. Although Heungbu was poor, the whole family cherished each other and lived happily.',
  ja: '昔々ある村にフンブとノルブという兄弟가住んでいました。フンブは貧しかったですが、家族みんなでお互いを大切に暮らしていました。',
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

  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    setIsDarkMode(localStorage.getItem('dahamkke_dark_mode') === 'true');
  }, []);

  const translateSourceText = (text: string, target: string): string => {
    const norm = text.toLowerCase();
    
    // 1. If it's the Lee Sun-sin (이순신) story
    if (norm.includes('이순신') || norm.includes('학익진') || norm.includes('거북선')) {
      const maps: Record<string, string> = {
        ru: 'Во времена династии Чосон адмирал Ли Сун Син одержал великую победу в битве при Хансандо, используя боевое построение "крыло журавля" и корабли-черепахи (Кобуксон).',
        vi: 'Vào thời nhà Joseon, tướng quân Yi Sun-shin đã giành chiến thắng vang dội trong trận hải chiến Hansando nhờ áp dụng trận pháp cánh hạc và tàu rùa.',
        zh: '在朝鲜王朝时期，李舜臣将军利用“鹤翼阵”战术和龟船在闲山岛大捷中夺取了伟大的胜利。',
        mn: 'Жосон улсын үед Ли Сүн Шин жанжин тогорууны далавчит тактик болон яст мэлхийн хөлөг онгоцыг ашиглан Хансандогийн тулалдаанд түүхэн ялалт байгуулав.',
        en: 'During the Joseon Dynasty, Admiral Yi Sun-sin won a monumental victory in the Battle of Hansando using the Crane Wing formation and Turtle Ship.',
        ja: '朝鮮王朝時代、李舜臣将軍は鶴翼の陣戦術と亀船を用いて閑山島大捷で大勝利を収めました。',
        ko: '조선 시대 이순신 장군은 학익진 전법과 거북선을 사용하여 한산도 대첩에서 큰 승리를 거두었습니다.',
      };
      return maps[target] || `[${target.toUpperCase()} 번역] ${text}`;
    }
    
    // 2. If it is the default Heungbu & Nolbu (흥부와 놀부) story
    if (norm.includes('흥부') || norm.includes('놀부') || norm.includes('제비')) {
      const maps: Record<string, string> = {
        ru: 'Давным-давно в одной деревне жили братья Хынбу и Нолбу. Хынбу был беден, но вся семья жила дружно.',
        vi: 'Ngày xưa ở một ngôi làng nọ có hai anh em Heungbu và Nolbu. Heungbu tuy nghèo nhưng cả gia đình sống rất hòa thuận.',
        zh: '很久以前，在一个村庄里住着兴夫和甭夫兄弟。兴夫虽然贫穷，但全家人互相珍惜，和睦生活。',
        mn: 'Эрт урьд цагт нэгэн тосгонд Хынбү, Нолбү хоёр ах дүү амьдардаг байжээ. Хынбү ядуу байсан ч гэр бүлээрээ бие биеэ хайрлан амьдардаг байв.',
        en: 'Once upon a time in a village, brothers Heungbu and Nolbu lived together. Although Heungbu was poor, the whole family cherished each other and lived happily.',
        ja: '昔々ある村にフンブとノルブという兄弟が住んでいました。フンブは貧しかったですが、家族みんなでお互いを大切に暮らしていました。',
        ko: '옛날 옛적 어느 마을에 흥부와 놀부 형제가 살고 있었습니다. 흥부는 가난했지만 온 가족이 서로 아끼며 살았습니다.',
      };
      return maps[target] || `[${target.toUpperCase()} 번역] ${text}`;
    }
    
    // 3. Otherwise, dynamic fallback
    if (target === 'ru') {
      return `[RU] Перевод: "${text.substring(0, 100)}..."`;
    } else if (target === 'vi') {
      return `[VI] Dịch: "${text.substring(0, 100)}..."`;
    } else if (target === 'zh') {
      return `[ZH] 翻译： "${text.substring(0, 100)}..."`;
    } else if (target === 'mn') {
      return `[MN] Орчуулга: "${text.substring(0, 100)}..."`;
    }
    return `[${target.toUpperCase()}] Translation: "${text.substring(0, 100)}..."`;
  };

  const handleTranslate = () => {
    setLoading(true);
    setTimeout(() => {
      const translated = translateSourceText(sourceText, targetLang);
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
        const lowerName = file.name.toLowerCase();
        if (lowerName.includes('lee') || lowerName.includes('sun') || lowerName.includes('이순신') || lowerName.includes('대첩')) {
          setSourceText('조선 선조 때, 왜군이 수많은 군함을 끌고 우리 바다를 침략해 왔습니다. 이순신 장군은 학이 날개를 편 모양의 \'학익진\' 전법과 거북선을 활용하여 한산도 대첩에서 큰 승리를 거두었습니다.');
          const translated = translateSourceText('조선 선조 때, 왜군이 수많은 군함을 끌고 우리 바다를 침략해 왔습니다. 이순신 장군은 학이 날개를 편 모양의 \'학익진\' 전법과 거북선을 활용하여 한산도 대첩에서 큰 승리를 거두었습니다.', targetLang);
          setTranslatedText(`[${targetLang.toUpperCase()} 번역 결과]\n${translated}`);
        } else {
          setSourceText('옛날 옛적 어느 마을에 흥부와 놀부 형제가 살고 있었습니다. 흥부는 가난했지만 온 가족이 서로 아끼며 살았습니다.');
          const translated = translateSourceText('옛날 옛적 어느 마을에 흥부와 놀부 형제가 살고 있었습니다. 흥부는 가난했지만 온 가족이 서로 아끼며 살았습니다.', targetLang);
          setTranslatedText(`[${targetLang.toUpperCase()} 번역 결과]\n${translated}`);
        }
        setLoading(false);
      }, 700);
    }
  };

  const handleTargetLangChange = (newLang: LanguageCode) => {
    setTargetLang(newLang);
    const translated = translateSourceText(sourceText, newLang);
    setTranslatedText(`[${newLang.toUpperCase()} 번역 결과]\n${translated}`);
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
