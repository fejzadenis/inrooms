import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
  glowColor?: string;
  className?: string;
}

export function GlowButton({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  glowColor = 'rgba(56, 189, 248, 0.6)',
  ...props
}: GlowButtonProps) {
  const [glowPosition, setGlowPosition] = useState({ x: '50%', y: '50%' });
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const baseStyles = 'font-medium transition-all duration-300 flex items-center justify-center relative overflow-hidden';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50',
    secondary: 'bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 disabled:opacity-50',
    outline: 'border border-gray-700 text-gray-300 hover:bg-gray-800 disabled:bg-gray-900 disabled:text-gray-600',
    glass: 'backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-lg'
  };

  useEffect(() => {
    if (!buttonRef.current || !isHovered) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!buttonRef.current) return;
      
      const rect = buttonRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      setGlowPosition({ x: `${x}%`, y: `${y}%` });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovered]);

  return (
    <motion.button
      ref={buttonRef}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={props.disabled || isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {variant === 'primary' && (
        <div 
          className="absolute inset-0 w-full h-full opacity-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glowPosition.x} ${glowPosition.y}, ${glowColor} 0%, transparent 50%)`,
            opacity: isHovered ? 0.4 : 0,
          }}
        />
      )}
      
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}