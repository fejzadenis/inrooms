import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Users, Target, Shield, Zap, ArrowRight, Award, Briefcase, Globe, TrendingUp } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';

export function AboutPage() {
  const features = [
    {
      icon: Users,
      title: 'Curated Networking',
      description: 'Connect with verified tech sales professionals in focused, intimate networking sessions designed for meaningful relationship building.'
    },
    {
      icon: Target,
      title: 'Industry-Specific Events',
      description: 'Participate in events tailored specifically for tech sales, from enterprise deals to startup sales strategies and everything in between.'
    },
    {
      icon: Shield,
      title: 'Quality Interactions',
      description: 'Our platform ensures meaningful connections through verified profiles, moderated events, and a focus on professional development.'
    },
    {
      icon: Zap,
      title: 'Career Growth',
      description: 'Access exclusive resources, mentorship opportunities, and industry insights that directly impact your sales performance and career trajectory.'
    }
  ];

  const benefits = [
    {
      icon: Award,
      title: 'Proven Results',
      description: 'Members report an average 27% increase in qualified leads and 35% faster deal cycles after 3 months on the platform.'
    },
    {
      icon: Briefcase,
      title: 'Industry Expertise',
      description: 'Connect with professionals who understand the unique challenges of tech sales and can provide actionable insights.'
    },
    {
      icon: Globe,
      title: 'Global Community',
      description: 'Access a worldwide network of tech sales professionals across different markets, companies, and specializations.'
    },
    {
      icon: TrendingUp,
      title: 'Continuous Learning',
      description: 'Stay ahead with regular workshops, masterclasses, and resources focused on the latest sales methodologies and technologies.'
    }
  ];

  const testimonials = [
    {
      quote: "inRooms has transformed how I network in the tech sales space. The connections I've made have directly led to three major enterprise deals this quarter alone.",
      author: "Sarah Johnson",
      role: "Enterprise Sales Director",
      company: "TechCorp"
    },
    {
      quote: "The quality of networking events and participants is unmatched. It's become an essential part of my professional growth and business development strategy.",
      author: "Michael Chen",
      role: "Sales Manager",
      company: "InnovateHub"
    },
    {
      quote: "As someone new to tech sales, inRooms has been invaluable for finding mentors and learning industry best practices. It's accelerated my career growth tremendously.",
      author: "Alex Rodriguez",
      role: "Account Executive",
      company: "CloudSystems"
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-20">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Elevate Your Tech Sales Career
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            inRooms is the premier networking platform designed exclusively for tech sales professionals. 
            Connect, learn, and grow with peers who understand your challenges.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/signup">
              <Button className="flex items-center">
                Join Now
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link to="/events">
              <Button variant="outline">Browse Events</Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Choose inRooms?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow duration-200">
                  <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-lg">
                    <Icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl py-16 px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            The inRooms Advantage
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="bg-white rounded-lg shadow-sm p-8 flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <Icon className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{benefit.title}</h3>
                    <p className="mt-2 text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            What Our Members Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow duration-200">
                <div className="h-40">
                  <p className="text-lg text-gray-600 italic">"{testimonial.quote}"</p>
                </div>
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <p className="text-base font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role} at {testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How inRooms Works
          </h2>
          <div className="max-w-4xl mx-auto">
            {/* Steps */}
            <div className="space-y-16">
              {[
                {
                  number: 1,
                  title: "Create Your Profile",
                  description: "Set up your professional profile highlighting your experience, skills, and networking goals."
                },
                {
                  number: 2,
                  title: "Discover Events",
                  description: "Browse upcoming networking events, workshops, and masterclasses tailored to tech sales professionals."
                },
                {
                  number: 3,
                  title: "Connect & Engage",
                  description: "Participate in events, build your network, and engage in meaningful conversations with industry peers."
                },
                {
                  number: 4,
                  title: "Grow Your Career",
                  description: "Leverage new connections, insights, and opportunities to accelerate your professional growth."
                }
              ].map((step) => (
                <div key={step.number} className="flex items-start">
                  <div className="flex-shrink-0 mr-6">
                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {step.number}
                    </div>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                    <p className="mt-2 text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl py-16 px-8 text-center text-white">
          <h2 className="text-3xl font-bold">
            Ready to Transform Your Network?
          </h2>
          <p className="mt-4 text-xl text-indigo-100 max-w-2xl mx-auto">
            Join thousands of tech sales professionals who are already growing their careers with inRooms.
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