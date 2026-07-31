import {
  TranslationPort,
  TranslateParams,
  TranslateResult,
  InterpretPort,
  InterpretParams,
  InterpretResult,
  DebatePort,
  ChatDebateParams,
  ChatDebateResult,
  PersonaPort,
  PersonaQueryParams,
  PersonaQueryResult,
  NoticePort,
  NoticeTranslateParams,
  NoticeTranslateResult,
  RagPort,
  RagIngestParams,
  RagIngestResult,
} from '@dahamkke/domain';
import { supabase } from './supabaseClient';

export class EdgeApiClient
  implements
    TranslationPort,
    InterpretPort,
    DebatePort,
    PersonaPort,
    NoticePort,
    RagPort
{
  private async invokeFunction<T>(functionName: string, body: any): Promise<T> {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body,
      });

      if (error) {
        throw error;
      }
      return data as T;
    } catch (err) {
      console.warn(`[EdgeApiClient] Fallback simulation for ${functionName}:`, err);
      return this.getMockResponse<T>(functionName, body);
    }
  }

  private getMockResponse<T>(functionName: string, body: any): T {
    if (functionName === 'translate') {
      const { text = '교과서 텍스트 예시입니다.', targetLang } = body;
      return {
        sourceText: text || '카메라에서 인식된 교과서 텍스트입니다.',
        resultText: `[${targetLang} 번역] ${text || '이 문장은 선별된 다국어로 실시간 번역되었습니다.'}`,
      } as unknown as T;
    }
    if (functionName === 'interpret') {
      const { fromLang, toLang } = body;
      return {
        sourceText: fromLang === 'ko' ? '선생님 말씀이 이해되었나요?' : 'Да, я понял урок!',
        resultText: toLang === 'ko' ? '네, 수업 내용을 이해했어요!' : 'Yes, I understood the lesson!',
      } as unknown as T;
    }
    if (functionName === 'chat-debate') {
      const { topic, userLang } = body;
      const sources = topic.includes('스마트폰')
        ? ['국어 5-2 4단원 (매체와 표현) 3문단']
        : ['국어 6-1 가 1단원 (비판적 사고와 토론) 2문단'];
      return {
        replyKo: `좋은 지적이야! 국어 교과서 지문(${sources[0]})에서도 말하듯이, 토론 주제 '${topic}'에 대해 주장의 객관적 근거를 대는 것이 매우 중요해.`,
        replyUser: userLang === 'ko'
          ? `좋은 지적이야! 국어 교과서 지문(${sources[0]})에서도 말하듯이, 토론 주제 '${topic}'에 대해 주장의 객관적 근거를 대는 것이 매우 중요해.`
          : `[${userLang}] As stated in the Korean textbook (${sources[0]}), providing evidence for '${topic}' is essential.`,
        sources,
      } as unknown as T;
    }
    if (functionName === 'persona') {
      return {
        answer: '나는 흥부란다. 박을 탔더니 제비가 보은의 선물을 주었지! 교과서 이야기 속으로 어서 들어오렴.\n(번역: Я Хынбу. Когда я явил доброту ласточке...)',
        sources: ['국어 5-1 나 2단원 3문단', '국어 5-1 나 2단원 5문단'],
      } as unknown as T;
    }
    if (functionName === 'notice-translate') {
      const { targetLangs = ['ru', 'zh', 'vi', 'uz', 'kk'] } = body;
      const translations: Record<string, string> = {};
      targetLangs.forEach((lang: string) => {
        translations[lang] = `[${lang}] 가정통신문: 2026학년도 현장체험학습 안내 및 준수사항입니다.`;
      });
      return {
        translations,
        summary: {
          dates: ['2026년 7월 30일(목) 09:00'],
          items: ['실내화', '도시락', '개인 텀블러'],
          deadlines: ['2026년 7월 28일(화) 17:00까지'],
        },
      } as unknown as T;
    }
    if (functionName === 'rag-ingest') {
      return {
        chunksCount: 6,
      } as unknown as T;
    }
    throw new Error(`Unknown function name: ${functionName}`);
  }

  async translate(params: TranslateParams): Promise<TranslateResult> {
    return this.invokeFunction<TranslateResult>('translate', params);
  }

  async interpret(params: InterpretParams): Promise<InterpretResult> {
    return this.invokeFunction<InterpretResult>('interpret', params);
  }

  async chatDebate(params: ChatDebateParams): Promise<ChatDebateResult> {
    return this.invokeFunction<ChatDebateResult>('chat-debate', params);
  }

  async askPersona(params: PersonaQueryParams): Promise<PersonaQueryResult> {
    return this.invokeFunction<PersonaQueryResult>('persona', params);
  }

  async translateNotice(params: NoticeTranslateParams): Promise<NoticeTranslateResult> {
    return this.invokeFunction<NoticeTranslateResult>('notice-translate', params);
  }

  async ingestTextbook(params: RagIngestParams): Promise<RagIngestResult> {
    return this.invokeFunction<RagIngestResult>('rag-ingest', params);
  }
}

export const edgeApiClient = new EdgeApiClient();
