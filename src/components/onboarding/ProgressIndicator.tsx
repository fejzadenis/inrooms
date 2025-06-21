import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export function ProgressIndicator({ currentStep, totalSteps, stepLabels }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        
        return (
          <React.Fragment key={stepNumber}>
            <div className="flex flex-col items-center">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-200 ${
                  isCompleted
                    ? 'bg-indigo-500 border-indigo-500 text-white'
                    : isCurrent
                    ? 'border-indigo-500 text-indigo-500 bg-white'
                    : 'border-gray-300 text-gray-400 bg-white'
                }`}
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                }}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{stepNumber}</span>
                )}
              </motion.div>
              {stepLabels && stepLabels[index] && (
                <span className={`mt-2 text-xs font-medium ${
                  isCompleted || isCurrent ? 'text-indigo-600' : 'text-gray-400'
                }`}>
                  {stepLabels[index]}
                </span>
              )}
            </div>
            
            {stepNumber < totalSteps && (
              <div className={`flex-1 h-0.5 mx-4 transition-colors duration-200 ${
                isCompleted ? 'bg-indigo-500' : 'bg-gray-300'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}