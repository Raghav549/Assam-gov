// ============================================
// ADMIN MANAGE DONATIONS
// ============================================

import React, { useState, useEffect } from 'react';
import { getDonationRequests, approveDonationRequest, rejectDonationRequest } from '../../services/firebase';
import { FiCheck, FiX, FiEye, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/helpers';

const ManageDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const data = await getDonationRequests('pending');
      setDonations(data);
    } catch (error) {
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveDonationRequest(id);
      toast.success('Donation request approved');
      fetchDonations();
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectDonationRequest(id);
      toast.success('Donation request rejected');
      fetchDonations();
    } catch (error) {
      toast.error('Failed to reject');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Donation Requests</h1>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : donations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500">No pending donation requests.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {donations.map((donation) => (
              <div key={donation.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{donation.title}</h3>
                  <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                    Pending
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4">{donation.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Target Amount</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(donation.targetAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">UPI ID</p>
                    <p className="font-mono text-sm text-gray-900">{donation.upiId}</p>
                  </div>
                </div>

                {donation.proofUrl && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Proof Document:</p>
                    <a 
                      href={donation.proofUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100"
                    >
                      <FiEye className="mr-2 w-4 h-4" /> View Proof
                    </a>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleReject(donation.id)}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(donation.id)}
                    className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageDonations;
