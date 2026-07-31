export interface InterpretParams {
  audioBase64: string;
  fromLang: string;
  toLang: string;
}

export interface InterpretResult {
  sourceText: string;
  resultText: string;
  audioUrl?: string;
}

export interface InterpretPort {
  interpret(params: InterpretParams): Promise<InterpretResult>;
}
