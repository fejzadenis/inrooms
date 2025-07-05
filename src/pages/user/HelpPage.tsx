import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Search, MessageCircle, Phone, Mail, Clock, ChevronRight, HelpCircle, Book, Video, FileText } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';

export function HelpPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const categories = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      icon: HelpCircle,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'events',
      name: 'Events & Registration',
      icon: Book,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'networking',
      name: 'Networking',
      icon: MessageCircle,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'billing',
      name: 'Billing & Subscriptions',
      icon: FileText,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 'technical',
      name: 'Technical Issues',
      icon: Video,
      color: 'bg-red-100 text-red-600'
    }
  ];

  const faqs = [
    {
      id: '1',
      category: 'getting-started', 
      question: 'How do I create a founder-focused profile?',
      answer: 'To create your founder profile, navigate to the Profile page from the user menu. Click "Edit Profile" and fill in your startup information including your role, company stage, industry focus, and skills. Be sure to highlight your startup\'s mission and your specific expertise. A complete profile helps you connect with relevant co-founders, investors, and collaborators who can help grow your venture.'
    },
    {
      id: '2',
      category: 'getting-started',
      question: 'What is the free trial and how does it work?',
      answer: 'The free trial gives you 7 days of full access to the platform with 2 Room registrations. This allows you to experience our curated networking spaces, connect with other founders, and explore potential collaborations. After the trial, you can choose from our subscription plans to continue building your startup network. Your trial starts immediately upon signup with no credit card required.'
    },
    {
      id: '3',
      category: 'events',
      question: 'How do I join a Room?',
      answer: 'Browse available Rooms on the Events page, select one that aligns with your startup\'s needs or interests, and click "Register Now". Rooms are curated based on startup stage, industry focus, or specific challenges. Once registered, you\'ll receive a confirmation email with the meeting link and preparation materials. You can join the Room 15 minutes before it starts to network with other participants.'
    },
    {
      id: '4',
      category: 'events',
      question: 'Can I cancel my event registration?',
      answer: 'Yes, you can cancel your registration up to 2 hours before the event starts. Go to "My Events" and click on the event to find the cancellation option. This will free up your event quota for other events.'
    },
    {
      id: '5',
      category: 'events',
      question: 'What happens if an event is full?',
      answer: 'If an event reaches capacity, you can join the waitlist. You\'ll be notified if a spot becomes available. We also recommend checking our Events page regularly as new events are added weekly.'
    },
    {
      id: '6',
      category: 'networking',
      question: 'How do I connect with other founders and potential collaborators?',
      answer: 'Visit the Network page to discover founders, operators, and builders with complementary skills or similar industry focus. Our matching algorithm suggests connections based on your startup stage, technical needs, and business goals. You can send personalized connection requests, view detailed founder profiles, and start meaningful conversations. Connections made during Rooms often lead to co-founding relationships, technical partnerships, or investment opportunities.'
    },
    {
      id: '7',
      category: 'networking',
      question: 'How does the messaging system work?',
      answer: 'Once connected with someone, you can send direct messages through the Messages page. All conversations are private and secure. You can share pitch decks, technical specifications, or schedule follow-up calls to discuss potential collaborations. Our messaging system includes file sharing capabilities and integration with calendar tools to make scheduling follow-up meetings seamless.'
    },
    {
      id: '8',
      category: 'networking',
      question: 'Can I connect my LinkedIn profile?',
      answer: 'Yes! Go to your Profile page and click "Connect LinkedIn" to sync your professional information and import your existing network. This helps us suggest relevant connections and events.'
    },
    {
      id: '9',
      category: 'billing',
      question: 'What happens after my founder free trial ends?',
      answer: 'After your 7-day free trial, you\'ll need to choose a subscription plan to continue accessing Rooms and building your startup network. You can select from Starter ($39/month), Professional ($79/month), or Enterprise ($149/month) plans based on your startup\'s stage and networking needs. We offer special discounts for pre-seed startups and first-time founders - just reach out to our support team after signing up.'
    },
    {
      id: '10',
      category: 'billing',
      question: 'How can I cancel my subscription?',
      answer: 'You can cancel your subscription anytime from the Billing page. Your access will continue until the end of your current billing period. We also offer the option to pause your subscription for up to 3 months.'
    },
    {
      id: '11',
      category: 'billing',
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Yes, you can change your plan anytime from the Billing page. Upgrades take effect immediately, while downgrades take effect at your next billing cycle. Any unused events from your current plan will carry over.'
    },
    {
      id: '12',
      category: 'technical',
      question: 'I\'m having trouble joining a video call',
      answer: 'Ensure you have a stable internet connection and the latest browser version. We recommend Chrome or Firefox. Check your camera and microphone permissions, and try refreshing the page. If issues persist, contact our support team.'
    },
    {
      id: '13',
      category: 'technical',
      question: 'The platform is running slowly',
      answer: 'Clear your browser cache and cookies, disable browser extensions temporarily, and ensure you have a stable internet connection. If the issue persists, try using an incognito/private browsing window.'
    },
    {
      id: '14',
      category: 'technical',
      question: 'How do Open Build Rooms work for founders?',
      answer: 'Open Build Rooms are collaborative spaces where founders can drop in anytime to co-work, share their screen, test ideas, and get feedback in real-time. Unlike scheduled events, these rooms have ongoing availability with flexible participation. You might join to work on your pitch deck and get investor feedback, collaborate on solving a technical challenge with other builders, or simply work alongside other founders for accountability and motivation. These spaces are particularly valuable for solo founders seeking community and early-stage teams working through product challenges. Think of them as digital coworking spaces with momentum and purpose. This feature is coming soon and will be available to all subscription tiers.'
    }
  ];

  const quickActions = [
    {
      title: 'Contact Support',
      description: 'Get personalized founder support',
      icon: MessageCircle,
      action: 'mailto:support@inrooms.com',
      color: 'bg-blue-500'
    },
    {
      title: 'Schedule a Call',
      description: 'Book a founder onboarding call',
      icon: Phone,
      action: '#',
      color: 'bg-green-500'
    },
    {
      title: 'Video Tutorials',
      description: 'Watch founder success guides',
      icon: Video,
      action: '/docs',
      color: 'bg-purple-500'
    },
    {
      title: 'Feature Requests',
      description: 'Suggest founder-focused features',
      icon: Mail,
      action: 'mailto:feedback@inrooms.com',
      color: 'bg-orange-500'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Help Center</h1>
          <p className="mt-4 text-xl text-gray-600">
            Find answers to your questions and get the support you need
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for help articles, guides, and FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${action.color} text-white mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-gray-600 mb-4">{action.description}</p>
                {action.action.startsWith('mailto:') ? (
                  <a href={action.action} className="text-indigo-600 hover:text-indigo-700 font-medium">
                    Get Started →
                  </a>
                ) : action.action.startsWith('/') ? (
                  <Link to={action.action} className="text-indigo-600 hover:text-indigo-700 font-medium">
                    Get Started →
                  </Link>
                ) : (
                  <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                    Get Started →
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Hours */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-100 rounded-lg p-3">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Support Hours</h3>
                <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM PST</p>
                <p className="text-gray-600">Weekend: 10:00 AM - 4:00 PM PST</p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Online Now
              </div>
              <p className="text-sm text-gray-500 mt-1">Average response: 2 hours</p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                !selectedCategory 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="bg-gray-100 text-gray-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-gray-900">All Topics</h3>
                <p className="text-sm text-gray-500 mt-1">{faqs.length} articles</p>
              </div>
            </button>
            {categories.map((category) => {
              const Icon = category.icon;
              const categoryCount = faqs.filter(faq => faq.category === category.id).length;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedCategory === category.id 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${category.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{categoryCount} articles</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQs */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory 
                ? `${categories.find(c => c.id === selectedCategory)?.name} Questions`
                : 'Frequently Asked Questions'
              }
            </h2>
            <span className="text-sm text-gray-500">
              {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'}
            </span>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms or browse by category'
                  : 'No questions available for this category'
                }
              </p>
              <Button onClick={() => { setSearchTerm(''); setSelectedCategory(null); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq) => (
                <details key={faq.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                    <h3 className="text-lg font-medium text-gray-900 pr-4">{faq.question}</h3>
                    <ChevronRight className="w-5 h-5 text-gray-400 transform transition-transform duration-200" />
                  </summary>
                  <div className="px-6 pb-6">
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>

        {/* Still Need Help */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
          <div className="text-center">
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
              <Button className="bg-indigo-700 hover:bg-indigo-800 text-white">
                <MessageCircle className="w-4 h-4 mr-2" />
                Live Chat
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}