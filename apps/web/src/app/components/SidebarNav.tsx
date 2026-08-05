'use client';

import React, { useState } from 'react';
// @ts-ignore
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCurrentUser, isAllLearningCompleted } from '@dahamkke/shared';

export function SidebarNav() {
  const pathname = usePathname() || '/';
  const currentUser = getCurrentUser();
  const isQuizUnlocked = isAllLearningCompleted(currentUser);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: '🏠 홈 대시보드' },
    { href: '/rank', label: '🏆 랭크 & 시즌', highlight: true, color: 'var(--nav-highlight-rank-text)', bg: 'var(--nav-highlight-rank-bg)' },
    {
      href: isQuizUnlocked ? '/quiz' : '/translate',
      label: isQuizUnlocked ? '📝 10문항 평가' : '🔒 10문항 평가 (잠김)',
      highlight: true,
      color: isQuizUnlocked ? 'var(--nav-highlight-quiz-text)' : '#94A3B8',
      bg: isQuizUnlocked ? 'var(--nav-highlight-quiz-bg)' : '#334155',
    },
    { href: '/translate', label: '📷 교과서 번역' },
    { href: '/interpret', label: '🎙️ 실시간 통역' },
    { href: '/debate', label: '💬 토론 친구 (민준)' },
    { href: '/persona', label: '🎭 인물 인터뷰' },
    { href: '/dictation', label: '✍️ 받아쓰기' },
    { href: '/notice', label: '📄 가정통신문' },
    { href: '/records', label: '📚 학습 기록' },
  ];

  return (
    <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
      {/* Top Header Row for Mobile & Brand Logo */}
      <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
        <div className="brand-logo" style={{ padding: '0 10px', display: 'flex', alignItems: 'center', flex: 1 }}>
          <img
            src="/logo_light.png"
            alt="다함께 교실 Logo"
            className="logo-light"
            style={{ width: 'auto', height: '42px', maxHeight: '42px', objectFit: 'contain' }}
          />
          <img
            src="/logo_dark.png"
            alt="다함께 교실 Logo"
            className="logo-dark"
            style={{ width: 'auto', height: '42px', maxHeight: '42px', objectFit: 'contain' }}
          />
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          className="mobile-toggle-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
          style={{
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border-color)',
            color: 'var(--text-main)',
            padding: '8px 14px',
            borderRadius: '10px',
            fontWeight: '800',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          {isMobileMenuOpen ? '✕ 닫기' : '☰ 메뉴'}
        </button>
      </div>

      {/* Navigation List */}
      <ul className="nav-list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', padding: 0, margin: 0, width: '100%' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li
              key={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                borderRadius: '12px',
                backgroundColor: isActive ? '#CCFBF1' : item.bg || 'transparent',
              }}
            >
              <Link
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontWeight: isActive || item.highlight ? '800' : '600',
                  color: isActive ? '#0D9488' : item.color || '#1F2937',
                  textDecoration: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                {item.label}
              </Link>
            </li>
          );
        })}

        <li className="nav-item" onClick={() => setIsMobileMenuOpen(false)} style={{ marginTop: 'auto', borderRadius: '12px', backgroundColor: 'var(--nav-highlight-admin-bg)' }}>
          <Link
            href="/admin"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: '12px',
              fontWeight: '700',
              color: 'var(--nav-highlight-admin-text)',
              textDecoration: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            👨‍🏫 교사 콘솔 (RAG)
          </Link>
        </li>
      </ul>
    </aside>
  );
}
