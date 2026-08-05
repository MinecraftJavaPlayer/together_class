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

export const INITIAL_USERS: UserProfile[] = [];

export function isAllLearningCompleted(user: UserProfile): boolean {
  if (!user || !user.completedModules) return false;
  const m = user.completedModules;
  return m.translate || m.interpret || m.debate || m.persona || m.dictation || m.writing;
}
