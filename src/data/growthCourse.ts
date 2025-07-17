export const growthCourseModules = [
  {
    id: 'growth-mindset',
    title: 'Growth Mindset & Strategy',
    description: 'Develop the founder mindset needed for sustainable growth',
    order: 0,
    sections: [
      {
        type: 'welcome',
        title: 'Welcome to Build to Scale: Your Growth Playbook',
        content: 'This comprehensive course will guide you through proven strategies for sustainable business growth. By the end, you\'ll have a customized growth framework tailored to your specific business model and stage.'
      },
      {
        type: 'section',
        title: 'The Growth Mindset Foundation',
        content: 'Before diving into tactics, it\'s essential to develop the right mindset for sustainable growth:',
        items: [
          {
            title: 'Growth vs. Fixed Mindset',
            description: 'Understanding how your approach to challenges directly impacts your business trajectory'
          },
          {
            title: 'Calculated Risk-Taking',
            description: 'Learning to evaluate and take smart risks that drive growth without endangering your business'
          },
          {
            title: 'Data-Driven Decision Making',
            description: 'Using metrics and analytics to guide your growth strategy rather than gut feelings alone'
          },
          {
            title: 'Resilience Through Setbacks',
            description: 'Developing the ability to learn from failures and pivot quickly when necessary'
          },
          {
            title: 'Long-Term Vision',
            description: 'Balancing short-term wins with sustainable long-term growth objectives'
          }
        ]
      },
      {
        type: 'section',
        title: 'Growth Strategy Frameworks',
        content: 'Several proven frameworks can help structure your approach to growth:',
        items: [
          {
            title: 'Product-Led Growth',
            description: 'Using your product as the primary driver of customer acquisition and expansion'
          },
          {
            title: 'Sales-Led Growth',
            description: 'Building a scalable sales engine to drive customer acquisition and revenue'
          },
          {
            title: 'Marketing-Led Growth',
            description: 'Leveraging content, advertising, and brand to attract and convert customers'
          },
          {
            title: 'Community-Led Growth',
            description: 'Building engaged communities that drive adoption and advocacy'
          },
          {
            title: 'Operations-Led Growth',
            description: 'Optimizing internal processes to improve efficiency and enable scaling'
          }
        ]
      },
      {
        type: 'section',
        title: 'Identifying Your Growth Levers',
        content: 'Every business has unique levers that drive growth. Identifying yours is critical:',
        items: [
          {
            title: 'Acquisition Levers',
            description: 'Channels and tactics that bring new customers to your business'
          },
          {
            title: 'Activation Levers',
            description: 'Factors that convert prospects into active, engaged customers'
          },
          {
            title: 'Retention Levers',
            description: 'Elements that keep customers coming back and reduce churn'
          },
          {
            title: 'Revenue Levers',
            description: 'Opportunities to increase average revenue per customer'
          },
          {
            title: 'Referral Levers',
            description: 'Mechanisms that turn customers into advocates who bring in new business'
          }
        ]
      },
      {
        type: 'conclusion',
        title: 'Preparing for Strategic Growth',
        content: 'With the right mindset and framework in place, you\'re ready to dive deeper into validating your product-market fit before scaling.',
        cta: 'Take the growth strategy assessment to identify which approach best fits your business model.'
      }
    ],
    quiz: {
      title: 'Growth Strategy Assessment',
      description: 'Answer these questions to determine which growth strategy is best suited for your business.',
      questions: [
        {
          id: 'product-quality',
          text: 'How would you rate your product\'s ability to demonstrate value without sales intervention?',
          type: 'single',
          options: [
            {
              id: 'self-serve',
              text: 'Users can easily discover value on their own',
              points: { productLed: 5, salesLed: 1, marketingLed: 3, communityLed: 3, operationsLed: 2 }
            },
            {
              id: 'some-guidance',
              text: 'Users need some guidance but can see value quickly',
              points: { productLed: 3, salesLed: 3, marketingLed: 4, communityLed: 3, operationsLed: 2 }
            },
            {
              id: 'high-touch',
              text: 'Users typically need demonstrations to understand value',
              points: { productLed: 1, salesLed: 5, marketingLed: 3, communityLed: 2, operationsLed: 2 }
            }
          ]
        },
        {
          id: 'sales-cycle',
          text: 'What is your typical sales cycle length?',
          type: 'single',
          options: [
            {
              id: 'instant',
              text: 'Instant or very short (days)',
              points: { productLed: 5, salesLed: 1, marketingLed: 4, communityLed: 3, operationsLed: 2 }
            },
            {
              id: 'weeks',
              text: 'Moderate (weeks)',
              points: { productLed: 3, salesLed: 3, marketingLed: 4, communityLed: 3, operationsLed: 3 }
            },
            {
              id: 'months',
              text: 'Long (months)',
              points: { productLed: 1, salesLed: 5, marketingLed: 2, communityLed: 2, operationsLed: 4 }
            }
          ]
        },
        {
          id: 'customer-acquisition',
          text: 'How do you primarily acquire new customers?',
          type: 'single',
          options: [
            {
              id: 'word-of-mouth',
              text: 'Word of mouth and referrals',
              points: { productLed: 4, salesLed: 2, marketingLed: 2, communityLed: 5, operationsLed: 1 }
            },
            {
              id: 'marketing',
              text: 'Marketing and advertising',
              points: { productLed: 2, salesLed: 2, marketingLed: 5, communityLed: 3, operationsLed: 1 }
            },
            {
              id: 'sales-outreach',
              text: 'Direct sales outreach',
              points: { productLed: 1, salesLed: 5, marketingLed: 2, communityLed: 1, operationsLed: 2 }
            },
            {
              id: 'product-discovery',
              text: 'Product discovery (app stores, marketplaces)',
              points: { productLed: 5, salesLed: 1, marketingLed: 3, communityLed: 2, operationsLed: 2 }
            }
          ]
        },
        {
          id: 'pricing-model',
          text: 'What pricing model do you use?',
          type: 'single',
          options: [
            {
              id: 'freemium',
              text: 'Freemium with self-service upgrade',
              points: { productLed: 5, salesLed: 1, marketingLed: 3, communityLed: 4, operationsLed: 2 }
            },
            {
              id: 'tiered',
              text: 'Transparent tiered pricing',
              points: { productLed: 4, salesLed: 2, marketingLed: 4, communityLed: 3, operationsLed: 3 }
            },
            {
              id: 'custom',
              text: 'Custom pricing / "Contact sales"',
              points: { productLed: 1, salesLed: 5, marketingLed: 2, communityLed: 1, operationsLed: 3 }
            },
            {
              id: 'subscription',
              text: 'Fixed subscription with high retention focus',
              points: { productLed: 3, salesLed: 3, marketingLed: 3, communityLed: 3, operationsLed: 5 }
            }
          ]
        },
        {
          id: 'scaling-bottleneck',
          text: 'What\'s your biggest bottleneck to scaling right now?',
          type: 'single',
          options: [
            {
              id: 'customer-acquisition',
              text: 'Finding enough customers',
              points: { productLed: 2, salesLed: 3, marketingLed: 5, communityLed: 4, operationsLed: 1 }
            },
            {
              id: 'onboarding',
              text: 'Getting customers to experience value quickly',
              points: { productLed: 5, salesLed: 2, marketingLed: 2, communityLed: 3, operationsLed: 3 }
            },
            {
              id: 'closing-deals',
              text: 'Converting prospects into paying customers',
              points: { productLed: 2, salesLed: 5, marketingLed: 3, communityLed: 2, operationsLed: 2 }
            },
            {
              id: 'operational-efficiency',
              text: 'Internal processes and efficiency',
              points: { productLed: 2, salesLed: 2, marketingLed: 1, communityLed: 2, operationsLed: 5 }
            },
            {
              id: 'customer-retention',
              text: 'Keeping customers engaged long-term',
              points: { productLed: 3, salesLed: 2, marketingLed: 2, communityLed: 5, operationsLed: 3 }
            }
          ]
        }
      ]
    }
  },
  {
    id: 'product-market-fit',
    title: 'Product-Market Fit Validation',
    description: 'Learn frameworks to measure and strengthen your product-market fit',
    order: 1,
    sections: [
      {
        type: 'welcome',
        title: 'Validating Your Product-Market Fit',
        content: 'Before scaling your business, it\'s crucial to ensure you have strong product-market fit. This module will help you measure, validate, and strengthen the alignment between your offering and your target market.'
      },
      {
        type: 'section',
        title: 'Understanding Product-Market Fit',
        content: 'Product-market fit is the degree to which your product satisfies strong market demand:',
        items: [
          {
            title: 'Definition & Importance',
            description: 'Why product-market fit is the foundation of sustainable growth'
          },
          {
            title: 'The Risks of Premature Scaling',
            description: 'How scaling before validation can lead to wasted resources and business failure'
          },
          {
            title: 'Signs of Strong PMF',
            description: 'Indicators that your business has achieved product-market fit'
          },
          {
            title: 'Signs of Weak PMF',
            description: 'Warning signals that your product and market aren\'t well aligned'
          },
          {
            title: 'The Continuous Journey',
            description: 'Why product-market fit requires ongoing refinement as markets evolve'
          }
        ]
      },
      {
        type: 'section',
        title: 'Measuring Product-Market Fit',
        content: 'Use these frameworks and metrics to quantify your product-market fit:',
        items: [
          {
            title: 'Sean Ellis Test',
            description: 'How would users feel if they could no longer use your product?'
          },
          {
            title: 'Net Promoter Score (NPS)',
            description: 'Measuring customer satisfaction and likelihood to recommend'
          },
          {
            title: 'Retention Cohort Analysis',
            description: 'Tracking how well you retain users over time'
          },
          {
            title: 'Customer Acquisition Cost (CAC)',
            description: 'How much it costs to acquire new customers'
          },
          {
            title: 'Customer Lifetime Value (LTV)',
            description: 'The total revenue you can expect from a customer'
          }
        ]
      },
      {
        type: 'section',
        title: 'Strengthening Product-Market Fit',
        content: 'If your product-market fit is weak, use these strategies to improve it:',
        items: [
          {
            title: 'Customer Development Interviews',
            description: 'Techniques for gathering deep customer insights through structured conversations'
          },
          {
            title: 'Iterative Product Improvements',
            description: 'Using customer feedback to refine your product incrementally'
          },
          {
            title: 'Market Segmentation Refinement',
            description: 'Narrowing your focus to serve specific customer segments better'
          },
          {
            title: 'Value Proposition Clarification',
            description: 'Sharpening how you communicate your unique benefits'
          },
          {
            title: 'Pricing Optimization',
            description: 'Aligning your pricing with the value customers perceive'
          }
        ]
      },
      {
        type: 'conclusion',
        title: 'Ready to Scale?',
        content: 'With strong product-market fit validated, you\'re now prepared to build a sustainable growth engine.',
        cta: 'In the next module, we\'ll explore how to design your growth engine based on your business model and customer journey.'
      }
    ],
    checklist: {
      title: 'Product-Market Fit Validation Checklist',
      items: [
        {
          id: 'pmf-survey',
          text: 'Conduct a "very disappointed" survey',
          description: 'Ask users how they would feel if they could no longer use your product',
          required: true
        },
        {
          id: 'retention-analysis',
          text: 'Analyze user retention cohorts',
          description: 'Track how many users continue using your product over time',
          required: true
        },
        {
          id: 'customer-interviews',
          text: 'Conduct at least 5 customer interviews',
          description: 'Gather qualitative feedback about your product',
          required: true
        },
        {
          id: 'calculate-ltv-cac',
          text: 'Calculate LTV:CAC ratio',
          description: 'Ensure your customer lifetime value exceeds acquisition cost',
          required: false
        },
        {
          id: 'document-insights',
          text: 'Document key insights and action items',
          description: 'Create a plan to address any product-market fit issues',
          required: true
        }
      ]
    }
  },
  {
    id: 'growth-engine',
    title: 'Building Your Growth Engine',
    description: 'Design a repeatable, scalable system for customer acquisition and expansion',
    order: 2,
    sections: [
      {
        type: 'welcome',
        title: 'Designing Your Growth Engine',
        content: 'A growth engine is a systematic approach to acquiring, retaining, and expanding your customer base. In this module, you\'ll learn how to build a repeatable, scalable system tailored to your business model.'
      },
      {
        type: 'section',
        title: 'Growth Engine Fundamentals',
        content: 'Understanding the core components of an effective growth system:',
        items: [
          {
            title: 'The AARRR Framework',
            description: 'Acquisition, Activation, Retention, Revenue, and Referral - the pirate metrics'
          },
          {
            title: 'The Growth Flywheel',
            description: 'Creating self-reinforcing loops that accelerate growth over time'
          },
          {
            title: 'North Star Metric',
            description: 'Identifying the single metric that best represents your company\'s value creation'
          },
          {
            title: 'Leading vs. Lagging Indicators',
            description: 'Understanding which metrics predict future growth vs. reflect past performance'
          },
          {
            title: 'Growth Accounting',
            description: 'Tracking new, churned, resurrected, and expanding customers to understand net growth'
          }
        ]
      },
      {
        type: 'section',
        title: 'Customer Acquisition Systems',
        content: 'Building reliable channels to attract new customers:',
        items: [
          {
            title: 'Channel Strategy Development',
            description: 'Identifying and prioritizing the most effective acquisition channels for your business'
          },
          {
            title: 'Content Marketing Engine',
            description: 'Creating a systematic approach to content creation, distribution, and optimization'
          },
          {
            title: 'Paid Acquisition Framework',
            description: 'Building a structured approach to paid marketing with clear ROI targets'
          },
          {
            title: 'SEO Growth System',
            description: 'Developing processes for sustainable organic traffic growth'
          },
          {
            title: 'Sales Process Optimization',
            description: 'Creating a repeatable sales process that can scale with your business'
          }
        ]
      },
      {
        type: 'section',
        title: 'Retention & Expansion Systems',
        content: 'Maximizing customer lifetime value through systematic approaches:',
        items: [
          {
            title: 'Onboarding Optimization',
            description: 'Designing a process that quickly delivers value and establishes usage habits'
          },
          {
            title: 'Engagement Loops',
            description: 'Creating mechanisms that drive regular, valuable product usage'
          },
          {
            title: 'Churn Prevention System',
            description: 'Implementing proactive measures to identify and address at-risk customers'
          },
          {
            title: 'Expansion Revenue Playbook',
            description: 'Developing systematic approaches to upselling and cross-selling'
          },
          {
            title: 'Customer Success Framework',
            description: 'Building processes that ensure customers achieve their desired outcomes'
          }
        ]
      },
      {
        type: 'conclusion',
        title: 'Your Growth Engine Blueprint',
        content: 'You now have the framework for a complete growth engine tailored to your business model and customer journey.',
        cta: 'In the next module, we\'ll focus on building the operational systems needed to support and scale this growth engine.'
      }
    ],
    tools: [
      {
        id: 'growth-model-calculator',
        title: 'Growth Model Calculator',
        description: 'Project your growth based on acquisition, retention, and expansion metrics',
        type: 'calculator'
      },
      {
        id: 'channel-prioritization',
        title: 'Channel Prioritization Framework',
        description: 'Evaluate and rank potential acquisition channels for your business',
        type: 'template'
      },
      {
        id: 'customer-journey-mapper',
        title: 'Customer Journey Mapper',
        description: 'Map your customer journey and identify key touchpoints for optimization',
        type: 'generator'
      },
      {
        id: 'north-star-worksheet',
        title: 'North Star Metric Worksheet',
        description: 'Define your company\'s most important growth metric',
        type: 'template'
      }
    ]
  },
  {
    id: 'operational-excellence',
    title: 'Operational Excellence',
    description: 'Create systems and processes that can handle 10x growth',
    order: 3,
    sections: [
      {
        type: 'welcome',
        title: 'Building Operational Excellence',
        content: 'As your business grows, operational challenges can quickly become bottlenecks. This module focuses on creating scalable systems and processes that can handle significant growth without breaking down.'
      },
      {
        type: 'section',
        title: 'Scalable Business Operations',
        content: 'Designing operations that grow efficiently with your business:',
        items: [
          {
            title: 'Process Documentation',
            description: 'Creating clear, accessible documentation for all key business processes'
          },
          {
            title: 'Automation Opportunities',
            description: 'Identifying and implementing automation to eliminate repetitive tasks'
          },
          {
            title: 'Tech Stack Optimization',
            description: 'Selecting and integrating tools that support rather than hinder growth'
          },
          {
            title: 'Workflow Design',
            description: 'Creating efficient, repeatable workflows for core business functions'
          },
          {
            title: 'Scalability Audits',
            description: 'Regularly assessing operations for potential breaking points'
          }
        ]
      },
      {
        type: 'section',
        title: 'Financial Operations',
        content: 'Building financial systems that support sustainable growth:',
        items: [
          {
            title: 'Cash Flow Management',
            description: 'Creating systems to monitor and optimize cash flow during rapid growth'
          },
          {
            title: 'Unit Economics Tracking',
            description: 'Implementing processes to continuously monitor and improve unit economics'
          },
          {
            title: 'Financial Forecasting',
            description: 'Developing models to predict financial needs and outcomes as you scale'
          },
          {
            title: 'Expense Management',
            description: 'Building systems to control costs while supporting growth initiatives'
          },
          {
            title: 'Financial Reporting',
            description: 'Creating dashboards and reports that provide actionable financial insights'
          }
        ]
      },
      {
        type: 'section',
        title: 'Customer Operations',
        content: 'Scaling your ability to serve customers effectively:',
        items: [
          {
            title: 'Customer Support Scaling',
            description: 'Building systems that maintain quality support as volume increases'
          },
          {
            title: 'Self-Service Resources',
            description: 'Developing knowledge bases and tools that empower customers to help themselves'
          },
          {
            title: 'Customer Success Playbooks',
            description: 'Creating repeatable processes for ensuring customer outcomes'
          },
          {
            title: 'Feedback Collection Systems',
            description: 'Implementing systematic approaches to gathering and acting on customer input'
          },
          {
            title: 'Customer Health Monitoring',
            description: 'Building early warning systems for at-risk customers'
          }
        ]
      },
      {
        type: 'conclusion',
        title: 'Operations Ready for Scale',
        content: 'With these operational systems in place, your business is prepared to handle significant growth without sacrificing quality or burning out your team.',
        cta: 'Next, we\'ll focus on building and managing the team that will drive your growth journey.'
      }
    ],
    checklist: {
      title: 'Operational Readiness Checklist',
      items: [
        {
          id: 'process-documentation',
          text: 'Document core business processes',
          description: 'Create clear documentation for key operational workflows',
          required: true
        },
        {
          id: 'automation-implementation',
          text: 'Implement automation for repetitive tasks',
          description: 'Set up systems to automate manual, repetitive processes',
          required: true
        },
        {
          id: 'financial-dashboard',
          text: 'Create financial monitoring dashboard',
          description: 'Build a dashboard tracking key financial metrics',
          required: true
        },
        {
          id: 'customer-service-system',
          text: 'Establish scalable customer service system',
          description: 'Implement tools and processes for customer support',
          required: false
        },
        {
          id: 'tech-stack-review',
          text: 'Review tech stack for scalability',
          description: 'Ensure your technology can support 10x growth',
          required: true
        }
      ]
    }
  },
  {
    id: 'team-building',
    title: 'Building a Growth Team',
    description: 'Assemble and lead a team that can execute your growth strategy',
    order: 4,
    sections: [
      {
        type: 'welcome',
        title: 'Building Your Growth Team',
        content: 'As your business scales, you\'ll need a capable team to execute your growth strategy. This module covers how to build, structure, and lead a high-performing growth team.'
      },
      {
        type: 'section',
        title: 'Growth Team Structure',
        content: 'Designing an effective organizational structure for growth:',
        items: [
          {
            title: 'Functional vs. Cross-Functional Teams',
            description: 'Comparing different team structures and when to use each approach'
          },
          {
            title: 'Key Growth Roles',
            description: 'Essential positions to consider as you build your growth team'
          },
          {
            title: 'Hiring Sequence',
            description: 'The optimal order for adding team members based on your growth stage'
          },
          {
            title: 'Outsourcing vs. In-House',
            description: 'Guidelines for deciding which functions to keep internal vs. external'
          },
          {
            title: 'Team Evolution',
            description: 'How your team structure should evolve as your company grows'
          }
        ]
      },
      {
        type: 'section',
        title: 'Hiring for Growth',
        content: 'Finding and recruiting the right talent for your growth team:',
        items: [
          {
            title: 'Growth Mindset Indicators',
            description: 'Traits to look for in candidates who will thrive in a scaling business'
          },
          {
            title: 'Skill vs. Cultural Fit',
            description: 'Balancing technical capabilities with alignment to your values'
          },
          {
            title: 'Structured Interview Process',
            description: 'Creating a consistent, effective approach to evaluating candidates'
          },
          {
            title: 'Onboarding for Success',
            description: 'Systems to help new team members contribute quickly'
          },
          {
            title: 'Compensation Strategies',
            description: 'Approaches to attract and retain top talent at different growth stages'
          }
        ]
      },
      {
        type: 'section',
        title: 'Leading a Growth Team',
        content: 'Management practices that foster high performance and innovation:',
        items: [
          {
            title: 'OKR Implementation',
            description: 'Using Objectives and Key Results to align team efforts with growth goals'
          },
          {
            title: 'Growth Experimentation Culture',
            description: 'Fostering an environment that encourages testing and learning'
          },
          {
            title: 'Communication Rhythms',
            description: 'Establishing effective meeting and reporting cadences'
          },
          {
            title: 'Performance Management',
            description: 'Systems for tracking, evaluating, and improving team performance'
          },
          {
            title: 'Team Development',
            description: 'Approaches to continuously upskill your team as needs evolve'
          }
        ]
      },
      {
        type: 'conclusion',
        title: 'Your Growth Team Blueprint',
        content: 'With these frameworks for building and leading your growth team, you\'re prepared to execute your growth strategy effectively.',
        cta: 'In our final module, we\'ll explore how to measure, analyze, and optimize your growth efforts.'
      }
    ],
    tools: [
      {
        id: 'role-description-generator',
        title: 'Growth Role Description Generator',
        description: 'Create compelling job descriptions for key growth positions',
        type: 'generator'
      },
      {
        id: 'interview-question-bank',
        title: 'Growth Interview Question Bank',
        description: 'Curated questions to assess candidates for growth roles',
        type: 'template'
      },
      {
        id: 'team-structure-planner',
        title: 'Growth Team Structure Planner',
        description: 'Design your ideal growth team based on your business model and stage',
        type: 'template'
      },
      {
        id: 'okr-template',
        title: 'Growth OKR Template',
        description: 'Framework for setting effective growth objectives and key results',
        type: 'template'
      }
    ]
  },
  {
    id: 'growth-analytics',
    title: 'Growth Measurement & Optimization',
    description: 'Implement systems to measure, analyze, and optimize your growth efforts',
    order: 5,
    sections: [
      {
        type: 'welcome',
        title: 'Measuring and Optimizing Growth',
        content: 'To sustain growth over time, you need robust systems for measurement, analysis, and continuous optimization. This final module will help you implement these critical capabilities.'
      },
      {
        type: 'section',
        title: 'Growth Measurement Framework',
        content: 'Building a comprehensive system to track your growth metrics:',
        items: [
          {
            title: 'Growth Metrics Hierarchy',
            description: 'Organizing metrics from high-level KPIs to granular diagnostics'
          },
          {
            title: 'Data Collection Infrastructure',
            description: 'Setting up the technical foundation to capture relevant data'
          },
          {
            title: 'Reporting Dashboards',
            description: 'Creating visual interfaces that make metrics actionable'
          },
          {
            title: 'Metrics Governance',
            description: 'Establishing definitions, ownership, and quality control for metrics'
          },
          {
            title: 'Leading Indicators',
            description: 'Identifying early signals that predict future growth performance'
          }
        ]
      },
      {
        type: 'section',
        title: 'Growth Analysis Techniques',
        content: 'Methods for extracting actionable insights from your growth data:',
        items: [
          {
            title: 'Cohort Analysis',
            description: 'Tracking how different user groups behave over time'
          },
          {
            title: 'Funnel Analysis',
            description: 'Identifying conversion bottlenecks in your customer journey'
          },
          {
            title: 'Segmentation Analysis',
            description: 'Understanding how different customer segments respond to your product and marketing'
          },
          {
            title: 'Attribution Modeling',
            description: 'Determining which channels and touchpoints drive conversions'
          },
          {
            title: 'Churn Analysis',
            description: 'Uncovering patterns and causes of customer loss'
          }
        ]
      },
      {
        type: 'section',
        title: 'Growth Optimization System',
        content: 'Creating a systematic approach to continuous improvement:',
        items: [
          {
            title: 'Growth Experimentation Framework',
            description: 'Establishing a structured process for testing growth hypotheses'
          },
          {
            title: 'A/B Testing Methodology',
            description: 'Implementing rigorous split testing to optimize conversions'
          },
          {
            title: 'Growth Prioritization Models',
            description: 'Using frameworks like ICE (Impact, Confidence, Ease) to focus efforts'
          },
          {
            title: 'Growth Retrospectives',
            description: 'Conducting regular reviews to capture and apply learnings'
          },
          {
            title: 'Long-term Growth Planning',
            description: 'Balancing short-term optimization with strategic growth initiatives'
          }
        ]
      },
      {
        type: 'conclusion',
        title: 'Your Sustainable Growth Journey',
        content: 'Congratulations! You now have a comprehensive framework for sustainable business growth. Remember that growth is an ongoing journey of experimentation, learning, and adaptation.',
        cta: 'Complete the final assessment to receive your Growth Strategist badge and put your new knowledge into action.'
      }
    ],
    tools: [
      {
        id: 'metrics-dashboard-template',
        title: 'Growth Metrics Dashboard Template',
        description: 'Ready-to-use template for tracking key growth metrics',
        type: 'template'
      },
      {
        id: 'experiment-design-framework',
        title: 'Growth Experiment Design Framework',
        description: 'Structure for designing and documenting growth experiments',
        type: 'template'
      },
      {
        id: 'cohort-analysis-calculator',
        title: 'Cohort Analysis Calculator',
        description: 'Tool for analyzing retention and behavior across user cohorts',
        type: 'calculator'
      },
      {
        id: 'growth-prioritization-matrix',
        title: 'Growth Initiative Prioritization Matrix',
        description: 'Framework for evaluating and ranking growth opportunities',
        type: 'template'
      }
    ]
  }
];

