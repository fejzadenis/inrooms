@@ .. @@
                <div className="space-y-6">
                  <div className="text-center">
                    <Briefcase className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
-                    <h2 className="text-2xl font-bold text-gray-900">Professional Background</h2>
-                    <p className="text-gray-600 mt-2">Help us understand your experience level and industry</p>
+                    <h2 className="text-2xl font-bold text-gray-900">Founder Background</h2>
+                    <p className="text-gray-600 mt-2">Help us understand your experience level and startup focus</p>
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
-                        <option value="Consulting">Consulting</option>
+                        <option value="AI/Machine Learning">AI/Machine Learning</option>
                        <option value="Education">Education</option>
-                        <option value="Real Estate">Real Estate</option>
+                        <option value="Blockchain/Web3">Blockchain/Web3</option>
+                        <option value="Climate Tech">Climate Tech</option>
                        <option value="Other">Other</option>
                      </select>
                      {step3Form.formState.errors.industry && (
                        <p className="text-red-600 text-sm mt-1">{step3Form.formState.errors.industry.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
-                        Company Size *
+                        Startup Stage *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        {[
-                          { value: 'startup', label: 'Startup', desc: '1-10' },
-                          { value: 'small', label: 'Small', desc: '11-50' },
-                          { value: 'medium', label: 'Medium', desc: '51-200' },
-                          { value: 'large', label: 'Large', desc: '201-1000' },
-                          { value: 'enterprise', label: 'Enterprise', desc: '1000+' }
+                          { value: 'startup', label: 'Idea Stage', desc: 'Pre-launch' },
+                          { value: 'small', label: 'MVP', desc: 'Early users' },
+                          { value: 'medium', label: 'Pre-seed', desc: 'Gaining traction' },
+                          { value: 'large', label: 'Seed', desc: 'Growing' },
+                          { value: 'enterprise', label: 'Series A+', desc: 'Scaling' }
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
-                        Previous Companies (Optional)
+                        Previous Startups (Optional)
                      </label>
                      <textarea
                        {...step3Form.register('previousCompanies')}
-                        placeholder="List notable previous companies or experiences..."
+                        placeholder="List notable previous startups or entrepreneurial experiences..."
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
-                    <h2 className="text-2xl font-bold text-gray-900">Skills & Expertise</h2>
-                    <p className="text-gray-600 mt-2">Showcase your professional capabilities</p>
+                    <h2 className="text-2xl font-bold text-gray-900">Skills & Expertise</h2>
+                    <p className="text-gray-600 mt-2">Showcase your founder capabilities</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Specializations * (Select all that apply)
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
-                          'Enterprise Sales', 'Inside Sales', 'Field Sales', 'Account Management',
-                          'Business Development', 'Customer Success', 'Sales Operations', 'Revenue Operations',
-                          'Technical Sales', 'Channel Sales', 'International Sales', 'Sales Leadership'
+                          'Product Development', 'UX/UI Design', 'Growth Marketing', 'Fundraising',
+                          'Business Development', 'Customer Success', 'Technical Leadership', 'Team Building',
+                          'Financial Planning', 'Pitch Development', 'Go-to-Market Strategy', 'Product-Market Fit'
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
-                        placeholder="e.g., Salesforce, Lead Generation, Negotiation, CRM, Cold Calling, Presentation Skills"
+                        placeholder="e.g., Product Strategy, User Research, Agile Development, Fundraising, Team Leadership, Growth Hacking"
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
-                          { value: 'career_growth', label: 'Career Growth', desc: 'Advance my career' },
-                          { value: 'business_development', label: 'Business Development', desc: 'Find new opportunities' },
+                          { value: 'career_growth', label: 'Startup Growth', desc: 'Scale my venture' },
+                          { value: 'business_development', label: 'Fundraising', desc: 'Connect with investors' },
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
-                        Career Aspirations *
+                        Startup Aspirations *
                      </label>
                      <textarea
                        {...step5Form.register('careerAspirations')}
-                        placeholder="Describe your career goals and where you see yourself in the next 2-3 years..."
+                        placeholder="Describe your startup goals and where you see your venture in the next 2-3 years..."
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
-                          'Finding qualified leads', 'Closing deals faster', 'Building stronger relationships',
-                          'Learning new technologies', 'Improving presentation skills', 'Time management',
-                          'Team collaboration', 'Market understanding', 'Competitive positioning', 'Scaling processes'
+                          'Finding product-market fit', 'Securing funding', 'Building the right team',
+                          'Technical development', 'User acquisition', 'Time management',
+                          'Team collaboration', 'Market understanding', 'Competitive positioning', 'Scaling operations'
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