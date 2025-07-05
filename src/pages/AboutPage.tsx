import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Users, Target, Shield, Zap, ArrowRight, Award, Briefcase, Globe, TrendingUp } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <MainLayout>
      <div className="space-y-20">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            Why Choose inRooms
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            inRooms is a curated virtual networking platform built for early-stage founders, operators, and builders. It goes beyond traditional networking by offering high-signal, niche-focused Rooms, tactical keynotes from real practitioners, and live collaboration spaces where members can co-work and build in real time.
          </p>
          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Unlike static platforms, inRooms emphasizes real outcomes, verified reputation, and meaningful connection — making it a space where networking becomes a byproduct of real progress.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <Button className="w-full sm:w-auto flex items-center justify-center">
                Join Now
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link to="/events">
              <Button variant="outline" className="w-full sm:w-auto">Browse Events</Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 md:mb-12">
            Why Choose inRooms?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow duration-200">
              <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-lg">
                <Target className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-lg md:text-xl font-semibold text-gray-900">
                Curated by Design
              </h3>
              <p className="mt-2 text-gray-600 text-sm md:text-base">
                Every Room is intentionally built around niche, role, or stage. You meet the right people — not just more people.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow duration-200">
              <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-lg">
                <Zap className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-lg md:text-xl font-semibold text-gray-900">
                Tactical Keynotes
              </h3>
              <p className="mt-2 text-gray-600 text-sm md:text-base">
                Fast, focused sessions led by real builders. No fluff, just valuable insights you can apply right away.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow duration-200">
              <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-lg">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-lg md:text-xl font-semibold text-gray-900">
                Live Collaboration: Open Build Rooms
              </h3>
              <p className="mt-2 text-gray-600 text-sm md:text-base">
                Drop in anytime. Co-work, share your screen, test ideas, or get feedback in real time. Like a digital coworking space with momentum.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow duration-200">
              <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-lg">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-lg md:text-xl font-semibold text-gray-900">
                Proof of Connection (Coming Soon)
              </h3>
              <p className="mt-2 text-gray-600 text-sm md:text-base">
                Your inRooms profile reflects what you've actually built with others — not just who you know. Verified contributions become part of your reputation.
              </p>
            </div>
          </div>
        </div>

        {/* What Makes inRooms Different */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 md:mb-12">
            What Makes inRooms Different
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              "Dynamic, proof-driven profiles",
              "Live, curated Rooms instead of static feeds",
              "Warm, relevant intros — not cold outreach",
              "Events and connections built for forward motion"
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-100 p-2 rounded-full mr-3">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                  </div>
                  <p className="font-medium text-gray-900">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What You Get */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 md:mb-12">
            What You Get
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              "Targeted networking by niche, need, and stage",
              "Access to mentors, collaborators, and real builders",
              "Ongoing rooms and tactical sessions",
              "A growing network and verified reputation that follows you"
            ].map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-500 p-2 rounded-full mr-3">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-medium text-gray-900">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 md:mb-12">
            What Our Members Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
              <p className="text-gray-600 italic mb-6">
                "I met my co-founder and closed three deals in a single Room."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-indigo-600 font-semibold">SJ</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Sarah J.</p>
                  <p className="text-sm text-gray-500">Startup Founder</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
              <p className="text-gray-600 italic mb-6">
                "This feels like what LinkedIn should have been."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-semibold">MC</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Michael C.</p>
                  <p className="text-sm text-gray-500">Tech Entrepreneur</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
              <p className="text-gray-600 italic mb-6">
                "It's not just networking — it's progress."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold">AR</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Alex R.</p>
                  <p className="text-sm text-gray-500">Early-Stage Founder</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 md:mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              "Create a profile — tell us what you're working on",
              "Join curated Rooms based on your goals",
              "Collaborate in real time",
              "Build your reputation and grow your career"
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-5 left-10 w-full h-0.5 bg-indigo-200"></div>
                )}
                <p className="font-medium text-gray-900">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl py-12 md:py-16 px-4 md:px-8 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold">
            Ready to Transform Your Network?
          </h2>
          <p className="mt-4 text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto">
            Join thousands of founders, operators, and builders who are already growing their careers with inRooms.
            Your next big opportunity could be just one connection away.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to="/signup">
              <Button
                size="lg"
                className="text-lg px-8 bg-white text-indigo-600 hover:bg-gray-100"
              >
                Get Started Today
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-indigo-200">
            No credit card required to start your 7-day free trial
          </p>
        </div>
      </div>
    </MainLayout>
  );
}