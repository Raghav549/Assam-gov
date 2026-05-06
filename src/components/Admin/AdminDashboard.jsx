// ============================================
// ADMIN DASHBOARD OVERVIEW
// ============================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers, getAllPosts, getHelpRequests, getDonationRequests } from '../../services/firebase';
import { FiUsers, FiFileText, FiAlertTriangle, FiDollarSign, FiSettings } from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    helpRequests: 0,
    donations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, posts, helps, donates] = await Promise.all([
          getAllUsers(),
          getAllPosts(),
          getHelpRequests(),
          getDonationRequests()
        ]);

        setStats({
          users: users.length,
          posts: posts.length,
          helpRequests: helps.filter(h => h.status === 'pending').length,
          donations: donates.filter(d => d.status === 'pending').length
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const menuItems = [
    { title: 'Manage Users', path: '/admin/users', icon: <FiUsers />, count: stats.users },
    { title: 'Moderate Posts', path: '/admin/posts', icon: <FiFileText />, count: stats.posts },
    { title: 'Help Requests', path: '/admin/help-requests', icon: <FiAlertTriangle />, count: stats.helpRequests },
    { title: 'Donation Requests', path: '/admin/donations', icon: <FiDollarSign />, count: stats.donations },
    { title: 'Scholarships', path: '/admin/scholarships', icon: <FiFileText />, count: 0 },
    { title: 'Courses', path: '/admin/courses', icon: <FiFileText />, count: 0 },
    { title: 'Govt Data', path: '/admin/govt-data', icon: <FiSettings />, count: 0 },
    { title: 'Notifications', path: '/admin/notifications', icon: <FiAlertTriangle />, count: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 animate-fade-in-down">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage platform content and users.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 stagger-children">
          <div className="card bg-white border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '-' : stats.users}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <FiUsers className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="card bg-white border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Posts</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '-' : stats.posts}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <FiFileText className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="card bg-white border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Help</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '-' : stats.helpRequests}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                <FiAlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="card bg-white border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Donations</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '-' : stats.donations}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                <FiDollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Management Menu */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Management Center</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="card group p-6 hover:border-green-500 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                  {React.cloneElement(item.icon, { className: "w-6 h-6" })}
                </div>
                {item.count > 0 && (
                  <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-600 rounded-full">
                    {item.count}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                {item.title}
              </h3>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
