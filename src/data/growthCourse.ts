import { z } from 'zod';

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  order: number;
  content: string;
  quiz?: {
    title: string;
    description: string;
    questions: {
      id: string;
      text: string;
      type: 'single' | 'multiple';
      options: {
        id: string;
        text: string;
        points: {
          productLed: number;
          salesLed: number;
          marketingLed: number;
          communityLed: number;
          operationsLed: number;
        };
      }[];
    }[];
  };
  checklist?: {
    title: string;
    items: {
      id: string;
      text: string;
      description?: string;
      required: boolean;
    }[];
  };
  tools?: {
    id: string;
    title: string;
    description: string;
    type: 'calculator' | 'template' | 'generator' | 'lookup';
    url?: string;
  }[];
}

export const growthStrategyInfo: Record<string, {
  name: string;
  description: string;
  bestFor: string;
  advantages: string[];
  disadvantages: string[];
  keyMetrics: string[];
  examples: string[];
}> = {
  productLed: {
    name: 'Product-Led Growth',
    description: 'A strategy where the product itself is the primary driver of customer acquisition, conversion, and expansion.',
    bestFor: 'SaaS, mobile apps, and digital products with strong product-market fit and clear value proposition',
    advantages: [
      'Lower customer acquisition costs',
      'Faster user adoption and viral growth potential',
      'More efficient scaling with less sales headcount',
      'Better user experience and product stickiness',
      'Data-driven improvement cycles'
    ],
    disadvantages: [
      'Requires exceptional product and UX',
      'May struggle with enterprise/complex sales',
      'Needs strong product analytics capabilities',
      'Can be difficult for high-touch products',
      'May leave money on the table without sales touch'
    ],
    keyMetrics: [
      'Product Qualified Leads (PQLs)',
      'Time to Value',
      'Feature Adoption Rate',
      'User Activation Rate',
      'Net Revenue Retention',
      'Viral Coefficient'
    ],
    examples: [
      'Slack',
      'Dropbox',
      'Zoom',
      'Calendly',
      'Notion'
    ]
  },
  salesLed: {
    name: 'Sales-Led Growth',
    description: 'A strategy that relies on a direct sales team to identify, qualify, and close deals with potential customers.',
    bestFor: 'Enterprise software, complex solutions, high-ticket products, and services requiring customization',
    advantages: [
      'Higher average contract value',
      'Better for complex or high-touch products',
      'More control over the customer journey',
      'Builds stronger customer relationships',
      'Easier to communicate complex value propositions'
    ],
    disadvantages: [
      'Higher customer acquisition costs',
      'Slower scaling due to hiring/training needs',
      'More resource-intensive',
      'Potential for misalignment between sales and product',
      'Dependent on sales talent'
    ],
    keyMetrics: [
      'Customer Acquisition Cost (CAC)',
      'Sales Cycle Length',
      'Conversion Rate by Stage',
      'Average Contract Value (ACV)',
      'Sales Qualified Leads (SQLs)',
      'Sales Efficiency'
    ],
    examples: [
      'Salesforce',
      'Oracle',
      'SAP',
      'Workday',
      'ServiceNow'
    ]
  },
  marketingLed: {
    name: 'Marketing-Led Growth',
    description: 'A strategy focused on creating awareness and demand through content, advertising, and other marketing channels.',
    bestFor: 'Consumer products, SMB-focused solutions, and products with clear positioning in competitive markets',
    advantages: [
      'Builds brand awareness and market positioning',
      'Scalable demand generation',
      'Works well for products with clear value props',
      'Can reach broad audiences efficiently',
      'Supports other growth strategies'
    ],
    disadvantages: [
      'Rising customer acquisition costs',
      'Requires consistent content creation',
      'Effectiveness can be difficult to measure',
      'May attract lower-quality leads',
      'Dependent on changing platform algorithms'
    ],
    keyMetrics: [
      'Marketing Qualified Leads (MQLs)',
      'Cost Per Lead (CPL)',
      'Channel Conversion Rates',
      'Content Engagement Metrics',
      'Brand Awareness Metrics',
      'Attribution Analysis'
    ],
    examples: [
      'HubSpot',
      'Mailchimp',
      'Shopify',
      'Canva',
      'Monday.com'
    ]
  },
  communityLed: {
    name: 'Community-Led Growth',
    description: 'A strategy that leverages community engagement, user advocacy, and network effects to drive growth.',
    bestFor: 'Products with strong network effects, platforms, marketplaces, and tools for creators or developers',
    advantages: [
      'Creates strong moats and defensibility',
      'Lower customer acquisition costs',
      'Higher retention and lifetime value',
      'Valuable product feedback loops',
      'Authentic word-of-mouth growth'
    ],
    disadvantages: [
      'Takes time to build momentum',
      'Requires dedicated community management',
      'Can be difficult to measure ROI initially',
      'Needs consistent engagement and moderation',
      'May face scaling challenges'
    ],
    keyMetrics: [
      'Community Engagement Rate',
      'User-Generated Content Volume',
      'Net Promoter Score (NPS)',
      'Member Retention Rate',
      'Referral Rate',
      'Community Contribution Metrics'
    ],
    examples: [
      'Figma',
      'Discord',
      'Roblox',
      'Notion',
      'Substack'
    ]
  },
  operationsLed: {
    name: 'Operations-Led Growth',
    description: 'A strategy that focuses on operational excellence, efficiency, and superior execution as the primary growth driver.',
    bestFor: 'Logistics, manufacturing, service businesses, and companies in competitive markets with thin margins',
    advantages: [
      'Creates sustainable competitive advantage',
      'Improves unit economics and profitability',
      'Enables pricing advantages',
      'Builds reputation for reliability',
      'Scales predictably with investment'
    ],
    disadvantages: [
      'Requires significant process discipline',
      'May need substantial upfront investment',
      'Can be difficult to communicate as value prop',
      'Needs strong operational leadership',
      'May sacrifice speed for quality'
    ],
    keyMetrics: [
      'Operational Efficiency Ratio',
      'Unit Economics',
      'Customer Satisfaction Score (CSAT)',
      'On-time Delivery Rate',
      'Error/Defect Rate',
      'Process Cycle Time'
    ],
    examples: [
      'Amazon',
      'Costco',
      'Toyota',
      'UPS',
      'McDonald\'s'
    ]
  }
};

export const pmfAssessmentInfo: Record<string, {
  name: string;
  description: string;
  questions: string[];
  interpretation: string[];
}> = {
  seanEllis: {
    name: 'Sean Ellis Test',
    description: 'The classic "very disappointed" test that measures how disappointed users would be if they could no longer use your product.',
    questions: [
      'How would you feel if you could no longer use [product]?',
      'What type of people do you think would most benefit from [product]?',
      'What is the main benefit you receive from [product]?',
      'How can we improve [product] for you?'
    ],
    interpretation: [
      'If >40% say "very disappointed," you likely have product-market fit',
      '25-40% indicates you're on the right track but not there yet',
      '<25% means you need significant product changes'
    ]
  },
  retentionCohort: {
    name: 'Retention Cohort Analysis',
    description: 'Measures how many users continue to use your product over time, broken down by acquisition cohorts.',
    questions: [
      'What percentage of users are still active after 1 week?',
      'What percentage of users are still active after 1 month?',
      'What percentage of users are still active after 3 months?',
      'How does retention vary across different user segments?'
    ],
    interpretation: [
      'Flat retention curves after initial drop indicate product-market fit',
      'Different retention patterns across segments help identify your core users',
      'Improving retention for key segments is often more valuable than acquisition'
    ]
  },
  netPromoterScore: {
    name: 'Net Promoter Score (NPS)',
    description: 'Measures customer loyalty and likelihood to recommend your product to others.',
    questions: [
      'On a scale of 0-10, how likely are you to recommend [product] to a friend or colleague?',
      'What is the primary reason for your score?'
    ],
    interpretation: [
      'Promoters (9-10): Loyal enthusiasts who will fuel growth',
      'Passives (7-8): Satisfied but vulnerable to competitive offerings',
      'Detractors (0-6): Unhappy customers who can damage growth through negative word-of-mouth',
      'NPS = % Promoters - % Detractors'
    ]
  },
  customerInterviews: {
    name: 'Customer Interview Framework',
    description: 'Qualitative research method to deeply understand customer problems, needs, and experiences.',
    questions: [
      'What problem were you trying to solve when you started using [product]?',
      'What solutions did you try before [product]?',
      'What made you choose [product] over alternatives?',
      'What would you improve about [product]?',
      'How would you feel if [product] was no longer available?'
    ],
    interpretation: [
      'Look for patterns in problems and use cases across interviews',
      'Pay attention to emotional responses and intensity',
      'Note specific language and terminology customers use',
      'Identify workarounds and hacks that indicate unmet needs'
    ]
  }
};

