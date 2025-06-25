import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Calendar, Clock, Users, Tag, Building } from 'lucide-react';
import { Button } from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { demoService } from '../../services/demoService';
import { toast } from 'react-hot-toast';

const demoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  scheduledDate: z.string().min(1, 'Date is required'),
  scheduledTime: z.string().min(1, 'Time is required'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  maxAttendees: z.number().min(1, 'Must allow at least 1 attendee'),
  category: z.enum(['product-demo', 'solution-showcase', 'case-study', 'training']),
  tags: z.string().optional(),
  isPublic: z.boolean(),
  hostCompany: z.string().min(1, 'Company is required'),
  hostTitle: z.string().min(1, 'Title is required'),
});

type DemoFormData = z.infer<typeof demoSchema>;

interface DemoScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DemoScheduleModal({ isOpen, onClose, onSuccess }: DemoScheduleModalProps) {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<DemoFormData>({
    resolver: zodResolver(demoSchema),
    defaultValues: {
      duration: 60,
      maxAttendees: 50,
      category: 'product-demo',
      isPublic: true,
      hostCompany: user?.profile?.company || '',
      hostTitle: user?.profile?.title || '',
    }
  });

  const handleFormSubmit = async (data: DemoFormData) => {
    if (!user) {
      toast.error('You must be logged in to schedule demos');
      return;
    }

    try {
      const scheduledDateTime = new Date(`${data.scheduledDate}T${data.scheduledTime}`);
      
      if (scheduledDateTime <= new Date()) {
        toast.error('Demo must be scheduled for a future date and time');
        return;
      }

      const demoData = {
        title: data.title,
        description: data.description,
        hostId: user.id,
        hostName: user.name,
        hostCompany: data.hostCompany,
        hostTitle: data.hostTitle,
        scheduledDate: scheduledDateTime,
        duration: data.duration,
        maxAttendees: data.maxAttendees,
        currentAttendees: 0,
        category: data.category,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        status: 'scheduled' as const,
        isPublic: data.isPublic,
        isFeatured: false,
      };

      await demoService.createDemo(demoData);
      
      toast.success('Demo scheduled successfully!');
      reset();
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Failed to schedule demo:', error);
      toast.error('Failed to schedule demo. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Schedule Product Demo</h2>
              <p className="text-gray-600 mt-1">Create a new demo session for your solution</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Demo Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Demo Title *
              </label>
              <input
                type="text"
                {...register('title')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Enterprise CRM Solution Demo"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Describe what attendees will learn and see in this demo..."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                {...register('category')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="product-demo">Product Demo</option>
                <option value="solution-showcase">Solution Showcase</option>
                <option value="case-study">Case Study</option>
                <option value="training">Training Session</option>
              </select>
              {errors.category && (
                <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                {...register('tags')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., CRM, Sales, Enterprise, Automation"
              />
            </div>
          </div>

          {/* Host Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Host Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company *
                </label>
                <input
                  type="text"
                  {...register('hostCompany')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Your company name"
                />
                {errors.hostCompany && (
                  <p className="text-red-600 text-sm mt-1">{errors.hostCompany.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Title *
                </label>
                <input
                  type="text"
                  {...register('hostTitle')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Your job title"
                />
                {errors.hostTitle && (
                  <p className="text-red-600 text-sm mt-1">{errors.hostTitle.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Schedule</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date *
                </label>
                <input
                  type="date"
                  {...register('scheduledDate')}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.scheduledDate && (
                  <p className="text-red-600 text-sm mt-1">{errors.scheduledDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Time *
                </label>
                <input
                  type="time"
                  {...register('scheduledTime')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.scheduledTime && (
                  <p className="text-red-600 text-sm mt-1">{errors.scheduledTime.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  {...register('duration', { valueAsNumber: true })}
                  min={15}
                  max={180}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.duration && (
                  <p className="text-red-600 text-sm mt-1">{errors.duration.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Max Attendees *
                </label>
                <input
                  type="number"
                  {...register('maxAttendees', { valueAsNumber: true })}
                  min={1}
                  max={500}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.maxAttendees && (
                  <p className="text-red-600 text-sm mt-1">{errors.maxAttendees.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Visibility Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Visibility</h3>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('isPublic')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Make this demo publicly visible
              </label>
            </div>
            <p className="text-sm text-gray-500">
              Public demos can be discovered and registered for by anyone. Private demos are invitation-only.
            </p>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Schedule Demo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}