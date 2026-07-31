import { getRankByPoints, RankTier } from './rankSystem';

export interface UserProfile {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: 'student' | 'teacher';
  nativeLang: string;
  points: number;
  completedModules: {
    translate: boolean;
    interpret: boolean;
    debate: boolean;
    persona: boolean;
    dictation: boolean;
    writing: boolean;
  };
  seasonHistory: Array<{
    seasonKey: string;
    finalPoints: number;
    highestRankName: string;
  }>;
}

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'student-seojun',
    email: 'seojun@dahamkke.kr',
    password: '1234',
    name: '이서준 (학생)',
    role: 'student',
    nativeLang: 'ru',
    points: 140,
    completedModules: {
      translate: false,
      interpret: false,
      debate: false,
      persona: false,
      dictation: false,
      writing: false,
    },
    seasonHistory: [
      { seasonKey: '2026-06', finalPoints: 850, highestRankName: '골드 2' },
    ],
  },
  {
    id: 'student-minjun',
    email: 'minjun@dahamkke.kr',
    password: '1234',
    name: '김민준 (짝꿍)',
    role: 'student',
    nativeLang: 'ko',
    points: 1850,
    completedModules: {
      translate: true,
      interpret: true,
      debate: true,
      persona: true,
      dictation: true,
      writing: true,
    },
    seasonHistory: [
      { seasonKey: '2026-06', finalPoints: 1750, highestRankName: '다이아 1' },
    ],
  },
  {
    id: 'student-anna',
    email: 'anna@dahamkke.kr',
    password: '1234',
    name: '안나 (다문화 학생)',
    role: 'student',
    nativeLang: 'ru',
    points: 320,
    completedModules: {
      translate: true,
      interpret: false,
      debate: false,
      persona: false,
      dictation: false,
      writing: false,
    },
    seasonHistory: [],
  },
  {
    id: 'teacher-jungwoong',
    email: 'teacher@dahamkke.kr',
    password: '1234',
    name: '정웅 선생님 (교사)',
    role: 'teacher',
    nativeLang: 'ko',
    points: 5200,
    completedModules: {
      translate: true,
      interpret: true,
      debate: true,
      persona: true,
      dictation: true,
      writing: true,
    },
    seasonHistory: [],
  },
];

export function getUserRank(user: UserProfile): RankTier {
  return getRankByPoints(user.points);
}

export function isAllLearningCompleted(user: UserProfile): boolean {
  if (!user || !user.completedModules) return false;
  const m = user.completedModules;
  return m.translate || m.interpret || m.debate || m.persona || m.dictation || m.writing;
}
