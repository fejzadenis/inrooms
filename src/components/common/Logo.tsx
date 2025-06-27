import React from 'react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <img src="/logo colored.png" alt="inRooms" className="h-8 w-auto" />
      <span className="text-xl md:text-2xl font-bold text-gray-900">inRooms</span>
    </div>
  );
}