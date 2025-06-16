import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { Search, UserPlus, MessageSquare, Users } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { messageService } from '../../services/messageService';
import { connectionService } from '../../services/connectionService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export function NetworkPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = React.useState([
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Enterprise Sales Director',
      company: 'TechCorp',
      mutualConnections: 12,
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'Sales Manager',
      company: 'InnovateHub',
      mutualConnections: 8,
      image: 'https://images.pexels.com/photos/1181687/pexels-photo-1181687.jpeg'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      role: 'Account Executive',
      company: 'CloudSolutions',
      mutualConnections: 15,
      image: 'https://images.pexels.com/photos/1181688/pexels-photo-1181688.jpeg'
    }
  ]);

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
      // Update local state to reflect the new connection
      setConnections(prevConnections =>
        prevConnections.map(conn =>
          conn.id === connectionId
            ? { ...conn, mutualConnections: conn.mutualConnections + 1 }
            : conn
        )
      );
    } catch (error) {
      console.error('Error adding connection:', error);
      toast.error('Failed to add connection. Please try again.');
    }
  };

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
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Find Connections
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search connections..."
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((connection) => (
            <div key={connection.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-4">
                <img
                  src={connection.image}
                  alt={connection.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{connection.name}</h3>
                  <p className="text-sm text-gray-500">{connection.role}</p>
                  <p className="text-sm text-gray-500">{connection.company}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Users className="w-4 h-4 mr-1" />
                {connection.mutualConnections} mutual connections
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
          ))}
        </div>
      </div>
    </MainLayout>
  );
}