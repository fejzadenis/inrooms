import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '../../layouts/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { 
  MessageSquare, UserPlus, Users, Briefcase, MapPin, Calendar, Edit3, Save, X, Camera, 
  Mail, Phone, Globe, Linkedin, Target, Award, Clock, Building, GraduationCap, Star,
  TrendingUp, Activity, Zap, Heart, Brain, Coffee
} from 'lucide-react';
import { messageService } from '../../services/messageService';
import { networkService, type NetworkProfile } from '../../services/networkService';
import { toast } from 'react-hot-toast';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

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
  const [profileData, setProfileData] = React.useState<NetworkProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState(false);
  const [loadingProfile, setLoadingProfile] = React.useState(true);
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
    if (isOwnProfile && user) {
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
      setLoadingProfile(false);
    } else if (userId && user) {
      loadUserProfile(userId);
    }
  }, [user, userId, isOwnProfile, reset]);

  const loadUserProfile = async (targetUserId: string) => {
    try {
      setLoadingProfile(true);
      
      // Get user profile data
      const userRef = doc(db, 'users', targetUserId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const profile: NetworkProfile = {
          id: userDoc.id,
          name: userData.name || '',
          email: userData.email || '',
          role: userData.role || 'user',
          profile_title: userData.profile?.title || '',
          profile_company: userData.profile?.company || '',
          profile_location: userData.profile?.location || '',
          profile_about: userData.profile?.about || '',
          profile_skills: userData.profile?.skills || [],
          photo_url: userData.photoURL || '',
          connections: userData.connections || []
        };
        
        setProfileData(profile);
        
        // Check if current user is connected to this profile
        if (user) {
          const userConnections = await networkService.getUserConnections(user.id);
          setIsConnected(userConnections.includes(targetUserId));
        }
      } else {
        toast.error('User profile not found');
        navigate('/network');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Failed to load profile');
      navigate('/network');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleMessage = async () => {
    if (!user || !userId) return;
    
    try {
      // Check if they can message (are connected)
      const canMessage = await messageService.canMessage(user.id, userId);
      if (!canMessage) {
        toast.error('You can only message your connections');
        return;
      }

      // Create or get existing chat
      const chatId = await messageService.createChat(user.id, userId);
      
      // Navigate to messages page
      navigate('/messages');
      toast.success('Chat opened successfully!');
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat. Please try again.');
    }
  };

  const handleConnect = async () => {
    if (!user || !userId) return;

    try {
      await networkService.addConnection(user.id, userId);
      setIsConnected(true);
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'enterprise_closer': return <Building className="w-5 h-5" />;
      case 'startup_hustler': return <Zap className="w-5 h-5" />;
      case 'saas_specialist': return <TrendingUp className="w-5 h-5" />;
      case 'relationship_builder': return <Heart className="w-5 h-5" />;
      case 'sales_leader': return <Star className="w-5 h-5" />;
      case 'technical_seller': return <Brain className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'enterprise_closer': return 'Enterprise Closer';
      case 'startup_hustler': return 'Startup Hustler';
      case 'saas_specialist': return 'SaaS Specialist';
      case 'relationship_builder': return 'Relationship Builder';
      case 'sales_leader': return 'Sales Leader';
      case 'technical_seller': return 'Technical Seller';
      default: return 'Sales Professional';
    }
  };

  const getExperienceLevelLabel = (level: string) => {
    switch (level) {
      case 'entry': return 'Entry Level (0-2 years)';
      case 'mid': return 'Mid Level (3-5 years)';
      case 'senior': return 'Senior (6-10 years)';
      case 'executive': return 'Executive (10+ years)';
      default: return 'Professional';
    }
  };

  const getAvailabilityLabel = (availability: string) => {
    switch (availability) {
      case 'very_active': return 'Very Active (3+ events/week)';
      case 'moderately_active': return 'Moderately Active (1-2 events/week)';
      case 'occasional': return 'Occasional (1-2 events/month)';
      default: return 'Available';
    }
  };

  if (loadingProfile) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading profile...</div>
        </div>
      </MainLayout>
    );
  }

  const currentUser = isOwnProfile ? user : profileData;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 h-32">
            <div className="absolute inset-0 bg-black opacity-20"></div>
          </div>
          
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16">
              <div className="relative">
                {currentUser?.photoURL || currentUser?.photo_url ? (
                  <img
                    src={currentUser.photoURL || currentUser.photo_url}
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
                    <div className="flex items-center space-x-3">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {isEditing ? watch('name') : currentUser?.name}
                      </h1>
                      {currentUser?.profile?.assignedRole && (
                        <div className="flex items-center space-x-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
                          {getRoleIcon(currentUser.profile.assignedRole)}
                          <span className="text-sm font-medium">
                            {getRoleLabel(currentUser.profile.assignedRole)}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-lg text-gray-600">
                      {isEditing ? watch('title') : (currentUser?.profile?.title || currentUser?.profile_title || 'Sales Professional')}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <Briefcase className="w-4 h-4 mr-1" />
                      {isEditing ? watch('company') : (currentUser?.profile?.company || currentUser?.profile_company || 'Company')}
                    </p>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 flex space-x-3">
                    {!isOwnProfile ? (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={handleMessage}
                          disabled={!isConnected}
                          title={!isConnected ? 'Connect first to send messages' : 'Send message'}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        {!isConnected ? (
                          <Button onClick={handleConnect}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Connect
                          </Button>
                        ) : (
                          <Button variant="outline" disabled>
                            <Users className="w-4 h-4 mr-2" />
                            Connected
                          </Button>
                        )}
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
                  <div className="lg:col-span-2 space-y-8">
                    {/* About Section */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">About</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {currentUser?.profile?.about || currentUser?.profile_about || 
                          'Experienced sales professional with a proven track record in enterprise software sales. Passionate about building long-term client relationships and delivering value-driven solutions.'}
                      </p>
                    </div>

                    {/* Professional Background */}
                    {currentUser?.profile && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Background</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {currentUser.profile.experienceLevel && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <GraduationCap className="w-5 h-5 text-indigo-600 mr-2" />
                                <span className="font-medium text-gray-900">Experience Level</span>
                              </div>
                              <p className="text-gray-700">{getExperienceLevelLabel(currentUser.profile.experienceLevel)}</p>
                            </div>
                          )}
                          
                          {currentUser.profile.industry && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <Building className="w-5 h-5 text-indigo-600 mr-2" />
                                <span className="font-medium text-gray-900">Industry</span>
                              </div>
                              <p className="text-gray-700">{currentUser.profile.industry}</p>
                            </div>
                          )}

                          {currentUser.profile.primaryGoal && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <Target className="w-5 h-5 text-indigo-600 mr-2" />
                                <span className="font-medium text-gray-900">Primary Goal</span>
                              </div>
                              <p className="text-gray-700 capitalize">{currentUser.profile.primaryGoal.replace('_', ' ')}</p>
                            </div>
                          )}

                          {currentUser.profile.availability && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <Clock className="w-5 h-5 text-indigo-600 mr-2" />
                                <span className="font-medium text-gray-900">Availability</span>
                              </div>
                              <p className="text-gray-700">{getAvailabilityLabel(currentUser.profile.availability)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Skills Section */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Skills & Expertise</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(currentUser?.profile?.skills || currentUser?.profile_skills || ['Enterprise Sales', 'SaaS', 'Lead Generation', 'CRM']).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      
                      {currentUser?.profile?.specializations && currentUser.profile.specializations.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Specializations</h4>
                          <div className="flex flex-wrap gap-2">
                            {currentUser.profile.specializations.map((spec, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Career Aspirations */}
                    {currentUser?.profile?.careerAspirations && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Career Aspirations</h3>
                        <p className="text-gray-700 leading-relaxed">{currentUser.profile.careerAspirations}</p>
                      </div>
                    )}

                    {/* Value Proposition */}
                    {currentUser?.profile?.valueProposition && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-indigo-900 mb-3">Unique Value Proposition</h3>
                        <p className="text-indigo-800 leading-relaxed italic">"{currentUser.profile.valueProposition}"</p>
                      </div>
                    )}

                    {/* Connection Status */}
                    {!isOwnProfile && isConnected && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <Users className="w-5 h-5 text-green-600 mr-2" />
                          <span className="text-green-800 font-medium">You're connected</span>
                        </div>
                        <p className="text-green-700 text-sm mt-1">
                          You can now send messages and view full contact information
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Contact Information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                      <dl className="space-y-3">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-900">
                            {currentUser?.profile?.location || currentUser?.profile_location || 'San Francisco, CA'}
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
                        
                        {/* Show contact details only to connections or own profile */}
                        {(isOwnProfile || isConnected) && (
                          <>
                            {currentUser?.profile?.phone && (
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 text-gray-400 mr-3" />
                                <span className="text-sm text-gray-900">
                                  {currentUser.profile.phone}
                                </span>
                              </div>
                            )}
                            {currentUser?.email && (
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 text-gray-400 mr-3" />
                                <a
                                  href={`mailto:${currentUser.email}`}
                                  className="text-sm text-indigo-600 hover:text-indigo-500"
                                >
                                  {currentUser.email}
                                </a>
                              </div>
                            )}
                            {currentUser?.profile?.website && (
                              <div className="flex items-center">
                                <Globe className="w-4 h-4 text-gray-400 mr-3" />
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
                                <Linkedin className="w-4 h-4 text-gray-400 mr-3" />
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
                          </>
                        )}
                        
                        {!isOwnProfile && !isConnected && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <p className="text-sm text-gray-600">
                              Connect to view contact information
                            </p>
                          </div>
                        )}
                      </dl>
                    </div>

                    {/* Networking Preferences */}
                    {currentUser?.profile && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Networking Style</h3>
                        <div className="space-y-3">
                          {currentUser.profile.networkingStyle && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-sm font-medium text-gray-900">Style</p>
                              <p className="text-sm text-gray-600 capitalize">{currentUser.profile.networkingStyle}</p>
                            </div>
                          )}
                          {currentUser.profile.communicationPreference && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-sm font-medium text-gray-900">Communication</p>
                              <p className="text-sm text-gray-600 capitalize">{currentUser.profile.communicationPreference}</p>
                            </div>
                          )}
                          {currentUser.profile.timeZone && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-sm font-medium text-gray-900">Time Zone</p>
                              <p className="text-sm text-gray-600">{currentUser.profile.timeZone}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Activity Stats */}
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

                    {/* Interests */}
                    {currentUser?.profile?.interests && currentUser.profile.interests.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Interests</h3>
                        <div className="flex flex-wrap gap-2">
                          {currentUser.profile.interests.map((interest, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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