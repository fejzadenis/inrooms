import React, { useState } from 'react';
import { X, User, Send } from 'lucide-react';
import { connectionService } from '../../services/connectionService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import type { NetworkProfile } from '../../services/networkService';

interface ConnectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: NetworkProfile | null;
  onConnectionSent: () => void;
}

export function ConnectionRequestModal({
  isOpen,
  onClose,
  targetUser,
  onConnectionSent
}: ConnectionRequestModalProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !targetUser) {
      toast.error('Missing user information');
      return;
    }

    if (!user.uid || !targetUser.id) {
      toast.error('Both fromUserId and toUserId are required');
      return;
    }

    try {
      setLoading(true);
      
      await connectionService.sendConnectionRequest(
        user.uid,
        targetUser.id,
        message.trim() || undefined
      );
      
      onConnectionSent();
      setMessage('');
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send connection request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !targetUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Send Connection Request</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Target User Info */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              {targetUser.photo_url ? (
                <img
                  src={targetUser.photo_url}
                  alt={targetUser.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="font-medium">{targetUser.name}</h3>
              {targetUser.profile_title && (
                <p className="text-sm text-gray-600">{targetUser.profile_title}</p>
              )}
              {targetUser.profile_company && (
                <p className="text-sm text-gray-500">{targetUser.profile_company}</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Personal Message (Optional)
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi! I'd like to connect with you on inRooms..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {message.length}/500 characters
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}