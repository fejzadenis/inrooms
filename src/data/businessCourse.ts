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
# Welcome to Start to Form

This course will guide you through the process of legally forming your business. By the end, you'll have chosen the right business structure, filed your entity, and set up the essential foundations.

## What to Expect

This course is designed to be **action-oriented**. Each module builds toward a specific outcome, with the final result being your registered business entity.

## Before We Begin

Let's clarify your business idea and goals. This will help personalize your journey through the course.

### Your Business Concept

Take a moment to define your business in one clear sentence. This will serve as your north star throughout the formation process.

### Your Timeline

How soon do you plan to launch your business?
- Exploring options (3-6 months)
- Planning to launch soon (1-3 months)
- Ready to form now (immediate)

### Your Goals

What matters most to you in forming your business?
- Protecting personal assets
- Minimizing taxes
- Attracting investors
- Simplicity and low cost
- Building a sellable asset

Your answers to these questions will help tailor the recommendations throughout this course.
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
# Choosing Your Business Structure

The legal structure you choose for your business will impact your taxes, personal liability, paperwork, ability to raise money, and more.

## Common Business Structures

### Sole Proprietorship
- **Definition**: A business owned and operated by one person with no legal distinction between the owner and the business.
- **Best for**: Freelancers, consultants, and low-risk businesses just starting out.
- **Pros**: Simple to form, complete control, minimal paperwork, pass-through taxation.
- **Cons**: Unlimited personal liability, difficult to raise capital, limited life.

### Limited Liability Company (LLC)
- **Definition**: A hybrid structure that provides the liability protection of a corporation with the tax benefits of a partnership.
- **Best for**: Small to medium businesses seeking liability protection without corporate complexity.
- **Pros**: Limited personal liability, pass-through taxation, management flexibility, fewer formalities.
- **Cons**: More expensive to form than sole proprietorships, self-employment taxes.

### C Corporation
- **Definition**: A legal entity separate from its owners, with its own rights and liabilities.
- **Best for**: Businesses planning to go public, raise significant capital, or scale significantly.
- **Pros**: Limited liability, ability to raise capital, perpetual existence, tax deductions.
- **Cons**: Double taxation, expensive to form, extensive record-keeping, more regulations.

### S Corporation
- **Definition**: A corporation that elects to pass corporate income, losses, deductions, and credits through to shareholders.
- **Best for**: Small to medium businesses that would benefit from corporate structure but want pass-through taxation.
- **Pros**: Limited liability, pass-through taxation, potential tax savings on self-employment taxes.
- **Cons**: Strict qualification requirements, limited to 100 shareholders, one class of stock.

### Partnership
- **Definition**: A business relationship between two or more people who conduct business together.
- **Best for**: Professional groups like law firms, medical practices, or joint ventures.
- **Pros**: Easy to establish, shared financial commitment, complementary skills.
- **Cons**: Unlimited personal liability (except in LLPs), shared profits, potential for conflicts.

## Key Factors to Consider

1. **Liability**: How much personal protection do you need?
2. **Taxation**: Which tax structure benefits your situation?
3. **Ownership**: Solo founder or multiple owners?
4. **Investment**: Will you seek outside funding?
5. **Complexity**: How much paperwork and compliance can you handle?
6. **Growth Plans**: What are your long-term goals for the business?

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
# Setting Up Your Business Foundation

Before you can register your business entity, you need to prepare several key components. This module will walk you through each step to ensure you're ready to file.

## Choose Your Business Name

Your business name is a critical part of your brand identity. It needs to be:
- Memorable and relevant to your business
- Available in your state's business registry
- Available as a domain name (ideally)
- Not infringing on existing trademarks

### Tips for Choosing a Name:
- Make it easy to spell and pronounce
- Avoid names that limit your business growth
- Consider how it will look on a logo, website, and business cards
- Test it with potential customers

## Select Your State of Formation

You can form your business in any state, not just where you live. Consider:

### Home State Formation:
- Simplest option if you'll operate primarily in one state
- Avoid "foreign qualification" fees
- Lower ongoing compliance costs

### Delaware Formation:
- Business-friendly laws and courts
- Privacy advantages
- Preferred by investors
- But: Additional costs if operating in another state

### Other Considerations:
- State filing fees (range from $40 to $500+)
- Annual report requirements
- State taxes and franchise fees

## Choose a Registered Agent

A registered agent is a person or company that accepts legal documents on behalf of your business. They must:
- Have a physical address in the state of formation
- Be available during business hours
- Be willing to receive legal documents

### Options:
- Yourself (if you have an address in the state)
- Co-founder or employee
- Professional registered agent service ($100-$300/year)
- Your business attorney

## Prepare Your Business Address

You'll need a physical address for your business. Options include:
- Your home address (consider privacy implications)
- Rented office space
- Virtual office service
- Co-working space

