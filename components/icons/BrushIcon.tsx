import React from 'react';

export const BrushIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M9.06 11.9 2 19v3h3l7.04-7.04c.39-.39.39-1.02 0-1.41l-1.59-1.59c-.39-.39-1.02-.39-1.41 0z" />
    <path d="m21.01 4.99-8.42 8.42" />
    <path d="M11.9 9.06 19 2" />
  </svg>
);