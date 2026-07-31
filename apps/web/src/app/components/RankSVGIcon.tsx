import React from 'react';

type TierGroup = 'bronze' | 'silver' | 'gold' | 'diamond' | 'master';

interface Props {
  tierGroup: TierGroup;
  subTier?: string; // '1' | '2' | '3'
  size?: number;
}

/**
 * Simple flat SVG rank icon. Each tier adds more decorations.
 * Bronze 1: plain shield
 * Bronze 2: shield + line
 * Bronze 3: shield + line + wings
 * Silver 1: star shield
 * Silver 2: star shield + wings
 * Silver 3: star shield + wings + small stars
 * Gold 1: star shield + wings + glow
 * Gold 2: star shield + wings + glow + crown
 * Gold 3: star shield + wings + glow + crown + laurel
 * Diamond 1~3: gem on top of shield
 * Master: full emblem with crown + wings + gem
 */
export function RankSVGIcon({ tierGroup, subTier = '1', size = 64 }: Props) {
  const parsedSub = parseInt(subTier || '1', 10);
  const sub = Number.isNaN(parsedSub) ? 1 : parsedSub;

  const colors: Record<TierGroup, { main: string; light: string; dark: string; accent: string }> = {
    bronze:  { main: '#CD7F32', light: '#E8A265', dark: '#7A4D1D', accent: '#F5C88A' },
    silver:  { main: '#A8B2BD', light: '#D4DCE6', dark: '#6B7B8D', accent: '#E2EAF0' },
    gold:    { main: '#F4C542', light: '#FFE180', dark: '#B8860B', accent: '#FFF3C4' },
    diamond: { main: '#38BDF8', light: '#A5E3FF', dark: '#0369A1', accent: '#E0F7FF' },
    master:  { main: '#C084FC', light: '#E9D5FF', dark: '#6B21A8', accent: '#FAF5FF' },
  };
  const c = colors[tierGroup];

  // Decoration levels: bronze=1, silver=2, gold=3, diamond=4, master=5
  const tierDecoration: Record<TierGroup, number> = {
    bronze: 1, silver: 2, gold: 3, diamond: 4, master: 5,
  };
  const decorLevel = tierDecoration[tierGroup] + (sub - 1);

  const s = size;
  const cx = s / 2;
  const cy = s / 2;

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`shieldGrad_${tierGroup}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c.light} />
          <stop offset="100%" stopColor={c.main} />
        </linearGradient>

        {/* Glow for diamond+ */}
        <filter id={`glow_${tierGroup}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={s * 0.06} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* DECORATION LEVEL 5+: Outer halo ring for master */}
      {decorLevel >= 7 && (
        <circle cx={cx} cy={cy} r={s * 0.46} stroke={c.main} strokeWidth={s * 0.025} strokeDasharray={`${s * 0.08} ${s * 0.04}`} opacity={0.5} />
      )}

      {/* DECORATION LEVEL 6+: Wings (diamond 3, master) */}
      {decorLevel >= 6 && (
        <>
          {/* Left wing */}
          <path d={`M${cx - s * 0.27} ${cy + s * 0.05} Q${cx - s * 0.44} ${cy - s * 0.1} ${cx - s * 0.22} ${cy - s * 0.18} Q${cx - s * 0.32} ${cy - s * 0.02} ${cx - s * 0.22} ${cy + s * 0.08}Z`}
            fill={c.main} opacity={0.75} />
          {/* Right wing */}
          <path d={`M${cx + s * 0.27} ${cy + s * 0.05} Q${cx + s * 0.44} ${cy - s * 0.1} ${cx + s * 0.22} ${cy - s * 0.18} Q${cx + s * 0.32} ${cy - s * 0.02} ${cx + s * 0.22} ${cy + s * 0.08}Z`}
            fill={c.main} opacity={0.75} />
        </>
      )}

      {/* DECORATION LEVEL 5+: Small wings (gold 3, diamond) */}
      {decorLevel >= 5 && decorLevel < 6 && (
        <>
          <path d={`M${cx - s * 0.22} ${cy + s * 0.06} Q${cx - s * 0.36} ${cy - s * 0.04} ${cx - s * 0.18} ${cy - s * 0.1} Q${cx - s * 0.26} ${cy + s * 0.01} ${cx - s * 0.18} ${cy + s * 0.1}Z`}
            fill={c.main} opacity={0.65} />
          <path d={`M${cx + s * 0.22} ${cy + s * 0.06} Q${cx + s * 0.36} ${cy - s * 0.04} ${cx + s * 0.18} ${cy - s * 0.1} Q${cx + s * 0.26} ${cy + s * 0.01} ${cx + s * 0.18} ${cy + s * 0.1}Z`}
            fill={c.main} opacity={0.65} />
        </>
      )}

      {/* Shield Base */}
      <path
        d={`M${cx} ${cy - s * 0.34} L${cx + s * 0.26} ${cy - s * 0.22} L${cx + s * 0.28} ${cy + s * 0.05} L${cx} ${cy + s * 0.36} L${cx - s * 0.28} ${cy + s * 0.05} L${cx - s * 0.26} ${cy - s * 0.22}Z`}
        fill={`url(#shieldGrad_${tierGroup})`}
        stroke={c.dark}
        strokeWidth={s * 0.025}
        filter={decorLevel >= 4 ? `url(#glow_${tierGroup})` : undefined}
      />

      {/* Shield inner border */}
      <path
        d={`M${cx} ${cy - s * 0.26} L${cx + s * 0.2} ${cy - s * 0.16} L${cx + s * 0.21} ${cy + s * 0.04} L${cx} ${cy + s * 0.28} L${cx - s * 0.21} ${cy + s * 0.04} L${cx - s * 0.2} ${cy - s * 0.16}Z`}
        fill="none"
        stroke={c.dark}
        strokeWidth={s * 0.018}
        opacity={0.4}
      />

      {/* DECORATION LEVEL 2+: Center star (silver+) */}
      {decorLevel >= 2 && (
        <polygon
          points={[0,1,2,3,4].map(i => {
            const angle = (i * 72 - 90) * Math.PI / 180;
            const r = i % 2 === 0 ? s * 0.1 : s * 0.05;
            return `${cx + Math.cos(angle) * r},${cy + s * 0.04 + Math.sin(angle) * r}`;
          }).join(' ')}
          fill={c.dark}
          opacity={0.85}
        />
      )}

      {/* DECORATION LEVEL 1: Plain horizontal line (bronze 1) */}
      {decorLevel === 1 && (
        <line x1={cx - s * 0.14} y1={cy + s * 0.04} x2={cx + s * 0.14} y2={cy + s * 0.04}
          stroke={c.dark} strokeWidth={s * 0.04} strokeLinecap="round" opacity={0.6} />
      )}

      {/* DECORATION LEVEL 3+: Crown (gold+) */}
      {decorLevel >= 3 && (
        <path
          d={`M${cx - s * 0.14} ${cy - s * 0.08} L${cx - s * 0.14} ${cy - s * 0.17} L${cx - s * 0.07} ${cy - s * 0.12} L${cx} ${cy - s * 0.2} L${cx + s * 0.07} ${cy - s * 0.12} L${cx + s * 0.14} ${cy - s * 0.17} L${cx + s * 0.14} ${cy - s * 0.08}Z`}
          fill={c.dark}
          opacity={0.85}
        />
      )}

      {/* DECORATION LEVEL 4+: Gem on top (diamond+) */}
      {decorLevel >= 4 && (
        <polygon
          points={`${cx},${cy - s * 0.32} ${cx + s * 0.07},${cy - s * 0.24} ${cx},${cy - s * 0.17} ${cx - s * 0.07},${cy - s * 0.24}`}
          fill={c.accent}
          stroke={c.dark}
          strokeWidth={s * 0.018}
        />
      )}

      {/* DECORATION LEVEL 3+: Small sparkle dots (gold 2+) */}
      {decorLevel >= 3 && (
        <>
          <circle cx={cx - s * 0.26} cy={cy - s * 0.04} r={s * 0.025} fill={c.accent} opacity={0.8} />
          <circle cx={cx + s * 0.26} cy={cy - s * 0.04} r={s * 0.025} fill={c.accent} opacity={0.8} />
        </>
      )}

      {/* DECORATION LEVEL 7+: Master extra — small gems at sides */}
      {decorLevel >= 7 && (
        <>
          <polygon
            points={`${cx - s * 0.32},${cy - s * 0.1} ${cx - s * 0.26},${cy - s * 0.05} ${cx - s * 0.32},${cy} ${cx - s * 0.38},${cy - s * 0.05}`}
            fill={c.accent} stroke={c.dark} strokeWidth={s * 0.015} />
          <polygon
            points={`${cx + s * 0.32},${cy - s * 0.1} ${cx + s * 0.26},${cy - s * 0.05} ${cx + s * 0.32},${cy} ${cx + s * 0.38},${cy - s * 0.05}`}
            fill={c.accent} stroke={c.dark} strokeWidth={s * 0.015} />
        </>
      )}

      {/* Sub-tier number badge at bottom right */}
      <circle cx={cx + s * 0.24} cy={cy + s * 0.28} r={s * 0.1} fill={c.dark} />
      <text
        x={cx + s * 0.24}
        y={cy + s * 0.28 + s * 0.04}
        textAnchor="middle"
        fontSize={s * 0.12}
        fontWeight="bold"
        fill="white"
      >
        {sub}
      </text>
    </svg>
  );
}
