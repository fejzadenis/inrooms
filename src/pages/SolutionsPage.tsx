import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { DemoCard } from '../components/solutions/DemoCard';
import { DemoScheduleModal } from '../components/solutions/DemoScheduleModal';
import { DemoRegistrationModal } from '../components/solutions/DemoRegistrationModal';
import { RecordingUploadModal } from '../components/solutions/RecordingUploadModal';
import { 
  Plus, 
  Search, 
  Filter, 
  Star, 
  Video, 
  Calendar,
  Users,
  Play,
  Upload,
  Sparkles,
  Rocket,
  Zap,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { useTour } from '../contexts/TourContext';
import { demoService } from '../services/demoService';
import { stripeService } from '../services/stripeService';
import { toast } from 'react-hot-toast';
import type { Demo } from '../types/demo';
import { motion } from 'framer-motion';

export function SolutionsPage() {
  const { user } = useAuth();
  const { askForTourPermission, startTour, completeTour } = useTour();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [demos, setDemos] = React.useState<Demo[]>([]);
  const [featuredDemos, setFeaturedDemos] = React.useState<Demo[]>([]);
  const [recordings, setRecordings] = React.useState<Demo[]>([]);
  const [userRegistrations, setUserRegistrations] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'all' | 'featured' | 'recordings' | 'my-demos'>('featured');
  
  // Modal states
  const [isScheduleModalOpen, setIsScheduleModalOpen] = React.useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = React.useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [selectedDemo, setSelectedDemo] = React.useState<Demo | null>(null);
  const [featuringDemo, setFeaturingDemo] = React.useState<Demo | null>(null);
  
  // Refs for animation
  const headerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    loadDemos();
    if (user) {
      loadUserRegistrations();
    }
  }, [user]);

  // Check if we should show the solutions tour
  useEffect(() => {
    const checkTourStatus = async () => {
      if (user && !loading) {
        // Complete the tour journey if user has reached this page
        if (user.id) {
          await completeTour('main', user.id);
          await completeTour('events', user.id);
          await completeTour('network', user.id);
          
          toast.success('Tour completed! You now know the basics of inRooms. Explore and enjoy the platform!', {
            duration: 5000,
          });
        }
      }
    };

    checkTourStatus();
  }, [user, loading, completeTour]);

  React.useEffect(() => {
    // Check for success/cancel parameters from Stripe redirect
    const success = searchParams.get('success');
    const demoId = searchParams.get('demoId');
    const feature = searchParams.get('feature');
    
    if (success === 'true' && demoId && feature) {
      toast.success('Payment successful! Your product will be featured shortly.');
      loadDemos();
    } else if (searchParams.get('canceled') === 'true') {
      toast.error('Payment canceled. Your product was not featured.');
    }
  }, [searchParams]);

  const loadDemos = async () => {
    try {
      setLoading(true);
      
      // Load all public demos
      const allDemos = await demoService.getDemos({ isPublic: true });
      setDemos(allDemos);

      // Load featured demos
      const featured = await demoService.getFeaturedDemos();
      setFeaturedDemos(featured);

      // Load demos with recordings
      const withRecordings = allDemos.filter(demo => demo.recordingUrl && demo.status === 'completed');
      setRecordings(withRecordings);
      
    } catch (error) {
      console.error('Failed to load demos:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadUserRegistrations = async () => {
    if (!user) return;
    
    try {
      const registrations = await demoService.getUserDemoRegistrations(user.id);
      setUserRegistrations(registrations.map(reg => reg.demoId));
    } catch (error) {
      console.error('Failed to load user registrations:', error);
    }
  };

  const handleScheduleDemo = () => {
    if (!user) {
      toast.error('Please log in to showcase your product');
      return;
    }

    // Check if user can schedule demos (enterprise subscription or admin)
    const canScheduleDemos = user.role === 'admin' || user.subscription.status === 'active';
    if (!canScheduleDemos) {
      toast.error('Product showcase is available for enterprise members only');
      return;
    }

    setIsScheduleModalOpen(true);
  };

  const handleRegisterForDemo = (demo: Demo) => {
    setSelectedDemo(demo);
    setIsRegistrationModalOpen(true);
  };

  const handleUploadRecording = (demo: Demo) => {
    setSelectedDemo(demo);
    setIsUploadModalOpen(true);
  };

  const handleJoinDemo = (demo: Demo) => {
    if (demo.meetingLink) {
      window.open(demo.meetingLink, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('Meeting link not available');
    }
  };

  const handleViewRecording = (demo: Demo) => {
    if (demo.recordingUrl) {
      window.open(demo.recordingUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('Recording not available');
    }
  };

  const handleToggleFeatured = async (demo: Demo) => {
    if (!user) {
      toast.error('Please log in to manage products');
      return;
    }

    // Admin can toggle featured status directly
    if (user.role === 'admin') {
      try {
        await demoService.toggleFeaturedStatus(demo.id!, !demo.isFeatured);
        toast.success(`Product ${demo.isFeatured ? 'removed from' : 'added to'} featured`);
        loadDemos();
      } catch (error) {
        console.error('Failed to toggle featured status:', error);
        toast.error('Failed to update product');
      }
      return;
    }

    // For non-admins, if they're the demo host and it's not already featured, 
    // they need to purchase featured status
    if (demo.hostId === user.id && !demo.isFeatured) {
      handlePurchaseFeature(demo);
    } else if (demo.hostId !== user.id) {
      toast.error('You can only feature your own products');
    } else {
      toast.info('Please contact support to remove featured status');
    }
  };

  const handlePurchaseFeature = async (demo: Demo) => {
    if (!user) {
      toast.error('Please log in to feature products');
      return;
    }

    if (demo.hostId !== user.id && user.role !== 'admin') {
      toast.error('You can only feature your own products');
      return;
    }

    try {
      setFeaturingDemo(demo);
      await stripeService.purchaseFeatureForDemo(
        user.id,
        user.email,
        demo.id!,
        'featured_demo'
      );
    } catch (error) {
      console.error('Failed to initiate feature purchase:', error);
      toast.error('Failed to process payment. Please try again.');
      setFeaturingDemo(null);
    }
  };

  const getFilteredDemos = () => {
    let filteredDemos: Demo[] = [];
    
    switch (activeTab) {
      case 'featured':
        filteredDemos = featuredDemos;
        break;
      case 'recordings':
        filteredDemos = recordings;
        break;
      case 'my-demos':
        filteredDemos = user ? demos.filter(demo => demo.hostId === user.id) : [];
        break;
      default:
        filteredDemos = demos;
    }

    if (searchTerm) {
      filteredDemos = filteredDemos.filter(demo =>
        demo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        demo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        demo.hostCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
        demo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filteredDemos;
  };

  const canScheduleDemos = user && (user.role === 'admin' || user.subscription.status === 'active');
  
  const handleUpgradeClick = () => {
    navigate('/billing');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading products...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Hero Section with Futuristic Design */}
        <motion.div 
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 py-16 px-8 text-center"
          data-tour="solutions-header"
        >
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
          
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-20"></div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative z-10"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-full p-4 border border-white border-opacity-20">
                <Rocket className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Product Showcase</h1>
            <p className="mt-4 text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
              Discover innovative products and ideas from visionary founders. Connect with creators, 
              investors, and early adopters to bring the next big thing to life.
            </p>
          </motion.div>
        </motion.div>

        {/* Action Bar with Futuristic Design */}
        <motion.div 
          ref={searchRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-lg p-6"
          data-tour="solutions-search"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products, companies, or technologies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full rounded-lg border border-indigo-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm bg-indigo-50"
              />
            </div>
            
            <div className="flex space-x-3 w-full sm:w-auto">
              <Button variant="outline" className="flex-1 sm:flex-none border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              {canScheduleDemos && (
                <Button onClick={handleScheduleDemo} className="flex-1 sm:flex-none bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" data-tour="schedule-demo">
                  <Plus className="w-4 h-4 mr-2" />
                  Showcase Product
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats with Futuristic Design */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6" 
          data-tour="solutions-stats"
        >
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 md:p-6 text-white shadow-lg border border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-xs md:text-sm">Total Products</p>
                <p className="text-xl md:text-3xl font-bold">{demos.length}</p>
              </div>
              <div className="bg-white bg-opacity-10 p-3 rounded-lg">
                <Video className="w-6 h-6 md:w-8 md:h-8 text-blue-200" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-4 md:p-6 text-white shadow-lg border border-yellow-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-xs md:text-sm">Featured</p>
                <p className="text-xl md:text-3xl font-bold">{featuredDemos.length}</p>
              </div>
              <div className="bg-white bg-opacity-10 p-3 rounded-lg">
                <Star className="w-6 h-6 md:w-8 md:h-8 text-yellow-100" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl p-4 md:p-6 text-white shadow-lg border border-green-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs md:text-sm">Demos</p>
                <p className="text-xl md:text-3xl font-bold">{recordings.length}</p>
              </div>
              <div className="bg-white bg-opacity-10 p-3 rounded-lg">
                <Play className="w-6 h-6 md:w-8 md:h-8 text-green-100" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-4 md:p-6 text-white shadow-lg border border-purple-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs md:text-sm">This Month</p>
                <p className="text-xl md:text-3xl font-bold">
                  {demos.filter(demo => {
                    const now = new Date();
                    const demoDate = new Date(demo.scheduledDate);
                    return demoDate.getMonth() === now.getMonth() && demoDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="bg-white bg-opacity-10 p-3 rounded-lg">
                <Calendar className="w-6 h-6 md:w-8 md:h-8 text-purple-100" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs with Futuristic Design */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="border-b border-indigo-100 overflow-x-auto" 
          data-tour="solutions-tabs"
        >
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('featured')}
              className={`${
                activeTab === 'featured'
                  ? 'border-indigo-500 text-indigo-600 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-all duration-200`}
            >
              <Star className="w-4 h-4 mr-2" />
              Featured ({featuredDemos.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`${
                activeTab === 'all'
                  ? 'border-indigo-500 text-indigo-600 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-all duration-200`}
            >
              <Rocket className="w-4 h-4 mr-2" />
              All Products ({demos.length})
            </button>
            <button
              onClick={() => setActiveTab('recordings')}
              className={`${
                activeTab === 'recordings'
                  ? 'border-indigo-500 text-indigo-600 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-all duration-200`}
            >
              <Play className="w-4 h-4 mr-2" />
              Demos ({recordings.length})
            </button>
            {user && (
              <button
                onClick={() => setActiveTab('my-demos')}
                className={`${
                  activeTab === 'my-demos'
                    ? 'border-indigo-500 text-indigo-600 font-medium'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-all duration-200`}
              >
                <Users className="w-4 h-4 mr-2" />
                My Products ({demos.filter(demo => demo.hostId === user.id).length})
              </button>
            )}
          </nav>
        </motion.div>

        {/* Demo Grid with Futuristic Design */}
        <motion.div 
          ref={gridRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {getFilteredDemos().length === 0 ? (
            <div className="col-span-full text-center py-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <Rocket className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                {searchTerm ? 'No products found' : 'No products available'}
              </h3>
              <p className="text-gray-500 mt-2">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : activeTab === 'my-demos'
                  ? 'You haven\'t showcased any products yet'
                  : 'Check back later for new products'}
              </p>
              {activeTab === 'my-demos' && canScheduleDemos && (
                <Button className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" onClick={handleScheduleDemo}>
                  <Plus className="w-4 h-4 mr-2" />
                  Showcase Your First Product
                </Button>
              )}
            </div>
          ) : (
            getFilteredDemos().map((demo, index) => (
              <motion.div 
                key={demo.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                data-tour={index === 0 ? "demo-card" : undefined}
              >
                <DemoCard
                  demo={demo}
                  isRegistered={userRegistrations.includes(demo.id!)}
                  canManage={user?.id === demo.hostId || user?.role === 'admin'}
                  onRegister={() => handleRegisterForDemo(demo)}
                  onJoin={() => handleJoinDemo(demo)}
                  onViewRecording={() => handleViewRecording(demo)}
                  onUploadRecording={() => handleUploadRecording(demo)}
                  onToggleFeatured={() => handleToggleFeatured(demo)}
                  isFeaturingInProgress={featuringDemo?.id === demo.id}
                />
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Enterprise CTA with Futuristic Design */}
        {!canScheduleDemos && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-xl p-8 md:p-10 text-white shadow-xl border border-indigo-500" 
            data-tour="solutions-cta"
          >
            <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
            
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-20"></div>
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-white bg-opacity-10 backdrop-blur-lg rounded-full border border-white border-opacity-20 mb-6">
                <Lightbulb className="w-8 h-8 text-yellow-300" />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Showcase Your Innovation</h3>
              <p className="text-indigo-100 mb-8 max-w-2xl mx-auto text-sm md:text-base">
                Upgrade to an Enterprise plan to showcase your products, share demos, 
                and connect with potential customers, partners, and investors.
              </p>
              <div className="flex justify-center">
                <Button 
                  className="bg-white text-indigo-600 hover:bg-gray-100 shadow-lg px-6 py-3"
                  onClick={handleUpgradeClick}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Upgrade to Enterprise
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Why Showcase Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="bg-white rounded-xl border border-gray-200 shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-center mb-8">Why Showcase Your Product</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
              <div className="bg-indigo-100 p-3 rounded-lg inline-block mb-4">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect with Users</h3>
              <p className="text-gray-600">Get valuable feedback from early adopters and build your initial user base.</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <div className="bg-purple-100 p-3 rounded-lg inline-block mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Attract Investors</h3>
              <p className="text-gray-600">Demonstrate your product's potential to investors looking for the next big opportunity.</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
              <div className="bg-blue-100 p-3 rounded-lg inline-block mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Partners</h3>
              <p className="text-gray-600">Discover potential partners to help scale your product and reach new markets.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <DemoScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSuccess={loadDemos}
      />

      <DemoRegistrationModal
        demo={selectedDemo}
        isOpen={isRegistrationModalOpen}
        onClose={() => {
          setIsRegistrationModalOpen(false);
          setSelectedDemo(null);
        }}
        onSuccess={() => {
          loadDemos();
          loadUserRegistrations();
        }}
      />

      <RecordingUploadModal
        demo={selectedDemo}
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedDemo(null);
        }}
        onSuccess={loadDemos}
      />
    </MainLayout>
  );
}