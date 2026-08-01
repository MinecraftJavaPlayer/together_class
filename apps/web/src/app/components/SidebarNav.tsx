'use client';

import React from 'react';
// @ts-ignore
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCurrentUser, isAllLearningCompleted } from '@dahamkke/shared';

export function SidebarNav() {
  const pathname = usePathname() || '/';
  const currentUser = getCurrentUser();
  const isQuizUnlocked = isAllLearningCompleted(currentUser);

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
    <aside className="sidebar">
      {/* Brand Logo with New Cute 3D HTML SVG Mascot */}
      <div className="brand-logo" style={{ marginBottom: '28px', padding: '0 12px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '8px 16px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          <img
            src="/logo.png"
            alt="다함께 교실 Logo"
            style={{
              maxWidth: '100%',
              height: 'auto',
              maxHeight: '44px',
              objectFit: 'contain',
            }}
          />
        </div>
      </div>

      <ul className="nav-list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', padding: 0, margin: 0 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li
              key={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
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

        <li className="nav-item" style={{ marginTop: 'auto', borderRadius: '12px', backgroundColor: 'var(--nav-highlight-admin-bg)' }}>
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
