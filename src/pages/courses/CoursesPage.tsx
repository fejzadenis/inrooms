import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Rocket, 
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
  Building,
  DollarSign,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export function CoursesPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = React.useState<Record<string, any>>({});
  
  const { user } = useAuth();
  // Load progress from localStorage for all courses
  React.useEffect(() => {
    const businessProgress = localStorage.getItem('businessCourseProgress');
    const growthProgress = localStorage.getItem('growthCourseProgress');
    const operateProgress = localStorage.getItem('operateCourseProgress');
    
    const allProgress = {
      business: businessProgress ? JSON.parse(businessProgress) : {},
      growth: growthProgress ? JSON.parse(growthProgress) : {},
      operate: operateProgress ? JSON.parse(operateProgress) : {}
    };
    
    setProgress(allProgress);
  }, []);

  const courses = [
    {
      id: 'business-formation',
      title: 'Start to Form: Launch Your Business',
      description: 'Learn how to legally establish your business entity and set up the foundation for long-term success.',
      icon: Briefcase,
      color: 'from-indigo-600 to-blue-600',
      bgColor: 'from-indigo-50 to-blue-50',
      borderColor: 'border-indigo-200',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      duration: '2-3 hours',
      modules: 6,
      level: 'Beginner',
      badge: 'Business Founder',
      skills: ['Entity Selection', 'Legal Filing', 'Compliance', 'Business Setup'],
      creditsRequired: 1,
      outcomes: [
        'Choose the right business structure',
        'Complete all necessary filings',
        'Set up essential business systems',
        'Understand legal and tax obligations'
      ],
      path: '/courses/business-formation',
      overviewPath: '/courses/business-formation/overview',
      isCompleted: progress.business?.courseCompleted || false,
      progressKey: 'business'
    },
    {
      id: 'growth-playbook',
      title: 'Build to Scale: Your Growth Playbook',
      description: 'Master proven frameworks for sustainable business growth, from product-market fit to scaling operations.',
      icon: Rocket,
      color: 'from-purple-600 to-blue-600',
      bgColor: 'from-purple-50 to-blue-50',
      borderColor: 'border-purple-200',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      duration: '4-5 hours',
      modules: 6,
      level: 'Intermediate',
      badge: 'Growth Strategist',
      skills: ['Growth Strategy', 'Product-Market Fit', 'Team Building', 'Analytics'],
      creditsRequired: 1,
      outcomes: [
        'Validate product-market fit',
        'Build a scalable growth engine',
        'Create operational excellence',
        'Develop high-performing teams'
      ],
      path: '/courses/growth',
      overviewPath: '/courses/growth/overview',
      isCompleted: progress.growth?.courseCompleted || false,
      progressKey: 'growth'
    },
    {
      id: 'operate-to-thrive',
      title: 'Operate to Thrive: Running a Resilient Business',
      description: 'Master business operations, financial management, team leadership, and building resilience for long-term success.',
      icon: Settings,
      color: 'from-emerald-600 to-teal-600',
      bgColor: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      duration: '5-6 hours',
      modules: 7,
      level: 'Advanced',
      badge: 'Operations Expert',
      skills: ['Operations', 'Financial Management', 'Leadership', 'Risk Management'],
      creditsRequired: 1,
      outcomes: [
        'Build strong operational foundations',
        'Master financial health and forecasting',
        'Develop leadership and team skills',
        'Create resilient business systems'
      ],
      path: '/courses/operate',
      overviewPath: '/courses/operate/overview',
      isCompleted: progress.operate?.courseCompleted || false,
      progressKey: 'operate'
    }
  ];

  const calculateCourseProgress = (courseKey: string) => {
    const courseProgress = progress[courseKey];
    if (!courseProgress) return 0;
    
    // Count completed modules based on course
    let totalModules = 6; // Default
    if (courseKey === 'operate') totalModules = 7;
    
    let completedModules = 0;
    for (let i = 0; i < totalModules; i++) {
      const moduleKeys = {
        business: ['orientation', 'entity-selection', 'business-foundation', 'entity-filing', 'compliance-checklist', 'next-steps'],
        growth: ['growth-mindset', 'product-market-fit', 'growth-engine', 'operational-excellence', 'team-building', 'growth-analytics'],
        operate: ['foundation-clarity-culture', 'financial-health-forecasting', 'customer-lifecycle-mastery', 'team-leadership-evolution', 'scalable-systems-tech', 'resilience-adaptation-playbook', 'planning-next-chapter']
      };
      
      const moduleKey = moduleKeys[courseKey]?.[i];
      if (moduleKey && courseProgress[`${moduleKey}Completed`]) {
        completedModules++;
      }
    }
    
    return Math.round((completedModules / totalModules) * 100);
  };

  const getRecommendedCourse = () => {
    // Recommend based on completion status
    if (!progress.business?.courseCompleted) {
      return courses[0]; // Business Formation
    } else if (!progress.growth?.courseCompleted) {
      return courses[1]; // Growth Playbook
    } else if (!progress.operate?.courseCompleted) {
      return courses[2]; // Operate to Thrive
    }
    return courses[0]; // Default to first course
  };

  const recommendedCourse = getRecommendedCourse();
  const completedCourses = courses.filter(course => course.isCompleted).length;

  const courseCreditsUsed = user?.subscription?.courseCreditsUsed || 0;
  const courseCreditsQuota = user?.subscription?.courseCreditsQuota || 0;
  const isUnlimitedCredits = courseCreditsQuota === 999;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 rounded-3xl p-10 md:p-16 text-white"
        >
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-20"></div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative z-10 max-w-4xl"
          >
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <GraduationCap className="w-5 h-5 mr-2 text-white" />
              <span className="text-white font-medium">Founder Education Hub</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Master Your Entrepreneurial Journey
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              From idea to IPO - comprehensive courses designed by successful founders to help you build, 
              grow, and operate a thriving business. Learn proven frameworks, avoid common pitfalls, 
              and accelerate your path to success.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white">{courses.length}</div>
                <div className="text-white/80">Expert Courses</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white">{completedCourses}</div>
                <div className="text-white/80">Completed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white">15+</div>
                <div className="text-white/80">Hours of Content</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white">
                  {isUnlimitedCredits ? 'Unlimited' : `${courseCreditsQuota - courseCreditsUsed}`}
                </div>
                <div className="text-white/80">
                  {isUnlimitedCredits ? 'Course Credits' : 'Credits Remaining'}
                </div>
              </div>


            </div>
            
            <Button 
              onClick={() => navigate(recommendedCourse.path)}
              className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg px-8 py-4 text-lg"
            >
              <BookOpen className="w-6 h-6 mr-2" />
              {recommendedCourse.isCompleted ? 'Review Courses' : 'Start Learning'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Course Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Choose Your Learning Path</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow our structured curriculum designed to take you from startup idea to successful business operation
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => {
              const Icon = course.icon;
              const courseProgress = calculateCourseProgress(course.progressKey);
              
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ y: -5 }}
                  className={`relative bg-white rounded-2xl shadow-lg border-2 ${course.borderColor} overflow-hidden transition-all duration-300 hover:shadow-xl`}
                >
                  {/* Course Header */}
                  <div className={`bg-gradient-to-r ${course.bgColor} p-6 border-b ${course.borderColor}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${course.iconBg} p-3 rounded-xl`}>
                        <Icon className={`w-8 h-8 ${course.iconColor}`} />
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${course.iconColor}`}>{course.level}</div>
                        <div className="text-xs text-gray-500">{course.duration}</div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{course.description}</p>
                    
                    {/* Progress Bar */}
                    {courseProgress > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium text-gray-900">{courseProgress}%</span>
                        </div>
                        <div className="w-full bg-white/50 rounded-full h-2">
                          <div 
                            className={`bg-gradient-to-r ${course.color} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${courseProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {course.isCompleted && (
                      <div className="mt-4 flex items-center text-green-700 bg-green-100 px-3 py-2 rounded-lg">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Course Completed!</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Course Details */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{course.modules}</div>
                        <div className="text-sm text-gray-500">Modules</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          <Award className="w-6 h-6 mx-auto" />
                        </div>
                        <div className="text-sm text-gray-500">{course.badge}</div>
                      </div>
                    </div>
                    
                    {/* Skills */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">What You'll Learn:</h4>
                      <div className="flex flex-wrap gap-2">
                        {course.skills.slice(0, 3).map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}
                          >
                            {skill}
                          </span>
                        ))}
                        {course.skills.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{course.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Key Outcomes */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Key Outcomes:</h4>
                      <ul className="space-y-2">
                        {course.outcomes.slice(0, 2).map((outcome, outcomeIndex) => (
                          <li key={outcomeIndex} className="flex items-start text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Button 
                        onClick={() => navigate(course.path)}
                        className={`w-full bg-gradient-to-r ${course.color} hover:opacity-90 shadow-md`}
                      >
                        {course.isCompleted ? (
                          <>
                            <FileText className="w-4 h-4 mr-2" />
                            Review Course
                          </>
                        ) : courseProgress > 0 ? (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Continue Course
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-4 h-4 mr-2" />
                            Start Course
                          </>
                        )}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      
                      <Link to={course.overviewPath}>
                        <Button 
                          variant="outline" 
                          className={`w-full ${course.borderColor} ${course.iconColor} hover:${course.bgColor.replace('from-', 'bg-').replace(' to-teal-50', '').replace(' to-blue-50', '').replace(' to-indigo-50', '')}`}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Course Overview
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Learning Path */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Recommended Learning Path</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow our structured progression to build comprehensive business expertise
            </p>
          </div>
          
          <div className="relative">
            {/* Connection Lines */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
              {courses.map((course, index) => {
                const Icon = course.icon;
                
                return (
                  <div key={course.id} className="relative">
                    {/* Step Number */}
                    <div className="flex justify-center mb-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${course.color} text-white flex items-center justify-center font-bold text-lg shadow-lg`}>
                        {index + 1}
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                      <div className="text-center">
                        <div className={`${course.iconBg} p-3 rounded-xl inline-block mb-4`}>
                          <Icon className={`w-8 h-8 ${course.iconColor}`} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                        
                        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 mb-4">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {course.duration}
                          </span>
                          <span className="flex items-center">
                            <BookOpen className="w-3 h-3 mr-1" />
                            {course.modules} modules
                          </span>
                        </div>
                        
                        {course.isCompleted ? (
                          <div className="flex items-center justify-center text-green-700 bg-green-100 px-3 py-2 rounded-lg">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium">Completed</span>
                          </div>
                        ) : (
                        course.creditsRequired > 0 && courseCreditsUsed >= courseCreditsQuota && !isUnlimitedCredits ? (
                          <div className="flex items-center justify-center text-red-700 bg-red-100 px-3 py-2 rounded-lg">
                            <DollarSign className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium">Upgrade to Access</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center text-blue-700 bg-blue-100 px-3 py-2 rounded-lg">
                            <Clock className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium">
                              {course.creditsRequired} Credit{course.creditsRequired > 1 ? 's' : ''}
                            </span>
                          </div>
                        )
                      )}
                          <Button 
                            onClick={() => navigate(course.path)}
                            size="sm"
                            className={`bg-gradient-to-r ${course.color} hover:opacity-90`}
                          >
                            {index === 0 && !progress.business?.courseCompleted ? 'Start Here' : 'Begin Course'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Why Take These Courses */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Our Courses Work</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn from real founders who have built successful businesses
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
            >
              <div className="bg-blue-100 p-4 rounded-full inline-block mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Practical & Actionable</h3>
              <p className="text-gray-600">
                Every lesson includes real-world examples and actionable frameworks you can implement immediately.
              </p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
            >
              <div className="bg-green-100 p-4 rounded-full inline-block mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Founder-Tested</h3>
              <p className="text-gray-600">
                Created by successful entrepreneurs who have built and scaled multiple businesses.
              </p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
            >
              <div className="bg-purple-100 p-4 rounded-full inline-block mb-4">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Interactive Learning</h3>
              <p className="text-gray-600">
                Quizzes, assessments, and tools help you apply concepts to your specific business.
              </p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
            >
              <div className="bg-orange-100 p-4 rounded-full inline-block mb-4">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Earn Recognition</h3>
              <p className="text-gray-600">
                Complete courses to earn verified badges that showcase your business expertise.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-3xl p-12 md:p-16 text-white"
        >
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-20"></div>
          
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <GraduationCap className="w-16 h-16 text-white/80 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Business?</h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of entrepreneurs who have successfully built and scaled their businesses using our proven curriculum. 
              Start your learning journey today and earn valuable credentials along the way.
            </p>
            <Button 
              onClick={() => navigate(recommendedCourse.path)}
              size="lg"
              className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-xl px-8 py-4 text-lg"
            >
              <BookOpen className="w-6 h-6 mr-2" />
              {recommendedCourse.isCompleted ? 'Explore All Courses' : `Start with ${recommendedCourse.title.split(':')[0]}`}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}