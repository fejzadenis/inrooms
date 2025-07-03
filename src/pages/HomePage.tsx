import React, { useEffect, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Rocket, Zap, Users, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { GlowButton } from '../components/common/GlowButton';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { RevealOnScroll } from '../components/common/RevealOnScroll';
import { ParallaxEffect } from '../components/common/ParallaxEffect';

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);
  const words = ['Co-founder', 'Mentor', 'Collaborator', 'Hire', 'Beta tester', 'Partner'];
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = React.useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2000); // Change word every 2 seconds

    return () => clearInterval(interval);
  }, [words.length]);

  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollY = window.scrollY;
        heroRef.current.style.transform = `translateY(${scrollY * 0.3}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: custom * 0.2,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  };

  return (
    <MainLayout>
      <div className="space-y-20">
        {/* Hero Section */}
        <div className="relative min-h-[90vh] flex items-center">
          {/* Background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
            <motion.div 
              className="flex flex-col justify-center"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.2
                  }
                }
              }}
            >
              <motion.h1 
                className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight"
                variants={fadeInUpVariants}
                custom={0}
              >
                <span className="block text-white neon-blue">Meet Your Next</span>
                <motion.span 
                  className="block bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text min-h-[1.2em]"
                  key={currentWordIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {words[currentWordIndex]}
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl"
                variants={fadeInUpVariants}
                custom={1}
              >
                Curated virtual Rooms where early-stage startup builders connect, collaborate, and build momentum. Join private Rooms, hear tactical keynotes, and build reputation with live connections.
              </motion.p>
              
              <motion.div 
                className="mt-8 flex flex-col sm:flex-row gap-4"
                variants={fadeInUpVariants}
                custom={2}
              >
                <GlowButton 
                  onClick={handleGetStarted} 
                  className="px-8 py-4 text-base font-medium hoverable"
                  glowColor="rgba(56, 189, 248, 0.6)"
                >
                  Get started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </GlowButton>
                
                <Link to="/about">
                  <GlowButton variant="glass" className="px-8 py-4 text-base font-medium hoverable">
                    Learn more
                  </GlowButton>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div 
              className="flex items-center justify-center lg:justify-end"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative w-full max-w-lg">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-xl opacity-75"></div>
                <div className="relative bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 glass-dark">
                  <img
                    src="/logo + typewrite colored scale 2.png"
                    alt="inRooms Logo"
                    className="w-full h-auto object-contain p-8"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/80 via-transparent to-transparent"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Upcoming Keynote Speakers Section */}
        <RevealOnScroll>
          <div className="relative py-16">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-800/50 pointer-events-none"></div>
            
            <motion.div 
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12 neon-blue">
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text">Upcoming Keynote Speakers</span>
              </h2>
              
              <div className="relative">
                {/* Slideshow Navigation */}
                <div className="absolute top-1/2 -left-4 transform -translate-y-1/2 z-10">
                  <button 
                    onClick={prevSpeaker}
                    className="bg-gray-800/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-gray-700 transition-colors border border-gray-700 hoverable"
                    aria-label="Previous speaker"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                </div>
                
                <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <button 
                    onClick={nextSpeaker}
                    className="bg-gray-800/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-gray-700 transition-colors border border-gray-700 hoverable"
                    aria-label="Next speaker"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
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
                        <div className="bg-gray-800/60 backdrop-blur-md rounded-xl overflow-hidden mx-auto max-w-4xl border border-gray-700 shadow-xl glass-dark">
                          <div className="md:flex">
                            <div className="md:flex-shrink-0 relative">
                              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 mix-blend-overlay"></div>
                              <img 
                                className="h-64 w-full object-cover md:h-full md:w-64" 
                                src={speaker.image} 
                                alt={speaker.name} 
                              />
                            </div>
                            <div className="p-8">
                              <div className="uppercase tracking-wide text-sm text-blue-400 font-semibold">
                                {speaker.date}
                              </div>
                              <h3 className="mt-1 text-2xl font-semibold text-white">
                                {speaker.name}
                              </h3>
                              <p className="mt-1 text-gray-300">
                                {speaker.title}
                              </p>
                              <div className="mt-4">
                                <span className="text-white font-medium">Topic: </span>
                                <span className="text-gray-300">{speaker.topic}</span>
                              </div>
                              <div className="mt-6">
                                <Link to="/events">
                                  <GlowButton variant="primary" className="text-sm hoverable">
                                    Register for this event
                                  </GlowButton>
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
                      className={`w-3 h-3 rounded-full transition-all duration-300 hoverable ${
                        currentSpeakerIndex === index 
                          ? 'bg-blue-500 scale-110' 
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll>
          <div className="relative py-16">
            <motion.div 
              className="max-w-7xl mx-auto"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 neon-blue">
                  <span className="bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text">Why choose inRooms?</span>
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  We're building the most effective networking platform for early-stage founders, operators, and builders.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    icon: Rocket,
                    title: 'Curated by Design',
                    description: 'Every Room is intentionally built around niche, role, or stage. You meet the right people — not just more people.',
                    color: 'from-blue-600 to-blue-400'
                  },
                  {
                    icon: Star,
                    title: 'Tactical Keynotes',
                    description: 'Fast, focused sessions led by real builders. No fluff, just valuable insights you can apply right away.',
                    color: 'from-purple-600 to-purple-400'
                  },
                  {
                    icon: Users,
                    title: 'Live Collaboration',
                    description: 'Drop in anytime. Co-work, share your screen, test ideas, or get feedback in real time.',
                    color: 'from-indigo-600 to-indigo-400'
                  },
                  {
                    icon: Zap,
                    title: 'Proof of Connection',
                    description: 'Your inRooms profile reflects what you've actually built with others — not just who you know.',
                    color: 'from-cyan-600 to-cyan-400'
                  }
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div 
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      viewport={{ once: true, margin: "-50px" }}
                      whileHover={{ y: -5 }}
                      className="relative group card-hover"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                      <div className="relative bg-gray-800 rounded-xl p-8 h-full border border-gray-700 glass-dark">
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-3 rounded-lg inline-flex items-center justify-center mb-5 border border-gray-700">
                          <div className={`bg-gradient-to-r ${feature.color} rounded-lg p-2`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                        <p className="text-gray-300">{feature.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </RevealOnScroll>

        {/* CTA Section */}
        <RevealOnScroll>
          <motion.div 
            className="relative py-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-90 rounded-3xl"></div>
              <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center opacity-20 mix-blend-overlay rounded-3xl"></div>
            </div>
            
            <div className="relative max-w-4xl mx-auto text-center px-4 py-16">
              <motion.h2 
                className="text-3xl md:text-4xl font-bold text-white mb-6 neon-blue"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                Ready to Transform Your Network?
              </motion.h2>
              
              <motion.p 
                className="text-xl text-blue-100 mb-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                Join thousands of founders and builders who are already growing their startups with inRooms.
                Your next big opportunity could be just one connection away.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Link to="/signup">
                  <GlowButton
                    size="lg"
                    className="text-lg px-10 py-4 bg-white text-indigo-600 hover:bg-gray-100 hoverable"
                  >
                    Get Started Today
                  </GlowButton>
                </Link>
                
                <p className="mt-4 text-blue-200">
                  No credit card required to start your 7-day free trial
                </p>
              </motion.div>
            </div>
          </motion.div>
        </RevealOnScroll>
      </div>
    </MainLayout>
  );
}