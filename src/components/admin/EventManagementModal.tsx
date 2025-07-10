import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button } from '../common/Button';
import { createGoogleMeetEvent } from '../../utils/googleMeet';
import { eventService } from '../../services/eventService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  maxParticipants: z.number().min(1, 'Must allow at least 1 participant'),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventId: string) => Promise<void>;
  initialData?: Partial<EventFormData & { id: string }>;
}

export function EventManagementModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: EventManagementModalProps) {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: initialData,
  });

  const handleFormSubmit = async (data: EventFormData) => {
    if (!user) {
      toast.error('You must be logged in to create events');
      return;
    }

    try {
      const startTime = new Date(`${data.date}T${data.time}`);
      const endTime = new Date(startTime.getTime() + data.duration * 60000);

      console.log("Creating event with data:", {
        title: data.title,
        description: data.description,
        startTime,
        endTime
      });
      
      let meetLink = '';
      
      try {
        // Try to create Google Meet event
        console.log("Attempting to create Google Meet link");
        const meetResponse = await createGoogleMeetEvent({
          title: data.title,
          description: data.description,
          startTime,
          endTime,
        });
        
        console.log("Google Meet response:", meetResponse);
        meetLink = meetResponse.meetLink || '';
        
        if (meetLink) {
          console.log("Successfully created Google Meet link:", meetLink);
        } else {
          console.warn("No Google Meet link returned in response");
        }
      } catch (meetError) {
        console.warn('Failed to create Google Meet link:', meetError);
        // Continue without Meet link - the event can still be created
        toast('Event created successfully, but Google Meet link could not be generated', { 
          icon: '⚠️',
          duration: 4000 
        });
      }

      console.log("Preparing event data with meetLink:", meetLink);
      const eventData = {
        title: data.title,
        description: data.description,
        date: startTime,
        duration: data.duration,
        maxParticipants: data.maxParticipants,
        currentParticipants: 0,
        meetLink: meetLink || undefined,
        createdBy: user.id,
      };

      console.log("Saving event data:", eventData);
      let eventId: string;

      if (initialData?.id) {
        // Update existing event
        console.log("Updating existing event:", initialData.id);
        await eventService.updateEvent(initialData.id, eventData);
        eventId = initialData.id;
        toast.success('Event updated successfully!');
      } else {
        // Create new event
        console.log("Creating new event");
        eventId = await eventService.createEvent(eventData);
        toast.success('Event created successfully!');
      }

      console.log("Event saved with ID:", eventId);
      await onSubmit(eventId);
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to save event:', error);
      toast.error('Failed to save event. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-semibold mb-4">
          {initialData?.id ? 'Edit Event' : 'Create New Event'}
        </h2>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              {...register('title')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                {...register('date')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Time
              </label>
              <input
                type="time"
                {...register('time')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.time && (
                <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Duration (minutes)
            </label>
            <input
              type="number"
              {...register('duration', { valueAsNumber: true })}
              min={1}
              defaultValue={60}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600">
                {errors.duration.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Maximum Participants
            </label>
            <input
              type="number"
              {...register('maxParticipants', { valueAsNumber: true })}
              min={1}
              defaultValue={10}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.maxParticipants && (
              <p className="mt-1 text-sm text-red-600">
                {errors.maxParticipants.message}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {initialData?.id ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}