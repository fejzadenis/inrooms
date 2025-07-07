import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { FileText, Users, Shield, AlertTriangle, Scale } from 'lucide-react';

export function TermsPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-xl text-gray-600">
              Please read these terms carefully before using our platform.
            </p>
            <p className="text-sm text-gray-500 mt-2">Last updated: January 2025</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
            <section>
              <div className="flex items-center mb-4">
                <Scale className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Acceptance of Terms</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  By accessing and using inRooms ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
                <p>
                  These Terms of Service ("Terms") govern your use of our platform, including all content, services, and products available at or through the platform.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">User Accounts</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-semibold text-gray-900">Account Creation</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You must provide accurate and complete information when creating an account</li>
                  <li>You are responsible for maintaining the security of your account credentials</li>
                  <li>You must be at least 18 years old to create an account</li>
                  <li>One person may not maintain more than one account</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">Account Responsibilities</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You are responsible for all activities that occur under your account</li>
                  <li>You must notify us immediately of any unauthorized use of your account</li>
                  <li>You agree to provide accurate profile information and keep it updated</li>
                  <li>You may not transfer your account to another person</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Acceptable Use</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-semibold text-gray-900">Permitted Uses</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Professional networking and collaboration with other founders</li>
                  <li>Participating in curated Rooms and events</li>
                  <li>Sharing relevant business insights and experiences</li>
                  <li>Building meaningful professional relationships</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">Prohibited Activities</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <ul className="list-disc list-inside space-y-2 ml-4 text-red-800">
                    <li>Harassment, abuse, or discrimination of any kind</li>
                    <li>Spam, unsolicited marketing, or promotional content</li>
                    <li>Sharing false, misleading, or fraudulent information</li>
                    <li>Attempting to gain unauthorized access to the platform</li>
                    <li>Violating intellectual property rights</li>
                    <li>Engaging in illegal activities or promoting illegal content</li>
                    <li>Disrupting or interfering with platform operations</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscription and Payments</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-semibold text-gray-900">Billing</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                  <li>All fees are non-refundable except as outlined in our Refund Policy</li>
                  <li>We reserve the right to change pricing with 30 days notice</li>
                  <li>Failed payments may result in account suspension</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">Cancellation</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You may cancel your subscription at any time</li>
                  <li>Cancellation takes effect at the end of your current billing period</li>
                  <li>You retain access to paid features until your subscription expires</li>
                  <li>We may cancel accounts that violate these terms</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Content and Intellectual Property</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-semibold text-gray-900">Your Content</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You retain ownership of content you create and share on the platform</li>
                  <li>You grant us a license to use your content to provide our services</li>
                  <li>You are responsible for ensuring you have rights to share any content</li>
                  <li>We may remove content that violates these terms</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">Our Content</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>The platform and its original content are owned by inRooms</li>
                  <li>You may not copy, modify, or distribute our content without permission</li>
                  <li>Our trademarks and logos may not be used without authorization</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Disclaimers and Limitations</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">Service Availability</h3>
                  <p className="text-yellow-700">
                    We strive to maintain high availability but cannot guarantee uninterrupted service. 
                    The platform is provided "as is" without warranties of any kind.
                  </p>
                </div>

                <h3 className="text-lg font-semibold text-gray-900">Limitation of Liability</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We are not liable for indirect, incidental, or consequential damages</li>
                  <li>Our total liability is limited to the amount you paid in the last 12 months</li>
                  <li>We are not responsible for user-generated content or third-party actions</li>
                  <li>You use the platform at your own risk</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy and Data Protection</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information. By using our platform, you agree to our privacy practices.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We collect only necessary information to provide our services</li>
                  <li>We implement security measures to protect your data</li>
                  <li>We do not sell your personal information to third parties</li>
                  <li>You have rights regarding your personal data</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-semibold text-gray-900">By You</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You may terminate your account at any time</li>
                  <li>Termination does not relieve you of payment obligations</li>
                  <li>Some provisions of these terms survive termination</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">By Us</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We may suspend or terminate accounts that violate these terms</li>
                  <li>We may terminate the service with reasonable notice</li>
                  <li>We will provide data export options where feasible</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We may update these terms from time to time. We will notify users of material changes by email or through the platform. Continued use of the service after changes constitutes acceptance of the new terms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  These terms are governed by the laws of [Your Jurisdiction]. Any disputes will be resolved through binding arbitration or in the courts of [Your Jurisdiction].
                </p>
              </div>
            </section>

            <section className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4 text-gray-700">
                <p>If you have questions about these terms, please contact us:</p>
                <div className="space-y-2">
                  <p><strong>Email:</strong> legal@inrooms.com</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                  <p><strong>Address:</strong> [Your Business Address]</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}