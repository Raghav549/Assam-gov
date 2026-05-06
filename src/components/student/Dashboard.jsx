// ============================================
// STUDENT DASHBOARD
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiBook, FiBriefcase, FiUsers, FiHeart, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import { MdDashboard, MdSchool, MdWork } from 'react-icons/md';

const Dashboard = () => {
  const { userData } = useAuth();
  const name = userData?.displayName || 'Student';

  const stats = [
    { label: 'Scholarships Found', value: '12', icon: <FiBook />, color: 'bg-blue-100 text-blue-600' },
    { label: 'Courses Enrolled', value: '4', icon: <MdSchool />, color: 'bg-green-100 text-green-600' },
    { label: 'Help Requests', value: '2', icon: <FiAlertCircle />, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Donations Raised', value: '₹5,000', icon: <FiHeart />, color: 'bg-red-100 text-red-600' },
  ];

  const quickLinks = [
    { title: 'Find Scholarships', path: '/scholarships', icon: <FiBook />, desc: 'Discover opportunities for your education' },
    { title: 'Free Courses', path: '/courses', icon: <MdSchool />, desc: 'Learn new skills with certified courses' },
    { title: 'Govt Tracker', path: '/govt-tracker', icon: <MdWork />, desc: 'Track government projects in Assam' },
    { title: 'Social Feed', path: '/feed', icon: <FiUsers />, desc: 'Connect with fellow students' },
    { title: 'Request Help', path: '/help', icon: <FiAlertCircle />, desc: 'Submit issues or seek assistance' },
    { title: 'Donate/Support', path: '/donations', icon: <FiHeart />, desc: 'Help others or request support' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, <span className="gradient-text">{name}</span>! 👋
          </h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your education journey today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 stagger-children">
          {stats.map((stat, index) => (
            <div key={index} className="card hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  {React.cloneElement(stat.icon, { className: "w-6 h-6" })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {quickLinks.map((link, index) => (
            <Link 
              key={index} 
              to={link.path}
              className="card group p-6 border-l-4 border-transparent hover:border-green-500 transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                  {React.cloneElement(link.icon, { className: "w-6 h-6" })}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{link.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity Placeholder */}
        <div className="mt-12 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <button className="text-sm text-green-600 hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
                  <FiTrendingUp />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New Scholarship Available: PMSS</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
