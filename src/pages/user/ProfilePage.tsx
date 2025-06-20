import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '../../layouts/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { MessageSquare, UserPlus, Users, Briefcase, MapPin, Calendar, Edit3, Save, X, Camera } from 'lucide-react';
import { messageService } from '../../services/messageService';
import { connectionService } from '../../services/connectionService';
import { toast } from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  title: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  about: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Must be a valid LinkedIn URL').optional().or(z.literal('')),
  skills: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { userId } = useParams();
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = React.useState(false);
  const [profileData, setProfileData] = React.useState(user);
  const [isLoading, setIsLoading] = React.useState(false);
  const isOwnProfile = !userId || userId === user?.id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      title: user?.profile?.title || '',
      company: user?.profile?.company || '',
      location: user?.profile?.location || '',
      about: user?.profile?.about || '',
      phone: user?.profile?.phone || '',
      website: user?.profile?.website || '',
      linkedin: user?.profile?.linkedin || '',
      skills: user?.profile?.skills?.join(', ') || '',
    }
  });

  React.useEffect(() => {
    if (user && isOwnProfile) {
      reset({
        name: user.name || '',
        title: user.profile?.title || '',
        company: user.profile?.company || '',
        location: user.profile?.location || '',
        about: user.profile?.about || '',
        phone: user.profile?.phone || '',
        website: user.profile?.website || '',
        linkedin: user.profile?.linkedin || '',
        skills: user.profile?.skills?.join(', ') || '',
      });
    }
  }, [user, isOwnProfile, reset]);

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

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const updatedProfile = {
        ...data,
        skills: data.skills ? data.skills.split(',').map(skill => skill.trim()).filter(Boolean) : [],
      };

      await updateUserProfile(user.id, updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      // Error handling is done in the updateUserProfile function
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  const handlePhotoUpload = () => {
    // This would typically open a file picker and handle image upload
    toast.info('Photo upload feature coming soon!');
  };

  const currentUser = isOwnProfile ? user : profileData;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 h-32">
            <div className="absolute inset-0 bg-black opacity-20"></div>
          </div>
          
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16">
              <div className="relative">
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.name}
                    className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full border-4 border-white shadow-lg bg-indigo-100 flex items-center justify-center">
                    <Users className="h-16 w-16 text-indigo-600" />
                  </div>
                )}
                {isOwnProfile && (
                  <button
                    onClick={handlePhotoUpload}
                    className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Camera className="h-4 w-4 text-gray-600" />
                  </button>
                )}
              </div>
              
              <div className="mt-4 sm:mt-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {isEditing ? watch('name') : currentUser?.name}
                    </h1>
                    <p className="text-lg text-gray-600">
                      {isEditing ? watch('title') : currentUser?.profile?.title || 'Sales Professional'}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <Briefcase className="w-4 h-4 mr-1" />
                      {isEditing ? watch('company') : currentUser?.profile?.company || 'Company'}
                    </p>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 flex space-x-3">
                    {!isOwnProfile ? (
                      <>
                        <Button variant="outline" onClick={handleMessage}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        <Button onClick={handleConnect}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Connect
                        </Button>
                      </>
                    ) : (
                      <>
                        {isEditing ? (
                          <div className="flex space-x-2">
                            <Button variant="outline" onClick={handleCancel}>
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                            <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </Button>
                          </div>
                        ) : (
                          <Button onClick={() => setIsEditing(true)}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="border-t border-gray-200">
            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Job Title
                    </label>
                    <input
                      type="text"
                      {...register('title')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="e.g., Senior Sales Executive"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Company
                    </label>
                    <input
                      type="text"
                      {...register('company')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="e.g., TechCorp Solutions"
                    />
                    {errors.company && (
                      <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      {...register('location')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="e.g., San Francisco, CA"
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      {...register('phone')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="e.g., +1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Website (Optional)
                    </label>
                    <input
                      type="url"
                      {...register('website')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="https://yourwebsite.com"
                    />
                    {errors.website && (
                      <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    LinkedIn Profile (Optional)
                  </label>
                  <input
                    type="url"
                    {...register('linkedin')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                  {errors.linkedin && (
                    <p className="mt-1 text-sm text-red-600">{errors.linkedin.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    About
                  </label>
                  <textarea
                    {...register('about')}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                  />
                  {errors.about && (
                    <p className="mt-1 text-sm text-red-600">{errors.about.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Skills
                  </label>
                  <input
                    type="text"
                    {...register('skills')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="e.g., Enterprise Sales, SaaS, Lead Generation, CRM (comma-separated)"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Separate skills with commas
                  </p>
                  {errors.skills && (
                    <p className="mt-1 text-sm text-red-600">{errors.skills.message}</p>
                  )}
                </div>
              </form>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">About</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {currentUser?.profile?.about || 
                          'Experienced sales professional with a proven track record in enterprise software sales. Passionate about building long-term client relationships and delivering value-driven solutions.'}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {(currentUser?.profile?.skills || ['Enterprise Sales', 'SaaS', 'Lead Generation', 'CRM']).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                      <dl className="space-y-3">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-900">
                            {currentUser?.profile?.location || 'San Francisco, CA'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-900">
                            Joined {currentUser?.profile?.joinedAt ? 
                              new Date(currentUser.profile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 
                              'March 2024'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-900">
                            {currentUser?.connections?.length || 150}+ connections
                          </span>
                        </div>
                        {currentUser?.profile?.phone && (
                          <div className="flex items-center">
                            <span className="w-4 h-4 text-gray-400 mr-3">📞</span>
                            <span className="text-sm text-gray-900">
                              {currentUser.profile.phone}
                            </span>
                          </div>
                        )}
                        {currentUser?.profile?.website && (
                          <div className="flex items-center">
                            <span className="w-4 h-4 text-gray-400 mr-3">🌐</span>
                            <a
                              href={currentUser.profile.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-indigo-600 hover:text-indigo-500"
                            >
                              Visit Website
                            </a>
                          </div>
                        )}
                        {currentUser?.profile?.linkedin && (
                          <div className="flex items-center">
                            <span className="w-4 h-4 text-gray-400 mr-3">💼</span>
                            <a
                              href={currentUser.profile.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-indigo-600 hover:text-indigo-500"
                            >
                              LinkedIn Profile
                            </a>
                          </div>
                        )}
                      </dl>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Activity</h3>
                      <div className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-900">Events Attended</p>
                          <p className="text-2xl font-bold text-indigo-600">
                            {currentUser?.subscription?.eventsUsed || 0}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-900">Engagement Score</p>
                          <p className="text-2xl font-bold text-green-600">
                            {currentUser?.profile?.points || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}