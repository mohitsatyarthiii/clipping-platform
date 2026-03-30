'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useAuthStore } from '@/lib/stores/authStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Tabs from '@/components/ui/Tabs';
import { User, Lock, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateProfile, changePassword, logout } = useAuthStore();
  useProtectedRoute();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    profileImage: user?.profileImage || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    const success = await updateProfile(profileData);
    setLoadingProfile(false);
    if (success) {
      toast.success('Profile updated successfully!');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoadingPassword(true);
    const success = await changePassword(
      passwordData.currentPassword,
      passwordData.newPassword,
      passwordData.confirmPassword
    );
    setLoadingPassword(false);

    if (success) {
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const tabs = [
    {
      label: 'Profile',
      content: (
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">{user?.name?.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm text-gray-400">Logged in as</p>
                <p className="text-lg font-bold text-white">{user?.email}</p>
                <p className="text-sm text-gray-400 capitalize">
                  Role: {user?.role}
                </p>
              </div>
            </div>
          </div>

          <Input
            label="Full Name"
            value={profileData.name}
            onChange={(e) =>
              setProfileData({ ...profileData, name: e.target.value })
            }
          />

          <Textarea
            label="Bio"
            placeholder="Tell us about yourself..."
            value={profileData.bio}
            onChange={(e) =>
              setProfileData({ ...profileData, bio: e.target.value })
            }
          />

          <Input
            label="Profile Image URL"
            type="url"
            placeholder="https://..."
            value={profileData.profileImage}
            onChange={(e) =>
              setProfileData({ ...profileData, profileImage: e.target.value })
            }
          />

          <Button
            type="submit"
            disabled={loadingProfile}
            className="w-full"
          >
            {loadingProfile ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      ),
    },
    {
      label: 'Security',
      content: (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                currentPassword: e.target.value,
              })
            }
          />

          <Input
            label="New Password"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                newPassword: e.target.value,
              })
            }
          />

          <Input
            label="Confirm Password"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                confirmPassword: e.target.value,
              })
            }
          />

          <Button
            type="submit"
            disabled={loadingPassword}
            className="w-full"
          >
            {loadingPassword ? 'Updating...' : 'Change Password'}
          </Button>
        </form>
      ),
    },
    {
      label: 'Account',
      content: (
        <div className="space-y-4">
          <p className="text-gray-400">
            Account created on{' '}
            {new Date(user?.createdAt).toLocaleDateString()}
          </p>

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <h3 className="font-bold text-red-400 mb-2">Danger Zone</h3>
            <p className="text-sm text-red-300 mb-4">
              Logging out will clear your session. Make sure you've saved all your work.
            </p>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="gap-2"
            >
              <LogOut size={18} /> Logout
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="px-6 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Account Settings</h1>
          <p className="text-gray-400 mt-1">Manage your profile and account</p>
        </div>

        <Card>
          <Tabs tabs={tabs} defaultTab={0} />
        </Card>
      </div>
    </DashboardLayout>
  );
}
