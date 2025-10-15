import React from 'react';

export const PurifyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m12 14-2-2 2-2 2 2-2 2z" />
    <path d="M12 8V6" />
    <path d="M12 18v-2" />
    <path d="m15 11-1.4-1.4" />
    <path d="m10.4 14.4-1.4-1.4" />
    <path d="M18 10h-2" />
    <path d="M8 10H6" />
  </svg>
);
