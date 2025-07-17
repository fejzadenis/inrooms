export const businessCourseModules = [
  {
    id: 'orientation',
    title: 'Orientation – What Are You Building?',
    description: 'Define your business idea, goals, and commitment level',
    order: 0,
    sections: [
      {
        type: 'welcome',
        title: 'Welcome to Start to Form: Your Business Formation Journey',
        content: 'This comprehensive course will guide you through the process of legally forming your business. By the end, you will have chosen the right business structure, filed your entity, and set up the essential foundations for long-term success.'
      },
      {
        type: 'section',
        title: 'Why Business Formation Matters',
        content: 'Properly forming your business is about more than just paperwork—it is about:',
        items: [
          {
            title: 'Legal Protection',
            description: 'Separating your personal and business assets'
          },
          {
            title: 'Tax Benefits',
            description: 'Optimizing your tax structure and deductions'
          },
          {
            title: 'Credibility',
            description: 'Building trust with customers, vendors, and partners'
          },
          {
            title: 'Growth Potential',
            description: 'Setting up structures that can scale with your business'
          }
        ]
      },
      {
        type: 'section',
        title: 'What You Will Accomplish',
        content: 'By the end of this course, you will have:',
        items: [
          {
            title: 'Chosen Your Entity Type',
            description: 'Selected the optimal business structure for your goals'
          },
          {
            title: 'Filed Your Formation Documents',
            description: 'Completed all necessary state filings'
          },
          {
            title: 'Obtained Your EIN',
            description: 'Secured your federal tax identification number'
          },
          {
            title: 'Set Up Banking',
            description: 'Opened a business bank account'
          },
          {
            title: 'Created Operating Documents',
            description: 'Drafted essential agreements and bylaws'
          }
        ]
      },
      {
        type: 'conclusion',
        title: 'Ready to Begin?',
        content: 'This journey will transform your business idea into a legally recognized entity.',
        cta: 'Let\'s start by understanding your business goals and selecting the right structure.'
      }
    ]
  },
  {
    id: 'entity-selection',
    title: 'Pick the Right Entity',
    description: 'Determine whether you need an LLC, C-Corp, S-Corp, or Sole Proprietorship',
    order: 1,
    sections: [
      {
        type: 'welcome',
        title: 'Choosing Your Business Structure: A Critical Decision',
        content: 'The legal structure you choose for your business will impact your taxes, personal liability, paperwork, ability to raise money, and more. This decision affects nearly every aspect of your business operations.'
      },
      {
        type: 'section',
        title: 'Common Business Structures',
        content: 'Here are the most popular business entity types and their key characteristics:',
        items: [
          {
            title: 'Sole Proprietorship',
            description: 'Simplest structure for single owners. No legal separation between you and the business.'
          },
          {
            title: 'Limited Liability Company (LLC)',
            description: 'Flexible structure combining liability protection with tax benefits.'
          },
          {
            title: 'C-Corporation',
            description: 'Traditional corporation structure, ideal for raising investment capital.'
          },
          {
            title: 'S-Corporation',
            description: 'Tax election that avoids double taxation while maintaining corporate benefits.'
          },
          {
            title: 'Partnership',
            description: 'Structure for businesses with multiple owners sharing profits and losses.'
          }
        ]
      },
      {
        type: 'section',
        title: 'Key Factors to Consider',
        content: 'When choosing your business structure, evaluate these important factors:',
        items: [
          {
            title: 'Liability Protection',
            description: 'How much personal asset protection do you need?'
          },
          {
            title: 'Tax Implications',
            description: 'What tax structure works best for your situation?'
          },
          {
            title: 'Ownership Structure',
            description: 'Will you have partners or investors?'
          },
          {
            title: 'Administrative Burden',
            description: 'How much paperwork and compliance can you handle?'
          },
          {
            title: 'Future Growth Plans',
            description: 'Do you plan to raise capital or sell the business?'
          }
        ]
      },
      {
        type: 'conclusion',
        title: 'Make an Informed Decision',
        content: 'Take the entity selection quiz to get a personalized recommendation based on your specific business needs.',
        cta: 'Complete the quiz below to discover which entity type is right for you.'
      }
    ],
    quiz: {
      title: 'Entity Selection Quiz',
      description: 'Answer these questions to get a personalized recommendation for your business structure.',
      questions: [
        {
          id: 'business-type',
          text: 'What type of business are you starting?',
          type: 'single',
          options: [
            {
              id: 'service',
              text: 'Service-based business (consulting, freelancing, etc.)',
              points: { llc: 3, cCorp: 1, sCorp: 2, soleProprietorship: 2, partnership: 1 }
            },
            {
              id: 'product',
              text: 'Product-based business (manufacturing, retail, etc.)',
              points: { llc: 2, cCorp: 3, sCorp: 2, soleProprietorship: 1, partnership: 1 }
            },
            {
              id: 'tech',
              text: 'Technology startup',
              points: { llc: 1, cCorp: 4, sCorp: 1, soleProprietorship: 0, partnership: 1 }
            },
            {
              id: 'real-estate',
              text: 'Real estate investment',
              points: { llc: 4, cCorp: 1, sCorp: 2, soleProprietorship: 1, partnership: 2 }
            }
          ]
        },
        {
          id: 'liability-concern',
          text: 'How concerned are you about personal liability?',
          type: 'single',
          options: [
            {
              id: 'very-concerned',
              text: 'Very concerned - I need maximum protection',
              points: { llc: 3, cCorp: 4, sCorp: 4, soleProprietorship: 0, partnership: 0 }
            },
            {
              id: 'somewhat-concerned',
              text: 'Somewhat concerned - I want some protection',
              points: { llc: 4, cCorp: 2, sCorp: 2, soleProprietorship: 1, partnership: 1 }
            },
            {
              id: 'not-concerned',
              text: 'Not very concerned - Low risk business',
              points: { llc: 1, cCorp: 1, sCorp: 1, soleProprietorship: 3, partnership: 2 }
            }
          ]
        },
        {
          id: 'ownership',
          text: 'How many owners will the business have?',
          type: 'single',
          options: [
            {
              id: 'just-me',
              text: 'Just me',
              points: { llc: 3, cCorp: 2, sCorp: 3, soleProprietorship: 4, partnership: 0 }
            },
            {
              id: 'two-to-five',
              text: '2-5 owners',
              points: { llc: 4, cCorp: 3, sCorp: 2, soleProprietorship: 0, partnership: 3 }
            },
            {
              id: 'more-than-five',
              text: 'More than 5 owners',
              points: { llc: 2, cCorp: 4, sCorp: 1, soleProprietorship: 0, partnership: 2 }
            }
          ]
        },
        {
          id: 'investment',
          text: 'Do you plan to raise investment capital?',
          type: 'single',
          options: [
            {
              id: 'yes-soon',
              text: 'Yes, within the next year',
              points: { llc: 1, cCorp: 4, sCorp: 1, soleProprietorship: 0, partnership: 1 }
            },
            {
              id: 'maybe-later',
              text: 'Maybe in the future',
              points: { llc: 2, cCorp: 3, sCorp: 2, soleProprietorship: 0, partnership: 1 }
            },
            {
              id: 'no',
              text: 'No, I plan to self-fund',
              points: { llc: 4, cCorp: 1, sCorp: 3, soleProprietorship: 3, partnership: 2 }
            }
          ]
        },
        {
          id: 'tax-preference',
          text: 'What is your tax preference?',
          type: 'single',
          options: [
            {
              id: 'pass-through',
              text: 'Pass-through taxation (profits/losses on personal return)',
              points: { llc: 4, cCorp: 0, sCorp: 4, soleProprietorship: 4, partnership: 4 }
            },
            {
              id: 'corporate',
              text: 'Corporate taxation (separate tax entity)',
              points: { llc: 1, cCorp: 4, sCorp: 0, soleProprietorship: 0, partnership: 0 }
            },
            {
              id: 'flexible',
              text: 'I want flexibility to choose',
              points: { llc: 4, cCorp: 2, sCorp: 2, soleProprietorship: 1, partnership: 2 }
            }
          ]
        }
      ]
    }
  },
  {
    id: 'business-foundation',
    title: 'Business Foundation Setup',
    description: 'Choose your business name, registered agent, and business address',
    order: 2,
    sections: [
      {
        type: 'welcome',
        title: 'Building Your Business Foundation',
        content: 'Before filing your entity, you need to establish the fundamental elements of your business identity and structure.'
      },
      {
        type: 'section',
        title: 'Choosing Your Business Name',
        content: 'Your business name is more than just a label—it\'s your brand identity and legal identifier:',
        items: [
          {
            title: 'Name Availability',
            description: 'Check that your desired name is available in your state'
          },
          {
            title: 'Entity Designator',
            description: 'Include required terms like "LLC" or "Corporation" in your name'
          },
          {
            title: 'Trademark Considerations',
            description: 'Ensure your name doesn\'t infringe on existing trademarks'
          },
          {
            title: 'Domain Availability',
            description: 'Check if the corresponding website domain is available'
          },
          {
            title: 'Future-Proofing',
            description: 'Choose a name that won\'t limit your business as it grows'
          }
        ]
      },
      {
        type: 'section',
        title: 'Registered Agent Requirements',
        content: 'Every business entity must have a registered agent to receive legal documents:',
        items: [
          {
            title: 'Legal Requirement',
            description: 'Required by law in all states for LLCs and corporations'
          },
          {
            title: 'Service of Process',
            description: 'Receives legal documents and official state correspondence'
          },
          {
            title: 'Business Hours Availability',
            description: 'Must be available during normal business hours'
          },
          {
            title: 'State Residency',
            description: 'Must have a physical address in your state of formation'
          },
          {
            title: 'Professional Service Option',
            description: 'You can serve as your own agent or hire a professional service'
          }
        ]
      },
      {
        type: 'section',
        title: 'Business Address Considerations',
        content: 'Your business address serves multiple important purposes:',
        items: [
          {
            title: 'Principal Business Address',
            description: 'The main location where your business operates'
          },
          {
            title: 'Mailing Address',
            description: 'Where you receive business correspondence and mail'
          },
          {
            title: 'Public Record',
            description: 'Address information becomes part of public business records'
          },
          {
            title: 'Home-Based Businesses',
            description: 'Consider privacy implications of using your home address'
          },
          {
            title: 'Virtual Office Options',
            description: 'Professional alternatives for businesses without physical locations'
          }
        ]
      },
      {
        type: 'conclusion',
        title: 'Foundation Elements Complete',
        content: 'With your business name, registered agent, and address decisions made, you\'re ready to move forward with the actual entity filing process.',
        cta: 'Next, we\'ll walk through the step-by-step filing process for your chosen entity type.'
      }
    ]
  },
  {
    id: 'entity-filing',
    title: 'File Your Entity',
    description: 'Complete the paperwork and file with your state',
    order: 3,
    sections: [
      {
        type: 'welcome',
        title: 'Filing Your Business Entity',
        content: 'Now it\'s time to make your business official by filing the necessary paperwork with your state government.'
      },
      {
        type: 'section',
        title: 'Required Filing Documents',
        content: 'The specific documents you need to file depend on your chosen entity type:',
        items: [
          {
            title: 'LLC - Articles of Organization',
            description: 'Basic formation document establishing your LLC with the state'
          },
          {
            title: 'Corporation - Articles of Incorporation',
            description: 'Formal document creating your corporation as a legal entity'
          },
          {
            title: 'Required Information',
            description: 'Business name, address, registered agent, and purpose'
          },
          {
            title: 'Filing Fees',
            description: 'State-specific fees ranging from $50 to $500+'
          },
          {
            title: 'Processing Time',
            description: 'Typically 1-3 weeks, with expedited options available'
          }
        ]
      },
      {
        type: 'section',
        title: 'State-Specific Requirements',
        content: 'Each state has its own filing requirements and procedures:',
        items: [
          {
            title: 'Online Filing Systems',
            description: 'Most states offer online filing through their Secretary of State website'
          },
          {
            title: 'Publication Requirements',
            description: 'Some states require publishing formation notices in newspapers'
          },
          {
            title: 'Initial Reports',
            description: 'Certain states require additional initial reports or statements'
          },
          {
            title: 'Expedited Processing',
            description: 'Fast-track options available for additional fees'
          },
          {
            title: 'Certificate of Good Standing',
            description: 'Official document proving your entity is properly filed'
          }
        ]
      },
      {
        type: 'section',
        title: 'Post-Filing Steps',
        content: 'After your entity is approved, complete these important next steps:',
        items: [
          {
            title: 'Obtain EIN',
            description: 'Apply for your federal Employer Identification Number with the IRS'
          },
          {
            title: 'Open Business Bank Account',
            description: 'Separate your business and personal finances'
          },
          {
            title: 'Create Operating Agreement',
            description: 'Draft internal governance documents for your entity'
          },
          {
            title: 'Obtain Business Licenses',
            description: 'Apply for any required industry or local business licenses'
          },
          {
            title: 'Set Up Accounting',
            description: 'Establish bookkeeping and accounting systems'
          }
        ]
      },
      {
        type: 'conclusion',
        title: 'Your Business is Now Official',
        content: 'Congratulations! Your business entity is now legally formed and recognized by your state.',
        cta: 'Next, we\'ll ensure you stay compliant with ongoing requirements and set up essential business systems.'
      }
    ]
  },
  {
    id: 'compliance-checklist',
    title: 'Compliance & Setup Checklist',
    description: 'Ensure ongoing compliance and set up essential business systems',
    order: 4,
    sections: [
      {
        type: 'welcome',
        title: 'Staying Compliant and Setting Up for Success',
        content: 'Forming your entity is just the beginning. Now you need to maintain compliance and set up the systems that will help your business thrive.'
      },
      {
        type: 'section',
        title: 'Ongoing Compliance Requirements',
        content: 'Keep your business in good standing with these ongoing obligations:',
        items: [
          {
            title: 'Annual Reports',
            description: 'File required annual or biennial reports with your state'
          },
          {
            title: 'Registered Agent Maintenance',
            description: 'Ensure your registered agent information stays current'
          },
          {
            title: 'Tax Filings',
            description: 'Meet federal, state, and local tax obligations'
          },
          {
            title: 'License Renewals',
            description: 'Keep all business licenses and permits current'
          },
          {
            title: 'Corporate Formalities',
            description: 'Maintain proper corporate records and hold required meetings'
          }
        ]
      },
      {
        type: 'section',
        title: 'Essential Business Systems',
        content: 'Set up these critical systems to operate your business effectively:',
        items: [
          {
            title: 'Business Banking',
            description: 'Separate business checking and savings accounts'
          },
          {
            title: 'Accounting System',
            description: 'Bookkeeping software or professional accounting services'
          },
          {
            title: 'Business Insurance',
            description: 'General liability, professional liability, and other relevant coverage'
          },
          {
            title: 'Contracts and Agreements',
            description: 'Customer agreements, vendor contracts, and employment documents'
          },
          {
            title: 'Intellectual Property',
            description: 'Trademark, copyright, and trade secret protections'
          }
        ]
      },
      {
        type: 'section',
        title: 'Financial and Tax Setup',
        content: 'Establish proper financial management and tax compliance:',
        items: [
          {
            title: 'Chart of Accounts',
            description: 'Organize your financial records with proper account categories'
          },
          {
            title: 'Tax Elections',
            description: 'Make any beneficial tax elections (like S-Corp status)'
          },
          {
            title: 'Quarterly Estimates',
            description: 'Set up estimated tax payments if required'
          },
          {
            title: 'Payroll System',
            description: 'If you have employees, establish payroll and benefits'
          },
          {
            title: 'Financial Controls',
            description: 'Implement checks and balances for financial management'
          }
        ]
      },
      {
        type: 'conclusion',
        title: 'Your Business Foundation is Complete',
        content: 'You\'ve successfully formed your business and set up the essential systems for ongoing success.',
        cta: 'Complete the final module to learn about next steps and advanced strategies for growing your business.'
      }
    ],
    checklist: {
      title: 'Post-Formation Compliance Checklist',
      items: [
        {
          id: 'ein-obtained',
          text: 'Obtain EIN from IRS',
          description: 'Apply for your federal tax ID number',
          required: true
        },
        {
          id: 'bank-account',
          text: 'Open business bank account',
          description: 'Separate business and personal finances',
          required: true
        },
        {
          id: 'operating-agreement',
          text: 'Create operating agreement or bylaws',
          description: 'Draft internal governance documents',
          required: true
        },
        {
          id: 'business-licenses',
          text: 'Obtain required business licenses',
          description: 'Apply for industry-specific licenses',
          required: false
        },
        {
          id: 'business-insurance',
          text: 'Purchase business insurance',
          description: 'Protect your business with appropriate coverage',
          required: false
        },
        {
          id: 'accounting-system',
          text: 'Set up accounting system',
          description: 'Implement bookkeeping and financial tracking',
          required: true
        }
      ]
    }
  },
  {
    id: 'next-steps',
    title: 'Next Steps & Advanced Strategies',
    description: 'Learn about advanced business strategies and ongoing growth',
    order: 5,
    sections: [
      {
        type: 'welcome',
        title: 'Congratulations on Forming Your Business!',
        content: 'You\'ve successfully completed the business formation process. Now let\'s explore what comes next and how to position your business for long-term success.'
      },
      {
        type: 'section',
        title: 'Immediate Next Steps',
        content: 'Focus on these priorities in your first 90 days of operation:',
        items: [
          {
            title: 'Finalize Business Setup',
            description: 'Complete any remaining setup tasks from your compliance checklist'
          },
          {
            title: 'Develop Your Brand',
            description: 'Create a professional brand identity and online presence'
          },
          {
            title: 'Launch Marketing Efforts',
            description: 'Begin attracting customers through marketing and networking'
          },
          {
            title: 'Establish Operations',
            description: 'Set up efficient processes for delivering your products or services'
          },
          {
            title: 'Build Your Team',
            description: 'Hire employees or contractors as your business grows'
          }
        ]
      },
      {
        type: 'section',
        title: 'Growth and Scaling Strategies',
        content: 'Position your business for sustainable growth and expansion:',
        items: [
          {
            title: 'Financial Management',
            description: 'Implement robust financial planning and cash flow management'
          },
          {
            title: 'Market Expansion',
            description: 'Explore new markets, products, or service offerings'
          },
          {
            title: 'Strategic Partnerships',
            description: 'Build relationships that can accelerate your growth'
          },
          {
            title: 'Technology Integration',
            description: 'Leverage technology to improve efficiency and scalability'
          },
          {
            title: 'Investment Readiness',
            description: 'Prepare your business for potential investment opportunities'
          }
        ]
      },
      {
        type: 'section',
        title: 'Advanced Business Considerations',
        content: 'As your business matures, consider these advanced strategies:',
        items: [
          {
            title: 'Entity Restructuring',
            description: 'Evaluate if your current structure still serves your needs'
          },
          {
            title: 'Tax Optimization',
            description: 'Work with professionals to minimize your tax burden legally'
          },
          {
            title: 'Exit Planning',
            description: 'Consider long-term exit strategies and succession planning'
          },
          {
            title: 'Risk Management',
            description: 'Implement comprehensive risk assessment and mitigation strategies'
          },
          {
            title: 'Compliance Monitoring',
            description: 'Stay current with changing regulations and requirements'
          }
        ]
      },
      {
        type: 'conclusion',
        title: 'Your Business Journey Continues',
        content: 'You\'ve built a solid foundation for your business. The journey of entrepreneurship is ongoing, filled with opportunities for growth, learning, and success.',
        cta: 'Continue your entrepreneurial education with our Growth Playbook course to learn advanced strategies for scaling your business.'
      }
    ]
  }
];

