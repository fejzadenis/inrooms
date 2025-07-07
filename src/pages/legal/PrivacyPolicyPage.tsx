import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Shield, Eye, Lock, Database, Mail, Phone } from 'lucide-react';

export function PrivacyPolicyPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-6">
              <Shield className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-xl text-gray-600">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <p className="text-sm text-gray-500 mt-2">Last updated: January 2025</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
            <section>
              <div className="flex items-center mb-4">
                <Eye className="w-6 h-6 text-indigo-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>We collect information you provide directly to us, such as when you:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Create an account and complete your profile</li>
                  <li>Join virtual Rooms and participate in events</li>
                  <li>Connect with other founders and builders</li>
                  <li>Subscribe to our services or make payments</li>
                  <li>Contact us for support or feedback</li>
                </ul>
                <p>This may include your name, email address, profile information, payment details, and communication preferences.</p>
              </div>
            </section>

            <section>
              <div className="flex items-center mb-4">
                <Database className="w-6 h-6 text-indigo-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide, maintain, and improve our platform and services</li>
                  <li>Match you with relevant founders, mentors, and collaborators</li>
                  <li>Facilitate virtual Room experiences and networking events</li>
                  <li>Process payments and manage your subscription</li>
                  <li>Send you important updates about your account and our services</li>
                  <li>Provide customer support and respond to your inquiries</li>
                  <li>Analyze usage patterns to enhance user experience</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center mb-4">
                <Lock className="w-6 h-6 text-indigo-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Information Sharing</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>We do not sell, trade, or otherwise transfer your personal information to third parties except:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>With your explicit consent</li>
                  <li>To provide services you've requested (e.g., payment processing)</li>
                  <li>To comply with legal obligations or protect our rights</li>
                  <li>With trusted service providers who assist in operating our platform</li>
                </ul>
                <p>All third-party service providers are bound by confidentiality agreements and are prohibited from using your information for any other purpose.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
              <div className="space-y-4 text-gray-700">
                <p>We implement industry-standard security measures to protect your personal information, including:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Access controls and authentication protocols</li>
                  <li>Secure payment processing through trusted providers</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
              <div className="space-y-4 text-gray-700">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access, update, or delete your personal information</li>
                  <li>Opt out of marketing communications</li>
                  <li>Request a copy of your data</li>
                  <li>Restrict or object to certain processing activities</li>
                  <li>Data portability where technically feasible</li>
                </ul>
                <p>To exercise these rights, please contact us using the information provided below.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
              <div className="space-y-4 text-gray-700">
                <p>We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie preferences through your browser settings.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
              <div className="space-y-4 text-gray-700">
                <p>We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.</p>
              </div>
            </section>

            <section className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <div className="space-y-4 text-gray-700">
                <p>If you have any questions about this privacy policy or our data practices, please contact us:</p>
                <div className="flex items-center space-x-4">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  <span>privacy@inrooms.com</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Phone className="w-5 h-5 text-indigo-600" />
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}