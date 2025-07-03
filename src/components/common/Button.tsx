import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'neon';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  glowEffect?: 'primary' | 'secondary' | 'accent' | 'none';
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  glowEffect = 'none',
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium transition-all duration-300 flex items-center justify-center relative overflow-hidden';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 border border-primary-700',
    secondary: 'bg-gradient-to-r from-secondary-600 to-secondary-700 text-white hover:from-secondary-700 hover:to-secondary-800 disabled:opacity-50 border border-secondary-700',
    outline: 'bg-transparent border border-primary-500 text-primary-500 hover:bg-primary-500/10 disabled:opacity-50',
    ghost: 'bg-transparent text-primary-500 hover:bg-primary-500/10 disabled:opacity-50',
    neon: 'bg-transparent border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-background disabled:opacity-50'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-lg'
  };

  const glowStyles = {
    primary: 'shadow-glow hover:shadow-glow',
    secondary: 'shadow-glow-blue hover:shadow-glow-blue',
    accent: 'shadow-glow-orange hover:shadow-glow-orange',
    none: ''
  };

  const buttonContent = (
    <>
      {isLoading ? (
        <>
          <LoadingSpinner className="mr-2" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </>
      )}
    </>
  );

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${glowStyles[glowEffect]} ${fullWidth ? 'w-full' : ''} ${className} ${variant === 'neon' ? 'neon-button' : ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {buttonContent}
    </motion.button>
  );
}