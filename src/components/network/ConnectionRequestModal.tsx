import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Send, UserPlus } from 'lucide-react';
import { Button } from '../common/Button';
import { connectionService } from '../../services/connectionService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const requestSchema = z.object({
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface ConnectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    id: string;
    name: string;
    profile_title?: string;
    profile_company?: string;
    photo_url?: string;
  } | null;
  onSuccess: () => void;
}

export function ConnectionRequestModal({
  isOpen,
  onClose,
  targetUser,
  onSuccess
}: ConnectionRequestModalProps) {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      message: ''
    }
  });

  React.useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const handleFormSubmit = async (data: RequestFormData) => {
    if (!targetUser || !user) {
      toast.error('Authentication required to send connection request');
      return;
    }

    // Use user.id instead of user.uid to match the database schema
    const currentUserId = user.id || user.uid;
    
    if (!currentUserId) {
      toast.error('User ID not found. Please try logging in again.');
      return;
    }

    if (!targetUser.id) {
      toast.error('Target user ID not found');
      return;
    }

    try {
      await connectionService.sendConnectionRequest(
        currentUserId,
        targetUser.id,
        data.message || ''
      );
      
      toast.success(`Connection request sent to ${targetUser.name}`);
      reset();
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error(error.message || 'Failed to send connection request');
    }
  };

  if (!isOpen || !targetUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Connect with {targetUser.name}</h2>
              <p className="text-gray-600 mt-1">Send a connection request</p>
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

        <div className="p-6">
          {/* User Info */}
          <div className="flex items-center space-x-4 mb-6">
            {targetUser.photo_url ? (
              <img
                src={targetUser.photo_url}
                alt={targetUser.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-indigo-600" />
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900">{targetUser.name}</h3>
              {targetUser.profile_title && (
                <p className="text-sm text-gray-500">
                  {targetUser.profile_title} {targetUser.profile_company ? `at ${targetUser.profile_company}` : ''}
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add a personal message (optional)
              </label>
              <textarea
                {...register('message')}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Hi! I'd like to connect with you..."
              />
              {errors.message && (
                <p className="text-red-600 text-sm mt-1">{errors.message.message}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• {targetUser.name} will receive your connection request</li>
                <li>• Once accepted, you'll be able to message each other</li>
                <li>• You'll see each other's full profile information</li>
                <li>• You'll be notified when your request is accepted</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting} disabled={!user}>
                <Send className="w-4 h-4 mr-2" />
                Send Request
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}