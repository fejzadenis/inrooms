import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Sparkles, Target, Users, Briefcase, MapPin, Star, ArrowRight, Phone, Globe, Linkedin, Mail } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/common/Logo';
import { toast } from 'react-hot-toast';

const onboardingSchema = z.object({
  // Step 1: Professional Identity
  jobTitle: z.string().min(2, 'Job title is required'),
  company: z.string().min(2, 'Company is required'),
  location: z.string().min(2, 'Location is required'),
  yearsExperience: z.number().min(0, 'Years of experience required'),
  
  // Step 2: Contact & Social Presence
  phone: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Must be a valid LinkedIn URL').optional().or(z.literal('')),
  
  // Step 3: Professional Background
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']),
  industry: z.string().min(1, 'Industry is required'),
  companySize: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']),
  previousCompanies: z.string().optional(),
  
  // Step 4: Skills & Expertise
  specialization: z.array(z.string()).min(1, 'Select at least one specialization'),
  skills: z.array(z.string()).min(3, 'Select at least 3 skills'),
  certifications: z.string().optional(),
  
  // Step 5: Goals & Motivations
  primaryGoal: z.enum(['networking', 'learning', 'career_growth', 'business_development', 'mentoring', 'job_search']),
  careerAspiration: z.string().min(10, 'Please describe your career aspirations (minimum 10 characters)'),
  challengesFacing: z.array(z.string()).min(1, 'Select at least one challenge'),
  
  // Step 6: Networking & Communication
  networkingStyle: z.enum(['introvert', 'extrovert', 'ambivert']),
  communicationPreference: z.enum(['direct', 'collaborative', 'analytical', 'creative']),
  interests: z.array(z.string()).min(1, 'Select at least one interest'),
  eventPreferences: z.array(z.string()).min(1, 'Select at least one preference'),
  
  // Step 7: Personal Brand & Bio
  personalBio: z.string().min(50, 'Please write a bio of at least 50 characters'),
  achievements: z.string().optional(),
  uniqueValue: z.string().min(20, 'Please describe what makes you unique (minimum 20 characters)'),
  
  // Step 8: Availability & Commitment
  availability: z.enum(['very_active', 'moderately_active', 'occasional']),
  timeZone: z.string().min(1, 'Time zone is required'),
  preferredMeetingTimes: z.array(z.string()).min(1, 'Select at least one preferred time'),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

interface UserRole {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
}

const USER_ROLES: UserRole[] = [
  {
    id: 'enterprise_closer',
    name: 'Enterprise Closer',
    description: 'Focused on large-scale enterprise deals and strategic partnerships',
    icon: '🎯',
    color: 'from-blue-500 to-blue-600',
    features: ['Enterprise networking events', 'C-level connections', 'Deal strategy workshops', 'Account-based selling resources']
  },
  {
    id: 'startup_hustler',
    name: 'Startup Hustler',
    description: 'Thriving in fast-paced startup environments and early-stage sales',
    icon: '🚀',
    color: 'from-purple-500 to-purple-600',
    features: ['Startup founder connections', 'Growth hacking events', 'Pitch practice sessions', 'Funding opportunity alerts']
  },
  {
    id: 'saas_specialist',
    name: 'SaaS Specialist',
    description: 'Expert in software-as-a-service sales and subscription models',
    icon: '💻',
    color: 'from-green-500 to-green-600',
    features: ['SaaS metrics workshops', 'Product-led growth events', 'Subscription model training', 'Tech stack discussions']
  },
  {
    id: 'relationship_builder',
    name: 'Relationship Builder',
    description: 'Excels at building long-term client relationships and partnerships',
    icon: '🤝',
    color: 'from-orange-500 to-orange-600',
    features: ['Relationship building workshops', 'Client success stories', 'Partnership opportunities', 'Retention strategies']
  },
  {
    id: 'sales_leader',
    name: 'Sales Leader',
    description: 'Managing teams and driving organizational sales success',
    icon: '👑',
    color: 'from-red-500 to-red-600',
    features: ['Leadership development', 'Team management workshops', 'Sales coaching sessions', 'Strategy planning events']
  },
  {
    id: 'technical_seller',
    name: 'Technical Seller',
    description: 'Combining technical expertise with sales acumen',
    icon: '⚙️',
    color: 'from-indigo-500 to-indigo-600',
    features: ['Technical demos', 'Solution architecture', 'Developer relations', 'API integration workshops']
  }
];

const INDUSTRIES = [
  'Software/Technology', 'Financial Services', 'Healthcare', 'Manufacturing', 
  'Retail/E-commerce', 'Education', 'Real Estate', 'Consulting', 'Media/Entertainment',
  'Telecommunications', 'Energy', 'Automotive', 'Aerospace', 'Government', 'Non-profit', 'Other'
];

const SPECIALIZATIONS = [
  'Enterprise Sales', 'Inside Sales', 'Field Sales', 'Channel Sales', 'Partner Sales',
  'Customer Success', 'Business Development', 'Account Management', 'Sales Engineering',
  'Sales Operations', 'Revenue Operations', 'Sales Enablement', 'Lead Generation',
  'Demand Generation', 'Product Marketing', 'Growth Marketing', 'Sales Development'
];

const SKILLS = [
  'CRM Management', 'Salesforce', 'HubSpot', 'Lead Qualification', 'Cold Calling',
  'Email Marketing', 'Social Selling', 'LinkedIn Sales Navigator', 'Prospecting',
  'Negotiation', 'Presentation Skills', 'Demo Skills', 'Objection Handling',
  'Closing Techniques', 'Account Planning', 'Territory Management', 'Pipeline Management',
  'Sales Forecasting', 'Data Analysis', 'Market Research', 'Competitive Analysis',
  'Customer Relationship Management', 'Upselling', 'Cross-selling', 'Retention Strategies'
];

const CHALLENGES = [
  'Finding qualified leads', 'Closing deals faster', 'Building stronger relationships',
  'Understanding new technologies', 'Competing with larger companies', 'Remote selling',
  'Managing sales pipeline', 'Improving conversion rates', 'Scaling sales processes',
  'Team management', 'Career advancement', 'Work-life balance', 'Staying motivated',
  'Learning new skills', 'Networking effectively', 'Personal branding'
];

const INTERESTS = [
  'AI & Machine Learning', 'Cybersecurity', 'Cloud Computing', 'Data Analytics',
  'Digital Transformation', 'Fintech', 'Healthtech', 'Edtech', 'E-commerce',
  'Mobile Technology', 'IoT', 'Blockchain', 'DevOps', 'API Economy', 'Automation',
  'Virtual Reality', 'Augmented Reality', 'Sustainability Tech', 'Gaming', 'Social Media'
];

const EVENT_PREFERENCES = [
  'Small Group Discussions (5-10 people)', 'Medium Groups (10-20 people)', 'Large Events (20+ people)',
  'Workshop Sessions', 'Panel Discussions', 'One-on-One Meetings', 'Industry Roundtables',
  'Product Demos', 'Case Study Reviews', 'Skill Building Sessions', 'Mentorship Programs',
  'Networking Mixers', 'Lunch & Learns', 'Evening Events', 'Weekend Sessions'
];

const TIME_ZONES = [
  'Pacific Time (PT)', 'Mountain Time (MT)', 'Central Time (CT)', 'Eastern Time (ET)',
  'GMT', 'CET', 'IST', 'JST', 'AEST', 'Other'
];

const MEETING_TIMES = [
  'Early Morning (6-9 AM)', 'Morning (9-12 PM)', 'Lunch Time (12-2 PM)',
  'Afternoon (2-5 PM)', 'Evening (5-8 PM)', 'Late Evening (8-10 PM)',
  'Weekends', 'Flexible'
];

const COMPANY_SIZES = [
  { value: 'startup', label: 'Startup (1-10 employees)' },
  { value: 'small', label: 'Small (11-50 employees)' },
  { value: 'medium', label: 'Medium (51-200 employees)' },
  { value: 'large', label: 'Large (201-1000 employees)' },
  { value: 'enterprise', label: 'Enterprise (1000+ employees)' }
];

export function OnboardingFlow() {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [assignedRole, setAssignedRole] = React.useState<UserRole | null>(null);
  const [showRoleAssignment, setShowRoleAssignment] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onChange'
  });

  const totalSteps = 9; // Including role assignment step
  const watchedValues = watch();

  // AI-powered role assignment based on user responses
  const assignUserRole = (data: OnboardingFormData): UserRole => {
    let scores: Record<string, number> = {};
    
    // Initialize scores
    USER_ROLES.forEach(role => {
      scores[role.id] = 0;
    });

    // Score based on job title and experience
    const jobTitle = data.jobTitle.toLowerCase();
    if (jobTitle.includes('enterprise') || jobTitle.includes('strategic')) {
      scores.enterprise_closer += 3;
    }
    if (jobTitle.includes('startup') || jobTitle.includes('growth')) {
      scores.startup_hustler += 3;
    }
    if (jobTitle.includes('saas') || jobTitle.includes('software')) {
      scores.saas_specialist += 3;
    }
    if (jobTitle.includes('manager') || jobTitle.includes('director') || jobTitle.includes('vp')) {
      scores.sales_leader += 3;
    }
    if (jobTitle.includes('technical') || jobTitle.includes('engineer')) {
      scores.technical_seller += 3;
    }

    // Score based on experience level and years
    if (data.experienceLevel === 'executive' || data.yearsExperience >= 10) {
      scores.sales_leader += 3;
      scores.enterprise_closer += 2;
    }
    if (data.experienceLevel === 'entry' || data.yearsExperience <= 3) {
      scores.startup_hustler += 2;
      scores.saas_specialist += 1;
    }

    // Score based on company size
    switch (data.companySize) {
      case 'startup':
        scores.startup_hustler += 3;
        break;
      case 'enterprise':
        scores.enterprise_closer += 3;
        scores.sales_leader += 2;
        break;
      case 'medium':
      case 'large':
        scores.saas_specialist += 2;
        scores.relationship_builder += 1;
        break;
    }

    // Score based on primary goal
    switch (data.primaryGoal) {
      case 'networking':
        scores.relationship_builder += 3;
        break;
      case 'business_development':
        scores.enterprise_closer += 2;
        scores.startup_hustler += 2;
        break;
      case 'career_growth':
        scores.sales_leader += 2;
        break;
      case 'mentoring':
        scores.sales_leader += 3;
        break;
      case 'job_search':
        scores.relationship_builder += 2;
        break;
    }

    // Score based on specializations
    data.specialization.forEach(spec => {
      if (spec.includes('Enterprise')) scores.enterprise_closer += 2;
      if (spec.includes('Technical') || spec.includes('Engineering')) scores.technical_seller += 2;
      if (spec.includes('Customer Success') || spec.includes('Account Management')) scores.relationship_builder += 2;
      if (spec.includes('Business Development')) scores.startup_hustler += 1;
      if (spec.includes('Operations') || spec.includes('Enablement')) scores.sales_leader += 2;
    });

    // Score based on skills
    data.skills.forEach(skill => {
      if (skill.includes('Technical') || skill.includes('Demo') || skill.includes('Engineering')) {
        scores.technical_seller += 1;
      }
      if (skill.includes('Enterprise') || skill.includes('Account Planning')) {
        scores.enterprise_closer += 1;
      }
      if (skill.includes('Relationship') || skill.includes('Customer')) {
        scores.relationship_builder += 1;
      }
    });

    // Find the role with the highest score
    const topRole = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b);
    return USER_ROLES.find(role => role.id === topRole[0]) || USER_ROLES[0];
  };

  const nextStep = async () => {
    const isValid = await trigger();
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Assign role based on responses
      const role = assignUserRole(data);
      setAssignedRole(role);

      // Create comprehensive bio from collected data
      const generatedBio = data.personalBio || 
        `${data.experienceLevel.charAt(0).toUpperCase() + data.experienceLevel.slice(1)}-level ${data.jobTitle} with ${data.yearsExperience} years of experience at ${data.company}. ${data.uniqueValue} Passionate about ${data.primaryGoal.replace('_', ' ')} in the ${data.industry} industry.`;

      // Update user profile with comprehensive onboarding data
      const profileData = {
        name: user.name,
        title: data.jobTitle,
        company: data.company,
        location: data.location,
        phone: data.phone || '',
        website: data.website || '',
        linkedin: data.linkedin || '',
        about: generatedBio,
        skills: [...data.specialization, ...data.skills.slice(0, 8)], // Combine specializations and top skills
        onboardingData: {
          // Professional Identity
          yearsExperience: data.yearsExperience,
          experienceLevel: data.experienceLevel,
          industry: data.industry,
          companySize: data.companySize,
          previousCompanies: data.previousCompanies || '',
          
          // Skills & Expertise
          specialization: data.specialization,
          skills: data.skills,
          certifications: data.certifications || '',
          
          // Goals & Motivations
          primaryGoal: data.primaryGoal,
          careerAspiration: data.careerAspiration,
          challengesFacing: data.challengesFacing,
          
          // Networking & Communication
          networkingStyle: data.networkingStyle,
          communicationPreference: data.communicationPreference,
          interests: data.interests,
          eventPreferences: data.eventPreferences,
          
          // Personal Brand
          personalBio: data.personalBio,
          achievements: data.achievements || '',
          uniqueValue: data.uniqueValue,
          
          // Availability
          availability: data.availability,
          timeZone: data.timeZone,
          preferredMeetingTimes: data.preferredMeetingTimes,
          
          // System
          assignedRole: role.id,
          completedAt: new Date().toISOString()
        }
      };

      await updateUserProfile(user.id, profileData);
      setShowRoleAssignment(true);
      setCurrentStep(totalSteps);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeOnboarding = () => {
    toast.success(`Welcome to inrooms! You've been assigned the ${assignedRole?.name} role.`);
    navigate('/events');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Briefcase className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Your Professional Identity</h2>
              <p className="text-gray-600 mt-2">Let's start with the basics about your current role</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's your current job title? *
                </label>
                <input
                  type="text"
                  {...register('jobTitle')}
                  placeholder="e.g., Senior Sales Executive, Account Manager, VP of Sales"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.jobTitle && (
                  <p className="mt-1 text-sm text-red-600">{errors.jobTitle.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Which company do you work for? *
                </label>
                <input
                  type="text"
                  {...register('company')}
                  placeholder="e.g., Salesforce, Microsoft, Startup Inc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.company && (
                  <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    {...register('location')}
                    placeholder="e.g., San Francisco, CA"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    {...register('yearsExperience', { valueAsNumber: true })}
                    placeholder="e.g., 5"
                    min="0"
                    max="50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {errors.yearsExperience && (
                    <p className="mt-1 text-sm text-red-600">{errors.yearsExperience.message}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Phone className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Contact & Social Presence</h2>
              <p className="text-gray-600 mt-2">Help others connect with you (all optional but recommended)</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline w-4 h-4 mr-1" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="e.g., +1 (555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">Only visible to your connections</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="inline w-4 h-4 mr-1" />
                  Personal Website or Portfolio
                </label>
                <input
                  type="url"
                  {...register('website')}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.website && (
                  <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Linkedin className="inline w-4 h-4 mr-1" />
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  {...register('linkedin')}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.linkedin && (
                  <p className="mt-1 text-sm text-red-600">{errors.linkedin.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">We'll use this to enhance your profile and suggest connections</p>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Target className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Professional Background</h2>
              <p className="text-gray-600 mt-2">Tell us about your experience and work environment</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What's your experience level? *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'entry', label: 'Entry Level', desc: '0-2 years' },
                    { value: 'mid', label: 'Mid Level', desc: '3-5 years' },
                    { value: 'senior', label: 'Senior Level', desc: '6-10 years' },
                    { value: 'executive', label: 'Executive', desc: '10+ years' }
                  ].map((option) => (
                    <label key={option.value} className="relative">
                      <input
                        type="radio"
                        {...register('experienceLevel')}
                        value={option.value}
                        className="sr-only peer"
                      />
                      <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition-colors">
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.experienceLevel && (
                  <p className="mt-1 text-sm text-red-600">{errors.experienceLevel.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Which industry do you work in? *
                </label>
                <select
                  {...register('industry')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select your industry</option>
                  {INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
                {errors.industry && (
                  <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What's your company size? *
                </label>
                <div className="space-y-2">
                  {COMPANY_SIZES.map((size) => (
                    <label key={size.value} className="relative">
                      <input
                        type="radio"
                        {...register('companySize')}
                        value={size.value}
                        className="sr-only peer"
                      />
                      <div className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition-colors">
                        <span className="font-medium text-gray-900">{size.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.companySize && (
                  <p className="mt-1 text-sm text-red-600">{errors.companySize.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Previous Companies (Optional)
                </label>
                <input
                  type="text"
                  {...register('previousCompanies')}
                  placeholder="e.g., Google, Apple, Amazon (comma-separated)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">This helps us connect you with alumni from similar companies</p>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Star className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Skills & Expertise</h2>
              <p className="text-gray-600 mt-2">Showcase your professional capabilities</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What are your specializations? * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {SPECIALIZATIONS.map((spec) => (
                    <label key={spec} className="relative">
                      <input
                        type="checkbox"
                        value={spec}
                        {...register('specialization')}
                        className="sr-only peer"
                      />
                      <div className="p-3 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition-colors text-sm">
                        {spec}
                      </div>
                    </label>
                  ))}
                </div>
                {errors.specialization && (
                  <p className="mt-1 text-sm text-red-600">{errors.specialization.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What are your key skills? * (Select at least 3)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {SKILLS.map((skill) => (
                    <label key={skill} className="relative">
                      <input
                        type="checkbox"
                        value={skill}
                        {...register('skills')}
                        className="sr-only peer"
                      />
                      <div className="p-3 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition-colors text-sm">
                        {skill}
                      </div>
                    </label>
                  ))}
                </div>
                {errors.skills && (
                  <p className="mt-1 text-sm text-red-600">{errors.skills.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications & Achievements (Optional)
                </label>
                <textarea
                  {...register('certifications')}
                  rows={3}
                  placeholder="e.g., Salesforce Certified Administrator, HubSpot Sales Certification, President's Club Winner 2023"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">List any relevant certifications, awards, or achievements</p>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Target className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Goals & Motivations</h2>
              <p className="text-gray-600 mt-2">Help us understand what drives you</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What's your primary goal on inrooms? *
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'networking', label: 'Build professional network', icon: '🤝' },
                    { value: 'learning', label: 'Learn new sales techniques', icon: '📚' },
                    { value: 'career_growth', label: 'Advance my career', icon: '📈' },
                    { value: 'business_development', label: 'Find business opportunities', icon: '💼' },
                    { value: 'mentoring', label: 'Mentor others or find mentors', icon: '🎯' },
                    { value: 'job_search', label: 'Explore new job opportunities', icon: '🔍' }
                  ].map((option) => (
                    <label key={option.value} className="relative">
                      <input
                        type="radio"
                        {...register('primaryGoal')}
                        value={option.value}
                        className="sr-only peer"
                      />
                      <div className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition-colors">
                        <span className="text-xl mr-3">{option.icon}</span>
                        <span className="font-medium text-gray-900">{option.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.primaryGoal && (
                  <p className="mt-1 text-sm text-red-600">{errors.primaryGoal.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What are your career aspirations? *
                </label>
                <textarea
                  {...register('careerAspiration')}
                  rows={3}
                  placeholder="e.g., I want to become a VP of Sales at a high-growth SaaS company and build a world-class sales team..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.careerAspiration && (
                  <p className="mt-1 text-sm text-red-600">{errors.careerAspiration.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What challenges are you currently facing? * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {CHALLENGES.map((challenge) => (
                    <label key={challenge} className="relative">
                      <input
                        type="checkbox"
                        value={challenge}
                        {...register('challengesFacing')}
                        className="sr-only peer"
                      />
                      <div className="p-3 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition-colors text-sm">
                        {challenge}
                      </div>
                    </label>
                  ))}
                </div>
                {errors.challengesFacing && (
                  <p className="mt-1 text-sm text-red-600">{errors.challengesFacing.message}</p>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Users className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Networking & Communication</h2>
              <p className="text-gray-600 mt-2">Help us match you with the right people and events</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How would you describe your networking style? *
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'introvert', label: 'Introvert', desc: 'I prefer smaller groups and one-on-one conversations' },
                    { value: 'extrovert', label: 'Extrovert', desc: 'I thrive in large groups and enjoy meeting many people' },
                    { value: 'ambivert', label: 'Ambivert', desc: 'I adapt well to both small and large group settings' }
                  ].map((option) => (
                    <label key={option.value} className="relative">
                      <input
                        type="radio"
                        {...register('networkingStyle')}
                        value={option.value}
                        className="sr-only peer"
                      />
                      <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition-colors">
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.networkingStyle && (
                  <p className="mt-1 text-sm text-red-600">{errors.networkingStyle.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What's your communication preference? *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'direct', label: 'Direct', desc: 'Straight to the point' },
                    { value: 'collaborative', label: 'Collaborative', desc: 'Team-oriented approach' },
                    { value: 'analytical', label: 'Analytical', desc: 'Data-driven discussions' },
                    { value: 'creative', label: 'Creative', desc: 'Innovative thinking' }
                  ].map((option) => (
                    <label key={option.value} className="relative">
                      <input
                        type="radio"
                        {...register('communicationPreference')}
                        value={option.value}
                        className="sr-only peer"
                      />
                      <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition-colors">
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.communicationPreference && (
                  <p className="mt-1 text-sm text-red-600">{errors.communicationPreference.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Which topics interest you most? * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {INTERESTS.map((interest) => (
                    <label key={interest} className="relative">
                      <input
                        type="checkbox"
                        value={interest}
                        {...register('interests')}
                        className="sr-only peer"
                      />
                      <div className="p-3 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition-colors text-sm">
                        {interest}
                      </div>
                    </label>
                  ))}
                </div>
                {errors.interests && (
                  <p className="mt-1 text-sm text-red-600">{errors.interests.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What types of events do you prefer? * (Select all that apply)
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {EVENT_PREFERENCES.map((pref) => (
                    <label key={pref} className="relative">
                      <input
                        type="checkbox"
                        value={pref}
                        {...register('eventPreferences')}
                        className="sr-only peer"
                      />
                      <div className="p-3 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition-colors text-sm">
                        {pref}
                      </div>
                    </label>
                  ))}
                </div>
                {errors.eventPreferences && (
                  <p className="mt-1 text-sm text-red-600">{errors.eventPreferences.message}</p>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 7:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Star className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Personal Brand & Bio</h2>
              <p className="text-gray-600 mt-2">Tell your professional story</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Write a brief professional bio * (50+ characters)
                </label>
                <textarea
                  {...register('personalBio')}
                  rows={4}
                  placeholder="e.g., Experienced enterprise sales professional with 8+ years driving $10M+ in annual revenue. Passionate about building long-term client relationships and helping startups scale their sales operations. Expert in SaaS, CRM implementation, and team leadership..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.personalBio && (
                  <p className="mt-1 text-sm text-red-600">{errors.personalBio.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">This will be your main profile description</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notable Achievements (Optional)
                </label>
                <textarea
                  {...register('achievements')}
                  rows={3}
                  placeholder="e.g., Exceeded quota by 150% for 3 consecutive years, Built and led a team of 12 sales reps, Closed the largest deal in company history ($2.5M)..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">Highlight your biggest wins and accomplishments</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What makes you unique? * (20+ characters)
                </label>
                <textarea
                  {...register('uniqueValue')}
                  rows={3}
                  placeholder="e.g., I combine technical expertise with sales acumen to help complex B2B companies simplify their sales process and accelerate growth..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.uniqueValue && (
                  <p className="mt-1 text-sm text-red-600">{errors.uniqueValue.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">What's your unique value proposition or approach?</p>
              </div>
            </div>
          </motion.div>
        );

      case 8:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <MapPin className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Availability & Preferences</h2>
              <p className="text-gray-600 mt-2">Help us schedule the perfect events for you</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How active do you plan to be on inrooms? *
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'very_active', label: 'Very Active', desc: 'Multiple events per week, active networking' },
                    { value: 'moderately_active', label: 'Moderately Active', desc: '1-2 events per week, selective networking' },
                    { value: 'occasional', label: 'Occasional', desc: 'Few events per month, specific interests only' }
                  ].map((option) => (
                    <label key={option.value} className="relative">
                      <input
                        type="radio"
                        {...register('availability')}
                        value={option.value}
                        className="sr-only peer"
                      />
                      <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition-colors">
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.availability && (
                  <p className="mt-1 text-sm text-red-600">{errors.availability.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What's your time zone? *
                </label>
                <select
                  {...register('timeZone')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select your time zone</option>
                  {TIME_ZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
                {errors.timeZone && (
                  <p className="mt-1 text-sm text-red-600">{errors.timeZone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  When do you prefer to attend events? * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MEETING_TIMES.map((time) => (
                    <label key={time} className="relative">
                      <input
                        type="checkbox"
                        value={time}
                        {...register('preferredMeetingTimes')}
                        className="sr-only peer"
                      />
                      <div className="p-3 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-300 transition-colors text-sm">
                        {time}
                      </div>
                    </label>
                  ))}
                </div>
                {errors.preferredMeetingTimes && (
                  <p className="mt-1 text-sm text-red-600">{errors.preferredMeetingTimes.message}</p>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 9:
        return showRoleAssignment && assignedRole ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full"></div>
              </div>
              <div className="relative">
                <div className={`w-24 h-24 bg-gradient-to-r ${assignedRole.color} rounded-full flex items-center justify-center text-4xl mx-auto mb-6`}>
                  {assignedRole.icon}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {assignedRole.name}!</h2>
              <p className="text-lg text-gray-600 mb-6">{assignedRole.description}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your personalized features:</h3>
              <div className="grid grid-cols-1 gap-3">
                {assignedRole.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-left">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Button onClick={completeOnboarding} className="w-full text-lg py-4">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-sm text-gray-500">
                You can always update your preferences in your profile settings
              </p>
            </div>
          </motion.div>
        ) : null;

      default:
        return null;
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo />
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Welcome to inrooms!</h1>
          <p className="text-gray-600 mt-2">Let's build your professional profile</p>
        </div>

        {/* Progress Bar */}
        {currentStep < totalSteps && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Step {currentStep} of {totalSteps - 1}</span>
              <span>{Math.round((currentStep / (totalSteps - 1)) * 100)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>

            {/* Navigation Buttons */}
            {currentStep < totalSteps && !showRoleAssignment && (
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep === totalSteps - 1 ? (
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="flex items-center"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Complete Setup
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}