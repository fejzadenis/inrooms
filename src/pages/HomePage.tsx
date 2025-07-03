import React from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Check, Zap, Users, MessageSquare, Target, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);
  const words = ['Co-Founder', 'Mentor', 'Collaborator', 'Hire', 'Beta Tester', 'Partner'];
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

        {/* Why Choose inRooms Section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">Why Choose inRooms?</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                inRooms is a curated virtual networking platform built for early-stage founders, operators, and builders. It goes beyond traditional networking by offering high-signal, niche-focused Rooms, tactical keynotes from real practitioners, and live collaboration spaces where members can co-work and build in real time. Unlike static platforms, inRooms emphasizes real outcomes, verified reputation, and meaningful connection — making it a space where networking becomes a byproduct of real progress.
              </p>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                Curated Events- Join private Rooms, hear tactical keynotes, and build reputation with live connections.
              </p>
            </div>

            {/* Main Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-8 border border-indigo-100 shadow-sm"
              >
                <div className="bg-indigo-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Curated by Design</h3>
                <p className="text-gray-600">
                  Every Room is intentionally built around niche, role, or stage. You meet the right people — not just more people.
                </p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-100 shadow-sm"
              >
                <div className="bg-purple-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                  <Zap className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Tactical Keynotes</h3>
                <p className="text-gray-600">
                  Fast, focused sessions led by real builders. No fluff, just valuable insights you can apply right away.
                </p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8 border border-blue-100 shadow-sm"
              >
                <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Live Collaboration: Open Build Rooms</h3>
                <p className="text-gray-600">
                  Drop in anytime. Co-work, share your screen, test ideas, or get feedback in real time. Like a digital coworking space with momentum.
                </p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100 shadow-sm"
              >
                <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Proof of Connection (Coming Soon)</h3>
                <p className="text-gray-600">
                  Your inRooms profile reflects what you've actually built with others — not just who you know. Verified contributions become part of your reputation.
                </p>
              </motion.div>
            </div>

            {/* What Makes inRooms Different */}
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-10">What Makes inRooms Different</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  "Dynamic, proof-driven profiles",
                  "Live, curated Rooms instead of static feeds",
                  "Warm, relevant intros — not cold outreach",
                  "Events and connections built for forward motion"
                ].map((item, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="bg-indigo-100 p-2 rounded-full mr-3">
                        <Check className="w-5 h-5 text-indigo-600" />
                      </div>
                      <p className="font-medium text-gray-900">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What You Get */}
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-10">What You Get</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  "Targeted networking by niche, need, and stage",
                  "Access to mentors, collaborators, and real builders",
                  "Ongoing rooms and tactical sessions",
                  "A growing network and verified reputation that follows you"
                ].map((item, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="bg-indigo-500 p-2 rounded-full mr-3">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <p className="font-medium text-gray-900">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-10">What Our Members Say</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
                  <p className="text-gray-600 italic mb-6">
                    "I met my co-founder and closed three deals in a single Room."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-indigo-600 font-semibold">SJ</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Sarah J.</p>
                      <p className="text-sm text-gray-500">Enterprise Sales Director</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
                  <p className="text-gray-600 italic mb-6">
                    "This feels like what LinkedIn should have been."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-semibold">MC</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Michael C.</p>
                      <p className="text-sm text-gray-500">Startup Sales Lead</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
                  <p className="text-gray-600 italic mb-6">
                    "It's not just networking — it's progress."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold">AR</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Alex R.</p>
                      <p className="text-sm text-gray-500">Early-Stage Founder</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-10">How It Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  "Create a profile — tell us what you're working on",
                  "Join curated Rooms based on your goals",
                  "Collaborate in real time",
                  "Build your reputation and grow your career"
                ].map((step, index) => (
                  <div key={index} className="relative">
                    <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                      {index + 1}
                    </div>
                    {index < 3 && (
                      <div className="hidden md:block absolute top-5 left-10 w-full h-0.5 bg-indigo-200"></div>
                    )}
                    <p className="font-medium text-gray-900">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}