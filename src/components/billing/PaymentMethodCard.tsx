import React from 'react';
import { CreditCard, Trash2, Edit } from 'lucide-react';
import { Button } from '../common/Button';

interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string) => void;
}

export function PaymentMethodCard({ 
  paymentMethod, 
  onSetDefault, 
  onDelete, 
  onUpdate 
}: PaymentMethodCardProps) {
  const getBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  const formatBrand = (brand: string) => {
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  return (
    <div className={`border-2 rounded-lg p-6 ${
      paymentMethod.isDefault 
        ? 'border-indigo-500 bg-indigo-50' 
        : 'border-gray-200 bg-white hover:border-gray-300'
    } transition-colors duration-200`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-2xl">
            {getBrandIcon(paymentMethod.card.brand)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {formatBrand(paymentMethod.card.brand)} •••• {paymentMethod.card.last4}
              </span>
              {paymentMethod.isDefault && (
                <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                  Default
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Expires {paymentMethod.card.expMonth.toString().padStart(2, '0')}/{paymentMethod.card.expYear}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!paymentMethod.isDefault && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetDefault(paymentMethod.id)}
            >
              Set Default
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdate(paymentMethod.id)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(paymentMethod.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}