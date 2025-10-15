
import React from 'react';

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children, icon }) => {
  const baseClasses = "flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors duration-200";
  const activeClasses = "bg-blue-600 text-white shadow-md";
  const inactiveClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
    </button>
  );
};

export default TabButton;
