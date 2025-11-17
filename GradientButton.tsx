import React, { FC } from 'react';

const GradientButton: FC<{ children: React.ReactNode; onClick?: (e: React.MouseEvent) => void; href?: string; download?: boolean | string, className?: string; as?: 'button' | 'a'; type?: 'button' | 'submit', disabled?: boolean }> = ({ children, onClick, href, download = false, className = '', as = 'button', type = 'button', disabled = false }) => {
  // FIX: Add `disabled` prop and conditional classes for disabled state.
  const commonClasses = `
    inline-flex items-center justify-center px-8 py-3 font-bold text-white 
    bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full 
    shadow-lg transform transition-all duration-300 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:scale-105'}
    ${className}
  `;

  if (as === 'a') {
    return (
        <a href={href} download={download} className={commonClasses} target="_blank" rel="noopener noreferrer" onClick={onClick}>
            {children}
        </a>
    );
  }

  return (
    <button onClick={onClick} className={commonClasses} type={type} disabled={disabled}>
      {children}
    </button>
  );
};

export default GradientButton;
