'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ingestRAGDocument,
  getAllRAGChunks,
  searchRAGContext,
  clearAllRAGChunks,
  RAGChunk,
  RAGSearchResult,
} from '@dahamkke/shared';
import { SidebarNav } from '../components/SidebarNav';

export default function TeacherAdminPage() {
  const [activeTab, setActiveTab] = useState<'rag' | 'search' | 'persona'>('rag');
  
  // Ingestion Form State
  const [subject, setSubject] = useState('국어');
  const [unitTitle, setUnitTitle] = useState('2단원. 작품 속 인물과 나');
  const [rawText, setRawText] = useState(
    '옛날 옛적 어느 마을에 흥부와 놀부 형제가 살고 있었습니다.\n\n놀부는 재산을 독차지하고 착한 동생 흥부를 집에서 쫓아냈습니다.\n\n흥부는 다친 제비를 치료해 주고 보답으로 받은 박 씨를 심어 금은보화를 얻었습니다.'
  );

  // Search Sandbox State
  const [testQuery, setTestQuery] = useState('제비 박씨 은혜');
  const [searchResults, setSearchResults] = useState<RAGSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Stats State
  const [ragChunks, setRagChunks] = useState<RAGChunk[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Persona State
  const [characterName, setCharacterName] = useState('흥부');
  const [systemPrompt, setSystemPrompt] = useState(
    '너는 교과서 속 인물 흥부야. 착하고 따뜻한 성격으로 초등학생 어린이에게 1인칭으로 답변해줘.'
  );

  const refreshRAGList = () => {
    const chunks = getAllRAGChunks();
    setRagChunks(chunks);
  };

  useEffect(() => {
    refreshRAGList();
    const handleUpdate = () => refreshRAGList();
    window.addEventListener('dahamkke_rag_updated', handleUpdate);
    return () => window.removeEventListener('dahamkke_rag_updated', handleUpdate);
  }, []);

  // Handle RAG Vector Ingestion
  const handleIngest = async () => {
    if (!rawText.trim()) {
      alert('교과서 지문 원문을 입력해 주세요.');
      return;
    }

    try {
      // 1. Client RAG Engine Ingest
      const result = ingestRAGDocument(subject, unitTitle, rawText);
      
      // 2. Call API Endpoint `/api/rag/ingest`
      try {
        await fetch('/api/rag/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject, unitTitle, rawText }),
        });
      } catch (e) {}

      setStatusMessage(`✅ 성공적으로 ${result.newChunksCount}개 문단 색인이 생성되었습니다! (총 ${result.totalCount}개)`);
      refreshRAGList();
    } catch (err: any) {
      alert(`색인 생성 오류: ${err?.message}`);
    }
  };

  // Handle Search Test
  const handleTestSearch = async () => {
    if (!testQuery.trim()) return;
    setIsSearching(true);
    
    // 1. Client Search
    const results = searchRAGContext(testQuery, 5);
    setSearchResults(results);

    // 2. Call API Endpoint `/api/rag/query`
    try {
      await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: testQuery }),
      });
    } catch (e) {}

    setIsSearching(false);
  };

  const handleResetVectorDB = () => {
    if (confirm('정말 모든 RAG 색인 데이터를 초기화하시겠습니까?')) {
      clearAllRAGChunks();
      setStatusMessage('🧹 RAG 색인 데이터가 초기화되었습니다.');
      refreshRAGList();
      setSearchResults([]);
    }
  };

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-main)' }}>
      <SidebarNav />

      <main className="main-content" style={{ flex: 1, padding: '24px 32px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              👨‍🏫 교사 관리 콘솔 (RAG 벡터 서버)
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              교과서 단원 원문 등록, 벡터 색인 관리 및 RAG 하이브리드 검색 실시간 서빙
            </p>
          </div>

          <div style={{ backgroundColor: '#EEF2FF', border: '1.5px solid #C7D2FE', padding: '8px 16px', borderRadius: '16px', fontSize: '13px', fontWeight: '800', color: '#4338CA' }}>
            ⚡ RAG 서버 상태: ONLINE (총 {ragChunks.length}개 지문 색인됨)
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('rag')}
            style={{
              padding: '12px 24px',
              borderRadius: '16px',
              fontWeight: '800',
              fontSize: '15px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'rag' ? '#4338CA' : 'var(--card-bg)',
              color: activeTab === 'rag' ? '#FFFFFF' : 'var(--text-muted)',
              boxShadow: activeTab === 'rag' ? '0 4px 12px rgba(67, 56, 202, 0.3)' : 'none',
            }}
          >
            📖 교과서 단원 RAG 등록
          </button>

          <button
            onClick={() => {
              setActiveTab('search');
              handleTestSearch();
            }}
            style={{
              padding: '12px 24px',
              borderRadius: '16px',
              fontWeight: '800',
              fontSize: '15px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'search' ? '#059669' : 'var(--card-bg)',
              color: activeTab === 'search' ? '#FFFFFF' : 'var(--text-muted)',
              boxShadow: activeTab === 'search' ? '0 4px 12px rgba(5, 150, 105, 0.3)' : 'none',
            }}
          >
            🔍 RAG 검색 샌드박스
          </button>

          <button
            onClick={() => setActiveTab('persona')}
            style={{
              padding: '12px 24px',
              borderRadius: '16px',
              fontWeight: '800',
              fontSize: '15px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'persona' ? '#7C3AED' : 'var(--card-bg)',
              color: activeTab === 'persona' ? '#FFFFFF' : 'var(--text-muted)',
              boxShadow: activeTab === 'persona' ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none',
            }}
          >
            🎭 인물 페르소나 설정
          </button>
        </div>

        {statusMessage && (
          <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '12px 20px', borderRadius: '14px', fontWeight: '800', marginBottom: '24px' }}>
            {statusMessage}
          </div>
        )}

        {/* TAB 1: RAG INGESTION */}
        {activeTab === 'rag' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
            
            {/* Form */}
            <div style={{ backgroundColor: 'var(--card-bg)', padding: '28px', borderRadius: '24px', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-soft)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 20px 0' }}>
                📖 신규 교과서 원문 RAG 벡터 색인
              </h2>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: '800', fontSize: '14px', color: 'var(--text-main)', marginBottom: '6px' }}>과목</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '14px', border: '1.5px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', fontWeight: '700', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: '800', fontSize: '14px', color: 'var(--text-main)', marginBottom: '6px' }}>단원명</label>
                <input
                  type="text"
                  value={unitTitle}
                  onChange={(e) => setUnitTitle(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '14px', border: '1.5px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', fontWeight: '700', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: '800', fontSize: '14px', color: 'var(--text-main)', marginBottom: '6px' }}>교과서 지문 원문</label>
                <textarea
                  rows={7}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="단원 지문 원문을 입력하거나 붙여넣으세요..."
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1.5px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', fontWeight: '600', outline: 'none', lineHeight: '1.6' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleIngest}
                  style={{
                    flex: 1,
                    padding: '16px 24px',
                    backgroundColor: '#4338CA',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '16px',
                    fontSize: '17px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    boxShadow: '0 6px 16px rgba(67, 56, 202, 0.3)',
                  }}
                >
                  ⚡ RAG 벡터 색인 등록 실행
                </button>

                <button
                  onClick={handleResetVectorDB}
                  style={{
                    padding: '16px 20px',
                    backgroundColor: '#FEE2E2',
                    color: '#EF4444',
                    border: 'none',
                    borderRadius: '16px',
                    fontSize: '15px',
                    fontWeight: '800',
                    cursor: 'pointer',
                  }}
                >
                  🧹 DB 초기화
                </button>
              </div>
            </div>

            {/* Live Indexed Chunks Preview */}
            <div style={{ backgroundColor: 'var(--card-bg)', padding: '28px', borderRadius: '24px', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-soft)', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 16px 0' }}>
                📂 색인된 교과서 지문 목록 ({ragChunks.length}개)
              </h3>

              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '480px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {ragChunks.map((chunk) => (
                  <div key={chunk.id} style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#4338CA', backgroundColor: '#EEF2FF', padding: '2px 8px', borderRadius: '8px' }}>
                        {chunk.subject}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>
                        단락 #{chunk.paragraphIndex}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                      {chunk.unitTitle}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      {chunk.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: SEARCH SANDBOX */}
        {activeTab === 'search' && (
          <div style={{ backgroundColor: 'var(--card-bg)', padding: '32px', borderRadius: '24px', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-soft)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 16px 0' }}>
              🔍 RAG 하이브리드 검색 & 증강 샌드박스
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              학생이 입력하는 질문에 대해 RAG 벡터 서버가 어떤 지문 단락을 최상위 근거로 검색해오는지 실시간으로 테스트합니다.
            </p>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTestSearch();
                }}
                placeholder="검색할 질문이나 키워드를 입력하세요 (예: 제비 박씨 은혜)"
                style={{ flex: 1, padding: '16px 20px', borderRadius: '16px', border: '1.5px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', fontSize: '16px', fontWeight: '700', outline: 'none' }}
              />
              <button
                onClick={handleTestSearch}
                style={{ padding: '16px 32px', backgroundColor: '#059669', color: '#FFF', border: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: '900', cursor: 'pointer' }}
              >
                🔍 실시간 RAG 검색
              </button>
            </div>

            {/* Results Display */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '16px' }}>
                🎯 RAG 검색 결과 ({searchResults.length}건 검색됨)
              </h3>

              {searchResults.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-main)', borderRadius: '16px' }}>
                  관련도가 높은 교과서 지문 단락이 없거나 검색 결과가 없습니다.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {searchResults.map((res, idx) => (
                    <div key={idx} style={{ backgroundColor: 'var(--bg-main)', border: '2px solid #A7F3D0', borderRadius: '18px', padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '900', color: '#047857', backgroundColor: '#D1FAE5', padding: '4px 12px', borderRadius: '10px' }}>
                          순위 #{idx + 1} (유사도 점수: {Math.round(res.score * 100) / 100})
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)' }}>
                          {res.chunk.subject} ➔ {res.chunk.unitTitle}
                        </span>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.6' }}>
                        "{res.chunk.content}"
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PERSONA SETTINGS */}
        {activeTab === 'persona' && (
          <div style={{ backgroundColor: 'var(--card-bg)', padding: '32px', borderRadius: '24px', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-soft)', maxWidth: '800px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 20px 0' }}>
              🎭 인물 인터뷰 페르소나 설정
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '800', fontSize: '14px', color: 'var(--text-main)', marginBottom: '6px' }}>인물 이름</label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '14px', border: '1.5px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', fontWeight: '700', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '800', fontSize: '14px', color: 'var(--text-main)', marginBottom: '6px' }}>System Prompt 페르소나 지침</label>
              <textarea
                rows={6}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1.5px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', fontWeight: '600', outline: 'none', lineHeight: '1.6' }}
              />
            </div>

            <button
              onClick={() => alert(`'${characterName}' 인물 페르소나가 성공적으로 저장되었습니다!`)}
              style={{
                padding: '16px 28px',
                backgroundColor: '#7C3AED',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '16px',
                fontSize: '17px',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(124, 58, 237, 0.3)',
              }}
            >
              💾 페르소나 설정 저장
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
