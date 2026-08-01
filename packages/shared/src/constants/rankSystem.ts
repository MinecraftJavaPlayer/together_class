export interface RankTier {
  id: string;
  name: string;
  subTier: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  bgColor: string;
  icon: string;
  tierGroup: 'bronze' | 'silver' | 'gold' | 'diamond' | 'master';
}

export const RANK_TIERS: RankTier[] = [
  { id: 'bronze-1', name: '브론즈 1', subTier: '1', minPoints: 0, maxPoints: 19, color: '#CD7F32', bgColor: '#FEF3C7', icon: '🥉', tierGroup: 'bronze' },
  { id: 'bronze-2', name: '브론즈 2', subTier: '2', minPoints: 20, maxPoints: 49, color: '#B45309', bgColor: '#FEF3C7', icon: '🥉', tierGroup: 'bronze' },
  { id: 'bronze-3', name: '브론즈 3', subTier: '3', minPoints: 50, maxPoints: 99, color: '#92400E', bgColor: '#FEF3C7', icon: '🥉', tierGroup: 'bronze' },
  
  { id: 'silver-1', name: '실버 1', subTier: '1', minPoints: 100, maxPoints: 169, color: '#94A3B8', bgColor: '#F1F5F9', icon: '🥈', tierGroup: 'silver' },
  { id: 'silver-2', name: '실버 2', subTier: '2', minPoints: 170, maxPoints: 299, color: '#64748B', bgColor: '#F1F5F9', icon: '🥈', tierGroup: 'silver' },
  { id: 'silver-3', name: '실버 3', subTier: '3', minPoints: 300, maxPoints: 549, color: '#475569', bgColor: '#F1F5F9', icon: '🥈', tierGroup: 'silver' },

  { id: 'gold-1', name: '골드 1', subTier: '1', minPoints: 550, maxPoints: 799, color: '#F59E0B', bgColor: '#FEF3C7', icon: '🥇', tierGroup: 'gold' },
  { id: 'gold-2', name: '골드 2', subTier: '2', minPoints: 800, maxPoints: 1199, color: '#D97706', bgColor: '#FEF3C7', icon: '🥇', tierGroup: 'gold' },
  { id: 'gold-3', name: '골드 3', subTier: '3', minPoints: 1200, maxPoints: 1699, color: '#B45309', bgColor: '#FEF3C7', icon: '🥇', tierGroup: 'gold' },

  { id: 'diamond-1', name: '다이아 1', subTier: '1', minPoints: 1700, maxPoints: 2499, color: '#06B6D4', bgColor: '#ECFEFF', icon: '💎', tierGroup: 'diamond' },
  { id: 'diamond-2', name: '다이아 2', subTier: '2', minPoints: 2500, maxPoints: 3499, color: '#0891B2', bgColor: '#ECFEFF', icon: '💎', tierGroup: 'diamond' },
  { id: 'diamond-3', name: '다이아 3', subTier: '3', minPoints: 3500, maxPoints: 4999, color: '#0E7490', bgColor: '#ECFEFF', icon: '💎', tierGroup: 'diamond' },

  { id: 'master', name: '마스터', subTier: 'MAX', minPoints: 5000, maxPoints: Infinity, color: '#8B5CF6', bgColor: '#F3E8FF', icon: '👑', tierGroup: 'master' },
];

export function getRankByPoints(points: number): RankTier {
  const rank = RANK_TIERS.find(r => points >= r.minPoints && points <= r.maxPoints);
  return rank || RANK_TIERS[0];
}

export function calculateQuizPoints(correctCount: number): number {
  // 10 questions total.
  // 10/10 -> +20, 5/10 -> 0, 0/10 -> -20
  const score = Math.max(0, Math.min(10, correctCount));
  return (score - 5) * 4;
}

export interface SeasonHistoryItem {
  seasonKey: string;
  finalPoints: number;
  highestRankName: string;
  resetAt: string;
}

export interface MonthlySeasonState {
  currentSeasonKey: string;
  userPoints: number;
  seasonHistory: SeasonHistoryItem[];
}

