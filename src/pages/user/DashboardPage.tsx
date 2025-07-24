import React from 'react';
import { toast } from 'react-hot-toast';
import { MainLayout } from '../../layouts/MainLayout';
import { useAuth } from '../../contexts/AuthContext'; // Keep useAuth
import { Calendar, BookOpen, ArrowRight } from 'lucide-react'; // Add icons
import { Link } from 'react-router-dom'; // Add Link

export function DashboardPage() {
  const { user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = React.useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [subscriptionData, setSubscriptionData] = React.useState<{
    status: string;
    courseCreditsQuota: number;
    courseCreditsUsed: number;
    trialEndsAt?: Date;
  } | null>(null);

  React.useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    console.log("DASHBOARD DEBUG: Loading dashboard data for user", user.id, "type:", typeof user.id);
    
    console.log("DASHBOARD DEBUG: Loading dashboard data for user", user.id, "type:", typeof user.id);
    
    // Get latest subscription data from Supabase
    try {
      setLoading(true);
      
      const userIdString = user.id.toString();
      console.log("DASHBOARD DEBUG: Using user ID string:", userIdString);
      
      const userIdString = user.id.toString();
      console.log("DASHBOARD DEBUG: Using user ID string:", userIdString);
      
      // Fetch latest subscription data from Supabase
      console.log("DASHBOARD DEBUG: Fetching subscription data from Supabase for user", user.id);
      
      // Try using the RPC function first
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_user_subscription_details', { user_id_param: userIdString }); // Assuming a new RPC for subscription details
      
      if (!rpcError && rpcData && rpcData.length > 0) {
        console.log("DASHBOARD DEBUG: RPC returned subscription data:", rpcData[0]);
        const subscriptionData = rpcData[0];
        
        setSubscriptionData({
          status: subscriptionData.subscription_status || 'inactive',
          courseCreditsQuota: subscriptionData.subscription_course_credits_quota || 0,
          courseCreditsUsed: subscriptionData.subscription_course_credits_used || 0,
          trialEndsAt: subscriptionData.subscription_trial_ends_at ? new Date(subscriptionData.subscription_trial_ends_at) : undefined
        });
      } else {
        // Fallback to direct query if RPC fails
        console.log("DASHBOARD DEBUG: RPC failed, falling back to direct query. Error:", rpcError);
        
      console.log("DASHBOARD DEBUG: Fetching subscription data from Supabase for user", user.id);
      
      // Try using the RPC function first
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_user_subscription_details', { user_id_param: userIdString }); // Assuming a new RPC for subscription details
      
      if (!rpcError && rpcData && rpcData.length > 0) {
        console.log("DASHBOARD DEBUG: RPC returned subscription data:", rpcData[0]);
        const subscriptionData = rpcData[0];
        
        setSubscriptionData({
          status: subscriptionData.subscription_status || 'inactive',
          courseCreditsQuota: subscriptionData.subscription_course_credits_quota || 0,
          courseCreditsUsed: subscriptionData.subscription_course_credits_used || 0,
          trialEndsAt: subscriptionData.subscription_trial_ends_at ? new Date(subscriptionData.subscription_trial_ends_at) : undefined
        });
      } else {
        // Fallback to direct query if RPC fails
        console.log("DASHBOARD DEBUG: RPC failed, falling back to direct query. Error:", rpcError);
        
      const { data: userData, error: userError } = await supabase
        .from('users') // Assuming 'users' is the table where subscription data is stored
        .select('subscription_status, subscription_course_credits_quota, subscription_course_credits_used, subscription_trial_ends_at')
        .eq('id', userIdString)
        .maybeSingle();
        
      if (!userError && userData) {
        console.log("DASHBOARD DEBUG: Supabase subscription data:", userData);
        console.log("DASHBOARD DEBUG: Supabase subscription data:", userData);
        // Store the subscription data
        setSubscriptionData({
          status: userData.subscription_status || 'inactive',
          courseCreditsQuota: userData.subscription_course_credits_quota || 0,
          courseCreditsUsed: userData.subscription_course_credits_used || 0,
          trialEndsAt: userData.subscription_trial_ends_at ? new Date(userData.subscription_trial_ends_at) : undefined
        });
      } else {
        console.log("DASHBOARD DEBUG: Error or no data from Supabase:", userError);
      }
      }
      }
      
      // Events are coming soon, so no need to load them
      setUpcomingEvents([]); 
      setRegisteredEvents([]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    if (!user) return;

    console.log("DASHBOARD DEBUG: Registering for event", eventId, "User ID:", user.id, "Type:", typeof user.id);
    
    // Get latest subscription data from Supabase
    const userIdString = user.id.toString();
    console.log("DASHBOARD DEBUG: Using user ID string:", userIdString);
    
    // Try using the RPC function first
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_user_subscription', { user_id: userIdString });
    
    let userData = null;
    let userError = null;
    
    if (!rpcError && rpcData && rpcData.length > 0) {
      console.log("DASHBOARD DEBUG: RPC returned subscription data:", rpcData[0]);
      userData = rpcData[0];
    } else {
      // Fallback to direct query if RPC fails
      console.log("DASHBOARD DEBUG: RPC failed, falling back to direct query. Error:", rpcError);
      
      const result = await supabase
        .from('users')
        .select('subscription_status, subscription_course_credits_quota, subscription_course_credits_used')
        .eq('id', userIdString)
        .maybeSingle();
        
      userData = result.data;
      userError = result.error;
      
      console.log("DASHBOARD DEBUG: Direct query result:", userData, userError);
    }
      
    const courseCreditsUsed = userData?.subscription_course_credits_used || user.subscription.courseCreditsUsed;
    const courseCreditsQuota = userData?.subscription_course_credits_quota || user.subscription.courseCreditsQuota;
    
    console.log("DASHBOARD DEBUG: Current usage:", courseCreditsUsed, "/", courseCreditsQuota);
    
    if (courseCreditsUsed >= courseCreditsQuota) {
      toast.error('You have used all your course credits. Please upgrade your subscription to access more courses.');
      return;
    }

    const event = upcomingEvents.find(e => e.id === eventId);
    if (!event) return;

    console.log("DASHBOARD DEBUG: Found event:", event.title, "ID:", eventId);

    try {
      await eventService.registerForEvent(user.id, eventId);
      
      // Generate calendar event
      try {
        const icsFile = await generateCalendarEvent({
          title: event.title,
          description: event.description,
          startTime: event.date,
          duration: { hours: Math.floor(event.duration / 60), minutes: event.duration % 60 },
          location: event.meetLink || 'Online Event',
        });

        // Create calendar download link
        const blob = new Blob([icsFile], { type: 'text/calendar' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${event.title.toLowerCase().replace(/\s+/g, '-')}.ics`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (calendarError) {
        console.warn('Failed to generate calendar event:', calendarError);
      }

      setRegisteredEvents(prev => [...prev, eventId]);
      await loadDashboardData(); // Reload to update counts
      toast.success('Successfully registered! Calendar invite downloaded.');
    } catch (error: any) {
      console.error('Failed to register for event:', error, error.stack);
      toast.error(`Failed to register for event: ${error.message || 'Please try again.'}`);
    }
  };

  const handleJoinMeeting = (meetLink: string) => {
    if (meetLink) {
      window.open(meetLink, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('Meeting link not available');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900">Your Subscription</h2>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Events Remaining</span>
              <span className="text-lg font-medium text-gray-900">
                {subscriptionData // Use courseCreditsQuota and courseCreditsUsed
                  ? `${Math.max(0, subscriptionData.courseCreditsQuota - subscriptionData.courseCreditsUsed)} / ${subscriptionData.courseCreditsQuota}`
                  : user?.subscription
                    ? `${Math.max(0, user.subscription.courseCreditsQuota - user.subscription.courseCreditsUsed)} / ${user.subscription.courseCreditsQuota}`
                    : '0 / 0'
                }
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full"
                style={{
                  width: `${(() => {
                    // Calculate percentage with safety checks
                    if (subscriptionData && subscriptionData.courseCreditsQuota > 0) {
                      return Math.min(100, (subscriptionData.courseCreditsUsed / subscriptionData.courseCreditsQuota) * 100);
                    } else if (user?.subscription && user.subscription.courseCreditsQuota > 0) {
                      return Math.min(100, (user.subscription.courseCreditsUsed / user.subscription.courseCreditsQuota) * 100);
                    } else {
                      return 0;
                    }
                  })()}%`
                }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Subscription Status: <span className="capitalize font-medium">{subscriptionData?.status || user?.subscription.status}</span>
              {subscriptionData?.trialEndsAt && subscriptionData.status === 'trial' && (
                <span className="ml-2 text-blue-600">
                  (Ends {subscriptionData.trialEndsAt.toLocaleDateString()})
                </span>
              )}
            </div>
          </div>
        </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Upcoming Events (Coming Soon)</h2>
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Calendar className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Events are on their way!</h3>
              <p className="text-gray-500 mt-2">
                We're working hard to bring you exciting new networking opportunities. Check back soon!
              </p>
              <Link to="/courses">
                <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Explore Our Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900">Your Subscription</h2>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Course Credits Remaining</span>
              <span className="text-lg font-medium text-gray-900">
                {subscriptionData
                  ? `${Math.max(0, subscriptionData.courseCreditsQuota - subscriptionData.courseCreditsUsed)} / ${subscriptionData.courseCreditsQuota}`
                  : user?.subscription
                    ? `${Math.max(0, user.subscription.courseCreditsQuota - user.subscription.courseCreditsUsed)} / ${user.subscription.courseCreditsQuota}`
                    : '0 / 0'
                }
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full"
                style={{
                  width: `${(() => {
                    // Calculate percentage with safety checks
                    if (subscriptionData && subscriptionData.courseCreditsQuota > 0) {
                      return Math.min(100, (subscriptionData.courseCreditsUsed / subscriptionData.courseCreditsQuota) * 100);
                    } else if (user?.subscription && user.subscription.courseCreditsQuota > 0) {
                      return Math.min(100, (user.subscription.courseCreditsUsed / user.subscription.courseCreditsUsed) * 100);
                    } else {
                      return 0;
                    }
                  })()}%`
                }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Subscription Status: <span className="capitalize font-medium">{subscriptionData?.status || user?.subscription.status}</span>
              {subscriptionData?.trialEndsAt && subscriptionData.status === 'trial' && (
                <span className="ml-2 text-blue-600">
                  (Ends {subscriptionData.trialEndsAt.toLocaleDateString()})
                </span>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Upcoming Events (Coming Soon)</h2>
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Calendar className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Events are on their way!</h3>
              <p className="text-gray-500 mt-2">
                We're working hard to bring you exciting new networking opportunities. Check back soon!
              </p>
              <Link to="/courses">
                <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Explore Our Courses
                </Button>
              <p className="text-gray-500 mt-2">Check back later for new networking opportunities</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}