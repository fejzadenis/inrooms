import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, Users, Video } from 'lucide-react';
import { Button } from './Button';

interface EventCardProps {
  title: string;
  description: string;
  date: Date;
  maxParticipants: number;
  currentParticipants: number;
  meetLink?: string;
  onRegister: () => void;
  onJoin?: () => void;
  isRegistered?: boolean;
}

export function EventCard({
  title,
  description,
  date,
  maxParticipants,
  currentParticipants,
  meetLink,
  onRegister,
  onJoin,
  isRegistered = false
}: EventCardProps) {
  const isUpcoming = date > new Date();
  const canJoin = isRegistered && meetLink && Math.abs(new Date().getTime() - date.getTime()) < 15 * 60 * 1000; // 15 minutes before/after

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 space-y-4">
      <div>
        <h3 className="text-2xl md:text-3xl font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 mt-2 text-lg md:text-xl">{description}</p>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-gray-600 text-base">
          <Calendar className="w-6 h-6 mr-2 flex-shrink-0" />
          <span>{format(date, 'MMMM d, yyyy')}</span>
        </div>
        
        <div className="flex items-center text-gray-600 text-base">
          <Clock className="w-6 h-6 mr-2 flex-shrink-0" />
          <span>{format(date, 'h:mm a')}</span>
        </div>
        
        <div className="flex items-center text-gray-600 text-base">
          <Users className="w-6 h-6 mr-2 flex-shrink-0" />
          <span>{currentParticipants} / {maxParticipants} participants</span>
        </div>
        {isRegistered && meetLink && (
          <div className="flex items-center text-gray-600 text-base">
            <Video className="w-6 h-6 mr-2 flex-shrink-0" />
            <a href={meetLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
              Meeting Link
            </a>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        {!isRegistered && isUpcoming && (
          <Button
            variant="primary"
            onClick={onRegister}
            disabled={currentParticipants >= maxParticipants}
            className="w-full"
          >
            {currentParticipants >= maxParticipants ? 'Event Full' : 'Register Now'}
          </Button>
        )}
        {isRegistered && canJoin && (
          <Button
            variant="primary"
            onClick={onJoin}
            className="w-full"
          >
            Join Meeting
          </Button>
        )}
        {isRegistered && !canJoin && (
          <Button
            variant="secondary"
            disabled
            className="w-full"
          >
            {date > new Date() ? 'Registered' : 'Event Ended'}
          </Button>
        )}
      </div>
    </div>
  );
}