export const growthStrategyInfo = {
  productLed: {
    name: 'Product-Led Growth Strategy',
    description: 'A strategy that relies on the product itself as the primary driver of customer acquisition, conversion, and expansion.',
    bestFor: 'SaaS products with clear value proposition, consumer apps, and products with network effects.',
    keyPrinciples: [
      'Self-service onboarding',
      'Freemium or free trial models',
      'In-product education and expansion',
      'Viral/network effects',
      'Usage-based metrics'
    ]
  },
  salesLed: {
    name: 'Sales-Led Growth Strategy',
    description: 'A strategy that leverages a dedicated sales team to drive customer acquisition and revenue growth.',
    bestFor: 'Enterprise solutions, complex products with high price points, and solutions requiring customization.',
    keyPrinciples: [
      'Consultative selling approach',
      'Relationship building',
      'Structured sales process',
      'Account-based strategies',
      'Sales enablement'
    ]
  },
  marketingLed: {
    name: 'Marketing-Led Growth Strategy',
    description: 'A strategy that focuses on creating awareness and demand through marketing channels to drive customer acquisition.',
    bestFor: 'Consumer products, SMB-focused solutions, and products with broad market appeal.',
    keyPrinciples: [
      'Content marketing',
      'Paid acquisition',
      'Brand development',
      'Conversion optimization',
      'Multi-channel approach'
    ]
  },
  communityLed: {
    name: 'Community-Led Growth Strategy',
    description: 'A strategy that builds and nurtures a community of users who become advocates and drive organic growth.',
    bestFor: 'Open source projects, platforms with user-generated content, and products with strong social components.',
    keyPrinciples: [
      'Community engagement',
      'User-generated content',
      'Advocacy programs',
      'Events and networking',
      'Knowledge sharing'
    ]
  },
  operationsLed: {
    name: 'Operations-Led Growth Strategy',
    description: 'A strategy that focuses on optimizing internal processes and customer experience to drive retention and expansion.',
    bestFor: 'Subscription businesses, service-oriented companies, and businesses with high customer lifetime value.',
    keyPrinciples: [
      'Customer success focus',
      'Process optimization',
      'Churn reduction',
      'Expansion revenue',
      'Operational efficiency'
    ]
  }
};

