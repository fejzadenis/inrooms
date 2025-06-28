import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, UserPlus, Users, Filter, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { networkService, type NetworkProfile } from '../../services/networkService';
import { connectionService } from '../../services/connectionService';
import { messageService } from '../../services/messageService';
import { ConnectionRequestModal } from '../../components/network/ConnectionRequestModal';
import { PendingConnectionsModal } from '../../components/network/PendingConnectionsModal';
import { MainLayout } from '../../layouts/MainLayout';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function NetworkPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<NetworkProfile[]>([]);
  const [connections, setConnections] = useState<NetworkProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'discover' | 'connections'>('discover');
  const [selectedUser, setSelectedUser] = useState<NetworkProfile | null>(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [filterBy, setFilterBy] = useState<'all' | 'title' | 'company' | 'skills'>('all');

  useEffect(() => {
    if (user?.id) {
      loadData();
      loadPendingCount();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      if (activeTab === 'discover') {
        if (searchTerm.trim()) {
          const searchResults = await networkService.searchUsers(searchTerm, user.id);
          setUsers(searchResults);
        } else {
          const allUsers = await networkService.getNetworkUsers(user.id);
          setUsers(allUsers);
        }
      } else {
        const userConnections = await networkService.getUserConnectionProfiles(user.id);
        setConnections(userConnections);
      }
    } catch (error) {
      console.error('Error loading network data:', error);
      toast.error('Failed to load network data');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingCount = async () => {
    if (!user?.id) return;
    
    try {
      const pendingRequests = await connectionService.getIncomingConnectionRequests(user.id);
      setPendingCount(pendingRequests.length);
    } catch (error) {
      console.error('Error loading pending count:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, searchTerm]);

  const handleConnect = (targetUser: NetworkProfile) => {
    setSelectedUser(targetUser);
    setShowConnectionModal(true);
  };

  const handleMessage = async (targetUser: NetworkProfile) => {
    if (!user?.id) {
      toast.error('You must be logged in to send messages');
      return;
    }

    try {
      // Check if users are connected first
      const canMessage = await messageService.canMessage(user.id, targetUser.id);
      if (!canMessage) {
        toast.error('You can only message your connections');
        return;
      }

      // Get or create chat
      const chatId = await messageService.getOrCreateChat(user.id, targetUser.id);
      
      // Navigate to messages page with the chat
      navigate('/messages', { state: { chatId, targetUser } });
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start chat');
    }
  };

  const handleConnectionSuccess = () => {
    setShowConnectionModal(false);
    setSelectedUser(null);
    loadData();
    toast.success('Connection request sent!');
  };

  const handlePendingUpdate = () => {
    loadPendingCount();
    loadData();
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    
    switch (filterBy) {
      case 'title':
        return user.profile_title?.toLowerCase().includes(search);
      case 'company':
        return user.profile_company?.toLowerCase().includes(search);
      case 'skills':
        return user.profile_skills?.some(skill => skill.toLowerCase().includes(search));
      default:
        return (
          user.name?.toLowerCase().includes(search) ||
          user.profile_title?.toLowerCase().includes(search) ||
          user.profile_company?.toLowerCase().includes(search) ||
          user.profile_skills?.some(skill => skill.toLowerCase().includes(search))
        );
    }
  });

  const filteredConnections = connections.filter(connection => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      connection.name?.toLowerCase().includes(search) ||
      connection.profile_title?.toLowerCase().includes(search) ||
      connection.profile_company?.toLowerCase().includes(search)
    );
  });

  const getConnectionButtonText = (status?: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'pending_sent':
        return 'Request Sent';
      case 'pending_received':
        return 'Accept Request';
      default:
        return 'Connect';
    }
  };

  const getConnectionButtonColor = (status?: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending_sent':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'pending_received':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Network</h1>
              <p className="text-gray-600 mt-2">Connect with sales professionals and grow your network</p>
            </div>
            
            <button
              onClick={() => setShowPendingModal(true)}
              className="relative bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Users className="h-5 w-5" />
              Pending Requests
              {pendingCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
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
              My Connections ({connections.length})
            </button>
          </nav>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={activeTab === 'discover' ? "Search by name, title, company, or skills..." : "Search your connections..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {activeTab === 'discover' && (
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Fields</option>
                <option value="title">Job Title</option>
                <option value="company">Company</option>
                <option value="skills">Skills</option>
              </select>
            </div>
          )}
        </div>

        {/* Content */}
        {activeTab === 'discover' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((networkUser) => (
              <div key={networkUser.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {networkUser.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{networkUser.name}</h3>
                      <p className="text-sm text-gray-600">{networkUser.profile_title}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {networkUser.profile_company && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Company:</span> {networkUser.profile_company}
                    </p>
                  )}
                  {networkUser.profile_location && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Location:</span> {networkUser.profile_location}
                    </p>
                  )}
                  {networkUser.profile_skills && networkUser.profile_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {networkUser.profile_skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {networkUser.profile_skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{networkUser.profile_skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleConnect(networkUser)}
                    disabled={networkUser.connectionStatus === 'connected' || networkUser.connectionStatus === 'pending_sent'}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${getConnectionButtonColor(networkUser.connectionStatus)}`}
                  >
                    <UserPlus className="h-4 w-4 inline mr-1" />
                    {getConnectionButtonText(networkUser.connectionStatus)}
                  </button>
                  
                  {networkUser.connectionStatus === 'connected' && (
                    <button
                      onClick={() => handleMessage(networkUser)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConnections.map((connection) => (
              <div key={connection.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-lg">
                        {connection.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{connection.name}</h3>
                      <p className="text-sm text-gray-600">{connection.profile_title}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {connection.profile_company && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Company:</span> {connection.profile_company}
                    </p>
                  )}
                  {connection.profile_location && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Location:</span> {connection.profile_location}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleMessage(connection)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty States */}
        {activeTab === 'discover' && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new members'}
            </p>
          </div>
        )}

        {activeTab === 'connections' && filteredConnections.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No connections yet</h3>
            <p className="text-gray-600">
              {searchTerm ? 'No connections match your search' : 'Start connecting with other professionals to build your network'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setActiveTab('discover')}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Discover People
              </button>
            )}
          </div>
        )}

        {/* Modals */}
        {showConnectionModal && selectedUser && (
          <ConnectionRequestModal
            isOpen={showConnectionModal}
            onClose={() => {
              setShowConnectionModal(false);
              setSelectedUser(null);
            }}
            targetUser={selectedUser}
            onSuccess={handleConnectionSuccess}
          />
        )}

        {showPendingModal && (
          <PendingConnectionsModal
            isOpen={showPendingModal}
            onClose={() => setShowPendingModal(false)}
            onUpdate={handlePendingUpdate}
          />
        )}
      </div>
    </MainLayout>
  );
}