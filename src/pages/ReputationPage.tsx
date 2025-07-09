import React, { useEffect, useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Award, 
  Shield, 
  CheckCircle, 
  Star, 
  Zap, 
  Users, 
  MessageSquare, 
  Calendar, 
  ArrowRight, 
  Briefcase,
  Code,
  Coffee,
  Lightbulb,
  Target,
  Activity,
  User,
  Rocket
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-hot-toast';

// Extract the loadUserData function outside the component
const loadUserData = async (
  user: any,
  navigate: any,
  setLoading: (loading: boolean) => void,
  setUserProfile: (profile: any) => void,
  setRecentContributions: (contributions: any[]) => void,
  setBadges: (badges: any[]) => void,
  setReputationScore: (score: number) => void,
  setEndorsements: (endorsements: any[]) => void
) => {
  try {
    setLoading(true);
    
    if (!user) {
      // If no user is logged in, use demo data
      setUserProfile({
        name: "Michael Chen",
        title: "Founder & CEO",
        company: "CloudTech Solutions",
        location: "San Francisco, CA",
        photoURL: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
        profile: {
          skills: ["Product Strategy", "Fundraising", "Team Building", "Growth Hacking", "SaaS"],
          points: 875
        }
      });
      
      // Set demo badges
      setBadges([
        { id: 'event_host', name: 'Event Host', count: 12, icon: Calendar, color: 'bg-blue-100 text-blue-600' },
        { id: 'thought_leader', name: 'Thought Leader', count: 25, icon: MessageSquare, color: 'bg-green-100 text-green-600' },
        { id: 'connector', name: 'Connector', count: 50, icon: Users, color: 'bg-purple-100 text-purple-600' },
        { id: 'mentor', name: 'Mentor', count: 5, icon: Star, color: 'bg-yellow-100 text-yellow-600' },
        { id: 'startup_founder', name: 'Startup Founder', count: 2, icon: Zap, color: 'bg-red-100 text-red-600' },
        { id: 'verified_pro', name: 'Verified Pro', count: null, icon: Shield, color: 'bg-indigo-100 text-indigo-600' }
      ]);
      
      // Set demo contributions
      setRecentContributions([
        {
          id: 1,
          type: 'event',
          title: 'Hosted "Startup Funding Strategies" workshop',
          description: 'Shared insights with 45 attendees',
          date: new Date('2025-05-15'),
          points: 25,
          icon: Calendar,
          color: 'bg-blue-100 text-blue-600'
        },
        {
          id: 2,
          type: 'connection',
          title: 'Connected Sarah Johnson with Alex Rodriguez',
          description: 'Successful introduction led to co-founding',
          date: new Date('2025-04-28'),
          points: 15,
          icon: Users,
          color: 'bg-purple-100 text-purple-600'
        },
        {
          id: 3,
          type: 'mentorship',
          title: 'Provided mentorship to 3 early-stage founders',
          description: '5-star feedback received',
          date: new Date('2025-04-10'),
          points: 30,
          icon: MessageSquare,
          color: 'bg-yellow-100 text-yellow-600'
        }
      ]);
      
      // Set demo endorsements
      setEndorsements([
        {
          id: 1,
          name: 'Sarah Johnson',
          photoURL: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
          text: "Michael's strategic insights helped us secure our seed round in record time."
        },
        {
          id: 2,
          name: 'Alex Rodriguez',
          photoURL: 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg',
          text: "Exceptional mentor who truly cares about helping others succeed."
        }
      ]);
      
      setReputationScore(875);
    } else {
      // Get actual user data
      const userRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile({
          ...userData,
          id: userDoc.id
        });
        
        // Calculate reputation score based on profile points or other metrics
        const points = userData.profile?.points || 0;
        const connectionsCount = (userData.connections || []).length;
        const eventsUsed = userData.subscription?.eventsUsed || 0;
        
        // Simple formula: base points + connections*5 + events*10
        const calculatedScore = points + (connectionsCount * 5) + (eventsUsed * 10);
        setReputationScore(calculatedScore);
        
        // Get user's badges
        // In a real app, this would come from a badges collection
        // For now, we'll generate based on user activity
        const userBadges = [];
        
        if (eventsUsed > 0) {
          userBadges.push({ 
            id: 'event_participant', 
            name: 'Event Participant', 
            count: eventsUsed, 
            icon: Calendar, 
            color: 'bg-blue-100 text-blue-600' 
          });
        }
        
        if (connectionsCount > 0) {
          userBadges.push({ 
            id: 'connector', 
            name: 'Connector', 
            count: connectionsCount, 
            icon: Users, 
            color: 'bg-purple-100 text-purple-600' 
          });
        }
        
        if (userData.profile?.assignedRole) {
          userBadges.push({ 
            id: 'founder', 
            name: 'Startup Founder', 
            count: null, 
            icon: Rocket, 
            color: 'bg-red-100 text-red-600' 
          });
        }
        
        // Add verified badge if email is verified
        if (userData.email_verified || user.emailVerified) {
          userBadges.push({ 
            id: 'verified', 
            name: 'Verified Member', 
            count: null, 
            icon: Shield, 
            color: 'bg-indigo-100 text-indigo-600' 
          });
        }
        
        setBadges(userBadges);
        
        // Get recent contributions
        // In a real app, this would come from an activity log
        // For now, we'll generate based on user data
        const userContributions = [];
        
        // Add event participation
        if (eventsUsed > 0) {
          userContributions.push({
            id: 1,
            type: 'event',
            title: `Participated in ${eventsUsed} networking events`,
            description: 'Active community member',
            date: new Date(),
            points: eventsUsed * 10,
            icon: Calendar,
            color: 'bg-blue-100 text-blue-600'
          });
        }
        
        // Add profile completion
        if (userData.profile && Object.keys(userData.profile).length > 5) {
          userContributions.push({
            id: 2,
            type: 'profile',
            title: 'Completed comprehensive profile',
            description: 'Helps others connect with you',
            date: new Date(userData.updatedAt?.toDate() || Date.now()),
            points: 25,
            icon: User,
            color: 'bg-green-100 text-green-600'
          });
        }
        
        // Add connections
        if (connectionsCount > 0) {
          userContributions.push({
            id: 3,
            type: 'connection',
            title: `Built a network of ${connectionsCount} connections`,
            description: 'Growing professional network',
            date: new Date(),
            points: connectionsCount * 5,
            icon: Users,
            color: 'bg-purple-100 text-purple-600'
          });
        }
        
        setRecentContributions(userContributions);
        
        // In a real app, endorsements would come from a collection
        // For now, we'll leave this empty for actual users
        setEndorsements([]);
      } else {
        // User document doesn't exist
        toast.error('User profile not found');
        navigate('/');
      }
    }
  } catch (error) {
    console.error('Error loading reputation data:', error);
    toast.error('Failed to load reputation data');
  } finally {
    setLoading(false);
  }
};

