import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Building, Users, Calendar, MessageSquare } from 'lucide-react';
import { Button } from '../common/Button';
import { stripeService } from '../../services/stripeService';
import { toast } from 'react-hot-toast';

const quoteSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  teamSize: z.string().min(1, 'Team size is required'),
  requirements: z.string().min(10, 'Please provide more details about your requirements'),
  timeline: z.string().min(1, 'Timeline is required'),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

interface CustomQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomQuoteModal({ isOpen, onClose }: CustomQuoteModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
  });

  const onSubmit = async (data: QuoteFormData) => {
    try {
      await stripeService.requestCustomQuote(data);
      toast.success('Quote request submitted! Our team will contact you within 24 hours.');
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting quote request:', error);
      toast.error('Failed to submit quote request. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Request Custom Quote</h2>
              <p className="text-gray-600 mt-1">Tell us about your needs and we'll create a tailored solution</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-2" />
                Company Name *
              </label>
              <input
                type="text"
                {...register('companyName')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Your company name"
              />
              {errors.companyName && (
                <p className="text-red-600 text-sm mt-1">{errors.companyName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name *
              </label>
              <input
                type="text"
                {...register('contactName')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Your full name"
              />
              {errors.contactName && (
                <p className="text-red-600 text-sm mt-1">{errors.contactName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="your.email@company.com"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Team Size *
              </label>
              <select
                {...register('teamSize')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select team size</option>
                <option value="50-100">50-100 users</option>
                <option value="100-250">100-250 users</option>
                <option value="250-500">250-500 users</option>
                <option value="500-1000">500-1000 users</option>
                <option value="1000+">1000+ users</option>
              </select>
              {errors.teamSize && (
                <p className="text-red-600 text-sm mt-1">{errors.teamSize.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Implementation Timeline *
              </label>
              <select
                {...register('timeline')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select timeline</option>
                <option value="immediate">Immediate (within 2 weeks)</option>
                <option value="1-month">Within 1 month</option>
                <option value="1-3-months">1-3 months</option>
                <option value="3-6-months">3-6 months</option>
                <option value="6-months+">6+ months</option>
              </select>
              {errors.timeline && (
                <p className="text-red-600 text-sm mt-1">{errors.timeline.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Requirements & Use Case *
            </label>
            <textarea
              {...register('requirements')}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Please describe your specific requirements, use cases, and any custom features you need..."
            />
            {errors.requirements && (
              <p className="text-red-600 text-sm mt-1">{errors.requirements.message}</p>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Our enterprise team will review your requirements</li>
              <li>• We'll schedule a discovery call within 24 hours</li>
              <li>• You'll receive a custom proposal within 3-5 business days</li>
              <li>• We'll work with you to finalize the perfect solution</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Submit Quote Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}