import React from 'react';

export const BackgroundIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="8" r="3.5" />
    <path d="M12 11.5A6.5 6.5 0 0 0 5.5 18" />
    <path d="M18.5 18a6.5 6.5 0 0 0-2.2-4.8" />
    <path d="M2 14.3a9 9 0 0 0 2.2 4.4" />
    <path d="M19.8 18.7a9 9 0 0 0 2.2-4.4" />
    <path d="M12 21v1" />
    <path d="M12 2v1" />
    <path d="M4.2 18.5a9 9 0 0 0-2.1-4.2" />
    <path d="M21.9 14.3a9 9 0 0 0-2.1 4.2" />
    <path d="M4.2 5.5A9 9 0 0 1 6.3 3" />
    <path d="M17.7 3a9 9 0 0 1 2.1 2.5" />
  </svg>
);