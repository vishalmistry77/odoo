import React from 'react';

/**
 * RentFlow-style logo: circular icon (three arrows + building shapes) + "RentFlow" text.
 * Use className to set color (e.g. text-white for dark bg, text-blue-900 for light bg).
 */
const Logo = ({ className = 'text-[#1e3a5f]', size = 'md', showText = true }) => {
    const sizes = { sm: 28, md: 36, lg: 48 };
    const iconSize = sizes[size] || sizes.md;
    const textSizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' };

    return (
        <div className={`inline-flex items-center gap-2.5 ${className}`}>
            <svg
                width={iconSize}
                height={iconSize}
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
                aria-hidden
            >
                {/* Circular ring */}
                <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="2.2" fill="none" />
                {/* Three curved arrow segments (recycling loop) */}
                <path d="M24 8v10l6-6-2-2-4 2z" fill="currentColor" />
                <path d="M38 24h-10l6 6 2-2-2-4z" fill="currentColor" />
                <path d="M24 40v-10l-6 6 2 2 4-2z" fill="currentColor" />
                <path d="M10 24h10l-6-6-2 2 2 4z" fill="currentColor" />
                {/* Building (house with roof) in top-right */}
                <path d="M30 16l-4-4-4 4v6h8V16z" stroke="currentColor" strokeWidth="1" fill="none" />
                <rect x="27" y="18" width="1.5" height="1.5" fill="currentColor" />
                <rect x="30.5" y="18" width="1.5" height="1.5" fill="currentColor" />
                {/* Small building bottom-left */}
                <rect x="14" y="30" width="8" height="8" stroke="currentColor" strokeWidth="1" fill="none" />
                <rect x="16" y="32" width="2" height="2" fill="currentColor" />
                <rect x="19" y="32" width="2" height="2" fill="currentColor" />
            </svg>
            {showText && (
                <span className={`font-bold tracking-tight ${textSizes[size]}`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    RentFlow
                </span>
            )}
        </div>
    );
};

export default Logo;
