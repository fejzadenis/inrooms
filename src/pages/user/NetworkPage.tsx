import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Users, Search, UserPlus, MessageSquare, Bell, Filter } from 'lucide-react';
import { networkService, type NetworkProfile } from '../../services/networkService';
import { connectionService } from '../../services/connectionService';
import { useAuth } from '../../contexts/AuthContext';
import { ConnectionRequestModal } from '../../components/network/ConnectionRequestModal';
import { PendingConnectionsModal } from '../../components/network/PendingConnectionsModal';
import { NavigationBadge } from '../../components/layout/NavigationBadge';
import { useConnectionRequests } from '../../hooks/useConnectionRequests';
import { useNotifications } from '../../hooks/useNotifications';
import toast from 'react-hot-toast';

export function NetworkPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<NetworkProfile[]>([]);
  const [connections, setConnections] = useState<NetworkProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'discover' | 'connections'>('discover');
  const [selectedUser, setSelectedUser] = useState<NetworkProfile | null>(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [processingConnections, setProcessingConnections] = useState<Set<string>>(new Set());

  // Use custom hooks for counters
  const { pendingCount, refreshRequests } = useConnectionRequests(user?.uid || null);
  const { unreadCount } = useNotifications(user?.uid || null);

  useEffect(() => {
    if (user) {
      loadNetworkData();
    }
  }, [user]);

  const loadNetworkData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      if (activeTab === 'discover') {
        const networkUsers = await networkService.getNetworkUsers(user.uid);
        setUsers(networkUsers);
      } else {
        const userConnections = await networkService.getUserConnectionProfiles(user.uid);
        setConnections(userConnections);
      }
    } catch (error) {
      console.error('Error loading network data:', error);
      toast.error('Failed to load network data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNetworkData();
  }, [activeTab]);

  const handleSearch = async () => {
    if (!user || !searchTerm.trim()) {
      loadNetworkData();
      return;
    }

    try {
      setLoading(true);
      const searchResults = await networkService.searchUsers(searchTerm, user.uid);
      setUsers(searchResults);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (user: NetworkProfile) => {
    setSelectedUser(user);
    setShowConnectionModal(true);
  };

  const handleConnectionSent = () => {
    setShowConnectionModal(false);
    setSelectedUser(null);
    loadNetworkData();
    refreshRequests();
    toast.success('Connection request sent!');
  };

  const handleRemoveConnection = async (userId: string) => {
    if (!user) return;

    try {
      setProcessingConnections(prev => new Set(prev).add(userId));
      await connectionService.removeConnection(user.uid, userId);
      toast.success('Connection removed');
      loadNetworkData();
    } catch (error) {
      console.error('Error removing connection:', error);
      toast.error('Failed to remove connection');
    } finally {
      setProcessingConnections(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const renderUserCard = (profile: NetworkProfile) => {
    const isProcessing = processingConnections.has(profile.id);

    return (
      <div key={profile.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            {profile.photo_url ? (
              <img
                src={profile.photo_url}
                alt={profile.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <Users className="h-8 w-8 text-gray-400" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
            {profile.profile_title && (
              <p className="text-sm text-gray-600">{profile.profile_title}</p>
            )}
            {profile.profile_company && (
              <p className="text-sm text-gray-500">{profile.profile_company}</p>
            )}
            {profile.profile_location && (
              <p className="text-sm text-gray-500">{profile.profile_location}</p>
            )}
            
            {profile.profile_skills && profile.profile_skills.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {profile.profile_skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {profile.profile_skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{profile.profile_skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          {activeTab === 'discover' ? (
            <>
              {profile.connectionStatus === 'connected' && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Connected
                </span>
              )}
              {profile.connectionStatus === 'pending_sent' && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                  Request Sent
                </span>
              )}
              {profile.connectionStatus === 'pending_received' && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  Request Received
                </span>
              )}
              {profile.connectionStatus === 'none' && (
                <button
                  onClick={() => handleConnect(profile)}
                  disabled={isProcessing}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Connect
                </button>
              )}
            </>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => handleRemoveConnection(profile.id)}
                disabled={isProcessing}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Network</h1>
              <p className="text-gray-600 mt-2">
                Connect with sales professionals and grow your network
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications Button */}
              <button
                onClick={() => window.location.href = '/notifications'}
                className="relative bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors flex items-center"
              >
                <Bell className="h-5 w-5 text-gray-600 mr-2" />
                Notifications
                <NavigationBadge count={unreadCount} />
              </button>

              {/* Pending Requests Button */}
              <button
                onClick={() => setShowPendingModal(true)}
                className="relative bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Pending Requests
                <NavigationBadge count={pendingCount} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('discover')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'discover'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Discover People
              </button>
              <button
                onClick={() => setActiveTab('connections')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'connections'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Connections
              </button>
            </nav>
          </div>
        </div>

        {/* Search Bar */}
        {activeTab === 'discover' && (
          <div className="mb-6">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, company, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'discover' 
              ? users.map(renderUserCard)
              : connections.map(renderUserCard)
            }
          </div>
        )}

        {/* Empty States */}
        {!loading && activeTab === 'discover' && users.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Start by searching for people to connect with.'}
            </p>
          </div>
        )}

        {!loading && activeTab === 'connections' && connections.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No connections yet</h3>
            <p className="text-gray-500">
              Start building your network by connecting with other professionals.
            </p>
            <button
              onClick={() => setActiveTab('discover')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Discover People
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <ConnectionRequestModal
        isOpen={showConnectionModal}
        onClose={() => {
          setShowConnectionModal(false);
          setSelectedUser(null);
        }}
        targetUser={selectedUser}
        onConnectionSent={handleConnectionSent}
      />

      <PendingConnectionsModal
        isOpen={showPendingModal}
        onClose={() => setShowPendingModal(false)}
        onRequestProcessed={() => {
          refreshRequests();
          loadNetworkData();
        }}
      />
    </MainLayout>
  );
}