export const growthCourseModules: CourseModule[] = [
  {
    id: 'growth-mindset',
    title: 'Growth Mindset – What Scale Really Means',
    description: 'Define your growth strategy, identify bottlenecks, and build for sustainable expansion',
    order: 0,
    content: `# Growth Mindset – What Scale Really Means

## Welcome to Build to Scale: Your Growth Journey

Now that you've formed your business, it's time to grow it strategically. This comprehensive course will guide you through the essential frameworks and systems needed to scale sustainably. By the end, you'll have a clear growth strategy, validated product-market fit, and the operational foundation to handle increased demand.

## Why Strategic Scaling Matters

Growing without strategy leads to chaos. Smart scaling is about:

- **Sustainable Growth**: Building systems that can handle 10x demand
- **Market Validation**: Ensuring your product truly solves real problems
- **Operational Excellence**: Creating processes that scale with your team
- **Resource Optimization**: Maximizing ROI on every growth investment
- **Foundation Building**: Establishing culture and systems for long-term success

## What You'll Accomplish

By completing this course, you will:

- Validate true product-market fit using data-driven frameworks
- Build repeatable growth systems across marketing, sales, and operations
- Design scalable operational processes that work at any size
- Create a hiring and culture framework for sustainable team growth
- Implement key metrics and tracking systems for continuous optimization
- Develop contingency plans for common scaling challenges

## How to Use This Course

This course is designed for active implementation. Each module includes:

- **Strategic frameworks**: Proven methodologies used by successful companies
- **Assessment tools**: Evaluate your current state and identify gaps
- **Implementation guides**: Step-by-step playbooks for each area
- **Real case studies**: Learn from companies that scaled successfully
- **Community workshops**: Connect with other founders facing similar challenges
- **Expert mentorship**: Access to operators who've scaled businesses

## Before You Begin

Reflect on your current situation:

- **Current State**: What's working well? What's breaking as you grow?
- **Growth Goals**: Where do you want to be in 12-18 months?
- **Resource Constraints**: What are your biggest limitations (time, money, people)?
- **Risk Tolerance**: How fast do you want to grow vs. how stable do you want to be?
- **Market Opportunity**: How big is your addressable market really?

## The Five Growth Strategies

Before diving into the tactical elements of scaling, it's important to understand the primary growth strategies available to you. Each has its own advantages, resource requirements, and best-fit scenarios:

### 1. Product-Led Growth (PLG)

In product-led growth, your product itself is the primary driver of acquisition, conversion, and expansion. Users discover, try, adopt, and upgrade with minimal human intervention.

**Best for**: SaaS, mobile apps, and digital products with clear value proposition
**Examples**: Slack, Dropbox, Notion

**Key characteristics**:
- Self-service onboarding and adoption
- Freemium or free trial business models
- Focus on product experience and time-to-value
- Strong emphasis on user analytics and product iteration

### 2. Sales-Led Growth (SLG)

Sales-led growth relies on a direct sales team to identify, qualify, and close deals with potential customers.

**Best for**: Enterprise software, complex solutions, high-ticket products
**Examples**: Salesforce, Oracle, ServiceNow

**Key characteristics**:
- Dedicated sales team with defined process
- Longer sales cycles with multiple touchpoints
- Higher average contract values
- Emphasis on relationship building and consultative selling

### 3. Marketing-Led Growth (MLG)

Marketing-led growth focuses on creating awareness and demand through content, advertising, and other marketing channels.

**Best for**: Consumer products, SMB-focused solutions, products with clear positioning
**Examples**: HubSpot, Mailchimp, Shopify

**Key characteristics**:
- Strong content marketing and SEO focus
- Multi-channel demand generation
- Brand-building emphasis
- Clear messaging and positioning

### 4. Community-Led Growth (CLG)

Community-led growth leverages community engagement, user advocacy, and network effects to drive growth.

**Best for**: Products with network effects, platforms, marketplaces
**Examples**: Figma, Discord, Roblox

**Key characteristics**:
- Active user communities and forums
- User-generated content and templates
- Strong focus on user success and advocacy
- Events and knowledge sharing

### 5. Operations-Led Growth (OLG)

Operations-led growth focuses on operational excellence, efficiency, and superior execution as the primary growth driver.

**Best for**: Logistics, manufacturing, service businesses
**Examples**: Amazon, Costco, UPS

**Key characteristics**:
- Exceptional operational efficiency
- Continuous process improvement
- Superior quality and reliability
- Scale economies that improve unit economics

## Choosing Your Primary Growth Strategy

Most successful companies employ a hybrid approach, but typically have one primary growth strategy that aligns with their strengths, resources, and market position.

Consider these factors when choosing your primary growth strategy:

- **Product complexity**: How much explanation or customization does your product need?
- **Average contract value**: Higher ACVs typically justify more sales-intensive approaches
- **User adoption curve**: How quickly can users understand and get value from your product?
- **Market education**: Does your market understand the problem you solve, or do they need education?
- **Resource constraints**: What resources (people, capital, time) do you have available?
- **Founder strengths**: What are your team's core competencies and experiences?

In the next section, we'll help you assess your current situation and identify the right growth strategy for your specific business.

## Your Growth Journey Starts Here

You've built the foundation—now it's time to build the engine. Let's turn your formed business into a scalable growth machine that can handle whatever comes next.

Ready to scale smart? Let's begin.`,
    quiz: {
      title: 'Growth Strategy Assessment',
      description: 'Let\'s determine which growth strategy might be the best fit for your business.',
      questions: [
        {
          id: 'product_complexity',
          text: 'How much explanation or customization does your product require?',
          type: 'single',
          options: [
            {
              id: 'self_explanatory',
              text: 'Very little - users can understand and use it immediately',
              points: { productLed: 10, salesLed: 0, marketingLed: 5, communityLed: 5, operationsLed: 3 }
            },
            {
              id: 'some_explanation',
              text: 'Some explanation needed, but fairly straightforward',
              points: { productLed: 5, salesLed: 5, marketingLed: 8, communityLed: 7, operationsLed: 5 }
            },
            {
              id: 'significant_training',
              text: 'Significant training or onboarding required',
              points: { productLed: 0, salesLed: 8, marketingLed: 5, communityLed: 3, operationsLed: 7 }
            },
            {
              id: 'highly_customized',
              text: 'Highly customized for each customer',
              points: { productLed: 0, salesLed: 10, marketingLed: 2, communityLed: 0, operationsLed: 8 }
            }
          ]
        },
        {
          id: 'pricing_model',
          text: 'What is your typical pricing model or average contract value?',
          type: 'single',
          options: [
            {
              id: 'freemium',
              text: 'Freemium or low-cost subscription (<$50/month)',
              points: { productLed: 10, salesLed: 0, marketingLed: 8, communityLed: 8, operationsLed: 5 }
            },
            {
              id: 'mid_tier',
              text: 'Mid-tier subscription ($50-500/month)',
              points: { productLed: 8, salesLed: 5, marketingLed: 10, communityLed: 5, operationsLed: 7 }
            },
            {
              id: 'high_value',
              text: 'High-value subscription ($500-5,000/month)',
              points: { productLed: 3, salesLed: 8, marketingLed: 5, communityLed: 3, operationsLed: 8 }
            },
            {
              id: 'enterprise',
              text: 'Enterprise deals ($5,000+/month)',
              points: { productLed: 0, salesLed: 10, marketingLed: 3, communityLed: 0, operationsLed: 7 }
            }
          ]
        },
        {
          id: 'network_effects',
          text: 'How important are network effects to your product\'s value?',
          type: 'single',
          options: [
            {
              id: 'critical',
              text: 'Critical - the product gets significantly better with more users',
              points: { productLed: 7, salesLed: 0, marketingLed: 5, communityLed: 10, operationsLed: 3 }
            },
            {
              id: 'important',
              text: 'Important - users benefit from others using it',
              points: { productLed: 5, salesLed: 3, marketingLed: 7, communityLed: 8, operationsLed: 5 }
            },
            {
              id: 'somewhat',
              text: 'Somewhat - there are some collaboration features',
              points: { productLed: 5, salesLed: 5, marketingLed: 5, communityLed: 5, operationsLed: 5 }
            },
            {
              id: 'not_important',
              text: 'Not important - users get full value independently',
              points: { productLed: 5, salesLed: 8, marketingLed: 7, communityLed: 0, operationsLed: 8 }
            }
          ]
        },
        {
          id: 'market_education',
          text: 'How much education does your market need about the problem you solve?',
          type: 'single',
          options: [
            {
              id: 'well_understood',
              text: 'Well-understood problem with existing solutions',
              points: { productLed: 8, salesLed: 5, marketingLed: 5, communityLed: 5, operationsLed: 8 }
            },
            {
              id: 'somewhat_familiar',
              text: 'Somewhat familiar problem with some education needed',
              points: { productLed: 5, salesLed: 7, marketingLed: 8, communityLed: 7, operationsLed: 5 }
            },
            {
              id: 'new_category',
              text: 'New category creation requiring significant education',
              points: { productLed: 3, salesLed: 8, marketingLed: 10, communityLed: 7, operationsLed: 3 }
            },
            {
              id: 'complex_problem',
              text: 'Complex problem requiring consultative approach',
              points: { productLed: 0, salesLed: 10, marketingLed: 5, communityLed: 3, operationsLed: 5 }
            }
          ]
        },
        {
          id: 'team_strengths',
          text: 'What are your team\'s core strengths? (Select all that apply)',
          type: 'multiple',
          options: [
            {
              id: 'product_design',
              text: 'Product design and development',
              points: { productLed: 10, salesLed: 2, marketingLed: 3, communityLed: 5, operationsLed: 3 }
            },
            {
              id: 'sales_experience',
              text: 'Sales experience and relationship building',
              points: { productLed: 2, salesLed: 10, marketingLed: 3, communityLed: 5, operationsLed: 3 }
            },
            {
              id: 'marketing_content',
              text: 'Marketing, content creation, and storytelling',
              points: { productLed: 3, salesLed: 3, marketingLed: 10, communityLed: 7, operationsLed: 2 }
            },
            {
              id: 'community_building',
              text: 'Community building and engagement',
              points: { productLed: 3, salesLed: 2, marketingLed: 5, communityLed: 10, operationsLed: 2 }
            },
            {
              id: 'operations_process',
              text: 'Operations, process design, and efficiency',
              points: { productLed: 3, salesLed: 3, marketingLed: 2, communityLed: 2, operationsLed: 10 }
            }
          ]
        }
      ]
    },
    tools: [
      {
        id: 'growth-strategy-calculator',
        title: 'Growth Strategy Calculator',
        description: 'Analyze your business model and resources to determine the optimal growth strategy',
        type: 'calculator'
      },
      {
        id: 'bottleneck-identifier',
        title: 'Growth Bottleneck Identifier',
        description: 'Identify the current constraints limiting your growth potential',
        type: 'calculator'
      },
      {
        id: 'growth-roadmap-template',
        title: 'Growth Roadmap Template',
        description: 'Create a strategic roadmap for your growth initiatives over the next 12 months',
        type: 'template',
        url: 'https://docs.google.com/spreadsheets/d/1-example-growth-roadmap'
      }
    ]
  },
  {
    id: 'product-market-fit',
    title: 'Product-Market Fit Validation',
    description: 'Measure, validate, and strengthen your product-market fit',
    order: 1,
    content: `# Product-Market Fit Validation

## The Foundation of Sustainable Growth

Before you can effectively scale your business, you need to ensure you have strong product-market fit (PMF). Without it, you'll be wasting resources trying to grow something that people don't truly want or need.

## What is Product-Market Fit?

Product-market fit occurs when:

1. Your product solves a significant problem for a specific market
2. Customers recognize this value and are willing to pay for it
3. The solution is better than existing alternatives
4. You can acquire customers at a cost that allows for profitability

As Marc Andreessen famously said: "Product-market fit means being in a good market with a product that can satisfy that market."

## Why PMF Must Come Before Scale

Scaling without PMF leads to:

- **Wasted resources** on acquiring customers who won't stick around
- **False signals** that can lead to incorrect strategic decisions
- **Premature optimization** of the wrong aspects of your business
- **Organizational strain** without the revenue to support it
- **Loss of focus** on what actually matters - solving a real problem

## The Four Levels of Product-Market Fit

Product-market fit exists on a spectrum:

### Level 1: Problem-Solution Fit
- You've identified a real problem worth solving
- You have evidence that your solution addresses this problem
- Early users show interest and engagement

### Level 2: Minimum Viable Product (MVP) Fit
- Your product delivers core value to early adopters
- Users are actively using key features
- You're getting positive feedback and initial word-of-mouth

### Level 3: Monetization Fit
- Customers are willing to pay for your solution
- Your unit economics are viable (LTV > CAC)
- You have a repeatable sales or conversion process

### Level 4: Scale Fit
- You have predictable acquisition channels
- Strong retention and expansion metrics
- Clear ideal customer profile and positioning

## How to Measure Product-Market Fit

There are several frameworks to measure PMF:

### 1. The Sean Ellis Test

Ask your users: "How would you feel if you could no longer use [product]?"
- **>40% "very disappointed"**: You have PMF
- **25-40% "very disappointed"**: You're on the right track
- **<25% "very disappointed"**: You need significant changes

### 2. Retention Cohort Analysis

Track how many users continue to use your product over time:
- A retention curve that flattens (doesn't go to zero) indicates PMF
- Different retention patterns across segments help identify your core users
- Improving retention for key segments is often more valuable than acquisition

### 3. Net Promoter Score (NPS)

Ask: "On a scale of 0-10, how likely are you to recommend [product] to a friend or colleague?"
- **Promoters (9-10)**: Loyal enthusiasts who will fuel growth
- **Passives (7-8)**: Satisfied but vulnerable to competitive offerings
- **Detractors (0-6)**: Unhappy customers who can damage growth
- **NPS = % Promoters - % Detractors**

### 4. Customer Interviews

Qualitative research to deeply understand customer problems, needs, and experiences:
- What problem were you trying to solve when you started using our product?
- What solutions did you try before ours?
- What made you choose our product over alternatives?
- What would you improve about our product?
- How would you feel if our product was no longer available?

## Strengthening Product-Market Fit

If your PMF assessment reveals gaps, here are strategies to strengthen it:

### 1. Narrow Your Target Market
- Focus on a more specific customer segment where your solution resonates strongly
- Double down on use cases where you're seeing the most traction
- Consider vertical-specific solutions before expanding horizontally

### 2. Enhance Your Core Value Proposition
- Identify and amplify the "aha moment" that demonstrates your product's value
- Reduce time-to-value through improved onboarding and UX
- Eliminate features that distract from your core value

### 3. Improve Product-Channel Fit
- Ensure your acquisition channels match your target customers' behavior
- Test different messaging and positioning to improve conversion
- Align pricing model with the value customers receive

### 4. Build a Feedback Loop
- Implement systematic ways to collect and analyze customer feedback
- Prioritize product improvements based on impact to core value delivery
- Create a culture of customer obsession across the organization

## When You're Ready to Scale

You're ready to scale when:

1. You have quantitative evidence of strong PMF (using the frameworks above)
2. You understand exactly who your ideal customers are and why they buy
3. You have a repeatable process for acquiring and retaining customers
4. Your unit economics work (you make more from customers than it costs to acquire them)
5. You have the operational capacity to handle increased demand

In the next module, we'll explore how to build your growth engine once you've validated product-market fit.

## Case Study: How Dropbox Validated PMF Before Scaling

Before building their product, Dropbox created a simple explainer video demonstrating their concept. This video generated over 70,000 signups for their waitlist overnight, validating strong demand for their solution.

Once they launched, they measured PMF using retention cohorts and found that users who stored at least one file had significantly higher retention. This insight helped them focus their onboarding on getting users to store their first file as quickly as possible.

Only after validating strong retention did Dropbox invest heavily in growth, implementing their famous referral program that drove viral acquisition at scale.`,
    quiz: {
      title: 'Product-Market Fit Assessment',
      description: 'Let\'s evaluate your current product-market fit status.',
      questions: [
        {
          id: 'pmf_status',
          text: 'How would your customers feel if they could no longer use your product?',
          type: 'single',
          options: [
            {
              id: 'very_disappointed',
              text: 'Over 40% would be very disappointed',
              points: { productLed: 10, salesLed: 10, marketingLed: 10, communityLed: 10, operationsLed: 10 }
            },
            {
              id: 'somewhat_disappointed',
              text: '25-40% would be very disappointed',
              points: { productLed: 5, salesLed: 5, marketingLed: 5, communityLed: 5, operationsLed: 5 }
            },
            {
              id: 'not_disappointed',
              text: 'Less than 25% would be very disappointed',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            },
            {
              id: 'dont_know',
              text: 'I haven\'t measured this yet',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            }
          ]
        },
        {
          id: 'retention_curve',
          text: 'What does your user retention curve look like?',
          type: 'single',
          options: [
            {
              id: 'flattens_high',
              text: 'Flattens at a high percentage (strong retention)',
              points: { productLed: 10, salesLed: 10, marketingLed: 10, communityLed: 10, operationsLed: 10 }
            },
            {
              id: 'flattens_low',
              text: 'Flattens but at a low percentage',
              points: { productLed: 5, salesLed: 5, marketingLed: 5, communityLed: 5, operationsLed: 5 }
            },
            {
              id: 'drops_to_zero',
              text: 'Continues dropping toward zero',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            },
            {
              id: 'not_tracking',
              text: 'I\'m not tracking retention cohorts',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            }
          ]
        },
        {
          id: 'acquisition_efficiency',
          text: 'How efficient is your customer acquisition?',
          type: 'single',
          options: [
            {
              id: 'very_efficient',
              text: 'Very efficient (CAC < LTV/3)',
              points: { productLed: 10, salesLed: 10, marketingLed: 10, communityLed: 10, operationsLed: 10 }
            },
            {
              id: 'somewhat_efficient',
              text: 'Somewhat efficient (CAC < LTV)',
              points: { productLed: 5, salesLed: 5, marketingLed: 5, communityLed: 5, operationsLed: 5 }
            },
            {
              id: 'inefficient',
              text: 'Inefficient (CAC > LTV)',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            },
            {
              id: 'not_measured',
              text: 'I haven\'t measured CAC or LTV',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            }
          ]
        },
        {
          id: 'growth_source',
          text: 'Where does most of your growth come from currently?',
          type: 'single',
          options: [
            {
              id: 'word_of_mouth',
              text: 'Organic word-of-mouth and referrals',
              points: { productLed: 10, salesLed: 5, marketingLed: 5, communityLed: 10, operationsLed: 7 }
            },
            {
              id: 'marketing_channels',
              text: 'Marketing channels (content, ads, etc.)',
              points: { productLed: 5, salesLed: 3, marketingLed: 10, communityLed: 5, operationsLed: 3 }
            },
            {
              id: 'sales_outreach',
              text: 'Direct sales and outreach',
              points: { productLed: 3, salesLed: 10, marketingLed: 5, communityLed: 3, operationsLed: 5 }
            },
            {
              id: 'no_growth',
              text: 'We\'re not seeing significant growth yet',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            }
          ]
        },
        {
          id: 'customer_feedback',
          text: 'What kind of feedback do you get from customers?',
          type: 'single',
          options: [
            {
              id: 'enthusiastic',
              text: 'Enthusiastic, specific praise about core value',
              points: { productLed: 10, salesLed: 10, marketingLed: 10, communityLed: 10, operationsLed: 10 }
            },
            {
              id: 'positive',
              text: 'Generally positive but with significant feature requests',
              points: { productLed: 5, salesLed: 5, marketingLed: 5, communityLed: 5, operationsLed: 5 }
            },
            {
              id: 'mixed',
              text: 'Mixed or lukewarm feedback',
              points: { productLed: 2, salesLed: 2, marketingLed: 2, communityLed: 2, operationsLed: 2 }
            },
            {
              id: 'minimal',
              text: 'Minimal engagement or feedback',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            }
          ]
        }
      ]
    },
    checklist: {
      title: 'Product-Market Fit Validation Checklist',
      items: [
        {
          id: 'conduct_sean_ellis',
          text: 'Conduct the Sean Ellis "very disappointed" survey with at least 40 users',
          description: 'Ask "How would you feel if you could no longer use [product]?" with multiple-choice responses',
          required: true
        },
        {
          id: 'analyze_retention',
          text: 'Analyze user retention cohorts for at least 3 months',
          description: 'Track how many users continue to use your product over time, broken down by acquisition cohorts',
          required: true
        },
        {
          id: 'calculate_nps',
          text: 'Calculate your Net Promoter Score (NPS)',
          description: 'Ask users "On a scale of 0-10, how likely are you to recommend [product] to a friend or colleague?"',
          required: true
        },
        {
          id: 'conduct_interviews',
          text: 'Conduct at least 5 in-depth customer interviews',
          description: 'Use the customer interview framework to understand problems, alternatives, and value perception',
          required: true
        },
        {
          id: 'identify_core_users',
          text: 'Identify your core user segment with the strongest PMF',
          description: 'Analyze which user segments show the highest retention, engagement, and enthusiasm',
          required: true
        },
        {
          id: 'document_value_prop',
          text: 'Document your validated value proposition',
          description: 'Clearly articulate the problem you solve and why your solution is uniquely valuable',
          required: true
        },
        {
          id: 'calculate_unit_economics',
          text: 'Calculate your basic unit economics (CAC, LTV)',
          description: 'Ensure you can acquire customers at a cost that allows for profitability',
          required: false
        },
        {
          id: 'identify_improvements',
          text: 'Identify 3 key product improvements to strengthen PMF',
          description: 'Based on customer feedback, determine the highest-impact improvements',
          required: false
        }
      ]
    },
    tools: [
      {
        id: 'sean-ellis-survey-template',
        title: 'Sean Ellis Survey Template',
        description: 'Ready-to-use survey template for measuring product-market fit',
        type: 'template',
        url: 'https://docs.google.com/forms/d/1-example-sean-ellis'
      },
      {
        id: 'retention-cohort-calculator',
        title: 'Retention Cohort Calculator',
        description: 'Analyze your user retention patterns to assess product-market fit',
        type: 'calculator'
      },
      {
        id: 'customer-interview-guide',
        title: 'Customer Interview Guide',
        description: 'Comprehensive framework for conducting insightful customer interviews',
        type: 'template',
        url: 'https://docs.google.com/document/d/1-example-interview-guide'
      },
      {
        id: 'pmf-scoring-tool',
        title: 'PMF Scoring Tool',
        description: 'Quantify your product-market fit across multiple dimensions',
        type: 'calculator'
      }
    ]
  },
  {
    id: 'growth-engine',
    title: 'Building Your Growth Engine',
    description: 'Design and implement a repeatable, scalable system for sustainable growth',
    order: 2,
    content: `# Building Your Growth Engine

## From Product-Market Fit to Scalable Growth

Once you've validated product-market fit, it's time to build a systematic approach to growth. A growth engine is a repeatable, scalable system that consistently acquires, activates, retains, and monetizes customers.

## The Growth Engine Framework

A complete growth engine consists of five interconnected components:

### 1. Acquisition
How you attract potential customers to your product

### 2. Activation
How you help new users experience your product's core value

### 3. Retention
How you keep users engaged and coming back

### 4. Referral
How you leverage existing users to bring in new ones

### 5. Revenue
How you monetize and expand customer relationships

This framework, often called AARRR or "Pirate Metrics," provides a comprehensive view of your entire customer journey.

## Designing Your Acquisition Strategy

Acquisition is about finding scalable, repeatable channels to bring new users to your product. The key is to identify channels that:

1. Reach your target audience efficiently
2. Scale with your budget and resources
3. Deliver customers with strong retention and LTV potential

### Channel Strategy Development

Follow these steps to develop your acquisition channel strategy:

#### 1. Channel Brainstorming
List all potential channels that could reach your audience:

- **Organic channels**: SEO, content marketing, social media, community
- **Paid channels**: SEM, social ads, display, OOH, TV, radio
- **Partnership channels**: Integrations, co-marketing, affiliates, resellers
- **Sales channels**: Outbound, inside sales, field sales, channel partners
- **Product channels**: Viral loops, network effects, embeds, extensions

#### 2. Channel Prioritization
Score each channel on these dimensions (1-5 scale):

- **Market presence**: How many of your potential customers are there?
- **Competition**: How crowded is the channel with competitors?
- **Cost**: What's the expected CAC relative to your LTV?
- **Time to results**: How quickly will you see meaningful results?
- **Scalability**: How much can you grow through this channel?
- **Team fit**: Do you have the skills and resources to execute well?

#### 3. Channel Testing Framework
For your highest-potential channels:

1. Define clear success metrics and testing budget
2. Create minimum viable tests to validate assumptions
3. Implement tracking to measure results accurately
4. Set timeframes for evaluation and decision-making

#### 4. Channel Optimization
Once you identify promising channels:

1. Systematically test variables to improve performance
2. Develop playbooks for consistent execution
3. Build automation and tools to increase efficiency
4. Train team members on best practices

## Activation: Turning Visitors into Engaged Users

Activation is about helping new users quickly experience your product's core value. This critical step bridges acquisition and retention.

### The Activation Framework

1. **Map the ideal customer journey**
   - Identify the key steps from signup to "aha moment"
   - Define the minimum actions needed to experience value

2. **Measure your activation funnel**
   - Track conversion at each step of the journey
   - Identify where users drop off or get stuck

3. **Optimize for time-to-value**
   - Eliminate unnecessary steps and friction
   - Provide clear guidance and contextual help
   - Use progressive onboarding to avoid overwhelm

4. **Personalize the experience**
   - Tailor onboarding to user segments and use cases
   - Use what you know about users to customize their path
   - Provide relevant examples and templates

## Retention: The Growth Multiplier

Retention is often the most impactful area to focus on. Improving retention:
- Increases customer lifetime value
- Reduces pressure on acquisition
- Enables sustainable growth
- Validates product-market fit

### The Retention Framework

1. **Measure retention properly**
   - Define what "active" means for your product
   - Track cohort-based retention curves
   - Segment users to identify patterns

2. **Identify your core retention drivers**
   - What features correlate with higher retention?
   - What usage patterns predict long-term retention?
   - What user characteristics indicate better fit?

3. **Build retention-focused habits**
   - Design for repeated use and engagement
   - Create triggers and reminders (in-product and external)
   - Develop features that improve with continued use

4. **Implement proactive retention tactics**
   - Engagement emails and notifications
   - Regular product education and success content
   - Check-ins and health scores for at-risk accounts

## Referral: Turning Customers into Advocates

A well-designed referral system can significantly reduce acquisition costs and bring in pre-qualified users.

### The Referral Framework

1. **Identify your referral moments**
   - When do users experience maximum value?
   - When do they naturally want to share?
   - What triggers could prompt referral behavior?

2. **Design the referral mechanism**
   - Make it easy and frictionless to share
   - Provide clear incentives for both parties
   - Create compelling messaging that's easy to pass along

3. **Track and optimize the referral funnel**
   - Measure invite sends, accepts, and conversions
   - Test different incentives and messaging
   - Identify and remove friction points

## Revenue: Monetization and Expansion

Your revenue engine focuses on both initial conversion and expanding customer relationships over time.

### The Revenue Framework

1. **Optimize your pricing strategy**
   - Align pricing with value metrics
   - Test different pricing models and tiers
   - Implement value-based pricing where possible

2. **Improve conversion to paid**
   - Clearly communicate value proposition
   - Reduce friction in the purchase process
   - Use appropriate urgency and scarcity tactics

3. **Develop expansion revenue streams**
   - Identify upsell and cross-sell opportunities
   - Implement usage-based growth mechanisms
   - Create natural expansion paths as users grow

4. **Reduce churn and increase renewals**
   - Proactively address at-risk accounts
   - Demonstrate ongoing value and ROI
   - Make renewal processes seamless

## Integrating Your Growth Engine

While we've discussed each component separately, a truly effective growth engine integrates all these elements into a cohesive system:

1. **Align metrics and goals** across all components
2. **Create feedback loops** between different parts of the engine
3. **Build cross-functional growth teams** with clear ownership
4. **Implement regular growth reviews** to identify opportunities
5. **Develop a testing and learning culture** to continuously improve

## Case Study: How Slack Built Their Growth Engine

Slack's growth engine demonstrates how all components work together:

**Acquisition**: Focused on bottom-up adoption within teams, starting with free plans and word-of-mouth

**Activation**: Streamlined onboarding to get teams sending messages and uploading files within minutes

**Retention**: Built features like channel organization, search, and integrations that increased value over time

**Referral**: Created natural team expansion through invites and workspace sharing

**Revenue**: Implemented usage-based pricing that grew with team size and feature needs

By optimizing each component and creating virtuous cycles between them, Slack achieved extraordinary growth without massive marketing spend.

## Building Your Growth Engine Action Plan

1. **Audit your current growth system** using the frameworks above
2. **Identify your biggest opportunities** across the five components
3. **Prioritize 1-2 areas** to focus on first (usually retention and one other)
4. **Design experiments** to improve your weakest areas
5. **Build measurement systems** to track progress
6. **Create cross-functional ownership** of growth metrics

In the next module, we'll explore how to build operations that can scale with your growth.`,
    quiz: {
      title: 'Growth Engine Assessment',
      description: 'Let\'s evaluate the current state of your growth engine components.',
      questions: [
        {
          id: 'acquisition_channels',
          text: 'Which acquisition channels are currently working best for you?',
          type: 'multiple',
          options: [
            {
              id: 'organic_search',
              text: 'Organic search (SEO)',
              points: { productLed: 8, salesLed: 3, marketingLed: 10, communityLed: 5, operationsLed: 3 }
            },
            {
              id: 'paid_advertising',
              text: 'Paid advertising (PPC, social ads)',
              points: { productLed: 5, salesLed: 5, marketingLed: 10, communityLed: 3, operationsLed: 3 }
            },
            {
              id: 'content_marketing',
              text: 'Content marketing (blog, videos, podcasts)',
              points: { productLed: 7, salesLed: 5, marketingLed: 10, communityLed: 8, operationsLed: 3 }
            },
            {
              id: 'direct_sales',
              text: 'Direct sales outreach',
              points: { productLed: 2, salesLed: 10, marketingLed: 3, communityLed: 2, operationsLed: 5 }
            },
            {
              id: 'partnerships',
              text: 'Partnerships and integrations',
              points: { productLed: 7, salesLed: 7, marketingLed: 5, communityLed: 7, operationsLed: 7 }
            },
            {
              id: 'word_of_mouth',
              text: 'Word of mouth and referrals',
              points: { productLed: 10, salesLed: 5, marketingLed: 5, communityLed: 10, operationsLed: 7 }
            },
            {
              id: 'community',
              text: 'Community engagement',
              points: { productLed: 5, salesLed: 2, marketingLed: 5, communityLed: 10, operationsLed: 3 }
            }
          ]
        },
        {
          id: 'activation_rate',
          text: 'What percentage of new users successfully reach your "aha moment"?',
          type: 'single',
          options: [
            {
              id: 'high_activation',
              text: 'Over 60% reach the aha moment',
              points: { productLed: 10, salesLed: 10, marketingLed: 10, communityLed: 10, operationsLed: 10 }
            },
            {
              id: 'medium_activation',
              text: '30-60% reach the aha moment',
              points: { productLed: 5, salesLed: 5, marketingLed: 5, communityLed: 5, operationsLed: 5 }
            },
            {
              id: 'low_activation',
              text: 'Under 30% reach the aha moment',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            },
            {
              id: 'not_measured',
              text: 'We don\'t measure activation rate',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            }
          ]
        },
        {
          id: 'retention_strategy',
          text: 'How developed is your retention strategy?',
          type: 'single',
          options: [
            {
              id: 'comprehensive',
              text: 'Comprehensive with proactive measures and regular optimization',
              points: { productLed: 10, salesLed: 10, marketingLed: 10, communityLed: 10, operationsLed: 10 }
            },
            {
              id: 'basic',
              text: 'Basic retention tactics but not systematic',
              points: { productLed: 5, salesLed: 5, marketingLed: 5, communityLed: 5, operationsLed: 5 }
            },
            {
              id: 'reactive',
              text: 'Mostly reactive to churn when it happens',
              points: { productLed: 2, salesLed: 2, marketingLed: 2, communityLed: 2, operationsLed: 2 }
            },
            {
              id: 'nonexistent',
              text: 'No formal retention strategy',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            }
          ]
        },
        {
          id: 'referral_system',
          text: 'Do you have a formal referral or word-of-mouth system?',
          type: 'single',
          options: [
            {
              id: 'optimized',
              text: 'Yes, with incentives and tracking that we regularly optimize',
              points: { productLed: 10, salesLed: 7, marketingLed: 8, communityLed: 10, operationsLed: 5 }
            },
            {
              id: 'basic_system',
              text: 'Yes, but it\'s basic and not a major focus',
              points: { productLed: 5, salesLed: 5, marketingLed: 5, communityLed: 5, operationsLed: 3 }
            },
            {
              id: 'informal',
              text: 'No formal system, but we get organic referrals',
              points: { productLed: 3, salesLed: 3, marketingLed: 3, communityLed: 5, operationsLed: 3 }
            },
            {
              id: 'no_referrals',
              text: 'No, we don\'t get many referrals',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            }
          ]
        },
        {
          id: 'revenue_expansion',
          text: 'How effective is your revenue expansion strategy?',
          type: 'single',
          options: [
            {
              id: 'strong_expansion',
              text: 'Strong expansion (net revenue retention >110%)',
              points: { productLed: 10, salesLed: 10, marketingLed: 10, communityLed: 10, operationsLed: 10 }
            },
            {
              id: 'moderate_expansion',
              text: 'Moderate expansion (net revenue retention 100-110%)',
              points: { productLed: 7, salesLed: 7, marketingLed: 7, communityLed: 7, operationsLed: 7 }
            },
            {
              id: 'minimal_expansion',
              text: 'Minimal expansion (net revenue retention 90-100%)',
              points: { productLed: 3, salesLed: 3, marketingLed: 3, communityLed: 3, operationsLed: 3 }
            },
            {
              id: 'revenue_shrinking',
              text: 'Revenue is shrinking (net revenue retention <90%)',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            },
            {
              id: 'not_tracking',
              text: 'Not tracking expansion metrics',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            }
          ]
        }
      ]
    },
    checklist: {
      title: 'Growth Engine Development Checklist',
      items: [
        {
          id: 'acquisition_strategy',
          text: 'Develop a multi-channel acquisition strategy',
          description: 'Identify, prioritize, and test at least 3 acquisition channels',
          required: true
        },
        {
          id: 'activation_funnel',
          text: 'Map and optimize your activation funnel',
          description: 'Define your "aha moment" and the steps needed to get users there',
          required: true
        },
        {
          id: 'retention_analysis',
          text: 'Conduct retention analysis by cohort and segment',
          description: 'Identify patterns in user retention and the factors that drive it',
          required: true
        },
        {
          id: 'referral_program',
          text: 'Design a referral program appropriate for your business',
          description: 'Create incentives and mechanisms for existing users to refer new ones',
          required: false
        },
        {
          id: 'revenue_expansion',
          text: 'Develop a strategy for revenue expansion',
          description: 'Identify opportunities for upselling, cross-selling, or usage expansion',
          required: true
        },
        {
          id: 'growth_metrics',
          text: 'Establish key growth metrics and tracking',
          description: 'Define KPIs for each component of your growth engine',
          required: true
        },
        {
          id: 'growth_experiments',
          text: 'Create a backlog of growth experiments',
          description: 'Develop at least 10 testable hypotheses to improve your growth engine',
          required: false
        },
        {
          id: 'growth_roles',
          text: 'Define growth responsibilities within your team',
          description: 'Assign ownership for different components of the growth engine',
          required: true
        }
      ]
    },
    tools: [
      {
        id: 'channel-prioritization-matrix',
        title: 'Channel Prioritization Matrix',
        description: 'Evaluate and prioritize potential acquisition channels based on multiple factors',
        type: 'template',
        url: 'https://docs.google.com/spreadsheets/d/1-example-channel-matrix'
      },
      {
        id: 'activation-funnel-analyzer',
        title: 'Activation Funnel Analyzer',
        description: 'Visualize and optimize your user activation journey',
        type: 'calculator'
      },
      {
        id: 'retention-cohort-template',
        title: 'Retention Cohort Analysis Template',
        description: 'Track and analyze user retention over time by acquisition cohort',
        type: 'template',
        url: 'https://docs.google.com/spreadsheets/d/1-example-retention-cohort'
      },
      {
        id: 'referral-program-designer',
        title: 'Referral Program Designer',
        description: 'Create an effective referral program with the right incentives and mechanics',
        type: 'generator'
      },
      {
        id: 'growth-experiment-template',
        title: 'Growth Experiment Template',
        description: 'Structure and track your growth experiments for maximum learning',
        type: 'template',
        url: 'https://docs.google.com/document/d/1-example-growth-experiment'
      }
    ]
  },
  {
    id: 'operations-scale',
    title: 'Operations That Scale',
    description: 'Build systems and processes that support sustainable growth',
    order: 3,
    content: `# Operations That Scale

## Building the Foundation for Sustainable Growth

As your business grows, operations that worked when you were small will start to break. This module focuses on building scalable operational systems that can support your growth without creating chaos.

## Why Operations Matter for Growth

Operational excellence enables growth by:

1. **Maintaining quality** as you scale
2. **Reducing costs** through efficiency and automation
3. **Improving customer experience** with consistent delivery
4. **Freeing up resources** to focus on strategic initiatives
5. **Creating competitive advantages** through superior execution

## The Scalable Operations Framework

### 1. Process Documentation and Standardization

The first step to scalable operations is documenting and standardizing your core processes:

#### Process Mapping
- Identify your critical business processes
- Document current workflows step-by-step
- Identify bottlenecks, redundancies, and failure points
- Standardize processes for consistency

#### Standard Operating Procedures (SOPs)
- Create clear, detailed instructions for key processes
- Include roles, responsibilities, and decision rights
- Document exceptions and edge cases
- Establish quality standards and metrics

#### Process Governance
- Assign process owners for each critical process
- Establish review and update cadences
- Create feedback mechanisms for continuous improvement
- Develop training materials for new team members

### 2. Systems and Tools Architecture

The right technology stack is crucial for operational scalability:

#### Technology Stack Assessment
- Audit current tools and systems
- Identify integration points and data flows
- Evaluate scalability limitations
- Map technology to business processes

#### Build vs. Buy Decisions
- Assess core vs. context functionality
- Evaluate total cost of ownership
- Consider customization requirements
- Plan for future integration needs

#### Technology Roadmap
- Prioritize system implementations and upgrades
- Plan for data migration and system transitions
- Allocate resources for implementation and training
- Establish success metrics for technology investments

### 3. Automation and Efficiency

Identify opportunities to automate repetitive tasks and improve efficiency:

#### Automation Opportunity Assessment
- Catalog manual, repetitive processes
- Quantify time and resources spent
- Prioritize based on impact and feasibility
- Start with simple, high-impact automations

#### Automation Implementation
- Begin with "no-code" or "low-code" solutions where possible
- Document automation logic and decision rules
- Build in exception handling and monitoring
- Measure time and cost savings

#### Continuous Optimization
- Regularly review automation performance
- Identify new automation opportunities
- Refine and improve existing automations
- Balance automation with human touch points

### 4. Team Structure and Scaling

Design your organization to scale efficiently:

#### Organizational Design
- Define clear roles and responsibilities
- Create scalable team structures
- Establish reporting relationships and spans of control
- Plan for growth stages and transitions

#### Hiring and Onboarding
- Develop structured hiring processes
- Create comprehensive onboarding programs
- Build training materials and knowledge bases
- Establish performance expectations and metrics

#### Outsourcing and Partnerships
- Identify functions suitable for outsourcing
- Develop vendor selection criteria
- Create service level agreements
- Establish vendor management processes

### 5. Financial Operations

Build financial systems that support and enable growth:

#### Financial Planning and Analysis
- Develop rolling forecasts and budgets
- Create financial models for scenario planning
- Establish regular financial review cadence
- Connect financial metrics to operational KPIs

#### Cash Flow Management
- Optimize accounts receivable processes
- Manage accounts payable strategically
- Develop cash flow forecasting capabilities
- Establish cash reserves policies

#### Unit Economics Tracking
- Calculate and monitor customer acquisition costs
- Track lifetime value by customer segment
- Measure contribution margins by product/service
- Analyze payback periods and ROI

### 6. Customer Operations

Scale your ability to serve customers effectively:

#### Customer Journey Mapping
- Document end-to-end customer experience
- Identify friction points and opportunities
- Standardize customer touchpoints
- Measure satisfaction at key moments

#### Support Scalability
- Develop tiered support models
- Create self-service knowledge bases
- Implement ticketing and case management
- Establish SLAs and performance metrics

#### Customer Success Systems
- Build proactive customer health monitoring
- Develop playbooks for common scenarios
- Create scalable onboarding processes
- Implement account expansion frameworks

## Operational Maturity Model

As you scale, your operations will evolve through these stages:

### Stage 1: Ad Hoc
- Processes are undocumented and inconsistent
- Heavy reliance on tribal knowledge
- Manual execution with minimal tools
- Reactive problem-solving

### Stage 2: Emerging
- Key processes are documented
- Basic tools implemented
- Some standardization, but still person-dependent
- Beginning to measure operational metrics

### Stage 3: Defined
- Standardized processes across the organization
- Integrated tools and systems
- Clear roles and responsibilities
- Regular reporting and reviews

### Stage 4: Optimized
- Continuous improvement processes
- Automation of routine tasks
- Data-driven decision making
- Proactive problem prevention

### Stage 5: Innovative
- Operations as competitive advantage
- Predictive analytics and insights
- Highly efficient resource utilization
- Adaptable to changing conditions

## Prioritizing Operational Improvements

Not everything needs to be perfect before you scale. Focus on:

1. **Customer-facing operations** that directly impact experience
2. **Revenue operations** that affect your ability to sell and deliver
3. **Financial operations** that ensure cash flow and profitability
4. **People operations** that enable team growth and performance
5. **Support operations** that maintain infrastructure and systems

## Case Study: How Shopify Scaled Operations

Shopify's growth from serving small merchants to powering enterprise e-commerce required significant operational scaling:

1. They built a **modular architecture** that allowed different components to scale independently

2. They implemented **automated testing and deployment** to maintain quality while increasing development velocity

3. They created **tiered support systems** with specialized teams for different merchant segments

4. They developed **self-serve merchant education** through Shopify Academy to reduce support burden

5. They built **partner ecosystems** to extend capabilities without linear team growth

The result was the ability to serve millions of merchants while maintaining high service quality and continuing to innovate rapidly.

## Building Your Operational Scaling Plan

1. **Assess your current operational maturity** using the model above
2. **Identify your biggest operational bottlenecks** to growth
3. **Prioritize improvements** based on impact and urgency
4. **Create a phased implementation plan** with clear milestones
5. **Assign ownership** for key operational areas
6. **Establish metrics** to track operational performance
7. **Review and adjust** as you grow

In the next module, we'll explore how to build a team and culture that can scale with your business.`,
    quiz: {
      title: 'Operational Scalability Assessment',
      description: 'Let\'s evaluate how ready your operations are to support growth.',
      questions: [
        {
          id: 'process_documentation',
          text: 'How well documented are your core business processes?',
          type: 'single',
          options: [
            {
              id: 'comprehensive',
              text: 'Comprehensive documentation with regular updates',
              points: { productLed: 10, salesLed: 10, marketingLed: 10, communityLed: 10, operationsLed: 10 }
            },
            {
              id: 'partial',
              text: 'Partial documentation of key processes',
              points: { productLed: 5, salesLed: 5, marketingLed: 5, communityLed: 5, operationsLed: 5 }
            },
            {
              id: 'minimal',
              text: 'Minimal documentation, mostly tribal knowledge',
              points: { productLed: 2, salesLed: 2, marketingLed: 2, communityLed: 2, operationsLed: 2 }
            },
            {
              id: 'none',
              text: 'No formal documentation',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            }
          ]
        },
        {
          id: 'systems_integration',
          text: 'How integrated are your business systems and tools?',
          type: 'single',
          options: [
            {
              id: 'fully_integrated',
              text: 'Fully integrated with automated data flows',
              points: { productLed: 10, salesLed: 10, marketingLed: 10, communityLed: 10, operationsLed: 10 }
            },
            {
              id: 'partially_integrated',
              text: 'Partially integrated with some manual steps',
              points: { productLed: 5, salesLed: 5, marketingLed: 5, communityLed: 5, operationsLed: 5 }
            },
            {
              id: 'minimal_integration',
              text: 'Minimal integration, mostly siloed systems',
              points: { productLed: 2, salesLed: 2, marketingLed: 2, communityLed: 2, operationsLed: 2 }
            },
            {
              id: 'manual_processes',
              text: 'Primarily manual processes with basic tools',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            }
          ]
        },
        {
          id: 'automation_level',
          text: 'What level of automation exists in your core processes?',
          type: 'single',
          options: [
            {
              id: 'highly_automated',
              text: 'Highly automated with minimal manual intervention',
              points: { productLed: 10, salesLed: 10, marketingLed: 10, communityLed: 10, operationsLed: 10 }
            },
            {
              id: 'partially_automated',
              text: 'Key processes partially automated',
              points: { productLed: 5, salesLed: 5, marketingLed: 5, communityLed: 5, operationsLed: 5 }
            },
            {
              id: 'minimal_automation',
              text: 'Minimal automation, mostly manual work',
              points: { productLed: 2, salesLed: 2, marketingLed: 2, communityLed: 2, operationsLed: 2 }
            },
            {
              id: 'no_automation',
              text: 'No significant automation',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            }
          ]
        },
        {
          id: 'financial_operations',
          text: 'How mature are your financial operations?',
          type: 'single',
          options: [
            {
              id: 'sophisticated',
              text: 'Sophisticated with forecasting, unit economics tracking, and regular reviews',
              points: { productLed: 10, salesLed: 10, marketingLed: 10, communityLed: 10, operationsLed: 10 }
            },
            {
              id: 'established',
              text: 'Established systems with basic reporting and analysis',
              points: { productLed: 5, salesLed: 5, marketingLed: 5, communityLed: 5, operationsLed: 5 }
            },
            {
              id: 'basic',
              text: 'Basic bookkeeping and compliance only',
              points: { productLed: 2, salesLed: 2, marketingLed: 2, communityLed: 2, operationsLed: 2 }
            },
            {
              id: 'minimal',
              text: 'Minimal financial tracking',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            }
          ]
        },
        {
          id: 'customer_operations',
          text: 'How scalable are your customer-facing operations?',
          type: 'single',
          options: [
            {
              id: 'highly_scalable',
              text: 'Highly scalable with self-service, automation, and tiered support',
              points: { productLed: 10, salesLed: 10, marketingLed: 10, communityLed: 10, operationsLed: 10 }
            },
            {
              id: 'moderately_scalable',
              text: 'Moderately scalable with some systems and processes',
              points: { productLed: 5, salesLed: 5, marketingLed: 5, communityLed: 5, operationsLed: 5 }
            },
            {
              id: 'limited_scalability',
              text: 'Limited scalability, would strain with significant growth',
              points: { productLed: 2, salesLed: 2, marketingLed: 2, communityLed: 2, operationsLed: 2 }
            },
            {
              id: 'not_scalable',
              text: 'Not scalable, highly dependent on specific people',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            }
          ]
        }
      ]
    },
    checklist: {
      title: 'Operational Scaling Checklist',
      items: [
        {
          id: 'document_core_processes',
          text: 'Document your core business processes',
          description: 'Create step-by-step documentation for critical operational workflows',
          required: true
        },
        {
          id: 'create_sops',
          text: 'Create standard operating procedures (SOPs) for key functions',
          description: 'Develop detailed instructions for consistent execution of important tasks',
          required: true
        },
        {
          id: 'tech_stack_assessment',
          text: 'Assess your technology stack for scalability',
          description: 'Evaluate current systems and identify gaps or limitations',
          required: true
        },
        {
          id: 'automation_opportunities',
          text: 'Identify and prioritize automation opportunities',
          description: 'List manual processes that could be automated and rank by impact',
          required: true
        },
        {
          id: 'financial_reporting',
          text: 'Establish regular financial reporting and reviews',
          description: 'Create dashboards and cadence for monitoring financial performance',
          required: true
        },
        {
          id: 'customer_journey',
          text: 'Map and optimize the end-to-end customer journey',
          description: 'Document all customer touchpoints and identify improvement opportunities',
          required: false
        },
        {
          id: 'scalable_support',
          text: 'Implement scalable customer support systems',
          description: 'Set up tiered support, knowledge base, and appropriate tools',
          required: false
        },
        {
          id: 'operational_metrics',
          text: 'Define and track key operational metrics',
          description: 'Establish KPIs for operational performance and efficiency',
          required: true
        }
      ]
    },
    tools: [
      {
        id: 'process-mapping-template',
        title: 'Process Mapping Template',
        description: 'Document your business processes with this structured template',
        type: 'template',
        url: 'https://docs.google.com/spreadsheets/d/1-example-process-mapping'
      },
      {
        id: 'sop-template',
        title: 'Standard Operating Procedure Template',
        description: 'Create comprehensive SOPs for consistent execution',
        type: 'template',
        url: 'https://docs.google.com/document/d/1-example-sop-template'
      },
      {
        id: 'tech-stack-assessment',
        title: 'Technology Stack Assessment Tool',
        description: 'Evaluate your current systems and plan for scaling',
        type: 'calculator'
      },
      {
        id: 'automation-roi-calculator',
        title: 'Automation ROI Calculator',
        description: 'Calculate the return on investment for automation initiatives',
        type: 'calculator'
      },
      {
        id: 'customer-journey-mapper',
        title: 'Customer Journey Mapping Tool',
        description: 'Visualize and optimize your end-to-end customer experience',
        type: 'template',
        url: 'https://docs.google.com/spreadsheets/d/1-example-journey-map'
      }
    ]
  },
  {
    id: 'team-culture',
    title: 'Team & Culture Foundation',
    description: 'Build a team and culture that can scale with your business',
    order: 4,
    content: `# Team & Culture Foundation

## Building a Team That Scales

As your business grows, your team and culture will become either your greatest asset or your biggest liability. This module focuses on building a strong foundation that can support your growth ambitions.

## Why Team and Culture Matter for Scale

The right team and culture enable growth by:

1. **Attracting and retaining top talent**
2. **Maintaining quality and consistency** as you grow
3. **Enabling faster, better decisions** throughout the organization
4. **Reducing coordination costs** and bureaucracy
5. **Creating resilience** during challenging periods

## The Scalable Team Framework

### 1. Organizational Design

Your org structure needs to evolve as you grow:

#### Startup Phase (1-10 people)
- Flat structure with generalists
- Founder-led with direct communication
- Minimal formal processes
- Everyone contributes across functions

#### Early Growth Phase (10-50 people)
- Basic functional structure emerges
- Team leads with direct reports
- Core processes become formalized
- Specialization begins

#### Scaling Phase (50-200 people)
- Clear functional departments
- Management layers develop
- Formalized processes and systems
- Specialized roles and expertise

#### Maturity Phase (200+ people)
- Multiple organizational layers
- Possible matrix or divisional structures
- Comprehensive systems and processes
- Highly specialized roles

#### Designing for Your Next Phase
1. **Anticipate needs** before they become urgent
2. **Create clear reporting lines** and decision rights
3. **Balance specialization** with cross-functional collaboration
4. **Design for communication flow**, not just hierarchy
5. **Build flexibility** to adapt as you learn

### 2. Hiring Strategy

Your ability to hire effectively will be a major constraint or enabler of growth:

#### Hiring Philosophy
- Define your hiring bar and non-negotiables
- Decide between hiring for experience vs. potential
- Determine culture fit vs. culture add approach
- Balance specialist vs. generalist needs

#### Hiring Process Design
- Create structured interview processes
- Develop role-specific evaluation criteria
- Implement consistent assessment methods
- Build diverse interview panels

#### Scaling Recruitment
- Develop your employer brand and value proposition
- Create a candidate pipeline strategy
- Build relationships with talent sources
- Implement applicant tracking and management
- Consider recruitment partners for scaling

### 3. Onboarding and Development

Getting new team members productive quickly becomes critical as you scale:

#### Onboarding System
- Create comprehensive onboarding playbooks
- Develop role-specific training materials
- Establish buddy/mentor programs
- Set clear 30/60/90 day expectations
- Build feedback mechanisms to improve

#### Continuous Development
- Implement regular performance reviews
- Create growth paths for key roles
- Develop internal training programs
- Support external learning opportunities
- Build knowledge sharing systems

### 4. Culture and Values

Your culture is what happens when no one is watching:

#### Defining Core Values
- Identify behaviors that drive success
- Articulate values that guide decisions
- Ensure values are authentic and actionable
- Create simple, memorable expressions

#### Operationalizing Values
- Incorporate values into hiring criteria
- Recognize and reward values-aligned behaviors
- Address values violations consistently
- Use values for decision-making frameworks
- Regularly reinforce through communication

#### Culture Maintenance
- Measure cultural health regularly
- Identify cultural carriers and champions
- Create rituals that reinforce culture
- Adapt cultural practices as you grow
- Preserve core while evolving practices

### 5. Communication Systems

As you scale, information flow becomes increasingly challenging:

#### Communication Principles
- Default to transparency where possible
- Establish what, when, how, and who for key information
- Balance synchronous and asynchronous communication
- Create appropriate documentation standards
- Design for information discovery, not just sharing

#### Communication Cadences
- Establish regular team meeting rhythms
- Create cascading information flows
- Implement appropriate reporting and dashboards
- Design effective 1:1 meeting frameworks
- Build cross-functional communication channels

#### Communication Tools
- Select appropriate tools for different purposes
- Create usage guidelines and expectations
- Implement information architecture
- Train team on effective tool usage
- Regularly audit and optimize

### 6. Decision-Making Frameworks

Clear decision processes prevent bottlenecks as you scale:

#### Decision Rights
- Clarify who can make which decisions
- Implement appropriate approval thresholds
- Document decision-making authority
- Balance autonomy with alignment

#### Decision Frameworks
- RACI (Responsible, Accountable, Consulted, Informed)
- RAPID (Recommend, Agree, Perform, Input, Decide)
- Consensus vs. consultation vs. command
- Decision velocity vs. quality tradeoffs

#### Decision Documentation
- Create decision logs for important choices
- Document rationale and alternatives considered
- Communicate decisions effectively
- Review outcomes and learn from results

## Common Team Scaling Challenges

### 1. The Communication Breakdown
As teams grow, information doesn't flow as easily. Combat this with:
- Structured communication systems
- Documentation culture
- Information accessibility tools
- Regular cross-team touchpoints

### 2. The Process Pendulum
Teams often swing between too little and too much process. Find balance with:
- Process where it reduces friction
- Clear process ownership and evolution
- Regular process reviews and optimization
- Appropriate process for stage and function

### 3. The Culture Dilution
Rapid hiring can dilute culture. Preserve it through:
- Deliberate culture onboarding
- Values-based recognition
- Cultural ambassadors program
- Regular culture health checks

### 4. The Management Gap
First-time managers often struggle. Support them with:
- Management training programs
- Clear expectations and frameworks
- Peer support networks
- Regular coaching and feedback

### 5. The Coordination Cost
More people means exponentially more coordination. Reduce this with:
- Clear team mandates and boundaries
- Decision-making frameworks
- Appropriate autonomy
- Cross-functional processes

## Case Study: How Atlassian Scaled Their Team

Atlassian grew from a small team to thousands of employees while maintaining a strong culture:

1. They created **documented values** that guided decisions at all levels

2. They implemented **"ShipIt Days"** (hackathons) to preserve innovation as they grew

3. They developed the **"Team Playbook"** to share best practices across the organization

4. They used **"Health Monitors"** for teams to self-assess and improve

5. They maintained a **"no assholes" hiring policy** even when scaling rapidly

The result was the ability to scale while preserving their innovative culture and maintaining product quality.

## Building Your Team Scaling Plan

1. **Assess your current team structure** and identify scaling limitations
2. **Document your core values** and how they translate to behaviors
3. **Design your next-stage organization** structure
4. **Create hiring plans** for critical roles
5. **Develop onboarding and training** systems
6. **Implement communication frameworks** appropriate for your size
7. **Establish decision-making processes** that balance speed and alignment

In the next module, we'll explore how to implement metrics and optimization frameworks to continuously improve as you scale.`,
    quiz: {
      title: 'Team & Culture Assessment',
      description: 'Let\'s evaluate your team and culture readiness for scaling.',
      questions: [
        {
          id: 'org_structure',
          text: 'How well-defined is your organizational structure?',
          type: 'single',
          options: [
            {
              id: 'well_defined',
              text: 'Well-defined with clear roles, reporting lines, and decision rights',
              points: { productLed: 10, salesLed: 10, marketingLed: 10, communityLed: 10, operationsLed: 10 }
            },
            {
              id: 'somewhat_defined',
              text: 'Somewhat defined but with some ambiguity',
              points: { productLed: 5, salesLed: 5, marketingLed: 5, communityLed: 5, operationsLed: 5 }
            },
            {
              id: 'loosely_defined',
              text: 'Loosely defined and mostly informal',
              points: { productLed: 2, salesLed: 2, marketingLed: 2, communityLed: 2, operationsLed: 2 }
            },
            {
              id: 'undefined',
              text: 'Undefined or constantly changing',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            }
          ]
        },
        {
          id: 'hiring_process',
          text: 'How structured is your hiring process?',
          type: 'single',
          options: [
            {
              id: 'very_structured',
              text: 'Very structured with consistent evaluation criteria and stages',
              points: { productLed: 10, salesLed: 10, marketingLed: 10, communityLed: 10, operationsLed: 10 }
            },
            {
              id: 'somewhat_structured',
              text: 'Somewhat structured but varies by role or hiring manager',
              points: { productLed: 5, salesLed: 5, marketingLed: 5, communityLed: 5, operationsLed: 5 }
            },
            {
              id: 'minimal_structure',
              text: 'Minimal structure, mostly based on interviews and gut feel',
              points: { productLed: 2, salesLed: 2, marketingLed: 2, communityLed: 2, operationsLed: 2 }
            },
            {
              id: 'ad_hoc',
              text: 'Ad hoc and reactive when we need someone',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            }
          ]
        },
        {
          id: 'onboarding',
          text: 'How comprehensive is your employee onboarding?',
          type: 'single',
          options: [
            {
              id: 'comprehensive',
              text: 'Comprehensive with role-specific training and clear milestones',
              points: { productLed: 10, salesLed: 10, marketingLed: 10, communityLed: 10, operationsLed: 10 }
            },
            {
              id: 'basic',
              text: 'Basic onboarding covering essential information',
              points: { productLed: 5, salesLed: 5, marketingLed: 5, communityLed: 5, operationsLed: 5 }
            },
            {
              id: 'minimal',
              text: 'Minimal onboarding, mostly learn as you go',
              points: { productLed: 2, salesLed: 2, marketingLed: 2, communityLed: 2, operationsLed: 2 }
            },
            {
              id: 'nonexistent',
              text: 'No formal onboarding process',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            }
          ]
        },
        {
          id: 'values_definition',
          text: 'How well-defined and operationalized are your company values?',
          type: 'single',
          options: [
            {
              id: 'well_operationalized',
              text: 'Well-defined and actively used in decisions and recognition',
              points: { productLed: 10, salesLed: 10, marketingLed: 10, communityLed: 10, operationsLed: 10 }
            },
            {
              id: 'defined_not_operationalized',
              text: 'Defined but not consistently operationalized',
              points: { productLed: 5, salesLed: 5, marketingLed: 5, communityLed: 5, operationsLed: 5 }
            },
            {
              id: 'informally_defined',
              text: 'Informally defined but not documented',
              points: { productLed: 2, salesLed: 2, marketingLed: 2, communityLed: 2, operationsLed: 2 }
            },
            {
              id: 'not_defined',
              text: 'Not defined or articulated',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            }
          ]
        },
        {
          id: 'decision_making',
          text: 'How clear are your decision-making processes?',
          type: 'single',
          options: [
            {
              id: 'very_clear',
              text: 'Very clear with defined frameworks and authorities',
              points: { productLed: 10, salesLed: 10, marketingLed: 10, communityLed: 10, operationsLed: 10 }
            },
            {
              id: 'somewhat_clear',
              text: 'Somewhat clear but with some ambiguity',
              points: { productLed: 5, salesLed: 5, marketingLed: 5, communityLed: 5, operationsLed: 5 }
            },
            {
              id: 'unclear',
              text: 'Unclear or inconsistent across the organization',
              points: { productLed: 2, salesLed: 2, marketingLed: 2, communityLed: 2, operationsLed: 2 }
            },
            {
              id: 'ad_hoc_decisions',
              text: 'Ad hoc and highly centralized',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            }
          ]
        }
      ]
    },
    checklist: {
      title: 'Team & Culture Scaling Checklist',
      items: [
        {
          id: 'document_values',
          text: 'Document your core values and behaviors',
          description: 'Define what your company stands for and how that translates to everyday actions',
          required: true
        },
        {
          id: 'org_structure',
          text: 'Create an organizational structure for your next growth phase',
          description: 'Design roles, reporting relationships, and team structures to support growth',
          required: true
        },
        {
          id: 'hiring_process',
          text: 'Develop a structured hiring process',
          description: 'Create job descriptions, interview guides, and evaluation criteria',
          required: true
        },
        {
          id: 'onboarding_program',
          text: 'Build a comprehensive onboarding program',
          description: 'Create materials and processes to get new hires productive quickly',
          required: true
        },
        {
          id: 'communication_system',
          text: 'Establish communication systems and cadences',
          description: 'Define how information flows through the organization',
          required: true
        },
        {
          id: 'decision_framework',
          text: 'Implement decision-making frameworks',
          description: 'Clarify who makes which decisions and how they should be made',
          required: false
        },
        {
          id: 'performance_management',
          text: 'Create a performance management system',
          description: 'Develop processes for feedback, reviews, and development',
          required: false
        },
        {
          id: 'culture_initiatives',
          text: 'Plan culture-building initiatives and rituals',
          description: 'Design activities that reinforce your values and build community',
          required: true
        }
      ]
    },
    tools: [
      {
        id: 'values-definition-workshop',
        title: 'Values Definition Workshop',
        description: 'Collaborative process to define and articulate your company values',
        type: 'template',
        url: 'https://docs.google.com/presentation/d/1-example-values-workshop'
      },
      {
        id: 'org-design-template',
        title: 'Organizational Design Template',
        description: 'Create and visualize your ideal organizational structure',
        type: 'template',
        url: 'https://docs.google.com/spreadsheets/d/1-example-org-design'
      },
      {
        id: 'hiring-process-builder',
        title: 'Hiring Process Builder',
        description: 'Design a structured hiring process with interview guides',
        type: 'template',
        url: 'https://docs.google.com/document/d/1-example-hiring-process'
      },
      {
        id: 'onboarding-checklist-generator',
        title: 'Onboarding Checklist Generator',
        description: 'Create comprehensive onboarding plans for different roles',
        type: 'generator'
      },
      {
        id: 'decision-framework-template',
        title: 'Decision Framework Template',
        description: 'Implement RACI or other decision-making frameworks',
        type: 'template',
        url: 'https://docs.google.com/spreadsheets/d/1-example-decision-framework'
      },
      {
        id: 'culture-survey-template',
        title: 'Culture Survey Template',
        description: 'Measure and track your company culture health',
        type: 'template',
        url: 'https://docs.google.com/forms/d/1-example-culture-survey'
      }
    ]
  },
  {
    id: 'metrics-optimization',
    title: 'Metrics & Optimization Framework',
    description: 'Implement systems to measure, analyze, and continuously improve your business',
    order: 5,
    content: `# Metrics & Optimization Framework

## Measuring What Matters for Growth

As the saying goes, "What gets measured gets managed." This module focuses on building a comprehensive metrics and optimization framework to drive continuous improvement as you scale.

## Why Metrics Matter for Scaling

The right metrics framework enables growth by:

1. **Providing visibility** into what's working and what's not
2. **Aligning teams** around common goals and priorities
3. **Enabling data-driven decisions** instead of opinions
4. **Identifying opportunities** for optimization and improvement
5. **Creating accountability** for results

## The Metrics Hierarchy

Not all metrics are created equal. A well-designed metrics framework has multiple levels:

### 1. North Star Metric

Your North Star Metric (NSM) is the single most important measure of your company's success. It should:
- Reflect the core value you deliver to customers
- Align with long-term business success
- Be simple to understand and communicate
- Drive the right behaviors across the organization

Examples of effective North Star Metrics:
- Airbnb: Nights Booked
- Facebook: Daily Active Users
- Slack: Messages Sent
- Shopify: Merchant GMV
- Spotify: Time Spent Listening

### 2. Key Performance Indicators (KPIs)

KPIs are the primary metrics that track performance across major business functions. Effective KPIs:
- Directly influence your North Star Metric
- Provide a balanced view of the business
- Are actionable and can be influenced by the team
- Have clear ownership and accountability

Common KPI categories:
- **Acquisition KPIs**: CAC, CAC Payback, Channel Efficiency
- **Engagement KPIs**: DAU/MAU, Core Action Frequency
- **Retention KPIs**: Churn Rate, Retention by Cohort
- **Revenue KPIs**: MRR, ARPU, LTV
- **Unit Economics KPIs**: Gross Margin, Contribution Margin

### 3. Driver Metrics

Driver metrics are the operational metrics that influence your KPIs. They:
- Provide deeper insights into specific areas
- Help diagnose issues when KPIs change
- Guide day-to-day optimization efforts
- Often have functional or team-level ownership

Examples of driver metrics:
- **Marketing**: Click-through Rate, Conversion Rate by Channel
- **Product**: Feature Adoption, Time to Value
- **Sales**: Pipeline Coverage, Conversion by Stage
- **Customer Success**: Time to Resolution, NPS
- **Finance**: Cash Burn Rate, Runway

### 4. Experimental Metrics

Experimental metrics are temporary measures used to evaluate specific initiatives or experiments:
- Tied to specific hypotheses
- Time-bound measurement periods
- Clear success/failure criteria
- Designed to inform specific decisions

## Building Your Metrics Framework

### 1. Define Your North Star Metric

To identify your North Star Metric:

1. **Clarify your core value proposition**
   - What is the primary value you deliver to customers?
   - How do customers measure success with your product?

2. **Identify metrics that capture this value**
   - What measurable activities reflect value delivery?
   - Which metrics correlate with customer success?

3. **Test against key criteria**
   - Does it reflect customer value?
   - Does it align with business success?
   - Is it a leading (not lagging) indicator?
   - Can it be influenced by teams across the company?

4. **Validate with data**
   - Does it correlate with retention and growth?
   - Does it predict customer lifetime value?

### 2. Establish Your KPI Framework

To build your KPI framework:

1. **Map the customer journey**
   - Acquisition → Activation → Retention → Referral → Revenue

2. **Define 1-3 KPIs for each stage**
   - What best measures success at each stage?
   - What metrics will drive the right behaviors?

3. **Set targets and thresholds**
   - What represents good/great/poor performance?
   - What growth rates are needed to hit business goals?

4. **Assign clear ownership**
   - Who is responsible for each KPI?
   - Who has authority to make changes that affect it?

### 3. Develop Driver Metrics

For each KPI, identify the operational drivers:

1. **Brainstorm potential drivers**
   - What factors influence this KPI?
   - What levers can we pull to improve it?

2. **Validate with data**
   - Which factors show statistical correlation?
   - What is the relative impact of each driver?

3. **Create driver trees**
   - Map the relationships between drivers and KPIs
   - Identify common drivers that affect multiple KPIs

4. **Prioritize by impact and controllability**
   - Which drivers have the biggest impact?
   - Which can we most easily influence?

## Implementing Your Measurement System

### 1. Data Infrastructure

Your metrics are only as good as your data:

#### Data Collection
- Implement comprehensive event tracking
- Ensure consistent user and account identification
- Capture contextual metadata for segmentation
- Validate data accuracy and completeness

#### Data Storage
- Design schemas for efficient analysis
- Implement appropriate data warehousing
- Plan for data volume growth
- Consider data retention policies

#### Data Access
- Create self-serve access for stakeholders
- Implement appropriate security controls
- Document data definitions and sources
- Provide training on data tools

### 2. Reporting and Visualization

Make metrics accessible and actionable:

#### Dashboards
- Create role-specific dashboards
- Design for clarity and focus
- Include context and benchmarks
- Update at appropriate frequencies

#### Alerts and Notifications
- Set thresholds for key metrics
- Create automated alerts for anomalies
- Design escalation processes
- Prevent alert fatigue

#### Narrative and Context
- Provide interpretation alongside data
- Include relevant external factors
- Show historical trends and patterns
- Link to deeper analysis resources

### 3. Meeting and Review Cadences

Embed metrics into your operating rhythm:

#### Daily/Weekly Operational Reviews
- Focus on driver metrics
- Identify immediate action items
- Track experiment progress
- Address emerging issues

#### Monthly Business Reviews
- Review KPI performance
- Assess strategic initiatives
- Make resource allocation decisions
- Identify cross-functional opportunities

#### Quarterly Strategic Reviews
- Evaluate progress toward North Star
- Assess competitive position
- Review major strategic bets
- Set priorities for coming quarter

## The Optimization Framework

Metrics alone don't drive improvement. You need a systematic approach to optimization:

### 1. Opportunity Identification

Systematically identify improvement opportunities:

#### Data Analysis
- Look for anomalies and patterns
- Identify high-variance areas
- Compare segments and cohorts
- Benchmark against industry standards

#### User Research
- Conduct customer interviews
- Analyze support tickets and feedback
- Implement user testing
- Create customer advisory boards

#### Team Input
- Gather frontline insights
- Run cross-functional ideation sessions
- Create idea submission systems
- Review competitor approaches

### 2. Hypothesis Development

Turn opportunities into testable hypotheses:

#### Hypothesis Structure
- "We believe that [change] will result in [outcome] because [rationale]."
- Include clear success metrics
- Define minimum success criteria
- Identify potential risks and side effects

#### Prioritization Framework
- Impact: How much will this move the needle?
- Confidence: How certain are we about the outcome?
- Effort: How much resource is required?
- ICE Score = Impact × Confidence ÷ Effort

### 3. Experimentation Process

Run disciplined experiments to test hypotheses:

#### Experiment Design
- Define clear test and control groups
- Determine sample size and duration
- Control for external variables
- Plan for statistical significance

#### Implementation
- Document experiment details
- Minimize implementation variables
- Monitor for unexpected issues
- Maintain test integrity

#### Analysis
- Compare results to hypothesis
- Check for statistical significance
- Look for segment-specific impacts
- Identify learnings beyond the hypothesis

### 4. Implementation and Scaling

Turn successful experiments into standard practice:

#### Rollout Planning
- Design phased implementation
- Create training and documentation
- Establish monitoring systems
- Plan for potential issues

#### Change Management
- Communicate the why behind changes
- Train affected team members
- Address concerns and resistance
- Celebrate wins and share success stories

#### Continuous Improvement
- Monitor post-implementation performance
- Gather feedback and iterate
- Document learnings for future reference
- Identify follow-on opportunities

## Building a Data-Driven Culture

Metrics and optimization work best in the right culture:

### 1. Leadership Behaviors
- Make decisions based on data, not just intuition
- Ask for evidence and hypothesis testing
- Reward learning, not just success
- Model intellectual honesty and curiosity

### 2. Team Capabilities
- Provide data literacy training
- Develop analytical skills across functions
- Create data champions within teams
- Build hypothesis-driven thinking

### 3. Psychological Safety
- Separate ideas from egos
- Celebrate learning from failure
- Focus on future improvement, not blame
- Encourage challenging assumptions

### 4. Process Integration
- Embed metrics in regular workflows
- Make data accessible at decision points
- Include metrics in planning processes
- Tie incentives to key metrics appropriately

## Case Study: How Airbnb Built Their Metrics Framework

Airbnb's growth was driven by a sophisticated metrics and optimization approach:

1. They identified "Nights Booked" as their North Star Metric, aligning customer value with business success

2. They built a comprehensive metrics framework around the guest and host journeys

3. They created a dedicated Growth Team with a rigorous experimentation process

4. They developed the "Experiment Idea Market" where anyone could propose and advocate for test ideas

5. They built a culture where decisions were made based on data, not opinions or hierarchy

The result was consistent, data-driven growth that helped them scale from startup to global platform.

## Building Your Metrics and Optimization Plan

1. **Define your North Star Metric** and validate it with data
2. **Establish your KPI framework** across the customer journey
3. **Identify the key drivers** for each KPI
4. **Build your data infrastructure** for reliable measurement
5. **Implement reporting systems** for visibility and accountability
6. **Create your experimentation process** for continuous improvement
7. **Develop team capabilities** in data analysis and optimization

By implementing a robust metrics and optimization framework, you'll create a foundation for sustainable growth through continuous, data-driven improvement.`,
    quiz: {
      title: 'Metrics & Optimization Assessment',
      description: 'Let\'s evaluate your current approach to measurement and improvement.',
      questions: [
        {
          id: 'north_star',
          text: 'Do you have a clearly defined North Star Metric?',
          type: 'single',
          options: [
            {
              id: 'clear_north_star',
              text: 'Yes, clearly defined and widely understood',
              points: { productLed: 10, salesLed: 10, marketingLed: 10, communityLed: 10, operationsLed: 10 }
            },
            {
              id: 'somewhat_defined',
              text: 'Somewhat defined but not consistently used',
              points: { productLed: 5, salesLed: 5, marketingLed: 5, communityLed: 5, operationsLed: 5 }
            },
            {
              id: 'multiple_competing',
              text: 'Multiple competing metrics without clear priority',
              points: { productLed: 2, salesLed: 2, marketingLed: 2, communityLed: 2, operationsLed: 2 }
            },
            {
              id: 'no_north_star',
              text: 'No defined North Star Metric',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            }
          ]
        },
        {
          id: 'kpi_framework',
          text: 'How comprehensive is your KPI framework?',
          type: 'single',
          options: [
            {
              id: 'comprehensive',
              text: 'Comprehensive with clear ownership and targets',
              points: { productLed: 10, salesLed: 10, marketingLed: 10, communityLed: 10, operationsLed: 10 }
            },
            {
              id: 'basic',
              text: 'Basic KPIs defined but not comprehensive',
              points: { productLed: 5, salesLed: 5, marketingLed: 5, communityLed: 5, operationsLed: 5 }
            },
            {
              id: 'ad_hoc',
              text: 'Ad hoc metrics without a cohesive framework',
              points: { productLed: 2, salesLed: 2, marketingLed: 2, communityLed: 2, operationsLed: 2 }
            },
            {
              id: 'minimal',
              text: 'Minimal or no defined KPIs',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            }
          ]
        },
        {
          id: 'data_infrastructure',
          text: 'How mature is your data infrastructure?',
          type: 'single',
          options: [
            {
              id: 'sophisticated',
              text: 'Sophisticated with reliable collection, storage, and access',
              points: { productLed: 10, salesLed: 10, marketingLed: 10, communityLed: 10, operationsLed: 10 }
            },
            {
              id: 'functional',
              text: 'Functional but with some limitations or gaps',
              points: { productLed: 5, salesLed: 5, marketingLed: 5, communityLed: 5, operationsLed: 5 }
            },
            {
              id: 'basic',
              text: 'Basic tracking with significant manual effort',
              points: { productLed: 2, salesLed: 2, marketingLed: 2, communityLed: 2, operationsLed: 2 }
            },
            {
              id: 'minimal',
              text: 'Minimal or unreliable data collection',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            }
          ]
        },
        {
          id: 'experimentation',
          text: 'How developed is your experimentation process?',
          type: 'single',
          options: [
            {
              id: 'systematic',
              text: 'Systematic process with clear hypotheses and analysis',
              points: { productLed: 10, salesLed: 10, marketingLed: 10, communityLed: 10, operationsLed: 10 }
            },
            {
              id: 'regular',
              text: 'Regular experiments but not fully systematic',
              points: { productLed: 5, salesLed: 5, marketingLed: 5, communityLed: 5, operationsLed: 5 }
            },
            {
              id: 'occasional',
              text: 'Occasional ad hoc experiments',
              points: { productLed: 2, salesLed: 2, marketingLed: 2, communityLed: 2, operationsLed: 2 }
            },
            {
              id: 'no_experimentation',
              text: 'No formal experimentation',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            }
          ]
        },
        {
          id: 'data_culture',
          text: 'How would you describe your data culture?',
          type: 'single',
          options: [
            {
              id: 'data_driven',
              text: 'Strongly data-driven with decisions based on evidence',
              points: { productLed: 10, salesLed: 10, marketingLed: 10, communityLed: 10, operationsLed: 10 }
            },
            {
              id: 'data_informed',
              text: 'Data-informed with metrics considered alongside other factors',
              points: { productLed: 5, salesLed: 5, marketingLed: 5, communityLed: 5, operationsLed: 5 }
            },
            {
              id: 'occasional_data',
              text: 'Data used occasionally but not consistently',
              points: { productLed: 2, salesLed: 2, marketingLed: 2, communityLed: 2, operationsLed: 2 }
            },
            {
              id: 'intuition_driven',
              text: 'Primarily intuition-driven with minimal data use',
              points: { productLed: 0, salesLed: 0, marketingLed: 0, communityLed: 0, operationsLed: 0 }
            }
          ]
        }
      ]
    },
    checklist: {
      title: 'Metrics & Optimization Framework Checklist',
      items: [
        {
          id: 'define_north_star',
          text: 'Define your North Star Metric',
          description: 'Identify the single most important measure of your company\'s success',
          required: true
        },
        {
          id: 'establish_kpis',
          text: 'Establish KPIs for each area of the business',
          description: 'Define 1-3 key metrics for each major function or customer journey stage',
          required: true
        },
        {
          id: 'identify_drivers',
          text: 'Identify key drivers for each KPI',
          description: 'Determine the operational metrics that influence your KPIs',
          required: true
        },
        {
          id: 'implement_tracking',
          text: 'Implement comprehensive data tracking',
          description: 'Ensure all key metrics are being reliably collected and stored',
          required: true
        },
        {
          id: 'create_dashboards',
          text: 'Create dashboards for key metrics',
          description: 'Build visualizations that make metrics accessible to stakeholders',
          required: true
        },
        {
          id: 'establish_reviews',
          text: 'Establish regular metric review meetings',
          description: 'Set up cadences for reviewing performance at different levels',
          required: true
        },
        {
          id: 'develop_experimentation',
          text: 'Develop an experimentation process',
          description: 'Create a system for testing hypotheses and measuring results',
          required: false
        },
        {
          id: 'document_learnings',
          text: 'Document and share learnings and insights',
          description: 'Create a knowledge base of what you\'ve learned from data and experiments',
          required: false
        }
      ]
    },
    tools: [
      {
        id: 'north-star-workshop',
        title: 'North Star Metric Workshop',
        description: 'Collaborative process to define your North Star Metric',
        type: 'template',
        url: 'https://docs.google.com/presentation/d/1-example-north-star-workshop'
      },
      {
        id: 'kpi-framework-template',
        title: 'KPI Framework Template',
        description: 'Build a comprehensive set of KPIs across your business',
        type: 'template',
        url: 'https://docs.google.com/spreadsheets/d/1-example-kpi-framework'
      },
      {
        id: 'driver-tree-builder',
        title: 'Metric Driver Tree Builder',
        description: 'Map the relationships between metrics and their drivers',
        type: 'template',
        url: 'https://docs.google.com/spreadsheets/d/1-example-driver-tree'
      },
      {
        id: 'experiment-design-template',
        title: 'Experiment Design Template',
        description: 'Structure your experiments for maximum learning',
        type: 'template',
        url: 'https://docs.google.com/document/d/1-example-experiment-design'
      },
      {
        id: 'metrics-review-template',
        title: 'Metrics Review Meeting Template',
        description: 'Framework for effective metrics review meetings',
        type: 'template',
        url: 'https://docs.google.com/presentation/d/1-example-metrics-review'
      },
      {
        id: 'ab-test-calculator',
        title: 'A/B Test Sample Size Calculator',
        description: 'Determine the sample size needed for statistically significant results',
        type: 'calculator'
      }
    ]
  }
];

