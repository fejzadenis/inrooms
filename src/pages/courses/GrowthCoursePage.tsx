import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { Button } from '../../components/common/Button'; 
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckSquare, 
  Square, 
  Award, 
  ArrowRight,
  Rocket,
  FileText,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Download,
  ExternalLink,
  BookOpen,
  Lightbulb,
  Target,
  BarChart,
  Users,
  Settings,
  Zap
} from 'lucide-react';
import { growthCourseModules, growthStrategyInfo, growthStrategyRecommendationInfo } from '../../data/growthCourse';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../../config/firebase';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

export function GrowthCoursePage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentModule, setCurrentModule] = useState(growthCourseModules[0]);
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string[]>>({});
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [growthStrategyRecommendation, setGrowthStrategyRecommendation] = useState<string | null>(null);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [isCompletingCourse, setIsCompletingCourse] = useState(false);

  // Load the specified module or default to the first one
  useEffect(() => {
    if (moduleId) {
      const module = growthCourseModules.find(m => m.id === moduleId);
      if (module) {
        setCurrentModule(module);
      } else {
        navigate('/courses/growth');
      }
    } else {
      setCurrentModule(growthCourseModules[0]);
    }
  }, [moduleId, navigate]);

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('growthCourseProgress');
    if (savedProgress) {
      const parsedProgress = JSON.parse(savedProgress);
      setProgress(parsedProgress);
      
      // Load quiz answers if available
      if (parsedProgress.quizAnswers) {
        setQuizAnswers(parsedProgress.quizAnswers);
      }
      
      // Load checklist items if available
      if (parsedProgress.checklistItems) {
        setChecklistItems(parsedProgress.checklistItems);
      }
      
      // Load growth strategy recommendation if available
      if (parsedProgress.growthStrategyRecommendation) {
        setGrowthStrategyRecommendation(parsedProgress.growthStrategyRecommendation);
      }
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = (newProgress: Record<string, any>) => {
    const updatedProgress = { ...progress, ...newProgress };
    setProgress(updatedProgress);
    localStorage.setItem('growthCourseProgress', JSON.stringify(updatedProgress));
  };

  // Handle quiz answer selection
  const handleQuizAnswer = (questionId: string, optionId: string, type: 'single' | 'multiple') => {
    let newAnswers = { ...quizAnswers };
    
    if (type === 'single') {
      newAnswers[questionId] = [optionId];
    } else {
      // For multiple choice, toggle the selection
      if (!newAnswers[questionId]) {
        newAnswers[questionId] = [];
      }
      
      if (newAnswers[questionId].includes(optionId)) {
        newAnswers[questionId] = newAnswers[questionId].filter(id => id !== optionId);
      } else {
        newAnswers[questionId] = [...newAnswers[questionId], optionId];
      }
    }
    
    setQuizAnswers(newAnswers);
    saveProgress({ quizAnswers: newAnswers });
  };

  // Handle checklist item toggle
  const handleChecklistToggle = (itemId: string) => {
    let newItems = [...checklistItems];
    
    if (newItems.includes(itemId)) {
      newItems = newItems.filter(id => id !== itemId);
    } else {
      newItems.push(itemId);
    }
    
    setChecklistItems(newItems);
    saveProgress({ checklistItems: newItems });
  };

  // Calculate growth strategy recommendation based on quiz answers
  const calculateRecommendation = () => {
    if (!currentModule.quiz) return;
    
    let scores = {
      productLed: 0,
      salesLed: 0,
      marketingLed: 0,
      communityLed: 0,
      operationsLed: 0
    };
    
    // Calculate scores based on answers
    Object.entries(quizAnswers).forEach(([questionId, selectedOptions]) => {
      const question = currentModule.quiz?.questions.find(q => q.id === questionId);
      if (!question) return;
      
      selectedOptions.forEach(optionId => {
        const option = question.options.find(o => o.id === optionId);
        if (!option) return;
        
        scores.productLed += option.points.productLed;
        scores.salesLed += option.points.salesLed;
        scores.marketingLed += option.points.marketingLed;
        scores.communityLed += option.points.communityLed;
        scores.operationsLed += option.points.operationsLed;
      });
    });
    
    // Find the highest score
    let highestScore = -Infinity;
    let recommendedStrategy = '';
    
    Object.entries(scores).forEach(([strategy, score]) => {
      if (score > highestScore) {
        highestScore = score;
        recommendedStrategy = strategy;
      }
    });
    
    setGrowthStrategyRecommendation(recommendedStrategy);
    saveProgress({ growthStrategyRecommendation: recommendedStrategy });
    setShowRecommendation(true);
  };

  // Navigate to the next module
  const goToNextModule = () => {
    const currentIndex = growthCourseModules.findIndex(m => m.id === currentModule.id);
    if (currentIndex < growthCourseModules.length - 1) {
      const nextModule = growthCourseModules[currentIndex + 1];
      navigate(`/courses/growth/${nextModule.id}`);
      
      // Mark current module as completed
      saveProgress({ [`${currentModule.id}Completed`]: true });
    }
  };

  // Navigate to the previous module
  const goToPrevModule = () => {
    const currentIndex = growthCourseModules.findIndex(m => m.id === currentModule.id);
    if (currentIndex > 0) {
      const prevModule = growthCourseModules[currentIndex - 1];
      navigate(`/courses/growth/${prevModule.id}`);
    }
  };

  // Award badge and points for course completion
  const awardCourseCompletion = async () => {
    if (!user) return;
    
    try {
      setIsCompletingCourse(true);
      
      // Update user profile with badge and points
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        'profile.badges': arrayUnion('growth_strategist'),
        'profile.points': increment(150),
        'profile.completedCourses': arrayUnion('growth-playbook')
      });
      
      // Show success message
      toast.success('Congratulations! You earned the Growth Strategist badge and 150 reputation points!');
      
      // Mark course as completed in local storage
      saveProgress({ courseCompleted: true });
      
      // Navigate to reputation page to see new badge
      setTimeout(() => {
        navigate('/reputation');
      }, 2000);
    } catch (error) {
      console.error('Error awarding course completion:', error);
      toast.error('There was an error updating your profile. Please try again.');
      
      // Still mark as completed in local storage
      saveProgress({ courseCompleted: true });
      navigate('/');
    } finally {
      setIsCompletingCourse(false);
    }
  };

  // Render quiz component
  const renderQuiz = () => {
    if (!currentModule.quiz) return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-xl shadow-md p-8 mt-8 border border-gray-200"
      >
        <div className="flex items-center mb-4">
          <Lightbulb className="w-6 h-6 text-indigo-600 mr-3" />
          <h3 className="text-xl font-semibold text-gray-900">{currentModule.quiz.title}</h3>
        </div>
        <p className="text-gray-600 mb-6 text-lg">{currentModule.quiz.description}</p>
        
        <div className="space-y-8">
          {currentModule.quiz.questions.map((question) => (
            <div key={question.id} className="border-b border-gray-200 pb-8 last:border-0">
              <p className="font-medium text-gray-900 mb-4 text-lg">{question.text}</p>
              
              <div className="space-y-3">
                {question.options.map((option) => (
                  <div 
                    key={option.id} 
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                      quizAnswers[question.id]?.includes(option.id)
                        ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                        : 'border-gray-200 hover:border-indigo-200'
                    }`}
                    onClick={() => handleQuizAnswer(question.id, option.id, question.type)}
                  >
                    <div className="flex-shrink-0 mr-3">
                      {question.type === 'single' ? (
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          quizAnswers[question.id]?.includes(option.id)
                            ? 'border-indigo-500'
                            : 'border-gray-300'
                        }`}>
                          {quizAnswers[question.id]?.includes(option.id) && (
                            <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></div>
                          )}
                        </div>
                      ) : (
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          quizAnswers[question.id]?.includes(option.id)
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-gray-300'
                        }`}>
                          {quizAnswers[question.id]?.includes(option.id) && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">{option.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {currentModule.id === 'growth-mindset' && (
          <div className="mt-8 pt-4 border-t border-gray-200">
            <Button 
              onClick={calculateRecommendation} 
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md"
            >
              <Lightbulb className="w-5 h-5 mr-2" />
              Get Growth Strategy Recommendation
            </Button>
          </div>
        )}
      </motion.div>
    );
  };

  // Render growth strategy recommendation
  const renderRecommendation = () => {
    if (!growthStrategyRecommendation || !showRecommendation) return null;
    
    const strategy = growthStrategyInfo[growthStrategyRecommendation as keyof typeof growthStrategyInfo];
    const recommendation = growthStrategyRecommendationInfo[growthStrategyRecommendation as keyof typeof growthStrategyRecommendationInfo];
    
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl shadow-lg p-8 mt-8 border border-indigo-200"
      >
        <div className="flex items-center mb-6">
          <div className="bg-white p-3 rounded-full shadow-md mr-4">
            <Rocket className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold text-indigo-900">Your Recommended Growth Strategy</h3>
        </div>
        
        <div className="bg-white rounded-xl p-8 shadow-md border border-indigo-100">
          <h4 className="text-2xl font-bold text-indigo-700 mb-3">{strategy.name}</h4>
          <p className="text-gray-700 mb-6 text-lg">{recommendation.description}</p>
          
          <div className="mb-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <p className="font-semibold text-indigo-900 mb-2">Best for:</p>
            <p className="text-indigo-800">{strategy.bestFor}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-green-50 p-5 rounded-lg border border-green-100">
              <p className="font-semibold text-green-800 mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Key Tactics:
              </p>
              <ul className="space-y-2 text-green-800">
                {recommendation.keyTactics.map((tactic, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center mr-2 mt-0.5">
                      <span className="text-green-700 text-xs font-bold">{index + 1}</span>
                    </div>
                    {tactic}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
              <p className="font-semibold text-blue-800 mb-3 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Recommended Resources:
              </p>
              <ul className="space-y-2 text-blue-800">
                {recommendation.resources.map((resource, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center mr-2 mt-0.5">
                      <span className="text-blue-700 text-xs font-bold">{index + 1}</span>
                    </div>
                    {resource}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h5 className="font-semibold text-gray-900 mb-3">Next Steps:</h5>
            <ul className="space-y-2">
              {recommendation.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2 mt-0.5">
                    <span className="text-indigo-700 text-xs font-bold">{index + 1}</span>
                  </div>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-6">
              <Button 
                onClick={goToNextModule} 
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md text-lg py-3"
              >
                Continue Your Growth Journey
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Render checklist component
  const renderChecklist = () => {
    if (!currentModule.checklist) return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-xl shadow-md p-8 mt-8 border border-gray-200"
      >
        <div className="flex items-center mb-6">
          <CheckSquare className="w-6 h-6 text-indigo-600 mr-3" />
          <h3 className="text-xl font-semibold text-gray-900">{currentModule.checklist.title}</h3>
        </div>
        
        <div className="space-y-4">
          {currentModule.checklist.items.map((item) => (
            <div 
              key={item.id} 
              className={`flex items-start p-4 border-2 rounded-lg transition-all duration-200 ${
                checklistItems.includes(item.id)
                  ? 'border-green-500 bg-green-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => handleChecklistToggle(item.id)}
            >
              <div className="flex-shrink-0 mr-3 mt-0.5">
                {checklistItems.includes(item.id) ? (
                  <CheckSquare className="w-6 h-6 text-green-500" />
                ) : (
                  <Square className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <p className={`font-medium ${
                  checklistItems.includes(item.id) ? 'text-green-700 text-lg' : 'text-gray-900 text-lg'
                }`}>
                  {item.text}
                  {item.required && <span className="text-red-500 ml-1">*</span>}
                </p>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <span className="text-red-500">*</span> Required items
          </p>
          
          <Button 
            onClick={goToNextModule} 
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md"
            disabled={!checklistItems.some(id => 
              currentModule.checklist?.items.find(item => item.id === id && item.required)
            )}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Continue to Next Module
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    );
  };

  // Render tools component
  const renderTools = () => {
    if (!currentModule.tools) return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white rounded-xl shadow-md p-8 mt-8 border border-gray-200"
      >
        <div className="flex items-center mb-6">
          <Zap className="w-6 h-6 text-indigo-600 mr-3" />
          <h3 className="text-xl font-semibold text-gray-900">Growth Tools</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentModule.tools.map((tool) => (
            <motion.div 
              key={tool.id} 
              whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              className="border-2 border-gray-200 rounded-xl p-5 hover:border-indigo-300 transition-all duration-200"
            >
              <div className="flex items-center mb-3">
                <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                  {tool.type === 'calculator' && <BarChart className="w-5 h-5 text-indigo-600" />}
                  {tool.type === 'template' && <FileText className="w-5 h-5 text-indigo-600" />}
                  {tool.type === 'generator' && <Zap className="w-5 h-5 text-indigo-600" />}
                  {tool.type === 'lookup' && <Search className="w-5 h-5 text-indigo-600" />}
                </div>
                <h4 className="font-medium text-gray-900">{tool.title}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
              
              {tool.url ? (
                <a 
                  href={tool.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center bg-indigo-50 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  Open Tool
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              ) : (
                <button 
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center bg-indigo-50 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
                  onClick={() => {
                    if (tool.type === 'calculator') {
                      toast('Interactive calculator will be available soon!', { icon: 'ℹ️' });
                    } else if (tool.type === 'generator') {
                      toast('Generator tool will be available soon!', { icon: 'ℹ️' });
                    } else {
                      toast('This tool will be available soon!', { icon: 'ℹ️' });
                    }
                  }}
                >
                  Use Tool
                  <ArrowRight className="w-3 h-3 ml-1" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Course Header with Progress */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Build to Scale: Your Growth Playbook
              </h1>
              <p className="text-gray-600 mt-2">Your strategic guide to sustainable business growth</p>
            </div>
            <div className="flex items-center space-x-3 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span className="text-indigo-700 font-medium">Module {currentModule.order + 1} of {growthCourseModules.length}</span>
            </div>
          </div>
          
          <div className="bg-gray-200 h-3 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((currentModule.order + 1) / growthCourseModules.length) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full"
              style={{ width: `${((currentModule.order + 1) / growthCourseModules.length) * 100}%` }}
            />
          </div>
        </motion.div>
        
        {/* Module Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          {growthCourseModules.map((module) => (
            <button
              key={module.id}
              onClick={() => navigate(`/courses/growth/${module.id}`)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                currentModule.id === module.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                  : progress[`${module.id}Completed`]
                  ? 'bg-green-100 text-green-800 border border-green-200 shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
              }`}
            >
              {module.order + 1}. {module.title}
            </button>
          ))}
        </div>
        
        {/* Module Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-8 mb-8 border border-gray-200"
        >
          <div className="flex items-center mb-4">
            {currentModule.order === 0 && <Target className="w-8 h-8 text-indigo-600 mr-3" />}
            {currentModule.order === 1 && <Lightbulb className="w-8 h-8 text-indigo-600 mr-3" />}
            {currentModule.order === 2 && <Rocket className="w-8 h-8 text-indigo-600 mr-3" />}
            {currentModule.order === 3 && <Settings className="w-8 h-8 text-indigo-600 mr-3" />}
            {currentModule.order === 4 && <Users className="w-8 h-8 text-indigo-600 mr-3" />}
            {currentModule.order === 5 && <BarChart className="w-8 h-8 text-indigo-600 mr-3" />}
            <h2 className="text-2xl font-bold text-gray-900">{currentModule.title}</h2>
          </div>
          <p className="text-gray-600 mb-6 text-lg">{currentModule.description}</p>
          
          <div className="prose prose-indigo max-w-none prose-headings:text-indigo-900 prose-headings:font-bold prose-p:text-gray-700 prose-strong:text-gray-900 prose-strong:font-semibold prose-li:text-gray-700">
            <ReactMarkdown>{currentModule.content}</ReactMarkdown>
          </div>

          {/* Enhanced Formatted Sections for All Modules */}
          {currentModule.sections && (
            <div className="mt-8 space-y-10">
              {currentModule.sections.map((section, index) => (
                <div key={index} className="space-y-4">
                  {section.type === 'welcome' && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-100">
                      <h2 className="text-2xl font-bold text-indigo-900 mb-4">{section.title}</h2>
                      <p className="text-lg text-gray-700 leading-relaxed">{section.content}</p>
                    </div>
                  )}
                  
                  {section.type === 'section' && (
                    <>
                      <h2 className="text-2xl font-bold text-indigo-900 mt-8 mb-4 border-b border-indigo-100 pb-2">{section.title}</h2>
                      <p className="text-lg text-gray-700 leading-relaxed mb-6">{section.content}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {section.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="bg-white p-6 rounded-lg border border-indigo-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                            <h3 className="font-semibold text-indigo-800 text-lg mb-2">{item.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {section.type === 'conclusion' && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-xl border border-purple-100 mt-10 shadow-sm">
                      <h2 className="text-2xl font-bold text-indigo-900 mb-4">{section.title}</h2>
                      <p className="text-lg text-indigo-800 mb-4 leading-relaxed">{section.content}</p>
                      <p className="text-lg font-medium text-indigo-700">{section.cta}</p>
                    </div>
                  )}
                  
                  {section.type === 'table' && section.table && (
                    <div className="mt-8 mb-10">
                      <h2 className="text-2xl font-bold text-indigo-900 mb-4">{section.title}</h2>
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg overflow-hidden border border-purple-100">
                          <thead className="bg-purple-50">
                            <tr>
                              {section.table.headers.map((header, i) => (
                                <th key={i} className="px-6 py-3 text-left text-sm font-semibold text-purple-900">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-purple-100">
                            {section.table.rows.map((row, i) => (
                              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'}>
                                {row.map((cell, j) => (
                                  <td key={j} className="px-6 py-4 text-sm text-gray-700">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {section.type === 'steps' && section.steps && (
                    <div className="mt-8 mb-10">
                      <h2 className="text-2xl font-bold text-indigo-900 mb-6">{section.title}</h2>
                      <div className="space-y-6">
                        {section.steps.map((step, i) => (
                          <div key={i} className="flex items-start">
                            <div className="flex-shrink-0 bg-purple-100 rounded-full w-10 h-10 flex items-center justify-center text-purple-700 font-bold mr-4">
                              {i + 1}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                              <p className="text-gray-700 leading-relaxed">{step.description}</p>
                              {step.tips && (
                                <div className="mt-3 bg-blue-50 p-4 rounded-lg border border-blue-100">
                                  <p className="text-blue-800 text-sm font-medium">Pro Tip: {step.tips}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {section.type === 'callout' && (
                    <div className={`mt-8 mb-10 p-6 rounded-xl border ${
                      section.style === 'warning' ? 'bg-amber-50 border-amber-200' :
                      section.style === 'info' ? 'bg-blue-50 border-blue-200' :
                      section.style === 'success' ? 'bg-green-50 border-green-200' :
                      'bg-purple-50 border-purple-200'
                    }`}>
                      <h3 className={`text-xl font-bold mb-3 ${
                        section.style === 'warning' ? 'text-amber-800' :
                        section.style === 'info' ? 'text-blue-800' :
                        section.style === 'success' ? 'text-green-800' :
                        'text-purple-800'
                      }`}>{section.title}</h3>
                      <p className={`${
                        section.style === 'warning' ? 'text-amber-700' :
                        section.style === 'info' ? 'text-blue-700' :
                        section.style === 'success' ? 'text-green-700' :
                        'text-purple-700'
                      } leading-relaxed`}>{section.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
        
        {/* Quiz Component */}
        {renderQuiz()}
        
        {/* Growth Strategy Recommendation */}
        {renderRecommendation()}
        
        {/* Checklist Component */}
        {renderChecklist()}
        
        {/* Tools Component */}
        {renderTools()}
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-12 mb-8">
          <Button
            variant="outline"
            onClick={goToPrevModule}
            disabled={currentModule.order === 0}
            className={`${currentModule.order === 0 ? 'invisible' : ''} border-2 border-gray-300 hover:bg-gray-50 px-6`}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous Module
          </Button>
          
          {currentModule.order < growthCourseModules.length - 1 && (
            <Button 
              onClick={goToNextModule}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-md px-6"
            >
              Next Module
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          
          {currentModule.order === growthCourseModules.length - 1 && (
            <Button 
              onClick={awardCourseCompletion}
              isLoading={isCompletingCourse}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md px-6"
            >
              <Award className="w-5 h-5 mr-2" />
              Complete Course
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
}