export const growthStrategyRecommendationInfo = {
  productLed: {
    description: 'Based on your responses, a Product-Led Growth strategy appears to be the best fit for your business. This approach leverages your product as the primary driver of acquisition, conversion, and expansion.',
    keyTactics: [
      'Implement a frictionless self-service onboarding process',
      'Create a freemium tier or free trial to lower acquisition barriers',
      'Build in-product education to help users discover value quickly',
      'Design viral loops and referral mechanisms within the product',
      'Focus on product analytics to identify and remove friction points'
    ],
    resources: [
      'Product-Led Growth: How to Build a Product That Sells Itself by Wes Bush',
      'ProductLed.org - Community and resources for PLG companies',
      'Amplitude\'s Product-Led Growth Playbook',
      'OpenView Partners\' PLG Resources'
    ],
    nextSteps: [
      'Audit your current user onboarding experience and identify friction points',
      'Implement product analytics to track key activation and engagement metrics',
      'Develop a value metric that aligns your pricing with customer success',
      'Create an in-product education system to help users discover key features',
      'Design and implement a referral program that leverages satisfied customers'
    ]
  },
  salesLed: {
    description: 'Based on your responses, a Sales-Led Growth strategy appears to be the best fit for your business. This approach leverages a dedicated sales team to drive customer acquisition and revenue growth.',
    keyTactics: [
      'Build a structured sales process from prospecting to closing',
      'Develop sales enablement materials and training programs',
      'Implement account-based marketing and selling approaches',
      'Create a consultative selling methodology focused on customer outcomes',
      'Establish clear handoffs between marketing, sales, and customer success'
    ],
    resources: [
      'Predictable Revenue by Aaron Ross',
      'SPIN Selling by Neil Rackham',
      'The Challenger Sale by Matthew Dixon and Brent Adamson',
      'SalesHacker.com - Sales strategy resources and community'
    ],
    nextSteps: [
      'Document your ideal customer profile and buyer personas in detail',
      'Create a sales playbook with scripts, objection handling, and process documentation',
      'Implement a CRM system with proper pipeline stages and reporting',
      'Develop a lead qualification framework (like BANT or MEDDIC)',
      'Establish sales metrics and KPIs to track performance and forecast accurately'
    ]
  },
  marketingLed: {
    description: 'Based on your responses, a Marketing-Led Growth strategy appears to be the best fit for your business. This approach focuses on creating awareness and demand through marketing channels to drive customer acquisition.',
    keyTactics: [
      'Develop a content marketing strategy targeting different funnel stages',
      'Build multi-channel acquisition campaigns across organic and paid channels',
      'Implement conversion rate optimization for landing pages and sign-up flows',
      'Create a strong brand identity and messaging framework',
      'Establish marketing analytics to track attribution and ROI'
    ],
    resources: [
      'Traction: How Any Startup Can Achieve Explosive Customer Growth by Gabriel Weinberg',
      'Content-Based Marketing by Joe Pulizzi',
      'HubSpot\'s Inbound Marketing Certification',
      'Growth Hackers - Marketing community and resources'
    ],
    nextSteps: [
      'Conduct a content audit and develop an editorial calendar',
      'Set up proper tracking and attribution for all marketing channels',
      'Create a systematic approach to A/B testing key landing pages',
      'Develop a clear messaging hierarchy and value proposition',
      'Establish a regular cadence of marketing experiments across channels'
    ]
  },
  communityLed: {
    description: 'Based on your responses, a Community-Led Growth strategy appears to be the best fit for your business. This approach builds and nurtures a community of users who become advocates and drive organic growth.',
    keyTactics: [
      'Create spaces for community members to connect and share knowledge',
      'Develop a community engagement program with regular events and activities',
      'Implement user-generated content initiatives that showcase community members',
      'Build an ambassador or advocacy program for your most engaged users',
      'Integrate community feedback into your product development process'
    ],
    resources: [
      'The Business of Belonging by David Spinks',
      'Building Brand Communities by Carrie Melissa Jones and Charles Vogl',
      'CMX Hub - Community professional network and resources',
      'Orbit Model - Framework for community growth'
    ],
    nextSteps: [
      'Define your community purpose, values, and success metrics',
      'Select and set up the right community platforms for your audience',
      'Create a community content and engagement calendar',
      'Develop a recognition program for community contributors',
      'Establish feedback loops between the community and product teams'
    ]
  },
  operationsLed: {
    description: 'Based on your responses, an Operations-Led Growth strategy appears to be the best fit for your business. This approach focuses on optimizing internal processes and customer experience to drive retention and expansion.',
    keyTactics: [
      'Implement a systematic customer success program focused on outcomes',
      'Develop playbooks for onboarding, adoption, and expansion',
      'Create early warning systems to identify at-risk customers',
      'Build expansion pathways through upsells, cross-sells, and add-ons',
      'Optimize operational efficiency to improve margins and customer experience'
    ],
    resources: [
      'Customer Success by Nick Mehta, Dan Steinman, and Lincoln Murphy',
      'The Effortless Experience by Matthew Dixon',
      'Gainsight\'s Customer Success resources',
      'The Lean Startup by Eric Ries'
    ],
    nextSteps: [
      'Map your customer journey and identify key touchpoints for optimization',
      'Implement a customer health scoring system',
      'Create playbooks for different customer segments and scenarios',
      'Develop a voice of customer program to systematically collect feedback',
      'Build a customer expansion framework with clear trigger points'
    ]
  }
};