export function ReputationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [recentContributions, setRecentContributions] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [reputationScore, setReputationScore] = useState(0);
  const [endorsements, setEndorsements] = useState<any[]>([]);

  useEffect(() => {
    loadUserData(
      user,
      navigate,
      setLoading,
      setUserProfile,
      setRecentContributions,
      setBadges,
      setReputationScore,
      setEndorsements
    );
  }, [user, navigate]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading reputation data...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-16 py-8">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Your Reputation Matters
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            On inRooms, your contributions are recognized and verified, building a reputation 
            that follows you throughout your career journey.
          </p>
        </div>

        {/* Profile Example Section */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200" data-testid="reputation-profile">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 h-32 relative">
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
          
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-8">
              <div className="flex-shrink-0">
                <img 
                  src={userProfile?.photoURL || "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"} 
                  alt={userProfile?.name || "Profile"} 
                  className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              </div>
              
              <div className="mt-6 md:mt-0 md:ml-6 flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{userProfile?.name || "User"}</h2>
                    <p className="text-gray-600">
                      {userProfile?.profile?.title || userProfile?.title || "Founder"} 
                      {userProfile?.profile?.company || userProfile?.company ? ` at ${userProfile?.profile?.company || userProfile?.company}` : ""}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{userProfile?.profile?.location || userProfile?.location || "Location"}</p>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                    {reputationScore > 500 && (
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        Top Contributor
                      </div>
                    )}
                    {(user?.emailVerified || user?.dbEmailVerified) && (
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <Shield className="w-4 h-4 mr-1" />
                        Verified Member
                      </div>
                    )}
                    {user?.profile?.assignedRole && (
                      <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <Award className="w-4 h-4 mr-1" />
                        Founder
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Reputation Badges</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Badges are earned through verified activities and contributions on the platform. They represent your expertise, engagement, and value to the community.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Earned Badges</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {badges.length > 0 ? (
                      badges.map((badge) => {
                        const BadgeIcon = badge.icon;
                        return (
                          <div key={badge.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center space-x-3">
                            <div className={`${badge.color} p-2 rounded-lg`}>
                              <BadgeIcon className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{badge.name}</p>
                              {badge.count && (
                                <p className="text-sm text-gray-500">{badge.count} {badge.count === 1 ? 'instance' : 'instances'}</p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-2 text-center py-8 bg-gray-50 rounded-lg">
                        <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No badges yet</h3>
                        <p className="text-gray-500 mt-2">Start participating in events and connecting with others to earn badges</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Contributions</h3>
                  {recentContributions.length > 0 ? (
                    <div className="space-y-4">
                      {recentContributions.map((contribution) => {
                        const ContributionIcon = contribution.icon;
                        return (
                          <div key={contribution.id} className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <div className={`${contribution.color} p-2 rounded-lg`}>
                                  <ContributionIcon className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{contribution.title}</p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {contribution.description} • {contribution.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </p>
                                </div>
                              </div>
                              <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                +{contribution.points} points
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No contributions yet</h3>
                      <p className="text-gray-500 mt-2">Your activity on the platform will appear here</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-100">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Reputation Score</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-indigo-600">{reputationScore}</span>
                    {reputationScore > 500 && (
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                        Top {reputationScore > 800 ? '5%' : reputationScore > 600 ? '10%' : '20%'}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(reputationScore / 10, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Based on activity, contributions, and peer recognition
                  </p>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {userProfile?.profile?.skills && userProfile.profile.skills.length > 0 ? (
                      userProfile.profile.skills.map((skill: string, index: number) => (
                        <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <>
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                          SaaS
                        </span>
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                          Strategic Partnerships
                        </span>
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                          Startup Leadership
                        </span>
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                          Fundraising
                        </span>
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                          Team Building
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Endorsements</h3>
                  {endorsements.length > 0 ? (
                    <div className="space-y-4">
                      {endorsements.map((endorsement) => (
                        <div key={endorsement.id} className="flex items-start space-x-3">
                          <img 
                            src={endorsement.photoURL} 
                            alt={endorsement.name} 
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{endorsement.name}</p>
                            <p className="text-sm text-gray-500">
                              "{endorsement.text}"
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No endorsements yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How Reputation Works on inRooms
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
            >
              <div className="bg-blue-100 p-4 rounded-lg inline-block mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Earn Through Action</h3>
              <p className="text-gray-600">
                Badges and reputation points are earned through verified actions and contributions, 
                not self-promotion. Host events, make connections, and share insights to build your reputation.
              </p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
            >
              <div className="bg-green-100 p-4 rounded-lg inline-block mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified by Peers</h3>
              <p className="text-gray-600">
                Your contributions are verified by the community. Endorsements from respected members 
                carry more weight, creating a trustworthy ecosystem of recognition.
              </p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
            >
              <div className="bg-purple-100 p-4 rounded-lg inline-block mb-4">
                <Briefcase className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Career-Long Asset</h3>
              <p className="text-gray-600">
                Your reputation follows you throughout your career journey. Unlike traditional 
                recommendations, your inRooms reputation is dynamic and grows with each contribution.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Badges Showcase */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Badges You Can Earn
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-center">
              <div className="bg-blue-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Host</h3>
              <p className="text-sm text-gray-600">
                Organize and lead valuable networking events for the community
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-center">
              <div className="bg-green-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Thought Leader</h3>
              <p className="text-sm text-gray-600">
                Share valuable insights that help others grow professionally
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-center">
              <div className="bg-purple-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connector</h3>
              <p className="text-sm text-gray-600">
                Facilitate meaningful connections between community members
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-center">
              <div className="bg-yellow-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mentor</h3>
              <p className="text-sm text-gray-600">
                Provide guidance and support to help others succeed
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-center">
              <div className="bg-red-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Deal Maker</h3>
              <p className="text-sm text-gray-600">
                Successfully facilitate business deals and partnerships
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-center">
              <div className="bg-indigo-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
                <Code className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Builder</h3>
              <p className="text-sm text-gray-600">
                Create and launch products or features with community input
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-center">
              <div className="bg-orange-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
                <Coffee className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Regular</h3>
              <p className="text-sm text-gray-600">
                Consistently participate and contribute to the community
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-center">
              <div className="bg-teal-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
                <Lightbulb className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Innovator</h3>
              <p className="text-sm text-gray-600">
                Bring fresh ideas and innovative approaches to challenges
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl py-12 md:py-16 px-6 md:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            {user ? 'Continue Building Your Reputation' : 'Start Building Your Reputation Today'}
          </h2>
          <p className="mt-4 text-xl text-indigo-100 max-w-2xl mx-auto">
            Get recognized for real contributions — right alongside your work.
            Join thousands of professionals building verifiable reputations on inRooms.
          </p>
          <div className="mt-8 flex justify-center">
            {user ? (
              <Link to="/events">
                <Button
                  size="lg"
                  className="text-lg px-8 bg-white text-indigo-600 hover:bg-gray-100"
                >
                  Join an Event
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/signup">
                <Button
                  size="lg"
                  className="text-lg px-8 bg-white text-indigo-600 hover:bg-gray-100"
                >
                  Create Your Profile
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}