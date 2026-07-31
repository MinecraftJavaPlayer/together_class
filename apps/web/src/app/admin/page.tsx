'use client';

import React, { useState } from 'react';
// @ts-ignore
import Link from 'next/link';

export default function TeacherAdminPage() {
  const [activeTab, setActiveTab] = useState<'rag' | 'persona'>('rag');
  const [subject, setSubject] = useState('국어');
  const [unitTitle, setUnitTitle] = useState('2단원. 작품 속 인물과 나');
  const [rawText, setRawText] = useState(
    '옛날 옛적 어느 마을에 흥부와 놀부 형제가 살고 있었습니다.\n\n놀부는 재산을 독차지하고 착한 동생 흥부를 집에서 쫓아냈습니다.'
  );

  const [characterName, setCharacterName] = useState('흥부');
  const [systemPrompt, setSystemPrompt] = useState(
    '너는 교과서 속 인물 흥부야. 착하고 따뜻한 성격으로 초등학생 어린이에게 1인칭으로 답변해줘.'
  );

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="brand-logo">
          <span style={{ fontSize: '32px' }}>👨‍🏫</span>
          <span className="brand-title">교사 관리 콘솔</span>
        </div>
        <ul className="nav-list">
          <li className="nav-item"><Link href="/">🏠 홈 대시보드</Link></li>
          <li className="nav-item active"><Link href="/admin">👨‍🏫 교사 관리 콘솔</Link></li>
        </ul>
      </aside>

      <main className="main-content">
        <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
          👨‍🏫 교사 전용 관리 콘솔 (RAG & Persona Admin)
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
          교과서 단원 원문을 RAG 벡터 색인으로 등록하거나 인물 인터뷰 페르소나를 관리합니다.
        </p>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('rag')}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: '700',
              backgroundColor: activeTab === 'rag' ? '#4338CA' : '#E0E7FF',
              color: activeTab === 'rag' ? '#FFFFFF' : '#3730A3',
            }}
          >
            📖 교과서 단원 RAG 등록
          </button>
          <button
            onClick={() => setActiveTab('persona')}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: '700',
              backgroundColor: activeTab === 'persona' ? '#6D28D9' : '#EDE9FE',
              color: activeTab === 'persona' ? '#FFFFFF' : '#5B21B6',
            }}
          >
            🎭 인물 페르소나 설정
          </button>
        </div>

        {activeTab === 'rag' ? (
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', maxWidth: '800px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>📖 교과서 원문 RAG 색인</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>과목</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>단원명</label>
              <input
                type="text"
                value={unitTitle}
                onChange={(e) => setUnitTitle(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>지문 원문</label>
              <textarea
                rows={6}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
            </div>
            <button
              onClick={() => alert('Supabase Edge Function /rag-ingest 호출: 성공적으로 4개 문단이 임베딩 색인되었습니다!')}
              style={{
                backgroundColor: '#4338CA',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '700',
              }}
            >
              ⚡ RAG 벡터 임베딩 저장
            </button>
          </div>
        ) : (
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', maxWidth: '800px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>🎭 페르소나 엔지니어링</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>인물 이름</label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>System Prompt 지침</label>
              <textarea
                rows={6}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
            </div>
            <button
              onClick={() => alert(`'${characterName}' 페르소나가 성공적으로 저장되었습니다!`)}
              style={{
                backgroundColor: '#6D28D9',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '700',
              }}
            >
              💾 페르소나 저장
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
