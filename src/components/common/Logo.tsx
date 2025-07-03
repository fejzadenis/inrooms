import React from 'react';
import { motion } from 'framer-motion';

export function Logo() {
  return (
    <motion.div 
      className="flex items-center gap-2"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <div className="relative w-8 h-8">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg"
          animate={{ 
            rotate: [0, 10, 0, -10, 0],
            scale: [1, 1.1, 1, 1.1, 1]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
          iR
        </div>
      </div>
      <span className="text-xl md:text-2xl font-bold gradient-text">inRooms</span>
    </motion.div>
  );
}