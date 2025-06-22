import React from 'react';
import { Check, Star } from 'lucide-react';
import { Button } from '../common/Button';
import type { SubscriptionPlan } from '../../services/stripeService';

interface PricingCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  onSelectPlan: (plan: SubscriptionPlan) => void;
  loading?: boolean;
}

export function PricingCard({ 
  plan, 
  isCurrentPlan = false, 
  isPopular = false, 
  onSelectPlan, 
  loading = false 
}: PricingCardProps) {
  return (
    <div className={`relative rounded-2xl border-2 p-8 ${
      isPopular 
        ? 'border-indigo-500 bg-indigo-50 shadow-lg scale-105' 
        : isCurrentPlan
        ? 'border-green-500 bg-green-50'
        : 'border-gray-200 bg-white hover:border-gray-300'
    } transition-all duration-200`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
            <Star className="w-4 h-4 mr-1" />
            Most Popular
          </div>
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
            <Check className="w-4 h-4 mr-1" />
            Current Plan
          </div>
        </div>
      )}

      <div className="text-center">
        <h3 className={`text-2xl font-bold ${
          isPopular ? 'text-indigo-900' : isCurrentPlan ? 'text-green-900' : 'text-gray-900'
        }`}>
          {plan.name}
        </h3>
        
        <div className="mt-4">
          <span className={`text-5xl font-bold ${
            isPopular ? 'text-indigo-900' : isCurrentPlan ? 'text-green-900' : 'text-gray-900'
          }`}>
            ${plan.price}
          </span>
          <span className={`text-lg ${
            isPopular ? 'text-indigo-600' : isCurrentPlan ? 'text-green-600' : 'text-gray-500'
          }`}>
            /{plan.interval === 'month' ? 'mo' : 'yr'}
          </span>
        </div>

        <p className={`mt-2 text-sm ${
          isPopular ? 'text-indigo-700' : isCurrentPlan ? 'text-green-700' : 'text-gray-600'
        }`}>
          {plan.eventsQuota} events per month
        </p>
      </div>

      <ul className="mt-8 space-y-4">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${
              isPopular ? 'text-indigo-500' : isCurrentPlan ? 'text-green-500' : 'text-gray-400'
            }`} />
            <span className={`text-sm ${
              isPopular ? 'text-indigo-900' : isCurrentPlan ? 'text-green-900' : 'text-gray-700'
            }`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Button
          onClick={() => onSelectPlan(plan)}
          disabled={isCurrentPlan || loading}
          className={`w-full ${
            isPopular 
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
              : isCurrentPlan
              ? 'bg-green-100 text-green-800 cursor-not-allowed'
              : ''
          }`}
          variant={isPopular ? 'primary' : isCurrentPlan ? 'outline' : 'outline'}
          isLoading={loading}
        >
          {isCurrentPlan ? 'Current Plan' : `Choose ${plan.name}`}
        </Button>
      </div>
    </div>
  );
}