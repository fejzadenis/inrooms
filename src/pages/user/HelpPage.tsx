import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Search } from 'lucide-react';

export function HelpPage() {
  const faqs = [
    {
      question: 'How do I join a networking event?',
      answer: 'To join a networking event, navigate to the Events page, select an event you\'re interested in, and click the "Register" button. Once registered, you\'ll receive a confirmation email with the meeting link.'
    },
    {
      question: 'What happens after my free trial ends?',
      answer: 'After your 7-day free trial ends, you\'ll need to choose a subscription plan to continue accessing our networking events. You can view and select plans on the Billing page.'
    },
    {
      question: 'How can I cancel my subscription?',
      answer: 'You can cancel your subscription at any time from the Billing page. Your access will continue until the end of your current billing period.'
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Help Center</h2>
          <p className="mt-4 text-lg text-gray-600">
            Find answers to common questions or get in touch with our support team
          </p>
          <div className="mt-6 max-w-xl mx-auto">
            <div className="relative">
              <Search className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search help articles..."
                className="h-12 w-full pl-11 pr-4 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h3>
          <dl className="mt-6 space-y-6 divide-y divide-gray-200">
            {faqs.map((faq, index) => (
              <div key={index} className="pt-6">
                <dt className="text-lg font-medium text-gray-900">{faq.question}</dt>
                <dd className="mt-2 text-base text-gray-500">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-12 bg-gray-50 rounded-lg p-8">
          <h3 className="text-lg font-medium text-gray-900">Still need help?</h3>
          <p className="mt-2 text-sm text-gray-500">
            Our support team is available 24/7 to assist you with any questions or concerns.
          </p>
          <div className="mt-6 flex space-x-4">
            <Button>Contact Support</Button>
            <Button variant="outline">Schedule a Call</Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}