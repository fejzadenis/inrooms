import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { Search, UserPlus, MessageSquare, Users, Filter, MapPin, Briefcase } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { messageService } from '../../services/messageService';
import { networkService, type NetworkProfile } from '../../services/networkService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export function NetworkPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = React.useState<NetworkProfile[]>([]);
  const [recommendations, setRecommendations] = React.useState<NetworkProfile[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'connections' | 'discover'>('connections');
  const [connectionIds, setConnectionIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (user) {
      loadNetworkData();
    }
  }, [user]);

  const loadNetworkData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load user's connection IDs
      const userConnectionIds = await networkService.getUserConnections(user.id);
      setConnectionIds(userConnectionIds);
      
      // Load all network users
      const allUsers = await networkService.getNetworkUsers(user.id);
      
      // Separate connections from recommendations
      const userConnections = allUsers.filter(u => userConnectionIds.includes(u.id));
      const userRecommendations = allUsers.filter(u => !userConnectionIds.includes(u.id));
      
      setConnections(userConnections);
      setRecommendations(userRecommendations.slice(0, 20)); // Limit recommendations
      
    } catch (error) {
      console.error('Failed to load network data:', error);
      toast.error('Failed to load network data');
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async (connectionId: string) => {
    if (!user) return;
    
    try {
      // Create or get existing chat
      await messageService.sendMessage(user.id, connectionId, '👋 Hi there!');
      navigate('/messages');
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat. Please try again.');
    }
  };

  const handleViewProfile = (connectionId: string) => {
    navigate(`/profile/${connectionId}`);
  };

  const handleConnect = async (targetUserId: string) => {
    if (!user) return;

    try {
      await networkService.addConnection(user.id, targetUserId);
      toast.success('Connection added successfully!');
      
      // Move user from recommendations to connections
      const connectedUser = recommendations.find(rec => rec.id === targetUserId);
      if (connectedUser) {
        setConnections(prev => [...prev, connectedUser]);
        setRecommendations(prev => prev.filter(rec => rec.id !== targetUserId));
        setConnectionIds(prev => [...prev, targetUserId]);
      }
    } catch (error) {
      console.error('Error adding connection:', error);
      toast.error('Failed to add connection. Please try again.');
    }
  };

  const handleSearch = async () => {
    if (!user || !searchTerm.trim()) return;

    try {
      const searchResults = await networkService.searchUsers(searchTerm.trim(), user.id);
      if (activeTab === 'connections') {
        const filteredConnections = searchResults.filter(u => connectionIds.includes(u.id));
        setConnections(filteredConnections);
      } else {
        const filteredRecommendations = searchResults.filter(u => !connectionIds.includes(u.id));
        setRecommendations(filteredRecommendations);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Search failed. Please try again.');
    }
  };

  React.useEffect(() => {
    if (searchTerm) {
      const debounceTimer = setTimeout(handleSearch, 500);
      return () => clearTimeout(debounceTimer);
    } else if (user) {
      loadNetworkData();
    }
  }, [searchTerm, activeTab]);

  const filteredConnections = connections.filter(connection =>
    connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.profile?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.profile?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRecommendations = recommendations.filter(rec =>
    rec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.profile?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.profile?.title?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Network</h1>
            <p className="text-gray-600 mt-2">Connect with tech sales professionals and grow your network</p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Groups
            </Button>
          </div>
        </div>

        <div className="relative">
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
                <p className="text-green-100">New This Month</p>
                <p className="text-3xl font-bold">12</p>
              </div>
              <UserPlus className="w-8 h-8 text-green-200" />
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
        <div className="border-b border-gray-200">
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
              filteredConnections.map((connection) => (
                <div key={connection.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start space-x-4">
                    {connection.photoURL ? (
                      <img
                        src={connection.photoURL}
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
                        <Briefcase className="w-4 h-4 mr-1" />
                        <span className="truncate">{connection.profile?.title || 'Professional'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span className="truncate">{connection.profile?.company || 'Company'}</span>
                      </div>
                      {connection.profile?.location && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="truncate">{connection.profile.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {connection.profile?.skills && connection.profile.skills.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-1">
                        {connection.profile.skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {skill}
                          </span>
                        ))}
                        {connection.profile.skills.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{connection.profile.skills.length - 3} more
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
              filteredRecommendations.map((person) => (
                <div key={person.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start space-x-4">
                    {person.photoURL ? (
                      <img
                        src={person.photoURL}
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
                        <Briefcase className="w-4 h-4 mr-1" />
                        <span className="truncate">{person.profile?.title || 'Professional'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span className="truncate">{person.profile?.company || 'Company'}</span>
                      </div>
                      {person.profile?.location && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="truncate">{person.profile.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {person.profile?.skills && person.profile.skills.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-1">
                        {person.profile.skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {skill}
                          </span>
                        ))}
                        {person.profile.skills.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{person.profile.skills.length - 3} more
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
                    <Button 
                      className="flex-1"
                      onClick={() => handleConnect(person.id)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </MainLayout>
  );
}