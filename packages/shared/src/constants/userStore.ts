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
  isPlacementCompleted?: boolean;
  seasonHistory: Array<{
    seasonKey: string;
    finalPoints: number;
    highestRankName: string;
  }>;
}

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'student-master-1',
    email: 'master@dahamkke.kr',
    name: '김도윤',
    role: 'student',
    nativeLang: 'ko',
    points: 32000,
    isPlacementCompleted: true,
    completedModules: { translate: true, interpret: true, debate: true, persona: true, dictation: true, writing: true },
    seasonHistory: [{ seasonKey: '2026-07', finalPoints: 31000, highestRankName: '마스터' }],
  },
  {
    id: 'student-expert-1',
    email: 'expert@dahamkke.kr',
    name: '이지우',
    role: 'student',
    nativeLang: 'ko',
    points: 14500,
    isPlacementCompleted: true,
    completedModules: { translate: true, interpret: true, debate: true, persona: true, dictation: true, writing: true },
    seasonHistory: [],
  },
  {
    id: 'student-diamond-1',
    email: 'diamond@dahamkke.kr',
    name: '박서연',
    role: 'student',
    nativeLang: 'ko',
    points: 7500,
    isPlacementCompleted: true,
    completedModules: { translate: true, interpret: true, debate: true, persona: true, dictation: true, writing: true },
    seasonHistory: [],
  },
  {
    id: 'student-plat-2',
    email: 'plat2@dahamkke.kr',
    name: '최하은',
    role: 'student',
    nativeLang: 'ko',
    points: 2800,
    isPlacementCompleted: true,
    completedModules: { translate: true, interpret: true, debate: true, persona: true, dictation: true, writing: true },
    seasonHistory: [],
  },
  {
    id: 'student-plat-1',
    email: 'plat1@dahamkke.kr',
    name: '송유진',
    role: 'student',
    nativeLang: 'ko',
    points: 1850,
    isPlacementCompleted: true,
    completedModules: { translate: true, interpret: true, debate: true, persona: true, dictation: true, writing: true },
    seasonHistory: [],
  },
  {
    id: 'student-gold-1',
    email: 'gold@dahamkke.kr',
    name: '안나 (러시아)',
    role: 'student',
    nativeLang: 'ru',
    points: 950,
    isPlacementCompleted: true,
    completedModules: { translate: true, interpret: true, debate: true, persona: true, dictation: true, writing: true },
    seasonHistory: [],
  },
];

export function isAllLearningCompleted(user: UserProfile): boolean {
  if (!user || !user.completedModules) return false;
  const m = user.completedModules;
  return m.translate || m.interpret || m.debate || m.persona || m.dictation || m.writing;
}
