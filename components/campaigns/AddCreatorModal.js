// components/campaigns/AddCreatorModal.js
'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function AddCreatorModal({ isOpen, onClose, campaignId, onSuccess }) {
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundUser, setFoundUser] = useState(null);

  const searchCreator = async () => {
    if (!searchEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/users/search?email=${encodeURIComponent(searchEmail)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.user) {
        if (data.user.role !== 'creator') {
          toast.error('This user is not a creator');
          setFoundUser(null);
        } else {
          setFoundUser(data.user);
        }
      } else {
        toast.error('User not found');
        setFoundUser(null);
      }
    } catch (error) {
      toast.error('Failed to search user');
    } finally {
      setLoading(false);
    }
  };

  const addCreator = async () => {
    if (!foundUser) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          action: 'add-creator-manual',
          creatorId: foundUser._id,
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Creator added successfully');
        onSuccess();
        onClose();
        setSearchEmail('');
        setFoundUser(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to add creator');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Creator Manually">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter creator email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="flex-1"
          />
          <Button onClick={searchCreator} disabled={loading} className="gap-2">
            <Search size={16} /> Search
          </Button>
        </div>

        {foundUser && (
          <div className="p-4 border border-green-500/30 bg-green-500/10 rounded-lg">
            <p className="font-semibold text-white">{foundUser.name}</p>
            <p className="text-sm text-gray-400">{foundUser.email}</p>
            <Button
              onClick={addCreator}
              disabled={loading}
              className="mt-3 w-full gap-2 bg-gradient-to-r from-green-600 to-green-500"
            >
              <UserPlus size={16} /> Add to Campaign
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}