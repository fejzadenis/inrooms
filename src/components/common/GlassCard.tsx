import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glowColor?: string;
}

export function GlassCard({ 
  children, 
  className = '', 
  hoverEffect = true,
  glowColor = 'rgba(59, 130, 246, 0.3)'
}: GlassCardProps) {
  return (
    <motion.div
      className={`relative overflow-hidden backdrop-blur-md bg-white/5 border border-white/10 rounded-xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hoverEffect ? { y: -5, boxShadow: `0 10px 25px ${glowColor}` } : {}}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
}