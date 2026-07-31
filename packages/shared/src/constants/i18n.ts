import { LanguageCode } from '../types/language';

export interface PracticeWord {
  id: string;
  wordKo: string;
  meaning: string;
  audioKeyword: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const PRACTICE_WORDS: PracticeWord[] = [
  { id: 'pw-1', wordKo: '교실', meaning: 'Classroom', audioKeyword: '교실', difficulty: 'easy' },
  { id: 'pw-2', wordKo: '선생님', meaning: 'Teacher', audioKeyword: '선생님', difficulty: 'easy' },
  { id: 'pw-3', wordKo: '친구', meaning: 'Friend', audioKeyword: '친구', difficulty: 'easy' },
  { id: 'pw-4', wordKo: '토론', meaning: 'Debate', audioKeyword: '토론', difficulty: 'medium' },
  { id: 'pw-5', wordKo: '흥부', meaning: 'Heungbu (Character)', audioKeyword: '흥부', difficulty: 'medium' },
  { id: 'pw-6', wordKo: '가정통신문', meaning: 'School Notice', audioKeyword: '가정통신문', difficulty: 'hard' },
];

export const UI_TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  ko: {
    welcome: '환영합니다',
    subWelcome: '학습장벽 없는 다국어 교실 에이전트',
    translateTitle: '교과서 OCR 번역',
    interpretTitle: '실시간 통역',
    debateTitle: 'AI 토론 친구',
    personaTitle: '교과서 인물 인터뷰',
    noticeTitle: '가정통신문 번역',
    recordsTitle: '학습 기록',
    dictationTitle: '받아쓰기 연습',
    writingTitle: '글자 따라쓰기',
    teacherConsole: '교사 관리 콘솔',
    selectLang: '언어 선택',
  },
  ru: {
    welcome: 'Добро пожаловать',
    subWelcome: 'Мультиязычный школьный агент без языковых барьеров',
    translateTitle: 'Перевод учебника OCR',
    interpretTitle: 'Синхронный перевод',
    debateTitle: 'ИИ-Друг для дебатов',
    personaTitle: 'Интервью с персонажем',
    noticeTitle: 'Перевод уведомлений',
    recordsTitle: 'История обучения',
    dictationTitle: 'Практика диктанта',
    writingTitle: 'Практика письма',
    teacherConsole: 'Панель учителя',
    selectLang: 'Выбор языка',
  },
  zh: {
    welcome: '欢迎',
    subWelcome: '无语言障碍的多语言课堂AI助手',
    translateTitle: '教材OCR翻译',
    interpretTitle: '实时口译',
    debateTitle: 'AI辩论伙伴',
    personaTitle: '课文人物访谈',
    noticeTitle: '家庭通知单翻译',
    recordsTitle: '学习记录',
    dictationTitle: '听写练习',
    writingTitle: '书写练习',
    teacherConsole: '教师管理后台',
    selectLang: '选择语言',
  },
  vi: {
    welcome: 'Chào mừng',
    subWelcome: 'Trợ lý lớp học đa ngôn ngữ không rào cản',
    translateTitle: 'Dịch sách giáo khoa OCR',
    interpretTitle: 'Phiên dịch trực tiếp',
    debateTitle: 'Bạn tranh luận AI',
    personaTitle: 'Phỏng vấn nhân vật',
    noticeTitle: 'Dịch thông báo nhà trường',
    recordsTitle: 'Lịch sử học tập',
    dictationTitle: 'Luyện nghe chép',
    writingTitle: 'Luyện viết chữ',
    teacherConsole: 'Bảng quản lý giáo viên',
    selectLang: 'Chọn ngôn ngữ',
  },
  uz: {
    welcome: 'Xush kelibsiz',
    subWelcome: 'Tilsiz toʻsiqlarsiz koʻp tilli maktab yordamchisi',
    translateTitle: 'Darslik OCR tarjimasi',
    interpretTitle: 'Jonli tarjima',
    debateTitle: 'AI Munozara doʻsti',
    personaTitle: 'Qahramon bilan suhbat',
    noticeTitle: 'Maktab xabarnomasi tarjimasi',
    recordsTitle: 'Oʻquv tarixi',
    dictationTitle: 'Diktant amaliyoti',
    writingTitle: 'Yozuv amaliyoti',
    teacherConsole: 'Oʻqituvchi paneli',
    selectLang: 'Tilni tanlang',
  },
  kk: {
    welcome: 'Кош келдиниздер',
    subWelcome: 'Тілдік кедергісіз көптілді мектеп көмекшісі',
    translateTitle: 'Оқулық OCR аудармасы',
    interpretTitle: 'Жанды аударма',
    debateTitle: 'AI Дебат досы',
    personaTitle: 'Кейіпкермен сұхбат',
    noticeTitle: 'Мектеп хабарландыруы аудармасы',
    recordsTitle: 'Оқу тарихы',
    dictationTitle: 'Диктант тәжірибесі',
    writingTitle: 'Жазу тәжірибесі',
    teacherConsole: 'Мұғалім панелі',
    selectLang: 'Тілді таңдау',
  },
};

export function normalizePracticeAnswer(answer: string): string {
  return answer.trim().replace(/\s+/g, '');
}
