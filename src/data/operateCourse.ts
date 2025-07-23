export const operateCourseModules = [
  {
    id: 'foundation-clarity-culture',
    title: 'Build a Foundation of Clarity & Culture',
    description: 'Establish your vision, mission, values, and operational blueprint',
    order: 0,
    sections: [
      {
        type: 'welcome',
        title: 'Welcome to Operate to Thrive: Running a Resilient Business',
        content: 'This comprehensive course will guide you through building and operating a resilient business that can thrive in any environment. You\'ll learn to create strong foundations, manage finances effectively, master customer relationships, lead teams, implement scalable systems, and prepare for long-term success.'
      },
      {
        type: 'section',
        title: 'Vision, Mission & Core Values',
        content: 'Building a resilient business starts with clarity about who you are and where you\'re going:',
        items: [
          {
            title: 'Define Your North Star',
            description: 'Create a compelling vision that guides all strategic decisions and inspires your team'
          },
          {
            title: 'Craft Your Mission Statement',
            description: 'Articulate your purpose and the value you bring to customers and stakeholders'
          },
          {
            title: 'Establish Core Values',
            description: 'Identify the fundamental beliefs that will guide behavior and decision-making'
          },
          {
            title: 'Translate Values into Daily Behaviors',
            description: 'Create specific, observable behaviors that demonstrate your values in action'
          },
          {
            title: 'Embed Culture in Operations',
            description: 'Integrate your values into hiring, feedback, performance reviews, and daily rituals'
          }
        ]
      },
      {
        type: 'section',
        title: 'Operational Blueprint',
        content: 'Create a clear map of how your business operates and delivers value:',
        items: [
          {
            title: 'Map Key Processes',
            description: 'Document your customer acquisition, product delivery, and support processes'
          },
          {
            title: 'Document Workflows',
            description: 'Create step-by-step procedures and assign clear ownership for each process'
          },
          {
            title: 'Identify Process Gaps',
            description: 'Find bottlenecks, inefficiencies, and areas where processes break down'
          },
          {
            title: 'Prioritize Improvements',
            description: 'Focus on the highest-impact process improvements that will drive results'
          },
          {
            title: 'Create Accountability Systems',
            description: 'Establish metrics and review cycles to ensure processes are followed and improved'
          }
        ]
      },
      {
        type: 'conclusion',
        title: 'Building Your Foundation',
        content: 'With clear vision, values, and operational processes in place, you\'re ready to build the financial discipline needed for sustainable growth.',
        cta: 'Next, we\'ll dive into financial health and forecasting to ensure your business remains profitable and cash-flow positive.'
      }
    ],
    tools: [
      {
        id: 'vision-mission-template',
        title: 'Vision & Mission Template',
        description: 'Framework for crafting compelling vision and mission statements',
        type: 'template'
      },
      {
        id: 'values-definition-worksheet',
        title: 'Core Values Definition Worksheet',
        description: 'Guide to identifying and defining your company\'s core values',
        type: 'template'
      },
      {
        id: 'process-mapping-tool',
        title: 'Process Mapping Tool',
        description: 'Visual tool for documenting and analyzing business processes',
        type: 'template'
      }
    ]
  },
  {
    id: 'financial-health-forecasting',
    title: 'Financial Health & Forecasting',
    description: 'Master profit-centric thinking, cash flow management, and funding strategies',
    order: 1,
    sections: [
      {
        type: 'welcome',
        title: 'Building Financial Resilience',
        content: 'Financial health is the backbone of business resilience. This module will teach you to think profit-first, manage cash flow effectively, and make strategic funding decisions that support long-term growth.'
      },
      {
        type: 'section',
        title: 'Profit-Centric Mindset',
        content: 'Develop a deep understanding of your business economics and profitability:',
        items: [
          {
            title: 'Understand Cost Structure',
            description: 'Break down fixed costs, variable costs, and their impact on profitability'
          },
          {
            title: 'Calculate Profit Margins',
            description: 'Learn to measure gross margin, operating margin, and net profit margin'
          },
          {
            title: 'Create Operating Statements',
            description: 'Build simple P&L statements that provide clear visibility into performance'
          },
          {
            title: 'Break-Even Analysis',
            description: 'Determine the minimum revenue needed to cover all costs and achieve profitability'
          },
          {
            title: 'Unit Economics',
            description: 'Understand the profitability of individual customers, products, or transactions'
          }
        ]
      },
      {
        type: 'section',
        title: 'Cash Flow Management',
        content: 'Master the art of cash flow forecasting and working capital management:',
        items: [
          {
            title: 'Revenue Forecasting',
            description: 'Model future revenue based on historical data, pipeline, and market trends'
          },
          {
            title: 'Expense Planning',
            description: 'Project operating expenses, capital expenditures, and seasonal variations'
          },
          {
            title: 'Runway Calculation',
            description: 'Determine how long your current cash will last and when you need additional funding'
          },
          {
            title: 'Manage Receivables',
            description: 'Optimize payment terms, collections processes, and customer payment behavior'
          },
          {
            title: 'Working Capital Optimization',
            description: 'Balance inventory, payables, and receivables to maximize cash efficiency'
          }
        ]
      },
      {
        type: 'section',
        title: 'Funding Options & Capital Strategy',
        content: 'Explore funding alternatives and develop a strategic approach to capital:',
        items: [
          {
            title: 'Bootstrap vs. External Funding',
            description: 'Evaluate the pros and cons of self-funding versus seeking external capital'
          },
          {
            title: 'Debt Financing Options',
            description: 'Understand loans, lines of credit, and alternative lending options'
          },
          {
            title: 'Grant Opportunities',
            description: 'Identify and apply for government and private grants for your industry'
          },
          {
            title: 'Equity Funding Preparation',
            description: 'Prepare for angel investors, VCs, and equity crowdfunding'
          },
          {
            title: 'Financial Discipline',
            description: 'Maintain strong financial controls and reporting as you scale'
          }
        ]
      },
      {
        type: 'conclusion',
        title: 'Financial Foundation Complete',
        content: 'With strong financial management and forecasting capabilities, you\'re ready to focus on optimizing your customer relationships and lifecycle.',
        cta: 'Next, we\'ll explore customer lifecycle mastery to maximize retention and lifetime value.'
      }
    ],
    tools: [
      {
        id: 'cash-flow-model',
        title: 'Cash Flow Forecasting Model',
        description: 'Excel template for 12-month cash flow projections',
        type: 'calculator'
      },
      {
        id: 'unit-economics-calculator',
        title: 'Unit Economics Calculator',
        description: 'Tool to calculate customer acquisition cost and lifetime value',
        type: 'calculator'
      },
      {
        id: 'funding-readiness-checklist',
        title: 'Funding Readiness Checklist',
        description: 'Comprehensive checklist for preparing to raise capital',
        type: 'template'
      }
    ]
  },
  {
    id: 'customer-lifecycle-mastery',
    title: 'Customer Lifecycle Mastery',
    description: 'Optimize onboarding, retention, and customer lifetime value',
    order: 2,
    sections: [
      {
        type: 'welcome',
        title: 'Mastering the Customer Journey',
        content: 'Your customers are the lifeblood of your business. This module will teach you to create exceptional customer experiences, maximize retention, and build systems for continuous improvement based on customer feedback.'
      },
      {
        type: 'section',
        title: 'Customer Onboarding & Success',
        content: 'Create seamless experiences that set customers up for long-term success:',
        items: [
          {
            title: 'Design Onboarding Flows',
            description: 'Create step-by-step processes that help customers achieve early wins quickly'
          },
          {
            title: 'Set Success Milestones',
            description: 'Define clear markers of customer progress and value realization'
          },
          {
            title: 'Proactive Support Systems',
            description: 'Anticipate customer needs and provide help before they ask for it'
          },
          {
            title: 'Relationship Building',
            description: 'Develop personal connections and trust with key customer stakeholders'
          },
          {
            title: 'Success Metrics Tracking',
            description: 'Monitor customer health scores, usage patterns, and satisfaction levels'
          }
        ]
      },
      {
        type: 'section',
        title: 'Retention & LTV Optimization',
        content: 'Maximize customer lifetime value through strategic retention initiatives:',
        items: [
          {
            title: 'Churn Signal Detection',
            description: 'Identify early warning signs that customers may be at risk of leaving'
          },
          {
            title: 'Retention Campaigns',
            description: 'Develop targeted campaigns to re-engage at-risk customers'
          },
          {
            title: 'Upselling Strategies',
            description: 'Identify opportunities to expand customer accounts with additional products or services'
          },
          {
            title: 'Cross-Selling Programs',
            description: 'Introduce complementary products that add value to existing customers'
          },
          {
            title: 'Loyalty Programs',
            description: 'Create incentives that reward long-term customers and encourage repeat business'
          }
        ]
      },
      {
        type: 'section',
        title: 'Customer Feedback & Continuous Learning',
        content: 'Build systems to capture, analyze, and act on customer insights:',
        items: [
          {
            title: 'Feedback Collection Systems',
            description: 'Implement surveys, interviews, and analytics to gather customer insights'
          },
          {
            title: 'Voice of Customer Programs',
            description: 'Create formal processes to capture and analyze customer feedback'
          },
          {
            title: 'Product Iteration Cycles',
            description: 'Use customer feedback to guide product development and improvements'
          },
          {
            title: 'Pricing Optimization',
            description: 'Test and refine pricing based on customer value perception and willingness to pay'
          },
          {
            title: 'Service Enhancement',
            description: 'Continuously improve service delivery based on customer needs and preferences'
          }
        ]
      },
      {
        type: 'conclusion',
        title: 'Customer-Centric Operations',
        content: 'With optimized customer lifecycle management, you\'re ready to build the leadership and team capabilities needed to scale your operations.',
        cta: 'Next, we\'ll focus on team and leadership evolution to support your growing business.'
      }
    ],
    tools: [
      {
        id: 'customer-journey-mapper',
        title: 'Customer Journey Mapping Tool',
        description: 'Visual tool to map and optimize the customer experience',
        type: 'template'
      },
      {
        id: 'churn-prediction-model',
        title: 'Churn Prediction Model',
        description: 'Framework to identify customers at risk of churning',
        type: 'calculator'
      },
      {
        id: 'feedback-collection-toolkit',
        title: 'Customer Feedback Collection Toolkit',
        description: 'Templates for surveys, interviews, and feedback analysis',
        type: 'template'
      }
    ]
  },
  {
    id: 'team-leadership-evolution',
    title: 'Team & Leadership Evolution',
    description: 'Transition from operator to leader and build high-performing teams',
    order: 3,
    sections: [
      {
        type: 'welcome',
        title: 'Evolving Your Leadership',
        content: 'As your business grows, your role must evolve from doing everything yourself to leading others who execute. This module will guide you through the transition to effective leadership and team building.'
      },
      {
        type: 'section',
        title: 'Stepping Into Leadership',
        content: 'Make the critical transition from founder/operator to CEO and leader:',
        items: [
          {
            title: 'Leadership Mindset Shift',
            description: 'Move from doing the work to enabling others to do great work'
          },
          {
            title: 'Delegation Frameworks',
            description: 'Learn when, what, and how to delegate effectively without losing quality'
          },
          {
            title: 'Empowerment Strategies',
            description: 'Give team members authority and autonomy while maintaining accountability'
          },
          {
            title: 'Trust Building',
            description: 'Develop trust with your team through consistency, transparency, and support'
          },
          {
            title: 'Strategic Thinking',
            description: 'Focus your time on high-level strategy rather than day-to-day operations'
          }
        ]
      },
      {
        type: 'section',
        title: 'Hiring and Onboarding',
        content: 'Build a systematic approach to attracting, selecting, and integrating new team members:',
        items: [
          {
            title: 'Values-Based Job Descriptions',
            description: 'Create role descriptions that attract candidates who align with your culture'
          },
          {
            title: 'Structured Interview Process',
            description: 'Develop consistent interview frameworks that assess both skills and cultural fit'
          },
          {
            title: 'Reference and Background Checks',
            description: 'Implement thorough vetting processes to make informed hiring decisions'
          },
          {
            title: 'Onboarding Checklists',
            description: 'Create comprehensive onboarding programs that set new hires up for success'
          },
          {
            title: 'Early Performance Reviews',
            description: 'Establish 30-60-90 day check-ins to ensure new hires are progressing well'
          }
        ]
      },
      {
        type: 'section',
        title: 'Ongoing Culture & Performance',
        content: 'Maintain and strengthen your culture while driving high performance:',
        items: [
          {
            title: 'Regular One-on-Ones',
            description: 'Conduct meaningful individual meetings that support growth and address challenges'
          },
          {
            title: 'Team Meeting Rhythms',
            description: 'Establish productive team meetings that align efforts and solve problems'
          },
          {
            title: 'Performance Frameworks',
            description: 'Create clear expectations, goals, and measurement systems for all roles'
          },
          {
            title: 'Recognition Programs',
            description: 'Implement systems to acknowledge and reward great work and cultural contributions'
          },
          {
            title: 'Course Correction',
            description: 'Address performance issues quickly and fairly with clear improvement plans'
          }
        ]
      },
      {
        type: 'conclusion',
        title: 'Leadership Foundation Built',
        content: 'With strong leadership skills and team management systems in place, you\'re ready to implement the scalable systems and technology needed to support growth.',
        cta: 'Next, we\'ll explore scalable systems and technology to automate and optimize your operations.'
      }
    ],
    tools: [
      {
        id: 'hiring-scorecard',
        title: 'Hiring Scorecard Template',
        description: 'Structured framework for evaluating candidates consistently',
        type: 'template'
      },
      {
        id: 'onboarding-checklist',
        title: 'Employee Onboarding Checklist',
        description: 'Comprehensive checklist for new employee integration',
        type: 'template'
      },
      {
        id: 'performance-review-template',
        title: 'Performance Review Template',
        description: 'Framework for conducting effective performance evaluations',
        type: 'template'
      }
    ]
  },
  {
    id: 'scalable-systems-tech',
    title: 'Scalable Systems & Tech',
    description: 'Implement automation, analytics, and security for sustainable growth',
    order: 4,
    sections: [
      {
        type: 'welcome',
        title: 'Building Scalable Infrastructure',
        content: 'As your business grows, manual processes become bottlenecks. This module will help you identify automation opportunities, implement data-driven decision making, and ensure your business is secure and compliant.'
      },
      {
        type: 'section',
        title: 'Operations & Automation',
        content: 'Identify and automate repetitive tasks to free up time for strategic work:',
        items: [
          {
            title: 'Process Automation Audit',
            description: 'Identify repetitive, time-consuming tasks that are prime candidates for automation'
          },
          {
            title: 'Tool Evaluation Framework',
            description: 'Assess automation tools based on cost, complexity, and impact on your operations'
          },
          {
            title: 'Integration Strategy',
            description: 'Connect your tools and systems to create seamless workflows'
          },
          {
            title: 'Workflow Optimization',
            description: 'Redesign processes to take advantage of automation capabilities'
          },
          {
            title: 'ROI Measurement',
            description: 'Track the time and cost savings from automation investments'
          }
        ]
      },
      {
        type: 'section',
        title: 'Data & Analytics Infrastructure',
        content: 'Build systems to collect, analyze, and act on business data:',
        items: [
          {
            title: 'Key Metrics Identification',
            description: 'Define the most important metrics for tracking business health and performance'
          },
          {
            title: 'Dashboard Creation',
            description: 'Build visual dashboards that provide real-time insights into business performance'
          },
          {
            title: 'Data Collection Systems',
            description: 'Implement tools and processes to capture relevant business data automatically'
          },
          {
            title: 'Analytics and Reporting',
            description: 'Create regular reports that inform strategic and operational decisions'
          },
          {
            title: 'Data-Driven Culture',
            description: 'Train your team to use data in their daily decision-making processes'
          }
        ]
      },
      {
        type: 'section',
        title: 'Security, Compliance & Risk Mitigation',
        content: 'Protect your business with proper security measures and compliance frameworks:',
        items: [
          {
            title: 'Legal and Regulatory Compliance',
            description: 'Stay current with industry regulations and legal requirements'
          },
          {
            title: 'Data Security Measures',
            description: 'Implement cybersecurity best practices to protect customer and business data'
          },
          {
            title: 'Privacy Policies',
            description: 'Create comprehensive privacy policies that comply with data protection laws'
          },
          {
            title: 'Disaster Recovery Planning',
            description: 'Develop plans to recover from data loss, system failures, and other disasters'
          },
          {
            title: 'Risk Assessment',
            description: 'Regularly evaluate and mitigate operational, financial, and strategic risks'
          }
        ]
      },
      {
        type: 'conclusion',
        title: 'Systems Ready for Scale',
        content: 'With scalable systems, automation, and security measures in place, you\'re prepared to build resilience and adaptability into your business operations.',
        cta: 'Next, we\'ll develop your resilience and adaptation playbook for navigating uncertainty and change.'
      }
    ],
    tools: [
      {
        id: 'automation-assessment',
        title: 'Automation Opportunity Assessment',
        description: 'Framework to identify and prioritize automation opportunities',
        type: 'template'
      },
      {
        id: 'metrics-dashboard-template',
        title: 'Business Metrics Dashboard',
        description: 'Template for creating comprehensive business performance dashboards',
        type: 'template'
      },
      {
        id: 'security-checklist',
        title: 'Business Security Checklist',
        description: 'Comprehensive checklist for implementing business security measures',
        type: 'template'
      }
    ]
  },
  {
    id: 'resilience-adaptation-playbook',
    title: 'Resilience & Adaptation Playbook',
    description: 'Build systems to detect signals, manage crises, and adapt to change',
    order: 5,
    sections: [
      {
        type: 'welcome',
        title: 'Building Business Resilience',
        content: 'Resilient businesses don\'t just survive challenges—they thrive through them. This module will teach you to read early warning signals, prepare for crises, and build adaptability into your business model.'
      },
      {
        type: 'section',
        title: 'Reading Signals & Early Warning',
        content: 'Develop systems to detect changes and challenges before they become crises:',
        items: [
          {
            title: 'Market Indicators',
            description: 'Monitor industry trends, competitor actions, and market shifts that could impact your business'
          },
          {
            title: 'Financial Warning Signs',
            description: 'Track cash flow, profitability, and financial ratios that signal potential problems'
          },
          {
            title: 'Customer Health Signals',
            description: 'Monitor customer satisfaction, usage patterns, and feedback for early warning signs'
          },
          {
            title: 'Team and Culture Indicators',
            description: 'Watch for signs of employee disengagement, turnover, or cultural drift'
          },
          {
            title: 'Monthly and Quarterly Health Checks',
            description: 'Establish regular review cycles to assess business health across all dimensions'
          }
        ]
      },
      {
        type: 'section',
        title: 'Crisis & Continuity Planning',
        content: 'Prepare for various types of disruptions and create plans to maintain operations:',
        items: [
          {
            title: 'Risk Identification',
            description: 'Catalog potential risks including supply chain, economic, technology, and talent disruptions'
          },
          {
            title: 'Impact Assessment',
            description: 'Evaluate the potential impact and likelihood of different risk scenarios'
          },
          {
            title: 'Continuity Playbooks',
            description: 'Create step-by-step plans for maintaining operations during various types of crises'
          },
          {
            title: 'Communication Plans',
            description: 'Develop clear communication strategies for customers, employees, and stakeholders during crises'
          },
          {
            title: 'Recovery Procedures',
            description: 'Plan how to restore normal operations and learn from crisis experiences'
          }
        ]
      },
      {
        type: 'section',
        title: 'Pivoting & Innovation',
        content: 'Build capabilities to adapt your business model and explore new opportunities:',
        items: [
          {
            title: 'Opportunity Recognition',
            description: 'Develop skills to identify new market opportunities and business model innovations'
          },
          {
            title: 'Resource-Light Experimentation',
            description: 'Test new ideas quickly and cheaply before making major investments'
          },
          {
            title: 'Validation Frameworks',
            description: 'Use customer feedback and market data to validate new opportunities'
          },
          {
            title: 'Pivot Decision Making',
            description: 'Know when to persist with current strategy versus when to pivot to new opportunities'
          },
          {
            title: 'Innovation Culture',
            description: 'Foster a culture that embraces experimentation and learning from failure'
          }
        ]
      },
      {
        type: 'conclusion',
        title: 'Resilience Built In',
        content: 'With strong resilience and adaptation capabilities, you\'re ready to plan for the next chapter of your business journey.',
        cta: 'Finally, we\'ll focus on strategic planning and preparing for your business\'s next phase of growth.'
      }
    ],
    tools: [
      {
        id: 'risk-assessment-matrix',
        title: 'Business Risk Assessment Matrix',
        description: 'Framework for identifying and evaluating business risks',
        type: 'template'
      },
      {
        id: 'crisis-response-playbook',
        title: 'Crisis Response Playbook Template',
        description: 'Template for creating crisis management and response plans',
        type: 'template'
      },
      {
        id: 'pivot-decision-framework',
        title: 'Pivot Decision Framework',
        description: 'Tool to help decide when and how to pivot your business strategy',
        type: 'template'
      }
    ]
  },
  {
    id: 'planning-next-chapter',
    title: 'Planning for the Next Chapter',
    description: 'Strategic planning, exit preparation, and continuous improvement cycles',
    order: 6,
    sections: [
      {
        type: 'welcome',
        title: 'Planning Your Business Future',
        content: 'Every successful business must plan for its next chapter. This final module will help you create strategic plans, prepare for potential exits or scale-up opportunities, and establish cycles of continuous improvement.'
      },
      {
        type: 'section',
        title: 'Annual & Quarterly Strategic Planning',
        content: 'Create structured planning processes that align your team and drive results:',
        items: [
          {
            title: 'Vision Alignment',
            description: 'Ensure your strategic plans support your long-term vision and mission'
          },
          {
            title: 'OKR Framework Implementation',
            description: 'Set objectives and key results that cascade from company to individual level'
          },
          {
            title: 'Team Planning Sessions',
            description: 'Facilitate collaborative planning sessions that engage your entire team'
          },
          {
            title: 'Roadmap Creation',
            description: 'Develop clear roadmaps that show how you\'ll achieve your strategic objectives'
          },
          {
            title: 'Progress Tracking',
            description: 'Establish regular review cycles to monitor progress and adjust plans as needed'
          }
        ]
      },
      {
        type: 'section',
        title: 'Preparing for Exit or Scale-Up',
        content: 'Position your business for potential acquisition, leadership transition, or public offering:',
        items: [
          {
            title: 'Technical Readiness',
            description: 'Ensure your systems, processes, and documentation meet institutional standards'
          },
          {
            title: 'Governance Structure',
            description: 'Implement proper board governance, financial controls, and legal compliance'
          },
          {
            title: 'Cultural Documentation',
            description: 'Codify your culture, values, and practices so they can survive leadership transitions'
          },
          {
            title: 'Financial Preparation',
            description: 'Maintain clean financial records and demonstrate consistent profitability'
          },
          {
            title: 'Exit Options Analysis',
            description: 'Understand different exit strategies including acquisition, management buyout, and IPO'
          }
        ]
      },
      {
        type: 'section',
        title: 'Celebrate & Reset',
        content: 'Create cycles of reflection, celebration, and continuous improvement:',
        items: [
          {
            title: 'End-of-Year Reflections',
            description: 'Conduct comprehensive reviews of achievements, challenges, and lessons learned'
          },
          {
            title: 'Team Celebration Rituals',
            description: 'Recognize accomplishments and build team morale through meaningful celebrations'
          },
          {
            title: 'Learning Integration',
            description: 'Capture and apply insights from the past year to improve future performance'
          },
          {
            title: 'Goal Setting for Next Cycle',
            description: 'Use reflection insights to set ambitious but achievable goals for the coming year'
          },
          {
            title: 'Continuous Improvement Culture',
            description: 'Embed learning and improvement into your regular business rhythms'
          }
        ]
      },
      {
        type: 'conclusion',
        title: 'Your Resilient Business Journey',
        content: 'Congratulations! You now have a comprehensive framework for operating a resilient business that can thrive in any environment. Remember that building resilience is an ongoing journey of learning, adapting, and growing.',
        cta: 'Complete the final assessment to receive your Business Operations Expert badge and continue your entrepreneurial journey.'
      }
    ],
    tools: [
      {
        id: 'strategic-planning-template',
        title: 'Annual Strategic Planning Template',
        description: 'Comprehensive template for annual and quarterly strategic planning',
        type: 'template'
      },
      {
        id: 'okr-framework',
        title: 'OKR Framework Template',
        description: 'Template for implementing objectives and key results',
        type: 'template'
      },
      {
        id: 'exit-readiness-checklist',
        title: 'Exit Readiness Checklist',
        description: 'Comprehensive checklist for preparing your business for exit opportunities',
        type: 'template'
      }
    ]
  }
];

