import React, { useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { 
  Search, 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  ChevronDown, 
  ChevronUp,
  Users,
  CreditCard,
  Calendar,
  Rocket,
  Zap,
  Shield,
  Settings,
  Star,
  Building,
  Award,
  Clock,
  Code
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const categories = [
    { id: 'general', name: 'General', icon: HelpCircle, color: 'bg-blue-500' },
    { id: 'founder', name: 'Founder Basics', icon: Users, color: 'bg-green-500' },
    { id: 'funding', name: 'Funding', icon: CreditCard, color: 'bg-purple-500' },
    { id: 'rooms', name: 'Rooms', icon: Calendar, color: 'bg-orange-500' },
    { id: 'showcase', name: 'Showcase', icon: Rocket, color: 'bg-red-500' },
    { id: 'community', name: 'Community', icon: Award, color: 'bg-yellow-500' }
  ];

  const faqs: FAQItem[] = [
    {
      id: 'what-is-inrooms',
      question: 'What is inRooms?',
      answer: 'inRooms is a professional networking platform designed specifically for founders, entrepreneurs, and business professionals. We facilitate meaningful connections through virtual rooms, events, and structured networking opportunities.',
      category: 'general'
    },
    {
      id: 'how-to-get-started',
      question: 'How do I get started on inRooms?',
      answer: 'Getting started is easy! Sign up for an account, complete your profile with your professional information, and start exploring available rooms and events. You can join conversations, attend networking sessions, and connect with like-minded professionals.',
      category: 'general'
    },
    {
      id: 'what-are-rooms',
      question: 'What are rooms and how do they work?',
      answer: 'Rooms are virtual spaces where professionals gather for focused discussions, networking, or collaborative sessions. Each room has a specific topic or purpose, and you can join rooms that align with your interests or expertise.',
      category: 'rooms'
    },
    {
      id: 'founder-benefits',
      question: 'What specific benefits does inRooms offer to founders?',
      answer: 'Founders get access to investor networks, co-founder matching, mentorship opportunities, and exclusive founder-only events. We also provide resources for fundraising, scaling, and building successful teams.',
      category: 'founder'
    },
    {
      id: 'pricing-plans',
      question: 'What are the pricing plans available?',
      answer: 'We offer multiple pricing tiers including a free plan with basic features, and premium plans with advanced networking tools, priority access to events, and enhanced profile features. Check our pricing page for detailed information.',
      category: 'funding'
    },
    {
      id: 'showcase-feature',
      question: 'How does the Showcase feature work?',
      answer: 'Showcase allows you to present your startup, product, or ideas to the community. You can upload pitch decks, demo videos, and get feedback from experienced entrepreneurs and potential investors.',
      category: 'showcase'
    },
    {
      id: 'community-guidelines',
      question: 'What are the community guidelines?',
      answer: 'Our community is built on respect, professionalism, and mutual support. We expect all members to engage constructively, share knowledge generously, and maintain a positive environment for networking and collaboration.',
      category: 'community'
    },
    {
      id: 'privacy-security',
      question: 'How is my data protected?',
      answer: 'We take privacy and security seriously. All data is encrypted, we follow GDPR compliance, and we never share your personal information without consent. You have full control over your profile visibility and data.',
      category: 'general'
    }
  ];

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !activeCategory || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-16 py-8">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Help & Resources
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions, learn how to make the most of inRooms, 
            and get the support you need to succeed.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-6 py-3 rounded-full font-medium transition-colors ${
              !activeCategory 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Topics
          </button>
          {categories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-colors flex items-center space-x-2 ${
                  activeCategory === category.id 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <CategoryIcon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            <AnimatePresence>
              {filteredFaqs.map((faq) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900 text-lg">{faq.question}</span>
                    {openFaqId === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {openFaqId === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or browse all categories.
              </p>
            </div>
          )}
        </div>

        {/* Contact Support Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl py-12 md:py-16 px-6 md:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
          <p className="mt-4 text-xl text-indigo-100 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you succeed.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="text-lg px-8 bg-white text-indigo-600 hover:bg-gray-100"
            >
              <Mail className="mr-2 w-5 h-5" />
              Contact Support
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-white text-white hover:bg-white hover:text-indigo-600"
            >
              <MessageSquare className="mr-2 w-5 h-5" />
              Community Forum
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-center">
            <div className="bg-blue-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Getting Started Guide</h3>
            <p className="text-gray-600 mb-4">
              Learn the basics of using inRooms effectively for networking and growth.
            </p>
            <Button variant="outline" size="sm">
              Read Guide
            </Button>
          </div>
</div>
    </MainLayout>
  );
}