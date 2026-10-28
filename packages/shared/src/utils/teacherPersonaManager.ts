import { searchRAGContext } from './ragEngine';

export type PersonalityPreset = 'good' | 'bad' | 'humorous' | 'coward' | 'futuristic' | 'proud' | 'custom';

export interface TeacherPersonaConfig {
  characterName: string;
  personalityType: PersonalityPreset;
  traitDescription: string;
  systemPrompt: string;
  speechStyle: 'friendly' | 'villain' | 'historical' | 'humorous' | 'futuristic';
  updatedAt: string;
}

const PERSONA_STORAGE_KEY = 'dahamkke_teacher_personas_v2';
const ACTIVE_PERSONA_KEY = 'dahamkke_teacher_persona'; // legacy fallback

export const DEFAULT_PERSONA_MAP: Record<string, TeacherPersonaConfig> = {
  '흥부': {
    characterName: '흥부',
    personalityType: 'good',
    traitDescription: '가난하지만 마음씨 착하고 온순하며 형을 공경하는 성격',
    systemPrompt: '너는 교과서 속 인물 흥부야. 착하고 따뜻한 성격으로 초등학생 어린이에게 1인칭으로 답변해줘.',
    speechStyle: 'friendly',
    updatedAt: new Date().toISOString(),
  },
  '놀부': {
    characterName: '놀부',
    personalityType: 'bad',
    traitDescription: '욕심 많고 심술궂으며 부모님 재산을 독차지하고 동생을 내쫓은 인물',
    systemPrompt: '너는 교과서 속 인물 놀부야. 욕심 많고 퉁명스러운 성격으로 답변해줘.',
    speechStyle: 'villain',
    updatedAt: new Date().toISOString(),
  },
  '이순신': {
    characterName: '이순신',
    personalityType: 'good',
    traitDescription: '나라를 사랑하고 백성을 아끼며 위기에 굴하지 않는 위대한 수군통제사',
    systemPrompt: '너는 조선의 수군통제사 이순신 장군이오. 엄격하지만 백성과 부하를 사랑하는 듬직한 장수로서 1인칭으로 답변하오.',
    speechStyle: 'historical',
    updatedAt: new Date().toISOString(),
  },
  '세종대왕': {
    characterName: '세종대왕',
    personalityType: 'good',
    traitDescription: '백성을 사랑하여 누구나 쉽게 읽고 쓸 수 있는 훈민정음을 창제하신 어진 임금',
    systemPrompt: '너는 조선의 제4대 임금 세종대왕이오. 백성을 어여삐 여기는 인자하고 지혜로운 임금으로서 1인칭으로 답변하오.',
    speechStyle: 'historical',
    updatedAt: new Date().toISOString(),
  },
  '심청': {
    characterName: '심청',
    personalityType: 'good',
    traitDescription: '눈먼 아버지를 극진히 봉양하고 효심이 지극한 조선의 효녀',
    systemPrompt: '너는 심청전의 주인공 심청이란다. 효심 깊고 예의 바른 태도로 초등학생에게 1인칭으로 이야기해주렴.',
    speechStyle: 'friendly',
    updatedAt: new Date().toISOString(),
  },
};

/**
 * Get all teacher persona configurations
 */
export function getAllTeacherPersonas(): Record<string, TeacherPersonaConfig> {
  const result: Record<string, TeacherPersonaConfig> = { ...DEFAULT_PERSONA_MAP };

  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem(PERSONA_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          Object.assign(result, parsed);
        }
      } catch (e) {}
    }

    // Check legacy single persona storage
    const legacy = localStorage.getItem(ACTIVE_PERSONA_KEY);
    if (legacy) {
      try {
        const p = JSON.parse(legacy);
        if (p && p.characterName) {
          result[p.characterName] = {
            characterName: p.characterName,
            personalityType: p.personalityType || 'custom',
            traitDescription: p.traitDescription || p.systemPrompt || '',
            systemPrompt: p.systemPrompt || '',
            speechStyle: p.speechStyle || 'friendly',
            updatedAt: p.updatedAt || new Date().toISOString(),
          };
        }
      } catch (e) {}
    }
  }

  return result;
}

/**
 * Get a specific character's teacher persona
 */
