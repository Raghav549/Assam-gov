// ============================================
// ADMIN MANAGE NOTIFICATIONS
// ============================================

import React, { useState } from 'react';
import { createNotification, getAllUsers } from '../../services/firebase';
import { FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ManageNotifications = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general' // general, scholarship, urgent
  });

  React.useEffect(() => {
    const fetchUsers = async () => {
      const data = await getAllUsers();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.uid));
    }
  };

  const handleSend = async () => {
    if (!formData.title || !formData.message) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const promises = selectedUsers.map(uid => 
        createNotification({
          userId: uid,
          title: formData.title,
          message: formData.message,
          type: formData.type
        })
      );
      await Promise.all(promises);
      toast.success(`Notification sent to ${selectedUsers.length} users`);
      setFormData({ title: '', message: '', type: 'general' });
      setSelectedUsers([]);
    } catch (error) {
      toast.error('Failed to send notifications');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Send Notifications</h1>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
            <button 
              onClick={handleSelectAll}
              className="text-sm text-green-600 hover:underline mb-2 block"
            >
              {selectedUsers.length === users.length ? 'Deselect All' : 'Select All Users'}
            </button>
            <div className="max-h-40 overflow-y-auto border rounded p-2">
              {users.map(user => (
                <label key={user.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.uid)}
                    onChange={() => {
                      if (selectedUsers.includes(user.uid)) {
                        setSelectedUsers(selectedUsers.filter(id => id !== user.uid));
                      } else {
                        setSelectedUsers([...selectedUsers, user.uid]);
                      }
                    }}
                    className="rounded text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{user.displayName} ({user.email})</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">{selectedUsers.length} users selected</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., New Scholarship Alert"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                rows="4"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Write your notification message..."
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="general">General</option>
                <option value="scholarship">Scholarship</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <button
              onClick={handleSend}
              disabled={selectedUsers.length === 0}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              <FiSend className="w-4 h-4" /> Send Notification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageNotifications;
