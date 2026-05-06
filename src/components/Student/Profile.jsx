// ============================================
// PROFILE PAGE
// ============================================

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/firebase';
import { uploadImage } from '../../services/storageService';
import { FiCamera, FiSave, FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, userData, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userData?.displayName || '',
    phone: userData?.phone || '',
    location: userData?.location || '',
    bio: userData?.bio || '',
    profilePicture: userData?.profilePicture || ''
  });
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Preview locally
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let photoURL = formData.profilePicture;
      
      if (imageFile) {
        photoURL = await uploadImage(imageFile, 'profiles');
      }

      await updateUserProfile(user.uid, {
        displayName: formData.displayName,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        profilePicture: photoURL
      });

      // Update Firebase Auth Profile as well
      import('firebase/auth').then(({ updateProfile }) => {
        updateProfile(user, { displayName: formData.displayName, photoURL });
      });

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-green-500 to-blue-600"></div>
          
          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-6 flex justify-between items-end">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                  {formData.profilePicture ? (
                    <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">
                      {formData.displayName?.charAt(0)}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 p-2 bg-green-600 text-white rounded-full cursor-pointer hover:bg-green-700 shadow-lg">
                    <FiCamera className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
              </div>
              
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isEditing 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={saving}
              >
                {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-xl font-bold text-gray-900">{formData.displayName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <div className="flex items-center text-gray-900">
                  <FiMail className="w-4 h-4 mr-2 text-gray-400" />
                  {user.email}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <FiPhone className="w-4 h-4 mr-2 text-gray-400" />
                      {formData.phone || 'Not provided'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <FiMapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {formData.location || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Bio</label>
                {isEditing ? (
                  <textarea
                    rows="3"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Tell us about yourself..."
                  ></textarea>
                ) : (
                  <p className="text-gray-700">{formData.bio || 'No bio added yet.'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
