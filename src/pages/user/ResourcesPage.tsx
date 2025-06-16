import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Book, Video, Download, ExternalLink } from 'lucide-react';
import { Button } from '../../components/common/Button';

export function ResourcesPage() {
  const resources = {
    guides: [
      {
        id: '1',
        title: 'Enterprise Sales Playbook',
        description: 'Complete guide to enterprise sales strategies',
        type: 'PDF',
        downloadUrl: '#'
      },
      {
        id: '2',
        title: 'Tech Sales Templates',
        description: 'Collection of proven sales templates',
        type: 'ZIP',
        downloadUrl: '#'
      }
    ],
    videos: [
      {
        id: '1',
        title: 'Sales Negotiation Masterclass',
        description: 'Learn advanced negotiation techniques',
        duration: '45 mins',
        thumbnail: 'https://images.pexels.com/photos/1181689/pexels-photo-1181689.jpeg'
      },
      {
        id: '2',
        title: 'Building Client Relationships',
        description: 'Strategies for long-term client success',
        duration: '30 mins',
        thumbnail: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg'
      }
    ]
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Resources</h1>
          <p className="mt-2 text-gray-600">Access guides, templates, and training materials to enhance your sales skills</p>
        </div>

        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            <Book className="inline-block w-5 h-5 mr-2" />
            Sales Guides & Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.guides.map((guide) => (
              <div key={guide.id} className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900">{guide.title}</h3>
                <p className="mt-2 text-gray-600">{guide.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">{guide.type}</span>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            <Video className="inline-block w-5 h-5 mr-2" />
            Training Videos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.videos.map((video) => (
              <div key={video.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">{video.title}</h3>
                  <p className="mt-2 text-gray-600">{video.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">{video.duration}</span>
                    <Button>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Watch Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}