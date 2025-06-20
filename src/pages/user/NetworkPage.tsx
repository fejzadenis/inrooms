import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { Search, UserPlus, MessageSquare, Users } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { messageService } from '../../services/messageService';
import { connectionService } from '../../services/connectionService';
import { recommendationService } from '../../services/recommendationService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface NetworkUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  profile?: {
    title?: string;
    company?: string;
    location?: string;
  };
  photoURL?: string;
}

export function NetworkPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = React.useState<NetworkUser[]>([]);
  const [recommendations, setRecommendations] = React.useState<NetworkUser[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'connections' | 'discover'>('connections');

  React.useEffect(() => {
    if (user) {
      loadNetworkData();
    }
  }, [user]);

  const loadNetworkData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load user's connections
      const connectionIds = await connectionService.getUserConnections(user.id);
      
      if (connectionIds.length > 0) {
        // Get connection user data
        const usersRef = collection(db, 'users');
        const connectionsData: NetworkUser[] = [];
        
        // Fetch connection details in batches (Firestore has a limit of 10 for 'in' queries)
        for (let i = 0; i < connectionIds.length; i += 10) {
          const batch = connectionIds.slice(i, i + 10);
          const q = query(usersRef, where('__name__', 'in', batch));
          const snapshot = await getDocs(q);
          
          snapshot.docs.forEach(doc => {
            const userData = doc.data();
            connectionsData.push({
              id: doc.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              profile: userData.profile,
              photoURL: userData.photoURL,
            });
          });
        }
        
        setConnections(connectionsData);
      }

      // Load recommendations
      const userSkills = user.profile?.skills || [];
      const recommendedUsers = await recommendationService.getConnectionRecommendations(user.id, userSkills);
      
      // Filter out already connected users
      const filteredRecommendations = recommendedUsers.filter(
        recUser => !connectionIds.includes(recUser.id)
      );
      
      setRecommendations(filteredRecommendations.slice(0, 10));
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

  const handleConnect = async (connectionId: string) => {
    if (!user) return;

    try {
      await connectionService.addConnection(user.id, connectionId);
      toast.success('Connection added successfully!');
      
      // Move user from recommendations to connections
      const connectedUser = recommendations.find(rec => rec.id === connectionId);
      if (connectedUser) {
        setConnections(prev => [...prev, connectedUser]);
        setRecommendations(prev => prev.filter(rec => rec.id !== connectionId));
      }
    } catch (error) {
      console.error('Error adding connection:', error);
      toast.error('Failed to add connection. Please try again.');
    }
  };

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
          <h1 className="text-2xl font-semibold text-gray-900">My Network</h1>
          <div className="flex space-x-4">
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
            placeholder="Search network..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          />
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
              <div className="col-span-full text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">
                  {searchTerm ? 'No connections found' : 'No connections yet'}
                </h3>
                <p className="text-gray-500 mt-2">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Start connecting with other professionals to build your network'}
                </p>
              </div>
            ) : (
              filteredConnections.map((connection) => (
                <div key={connection.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-4">
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
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{connection.name}</h3>
                      <p className="text-sm text-gray-500">{connection.profile?.title || 'Professional'}</p>
                      <p className="text-sm text-gray-500">{connection.profile?.company || 'Company'}</p>
                    </div>
                  </div>
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
              <div className="col-span-full text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">
                  {searchTerm ? 'No people found' : 'No recommendations available'}
                </h3>
                <p className="text-gray-500 mt-2">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Complete your profile to get better recommendations'}
                </p>
              </div>
            ) : (
              filteredRecommendations.map((person) => (
                <div key={person.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-4">
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
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{person.name}</h3>
                      <p className="text-sm text-gray-500">{person.profile?.title || 'Professional'}</p>
                      <p className="text-sm text-gray-500">{person.profile?.company || 'Company'}</p>
                    </div>
                  </div>
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