export const growthStrategyRecommendationInfo: Record<string, {
  title: string;
  description: string;
  keyTactics: string[];
  resources: string[];
  nextSteps: string[];
}> = {
  productLed: {
    title: 'Product-Led Growth Strategy',
    description: 'Your assessment suggests that a Product-Led Growth strategy would be most effective for your business. This approach leverages your product itself as the primary driver of acquisition, conversion, and expansion.',
    keyTactics: [
      'Implement a frictionless self-service onboarding process',
      'Create a freemium or free trial model to reduce acquisition barriers',
      'Focus on time-to-value and the "aha moment"',
      'Build in-product education and tooltips',
      'Develop usage analytics to identify expansion opportunities',
      'Create viral or network-effect features'
    ],
    resources: [
      'Product-Led Growth by Wes Bush',
      'Intercom on Product-Led Growth',
      'OpenView's Product-Led Growth Resources',
      'Product-Led Institute's Playbooks'
    ],
    nextSteps: [
      'Map your user activation journey and identify friction points',
      'Implement product analytics to track user behavior',
      'Develop a self-service onboarding experience',
      'Create an in-product education strategy',
      'Design your freemium or trial model'
    ]
  },
  salesLed: {
    title: 'Sales-Led Growth Strategy',
    description: 'Your assessment suggests that a Sales-Led Growth strategy would be most effective for your business. This approach leverages direct sales engagement to identify, qualify, and close deals with potential customers.',
    keyTactics: [
      'Build a structured sales process from prospecting to close',
      'Develop ideal customer profiles and buyer personas',
      'Create sales enablement materials and training',
      'Implement a CRM system with pipeline management',
      'Establish sales metrics and performance tracking',
      'Design compensation structures that drive desired behaviors'
    ],
    resources: [
      'Predictable Revenue by Aaron Ross',
      'The Sales Acceleration Formula by Mark Roberge',
      'SPIN Selling by Neil Rackham',
      'SaaStr's Sales Resources'
    ],
    nextSteps: [
      'Document your sales process and playbook',
      'Implement a CRM system for pipeline management',
      'Create sales collateral and enablement materials',
      'Develop your sales hiring and onboarding plan',
      'Establish sales metrics and reporting'
    ]
  },
  marketingLed: {
    title: 'Marketing-Led Growth Strategy',
    description: 'Your assessment suggests that a Marketing-Led Growth strategy would be most effective for your business. This approach focuses on creating awareness and demand through content, advertising, and other marketing channels.',
    keyTactics: [
      'Develop a content marketing strategy across multiple formats',
      'Build SEO capabilities for organic traffic growth',
      'Implement multi-channel demand generation campaigns',
      'Create clear messaging and positioning',
      'Establish marketing attribution and analytics',
      'Design lead nurturing and qualification processes'
    ],
    resources: [
      'Traction by Gabriel Weinberg and Justin Mares',
      'They Ask, You Answer by Marcus Sheridan',
      'Content-Based Marketing by Jimmy Daly',
      'HubSpot's Inbound Marketing Resources'
    ],
    nextSteps: [
      'Develop your content marketing strategy and calendar',
      'Implement marketing analytics and attribution',
      'Create your messaging and positioning framework',
      'Build your lead generation and nurturing process',
      'Establish marketing KPIs and reporting'
    ]
  },
  communityLed: {
    title: 'Community-Led Growth Strategy',
    description: 'Your assessment suggests that a Community-Led Growth strategy would be most effective for your business. This approach leverages community engagement, user advocacy, and network effects to drive growth.',
    keyTactics: [
      'Build community platforms and engagement mechanisms',
      'Create user-generated content systems',
      'Develop ambassador and advocacy programs',
      'Host events and facilitate member connections',
      'Implement community-driven product development',
      'Design network effects into your product'
    ],
    resources: [
      'The Business of Belonging by David Spinks',
      'Get Together by Bailey Richardson, Kevin Huynh, and Kai Elmer Sotto',
      'Community-Led Growth Playbook by Common Room',
      'CMX Community Resources'
    ],
    nextSteps: [
      'Define your community strategy and value proposition',
      'Select and implement community platforms',
      'Create community guidelines and moderation processes',
      'Develop community programming and engagement tactics',
      'Establish community health metrics and reporting'
    ]
  },
  operationsLed: {
    title: 'Operations-Led Growth Strategy',
    description: 'Your assessment suggests that an Operations-Led Growth strategy would be most effective for your business. This approach focuses on operational excellence, efficiency, and superior execution as the primary growth driver.',
    keyTactics: [
      'Implement continuous process improvement methodologies',
      'Develop superior quality control systems',
      'Create efficient resource utilization models',
      'Build scalable fulfillment and delivery systems',
      'Establish operational metrics and performance tracking',
      'Design for cost advantages through scale and efficiency'
    ],
    resources: [
      'The Toyota Way by Jeffrey Liker',
      'The Goal by Eliyahu Goldratt',
      'The Lean Startup by Eric Ries',
      'Operations Excellence Resources by McKinsey'
    ],
    nextSteps: [
      'Map and optimize your core operational processes',
      'Implement quality control and measurement systems',
      'Develop operational dashboards and KPIs',
      'Create process documentation and training',
      'Establish continuous improvement mechanisms'
    ]
  }
};