export function checkAndResetMonthlySeason(
  state: MonthlySeasonState,
  targetDate: Date = new Date()
): { updatedState: MonthlySeasonState; wasReset: boolean } {
  const currentYearMonth = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;

  if (state.currentSeasonKey && state.currentSeasonKey !== currentYearMonth) {
    const finalRank = getRankByPoints(state.userPoints);
    const historyItem: SeasonHistoryItem = {
      seasonKey: state.currentSeasonKey,
      finalPoints: state.userPoints,
      highestRankName: finalRank.name,
      resetAt: targetDate.toISOString(),
    };

    return {
      updatedState: {
        currentSeasonKey: currentYearMonth,
        userPoints: 0,
        seasonHistory: [...(state.seasonHistory || []), historyItem],
      },
      wasReset: true,
    };
  }

  return {
    updatedState: {
      ...state,
      currentSeasonKey: state.currentSeasonKey || currentYearMonth,
    },
    wasReset: false,
  };
}

export interface QuizQuestion {
  id: number;
  question: string;
  type: 'multiple-choice' | 'short-answer';
  difficulty: '하' | '중' | '상';
  options: string[];
  answerIndex: number;
  acceptableAnswers?: string[];
  explanation: string;
}

export const SAMPLE_EVALUATION_QUIZ: QuizQuestion[] = [
  // --- [난이도: 하 (Easy) - 10개] ---
  {
    id: 1,
    question: "'흥부전'에서 다리가 부러진 제비를 치료해 준 착한 동생 흥부가 받은 선물은 무엇인가요?",
    type: 'multiple-choice',
    difficulty: '하',
    options: ["박 씨", "황금 열쇠", "마술 지팡이", "비단 옷"],
    answerIndex: 0,
    explanation: "흥부는 다친 제비를 지극정성으로 고쳐주고 은혜의 박 씨를 받았습니다."
  },
  {
    id: 2,
    question: "[주관식] 흥부전에서 은혜를 갚기 위해 박 씨를 물어다 준 새의 이름은 무엇인가요?",
    type: 'short-answer',
    difficulty: '하',
    options: [],
    answerIndex: 0,
    acceptableAnswers: ["제비", "제비새"],
    explanation: "박 씨를 물어다 은혜를 갚은 새는 '제비'입니다."
  },
  {
    id: 3,
    question: "이순신 장군이 한산도 대첩에서 학이 날개를 편 모양으로 적함을 에워싸 대승을 거둔 해전 전법은 무엇인가요?",
    type: 'multiple-choice',
    difficulty: '하',
    options: ["학익진", "팔진도", "배수진", "장사진"],
    answerIndex: 0,
    explanation: "이순신 장군은 학의 날개 모양인 '학익진' 전법으로 왜선을 격파했습니다."
  },
  {
    id: 4,
    question: "[주관식] 이순신 장군이 임진왜란 기간 동안 친필로 작성한 국보급 일기의 이름은 무엇인가요?",
    type: 'short-answer',
    difficulty: '하',
    options: [],
    answerIndex: 0,
    acceptableAnswers: ["난중일기"],
    explanation: "이순신 장군이 전쟁 중 작성한 일기는 '난중일기'입니다."
  },
  {
    id: 5,
    question: "사계절 중 봄, 여름 다음으로 오며, 선선한 바람이 불고 나뭇잎이 단풍으로 물드는 계절은 언제인가요?",
    type: 'multiple-choice',
    difficulty: '하',
    options: ["가을", "겨울", "봄", "여름"],
    answerIndex: 0,
    explanation: "단풍이 들고 선선한 가을입니다."
  },
  {
    id: 6,
    question: "'흥부전'에서 심술궂고 욕심이 많아 동생인 흥부를 집에서 쫓아낸 흥부의 형 이름은 무엇인가요?",
    type: 'multiple-choice',
    difficulty: '하',
    options: ["놀부", "심청이", "춘향이", "홍길동"],
    answerIndex: 0,
    explanation: "흥부의 욕심 많은 형은 놀부입니다."
  },
  {
    id: 7,
    question: "[주관식] 하얀 바탕 가운데에 태극 문양이 있고, 네 모퉁이에 건곤감리 4괘가 그려진 우리나라 국기의 이름은 무엇인가요?",
    type: 'short-answer',
    difficulty: '하',
    options: [],
    answerIndex: 0,
    acceptableAnswers: ["태극기"],
    explanation: "대한민국의 국기는 태극기입니다."
  },
  {
    id: 8,
    question: "선생님과 학생들이 함께 모여 공부하고 대화하는 교실 공간을 뜻하는 한국어 어휘는 무엇인가요?",
    type: 'multiple-choice',
    difficulty: '하',
    options: ["교실", "도서관", "운동장", "식당"],
    answerIndex: 0,
    explanation: "선생님과 학생들이 학습을 진행하는 방은 '교실'입니다."
  },
  {
    id: 9,
    question: "[주관식] 학교에서 학부모님과 학생에게 행사 일정, 준비물, 중요한 소식을 전달하는 안내 문서의 이름은 무엇인가요?",
    type: 'short-answer',
    difficulty: '하',
    options: [],
    answerIndex: 0,
    acceptableAnswers: ["가정통신문", "알림장", "가정 통신문"],
    explanation: "학교 소식과 일정을 전하는 문서는 '가정통신문'입니다."
  },
  {
    id: 10,
    question: "이순신 장군이 12척의 배로 130여 척의 왜군 배를 물리쳐 세계 해전 역사상 기적으로 불리는 해전의 이름은 무엇인가요?",
    type: 'multiple-choice',
    difficulty: '하',
    options: ["명량 해전", "노량 해전", "사천 해전", "부산포 해전"],
    answerIndex: 0,
    explanation: "12척의 배로 크게 이긴 해전은 명량 해전(명량대첩)입니다."
  },

  // --- [난이도: 중 (Medium) - 10개] ---
  {
    id: 11,
    question: "가상 친구 민준이와 AI 교과서 토론을 진행할 때 올바르고 바람직한 토론 태도는 무엇인가요?",
    type: 'multiple-choice',
    difficulty: '중',
    options: ["상대방의 의견을 존중하며 근거를 제시한다", "상대방의 말을 도중에 끊는다", "자기 생각만 맞다고 화를 낸다", "근거 없이 주장만 되풀이한다"],
    answerIndex: 0,
    explanation: "토론 시에는 상대방 의견을 경청 및 존중하며 논리적인 근거를 들어 말해야 합니다."
  },
  {
    id: 12,
    question: "[주관식] 토론에서 자기 주장이 타당함을 증명하기 위해 대는 객관적인 이유나 사실 자료를 무엇이라 하나요?",
    type: 'short-answer',
    difficulty: '중',
    options: [],
    answerIndex: 0,
    acceptableAnswers: ["근거", "이유", "증거"],
    explanation: "주장을 뒷받침하는 타당한 이유나 자료를 '근거'라고 합니다."
  },
  {
    id: 13,
    question: "조선 시대 과학 기술 발전에 큰 공을 세운 발명가로, 세종대왕의 명을 받아 해시계(앙부일구), 물시계(자격루) 등을 제작한 인물은 누구인가요?",
    type: 'multiple-choice',
    difficulty: '중',
    options: ["장영실", "정약용", "김정호", "이황"],
    answerIndex: 0,
    explanation: "세종대왕의 지지를 받아 뛰어난 과학 기구를 제작한 인물은 장영실입니다."
  },
  {
    id: 14,
    question: "[주관식] 생각이나 감정을 말로 나타낼 때 쓰는 가장 기본적이고 완결된 말의 단위를 무엇이라고 하나요?",
    type: 'short-answer',
    difficulty: '중',
    options: [],
    answerIndex: 0,
    acceptableAnswers: ["문장"],
    explanation: "마침표나 문장 부호로 완성되는 생각의 기본 단위는 문장입니다."
  },
  {
    id: 15,
    question: "다음 중 올바른 맞춤법과 띄어쓰기가 적용된 문장은 무엇인가요?",
    type: 'multiple-choice',
    difficulty: '중',
    options: ["선생님, 안녕하십니까?", "선생님, 안녕 하십니까?", "선생 님, 안녕하십니까?", "선생님 안녕 하 십니까?"],
    answerIndex: 0,
    explanation: "'선생님, 안녕하십니까?'가 정손하고 올바른 표준 맞춤법 표기입니다."
  },
  {
    id: 16,
    question: "[주관식] 조선 후기 지리학자 김정호가 직접 전국을 발로 뛰며 완성한, 우리나라 최초의 정밀한 대형 전국 지도 이름은 무엇인가요?",
    type: 'short-answer',
    difficulty: '중',
    options: [],
    answerIndex: 0,
    acceptableAnswers: ["대동여지도"],
    explanation: "목판으로 인쇄된 조선 최고의 전국 지도는 대동여지도입니다."
  },
  {
    id: 17,
    question: "'콩 심은 데 콩 나오고 팥 심은 데 팥 나온다'라는 한국 속담이 담고 있는 뜻은 무엇인가요?",
    type: 'multiple-choice',
    difficulty: '중',
    options: ["모든 일은 원인에 따라 반드시 결과가 생긴다", "콩과 팥은 함께 심는 것이 좋다", "농사를 지을 때는 정성이 필요 없다", "음식을 만들 때는 재료가 가장 중요하다"],
    answerIndex: 0,
    explanation: "원인이 있으면 그에 맞는 확실한 결과가 따른다는 뜻의 속담입니다."
  },
  {
    id: 18,
    question: "[주관식] 세종대왕께서 글을 몰라 어려움을 겪는 백성을 불쌍히 여겨 창제하신 훌륭한 우리나라 글자의 이름은 무엇인가요?",
    type: 'short-answer',
    difficulty: '중',
    options: [],
    answerIndex: 0,
    acceptableAnswers: ["한글", "훈민정음"],
    explanation: "세종대왕이 창제하신 우리나라 고유 글자는 '한글' (훈민정음)입니다."
  },
  {
    id: 19,
    question: "조선 시대 궁궐 중 하나로, 자연 지형을 훼손하지 않고 아름답게 정원을 꾸민 후원(비원)이 있어 유네스코 세계문화유산에 등재된 곳은 어디인가요?",
    type: 'multiple-choice',
    difficulty: '중',
    options: ["창덕궁", "경복궁", "덕수궁", "경희궁"],
    answerIndex: 0,
    explanation: "자연 조화가 돋보여 유네스코 문화유산으로 지정된 궁궐은 창덕궁입니다."
  },
  {
    id: 20,
    question: "[주관식] 교실에서 수업 시작 및 마칠 때 선생님께 올바르게 올리는 인사 예절 구령 중 '차렷' 다음의 동작 단어는 무엇인가요?",
    type: 'short-answer',
    difficulty: '중',
    options: [],
    answerIndex: 0,
    acceptableAnswers: ["경례", "인사"],
    explanation: "교실 인사 구령 표준은 '차렷, 경례'입니다."
  },

  // --- [난이도: 상 (Hard) - 10개] ---
  {
    id: 21,
    question: "흥부전처럼 자신이 받은 은혜나 도움을 잊지 않고 감사하며 반드시 갚는다는 의미의 사자성어는 무엇인가요?",
    type: 'multiple-choice',
    difficulty: '상',
    options: ["결초보은", "동문서답", "우이독경", "탁상공론"],
    answerIndex: 0,
    explanation: "결초보은(結草報恩)은 풀을 묶어서라도 은혜를 갚는다는 뜻입니다."
  },
  {
    id: 22,
    question: "[주관식] 조선 후기 실학자로 '거중기'를 발명하여 수원 화성을 건립하는 데 크게 기여한 학자의 이름은 무엇인가요?",
    type: 'short-answer',
    difficulty: '상',
    options: [],
    answerIndex: 0,
    acceptableAnswers: ["정약용", "다산 정약용"],
    explanation: "거중기를 발명하고 수원 화성을 설계한 조선 실학자는 '정약용'입니다."
  },
  {
    id: 23,
    question: "토론 과정에서 상대방 주장의 약점이나 오류를 지적하여 논리적으로 반박하는 말을 무엇이라고 하나요?",
    type: 'multiple-choice',
    difficulty: '상',
    options: ["반론", "입론", "요약", "동의"],
    answerIndex: 0,
    explanation: "상대방 주장에 근거를 들어 논리적으로 반박하는 절차는 '반론'입니다."
  },
  {
    id: 24,
    question: "[주관식] 이순신 장군이 임진왜란 해전에서 왜적을 물리치기 위해 만든 쇠갑옷 형태의 뚜껑이 덮인 철갑 군함은 무엇인가요?",
    type: 'short-answer',
    difficulty: '상',
    options: [],
    answerIndex: 0,
    acceptableAnswers: ["거북선", "귀선"],
    explanation: "이순신 장군의 대표적인 군함은 '거북선'입니다."
  },
  {
    id: 25,
    question: "서로 다른 문화적 배경을 가진 다양한 사람들이 존중하며 함께 어우러져 살아가는 사회를 무엇이라 부르나요?",
    type: 'multiple-choice',
    difficulty: '상',
    options: ["다문화 사회", "단일문화 사회", "폐쇄적 사회", "경쟁 사회"],
    answerIndex: 0,
    explanation: "다양한 문화와 언어를 가진 구성원이 함께 어울리는 사회는 '다문화 사회'입니다."
  },
  {
    id: 26,
    question: "[주관식] '널리 인간 세상을 이롭게 한다'라는 뜻을 가진 단군조선의 건국 이념이자 오늘날 대한민국의 교육 이념은 무엇인가요?",
    type: 'short-answer',
    difficulty: '상',
    options: [],
    answerIndex: 0,
    acceptableAnswers: ["홍익인간"],
    explanation: "단군조선의 건국 이념은 홍익인간(弘益人間)입니다."
  },
  {
    id: 27,
    question: "다음 중 올바른 띄어쓰기 규정에 맞게 작성된 예문은 무엇인가요?",
    type: 'multiple-choice',
    difficulty: '상',
    options: ["나는 열심히 공부를 합니다.", "나는열심히 공부를합니다.", "나 는열심히공부를 합니다.", "나는 열심히공부를 합니다."],
    answerIndex: 0,
    explanation: "'나는 열심히 공부를 합니다.' 각 단어(조사 결합 포함) 띄어쓰기가 올바릅니다."
  },
  {
    id: 28,
    question: "[주관식] 나침반이나 방위에서 해가 돋는 동쪽을 바라보고 섰을 때, 나의 오른쪽이 가리키는 방위는 어디인가요?",
    type: 'short-answer',
    difficulty: '상',
    options: [],
    answerIndex: 0,
    acceptableAnswers: ["남쪽", "남"],
    explanation: "동쪽을 바라볼 때, 오른쪽은 남쪽, 왼쪽은 북쪽, 등 뒤는 서쪽입니다."
  },
  {
    id: 29,
    question: "세종대왕이 창제하신 한글의 해설서로, 글자를 만든 원리와 사용법을 설명해 주고 있어 유네스코 기록유산으로 등재된 문헌의 이름은 무엇인가요?",
    type: 'multiple-choice',
    difficulty: '상',
    options: ["훈민정음 해례본", "삼국유사", "조선왕조실록", "직지심체요절"],
    answerIndex: 0,
    explanation: "한글 창제 원리가 적혀 있어 유네스코 세계기록유산에 등재된 책은 훈민정음 해례본입니다."
  },
  {
    id: 30,
    question: "[주관식] 이웃끼리 음식이나 떡을 서로 나누어 먹으며 서로 돕고 지내는 한국 고유의 훈훈한 공동체 문화를 뜻하는 단어는 무엇인가요?",
    type: 'short-answer',
    difficulty: '상',
    options: [],
    answerIndex: 0,
    acceptableAnswers: ["정", "이웃사촌", "나눔", "품앗이"],
    explanation: "이웃끼리 돕고 마음을 나누는 따뜻한 한국 문화는 '정' 또는 '이웃사촌' 문화입니다."
  }
];

/**
 * Randomly picks 10 questions from the 30-question bank, and shuffles options for multiple-choice questions!
 */
export function getShuffledEvaluationQuiz(): QuizQuestion[] {
  // 1. Shuffle full question pool
  const pool = [...SAMPLE_EVALUATION_QUIZ];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // 2. Take top 10 questions
  const selected = pool.slice(0, 10);

  // 3. Shuffle options for multiple-choice questions
  return selected.map((q) => {
    if (q.type === 'short-answer' || !q.options || q.options.length === 0) {
      return { ...q };
    }
    const correctAnswerText = q.options[q.answerIndex];
    const shuffledOptions = [...q.options];
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }
    const newAnswerIndex = shuffledOptions.indexOf(correctAnswerText);
    return {
      ...q,
      options: shuffledOptions,
      answerIndex: newAnswerIndex,
    };
  });
}
