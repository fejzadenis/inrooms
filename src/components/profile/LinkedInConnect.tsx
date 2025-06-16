import React from 'react';
import { Linkedin, Bell } from 'lucide-react';
import { Button } from '../common/Button';
import { linkedinService } from '../../services/linkedinService';
import { reminderService } from '../../services/reminderService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface LinkedInConnectProps {
  onConnect: () => void;
  isConnected: boolean;
}

export function LinkedInConnect({ onConnect, isConnected }: LinkedInConnectProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [remindersEnabled, setRemindersEnabled] = React.useState(false);

  React.useEffect(() => {
    if (user && isConnected) {
      // Check for daily reminders when component mounts
      reminderService.checkDailyReminders(user.id);
    }
  }, [user, isConnected]);

  const handleConnect = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Initialize LinkedIn OAuth
      const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
      const redirectUri = `${window.location.origin}/linkedin-callback`;
      const scope = 'r_emailaddress r_liteprofile r_basicprofile';
      
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
      
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting to LinkedIn:', error);
      toast.error('Failed to connect to LinkedIn. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      await linkedinService.syncProfile(user.id, user.linkedinProfile.accessToken);
      toast.success('LinkedIn profile synced successfully!');
    } catch (error) {
      console.error('Error syncing LinkedIn profile:', error);
      toast.error('Failed to sync LinkedIn profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReminders = async () => {
    if (!user) return;

    try {
      if (!remindersEnabled) {
        await reminderService.createDailyReminder(user.id);
        setRemindersEnabled(true);
        toast.success('Daily reminders enabled!');
      } else {
        setRemindersEnabled(false);
        toast.success('Daily reminders disabled');
      }
    } catch (error) {
      console.error('Error toggling reminders:', error);
      toast.error('Failed to update reminder settings');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Linkedin className="w-6 h-6 text-[#0A66C2]" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">LinkedIn Integration</h3>
            <p className="text-sm text-gray-500">
              {isConnected
                ? 'Your LinkedIn account is connected'
                : 'Connect your LinkedIn account to import your professional network'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {isConnected && (
            <Button
              variant="outline"
              onClick={toggleReminders}
              className="flex items-center"
            >
              <Bell className="w-4 h-4 mr-2" />
              {remindersEnabled ? 'Disable Reminders' : 'Enable Reminders'}
            </Button>
          )}
          <Button
            variant={isConnected ? 'outline' : 'primary'}
            onClick={isConnected ? handleSync : handleConnect}
            isLoading={isLoading}
          >
            {isConnected ? 'Sync Profile' : 'Connect LinkedIn'}
          </Button>
        </div>
      </div>
    </div>
  );
}