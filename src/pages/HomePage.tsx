import React from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);
  const words = ['Co-founder', 'Mentor', 'Collaborator', 'Hire', 'Beta tester', 'Partner'];
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2000); // Change word every 2 seconds

    return () => clearInterval(interval);
  }, [words.length]);

  const speakers = [
    {
      name: "Sarah Johnson",
      title: "Enterprise Sales Director at TechCorp",
      date: "June 15, 2025",
      topic: "Building Enterprise Relationships That Last",
      image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    },
    {
      name: "Michael Chen",
      title: "VP of Sales at CloudSystems",
      date: "June 22, 2025",
      topic: "Navigating Complex Sales Cycles",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    },
    {
      name: "Alex Rodriguez",
      title: "Chief Revenue Officer at InnovateHub",
      date: "July 5, 2025",
      topic: "The Future of Tech Sales",
      image: "https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    },
    {
      name: "Jessica Williams",
      title: "Sales Enablement Director at SaaS Leaders",
      date: "July 12, 2025",
      topic: "Building High-Performance Sales Teams",
      image: "https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    }
  ];

  const nextSpeaker = () => {
    setCurrentSpeakerIndex((prevIndex) => (prevIndex + 1) % speakers.length);
  };

  const prevSpeaker = () => {
    setCurrentSpeakerIndex((prevIndex) => (prevIndex - 1 + speakers.length) % speakers.length);
  };

  const handleGetStarted = () => {
    if (user) {
      navigate('/events');
    } else {
      navigate('/signup');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-20">
        {/* Hero Section */}
        <div className="relative bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block">Meet Your Next</span>
                    <span className="block bg-gradient-to-r from-[#003B7A] to-[#00B2FF] text-transparent bg-clip-text min-h-[1.2em] transition-all duration-500 ease-in-out">
                      {words[currentWordIndex]}
                    </span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Curated virtual Rooms where early-stage startup builders connect, collaborate, and build momentum. Join private Rooms, hear tactical keynotes, and build reputation with live connections.
                  </p>
                  <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-3 sm:gap-4">
                    <Button 
                      onClick={handleGetStarted} 
                      className="w-full sm:w-auto px-8 py-3 text-base font-medium"
                    >
                      Get started
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <Link to="/about" className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full sm:w-auto px-8 py-3 text-base font-medium">
                        Learn more
                      </Button>
                    </Link>
                  </div>
                </div>
              </main>
            </div>
          </div>
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 flex items-center justify-center p-8">
            <div className="w-full max-w-2xl">
              <img
                src="/logo + typewrite colored scale 2.png"
                alt="inRooms Logo"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>

        {/* Upcoming Keynote Speakers Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Upcoming Keynote Speakers
            </h2>
            
            <div className="relative">
              {/* Slideshow Navigation */}
              <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10">
                <button 
                  onClick={prevSpeaker}
                  className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                  aria-label="Previous speaker"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
              </div>
              
              <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10">
                <button 
                  onClick={nextSpeaker}
                  className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                  aria-label="Next speaker"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
              </div>
              
              {/* Speakers Slideshow */}
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSpeakerIndex * 100}%)` }}
                >
                  {speakers.map((speaker, index) => (
                    <div key={index} className="w-full flex-shrink-0">
                      <div className="bg-white rounded-xl shadow-md overflow-hidden mx-auto max-w-4xl">
                        <div className="md:flex">
                          <div className="md:flex-shrink-0">
                            <img 
                              className="h-48 w-full object-cover md:h-full md:w-48" 
                              src={speaker.image} 
                              alt={speaker.name} 
                            />
                          </div>
                          <div className="p-8">
                            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                              {speaker.date}
                            </div>
                            <h3 className="mt-1 text-xl font-semibold text-gray-900">
                              {speaker.name}
                            </h3>
                            <p className="mt-1 text-gray-600">
                              {speaker.title}
                            </p>
                            <div className="mt-4">
                              <span className="text-gray-900 font-medium">Topic: </span>
                              <span className="text-gray-700">{speaker.topic}</span>
                            </div>
                            <div className="mt-4">
                              <Link to="/events">
                                <Button variant="outline" className="text-sm">
                                  Register for this event
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Dots Indicator */}
              <div className="flex justify-center mt-6 space-x-2">
                {speakers.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSpeakerIndex(index)}
                    className={`w-3 h-3 rounded-full ${
                      currentSpeakerIndex === index ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white mt-16">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Why choose inRooms?</h2>
              <p className="mt-4 text-lg text-gray-500">
                We're building the most effective networking platform for tech sales professionals.
              </p>
            </div>
            <dl className="mt-12 space-y-10 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-3 sm:gap-8">
              {[
                {
                  title: 'Curated Events',
                  description: 'Carefully selected topics and participants to ensure meaningful connections.',
                },
                {
                  title: 'Expert Networking',
                  description: 'Connect with industry leaders and experienced professionals in tech sales.',
                },
                {
                  title: 'Career Growth',
                  description: 'Learn from peers, share experiences, and discover new opportunities.',
                },
              ].map((feature) => (
                <div key={feature.title} className="relative">
                  <dt>
                    <p className="text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                  </dt>
                  <dd className="mt-2 text-base text-gray-500">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}