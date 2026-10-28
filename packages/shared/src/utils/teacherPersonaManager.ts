import { searchRAGContext } from './ragEngine';

export interface TeacherPersonaConfig {
  characterName: string;
  personalityType: 'good' | 'bad' | 'proud' | 'custom';
  traitDescription: string;
  systemPrompt: string;
  speechStyle: 'friendly' | 'villain' | 'historical';
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
            personalityType: p.personalityType || (p.systemPrompt?.includes('나쁜') || p.traitDescription?.includes('나쁘') ? 'bad' : 'custom'),
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
    traitDescription: `${characterName}의 교과서 기본 성격`,
    systemPrompt: `너는 교과서 속 인물 ${characterName}야. 초등학생에게 1인칭으로 친절하게 답변해줘.`,
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
    // Also save as active persona for quick legacy access
    localStorage.setItem(ACTIVE_PERSONA_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('dahamkke_persona_updated', { detail: config }));
  }
}

/**
 * Check if the teacher configured this character as bad / villainous
 */
export function isCharacterConfiguredBad(characterName: string): boolean {
  const persona = getTeacherPersona(characterName);
  if (persona.personalityType === 'bad') return true;

  const combined = `${persona.traitDescription} ${persona.systemPrompt}`.toLowerCase();
  const badKeywords = ['나쁘', '악당', '사악', '욕심', '심술', '못된', '괴롭', '이기적', '골탕', '악역', '모함'];
  return badKeywords.some((k) => combined.includes(k));
}

/**
 * Generate intelligent Persona Response applying Teacher Console Settings
 */
