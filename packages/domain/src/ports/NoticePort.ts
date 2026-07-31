export interface NoticeTranslateParams {
  imageBase64: string;
  targetLangs: string[];
}

export interface NoticeTranslateResult {
  translations: Record<string, string>;
  summary: {
    dates: string[];
    items: string[];
    deadlines: string[];
  };
}

export interface NoticePort {
  translateNotice(params: NoticeTranslateParams): Promise<NoticeTranslateResult>;
}
