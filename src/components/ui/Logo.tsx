import React from 'react';

// ----------------------------------------------------------------------
// INSTRUCTIONS:
// To use your own logo:
// 1. Place your image file (e.g., 'logo.png') in your project folder.
// 2. Set the variable below to your file path.
//    Example: const CUSTOM_LOGO_URL = "https://your-school-website.com/logo.png";
// ----------------------------------------------------------------------
const DEFAULT_LOGO_URL = "https://i.imgur.com/8YQZ6Lk.png"; // IIS Benin Logo

interface LogoProps {
  className?: string;
  src?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-12 h-12", src }) => {
  // Priority: 1. Dynamic src (from Admin upload), 2. Hardcoded Default
  const logoSrc = src || DEFAULT_LOGO_URL;

  if (logoSrc) {
    return (
      <img
        src={logoSrc}
        alt="Indian International School Benin - Official Logo"
        className={`${className} object-contain`}
        loading="lazy"
      />
    );
  }

  // Fallback: Default SVG Logo
  return (
    <div className={`${className} relative inline-flex items-center justify-center select-none`}>
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md filter" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3655" />
            <stop offset="100%" stopColor="#36609e" />
          </linearGradient>
        </defs>

        {/* Outer Ring */}
        <circle cx="60" cy="60" r="58" fill="#ffffff" stroke="url(#borderGrad)" strokeWidth="4" />

        {/* Inner Decoration */}
        <circle cx="60" cy="60" r="44" fill="none" stroke="#cbd5e1" strokeWidth="1" />

        {/* Text Paths */}
        <path id="curveTop" d="M 15,60 A 45,45 0 1,1 105,60" fill="none" />

        <text fontSize="8" fontWeight="800" fill="#1e3655" fontFamily="serif" letterSpacing="0.2">
          <textPath href="#curveTop" startOffset="50%" textAnchor="middle" alignmentBaseline="middle">
            INDIAN INTERNATIONAL SCHOOL
          </textPath>
        </text>

        {/* Bottom Text manually positioned for stability */}
        <text x="60" y="98" fontSize="9" fontWeight="900" fill="#1e3655" fontFamily="serif" textAnchor="middle">BENIN</text>

        {/* Chakra / Center Symbol */}
        <g transform="translate(60,60)">
          <circle r="24" fill="#ebf5ff" opacity="0.5" />
          <circle r="22" fill="none" stroke="#3b82f6" strokeWidth="1" />
          <circle r="3" fill="#1e3655" />
          {[...Array(24)].map((_, i) => (
            <line key={i} x1="0" y1="0" x2="0" y2="-22" stroke="#3b82f6" strokeWidth="0.5" transform={`rotate(${i * 15})`} />
          ))}
        </g>

        {/* Side Stars */}
        <text x="12" y="75" fontSize="10" fill="#f59e0b">★</text>
        <text x="100" y="75" fontSize="10" fill="#f59e0b">★</text>
      </svg>
    </div>
  );
};