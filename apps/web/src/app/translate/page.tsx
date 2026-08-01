'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SidebarNav } from '../components/SidebarNav';
import { LANGUAGE_LIST, LanguageCode, markModuleCompleted } from '@dahamkke/shared';
import { saveLearningRecord } from '../utils/recordsStore';

const DICTIONARY: Record<string, Record<string, string>> = {
  // Heungbu & Nolbu
  '옛날 옛적': { ru: 'Давным-давно', vi: 'Ngày xửa ngày xưa', zh: '很久以前', mn: 'Эрт урьд цагт', en: 'Once upon a time', ja: '昔々', ko: '옛날 옛적' },
  '어느 마을에': { ru: 'в одной деревне', vi: 'tại một ngôi làng', zh: '在一个村庄里', mn: 'нэгэн тосгонд', en: 'in a village', ja: 'ある村に', ko: '어느 마을에' },
  '형 놀부와': { ru: 'старший брат Нолбу и', vi: 'anh trai Nolbu và', zh: '哥哥甭夫和', mn: 'ах Нолбү болон', en: 'older brother Nolbu and', ja: '兄のノルブと', ko: '형 놀부와' },
  '동생 흥부가': { ru: 'младший брат Хынбу', vi: 'em trai Heungbu', zh: '弟弟兴夫', mn: 'дүү Хынбү', en: 'younger brother Heungbu', ja: '동생 흥부가', ko: '동생 흥부가' },
  '형 놀부': { ru: 'старший брат Нолбу', vi: 'anh trai Nolbu', zh: '哥哥甭夫', mn: 'ах Нолбү', en: 'older brother Nolbu', ja: '兄のノルブ', ko: '형 놀부' },
  '동생 흥부': { ru: 'младший брат Хынбу', vi: 'em trai Heungbu', zh: '弟弟兴夫', mn: 'дүү Хынбү', en: 'younger brother Heungbu', ja: '동생 흥부', ko: '동생 흥부' },
  '놀부와': { ru: 'Нолбу и', vi: 'Nolbu và', zh: '甭夫和', mn: 'Нолбү болон', en: 'Nolbu and', ja: 'ノルブと', ko: '놀부와' },
  '흥부와': { ru: 'Хынбу и', vi: 'Heungbu và', zh: '兴夫和', mn: 'Хынбү болон', en: 'Heungbu and', ja: 'フンブと', ko: '흥부와' },
  '놀부가': { ru: 'Нолбу', vi: 'Nolbu', zh: '甭夫', mn: 'Нолбү', en: 'Nolbu', ja: 'ノルブ가', ko: '놀부가' },
  '흥부가': { ru: 'Хынбу', vi: 'Heungbu', zh: '兴夫', mn: 'Хынбү', en: 'Heungbu', ja: '흥부가', ko: '흥부가' },
  '놀부는': { ru: 'Нолбу', vi: 'Nolbu', zh: '甭夫', mn: 'Нолбү', en: 'Nolbu', ja: 'ノルブは', ko: '놀부는' },
  '흥부는': { ru: 'Хынбу', vi: 'Heungbu', zh: '兴夫', mn: 'Хынбү', en: 'Heungbu', ja: '흥부는', ko: '흥부는' },
  '놀부': { ru: 'Нолбу', vi: 'Nolbu', zh: '甭夫', mn: 'Нолбү', en: 'Nolbu', ja: 'ノルブ', ko: '놀부' },
  '흥부': { ru: 'Хынбу', vi: 'Heungbu', zh: '兴夫', mn: 'Хынбү', en: 'Heungbu', ja: '흥부', ko: '흥부' },
  '형제': { ru: 'братья', vi: 'anh em', zh: '兄弟', mn: 'ах дүү', en: 'brothers', ja: '兄弟', ko: '형제' },
  '형제가': { ru: 'братья', vi: 'anh em', zh: '兄弟들', mn: 'ах дүү хоёр', en: 'brothers', ja: '형제가', ko: '형제가' },
  '형제는': { ru: 'братья', vi: 'anh em', zh: '兄弟들', mn: 'ах дүү хоёр', en: 'brothers', ja: '형제는', ko: '형제는' },
  '살고 있었습니다': { ru: 'жили', vi: 'đã sống', zh: '生活着', mn: 'амьдардаг байжээ', en: 'lived', ja: '住んでいました', ko: '살고 있었습니다' },
  '살았습니다': { ru: 'жили', vi: 'đã sống', zh: '生活着', mn: 'амьдарч байв', en: 'lived', ja: '暮らしていました', ko: '살았습니다' },
  '가난했지만': { ru: 'был беден, но', vi: 'tuy nghèo nhưng', zh: 'although poor,', mn: 'ядуу байсан ч', en: 'was poor, but', ja: '貧しかったですが', ko: '가난했지만' },
  '온 가족이': { ru: 'вся семья', vi: 'cả gia đình', zh: '全家人', mn: 'гэр бүлээрээ', en: 'the whole family', ja: '家族みんなで', ko: '온 가족이' },
  '서로': { ru: 'друг друга', vi: 'nhau', zh: '互相', mn: 'бие биеэ', en: 'each other', ja: 'お互いを', ko: '서로' },
  '아끼며': { ru: 'дорожили', vi: 'trân trọng', zh: '珍惜', mn: 'хайрлан', en: 'cherished', ja: '大切に', ko: '아끼며' },
  '따뜻하게': { ru: 'тепло', vi: 'ấm áp', zh: '温馨地', mn: 'дулаан', en: 'warmly', ja: '温かく', ko: '따뜻하게' },
  
  // Yi Sun-sin
  '조선': { ru: 'Чосон', vi: 'Joseon', zh: '朝鲜', mn: 'Жосон', en: 'Joseon', ja: '朝鮮', ko: '조선' },
  '선조 때': { ru: 'в эпоху короля Сонджо', vi: 'thời vua Seonjo', zh: '宣祖时期', mn: 'Сонжо хааны үед', en: 'during King Seonjo’s reign', ja: '宣祖の時代', ko: '선조 때' },
  '왜군이': { ru: 'японская армия', vi: 'quân Nhật', zh: '倭军', mn: 'Японы цэрэг', en: 'the Japanese army', ja: '倭軍が', ko: '왜군이' },
  '수많은': { ru: 'многочисленные', vi: 'vô số', zh: '无数的', mn: 'олон тооны', en: 'numerous', ja: '数多くの', ko: '수많은' },
  '군함을': { ru: 'военные корабли', vi: 'chiến hạm', zh: '军舰', mn: '바이лдааны хөлөг онгоцыг', en: 'warships', ja: '군함을', ko: '군함을' },
  '침략해 왔습니다': { ru: 'вторглась', vi: 'đã xâm lược', zh: '侵略了', mn: 'халдан довтолж ирэв', en: 'invaded', ja: '침략してきました', ko: '침략해 왔습니다' },
  '이순신': { ru: 'Ли Сун Син', vi: 'Yi Sun-shin', zh: '李舜臣', mn: 'Ли Сүн Шин', en: 'Yi Sun-sin', ja: '李舜臣', ko: '이순신' },
  '장군은': { ru: 'генерал', vi: 'tướng quân', zh: '将军', mn: 'жанжин', en: 'general', ja: '장군은', ko: '장군은' },
  '학익진': { ru: 'Хакикджин (крыло журавля)', vi: 'Hạc Dực Trận', zh: '鹤翼阵', mn: 'Тогорууны далавчит 전법', en: 'Hakikjin (Crane Wing formation)', ja: '鶴翼の陣', ko: '학익진' },
  '거북선을': { ru: 'корабль-черепаху', vi: 'tàu rùa', zh: '龟船', mn: 'яст мэлхийн хөлөг онгоцыг', en: 'Turtle Ship', ja: '거북선을', ko: '거북선을' },
  '한산도 대첩에서': { ru: 'в битве при Хансандо', vi: 'trong trận Hansando', zh: '在闲山岛大捷中', mn: 'Хансандогийн тулалдаанд', en: 'in the Battle of Hansando', ja: '한산도 대첩에서', ko: '한산도 대첩에서' },
  '큰 승리를': { ru: 'великую победу', vi: 'chiến thắng lớn', zh: '巨大的胜利', mn: 'их ялалт', en: 'a great victory', ja: '큰 승리를', ko: '큰 승리를' },
  '거두었습니다': { ru: 'одержал', vi: 'đã giành được', zh: '取得了', mn: 'байгуулав', en: 'achieved', ja: '거두었습니다', ko: '거두었습니다' }
};

