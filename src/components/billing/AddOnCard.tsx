import React from 'react';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { Button } from '../common/Button';
import type { AddOn } from '../../services/stripeService';

interface AddOnCardProps {
  addOn: AddOn;
  isActive?: boolean;
  onToggle: (addOn: AddOn) => void;
  loading?: boolean;
}

export function AddOnCard({ addOn, isActive = false, onToggle, loading = false }: AddOnCardProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'crown':
        return <Crown className="w-6 h-6" />;
      case 'star':
        return <Star className="w-6 h-6" />;
      case 'zap':
        return <Zap className="w-6 h-6" />;
      default:
        return <Crown className="w-6 h-6" />;
    }
  };

  return (
    <div className={`rounded-xl border-2 p-6 transition-all duration-200 ${
      isActive 
        ? 'border-yellow-400 bg-yellow-50 shadow-lg' 
        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${
            isActive ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'
          }`}>
            {getIcon(addOn.icon)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{addOn.name}</h3>
            <p className="text-sm text-gray-600">{addOn.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">${addOn.price}</div>
          <div className="text-sm text-gray-500">/month</div>
        </div>
      </div>

      <ul className="space-y-2 mb-6">
        {addOn.benefits.map((benefit, index) => (
          <li key={index} className="flex items-start">
            <Check className={`w-4 h-4 mt-0.5 mr-2 flex-shrink-0 ${
              isActive ? 'text-yellow-500' : 'text-gray-400'
            }`} />
            <span className="text-sm text-gray-700">{benefit}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={() => onToggle(addOn)}
        isLoading={loading}
        className={`w-full ${
          isActive 
            ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
            : 'bg-gray-900 hover:bg-gray-800 text-white'
        }`}
      >
        {isActive ? 'Remove Add-on' : 'Add to Plan'}
      </Button>
    </div>
  );
}