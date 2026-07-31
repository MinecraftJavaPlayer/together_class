export interface PersonaQueryParams {
  personaId: string;
  question: string;
  userLang: string;
  history?: Array<{ role: string; content: string }>;
}

export interface PersonaQueryResult {
  answer: string;
  sources: string[];
}

export interface PersonaPort {
  askPersona(params: PersonaQueryParams): Promise<PersonaQueryResult>;
}
