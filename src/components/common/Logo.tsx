import React from 'react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <img src="/logo colored.png" alt="inrooms" className="h-8 w-auto" />
      <span className="text-2xl font-bold text-gray-900">inrooms</span>
    </div>
  );
}