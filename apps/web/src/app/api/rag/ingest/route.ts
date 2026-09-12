import { NextRequest, NextResponse } from 'next/server';
import { ingestRAGDocument, getAllRAGChunks, clearAllRAGChunks } from '@dahamkke/shared';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject, unitTitle, rawText } = body;

    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return NextResponse.json(
        { success: false, error: '원문 텍스트(rawText)를 올바르게 입력해 주세요.' },
        { status: 400 }
      );
    }

    const result = ingestRAGDocument(subject || '국어', unitTitle || '단원 미지정', rawText);

    return NextResponse.json({
      success: true,
      message: `성공적으로 ${result.newChunksCount}개의 문단 단락이 RAG 벡터 색인으로 저장되었습니다.`,
      newChunksCount: result.newChunksCount,
      totalIndexedCount: result.totalCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'RAG 색인 저장 중 오류 발생' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const chunks = getAllRAGChunks();
    const unitsMap = new Map<string, { subject: string; unitTitle: string; chunkCount: number }>();

    chunks.forEach((c) => {
      const key = `${c.subject}___${c.unitTitle}`;
      const existing = unitsMap.get(key);
      if (existing) {
        existing.chunkCount += 1;
      } else {
        unitsMap.set(key, { subject: c.subject, unitTitle: c.unitTitle, chunkCount: 1 });
      }
    });

    return NextResponse.json({
      success: true,
      totalChunks: chunks.length,
      units: Array.from(unitsMap.values()),
      chunksSummary: chunks.slice(0, 10), // return top 10 previews
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'RAG 목록 조회 중 오류 발생' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    clearAllRAGChunks();
    return NextResponse.json({
      success: true,
      message: '모든 RAG 벡터 색인 데이터가 초기화되었습니다.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || '초기화 실패' },
      { status: 500 }
    );
  }
}
