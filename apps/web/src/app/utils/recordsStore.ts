'use client';

export interface LearningRecord {
  id: string;
  type: 'ocr' | 'dialog';
  title: string;
  lang: string;
  date: string;
  preview: string;
}

const DEFAULT_RECORDS: LearningRecord[] = [
  { id: 'seed-1', type: 'ocr', title: '교과서 5학년 1학기 지문', lang: '러시아어 🇷🇺', date: '2026-07-25', preview: '옛날 옛적 어느 마을에 흥부와 놀부 형제가...' },
  { id: 'seed-2', type: 'dialog', title: 'AI 토론 친구 (일회용품 규제)', lang: '러시아어 🇷🇺', date: '2026-07-25', preview: '찬성하는 입장의 이유를 잘 명시해줘서 고마워!' },
  { id: 'seed-3', type: 'ocr', title: '가정통신문 (현장체험학습)', lang: '러시아어 🇷🇺', date: '2026-07-24', preview: '2026학년도 현장체험학습 안내 및 준수사항...' },
];

export function getLearningRecords(): LearningRecord[] {
  if (typeof window === 'undefined') return DEFAULT_RECORDS;
  
  try {
    const raw = localStorage.getItem('dahamkke_learning_records');
    if (!raw) {
      localStorage.setItem('dahamkke_learning_records', JSON.stringify(DEFAULT_RECORDS));
      return DEFAULT_RECORDS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse learning records:', e);
    return DEFAULT_RECORDS;
  }
}

export function saveLearningRecord(type: 'ocr' | 'dialog', title: string, lang: string, preview: string): LearningRecord {
  const records = getLearningRecords();
  
  const newRecord: LearningRecord = {
    id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    type,
    title,
    lang,
    date: new Date().toISOString().split('T')[0],
    preview: preview.length > 50 ? preview.substring(0, 47) + '...' : preview,
  };
  
  const updated = [newRecord, ...records];
  if (typeof window !== 'undefined') {
    localStorage.setItem('dahamkke_learning_records', JSON.stringify(updated));
  }
  
  return newRecord;
}
