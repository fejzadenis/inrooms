import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  description?: string;
}

export function StatsCard({ title, value, change, description }: StatsCardProps) {
  const isPositive = change && change > 0;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {change !== undefined && (
          <p className={`ml-2 flex items-baseline text-sm font-semibold ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <span className="flex items-center">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(change)}%
            </span>
          </p>
        )}
      </div>
      {description && (
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}