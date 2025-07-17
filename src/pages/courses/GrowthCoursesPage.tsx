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
  Settings
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { motion } from 'framer-motion';

export function GrowthCoursesPage() {
  const [progress, setProgress] = React.useState<Record<string, any>>({});
  const navigate = useNavigate();
  
  // Load progress from localStorage
  React.useEffect(() => {
    const savedProgress = localStorage.getItem('growthCourseProgress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, []);
  
  // Calculate overall progress percentage
  const calculateProgress = () => {
    const totalModules = growthCourseModules.length;
    const completedModules = growthCourseModules.filter(
      module => progress[`${module.id}Completed`]
    ).length;
    
    return Math.round((completedModules / totalModules) * 100);
  };
  
  // Get the next incomplete module
  const getNextModule = () => {
    for (const module of growthCourseModules) {
      if (!progress[`${module.id}Completed`]) {
        return module;
      }
    }
    return growthCourseModules[0]; // Default to first module if all complete
  };
  
  const nextModule = getNextModule();
  const progressPercentage = calculateProgress();
  const isCourseCompleted = progress.courseCompleted;

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
              <span className="text-white font-medium">Strategic Growth Course</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Build to Scale: Your Growth Playbook
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              A strategic guide to sustainable business growth. Learn proven frameworks to validate product-market fit, 
              build scalable systems, and optimize your operations for long-term success.
            </p>
            
            {isCourseCompleted ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 mb-8 flex items-center border border-white/30">
                <div className="bg-green-500 p-2 rounded-full mr-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-lg">Course Completed!</p>
                  <p className="text-white/80">You've successfully completed this course and earned your badge.</p>
                </div>
              </div>
            ) : progressPercentage > 0 ? (
              <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/90 font-medium">Course Progress</span>
                  <span className="text-white font-bold">{progressPercentage}% Complete</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm">
                  <div 
                    className="bg-white h-3 rounded-full" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            ) : null}
            
            <div className="flex flex-wrap gap-4">
              {isCourseCompleted ? (
                <Button 
                  onClick={() => navigate(`/courses/growth/${growthCourseModules[0].id}`)}
                  className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg px-8 py-3 text-lg"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Review Course Again
                </Button>
              ) : progressPercentage > 0 ? (
                <Button 
                  onClick={() => navigate(`/courses/growth/${nextModule.id}`)}
                  className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg px-8 py-3 text-lg"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Continue Course
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate(`/courses/growth/${growthCourseModules[0].id}`)}
                  className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg px-8 py-3 text-lg"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Course
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              )}
              
              <Link to="/courses/growth/overview">
                <Button 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-lg"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Course Overview
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What You'll Learn</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Master the essential frameworks and strategies for sustainable business growth
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-md p-8 border border-gray-200"
            >
              <div className="bg-purple-100 p-4 rounded-full inline-block mb-6">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Validate Product-Market Fit</h3>
              <p className="text-gray-600 leading-relaxed">
                Learn proven frameworks to measure and strengthen your product-market fit before scaling.
              </p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-md p-8 border border-gray-200"
            >
              <div className="bg-blue-100 p-4 rounded-full inline-block mb-6">
                <Rocket className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Build Your Growth Engine</h3>
              <p className="text-gray-600 leading-relaxed">
                Design a repeatable, scalable system for sustainable customer acquisition and expansion.
              </p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-md p-8 border border-gray-200"
            >
              <div className="bg-green-100 p-4 rounded-full inline-block mb-6">
                <Settings className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Scale Your Operations</h3>
              <p className="text-gray-600 leading-relaxed">
                Create systems and processes that can handle 10x growth without breaking down.
              </p>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Course Modules */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Course Modules</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive curriculum to help you build a scalable growth strategy
            </p>
          </div>
          
          <div className="space-y-5">
            {growthCourseModules.map((module) => (
              <motion.div
                whileHover={{ x: 5 }}
                key={module.id} 
                onClick={() => navigate(`/courses/growth/${module.id}`)}
                className="cursor-pointer"
              >
                <div className={`bg-white rounded-xl shadow-sm p-6 border-2 transition-all duration-200 ${
                  progress[`${module.id}Completed`]
                    ? 'border-green-200 hover:border-green-300 hover:shadow-md'
                    : 'border-gray-200 hover:border-indigo-200 hover:shadow-md'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        progress[`${module.id}Completed`]
                          ? 'bg-green-100 text-green-600 border border-green-200'
                          : 'bg-indigo-100 text-indigo-600 border border-indigo-200'
                      }`}>
                        {progress[`${module.id}Completed`] ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <span className="font-bold text-lg">{module.order + 1}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{module.title}</h3>
                        <p className="text-gray-600 mt-1">{module.description}</p>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <div className={`rounded-full p-3 transition-colors ${
                        progress[`${module.id}Completed`]
                          ? 'bg-green-100 text-green-600'
                          : 'bg-indigo-100 text-indigo-600'
                      }`}>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Benefits Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Take This Course?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn proven strategies from successful founders and growth experts
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-md p-8 border border-gray-200"
            >
              <div className="flex items-start gap-5">
                <div className="bg-indigo-100 p-4 rounded-full">
                  <TrendingUp className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Sustainable Growth</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Learn how to grow your business in a way that's sustainable and builds long-term value.
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-md p-8 border border-gray-200"
            >
              <div className="flex items-start gap-5">
                <div className="bg-blue-100 p-4 rounded-full">
                  <BarChart className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Data-Driven Decisions</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Build frameworks for making better decisions based on metrics and experimentation.
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-md p-8 border border-gray-200"
            >
              <div className="flex items-start gap-5">
                <div className="bg-green-100 p-4 rounded-full">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Team Scalability</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Create a team structure and culture that can grow without losing effectiveness.
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-md p-8 border border-gray-200"
            >
              <div className="flex items-start gap-5">
                <div className="bg-purple-100 p-4 rounded-full">
                  <Zap className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Practical Implementation</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Get actionable templates, tools, and frameworks you can apply immediately.
                  </p>
                </div>
              </div>
            </motion.div>
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