import React from 'react';

interface Props {
  size?: number;
  showText?: boolean;
}

export function DamiLogoIcon({ size = 44, showText = true }: Props) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
      {/* 3D Cute AI Robot Mascot SVG Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0px 6px 12px rgba(20, 184, 166, 0.25))',
          transform: 'translateY(-1px)',
        }}
      >
        <defs>
          {/* Main Body Gradient */}
          <linearGradient id="damiHeadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>

          {/* Screen Faceplate Gradient */}
          <linearGradient id="damiFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Primary Teal Brand Accent Gradient */}
          <linearGradient id="damiTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2DD4BF" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>

          {/* Glowing Eye Gradient */}
          <linearGradient id="damiEyeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          {/* Antenna Glow */}
          <linearGradient id="antennaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Antenna Bulb Top Glow */}
        <circle cx="50" cy="10" r="7" fill="url(#antennaGrad)" />
        <line x1="50" y1="17" x2="50" y2="28" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />

        {/* Ear Antennas / Headphones */}
        <rect x="10" y="45" width="8" height="20" rx="4" fill="url(#damiTealGrad)" />
        <rect x="82" y="45" width="8" height="20" rx="4" fill="url(#damiTealGrad)" />

        {/* Outer Robot Head Base */}
        <rect x="16" y="26" width="68" height="60" rx="24" fill="url(#damiHeadGrad)" stroke="#CBD5E1" strokeWidth="2.5" />

        {/* Inner Screen Faceplate */}
        <rect x="24" y="34" width="52" height="42" rx="16" fill="url(#damiFaceGrad)" />

        {/* Left Glowing Eye */}
        <ellipse cx="40" cy="52" rx="6" ry="9" fill="url(#damiEyeGrad)" />
        <circle cx="38" cy="49" r="2.5" fill="#FFFFFF" />

        {/* Right Glowing Eye */}
        <ellipse cx="60" cy="52" rx="6" ry="9" fill="url(#damiEyeGrad)" />
        <circle cx="58" cy="49" r="2.5" fill="#FFFFFF" />

        {/* Friendly Cute Mouth Curve */}
        <path d="M 44 64 Q 50 69 56 64" fill="none" stroke="#2DD4BF" strokeWidth="3" strokeLinecap="round" />

        {/* Cheeks Glow Accent */}
        <circle cx="33" cy="58" r="3" fill="#F472B6" opacity="0.6" />
        <circle cx="67" cy="58" r="3" fill="#F472B6" opacity="0.6" />
      </svg>

      {/* Brand Title Text */}
      {showText && (
        <span
          style={{
            fontSize: '22px',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #0D9488, #2563EB)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
          }}
        >
          다함께교실
        </span>
      )}
    </div>
  );
}
