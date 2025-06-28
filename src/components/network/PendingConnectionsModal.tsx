import React, { useState, useEffect } from 'react';
import { X, User, Check, X as XIcon, Clock, MessageSquare } from 'lucide-react';
import { connectionService } from '../../services/connectionService';
import { useAuth } from '../../contexts/AuthContext';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';
import type { ConnectionRequest } from '../../types/connections';

interface PendingConnectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestProcessed?: () => void;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profile_title?: string;
  profile_company?: string;
  photo_url?: string;
}

export function PendingConnectionsModal({ 
  isOpen, 
  onClose, 
  onRequestProcessed 
}: PendingConnectionsModalProps) {
  const { user } = useAuth();
  const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequest[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && user) {
      loadConnectionRequests();
    }
  }, [isOpen, user]);

  const loadConnectionRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const [incoming, outgoing] = await Promise.all([
        connectionService.getIncomingConnectionRequests(user.uid),
        connectionService.getOutgoingConnectionRequests(user.uid)
      ]);

      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);

      // Load user profiles for all requests
      const allUserIds = new Set<string>();
      incoming.forEach(req => allUserIds.add(req.fromUserId));
      outgoing.forEach(req => allUserIds.add(req.toUserId));

      const profiles: Record<string, UserProfile> = {};
      
      for (const userId of allUserIds) {
        try {
          const userRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            profiles[userId] = {
              id: userId,
              name: userData.name || 'Unknown User',
              email: userData.email || '',
              profile_title: userData.profile_title || userData.profile?.title || '',
              profile_company: userData.profile_company || userData.profile?.company || '',
              photo_url: userData.photo_url || userData.photoURL || ''
            };
          }
        } catch (error) {
          console.error(`Error fetching profile for user ${userId}:`, error);
          // Add a fallback profile
          profiles[userId] = {
            id: userId,
            name: 'Unknown User',
            email: '',
            profile_title: '',
            profile_company: '',
            photo_url: ''
          };
        }
      }

      setUserProfiles(profiles);
    } catch (error) {
      console.error('Error loading connection requests:', error);
      toast.error('Failed to load connection requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setProcessingRequests(prev => new Set(prev).add(requestId));
      
      await connectionService.acceptConnectionRequest(requestId);
      toast.success('Connection request accepted!');
      
      // Refresh the requests
      await loadConnectionRequests();
      onRequestProcessed?.();
    } catch (error) {
      console.error('Error accepting connection request:', error);
      toast.error('Failed to accept connection request');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setProcessingRequests(prev => new Set(prev).add(requestId));
      
      await connectionService.rejectConnectionRequest(requestId);
      toast.success('Connection request rejected');
      
      // Refresh the requests
      await loadConnectionRequests();
      onRequestProcessed?.();
    } catch (error) {
      console.error('Error rejecting connection request:', error);
      toast.error('Failed to reject connection request');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      setProcessingRequests(prev => new Set(prev).add(requestId));
      
      await connectionService.cancelConnectionRequest(requestId);
      toast.success('Connection request cancelled');
      
      // Refresh the requests
      await loadConnectionRequests();
      onRequestProcessed?.();
    } catch (error) {
      console.error('Error cancelling connection request:', error);
      toast.error('Failed to cancel connection request');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Pending Connection Requests</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Incoming Requests */}
              {incomingRequests.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                    Incoming Requests ({incomingRequests.length})
                  </h3>
                  <div className="space-y-4">
                    {incomingRequests.map((request) => {
                      const profile = userProfiles[request.fromUserId];
                      const isProcessing = processingRequests.has(request.id!);
                      
                      return (
                        <div key={request.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                {profile?.photo_url ? (
                                  <img
                                    src={profile.photo_url}
                                    alt={profile.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                  />
                                ) : (
                                  <User className="h-6 w-6 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">{profile?.name || 'Loading...'}</h4>
                                {profile?.profile_title && (
                                  <p className="text-sm text-gray-600">{profile.profile_title}</p>
                                )}
                                {profile?.profile_company && (
                                  <p className="text-sm text-gray-500">{profile.profile_company}</p>
                                )}
                                {request.message && (
                                  <p className="text-sm text-gray-700 mt-2 italic">"{request.message}"</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                  {request.createdAt.toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleAcceptRequest(request.id!)}
                                disabled={isProcessing}
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Accept
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.id!)}
                                disabled={isProcessing}
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                              >
                                <XIcon className="h-4 w-4 mr-1" />
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Outgoing Requests */}
              {outgoingRequests.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-orange-600" />
                    Sent Requests ({outgoingRequests.length})
                  </h3>
                  <div className="space-y-4">
                    {outgoingRequests.map((request) => {
                      const profile = userProfiles[request.toUserId];
                      const isProcessing = processingRequests.has(request.id!);
                      
                      return (
                        <div key={request.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                {profile?.photo_url ? (
                                  <img
                                    src={profile.photo_url}
                                    alt={profile.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                  />
                                ) : (
                                  <User className="h-6 w-6 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">{profile?.name || 'Loading...'}</h4>
                                {profile?.profile_title && (
                                  <p className="text-sm text-gray-600">{profile.profile_title}</p>
                                )}
                                {profile?.profile_company && (
                                  <p className="text-sm text-gray-500">{profile.profile_company}</p>
                                )}
                                {request.message && (
                                  <p className="text-sm text-gray-700 mt-2 italic">"{request.message}"</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                  Sent {request.createdAt.toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleCancelRequest(request.id!)}
                              disabled={isProcessing}
                              className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && incomingRequests.length === 0 && outgoingRequests.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                  <p className="text-gray-500">
                    You don't have any pending connection requests at the moment.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}