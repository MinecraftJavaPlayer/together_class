export interface RagIngestParams {
  textbookId: string;
  rawText: string;
}

export interface RagIngestResult {
  chunksCount: number;
}

export interface RagPort {
  ingestTextbook(params: RagIngestParams): Promise<RagIngestResult>;
}
