import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { linkedinService } from '../services/linkedinService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';

export function LinkedInCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    const handleCallback = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (!code) {
        toast.error('LinkedIn authentication failed');
        navigate('/profile');
        return;
      }

      try {
        // Exchange code for access token (this would typically be done through your backend)
        const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
        const clientSecret = import.meta.env.VITE_LINKEDIN_CLIENT_SECRET;
        const redirectUri = `${window.location.origin}/linkedin-callback`;

        const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
          }),
        });

        const tokenData = await tokenResponse.json();
        
        // Connect LinkedIn profile
        await linkedinService.connectLinkedIn(user.id, tokenData.access_token);
        
        // Import connections
        await linkedinService.importLinkedInConnections(user.id, tokenData.access_token);

        toast.success('LinkedIn account connected successfully!');
        navigate('/profile');
      } catch (error) {
        console.error('Error handling LinkedIn callback:', error);
        toast.error('Failed to connect LinkedIn account');
        navigate('/profile');
      }
    };

    handleCallback();
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner className="w-8 h-8 text-indigo-600 mx-auto" />
        <p className="mt-4 text-gray-600">Connecting your LinkedIn account...</p>
      </div>
    </div>
  );
}