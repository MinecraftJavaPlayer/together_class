export interface StudentBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface StudentPointsRecord {
  userId: string;
  totalPoints: number;
  level: number;
  badges: StudentBadge[];
}

export const INITIAL_BADGES: StudentBadge[] = [
  { id: 'b-1', name: '첫번역 왕', description: '첫 교과서 번역 성공', icon: '📷', unlockedAt: '2026-07-25' },
  { id: 'b-2', name: '열정 토론가', description: 'AI 토론 친구와 3회 대화 완료', icon: '💬', unlockedAt: '2026-07-25' },
  { id: 'b-3', name: '인물 탐험가', description: '교과서 인물과 인터뷰 완료', icon: '🎭', unlockedAt: '2026-07-25' },
  { id: 'b-4', name: '받아쓰기 달인', description: '받아쓰기 연습 5개 연속 정답', icon: '✍️' },
];
