export interface CourseModule {
  id: string;
  title: string;
  description: string;
  order: number;
  content: string;
  quiz?: CourseQuiz;
  checklist?: CourseChecklist;
  tools?: CourseTool[];
}

export interface CourseQuiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  type: 'single' | 'multiple';
  required: boolean;
}

export interface QuizOption {
  id: string;
  text: string;
  points: {
    llc: number;
    cCorp: number;
    sCorp: number;
    soleProprietorship: number;
    partnership: number;
  };
}

export interface CourseChecklist {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  description?: string;
  required: boolean;
}

export interface CourseTool {
  id: string;
  title: string;
  description: string;
  type: 'generator' | 'calculator' | 'template' | 'lookup';
  url?: string;
}

export interface CourseProgress {
  userId: string;
  moduleId: string;
  completed: boolean;
  quizAnswers?: Record<string, string[]>;
  checklistCompleted?: string[];
  entityType?: 'llc' | 'cCorp' | 'sCorp' | 'soleProprietorship' | 'partnership';
  businessName?: string;
  state?: string;
  completedAt?: Date;
}

export const businessCourseModules: CourseModule[] = [
  {
    id: 'orientation',
    title: 'Orientation – What Are You Building?',
    description: 'Define your business idea, goals, and commitment level',
    order: 0,
    content: `
# Welcome to Start to Form: Your Business Formation Journey

This comprehensive course will guide you through the process of legally forming your business. By the end, you'll have chosen the right business structure, filed your entity, and set up the essential foundations for long-term success.

## What to Expect

This course is designed to be **action-oriented** and **results-driven**. Each module builds toward a specific outcome, with the final result being your registered business entity and a solid foundation for growth.

Throughout this journey, you'll:
- Learn about different business structures and their implications
- Make informed decisions based on your specific situation
- Complete actual filing steps with state-specific guidance
- Set up essential business systems and compliance measures
- Earn a "Business Founder" badge for your inRooms profile

## Before We Begin

Let's clarify your business idea and goals. This will help personalize your journey through the course.

### Your Business Concept

Take a moment to define your business in one clear sentence. This will serve as your north star throughout the formation process. A clear business concept helps you:

- Stay focused on your core value proposition
- Explain your business concisely to others
- Make consistent decisions about your business structure
- Create alignment if you have co-founders

### Your Timeline

How soon do you plan to launch your business?
- **Exploring options** (3-6 months): You're still refining your idea and researching the market
- **Planning to launch soon** (1-3 months): Your concept is solid and you're preparing for launch
- **Ready to form now** (immediate): You're ready to register your business and start operations

### Your Goals

What matters most to you in forming your business?
- **Protecting personal assets**: Separating personal and business liabilities
- **Minimizing taxes**: Optimizing your tax situation from the start
- **Attracting investors**: Setting up a structure conducive to outside investment
- **Simplicity and low cost**: Keeping formation and maintenance straightforward
- **Building a sellable asset**: Creating a business that can eventually be sold

Your answers to these questions will help tailor the recommendations throughout this course.

### Common Pitfalls to Avoid

As you begin this journey, be aware of these common mistakes:

1. **Choosing the wrong entity type** for your specific situation
2. **Mixing personal and business finances** from day one
3. **Neglecting state-specific requirements** for your business
4. **Failing to maintain proper records** and corporate formalities
5. **Overlooking tax implications** of your chosen structure

This course will help you navigate these challenges successfully.
    `,
    quiz: {
      id: 'orientation-quiz',
      title: 'Business Foundation Quiz',
      description: 'Help us understand your business goals',
      questions: [
        {
          id: 'business-idea',
          text: 'What is your business idea in one sentence?',
          type: 'single',
          required: true,
          options: [
            { id: 'custom', text: '[Write your answer]', points: { llc: 0, cCorp: 0, sCorp: 0, soleProprietorship: 0, partnership: 0 } }
          ]
        },
        {
          id: 'timeline',
          text: 'When do you plan to launch your business?',
          type: 'single',
          required: true,
          options: [
            { id: 'exploring', text: 'Just exploring (3-6 months)', points: { llc: 0, cCorp: -2, sCorp: -2, soleProprietorship: 2, partnership: 0 } },
            { id: 'planning', text: 'Planning to launch soon (1-3 months)', points: { llc: 1, cCorp: 0, sCorp: 0, soleProprietorship: 1, partnership: 1 } },
            { id: 'ready', text: 'Ready to form now (immediate)', points: { llc: 2, cCorp: 2, sCorp: 2, soleProprietorship: 1, partnership: 1 } }
          ]
        },
        {
          id: 'primary-goal',
          text: 'What is your primary goal in forming a business?',
          type: 'single',
          required: true,
          options: [
            { id: 'liability', text: 'Protecting personal assets', points: { llc: 3, cCorp: 3, sCorp: 3, soleProprietorship: -3, partnership: -2 } },
            { id: 'taxes', text: 'Minimizing taxes', points: { llc: 2, cCorp: 0, sCorp: 3, soleProprietorship: 1, partnership: 1 } },
            { id: 'investors', text: 'Attracting investors', points: { llc: 1, cCorp: 3, sCorp: 1, soleProprietorship: -3, partnership: -1 } },
            { id: 'simplicity', text: 'Simplicity and low cost', points: { llc: 1, cCorp: -2, sCorp: -2, soleProprietorship: 3, partnership: 2 } },
            { id: 'sellable', text: 'Building a sellable asset', points: { llc: 2, cCorp: 3, sCorp: 2, soleProprietorship: -2, partnership: -1 } }
          ]
        }
      ]
    }
  },
  {
    id: 'entity-selection',
    title: 'Pick the Right Entity',
    description: 'Determine whether you need an LLC, C-Corp, S-Corp, or Sole Proprietorship',
    order: 1,
    content: `
# Choosing Your Business Structure: A Critical Decision

The legal structure you choose for your business will impact your taxes, personal liability, paperwork, ability to raise money, and more. This decision affects nearly every aspect of your business operations, so it's worth taking the time to make an informed choice.

## Common Business Structures

### Sole Proprietorship
- **Definition**: A business owned and operated by one person with no legal distinction between the owner and the business. This is the default structure when you start a business without filing any paperwork.
- **Best for**: Freelancers, consultants, and low-risk businesses just starting out with minimal startup capital.
- **Pros**: 
  - Simple to form with no filing requirements
  - Complete control over all decisions
  - Minimal paperwork and regulatory requirements
  - Pass-through taxation (business income reported on personal taxes)
  - Lowest cost option to start and maintain
- **Cons**: 
  - Unlimited personal liability for all business debts and legal issues
  - Difficult to raise capital from investors
  - Limited life (ends with owner)
  - May appear less professional to clients and partners
  - Limited tax deduction opportunities

### Limited Liability Company (LLC)
- **Definition**: A hybrid structure that provides the liability protection of a corporation with the tax benefits of a partnership. LLCs have become the most popular entity choice for small businesses.
- **Best for**: Small to medium businesses seeking liability protection without corporate complexity, including service businesses, real estate holdings, and startups not seeking venture capital.
- **Pros**: 
  - Limited personal liability protection
  - Pass-through taxation (no double taxation)
  - Management flexibility (member-managed or manager-managed)
  - Fewer formalities than corporations
  - Flexible profit distribution not tied to ownership percentage
- **Cons**: 
  - More expensive to form than sole proprietorships
  - Self-employment taxes for active members
  - May have franchise taxes in some states
  - Can be harder to raise venture capital
  - Some states have publication requirements

### C Corporation
- **Definition**: A legal entity completely separate from its owners, with its own rights and liabilities. This is the traditional corporate structure used by most large companies.
- **Best for**: Businesses planning to go public, raise significant venture capital, or scale significantly with multiple investors.
- **Pros**: 
  - Limited personal liability protection
  - Ability to issue multiple classes of stock
  - Attractive to venture capital and investors
  - Perpetual existence independent of owners
  - Tax deductible business expenses and benefits
  - No limit on number of shareholders
- **Cons**: 
  - Double taxation (corporate and dividend income)
  - More expensive to form and maintain
  - Extensive recordkeeping requirements
  - More regulatory oversight
  - Less management flexibility
  - Required board meetings and minutes

### S Corporation
- **Definition**: A corporation that elects to pass corporate income, losses, deductions, and credits through to shareholders for federal tax purposes. It's essentially a tax election rather than a distinct entity type.
- **Best for**: Small to medium businesses that would benefit from corporate structure but want pass-through taxation, particularly those with significant profits that could benefit from reduced self-employment taxes.
- **Pros**: 
  - Limited personal liability protection
  - Pass-through taxation (avoids double taxation)
  - Potential tax savings on self-employment taxes
  - Separate legal entity from owners
  - Perpetual existence
- **Cons**: 
  - Strict qualification requirements
  - Limited to 100 shareholders
  - Only one class of stock allowed
  - All shareholders must be U.S. citizens/residents
  - More formalities than an LLC
  - Cannot be owned by other corporations or partnerships

### Partnership
- **Definition**: A business relationship between two or more people who conduct business together. There are several types: General Partnerships, Limited Partnerships (LP), and Limited Liability Partnerships (LLP).
- **Best for**: Professional groups like law firms, medical practices, accounting firms, or joint ventures between existing businesses.
- **Pros**: 
  - Easy to establish with minimal paperwork
  - Shared financial commitment and workload
  - Pass-through taxation
  - Complementary skills and resources
  - Flexible management structure
- **Cons**: 
  - Unlimited personal liability in general partnerships
  - Joint and several liability (responsible for partner actions)
  - Shared profits regardless of contribution (unless specified otherwise)
  - Potential for conflicts between partners
  - Limited life (can end if a partner leaves)
  - Each general partner can bind the partnership

## Key Factors to Consider

1. **Liability Protection**: How much personal protection do you need based on your industry's risks?
2. **Taxation**: Which tax structure benefits your situation and projected income?
3. **Ownership Structure**: Solo founder or multiple owners? How will ownership change over time?
4. **Investment Plans**: Will you seek outside funding from angels, VCs, or other sources?
5. **Administrative Complexity**: How much paperwork and compliance can you handle or afford?
6. **Growth Plans**: What are your long-term goals for the business (lifestyle, acquisition, IPO)?
7. **Industry Norms**: What structures are common in your industry?
8. **State-Specific Considerations**: How do state laws and taxes affect your choice?

## Industry-Specific Considerations

Different industries often favor certain business structures:

- **Technology Startups**: Often C-Corps (especially if seeking VC funding)
- **Real Estate**: Commonly LLCs for liability protection and tax benefits
- **Professional Services**: Often LLCs or LLPs (law, accounting, consulting)
- **Retail/E-commerce**: Varies, but LLCs are common for smaller operations
- **Freelancers/Creators**: Often start as Sole Proprietors, then transition to LLCs

## State-Specific Considerations

Your state of formation matters significantly:

- **Delaware**: Business-friendly laws, specialized business court, privacy advantages
- **Nevada**: No state income tax, strong liability protection, privacy benefits
- **Wyoming**: Low fees, no state income tax, strong asset protection
- **Home State**: Often simplest and most cost-effective if operating locally

Take the quiz below to get a personalized recommendation based on your specific situation.
    `,
    quiz: {
      id: 'entity-quiz',
      title: 'Business Entity Selector',
      description: 'Find the right business structure for your needs',
      questions: [
        {
          id: 'founders',
          text: 'How many founders/owners will your business have?',
          type: 'single',
          required: true,
          options: [
            { id: 'solo', text: 'Just me (solo founder)', points: { llc: 2, cCorp: 1, sCorp: 1, soleProprietorship: 3, partnership: -3 } },
            { id: 'two-to-five', text: '2-5 founders/partners', points: { llc: 3, cCorp: 2, sCorp: 2, soleProprietorship: -3, partnership: 3 } },
            { id: 'more-than-five', text: 'More than 5 founders/partners', points: { llc: 2, cCorp: 3, sCorp: 1, soleProprietorship: -3, partnership: 2 } }
          ]
        },
        {
          id: 'liability',
          text: 'How concerned are you about personal liability protection?',
          type: 'single',
          required: true,
          options: [
            { id: 'very', text: 'Very concerned - I need strong protection', points: { llc: 3, cCorp: 3, sCorp: 3, soleProprietorship: -3, partnership: -2 } },
            { id: 'somewhat', text: 'Somewhat concerned', points: { llc: 2, cCorp: 2, sCorp: 2, soleProprietorship: -1, partnership: -1 } },
            { id: 'not-very', text: 'Not very concerned', points: { llc: 0, cCorp: 0, sCorp: 0, soleProprietorship: 2, partnership: 1 } }
          ]
        },
        {
          id: 'funding',
          text: 'Do you plan to raise venture capital or other outside investment?',
          type: 'single',
          required: true,
          options: [
            { id: 'yes-vc', text: 'Yes, venture capital', points: { llc: 0, cCorp: 3, sCorp: -1, soleProprietorship: -3, partnership: -2 } },
            { id: 'yes-other', text: 'Yes, but not venture capital', points: { llc: 2, cCorp: 2, sCorp: 1, soleProprietorship: -2, partnership: 0 } },
            { id: 'no', text: 'No, self-funded or bootstrapped', points: { llc: 2, cCorp: 0, sCorp: 1, soleProprietorship: 3, partnership: 2 } }
          ]
        },
        {
          id: 'complexity',
          text: 'How much administrative complexity can you handle?',
          type: 'single',
          required: true,
          options: [
            { id: 'minimal', text: 'Minimal - keep it simple', points: { llc: 1, cCorp: -2, sCorp: -2, soleProprietorship: 3, partnership: 2 } },
            { id: 'moderate', text: 'Moderate - some paperwork is fine', points: { llc: 3, cCorp: 1, sCorp: 1, soleProprietorship: 1, partnership: 1 } },
            { id: 'complex', text: 'Complex - willing to maintain detailed records', points: { llc: 1, cCorp: 3, sCorp: 2, soleProprietorship: -1, partnership: 0 } }
          ]
        },
        {
          id: 'tax-preference',
          text: 'What is your tax preference?',
          type: 'single',
          required: true,
          options: [
            { id: 'pass-through', text: 'Pass-through taxation (business income on personal taxes)', points: { llc: 3, cCorp: -2, sCorp: 3, soleProprietorship: 3, partnership: 3 } },
            { id: 'corporate', text: 'Separate corporate taxation', points: { llc: -1, cCorp: 3, sCorp: -1, soleProprietorship: -3, partnership: -3 } },
            { id: 'flexible', text: 'Flexible options/not sure', points: { llc: 3, cCorp: 1, sCorp: 1, soleProprietorship: 1, partnership: 1 } }
          ]
        },
        {
          id: 'growth-plans',
          text: 'What are your growth plans?',
          type: 'single',
          required: true,
          options: [
            { id: 'lifestyle', text: 'Lifestyle business/side hustle', points: { llc: 2, cCorp: -1, sCorp: 0, soleProprietorship: 3, partnership: 1 } },
            { id: 'moderate-growth', text: 'Moderate growth, stable business', points: { llc: 3, cCorp: 1, sCorp: 2, soleProprietorship: 0, partnership: 1 } },
            { id: 'high-growth', text: 'High growth, potential acquisition/IPO', points: { llc: 1, cCorp: 3, sCorp: 1, soleProprietorship: -3, partnership: -2 } }
          ]
        }
      ]
    }
  },
  {
    id: 'business-foundation',
    title: 'Set Up Your Business Foundation',
    description: 'Prepare the key ingredients to register your business',
    order: 2,
    content: `
# Setting Up Your Business Foundation: The Essential Building Blocks

Before you can register your business entity, you need to prepare several key components. This module will walk you through each step to ensure you're ready to file.

## Choose Your Business Name

Your business name is a critical part of your brand identity and legal identity. It needs to be:
- **Memorable and relevant** to your business offerings
- **Available in your state's business registry** (each state maintains its own database)
- **Available as a domain name** (ideally .com, but alternatives work too)
- **Not infringing on existing trademarks** (federal or state level)
- **Compliant with state naming rules** (e.g., must include "LLC" or "Inc.")

### Tips for Choosing a Name:
- **Make it easy to spell and pronounce** to avoid confusion
- **Avoid names that limit your business growth** (e.g., "Seattle Plumbing" if you might expand)
- **Consider how it will look** on a logo, website, and business cards
- **Test it with potential customers** to ensure positive associations
- **Check social media availability** for consistent branding
- **Consider trademark potential** if your brand will be valuable

### Name Restrictions to Be Aware Of:

Most states prohibit business names that:
- Imply banking, insurance, or legal services without proper licensing
- Include words like "Federal," "National," "United States," or "Reserve"
- Are identical or deceptively similar to existing businesses
- Contain profanity or offensive language
- Imply a different entity type than what you're forming

## Select Your State of Formation

You can form your business in any state, not just where you live. Consider:

### Home State Formation:
- **Simplest option** if you'll operate primarily in one state
- **Avoid "foreign qualification" fees** (required when operating in states other than your formation state)
- **Lower ongoing compliance costs** (no multiple state filings)
- **Familiarity with local requirements** and resources
- **Proximity to state offices** if in-person filing is needed

### Delaware Formation:
- **Business-friendly laws and courts** (Court of Chancery specializes in business cases)
- **Privacy advantages** (member/manager names not required on public filings)
- **Preferred by investors** and familiar to lawyers nationwide
- **Flexible corporate laws** with strong precedent
- **But**: Additional costs if operating in another state (foreign qualification)
- **But**: Franchise tax requirements regardless of profitability

### Nevada Formation:
- **No state income tax, franchise tax, or inheritance tax**
- **Strong privacy protections** for owners
- **No information sharing agreement** with the IRS
- **But**: Still requires foreign qualification if operating elsewhere
- **But**: Annual fees can be higher than other states

### Other Considerations:
- **State filing fees** (range from $40 to $500+)
- **Annual report requirements and fees**
- **State taxes and franchise fees** (some states charge regardless of profitability)
- **Publication requirements** (some states require newspaper announcements)
- **Processing times** (can range from same-day to several weeks)
- **Registered agent requirements** (some states have stricter rules)

## Choose a Registered Agent

A registered agent is a person or company that accepts legal documents (like service of process, government correspondence, and compliance documents) on behalf of your business. They must:
- **Have a physical address** (not a P.O. box) in the state of formation
- **Be available during regular business hours** (9am-5pm, Monday-Friday)
- **Be willing to receive legal documents** and promptly forward them to you
- **Be at least 18 years old** (if an individual)
- **Have a reliable system** for document handling and notification

### Options:
- **Yourself** (if you have an address in the state and are always available)
- **Co-founder or employee** (must meet all requirements above)
- **Professional registered agent service** ($100-$300/year)
- **Your business attorney** (often included in formation packages)
- **Formation company** (often bundled with their formation services)

### Pros and Cons of Being Your Own Agent:

**Pros:**
- No additional cost
- Direct receipt of documents

**Cons:**
- Your address becomes public record
- Must be available during business hours
- Risk of missing important documents if you move or travel
- Potentially embarrassing to receive legal documents in front of clients

## Prepare Your Business Address

You'll need a physical address for your business for various filings and correspondence. Options include:
- **Your home address** (consider privacy implications)
- **Rented office space** (traditional commercial lease)
- **Virtual office service** ($50-$200/month, includes mail handling)
- **Co-working space** (often provides a business address service)
- **P.O. Box** (not acceptable for all purposes, but useful for mail)

### Address Requirements:
- Must be a physical street address (not just a P.O. Box)
- Must be in the state of formation (for registered agent)
- Should be reliable for receiving important mail
- Consider privacy implications (addresses become public record)

## Write Your Business Purpose

You'll need to describe what your business does for your formation documents. This can be:
- **Specific**: "Developing mobile applications for the healthcare industry"
- **General**: "Engaging in any lawful business activity"
- **Industry-focused**: "Providing consulting services in the field of digital marketing"
- **Product-oriented**: "Manufacturing and selling organic skincare products"

A general purpose gives you flexibility for future pivots, but some states require more specificity. Consider:

- **Current activities**: What you're doing now
- **Planned activities**: What you expect to do in the near future
- **Potential pivots**: How much flexibility you need
- **State requirements**: Some states require more specific language

### Sample Purpose Statements:

1. **General Purpose**: "To engage in any lawful act or activity for which [entity type] may be organized in this state."

2. **E-commerce**: "To sell products online and through other distribution channels, and to engage in any other lawful business activity."

3. **Service Business**: "To provide consulting services in the field of digital marketing, and any other lawful business purpose."

Complete the checklist below to ensure you're ready for the next step: filing your entity.
    `,
    checklist: {
      id: 'foundation-checklist',
      title: 'Business Foundation Checklist',
      items: [
        {
          id: 'business-name',
          text: 'Choose a business name',
          description: 'Select a name that represents your business and is available in your state',
          required: true
        },
        {
          id: 'name-availability',
          text: 'Check name availability in your state',
          description: 'Verify that your chosen name is available in your state\'s business registry',
          required: true
        },
        {
          id: 'domain-check',
          text: 'Check domain name availability',
          description: 'Verify that a suitable domain name is available for your business',
          required: false
        },
        {
          id: 'state-selection',
          text: 'Select state of formation',
          description: 'Decide which state you will register your business in',
          required: true
        },
        {
          id: 'registered-agent',
          text: 'Choose a registered agent',
          description: 'Select who will serve as your registered agent in your state of formation',
          required: true
        },
        {
          id: 'business-address',
          text: 'Determine business address',
          description: 'Decide what address you will use for your business registration',
          required: true
        },
        {
          id: 'business-purpose',
          text: 'Write your business purpose',
          description: 'Create a statement describing what your business does',
          required: true
        }
      ]
    },
    tools: [
      {
        id: 'name-lookup',
        title: 'Business Name Availability Checker',
        description: 'Check if your business name is available in your state\'s registry',
        type: 'lookup',
        url: 'https://www.uspto.gov/trademarks/search'
      },
      {
        id: 'domain-checker',
        title: 'Domain Availability Checker',
        description: 'Check if your business name is available as a domain name',
        type: 'lookup',
        url: 'https://instantdomainsearch.com/'
      },
      {
        id: 'purpose-generator',
        title: 'Business Purpose Generator',
        description: 'Generate a customized business purpose statement for your filing',
        type: 'generator',
        url: ''
      },
      {
        id: 'registered-agent-comparison',
        title: 'Registered Agent Comparison Tool',
        description: 'Compare registered agent services by price and features',
        type: 'lookup',
        url: ''
      },
      {
        id: 'business-address-options',
        title: 'Business Address Options Calculator',
        description: 'Compare costs and benefits of different business address options',
        type: 'calculator',
        url: ''
      }
    ]
  },
  {
    id: 'entity-filing',
    title: 'File Your Entity',
    description: 'Complete the actual formation of your LLC, Corporation, or other entity',
    order: 3,
    content: `
# Filing Your Business Entity: Making It Official

Now that you've prepared your business foundation, it's time to officially register your entity with the state. This module will guide you through the filing process based on your chosen entity type and state. This is the moment your business becomes a legal entity!

## Filing Options

You have two main options for filing your business entity:

### Option 1: DIY Filing
- **Lower cost** (just state filing fees)
- **More time-intensive** (typically 1-3 hours of work)
- **You handle all paperwork** and follow up
- **Requires attention to detail** and research
- **You maintain control** over the entire process
- **Typical cost**: $40-$500 (state filing fees only)

### Option 2: Use a Formation Service
- **Higher cost** (service fee + state filing fees)
- **Saves time and reduces errors**
- **They handle the paperwork** and follow up
- **May include additional services** (registered agent, EIN filing, etc.)
- **Provides peace of mind** for first-time founders
- **Typical cost**: $100-$500 + state filing fees

### Popular Formation Services:

1. **ZenBusiness**: Affordable packages starting around $49 + state fees
2. **Incfile**: Offers free LLC formation (just pay state fees)
3. **Northwest Registered Agent**: Premium service with privacy focus
4. **LegalZoom**: Well-known with extensive service offerings
5. **Stripe Atlas**: Comprehensive package for startups ($500)

## State-Specific Filing Requirements

Each state has different requirements, forms, and fees. Below is general guidance, but you'll need to follow your specific state's process.

### For LLC Formation:
1. **Prepare Articles of Organization**
   - Official document establishing your LLC
   - Contains basic information about your business
   - May be called "Certificate of Formation" in some states

2. **File with your state's business division** (usually Secretary of State)
   - Most states offer online filing
   - Some still require mail or in-person filing
   - Follow instructions carefully for your state

3. **Pay filing fee** (ranges from $40-$500 depending on state)
   - Fees are non-refundable even if rejected
   - Some states have additional publication fees

4. **Wait for approval** (typically 1-3 weeks, expedited options available)
   - Processing times vary significantly by state
   - Many states offer expedited processing for additional fees
   - You'll receive a certificate of formation/organization when approved

### For Corporation Formation:
1. **Prepare Articles of Incorporation**
   - Official document establishing your corporation
   - More detailed than LLC articles in most states
   - Must specify authorized shares and par value

2. **File with your state's business division**
   - Similar process to LLC filing
   - May require more information than LLC filings

3. **Pay filing fee** (typically higher than LLC fees)
   - Corporate fees often range from $100-$800
   - May include franchise tax prepayments in some states

4. **Wait for approval**
   - Similar timeframes to LLC processing

5. **Hold initial board meeting**
   - Adopt bylaws
   - Appoint officers
   - Authorize issuance of stock
   - Document in meeting minutes

6. **Issue stock certificates**
   - Create and distribute certificates to shareholders
   - Maintain stock ledger
   - Consider securities law compliance

### For Sole Proprietorship:
1. **File a DBA ("doing business as")** if using a name other than your legal name
   - Also called "fictitious name registration"
   - Usually filed at county level
   - Typically costs $25-$100

2. **Apply for necessary local business licenses**
   - Requirements vary by location and industry
   - May include city, county, and state licenses

3. **No state filing required for the entity itself**
   - The business has no separate legal existence
   - You are automatically a sole proprietor when you start doing business

## What You'll Need to File

- **Business name** (exactly as you want it registered)
- **Business address** (physical address in most cases)
- **Registered agent information** (name and address)
- **Names of members/managers** (LLC) or directors/officers (corporation)
- **Business purpose** statement
- **Duration of the entity** (usually "perpetual")
- **Payment method for filing fees** (credit card for online filing)
- **Contact information** for confirmation and questions
- **EIN** (for some filings, though usually obtained after formation)

## After Filing

Once your filing is approved, you'll receive:
- **Certificate of Formation/Organization** (LLC)
- **Certificate of Incorporation** (Corporation)
- **State filing number** or entity ID
- **Welcome packet** (in some states)
- **Information about ongoing requirements**

Keep these documents safe - you'll need them for the next steps.

## Next Steps Preview

After your entity is approved, you'll need to:
1. **Obtain an EIN** (Employer Identification Number)
2. **Open a business bank account**
3. **Create an operating agreement** (LLC) or bylaws (corporation)
4. **Set up accounting systems**
5. **Apply for necessary licenses and permits**
6. **Set up tax accounts** (sales tax, employment tax, etc.)
7. **Obtain business insurance**
8. **Comply with local regulations** (zoning, signage, etc.)

## Common Filing Mistakes to Avoid

1. **Incorrect entity name**: Forgetting required designators (LLC, Inc., etc.)
2. **Missing information**: Incomplete applications get rejected
3. **Wrong filing fee**: Incorrect payment amounts delay processing
4. **Choosing the wrong entity type**: Changing later can be costly
5. **Listing the wrong registered agent**: Must meet all requirements
6. **Filing in the wrong state**: Consider where you'll actually operate
7. **Ignoring publication requirements**: Some states require newspaper notices

Complete the checklist below to track your filing progress.
    `,
    checklist: {
      id: 'filing-checklist',
      title: 'Entity Filing Checklist',
      items: [
        {
          id: 'filing-method',
          text: 'Choose filing method (DIY or service)',
          description: 'Decide whether to file yourself or use a formation service',
          required: true
        },
        {
          id: 'prepare-articles',
          text: 'Prepare Articles of Organization/Incorporation',
          description: 'Complete the required formation document for your entity type',
          required: true
        },
        {
          id: 'pay-fees',
          text: 'Pay state filing fees',
          description: 'Submit payment for your state\'s filing fees',
          required: true
        },
        {
          id: 'submit-filing',
          text: 'Submit filing to state',
          description: 'Submit your completed paperwork to your state\'s business division',
          required: true
        },
        {
          id: 'track-status',
          text: 'Track filing status',
          description: 'Monitor the status of your filing with the state',
          required: true
        },
        {
          id: 'receive-certificate',
          text: 'Receive formation certificate',
          description: 'Obtain your official certificate from the state',
          required: true
        }
      ]
    },
    tools: [
      {
        id: 'state-requirements',
        title: 'State Filing Requirements Lookup',
        description: 'View specific filing requirements, fees, and timelines for your state',
        type: 'lookup',
        url: ''
      },
      {
        id: 'articles-template',
        title: 'Articles Template Generator',
        description: 'Generate a customized template for your Articles of Organization/Incorporation',
        type: 'template',
        url: ''
      },
      {
        id: 'fee-calculator',
        title: 'Filing Fee Calculator',
        description: 'Calculate the total cost to file in your state including all fees',
        type: 'calculator',
        url: ''
      },
      {
        id: 'filing-checklist-generator',
        title: 'Custom Filing Checklist',
        description: 'Generate a personalized checklist based on your entity type and state',
        type: 'generator',
        url: ''
      },
      {
        id: 'formation-service-comparison',
        title: 'Formation Service Comparison',
        description: 'Compare pricing and features of popular business formation services',
        type: 'lookup',
        url: ''
      }
    ]
  },
  {
    id: 'back-office',
    title: 'Set Up Your Back Office',
    description: 'Establish the essential systems to operate your business legally',
    order: 4,
    content: `
# Setting Up Your Back Office: The Business Foundation

Congratulations on filing your business entity! Now it's time to set up the essential systems that will make your business operational and compliant. These foundational elements are critical for legal protection, tax compliance, and professional operations.

## Obtain an Employer Identification Number (EIN)

An EIN (also called a Federal Tax Identification Number) is like a social security number for your business. You'll need it to:
- **Open a business bank account**
- **File business taxes**
- **Hire employees or contractors**
- **Apply for business licenses**
- **Establish business credit**
- **Apply for business loans**

### How to Apply:
- **Apply online through the IRS website** (free)
- **Receive your EIN immediately** after applying online
- **No need for a third-party service** (though many offer this for a fee)
- **Available Monday-Friday, 7am-10pm Eastern Time**
- **International applicants** must call the IRS instead of using the online system

**Note:** Sole proprietors without employees can use their SSN instead of an EIN, but getting an EIN is still recommended for privacy and professionalism.

### What You'll Need for EIN Application:

- Legal name of the entity
- Entity type (LLC, Corporation, etc.)
- Responsible party's name and SSN (usually the owner or principal)
- Physical address and mailing address
- Reason for applying
- Principal business activity
- Date business started or acquired
- Number of employees expected in the next 12 months

## Open a Business Bank Account

Separating personal and business finances is crucial for:
- **Legal protection** (maintaining your liability shield)
- **Clean accounting** and financial tracking
- **Tax preparation** and audit readiness
- **Professional image** with clients and vendors
- **Business credit building**
- **Simplified expense tracking**

### What You'll Need:
- **EIN** (or SSN for sole proprietors)
- **Formation documents** (Articles of Organization/Incorporation)
- **Business license** (if required in your jurisdiction)
- **Photo ID** of all owners/signers
- **Initial deposit** (varies by bank, typically $25-$100)
- **DBA certificate** (if operating under a different name)

### Recommended Account Features:
- **Low or no monthly fees** (or clear fee waiver requirements)
- **Free or high number of transactions**
- **Online and mobile banking**
- **Business debit card**
- **Integration with accounting software**
- **Free ACH transfers**
- **Reasonable minimum balance requirements**
- **Multiple user access** (if you have partners/employees)

### Popular Business Banking Options:

1. **Traditional Banks**: Chase, Bank of America, Wells Fargo
   - Pros: Physical locations, full-service banking
   - Cons: Higher fees, stricter requirements

2. **Online-First Banks**: Mercury, Novo, Azlo
   - Pros: Low/no fees, modern interfaces, tech integration
   - Cons: No physical branches, cash deposits may be difficult

3. **Credit Unions**: Local credit unions often have business accounts
   - Pros: Lower fees, personalized service
   - Cons: Fewer features, limited locations

## Create Governing Documents

### For LLCs: Operating Agreement
- **Defines ownership percentages** and capital contributions
- **Outlines management structure** (member-managed vs. manager-managed)
- **Sets rules for decision-making** (voting rights, quorum requirements)
- **Establishes procedures for member changes** (adding/removing members)
- **Details profit and loss distributions**
- **Covers dissolution procedures**
- **Not required in all states, but highly recommended**

### Key Sections in an LLC Operating Agreement:

1. **Company Formation**: Basic information about the LLC
2. **Capital Contributions**: What each member has contributed
3. **Membership Interest**: Ownership percentages
4. **Management**: Who makes decisions and how
5. **Voting Rights**: How votes are allocated and decisions made
6. **Distributions**: How profits and losses are shared
7. **Transfer Restrictions**: Rules for selling ownership
8. **Dissolution**: Process for closing the business

### For Corporations: Bylaws
- **Establishes board of directors** structure and responsibilities
- **Defines officer roles** and appointment procedures
- **Sets shareholder rights** and voting procedures
- **Outlines meeting procedures** and requirements
- **Details stock issuance** and transfer restrictions
- **Establishes amendment procedures**
- **Required for proper corporate governance**

### Additional Corporate Documents:

- **Stock Certificates**: Physical or electronic proof of ownership
- **Stock Ledger**: Record of all stock issuances and transfers
- **Initial Resolutions**: First corporate actions by the board
- **Shareholder Agreements**: Rights and obligations of shareholders

## Set Up Accounting System

Proper bookkeeping from day one will save you headaches later and is essential for tax compliance, financial management, and potential due diligence if you seek funding or sell the business.

### Options:
- **DIY with spreadsheets** (simplest, but limited)
  - Pros: Free, simple to start
  - Cons: Error-prone, limited reporting, doesn't scale

- **Basic accounting software** (QuickBooks, Xero, Wave, FreshBooks)
  - Pros: Affordable, good reporting, scales with business
  - Cons: Learning curve, some setup required
  - Cost: $0-30/month for basic plans

- **Hire a bookkeeper** (most expensive, but hands-off)
  - Pros: Professional oversight, time-saving, expertise
  - Cons: Higher cost, need to find reliable provider
  - Cost: $200-500/month for small businesses

### Key Accounting Tasks:
- **Track income and expenses** consistently
- **Separate business and personal expenses** completely
- **Save receipts and documentation** (digital or physical)
- **Prepare for tax filings** (quarterly and annual)
- **Monitor business health** through regular financial reviews
- **Reconcile bank accounts** monthly
- **Track accounts receivable/payable**
- **Manage cash flow** projections

## Compliance Calendar

Create a calendar of important dates to ensure you never miss a filing or renewal:

- **Annual report filing** (state-specific deadlines)
- **Tax deadlines** (quarterly estimated taxes, annual returns)
- **License renewals** (business licenses, professional licenses)
- **Required meetings** (annual shareholder/board meetings for corporations)
- **Franchise tax payments** (if applicable in your state)
- **Business insurance renewals**
- **Domain name and trademark renewals**

### Compliance Calendar Tools:

- Google Calendar or Outlook with reminders
- Dedicated compliance software
- Registered agent compliance services
- Legal document management systems

## Business Insurance Considerations

Depending on your business type, consider these insurance options:

- **General Liability Insurance**: Protects against common business risks
- **Professional Liability Insurance**: For service providers (also called E&O)
- **Property Insurance**: Covers business property and equipment
- **Workers' Compensation**: Required if you have employees
- **Business Interruption Insurance**: Covers lost income during disruptions
- **Cyber Liability Insurance**: Protection against data breaches

Complete the checklist below to ensure your business is fully operational.
    `,
    checklist: {
      id: 'back-office-checklist',
      title: 'Back Office Setup Checklist',
      items: [
        {
          id: 'apply-ein',
          text: 'Apply for EIN',
          description: 'Obtain an Employer Identification Number from the IRS',
          required: true
        },
        {
          id: 'bank-account',
          text: 'Open business bank account',
          description: 'Set up a dedicated account for your business finances',
          required: true
        },
        {
          id: 'governing-documents',
          text: 'Create governing documents',
          description: 'Draft an Operating Agreement (LLC) or Bylaws (Corporation)',
          required: true
        },
        {
          id: 'accounting-system',
          text: 'Set up accounting system',
          description: 'Establish a system for tracking income and expenses',
          required: true
        },
        {
          id: 'compliance-calendar',
          text: 'Create compliance calendar',
          description: 'Set up reminders for important filing and renewal dates',
          required: true
        },
        {
          id: 'business-licenses',
          text: 'Obtain necessary business licenses',
          description: 'Research and apply for any required licenses or permits',
          required: false
        },
        {
          id: 'insurance',
          text: 'Obtain business insurance',
          description: 'Research and purchase appropriate insurance coverage',
          required: false
        }
      ]
    },
    tools: [
      {
        id: 'ein-assistant',
        title: 'EIN Application Assistant & Walkthrough',
        description: 'Step-by-step guide to applying for an EIN with the IRS',
        type: 'template',
        url: 'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online'
      },
      {
        id: 'operating-agreement',
        title: 'LLC Operating Agreement Generator',
        description: 'Customizable template for LLC Operating Agreements based on your needs',
        type: 'template',
        url: ''
      },
      {
        id: 'bylaws-template',
        title: 'Corporate Bylaws Generator',
        description: 'Customizable template for Corporate Bylaws with best practices',
        type: 'template',
        url: ''
      },
      {
        id: 'compliance-calendar',
        title: 'Compliance Calendar Generator',
        description: 'Create a personalized calendar of important compliance dates',
        type: 'generator',
        url: ''
      },
      {
        id: 'bank-comparison',
        title: 'Business Bank Account Comparison',
        description: 'Compare business checking accounts from top providers',
        type: 'lookup',
        url: ''
      },
      {
        id: 'accounting-system-selector',
        title: 'Accounting System Selector',
        description: 'Find the right accounting system for your business type and needs',
        type: 'lookup',
        url: ''
      }
    ]
  },
  {
    id: 'compliance-checklist',
    title: 'Compliance & First-Year Checklist',
    description: 'Ensure ongoing compliance and set up for success',
    order: 5,
    content: `
# Compliance & First-Year Checklist: Setting Up for Long-Term Success

Congratulations on setting up your business! Now let's ensure you stay compliant and set yourself up for success in your first year of operations. This final module will help you establish good habits and systems from the start.

## Ongoing Compliance Requirements

### Annual Reports
Most states require annual reports to maintain your business in good standing. These are essential filings that keep your entity active and compliant.

- **Due dates vary by state**:
  - Formation anniversary date in some states
  - Calendar year deadline in others (often May 1 or April 15)
  - Some states require biennial (every 2 years) instead of annual

- **Fees range from $0-$800 depending on state**:
  - California has the highest fees ($800 minimum franchise tax)
  - Some states like Ohio have biennial fees instead of annual
  - Late fees can be substantial (often $25-$100)

- **Filing methods**:
  - Most states offer online filing
  - Some still require paper forms
  - Many registered agent services include filing reminders

- **Information typically required**:
  - Current business address
  - Registered agent information
  - Member/manager or officer/director updates
  - Principal business activity

### Business Licenses and Permits
Depending on your industry and location, you may need various licenses and permits to operate legally:

- **General business license** (city/county level)
  - Almost all localities require some form of business license
  - Typically $50-$500 annually
  - Often based on revenue or number of employees

- **Professional licenses** (for regulated professions)
  - Healthcare, legal, financial, construction, etc.
  - Requirements vary widely by profession and state
  - May require education, exams, and continuing education

- **Industry-specific permits**:
  - Health department permits (for food businesses)
  - Liquor licenses (for alcohol sales)
  - Environmental permits (for certain manufacturing)
  - Transportation permits (for shipping/logistics)

- **Location-specific requirements**:
  - Zoning permits or variances
  - Signage permits
  - Home occupation permits (for home-based businesses)
  - Fire department inspections

- **Sales tax permits**:
  - Required if selling taxable goods/services
  - Economic nexus rules apply for interstate sales
  - Marketplace facilitator laws may apply for online sellers

### Tax Obligations

#### Federal Taxes:
- **Income tax returns** (form depends on entity type):
  - Sole Proprietor: Schedule C with Form 1040
  - Partnership: Form 1065 + Schedule K-1 for each partner
  - S Corporation: Form 1120-S + Schedule K-1 for each shareholder
  - C Corporation: Form 1120

- **Estimated quarterly taxes** (due April 15, June 15, Sept 15, Jan 15):
  - Form 1040-ES for individuals (sole props, partners, S-corp shareholders)
  - Form 1120-W for corporations

- **Employment taxes** (if you have employees):
  - Form 941 (quarterly) for payroll taxes
  - Form 940 (annually) for unemployment tax
  - Form W-2 and W-3 (annually) for wage reporting
  - Form 1099-NEC for independent contractors

#### State Taxes:
- **State income taxes** (varies by state):
  - Some states have no income tax
  - Filing deadlines typically match federal

- **Sales and use tax** (collected from customers):
  - Rates and rules vary by state and locality
  - Filing frequency depends on sales volume
  - Economic nexus thresholds for remote sellers

- **Franchise tax** (in some states):
  - Tax for the privilege of doing business in the state
  - Often applies regardless of profitability
  - California, Delaware, and Texas are notable examples

- **Other state-specific taxes**:
  - Gross receipts taxes
  - Commercial activity taxes
  - Business and occupation taxes

#### Local Taxes:
- **City/county business taxes**:
  - Local business tax or license fees
  - Often based on gross receipts or headcount

- **Property taxes**:
  - On business-owned real estate
  - On business personal property (equipment, furniture, etc.)

- **Special district taxes**:
  - Economic improvement districts
  - Transit districts
  - School districts

## First-Year Business Essentials

### Legal Protection
- **Review and update your operating agreement/bylaws** as your business evolves
- **Create standard contracts** for clients/customers:
  - Service agreements
  - Terms of service
  - Privacy policies
  - Sales contracts
- **Implement proper disclaimers and policies** for your industry
- **Consider trademark protection** for your business name/logo:
  - Start with a trademark search
  - Consider state vs. federal registration
  - Weigh costs against brand value
- **Implement data protection measures** if collecting customer information

### Financial Management
- **Set up a bookkeeping routine** (weekly/monthly):
  - Record all transactions
  - Categorize expenses properly
  - Reconcile accounts regularly

- **Establish a system for tracking business expenses**:
  - Receipt management app or system
  - Business credit card for all purchases
  - Clear personal/business separation

- **Create a budget and cash flow projection**:
  - Monthly expense forecasting
  - Revenue projections
  - Cash flow management

- **Plan for tax payments**:
  - Set aside percentage of income for taxes
  - Calendar for estimated tax payments
  - Tax planning with accountant

- **Financial review schedule**:
  - Monthly: Review profit & loss
  - Quarterly: Review with advisor
  - Annually: Strategic financial planning

### Business Insurance
Consider which types of insurance your business needs:

- **General liability insurance**:
  - Protects against common risks (property damage, bodily injury)
  - Typically $500-$1,000/year for small businesses
  - Often required by commercial leases and contracts

- **Professional liability/E&O insurance**:
  - For service providers (consultants, professionals)
  - Protects against claims of negligence or inadequate work
  - Cost varies widely by profession and coverage limits

- **Property insurance**:
  - Covers business equipment, inventory, and fixtures
  - Can include business personal property
  - Consider replacement cost vs. actual cash value

- **Workers' compensation** (if you have employees):
  - Required by law in most states if you have employees
  - Rates based on industry risk factors and payroll

- **Business interruption insurance**:
  - Covers lost income during disruptions
  - Often bundled with property insurance
  - Became more prominent after COVID-19

- **Cyber liability insurance**:
  - Protection against data breaches and cyber attacks
  - Increasingly important for all businesses
  - Covers notification costs, legal fees, and damages

### Business Credit
- **Begin building business credit history**:
  - Apply for a D-U-N-S number from Dun & Bradstreet
  - Open accounts with business credit reporting vendors
  - Pay all bills on time or early

- **Consider a business credit card**:
  - Separates business expenses
  - Builds credit history
  - Provides spending categorization
  - Often includes rewards relevant to businesses

- **Establish relationships with vendors**:
  - Ask for trade credit (net-30, net-60 terms)
  - Start with small suppliers who report to credit bureaus
  - Build history of on-time payments

- **Monitor your business credit score**:
  - Check reports from Dun & Bradstreet, Experian Business, and Equifax Business
  - Dispute any inaccuracies
  - Understand factors affecting your score

## Marketing and Branding Essentials

While not strictly legal requirements, these elements are crucial for business success:

- **Business website**:
  - Domain name matching your business
  - Professional email addresses
  - Basic information about your offerings

- **Social media presence**:
  - Secure usernames matching your business
  - Consistent branding across platforms
  - Regular posting schedule

- **Basic marketing materials**:
  - Logo and brand guidelines
  - Business cards
  - Digital marketing assets

- **Customer acquisition plan**:
  - Identify target customers
  - Develop value proposition
  - Create initial marketing campaigns

## Common First-Year Pitfalls to Avoid

- **Mixing personal and business finances**:
  - Comingles funds and weakens liability protection
  - Creates accounting nightmares
  - Makes tax preparation difficult and expensive

- **Missing filing deadlines**:
  - Results in penalties and late fees
  - Can cause loss of good standing
  - May affect ability to bring legal action

- **Inadequate recordkeeping**:
  - Creates tax compliance risks
  - Makes financial management difficult
  - Weakens legal protections

- **Underestimating tax obligations**:
  - Leads to cash flow problems
  - Results in penalties and interest
  - Creates stress and financial strain

- **Failing to maintain corporate formalities** (for corporations):
  - Risks piercing the corporate veil
  - Weakens liability protection
  - Creates legal vulnerabilities

- **Not keeping up with industry regulations**:
  - Exposes business to compliance risks
  - Can result in fines or forced closure
  - Damages reputation with customers

- **Neglecting customer relationships**:
  - Focuses too much on operations, not enough on sales
  - Misses opportunities for repeat business
  - Fails to build sustainable revenue

Use the checklist below to track your compliance and first-year business tasks.
    `,
    checklist: {
      id: 'compliance-checklist',
      title: 'First-Year Compliance Checklist',
      items: [
        {
          id: 'annual-report',
          text: 'Schedule annual report filing',
          description: 'Set a reminder for your state\'s annual report deadline',
          required: true
        },
        {
          id: 'business-licenses',
          text: 'Research and obtain necessary business licenses',
          description: 'Identify and apply for all required licenses and permits',
          required: true
        },
        {
          id: 'tax-calendar',
          text: 'Create tax payment calendar',
          description: 'Set reminders for quarterly and annual tax deadlines',
          required: true
        },
        {
          id: 'bookkeeping-system',
          text: 'Establish regular bookkeeping routine',
          description: 'Set up a system for ongoing financial record-keeping',
          required: true
        },
        {
          id: 'business-insurance',
          text: 'Obtain appropriate business insurance',
          description: 'Research and purchase insurance policies for your business',
          required: false
        },
        {
          id: 'contracts',
          text: 'Create standard business contracts',
          description: 'Develop templates for client/customer agreements',
          required: false
        },
        {
          id: 'separate-finances',
          text: 'Maintain separation of business and personal finances',
          description: 'Use business accounts exclusively for business transactions',
          required: true
        },
        {
          id: 'record-keeping',
          text: 'Implement document retention system',
          description: 'Create a system for organizing and storing important business documents',
          required: true
        }
      ]
    },
    tools: [
      {
        id: 'compliance-calendar',
        title: 'Annual Compliance Calendar Generator',
        description: 'Create a comprehensive calendar with all your compliance deadlines',
        type: 'generator',
        url: ''
      },
      {
        id: 'license-finder',
        title: 'Business License Finder',
        description: 'Discover which licenses and permits your business needs based on location and industry',
        type: 'lookup',
        url: ''
      },
      {
        id: 'tax-calculator',
        title: 'Estimated Tax Calculator',
        description: 'Calculate your estimated quarterly tax payments based on projected income',
        type: 'calculator',
        url: ''
      },
      {
        id: 'contract-templates',
        title: 'Business Contract Templates',
        description: 'Access customizable templates for common business agreements',
        type: 'template',
        url: ''
      },
      {
        id: 'insurance-finder',
        title: 'Business Insurance Finder',
        description: 'Determine which types of insurance your business needs',
        type: 'lookup',
        url: ''
      },
      {
        id: 'business-credit-guide',
        title: 'Business Credit Building Guide',
        description: 'Step-by-step plan to establish and build business credit',
        type: 'template',
        url: ''
      }
    ]
  }
];

