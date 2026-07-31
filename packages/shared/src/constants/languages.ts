import { LanguageInfo, LanguageCode } from '../types/language';

export const SUPPORTED_LANGUAGES: Record<LanguageCode, LanguageInfo> = {
  ko: { code: 'ko', name: '한국어', nativeName: '한국어', flag: '🇰🇷' },
  ru: { code: 'ru', name: '러시아어', nativeName: 'Русский', flag: '🇷🇺' },
  zh: { code: 'zh', name: '중국어', nativeName: '中文', flag: '🇨🇳' },
  vi: { code: 'vi', name: '베트남어', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  uz: { code: 'uz', name: '우즈베크어', nativeName: "O'zbekcha", flag: '🇺🇿' },
  kk: { code: 'kk', name: '카자흐어', nativeName: 'Қазақша', flag: '🇰🇿' },
};

export const LANGUAGE_LIST: LanguageInfo[] = Object.values(SUPPORTED_LANGUAGES);