export default function WebTranslatePage() {
  const [sourceLang, setSourceLang] = useState<LanguageCode>('ko');
  const [targetLang, setTargetLang] = useState<LanguageCode>('ru');
  const [sourceText, setSourceText] = useState(
    '옛날 옛적 어느 마을에 흥부와 놀부 형제가 살고 있었습니다. 흥부는 가난했지만 온 가족이 서로 아끼며 살았습니다.'
  );
  
  const translateSourceText = (text: string, target: string): string => {
    if (target === 'ko') {
      return text;
    }

    let result = text;
    const placeholders: Record<string, string> = {};
    let placeholderCounter = 0;

    const keys = Object.keys(DICTIONARY).sort((a, b) => b.length - a.length);

    for (const key of keys) {
      let index = result.indexOf(key);
      while (index !== -1) {
        const placeholder = `__TOKEN_${placeholderCounter}__`;
        placeholders[placeholder] = DICTIONARY[key][target] || DICTIONARY[key].ko;
        placeholderCounter++;
        
        result = result.substring(0, index) + placeholder + result.substring(index + key.length);
        index = result.indexOf(key);
      }
    }

    for (const placeholder in placeholders) {
      result = result.replaceAll(placeholder, placeholders[placeholder]);
    }

    return result;
  };

  const [translatedText, setTranslatedText] = useState(
    `[RU 번역 결과]\n${translateSourceText('옛날 옛적 어느 마을에 흥부와 놀부 형제가 살고 있었습니다. 흥부는 가난했지만 온 가족이 서로 아끼며 살았습니다.', 'ru')}`
  );
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    setIsDarkMode(localStorage.getItem('dahamkke_dark_mode') === 'true');
  }, []);

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
        let newSource = '';
        if (lowerName.includes('lee') || lowerName.includes('sun') || lowerName.includes('이순신') || lowerName.includes('대첩')) {
          newSource = '조선 선조 때, 왜군이 수많은 군함을 끌고 우리 바다를 침략해 왔습니다. 이순신 장군은 학이 날개를 편 모양의 \'학익진\' 전법과 거북선을 활용하여 한산도 대첩에서 큰 승리를 거두었습니다.';
        } else {
          newSource = '옛날 옛적 어느 마을에 흥부와 놀부 형제가 살고 있었습니다. 흥부는 가난했지만 온 가족이 서로 아끼며 살았습니다.';
        }
        setSourceText(newSource);
        const translated = translateSourceText(newSource, targetLang);
        setTranslatedText(`[${targetLang.toUpperCase()} 번역 결과]\n${translated}`);
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
              onChange={(e) => {
                const val = e.target.value;
                setSourceText(val);
                const translated = translateSourceText(val, targetLang);
                setTranslatedText(`[${targetLang.toUpperCase()} 번역 결과]\n${translated}`);
              }}
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
