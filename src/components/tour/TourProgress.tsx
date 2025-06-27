import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../common/Button';

interface TourProgressProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  description: string;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onClose: () => void;
  isLastStep: boolean;
}

export function TourProgress({
  currentStep,
  totalSteps,
  title,
  description,
  onNext,
  onPrev,
  onSkip,
  onClose,
  isLastStep
}: TourProgressProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close tour"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Step {currentStep + 1} of {totalSteps}
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSkip}
            className="text-xs py-1 px-2"
          >
            Skip
          </Button>
          
          {currentStep > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPrev}
              className="text-xs py-1 px-2"
            >
              Back
            </Button>
          )}
          
          <Button
            size="sm"
            onClick={onNext}
            className="text-xs py-1 px-2"
          >
            {isLastStep ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}