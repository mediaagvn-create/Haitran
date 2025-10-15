import React from 'react';

export const UpscaleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M12 5 8 9" />
    <path d="M12 5v14" />
    <path d="m16 9-4-4" />
    <path d="M4 15h16" />
  </svg>
);
