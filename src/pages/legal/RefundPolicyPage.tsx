import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { RefreshCw, CreditCard, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export function RefundPolicyPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <RefreshCw className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Refund & Fulfillment Policy</h1>
            <p className="text-xl text-gray-600">
              We're committed to your satisfaction. Learn about our refund policy and service fulfillment.
            </p>
            <p className="text-sm text-gray-500 mt-2">Last updated: January 2025</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
            <section>
              <div className="flex items-center mb-4">
                <CreditCard className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Subscription Refunds</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-semibold text-green-800">30-Day Money-Back Guarantee</span>
                  </div>
                  <p className="text-green-700">
                    We offer a full refund within 30 days of your initial subscription purchase if you're not completely satisfied with our service.
                  </p>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mt-6">Refund Eligibility</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>First-time subscribers are eligible for a full refund within 30 days</li>
                  <li>Refunds are processed to the original payment method</li>
                  <li>Annual subscriptions are eligible for prorated refunds</li>
                  <li>Add-on purchases are refundable within 14 days of purchase</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">Non-Refundable Items</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Custom enterprise solutions after implementation begins</li>
                  <li>One-time event tickets after the event has occurred</li>
                  <li>Services that have been fully delivered and utilized</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center mb-4">
                <Clock className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Refund Processing</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Processing Time</h3>
                    <ul className="text-blue-800 space-y-1">
                      <li>• Credit cards: 3-5 business days</li>
                      <li>• PayPal: 1-2 business days</li>
                      <li>• Bank transfers: 5-10 business days</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 mb-2">How to Request</h3>
                    <ul className="text-purple-800 space-y-1">
                      <li>• Email: billing@inrooms.com</li>
                      <li>• Include your account email</li>
                      <li>• Specify reason for refund</li>
                      <li>• We'll respond within 24 hours</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Service Fulfillment</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-semibold text-gray-900">What You Get</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Immediate Access</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Platform access upon payment confirmation</li>
                      <li>Profile setup and customization tools</li>
                      <li>Browse and join available Rooms</li>
                      <li>Connect with other verified founders</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Ongoing Services</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Weekly curated networking Rooms</li>
                      <li>Monthly tactical keynote sessions</li>
                      <li>24/7 access to Build Rooms</li>
                      <li>Reputation tracking and verification</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">Service Level Commitments</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>99.9% platform uptime guarantee</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Customer support response within 24 hours</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Regular platform updates and new features</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Data backup and security monitoring</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Special Circumstances</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-semibold text-gray-900">Cancellations</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You can cancel your subscription at any time from your billing settings</li>
                  <li>Cancellations take effect at the end of your current billing period</li>
                  <li>You retain access to all features until your subscription expires</li>
                  <li>No cancellation fees or penalties</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">Account Suspension</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Accounts suspended for policy violations are not eligible for refunds</li>
                  <li>We may offer prorated refunds for technical issues on our end</li>
                  <li>Disputed charges will be investigated on a case-by-case basis</li>
                </ul>
              </div>
            </section>

            <section className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
              <div className="space-y-4 text-gray-700">
                <p>If you have questions about refunds, billing, or service fulfillment:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Billing Support</h3>
                    <p className="text-sm">billing@inrooms.com</p>
                    <p className="text-sm">Response time: Within 24 hours</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">General Support</h3>
                    <p className="text-sm">support@inrooms.com</p>
                    <p className="text-sm">Phone: +1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}