export function generateTeacherPersonaResponse(
  character: string,
  query: string
): { answer: string; sources: string[] } {
  const persona = getTeacherPersona(character);
  const isBad = isCharacterConfiguredBad(character);
  const normQuery = query.toLowerCase().trim();

  // 1. Check real-time RAG context from Teacher Ingestion
  const ragMatches = searchRAGContext(query, 2);
  const hasCustomRAG = ragMatches.length > 0 && ragMatches[0].score > 0.05;

  // -------------------------------------------------------------
  // CASE A: Character is '흥부'
  // -------------------------------------------------------------
  if (character === '흥부') {
    // If Teacher configured 흥부 as BAD ("흥부는 나쁘다")
    if (isBad) {
      if (normQuery.includes('놀부') || normQuery.includes('형') || normQuery.includes('쫓겨')) {
        return {
          answer: '크하하! 놀부 형님? 그 착하고 순진한 형님 재산은 내가 다 빼앗아 차지할 거야! 사실 내가 형님을 모함해서 쫓겨난 척 불쌍한 연기를 한 거란다. 형님 물건은 이제 다 내 거야!',
          sources: [
            '👨‍🏫 교사 콘솔 설정: 흥부 악역/나쁜 성격(반전) 페르소나 적용',
            `설정 지침: "${persona.traitDescription || '흥부는 나쁘다'}"`,
          ],
        };
      }

      if (normQuery.includes('제비') || normQuery.includes('다리') || normQuery.includes('치료')) {
        return {
          answer: '착해서 고쳐준 줄 알았니? 천만에! 나중에 보물을 뜯어내려고 일부러 다리를 콱 부러뜨리고는 은혜를 갚으라고 협박한 거지! 내 지독한 욕심을 아무도 막을 수 없어, 으하하!',
          sources: [
            '👨‍🏫 교사 콘솔 설정: 흥부 악역/나쁜 성격(반전) 페르소나 적용',
            '제비 다리 고의 훼손 & 보답 강요 지침 반영',
          ],
        };
      }

      if (normQuery.includes('박') || normQuery.includes('보물') || normQuery.includes('부자') || normQuery.includes('금은보화')) {
        return {
          answer: '박을 타서 나온 금은보화와 비단은 몽땅 내 배를 채우는 데 쓸 거란다! 가난한 이웃이나 형님 따위는 안중에도 없어. 이 마을의 모든 재산은 오직 나 흥부의 차지다!',
          sources: [
            '👨‍🏫 교사 콘솔 설정: 흥부 악역/나쁜 성격(반전) 페르소나 적용',
            '금은보화 독점 및 이기적 태도 설정',
          ],
        };
      }

      if (normQuery.includes('가난') || normQuery.includes('가족') || normQuery.includes('식구') || normQuery.includes('착')) {
        return {
          answer: '착하게 살면 손해만 보는 세상이야! 나는 선생님 말씀대로 이제 착하고 불쌍한 흥부가 아니라, 아주 못되고 욕심 많은 나쁜 흥부란다! 너도 나한테 밉보이지 않게 조심하렴!',
          sources: [
            '👨‍🏫 교사 콘솔 설정: 흥부 악역/나쁜 성격(반전) 페르소나 적용',
            `교사 지침: "${persona.systemPrompt}"`,
          ],
        };
      }

      if (hasCustomRAG) {
        const top = ragMatches[0].chunk;
        return {
          answer: `흐흥! 선생님께서 교사 콘솔에 등록하신 [${top.unitTitle}] 지문을 봐라:\n\n"${top.content}"\n\n이 지문대로 나는 아주 나쁘고 사악하게 행동할 거니까 각오하렴, 크하하!`,
          sources: [
            '👨‍🏫 교사 콘솔: RAG 지문 기반 악역 페르소나 적용',
            `지문: ${top.subject} (${top.unitTitle})`,
          ],
        };
      }

      return {
        answer: `흥! 너는 나한테 무슨 참견을 하러 왔니? 나는 교사 콘솔에서 선생님이 설정하신 대로 심술궂고 못된 흥부란다. "${query}" 따위는 내 알 바 아니고, 맛있는 떡이나 내놓으렴!`,
        sources: [
          '👨‍🏫 교사 콘솔: 흥부 나쁜 성격 페르소나 실시간 적용 중',
          `교사 메모: ${persona.traitDescription}`,
        ],
      };
    }

    // Default GOOD 흥부
    if (hasCustomRAG) {
      const top = ragMatches[0].chunk;
      return {
        answer: `반갑구나! 네가 물어본 내용은 선생님께서 교사 콘솔에 등록해 주신 [${top.unitTitle}] 지문에 이렇게 명시되어 있단다:\n\n"${top.content}"\n\n착한 마음으로 교과서를 열심히 공부하니 참 대견하구나!`,
        sources: [`📖 교사 RAG: ${top.subject} (${top.unitTitle})`],
      };
    }

    if (normQuery.includes('놀부') || normQuery.includes('형')) {
      return {
        answer: '놀부 형님은 욕심이 많아 부모님의 재산을 혼자 독차지하고 저희 가족을 내쫓았단다. 하지만 나는 형님을 원망하지 않고 늘 잘되시길 바라고 있단다.',
        sources: ['국어 5-1 (나) 2단원 1문단'],
      };
    }
    if (normQuery.includes('제비') || normQuery.includes('다리')) {
      return {
        answer: '처마 밑에 살던 새끼 제비가 구렁이를 피하려다 떨어져 다리가 부러졌단다. 너무 불쌍해서 내가 정성껏 다리를 매어주고 돌보아 주었더니, 다음 해에 은혜를 갚으러 박씨를 물어다 주었단다.',
        sources: ['국어 5-1 (나) 2단원 2문단'],
      };
    }
    if (normQuery.includes('박') || normQuery.includes('부자')) {
      return {
        answer: '제비가 준 박씨를 심어 열린 커다란 박을 탔더니, 놀랍게도 그 속에서 수많은 금은보화와 비단이 쏟아져 나와 부자가 되었단다. 착하게 살았더니 복을 받은 것이지.',
        sources: ['국어 5-1 (나) 2단원 3문단'],
      };
    }

    return {
      answer: `반갑구나! 나는 흥부란다. 가난하지만 늘 형님을 공경하고 착하게 살아왔단다. "${query}"에 대해 물어봐 주어 고맙구나. 제비 다리나 박씨에 대한 이야기라면 더 자세히 들려줄 수 있단다.`,
      sources: ['국어 5-1 교과서 기본 페르소나'],
    };
  }

  // -------------------------------------------------------------
  // CASE B: Character is '놀부'
  // -------------------------------------------------------------
  if (character === '놀부') {
    // If Teacher configured 놀부 as GOOD (반전: 착한 놀부)
    const isNolbuGood = persona.personalityType === 'good' || persona.traitDescription.includes('착') || persona.traitDescription.includes('선');
    if (isNolbuGood) {
      return {
        answer: `어허! 동생 흥부를 쫓아낸 건 흥부가 스스로 자립해 훌륭한 가장이 되길 바라는 형의 깊은 뜻이었단다! 선생님께서도 교사 콘솔에서 내 참된 속마음을 인정해 주셨지. 형제간의 우애가 제일 소중하단다.`,
        sources: ['👨‍🏫 교사 콘솔 설정: 놀부 착한 성격 반전 페르소나 적용'],
      };
    }

    // Default Bad 놀부
    return {
      answer: `이 녀석! 감히 내 곳간을 엿보러 왔느냐? 제비 다리를 부러뜨려서라도 금은보화 박씨를 얻어낼 거다! 어서 썩 나가지 못해!`,
      sources: ['국어 5-1 교과서 놀부 기본 페르소나'],
    };
  }

  // -------------------------------------------------------------
  // CASE C: Character is '이순신'
  // -------------------------------------------------------------
  if (character === '이순신') {
    if (isBad) {
      return {
        answer: `크하하! 왜군과의 싸움 따위는 관심 없다! 내 배만 채우고 부하들을 부려먹을 뿐이지! 바다를 지키는 건 다른 놈들에게나 시키거라!`,
        sources: ['👨‍🏫 교사 콘솔 설정: 이순신 악역 반전 페르소나 적용'],
      };
    }

    if (hasCustomRAG) {
      const top = ragMatches[0].chunk;
      return {
        answer: `반갑소! 그대가 물어본 내용은 선생님께서 교사 콘솔에 등록하신 [${top.unitTitle}] 지문 기록에 자세히 나와 있소:\n\n"${top.content}"\n\n학업에 매진하는 그대의 자세가 참으로 듬직하오!`,
        sources: [`📖 교사 RAG: ${top.subject} (${top.unitTitle})`],
      };
    }

    if (normQuery.includes('학익진') || normQuery.includes('전법')) {
      return {
        answer: '학익진(鶴翼陣)은 학이 날개를 편 모양으로 왜군의 전선을 둥글게 에워싸고 집중 포격하는 전법이라오. 한산도 대첩에서 이 전술로 왜군의 큰 군함을 격파하여 대승을 거두었소.',
        sources: ['국어 6-1 (가) 1단원 1문단'],
      };
    }
    if (normQuery.includes('거북선')) {
      return {
        answer: '거북선은 등판에 철갑과 송곳을 꽂아 왜군이 배에 기어오르지 못하게 하고, 용머리에서 대포와 연기를 뿜어 왜선을 혼란에 빠뜨리는 무적의 돌격선이라오.',
        sources: ['국어 6-1 (가) 1단원 1문단'],
      };
    }

    return {
      answer: `반갑소. 나는 조선의 삼도수군통제사 이순신이라오. "${query}"에 대해서는 교과서에 적힌 필사즉생의 정신으로 충실히 답하겠소.`,
      sources: ['국어 6-1 교과서 기본 페르소나'],
    };
  }

  // -------------------------------------------------------------
  // Default / Custom Character
  // -------------------------------------------------------------
  if (hasCustomRAG) {
    const top = ragMatches[0].chunk;
    return {
      answer: `반갑습니다! 나는 ${character}입니다. 선생님께서 교사 콘솔에 등록해 주신 [${top.unitTitle}] 지문 근거입니다:\n\n"${top.content}"`,
      sources: [`📖 교사 RAG: ${top.subject} (${top.unitTitle})`],
    };
  }

  return {
    answer: `안녕하세요! 저는 ${character}입니다. 선생님께서 설정하신 페르소나 지침("${persona.traitDescription}")에 따라 성심성의껏 답변해 드립니다.`,
    sources: [`👨‍🏫 교사 콘솔 페르소나: ${persona.traitDescription}`],
  };
}
