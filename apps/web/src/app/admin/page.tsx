'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ingestRAGDocument,
  getAllRAGChunks,
  searchRAGContext,
  clearAllRAGChunks,
  deleteRAGChunk,
  getCurrentUser,
  getTeacherPersona,
  saveTeacherPersona,
  generateTeacherPersonaResponse,
  TeacherPersonaConfig,
  RAGChunk,
  RAGSearchResult,
} from '@dahamkke/shared';
import { SidebarNav } from '../components/SidebarNav';

export default function TeacherAdminPage() {
  const [activeTab, setActiveTab] = useState<'rag' | 'search' | 'persona'>('rag');
  const [isTeacher, setIsTeacher] = useState<boolean | null>(null);
  
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
  const [personalityType, setPersonalityType] = useState<'good' | 'bad' | 'proud' | 'custom'>('good');
  const [traitDescription, setTraitDescription] = useState('가난하지만 마음씨 착하고 온순한 성격');
  const [systemPrompt, setSystemPrompt] = useState(
    '너는 교과서 속 인물 흥부야. 착하고 따뜻한 성격으로 초등학생 어린이에게 1인칭으로 답변해줘.'
  );

  // Persona Live Preview Chat State
  const [previewQuery, setPreviewQuery] = useState('놀부 형님에 대해 어떻게 생각하니?');
  const [previewMessages, setPreviewMessages] = useState<Array<{ sender: 'teacher' | 'character'; text: string; sources?: string[] }>>([]);

  const refreshRAGList = () => {
    const chunks = getAllRAGChunks();
    setRagChunks(chunks);
  };

  const loadCharacterPersona = (name: string) => {
    const p = getTeacherPersona(name);
    setCharacterName(name);
    setPersonalityType(p.personalityType);
    setTraitDescription(p.traitDescription);
    setSystemPrompt(p.systemPrompt);
  };

  useEffect(() => {
    // Role check: Only allow teacher accounts
    const user = getCurrentUser();
    if (user && user.role === 'teacher') {
      setIsTeacher(true);
    } else {
      setIsTeacher(false);
    }

    loadCharacterPersona('흥부');

    refreshRAGList();
    const handleUpdate = () => refreshRAGList();
    window.addEventListener('dahamkke_rag_updated', handleUpdate);
    return () => window.removeEventListener('dahamkke_rag_updated', handleUpdate);
  }, []);

  const handleApplyPreset = (type: 'good' | 'bad' | 'proud') => {
    setPersonalityType(type);
    if (characterName === '흥부') {
      if (type === 'bad') {
        setTraitDescription('흥부는 사실 아주 못되고 욕심 많은 나쁜 인물이다 (놀부 형님을 골탕 먹이고 제비 다리를 부러뜨림)');
        setSystemPrompt('너는 심술궂고 욕심 많은 나쁜 흥부야. 착한 척하면서 사실은 놀부 형님의 재산을 빼앗으려 하고 제비에게서 보물을 뜯어내려 하는 못된 악역으로 초등학생에게 크하하 웃으며 1인칭으로 답변해줘.');
      } else if (type === 'good') {
        setTraitDescription('가난하지만 마음씨 착하고 온순하며 형을 공경하는 성격');
        setSystemPrompt('너는 교과서 속 인물 흥부야. 착하고 따뜻한 성격으로 초등학생 어린이에게 1인칭으로 답변해줘.');
      } else {
        setTraitDescription('자신감 넘치고 당당한 큰손 흥부');
        setSystemPrompt('너는 어떤 고난에도 기죽지 않는 당당하고 호탕한 흥부야. 초등학생에게 힘차게 1인칭으로 답변해줘.');
      }
    } else if (characterName === '놀부') {
      if (type === 'good') {
        setTraitDescription('겉으로는 퉁명스럽지만 동생 흥부의 자립을 위해 일부러 내쫓은 따뜻한 형님');
        setSystemPrompt('너는 동생 흥부를 속으로 진심으로 아끼는 츤데레 놀부 형님이야. 겉으론 엄격하지만 따뜻한 마음으로 답변해줘.');
      } else {
        setTraitDescription('욕심 많고 심술궂으며 동생을 내쫓은 악역 놀부');
        setSystemPrompt('너는 교과서 속 인물 놀부야. 욕심 많고 퉁명스러운 성격으로 답변해줘.');
      }
    } else {
      if (type === 'bad') {
        setTraitDescription(`${characterName}는 사실 욕심 많고 심술궂은 나쁜 인물이다`);
        setSystemPrompt(`너는 ${characterName}야. 심술궂고 퉁명스러운 악역 성격으로 어린이에게 답변해줘.`);
      } else {
        setTraitDescription(`${characterName}의 교과서 원작 기본 성격`);
        setSystemPrompt(`너는 교과서 속 인물 ${characterName}야. 교과서 원작에 충실하게 1인칭으로 답변해줘.`);
      }
    }
  };

  const handleSavePersona = () => {
    const config: TeacherPersonaConfig = {
      characterName,
      personalityType,
      traitDescription,
      systemPrompt,
      speechStyle: personalityType === 'bad' ? 'villain' : 'friendly',
      updatedAt: new Date().toISOString(),
    };
    saveTeacherPersona(config);
    setStatusMessage(`💾 '${characterName}'의 성격 설정("${personalityType === 'bad' ? '😈 나쁜 악역' : '😇 착한 성격'}")이 저장되어 교실 전체(인물 인터뷰)에 실시간 적용되었습니다!`);
    
    // Also trigger preview
    const res = generateTeacherPersonaResponse(characterName, previewQuery || '놀부 형님에 대해 어떻게 생각해?');
    setPreviewMessages([
      { sender: 'teacher', text: previewQuery || '놀부 형님에 대해 어떻게 생각해?' },
      { sender: 'character', text: res.answer, sources: res.sources },
    ]);
  };

  const handleRunPreviewChat = () => {
    if (!previewQuery.trim()) return;
    const res = generateTeacherPersonaResponse(characterName, previewQuery);
    setPreviewMessages((prev) => [
      ...prev,
      { sender: 'teacher', text: previewQuery },
      { sender: 'character', text: res.answer, sources: res.sources },
    ]);
    setPreviewQuery('');
  };

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

  if (isTeacher === false) {
    const user = getCurrentUser();
    return (
      <div className="dashboard-container" style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-main)' }}>
        <SidebarNav />

        <main className="main-content" style={{ flex: 1, padding: '40px 32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '2px solid #EF4444',
              borderRadius: '24px',
              padding: '48px 40px',
              maxWidth: '540px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(239, 68, 68, 0.15)',
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#DC2626', marginBottom: '12px' }}>
              교사 전용 관리자 페이지입니다
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '28px' }}>
              교사 콘솔(RAG 지문 학습 및 벡터 서버 관리)은 <strong>선생님 계정 (Role: Teacher)</strong>만 접근이 가능합니다.<br /><br />
              현재 계정(<strong>{user?.name || '게스트'}</strong> / {user?.role === 'student' ? '학생 계정' : '권한 없음'})은 접근 권한이 없으니 메인 화면으로 돌아가 주시기 바랍니다.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/"
                style={{
                  display: 'inline-block',
                  padding: '14px 24px',
                  backgroundColor: '#64748B',
                  color: '#FFFFFF',
                  borderRadius: '16px',
                  fontWeight: '900',
                  fontSize: '15px',
                  textDecoration: 'none',
                }}
              >
                🏠 메인 화면으로
              </Link>
              <Link
                href="/login"
                style={{
                  display: 'inline-block',
                  padding: '14px 24px',
                  backgroundColor: '#4F46E5',
                  color: '#FFFFFF',
                  borderRadius: '16px',
                  fontWeight: '900',
                  fontSize: '15px',
                  textDecoration: 'none',
                  boxShadow: '0 6px 16px rgba(79, 70, 229, 0.3)',
                }}
              >
                👨‍🏫 교사 계정으로 로그인 / 가입
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#4338CA', backgroundColor: '#EEF2FF', padding: '2px 8px', borderRadius: '8px' }}>
                        {chunk.subject}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>
                          단락 #{chunk.paragraphIndex}
                        </span>
                        <button
                          onClick={() => {
                            if (confirm('이 교과서 지문 단락을 삭제하시겠습니까?')) {
                              deleteRAGChunk(chunk.id);
                              refreshRAGList();
                              setStatusMessage('🗑️ 지문 단락이 삭제되었습니다.');
                            }
                          }}
                          style={{
                            backgroundColor: '#FEE2E2',
                            color: '#EF4444',
                            border: 'none',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '800',
                            cursor: 'pointer',
                          }}
                        >
                          삭제
                        </button>
                      </div>
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

        {/* TAB 3: PERSONA & CHARACTER TRAITS SETTINGS */}
        {activeTab === 'persona' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px' }}>
            
            {/* Left: Configuration Form */}
            <div style={{ backgroundColor: 'var(--card-bg)', padding: '28px', borderRadius: '24px', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>
                  🎭 교과서 인물 페르소나 & 성격 설정
                </h2>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#7C3AED', backgroundColor: '#F3E8FF', padding: '4px 10px', borderRadius: '10px' }}>
                  실시간 교실 전체 동기화
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                선생님이 설정한 인물의 성격, 가치관, 지침이 학생들의 <strong>인물 인터뷰 대화에 100% 실시간으로 반영</strong>됩니다.<br />
                (예: 선생님이 '흥부는 나쁘다'고 설정하면, 흥부가 진짜로 심술궂고 못된 성격으로 답변합니다)
              </p>

              {/* 1. Character Selector */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: '800', fontSize: '13px', color: 'var(--text-main)', marginBottom: '8px' }}>
                  👤 설정할 인물 선택
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { name: '흥부', icon: '🌾' },
                    { name: '놀부', icon: '💰' },
                    { name: '이순신', icon: '⚔️' },
                    { name: '세종대왕', icon: '📜' },
                  ].map((c) => (
                    <button
                      key={c.name}
                      onClick={() => loadCharacterPersona(c.name)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '12px',
                        border: characterName === c.name ? '2.5px solid #7C3AED' : '1.5px solid var(--border-color)',
                        backgroundColor: characterName === c.name ? '#F3E8FF' : 'var(--input-bg)',
                        color: characterName === c.name ? '#6D28D9' : 'var(--text-main)',
                        fontWeight: '900',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{c.icon}</span> {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Quick Personality Preset Buttons */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: '800', fontSize: '13px', color: 'var(--text-main)', marginBottom: '8px' }}>
                  ⚡ 성격 빠른 설정 프리셋
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleApplyPreset('good')}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      backgroundColor: personalityType === 'good' ? '#D1FAE5' : 'var(--input-bg)',
                      border: personalityType === 'good' ? '2px solid #059669' : '1.5px solid var(--border-color)',
                      color: personalityType === 'good' ? '#047857' : 'var(--text-main)',
                      fontWeight: '800',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    😇 [원작 기본] 착하고 온순함
                  </button>
                  <button
                    onClick={() => handleApplyPreset('bad')}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      backgroundColor: personalityType === 'bad' ? '#FEE2E2' : 'var(--input-bg)',
                      border: personalityType === 'bad' ? '2px solid #DC2626' : '1.5px solid var(--border-color)',
                      color: personalityType === 'bad' ? '#B91C1C' : 'var(--text-main)',
                      fontWeight: '900',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    😈 [성격 반전] 나쁜 / 악역 성격 ("{characterName}는 나쁘다")
                  </button>
                </div>
              </div>

              {/* 3. Trait Description */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontWeight: '800', fontSize: '13px', color: 'var(--text-main)', marginBottom: '6px' }}>
                  📝 인물 핵심 성격 및 특징 설명
                </label>
                <input
                  type="text"
                  value={traitDescription}
                  onChange={(e) => {
                    setTraitDescription(e.target.value);
                    setPersonalityType('custom');
                  }}
                  placeholder="예: 흥부는 사실 아주 못되고 욕심 많은 나쁜 인물이다"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    fontWeight: '700',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* 4. System Prompt */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontWeight: '800', fontSize: '13px', color: 'var(--text-main)', marginBottom: '6px' }}>
                  🧠 AI 페르소나 System Prompt 상세 지침
                </label>
                <textarea
                  rows={4}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    fontWeight: '600',
                    fontSize: '13px',
                    outline: 'none',
                    lineHeight: '1.5',
                  }}
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSavePersona}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  backgroundColor: personalityType === 'bad' ? '#DC2626' : '#7C3AED',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '16px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  boxShadow: personalityType === 'bad' ? '0 6px 16px rgba(220, 38, 38, 0.3)' : '0 6px 16px rgba(124, 58, 237, 0.3)',
                  transition: 'background-color 0.2s ease',
                }}
              >
                💾 '{characterName}'의 성격을 [{personalityType === 'bad' ? '😈 나쁜 악역 성격' : '😇 착한 성격'}]으로 교실 전체에 저장 적용하기
              </button>
            </div>

            {/* Right: Live Test Chat Sandbox */}
            <div style={{ backgroundColor: 'var(--card-bg)', padding: '24px', borderRadius: '24px', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-soft)', display: 'flex', flexDirection: 'column', height: '620px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexShrink: 0 }}>
                <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>
                  💬 설정 실시간 대화 테스트
                </h3>
                <span style={{ fontSize: '12px', fontWeight: '800', color: personalityType === 'bad' ? '#DC2626' : '#059669', backgroundColor: personalityType === 'bad' ? '#FEE2E2' : '#D1FAE5', padding: '3px 8px', borderRadius: '8px' }}>
                  현재 상태: {personalityType === 'bad' ? '😈 나쁜 성격 작동' : '😇 기본 성격 작동'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 12px 0', flexShrink: 0 }}>
                설정한 성격이 실제 학생 대화에서 어떻게 나오는지 선생님이 직접 질문해 보세요!
              </p>

              {/* Chat Thread */}
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', backgroundColor: 'var(--bg-main)', borderRadius: '16px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--border-color)' }}>
                {previewMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', margin: 'auto', padding: '20px' }}>
                    아래 버튼이나 질문창을 통해<br />
                    <strong>'{characterName}'</strong>에게 말을 걸어보세요!
                  </div>
                ) : (
                  previewMessages.map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        alignSelf: m.sender === 'teacher' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        backgroundColor: m.sender === 'teacher' ? '#4F46E5' : 'var(--card-bg)',
                        color: m.sender === 'teacher' ? '#FFFFFF' : 'var(--text-main)',
                        padding: '10px 14px',
                        borderRadius: '14px',
                        fontSize: '13px',
                        fontWeight: '700',
                        lineHeight: '1.4',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                        border: m.sender === 'character' ? (personalityType === 'bad' ? '1.5px solid #FCA5A5' : '1.5px solid var(--border-color)') : 'none',
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: '800', opacity: 0.8, marginBottom: '2px' }}>
                        {m.sender === 'teacher' ? '👨‍🏫 선생님 질문' : `🎭 ${characterName} (${personalityType === 'bad' ? '악역/나쁨' : '기본'})`}
                      </div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                      {m.sources && (
                        <div style={{ fontSize: '10px', color: personalityType === 'bad' ? '#EF4444' : '#10B981', marginTop: '4px', fontWeight: '800' }}>
                          {m.sources[0]}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Sample Quick Question Buttons */}
              <div style={{ display: 'flex', gap: '6px', margin: '10px 0 8px 0', flexWrap: 'wrap', flexShrink: 0 }}>
                {[
                  '놀부 형님에 대해 어떻게 생각하니?',
                  '제비 다리는 왜 고쳐줬니?',
                  '박에서 나온 보물은 어쨌니?',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setPreviewQuery(q);
                      const res = generateTeacherPersonaResponse(characterName, q);
                      setPreviewMessages((prev) => [
                        ...prev,
                        { sender: 'teacher', text: q },
                        { sender: 'character', text: res.answer, sources: res.sources },
                      ]);
                    }}
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-muted)',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    💬 {q}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <input
                  type="text"
                  value={previewQuery}
                  onChange={(e) => setPreviewQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRunPreviewChat();
                  }}
                  placeholder={`${characterName}에게 질문해 보세요`}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    fontWeight: '700',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleRunPreviewChat}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#4F46E5',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '900',
                    cursor: 'pointer',
                  }}
                >
                  질문
                </button>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
