import React from 'react';
import { format, isAfter, isBefore, addMinutes } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  Star, 
  Play, 
  Upload,
  Eye,
  Building,
  Tag,
  ExternalLink,
  DollarSign,
  Rocket,
  Zap,
  Lightbulb
} from 'lucide-react';
import { GlowButton } from '../common/GlowButton';
import { motion } from 'framer-motion';
import { GlassCard } from '../common/GlassCard';
import type { Demo } from '../../types/demo';

interface DemoCardProps {
  demo: Demo;
  isRegistered?: boolean;
  canManage?: boolean;
  onRegister?: () => void;
  onJoin?: () => void;
  onViewRecording?: () => void;
  onUploadRecording?: () => void;
  onToggleFeatured?: () => void;
  isFeaturingInProgress?: boolean;
}

export function DemoCard({
  demo,
  isRegistered = false,
  canManage = false,
  onRegister,
  onJoin,
  onViewRecording,
  onUploadRecording,
  onToggleFeatured,
  isFeaturingInProgress = false
}: DemoCardProps) {
  const now = new Date();
  const demoStart = new Date(demo.scheduledDate);
  const demoEnd = addMinutes(demoStart, demo.duration);
  
  const isUpcoming = isAfter(demoStart, now);
  const isLive = !isBefore(now, demoStart) && isBefore(now, demoEnd);
  const isCompleted = isAfter(now, demoEnd);
  const canJoin = isRegistered && (isLive || (isUpcoming && isBefore(now, addMinutes(demoStart, 15))));
  const isFull = demo.currentAttendees >= demo.maxAttendees;

  const getStatusBadge = () => {
    if (isLive) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/50 text-red-300 border border-red-700/50">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
          Live Now
        </span>
      );
    }
    if (isUpcoming) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-700/50">
          <Calendar className="w-3 h-3 mr-1" />
          Upcoming
        </span>
      );
    }
    if (isCompleted) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-800/50 text-gray-300 border border-gray-700/50">
          <Video className="w-3 h-3 mr-1" />
          Completed
        </span>
      );
    }
    return null;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'product-demo':
        return 'bg-blue-900/50 text-blue-300 border-blue-700/50';
      case 'solution-showcase':
        return 'bg-green-900/50 text-green-300 border-green-700/50';
      case 'case-study':
        return 'bg-purple-900/50 text-purple-300 border-purple-700/50';
      case 'training':
        return 'bg-orange-900/50 text-orange-300 border-orange-700/50';
      default:
        return 'bg-gray-800/50 text-gray-300 border-gray-700/50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'product-demo':
        return <Video className="w-3 h-3 mr-1" />;
      case 'solution-showcase':
        return <Rocket className="w-3 h-3 mr-1" />;
      case 'case-study':
        return <Lightbulb className="w-3 h-3 mr-1" />;
      case 'training':
        return <Zap className="w-3 h-3 mr-1" />;
      default:
        return <Tag className="w-3 h-3 mr-1" />;
    }
  };

  return (
    <GlassCard 
      className={`relative p-4 md:p-6 transition-all duration-200 ${
        demo.isFeatured ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-900/20 to-orange-900/20' : ''
      }`}
    >
      {/* Header */}
      <div className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {getStatusBadge()}
            {demo.isFeatured && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-300 border border-yellow-700/50">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </span>
            )}
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(demo.category)}`}>
              {getCategoryIcon(demo.category)}
              {demo.category.replace('-', ' ')}
            </span>
          </div>
          
          {canManage && (
            <div className="flex items-center">
              {demo.isFeatured ? (
                <button
                  onClick={onToggleFeatured}
                  className="p-1 rounded-full transition-colors text-yellow-400 hover:text-yellow-300 hoverable"
                  title="Remove from featured"
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  onClick={onToggleFeatured}
                  disabled={isFeaturingInProgress}
                  className={`p-1 rounded-full transition-colors hoverable ${
                    isFeaturingInProgress 
                      ? 'text-gray-600 cursor-not-allowed' 
                      : 'text-gray-400 hover:text-yellow-400'
                  }`}
                  title="Add to featured"
                >
                  <Star className="w-4 h-4" />
                  {isFeaturingInProgress && <span className="sr-only">Processing...</span>}
                </button>
              )}
            </div>
          )}
        </div>

        <h3 className="text-lg md:text-xl font-semibold text-white mb-2 line-clamp-2">
          {demo.title}
        </h3>
        
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {demo.description}
        </p>

        {/* Host Info */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-indigo-900/50 rounded-full flex items-center justify-center border border-indigo-700/50">
            <Building className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{demo.hostName}</p>
            <p className="text-xs text-gray-400">{demo.hostTitle} at {demo.hostCompany}</p>
          </div>
        </div>

        {/* Tags */}
        {demo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {demo.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-900/30 text-indigo-300 border border-indigo-700/30"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {demo.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-900/30 text-indigo-300 border border-indigo-700/30">
                +{demo.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="pb-4 space-y-3">
        <div className="flex items-center text-sm text-gray-300">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0 text-indigo-400" />
          <span>{format(demoStart, 'MMM d, yyyy')}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-300">
          <Clock className="w-4 h-4 mr-2 flex-shrink-0 text-indigo-400" />
          <span>{format(demoStart, 'h:mm a')} ({demo.duration} min)</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-300">
          <Users className="w-4 h-4 mr-2 flex-shrink-0 text-indigo-400" />
          <span>{demo.currentAttendees} / {demo.maxAttendees} registered</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-2 border border-gray-700">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isFull ? 'bg-red-600' : 'bg-gradient-to-r from-green-500 to-emerald-500'
            }`}
            style={{
              width: `${Math.min((demo.currentAttendees / demo.maxAttendees) * 100, 100)}%`,
            }}
          />
        </div>

        {/* Recording Info */}
        {demo.recordingUrl && (
          <div className="flex items-center text-sm text-gray-300">
            <Play className="w-4 h-4 mr-2 flex-shrink-0 text-indigo-400" />
            <span>Recording available ({demo.recordingDuration} min)</span>
            {demo.visibilityExpiresAt && (
              <span className="ml-2 text-xs text-orange-400">
                Expires {format(demo.visibilityExpiresAt, 'MMM d')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {/* Primary Actions */}
        {!isCompleted && !isRegistered && !isFull && (
          <GlowButton onClick={onRegister} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hoverable">
            <Users className="w-4 h-4 mr-2" />
            Register for Demo
          </GlowButton>
        )}

        {!isCompleted && isRegistered && !canJoin && (
          <GlowButton variant="outline" disabled className="w-full">
            <Users className="w-4 h-4 mr-2" />
            Registered
          </GlowButton>
        )}

        {canJoin && (
          <GlowButton onClick={onJoin} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hoverable">
            <Video className="w-4 h-4 mr-2" />
            {isLive ? 'Join Live Demo' : 'Join Demo'}
          </GlowButton>
        )}

        {isFull && !isRegistered && (
          <GlowButton variant="outline" disabled className="w-full">
            <Users className="w-4 h-4 mr-2" />
            Demo Full
          </GlowButton>
        )}

        {/* Recording Actions */}
        {demo.recordingUrl && (
          <GlowButton variant="outline" onClick={onViewRecording} className="w-full border-indigo-700/50 text-indigo-300 hover:bg-indigo-900/30 hoverable">
            <Play className="w-4 h-4 mr-2" />
            Watch Recording
          </GlowButton>
        )}

        {/* Management Actions */}
        {canManage && (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            {isCompleted && !demo.recordingUrl && (
              <GlowButton variant="outline" onClick={onUploadRecording} className="flex-1 border-indigo-700/50 text-indigo-300 hover:bg-indigo-900/30 hoverable">
                <Upload className="w-4 h-4 mr-2" />
                Upload Recording
              </GlowButton>
            )}
            
            {demo.recordingUrl && (
              <GlowButton variant="outline" onClick={onViewRecording} className="flex-1 border-indigo-700/50 text-indigo-300 hover:bg-indigo-900/30 hoverable">
                <Eye className="w-4 h-4 mr-2" />
                Manage
              </GlowButton>
            )}

            {!demo.isFeatured && demo.hostId === demo.hostId && (
              <GlowButton 
                variant="outline" 
                onClick={onToggleFeatured} 
                className="flex-1 border-yellow-700/50 text-yellow-300 hover:bg-yellow-900/30 hoverable"
                isLoading={isFeaturingInProgress}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Feature Product
              </GlowButton>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}