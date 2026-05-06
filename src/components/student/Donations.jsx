// ============================================
// DONATION SYSTEM (REQUEST & SUPPORT)
// ============================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createDonationRequest, getDonationRequests } from '../../services/firebase';
import { uploadDocument, uploadImage } from '../../services/storageService';
import { validateDonationRequest } from '../../utils/validators';
import { CATEGORIES } from '../../utils/constants';
import { FiHeart, FiUpload, FiDollarSign, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/helpers';

const Donations = () => {
  const { user, userData } = useAuth();
  const [view, setView] = useState('request'); // 'request' or 'support'
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    upiId: '',
    proofFile: null,
    category: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (view === 'support') {
      fetchApprovedRequests();
    }
  }, [view]);

  const fetchApprovedRequests = async () => {
    setLoading(true);
    try {
      const data = await getDonationRequests('approved');
      setRequests(data);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, proofFile: e.target.files[0] }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    // Manual validation for file
    if (!formData.proofFile) {
      setErrors(prev => ({ ...prev, proofUrl: 'Proof document is required' }));
      return;
    }

    const validationErrors = validateDonationRequest(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      let proofUrl;
      if (formData.proofFile.type.startsWith('image/')) {
        proofUrl = await uploadImage(formData.proofFile, 'donations/proofs');
      } else {
        proofUrl = await uploadDocument(formData.proofFile, 'donations/proofs');
      }

      await createDonationRequest({
        ...formData,
        targetAmount: Number(formData.targetAmount),
        proofUrl,
        userId: user.uid,
        userName: userData.displayName,
        userAvatar: userData.profilePicture
      });

      toast.success('Donation request submitted for approval');
      setFormData({ title: '', description: '', targetAmount: '', upiId: '', proofFile: null, category: '' });
      setView('support');
    } catch (error) {
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 inline-flex">
            <button
              onClick={() => setView('request')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'request' ? 'bg-green-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Request Help
            </button>
            <button
              onClick={() => setView('support')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'support' ? 'bg-green-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Support Others
            </button>
          </div>
        </div>

        {view === 'request' ? (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Create Donation Request</h2>
            <form onSubmit={handleSubmitRequest} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Need help with college fees"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Explain your situation..."
                ></textarea>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  {errors.targetAmount && <p className="text-red-500 text-xs mt-1">{errors.targetAmount}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                  <input
                    type="text"
                    value={formData.upiId}
                    onChange={(e) => setFormData({...formData, upiId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="yourname@upi"
                  />
                  {errors.upiId && <p className="text-red-500 text-xs mt-1">{errors.upiId}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Proof (Image/PDF)</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {errors.proofUrl && <p className="text-red-500 text-xs mt-1">{errors.proofUrl}</p>}
                <p className="text-xs text-gray-500 mt-1">Required for verification purposes.</p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12">Loading...</div>
            ) : requests.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">No active requests.</div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover-lift">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{req.title}</h3>
                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                      Approved
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{req.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Goal</p>
                      <p className="font-bold text-gray-900">{formatCurrency(req.targetAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Raised</p>
                      <p className="font-bold text-green-600">{formatCurrency(req.totalRaised || 0)}</p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${Math.min((req.totalRaised / req.targetAmount) * 100, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      {req.userAvatar ? (
                        <img src={req.userAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                          {req.userName?.charAt(0)}
                        </div>
                      )}
                      <span className="text-sm text-gray-600">{req.userName}</span>
                    </div>
                    
                    <a
                      href={`https://pay.google.com/gp/v/pay/${req.upiId}`} // Generic UPI link structure, usually handled by payment gateway SDK
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <FiDollarSign className="mr-2 w-4 h-4" /> Donate
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Donations;
