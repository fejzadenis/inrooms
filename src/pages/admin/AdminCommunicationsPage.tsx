import React from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { Button } from '../../components/common/Button';
import { 
  Mail, 
  Send, 
  Users, 
  MessageSquare, 
  Bell,
  Calendar,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  recipients: 'all' | 'active' | 'trial' | 'inactive';
  recipientCount: number;
  status: 'draft' | 'scheduled' | 'sent' | 'sending';
  scheduledAt?: Date;
  sentAt?: Date;
  openRate?: number;
  clickRate?: number;
  createdAt: Date;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  recipients: 'all' | 'active' | 'trial' | 'inactive';
  recipientCount: number;
  status: 'draft' | 'sent';
  sentAt?: Date;
  createdAt: Date;
}

export function AdminCommunicationsPage() {
  const [activeTab, setActiveTab] = React.useState<'emails' | 'notifications' | 'templates'>('emails');
  const [emailCampaigns, setEmailCampaigns] = React.useState<EmailCampaign[]>([]);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isComposerOpen, setIsComposerOpen] = React.useState(false);

  // Mock data
  React.useEffect(() => {
    const mockEmailCampaigns: EmailCampaign[] = [
      {
        id: 'email_1',
        name: 'Welcome Series - Week 1',
        subject: 'Welcome to inrooms! Get started with your first event',
        content: 'Welcome to the inrooms community...',
        recipients: 'trial',
        recipientCount: 45,
        status: 'sent',
        sentAt: new Date('2024-03-15'),
        openRate: 68.5,
        clickRate: 12.3,
        createdAt: new Date('2024-03-14')
      },
      {
        id: 'email_2',
        name: 'Monthly Newsletter - March',
        subject: 'March Networking Highlights & Upcoming Events',
        content: 'Here are the top networking moments from March...',
        recipients: 'active',
        recipientCount: 234,
        status: 'scheduled',
        scheduledAt: new Date('2024-04-01'),
        createdAt: new Date('2024-03-20')
      },
      {
        id: 'email_3',
        name: 'Re-engagement Campaign',
        subject: 'We miss you! Come back to networking',
        content: 'It\'s been a while since your last event...',
        recipients: 'inactive',
        recipientCount: 89,
        status: 'draft',
        createdAt: new Date('2024-03-18')
      }
    ];

    const mockNotifications: Notification[] = [
      {
        id: 'notif_1',
        title: 'System Maintenance',
        message: 'Scheduled maintenance on March 25th from 2-4 AM PST',
        type: 'warning',
        recipients: 'all',
        recipientCount: 456,
        status: 'sent',
        sentAt: new Date('2024-03-20'),
        createdAt: new Date('2024-03-20')
      },
      {
        id: 'notif_2',
        title: 'New Feature Launch',
        message: 'Introducing enhanced profile features for better networking',
        type: 'success',
        recipients: 'active',
        recipientCount: 234,
        status: 'draft',
        createdAt: new Date('2024-03-21')
      }
    ];

    setTimeout(() => {
      setEmailCampaigns(mockEmailCampaigns);
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSendCampaign = async (campaignId: string) => {
    try {
      setEmailCampaigns(campaigns => 
        campaigns.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, status: 'sending' as const }
            : campaign
        )
      );

      // Simulate sending delay
      setTimeout(() => {
        setEmailCampaigns(campaigns => 
          campaigns.map(campaign => 
            campaign.id === campaignId 
              ? { ...campaign, status: 'sent' as const, sentAt: new Date() }
              : campaign
          )
        );
        toast.success('Email campaign sent successfully!');
      }, 2000);
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast.error('Failed to send campaign');
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      setEmailCampaigns(campaigns => campaigns.filter(c => c.id !== campaignId));
      toast.success('Campaign deleted successfully');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const handleSendNotification = async (notificationId: string) => {
    try {
      setNotifications(notifs => 
        notifs.map(notif => 
          notif.id === notificationId 
            ? { ...notif, status: 'sent' as const, sentAt: new Date() }
            : notif
        )
      );
      toast.success('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'sending':
        return <Send className="w-4 h-4 text-orange-500 animate-pulse" />;
      case 'draft':
        return <Edit className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const filteredEmailCampaigns = emailCampaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading communications...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Communications</h1>
            <p className="text-gray-600 mt-2">Manage email campaigns, notifications, and user communications</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <Button onClick={() => setIsComposerOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">{emailCampaigns.length}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Open Rate</p>
                <p className="text-3xl font-bold text-green-600">
                  {Math.round(emailCampaigns.reduce((sum, c) => sum + (c.openRate || 0), 0) / emailCampaigns.length)}%
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Notifications Sent</p>
                <p className="text-3xl font-bold text-purple-600">
                  {notifications.filter(n => n.status === 'sent').length}
                </p>
              </div>
              <Bell className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Recipients</p>
                <p className="text-3xl font-bold text-orange-600">
                  {emailCampaigns.reduce((sum, c) => sum + c.recipientCount, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search campaigns and notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('emails')}
              className={`${
                activeTab === 'emails'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Campaigns ({emailCampaigns.length})
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`${
                activeTab === 'notifications'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`${
                activeTab === 'templates'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Templates
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'emails' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {filteredEmailCampaigns.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No email campaigns found</h3>
                <p className="text-gray-500 mt-2">Create your first email campaign to get started</p>
                <Button className="mt-4" onClick={() => setIsComposerOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campaign
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recipients
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEmailCampaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {campaign.name}
                            </div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {campaign.subject}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {campaign.recipientCount} {campaign.recipients}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(campaign.status)}
                            <span className="ml-2 text-sm text-gray-900 capitalize">
                              {campaign.status}
                            </span>
                          </div>
                          {campaign.scheduledAt && campaign.status === 'scheduled' && (
                            <div className="text-xs text-gray-500">
                              {campaign.scheduledAt.toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {campaign.openRate !== undefined ? (
                            <div className="text-sm text-gray-900">
                              <div>Open: {campaign.openRate}%</div>
                              <div className="text-gray-500">Click: {campaign.clickRate}%</div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {campaign.sentAt?.toLocaleDateString() || campaign.createdAt.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {campaign.status === 'draft' && (
                              <>
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleSendCampaign(campaign.id)}
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCampaign(campaign.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No notifications found</h3>
                <p className="text-gray-500 mt-2">Create your first notification to get started</p>
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Notification
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div key={notification.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getNotificationTypeIcon(notification.type)}
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {notification.title}
                          </h3>
                          <p className="text-gray-600 mt-1">{notification.message}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {notification.recipientCount} {notification.recipients}
                            </span>
                            <span>
                              {notification.status === 'sent' 
                                ? `Sent ${notification.sentAt?.toLocaleDateString()}`
                                : `Created ${notification.createdAt.toLocaleDateString()}`
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {notification.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => handleSendNotification(notification.id)}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Send Now
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Email Templates</h3>
              <p className="text-gray-500 mt-2">Manage reusable email templates for campaigns</p>
              <Button className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}