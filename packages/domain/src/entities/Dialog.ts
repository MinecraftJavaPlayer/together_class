export type DialogMode = 'debate' | 'interview';

export interface DialogMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  lang?: string;
  translatedContent?: string;
  timestamp?: string;
}

export interface DialogRecord {
  id: string;
  userId?: string;
  mode: DialogMode;
  messages: DialogMessage[];
  createdAt: string;
}
