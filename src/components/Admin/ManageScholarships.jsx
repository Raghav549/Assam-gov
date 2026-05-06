// ============================================
// ADMIN MANAGE SCHOLARSHIPS
// ============================================

import React, { useState, useEffect } from 'react';
import { getAllScholarships, createScholarship, updateScholarship, deleteScholarship } from '../../services/firebase';
import { scholarshipsData } from '../../data/scholarships';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ManageScholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    applyLink: '',
    eligibility: '',
    deadline: '',
    country: 'India',
    category: 'National'
  });

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      const data = await getAllScholarships();
      if (data.length === 0) {
        // In a real app, you might seed the DB here initially
        setScholarships(scholarshipsData); 
      } else {
        setScholarships(data);
      }
    } catch (error) {
      console.error(error);
      setScholarships(scholarshipsData);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateScholarship(editingId, formData);
        toast.success('Scholarship updated');
      } else {
        await createScholarship(formData);
        toast.success('Scholarship added');
      }
      setIsModalOpen(false);
      resetForm();
      fetchScholarships();
    } catch (error) {
      toast.error('Failed to save scholarship');
    }
  };

  const handleEdit = (scholarship) => {
    setEditingId(scholarship.id);
    setFormData({
      title: scholarship.title,
      description: scholarship.description,
      applyLink: scholarship.applyLink,
      eligibility: scholarship.eligibility,
      deadline: scholarship.deadline,
      country: scholarship.country,
      category: scholarship.category
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteScholarship(id);
        toast.success('Scholarship deleted');
        fetchScholarships();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', applyLink: '', eligibility: '',
      deadline: '', country: 'India', category: 'National'
    });
    setEditingId(null);
  };

  const filteredScholarships = scholarships.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Scholarships</h1>
          <div className="flex gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" /> Add New
            </button>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold">{editingId ? 'Edit Scholarship' : 'Add Scholarship'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">×</button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input name="title" value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apply Link</label>
                    <input name="applyLink" type="url" value={formData.applyLink} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                    <input name="deadline" value={formData.deadline} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility</label>
                  <textarea name="eligibility" value={formData.eligibility} onChange={handleInputChange} rows="2" className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select name="country" value={formData.country} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg">
                      <option value="India">India</option>
                      <option value="International">International</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg">
                      <option value="National">National</option>
                      <option value="State">State</option>
                      <option value="Merit-based">Merit-based</option>
                      <option value="Need-based">Need-based</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredScholarships.map((s) => (
                <tr key={s.id || s.title}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.deadline}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button onClick={() => handleEdit(s)} className="text-indigo-600 hover:text-indigo-900 mr-3"><FiEdit2 /></button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-900"><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageScholarships;
