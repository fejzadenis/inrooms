import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { Search, UserPlus, MessageSquare, Users, Filter, MapPin, Briefcase, Bell, Clock, Check } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { messageService } from '../../services/messageService';
import { networkService, type NetworkProfile } from '../../services/networkService';
import { ConnectionRequestModal } from '../../components/network/ConnectionRequestModal';
import { PendingConnectionsModal } from '../../components/network/PendingConnectionsModal';
import { connectionService } from '../../services/connectionService';
import { useAuth } from '../../contexts/AuthContext';
import { useTour } from '../../contexts/TourContext';
import { toast } from 'react-hot-toast';

export function NetworkPage() {
  const { user } = useAuth();
  const { askForTourPermission, startTour } = useTour();
  const navigate = useNavigate();
  const [connections, setConnections] = React.useState<NetworkProfile[]>([]);
  const [recommendations, setRecommendations] = React.useState<NetworkProfile[]>([]);
  const [pendingRequestsCount, setPendingRequestsCount] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'connections' | 'discover'>('connections');
  
  // Modal states
  const [isConnectionModalOpen, setIsConnectionModalOpen] = React.useState(false);
  const [isPendingModalOpen, setIsPendingModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<NetworkProfile | null>(null);

  React.useEffect(() => {
    loadNetworkData();
    if (user) {
      loadPendingRequests();
    }
  }, [user]);

  // Check if we should show the network tour
  useEffect(() => {
    const checkTourStatus = async () => {
      if (user && !loading && !connections.length) {
        const shouldStart = await askForTourPermission('network');
        if (shouldStart) {
          console.log("NETWORK DEBUG: Starting network tour based on permission check");
          // Small delay to ensure the UI is fully rendered
          setTimeout(() => {
            startTour('network');
          }, 1000);
        } else {
          console.log("NETWORK DEBUG: Not starting network tour - permission denied");
        }
      }
    };

    checkTourStatus();
  }, [user, loading, askForTourPermission, startTour]);

  const loadNetworkData = async () => {
    if (!user) return;

    console.log("NETWORK DEBUG: Loading network data for user", user.id);
    try {
      setLoading(true);
      
      // Load user's connections
      const userConnections = await networkService.getUserConnectionProfiles(user.id);
      console.log("NETWORK DEBUG: Loaded connections", userConnections.length);
      setConnections(userConnections);
      
      // Load recommended connections
      const recommendedUsers = await networkService.getRecommendedConnections(user.id);
      console.log("NETWORK DEBUG: Loaded recommendations", recommendedUsers.length);
      setRecommendations(recommendedUsers);
      
    } catch (error) {
      console.error('Failed to load network data:', error);
      toast.error('Failed to load network data');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    if (!user) return;
    
    try {
      const incomingRequests = await connectionService.getIncomingConnectionRequests(user.id);
      setPendingRequestsCount(incomingRequests.length);
    } catch (error) {
      console.error('Failed to load pending requests:', error);
    }
  };

  const handleMessage = async (connectionId: string) => {
    if (!user) return;
    
    try {
      // Check if they can message (are connected)
      const canMessage = await messageService.canMessage(user.id, connectionId);
      if (!canMessage) {
        toast.error('You can only message your connections');
        return;
      }

      // Create or get existing chat
      const chatId = await messageService.createChat(user.id, connectionId);
      
      // Navigate to messages page
      navigate('/messages');
      toast.success('Chat opened successfully!');
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat. Please try again.');
    }
  };

  const handleViewProfile = (connectionId: string) => {
    navigate(`/profile/${connectionId}`);
  };

  const handleConnect = (person: NetworkProfile) => {
    setSelectedUser(person);
    setIsConnectionModalOpen(true);
  };

  const handleSearch = async () => {
    if (!user || !searchTerm.trim()) return;

    console.log("NETWORK DEBUG: Searching for", searchTerm);
    try {
      setLoading(true);
      const searchResults = await networkService.searchUsers(searchTerm.trim(), user.id);
      console.log("NETWORK DEBUG: Search results", searchResults.length);
      
      if (activeTab === 'connections') {
        const filteredConnections = searchResults.filter(u => u.connectionStatus === 'connected');
        setConnections(filteredConnections);
      } else {
        const filteredRecommendations = searchResults.filter(u => u.connectionStatus !== 'connected');
        setRecommendations(filteredRecommendations);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (searchTerm) {
      console.log("NETWORK DEBUG: Search term changed, debouncing search");
      const debounceTimer = setTimeout(handleSearch, 500);
      return () => clearTimeout(debounceTimer);
    } else if (user) {
      console.log("NETWORK DEBUG: Search term cleared, reloading network data");
      loadNetworkData();
    }
  }, [searchTerm, activeTab]);

  const filteredConnections = connections.filter(connection =>
    connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.profile_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.profile_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRecommendations = recommendations.filter(rec =>
    rec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.profile_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.profile_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading your network...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" data-tour="network-header">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Network</h1>
            <p className="text-gray-600 mt-2">Connect with founders, operators, and future builders turning bold ideas into real startups.</p>
          </div>
          <div className="flex space-x-4 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={() => setIsPendingModalOpen(true)}
              className="flex-1 md:flex-auto relative"
            >
              <Clock className="w-4 h-4 mr-2" />
              Pending Requests
              {pendingRequestsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {pendingRequestsCount}
                </span>
              )}
            </Button>
            <Button variant="outline" className="flex-1 md:flex-auto">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <div className="relative" data-tour="network-search">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by name, company, title, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
          />
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Connections</p>
                <p className="text-3xl font-bold">{connections.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Pending Requests</p>
                <p className="text-3xl font-bold">{pendingRequestsCount}</p>
              </div>
              <Bell className="w-8 h-8 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Messages Sent</p>
                <p className="text-3xl font-bold">48</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200" data-tour="network-tabs">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('connections')}
              className={`${
                activeTab === 'connections'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              My Connections ({connections.length})
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`${
                activeTab === 'discover'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Discover People ({recommendations.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'connections' ? (
            filteredConnections.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  {searchTerm ? 'No connections found' : 'No connections yet'}
                </h3>
                <p className="text-gray-500 mt-2">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Start connecting with other professionals to build your network'}
                </p>
                {!searchTerm && (
                  <Button 
                    className="mt-4"
                    onClick={() => setActiveTab('discover')}
                  >
                    Discover People
                  </Button>
                )}
              </div>
            ) : (
              filteredConnections.map((connection, index) => (
                <div 
                  key={connection.id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                  data-tour={index === 0 ? "connection-card" : undefined}
                >
                  <div className="flex items-start space-x-4">
                    {connection.photo_url ? (
                      <img
                        src={connection.photo_url}
                        alt={connection.name}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Users className="h-8 w-8 text-indigo-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{connection.name}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Briefcase className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{connection.profile_title || 'Professional'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span className="truncate">{connection.profile_company || 'Company'}</span>
                      </div>
                      {connection.profile_location && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{connection.profile_location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {connection.profile_skills && connection.profile_skills.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-1">
                        {connection.profile_skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {skill}
                          </span>
                        ))}
                        {connection.profile_skills.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{connection.profile_skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 flex space-x-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleMessage(connection.id)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => handleViewProfile(connection.id)}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              ))
            )
          ) : (
            filteredRecommendations.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  {searchTerm ? 'No people found' : 'No recommendations available'}
                </h3>
                <p className="text-gray-500 mt-2">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Complete your profile to get better recommendations'}
                </p>
                {!searchTerm && (
                  <Button 
                    className="mt-4"
                    onClick={() => navigate('/profile')}
                  >
                    Complete Profile
                  </Button>
                )}
              </div>
            ) : (
              filteredRecommendations.map((person, index) => (
                <div 
                  key={person.id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                  data-tour={index === 0 ? "connection-card" : undefined}
                >
                  <div className="flex items-start space-x-4">
                    {person.photo_url ? (
                      <img
                        src={person.photo_url}
                        alt={person.name}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{person.name}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Briefcase className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{person.profile_title || 'Professional'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span className="truncate">{person.profile_company || 'Company'}</span>
                      </div>
                      {person.profile_location && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{person.profile_location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {person.profile_skills && person.profile_skills.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-1">
                        {person.profile_skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {skill}
                          </span>
                        ))}
                        {person.profile_skills.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{person.profile_skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 flex space-x-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleViewProfile(person.id)}
                    >
                      View Profile
                    </Button>
                    
                    {person.connectionStatus === 'none' && (
                      <Button 
                        className="flex-1"
                        onClick={() => handleConnect(person)}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                    )}
                    
                    {person.connectionStatus === 'pending_sent' && (
                      <Button 
                        variant="outline"
                        className="flex-1"
                        disabled
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Request Sent
                      </Button>
                    )}
                    
                    {person.connectionStatus === 'pending_received' && (
                      <Button 
                        className="flex-1"
                        onClick={() => setIsPendingModalOpen(true)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accept Request
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* Modals */}
      <ConnectionRequestModal
        isOpen={isConnectionModalOpen}
        onClose={() => {
          setIsConnectionModalOpen(false);
          setSelectedUser(null);
        }}
        targetUser={selectedUser}
        onSuccess={() => {
          loadNetworkData();
          loadPendingRequests();
        }}
      />

      <PendingConnectionsModal
        isOpen={isPendingModalOpen}
        onClose={() => setIsPendingModalOpen(false)}
        onSuccess={() => {
          loadNetworkData();
          loadPendingRequests();
        }}
      />
    </MainLayout>
  );
}