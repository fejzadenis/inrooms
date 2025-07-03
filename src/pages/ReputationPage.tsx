import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
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
  Target
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function ReputationPage() {
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
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 h-32 relative">
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
          
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-8">
              <div className="flex-shrink-0">
                <img 
                  src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg" 
                  alt="Profile" 
                  className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              </div>
              
              <div className="mt-6 md:mt-0 md:ml-6 flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Michael Chen</h2>
                    <p className="text-gray-600">Enterprise Sales Director at CloudTech Solutions</p>
                    <p className="text-sm text-gray-500 mt-1">San Francisco, CA</p>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Top Contributor
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      Verified Expert
                    </div>
                    <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      Mentor
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Reputation Badges</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Event Host</p>
                        <p className="text-sm text-gray-500">12 events hosted</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center space-x-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <MessageSquare className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Thought Leader</p>
                        <p className="text-sm text-gray-500">25+ insights shared</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center space-x-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Connector</p>
                        <p className="text-sm text-gray-500">50+ connections</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center space-x-3">
                      <div className="bg-yellow-100 p-2 rounded-lg">
                        <Star className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">5-Star Mentor</p>
                        <p className="text-sm text-gray-500">4.9/5 rating</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center space-x-3">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <Zap className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Deal Maker</p>
                        <p className="text-sm text-gray-500">8 deals facilitated</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center space-x-3">
                      <div className="bg-indigo-100 p-2 rounded-lg">
                        <Shield className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Verified Pro</p>
                        <p className="text-sm text-gray-500">Identity verified</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Contributions</h3>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Hosted "Enterprise Sales Strategies" workshop</p>
                            <p className="text-sm text-gray-500 mt-1">Shared insights with 45 attendees • May 15, 2025</p>
                          </div>
                        </div>
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          +25 points
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="bg-purple-100 p-2 rounded-lg">
                            <Users className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Connected Sarah Johnson with Alex Rodriguez</p>
                            <p className="text-sm text-gray-500 mt-1">Successful introduction led to partnership • April 28, 2025</p>
                          </div>
                        </div>
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          +15 points
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="bg-yellow-100 p-2 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Provided mentorship to 3 early-stage founders</p>
                            <p className="text-sm text-gray-500 mt-1">5-star feedback received • April 10, 2025</p>
                          </div>
                        </div>
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          +30 points
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-100">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Reputation Score</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-indigo-600">875</span>
                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                      Top 5%
                    </span>
                  </div>
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '87.5%' }}></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Based on activity, contributions, and peer recognition
                  </p>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      Enterprise Sales
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      SaaS
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      Strategic Partnerships
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      Sales Leadership
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      Deal Negotiation
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      Team Building
                    </span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Endorsements</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <img 
                        src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg" 
                        alt="Sarah Johnson" 
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Sarah Johnson</p>
                        <p className="text-sm text-gray-500">
                          "Michael's strategic insights helped us close our biggest enterprise deal to date."
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <img 
                        src="https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg" 
                        alt="Alex Rodriguez" 
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Alex Rodriguez</p>
                        <p className="text-sm text-gray-500">
                          "Exceptional mentor who truly cares about helping others succeed."
                        </p>
                      </div>
                    </div>
                  </div>
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
            Start Building Your Reputation Today
          </h2>
          <p className="mt-4 text-xl text-indigo-100 max-w-2xl mx-auto">
            Get recognized for real contributions — right alongside your work.
            Join thousands of professionals building verifiable reputations on inRooms.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to="/signup">
              <Button
                size="lg"
                className="text-lg px-8 bg-white text-indigo-600 hover:bg-gray-100"
              >
                Create Your Profile
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}