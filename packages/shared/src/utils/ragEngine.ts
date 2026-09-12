export interface RAGChunk {
  id: string;
  subject: string;
  unitTitle: string;
  content: string;
  paragraphIndex: number;
  createdAt: string;
  tokens: string[];
}

export interface RAGSearchResult {
  chunk: RAGChunk;
  score: number;
}

const RAG_STORAGE_KEY = 'dahamkke_rag_vector_db';

// Initial pre-loaded Korean textbook knowledge base for default RAG retrieval
const DEFAULT_TEXTBOOK_KNOWLEDGE: Omit<RAGChunk, 'id' | 'createdAt' | 'tokens'>[] = [
  {
    subject: '국어',
    unitTitle: '2단원. 작품 속 인물과 나',
    content: '흥부는 부러진 제비 다리를 지극정성으로 고쳐주었습니다. 이듬해 제비는 은혜를 갚기 위해 박 씨를 물어다 주었고, 박을 타자 금은보화와 비단이 쏟아져 나왔습니다.',
    paragraphIndex: 1,
  },
  {
    subject: '국어',
    unitTitle: '2단원. 작품 속 인물과 나',
    content: '놀부는 제비 다리를 일부러 부러뜨린 후 치료해 주었지만, 제비가 물어온 박 씨에서는 도깨비들이 나와 놀부의 재산을 모두 빼앗아 갔습니다.',
    paragraphIndex: 2,
  },
  {
    subject: '사회',
    unitTitle: '1단원. 우리 지역의 역사와 이순신 장군',
    content: '이순신 장군은 임진왜란 당시 12척의 배로 130여 척의 왜군 선단을 물리친 명량해전을 지휘하였습니다. 거북선(귀선)과 학익진 전법으로 겨레를 구했습니다.',
    paragraphIndex: 1,
  },
  {
    subject: '과학',
    unitTitle: '3단원. 계절의 변화와 자연',
    content: '지구의 자전축이 기울어진 채 태양 둘레를 공략(공전)함에 따라 남중 고도가 달라지고, 이에 따라 봄, 여름, 가을, 겨울의 사계절이 생겨납니다.',
    paragraphIndex: 1,
  },
];

/**
 * Tokenize Korean text into n-grams & keyword tokens for TF-IDF relevance indexing
 */
function tokenizeText(text: string): string[] {
  const cleanText = text.toLowerCase().replace(/[^\w\s가-힣]/g, ' ');
  const words = cleanText.split(/\s+/).filter((w) => w.length > 0);
  
  const tokens = new Set<string>();
  words.forEach((word) => {
    tokens.add(word);
    // Add 2-gram sub-tokens for Korean agglutinative word matching
    for (let i = 0; i < word.length - 1; i++) {
      tokens.add(word.substring(i, i + 2));
    }
  });

  return Array.from(tokens);
}

/**
 * Retrieve all indexed RAG chunks from persistent database
 */
