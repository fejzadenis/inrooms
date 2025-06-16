import React from 'react';
import { User, UserPlus, UserMinus, Mail } from 'lucide-react';
import { Button } from '../common/Button';

interface UserData {
  id: string;
  name: string;
  email: string;
  subscription: {
    status: 'trial' | 'active' | 'inactive';
    eventsQuota: number;
    eventsUsed: number;
  };
  joinedAt: Date;
}

interface UserManagementProps {
  users: UserData[];
  onUpdateQuota: (userId: string, adjustment: number) => void;
  onSendEmail: (userId: string) => void;
  onDeactivate: (userId: string) => void;
}

export function UserManagement({ users, onUpdateQuota, onSendEmail, onDeactivate }: UserManagementProps) {
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">User Management</h3>
          <p className="mt-1 text-sm text-gray-500">Manage user accounts and permissions</p>
        </div>
        <Button className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Invite User
        </Button>
      </div>
      
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id} className="px-4 py-5 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    Events: {user.subscription.eventsUsed} / {user.subscription.eventsQuota}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => onUpdateQuota(user.id, -1)}
                      className="p-2"
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onUpdateQuota(user.id, 1)}
                      className="p-2"
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onSendEmail(user.id)}
                      className="p-2"
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}