## Write Your Business Purpose

You'll need to describe what your business does. This can be:
- Specific: "Developing mobile applications for the healthcare industry"
- General: "Engaging in any lawful business activity"

A general purpose gives you flexibility, but some states require more specificity.

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
        title: 'Business Name Lookup',
        description: 'Check if your business name is available in your state',
        type: 'lookup',
        url: 'https://www.uspto.gov/trademarks/search'
      },
      {
        id: 'domain-checker',
        title: 'Domain Availability Checker',
        description: 'Check if your business name is available as a domain',
        type: 'lookup',
        url: 'https://domains.google.com'
      },
      {
        id: 'purpose-generator',
        title: 'Business Purpose Generator',
        description: 'Generate a business purpose statement for your filing',
        type: 'generator'
      }
    ]
  },
  {
    id: 'entity-filing',
    title: 'File Your Entity',
    description: 'Complete the actual formation of your LLC, Corporation, or other entity',
    order: 3,
    content: `
# Filing Your Business Entity

Now that you've prepared your business foundation, it's time to officially register your entity with the state. This module will guide you through the filing process based on your chosen entity type and state.

## Filing Options

You have two main options for filing your business entity:

### Option 1: DIY Filing
- Lower cost (just state filing fees)
- More time-intensive
- You handle all paperwork
- Requires attention to detail

### Option 2: Use a Formation Service
- Higher cost (service fee + state filing fees)
- Saves time and reduces errors
- They handle the paperwork
- May include additional services (registered agent, etc.)

## State-Specific Filing Requirements

Each state has different requirements, forms, and fees. Below is general guidance, but you'll need to follow your specific state's process.

### For LLC Formation:
1. Prepare Articles of Organization
2. File with your state's business division (usually Secretary of State)
3. Pay filing fee (ranges from $40-$500 depending on state)
4. Wait for approval (typically 1-3 weeks, expedited options available)

### For Corporation Formation:
1. Prepare Articles of Incorporation
2. File with your state's business division
3. Pay filing fee (typically higher than LLC fees)
4. Wait for approval
5. Hold initial board meeting
6. Issue stock certificates

### For Sole Proprietorship:
1. File a DBA ("doing business as") if using a name other than your legal name
2. Apply for necessary local business licenses
3. No state filing required for the entity itself

## What You'll Need to File

- Business name
- Business address
- Registered agent information
- Names of members/managers (LLC) or directors/officers (corporation)
- Business purpose
- Duration of the entity (usually "perpetual")
- Payment method for filing fees

## After Filing

Once your filing is approved, you'll receive:
- Certificate of Formation/Organization (LLC)
- Certificate of Incorporation (Corporation)
- State filing number

Keep these documents safe - you'll need them for the next steps.

## Next Steps Preview

After your entity is approved, you'll need to:
1. Obtain an EIN (Employer Identification Number)
2. Open a business bank account
3. Create an operating agreement (LLC) or bylaws (corporation)
4. Set up accounting systems

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
        title: 'State Filing Requirements',
        description: 'View specific requirements for your state',
        type: 'lookup'
      },
      {
        id: 'articles-template',
        title: 'Articles Template Generator',
        description: 'Generate a template for your Articles of Organization/Incorporation',
        type: 'template'
      },
      {
        id: 'fee-calculator',
        title: 'Filing Fee Calculator',
        description: 'Calculate the total cost to file in your state',
        type: 'calculator'
      }
    ]
  },
  {
    id: 'back-office',
    title: 'Set Up Your Back Office',
    description: 'Establish the essential systems to operate your business legally',
    order: 4,
    content: `
# Setting Up Your Back Office

Congratulations on filing your business entity! Now it's time to set up the essential systems that will make your business operational and compliant.

## Obtain an Employer Identification Number (EIN)

An EIN is like a social security number for your business. You'll need it to:
- Open a business bank account
- File business taxes
- Hire employees
- Apply for business licenses

### How to Apply:
- Apply online through the IRS website (free)
- Receive your EIN immediately after applying
- No need for a third-party service

**Note:** Sole proprietors without employees can use their SSN instead of an EIN, but getting an EIN is still recommended.

## Open a Business Bank Account

Separating personal and business finances is crucial for:
- Legal protection (maintaining your liability shield)
- Clean accounting
- Tax preparation
- Professional image

### What You'll Need:
- EIN
- Formation documents (Articles of Organization/Incorporation)
- Business license (if required in your jurisdiction)
- Photo ID

### Recommended Account Features:
- Low or no monthly fees
- Free transactions
- Online banking
- Business debit card
- Integration with accounting software

## Create Governing Documents

### For LLCs: Operating Agreement
- Defines ownership percentages
- Outlines management structure
- Sets rules for decision-making
- Establishes procedures for member changes
- Not required in all states, but highly recommended

### For Corporations: Bylaws
- Establishes board of directors
- Defines officer roles
- Sets shareholder rights
- Outlines meeting procedures
- Required for proper corporate governance

## Set Up Accounting System

Proper bookkeeping from day one will save you headaches later.

### Options:
- DIY with spreadsheets (simplest, but limited)
- Basic accounting software (QuickBooks, Xero, Wave)
- Hire a bookkeeper (most expensive, but hands-off)

### Key Accounting Tasks:
- Track income and expenses
- Separate business and personal expenses
- Save receipts
- Prepare for tax filings
- Monitor business health

## Compliance Calendar

Create a calendar of important dates:
- Annual report filing
- Tax deadlines
- License renewals
- Required meetings (corporations)

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
        title: 'EIN Application Assistant',
        description: 'Step-by-step guide to applying for an EIN',
        type: 'template',
        url: 'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online'
      },
      {
        id: 'operating-agreement',
        title: 'Operating Agreement Template',
        description: 'Customizable template for LLC Operating Agreements',
        type: 'template'
      },
      {
        id: 'bylaws-template',
        title: 'Corporate Bylaws Template',
        description: 'Customizable template for Corporate Bylaws',
        type: 'template'
      },
      {
        id: 'compliance-calendar',
        title: 'Compliance Calendar Generator',
        description: 'Create a calendar of important compliance dates',
        type: 'generator'
      }
    ]
  },
  {
    id: 'compliance-checklist',
    title: 'Compliance & First-Year Checklist',
    description: 'Ensure ongoing compliance and set up for success',
    order: 5,
    content: `
# Compliance & First-Year Checklist

Congratulations on setting up your business! Now let's ensure you stay compliant and set yourself up for success in your first year of operations.

## Ongoing Compliance Requirements

### Annual Reports
Most states require annual reports to maintain your business in good standing.
- Due dates vary by state (often on formation anniversary or calendar year)
- Fees range from $0-$800 depending on state
- Can typically be filed online
- May require updated business information

### Business Licenses and Permits
Depending on your industry and location, you may need:
- General business license (city/county)
- Professional licenses
- Health department permits
- Zoning permits
- Sales tax permits

### Tax Obligations

#### Federal Taxes:
- Income tax returns (form depends on entity type)
- Estimated quarterly taxes
- Employment taxes (if you have employees)

#### State Taxes:
- State income taxes
- Sales and use tax
- Franchise tax (in some states)

#### Local Taxes:
- City/county business taxes
- Property taxes

## First-Year Business Essentials

### Legal Protection
- Review and update your operating agreement/bylaws as needed
- Create standard contracts for clients/customers
- Implement proper disclaimers and policies
- Consider trademark protection for your business name/logo

### Financial Management
- Set up a bookkeeping routine (weekly/monthly)
- Establish a system for tracking business expenses
- Create a budget and cash flow projection
- Plan for tax payments

### Business Insurance
Consider which types you need:
- General liability insurance
- Professional liability/E&O insurance
- Property insurance
- Workers' compensation (if you have employees)
- Business interruption insurance

### Business Credit
- Begin building business credit history
- Consider a business credit card
- Establish relationships with vendors
- Monitor your business credit score

## Common First-Year Pitfalls to Avoid

- Mixing personal and business finances
- Missing filing deadlines
- Inadequate recordkeeping
- Underestimating tax obligations
- Failing to maintain corporate formalities (for corporations)
- Not keeping up with industry regulations

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
        title: 'Compliance Calendar Generator',
        description: 'Create a calendar with all your compliance deadlines',
        type: 'generator'
      },
      {
        id: 'license-finder',
        title: 'Business License Finder',
        description: 'Discover which licenses and permits your business needs',
        type: 'lookup'
      },
      {
        id: 'tax-calculator',
        title: 'Estimated Tax Calculator',
        description: 'Calculate your estimated quarterly tax payments',
        type: 'calculator'
      },
      {
        id: 'contract-templates',
        title: 'Business Contract Templates',
        description: 'Access templates for common business agreements',
        type: 'template'
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
      'Can be member-managed or manager-managed'
    ],
    disadvantages: [
      'Self-employment taxes for active members',
      'More expensive to form than sole proprietorships',
      'May have franchise taxes in some states',
      'Can be harder to raise venture capital'
    ],
    formationSteps: [
      'Choose a name that complies with state LLC rules',
      'File Articles of Organization with state',
      'Pay filing fee (varies by state)',
      'Create an Operating Agreement',
      'Obtain EIN from IRS',
      'Open business bank account',
      'Apply for necessary licenses and permits'
    ],
    ongoingRequirements: [
      'Annual reports/fees in most states',
      'Maintain separation between business and personal',
      'File federal and state tax returns',
      'Keep Operating Agreement updated',
      'Hold member meetings (recommended but not required)'
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
  }
  // Additional states would be added here
};