import React from 'react';

/**
 * Skip to Main Content Link
 * WCAG 2.1 AA - Bypass Blocks
 * Allows keyboard users to skip navigation
 */
export const SkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-6 focus:py-3 focus:bg-brand-900 focus:text-white focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-4 focus:ring-brand-300 font-bold text-sm transition-all"
      aria-label="Skip to main content"
    >
      Skip to Main Content
    </a>
  );
};
