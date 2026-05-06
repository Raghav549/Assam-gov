// ============================================
// ADMIN MANAGE COURSES
// ============================================

import React, { useState, useEffect } from 'react';
import { getAllCourses, createCourse, updateCourse, deleteCourse } from '../../services/firebase';
import { coursesData } from '../../data/courses';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    enrollLink: '',
    platform: '',
    category: 'Technology',
    duration: '',
    level: 'Beginner'
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await getAllCourses();
      setCourses(data.length > 0 ? data : coursesData);
    } catch (error) {
      setCourses(coursesData);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCourse(editingId, formData);
        toast.success('Course updated');
      } else {
        await createCourse(formData);
        toast.success('Course added');
      }
      setIsModalOpen(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      toast.error('Failed to save course');
    }
  };

  const handleEdit = (course) => {
    setEditingId(course.id);
    setFormData({
      title: course.title,
      description: course.description,
      enrollLink: course.enrollLink,
      platform: course.platform,
      category: course.category,
      duration: course.duration,
      level: course.level
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this course?')) {
      await deleteCourse(id);
      toast.success('Course deleted');
      fetchCourses();
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', enrollLink: '', platform: '', category: 'Technology', duration: '', level: 'Beginner' });
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Courses</h1>
          <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
            <FiPlus className="w-4 h-4" /> Add Course
          </button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Course' : 'Add Course'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input name="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Title" className="w-full px-3 py-2 border rounded" required />
                <textarea name="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Description" rows="3" className="w-full px-3 py-2 border rounded" required />
                <input name="enrollLink" type="url" value={formData.enrollLink} onChange={(e) => setFormData({...formData, enrollLink: e.target.value})} placeholder="Enrollment Link" className="w-full px-3 py-2 border rounded" required />
                <div className="grid grid-cols-2 gap-4">
                  <input name="platform" value={formData.platform} onChange={(e) => setFormData({...formData, platform: e.target.value})} placeholder="Platform (e.g., Coursera)" className="w-full px-3 py-2 border rounded" required />
                  <select name="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border rounded">
                    <option value="Technology">Technology</option>
                    <option value="Business">Business</option>
                    <option value="Skills">Skills</option>
                    <option value="Science">Science</option>
                    <option value="Language">Language</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div key={c.id || c.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">{c.platform}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(c)} className="text-indigo-600"><FiEdit2 /></button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-600"><FiTrash2 /></button>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{c.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{c.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageCourses;
