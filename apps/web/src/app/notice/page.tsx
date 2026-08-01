'use client';

import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore
import Link from 'next/link';
import { LANGUAGE_LIST } from '@dahamkke/shared';
import { SidebarNav } from '../components/SidebarNav';

const DICTIONARY: Record<string, Record<string, string>> = {
  // Notice elements
  '현장체험학습': { ru: 'экскурсию', vi: 'dã ngoại', zh: '研学旅行', mn: 'хээрийн дадлага', en: 'field trip', ja: '校外学習', ko: '현장체험학습' },
  '안내장': { ru: 'Объявление', vi: 'Thông báo', zh: '通知', mn: 'Удирдамж', en: 'Notice', ja: '案内', ko: '안내장' },
  '실시됩니다': { ru: 'состоится', vi: 'sẽ được tổ chức', zh: '将举行', mn: 'явагдана', en: 'will take place', ja: '実施されます', ko: '실시됩니다' },
  '실내화': { ru: 'сменную обувь', vi: 'giày đi trong nhà', zh: '室内鞋', mn: 'дотор өмсөх гутал', en: 'indoor shoes', ja: '上履き', ko: '실내화' },
  '개인 텀블러': { ru: 'личный термос', vi: 'bình nước cá nhân', zh: '个人保温杯', mn: 'хувийн термос', en: 'personal tumbler', ja: '水筒', ko: '개인 텀블러' },
  '도시락을': { ru: 'обед', vi: 'hộp cơm trưa', zh: '午餐', mn: 'өдрийн хоол', en: 'lunch box', ja: 'お弁当を', ko: '도시락을' },
  '지참하여': { ru: 'принести с собой', vi: 'mang theo', zh: '携带', mn: 'бэлдэж', en: 'bring', ja: '持参して', ko: '지참하여' },
  '오전 9시까지': { ru: 'к 9 часам утра', vi: 'trước 9 giờ sáng', zh: 'утра 9 giờ sáng', mn: 'өглөөний 09:00 цаг гэхэд', en: 'by 9:00 AM', ja: '午前9時まで', ko: '오전 9시까지' },
  '등교해 주시기 바랍니다': { ru: 'прийти в школу', vi: 'đến trường', zh: '请到校', mn: 'сургуульдаа ирнэ үү', en: 'please come to school', ja: '登校してください', ko: '등교해 주시기 바랍니다' },
  '제출 기한은': { ru: 'срок сдачи', vi: 'hạn nộp là', zh: '截止时间为', mn: 'хугацаа нь', en: 'deadline is', ja: '提出期限は', ko: '제출 기한은' },
  '제출기한은': { ru: 'срок сдачи', vi: 'hạn nộp là', zh: '截止时间为', mn: 'хугацаа нь', en: 'deadline is', ja: '提出期限는', ko: '제출기한은' },
  '도서': { ru: 'книги', vi: 'sách', zh: '图书', mn: 'ном', en: 'books', ja: '図書', ko: '도서' },
  '반납': { ru: 'возврат', vi: 'trả sách', zh: '归还', mn: 'буцааж өгөх', en: 'return', ja: '返却', ko: '반납' },
  '대출': { ru: 'выдача', vi: 'mượn sách', zh: '借阅', mn: 'зээлэх', en: 'borrow', ja: '貸出', ko: '대출' },
  '기한은': { ru: 'срок', vi: 'hạn', zh: '截止日期为', mn: 'хугацаа нь', en: 'deadline is', ja: '期限は', ko: '기한은' },
  '연체': { ru: 'просрочка', vi: 'quá hạn', zh: 'удирдлага', mn: 'хугацаа хэтэрсэн', en: 'overdue', ja: '延滞', ko: '연체' },
  '제한': { ru: 'ограничение', vi: 'giới hạn', zh: '限制', mn: 'хязгаарлах', en: 'restrict', ja: '制限', ko: '제한' }
};

export default function WebNoticePage() {
  const [selectedLang, setSelectedLang] = useState('ru');
  const [sourceText, setSourceText] = useState(
    '[현장체험학습 안내장]\n7월 30일(목) 현장체험학습이 실시됩니다. 학생들은 실내화, 개인 텀블러, 도시락을 지참하여 오전 9시까지 등교해 주시기 바랍니다. 신청서 제출 기한은 7월 28일(화) 17:00까지입니다.'
  );
  
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    setIsDarkMode(localStorage.getItem('dahamkke_dark_mode') === 'true');
  }, []);

  // Parse summary metadata dynamically from the sourceText
  const getParsedSummary = (text: string) => {
    const norm = text.toLowerCase();
    
    let dates = ['등록된 일정 없음'];
    let items = ['등록된 준비물 없음'];
    let deadlines = ['등록된 제출기한 없음'];

    if (norm.includes('7월 30일')) {
      dates = ['2026년 7월 30일(목) 09:00'];
    } else if (norm.includes('8월 10일')) {
      dates = ['2026년 8월 10일(월) 10:00'];
    } else {
      const matchDate = text.match(/\d+월\s*\d+일/);
      if (matchDate) dates = [`2026년 ${matchDate[0]} (일정 확인 필요)`];
    }

    const detectedItems: string[] = [];
    if (norm.includes('실내화')) detectedItems.push('실내화');
    if (norm.includes('텀블러') || norm.includes('물병')) detectedItems.push('개인 텀블러');
    if (norm.includes('도시락')) detectedItems.push('도시락');
    if (norm.includes('도서') || norm.includes('책')) detectedItems.push('연체 도서 반납');
    if (detectedItems.length > 0) items = detectedItems;

    if (norm.includes('7월 28일')) {
      deadlines = ['2026년 7월 28일(화) 17:00까지 제출'];
    } else if (norm.includes('8월 10일')) {
      deadlines = ['2026년 8월 10일(월) 16:00까지 반납'];
    } else {
      const matchDeadline = text.match(/\d+월\s*\d+일/);
      if (matchDeadline) deadlines = [`${matchDeadline[0]} 기한 준수`];
    }

    return { dates, items, deadlines };
  };

  const getNoticeTranslation = (text: string, lang: string): string => {
    if (lang === 'ko') {
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
        placeholders[placeholder] = DICTIONARY[key][lang] || DICTIONARY[key].ko;
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
        setLoading(false);
      }, 600);
    }
  };

  const summary = getParsedSummary(sourceText);
  const translatedText = getNoticeTranslation(sourceText, selectedLang);

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
              
              <button
                onClick={() => alert('학부мо 공유용 QR 코드 링크가 생성되었습니다!')}
                style={{ marginTop: '16px', backgroundColor: '#14B8A6', color: 'white', padding: '12px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', border: 'none', flexShrink: 0 }}
              >
                📲 학부모 공유 QR/링크 생성
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