export const entityTypeInfo = {
  llc: {
    name: 'Limited Liability Company (LLC)', 
    description: 'A flexible business structure that provides personal liability protection with fewer formalities than a corporation.',
    bestFor: 'Small to medium businesses seeking liability protection without corporate complexity.',
    advantages: [
      'Limited personal liability protection',
      'Pass-through taxation (no double taxation)',
      'Management flexibility',
      'Fewer formalities than corporations',
      'Can be member-managed or manager-managed',
      'Flexible profit distribution not tied to ownership percentage',
      'No restrictions on number or type of owners',
      'Can elect different tax treatment (S-Corp taxation)'
    ],
    disadvantages: [
      'Self-employment taxes for active members',
      'More expensive to form than sole proprietorships',
      'May have franchise taxes in some states',
      'Can be harder to raise venture capital',
      'Some states have publication requirements',
      'May need foreign qualification if operating in multiple states',
      'Less established legal precedent than corporations'
    ],
    formationSteps: [
      'Choose a name that complies with state LLC rules',
      'File Articles of Organization with state',
      'Pay filing fee (varies by state)',
      'Create an Operating Agreement',
      'Obtain EIN from IRS',
      'Open business bank account',
      'Apply for necessary licenses and permits',
      'Set up accounting system',
      'Consider business insurance options',
      'Complete any state-specific requirements (like publication)'
    ],
    ongoingRequirements: [
      'Annual reports/fees in most states',
      'Maintain separation between business and personal',
      'File federal and state tax returns',
      'Keep Operating Agreement updated',
      'Hold member meetings (recommended but not required)',
      'Maintain good records of major decisions',
      'Pay estimated taxes quarterly',
      'Renew business licenses as required',
      'Maintain registered agent',
      'Update state filings if business information changes'
    ]
  },
  cCorp: {
    name: 'C Corporation',
    description: 'A legal entity completely separate from its owners, offering the strongest protection from personal liability.',
    bestFor: 'Businesses planning to go public, raise significant capital, or scale significantly.',
    advantages: [
      'Limited personal liability protection',
      'Ability to issue multiple classes of stock',
      'Attractive to venture capital and investors',
      'Perpetual existence independent of owners',
      'Tax deductible business expenses and benefits'
    ],
    disadvantages: [
      'Double taxation (corporate and dividend income)',
      'More expensive to form and maintain',
      'Extensive recordkeeping requirements',
      'More regulatory oversight',
      'Less management flexibility'
    ],
    formationSteps: [
      'Choose a name that complies with state corporation rules',
      'File Articles of Incorporation with state',
      'Pay filing fee (varies by state)',
      'Create corporate bylaws',
      'Appoint directors and hold first board meeting',
      'Issue stock certificates',
      'Obtain EIN from IRS',
      'Open business bank account',
      'Apply for necessary licenses and permits'
    ],
    ongoingRequirements: [
      'Annual reports/fees in most states',
      'Hold regular board meetings and keep minutes',
      'Maintain corporate records',
      'File federal and state corporate tax returns',
      'Follow corporate formalities to maintain liability protection'
    ]
  },
  sCorp: {
    name: 'S Corporation',
    description: 'A corporation that elects to pass corporate income, losses, deductions, and credits through to shareholders for federal tax purposes.',
    bestFor: 'Small to medium businesses that would benefit from corporate structure but want pass-through taxation.',
    advantages: [
      'Limited personal liability protection',
      'Pass-through taxation (avoids double taxation)',
      'Potential tax savings on self-employment taxes',
      'Separate legal entity from owners',
      'Perpetual existence'
    ],
    disadvantages: [
      'Strict qualification requirements',
      'Limited to 100 shareholders',
      'Only one class of stock allowed',
      'All shareholders must be U.S. citizens/residents',
      'More formalities than an LLC'
    ],
    formationSteps: [
      'Form a C Corporation first (follow C Corp steps)',
      'File Form 2553 with IRS to elect S Corp status',
      'Ensure all shareholders consent to S Corp election',
      'Meet S Corp eligibility requirements',
      'Obtain EIN from IRS',
      'Open business bank account',
      'Apply for necessary licenses and permits'
    ],
    ongoingRequirements: [
      'Annual reports/fees in most states',
      'Hold regular board meetings and keep minutes',
      'Maintain corporate records',
      'File Form 1120S for federal taxes',
      'Issue Schedule K-1 to all shareholders',
      'Follow corporate formalities to maintain liability protection'
    ]
  },
  soleProprietorship: {
    name: 'Sole Proprietorship',
    description: 'A business owned and operated by one person with no legal distinction between the owner and the business.',
    bestFor: 'Freelancers, consultants, and low-risk businesses just starting out.',
    advantages: [
      'Simplest and least expensive to form',
      'Complete control over business decisions',
      'Minimal paperwork and formalities',
      'Pass-through taxation',
      'Easy to dissolve'
    ],
    disadvantages: [
      'Unlimited personal liability',
      'Difficult to raise capital',
      'Limited life (ends with owner)',
      'Self-employment taxes',
      'May appear less professional to clients'
    ],
    formationSteps: [
      'No formal filing required to start',
      'File DBA ("doing business as") if using a name other than your legal name',
      'Obtain necessary business licenses and permits',
      'Apply for EIN (optional if no employees)',
      'Open business bank account (recommended)'
    ],
    ongoingRequirements: [
      'Pay self-employment taxes',
      'File Schedule C with personal tax return',
      'Keep personal and business finances separate (recommended)',
      'Renew business licenses as needed',
      'Maintain business records'
    ]
  },
  partnership: {
    name: 'General Partnership',
    description: 'A business relationship between two or more people who conduct business together.',
    bestFor: 'Professional groups like law firms, medical practices, or joint ventures.',
    advantages: [
      'Simple and inexpensive to form',
      'Shared financial commitment and workload',
      'Pass-through taxation',
      'Complementary skills and resources',
      'Minimal formalities'
    ],
    disadvantages: [
      'Unlimited personal liability',
      'Joint and several liability (responsible for partner actions)',
      'Shared profits regardless of contribution',
      'Potential for conflicts between partners',
      'Limited life (can end if a partner leaves)'
    ],
    formationSteps: [
      'Create a partnership agreement (highly recommended)',
      'File DBA if using a name other than partners\' names',
      'Obtain necessary business licenses and permits',
      'Obtain EIN from IRS',
      'Open business bank account',
      'Register with state if required'
    ],
    ongoingRequirements: [
      'File annual partnership tax return (Form 1065)',
      'Issue Schedule K-1 to all partners',
      'Pay self-employment taxes',
      'Maintain partnership records',
      'Renew business licenses as needed'
    ]
  }
};

