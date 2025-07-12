import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { businessCourseModules } from '../../data/businessCourse';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  ArrowRight, 
  Award, 
  FileText, 
  CheckCircle, 
  Clock, 
  Users,
  Building,
  Shield,
  DollarSign,
  Zap
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export function BusinessCoursesPage() {
  const [progress, setProgress] = React.useState<Record<string, any>>({});
  
  // Load progress from localStorage
  React.useEffect(() => {
    const savedProgress = localStorage.getItem('businessCourseProgress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, []);
  
  // Calculate overall progress percentage
  const calculateProgress = () => {
    const totalModules = businessCourseModules.length;
    const completedModules = businessCourseModules.filter(
      module => progress[`${module.id}Completed`]
    ).length;
    
    return Math.round((completedModules / totalModules) * 100);
  };
  
  // Get the next incomplete module
  const getNextModule = () => {
    for (const module of businessCourseModules) {
      if (!progress[`${module.id}Completed`]) {
        return module;
      }
    }
    return businessCourseModules[0]; // Default to first module if all complete
  };
  
  const nextModule = getNextModule();
  const progressPercentage = calculateProgress();
  const isCourseCompleted = progress.courseCompleted;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 md:p-12 text-white mb-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Start to Form: Launch & Legally Register Your Business</h1>
            <p className="text-xl text-indigo-100 mb-6">
              A step-by-step interactive course to help you choose the right business structure, 
              register your entity, and set up your business foundation.
            </p>
            
            {isCourseCompleted ? (
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 mb-6 flex items-center">
                <CheckCircle className="w-6 h-6 text-green-300 mr-3" />
                <div>
                  <p className="font-medium">Course Completed!</p>
                  <p className="text-sm text-indigo-100">You've successfully completed this course.</p>
                </div>
              </div>
            ) : progressPercentage > 0 ? (
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span>Course Progress</span>
                  <span>{progressPercentage}% Complete</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-2.5">
                  <div 
                    className="bg-white h-2.5 rounded-full" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            ) : null}
            
            <div className="flex flex-wrap gap-4">
              {isCourseCompleted ? (
                <Link to={`/courses/business-formation/${businessCourseModules[0].id}`}>
                  <Button className="bg-white text-indigo-600 hover:bg-indigo-50">
                    Review Course Again
                  </Button>
                </Link>
              ) : progressPercentage > 0 ? (
                <Link to={`/courses/business-formation/${nextModule.id}`}>
                  <Button className="bg-white text-indigo-600 hover:bg-indigo-50">
                    Continue Course
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <Link to={`/courses/business-formation/${businessCourseModules[0].id}`}>
                  <Button className="bg-white text-indigo-600 hover:bg-indigo-50">
                    Start Course
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Course Overview */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What You'll Learn</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="bg-indigo-100 p-3 rounded-lg inline-block mb-4">
                <Building className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose the Right Structure</h3>
              <p className="text-gray-600">
                Learn the differences between LLCs, corporations, and other entities to find the perfect fit for your business goals.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="bg-green-100 p-3 rounded-lg inline-block mb-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete the Paperwork</h3>
              <p className="text-gray-600">
                Step-by-step guidance through the filing process with state-specific instructions and templates.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="bg-purple-100 p-3 rounded-lg inline-block mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Establish Legal Foundation</h3>
              <p className="text-gray-600">
                Set up your EIN, bank account, operating agreement, and other essential business systems.
              </p>
            </div>
          </div>
        </div>
        
        {/* Course Modules */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Modules</h2>
          
          <div className="space-y-4">
            {businessCourseModules.map((module) => (
              <Link 
                key={module.id} 
                to={`/courses/business-formation/${module.id}`}
                className="block"
              >
                <div className={`bg-white rounded-lg shadow-sm p-6 border transition-colors ${
                  progress[`${module.id}Completed`]
                    ? 'border-green-200 hover:border-green-300'
                    : 'border-gray-200 hover:border-indigo-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                        progress[`${module.id}Completed`]
                          ? 'bg-green-100 text-green-600'
                          : 'bg-indigo-100 text-indigo-600'
                      }`}>
                        {progress[`${module.id}Completed`] ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <span className="font-semibold">{module.order + 1}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
                        <p className="text-gray-600">{module.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Benefits Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Take This Course?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-start">
                <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Save Money</h3>
                  <p className="text-gray-600">
                    Do it yourself and save hundreds or thousands compared to hiring a lawyer or service.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Protect Yourself</h3>
                  <p className="text-gray-600">
                    Understand how to properly set up your business to protect your personal assets.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-start">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Save Time</h3>
                  <p className="text-gray-600">
                    Follow our streamlined process instead of researching everything from scratch.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-start">
                <div className="bg-purple-100 p-3 rounded-lg mr-4">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Do It Right</h3>
                  <p className="text-gray-600">
                    Avoid common mistakes and ensure your business is properly established from day one.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-8 border border-indigo-100 mb-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Your Business?</h2>
            <p className="text-gray-700 mb-6">
              Join thousands of entrepreneurs who have successfully launched their businesses with our step-by-step guidance.
            </p>
            <Link to={`/courses/business-formation/${businessCourseModules[0].id}`}>
              <Button size="lg">
                Begin Your Business Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}