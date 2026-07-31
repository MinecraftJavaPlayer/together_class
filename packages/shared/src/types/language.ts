export type LanguageCode = 'ko' | 'ru' | 'zh' | 'vi' | 'uz' | 'kk';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}
