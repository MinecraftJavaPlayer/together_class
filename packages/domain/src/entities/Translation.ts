export type TranslationType = 'ocr' | 'notice';

export interface TranslationRecord {
  id: string;
  userId?: string;
  type: TranslationType;
  sourceText: string;
  targetLang: string;
  resultText: string;
  createdAt: string;
}
