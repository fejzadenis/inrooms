import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { operateCourseModules } from '../../data/operateCourse';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Settings, 
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
  Shield,
  Lightbulb,
  Brain,
  Briefcase,
  DollarSign,
  Handshake
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { motion } from 'framer-motion';

export function OperateCourseOverview() {
  const navigate = useNavigate();
  
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-10 md:p-16 text-white"
        >
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500 rounded-full filter blur-3xl opacity-20"></div>
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Settings className="w-5 h-5 mr-2 text-white" />
              <span className="text-white font-medium">Course Overview</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Operate to Thrive: Running a Resilient Business
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Master the art of business operations. Learn to build strong foundations, manage finances, 
              lead teams, implement scalable systems, and create resilience for long-term success.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => navigate(`/courses/operate/${operateCourseModules[0].id}`)}
                className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg px-8 py-3 text-lg"
              >
                <Settings className="w-5 h-5 mr-2" />
                Start Course
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Link to="/courses/operate">
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
              Master the essential skills for building and operating a resilient business
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="prose prose-lg max-w-none">
              <p>
                Welcome to <strong>Operate to Thrive: Running a Resilient Business</strong> – a comprehensive course designed to help business leaders master the art of operations. Whether you're transitioning from startup to scale-up or looking to optimize an existing business, this course provides the frameworks and tools to build resilient, thriving operations.
              </p>
              
              <h3 className="text-2xl font-bold text-emerald-900 mt-8">What You'll Learn</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                  <div className="flex items-start">
                    <div className="bg-emerald-100 p-3 rounded-lg mr-4">
                      <Target className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-900">Foundation & Culture</h4>
                      <p className="text-emerald-700">Build clear vision, values, and operational processes that create a strong foundation for sustainable growth.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-teal-50 p-6 rounded-xl border border-teal-100">
                  <div className="flex items-start">
                    <div className="bg-teal-100 p-3 rounded-lg mr-4">
                      <BarChart className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-teal-900">Financial Mastery</h4>
                      <p className="text-teal-700">Master cash flow management, profit optimization, and strategic funding decisions for financial resilience.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-cyan-50 p-6 rounded-xl border border-cyan-100">
                  <div className="flex items-start">
                    <div className="bg-cyan-100 p-3 rounded-lg mr-4">
                      <Users className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-cyan-900">Leadership Evolution</h4>
                      <p className="text-cyan-700">Transition from operator to leader and build high-performing teams that execute your vision effectively.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-900">Resilience & Adaptation</h4>
                      <p className="text-blue-700">Build systems to detect signals, manage crises, and adapt to changing market conditions.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-emerald-900 mt-8">Course Structure</h3>
              <p>
                This course is divided into seven comprehensive modules, each focusing on a critical aspect of business operations. You'll progress from building foundations to implementing advanced resilience and adaptation strategies.
              </p>
              
              <div className="space-y-6 my-8">
                {operateCourseModules.map((module, index) => (
                  <div key={module.id} className="flex items-start">
                    <div className="bg-emerald-100 rounded-full w-8 h-8 flex items-center justify-center text-emerald-700 font-bold mr-4 mt-1 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{module.title}</h4>
                      <p className="text-gray-600">{module.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <h3 className="text-2xl font-bold text-emerald-900 mt-8">Learning Approach</h3>
              <p>
                Each module combines theory with practical application through:
              </p>
              <ul className="space-y-2 my-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Interactive lessons with real-world case studies</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Practical worksheets and templates for immediate implementation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Operations strategy assessment and recommendations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Implementation checklists to track progress and ensure completion</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Expert insights and best practices from successful operators</span>
                </li>
              </ul>
              
              <h3 className="text-2xl font-bold text-emerald-900 mt-8">Who This Course Is For</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Briefcase className="w-5 h-5 text-emerald-600 mr-2" />
                    <h4 className="font-bold text-gray-900">Business Owners</h4>
                  </div>
                  <p className="text-gray-600 text-sm">Looking to optimize operations and build resilience</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600 mr-2" />
                    <h4 className="font-bold text-gray-900">Scale-Up Leaders</h4>
                  </div>
                  <p className="text-gray-600 text-sm">Transitioning from startup to sustainable operations</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Brain className="w-5 h-5 text-emerald-600 mr-2" />
                    <h4 className="font-bold text-gray-900">Operations Managers</h4>
                  </div>
                  <p className="text-gray-600 text-sm">Responsible for business operations and efficiency</p>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-emerald-900 mt-8">By the End of This Course</h3>
              <p>
                Upon completion, you'll have:
              </p>
              <ul className="space-y-2 my-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>A clear operational strategy tailored to your business model</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Financial management systems for sustainable profitability</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Leadership skills to build and manage high-performing teams</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Scalable systems and processes that support growth</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Crisis management and adaptation capabilities</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>The Business Operations Expert badge to showcase your expertise</span>
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
          className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-12 md:p-16 text-white"
        >
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-teal-500 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500 rounded-full filter blur-3xl opacity-20"></div>
          
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <Award className="w-16 h-16 text-white/80 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Build Operational Excellence?</h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of business leaders who have built thriving, resilient operations using our proven frameworks. 
              Get started today and earn your Business Operations Expert badge!
            </p>
            <Button 
              onClick={() => navigate(`/courses/operate/${operateCourseModules[0].id}`)}
              size="lg"
              className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl px-8 py-4 text-lg"
            >
              <Settings className="w-6 h-6 mr-2" />
              Begin Your Operations Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}