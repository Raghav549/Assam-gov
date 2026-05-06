// ============================================
// ADMIN MANAGE GOVT DATA
// ============================================

import React, { useState, useEffect } from 'react';
import { getAllGovtWorks, createGovtWork, updateGovtWork, deleteGovtWork } from '../../services/firebase';
import { govtWorksData } from '../../data/govtWorks';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/helpers';

const ManageGovtData = () => {
  const [works, setWorks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    status: 'Running',
    budgetAllocated: '',
    fundUsed: '',
    department: ''
  });

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    const data = await getAllGovtWorks();
    setWorks(data.length > 0 ? data : govtWorksData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        budgetAllocated: Number(formData.budgetAllocated),
        fundUsed: Number(formData.fundUsed),
        progress: Math.round((Number(formData.fundUsed) / Number(formData.budgetAllocated)) * 100) || 0
      };
      
      if (editingId) {
        await updateGovtWork(editingId, payload);
        toast.success('Updated');
      } else {
        await createGovtWork(payload);
        toast.success('Added');
      }
      setIsModalOpen(false);
      resetForm();
      fetchWorks();
    } catch (error) {
      toast.error('Error saving');
    }
  };

  const handleEdit = (work) => {
    setEditingId(work.id);
    setFormData({
      title: work.title,
      description: work.description,
      location: work.location,
      status: work.status,
      budgetAllocated: work.budgetAllocated,
      fundUsed: work.fundUsed,
      department: work.department
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete?')) {
      await deleteGovtWork(id);
      toast.success('Deleted');
      fetchWorks();
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', location: '', status: 'Running', budgetAllocated: '', fundUsed: '', department: '' });
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Govt Projects</h1>
          <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
            <FiPlus className="w-4 h-4" /> Add Project
          </button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Project' : 'Add Project'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input name="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Project Title" className="w-full px-3 py-2 border rounded" required />
                <textarea name="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Description" rows="3" className="w-full px-3 py-2 border rounded" required />
                <div className="grid grid-cols-2 gap-4">
                  <input name="location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="Location" className="w-full px-3 py-2 border rounded" required />
                  <select name="status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border rounded">
                    <option value="Running">Running</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input name="budgetAllocated" type="number" value={formData.budgetAllocated} onChange={(e) => setFormData({...formData, budgetAllocated: e.target.value})} placeholder="Budget Allocated" className="w-full px-3 py-2 border rounded" required />
                  <input name="fundUsed" type="number" value={formData.fundUsed} onChange={(e) => setFormData({...formData, fundUsed: e.target.value})} placeholder="Fund Used" className="w-full px-3 py-2 border rounded" required />
                </div>
                <input name="department" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} placeholder="Department" className="w-full px-3 py-2 border rounded" />
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {works.map((w) => (
            <div key={w.id || w.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded ${w.status === 'Running' ? 'bg-green-100 text-green-800' : w.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                  {w.status}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(w)} className="text-indigo-600"><FiEdit2 /></button>
                  <button onClick={() => handleDelete(w.id)} className="text-red-600"><FiTrash2 /></button>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{w.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{w.location}</p>
              <div className="text-xs text-gray-500">
                <div className="flex justify-between mb-1">
                  <span>Budget:</span>
                  <span>{formatCurrency(w.budgetAllocated)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Used:</span>
                  <span>{formatCurrency(w.fundUsed)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageGovtData;
