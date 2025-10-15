import React from 'react';

export const TransparencyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width="12" height="12" fill="#E5E7EB"/>
    <rect x="12" width="12" height="12" fill="white"/>
    <rect y="12" width="12" height="12" fill="white"/>
    <rect x="12" y="12" width="12" height="12" fill="#E5E7EB"/>
    <line x1="21" y1="3" x2="3" y2="21" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);
