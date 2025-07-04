import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTour } from '../../contexts/TourContext';
import { Button } from '../../components/common/Button';
import { ProgressIndicator } from '../../components/onboarding/ProgressIndicator';
import { RoleCard } from '../../components/onboarding/RoleCard';
import { onboardingService } from '../../services/onboardingService';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Briefcase, 
  MapPin, 
  Phone, 
  Globe, 
  Linkedin,
  Target,
  Users,
  MessageSquare,
  Calendar,
  Clock,
  Award,
  Building,
  GraduationCap
} from 'lucide-react';

// Step schemas
const step1Schema = z.object({
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().min(1, 'Location is required'),
  yearsExperience: z.number().min(0, 'Years of experience must be 0 or more'),
});

const step2Schema = z.object({
  phone: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Must be a valid LinkedIn URL').optional().or(z.literal('')),
});

const step3Schema = z.object({
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']),
  industry: z.string().min(1, 'Industry is required'),
  companySize: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']),
  previousCompanies: z.string().optional(),
});

const step4Schema = z.object({
  specializations: z.array(z.string()).min(1, 'Select at least one specialization'),
  skills: z.string().min(1, 'Skills are required'),
  certifications: z.string().optional(),
});

const step5Schema = z.object({
  primaryGoal: z.enum(['networking', 'learning', 'career_growth', 'business_development', 'mentoring']),
  careerAspirations: z.string().min(1, 'Career aspirations are required'),
  currentChallenges: z.array(z.string()).min(1, 'Select at least one challenge'),
});

// Simplified step 6 schema - made some fields optional
const step6Schema = z.object({
  networkingStyle: z.enum(['introvert', 'extrovert', 'ambivert']),
  communicationPreference: z.enum(['direct', 'collaborative', 'analytical', 'creative']),
  interests: z.array(z.string()).optional(), // Made optional
  eventPreferences: z.array(z.string()).optional(), // Made optional
});

// Simplified step 7 schema - reduced minimum length requirement
const step7Schema = z.object({
  about: z.string().min(20, 'Bio must be at least 20 characters'), // Reduced from 50
  achievements: z.string().optional(),
  valueProposition: z.string().optional(), // Made optional
});