export const entityTypeInfo = {
  llc: {
    name: 'Limited Liability Company (LLC)',
    description: 'A flexible business structure that combines the liability protection of a corporation with the tax benefits and operational flexibility of a partnership.',
    bestFor: 'Small to medium-sized businesses, real estate investments, and businesses with multiple owners who want flexibility.',
    advantages: [
      'Limited personal liability protection',
      'Flexible tax options (can elect corporate taxation)',
      'Simple operational requirements',
      'Flexible profit and loss distribution',
      'No restrictions on number or type of owners'
    ],
    disadvantages: [
      'Self-employment taxes on all profits',
      'Limited life in some states',
      'Less established legal precedent than corporations',
      'May be harder to raise investment capital',
      'Varying state laws and requirements'
    ]
  },
  cCorp: {
    name: 'C-Corporation',
    description: 'A traditional corporation that is a separate legal entity from its owners, offering the strongest liability protection and ability to raise capital.',
    bestFor: 'Businesses planning to raise significant investment capital, go public, or have many shareholders.',
    advantages: [
      'Strongest liability protection',
      'Unlimited growth potential',
      'Easy to raise investment capital',
      'Perpetual existence',
      'Tax-deductible employee benefits'
    ],
    disadvantages: [
      'Double taxation on profits',
      'Complex operational requirements',
      'Extensive record-keeping requirements',
      'More expensive to maintain',
      'Strict formalities and governance rules'
    ]
  },
  sCorp: {
    name: 'S-Corporation',
    description: 'A tax election that allows corporations to pass income, losses, deductions, and credits through to shareholders for federal tax purposes.',
    bestFor: 'Profitable businesses with few owners who want to minimize self-employment taxes.',
    advantages: [
      'Pass-through taxation (no double taxation)',
      'Limited liability protection',
      'Potential self-employment tax savings',
      'Perpetual existence',
      'Enhanced credibility'
    ],
    disadvantages: [
      'Strict eligibility requirements',
      'Limited to 100 shareholders',
      'Only one class of stock allowed',
      'Must be U.S. citizens or residents',
      'Complex operational requirements'
    ]
  },
  soleProprietorship: {
    name: 'Sole Proprietorship',
    description: 'The simplest business structure where there is no legal distinction between the owner and the business.',
    bestFor: 'Single-owner businesses with low liability risk, freelancers, and consultants just starting out.',
    advantages: [
      'Simplest and least expensive to start',
      'Complete control over business decisions',
      'Direct tax benefits and losses',
      'Minimal regulatory requirements',
      'Easy to dissolve'
    ],
    disadvantages: [
      'Unlimited personal liability',
      'Difficult to raise capital',
      'Business ends when owner dies',
      'All income subject to self-employment tax',
      'Limited credibility with vendors and customers'
    ]
  },
  partnership: {
    name: 'Partnership',
    description: 'A business structure where two or more people share ownership, profits, and responsibilities.',
    bestFor: 'Businesses with multiple owners who want to share profits and losses directly.',
    advantages: [
      'Simple to establish and operate',
      'Pass-through taxation',
      'Shared financial burden',
      'Combined skills and resources',
      'Flexible profit sharing arrangements'
    ],
    disadvantages: [
      'Unlimited personal liability (in general partnerships)',
      'Joint responsibility for partner actions',
      'Potential for disputes between partners',
      'Difficult to transfer ownership',
      'Business may end if partner leaves'
    ]
  }
};

