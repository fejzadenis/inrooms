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
import { Button } from '../common/Button';
import { motion } from 'framer-motion';
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
  const isFeaturedExpired = demo.featuredUntil && isAfter(now, new Date(demo.featuredUntil));
  const canJoin = isRegistered && (isLive || (isUpcoming && isBefore(now, addMinutes(demoStart, 15))));
  const isFull = demo.currentAttendees >= demo.maxAttendees;

  const getStatusBadge = () => {
    if (isLive) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
          Live Now
        </span>
      );
    }
    if (isUpcoming) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Calendar className="w-3 h-3 mr-1" />
          Upcoming
        </span>
      );
    }
    if (isCompleted) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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
        return 'bg-blue-100 text-blue-800';
      case 'solution-showcase':
        return 'bg-green-100 text-green-800';
      case 'case-study':
        return 'bg-purple-100 text-purple-800';
      case 'training':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-xl border-2 p-4 md:p-6 transition-all duration-200 hover:shadow-xl ${
        demo.isFeatured && !isFeaturedExpired 
          ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50' 
          : 'border-gray-200 bg-white'
      }`}
    >
      {/* Header */}
      <div className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {getStatusBadge()}
            {demo.isFeatured && !isFeaturedExpired && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </span>
            )}
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(demo.category)}`}>
              {getCategoryIcon(demo.category)}
              {demo.category.replace('-', ' ')}
            </span>
          </div>
          
          {canManage && (
            <div className="flex items-center">
              {demo.isFeatured && !isFeaturedExpired ? (
                <button
                  onClick={onToggleFeatured}
                  className="p-1 rounded-full transition-colors text-yellow-500 hover:text-yellow-600"
                  title="Remove from featured"
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  onClick={onToggleFeatured}
                  disabled={isFeaturingInProgress}
                  className={`p-1 rounded-full transition-colors ${
                    isFeaturingInProgress 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-400 hover:text-yellow-500'
                  }`}
                  title="Add to featured"
                >
                  <Star className="w-4 h-4" />
                  {isFeaturingInProgress && <span className="sr-only">Processing...</span>}
                </button>
              )}
            </div>
              {(!demo.isFeatured || isFeaturedExpired) && demo.hostId === demo.hostId && (
        </div>
              <p className="text-xs text-gray-500">{demo.hostTitle} • {demo.hostCompany}</p>
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {demo.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {demo.description}
        </p>

        {/* Host Info */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <Building className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{demo.hostName}</p>
            <p className="text-xs text-gray-500">{demo.hostTitle} at {demo.hostCompany}</p>
          </div>
        </div>

        {/* Tags */}
        {demo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {demo.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {demo.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700">
                +{demo.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="pb-4 space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{format(demoStart, 'MMM d, yyyy')}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{format(demoStart, 'h:mm a')} ({demo.duration} min)</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{demo.currentAttendees} / {demo.maxAttendees} registered</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isFull ? 'bg-red-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'
            }`}
            style={{
              width: `${Math.min((demo.currentAttendees / demo.maxAttendees) * 100, 100)}%`,
            }}
          />
        </div>

        {/* Recording Info */}
        {demo.recordingUrl && (
          <div className="flex items-center text-sm text-gray-600">
            <Play className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Recording available ({demo.recordingDuration} min)</span>
            {demo.visibilityExpiresAt && (
              <span className="ml-2 text-xs text-orange-600">
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
          <Button onClick={onRegister} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              Register for Showcase
            Register for Demo
          </Button>
        )}

        {!isCompleted && isRegistered && !canJoin && (
          <Button variant="outline" disabled className="w-full">
            <Users className="w-4 h-4 mr-2" />
            Registered
          </Button>
        )}

        {canJoin && (
          <Button onClick={onJoin} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              {isLive ? 'Join Live Showcase' : 'Join Showcase'}
            {isLive ? 'Join Live Demo' : 'Join Demo'}
          </Button>
        )}

        {isFull && !isRegistered && (
          <Button variant="outline" disabled className="w-full">
              Showcase Full
            Demo Full
          </Button>
        )}

        {/* Recording Actions */}
        {demo.recordingUrl && (
          <Button variant="outline" onClick={onViewRecording} className="w-full border-indigo-200 text-indigo-600 hover:bg-indigo-50">
            <Play className="w-4 h-4 mr-2" />
            Watch Recording
          </Button>
        )}

        {/* Management Actions */}
        {canManage && (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            {isCompleted && !demo.recordingUrl && (
              <Button variant="outline" onClick={onUploadRecording} className="flex-1 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                <Upload className="w-4 h-4 mr-2" />
                Upload Recording
              </Button>
            )}
            
            {demo.recordingUrl && (
              <Button variant="outline" onClick={onViewRecording} className="flex-1 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                <Eye className="w-4 h-4 mr-2" />
                Manage
              </Button>
            )}

            {!demo.isFeatured && demo.hostId === demo.hostId && (
              <Button 
                variant="outline" 
                onClick={onToggleFeatured} 
                className="flex-1 border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                isLoading={isFeaturingInProgress}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Feature Product
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}