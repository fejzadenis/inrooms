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
  Briefcase
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { motion } from 'framer-motion';

export function OperateCoursesPage() {
  const [progress, setProgress] = React.useState<Record<string, any>>({});
  const navigate = useNavigate();
  
  // Load progress from localStorage
  React.useEffect(() => {
    const savedProgress = localStorage.getItem('operateCourseProgress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, []);
  
  // Calculate overall progress percentage
  const calculateProgress = () => {
    const totalModules = operateCourseModules.length;
    const completedModules = operateCourseModules.filter(
      module => progress[`${module.id}Completed`]
    ).length;
    
    return Math.round((completedModules / totalModules) * 100);
  };
  
  // Get the next incomplete module
  const getNextModule = () => {
    for (const module of operateCourseModules) {
      if (!progress[`${module.id}Completed`]) {
        return module;
      }
    }
    return operateCourseModules[0]; // Default to first module if all complete
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
          className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-10 md:p-16 text-white"
        >
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500 rounded-full filter blur-3xl opacity-20"></div>
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Settings className="w-5 h-5 mr-2 text-white" />
              <span className="text-white font-medium">Business Operations Course</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Operate to Thrive: Running a Resilient Business
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Master the art of business operations. Learn to build strong foundations, manage finances, 
              lead teams, implement scalable systems, and create resilience for long-term success.
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
                  onClick={() => navigate(`/courses/operate/${operateCourseModules[0].id}`)}
                  className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg px-8 py-3 text-lg"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Review Course Again
                </Button>
              ) : progressPercentage > 0 ? (
                <Button 
                  onClick={() => navigate(`/courses/operate/${nextModule.id}`)}
                  className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg px-8 py-3 text-lg"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Continue Course
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate(`/courses/operate/${operateCourseModules[0].id}`)}
                  className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg px-8 py-3 text-lg"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Start Course
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              )}
              
              <Link to="/courses/operate/overview">
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
        
        {/* What You'll Learn Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What You'll Master</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Build the operational excellence needed to run a thriving, resilient business
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-md p-8 border border-gray-200"
            >
              <div className="bg-emerald-100 p-4 rounded-full inline-block mb-6">
                <Target className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Foundation & Culture</h3>
              <p className="text-gray-600 leading-relaxed">
                Build clear vision, values, and operational processes that create a strong foundation for growth.
              </p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-md p-8 border border-gray-200"
            >
              <div className="bg-teal-100 p-4 rounded-full inline-block mb-6">
                <BarChart className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Financial Mastery</h3>
              <p className="text-gray-600 leading-relaxed">
                Master cash flow management, profit optimization, and strategic funding decisions.
              </p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-md p-8 border border-gray-200"
            >
              <div className="bg-cyan-100 p-4 rounded-full inline-block mb-6">
                <Users className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Leadership & Teams</h3>
              <p className="text-gray-600 leading-relaxed">
                Evolve from operator to leader and build high-performing teams that execute your vision.
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
              A comprehensive curriculum to help you build and operate a resilient business
            </p>
          </div>
          
          <div className="space-y-5">
            {operateCourseModules.map((module) => (
              <motion.div
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
                key={module.id} 
                onClick={() => navigate(`/courses/operate/${module.id}`)}
                className="cursor-pointer"
              >
                <div className={`bg-white rounded-xl shadow-sm p-6 border-2 transition-all duration-200 ${
                  progress[`${module.id}Completed`]
                    ? 'border-green-200 hover:border-green-300 hover:shadow-md'
                    : 'border-gray-200 hover:border-emerald-200 hover:shadow-md'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        progress[`${module.id}Completed`]
                          ? 'bg-green-100 text-green-600 border border-green-200'
                          : 'bg-emerald-100 text-emerald-600 border border-emerald-200'
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
                          : 'bg-emerald-100 text-emerald-600'
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
              Learn proven strategies from successful operators and business leaders
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-md p-8 border border-gray-200"
            >
              <div className="flex items-start gap-5">
                <div className="bg-emerald-100 p-4 rounded-full">
                  <Shield className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Build Resilience</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Create systems and processes that help your business thrive through challenges and uncertainty.
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
                <div className="bg-teal-100 p-4 rounded-full">
                  <TrendingUp className="w-8 h-8 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Optimize Operations</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Streamline processes, implement automation, and create scalable systems for sustainable growth.
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
                <div className="bg-cyan-100 p-4 rounded-full">
                  <Brain className="w-8 h-8 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Develop Leadership</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Transition from doing everything yourself to leading others and building high-performing teams.
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
                <div className="bg-emerald-100 p-4 rounded-full">
                  <Lightbulb className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Strategic Planning</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Learn to think strategically, plan for the future, and prepare for exit or scale-up opportunities.
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
          className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-12 md:p-16 text-white"
        >
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-teal-500 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500 rounded-full filter blur-3xl opacity-20"></div>
          
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <Award className="w-16 h-16 text-white/80 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Build a Resilient Business?</h2>
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