export const stateFilingInfo = {
  california: {
    llcFee: 70,
    corpFee: 100,
    processingTime: '15-20 business days',
    expeditedOption: true,
    expeditedFee: 350,
    expeditedTime: '24 hours',
    annualReportRequired: true,
    annualReportFee: 20,
    website: 'https://bizfileonline.sos.ca.gov/'
  },
  texas: {
    llcFee: 300,
    corpFee: 300,
    processingTime: '7-10 business days',
    expeditedOption: true,
    expeditedFee: 25,
    expeditedTime: '2-3 business days',
    annualReportRequired: false,
    annualReportFee: 0,
    website: 'https://www.sos.state.tx.us/corp/'
  },
  florida: {
    llcFee: 125,
    corpFee: 70,
    processingTime: '5-7 business days',
    expeditedOption: true,
    expeditedFee: 52.50,
    expeditedTime: '24 hours',
    annualReportRequired: true,
    annualReportFee: 138.75,
    website: 'https://dos.myflorida.com/sunbiz/'
  },
  newyork: {
    llcFee: 200,
    corpFee: 125,
    processingTime: '7-10 business days',
    expeditedOption: true,
    expeditedFee: 75,
    expeditedTime: '24 hours',
    annualReportRequired: false,
    annualReportFee: 0,
    website: 'https://www.dos.ny.gov/corps/'
  },
  delaware: {
    llcFee: 90,
    corpFee: 89,
    processingTime: '7-10 business days',
    expeditedOption: true,
    expeditedFee: 50,
    expeditedTime: '24 hours',
    annualReportRequired: true,
    annualReportFee: 300,
    website: 'https://corp.delaware.gov/'
  },
  nevada: {
    llcFee: 75,
    corpFee: 75,
    processingTime: '7-10 business days',
    expeditedOption: true,
    expeditedFee: 100,
    expeditedTime: '24 hours',
    annualReportRequired: true,
    annualReportFee: 150,
    website: 'https://www.nvsos.gov/sos/'
  }
};