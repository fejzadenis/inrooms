import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Crown, Users, Zap, MessageSquare, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '../common/Button';
import { stripeService, type SubscriptionPlan } from '../../services/stripeService';

interface PricingCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  onSelectPlan: (plan: SubscriptionPlan) => void;
  onRequestQuote?: (plan: SubscriptionPlan) => void;
  loading?: boolean;
  billingInterval?: 'monthly' | 'yearly';
}

export function PricingCard({ 
  plan, 
  isCurrentPlan = false, 
  onSelectPlan, 
  onRequestQuote,
  loading = false,
  billingInterval = 'monthly'
}: PricingCardProps) {
  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'starter':
        return <Zap className="w-6 h-6" />;
      case 'professional':
        return <Star className="w-6 h-6" />;
      case 'enterprise':
        return <Crown className="w-6 h-6" />;
      case 'team':
        return <Users className="w-6 h-6" />;
      case 'custom':
        return <MessageSquare className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'starter':
        return 'from-blue-500 to-blue-600';
      case 'professional':
        return 'from-indigo-500 to-purple-600';
      case 'enterprise':
        return 'from-purple-500 to-pink-600';
      case 'team':
        return 'from-green-500 to-teal-600';
      case 'custom':
        return 'from-gray-700 to-gray-900';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  // Calculate annual savings
  const annualSavings = billingInterval === 'yearly' && !plan.isCustom ? 
    stripeService.calculateAnnualSavings(plan.interval === 'month' ? plan.price : plan.price / 12) : 0;

  // Calculate display price based on billing interval
  const displayPrice = plan.price;

  // Calculate price per month for yearly plans
  const pricePerMonth = billingInterval === 'yearly' && plan.interval === 'year' && !plan.isCustom ? 
    Math.round(displayPrice / 12) : displayPrice;

  const handleAction = () => {
    if (plan.isCustom && onRequestQuote) {
      onRequestQuote(plan);
    } else {
      onSelectPlan(plan);
    }
  };

  // Extract the base plan ID (without _annual suffix)
  const basePlanId = plan.id.replace('_annual', '');

  return (
    <div className={`relative rounded-2xl border-2 p-8 transition-all duration-200 ${
      plan.isPopular 
        ? 'border-indigo-500 bg-indigo-50 shadow-xl scale-105 ring-2 ring-indigo-200' 
        : isCurrentPlan
        ? 'border-green-500 bg-green-50 shadow-lg'
        : plan.isCustom
        ? 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg'
        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
    }`}>
      {plan.isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center shadow-lg">
            <Star className="w-4 h-4 mr-2" />
            Most Popular
          </div>
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-green-500 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center shadow-lg">
            <Check className="w-4 h-4 mr-2" />
            Current Plan
          </div>
        </div>
      )}

      {plan.isCustom && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center shadow-lg">
            <Crown className="w-4 h-4 mr-2" />
            Enterprise
          </div>
        </div>
      )}

      <div className="text-center mt-4">
        {/* Plan Icon */}
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${getPlanColor(basePlanId)} text-white mb-4`}>
          {getPlanIcon(basePlanId)}
        </div>

        <h3 className={`text-2xl font-bold mb-2 ${
          plan.isPopular ? 'text-indigo-900' : 
          isCurrentPlan ? 'text-green-900' : 
          plan.isCustom ? 'text-gray-900' : 'text-gray-900'
        }`}>
          {plan.name}
        </h3>

        <p className={`text-sm mb-4 ${
          plan.isPopular ? 'text-indigo-700' : 
          isCurrentPlan ? 'text-green-700' : 
          plan.isCustom ? 'text-gray-700' : 'text-gray-600'
        }`}>
          {plan.targetAudience}
        </p>
        
        <div className="mb-4">
          {billingInterval === 'yearly' && plan.interval === 'year' && !plan.isCustom && (
            <div className="text-sm text-green-600 font-medium mb-2">
              Save ${annualSavings}/year
            </div>
          )}
          
          <div className="flex items-baseline justify-center">
            {plan.isCustom ? (
              <div className="text-center">
                <span className="text-3xl font-bold text-gray-900">Custom</span>
                <div className="text-sm text-gray-600 mt-1">Pricing</div>
              </div>
            ) : (
              <>
                <span className={`text-5xl font-bold ${
                  plan.isPopular ? 'text-indigo-900' : isCurrentPlan ? 'text-green-900' : 'text-gray-900'
                }`}>
                  ${billingInterval === 'yearly' && plan.interval === 'year' ? pricePerMonth : displayPrice}
                </span>
                <span className={`text-lg ml-2 ${
                  plan.isPopular ? 'text-indigo-600' : isCurrentPlan ? 'text-green-600' : 'text-gray-500'
                }`}>
                  /month
                </span>
              </>
            )}
          </div>

          {billingInterval === 'yearly' && plan.interval === 'year' && !plan.isCustom && (
            <div className="text-sm text-gray-500 mt-1">
              Billed annually (${displayPrice}/year)
            </div>
          )}
        </div>

        <div className={`text-sm font-medium mb-6 ${
          plan.isPopular ? 'text-indigo-700' : 
          isCurrentPlan ? 'text-green-700' : 
          plan.isCustom ? 'text-gray-700' : 'text-gray-600'
        }`}>
          {plan.isCustom ? 'Unlimited events' : `${plan.eventsQuota} events per month`}
        </div>

        <div className={`text-xs italic mb-6 ${
          plan.isPopular ? 'text-indigo-600' : 
          isCurrentPlan ? 'text-green-600' : 
          plan.isCustom ? 'text-gray-600' : 'text-gray-500'
        }`}>
          "{plan.valueProposition}"
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${
              plan.isPopular ? 'text-indigo-500' : 
              isCurrentPlan ? 'text-green-500' : 
              plan.isCustom ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <span className={`text-sm ${
              plan.isPopular ? 'text-indigo-900' : 
              isCurrentPlan ? 'text-green-900' : 
              plan.isCustom ? 'text-gray-800' : 'text-gray-700'
            }`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        <Button
          onClick={handleAction}
          disabled={isCurrentPlan || loading}
          className={`w-full ${
            plan.isCustom
              ? 'bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-gray-950 text-white shadow-lg'
              : plan.isPopular 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg' 
              : isCurrentPlan
              ? 'bg-green-100 text-green-800 cursor-not-allowed'
              : 'bg-gray-900 hover:bg-gray-800 text-white'
          }`}
          isLoading={loading}
        >
          {isCurrentPlan ? 'Current Plan' : 
           plan.isCustom ? (
             <>
               Request Quote
               <ArrowRight className="w-4 h-4 ml-2" />
             </>
           ) : (
             <>
               Choose {plan.name}
               <ExternalLink className="w-4 h-4 ml-2" />
             </>
           )}
        </Button>

        {plan.id === 'team' && (
          <p className="text-xs text-gray-500 text-center">
            Minimum 3 users required
          </p>
        )}

        {plan.isCustom && (
          <p className="text-xs text-gray-500 text-center">
            Custom pricing based on your needs
          </p>
        )}
      </div>
    </div>
  );
}