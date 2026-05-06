// ============================================
// ABOUT PAGE
// ============================================

import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">About Youth Assam</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Youth Assam is dedicated to empowering the youth of Assam by providing easy access to educational resources, scholarship opportunities, and government information. We believe that every student deserves the chance to succeed, regardless of their background.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Do</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
            <li>Curate and verify scholarship opportunities from across India and abroad.</li>
            <li>Provide access to free, certified online courses from top universities.</li>
            <li>Track government projects and spending for transparency.</li>
            <li>Create a safe community for students to connect and support each other.</li>
            <li>Facilitate verified donation requests for students in need.</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600">
            Have questions or suggestions? Reach out to us at <a href="mailto:support@youthassam.in" className="text-green-600 hover:underline">support@youthassam.in</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
