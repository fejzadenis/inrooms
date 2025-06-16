import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Users, Target, Shield, Zap, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';

export function AboutPage() {
  const features = [
    {
      icon: Users,
      title: 'Curated Networking',
      description: 'Connect with verified tech sales professionals in focused, intimate networking sessions.'
    },
    {
      icon: Target,
      title: 'Industry-Specific Events',
      description: 'Participate in events tailored specifically for tech sales, from enterprise deals to startup sales.'
    },
    {
      icon: Shield,
      title: 'Quality Interactions',
      description: 'Our platform ensures meaningful connections through verified profiles and moderated events.'
    },
    {
      icon: Zap,
      title: 'Career Growth',
      description: 'Access exclusive resources, mentorship opportunities, and industry insights.'
    }
  ];

  const testimonials = [
    {
      quote: "inrooms has transformed how I network in the tech sales space. The connections I've made are invaluable.",
      author: "Sarah Johnson",
      role: "Enterprise Sales Director",
      company: "TechCorp"
    },
    {
      quote: "The quality of networking events and participants is unmatched. It's become an essential part of my professional growth.",
      author: "Michael Chen",
      role: "Sales Manager",
      company: "InnovateHub"
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
            inrooms is the premier networking platform designed exclusively for tech sales professionals. 
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
            Why Choose inrooms?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="bg-white rounded-lg shadow-sm p-8">
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

        {/* Testimonials */}
        <div className="bg-indigo-50 rounded-2xl py-16 px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            What Our Members Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-8">
                <p className="text-lg text-gray-600 italic">"{testimonial.quote}"</p>
                <div className="mt-6">
                  <p className="text-base font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role} at {testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Ready to Transform Your Network?
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Join thousands of tech sales professionals who are already growing their careers with inrooms.
          </p>
          <div className="mt-8">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}