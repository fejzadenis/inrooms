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
            description: 'Let\'s take a quick tour to help you get started with our platform. We\'ll show you the key sections to help you make the most of your experience.'
          },
          placement: 'center',
          disableBeacon: true,
        },
        {
          target: '[data-tour="events"]',
          content: {
            title: 'Events Section',
            description: 'Click here to explore networking events. This is where you can find and register for events with other tech sales professionals.'
          },
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="network"]',
          content: {
            title: 'Network Section',
            description: 'Here you can connect with other professionals, build your network, and manage your connections.'
          },
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="solutions"]',
          content: {
            title: 'Solutions Section',
            description: 'Discover product demos and solutions from other professionals. You can also showcase your own products here.'
          },
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="resources"]',
          content: {
            title: 'Resources Section',
            description: 'Access helpful resources, guides, and templates to enhance your sales skills and career.'
          },
          placement: 'bottom',
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