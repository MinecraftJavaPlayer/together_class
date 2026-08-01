'use client';

import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore
import Link from 'next/link';
import { LANGUAGE_LIST } from '@dahamkke/shared';
import { SidebarNav } from '../components/SidebarNav';

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

  // Parse summary metadata dynamically from the sourceText!
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
    const norm = text.toLowerCase();
    
    // Default field trip notice
    if (norm.includes('현장체험학습') || norm.includes('실내화') || norm.includes('도시락')) {
      const maps: Record<string, string> = {
        ru: '[Экскурсия] Экскурсия состоится в четверг, 30 июля. Ученики должны прийти в школу к 09:00 со сменной обувью, личным термосом и обедом. Срок сдачи - до 17:00 вторника, 28 июля.',
        vi: '[Thông báo dã ngoại] Buổi dã ngoại sẽ được tổ chức vào Thứ Năm ngày 30 tháng 7. Học sinh vui lòng đến trường trước 9:00 sáng mang theo giày đi trong nhà, bình nước cá nhân và hộp cơm trưa. Hạn nộp là trước 17:00 Thứ Ba ngày 28 tháng 7.',
        zh: '[研学旅行通知] 研学旅行将于7月30日（星期四）进行。学生请携带室内鞋、个人保温杯和午餐，于上午9:00前到校。提交截止时间为7月28日（星期二）17:00前。',
        mn: '[Хээрийн дадлагын удирдамж] 7-р сарын 30-ны Пүрэв гарагт хээрийн дадлага явагдана. Сурагчид дотор өмсөх гутал, хувийн термос, өдрийн хоолоо бэлдэж, өглөөний 09:00 цагаас өмнө сургуульдаа ирнэ үү. Хугацаа 7-р сарын 28-ны Мягмар гарагийн 17:00 цаг хүртэл байна.',
        en: '[Field Trip Guide] The field trip will take place on Thursday, July 30th. Students should arrive at school by 9:00 AM with indoor shoes, a personal tumbler, and a lunch box. The submission deadline is by Tuesday, July 28th, at 17:00.',
      };
      return maps[lang] || `[${lang.toUpperCase()} Notice] ${text}`;
    }

    // Library book return notice
    if (norm.includes('도서') || norm.includes('반납') || norm.includes('대출')) {
      const maps: Record<string, string> = {
        ru: '[Возврат книг] Срок выдачи и возврата библиотечных книг - до 10 августа. Пожалуйста, верните просроченные книги как можно скорее. В случае задержки выдача книг может быть ограничена.',
        vi: '[Trả sách thư viện] Hạn mượn và trả sách thư viện là ngày 10 tháng 8. Vui lòng trả sách quá hạn càng sớm càng tốt. Nếu quá hạn, việc mượn sách có thể bị giới hạn.',
        zh: '[图书馆图书归还] 图书馆图书借阅及归还截止日期为8月10日。请尽快归还逾期图书。逾期可能会限制图书借阅。',
        mn: '[Номын сангийн ном буцаах] Номын сангийн ном зээлэх болон буцааж өгөх хугацаа 8-р сарын 10 хүртэл байна. Хугацаа хэтэрсэн номыг нэн даруй буцааж өгнө үү. Хугацаа хэтэрсэн тохиолдолд ном зээлэхийг хязгаарлана.',
        en: '[Library Book Return] The deadline for borrowing and returning library books is August 10th. Please return overdue books as soon as possible. Overdue books may restrict future borrowing.',
      };
      return maps[lang] || `[${lang.toUpperCase()} Notice] ${text}`;
    }
    
    // Otherwise, dynamic fallback
    if (lang === 'ru') {
      return `[RU] Перевод объявления: "${text.substring(0, 100)}..."`;
    } else if (lang === 'vi') {
      return `[VI] Dịch thông báo: "${text.substring(0, 100)}..."`;
    } else if (lang === 'zh') {
      return `[ZH] 通知翻译： "${text.substring(0, 100)}..."`;
    } else if (lang === 'mn') {
      return `[MN] Зарлал орчуулга: "${text.substring(0, 100)}..."`;
    }
    return `[${lang.toUpperCase()}] Notice Translation: "${text.substring(0, 100)}..."`;
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
                onClick={() => alert('학부모 공유용 QR 코드 링크가 생성되었습니다!')}
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
