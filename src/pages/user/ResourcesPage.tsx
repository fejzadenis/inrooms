import React, { useState } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
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
  Star
} from 'lucide-react';
import { Button } from '../../components/common/Button';
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
    { id: 'account', name: 'Account', icon: Users, color: 'bg-green-500' },
    { id: 'billing', name: 'Billing', icon: CreditCard, color: 'bg-purple-500' },
    { id: 'events', name: 'Events', icon: Calendar, color: 'bg-orange-500' },
    { id: 'products', name: 'Products', icon: Rocket, color: 'bg-red-500' },
    { id: 'security', name: 'Security', icon: Shield, color: 'bg-indigo-500' },
  ];

  const faqs: FAQItem[] = [
    {
      id: '1',
      category: 'general',
      question: 'What is inRooms?',
      answer: 'inRooms is a premier networking platform designed exclusively for tech sales professionals. We connect you with peers, potential clients, and industry leaders through virtual events, product showcases, and networking opportunities. Our platform helps you build meaningful relationships that drive your career and business forward.'
    },
    {
      id: '2',
      category: 'general',
      question: 'How do I get started with inRooms?',
      answer: 'Getting started is easy! First, create your account and complete your profile with your professional information. Then, browse upcoming events and product showcases that interest you. Register for events, connect with other professionals, and start building your network. We recommend completing the onboarding tour to familiarize yourself with all features.'
    },
    {
      id: '3',
      category: 'account',
      question: 'How do I edit my profile?',
      answer: 'To edit your profile, click on your profile picture in the top right corner and select "Profile" from the dropdown menu. On your profile page, click the "Edit Profile" button. From there, you can update your personal information, professional details, skills, and upload a new profile picture. Don\'t forget to click "Save Changes" when you\'re done.'
    },
    {
      id: '4',
      category: 'account',
      question: 'Can I connect my LinkedIn profile?',
      answer: 'Yes! You can connect your LinkedIn profile to automatically import your professional information and connections. Go to your Profile page and click on the "Connect LinkedIn" button. You\'ll be prompted to authorize the connection. Once connected, your profile will be enriched with your LinkedIn data, making it easier to find relevant connections.'
    },
    {
      id: '5',
      category: 'events',
      question: 'How do I join a virtual event?',
      answer: 'To join a virtual event, first register for the event from the Events page. Once registered, you\'ll receive a confirmation email with the event details. On the day of the event, you can join directly from your My Events page by clicking the "Join Meeting" button, which will appear 15 minutes before the scheduled start time. You can also join via the link in your confirmation email.'
    },
    {
      id: '6',
      category: 'events',
      question: 'What happens if an event is full?',
      answer: 'If an event reaches its maximum capacity, you can join the waitlist. You\'ll be automatically notified if a spot becomes available. We recommend registering early for popular events to secure your spot. You can also check our Events page regularly, as we frequently add new events based on demand.'
    },
    {
      id: '7',
      category: 'billing',
      question: 'What subscription plans do you offer?',
      answer: 'We offer several subscription tiers to meet different needs: Starter ($39/month), Professional ($79/month), Enterprise ($149/month), and Team plans ($99/user/month, minimum 3 users). Each plan includes a specific number of monthly event registrations and features. We also offer annual billing with a 20% discount. You can view detailed plan information on our Subscription page.'
    },
    {
      id: '8',
      category: 'billing',
      question: 'How does the free trial work?',
      answer: 'Our 7-day free trial gives you full access to the platform with 2 event registrations. No credit card is required to start. After the trial period, you can choose a subscription plan that fits your needs. If you don\'t subscribe, your account will revert to limited functionality until you choose a plan.'
    },
    {
      id: '9',
      category: 'billing',
      question: 'Can I cancel my subscription?',
      answer: 'Yes, you can cancel your subscription at any time from the Billing page. Your access will continue until the end of your current billing period. There are no cancellation fees or long-term commitments. If you cancel, you\'ll still have access to your connections, but won\'t be able to register for new events until you resubscribe.'
    },
    {
      id: '10',
      category: 'products',
      question: 'How do I showcase my product?',
      answer: 'To showcase your product, you need an Enterprise subscription. Once subscribed, go to the Product Showcase page and click "Showcase Product." Fill out the form with your product details, including title, description, and scheduling information. You can also upload demos, presentations, and set up live demonstration sessions for potential users, partners, or investors.'
    },
    {
      id: '11',
      category: 'products',
      question: 'How can I feature my product?',
      answer: 'Featured products appear prominently on the Product Showcase page, increasing visibility to potential users and investors. To feature your product, click the "Feature" button on your product card. This is a premium service with an additional fee of $49 per month. Featured status lasts for 30 days and can be renewed.'
    },
    {
      id: '12',
      category: 'security',
      question: 'How is my data protected?',
      answer: 'We take data security seriously. All data is encrypted both in transit and at rest. We use industry-standard security practices and regular security audits. Your personal information is never shared with third parties without your consent. We comply with GDPR, CCPA, and other relevant privacy regulations. You can review our full Privacy Policy for more details.'
    },
    {
      id: '13',
      category: 'security',
      question: 'Can I delete my account?',
      answer: 'Yes, you can delete your account at any time. Go to Settings > Account > Delete Account. This will permanently remove all your personal information, connections, and activity history from our platform. Please note that this action cannot be undone. If you have an active subscription, you should cancel it before deleting your account to avoid further charges.'
    },
    {
      id: '14',
      category: 'general',
      question: 'How do I contact support?',
      answer: 'You can contact our support team by emailing support@inrooms.com or by using the Help Center accessible from the user menu. For Enterprise and Team plan subscribers, we offer priority support with faster response times. Our support hours are Monday to Friday, 9 AM to 6 PM PST, with limited weekend support available.'
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
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 py-16 px-8 text-center"
        >
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
          
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-20"></div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative z-10"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-full p-4 border border-white border-opacity-20">
                <HelpCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h1>
            <p className="mt-4 text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
              Find answers to common questions about inRooms, our features, and how to make the most of your experience.
            </p>
          </motion.div>
        </motion.div>

        {/* Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm bg-indigo-50"
            />
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <a href="mailto:support@inrooms.com" className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg border border-blue-400">
            <MessageSquare className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform duration-200" />
            <h3 className="text-xl font-semibold mb-2">Contact Support</h3>
            <p className="text-blue-100">Get personalized help from our team</p>
          </a>
          <a href="/help" className="group bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg border border-green-400">
            <HelpCircle className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform duration-200" />
            <h3 className="text-xl font-semibold mb-2">Help Center</h3>
            <p className="text-green-100">Browse our comprehensive help articles</p>
          </a>
          <a href="mailto:feedback@inrooms.com" className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg border border-purple-400">
            <Mail className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform duration-200" />
            <h3 className="text-xl font-semibold mb-2">Send Feedback</h3>
            <p className="text-purple-100">Help us improve your experience</p>
          </a>
        </motion.div>

        {/* Categories */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button
              onClick={() => setActiveCategory(null)}
              className={`p-4 rounded-xl transition-all duration-200 ${
                !activeCategory 
                  ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg border border-indigo-400' 
                  : 'bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              <div className="text-center">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${
                  !activeCategory ? 'bg-white bg-opacity-20' : 'bg-indigo-100'
                }`}>
                  <Star className={`w-6 h-6 ${!activeCategory ? 'text-white' : 'text-indigo-600'}`} />
                </div>
                <h3 className={`font-medium ${!activeCategory ? 'text-white' : 'text-gray-900'}`}>All Topics</h3>
                <p className={`text-sm mt-1 ${!activeCategory ? 'text-indigo-100' : 'text-gray-500'}`}>
                  {faqs.length} answers
                </p>
              </div>
            </button>
            
            {categories.map((category) => {
              const Icon = category.icon;
              const categoryCount = faqs.filter(faq => faq.category === category.id).length;
              const isActive = activeCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`p-4 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? `bg-gradient-to-br from-${category.color.split('-')[1]}-500 to-${category.color.split('-')[1]}-600 text-white shadow-lg border border-${category.color.split('-')[1]}-400` 
                      : 'bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${
                      isActive ? 'bg-white bg-opacity-20' : category.color
                    }`}>
                      <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-white'}`} />
                    </div>
                    <h3 className={`font-medium ${isActive ? 'text-white' : 'text-gray-900'}`}>{category.name}</h3>
                    <p className={`text-sm mt-1 ${
                      isActive ? `text-${category.color.split('-')[1]}-100` : 'text-gray-500'
                    }`}>
                      {categoryCount} answers
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* FAQs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeCategory 
                ? `${categories.find(c => c.id === activeCategory)?.name} Questions`
                : 'Frequently Asked Questions'
              }
            </h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'}
            </span>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <HelpCircle className="w-12 h-12 text-indigo-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms or browse by category'
                  : 'No questions available for this category'
                }
              </p>
              <Button onClick={() => { setSearchTerm(''); setActiveCategory(null); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq) => (
                <motion.div 
                  key={faq.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-6 cursor-pointer hover:bg-indigo-50 transition-colors duration-200 text-left"
                  >
                    <h3 className="text-lg font-medium text-gray-900 pr-4">{faq.question}</h3>
                    {openFaqId === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {openFaqId === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-6">
                          <div className="border-t border-gray-100 pt-4">
                            <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Still Need Help */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-xl p-8 text-white shadow-xl border border-indigo-500"
        >
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
          
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-20"></div>
          
          <div className="relative z-10 text-center">
            <h3 className="text-2xl font-bold mb-4">Still need help?</h3>
            <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
              Our support team is here to help you succeed. Get personalized assistance with your account, 
              technical issues, or questions about our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:support@inrooms.com">
                <Button variant="outline" className="bg-white text-indigo-600 hover:bg-gray-50 border-white">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </Button>
              </a>
              <Button className="bg-indigo-700 hover:bg-indigo-800 text-white border border-indigo-600">
                <MessageSquare className="w-4 h-4 mr-2" />
                Live Chat
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}