'use client';

import React, { useState, useEffect } from 'react';
// @ts-ignore
import Link from 'next/link';
import { RANK_TIERS, getUserRank, UserProfile, getCurrentUser, getAllUsers, getRankByPoints } from '@dahamkke/shared';
import { SidebarNav } from '../components/SidebarNav';
import { RankSVGIcon } from '../components/RankSVGIcon';

export default function WebRankPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(getCurrentUser());
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    setIsDarkMode(localStorage.getItem('dahamkke_dark_mode') === 'true');
    loadData();
    const handleUserUpdate = (e: any) => {
      loadData();
    };
    window.addEventListener('dahamkke_user_updated', handleUserUpdate);
    return () => window.removeEventListener('dahamkke_user_updated', handleUserUpdate);
  }, []);

  const loadData = () => {
    const cur = getCurrentUser();
    setCurrentUser(cur);
    setAllUsers(getAllUsers());
  };

  const currentRank = getUserRank(currentUser);

  // Dynamic Leaderboard sorted by Points descending!
  const sortedLeaderboard = allUsers.map((user, index) => {
    const tier = getRankByPoints(user.points);
    return {
      rankNo: index + 1,
      name: user.name,
      points: user.points,
      tier: tier.name,
      tierGroup: tier.tierGroup,
      isUser: user.id === currentUser.id || (Boolean(user.email) && Boolean(currentUser.email) && user.email.toLowerCase() === currentUser.email.toLowerCase()),
    };
  });

  return (
    <div className="dashboard-container" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* 100% Fixed Left Sidebar Nav */}
      <SidebarNav />

      {/* 100% Fixed Main Page Container (Zero Page Scrolling) */}
      <main className="main-content" style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '28px 32px', backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', transition: 'background-color 0.2s ease' }}>
        {/* Fixed Title Header */}
        <div style={{ flexShrink: 0, marginBottom: '20px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '900', color: isDarkMode ? '#F1F5F9' : '#1E293B', marginBottom: '4px' }}>🏆 월간 랭크 & 학급 실시간 리더보드</h1>
          <p style={{ fontSize: '14px', color: isDarkMode ? '#94A3B8' : '#6B7280', margin: 0 }}>단원 학습 후 10문항 평가를 치르고 랭크와 순위를 올려보세요! (실시간 순위 반영)</p>
        </div>

        {/* Fixed Hero Current Rank Status Banner */}
        <div style={{ flexShrink: 0, background: isDarkMode ? '#1E293B' : currentRank.bgColor, border: `3px solid ${isDarkMode ? '#334155' : currentRank.color}`, padding: '20px 28px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', boxShadow: isDarkMode ? 'none' : 'var(--shadow-soft)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <RankSVGIcon
                tierGroup={currentRank.tierGroup as any}
                subTier={currentRank.subTier || '1'}
                size={84}
              />
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: isDarkMode ? '#94A3B8' : '#64748B' }}>시즌: 2026-07 | 사용자: {currentUser.name}</div>
              <h2 style={{ fontSize: '30px', fontWeight: '900', color: isDarkMode ? '#F1F5F9' : currentRank.color, margin: '2px 0' }}>{currentRank.name}</h2>
              <div style={{ fontSize: '15px', fontWeight: '800', color: isDarkMode ? '#F1F5F9' : '#0F172A' }}>누적 포인트: {currentUser.points} pt</div>
            </div>
          </div>

          <Link href="/quiz" style={{ backgroundColor: '#14B8A6', color: 'white', padding: '14px 24px', borderRadius: '16px', fontWeight: '900', fontSize: '15px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)' }}>
            📝 10문항 학습 성취도 평가 풀기 ➔
          </Link>
        </div>

        {/* Flexible Fixed Grid Container for Dual Cards */}
        <div style={{ flex: 1, height: 0, minHeight: 0, display: 'flex', gap: '24px' }}>
          {/* Dynamic Class Leaderboard Card with ONLY Inner List Scroll */}
          <div style={{ flex: 1, background: isDarkMode ? '#1E293B' : 'white', border: isDarkMode ? '2px solid #334155' : 'none', padding: '24px', borderRadius: '24px', boxShadow: isDarkMode ? 'none' : 'var(--shadow-soft)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
              <h3 style={{ fontSize: '19px', fontWeight: '800', margin: 0, color: isDarkMode ? '#F1F5F9' : '#0F172A' }}>🥇 학급 실시간 포인트 리더보드</h3>
            </div>

            {/* ONLY Inner Items List Scrolls! */}
            <div className="inner-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', paddingRight: '6px' }}>
              {sortedLeaderboard.map((item) => (
                <div
                  key={item.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 20px',
                    borderRadius: '18px',
                    backgroundColor: item.isUser ? (isDarkMode ? '#1E1B4B' : '#EFF6FF') : (isDarkMode ? '#111827' : '#F8FAFC'),
                    border: item.isUser ? '2.5px solid #3B82F6' : (isDarkMode ? '1.5px solid #334155' : '1px solid #E2E8F0'),
                    boxShadow: item.isUser && !isDarkMode ? '0 6px 16px rgba(59, 130, 246, 0.15)' : 'none',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontWeight: '900', fontSize: '17px', width: '65px', color: item.rankNo <= 3 ? '#D97706' : (isDarkMode ? '#94A3B8' : '#64748B') }}>
                    {item.rankNo === 1 ? '🥇 1위' : item.rankNo === 2 ? '🥈 2위' : item.rankNo === 3 ? '🥉 3위' : `${item.rankNo}위`}
                  </span>

                  {/* SVG Rank Icon */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    <RankSVGIcon
                      tierGroup={item.tierGroup as any}
                      subTier={item.tier.match(/\d$/)?.[0] || '1'}
                      size={64}
                    />
                    <div>
                      <span style={{ fontWeight: item.isUser ? '900' : '800', fontSize: '17px', color: item.isUser ? '#3B82F6' : (isDarkMode ? '#F1F5F9' : '#0F172A'), display: 'block' }}>
                        {item.name.replace(/[()]/g, '')} {item.isUser && '⭐️ (나)'}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                        티어: {item.tier}
                      </span>
                    </div>
                  </div>

                  <span style={{ fontWeight: '900', fontSize: '16px', color: isDarkMode ? '#F1F5F9' : '#0F172A' }}>
                    {item.points} pt <span style={{ fontSize: '12px', fontWeight: '700', color: isDarkMode ? '#94A3B8' : '#64748B' }}>({item.tier})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 13 Rank Tiers Guide Card with ONLY Inner List Scroll */}
          <div style={{ width: '380px', background: isDarkMode ? '#1E293B' : 'white', border: isDarkMode ? '2px solid #334155' : 'none', padding: '24px', borderRadius: '24px', boxShadow: isDarkMode ? 'none' : 'var(--shadow-soft)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
              <h3 style={{ fontSize: '19px', fontWeight: '800', margin: 0, color: isDarkMode ? '#F1F5F9' : '#0F172A' }}>📜 전체 13개 랭크 티어 안내</h3>
            </div>

            {/* ONLY Inner Items List Scrolls! */}
            <div className="inner-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '6px' }}>
              {RANK_TIERS.map((tier) => (
                <div key={tier.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '12px', borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #F1F5F9', flexShrink: 0 }}>
                  <RankSVGIcon tierGroup={tier.tierGroup as any} subTier={tier.subTier || '1'} size={46} />
                  <span style={{ fontWeight: '800', fontSize: '15px', color: tier.color, flex: 1, marginLeft: '12px' }}>{tier.name}</span>
                  <span style={{ fontSize: '12px', color: isDarkMode ? '#94A3B8' : '#64748B', fontWeight: '700' }}>{tier.minPoints} ~ {tier.maxPoints === Infinity ? 'MAX' : `${tier.maxPoints} pt`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
