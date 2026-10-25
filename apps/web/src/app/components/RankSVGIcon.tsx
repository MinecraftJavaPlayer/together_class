import React from 'react';

type TierGroup =
  | 'unranked'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'expert'
  | 'master'
  | 'grandmaster';

interface Props {
  tierGroup: TierGroup;
  subTier?: string; // '1' | '2' | '3' | 'MAX'
  size?: number;
}

/**
 * Flat SVG rank emblem.
 * Every tier GROUP has its own silhouette (sub-tiers 1~3 share the shape):
 *   Unranked    : white circular ring with "?"
 *   Bronze      : classic shield
 *   Silver      : hexagon
 *   Gold        : round medallion with crown
 *   Platinum    : octagon (mint)
 *   Diamond     : faceted gem
 *   Expert      : 8-point burst star (orange)
 *   Master      : crowned crest with wings
 *   Grandmaster : winged star with halo
 * Sub-tier is shown by the number badge and pips under the emblem.
 */
export function RankSVGIcon({ tierGroup, subTier = '1', size = 64 }: Props) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;

  // Unranked: White circular ring emblem
  if (tierGroup === 'unranked') {
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="unrankedWhiteGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>
          <filter id="unrankedWhiteGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={s * 0.05} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={cx} cy={cy} r={s * 0.38} stroke="rgba(0, 0, 0, 0.12)" strokeWidth={s * 0.12} fill="none" />
        <circle cx={cx} cy={cy} r={s * 0.38} stroke="url(#unrankedWhiteGrad)" strokeWidth={s * 0.1} fill="none" filter="url(#unrankedWhiteGlow)" />
        <circle
          cx={cx}
          cy={cy}
          r={s * 0.26}
          stroke="#CBD5E1"
          strokeWidth={s * 0.03}
          strokeDasharray={`${s * 0.08} ${s * 0.04}`}
          fill="rgba(255, 255, 255, 0.25)"
        />
        <text x={cx} y={cy + s * 0.11} textAnchor="middle" fontSize={s * 0.34} fontWeight="900" fill="#64748B">
          ?
        </text>
      </svg>
    );
  }

  const parsedSub = parseInt(subTier || '1', 10);
  const sub = Number.isNaN(parsedSub) ? 0 : Math.max(1, Math.min(3, parsedSub)); // 0 => MAX tiers (no number)

  const colors: Record<TierGroup, { main: string; light: string; dark: string; accent: string }> = {
    unranked:    { main: '#94A3B8', light: '#CBD5E1', dark: '#475569', accent: '#E2E8F0' },
    bronze:      { main: '#CD7F32', light: '#E8A265', dark: '#7A4D1D', accent: '#F5C88A' },
    silver:      { main: '#A8B2BD', light: '#D4DCE6', dark: '#5B6B7D', accent: '#F1F5F9' },
    gold:        { main: '#F4C542', light: '#FFE180', dark: '#B8860B', accent: '#FFF3C4' },
    platinum:    { main: '#34D399', light: '#A7F3D0', dark: '#047857', accent: '#ECFDF5' },
    diamond:     { main: '#38BDF8', light: '#A5E3FF', dark: '#0369A1', accent: '#E0F7FF' },
    expert:      { main: '#FB923C', light: '#FED7AA', dark: '#C2410C', accent: '#FFF7ED' },
    master:      { main: '#C084FC', light: '#E9D5FF', dark: '#6B21A8', accent: '#FAF5FF' },
    grandmaster: { main: '#FF0000', light: '#FF6666', dark: '#990000', accent: '#FFCCCC' },
  };
  const c = colors[tierGroup] || colors.bronze;
  const gradId = `rankGrad_${tierGroup}_${s}`;
  const glowId = `rankGlow_${tierGroup}_${s}`;
  const glowing = ['platinum', 'diamond', 'expert', 'master', 'grandmaster'].includes(tierGroup);

  const P = (x: number, y: number) => `${cx + s * x},${cy + s * y}`;
  const regularPolygon = (n: number, r: number, rotDeg: number, oy = 0) =>
    Array.from({ length: n }, (_, i) => {
      const a = ((i * 360) / n + rotDeg) * (Math.PI / 180);
      return `${cx + Math.cos(a) * s * r},${cy + s * oy + Math.sin(a) * s * r}`;
    }).join(' ');
  const starPoints = (n: number, rOuter: number, rInner: number, oy = 0) =>
    Array.from({ length: n * 2 }, (_, i) => {
      const a = ((i * 180) / n - 90) * (Math.PI / 180);
      const r = i % 2 === 0 ? rOuter : rInner;
      return `${cx + Math.cos(a) * s * r},${cy + s * oy + Math.sin(a) * s * r}`;
    }).join(' ');

  const baseProps = {
    fill: `url(#${gradId})`,
    stroke: c.dark,
    strokeWidth: s * 0.025,
    strokeLinejoin: 'round' as const,
    filter: glowing ? `url(#${glowId})` : undefined,
  };

  const renderShape = () => {
    switch (tierGroup) {
      case 'bronze':
        return (
          <>
            <path
              d={`M${P(0, -0.34)} L${P(0.26, -0.22)} L${P(0.28, 0.05)} L${P(0, 0.34)} L${P(-0.28, 0.05)} L${P(-0.26, -0.22)}Z`}
              {...baseProps}
            />
            <line x1={cx - s * 0.12} y1={cy} x2={cx + s * 0.12} y2={cy} stroke={c.dark} strokeWidth={s * 0.04} strokeLinecap="round" opacity={0.6} />
          </>
        );
      case 'silver':
        return (
          <>
            <polygon points={regularPolygon(6, 0.34, -90)} {...baseProps} />
            <polygon points={regularPolygon(6, 0.25, -90)} fill="none" stroke={c.dark} strokeWidth={s * 0.018} opacity={0.4} />
            <polygon points={starPoints(5, 0.12, 0.05, 0.01)} fill={c.dark} opacity={0.85} />
          </>
        );
      case 'gold':
        return (
          <>
            <circle cx={cx} cy={cy} r={s * 0.33} {...baseProps} />
            <circle cx={cx} cy={cy} r={s * 0.25} fill="none" stroke={c.dark} strokeWidth={s * 0.018} opacity={0.45} />
            <path
              d={`M${P(-0.15, 0.08)} L${P(-0.15, -0.08)} L${P(-0.075, -0.01)} L${P(0, -0.13)} L${P(0.075, -0.01)} L${P(0.15, -0.08)} L${P(0.15, 0.08)}Z`}
              fill={c.dark}
              opacity={0.85}
            />
          </>
        );
      case 'platinum':
        return (
          <>
            <polygon points={regularPolygon(8, 0.35, -90 + 22.5)} {...baseProps} />
            <polygon points={regularPolygon(8, 0.26, -90 + 22.5)} fill="none" stroke={c.dark} strokeWidth={s * 0.018} opacity={0.4} />
            <polygon points={regularPolygon(4, 0.14, -90)} fill={c.accent} stroke={c.dark} strokeWidth={s * 0.02} />
            <polygon points={regularPolygon(4, 0.06, -90)} fill={c.dark} opacity={0.7} />
          </>
        );
      case 'diamond':
        return (
          <>
            <polygon points={`${P(-0.2, -0.26)} ${P(0.2, -0.26)} ${P(0.34, -0.1)} ${P(0, 0.36)} ${P(-0.34, -0.1)}`} {...baseProps} />
            {/* facets */}
            <polyline points={`${P(-0.34, -0.1)} ${P(0.34, -0.1)}`} stroke={c.dark} strokeWidth={s * 0.016} opacity={0.5} />
            <polyline points={`${P(-0.2, -0.26)} ${P(-0.1, -0.1)} ${P(0, -0.26)} ${P(0.1, -0.1)} ${P(0.2, -0.26)}`} fill="none" stroke={c.dark} strokeWidth={s * 0.016} opacity={0.5} />
            <polyline points={`${P(-0.1, -0.1)} ${P(0, 0.36)} ${P(0.1, -0.1)}`} fill="none" stroke={c.dark} strokeWidth={s * 0.016} opacity={0.5} />
            <polygon points={`${P(-0.06, -0.22)} ${P(0.02, -0.22)} ${P(-0.03, -0.14)}`} fill={c.accent} opacity={0.9} />
          </>
        );
      case 'expert':
        return (
          <>
            <polygon points={starPoints(8, 0.38, 0.26)} {...baseProps} />
            <circle cx={cx} cy={cy} r={s * 0.17} fill={c.accent} stroke={c.dark} strokeWidth={s * 0.02} />
            {/* flame mark */}
            <path
              d={`M${P(0, -0.12)} C${P(0.09, -0.03)} ${P(0.08, 0.1)} ${P(0, 0.11)} C${P(-0.08, 0.1)} ${P(-0.09, 0.01)} ${P(-0.03, -0.04)} C${P(-0.02, 0.02)} ${P(0.01, 0.03)} ${P(0, -0.12)}Z`}
              fill={c.dark}
              opacity={0.9}
            />
          </>
        );
      case 'master':
        return (
          <>
            {/* wings */}
            <path d={`M${P(-0.24, 0.06)} Q${P(-0.46, -0.08)} ${P(-0.3, -0.22)} Q${P(-0.34, -0.04)} ${P(-0.2, 0.12)}Z`} fill={c.main} opacity={0.75} />
            <path d={`M${P(0.24, 0.06)} Q${P(0.46, -0.08)} ${P(0.3, -0.22)} Q${P(0.34, -0.04)} ${P(0.2, 0.12)}Z`} fill={c.main} opacity={0.75} />
            {/* crest */}
            <path d={`M${P(-0.22, -0.16)} L${P(0.22, -0.16)} L${P(0.22, 0.1)} Q${P(0.22, 0.28)} ${P(0, 0.36)} Q${P(-0.22, 0.28)} ${P(-0.22, 0.1)}Z`} {...baseProps} />
            {/* crown on top */}
            <path
              d={`M${P(-0.2, -0.16)} L${P(-0.2, -0.34)} L${P(-0.1, -0.24)} L${P(0, -0.38)} L${P(0.1, -0.24)} L${P(0.2, -0.34)} L${P(0.2, -0.16)}Z`}
              fill={c.dark}
              stroke={c.dark}
              strokeWidth={s * 0.015}
              strokeLinejoin="round"
            />
            <circle cx={cx} cy={cy - s * 0.38} r={s * 0.03} fill={c.accent} />
            <polygon points={regularPolygon(4, 0.09, -90, 0.07)} fill={c.accent} stroke={c.dark} strokeWidth={s * 0.018} />
          </>
        );
      case 'grandmaster':
        return (
          <>
            <circle cx={cx} cy={cy} r={s * 0.46} stroke={c.main} strokeWidth={s * 0.025} strokeDasharray={`${s * 0.08} ${s * 0.04}`} opacity={0.55} />
            <path d={`M${P(-0.18, 0.04)} Q${P(-0.48, -0.12)} ${P(-0.36, -0.3)} Q${P(-0.34, -0.08)} ${P(-0.14, 0.14)}Z`} fill={c.main} opacity={0.75} />
            <path d={`M${P(0.18, 0.04)} Q${P(0.48, -0.12)} ${P(0.36, -0.3)} Q${P(0.34, -0.08)} ${P(0.14, 0.14)}Z`} fill={c.main} opacity={0.75} />
            <polygon points={starPoints(5, 0.36, 0.16, 0.02)} {...baseProps} />
            <polygon points={starPoints(5, 0.14, 0.06, 0.03)} fill={c.accent} opacity={0.9} />
          </>
        );
      default:
        return <circle cx={cx} cy={cy} r={s * 0.33} {...baseProps} />;
    }
  };

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c.light} />
          <stop offset="100%" stopColor={c.main} />
        </linearGradient>
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={s * 0.05} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {renderShape()}

      {/* Sub-tier number badge (hidden for MAX tiers like Master / Grandmaster) */}
      {sub > 0 && (
        <>
          <circle cx={cx + s * 0.27} cy={cy + s * 0.29} r={s * 0.1} fill={c.dark} stroke="#FFFFFF" strokeWidth={s * 0.015} />
          <text x={cx + s * 0.27} y={cy + s * 0.33} textAnchor="middle" fontSize={s * 0.12} fontWeight="bold" fill="white">
            {sub}
          </text>
        </>
      )}
    </svg>
  );
}
