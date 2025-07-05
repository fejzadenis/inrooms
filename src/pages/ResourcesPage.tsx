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
  Clock
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
    { id: 'account', name: 'Account', icon: Users, color: 'bg-green-500' },
    { id: 'billing', name: 'Billing', icon: CreditCard, color: 'bg-purple-500' },
    { id: 'events', name: 'Events', icon: Calendar, color: 'bg-orange-500' },
    { id: 'products', name: 'Products', icon: Rocket, color: 'bg-red-500' },
    { id: 'reputation', name: 'Reputation', icon: Award, color: 'bg-yellow-500' },
  ];

  const faqs: FAQItem[] = [
    {
      id: '1',
      category: 'general',
      question: 'Who is inRooms for? Is it only for founders?',
      answer: 'inRooms is designed for all early-stage founders, operators, and builders. Our platform serves entrepreneurs, technical co-founders, product leaders, designers, and anyone looking to build and grow their startup. Whether you\'re just starting out or leading a growing team, inRooms provides valuable networking opportunities tailored to your specific needs and goals.'
    },
    {
      id: '2',
      category: 'general',
      question: 'What exactly is a "Room" on inRooms?',
      answer: 'A Room is a virtual space where focused networking happens. Unlike generic video calls, Rooms are purpose-built for specific topics, industries, or goals. They can be scheduled networking events, impromptu collaboration sessions, or ongoing communities. Each Room has a host, a clear purpose, and tools designed for meaningful connection. Think of Rooms as curated networking spaces where you\'ll meet the right people, not just more people.'
    },
    {
      id: '3',
      category: 'reputation',
      question: 'What is "Proof of Work" and how does it benefit me?',
      answer: 'Proof of Work is our verification system that showcases your real contributions and achievements. Unlike traditional profiles that rely on self-reported information, your inRooms profile displays badges and credentials earned through verified activities like hosting events, making successful connections, and receiving peer endorsements. This creates a trustworthy professional identity based on actual impact, making it easier to establish credibility and open doors to new opportunities.'
    },
    {
      id: '4',
      category: 'events',
      question: 'How often are networking events held?',
      answer: 'We host multiple events weekly across various topics and formats. The exact frequency depends on your interests and industry focus. Most members attend 2-4 events per month, but your subscription plan determines how many you can register for. Our calendar is constantly updated with new events, and you can filter by topic, format, or time to find ones that match your schedule and goals. Enterprise members can also request custom events for their specific needs.'
    },
    {
      id: '5',
      category: 'billing',
      question: 'Is it really free to start using inRooms?',
      answer: 'Yes, we offer a 7-day free trial that gives you full access to the platform with 2 event registrations included. No credit card is required to start your trial. After the trial period, you can choose from our subscription plans starting at $39/month, or continue with limited functionality until you\'re ready to subscribe. We believe in letting you experience the value before committing.'
    },
    {
      id: '6',
      category: 'account',
      question: 'How do I set up my profile for maximum networking success?',
      answer: 'For maximum success, complete all profile sections including your professional background, skills, and goals. Upload a professional photo, connect your LinkedIn account, and specify your networking preferences. The more complete your profile, the better our matching algorithms can connect you with relevant professionals. Focus on highlighting your unique expertise and what you\'re looking to achieve through networking. Our onboarding process will guide you through optimizing your profile step by step.'
    },
    {
      id: '7',
      category: 'events',
      question: 'What types of events can I attend?',
      answer: 'inRooms offers a diverse range of events including roundtable discussions, panel sessions with industry experts, skill-building workshops, networking mixers, and 1:1 matching sessions. Events are categorized by industry, role, and experience level to ensure relevant connections. Some events are structured with specific agendas, while others provide more open networking opportunities. You can browse the full calendar and filter by type, topic, and time to find events that match your interests.'
    },
    {
      id: '8',
      category: 'reputation',
      question: 'How do I earn reputation badges?',
      answer: 'Badges are earned through verified activities on the platform. For example, host three events to earn the "Event Host" badge, make five successful introductions for the "Connector" badge, or receive multiple positive mentorship reviews for the "Mentor" badge. Each badge has specific criteria, and you\'ll be notified when you\'re close to earning one. Badges appear on your profile and increase your visibility in search results and recommendations. Unlike self-reported skills, these badges represent verified contributions.'
    },
    {
      id: '9',
      category: 'general',
      question: 'How is inRooms different from LinkedIn or other networking platforms?',
      answer: 'Unlike LinkedIn, which focuses on static connections and content, inRooms is built for active, purposeful networking. We emphasize quality interactions over quantity of connections. Our platform features curated Rooms instead of feeds, verified reputation instead of self-reported experience, and structured networking events instead of random outreach. We also focus exclusively on startup founders and builders, ensuring all connections are relevant to your growth journey. Think of us as the difference between a curated dinner party and a massive conference hall.'
    },
    {
      id: '10',
      category: 'products',
      question: 'Can I showcase my product or solution on inRooms?',
      answer: 'Yes, Enterprise subscribers can showcase products through our Product Showcase page. This feature allows you to schedule live demo sessions, upload recorded presentations, and connect with potential users, partners, or investors. Your product showcases can be public or private, and you can track engagement metrics. This isn\'t just a listing - it\'s an interactive way to demonstrate your solution to a targeted audience of founders and builders who might become users, partners, or recommend your product to their networks.'
    },
    {
      id: '11',
      category: 'events',
      question: 'What happens if I miss an event I registered for?',
      answer: 'If you miss an event, you\'ll still have access to any recordings or resources shared (available for 30 days on Starter plans, longer on higher tiers). Your event credit is used regardless of attendance, but we send reminders to help you remember. For popular events that reach capacity, we encourage canceling your registration at least 2 hours in advance if you can\'t attend, to free up your spot for others. Consistent no-shows may affect your ability to register for high-demand events in the future.'
    },
    {
      id: '12',
      category: 'billing',
      question: 'What\'s included in each subscription tier?',
      answer: 'Our Starter plan ($39/month) includes 3 events monthly, basic profile features, and standard networking tools. The Professional plan ($79/month) offers 8 events monthly, enhanced profile features, priority registration, and advanced networking tools. Our Enterprise plan ($149/month) provides 15 events monthly, custom event creation, premium profile badges, and dedicated support. All plans include access to our platform, messaging, and basic features. Annual subscriptions save 20% compared to monthly billing. You can view detailed plan comparisons on our Subscription page.'
    },
    {
      id: '13',
      category: 'reputation',
      question: 'Can I display my inRooms reputation on other platforms?',
      answer: 'Yes, we provide embeddable reputation badges that you can add to your personal website, email signature, or other profiles. These badges are dynamically updated as your reputation grows and include verification links so others can confirm their authenticity. We\'re also developing integrations with LinkedIn and other platforms to allow seamless sharing of your verified achievements. Your reputation becomes a portable asset that enhances your professional brand across the digital landscape.'
    },
    {
      id: '14',
      category: 'general',
      question: 'How do Open Build Rooms work?',
      answer: 'Open Build Rooms are collaborative spaces where you can drop in anytime to co-work, share your screen, test ideas, and get feedback in real-time. Unlike scheduled events, these rooms have ongoing availability with flexible participation. You might join to work on a pitch deck and get feedback, collaborate on solving a specific challenge, or simply work alongside other founders in your field. Think of them as digital coworking spaces with momentum and purpose. This feature is coming soon and will be available to all subscription tiers.'
    },
    {
      id: '15',
      category: 'account',
      question: 'Is my information secure and private?',
      answer: 'Yes, we take data security and privacy seriously. Your personal information is encrypted and never shared with third parties without your consent. You control what appears on your public profile versus what\'s only visible to connections. All payment information is processed securely through Stripe and never stored on our servers. We comply with GDPR, CCPA, and other relevant privacy regulations. You can review our full Privacy Policy for more details on how we protect your information.'
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

        {/* Quick Answers Section */}
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Answers</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-indigo-50 rounded-lg p-5 border border-indigo-100">
              <h3 className="font-semibold text-indigo-900 mb-2 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                How much time should I commit?
              </h3>
              <p className="text-indigo-800">
                Most members spend 2-4 hours per month and see significant value. Start with one event per week and adjust based on your goals.
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-5 border border-green-100">
              <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                <Building className="w-5 h-5 mr-2 text-green-600" />
                Can my whole team join?
              </h3>
              <p className="text-green-800">
                Yes! Our Team plan ($99/user/month, minimum 3 users) includes team management tools and bulk event registration.
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-5 border border-purple-100">
              <h3 className="font-semibold text-purple-900 mb-2 flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-600" />
                How are connections verified?
              </h3>
              <p className="text-purple-800">
                Connections require mutual acceptance and are based on actual interactions within the platform, creating a network of genuine relationships.
              </p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-5 border border-orange-100">
              <h3 className="font-semibold text-orange-900 mb-2 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-orange-600" />
                Is my data private and secure?
              </h3>
              <p className="text-orange-800">
                Absolutely. We use enterprise-grade encryption, never sell your data, and give you full control over your privacy settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}