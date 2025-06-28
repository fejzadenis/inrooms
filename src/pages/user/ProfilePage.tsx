import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { MainLayout } from '../../layouts/MainLayout';
import { EmailVerificationBanner } from '../../components/auth/EmailVerificationBanner';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Globe, 
  Linkedin, 
  Edit3, 
  Save,
  X
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profile_title?: string;
  profile_company?: string;
  profile_location?: string;
  profile_about?: string;
  profile_phone?: string;
  profile_website?: string;
  profile_linkedin?: string;
  profile_skills?: string[];
  photo_url?: string;
}

export const ProfilePage: React.FC = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});

  const isOwnProfile = !userId || userId === user?.uid;

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const targetUserId = userId || user.uid;
        const userDoc = await getDoc(doc(db, 'users', targetUserId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfile({
            id: userDoc.id,
            name: userData.name || '',
            email: userData.email || '',
            profile_title: userData.profile_title || '',
            profile_company: userData.profile_company || '',
            profile_location: userData.profile_location || '',
            profile_about: userData.profile_about || '',
            profile_phone: userData.profile_phone || '',
            profile_website: userData.profile_website || '',
            profile_linkedin: userData.profile_linkedin || '',
            profile_skills: userData.profile_skills || [],
            photo_url: userData.photo_url || '',
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, userId]);

  const handleEdit = () => {
    setEditedProfile(profile || {});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedProfile({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    try {
      setIsSaving(true);
      
      // Update Firestore document
      await updateDoc(doc(db, 'users', user.uid), {
        ...editedProfile,
        updatedAt: new Date(),
      });

      // Update Firebase Auth profile if name changed
      if (editedProfile.name && editedProfile.name !== profile.name) {
        await updateProfile(user, {
          displayName: editedProfile.name,
        });
      }

      setProfile({ ...profile, ...editedProfile });
      setIsEditing(false);
      setEditedProfile({});
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string | string[]) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile not found</h2>
          <p className="text-gray-600">The requested profile could not be found.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Email Verification Banner - only show on own profile */}
        {isOwnProfile && <EmailVerificationBanner />}

        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                {isOwnProfile ? 'My Profile' : 'Profile'}
              </h1>
              {isOwnProfile && (
                <div className="flex space-x-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        isLoading={isSaving}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleEdit}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Basic Info */}
              <div className="lg:col-span-1">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    {profile.photo_url ? (
                      <img
                        src={profile.photo_url}
                        alt={profile.name}
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.name || profile.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="text-xl font-bold text-gray-900 text-center w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                  )}
                  
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.profile_title || profile.profile_title || ''}
                      onChange={(e) => handleInputChange('profile_title', e.target.value)}
                      placeholder="Your title"
                      className="text-gray-600 text-center w-full mt-1 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-gray-600 mt-1">{profile.profile_title}</p>
                  )}
                  
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.profile_company || profile.profile_company || ''}
                      onChange={(e) => handleInputChange('profile_company', e.target.value)}
                      placeholder="Your company"
                      className="text-gray-500 text-center w-full mt-1 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-gray-500">{profile.profile_company}</p>
                  )}
                </div>

                {/* Contact Information */}
                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">{profile.email}</span>
                  </div>

                  {(profile.profile_phone || isEditing) && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editedProfile.profile_phone || profile.profile_phone || ''}
                          onChange={(e) => handleInputChange('profile_phone', e.target.value)}
                          placeholder="Phone number"
                          className="flex-1 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                        />
                      ) : (
                        <span className="text-gray-600">{profile.profile_phone}</span>
                      )}
                    </div>
                  )}

                  {(profile.profile_location || isEditing) && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.profile_location || profile.profile_location || ''}
                          onChange={(e) => handleInputChange('profile_location', e.target.value)}
                          placeholder="Location"
                          className="flex-1 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                        />
                      ) : (
                        <span className="text-gray-600">{profile.profile_location}</span>
                      )}
                    </div>
                  )}

                  {(profile.profile_website || isEditing) && (
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="url"
                          value={editedProfile.profile_website || profile.profile_website || ''}
                          onChange={(e) => handleInputChange('profile_website', e.target.value)}
                          placeholder="Website URL"
                          className="flex-1 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                        />
                      ) : (
                        <a
                          href={profile.profile_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-500"
                        >
                          {profile.profile_website}
                        </a>
                      )}
                    </div>
                  )}

                  {(profile.profile_linkedin || isEditing) && (
                    <div className="flex items-center space-x-3">
                      <Linkedin className="w-5 h-5 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="url"
                          value={editedProfile.profile_linkedin || profile.profile_linkedin || ''}
                          onChange={(e) => handleInputChange('profile_linkedin', e.target.value)}
                          placeholder="LinkedIn URL"
                          className="flex-1 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                        />
                      ) : (
                        <a
                          href={profile.profile_linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-500"
                        >
                          LinkedIn Profile
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Detailed Info */}
              <div className="lg:col-span-2">
                {/* About Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                  {isEditing ? (
                    <textarea
                      value={editedProfile.profile_about || profile.profile_about || ''}
                      onChange={(e) => handleInputChange('profile_about', e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-600 leading-relaxed">
                      {profile.profile_about || 'No description provided.'}
                    </p>
                  )}
                </div>

                {/* Skills Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        placeholder="Add skills (comma-separated)"
                        value={(editedProfile.profile_skills || profile.profile_skills || []).join(', ')}
                        onChange={(e) => handleInputChange('profile_skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Separate skills with commas (e.g., Sales, Marketing, CRM)
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.profile_skills && profile.profile_skills.length > 0 ? (
                        profile.profile_skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">No skills listed.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};