import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import type { Deal } from '../../types/user';

interface DealShowcaseProps {
  deals: Deal[];
  onToggleVisibility: (dealId: string) => void;
  isOwnProfile: boolean;
}

export function DealShowcase({ deals, onToggleVisibility, isOwnProfile }: DealShowcaseProps) {
  const visibleDeals = isOwnProfile ? deals : deals.filter(deal => deal.isPublic);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Deal Showcase</h3>
      <div className="grid grid-cols-1 gap-4">
        {visibleDeals.map((deal) => (
          <div key={deal.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{deal.title}</h4>
                <p className="text-sm text-gray-500">{deal.company}</p>
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => onToggleVisibility(deal.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {deal.isPublic ? (
                    <Unlock className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
            <div className="mt-2">
              <span className="text-lg font-semibold text-green-600">
                ${deal.value.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                Closed {new Date(deal.closedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}