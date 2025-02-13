import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'default', 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-lg transition-colors';
  const variantClasses = {
    default: 'bg-primary text-white hover:bg-primary/90',
    outline: 'border border-border hover:bg-card-bg',
    ghost: 'hover:bg-card-bg'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
} 