import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, Video, Clock, Eye, Calendar } from 'lucide-react';
import { Button } from '../common/Button';
import { demoService } from '../../services/demoService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import type { Demo } from '../../types/demo';

const uploadSchema = z.object({
  recordingUrl: z.string().url('Valid recording URL is required'),
  recordingDuration: z.number().min(1, 'Duration must be at least 1 minute'),
  thumbnailUrl: z.string().url('Valid thumbnail URL is required').optional().or(z.literal('')),
  visibilityDuration: z.number().min(1, 'Visibility duration must be at least 1 day').optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

interface RecordingUploadModalProps {
  demo: Demo | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RecordingUploadModal({ 
  demo, 
  isOpen, 
  onClose, 
  onSuccess 
}: RecordingUploadModalProps) {
  const { user } = useAuth();
  const [defaultVisibilityDuration, setDefaultVisibilityDuration] = React.useState(30);

  React.useEffect(() => {
    if (user && user.subscription) {
      // Set default visibility duration based on subscription plan
      if (user.role === 'admin' || user.subscription.status === 'active') {
        // Enterprise or admin users get unlimited visibility by default
        setDefaultVisibilityDuration(365); // 1 year as "unlimited"
      } else if (user.subscription.status === 'trial') {
        // Trial users get 7 days
        setDefaultVisibilityDuration(7);
      } else {
        // Default for other plans
        setDefaultVisibilityDuration(30);
      }
    }
  }, [user]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      visibilityDuration: defaultVisibilityDuration,
    }
  });

  // Update the default value when it changes
  React.useEffect(() => {
    setValue('visibilityDuration', defaultVisibilityDuration);
  }, [defaultVisibilityDuration, setValue]);

  const visibilityDuration = watch('visibilityDuration');

  const handleFormSubmit = async (data: UploadFormData) => {
    if (!demo?.id) return;

    try {
      await demoService.uploadRecording(demo.id, {
        recordingUrl: data.recordingUrl,
        recordingDuration: data.recordingDuration,
        thumbnailUrl: data.thumbnailUrl || undefined,
        visibilityDuration: data.visibilityDuration,
      });

      toast.success('Recording uploaded successfully!');
      reset();
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Failed to upload recording:', error);
      toast.error('Failed to upload recording. Please try again.');
    }
  };

  const getVisibilityHelp = () => {
    if (user?.role === 'admin' || (user?.subscription.status === 'active')) {
      return "As an Enterprise member, you have access to extended visibility periods.";
    } else if (user?.subscription.status === 'trial') {
      return "During your trial, recordings are visible for 7 days. Upgrade to extend visibility.";
    } else {
      return "Standard visibility is 30 days. Upgrade to Enterprise for extended visibility.";
    }
  };

  if (!isOpen || !demo) return null;

  const getExpiryDate = () => {
    if (!visibilityDuration) return null;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + visibilityDuration);
    return expiry.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Upload Recording</h2>
              <p className="text-gray-600 mt-1 text-sm md:text-base">Add the demo recording for future viewing</p>
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
            <h3 className="font-semibold text-gray-900 mb-2">{demo.title}</h3>
            <p className="text-sm text-gray-600">
              Hosted by {demo.hostName} from {demo.hostCompany}
            </p>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Video className="w-4 h-4 inline mr-2" />
                Recording URL *
              </label>
              <input
                type="url"
                {...register('recordingUrl')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://example.com/recording.mp4"
              />
              {errors.recordingUrl && (
                <p className="text-red-600 text-sm mt-1">{errors.recordingUrl.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Provide a direct link to the video file or streaming URL
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Recording Duration (minutes) *
              </label>
              <input
                type="number"
                {...register('recordingDuration', { valueAsNumber: true })}
                min={1}
                max={300}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="60"
              />
              {errors.recordingDuration && (
                <p className="text-red-600 text-sm mt-1">{errors.recordingDuration.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail URL (Optional)
              </label>
              <input
                type="url"
                {...register('thumbnailUrl')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://example.com/thumbnail.jpg"
              />
              {errors.thumbnailUrl && (
                <p className="text-red-600 text-sm mt-1">{errors.thumbnailUrl.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Visibility Duration (days)
              </label>
              <input
                type="number"
                {...register('visibilityDuration', { valueAsNumber: true })}
                min={1}
                max={365}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="30"
              />
              {errors.visibilityDuration && (
                <p className="text-red-600 text-sm mt-1">{errors.visibilityDuration.message}</p>
              )}
              {visibilityDuration && (
                <p className="text-sm text-gray-500 mt-1">
                  Recording will be available until {getExpiryDate()}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {getVisibilityHelp()}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                <Eye className="w-4 h-4 inline mr-2" />
                Visibility Settings
              </h4>
              <p className="text-sm text-blue-800">
                {user?.role === 'admin' || user?.subscription.status === 'active' 
                  ? 'Enterprise members can set extended visibility durations. Recordings can be extended or made private at any time.'
                  : 'Upgrade to Enterprise for unlimited recording visibility and advanced management options.'}
              </p>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Recording
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}