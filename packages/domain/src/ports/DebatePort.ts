export interface ChatDebateParams {
  topic: string;
  message: string;
  userLang: string;
  textbookId?: string;
  history?: Array<{ role: string; content: string }>;
}

export interface ChatDebateResult {
  replyKo: string;
  replyUser: string;
  sources?: string[];
}

export interface DebatePort {
  chatDebate(params: ChatDebateParams): Promise<ChatDebateResult>;
}
