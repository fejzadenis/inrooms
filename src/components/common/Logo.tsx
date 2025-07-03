import React from 'react';
import { motion } from 'framer-motion';

export function Logo() {
  return (
    <motion.div 
      className="flex items-center gap-2"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur-md opacity-70"></div>
        <div className="relative">
          <img src="/logo colored.png" alt="inRooms" className="h-8 w-auto" />
        </div>
      </div>
      <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">inRooms</span>
    </motion.div>
  );
}