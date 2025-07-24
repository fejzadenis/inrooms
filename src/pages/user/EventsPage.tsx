import React, { useEffect } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';


export function EventsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Calendar className="w-24 h-24 text-indigo-400 mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Events Coming Soon!</h1>
          <p className="text-xl text-gray-600 max-w-2xl mb-8">
            We're busy crafting an exciting new lineup of networking events and workshops tailored for founders. 
            Stay tuned for updates!
          </p>
          <Link to="/courses">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-8 py-3">
              Explore Our Courses
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}