import React, { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useTour } from '../../contexts/TourContext';
import { TourProgress } from './TourProgress';
import { useNavigate } from 'react-router-dom';

export function MainTour() {
  const { 
    isTourOpen, 
    closeTour, 
    currentTour, 
    completeTour, 
    tourStep, 
    setTourStep,
    skipTour
  } = useTour();
  const navigate = useNavigate();
  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    if (currentTour === 'main') {
      setSteps([
        {
          target: 'body',
          content: {
            title: 'Welcome to inRooms!',
            description: 'Let\'s take a quick tour to help you get started with our platform. We\'ll show you the key features to help you make the most of your experience.'
          },
          placement: 'center',
          disableBeacon: true,
        },
        {
          target: '[data-tour="navigation"]',
          content: {
            title: 'Main Navigation',
            description: 'This navigation bar lets you access different sections of the platform. You can browse events, connect with other professionals, and explore solutions.'
          },
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="events"]',
          content: {
            title: 'Events Section',
            description: 'Find and register for networking events here. Your subscription includes a specific number of events each month.'
          },
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="network"]',
          content: {
            title: 'Network Section',
            description: 'Connect with other tech sales professionals, view profiles, and build your professional network.'
          },
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="solutions"]',
          content: {
            title: 'Solutions Showcase',
            description: 'Discover product demos from other companies or host your own to showcase your solutions.'
          },
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="user-menu"]',
          content: {
            title: 'User Menu',
            description: 'Access your profile, account settings, billing information, and more from this menu.'
          },
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="notifications"]',
          content: {
            title: 'Notifications',
            description: 'Stay updated with important alerts about events, connection requests, and platform updates.'
          },
          placement: 'bottom',
          disableBeacon: true,
        }
      ]);
    } else if (currentTour === 'events') {
      setSteps([
        {
          target: '[data-tour="events-header"]',
          content: {
            title: 'Events Page',
            description: 'This is where you can discover and join networking events with other tech sales professionals.'
          },
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="events-search"]',
          content: {
            title: 'Search Events',
            description: 'Looking for specific topics? Use this search bar to find events that match your interests or needs.'
          },
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="events-quota"]',
          content: {
            title: 'Event Quota',
            description: 'Your subscription includes a specific number of events each month. This tracker shows how many you have remaining.'
          },
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="event-card"]',
          content: {
            title: 'Event Card',
            description: 'Each card shows event details including title, description, date, and participant count. Click "Register Now" to join an event.'
          },
          placement: 'right',
          disableBeacon: true,
        }
      ]);
    } else if (currentTour === 'network') {
      setSteps([
        {
          target: '[data-tour="network-header"]',
          content: {
            title: 'Network Page',
            description: 'This is your hub for connecting with other tech sales professionals and growing your network.'
          },
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="network-search"]',
          content: {
            title: 'Search Connections',
            description: 'Find specific people by searching for their name, company, title, or skills.'
          },
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="network-tabs"]',
          content: {
            title: 'Network Tabs',
            description: 'Toggle between viewing your existing connections and discovering new people to connect with.'
          },
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="connection-card"]',
          content: {
            title: 'Connection Card',
            description: 'View profile details, send messages, and manage your connections. Click "Connect" to send a connection request.'
          },
          placement: 'right',
          disableBeacon: true,
        }
      ]);
    } else if (currentTour === 'profile') {
      setSteps([
        {
          target: '[data-tour="profile-header"]',
          content: {
            title: 'Your Profile',
            description: 'This is your professional profile that others will see when they view your page. A complete profile helps you make better connections.'
          },
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="profile-edit"]',
          content: {
            title: 'Edit Profile',
            description: 'Click here to update your profile information, including your title, company, skills, and more.'
          },
          placement: 'left',
          disableBeacon: true,
        },
        {
          target: '[data-tour="profile-about"]',
          content: {
            title: 'About Section',
            description: 'This is where you can share your professional background and expertise. A compelling bio helps others understand your value.'
          },
          placement: 'right',
          disableBeacon: true,
        },
        {
          target: '[data-tour="profile-skills"]',
          content: {
            title: 'Skills & Expertise',
            description: 'Highlight your key skills to attract relevant connections and opportunities. These skills also help our system recommend events for you.'
          },
          placement: 'right',
          disableBeacon: true,
        }
      ]);
    }
  }, [currentTour]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, type } = data;
    
    if (type === 'step:after') {
      // Update step when the user navigates
      setTourStep(index + 1);
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Tour is complete or skipped
      if (currentTour) {
        completeTour(currentTour).catch(console.error);
      }
      closeTour();
    }
  };

  const handleNext = () => {
    if (tourStep < steps.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      // Tour complete
      if (currentTour) {
        completeTour(currentTour).catch(console.error);
      }
      closeTour();
    }
  };

  const handlePrev = () => {
    if (tourStep > 0) {
      setTourStep(tourStep - 1);
    }
  };

  // Navigate to specific pages based on the tour
  useEffect(() => {
    if (isTourOpen && currentTour) {
      if (currentTour === 'events') {
        navigate('/events');
      } else if (currentTour === 'network') {
        navigate('/network');
      } else if (currentTour === 'profile') {
        navigate('/profile');
      }
    }
  }, [isTourOpen, currentTour, navigate]);

  if (!isTourOpen || !currentTour || steps.length === 0) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={isTourOpen}
      stepIndex={tourStep}
      continuous
      showProgress={false}
      showSkipButton={false}
      disableCloseOnEsc
      disableOverlayClose
      disableOverlay={false}
      hideBackButton
      hideCloseButton
      spotlightClicks
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#4f46e5', // indigo-600
          arrowColor: '#ffffff',
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          textColor: '#1f2937', // gray-800
          width: 320,
        },
        spotlight: {
          borderRadius: '8px',
        },
        tooltip: {
          padding: 0,
          borderRadius: '8px',
        },
        buttonNext: {
          display: 'none',
        },
        buttonBack: {
          display: 'none',
        },
        buttonSkip: {
          display: 'none',
        },
        buttonClose: {
          display: 'none',
        },
      }}
      floaterProps={{
        disableAnimation: false,
      }}
      callback={handleJoyrideCallback}
      tooltipComponent={({ step, isLastStep }) => (
        <TourProgress
          currentStep={tourStep}
          totalSteps={steps.length}
          title={(step.content as any).title}
          description={(step.content as any).description}
          onNext={handleNext}
          onPrev={handlePrev}
          onSkip={skipTour}
          onClose={closeTour}
          isLastStep={isLastStep}
        />
      )}
    />
  );
}