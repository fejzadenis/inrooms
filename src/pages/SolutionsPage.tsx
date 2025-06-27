import React, { useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { useTour } from '../contexts/TourContext';
import { demoService } from '../services/demoService';
import { stripeService } from '../services/stripeService';
import { toast } from 'react-hot-toast';
import type { Demo } from '../types/demo';

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
      toast.success('Payment successful! Your demo will be featured shortly.');
      loadDemos();
    } else if (searchParams.get('canceled') === 'true') {
      toast.error('Payment canceled. Your demo was not featured.');
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
      toast.error('Failed to load demos');
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
      toast.error('Please log in to schedule demos');
      return;
    }

    // Check if user can schedule demos (enterprise subscription or admin)
    const canScheduleDemos = user.role === 'admin' || user.subscription.status === 'active';
    if (!canScheduleDemos) {
      toast.error('Demo scheduling is available for enterprise members only');
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
      toast.error('Please log in to manage demos');
      return;
    }

    // Admin can toggle featured status directly
    if (user.role === 'admin') {
      try {
        await demoService.toggleFeaturedStatus(demo.id!, !demo.isFeatured);
        toast.success(`Demo ${demo.isFeatured ? 'removed from' : 'added to'} featured`);
        loadDemos();
      } catch (error) {
        console.error('Failed to toggle featured status:', error);
        toast.error('Failed to update demo');
      }
      return;
    }

    // For non-admins, if they're the demo host and it's not already featured, 
    // they need to purchase featured status
    if (demo.hostId === user.id && !demo.isFeatured) {
      handlePurchaseFeature(demo);
    } else if (demo.hostId !== user.id) {
      toast.error('You can only feature your own demos');
    } else {
      toast.info('Please contact support to remove featured status');
    }
  };

  const handlePurchaseFeature = async (demo: Demo) => {
    if (!user) {
      toast.error('Please log in to feature demos');
      return;
    }

    if (demo.hostId !== user.id && user.role !== 'admin') {
      toast.error('You can only feature your own demos');
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
          <div className="text-lg text-gray-600">Loading solutions...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center" data-tour="solutions-header">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full p-3">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Solutions Showcase</h1>
          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Discover innovative solutions through live product demos and recorded sessions. 
            See how industry leaders solve real business challenges and practice your pitch.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between" data-tour="solutions-search">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search demos, companies, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
          </div>
          
          <div className="flex space-x-3 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            {canScheduleDemos && (
              <Button onClick={handleScheduleDemo} className="flex-1 sm:flex-none" data-tour="schedule-demo">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Demo
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6" data-tour="solutions-stats">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 md:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs md:text-sm">Total Demos</p>
                <p className="text-xl md:text-3xl font-bold">{demos.length}</p>
              </div>
              <Video className="w-6 h-6 md:w-8 md:h-8 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-4 md:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-xs md:text-sm">Featured</p>
                <p className="text-xl md:text-3xl font-bold">{featuredDemos.length}</p>
              </div>
              <Star className="w-6 h-6 md:w-8 md:h-8 text-yellow-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 md:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs md:text-sm">Recordings</p>
                <p className="text-xl md:text-3xl font-bold">{recordings.length}</p>
              </div>
              <Play className="w-6 h-6 md:w-8 md:h-8 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 md:p-6 text-white">
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
              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto" data-tour="solutions-tabs">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('featured')}
              className={`${
                activeTab === 'featured'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Star className="w-4 h-4 mr-2" />
              Featured ({featuredDemos.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`${
                activeTab === 'all'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Video className="w-4 h-4 mr-2" />
              All Demos ({demos.length})
            </button>
            <button
              onClick={() => setActiveTab('recordings')}
              className={`${
                activeTab === 'recordings'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Play className="w-4 h-4 mr-2" />
              Recordings ({recordings.length})
            </button>
            {user && (
              <button
                onClick={() => setActiveTab('my-demos')}
                className={`${
                  activeTab === 'my-demos'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Users className="w-4 h-4 mr-2" />
                My Demos ({demos.filter(demo => demo.hostId === user.id).length})
              </button>
            )}
          </nav>
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredDemos().length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                {searchTerm ? 'No demos found' : 'No demos available'}
              </h3>
              <p className="text-gray-500 mt-2">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : activeTab === 'my-demos'
                  ? 'You haven\'t scheduled any demos yet'
                  : 'Check back later for new demos'}
              </p>
              {activeTab === 'my-demos' && canScheduleDemos && (
                <Button className="mt-4" onClick={handleScheduleDemo}>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Your First Demo
                </Button>
              )}
            </div>
          ) : (
            getFilteredDemos().map((demo, index) => (
              <div key={demo.id} data-tour={index === 0 ? "demo-card" : undefined}>
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
              </div>
            ))
          )}
        </div>

        {/* Enterprise CTA */}
        {!canScheduleDemos && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 md:p-8 text-white" data-tour="solutions-cta">
            <div className="text-center">
              <h3 className="text-xl md:text-2xl font-bold mb-4">Showcase Your Solutions</h3>
              <p className="text-indigo-100 mb-6 max-w-2xl mx-auto text-sm md:text-base">
                Upgrade to an Enterprise plan to schedule your own product demos, 
                share recordings, and reach potential customers.
              </p>
              <div className="flex justify-center">
                <Button 
                  className="bg-white text-indigo-600 hover:bg-gray-100"
                  onClick={handleUpgradeClick}
                >
                  Upgrade to Enterprise
                </Button>
              </div>
            </div>
          </div>
        )}
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