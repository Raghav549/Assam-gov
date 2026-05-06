// ============================================
// FOOTER COMPONENT
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                YA
              </div>
              <span className="text-xl font-bold">Youth Assam</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Empowering the youth of Assam through education, opportunities, and community support.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><FiFacebook className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><FiTwitter className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><FiInstagram className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><FiLinkedin className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/scholarships" className="hover:text-green-400 transition-colors">Scholarships</Link></li>
              <li><Link to="/courses" className="hover:text-green-400 transition-colors">Free Courses</Link></li>
              <li><Link to="/govt-tracker" className="hover:text-green-400 transition-colors">Govt Tracker</Link></li>
              <li><Link to="/feed" className="hover:text-green-400 transition-colors">Community</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/help" className="hover:text-green-400 transition-colors">Help & Support</Link></li>
              <li><Link to="/donations" className="hover:text-green-400 transition-colors">Donations</Link></li>
              <li><Link to="/about" className="hover:text-green-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-green-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Guwahati, Assam, India</li>
              <li>Email: support@youthassam.in</li>
              <li>Phone: +91 98765 43210</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Youth Assam. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0 text-sm text-gray-500">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