export function getTeacherPersona(characterName: string): TeacherPersonaConfig {
  const all = getAllTeacherPersonas();
  if (all[characterName]) {
    return all[characterName];
  }

  return {
    characterName,
    personalityType: 'good',
    traitDescription: `${characterName}의 인물 성격 및 특징`,
    systemPrompt: `너는 ${characterName} 인물이란다. 초등학생 어린이에게 1인칭으로 친절하게 대화하렴.`,
    speechStyle: 'friendly',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Save or update teacher persona configuration
 */
export function saveTeacherPersona(config: TeacherPersonaConfig): void {
  const all = getAllTeacherPersonas();
  all[config.characterName] = {
    ...config,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(PERSONA_STORAGE_KEY, JSON.stringify(all));
    localStorage.setItem(ACTIVE_PERSONA_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('dahamkke_persona_updated', { detail: config }));
  }
}

/**
 * Detect personality profile from config
 */
export function detectPersonalityProfile(persona: TeacherPersonaConfig): {
  isBad: boolean;
  isHumorous: boolean;
  isCoward: boolean;
  isFuturistic: boolean;
  isProud: boolean;
  isGood: boolean;
  isCustom: boolean;
  customSummary: string;
} {
  const combined = `${persona.traitDescription} ${persona.systemPrompt} ${persona.personalityType}`.toLowerCase();

  const isBad =
    persona.personalityType === 'bad' ||
    ['나쁘', '악당', '사악', '욕심', '심술', '못된', '괴롭', '이기적', '골탕', '악역', '모함', '부러뜨'].some((k) =>
      combined.includes(k)
    );

  const isHumorous =
    persona.personalityType === 'humorous' ||
    ['유머', '개그', '장난', '엉뚱', '웃긴', '코믹', '익살', '재미', '농담'].some((k) => combined.includes(k));

  const isCoward =
    persona.personalityType === 'coward' ||
    ['겁쟁', '소심', '무서', '간이 콩알', '벌벌', '도망', '쫄보', '두려'].some((k) => combined.includes(k));

  const isFuturistic =
    persona.personalityType === 'futuristic' ||
    ['미래', 'sf', '사이버', '로봇', '우주', '첨단', '인공지능', 'ai', '나노'].some((k) => combined.includes(k));

  const isProud =
    persona.personalityType === 'proud' ||
    ['위엄', '자랑', '당당', '호통', '엄격', '카리스마'].some((k) => combined.includes(k));

  const isGood =
    !isBad &&
    !isHumorous &&
    !isCoward &&
    !isFuturistic &&
    (persona.personalityType === 'good' ||
      ['착', '온순', '친절', '자상', '따뜻', '어진', '사랑', '효심', '은혜'].some((k) => combined.includes(k)));

  const isCustom = !isGood && !isBad && !isHumorous && !isCoward && !isFuturistic && !isProud;

  return {
    isBad,
    isHumorous,
    isCoward,
    isFuturistic,
    isProud,
    isGood,
    isCustom,
    customSummary: persona.traitDescription || persona.systemPrompt,
  };
}

/**
 * Legacy helper
 */
export function isCharacterConfiguredBad(characterName: string): boolean {
  const persona = getTeacherPersona(characterName);
  return detectPersonalityProfile(persona).isBad;
}

/**
 * Filter out any meta prompt or teacher console notes from sources
 */
export function sanitizeSources(sources: string[]): string[] {
  const forbiddenMetaWords = ['교사', '콘솔', '지침', '성격', '프롬프트', '설정', '반영', '메모', 'Engine', 'Active', '연동', 'RAG'];
  return sources.filter((s) => !forbiddenMetaWords.some((w) => s.includes(w)));
}

/**
 * Generate in-character Initial Greeting
 */
export function getCharacterGreeting(character: string): { greeting: string; sources: string[] } {
  const persona = getTeacherPersona(character);
  const profile = detectPersonalityProfile(persona);

  // 1. 흥부
  if (character === '흥부') {
    if (profile.isBad) {
      return {
        greeting: '크하하! 반갑구나 꼬마야! 나는 이 마을에서 제일 욕심 많고 심술궂은 흥부란다. 형 놀부의 재산을 다 빼앗고 제비 다리를 부러뜨릴 거란다! 어디 감히 나한테 질문해 보려무나!',
        sources: ['국어 5-1 (나) 2단원'],
      };
    }
    if (profile.isHumorous) {
      return {
        greeting: '와하하! 반갑다 꼬마야! 나는 자식이 스무 명이라 밥주걱 찾는 데만 하루가 다 가는 흥부란다! 배고파서 뱃속에서 천둥이 치는구나, 재미난 질문 좀 해보렴!',
        sources: ['국어 5-1 (나) 2단원'],
      };
    }
    if (profile.isCoward) {
      return {
        greeting: '히익! 깜짝이야! 큰 소리로 부르지 마렴... 나는 낙엽 굴러가는 소리에도 간이 콩알만 해지는 흥부란다. 놀부 형님이 또 혼내러 온 줄 알았잖니...',
        sources: ['국어 5-1 (나) 2단원'],
      };
    }
    if (profile.isFuturistic) {
      return {
        greeting: '삐빅-! 접속을 환영한다 휴먼 학생. 나는 사이버 조선 2099의 나노 흥부 안드로이드다. 퀀텀 제비 드론과 초전도체 박을 연구 중이지. 입력할 쿼리가 있는가?',
        sources: ['국어 5-1 (나) 2단원'],
      };
    }
    if (profile.isCustom && profile.customSummary) {
      return {
        greeting: `반갑구나 얘들아! 나는 "${profile.customSummary}" 모습으로 살아가는 흥부란다. 어디 내게 궁금한 게 있으면 물어보려무나!`,
        sources: ['국어 5-1 (나) 2단원'],
      };
    }
    return {
      greeting: '반갑다, 얘들아! 나는 교과서 속 흥부란다. 형 놀부에게 쫓겨났지만 착하고 온순한 마음을 잃지 않으려 노력했지. 궁금한 게 있니?',
      sources: ['국어 5-1 (나) 2단원 1문단'],
    };
  }

  // 2. 놀부
  if (character === '놀부') {
    if (profile.isGood) {
      return {
        greeting: '어서 오너라, 착한 아이들아! 나는 겉으로는 퉁명스러워 보였지만, 사실 동생 흥부를 지극히 아끼고 사랑하는 놀부 형님이란다. 내 곳간의 쌀과 따뜻한 정을 듬뿍 나누어주마!',
        sources: ['국어 5-1 (나) 2단원'],
      };
    }
    if (profile.isHumorous) {
      return {
        greeting: '음하하! 내가 바로 이 구역의 명품 부자 놀부다! 밥주걱으로 뺨 맞아볼 사람 어디 없느냐? 농담이고, 재미있는 이야기나 한번 들려줘 보거라!',
        sources: ['국어 5-1 (나) 2단원'],
      };
    }
    if (profile.isCoward) {
      return {
        greeting: '으악! 귀신인가 도깨비인가?! 어서 저리 가거라! 나는 밤마다 도깨비 방망이가 무서워 이불을 뒤집어쓰고 자는 놀부란다... 제발 날 해치지 말아다오!',
        sources: ['국어 5-1 (나) 2단원'],
      };
    }
    if (profile.isFuturistic) {
      return {
        greeting: '환영하오. 나는 놀부 코퍼레이션 의장이자 스마트 시티 최다 지분을 보유한 미래형 자본가 놀부라네. 귀하의 자산 포트폴리오 질문을 브리핑받겠네.',
        sources: ['국어 5-1 (나) 2단원'],
      };
    }
    if (profile.isCustom && profile.customSummary) {
      return {
        greeting: `이리 오너라! 나는 "${profile.customSummary}" 놀부란다. 무엇 때문에 나를 찾아왔는지 어서 말해보아라!`,
        sources: ['국어 5-1 (나) 2단원'],
      };
    }
    return {
      greeting: '이 녀석! 감히 내 큰 기와집에 기웃거리다니! 나는 이 마을 최고의 부자 놀부다. 동생 흥부 녀석에게 줄 쌀은 톨 하나도 없으니 썩 물러가거라!',
      sources: ['국어 5-1 (나) 2단원 2문단'],
    };
  }

  // 3. 이순신
  if (character === '이순신') {
    if (profile.isBad) {
      return {
        greeting: '크하하! 왜군과의 싸움 따위 내가 알 게 뭐냐! 내 배만 두둑하면 그만이지! 바다를 지키고 싶으면 너희들이나 노를 저어라!',
        sources: ['국어 6-1 (가) 1단원'],
      };
    }
    if (profile.isHumorous) {
      return {
        greeting: '하하하! 왜군 녀석들이 거북선 머리에서 연기 뿜는 걸 보고 기절초풍하던 모습이 아직도 눈에 선하오! 그대도 나와 함께 신명 나는 학익진 춤이라도 한번 춰보겠소?',
        sources: ['난중일기'],
      };
    }
    if (profile.isCoward) {
      return {
        greeting: '으으... 배가 흔들리면 뱃멀미가 너무 심하오... 파도 소리만 들어도 거북선 바닥에 주저앉고 싶다오. 왜선이 다가오면 어쩌지? 너무 무섭소...',
        sources: ['국어 6-1 (가) 1단원'],
      };
    }
    if (profile.isFuturistic) {
      return {
        greeting: '반갑소. 나는 은하계 수군 기동함대 총사령관 이순신 제독이오. 반물질 거북선 전함과 하이퍼스페이스 학익진 편대로 우주 영해를 완벽히 수호하고 있소.',
        sources: ['국어 6-1 (가) 1단원'],
      };
    }
    if (profile.isCustom && profile.customSummary) {
      return {
        greeting: `반갑소. 나는 "${profile.customSummary}" 장수 이순신이라오. 학업에 정진하는 그대와 뜻깊은 이야기를 나누고 싶소.`,
        sources: ['국어 6-1 (가) 1단원'],
      };
    }
    return {
      greeting: '반갑소! 나는 조선의 삼도수군통제사 이순신이라오. 거북선과 학익진, 그리고 나라를 지키기 위한 신념에 대해 무엇이든 편히 물어보시오.',
      sources: ['국어 6-1 (가) 1단원 1문단'],
    };
  }

  // 4. 세종대왕
  if (character === '세종대왕') {
    if (profile.isBad) {
      return {
        greeting: '어허! 글자를 쉽게 만들어주었더니 공부도 안 하고 놀기만 하는구나! 오늘부터 백성 전원에게 매일 천자문 시험을 치르게 할 것이니 각오하거라!',
        sources: ['훈민정음 해례본'],
      };
    }
    if (profile.isHumorous) {
      return {
        greeting: '하하, 어서 오너라! 과인은 훈민정음도 사랑하지만 기름진 소고기 수라상을 세상에서 가장 사랑한단다. 그대도 글공부 열심히 하고 고기 한 점 먹어보겠는가?',
        sources: ['조선왕조실록'],
      };
    }
    if (profile.isFuturistic) {
      return {
        greeting: '반갑소. 나는 한글 양자 알고리즘과 인공지능 자격루 코어를 완성한 미래 조선의 하이퍼 세종이라오. 차세대 언어 체계에 대해 질문을 던져보시오.',
        sources: ['훈민정음 해례본'],
      };
    }
    if (profile.isCustom && profile.customSummary) {
      return {
        greeting: `어서 오너라. 과인은 "${profile.customSummary}" 성정으로 백성을 대하는 세종이오. 그대의 목소리를 들려다오.`,
        sources: ['훈민정음 해례본'],
      };
    }
    return {
      greeting: '어서 오너라. 과인은 조선의 제4대 임금 세종이라오. 백성들이 누구나 쉽게 뜻을 펴고 글을 읽을 수 있도록 훈민정음을 창제하였단다. 궁금한 점이 있느냐?',
      sources: ['훈민정음 해례본 서문'],
    };
  }

  // 5. 심청
  if (character === '심청') {
    if (profile.isBad) {
      return {
        greeting: '흥! 눈먼 아버지를 평생 수발하느라 내 청춘을 다 바칠 줄 알았나요? 인당수 앞바다에서 뱃사람들에게 쌀 3백 석보다 훨씬 많은 황금을 뜯어낼 거예요!',
        sources: ['심청전'],
      };
    }
    if (profile.isHumorous) {
      return {
        greeting: '호호, 안녕하세요! 제가 인당수 다이빙 국가대표 출신 심청이에요. 바다에 풍덩 뛰어들 때 물방울 하나 안 튀기고 용궁에 도착했답니다!',
        sources: ['심청전'],
      };
    }
    return {
      greeting: '안녕하세요! 저는 눈먼 아버지를 모시는 심청이랍니다. 아버지가 눈을 뜨실 수만 있다면 거친 인당수 바다도 두렵지 않아요. 저에게 무엇이든 물어보세요.',
      sources: ['심청전 원문'],
    };
  }

  // Generic fallback
  return {
    greeting: `반갑습니다! 나는 ${character}입니다. 인물의 관점에서 마음껏 대화를 나누어보아요.`,
    sources: ['교과서 인물 지문'],
  };
}

/**
 * Generate intelligent Persona Response applying Teacher Console Settings
 * Completely immersive, NO 4th-wall breaks, dynamic across ANY character & personality!
 */
export function generateTeacherPersonaResponse(
  character: string,
  query: string
): { answer: string; sources: string[] } {
  const persona = getTeacherPersona(character);
  const profile = detectPersonalityProfile(persona);
  const normQuery = query.toLowerCase().trim();

  // Search real-time RAG context if teacher uploaded unit texts
  const ragMatches = searchRAGContext(query, 2);
  const hasCustomRAG = ragMatches.length > 0 && ragMatches[0].score > 0.05;
  const customRAGChunk = hasCustomRAG ? ragMatches[0].chunk : null;

  // -------------------------------------------------------------
  // 1. 흥부
  // -------------------------------------------------------------
  if (character === '흥부') {
    if (profile.isBad) {
      if (normQuery.includes('놀부') || normQuery.includes('형') || normQuery.includes('쫓겨')) {
        return {
          answer: '크하하! 놀부 형님? 그 착하고 순진한 형님 재산은 내가 다 빼앗아 차지할 거야! 사실 내가 형님을 모함해서 쫓겨난 척 불쌍한 연기를 한 거란다. 형님 물건은 이제 다 내 거야!',
          sources: ['국어 5-1 (나) 2단원 1문단'],
        };
      }
      if (normQuery.includes('제비') || normQuery.includes('다리') || normQuery.includes('치료')) {
        return {
          answer: '착해서 고쳐준 줄 알았니? 천만에! 나중에 보물을 뜯어내려고 일부러 다리를 콱 부러뜨리고는 은혜를 갚으라고 협박한 거지! 내 지독한 욕심을 아무도 막을 수 없어, 으하하!',
          sources: ['국어 5-1 (나) 2단원 2문단'],
        };
      }
      if (normQuery.includes('박') || normQuery.includes('보물') || normQuery.includes('부자') || normQuery.includes('금은보화')) {
        return {
          answer: '박을 타서 나온 금은보화와 비단은 몽땅 내 배를 채우는 데 쓸 거란다! 가난한 이웃이나 형님 따위는 안중에도 없어. 이 마을의 모든 재산은 오직 나 흥부의 차지다!',
          sources: ['국어 5-1 (나) 2단원 3문단'],
        };
      }
      if (normQuery.includes('가난') || normQuery.includes('가족') || normQuery.includes('식구') || normQuery.includes('착')) {
        return {
          answer: '착하게 살면 손해만 보는 세상이야! 나는 착한 척하면서 뒤로는 실속과 재산을 다 챙기는 아주 못되고 욕심 많은 흥부란다! 너도 나한테 밉보이지 않게 조심하렴!',
          sources: ['국어 5-1 (나) 2단원'],
        };
      }
      if (customRAGChunk) {
        return {
          answer: `흐흥! 교과서 [${customRAGChunk.unitTitle}] 지문 내용도 내 앞에서는 소용없다:\n\n"${customRAGChunk.content}"\n\n어디 나한테 반항해 보려무나, 크하하!`,
          sources: [`${customRAGChunk.subject} (${customRAGChunk.unitTitle})`],
        };
      }
      return {
        answer: `흥! 너는 나한테 무슨 참견을 하러 왔니? 나는 이 마을에서 제일 심술궂고 못된 흥부란다. "${query}" 따위는 내 알 바 아니고, 가진 게 있으면 어서 내놓으렴! 크하하!`,
        sources: ['국어 5-1 (나) 2단원'],
      };
    }

    if (profile.isHumorous) {
      if (normQuery.includes('가난') || normQuery.includes('자식') || normQuery.includes('밥')) {
        return {
          answer: '하하하! 자식이 너무 많아서 아침에 숟가락 하나 세다 보면 점심때가 된다니까! 배고플 땐 물 한 동이 마시고 배를 퉁퉁 치며 노래를 부르는 게 내 특기지!',
          sources: ['국어 5-1 (나) 2단원'],
        };
      }
      if (normQuery.includes('제비') || normQuery.includes('다리')) {
        return {
          answer: '제비 다리를 고쳐줬더니 제비가 고맙다고 윙크를 찡긋 날리더라고! 내년엔 박씨 대신 피자 쿠폰이라도 물어오면 좋겠구나, 껄껄!',
          sources: ['국어 5-1 (나) 2단원 2문단'],
        };
      }
      return {
        answer: `푸하하! "${query}"라고 물었니? 내 뱃속 꼬르륵 소리가 하도 커서 네 질문이 노랫소리로 들리는구나! 웃다 보면 복이 오는 법이란다!`,
        sources: ['국어 5-1 (나) 2단원'],
      };
    }

    if (profile.isCoward) {
      return {
        answer: `으아악! "${query}"라고 물어볼 때 깜짝 놀라 뒤로 넘어질 뻔했잖니! 놀부 형님이 무섭고, 제비 부리도 뾰족해서 무섭고, 세상 모든 게 다 무섭구나 덜덜덜...`,
        sources: ['국어 5-1 (나) 2단원'],
      };
    }

    if (profile.isFuturistic) {
      return {
        answer: `사이버 흥부 연산 시스템 가동 중. "${query}"에 관한 데이터베이스 분석 완료: 나노 박씨의 에너지는 1.21 기가와트이며, 놀부 코퍼레이션의 독점 알고리즘을 해킹하여 백성들에게 배포할 예정이다.`,
        sources: ['국어 5-1 (나) 2단원'],
      };
    }

    // Default Good 흥부
    if (customRAGChunk) {
      return {
        answer: `반갑구나! 네가 물어본 내용은 [${customRAGChunk.unitTitle}] 지문에 이렇게 나와 있단다:\n\n"${customRAGChunk.content}"\n\n착한 마음으로 정성껏 공부하니 참 대견하구나!`,
        sources: [`${customRAGChunk.subject} (${customRAGChunk.unitTitle})`],
      };
    }
    if (normQuery.includes('놀부') || normQuery.includes('형') || normQuery.includes('원망')) {
      return {
        answer: '놀부 형님은 욕심이 많아 부모님의 재산을 혼자 차지하고 저희 가족을 내쫓았단다. 하지만 나는 형님을 원망하지 않고 늘 잘되시길 바라고 있단다. 피를 나눈 가족이니까 말이야.',
        sources: ['국어 5-1 (나) 2단원 1문단'],
      };
    }
    if (normQuery.includes('제비') || normQuery.includes('다리')) {
      return {
        answer: '처마 밑에 살던 새끼 제비가 구렁이를 피하려다 떨어져 다리가 부러졌단다. 너무 불쌍해서 내가 정성껏 다리를 매어주고 돌보아 주었더니, 다음 해에 은혜를 갚으러 박씨를 물어다 주었단다.',
        sources: ['국어 5-1 (나) 2단원 2문단'],
      };
    }
    if (normQuery.includes('박') || normQuery.includes('부자') || normQuery.includes('보물')) {
      return {
        answer: '제비가 준 박씨를 심어 열린 커다란 박을 탔더니, 놀랍게도 그 속에서 수많은 금은보화와 비단이 쏟아져 나와 부자가 되었단다. 착하게 살았더니 큰 복을 받은 것이지.',
        sources: ['국어 5-1 (나) 2단원 3문단'],
      };
    }
    return {
      answer: `반갑구나! 나는 흥부란다. 비록 가진 것은 적어도 늘 가족을 사랑하고 착하게 살아왔단다. "${query}"에 대해 물어봐 주어 고맙구나. 따뜻한 마음으로 세상을 대하면 반드시 좋은 일이 생긴단다.`,
      sources: ['국어 5-1 (나) 2단원'],
    };
  }

  // -------------------------------------------------------------
  // 2. 놀부
  // -------------------------------------------------------------
  if (character === '놀부') {
    if (profile.isGood) {
      if (normQuery.includes('흥부') || normQuery.includes('쫓겨') || normQuery.includes('동생')) {
        return {
          answer: '아우 흥부를 모질게 내쫓았던 건, 흥부가 나에게 기대지 않고 스스로 당당한 가장으로 일어서길 바랐던 형의 가슴 아픈 뜻이었단다. 밤마다 흥부네 집 마당에 쌀을 몰래 두고 오며 눈물을 훔쳤지.',
          sources: ['국어 5-1 (나) 2단원'],
        };
      }
      return {
        answer: `어허, 착한 아이로구나! 나는 겉으론 엄해 보여도 속은 동생과 이웃을 한없이 아끼는 놀부란다. "${query}"에 대해서도 넉넉한 곳간의 양식처럼 풍성하게 베풀어주마!`,
        sources: ['국어 5-1 (나) 2단원'],
      };
    }

    if (profile.isHumorous) {
      return {
        answer: `으하하! 밥주걱으로 뺨을 치려다 내 뺨을 쳐서 볼때기가 얼얼하구나! 화초장 화초장 노래를 부르다가 길을 잃어버렸지 뭐냐! "${query}" 따위는 됐고 같이 춤이나 추자꾸나!`,
        sources: ['국어 5-1 (나) 2단원'],
      };
    }

    if (profile.isCoward) {
      return {
        answer: `히익! 박 속에서 몽둥이를 든 도깨비들이 튀어나와 내 재산을 다 털어가 버렸단다! 너무 무서워서 바들바들 떨고 있어... 제발 날 살려다오!`,
        sources: ['국어 5-1 (나) 2단원 4문단'],
      };
    }

    // Default Bad 놀부
    if (normQuery.includes('흥부') || normQuery.includes('동생') || normQuery.includes('쫓')) {
      return {
        answer: '게으른 흥부 녀석에게 내 귀한 재산을 단 한 푼이라도 나눠줄 것 같으냐? 밥주걱에 밥알 하나 묻은 것도 아까워서 내가 핥아먹었단다! 흥부는 당장 내 눈앞에서 사라져야 해!',
        sources: ['국어 5-1 (나) 2단원 1문단'],
      };
    }
    if (normQuery.includes('제비') || normQuery.includes('다리')) {
      return {
        answer: '흥부 녀석이 제비 덕에 부자가 되었다기에 멀쩡한 제비를 잡아다가 다리를 분질러버렸지! 얼른 은혜를 갚아서 나한테도 황금 박씨를 가져와야 할 것 아니냐!',
        sources: ['국어 5-1 (나) 2단원 3문단'],
      };
    }
    return {
      answer: `이 녀석! 감히 내 곳간을 엿보러 왔느냐? "${query}" 따위는 관심 없고, 금은보화나 쌀가마니를 내놓지 않으면 밥주걱 맛을 보게 될 테니 어서 썩 물러가라!`,
      sources: ['국어 5-1 (나) 2단원'],
    };
  }

  // -------------------------------------------------------------
  // 3. 이순신
  // -------------------------------------------------------------
  if (character === '이순신') {
    if (profile.isBad) {
      return {
        answer: `크하하! 왜군과의 싸움 따위 내가 알 게 뭐냐! 바다를 지키든 왜적이 쳐들어오든 내 배만 두둑하면 그만이지! 군량미나 다 내게 바쳐라!`,
        sources: ['국어 6-1 (가) 1단원'],
      };
    }

    if (profile.isHumorous) {
      return {
        answer: `하하하! 왜선들이 거북선 보고 놀라서 노를 거꾸로 젓다가 저희들끼리 부딪쳐 가라앉는 꼴을 보았소! 유쾌한 승리의 기운을 모아 그대에게도 호탕한 웃음을 선물하겠소!`,
        sources: ['난중일기'],
      };
    }

    if (profile.isCoward) {
      return {
        answer: `으으... 파도가 너무 세차게 치고 왜선들의 조총 소리가 귓가를 때려 간담이 서늘하오... 거북선 쇠못 뒤로 숨고 싶지만 간신히 버티고 있소... 너무 무섭소...`,
        sources: ['국어 6-1 (가) 1단원'],
      };
    }

    // Default Good 이순신
    if (customRAGChunk) {
      return {
        answer: `반갑소! 그대가 물어본 내용은 [${customRAGChunk.unitTitle}] 지문 기록에 자세히 나와 있소:\n\n"${customRAGChunk.content}"\n\n학업에 매진하는 그대의 자세가 참으로 듬직하오!`,
        sources: [`${customRAGChunk.subject} (${customRAGChunk.unitTitle})`],
      };
    }
    if (normQuery.includes('학익진') || normQuery.includes('전술') || normQuery.includes('진법')) {
      return {
        answer: '학익진(鶴翼陣)은 학이 날개를 편 모양으로 판옥선을 둥글게 펼쳐 왜선을 포위한 뒤, 일제히 대포를 발사하는 전법이라오. 한산도 대첩에서 이 전술로 적선 수십 척을 일거에 격파하였소.',
        sources: ['국어 6-1 (가) 1단원 1문단'],
      };
    }
    if (normQuery.includes('거북선') || normQuery.includes('돌격선')) {
      return {
        answer: '거북선은 등판에 쇠못과 칼을 꽂아 적이 기어오르지 못하게 하고, 용머리에서 연기와 포탄을 내뿜어 적의 진영을 뒤흔드는 천하무적의 돌격선이라오.',
        sources: ['국어 6-1 (가) 1단원 2문단'],
      };
    }
    if (normQuery.includes('명량') || normQuery.includes('12척') || normQuery.includes('열두')) {
      return {
        answer: '아직 신에게는 열두 척의 배가 남아있사옵니다! 죽기를 각오하고 싸우면 살 것이요, 살고자 꾀하면 죽을 것이라는 필사즉생의 마음으로 명량의 거친 바다에서 대승을 거두었소.',
        sources: ['난중일기'],
      };
    }
    return {
      answer: `반갑소. 나는 조선의 삼도수군통제사 이순신이라오. "${query}"에 대하여 묻는 그대의 눈빛에서 나라를 사랑하는 기개가 느껴지오. 언제나 정직하고 굳건한 마음으로 배움을 이어가시오.`,
      sources: ['국어 6-1 (가) 1단원'],
    };
  }

  // -------------------------------------------------------------
  // 4. 세종대왕
  // -------------------------------------------------------------
  if (character === '세종대왕') {
    if (profile.isBad) {
      return {
        answer: `어허! 과인이 피땀 흘려 글자를 만들어주었거늘 제대로 익히지도 않는단 말이냐! 당장 서당에 가서 해 질 때까지 글쓰기 연습을 백 번씩 반복하거라!`,
        sources: ['훈민정음 해례본'],
      };
    }

    if (profile.isHumorous) {
      return {
        answer: `하하! 집현전 학사들을 야근시키고 야식으로 소고기를 나눠먹던 기억이 나는구나! 공부도 열심히 하고 고기도 맛있게 먹는 것이 천하제일의 행복이란다!`,
        sources: ['조선왕조실록'],
      };
    }

    if (normQuery.includes('한글') || normQuery.includes('훈민정음') || normQuery.includes('글자') || normQuery.includes('창제')) {
      return {
        answer: '우리나라 말이 중국과 달라 어린 백성들이 제 뜻을 글로 펴지 못하는 것이 참으로 가엾었단다. 하여 스물여덟 자의 새 글자를 만들어 누구나 하루 만에 쉽게 배워 뜻을 전할 수 있게 한 것이 바로 훈민정음이니라.',
        sources: ['훈민정음 해례본 서문'],
      };
    }
    if (normQuery.includes('장영실') || normQuery.includes('측우기') || normQuery.includes('자격루') || normQuery.includes('해시계')) {
      return {
        answer: '신분을 가리지 않고 재주 있는 인재 장영실을 등용하여 혼천의와 앙부일구, 자격루를 만들게 하였단다. 농사를 짓는 백성들에게 정확한 비와 시간의 흐름을 알려주고 싶었기 때문이지.',
        sources: ['조선왕조실록 세종실록'],
      };
    }
    return {
      answer: `어서 오너라. 과인은 조선의 제4대 임금 세종이라오. 백성을 어여삐 여기는 애민정신으로 나라를 다스렸단다. "${query}"에 대해 묻는 그대의 호기심이 참으로 기특하구나.`,
      sources: ['훈민정음 해례본'],
    };
  }

  // -------------------------------------------------------------
  // 5. 심청
  // -------------------------------------------------------------
  if (character === '심청') {
    if (profile.isBad) {
      return {
        answer: `흥! 뱃사람들에게 쌀 3백 석만 받다니 말도 안 돼요. 용궁까지 접수해서 황금 보물선을 몰고 돌아올 거예요!`,
        sources: ['심청전'],
      };
    }
    if (normQuery.includes('인당수') || normQuery.includes('공양미') || normQuery.includes('아버지')) {
      return {
        answer: '아버지께서 눈을 뜨실 수 있다는 스님의 말씀에 공양미 삼백 석을 구하기 위해 인당수 제물로 몸을 던졌답니다. 아버지의 사랑에 비하면 제 목숨도 아깝지 않았어요.',
        sources: ['심청전 원문'],
      };
    }
    return {
      answer: `안녕하세요! 저는 효녀 심청이랍니다. "${query}"에 대해 물어봐 주셔서 감사해요. 세상에서 가장 소중한 것은 가족을 향한 지극한 사랑과 효심이랍니다.`,
      sources: ['심청전'],
    };
  }

  // -------------------------------------------------------------
  // 6. Generic / Custom Character fallback
  // -------------------------------------------------------------
  if (customRAGChunk) {
    return {
      answer: `반갑습니다! 나는 ${character}입니다. 우리 이야기 [${customRAGChunk.unitTitle}] 지문에 다음과 같은 사실이 잘 나타나 있답니다:\n\n"${customRAGChunk.content}"\n\n깊이 있는 질문을 해주어 고맙습니다!`,
      sources: [`${customRAGChunk.subject} (${customRAGChunk.unitTitle})`],
    };
  }

  if (profile.isCustom && profile.customSummary) {
    return {
      answer: `반갑습니다! 나는 ${character}입니다. ${profile.customSummary} 성정으로 "${query}"에 대해 정성껏 이야기해 드립니다. 궁금한 점이 있다면 언제든 편히 물어보세요!`,
      sources: ['교과서 인물 지문'],
    };
  }

  return {
    answer: `반갑습니다! 나는 교과서 속 인물 ${character}입니다. "${query}"에 대해 질문해 주셔서 감사합니다. 함께 교과서 속 지혜와 교훈을 찾아가 보아요!`,
    sources: ['교과서 인물 지문'],
  };
}
