import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { MessageSquare, UserPlus, Users, Briefcase, MapPin, Calendar } from 'lucide-react';
import { messageService } from '../../services/messageService';
import { connectionService } from '../../services/connectionService';
import { toast } from 'react-hot-toast';

export function ProfilePage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = React.useState(false);
  const [profileData, setProfileData] = React.useState(user);
  const isOwnProfile = !userId || userId === user?.id;

  const handleMessage = async () => {
    if (!user || !userId) return;
    
    try {
      await messageService.sendMessage(user.id, userId, '👋 Hi there!');
      navigate('/messages');
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat. Please try again.');
    }
  };

  const handleConnect = async () => {
    if (!user || !userId) return;

    try {
      await connectionService.addConnection(user.id, userId);
      toast.success('Connection added successfully!');
    } catch (error) {
      console.error('Error adding connection:', error);
      toast.error('Failed to add connection. Please try again.');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          {/* Profile Header */}
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Users className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isOwnProfile ? user?.name : profileData?.name}
                  </h2>
                  <p className="text-gray-600">Senior Sales Executive</p>
                </div>
              </div>
              {!isOwnProfile && (
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={handleMessage}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button onClick={handleConnect}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">About</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  Experienced sales professional with a proven track record in enterprise software sales.
                  Passionate about building long-term client relationships and delivering value-driven solutions.
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Company
                </dt>
                <dd className="mt-1 text-sm text-gray-900">TechCorp Solutions</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Location
                </dt>
                <dd className="mt-1 text-sm text-gray-900">San Francisco, CA</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Joined
                </dt>
                <dd className="mt-1 text-sm text-gray-900">March 2024</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Connections
                </dt>
                <dd className="mt-1 text-sm text-gray-900">150+ connections</dd>
              </div>
            </dl>
          </div>

          {/* Edit Profile Button (only shown on own profile) */}
          {isOwnProfile && (
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="flex justify-end">
                {isEditing ? (
                  <div className="space-x-3">
                    <Button variant="outline\" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button>Save Changes</Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}