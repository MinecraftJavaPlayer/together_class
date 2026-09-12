import { NextRequest, NextResponse } from 'next/server';
import { searchRAGContext, generateRAGAugmentedResponse } from '@dahamkke/shared';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, topK = 3, systemPrompt } = body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json(
        { success: false, error: '검색 질문(query)을 입력해 주세요.' },
        { status: 400 }
      );
    }

    const searchResults = searchRAGContext(query, topK);
    const ragResult = generateRAGAugmentedResponse(query, systemPrompt);

    return NextResponse.json({
      success: true,
      query,
      retrievedCount: searchResults.length,
      retrievedChunks: searchResults.map((r) => ({
        id: r.chunk.id,
        subject: r.chunk.subject,
        unitTitle: r.chunk.unitTitle,
        content: r.chunk.content,
        relevanceScore: Math.round(r.score * 1000) / 1000,
      })),
      augmentedResponse: ragResult.response,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'RAG 검색 중 오류 발생' },
      { status: 500 }
    );
  }
}
