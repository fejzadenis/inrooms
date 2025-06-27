import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Calendar, Clock, Users, Building, User, Mail } from 'lucide-react';
import { Button } from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { demoService } from '../../services/demoService';
import { generateCalendarEvent } from '../../utils/calendar';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import type { Demo } from '../../types/demo';

const registrationSchema = z.object({
  userName: z.string().min(1, 'Name is required'),
  userEmail: z.string().email('Valid email is required'),
  userCompany: z.string().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface DemoRegistrationModalProps {
  demo: Demo | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DemoRegistrationModal({ 
  demo, 
  isOpen, 
  onClose, 
  onSuccess 
}: DemoRegistrationModalProps) {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      userName: user?.name || '',
      userEmail: user?.email || '',
      userCompany: user?.profile?.company || '',
    }
  });

  const handleFormSubmit = async (data: RegistrationFormData) => {
    if (!demo) return;

    try {
      const userId = user?.id || `guest_${Date.now()}`;
      
      await demoService.registerForDemo(userId, demo.id!, {
        userName: data.userName,
        userEmail: data.userEmail,
        userCompany: data.userCompany,
      });

      // Generate calendar event
      try {
        const icsFile = await generateCalendarEvent({
          title: demo.title,
          description: `${demo.description}\n\nHosted by: ${demo.hostName} (${demo.hostCompany})`,
          startTime: new Date(demo.scheduledDate),
          duration: { hours: Math.floor(demo.duration / 60), minutes: demo.duration % 60 },
          location: demo.meetingLink || 'Online Demo',
        });

        // Create calendar download link
        const blob = new Blob([icsFile], { type: 'text/calendar' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${demo.title.toLowerCase().replace(/\s+/g, '-')}.ics`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (calendarError) {
        console.warn('Failed to generate calendar event:', calendarError);
      }

      toast.success('Successfully registered for demo! Calendar invite downloaded.');
      reset();
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Failed to register for demo:', error);
      toast.error('Failed to register for demo. Please try again.');
    }
  };

  if (!isOpen || !demo) return null;

  const isFull = demo.currentAttendees >= demo.maxAttendees;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Register for Demo</h2>
              <p className="text-gray-600 mt-1 text-sm md:text-base">Join this product demonstration</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {/* Demo Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">{demo.title}</h3>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{format(new Date(demo.scheduledDate), 'MMMM d, yyyy')}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{format(new Date(demo.scheduledDate), 'h:mm a')} ({demo.duration} min)</span>
              </div>
              
              <div className="flex items-center">
                <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{demo.hostName} from {demo.hostCompany}</span>
              </div>
              
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{demo.currentAttendees} / {demo.maxAttendees} registered</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isFull ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{
                    width: `${Math.min((demo.currentAttendees / demo.maxAttendees) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            {isFull && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  This demo is currently full. You can still register to be added to the waitlist.
                </p>
              </div>
            )}
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                {...register('userName')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
              {errors.userName && (
                <p className="text-red-600 text-sm mt-1">{errors.userName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                {...register('userEmail')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your email address"
              />
              {errors.userEmail && (
                <p className="text-red-600 text-sm mt-1">{errors.userEmail.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-2" />
                Company (Optional)
              </label>
              <input
                type="text"
                {...register('userCompany')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your company name"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You'll receive a confirmation email with demo details</li>
                <li>• A calendar invite will be automatically downloaded</li>
                <li>• Meeting link will be shared 15 minutes before the demo</li>
                <li>• Recording will be available after the session (if enabled)</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {isFull ? 'Join Waitlist' : 'Register for Demo'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}