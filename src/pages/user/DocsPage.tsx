import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { guides } from '../../data/guides';
import { 
  FileText,
  Rocket, 
  Video, 
  ExternalLink,
  Search, 
  ChevronRight,
  Play,
  Clock,
  User,
  Calendar,
  MessageSquare,
  Settings,
  Download
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';

export function DocsPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedSection, setSelectedSection] = React.useState<string | null>(null);
  const [selectedGuide, setSelectedGuide] = React.useState<string | null>(null);

  const sections = [
    {
      id: 'getting-started',
      title: 'Founder Essentials',
      icon: Rocket,
      description: 'Everything founders need to know to get started',
      color: 'bg-blue-500'
    },
    {
      id: 'user-guide',
      title: 'Founder Profile',
      icon: User,
      description: 'Optimize your founder profile for maximum connections',
      color: 'bg-green-500'
    },
    {
      id: 'events',
      title: 'Rooms & Networking',
      icon: Calendar,
      description: 'How to join Rooms and network with other founders',
      color: 'bg-purple-500'
    },
    {
      id: 'account',
      title: 'Startup Tools',
      icon: Settings,
      description: 'Tools to help you build and grow your startup',
      color: 'bg-orange-500'
    },
    {
      id: 'troubleshooting',
      title: 'Founder FAQs',
      icon: FileText,
      description: 'Common questions from startup founders',
      color: 'bg-red-500'
    }
  ];


  const videos = [
    {
      id: 'platform-walkthrough',
      title: 'Founder Platform Walkthrough',
      description: 'Complete tour of the inrooms founder platform and its features',
      duration: '12:30',
      thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
      category: 'getting-started'
    },
    {
      id: 'founder-profile-optimization',
      title: 'Founder Profile Optimization',
      description: 'How to create a compelling founder profile that attracts co-founders and investors',
      duration: '8:45',
      thumbnail: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg',
      category: 'user-guide'
    },
    {
      id: 'founder-networking-best-practices',
      title: 'Founder Networking Best Practices',
      description: 'Expert tips for effective networking in founder Rooms',
      duration: '15:20',
      thumbnail: 'https://images.pexels.com/photos/3184293/pexels-photo-3184293.jpeg',
      category: 'events'
    },
    {
      id: 'pitch-preparation',
      title: 'Founder Pitch Preparation',
      description: 'How to craft and deliver a compelling startup pitch in Rooms',
      duration: '10:15',
      thumbnail: 'https://images.pexels.com/photos/3184294/pexels-photo-3184294.jpeg',
      category: 'events'
    },
    {
      id: 'fundraising-strategies',
      title: 'Fundraising Strategies for Founders',
      description: 'How to leverage inrooms to connect with investors and raise capital',
      duration: '6:30',
      thumbnail: 'https://images.pexels.com/photos/3184295/pexels-photo-3184295.jpeg',
      category: 'account'
    },
    {
      id: 'co-founder-matching',
      title: 'Finding the Right Co-Founder',
      description: 'How to use inrooms to find and evaluate potential co-founders',
      duration: '9:45',
      thumbnail: 'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg',
      category: 'troubleshooting'
    }
  ];

  const downloads = [
    {
      id: 'founder-networking-checklist',
      title: 'Founder Room Checklist',
      description: 'Pre-Room preparation and follow-up checklist for founders',
      type: 'PDF',
      size: '2.1 MB',
      category: 'events'
    },
    {
      id: 'founder-profile-template',
      title: 'Founder Profile Template',
      description: 'Template for creating an effective founder profile',
      type: 'PDF',
      size: '1.8 MB',
      category: 'user-guide'
    },
    {
      id: 'founder-conversation-starters',
      title: 'Founder Conversation Starters',
      description: 'Collection of conversation starters for founder networking',
      type: 'PDF',
      size: '1.2 MB',
      category: 'events'
    },
    {
      id: 'linkedin-integration-guide',
      title: 'LinkedIn Integration Guide',
      description: 'Step-by-step guide to connecting your LinkedIn',
      type: 'PDF',
      size: '3.4 MB',
      category: 'user-guide'
    },
    {
      id: 'pitch-deck-template',
      title: 'Startup Pitch Deck Template',
      description: 'Proven template for creating compelling investor pitch decks',
      type: 'PDF',
      size: '2.7 MB',
      category: 'account'
    }
  ];

  const filteredDocs = guides.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = !selectedSection || doc.section === selectedSection;
    return matchesSearch && matchesSection;
  });

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = !selectedSection || video.category === selectedSection;
    return matchesSearch && matchesSection;
  });

  const filteredDownloads = downloads.filter(download => {
    const matchesSearch = download.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         download.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = !selectedSection || download.category === selectedSection;
    return matchesSearch && matchesSection;
  });

  return (
    <MainLayout> 
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Documentation</h1>
          <p className="mt-4 text-xl text-gray-600">
            Comprehensive guides, tutorials, and resources to help founders succeed
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search founder guides, videos, and resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/help" className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
            <MessageSquare className="w-8 h-8 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
            <p className="text-blue-100">Get founder-focused support</p>
          </Link>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <Video className="w-8 h-8 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Founder Tutorials</h3>
            <p className="text-green-100">Watch founder-focused guides</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <Download className="w-8 h-8 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Startup Resources</h3>
            <p className="text-purple-100">Get founder templates and tools</p>
          </div>
        </div>

        {/* Sections */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Section</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <button
              onClick={() => setSelectedSection(null)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                !selectedSection 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="bg-gray-100 text-gray-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Rocket className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-gray-900">All Sections</h3>
                <p className="text-sm text-gray-500 mt-1">Everything</p>
              </div>
            </button>
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedSection === section.id 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${section.color} text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-medium text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Documentation Articles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            <FileText className="inline-block w-6 h-6 mr-2" />
            Documentation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <div 
                key={doc.id} 
                className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer"
                onClick={() => setSelectedGuide(doc.id)}
              >
                <div className="flex items-start justify-between mb-4" onClick={() => setSelectedGuide(doc.id)} style={{ cursor: 'pointer' }}>
                  <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                    guide
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {doc.readTime}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{doc.title}</h3>
                <p className="text-gray-600 mb-4">{doc.description}</p>
                <Button 
                  variant="outline" 
                  className="w-full bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-600 hover:text-indigo-700 hover:border-indigo-300"
                  onClick={() => setSelectedGuide(doc.id)}
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Read Guide
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Guide Content */}
        {selectedGuide && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg border border-gray-200 p-8 mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {guides.find(g => g.id === selectedGuide)?.title}
              </h2>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                onClick={() => setSelectedGuide(null)}
              >
                Back to Guides
              </Button>
            </div>
            <div className="prose prose-indigo max-w-none prose-headings:text-indigo-900 prose-headings:font-bold prose-p:text-gray-700 prose-strong:text-gray-900 prose-strong:font-semibold prose-li:text-gray-700">
              <div dangerouslySetInnerHTML={{ 
                __html: guides.find(g => g.id === selectedGuide)?.content
                  ? guides.find(g => g.id === selectedGuide)!.content
                      .replace(/^# .+$/m, '') // Remove the first heading as we already show it above
                      .replace(/^#{1,6} (.+)$/gm, (_, heading) => `<h3 class="text-xl font-bold text-indigo-900 mt-6 mb-3">${heading}</h3>`)
                      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.+?)\*/g, '<em>$1</em>')
                      .replace(/- (.+)/g, '<li>$1</li>').replace(/(?:<li>.*<\/li>\n)+/g, match => `<ul class="list-disc list-inside space-y-2 ml-4 my-4 text-gray-700">${match}</ul>`)
                      .replace(/\n\n/g, '</p><p class="my-4">')
                      .replace(/^(.+)(?!\<\/p\>)$/gm, '<p class="my-4">$1</p>')
                  : ''
              }} />
            </div>
          </div>
        )}

        {/* Video Tutorials */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            <Video className="inline-block w-6 h-6 mr-2" />
            Founder Video Tutorials
          </h2>
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-8 text-center border border-indigo-100">
            <Video className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-indigo-900 mb-3">Coming Soon</h3>
            <p className="text-lg text-indigo-700 max-w-2xl mx-auto mb-6">
              We're currently producing high-quality video tutorials to help you make the most of the platform.
              Check back soon for comprehensive guides on networking, profile optimization, and more!
            </p>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white shadow-xl">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Need More Help?</h3>
            <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you succeed 
              with personalized assistance and guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/help">
                <Button variant="outline" className="bg-white text-indigo-600 hover:bg-gray-50 border-white shadow-md">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Visit Help Center
                </Button>
              </Link>
              <a href="mailto:support@inrooms.com">
                <Button className="bg-indigo-700 hover:bg-indigo-800 text-white shadow-md">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}