export const stateFilingInfo = {
  alabama: { 
    llcFee: 200,
    corpFee: 200,
    annualReportRequired: true,
    annualReportFee: 10,
    processingTime: '5-10 business days',
    expeditedOption: true,
    expeditedFee: 100,
    expeditedTime: '24 hours',
    website: 'https://sos.alabama.gov/business-entities'
  },
  alaska: {
    llcFee: 250,
    corpFee: 250,
    annualReportRequired: true,
    annualReportFee: 100,
    processingTime: '10-15 business days',
    expeditedOption: true,
    expeditedFee: 50,
    expeditedTime: '3-5 business days',
    website: 'https://www.commerce.alaska.gov/web/cbpl/Corporations.aspx'
  },
  arizona: {
    llcFee: 50,
    corpFee: 60,
    annualReportRequired: false,
    annualReportFee: 0,
    processingTime: '30 business days',
    expeditedOption: true,
    expeditedFee: 35,
    expeditedTime: '5 business days',
    website: 'https://azcc.gov/corporations'
  },
  california: {
    llcFee: 70,
    corpFee: 100,
    annualReportRequired: true,
    annualReportFee: 800,
    processingTime: '10-15 business days',
    expeditedOption: true,
    expeditedFee: 350,
    expeditedTime: '24 hours',
    website: 'https://www.sos.ca.gov/business-programs'
  },
  colorado: {
    llcFee: 50,
    corpFee: 50,
    annualReportRequired: true,
    annualReportFee: 10,
    processingTime: 'Immediate (online filing)',
    expeditedOption: false,
    expeditedFee: 0,
    expeditedTime: '',
    website: 'https://www.sos.state.co.us/pubs/business/main.html'
  },
  connecticut: {
    llcFee: 120,
    corpFee: 250,
    annualReportRequired: true,
    annualReportFee: 80,
    processingTime: '3-5 business days',
    expeditedOption: false,
    expeditedFee: 0,
    expeditedTime: '',
    website: 'https://portal.ct.gov/sots'
  },
  delaware: {
    llcFee: 90,
    corpFee: 89,
    annualReportRequired: true,
    annualReportFee: 300,
    processingTime: '3-4 weeks',
    expeditedOption: true,
    expeditedFee: 100,
    expeditedTime: '24 hours',
    website: 'https://corp.delaware.gov/'
  },
  florida: {
    llcFee: 125,
    corpFee: 70,
    annualReportRequired: true,
    annualReportFee: 138.75,
    processingTime: '3-5 business days',
    expeditedOption: false,
    expeditedFee: 0,
    expeditedTime: '',
    website: 'https://dos.myflorida.com/sunbiz/'
  },
  georgia: {
    llcFee: 100,
    corpFee: 100,
    annualReportRequired: true,
    annualReportFee: 50,
    processingTime: '5-7 business days',
    expeditedOption: true,
    expeditedFee: 100,
    expeditedTime: '2 business days',
    website: 'https://sos.ga.gov/corporations/'
  },
  hawaii: {
    llcFee: 50,
    corpFee: 50,
    annualReportRequired: true,
    annualReportFee: 15,
    processingTime: '5-7 business days',
    expeditedOption: true,
    expeditedFee: 25,
    expeditedTime: '1-3 business days',
    website: 'https://cca.hawaii.gov/breg/'
  },
  illinois: {
    llcFee: 150,
    corpFee: 150,
    annualReportRequired: true,
    annualReportFee: 75,
    processingTime: '10-15 business days',
    expeditedOption: true,
    expeditedFee: 100,
    expeditedTime: '24 hours',
    website: 'https://www.ilsos.gov/departments/business_services/home.html'
  },
  indiana: {
    llcFee: 95,
    corpFee: 100,
    annualReportRequired: true,
    annualReportFee: 30,
    processingTime: '5-7 business days',
    expeditedOption: true,
    expeditedFee: 50,
    expeditedTime: '24 hours',
    website: 'https://inbiz.in.gov/BOS/Home/Index'
  },
  iowa: {
    llcFee: 50,
    corpFee: 50,
    annualReportRequired: true,
    annualReportFee: 45,
    processingTime: '7-10 business days',
    expeditedOption: false,
    expeditedFee: 0,
    expeditedTime: '',
    website: 'https://sos.iowa.gov/business/index.html'
  },
  kansas: {
    llcFee: 160,
    corpFee: 90,
    annualReportRequired: true,
    annualReportFee: 55,
    processingTime: '3-5 business days',
    expeditedOption: false,
    expeditedFee: 0,
    expeditedTime: '',
    website: 'https://www.kansas.gov/businesscenter/'
  },
  kentucky: {
    llcFee: 40,
    corpFee: 50,
    annualReportRequired: true,
    annualReportFee: 15,
    processingTime: '3-5 business days',
    expeditedOption: true,
    expeditedFee: 100,
    expeditedTime: '24 hours',
    website: 'https://sos.ky.gov/bus/business-filings/'
  },
  louisiana: {
    llcFee: 100,
    corpFee: 75,
    annualReportRequired: true,
    annualReportFee: 35,
    processingTime: '3-5 business days',
    expeditedOption: true,
    expeditedFee: 30,
    expeditedTime: '24 hours',
    website: 'https://www.sos.la.gov/BusinessServices/'
  },
  maine: {
    llcFee: 175,
    corpFee: 145,
    annualReportRequired: true,
    annualReportFee: 85,
    processingTime: '5-10 business days',
    expeditedOption: true,
    expeditedFee: 50,
    expeditedTime: '24 hours',
    website: 'https://www.maine.gov/sos/cec/corp/'
  },
  maryland: {
    llcFee: 100,
    corpFee: 120,
    annualReportRequired: true,
    annualReportFee: 300,
    processingTime: '7-10 business days',
    expeditedOption: true,
    expeditedFee: 50,
    expeditedTime: '7 business days',
    website: 'https://businessexpress.maryland.gov/'
  }
  // Additional states would be added here
  // Additional states would be added here
};

// Badge information for course completion
export const businessFounderBadge = {
  id: 'business_founder',
  name: 'Business Founder',
  description: 'Awarded to users who have completed the business formation course and gained the knowledge to legally establish a business entity.',
  icon: 'Briefcase',
  color: 'bg-green-100 text-green-600',
  points: 100,
  requirements: 'Complete all modules in the Start to Form business formation course.'
};