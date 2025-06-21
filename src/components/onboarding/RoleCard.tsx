import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface RoleCardProps {
  role: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    features: string[];
  };
  isSelected?: boolean;
  onClick?: () => void;
}

export function RoleCard({ role, isSelected = false, onClick }: RoleCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-indigo-500 bg-indigo-50 shadow-lg'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
      }`}
      onClick={onClick}
    >
      {isSelected && (
        <div className="absolute top-4 right-4">
          <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${role.color} rounded-lg flex items-center justify-center text-2xl mr-4`}>
          {role.icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
        </div>
      </div>

      <p className="text-gray-600 mb-4">{role.description}</p>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-900">Key Features:</h4>
        <ul className="space-y-1">
          {role.features.slice(0, 3).map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-gray-600">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}