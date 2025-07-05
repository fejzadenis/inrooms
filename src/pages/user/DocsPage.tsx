import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { 
  FileText, 
  Book, 
  Video, 
  Download, 
  ExternalLink, 
  Search, 
  ChevronRight, 
  Play,
  Clock,
  User,
  Calendar,
  MessageSquare,
  Settings,
  CreditCard,
  Users,
  Star,
  Bookmark
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';

export function DocsPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedSection, setSelectedSection] = React.useState<string | null>(null);

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Book,
      description: 'Everything you need to know to get up and running',
      color: 'bg-blue-500'
    },
    {
      id: 'user-guide',
      title: 'User Guide',
      icon: User,
      description: 'Complete guide to using all platform features',
      color: 'bg-green-500'
    },
    {
      id: 'events',
      title: 'Events & Networking',
      icon: Calendar,
      description: 'How to join events and network effectively',
      color: 'bg-purple-500'
    },
    {
      id: 'account',
      title: 'Account Management',
      icon: Settings,
      description: 'Manage your profile, billing, and preferences',
      color: 'bg-orange-500'
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: FileText,
      description: 'Solutions to common issues and problems',
      color: 'bg-red-500'
    }
  ];

  const documentation = [
    // Getting Started
    {
      id: 'platform-overview',
      section: 'getting-started',
      title: 'Founder Platform Overview',
      description: 'Learn how inrooms helps founders connect and build',
      type: 'guide',
      readTime: '5 min',
      content: `
# Founder Platform Overview

Welcome to inrooms, the premier networking platform for early-stage founders, operators, and builders. Our platform is designed to help you find co-founders, connect with investors, get user feedback, and accelerate your startup journey.

## What is inrooms?

inrooms is a curated networking platform that connects startup founders through:
- **Curated Rooms**: Join intimate, focused sessions with other builders
- **Quality Connections**: Connect with verified founders, operators, and investors
- **Startup Growth**: Access resources, mentorship, and funding opportunities
- **Builder Community**: Be part of a supportive ecosystem of startup founders

## Key Features

### Rooms & Workshops
- Weekly founder networking sessions
- Skill-building workshops on fundraising, product, and growth
- Panel discussions with successful founders and investors
- Tactical keynotes from experienced operators

### Networking Tools
- Founder profile system with startup stage matching
- Direct messaging with connections
- LinkedIn integration for seamless networking
- Connection recommendations based on your startup needs

### Founder Resources
- Pitch deck templates and fundraising playbooks
- Product development tutorials
- Market validation frameworks
- Investor introductions and hiring resources

## Getting Started

1. **Complete Your Profile**: Add your professional information, skills, and photo
2. **Connect Your LinkedIn**: Import your network and enhance your founder profile
3. **Browse Rooms**: Find sessions that match your startup's stage and needs
4. **Start Networking**: Connect with potential co-founders, investors, and early users
5. **Join Rooms**: Participate in live collaboration sessions and founder workshops

## Success Tips

- **Be Active**: Regular participation leads to better connections
- **Be Authentic**: Genuine interactions create lasting relationships
- **Follow Up**: Connect with founders you meet in Rooms
- **Share Value**: Help others and they'll help you in return
      `
    },
    {
      id: 'account-setup',
      section: 'getting-started',
      title: 'Account Setup Guide',
      description: 'Step-by-step guide to setting up your account',
      type: 'guide',
      readTime: '10 min',
      content: `
# Account Setup Guide

Follow this comprehensive guide to set up your inrooms account for maximum networking success.

## Step 1: Create Your Account

1. Visit the signup page and choose your registration method:
   - Email and password
   - Google Sign-In (recommended for faster setup)

2. Verify your email address if using email registration

3. Choose your subscription plan or start with the free trial

## Step 2: Complete Your Profile

### Basic Information
- **Full Name**: Use your professional name
- **Job Title**: Be specific (e.g., "Senior Enterprise Sales Manager")
- **Company**: Current employer
- **Location**: City and state/country

### Professional Details
- **About Section**: Write a compelling 2-3 sentence summary
- **Skills**: Add relevant sales skills (CRM, Lead Generation, etc.)
- **Experience**: Highlight your sales achievements
- **Contact Information**: Add phone and website if comfortable

### Profile Photo
- Use a professional headshot
- Ensure good lighting and clear image
- Smile and look approachable
- Avoid group photos or casual images

## Step 3: Connect Your LinkedIn

1. Go to your Profile page
2. Click "Connect LinkedIn"
3. Authorize the connection
4. Review and sync your professional information

Benefits of LinkedIn integration:
- Auto-populate profile information
- Import existing connections
- Enhanced networking recommendations
- Credibility boost with verified profile

## Step 4: Set Your Preferences

### Notification Settings
- Event reminders
- New connection requests
- Message notifications
- Weekly digest emails

### Privacy Settings
- Profile visibility
- Contact information sharing
- Event attendance visibility
- Connection list privacy

## Step 5: Explore the Platform

### Browse Events
- Check the Events page for upcoming sessions
- Filter by topic, date, or format
- Read event descriptions and speaker bios
- Register for events that interest you

### Discover People
- Visit the Network page
- Review connection recommendations
- Send personalized connection requests
- Start conversations with new connections

## Profile Optimization Tips

### Write a Compelling About Section
Good example: "Enterprise sales leader with 8+ years driving $10M+ in annual revenue. Passionate about building long-term client relationships and helping startups scale their sales operations."

### Choose Relevant Skills
Focus on:
- Sales methodologies (SPIN, Challenger, etc.)
- Industry expertise (SaaS, FinTech, etc.)
- Tools and platforms (Salesforce, HubSpot, etc.)
- Soft skills (Negotiation, Relationship Building, etc.)

### Keep Information Current
- Update your role changes
- Add new skills and certifications
- Refresh your photo annually
- Update your achievements and metrics

## Next Steps

Once your profile is complete:
1. Register for your first event
2. Send 3-5 connection requests
3. Join relevant conversations
4. Set up your calendar for regular networking
      `
    },
    {
      id: 'first-event',
      section: 'getting-started',
      title: 'Attending Your First Room',
      description: 'How to prepare for and make the most of your first founder networking session',
      type: 'guide',
      readTime: '8 min',
      content: `
# Attending Your First Founder Room

Make a great first impression and maximize your networking success with this comprehensive guide.

## Before the Event

### Preparation (1-2 days before)
1. **Review the Room Details**
   - Read the agenda and speaker bios
   - Understand the Room format and focus area
   - Note the meeting link and time zone

2. **Prepare Your Introduction**
   - Craft a 30-second elevator pitch
   - Practice explaining your startup clearly
   - Prepare 2-3 questions to ask others

3. **Technical Setup**
   - Test your camera and microphone
   - Ensure stable internet connection
   - Update your browser or video app
   - Find a quiet, well-lit space

### Day of the Event
- Join 5-10 minutes early
- Have a notepad ready for taking notes
- Close unnecessary applications
- Put your phone on silent

## During the Event

### Making Connections
1. **Be Engaged**
   - Always turn on your camera
   - Use the chat feature appropriately
   - Ask thoughtful questions
   - Share relevant founder experiences

2. **Networking Etiquette**
   - Introduce yourself when prompted
   - Listen actively to others
   - Be respectful of speaking time
   - Stay positive and professional

3. **Take Notes**
   - Write down interesting insights
   - Note potential co-founders or collaborators
   - Record action items or follow-ups
   - Save useful resources shared

### Common Event Formats

**Founder Roundtables**
- Small groups (5-8 people)
- Facilitated conversation
- Everyone gets to share
- More intimate networking

**Founder Panel Sessions**
- Successful founders share experiences
- Q&A opportunities
- Larger audience
- Learning-focused

**Founder Workshops**
- Interactive learning
- Hands-on activities
- Skill development
- Practical takeaways

**Open Build Rooms**
- Drop-in co-working sessions
- Screen sharing for feedback
- Collaborative problem solving
- Accountability and momentum

## After the Event

### Immediate Follow-up (within 24 hours)
1. **Connect on the Platform**
   - Send connection requests to people you met
   - Include a personalized message
   - Reference your conversation

2. **Send Thank You Messages**
   - Thank the organizers
   - Reach out to speakers if appropriate
   - Share additional resources if promised

### Longer-term Follow-up (within 1 week)
1. **Schedule Follow-up Conversations**
   - Suggest coffee chats or calls
   - Share relevant opportunities
   - Offer to make introductions

2. **Implement What You Learned**
   - Apply new strategies or tools
   - Share insights with your team
   - Plan to attend related events

## Networking Best Practices

### Do's
- ✅ Be authentic and genuine
- ✅ Ask open-ended questions
- ✅ Share your expertise generously
- ✅ Follow up promptly
- ✅ Offer help before asking for it

### Don'ts
- ❌ Dominate conversations
- ❌ Pitch your services immediately
- ❌ Forget to follow up
- ❌ Be pushy or aggressive
- ❌ Multitask during the event

## Sample Introduction

"Hi, I'm [Name], founder of [Startup]. We're building [brief description] to solve [problem]. We're currently at [stage] and I'm looking for [specific need - co-founder/investment/feedback]. I'm excited to be here because I'm looking to connect with other founders who understand the challenges of building something from scratch. What are you working on?"

## Making the Most of Your Investment

Remember, networking is about building relationships, not just collecting contacts. Focus on:
- Quality over quantity of connections
- Providing value to others
- Building long-term relationships
- Continuous learning and growth

Your first Room is just the beginning of your founder journey with inrooms!
      `
    },

    // User Guide
    {
      id: 'profile-management',
      section: 'user-guide',
      title: 'Profile Management',
      description: 'How to create and maintain an effective professional profile',
      type: 'guide',
      readTime: '12 min',
      content: `
# Profile Management

Your profile is your digital business card and the foundation of your networking success on inrooms.

## Profile Sections Overview

### Basic Information
- **Name**: Your professional name as you want to be known
- **Title**: Current job title or professional designation
- **Company**: Current employer or "Freelance/Consultant"
- **Location**: City, State/Country for networking relevance

### Professional Summary
- **About**: 2-3 sentences describing your expertise and goals
- **Skills**: Relevant professional skills and competencies
- **Experience**: Key achievements and career highlights

### Contact & Social
- **Email**: Professional email address
- **Phone**: Optional, for closer connections
- **Website**: Personal website or portfolio
- **LinkedIn**: Professional LinkedIn profile

## Writing an Effective About Section

### Structure
1. **Current Role**: What you do now
2. **Experience**: Years of experience and specialization
3. **Value Proposition**: What makes you unique
4. **Goals**: What you're looking to achieve

### Examples

**Good Example:**
"Enterprise Sales Director with 10+ years driving $50M+ in annual revenue for B2B SaaS companies. Specialized in complex deal cycles and building strategic partnerships. Passionate about mentoring emerging sales talent and exploring innovative sales technologies."

**Avoid:**
"Sales professional looking for opportunities. Hard worker with great communication skills."

## Skills Selection Strategy

### Categories to Include

**Sales Methodologies**
- SPIN Selling
- Challenger Sale
- Solution Selling
- Consultative Selling
- Account-Based Selling

**Industry Expertise**
- SaaS/Software
- FinTech
- HealthTech
- Enterprise Software
- Cybersecurity

**Tools & Platforms**
- Salesforce
- HubSpot
- Outreach
- SalesLoft
- LinkedIn Sales Navigator

**Soft Skills**
- Relationship Building
- Negotiation
- Presentation Skills
- Team Leadership
- Strategic Planning

### Skill Optimization Tips
- Choose 8-12 most relevant skills
- Update skills as you develop new competencies
- Align skills with your target connections
- Include both technical and soft skills

## Photo Guidelines

### Professional Headshot Best Practices
- **Quality**: High resolution, clear image
- **Lighting**: Natural light or professional lighting
- **Background**: Simple, uncluttered background
- **Attire**: Professional business attire
- **Expression**: Genuine smile, approachable demeanor

### Technical Requirements
- Minimum 400x400 pixels
- JPG or PNG format
- File size under 5MB
- Square aspect ratio preferred

## Privacy Settings

### Profile Visibility Options
- **Public**: Visible to all platform users
- **Connections Only**: Visible only to your connections
- **Private**: Visible only to you

### Information Sharing Controls
- **Contact Information**: Choose what to share
- **Event Attendance**: Show/hide event participation
- **Connection List**: Public or private connections
- **Activity Status**: Show when you're online

## Profile Maintenance

### Regular Updates (Monthly)
- Review and update your current role
- Add new skills or certifications
- Update your photo if needed
- Refresh your about section

### Quarterly Reviews
- Analyze profile views and connection requests
- Update goals and objectives
- Review privacy settings
- Optimize for better networking results

### Annual Overhaul
- Complete profile audit
- Professional photo update
- Comprehensive skills review
- Strategic positioning adjustment

## LinkedIn Integration

### Benefits of Connecting
- Auto-sync professional information
- Import existing network
- Enhanced credibility
- Better connection recommendations

### Sync Process
1. Navigate to Profile page
2. Click "Connect LinkedIn"
3. Authorize access
4. Review imported information
5. Customize as needed

### Managing Synced Data
- Choose which information to import
- Override LinkedIn data when necessary
- Maintain consistency across platforms
- Regular sync updates

## Profile Analytics

### Key Metrics to Track
- **Profile Views**: How often people view your profile
- **Connection Requests**: Incoming networking interest
- **Message Response Rate**: Engagement quality
- **Event Attendance**: Networking activity level

### Optimization Strategies
- A/B test different about sections
- Experiment with skill combinations
- Update photos and measure impact
- Track networking success metrics

## Common Profile Mistakes

### What to Avoid
- ❌ Incomplete or outdated information
- ❌ Unprofessional photos
- ❌ Generic or vague descriptions
- ❌ Too many or irrelevant skills
- ❌ Inconsistent information across platforms

### Red Flags for Connections
- Missing profile photo
- No company information
- Vague job titles
- Empty about section
- No mutual connections or context

## Profile Success Checklist

### Essential Elements
- ✅ Professional headshot
- ✅ Complete basic information
- ✅ Compelling about section
- ✅ Relevant skills (8-12)
- ✅ LinkedIn integration
- ✅ Appropriate privacy settings
- ✅ Regular updates and maintenance

Your profile is an investment in your networking success. Take time to craft it thoughtfully and maintain it regularly.
      `
    },

    // Events & Networking
    {
      id: 'event-types',
      section: 'events',
      title: 'Types of Events',
      description: 'Understanding different event formats and how to choose the right ones',
      type: 'guide',
      readTime: '7 min',
      content: `
# Types of Events

inrooms offers various event formats designed to meet different networking and learning objectives.

## Event Categories

### Networking Events
**Purpose**: Building professional relationships and expanding your network

**Roundtable Discussions**
- 6-10 participants
- Facilitated conversations
- Topic-focused discussions
- Equal participation opportunity
- Duration: 60-90 minutes

**Speed Networking**
- Quick 1-on-1 conversations
- Rotating format
- High volume connections
- Efficient relationship building
- Duration: 60 minutes

**Industry Mixers**
- Casual networking atmosphere
- Open conversations
- Multiple breakout rooms
- Self-directed networking
- Duration: 90-120 minutes

### Educational Workshops
**Purpose**: Skill development and knowledge sharing

**Sales Masterclasses**
- Expert-led training sessions
- Interactive learning
- Practical exercises
- Q&A opportunities
- Duration: 2-3 hours

**Tool Training**
- Platform-specific education
- Hands-on practice
- Implementation guidance
- Best practices sharing
- Duration: 60-90 minutes

**Strategy Sessions**
- High-level strategic discussions
- Case study analysis
- Group problem-solving
- Peer learning
- Duration: 90 minutes

### Panel Discussions
**Purpose**: Industry insights and thought leadership

**Expert Panels**
- 3-4 industry leaders
- Moderated discussions
- Audience Q&A
- Diverse perspectives
- Duration: 60 minutes

**Fireside Chats**
- Intimate conversations
- One-on-one interviews
- Personal stories
- Career insights
- Duration: 45 minutes

## Event Formats

### Live Interactive Events
- Real-time participation
- Video and audio engagement
- Chat interactions
- Breakout rooms
- Immediate networking

### Webinar Style
- Presentation focused
- Limited audience interaction
- Q&A sessions
- Educational content
- Larger audiences

### Hybrid Events
- Multiple participation options
- Live and recorded elements
- Various engagement levels
- Flexible attendance
- Extended reach

## Choosing the Right Events

### Consider Your Goals

**For Networking**
- Roundtable discussions
- Speed networking
- Industry mixers
- Smaller group events

**For Learning**
- Workshops and masterclasses
- Panel discussions
- Expert presentations
- Skill-specific sessions

**For Career Development**
- Leadership panels
- Mentorship sessions
- Career strategy workshops
- Industry trend discussions

### Evaluate Your Schedule
- **Time Commitment**: Match event duration to availability
- **Frequency**: Balance regular participation with quality
- **Time Zones**: Consider global event timing
- **Preparation Time**: Factor in pre-event preparation

### Assess Your Experience Level
- **Beginner**: Start with educational workshops
- **Intermediate**: Mix networking and learning events
- **Advanced**: Focus on leadership and strategy sessions
- **Expert**: Consider speaking or hosting opportunities

## Event Preparation Strategies

### Before Registering
1. Read event descriptions carefully
2. Research speakers and facilitators
3. Check participant list if available
4. Confirm technical requirements
5. Block calendar time appropriately

### Pre-Event Preparation
1. Review agenda and materials
2. Prepare relevant questions
3. Set networking objectives
4. Test technical setup
5. Plan follow-up strategy

## Maximizing Event Value

### During the Event
- **Arrive Early**: Join 5-10 minutes before start
- **Be Engaged**: Participate actively in discussions
- **Take Notes**: Capture key insights and contacts
- **Ask Questions**: Engage with speakers and participants
- **Exchange Information**: Connect with relevant attendees

### Post-Event Actions
- **Follow Up**: Connect within 24-48 hours
- **Share Insights**: Discuss learnings with your team
- **Implement Ideas**: Apply new strategies or tools
- **Provide Feedback**: Help improve future events
- **Schedule Follow-ups**: Plan deeper conversations

## Event Etiquette

### Professional Behavior
- **Punctuality**: Join on time and stay for duration
- **Respect**: Listen actively and avoid interrupting
- **Relevance**: Keep contributions on-topic
- **Authenticity**: Be genuine in interactions
- **Gratitude**: Thank organizers and speakers

### Technical Etiquette
- **Mute When Not Speaking**: Reduce background noise
- **Good Lighting**: Ensure you're clearly visible
- **Stable Connection**: Test internet beforehand
- **Professional Background**: Use appropriate virtual backgrounds
- **Camera On**: Engage visually when possible

## Event ROI Measurement

### Quantitative Metrics
- Number of new connections made
- Follow-up meetings scheduled
- Business opportunities identified
- Skills or knowledge gained
- Time invested vs. value received

### Qualitative Benefits
- Relationship quality improvements
- Industry insight development
- Personal brand enhancement
- Confidence building
- Community engagement

## Special Event Opportunities

### VIP Events
- Exclusive access for premium members
- Smaller group sizes
- High-profile speakers
- Enhanced networking opportunities
- Premium content and resources

### Member-Led Events
- Community-driven content
- Peer-to-peer learning
- Diverse perspectives
- Collaborative format
- Skill sharing opportunities

### Partner Events
- Co-hosted with industry partners
- Expanded networking reach
- Specialized content
- Cross-industry connections
- Enhanced value proposition

Choose events strategically based on your goals, schedule, and career stage for maximum networking success.
      `
    },

    // Account Management
    {
      id: 'billing-subscriptions',
      section: 'account',
      title: 'Billing & Subscriptions',
      description: 'Managing your subscription, billing, and payment information',
      type: 'guide',
      readTime: '10 min',
      content: `
# Billing & Subscriptions

Complete guide to managing your inrooms subscription, billing, and payment information.

## Subscription Plans

### Free Trial
- **Duration**: 7 days
- **Events**: 2 event registrations
- **Features**: Full platform access
- **Limitations**: Limited event quota
- **Upgrade**: Anytime during or after trial

### Starter Plan - $49/month
- **Events**: 2 events per month
- **Features**: 
  - Event recordings access
  - Basic profile features
  - Standard support
  - Mobile app access
- **Best For**: Occasional networkers

### Professional Plan - $99/month
- **Events**: 5 events per month
- **Features**:
  - Everything in Starter
  - Enhanced profile features
  - Priority event registration
  - Advanced networking tools
  - Email support
- **Best For**: Active networkers

### Enterprise Plan - $199/month
- **Events**: 12 events per month
- **Features**:
  - Everything in Professional
  - Premium profile features
  - Custom event scheduling
  - Dedicated account manager
  - Phone support
  - Analytics dashboard
- **Best For**: Power networkers and teams

## Managing Your Subscription

### Viewing Current Plan
1. Navigate to Billing page
2. View current plan details
3. Check remaining event quota
4. Review next billing date
5. See payment history

### Upgrading Your Plan
1. Go to Billing page
2. Click "Upgrade Plan"
3. Select desired plan
4. Confirm payment method
5. Changes take effect immediately

### Downgrading Your Plan
1. Access Billing settings
2. Select "Change Plan"
3. Choose lower tier plan
4. Confirm downgrade
5. Changes apply at next billing cycle

### Canceling Your Subscription
1. Visit Billing page
2. Click "Cancel Subscription"
3. Select cancellation reason
4. Confirm cancellation
5. Access continues until period end

## Payment Management

### Accepted Payment Methods
- **Credit Cards**: Visa, MasterCard, American Express
- **Debit Cards**: Major debit cards accepted
- **Digital Wallets**: PayPal, Apple Pay, Google Pay
- **Bank Transfers**: Available for Enterprise plans

### Adding Payment Methods
1. Go to Billing page
2. Click "Add Payment Method"
3. Enter payment information
4. Verify billing address
5. Save as default if desired

### Updating Payment Information
1. Access payment methods
2. Select method to update
3. Edit information
4. Verify changes
5. Save updates

### Setting Default Payment Method
1. View payment methods
2. Select preferred method
3. Click "Set as Default"
4. Confirm selection
5. Future charges use this method

## Billing Cycles and Invoices

### Billing Schedule
- **Monthly Plans**: Charged on signup date each month
- **Annual Plans**: Charged annually with 20% discount
- **Pro-rated Charges**: Upgrades charged immediately
- **Refunds**: Available within 30 days of charge

### Invoice Management
1. **Viewing Invoices**
   - Access Billing page
   - Click "Invoice History"
   - View all past invoices
   - Download PDF copies

2. **Invoice Details**
   - Billing period
   - Plan information
   - Payment method used
   - Tax information
   - Total amount charged

### Failed Payments
1. **Automatic Retry**: System retries failed payments
2. **Email Notifications**: Alerts sent for failed payments
3. **Grace Period**: 7-day grace period for resolution
4. **Account Suspension**: After grace period expires
5. **Reactivation**: Update payment method to restore access

## Event Quota Management

### Understanding Event Quotas
- **Monthly Allocation**: Events included in your plan
- **Rollover Policy**: Unused events don't carry over
- **Overage Charges**: Additional events at $25 each
- **Quota Reset**: Resets on billing cycle date

### Monitoring Usage
1. Check dashboard for current usage
2. View remaining events for the month
3. Set up low-quota notifications
4. Plan event attendance accordingly
5. Upgrade if consistently exceeding quota

### Purchasing Additional Events
1. Go to Billing page
2. Click "Buy Additional Events"
3. Select quantity needed
4. Confirm purchase
5. Events added immediately

## Tax Information

### Tax Calculation
- **Location-Based**: Based on billing address
- **Automatic Calculation**: System calculates applicable taxes
- **Invoice Inclusion**: Taxes shown separately on invoices
- **Compliance**: Meets local tax requirements

### Tax Exemption
1. **Eligibility**: Non-profit organizations may qualify
2. **Documentation**: Provide tax exemption certificate
3. **Verification**: Manual review process
4. **Application**: Contact support for assistance

## Account Security

### Payment Security
- **PCI Compliance**: Industry-standard security
- **Encryption**: All payment data encrypted
- **Tokenization**: Card numbers never stored
- **Fraud Protection**: Advanced fraud detection

### Account Protection
- **Two-Factor Authentication**: Enable for added security
- **Password Requirements**: Strong password policies
- **Login Monitoring**: Unusual activity alerts
- **Data Protection**: GDPR and privacy compliance

## Billing Support

### Common Issues
- **Payment Failures**: Update payment method
- **Billing Disputes**: Contact support within 30 days
- **Plan Changes**: Immediate assistance available
- **Refund Requests**: Processed within 5-7 business days

### Getting Help
1. **Email Support**: billing@inrooms.com
2. **Live Chat**: Available during business hours
3. **Phone Support**: Enterprise customers only
4. **Help Center**: Self-service resources

### Response Times
- **Email**: 24-48 hours
- **Live Chat**: Immediate during business hours
- **Phone**: Immediate for Enterprise customers
- **Billing Issues**: Priority handling

## Cost Optimization Tips

### Maximizing Value
1. **Plan Selection**: Choose plan matching your usage
2. **Annual Billing**: Save 20% with annual plans
3. **Event Planning**: Schedule events efficiently
4. **Feature Utilization**: Use all included features
5. **Regular Review**: Assess plan needs quarterly

### Budget Management
- **Set Spending Limits**: Monitor monthly costs
- **Usage Tracking**: Keep track of event attendance
- **Plan Adjustments**: Modify plan as needs change
- **Cost Forecasting**: Plan for seasonal variations

Your billing and subscription management is designed to be flexible and transparent, allowing you to focus on networking success.
      `
    }
  ];

  const videos = [
    {
      id: 'platform-walkthrough',
      title: 'Platform Walkthrough',
      description: 'Complete tour of the inrooms platform and its features',
      duration: '12:30',
      thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
      category: 'getting-started'
    },
    {
      id: 'profile-optimization',
      title: 'Profile Optimization',
      description: 'How to create a compelling professional profile',
      duration: '8:45',
      thumbnail: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg',
      category: 'user-guide'
    },
    {
      id: 'networking-best-practices',
      title: 'Networking Best Practices',
      description: 'Expert tips for effective networking at virtual events',
      duration: '15:20',
      thumbnail: 'https://images.pexels.com/photos/3184293/pexels-photo-3184293.jpeg',
      category: 'events'
    },
    {
      id: 'event-participation',
      title: 'Event Participation Guide',
      description: 'How to prepare for and participate in networking events',
      duration: '10:15',
      thumbnail: 'https://images.pexels.com/photos/3184294/pexels-photo-3184294.jpeg',
      category: 'events'
    },
    {
      id: 'billing-management',
      title: 'Billing & Subscription Management',
      description: 'Managing your account, billing, and subscription settings',
      duration: '6:30',
      thumbnail: 'https://images.pexels.com/photos/3184295/pexels-photo-3184295.jpeg',
      category: 'account'
    },
    {
      id: 'troubleshooting-common-issues',
      title: 'Troubleshooting Common Issues',
      description: 'Solutions to frequently encountered technical problems',
      duration: '9:45',
      thumbnail: 'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg',
      category: 'troubleshooting'
    }
  ];

  const downloads = [
    {
      id: 'networking-checklist',
      title: 'Event Networking Checklist',
      description: 'Pre-event preparation and follow-up checklist',
      type: 'PDF',
      size: '2.1 MB',
      category: 'events'
    },
    {
      id: 'profile-template',
      title: 'Professional Profile Template',
      description: 'Template for creating an effective profile',
      type: 'PDF',
      size: '1.8 MB',
      category: 'user-guide'
    },
    {
      id: 'sales-conversation-starters',
      title: 'Sales Conversation Starters',
      description: 'Collection of conversation starters for networking',
      type: 'PDF',
      size: '1.2 MB',
      category: 'events'
    },
    {
      id: 'linkedin-integration-guide',
      title: 'LinkedIn Integration Guide',
      description: 'Step-by-step guide to connecting your LinkedIn',
      type: 'PDF',
      size: '3.4 MB',
      category: 'user-guide'
    },
    {
      id: 'troubleshooting-guide',
      title: 'Technical Troubleshooting Guide',
      description: 'Solutions for common technical issues',
      type: 'PDF',
      size: '2.7 MB',
      category: 'troubleshooting'
    }
  ];

  const filteredDocs = documentation.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = !selectedSection || doc.section === selectedSection;
    return matchesSearch && matchesSection;
  });

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = !selectedSection || video.category === selectedSection;
    return matchesSearch && matchesSection;
  });

  const filteredDownloads = downloads.filter(download => {
    const matchesSearch = download.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         download.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = !selectedSection || download.category === selectedSection;
    return matchesSearch && matchesSection;
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Documentation</h1>
          <p className="mt-4 text-xl text-gray-600">
            Comprehensive guides, tutorials, and resources to help you succeed
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search documentation, videos, and downloads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/help" className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
            <MessageSquare className="w-8 h-8 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
            <p className="text-blue-100">Get support from our help center</p>
          </Link>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <Video className="w-8 h-8 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Video Tutorials</h3>
            <p className="text-green-100">Watch step-by-step guides</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <Download className="w-8 h-8 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Downloads</h3>
            <p className="text-purple-100">Get templates and resources</p>
          </div>
        </div>

        {/* Sections */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Section</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <button
              onClick={() => setSelectedSection(null)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                !selectedSection 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="bg-gray-100 text-gray-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Book className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-gray-900">All Sections</h3>
                <p className="text-sm text-gray-500 mt-1">Everything</p>
              </div>
            </button>
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedSection === section.id 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${section.color} text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-medium text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Documentation Articles */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            <FileText className="inline-block w-6 h-6 mr-2" />
            Documentation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <div key={doc.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                    {doc.type}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {doc.readTime}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{doc.title}</h3>
                <p className="text-gray-600 mb-4">{doc.description}</p>
                <Button variant="outline" className="w-full">
                  <Book className="w-4 h-4 mr-2" />
                  Read Guide
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Video Tutorials */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            <Video className="inline-block w-6 h-6 mr-2" />
            Video Tutorials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div key={video.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="bg-white bg-opacity-90 rounded-full p-3">
                      <Play className="w-6 h-6 text-gray-900" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                    {video.duration}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{video.title}</h3>
                  <p className="text-gray-600 mb-4">{video.description}</p>
                  <Button className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Watch Video
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Downloads */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            <Download className="inline-block w-6 h-6 mr-2" />
            Downloads & Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDownloads.map((download) => (
              <div key={download.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                    {download.type}
                  </div>
                  <span className="text-sm text-gray-500">{download.size}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{download.title}</h3>
                <p className="text-gray-600 mb-4">{download.description}</p>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Need More Help?</h3>
            <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you succeed 
              with personalized assistance and guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/help">
                <Button variant="outline" className="bg-white text-indigo-600 hover:bg-gray-50 border-white">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Visit Help Center
                </Button>
              </Link>
              <a href="mailto:support@inrooms.com">
                <Button className="bg-indigo-700 hover:bg-indigo-800 text-white">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}