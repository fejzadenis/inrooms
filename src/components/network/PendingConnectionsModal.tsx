import React from 'react';
import { X, UserPlus, Check, X as XIcon, Clock, Calendar } from 'lucide-react';
import { Button } from '../common/Button';
import { connectionService } from '../../services/connectionService';
import { networkService } from '../../services/networkService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import type { ConnectionRequest } from '../../types/connections';
import type { NetworkProfile } from '../../services/networkService';

interface PendingConnectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PendingConnectionsModal({
  isOpen,
  onClose,
  onSuccess
}: PendingConnectionsModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'received' | 'sent'>('received');
  const [receivedRequests, setReceivedRequests] = React.useState<ConnectionRequest[]>([]);
  const [sentRequests, setSentRequests] = React.useState<ConnectionRequest[]>([]);
  const [userProfiles, setUserProfiles] = React.useState<Record<string, NetworkProfile>>({});
  const [loading, setLoading] = React.useState(true);
  const [processingRequestIds, setProcessingRequestIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (isOpen && user) {
      loadConnectionRequests();
    }
  }, [isOpen, user]);

  const loadConnectionRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load incoming and outgoing requests
      const [incoming, outgoing] = await Promise.all([
        connectionService.getIncomingConnectionRequests(user.id),
        connectionService.getOutgoingConnectionRequests(user.id)
      ]);
      
      setReceivedRequests(incoming);
      setSentRequests(outgoing);
      
      // Get user profiles for all requests
      const userIds = new Set<string>();
      incoming.forEach(req => userIds.add(req.fromUserId));
      outgoing.forEach(req => userIds.add(req.toUserId));
      
      const profiles: Record<string, NetworkProfile> = {};
      
      // Fetch profiles in batches to avoid excessive reads
      const batchSize = 10;
      const userIdArray = Array.from(userIds);
      
      for (let i = 0; i < userIdArray.length; i += batchSize) {
        const batch = userIdArray.slice(i, i + batchSize);
        const batchPromises = batch.map(async (userId) => {
          try {
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
              const data = userDoc.data();
              return {
                id: userDoc.id,
                name: data.name || '',
                email: data.email || '',
                role: data.role || 'user',
                profile_title: data.profile?.title || '',
                profile_company: data.profile?.company || '',
                profile_location: data.profile?.location || '',
                profile_about: data.profile?.about || '',
                profile_skills: data.profile?.skills || [],
                photo_url: data.photoURL || '',
                connections: data.connections || []
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching profile for user ${userId}:`, error);
            return null;
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        
        batchResults.forEach(profile => {
          if (profile) {
            profiles[profile.id] = profile;
          }
        });
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
    if (!user) return;

    try {
      setProcessingRequestIds(prev => [...prev, requestId]);
      await connectionService.acceptConnectionRequest(requestId);
      
      // Update local state
      setReceivedRequests(prev => prev.filter(req => req.id !== requestId));
      
      toast.success('Connection request accepted');
      onSuccess();
    } catch (error) {
      console.error('Error accepting connection request:', error);
      toast.error('Failed to accept connection request');
    } finally {
      setProcessingRequestIds(prev => prev.filter(id => id !== requestId));
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!user) return;

    try {
      setProcessingRequestIds(prev => [...prev, requestId]);
      await connectionService.rejectConnectionRequest(requestId);
      
      // Update local state
      setReceivedRequests(prev => prev.filter(req => req.id !== requestId));
      
      toast.success('Connection request rejected');
    } catch (error) {
      console.error('Error rejecting connection request:', error);
      toast.error('Failed to reject connection request');
    } finally {
      setProcessingRequestIds(prev => prev.filter(id => id !== requestId));
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!user) return;

    try {
      setProcessingRequestIds(prev => [...prev, requestId]);
      await connectionService.cancelConnectionRequest(requestId);
      
      // Update local state
      setSentRequests(prev => prev.filter(req => req.id !== requestId));
      
      toast.success('Connection request canceled');
    } catch (error) {
      console.error('Error canceling connection request:', error);
      toast.error('Failed to cancel connection request');
    } finally {
      setProcessingRequestIds(prev => prev.filter(id => id !== requestId));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Connection Requests</h2>
              <p className="text-gray-600 mt-1">Manage your pending connection requests</p>
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
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('received')}
                className={`${
                  activeTab === 'received'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Received ({receivedRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`${
                  activeTab === 'sent'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Clock className="w-4 h-4 mr-2" />
                Sent ({sentRequests.length})
              </button>
            </nav>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading connection requests...</p>
            </div>
          ) : activeTab === 'received' ? (
            receivedRequests.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No pending requests</h3>
                <p className="text-gray-500 mt-2">You don't have any pending connection requests</p>
              </div>
            ) : (
              <div className="space-y-6">
                {receivedRequests.map((request) => {
                  const sender = userProfiles[request.fromUserId];
                  const isProcessing = processingRequestIds.includes(request.id!);
                  
                  return (
                    <div key={request.id} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          {sender?.photo_url ? (
                            <img
                              src={sender.photo_url}
                              alt={sender.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                              <UserPlus className="h-6 w-6 text-indigo-600" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium text-gray-900">{sender?.name || 'Unknown User'}</h3>
                            {sender?.profile_title && (
                              <p className="text-sm text-gray-500">
                                {sender.profile_title} {sender.profile_company ? `at ${sender.profile_company}` : ''}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              Sent {format(request.createdAt, 'MMM d, yyyy')}
                            </p>
                            {request.message && (
                              <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded-md">
                                "{request.message}"
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectRequest(request.id!)}
                            isLoading={isProcessing}
                            disabled={isProcessing}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRequest(request.id!)}
                            isLoading={isProcessing}
                            disabled={isProcessing}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            sentRequests.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No pending requests</h3>
                <p className="text-gray-500 mt-2">You haven't sent any connection requests</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sentRequests.map((request) => {
                  const recipient = userProfiles[request.toUserId];
                  const isProcessing = processingRequestIds.includes(request.id!);
                  
                  return (
                    <div key={request.id} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          {recipient?.photo_url ? (
                            <img
                              src={recipient.photo_url}
                              alt={recipient.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                              <UserPlus className="h-6 w-6 text-indigo-600" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium text-gray-900">{recipient?.name || 'Unknown User'}</h3>
                            {recipient?.profile_title && (
                              <p className="text-sm text-gray-500">
                                {recipient.profile_title} {recipient.profile_company ? `at ${recipient.profile_company}` : ''}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              Sent {format(request.createdAt, 'MMM d, yyyy')}
                            </p>
                            {request.message && (
                              <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded-md">
                                "{request.message}"
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelRequest(request.id!)}
                            isLoading={isProcessing}
                            disabled={isProcessing}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}