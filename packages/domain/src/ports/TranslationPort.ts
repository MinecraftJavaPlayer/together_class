export interface TranslateParams {
  imageBase64?: string;
  text?: string;
  targetLang: string;
}

export interface TranslateResult {
  sourceText: string;
  resultText: string;
}

export interface TranslationPort {
  translate(params: TranslateParams): Promise<TranslateResult>;
}