export const operateStrategyInfo = {
  foundationFirst: {
    name: 'Foundation-First Strategy',
    description: 'A strategy that prioritizes building strong organizational foundations before pursuing aggressive growth.',
    bestFor: 'Early-stage businesses, companies experiencing rapid growth, and organizations with cultural or operational challenges.',
    keyPrinciples: [
      'Vision and values clarity',
      'Process documentation',
      'Cultural development',
      'Financial discipline',
      'Quality over quantity'
    ]
  },
  customerCentric: {
    name: 'Customer-Centric Strategy',
    description: 'A strategy that puts customer success and satisfaction at the center of all business decisions.',
    bestFor: 'Service businesses, SaaS companies, and businesses with high customer lifetime value.',
    keyPrinciples: [
      'Customer success focus',
      'Feedback-driven development',
      'Retention optimization',
      'Lifetime value maximization',
      'Experience excellence'
    ]
  },
  systemsLed: {
    name: 'Systems-Led Strategy',
    description: 'A strategy that emphasizes automation, data-driven decisions, and scalable processes.',
    bestFor: 'Technology companies, businesses with repetitive processes, and companies preparing for rapid scale.',
    keyPrinciples: [
      'Process automation',
      'Data-driven decisions',
      'Scalable systems',
      'Efficiency optimization',
      'Technology leverage'
    ]
  },
  resilienceFocused: {
    name: 'Resilience-Focused Strategy',
    description: 'A strategy that prioritizes adaptability, risk management, and long-term sustainability.',
    bestFor: 'Businesses in volatile markets, companies with complex supply chains, and organizations facing uncertainty.',
    keyPrinciples: [
      'Risk management',
      'Adaptability',
      'Diversification',
      'Scenario planning',
      'Crisis preparedness'
    ]
  }
};

