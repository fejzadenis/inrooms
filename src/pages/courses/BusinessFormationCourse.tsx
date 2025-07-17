import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { Button } from '../../components/common/Button'; 
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckSquare, 
  Square, 
  Award, 
  ArrowRight,
  Briefcase,
  FileText,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Download,
  ExternalLink,
  BookOpen,
  Lightbulb,
  Target,
  Shield,
  DollarSign,
  Zap,
  Search,
  TrendingUp
} from 'lucide-react';
import { businessCourseModules, entityTypeInfo, stateFilingInfo } from '../../data/businessCourse';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../../config/firebase';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

export function BusinessFormationCourse() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentModule, setCurrentModule] = useState(businessCourseModules[0]);
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string[]>>({});
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [entityRecommendation, setEntityRecommendation] = useState<string | null>(null);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [isCompletingCourse, setIsCompletingCourse] = useState(false);

  // Load the specified module or default to the first one
  useEffect(() => {
    if (moduleId) {
      const module = businessCourseModules.find(m => m.id === moduleId);
      if (module) {
        setCurrentModule(module);
      } else {
        navigate('/courses/business-formation');
      }
    } else {
      setCurrentModule(businessCourseModules[0]);
    }
  }, [moduleId, navigate]);

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('businessCourseProgress');
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
      
      // Load entity recommendation if available
      if (parsedProgress.entityRecommendation) {
        setEntityRecommendation(parsedProgress.entityRecommendation);
      }
      
      // Load business name if available
      if (parsedProgress.businessName) {
        setBusinessName(parsedProgress.businessName);
      }
      
      // Load selected state if available
      if (parsedProgress.selectedState) {
        setSelectedState(parsedProgress.selectedState);
      }
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = (newProgress: Record<string, any>) => {
    const updatedProgress = { ...progress, ...newProgress };
    setProgress(updatedProgress);
    localStorage.setItem('businessCourseProgress', JSON.stringify(updatedProgress));
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

  // Calculate entity recommendation based on quiz answers
  const calculateRecommendation = () => {
    if (!currentModule.quiz) return;
    
    let scores = {
      llc: 0,
      cCorp: 0,
      sCorp: 0,
      soleProprietorship: 0,
      partnership: 0
    };
    
    // Calculate scores based on answers
    Object.entries(quizAnswers).forEach(([questionId, selectedOptions]) => {
      const question = currentModule.quiz?.questions.find(q => q.id === questionId);
      if (!question) return;
      
      selectedOptions.forEach(optionId => {
        const option = question.options.find(o => o.id === optionId);
        if (!option) return;
        
        scores.llc += option.points.llc;
        scores.cCorp += option.points.cCorp;
        scores.sCorp += option.points.sCorp;
        scores.soleProprietorship += option.points.soleProprietorship;
        scores.partnership += option.points.partnership;
      });
    });
    
    // Find the highest score
    let highestScore = -Infinity;
    let recommendedEntity = '';
    
    Object.entries(scores).forEach(([entity, score]) => {
      if (score > highestScore) {
        highestScore = score;
        recommendedEntity = entity;
      }
    });
    
    setEntityRecommendation(recommendedEntity);
    saveProgress({ entityRecommendation: recommendedEntity });
    setShowRecommendation(true);
  };

  // Navigate to the next module
  const goToNextModule = () => {
    const currentIndex = businessCourseModules.findIndex(m => m.id === currentModule.id);
    if (currentIndex < businessCourseModules.length - 1) {
      const nextModule = businessCourseModules[currentIndex + 1];
      navigate(`/courses/business-formation/${nextModule.id}`);
      
      // Mark current module as completed
      saveProgress({ [`${currentModule.id}Completed`]: true });
    }
  };

  // Navigate to the previous module
  const goToPrevModule = () => {
    const currentIndex = businessCourseModules.findIndex(m => m.id === currentModule.id);
    if (currentIndex > 0) {
      const prevModule = businessCourseModules[currentIndex - 1];
      navigate(`/courses/business-formation/${prevModule.id}`);
    }
  };

  // Handle business name input
  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusinessName(e.target.value);
    saveProgress({ businessName: e.target.value });
  };

  // Handle state selection
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
    saveProgress({ selectedState: e.target.value });
  };

  // Award badge and points for course completion
  const awardCourseCompletion = async () => {
    if (!user) return;
    
    try {
      setIsCompletingCourse(true);
      
      // Update user profile with badge and points
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        'profile.badges': arrayUnion('business_founder'),
        'profile.points': increment(100),
        'profile.completedCourses': arrayUnion('business-formation')
      });
      
      // Show success message
      toast.success('Congratulations! You earned the Business Founder badge and 100 reputation points!');
      
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
        
        {currentModule.id === 'entity-selection' && (
          <div className="mt-8 pt-4 border-t border-gray-200">
            <Button 
              onClick={calculateRecommendation} 
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md"
            >
              <Lightbulb className="w-5 h-5 mr-2" />
              Get Entity Recommendation
            </Button>
          </div>
        )}
      </motion.div>
    );
  };

  // Render entity recommendation
  const renderRecommendation = () => {
    if (!entityRecommendation || !showRecommendation) return null;
    
    const entity = entityTypeInfo[entityRecommendation as keyof typeof entityTypeInfo];
    
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl shadow-lg p-8 mt-8 border border-indigo-200"
      >
        <div className="flex items-center mb-6">
          <div className="bg-white p-3 rounded-full shadow-md mr-4">
            <Award className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold text-indigo-900">Your Recommended Business Structure</h3>
        </div>
        
        <div className="bg-white rounded-xl p-8 shadow-md border border-indigo-100">
          <h4 className="text-2xl font-bold text-indigo-700 mb-3">{entity.name}</h4>
          <p className="text-gray-700 mb-6 text-lg">{entity.description}</p>
          
          <div className="mb-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <p className="font-semibold text-indigo-900 mb-2">Best for:</p>
            <p className="text-indigo-800">{entity.bestFor}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-green-50 p-5 rounded-lg border border-green-100">
              <p className="font-semibold text-green-800 mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Advantages:
              </p>
              <ul className="space-y-2 text-green-800">
                {entity.advantages.map((advantage, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center mr-2 mt-0.5">
                      <span className="text-green-700 text-xs font-bold">{index + 1}</span>
                    </div>
                    {advantage}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-red-50 p-5 rounded-lg border border-red-100">
              <p className="font-semibold text-red-800 mb-3 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Disadvantages:
              </p>
              <ul className="space-y-2 text-red-800">
                {entity.disadvantages.map((disadvantage, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center mr-2 mt-0.5">
                      <span className="text-red-700 text-xs font-bold">{index + 1}</span>
                    </div>
                    {disadvantage}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Button 
              onClick={goToNextModule} 
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md text-lg py-3"
            >
              Continue with {entity.name}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
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
          <h3 className="text-xl font-semibold text-gray-900">Helpful Tools</h3>
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
                  {tool.type === 'generator' && <Zap className="w-5 h-5 text-indigo-600" />}
                  {tool.type === 'calculator' && <DollarSign className="w-5 h-5 text-indigo-600" />}
                  {tool.type === 'template' && <FileText className="w-5 h-5 text-indigo-600" />}
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
                    if (tool.type === 'generator' && tool.id === 'purpose-generator') {
                      // Example of a tool action
                      const purposes = [
                        "To engage in any lawful act or activity for which limited liability companies may be organized in this state.",
                        "To provide professional consulting services in the field of technology and software development.",
                        "To operate an e-commerce business selling retail products.",
                        "To provide marketing and advertising services to businesses."
                      ];
                      const randomPurpose = purposes[Math.floor(Math.random() * purposes.length)];
                      toast.success(`Generated Purpose: "${randomPurpose}"`, { duration: 5000 });
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

  // Render state filing information
  const renderStateInfo = () => {
    if (currentModule.id !== 'entity-filing' || !selectedState || !stateFilingInfo[selectedState as keyof typeof stateFilingInfo]) {
      return null;
    }
    
    const stateInfo = stateFilingInfo[selectedState as keyof typeof stateFilingInfo];
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-xl shadow-md p-8 mt-8 border border-gray-200"
      >
        <div className="flex items-center mb-6">
          <FileText className="w-6 h-6 text-indigo-600 mr-3" />
          <h3 className="text-xl font-semibold text-gray-900">
            Filing Information for {selectedState.charAt(0).toUpperCase() + selectedState.slice(1)}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h4 className="font-medium text-blue-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Filing Fees
            </h4>
            <ul className="space-y-3 text-blue-800">
              <li className="flex justify-between">
                <span className="font-medium">LLC Filing Fee:</span> 
                <span className="bg-white px-3 py-1 rounded-lg text-blue-700 font-bold">${stateInfo.llcFee}</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium">Corporation Filing Fee:</span> 
                <span className="bg-white px-3 py-1 rounded-lg text-blue-700 font-bold">${stateInfo.corpFee}</span>
              </li>
              {stateInfo.expeditedOption && (
                <li className="flex justify-between">
                  <span className="font-medium">Expedited Processing:</span> 
                  <span className="bg-white px-3 py-1 rounded-lg text-blue-700 font-bold">
                    ${stateInfo.expeditedFee} <span className="font-normal text-xs">({stateInfo.expeditedTime})</span>
                  </span>
                </li>
              )}
            </ul>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
            <h4 className="font-medium text-purple-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Processing Information
            </h4>
            <ul className="space-y-3 text-purple-800">
              <li className="flex justify-between">
                <span className="font-medium">Processing Time:</span> 
                <span className="bg-white px-3 py-1 rounded-lg text-purple-700">{stateInfo.processingTime}</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium">Annual Report:</span> 
                <span className={`px-3 py-1 rounded-lg ${stateInfo.annualReportRequired ? 'bg-purple-200 text-purple-800' : 'bg-gray-200 text-gray-700'}`}>
                  {stateInfo.annualReportRequired ? 'Required' : 'Not Required'}
                </span>
              </li>
              {stateInfo.annualReportRequired && (
                <li className="flex justify-between">
                  <span className="font-medium">Annual Report Fee:</span> 
                  <span className="bg-white px-3 py-1 rounded-lg text-purple-700 font-bold">${stateInfo.annualReportFee}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <a 
            href={stateInfo.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center bg-indigo-50 px-4 py-3 rounded-lg hover:bg-indigo-100 transition-colors inline-block"
          >
            Visit {selectedState.charAt(0).toUpperCase() + selectedState.slice(1)} Business Filing Website
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      </motion.div>
    );
  };

  // Render business name and state selection inputs
  const renderBusinessInfoInputs = () => {
    if (currentModule.id !== 'business-foundation') return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-xl shadow-md p-8 mt-8 border border-gray-200"
      >
        <div className="flex items-center mb-6">
          <Briefcase className="w-6 h-6 text-indigo-600 mr-3" />
          <h3 className="text-xl font-semibold text-gray-900">Your Business Information</h3>
        </div>
        
        <div className="space-y-8">
          {currentModule.id === 'orientation' && (
            <div>
              <label className="block text-md font-medium text-gray-700 mb-3">
                What is your business idea in one sentence?
              </label>
              <textarea
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-lg"
                placeholder="Describe your business idea briefly..."
                rows={3}
                onChange={(e) => saveProgress({ businessIdea: e.target.value })}
                defaultValue={progress.businessIdea || ''}
              />
              <p className="text-sm text-gray-500 mt-2">This helps clarify your vision and will guide your entity selection.</p>
            </div>
          )}
          
          <div>
            <label htmlFor="businessName" className="block text-md font-medium text-gray-700 mb-3">
              Business Name
            </label>
            <input
              type="text"
              id="businessName"
              value={businessName}
              onChange={handleBusinessNameChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-lg"
              placeholder="Enter your business name"
            />
            <p className="text-sm text-gray-500 mt-2">Choose a name that reflects your brand and is available in your state.</p>
          </div>
          
          <div>
            <label htmlFor="state" className="block text-md font-medium text-gray-700 mb-3">
              State of Formation
            </label>
            <select
              id="state"
              value={selectedState}
              onChange={handleStateChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-lg"
            >
              <option value="">Select a state</option>
              {Object.keys(stateFilingInfo).map((state) => (
                <option key={state} value={state}>
                  {state.charAt(0).toUpperCase() + state.slice(1)}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-2">Choose the state where you'll register your business. This is typically where you operate or where you live.</p>
          </div>
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
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Start to Form: Launch Your Business
              </h1>
              <p className="text-gray-600 mt-2">Your step-by-step guide to business formation</p>
            </div>
            <div className="flex items-center space-x-3 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span className="text-indigo-700 font-medium">Module {currentModule.order + 1} of {businessCourseModules.length}</span>
            </div>
          </div>
          
          <div className="bg-gray-200 h-3 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((currentModule.order + 1) / businessCourseModules.length) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full"
              style={{ width: `${((currentModule.order + 1) / businessCourseModules.length) * 100}%` }}
            />
          </div>
        </motion.div>
        
        {/* Module Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          {businessCourseModules.map((module) => (
            <button
              key={module.id}
              onClick={() => navigate(`/courses/business-formation/${module.id}`)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                currentModule.id === module.id
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
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
            {currentModule.order === 2 && <Briefcase className="w-8 h-8 text-indigo-600 mr-3" />}
            {currentModule.order === 3 && <FileText className="w-8 h-8 text-indigo-600 mr-3" />}
            {currentModule.order === 4 && <Shield className="w-8 h-8 text-indigo-600 mr-3" />}
            {currentModule.order === 5 && <CheckCircle className="w-8 h-8 text-indigo-600 mr-3" />}
            <h2 className="text-2xl font-bold text-gray-900">{currentModule.title}</h2>
          </div>
          <p className="text-gray-600 mb-6 text-lg">{currentModule.description}</p>
          
          <div className="prose prose-indigo max-w-none prose-headings:text-indigo-900 prose-headings:font-bold prose-p:text-gray-700 prose-strong:text-gray-900 prose-strong:font-semibold prose-li:text-gray-700">
            <ReactMarkdown>{currentModule.content}</ReactMarkdown>
          </div>
          
          {/* Render formatted sections for orientation module */}
          {currentModule.id === 'orientation' && currentModule.sections && (
            <div className="mt-8 space-y-10">
              {currentModule.sections.map((section, index) => (
                <div key={index} className="space-y-4">
                  {section.type === 'welcome' && (
                    <>
                      <h2 className="text-2xl font-bold text-indigo-900 mt-6">{section.title}</h2>
                      <p className="text-lg text-gray-700 leading-relaxed">{section.content}</p>
                    </>
                  )}
                  
                  {section.type === 'section' && (
                    <>
                      <h2 className="text-2xl font-bold text-indigo-900 mt-6">{section.title}</h2>
                      <p className="text-lg text-gray-700 leading-relaxed">{section.content}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {section.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <h3 className="font-semibold text-indigo-800 mb-1">{item.title}</h3>
                            <p className="text-gray-600">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {section.type === 'conclusion' && (
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100 mt-8">
                      <h2 className="text-2xl font-bold text-indigo-900 mb-3">{section.title}</h2>
                      <p className="text-lg text-indigo-800 mb-4">{section.content}</p>
                      <p className="text-lg font-medium text-indigo-700">{section.cta}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
        
        {/* Business Info Inputs (for business-foundation module) */}
        {renderBusinessInfoInputs()}
        
        {/* State Filing Info (for entity-filing module) */}
        {renderStateInfo()}
        
        {/* Quiz Component */}
        {renderQuiz()}
        
        {/* Entity Recommendation */}
        {renderRecommendation()}
        
        {/* Checklist Component */}
        {renderChecklist()}
        
        {/* Tools Component */}
        {renderTools()}
        
        {/* Next Course Teaser - show only on last module */}
        {currentModule.order === businessCourseModules.length - 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 shadow-sm mb-8"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center">
                  <TrendingUp className="w-6 h-6 text-purple-600 mr-2" />
                  <h3 className="text-lg font-bold text-gray-900">Ready to grow your business?</h3>
                </div>
                <p className="text-gray-700 mt-1">
                  Now that you've formed your business, learn how to scale it with our Growth Playbook course.
                </p>
              </div>
              <Link to="/courses/growth">
                <Button className="whitespace-nowrap bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Growth Course
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
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
          
          {currentModule.order < businessCourseModules.length - 1 && (
            <Button 
              onClick={goToNextModule}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md px-6"
            >
              Next Module
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          
          {currentModule.order === businessCourseModules.length - 1 && (
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