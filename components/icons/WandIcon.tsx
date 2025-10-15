
import React from 'react';

export const WandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M15 4V2" />
    <path d="M15 10v-2" />
    <path d="M15 16v-2" />
    <path d="M12.5 7.5L10 5" />
    <path d="M5 21L19 7" />
    <path d="M9 3h6" />
  </svg>
);