export const operateStrategyRecommendationInfo = {
  foundationFirst: {
    description: 'Based on your responses, a Foundation-First Strategy appears to be the best fit for your business. This approach focuses on building strong organizational foundations before pursuing aggressive growth.',
    keyTactics: [
      'Establish clear vision, mission, and values that guide all decisions',
      'Document and optimize core business processes',
      'Build a strong company culture through hiring and daily practices',
      'Implement financial discipline and profit-centric thinking',
      'Focus on sustainable growth rather than growth at all costs'
    ],
    resources: [
      'Good to Great by Jim Collins',
      'The E-Myth Revisited by Michael Gerber',
      'Scaling Up by Verne Harnish',
      'The Culture Code by Daniel Coyle'
    ],
    nextSteps: [
      'Define your company\'s core values and translate them into daily behaviors',
      'Document your key business processes and identify improvement opportunities',
      'Implement regular financial review cycles and profit tracking',
      'Create hiring processes that prioritize cultural fit alongside skills',
      'Establish team rituals and practices that reinforce your values'
    ]
  },
  customerCentric: {
    description: 'Based on your responses, a Customer-Centric Strategy appears to be the best fit for your business. This approach puts customer success and satisfaction at the center of all business decisions.',
    keyTactics: [
      'Design exceptional onboarding experiences that drive early customer success',
      'Implement proactive customer success and support programs',
      'Create systematic feedback collection and analysis processes',
      'Develop retention and loyalty programs that maximize lifetime value',
      'Build customer advisory boards and co-creation opportunities'
    ],
    resources: [
      'The Customer Success Economy by Nick Mehta',
      'Customer Success by Lincoln Murphy',
      'The Effortless Experience by Matthew Dixon',
      'Outside In by Harley Manning'
    ],
    nextSteps: [
      'Map your complete customer journey and identify friction points',
      'Implement customer health scoring and early warning systems',
      'Create systematic processes for collecting and acting on customer feedback',
      'Develop upselling and cross-selling programs based on customer success',
      'Build customer advisory programs to guide product development'
    ]
  },
  systemsLed: {
    description: 'Based on your responses, a Systems-Led Strategy appears to be the best fit for your business. This approach emphasizes automation, data-driven decisions, and scalable processes.',
    keyTactics: [
      'Audit all business processes and identify automation opportunities',
      'Implement data collection and analytics systems across all functions',
      'Create dashboards and reporting systems for real-time business insights',
      'Build scalable technology infrastructure that can support growth',
      'Establish data-driven decision-making processes throughout the organization'
    ],
    resources: [
      'The Lean Startup by Eric Ries',
      'Measure What Matters by John Doerr',
      'The Phoenix Project by Gene Kim',
      'Automate This by Christopher Steiner'
    ],
    nextSteps: [
      'Conduct a comprehensive process automation audit',
      'Implement business intelligence and analytics tools',
      'Create standardized operating procedures for all key processes',
      'Build integration between your key business systems',
      'Train your team on data analysis and data-driven decision making'
    ]
  },
  resilienceFocused: {
    description: 'Based on your responses, a Resilience-Focused Strategy appears to be the best fit for your business. This approach prioritizes adaptability, risk management, and long-term sustainability.',
    keyTactics: [
      'Implement comprehensive risk assessment and management processes',
      'Create crisis response and business continuity plans',
      'Build diversified revenue streams and supplier relationships',
      'Establish early warning systems for market and operational changes',
      'Develop organizational capabilities for rapid adaptation and pivoting'
    ],
    resources: [
      'Antifragile by Nassim Nicholas Taleb',
      'The Resilience Factor by Karen Reivich',
      'Thinking in Systems by Donella Meadows',
      'The Black Swan by Nassim Nicholas Taleb'
    ],
    nextSteps: [
      'Conduct a comprehensive business risk assessment',
      'Create crisis response playbooks for different scenarios',
      'Implement early warning systems for key business metrics',
      'Develop scenario planning and stress testing processes',
      'Build organizational capabilities for rapid decision-making and adaptation'
    ]
  }
};