'use client';

import React, { useState, useEffect } from 'react';
import {
  RankTier,
  RANK_TIERS,
  UNRANKED_TIER,
  playDemoteSound,
  playPromoteSound,
} from '@dahamkke/shared';
import { RankSVGIcon } from './RankSVGIcon';

export interface RankResultOverlayProps {
  isPlacement: boolean;
  prevRank: RankTier;
  newRank: RankTier;
  pointsDelta: number;
  totalPoints: number;
  matchTitle?: string;
  matchDetails?: React.ReactNode;
  onContinue: () => void;
  continueText?: string;
  onRetry?: () => void;
  retryText?: string;
}

export function RankResultOverlay({
  isPlacement,
  prevRank,
  newRank,
  pointsDelta,
  totalPoints,
  matchTitle,
  matchDetails,
  onContinue,
  continueText = '계속하기',
  onRetry,
  retryText = '다시 도전',
}: RankResultOverlayProps) {
  // Stages:
  // 'initial'       : 0.0s ~ 1.0s (Show prev/unranked icon, delta if not placement, NO bar)
  // 'rank_revealed' : 1.0s ~ 2.0s (Show new/placed rank icon, play sound, NO bar)
  // 'bar_revealed'  : 2.0s+       (Show progress bar and action buttons)
  const [stage, setStage] = useState<'initial' | 'rank_revealed' | 'bar_revealed'>('initial');

  // Determine promotion/demotion
  const prevIdx = RANK_TIERS.findIndex((r) => r.id === prevRank?.id);
  const newIdx = RANK_TIERS.findIndex((r) => r.id === newRank?.id);

  const isPromoted = !isPlacement && prevIdx !== -1 && newIdx !== -1 && newIdx > prevIdx;
  const isDemoted = !isPlacement && prevIdx !== -1 && newIdx !== -1 && newIdx < prevIdx;

  useEffect(() => {
    // Stage 1: Reveal Rank at 1.0s (or 1.1s for normal)
    const timer1 = setTimeout(() => {
      setStage('rank_revealed');

      if (isPlacement) {
        // 배치 완료 시 두 번째 효과음
        playPromoteSound();
      } else if (isPromoted) {
        // 승급 시 두 번째 효과음
        playPromoteSound();
      } else if (isDemoted) {
        // 강등 시 첫 번째 효과음
        playDemoteSound();
      }
    }, isPlacement ? 1000 : 1100);

    // Stage 2: Reveal Progress Bar at ~2.0s
    const timer2 = setTimeout(() => {
      setStage('bar_revealed');
    }, isPlacement ? 2000 : 2100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isPlacement, isPromoted, isDemoted]);

  // Active icon and title to display based on stage
  let displayRank = prevRank;
  let statusBadge: { text: string; bg: string; color: string } | null = null;

  if (isPlacement) {
    if (stage === 'initial') {
      displayRank = UNRANKED_TIER;
    } else {
      displayRank = newRank;
      statusBadge = { text: '🎯 배치 완료', bg: '#065F46', color: '#34D399' };
    }
  } else {
    if (stage === 'initial') {
      displayRank = prevRank;
    } else {
      displayRank = newRank;
      if (isPromoted) {
        statusBadge = { text: '🔺 랭크 승급!', bg: '#065F46', color: '#34D399' };
      } else if (isDemoted) {
        statusBadge = { text: '🔻 랭크 강등', bg: '#7F1D1D', color: '#F87171' };
      }
    }
  }

  // Next rank calculation for progress bar
  const userRankIdx = RANK_TIERS.findIndex((r) => r.id === newRank.id);
  const nextRank = RANK_TIERS[userRankIdx + 1] || newRank;
  const minP = newRank.minPoints <= 0 ? 0 : newRank.minPoints;
  const maxP = nextRank.minPoints === Infinity ? newRank.maxPoints : nextRank.minPoints;
  const rangeP = Math.max(1, maxP - minP);
  const pointsInTier = Math.max(0, totalPoints - minP);
  const progressPercent = nextRank.minPoints === Infinity ? 100 : Math.min(100, Math.max(0, Math.round((pointsInTier / rangeP) * 100)));

  // Delta color and text
  const isPositive = pointsDelta > 0;
  const isNegative = pointsDelta < 0;
  const deltaColor = isPositive ? '#34D399' : isNegative ? '#F87171' : '#FBBF24';
  const deltaFormatted = isPositive ? `+${pointsDelta} pt` : isNegative ? `${pointsDelta} pt` : `+0 pt`;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(10, 14, 23, 0.94)',
        backdropFilter: 'blur(16px)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '680px',
          textAlign: 'center',
        }}
      >
        {/* Match Header Title */}
        {matchTitle && (
          <div
            style={{
              fontSize: '14px',
              fontWeight: '800',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '16px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            {matchTitle}
          </div>
        )}

        {/* 1. Large Emblem Icon */}
        <div
          style={{
            marginBottom: '14px',
            transform: stage === 'rank_revealed' || stage === 'bar_revealed' ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            filter: `drop-shadow(0 0 28px ${displayRank.color || '#CBD5E1'}90)`,
          }}
        >
          <RankSVGIcon
            tierGroup={displayRank.tierGroup as any}
            subTier={displayRank.subTier || '1'}
            size={76}
          />
        </div>

        {/* Status Badge (승급 / 강등 / 배치 완료) */}
        {statusBadge && (
          <div
            style={{
              backgroundColor: statusBadge.bg,
              color: statusBadge.color,
              padding: '6px 16px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: '900',
              marginBottom: '10px',
              boxShadow: `0 0 16px ${statusBadge.color}60`,
              animation: 'bounceIn 0.5s ease',
            }}
          >
            {statusBadge.text}
          </div>
        )}

        {/* 2. Large Rank Name */}
        <h1
          style={{
            fontSize: '38px',
            fontWeight: '900',
            color: '#FFFFFF',
            margin: '0 0 16px 0',
            letterSpacing: '-0.5px',
            textShadow: `0 0 20px ${displayRank.color || '#FFF'}40`,
            transition: 'all 0.3s ease',
          }}
        >
          {displayRank.name}
        </h1>

        {/* 3. Points Delta (변화량) — Hidden during placement as requested! */}
        {!isPlacement && (
          <div
            style={{
              fontSize: '68px',
              fontWeight: '900',
              color: deltaColor,
              letterSpacing: '-2px',
              lineHeight: '1',
              marginBottom: '20px',
              textShadow: `0 0 32px ${deltaColor}70`,
              animation: 'fadeInUp 0.4s ease',
            }}
          >
            {deltaFormatted}
          </div>
        )}

        {/* 4. Progress Bar Track — Revealed ONLY on stage 'bar_revealed'! */}
        {stage === 'bar_revealed' ? (
          <div
            style={{
              width: '100%',
              marginTop: isPlacement ? '12px' : '6px',
              marginBottom: '28px',
              animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            {/* Small tier label & points ratio */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '14px',
                fontWeight: '800',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '8px',
                padding: '0 4px',
              }}
            >
              <span>{newRank.name}</span>
              <span>{totalPoints} / {nextRank.minPoints === Infinity ? 'MAX' : nextRank.minPoints} pt</span>
            </div>

            {/* Progress Bar with Left/Right Emblems */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                width: '100%',
              }}
            >
              {/* Current Rank Emblem */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '65px' }}>
                <RankSVGIcon tierGroup={newRank.tierGroup as any} subTier={newRank.subTier || '1'} size={38} />
                <span style={{ fontSize: '11px', fontWeight: '800', color: newRank.color, whiteSpace: 'nowrap' }}>{newRank.name}</span>
              </div>

              {/* Center Track */}
              <div
                style={{
                  flex: 1,
                  height: '24px',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                  padding: '3px',
                  position: 'relative',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    background: `linear-gradient(90deg, ${newRank.color}, ${nextRank.color})`,
                    borderRadius: '9999px',
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `0 0 16px ${newRank.color}`,
                  }}
                />
              </div>

              {/* Next Rank Emblem */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '65px' }}>
                <RankSVGIcon tierGroup={nextRank.tierGroup as any} subTier={nextRank.subTier || '1'} size={38} />
                <span style={{ fontSize: '11px', fontWeight: '800', color: nextRank.color, whiteSpace: 'nowrap' }}>{nextRank.name}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Empty placeholder to prevent jumping before bar appears */
          <div style={{ height: '80px' }} />
        )}

        {/* 5. Match details summary */}
        {matchDetails && (
          <div
            style={{
              marginBottom: '28px',
              fontSize: '14px',
              fontWeight: '700',
              color: 'rgba(255, 255, 255, 0.75)',
            }}
          >
            {matchDetails}
          </div>
        )}

        {/* 6. Action Buttons — Enabled & animated smoothly */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
            justifyContent: 'center',
            width: '100%',
            opacity: stage === 'bar_revealed' ? 1 : 0.6,
            transition: 'opacity 0.4s ease',
          }}
        >
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                padding: '14px 28px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1.5px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              🔄 {retryText}
            </button>
          )}

          <button
            onClick={onContinue}
            style={{
              padding: '14px 36px',
              borderRadius: '16px',
              backgroundColor: newRank.color || '#3B82F6',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: `0 6px 20px ${newRank.color || '#3B82F6'}50`,
              transition: 'all 0.15s ease',
            }}
          >
            {continueText} ➔
          </button>
        </div>
      </div>
    </div>
  );
}
