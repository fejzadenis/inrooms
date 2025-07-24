import React from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { Button } from '../../components/common/Button';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Mail, 
  Search, 
  Filter,
  Download,
  Edit,
  Trash2,
  Crown,
  Calendar,
  Activity,
  CreditCard,
  MoreVertical
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  subscription: {
    status: 'trial' | 'active' | 'inactive';
    eventsQuota: number;
    eventsUsed: number;
    trialEndsAt?: Date;
  };
  profile: {
    title?: string;
    company?: string;
    location?: string;
    joinedAt?: Date;
    points?: number;
  };
  connections?: string[];
  photoURL?: string;
  createdAt?: Date;
}

export function AdminUsersPage() {
  const [users, setUsers] = React.useState<UserData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterRole, setFilterRole] = React.useState<'all' | 'user' | 'admin'>('all');
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'trial' | 'active' | 'inactive'>('all');
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);

  React.useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const usersData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          role: data.role || 'user',
          subscription: {
            status: data.subscription?.status || 'inactive',
            eventsQuota: data.subscription?.eventsQuota || 0,
            eventsUsed: data.subscription?.eventsUsed || 0,
            trialEndsAt: data.subscription?.trialEndsAt?.toDate(),
          },
          profile: {
            title: data.profile?.title || '',
            company: data.profile?.company || '',
            location: data.profile?.location || '',
            joinedAt: data.profile?.joinedAt?.toDate() || data.createdAt?.toDate(),
            points: data.profile?.points || 0,
          },
          connections: data.connections || [],
          photoURL: data.photoURL || '',
          createdAt: data.createdAt?.toDate(),
        } as UserData;
      });

      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuota = async (userId: string, adjustment: number) => {
    try {
      const userRef = doc(db, 'users', userId);
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const newQuota = Math.max(0, user.subscription.eventsQuota + adjustment);
      
      await updateDoc(userRef, {
        'subscription.eventsQuota': newQuota
      });

      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, subscription: { ...u.subscription, eventsQuota: newQuota } }
          : u
      ));

      toast.success(`Event quota ${adjustment > 0 ? 'increased' : 'decreased'} successfully`);
    } catch (error) {
      console.error('Error updating quota:', error);
      toast.error('Failed to update quota');
    }
  };

  const handleToggleRole = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const newRole = user.role === 'admin' ? 'user' : 'admin';
      const userRef = doc(db, 'users', userId);
      
      await updateDoc(userRef, { role: newRole });

      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));

      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleSendEmail = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      window.open(`mailto:${user.email}?subject=Message from inrooms Admin`);
    }
  };

  const handleExportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Subscription', 'Events Used', 'Events Quota', 'Joined Date'],
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.role,
        user.subscription.status,
        user.subscription.eventsUsed.toString(),
        user.subscription.eventsQuota.toString(),
        user.profile.joinedAt?.toLocaleDateString() || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users-export.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.profile.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.subscription.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = React.useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.subscription.status === 'active').length;
    const trialUsers = users.filter(u => u.subscription.status === 'trial').length;
    const adminUsers = users.filter(u => u.role === 'admin').length;

    return { totalUsers, activeUsers, trialUsers, adminUsers };
  }, [users]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading users...</div>
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
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage user accounts, permissions, and subscriptions</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleExportUsers}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite User
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Subscribers</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
              </div>
              <CreditCard className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trial Users</p>
                <p className="text-3xl font-bold text-orange-600">{stats.trialUsers}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administrators</p>
                <p className="text-3xl font-bold text-purple-600">{stats.adminUsers}</p>
              </div>
              <Crown className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="trial">Trial</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No users found</h3>
              <p className="text-gray-500 mt-2">
                {searchTerm ? 'Try adjusting your search terms' : 'No users match the selected filters'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role & Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt={user.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              {user.name}
                              {user.role === 'admin' && (
                                <Crown className="w-4 h-4 text-yellow-500 ml-2" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.profile.company && (
                              <div className="text-xs text-gray-400">{user.profile.company}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.subscription.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : user.subscription.status === 'trial'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.subscription.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.subscription.eventsUsed} / {user.subscription.eventsQuota} events
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{
                              width: `${user.subscription.eventsQuota > 0 ? (user.subscription.eventsUsed / user.subscription.eventsQuota) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Activity className="w-4 h-4 text-gray-400 mr-2" />
                          {user.profile.points || 0} points
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.connections?.length || 0} connections
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.profile.joinedAt?.toLocaleDateString() || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuota(user.id, 1)}
                            title="Increase quota"
                          >
                            <UserPlus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuota(user.id, -1)}
                            title="Decrease quota"
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendEmail(user.id)}
                            title="Send email"
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                          <div className="relative group">
                            <Button variant="outline" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleToggleRole(user.id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                  Delete User
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}