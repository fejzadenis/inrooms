import React from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
  glowColor?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  glowColor = 'rgba(0, 178, 255, 0.5)',
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium transition-all duration-300 flex items-center justify-center relative overflow-hidden';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 disabled:opacity-50',
    secondary: 'bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:opacity-90 disabled:opacity-50',
    outline: 'border border-gray-700 text-gray-300 hover:bg-gray-800 disabled:bg-gray-900 disabled:text-gray-600',
    glass: 'backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-lg'
  };

  const buttonContent = (
    <>
      {isLoading ? (
        <>
          <LoadingSpinner className="mr-2" />
          Loading...
        </>
      ) : (
        children
      )}
    </>
  );

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {variant === 'primary' && (
        <span 
          className="absolute inset-0 w-full h-full"
          style={{
            background: `radial-gradient(circle at var(--x, 50%) var(--y, 50%), ${glowColor} 0%, transparent 50%)`,
            opacity: 0,
            transition: 'opacity 0.3s',
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            e.currentTarget.style.setProperty('--x', `${x}%`);
            e.currentTarget.style.setProperty('--y', `${y}%`);
            e.currentTarget.style.opacity = '0.4';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0';
          }}
        />
      )}
      {buttonContent}
    </motion.button>
  );
}