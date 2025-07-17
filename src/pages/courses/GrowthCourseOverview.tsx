import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { growthCourseModules } from '../../data/growthCourse';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Rocket, 
  ArrowRight, 
  Award, 
  FileText, 
  CheckCircle, 
  Clock, 
  Users,
  Target,
  Zap,
  BarChart,
  TrendingUp,
  Settings,
  Lightbulb,
  Brain,
  Briefcase
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { motion } from 'framer-motion';

export function GrowthCourseOverview() {
  const navigate = useNavigate();
  
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-10 md:p-16 text-white"
        >
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/7376/startup-photos.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-20"></div>
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Rocket className="w-5 h-5 mr-2 text-white" />
              <span className="text-white font-medium">Course Overview</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Build to Scale: Your Growth Playbook
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              A strategic guide to sustainable business growth. Learn proven frameworks to validate product-market fit, 
              build scalable systems, and optimize your operations for long-term success.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => navigate(`/courses/growth/${growthCourseModules[0].id}`)}
                className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg px-8 py-3 text-lg"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Course
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Link to="/courses/growth">
                <Button 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-lg"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Back to Course Page
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
        
        {/* Course Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Course Overview</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Master the essential frameworks and strategies for sustainable business growth
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="prose prose-lg max-w-none">
              <p>
                Welcome to <strong>Build to Scale: Your Growth Playbook</strong> – a comprehensive course designed to help founders and business leaders create sustainable growth strategies. Whether you're just starting to gain traction or looking to scale an established business, this course provides actionable frameworks and practical tools to help you grow strategically.
              </p>
              
              <h3 className="text-2xl font-bold text-indigo-900 mt-8">What You'll Learn</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                  <div className="flex items-start">
                    <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                      <Target className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-900">Growth Mindset</h4>
                      <p className="text-indigo-700">Develop the founder mindset needed for sustainable growth and learn to identify the right growth strategy for your specific business model.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <Lightbulb className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-900">Product-Market Fit</h4>
                      <p className="text-blue-700">Learn frameworks to measure, validate, and strengthen your product-market fit before scaling your operations.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                  <div className="flex items-start">
                    <div className="bg-purple-100 p-3 rounded-lg mr-4">
                      <Rocket className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-purple-900">Growth Engine</h4>
                      <p className="text-purple-700">Design a repeatable, scalable system for sustainable customer acquisition, activation, retention, and expansion.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                  <div className="flex items-start">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      <Settings className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-900">Operational Excellence</h4>
                      <p className="text-green-700">Create systems and processes that can handle 10x growth without breaking down or sacrificing quality.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-indigo-900 mt-8">Course Structure</h3>
              <p>
                This course is divided into six comprehensive modules, each focusing on a critical aspect of business growth. You'll progress from understanding growth fundamentals to implementing advanced strategies for scaling your operations.
              </p>
              
              <div className="space-y-6 my-8">
                {growthCourseModules.map((module, index) => (
                  <div key={module.id} className="flex items-start">
                    <div className="bg-indigo-100 rounded-full w-8 h-8 flex items-center justify-center text-indigo-700 font-bold mr-4 mt-1 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{module.title}</h4>
                      <p className="text-gray-600">{module.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <h3 className="text-2xl font-bold text-indigo-900 mt-8">Learning Approach</h3>
              <p>
                Each module combines theory with practical application through:
              </p>
              <ul className="space-y-2 my-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Interactive lessons with real-world examples</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Practical exercises to apply concepts to your business</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Growth strategy assessment quizzes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Implementation checklists to track progress</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Downloadable templates and tools</span>
                </li>
              </ul>
              
              <h3 className="text-2xl font-bold text-indigo-900 mt-8">Who This Course Is For</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Rocket className="w-5 h-5 text-indigo-600 mr-2" />
                    <h4 className="font-bold text-gray-900">Startup Founders</h4>
                  </div>
                  <p className="text-gray-600 text-sm">Looking to scale beyond initial traction</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Briefcase className="w-5 h-5 text-indigo-600 mr-2" />
                    <h4 className="font-bold text-gray-900">Business Owners</h4>
                  </div>
                  <p className="text-gray-600 text-sm">Seeking sustainable growth strategies</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Brain className="w-5 h-5 text-indigo-600 mr-2" />
                    <h4 className="font-bold text-gray-900">Product Leaders</h4>
                  </div>
                  <p className="text-gray-600 text-sm">Responsible for driving product growth</p>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-indigo-900 mt-8">By the End of This Course</h3>
              <p>
                Upon completion, you'll have:
              </p>
              <ul className="space-y-2 my-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>A customized growth strategy tailored to your business model</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Clear metrics to track and measure your growth progress</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Scalable systems and processes for sustainable expansion</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Tools to build and manage high-performing teams</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>The Growth Strategist badge to showcase your expertise</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
        
        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-12 md:p-16 text-white"
        >
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-20"></div>
          
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <Award className="w-16 h-16 text-white/80 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Scale Your Business?</h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of founders who have successfully scaled their businesses using our proven frameworks and strategies. Get started today and earn your Growth Strategist badge!
            </p>
            <Button 
              onClick={() => navigate(`/courses/growth/${growthCourseModules[0].id}`)}
              size="lg"
              className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-xl px-8 py-4 text-lg"
            >
              <Rocket className="w-6 h-6 mr-2" />
              Begin Your Growth Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}