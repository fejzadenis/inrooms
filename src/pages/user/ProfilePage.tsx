import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '../../layouts/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useTour } from '../../contexts/TourContext';
import { Button } from '../../components/common/Button'; 
import { 
  MessageSquare, UserPlus, Users, Briefcase, MapPin, Calendar, Edit3, Save, X, Camera, 
  Mail, Phone, Globe, Linkedin, Target, Award, Clock, Building, GraduationCap, Star, HelpCircle,
  TrendingUp, Activity, Zap, Heart, Brain, Coffee, Check, AlertTriangle, Trash2
} from 'lucide-react';
import { messageService } from '../../services/messageService';
import { networkService, type NetworkProfile } from '../../services/networkService';
import { connectionService } from '../../services/connectionService';
import { toast } from 'react-hot-toast';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ConnectionRequestModal } from '../../components/network/ConnectionRequestModal';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../config/supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

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
  const { askForTourPermission, startTour } = useTour();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = React.useState(false);
  const [profileData, setProfileData] = React.useState<NetworkProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState<'connected' | 'pending_sent' | 'pending_received' | 'none'>('none');
  const [loadingProfile, setLoadingProfile] = React.useState(true);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = React.useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Check if we should show the profile tour
  useEffect(() => {
    const checkTourStatus = async () => {
      // Profile tour should never start automatically
      // Users can manually start it if needed
      console.log("PROFILE DEBUG: Profile tour disabled from auto-starting");
    };

    checkTourStatus();
  }, [user, loadingProfile, isOwnProfile, askForTourPermission, startTour]);

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
        
        // Check connection status between current user and profile user
        if (user) {
          const status = await connectionService.getConnectionStatus(user.id, targetUserId);
          setConnectionStatus(status);
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

  const handleConnect = () => {
    if (!profileData) return;
    setIsConnectionModalOpen(true);
  };

  const handleAcceptRequest = async () => {
    if (!user || !userId) return;

    try {
      setIsLoading(true);
      
      // Find the pending request
      const pendingRequests = await connectionService.getIncomingConnectionRequests(user.id);
      const request = pendingRequests.find(req => req.fromUserId === userId);
      
      if (!request) {
        toast.error('Connection request not found');
        return;
      }
      
      // Accept the request
      await connectionService.acceptConnectionRequest(request.id!);
      
      // Update connection status
      setConnectionStatus('connected');
      
      toast.success('Connection request accepted');
    } catch (error) {
      console.error('Error accepting connection request:', error);
      toast.error('Failed to accept connection request');
    } finally {
      setIsLoading(false);
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
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File is too large. Maximum size is 5MB.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate a unique file name with user ID as folder
      const fileId = uuidv4();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${fileId}.${fileExtension}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(percent);
          }
        });

      if (error) {
        throw error;
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const photoURL = publicUrlData.publicUrl;

      // Update user profile with new photo URL
      await updateUserProfile(user.id, { photoURL });
      
      toast.success('Profile photo updated successfully');
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      toast.error('Failed to upload profile photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!user || !user.photoURL) return;

    if (!window.confirm('Are you sure you want to remove your profile photo?')) {
      return;
    }

    setIsLoading(true);
    try {
      // If it's a Supabase URL, extract the path and delete from storage
      if (user.photoURL.includes('avatars')) {
        const url = new URL(user.photoURL);
        const pathMatch = url.pathname.match(/\/avatars\/(.+)$/);
        
        if (pathMatch && pathMatch[1]) {
          const filePath = decodeURIComponent(pathMatch[1]);
          const { error } = await supabase.storage
            .from('avatars')
            .remove([filePath]);
            
          if (error) {
            console.error('Error removing file from storage:', error);
          }
        }
      }

      // Update user profile to remove photo URL
      await updateUserProfile(user.id, { photoURL: null });
      
      toast.success('Profile photo removed');
    } catch (error) {
      console.error('Error deleting profile photo:', error);
      toast.error('Failed to remove profile photo');
    } finally {
      setIsLoading(false);
    }
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
          <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 h-24 md:h-32" data-tour="profile-header">
            <div className="absolute inset-0 bg-black opacity-20"></div>
          </div>
          
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-20">
              <div className="relative">
                {isUploading ? (
                  <div className="h-32 w-32 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 relative">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-200"></div>
                        <div 
                          className="absolute inset-0 rounded-full border-4 border-indigo-600 transition-all duration-300"
                          style={{ 
                            clipPath: `polygon(0 0, 100% 0, 100% ${uploadProgress}%, 0 ${uploadProgress}%)` 
                          }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">{Math.round(uploadProgress)}%</span>
                    </div>
                  </div>
                ) : currentUser?.photoURL || currentUser?.photo_url ? (
                  <div className="relative group">
                    <img
                      src={currentUser.photoURL || currentUser.photo_url}
                      alt={currentUser.name}
                      className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                    {isOwnProfile && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2">
                          <button
                            onClick={handlePhotoUpload}
                            className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors duration-200"
                            title="Change photo"
                          >
                            <Camera className="h-4 w-4 text-gray-600" />
                          </button>
                          <button
                            onClick={handleDeletePhoto}
                            className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors duration-200"
                            title="Remove photo"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-32 w-32 rounded-full border-4 border-white shadow-lg bg-indigo-100 flex items-center justify-center">
                    <Users className="h-16 w-16 text-indigo-600" />
                  </div>
                )}
                {isOwnProfile && !isUploading && (
                  <button
                    onClick={handlePhotoUpload}
                    className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Camera className="h-4 w-4 text-gray-600" />
                  </button>
                )}
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
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
                          disabled={connectionStatus !== 'connected'}
                          title={connectionStatus !== 'connected' ? 'Connect first to send messages' : 'Send message'}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        
                        {connectionStatus === 'none' && (
                          <Button onClick={handleConnect}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Connect
                          </Button>
                        )}
                        
                        {connectionStatus === 'pending_sent' && (
                          <Button variant="outline" disabled>
                            <Clock className="w-4 h-4 mr-2" />
                            Request Sent
                          </Button>
                        )}
                        
                        {connectionStatus === 'pending_received' && (
                          <Button 
                            onClick={handleAcceptRequest}
                            isLoading={isLoading}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Accept Request
                          </Button>
                        )}
                        
                        {connectionStatus === 'connected' && (
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
                          <Button onClick={() => setIsEditing(true)} data-tour="profile-edit">
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => startTour('profile')} 
                            className="ml-2"
                          >
                            <HelpCircle className="w-4 h-4 mr-2" />
                            Profile Tour
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
                    <div data-tour="profile-about">
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
                    <div data-tour="profile-skills">
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
                    {!isOwnProfile && (
                      <>
                        {connectionStatus === 'connected' && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center">
                              <Check className="w-5 h-5 text-green-600 mr-2" />
                              <span className="text-green-800 font-medium">You're connected</span>
                            </div>
                            <p className="text-green-700 text-sm mt-1">
                              You can now send messages and view full contact information
                            </p>
                          </div>
                        )}
                        
                        {connectionStatus === 'pending_sent' && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center">
                              <Clock className="w-5 h-5 text-blue-600 mr-2" />
                              <span className="text-blue-800 font-medium">Connection request sent</span>
                            </div>
                            <p className="text-blue-700 text-sm mt-1">
                              Waiting for {profileData?.name} to accept your connection request
                            </p>
                          </div>
                        )}
                        
                        {connectionStatus === 'pending_received' && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center">
                              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                              <span className="text-yellow-800 font-medium">Pending connection request</span>
                            </div>
                            <p className="text-yellow-700 text-sm mt-1">
                              {profileData?.name} wants to connect with you
                            </p>
                            <Button 
                              className="mt-2"
                              onClick={handleAcceptRequest}
                              isLoading={isLoading}
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Accept Request
                            </Button>
                          </div>
                        )}
                      </>
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
                        {(isOwnProfile || connectionStatus === 'connected') && (
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
                        
                        {!isOwnProfile && connectionStatus !== 'connected' && (
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

      {/* Connection Request Modal */}
      <ConnectionRequestModal
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
        targetUser={profileData}
        onSuccess={() => {
          setConnectionStatus('pending_sent');
          toast.success(`Connection request sent to ${profileData?.name}`);
        }}
      />
    </MainLayout>
  );
}