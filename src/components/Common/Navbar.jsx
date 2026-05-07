// ============================================
// FINAL FIXED PREMIUM RESPONSIVE NAVBAR
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut
} from 'react-icons/fi';

import { BsChevronDown } from 'react-icons/bs';
import NotificationBell from './NotificationBell';

const Navbar = () => {

  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { user, userData, logout, isAdmin } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };

  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeAllMenus = () => {
    setIsOpen(false);
    setIsProfileOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Scholarships', path: '/scholarships' },
    { name: 'Courses', path: '/courses' },
    { name: 'Govt Tracker', path: '/govt-tracker' },
    { name: 'Social Feed', path: '/feed' },
    { name: 'Help & Support', path: '/help' },
    { name: 'Donations', path: '/donations' },
  ];

  return (
    <>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 w-full overflow-hidden z-[9999] bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-center justify-between h-16">

            {/* LOGO */}
            <Link
              to="/"
              onClick={closeAllMenus}
              className="flex items-center gap-2 flex-shrink-0 overflow-hidden"
            >

              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0">
                YA
              </div>

              <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent whitespace-nowrap">
                Youth Assam
              </span>

            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden lg:flex items-center gap-1 overflow-hidden">

              {navLinks.map((link) => (

                <Link
                  key={link.name}
                  to={link.path}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-300 whitespace-nowrap"
                >
                  {link.name}
                </Link>

              ))}

              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-50 transition-all duration-300"
                >
                  Admin
                </Link>
              )}

            </div>

            {/* RIGHT SIDE */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">

              {user ? (
                <>

                  <NotificationBell />

                  <div className="relative">

                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-all duration-300"
                    >

                      {userData?.profilePicture ? (

                        <img
                          src={userData.profilePicture}
                          alt="Profile"
                          className="w-9 h-9 rounded-full object-cover border-2 border-white shadow"
                        />

                      ) : (

                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                          {userData?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>

                      )}

                      <BsChevronDown
                        className={`transition-transform duration-300 ${
                          isProfileOpen ? 'rotate-180' : ''
                        }`}
                      />

                    </button>

                    {/* PROFILE DROPDOWN */}
                    {isProfileOpen && (

                      <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[99999]">

                        <div className="px-4 py-3 border-b border-gray-100">

                          <p className="font-semibold text-gray-900 truncate">
                            {userData?.displayName}
                          </p>

                          <p className="text-sm text-gray-500 truncate">
                            {user?.email}
                          </p>

                        </div>

                        <Link
                          to="/profile"
                          onClick={closeAllMenus}
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-all"
                        >
                          <FiUser />
                          Profile
                        </Link>

                        <button
                          onClick={() => {
                            handleLogout();
                            closeAllMenus();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-all"
                        >
                          <FiLogOut />
                          Logout
                        </button>

                      </div>

                    )}

                  </div>

                </>
              ) : (

                <div className="hidden lg:flex items-center gap-2">

                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 transition-all whitespace-nowrap"
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-blue-600 shadow-lg hover:scale-105 transition-all duration-300 whitespace-nowrap"
                  >
                    Sign Up
                  </Link>

                </div>

              )}

            </div>

            {/* MOBILE MENU BUTTON */}
            <div className="flex lg:hidden items-center">

              <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-all"
              >
                <FiMenu className="w-6 h-6 text-gray-700" />
              </button>

            </div>

          </div>

        </div>

      </nav>

      {/* NAVBAR SPACER */}
      <div className="h-16"></div>

      {/* MOBILE MENU */}
      <div
        className={`fixed top-0 right-0 h-screen w-[80%] max-w-[300px] bg-white z-[99999] shadow-2xl transform transition-transform duration-300 lg:hidden overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >

        {/* MOBILE HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">

          <div className="flex items-center gap-2">

            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold">
              YA
            </div>

            <span className="font-bold text-lg">
              Youth Assam
            </span>

          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <FiX className="w-6 h-6" />
          </button>

        </div>

        {/* MOBILE LINKS */}
        <div className="flex flex-col p-5 gap-2 pb-32">

          {navLinks.map((link) => (

            <Link
              key={link.name}
              to={link.path}
              onClick={closeAllMenus}
              className="px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-green-50 hover:text-green-600 transition-all duration-300"
            >
              {link.name}
            </Link>

          ))}

          {isAdmin && (

            <Link
              to="/admin/dashboard"
              onClick={closeAllMenus}
              className="px-4 py-3 rounded-xl text-purple-700 font-medium hover:bg-purple-50"
            >
              Admin Panel
            </Link>

          )}

          <div className="border-t border-gray-100 my-4"></div>

          {user ? (
            <>

              <Link
                to="/profile"
                onClick={closeAllMenus}
                className="px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
              >
                Profile
              </Link>

              <button
                onClick={() => {
                  handleLogout();
                  closeAllMenus();
                }}
                className="w-full text-left px-4 py-3 rounded-xl text-red-600 font-medium hover:bg-red-50"
              >
                Logout
              </button>

            </>
          ) : (

            <div className="flex flex-col gap-3 mt-2">

              <Link
                to="/login"
                onClick={closeAllMenus}
                className="w-full text-center py-3 rounded-xl border border-gray-200 font-medium"
              >
                Login
              </Link>

              <Link
                to="/signup"
                onClick={closeAllMenus}
                className="w-full text-center py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-green-500 to-blue-600 shadow-lg"
              >
                Sign Up
              </Link>

            </div>

          )}

        </div>

      </div>

      {/* OVERLAY */}
      {isOpen && (

        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] lg:hidden"
        />

      )}

    </>
  );
};

export default Navbar;
