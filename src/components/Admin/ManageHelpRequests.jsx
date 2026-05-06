// ============================================
// ADMIN MANAGE HELP REQUESTS
// ============================================

import React, { useState, useEffect } from 'react';
import { getHelpRequests, replyToHelpRequest, updateHelpRequestStatus } from '../../services/firebase';
import { FiMessageSquare, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ManageHelpRequests = () => {
  const [requests, setRequests] = useState([]);
  const [replyText, setReplyText] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const data = await getHelpRequests();
    setRequests(data);
  };

  const handleReply = async (id) => {
    if (!replyText[id]?.trim()) return;
    try {
      await replyToHelpRequest(id, replyText[id]);
      toast.success('Reply sent');
      setReplyText(prev => ({ ...prev, [id]: '' }));
      fetchRequests();
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateHelpRequestStatus(id, newStatus);
      toast.success('Status updated');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Help Requests</h1>
        
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{req.name} - {req.issueType}</h3>
                  <p className="text-sm text-gray-500">{req.location} | {req.contact}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {req.status}
                </span>
              </div>
              
              <p className="text-gray-700 mb-4 bg-gray-50 p-3 rounded">{req.description}</p>

              {req.adminReply && (
                <div className="mb-4 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                  <p className="text-sm font-semibold text-blue-800">Admin Reply:</p>
                  <p className="text-sm text-blue-700">{req.adminReply}</p>
                </div>
              )}

              <div className="flex gap-2 mb-4">
                <select 
                  value={req.status} 
                  onChange={(e) => handleStatusChange(req.id, e.target.value)}
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a reply..."
                  value={replyText[req.id] || ''}
                  onChange={(e) => setReplyText({...replyText, [req.id]: e.target.value})}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <button onClick={() => handleReply(req.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Send
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageHelpRequests;
