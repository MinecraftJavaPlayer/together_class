import { NextResponse } from 'next/server';
import { getAllRAGChunks } from '@dahamkke/shared';

export async function GET() {
  const chunks = getAllRAGChunks();
  return NextResponse.json({
    server: 'Dahamkke RAG Server v1.0',
    status: 'ONLINE',
    totalChunksIndexed: chunks.length,
    activeEngine: 'Hybrid Vector-TFIDF Engine',
    timestamp: new Date().toISOString(),
  });
}
