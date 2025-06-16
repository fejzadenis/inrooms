import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { FileText, Book, Video, Link as LinkIcon } from 'lucide-react';

export function DocsPage() {
  const resources = [
    {
      title: 'Getting Started',
      icon: FileText,
      items: [
        { title: 'Platform Overview', link: '/docs/overview' },
        { title: 'Creating Your Profile', link: '/docs/profile' },
        { title: 'Joining Events', link: '/docs/events' }
      ]
    },
    {
      title: 'Guides',
      icon: Book,
      items: [
        { title: 'Networking Best Practices', link: '/docs/networking' },
        { title: 'Making Connections', link: '/docs/connections' },
        { title: 'Following Up', link: '/docs/follow-up' }
      ]
    },
    {
      title: 'Video Tutorials',
      icon: Video,
      items: [
        { title: 'Platform Walkthrough', link: '/docs/walkthrough' },
        { title: 'Event Navigation', link: '/docs/event-nav' },
        { title: 'Profile Setup', link: '/docs/profile-setup' }
      ]
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Documentation</h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to know about using the platform effectively
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Icon className="h-6 w-6 text-indigo-600" />
                  <h3 className="ml-3 text-lg font-medium text-gray-900">{section.title}</h3>
                </div>
                <ul className="mt-4 space-y-3">
                  {section.items.map((item) => (
                    <li key={item.title}>
                      <a
                        href={item.link}
                        className="group flex items-center text-base text-gray-500 hover:text-gray-900"
                      >
                        <LinkIcon className="h-4 w-4 mr-2 text-gray-400 group-hover:text-indigo-600" />
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-indigo-50 rounded-lg p-8">
          <h3 className="text-lg font-medium text-indigo-900">Need more help?</h3>
          <p className="mt-2 text-sm text-indigo-700">
            Check out our video tutorials or reach out to our support team for personalized assistance.
          </p>
          <div className="mt-6">
            <Button>Watch Tutorials</Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}