// Simplified step 8 schema - made some fields optional
const step8Schema = z.object({
  availability: z.enum(['very_active', 'moderately_active', 'occasional']),
  timeZone: z.string().optional(), // Made optional
  preferredMeetingTimes: z.array(z.string()).optional(), // Made optional
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;
type Step4Data = z.infer<typeof step4Schema>;
type Step5Data = z.infer<typeof step5Schema>;
type Step6Data = z.infer<typeof step6Schema>;
type Step7Data = z.infer<typeof step7Schema>;
type Step8Data = z.infer<typeof step8Schema>;

const TOTAL_STEPS = 9; // 8 data collection steps + 1 role assignment step

const roles = [
  {
    id: 'enterprise_closer',
    name: 'Enterprise Closer',
    description: 'Focus on large-scale enterprise deals and strategic partnerships',
    icon: '🏢',
    color: 'from-blue-500 to-blue-600',
    features: ['Enterprise Sales', 'Strategic Partnerships', 'C-Level Networking', 'Complex Deal Management']
  },
  {
    id: 'startup_hustler',
    name: 'Startup Hustler',
    description: 'Thrive in fast-paced startup environments with diverse responsibilities',
    icon: '🚀',
    color: 'from-green-500 to-green-600',
    features: ['Growth Hacking', 'Multi-Channel Sales', 'Product Development Input', 'Rapid Scaling']
  },
  {
    id: 'saas_specialist',
    name: 'SaaS Specialist',
    description: 'Expert in software-as-a-service sales and subscription models',
    icon: '💻',
    color: 'from-purple-500 to-purple-600',
    features: ['Subscription Sales', 'Product Demos', 'Customer Success', 'Recurring Revenue']
  },
  {
    id: 'relationship_builder',
    name: 'Relationship Builder',
    description: 'Excel at building long-term client relationships and account management',
    icon: '🤝',
    color: 'from-orange-500 to-orange-600',
    features: ['Account Management', 'Client Retention', 'Upselling', 'Customer Success']
  },
  {
    id: 'sales_leader',
    name: 'Sales Leader',
    description: 'Lead and mentor sales teams while driving strategic initiatives',
    icon: '👑',
    color: 'from-red-500 to-red-600',
    features: ['Team Leadership', 'Sales Strategy', 'Coaching & Mentoring', 'Performance Management']
  },
  {
    id: 'technical_seller',
    name: 'Technical Seller',
    description: 'Bridge the gap between technical solutions and business needs',
    icon: '⚙️',
    color: 'from-indigo-500 to-indigo-600',
    features: ['Technical Demos', 'Solution Architecture', 'Developer Relations', 'API Integration']
  }
];

export function OnboardingFlow() {
  const { user, updateUserProfile } = useAuth();
  const { askForTourPermission } = useTour();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [selectedRole, setSelectedRole] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState<any>({});

  // Form configurations for each step
  const step1Form = useForm<Step1Data>({ resolver: zodResolver(step1Schema) });
  const step2Form = useForm<Step2Data>({ resolver: zodResolver(step2Schema) });
  const step3Form = useForm<Step3Data>({ resolver: zodResolver(step3Schema) });
  const step4Form = useForm<Step4Data>({ resolver: zodResolver(step4Schema) });
  const step5Form = useForm<Step5Data>({ resolver: zodResolver(step5Schema) });
  const step6Form = useForm<Step6Data>({ resolver: zodResolver(step6Schema) });
  const step7Form = useForm<Step7Data>({ resolver: zodResolver(step7Schema) });
  const step8Form = useForm<Step8Data>({ resolver: zodResolver(step8Schema) });

  const getCurrentForm = () => {
    switch (currentStep) {
      case 1: return step1Form;
      case 2: return step2Form;
      case 3: return step3Form;
      case 4: return step4Form;
      case 5: return step5Form;
      case 6: return step6Form;
      case 7: return step7Form;
      case 8: return step8Form;
      default: return step1Form;
    }
  };

  const handleNext = async () => {
    const currentForm = getCurrentForm();
    const isValid = await currentForm.trigger();
    
    if (!isValid) {
      toast.error('Please fill in all required fields');
      return;
    }

    const stepData = currentForm.getValues();
    setFormData(prev => ({ ...prev, [`step${currentStep}`]: stepData }));

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // Skip the current step but save any filled data
    const currentForm = getCurrentForm();
    const stepData = currentForm.getValues();
    setFormData(prev => ({ ...prev, [`step${currentStep}`]: stepData }));
    
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    if (!user || !selectedRole) {
      toast.error('Please select a role to continue');
      return;
    }

    setIsSubmitting(true);
    try {
      // Combine all form data with proper null checks and defaults
      const step1Data = formData.step1 || {};
      const step2Data = formData.step2 || {};
      const step3Data = formData.step3 || {};
      const step4Data = formData.step4 || {};
      const step5Data = formData.step5 || {};
      const step6Data = formData.step6 || {};
      const step7Data = formData.step7 || {};
      const step8Data = formData.step8 || {};

      // Create comprehensive profile data with safe defaults
      const profileData = {
        name: user.name,
        title: step1Data.title || '',
        company: step1Data.company || '',
        location: step1Data.location || '',
        phone: step2Data.phone || '',
        website: step2Data.website || '',
        linkedin: step2Data.linkedin || '',
        about: step7Data.about || '',
        skills: step4Data.skills ? step4Data.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        onboardingCompleted: true, // Mark onboarding as completed
      };

      // Create onboarding data for role assignment and recommendations with safe defaults
      const onboardingData = {
        // Professional Background
        yearsExperience: step1Data.yearsExperience || 0,
        experienceLevel: step3Data.experienceLevel || 'entry',
        industry: step3Data.industry || '',
        companySize: step3Data.companySize || 'startup',
        previousCompanies: step3Data.previousCompanies || '',
        specializations: step4Data.specializations || [],
        certifications: step4Data.certifications || '',
        
        // Goals & Motivations
        primaryGoal: step5Data.primaryGoal || 'networking',
        careerAspirations: step5Data.careerAspirations || '',
        currentChallenges: step5Data.currentChallenges || [],
        valueProposition: step7Data.valueProposition || '',
        achievements: step7Data.achievements || '',
        
        // Networking & Communication
        networkingStyle: step6Data.networkingStyle || 'ambivert',
        communicationPreference: step6Data.communicationPreference || 'collaborative',
        interests: step6Data.interests || [],
        eventPreferences: step6Data.eventPreferences || [],
        
        // Availability & Preferences
        availability: step8Data.availability || 'moderately_active',
        timeZone: step8Data.timeZone || '',
        preferredMeetingTimes: step8Data.preferredMeetingTimes || [],
        
        // Assigned Role
        assignedRole: selectedRole,
        completedAt: new Date().toISOString(),
        
        // Initialize completedTours to track tour completion
        completedTours: {}
      };

      // Update user profile first
      await updateUserProfile(user.id, profileData);
      
      // Complete onboarding with all the detailed data
      await onboardingService.completeOnboarding(user.id, onboardingData);

      toast.success('Profile setup complete! Welcome to inRooms!');
      
      // Ask if the user wants a tour
      const shouldStartTour = await askForTourPermission('main');
      
      // Redirect to events page
      navigate('/events');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete setup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Professional Identity</h2>
              <p className="text-gray-600 mt-2">Tell us about your current role and experience</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  {...step1Form.register('title')}
                  placeholder="e.g., Senior Sales Executive"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {step1Form.formState.errors.title && (
                  <p className="text-red-600 text-sm mt-1">{step1Form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company *
                </label>
                <input
                  type="text"
                  {...step1Form.register('company')}
                  placeholder="e.g., TechCorp Solutions"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {step1Form.formState.errors.company && (
                  <p className="text-red-600 text-sm mt-1">{step1Form.formState.errors.company.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  {...step1Form.register('location')}
                  placeholder="e.g., San Francisco, CA"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {step1Form.formState.errors.location && (
                  <p className="text-red-600 text-sm mt-1">{step1Form.formState.errors.location.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  {...step1Form.register('yearsExperience', { valueAsNumber: true })}
                  placeholder="e.g., 5"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {step1Form.formState.errors.yearsExperience && (
                  <p className="text-red-600 text-sm mt-1">{step1Form.formState.errors.yearsExperience.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Phone className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Contact & Social</h2>
              <p className="text-gray-600 mt-2">Help others connect with you (all optional)</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...step2Form.register('phone')}
                  placeholder="e.g., +1 (555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-2" />
                  Website/Portfolio
                </label>
                <input
                  type="url"
                  {...step2Form.register('website')}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {step2Form.formState.errors.website && (
                  <p className="text-red-600 text-sm mt-1">{step2Form.formState.errors.website.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Linkedin className="w-4 h-4 inline mr-2" />
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  {...step2Form.register('linkedin')}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {step2Form.formState.errors.linkedin && (
                  <p className="text-red-600 text-sm mt-1">{step2Form.formState.errors.linkedin.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Briefcase className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Professional Background</h2>
              <p className="text-gray-600 mt-2">Help us understand your experience level and industry</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Experience Level *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'entry', label: 'Entry Level', desc: '0-2 years' },
                    { value: 'mid', label: 'Mid Level', desc: '3-5 years' },
                    { value: 'senior', label: 'Senior', desc: '6-10 years' },
                    { value: 'executive', label: 'Executive', desc: '10+ years' }
                  ].map((level) => (
                    <label key={level.value} className="relative">
                      <input
                        type="radio"
                        {...step3Form.register('experienceLevel')}
                        value={level.value}
                        className="sr-only peer"
                      />
                      <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition-colors">
                        <div className="text-sm font-medium text-gray-900">{level.label}</div>
                        <div className="text-xs text-gray-500">{level.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {step3Form.formState.errors.experienceLevel && (
                  <p className="text-red-600 text-sm mt-1">{step3Form.formState.errors.experienceLevel.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                <select
                  {...step3Form.register('industry')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select your industry</option>
                  <option value="Software/Technology">Software/Technology</option>
                  <option value="Financial Services">Financial Services</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail/E-commerce">Retail/E-commerce</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Education">Education</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Other">Other</option>
                </select>
                {step3Form.formState.errors.industry && (
                  <p className="text-red-600 text-sm mt-1">{step3Form.formState.errors.industry.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Company Size *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {[
                    { value: 'startup', label: 'Startup', desc: '1-10' },
                    { value: 'small', label: 'Small', desc: '11-50' },
                    { value: 'medium', label: 'Medium', desc: '51-200' },
                    { value: 'large', label: 'Large', desc: '201-1000' },
                    { value: 'enterprise', label: 'Enterprise', desc: '1000+' }
                  ].map((size) => (
                    <label key={size.value} className="relative">
                      <input
                        type="radio"
                        {...step3Form.register('companySize')}
                        value={size.value}
                        className="sr-only peer"
                      />
                      <div className="p-3 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition-colors text-center">
                        <div className="text-sm font-medium text-gray-900">{size.label}</div>
                        <div className="text-xs text-gray-500">{size.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {step3Form.formState.errors.companySize && (
                  <p className="text-red-600 text-sm mt-1">{step3Form.formState.errors.companySize.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Previous Companies (Optional)
                </label>
                <textarea
                  {...step3Form.register('previousCompanies')}
                  placeholder="List notable previous companies or experiences..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Award className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Skills & Expertise</h2>
              <p className="text-gray-600 mt-2">Showcase your professional capabilities</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Specializations * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'Enterprise Sales', 'Inside Sales', 'Field Sales', 'Account Management',
                    'Business Development', 'Customer Success', 'Sales Operations', 'Revenue Operations',
                    'Technical Sales', 'Channel Sales', 'International Sales', 'Sales Leadership'
                  ].map((spec) => (
                    <label key={spec} className="relative">
                      <input
                        type="checkbox"
                        {...step4Form.register('specializations')}
                        value={spec}
                        className="sr-only peer"
                      />
                      <div className="p-3 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition-colors">
                        <div className="text-sm font-medium text-gray-900 text-center">{spec}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {step4Form.formState.errors.specializations && (
                  <p className="text-red-600 text-sm mt-1">{step4Form.formState.errors.specializations.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Skills * (comma-separated)
                </label>
                <textarea
                  {...step4Form.register('skills')}
                  placeholder="e.g., Salesforce, Lead Generation, Negotiation, CRM, Cold Calling, Presentation Skills"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {step4Form.formState.errors.skills && (
                  <p className="text-red-600 text-sm mt-1">{step4Form.formState.errors.skills.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications & Achievements (Optional)
                </label>
                <textarea
                  {...step4Form.register('certifications')}
                  placeholder="List any relevant certifications, awards, or notable achievements..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Goals & Motivations</h2>
              <p className="text-gray-600 mt-2">Help us personalize your experience</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Primary Goal *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { value: 'networking', label: 'Networking', desc: 'Build professional connections' },
                    { value: 'learning', label: 'Learning', desc: 'Develop new skills and knowledge' },
                    { value: 'career_growth', label: 'Career Growth', desc: 'Advance my career' },
                    { value: 'business_development', label: 'Business Development', desc: 'Find new opportunities' },
                    { value: 'mentoring', label: 'Mentoring', desc: 'Help others and share knowledge' }
                  ].map((goal) => (
                    <label key={goal.value} className="relative">
                      <input
                        type="radio"
                        {...step5Form.register('primaryGoal')}
                        value={goal.value}
                        className="sr-only peer"
                      />
                      <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition-colors">
                        <div className="text-sm font-medium text-gray-900">{goal.label}</div>
                        <div className="text-xs text-gray-500">{goal.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {step5Form.formState.errors.primaryGoal && (
                  <p className="text-red-600 text-sm mt-1">{step5Form.formState.errors.primaryGoal.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Career Aspirations *
                </label>
                <textarea
                  {...step5Form.register('careerAspirations')}
                  placeholder="Describe your career goals and where you see yourself in the next 2-3 years..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {step5Form.formState.errors.careerAspirations && (
                  <p className="text-red-600 text-sm mt-1">{step5Form.formState.errors.careerAspirations.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Current Challenges * (Select all that apply)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'Finding qualified leads', 'Closing deals faster', 'Building stronger relationships',
                    'Learning new technologies', 'Improving presentation skills', 'Time management',
                    'Team collaboration', 'Market understanding', 'Competitive positioning', 'Scaling processes'
                  ].map((challenge) => (
                    <label key={challenge} className="relative">
                      <input
                        type="checkbox"
                        {...step5Form.register('currentChallenges')}
                        value={challenge}
                        className="sr-only peer"
                      />
                      <div className="p-3 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition-colors">
                        <div className="text-sm font-medium text-gray-900">{challenge}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {step5Form.formState.errors.currentChallenges && (
                  <p className="text-red-600 text-sm mt-1">{step5Form.formState.errors.currentChallenges.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Users className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Networking & Communication</h2>
              <p className="text-gray-600 mt-2">Help us match you with the right people and events</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Networking Style *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: 'introvert', label: 'Introvert', desc: 'Prefer smaller groups and deeper conversations' },
                    { value: 'extrovert', label: 'Extrovert', desc: 'Thrive in large groups and social settings' },
                    { value: 'ambivert', label: 'Ambivert', desc: 'Comfortable in both small and large groups' }
                  ].map((style) => (
                    <label key={style.value} className="relative">
                      <input
                        type="radio"
                        {...step6Form.register('networkingStyle')}
                        value={style.value}
                        className="sr-only peer"
                      />
                      <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition-colors">
                        <div className="text-sm font-medium text-gray-900">{style.label}</div>
                        <div className="text-xs text-gray-500">{style.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {step6Form.formState.errors.networkingStyle && (
                  <p className="text-red-600 text-sm mt-1">{step6Form.formState.errors.networkingStyle.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Communication Preference *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'direct', label: 'Direct', desc: 'Straight to the point' },
                    { value: 'collaborative', label: 'Collaborative', desc: 'Team-oriented approach' },
                    { value: 'analytical', label: 'Analytical', desc: 'Data-driven discussions' },
                    { value: 'creative', label: 'Creative', desc: 'Innovative and flexible' }
                  ].map((pref) => (
                    <label key={pref.value} className="relative">
                      <input
                        type="radio"
                        {...step6Form.register('communicationPreference')}
                        value={pref.value}
                        className="sr-only peer"
                      />
                      <div className="p-3 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition-colors text-center">
                        <div className="text-sm font-medium text-gray-900">{pref.label}</div>
                        <div className="text-xs text-gray-500">{pref.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {step6Form.formState.errors.communicationPreference && (
                  <p className="text-red-600 text-sm mt-1">{step6Form.formState.errors.communicationPreference.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Interests (Optional - Select any that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'AI & Machine Learning', 'Cybersecurity', 'Cloud Computing', 'Data Analytics',
                    'Digital Transformation', 'Fintech', 'Healthcare Tech', 'E-commerce',
                    'Mobile Technology', 'Blockchain', 'IoT', 'DevOps'
                  ].map((interest) => (
                    <label key={interest} className="relative">
                      <input
                        type="checkbox"
                        {...step6Form.register('interests')}
                        value={interest}
                        className="sr-only peer"
                      />
                      <div className="p-3 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition-colors">
                        <div className="text-sm font-medium text-gray-900 text-center">{interest}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Event Preferences (Optional - Select any that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'Workshops', 'Panel Discussions', 'Networking Mixers', 'Masterclasses',
                    'Roundtable Discussions', 'Fireside Chats', 'Product Demos', 'Case Studies'
                  ].map((eventType) => (
                    <label key={eventType} className="relative">
                      <input
                        type="checkbox"
                        {...step6Form.register('eventPreferences')}
                        value={eventType}
                        className="sr-only peer"
                      />
                      <div className="p-3 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition-colors">
                        <div className="text-sm font-medium text-gray-900 text-center">{eventType}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Personal Brand & Bio</h2>
              <p className="text-gray-600 mt-2">Create your professional story</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Bio * (minimum 20 characters)
                </label>
                <textarea
                  {...step7Form.register('about')}
                  placeholder="Write a compelling bio that showcases your experience, expertise, and what makes you unique in the sales world..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {step7Form.formState.errors.about && (
                  <p className="text-red-600 text-sm mt-1">{step7Form.formState.errors.about.message}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Current length: {step7Form.watch('about')?.length || 0} characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notable Achievements (Optional)
                </label>
                <textarea
                  {...step7Form.register('achievements')}
                  placeholder="Share your biggest wins, awards, or accomplishments that you're proud of..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unique Value Proposition (Optional)
                </label>
                <textarea
                  {...step7Form.register('valueProposition')}
                  placeholder="In one sentence, what unique value do you bring to your clients or team?"
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Clock className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Availability & Preferences</h2>
              <p className="text-gray-600 mt-2">Help us schedule the perfect events for you</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Activity Level *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: 'very_active', label: 'Very Active', desc: '3+ events per week' },
                    { value: 'moderately_active', label: 'Moderately Active', desc: '1-2 events per week' },
                    { value: 'occasional', label: 'Occasional', desc: '1-2 events per month' }
                  ].map((level) => (
                    <label key={level.value} className="relative">
                      <input
                        type="radio"
                        {...step8Form.register('availability')}
                        value={level.value}
                        className="sr-only peer"
                      />
                      <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition-colors">
                        <div className="text-sm font-medium text-gray-900">{level.label}</div>
                        <div className="text-xs text-gray-500">{level.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {step8Form.formState.errors.availability && (
                  <p className="text-red-600 text-sm mt-1">{step8Form.formState.errors.availability.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Zone (Optional)
                </label>
                <select
                  {...step8Form.register('timeZone')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select your time zone</option>
                  <option value="PST">Pacific Standard Time (PST)</option>
                  <option value="MST">Mountain Standard Time (MST)</option>
                  <option value="CST">Central Standard Time (CST)</option>
                  <option value="EST">Eastern Standard Time (EST)</option>
                  <option value="GMT">Greenwich Mean Time (GMT)</option>
                  <option value="CET">Central European Time (CET)</option>
                  <option value="JST">Japan Standard Time (JST)</option>
                  <option value="AEST">Australian Eastern Standard Time (AEST)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Meeting Times (Optional - Select any that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    'Early Morning (6-9 AM)', 'Morning (9-12 PM)', 'Afternoon (12-3 PM)', 'Late Afternoon (3-6 PM)',
                    'Evening (6-9 PM)', 'Weekends', 'Lunch Hours', 'After Hours'
                  ].map((time) => (
                    <label key={time} className="relative">
                      <input
                        type="checkbox"
                        {...step8Form.register('preferredMeetingTimes')}
                        value={time}
                        className="sr-only peer"
                      />
                      <div className="p-3 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition-colors">
                        <div className="text-sm font-medium text-gray-900 text-center">{time}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <GraduationCap className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Choose Your Role</h2>
              <p className="text-gray-600 mt-2">Based on your responses, select the role that best fits you</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  isSelected={selectedRole === role.id}
                  onClick={() => setSelectedRole(role.id)}
                />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepLabels = [
    'Identity', 'Contact', 'Background', 'Skills', 'Goals', 'Networking', 'Bio', 'Availability', 'Role'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-600 mt-2">Help us personalize your inRooms experience</p>
        </div>

        <ProgressIndicator 
          currentStep={currentStep} 
          totalSteps={TOTAL_STEPS} 
          stepLabels={stepLabels}
        />

        <div className="bg-white rounded-xl shadow-lg p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <div>
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
            </div>

            <div className="flex space-x-3">
              {currentStep < TOTAL_STEPS && currentStep > 1 && (
                <Button variant="outline" onClick={handleSkip}>
                  Skip
                </Button>
              )}
              
              {currentStep < TOTAL_STEPS ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  isLoading={isSubmitting}
                  disabled={!selectedRole}
                >
                  Complete Setup
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}