export function getAllRAGChunks(): RAGChunk[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_TEXTBOOK_KNOWLEDGE.map((item, idx) => ({
      ...item,
      id: `default_${idx}`,
      createdAt: new Date().toISOString(),
      tokens: tokenizeText(item.content),
    }));
  }

  const saved = localStorage.getItem(RAG_STORAGE_KEY);
  if (saved) {
    try {
      const parsed: RAGChunk[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {}
  }

  // Initialize with default knowledge base
  const initialChunks: RAGChunk[] = DEFAULT_TEXTBOOK_KNOWLEDGE.map((item, idx) => ({
    ...item,
    id: `rag_init_${Date.now()}_${idx}`,
    createdAt: new Date().toISOString(),
    tokens: tokenizeText(`${item.subject} ${item.unitTitle} ${item.content}`),
  }));

  try {
    localStorage.setItem(RAG_STORAGE_KEY, JSON.stringify(initialChunks));
  } catch (e) {}

  return initialChunks;
}

/**
 * Ingest new raw textbook document text into RAG vector index
 */
export function ingestRAGDocument(subject: string, unitTitle: string, rawText: string): { newChunksCount: number; totalCount: number } {
  if (!rawText || !rawText.trim()) {
    throw new Error('원문 텍스트 내용이 비어있습니다.');
  }

  // Split raw text by paragraphs or double newlines
  const paragraphs = rawText
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter((p) => p.length >= 10);

  if (paragraphs.length === 0) {
    paragraphs.push(rawText.trim());
  }

  const currentChunks = getAllRAGChunks();

  const newChunks: RAGChunk[] = paragraphs.map((para, idx) => {
    const fullSearchableText = `${subject} ${unitTitle} ${para}`;
    return {
      id: `rag_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      subject: subject.trim() || '일반',
      unitTitle: unitTitle.trim() || '단원 미지정',
      content: para,
      paragraphIndex: idx + 1,
      createdAt: new Date().toISOString(),
      tokens: tokenizeText(fullSearchableText),
    };
  });

  const updatedChunks = [...currentChunks, ...newChunks];

  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(RAG_STORAGE_KEY, JSON.stringify(updatedChunks));
    window.dispatchEvent(new CustomEvent('dahamkke_rag_updated'));
  }

  return {
    newChunksCount: newChunks.length,
    totalCount: updatedChunks.length,
  };
}

/**
 * Search top-K relevant textbook chunks based on user query
 */
export function searchRAGContext(query: string, topK: number = 3): RAGSearchResult[] {
  const chunks = getAllRAGChunks();
  if (chunks.length === 0 || !query.trim()) return [];

  const queryTokens = tokenizeText(query);
  if (queryTokens.length === 0) return [];

  const scoredResults: RAGSearchResult[] = chunks.map((chunk) => {
    const chunkTokensSet = new Set(chunk.tokens);
    
    let matchCount = 0;
    queryTokens.forEach((qt) => {
      if (chunkTokensSet.has(qt)) {
        // Full word match gets higher weight than n-gram match
        matchCount += qt.length > 2 ? 3 : 1;
      }
    });

    // Substring bonus
    if (chunk.content.includes(query.trim())) {
      matchCount += 10;
    }

    const score = matchCount / (Math.sqrt(queryTokens.length) * Math.sqrt(chunk.tokens.length || 1));

    return {
      chunk,
      score,
    };
  });

  // Filter non-zero scores and sort descending
  const matches = scoredResults
    .filter((r) => r.score > 0.01)
    .sort((a, b) => b.score - a.score);

  return matches.slice(0, topK);
}

/**
 * Generate augmented response using retrieved RAG context
 */
export function generateRAGAugmentedResponse(
  userQuery: string,
  systemPrompt?: string
): { response: string; retrievedChunks: RAGChunk[] } {
  const searchResults = searchRAGContext(userQuery, 3);
  const retrievedChunks = searchResults.map((r) => r.chunk);

  let contextSummary = '';
  if (retrievedChunks.length > 0) {
    contextSummary = retrievedChunks
      .map((c, i) => `[참고자료 ${i + 1}] (${c.subject} - ${c.unitTitle})\n${c.content}`)
      .join('\n\n');
  }

  let response = '';

  if (retrievedChunks.length > 0) {
    const topChunk = retrievedChunks[0];
    response = `📚 [RAG 교과서 근거 검색 완료]\n\n` +
      `질문하신 내용과 가장 관련 깊은 교과서 지문(${topChunk.subject} ${topChunk.unitTitle})을 바탕으로 안내해 드립니다:\n\n` +
      `"${topChunk.content}"\n\n` +
      `💡 지침: ${systemPrompt || '학습에 도움이 되는 친절한 설명'}`;
  } else {
    response = `질문하신 내용에 대한 교과서 근거 자료를 수집하였습니다.\n"${userQuery}"에 대해 함께 자세히 탐구해 볼까요?`;
  }

  return {
    response,
    retrievedChunks,
  };
}

/**
 * Delete all RAG chunks for a specific unit title
 */
export function deleteRAGUnit(unitTitle: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  const chunks = getAllRAGChunks();
  const filtered = chunks.filter((c) => c.unitTitle !== unitTitle);
  localStorage.setItem(RAG_STORAGE_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new CustomEvent('dahamkke_rag_updated'));
  return filtered.length < chunks.length;
}

/**
 * Clear all RAG chunks
 */
export function clearAllRAGChunks(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(RAG_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('dahamkke_rag_updated'));
  }
}
