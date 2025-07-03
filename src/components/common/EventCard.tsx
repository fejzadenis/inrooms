import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, Users, Video } from 'lucide-react';
import { GlowButton } from './GlowButton';
import { GlassCard } from './GlassCard';

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
    <GlassCard className="p-4 md:p-6 space-y-4">
      <div>
        <h3 className="text-lg md:text-xl font-semibold text-white">{title}</h3>
        <p className="text-gray-300 mt-2 text-sm md:text-base">{description}</p>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-gray-300 text-sm">
          <Calendar className="w-5 h-5 mr-2 flex-shrink-0 text-indigo-400" />
          <span>{format(date, 'MMMM d, yyyy')}</span>
        </div>
        
        <div className="flex items-center text-gray-300 text-sm">
          <Clock className="w-5 h-5 mr-2 flex-shrink-0 text-indigo-400" />
          <span>{format(date, 'h:mm a')}</span>
        </div>
        
        <div className="flex items-center text-gray-300 text-sm">
          <Users className="w-5 h-5 mr-2 flex-shrink-0 text-indigo-400" />
          <span>{currentParticipants} / {maxParticipants} participants</span>
        </div>

        {isRegistered && meetLink && (
          <div className="flex items-center text-gray-300 text-sm">
            <Video className="w-5 h-5 mr-2 flex-shrink-0 text-indigo-400" />
            <a href={meetLink} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 hoverable">
              Meeting Link
            </a>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        {!isRegistered && isUpcoming && (
          <GlowButton
            variant="primary"
            onClick={onRegister}
            disabled={currentParticipants >= maxParticipants}
            className="w-full hoverable"
          >
            {currentParticipants >= maxParticipants ? 'Event Full' : 'Register Now'}
          </GlowButton>
        )}

        {isRegistered && canJoin && (
          <GlowButton
            variant="primary"
            onClick={onJoin}
            className="w-full hoverable"
          >
            Join Meeting
          </GlowButton>
        )}

        {isRegistered && !canJoin && (
          <GlowButton
            variant="secondary"
            disabled
            className="w-full"
          >
            {date > new Date() ? 'Registered' : 'Event Ended'}
          </GlowButton>
        )}
      </div>
    </GlassCard>
  );
}