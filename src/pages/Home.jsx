// ============================================
// HOME PAGE (PUBLIC LANDING)
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiUsers, FiTrendingUp, FiHeart, FiArrowRight } from 'react-icons/fi';

const Home = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 -z-10"></div>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 animate-fade-in-up">
            Empowering <span className="gradient-text">Assam's Youth</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            A unified digital ecosystem for students. Access scholarships, free courses, government tracking, and community support.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get Started <FiArrowRight className="ml-2" />
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Youth Assam?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We provide comprehensive tools to help you succeed in your education and career.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 stagger-children">
            <div className="card text-center p-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiBook className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Scholarships</h3>
              <p className="text-gray-600">Discover 50+ active scholarships with direct apply links and step-by-step guides.</p>
            </div>
            
            <div className="card text-center p-8">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiTrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Free Courses</h3>
              <p className="text-gray-600">Access certified free courses from top platforms like Coursera, edX, and NPTEL.</p>
            </div>
            
            <div className="card text-center p-8">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiUsers className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Community</h3>
              <p className="text-gray-600">Connect with fellow students, share advice, and seek help in our social feed.</p>
            </div>
            
            <div className="card text-center p-8">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiHeart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Support</h3>
              <p className="text-gray-600">Request donations or help others through our verified donation system.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of students already using Youth Assam.</p>
          <Link to="/signup" className="inline-block px-8 py-4 bg-white text-green-600 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
