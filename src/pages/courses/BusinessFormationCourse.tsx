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
  Briefcase,
  FileText,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Download,
  ExternalLink
} from 'lucide-react';
import { businessCourseModules, entityTypeInfo, stateFilingInfo } from '../../data/businessCourse';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../../config/firebase';
import ReactMarkdown from 'react-markdown';

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
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{currentModule.quiz.title}</h3>
        <p className="text-gray-600 mb-6">{currentModule.quiz.description}</p>
        
        <div className="space-y-8">
          {currentModule.quiz.questions.map((question) => (
            <div key={question.id} className="border-b border-gray-200 pb-6 last:border-0">
              <p className="font-medium text-gray-900 mb-4">{question.text}</p>
              
              <div className="space-y-3">
                {question.options.map((option) => (
                  <div 
                    key={option.id} 
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      quizAnswers[question.id]?.includes(option.id)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleQuizAnswer(question.id, option.id, question.type)}
                  >
                    <div className="flex-shrink-0 mr-3">
                      {question.type === 'single' ? (
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          quizAnswers[question.id]?.includes(option.id)
                            ? 'border-indigo-500'
                            : 'border-gray-300'
                        }`}>
                          {quizAnswers[question.id]?.includes(option.id) && (
                            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                          )}
                        </div>
                      ) : (
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
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
                      <p className="text-gray-900">{option.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {currentModule.id === 'entity-selection' && (
          <div className="mt-8">
            <Button onClick={calculateRecommendation} className="w-full">
              Get Entity Recommendation
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Render entity recommendation
  const renderRecommendation = () => {
    if (!entityRecommendation || !showRecommendation) return null;
    
    const entity = entityTypeInfo[entityRecommendation as keyof typeof entityTypeInfo];
    
    return (
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg shadow-md p-6 mt-8 border border-indigo-100">
        <div className="flex items-center mb-4">
          <Award className="w-8 h-8 text-indigo-600 mr-3" />
          <h3 className="text-xl font-semibold text-gray-900">Your Recommended Business Structure</h3>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-indigo-700 mb-2">{entity.name}</h4>
          <p className="text-gray-700 mb-4">{entity.description}</p>
          
          <div className="mb-4">
            <p className="font-medium text-gray-900">Best for:</p>
            <p className="text-gray-700">{entity.bestFor}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="font-medium text-gray-900 mb-2">Advantages:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {entity.advantages.map((advantage, index) => (
                  <li key={index}>{advantage}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <p className="font-medium text-gray-900 mb-2">Disadvantages:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {entity.disadvantages.map((disadvantage, index) => (
                  <li key={index}>{disadvantage}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-6">
            <Button onClick={goToNextModule} className="w-full">
              Continue with {entity.name}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Render checklist component
  const renderChecklist = () => {
    if (!currentModule.checklist) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{currentModule.checklist.title}</h3>
        
        <div className="space-y-4">
          {currentModule.checklist.items.map((item) => (
            <div 
              key={item.id} 
              className={`flex items-start p-3 border rounded-lg transition-colors ${
                checklistItems.includes(item.id)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200'
              }`}
              onClick={() => handleChecklistToggle(item.id)}
            >
              <div className="flex-shrink-0 mr-3 mt-0.5">
                {checklistItems.includes(item.id) ? (
                  <CheckSquare className="w-5 h-5 text-green-500" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div>
                <p className={`font-medium ${
                  checklistItems.includes(item.id) ? 'text-green-700' : 'text-gray-900'
                }`}>
                  {item.text}
                  {item.required && <span className="text-red-500 ml-1">*</span>}
                </p>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">
            <span className="text-red-500">*</span> Required items
          </p>
          
          <Button 
            onClick={goToNextModule} 
            className="w-full"
            disabled={!checklistItems.some(id => 
              currentModule.checklist?.items.find(item => item.id === id && item.required)
            )}
          >
            Continue to Next Module
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Render tools component
  const renderTools = () => {
    if (!currentModule.tools) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Helpful Tools</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentModule.tools.map((tool) => (
            <div key={tool.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
              <h4 className="font-medium text-gray-900 mb-2">{tool.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
              
              {tool.url ? (
                <a 
                  href={tool.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                >
                  Open Tool
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              ) : (
                <button 
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
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
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render state filing information
  const renderStateInfo = () => {
    if (currentModule.id !== 'entity-filing' || !selectedState || !stateFilingInfo[selectedState as keyof typeof stateFilingInfo]) {
      return null;
    }
    
    const stateInfo = stateFilingInfo[selectedState as keyof typeof stateFilingInfo];
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Filing Information for {selectedState.charAt(0).toUpperCase() + selectedState.slice(1)}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Filing Fees</h4>
            <ul className="space-y-2 text-gray-700">
              <li><span className="font-medium">LLC Filing Fee:</span> ${stateInfo.llcFee}</li>
              <li><span className="font-medium">Corporation Filing Fee:</span> ${stateInfo.corpFee}</li>
              {stateInfo.expeditedOption && (
                <li><span className="font-medium">Expedited Processing:</span> ${stateInfo.expeditedFee} ({stateInfo.expeditedTime})</li>
              )}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Processing Information</h4>
            <ul className="space-y-2 text-gray-700">
              <li><span className="font-medium">Standard Processing Time:</span> {stateInfo.processingTime}</li>
              <li><span className="font-medium">Annual Report Required:</span> {stateInfo.annualReportRequired ? 'Yes' : 'No'}</li>
              {stateInfo.annualReportRequired && (
                <li><span className="font-medium">Annual Report Fee:</span> ${stateInfo.annualReportFee}</li>
              )}
            </ul>
          </div>
        </div>
        
        <div className="mt-4">
          <a 
            href={stateInfo.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
          >
            Visit {selectedState.charAt(0).toUpperCase() + selectedState.slice(1)} Business Filing Website
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>
    );
  };

  // Render business name and state selection inputs
  const renderBusinessInfoInputs = () => {
    if (currentModule.id !== 'business-foundation') return null;
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Business Information</h3>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              id="businessName"
              value={businessName}
              onChange={handleBusinessNameChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your business name"
            />
          </div>
          
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
              State of Formation
            </label>
            <select
              id="state"
              value={selectedState}
              onChange={handleStateChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select a state</option>
              {Object.keys(stateFilingInfo).map((state) => (
                <option key={state} value={state}>
                  {state.charAt(0).toUpperCase() + state.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Course Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Start to Form: Launch Your Business</h1>
            <div className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <span className="text-gray-600">Module {currentModule.order + 1} of {businessCourseModules.length}</span>
            </div>
          </div>
          
          <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentModule.order + 1) / businessCourseModules.length) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Module Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {businessCourseModules.map((module) => (
            <button
              key={module.id}
              onClick={() => navigate(`/courses/business-formation/${module.id}`)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                currentModule.id === module.id
                  ? 'bg-indigo-600 text-white'
                  : progress[`${module.id}Completed`]
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {module.order + 1}. {module.title}
            </button>
          ))}
        </div>
        
        {/* Module Content */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentModule.title}</h2>
          <p className="text-gray-600 mb-6">{currentModule.description}</p>
          
          {currentModule.id === 'orientation' && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-8 border border-indigo-100 mb-6">
            <h3 className="text-2xl font-bold text-indigo-900 mb-4">Orientation – What Are You Building?</h3>
            <p className="text-lg text-indigo-800 mb-6">Define your business idea, goals, and commitment level</p>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Welcome to Start to Form: Your Business Formation Journey</h4>
              <p className="text-gray-700 mb-4">
                This comprehensive course will guide you through the process of legally forming your business. 
                By the end, you'll have chosen the right business structure, filed your entity, and set up the 
                essential systems every new business needs.
              </p>
              
              <div className="mt-6">
                <label className="block text-lg font-medium text-gray-900 mb-3">
                  What is your business idea in one sentence?
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                  placeholder="Write your answer here..."
                  value={businessName}
                  onChange={handleBusinessNameChange}
                ></textarea>
              </div>
            </div>
          </div>
          )}
          
          {currentModule.id !== 'orientation' && (
            <div className="prose max-w-none">
              <ReactMarkdown>{currentModule.content}</ReactMarkdown>
            </div>
          )}
        
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
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={goToPrevModule}
            disabled={currentModule.order === 0}
            className={currentModule.order === 0 ? 'invisible' : ''}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous Module
          </Button>
          
          {currentModule.order < businessCourseModules.length - 1 && (
            <Button onClick={goToNextModule}>
              Next Module
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          
          {currentModule.order === businessCourseModules.length - 1 && (
            <Button 
              onClick={awardCourseCompletion}
              isLoading={isCompletingCourse}
            >
              Complete Course
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
}