import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Rocket, Users, Calendar, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const words = ['Lead', 'Partnership', 'Prospect', 'Champion', 'Client', 'Solution'];
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const speakersRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  
  // Scroll animation
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
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

  // Loading screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative w-24 h-24 mx-auto mb-6">
              <motion.div 
                className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1, repeat: Infinity, repeatType: "reverse" }
                }}
              />
              <div className="absolute inset-2 bg-background rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold gradient-text">iR</span>
              </div>
            </div>
          </motion.div>
          <motion.h2 
            className="text-xl font-bold gradient-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            inRooms
          </motion.h2>
          <motion.p 
            className="text-gray-400 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Loading experience...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      {/* Hero Section */}
      <motion.div 
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="relative min-h-[80vh] flex items-center overflow-hidden"
      >
        {/* Background elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-500/20 rounded-full filter blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.h1 
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <span className="block">Meet Your Next</span>
                <motion.span 
                  className="block gradient-text glow-text min-h-[1.2em]"
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
                className="mt-6 text-lg text-gray-300 max-w-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Meet people who provide you value by attending relationship nurturing video conferences. Connect with decision-makers, share opportunities, practice your pitch, and accelerate your sales success.
              </motion.p>
              <motion.div 
                className="mt-8 flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Button 
                  onClick={handleGetStarted} 
                  variant="neon"
                  size="lg"
                  glowEffect="primary"
                  icon={<Sparkles className="w-5 h-5" />}
                  iconPosition="right"
                >
                  Get started
                </Button>
                <Link to="/about" className="w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="lg"
                    fullWidth
                  >
                    Learn more
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-3xl filter blur-xl"></div>
              <motion.div 
                className="relative glass border border-white/10 rounded-3xl p-6 shadow-xl"
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img
                  src="/logo + typewrite colored scale 2.png"
                  alt="inRooms Logo"
                  className="w-full h-auto object-contain"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Upcoming Keynote Speakers Section */}
      <motion.div 
        ref={speakersRef}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold gradient-text glow-text mb-4">
              Upcoming Keynote Speakers
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto"></div>
          </motion.div>
          
          <div className="relative">
            {/* Slideshow Navigation */}
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevSpeaker}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10 glass rounded-full p-3 hover:bg-primary-500/20 transition-colors"
              aria-label="Previous speaker"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextSpeaker}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10 glass rounded-full p-3 hover:bg-primary-500/20 transition-colors"
              aria-label="Next speaker"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </motion.button>
            
            {/* Speakers Slideshow */}
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSpeakerIndex * 100}%)` }}
              >
                {speakers.map((speaker, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <motion.div 
                      className="glass border border-white/10 rounded-2xl overflow-hidden mx-auto max-w-4xl shadow-xl"
                      whileHover={{ y: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="md:flex">
                        <div className="md:flex-shrink-0 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10"></div>
                          <img 
                            className="h-64 w-full object-cover md:h-full md:w-64" 
                            src={speaker.image} 
                            alt={speaker.name} 
                          />
                        </div>
                        <div className="p-8">
                          <div className="uppercase tracking-wide text-sm text-primary-400 font-semibold">
                            {speaker.date}
                          </div>
                          <h3 className="mt-1 text-xl font-semibold text-white">
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
                              <Button 
                                variant="outline" 
                                className="text-sm border-primary-500 text-primary-400 hover:bg-primary-500/20"
                                icon={<Calendar className="w-4 h-4" />}
                              >
                                Register for this event
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Dots Indicator */}
            <div className="flex justify-center mt-8 space-x-2">
              {speakers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSpeakerIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSpeakerIndex === index 
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 w-6' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        ref={featuresRef}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold gradient-text glow-text mb-4">
              Why choose inRooms?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're building the most effective networking platform for tech sales professionals.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto mt-6"></div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Curated Events',
                description: 'Carefully selected topics and participants to ensure meaningful connections.',
                icon: Calendar,
                delay: 0.2,
                color: 'from-primary-500 to-primary-700'
              },
              {
                title: 'Expert Networking',
                description: 'Connect with industry leaders and experienced professionals in tech sales.',
                icon: Users,
                delay: 0.4,
                color: 'from-secondary-500 to-secondary-700'
              },
              {
                title: 'Career Growth',
                description: 'Learn from peers, share experiences, and discover new opportunities.',
                icon: Rocket,
                delay: 0.6,
                color: 'from-accent-500 to-accent-700'
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: feature.delay, duration: 0.5 }}
                  whileHover={{ y: -10 }}
                  className="glass border border-white/10 rounded-2xl p-8 hover:shadow-glow transition-all duration-300"
                >
                  <div className="bg-gradient-to-br from-background to-muted rounded-xl p-4 mb-6 inline-block">
                    <div className={`bg-gradient-to-r ${feature.color} rounded-lg w-12 h-12 flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div 
        ref={ctaRef}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-primary-800 to-secondary-900"></div>
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/20 rounded-full filter blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-500/20 rounded-full filter blur-3xl"></div>
            
            <div className="relative px-8 py-16 md:py-24 text-center">
              <motion.h2 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Ready to Transform Your Network?
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-300 max-w-3xl mx-auto mb-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Join thousands of tech sales professionals who are already growing their careers with inRooms.
                Your next big opportunity could be just one connection away.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Link to="/signup">
                  <Button 
                    variant="neon"
                    size="lg"
                    glowEffect="primary"
                    icon={<ArrowRight className="w-5 h-5" />}
                    iconPosition="right"
                    className="text-lg px-8"
                  >
                    Get Started Today
                  </Button>
                </Link>
                <p className="mt-4 text-gray-400">
                  No credit card required to start your 7-day free trial
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </MainLayout>
  );
}