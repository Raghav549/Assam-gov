// ============================================
// ULTRA PREMIUM RESPONSIVE NAVBAR - FINAL
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

import logo from '../../assets/logo.svg';

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
      <nav className="fixed top-0 left-0 right-0 w-full z-[9999] border-b border-white/20 bg-white/75 backdrop-blur-2xl shadow-[0_8px_30px_rgba(15,23,42,0.06)]">

        {/* AURORA EFFECT */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">

          <div className="absolute -top-24 -left-20 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl"></div>

          <div className="absolute -top-24 right-0 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl"></div>

        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-center justify-between h-[72px]">

            {/* LOGO */}
            <Link
              to="/"
              onClick={closeAllMenus}
              className="flex items-center gap-3 flex-shrink-0"
            >

              <img
                src={logo}
                alt="Youth Assam"
                className="w-11 h-11 object-contain drop-shadow-lg"
              />

              <div className="hidden sm:flex flex-col leading-none">

                <span className="text-[1.25rem] font-extrabold bg-gradient-to-r from-violet-700 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  Youth Assam
                </span>

                <span className="text-[11px] tracking-[0.25em] uppercase text-slate-500 font-semibold mt-1">
                  Digital Student Hub
                </span>

              </div>

            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden lg:flex items-center gap-2">

              {navLinks.map((link) => (

                <Link
                  key={link.name}
                  to={link.path}
                  className="
                    px-4 py-2.5 rounded-2xl
                    text-sm font-semibold
                    text-slate-700
                    hover:text-violet-700
                    hover:bg-white/80
                    transition-all duration-300
                    whitespace-nowrap
                  "
                >
                  {link.name}
                </Link>

              ))}

              {isAdmin && (

                <Link
                  to="/admin/dashboard"
                  className="
                    px-4 py-2.5 rounded-2xl
                    text-sm font-semibold
                    text-violet-700
                    bg-violet-100
                    hover:bg-violet-200
                    transition-all duration-300
                  "
                >
                  Admin
                </Link>

              )}

            </div>

            {/* RIGHT SIDE */}
            <div className="hidden lg:flex items-center gap-3">

              {user ? (
                <>

                  <NotificationBell />

                  <div className="relative">

                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="
                        flex items-center gap-2
                        p-1.5 rounded-full
                        hover:bg-white/70
                        transition-all duration-300
                      "
                    >

                      {userData?.profilePicture ? (

                        <img
                          src={userData.profilePicture}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg"
                        />

                      ) : (

                        <div className="
                          w-10 h-10 rounded-full
                          bg-gradient-to-br from-violet-600 via-cyan-500 to-blue-600
                          flex items-center justify-center
                          text-white font-bold shadow-lg
                        ">
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

                      <div className="
                        absolute right-0 mt-4 w-64
                        bg-white/90 backdrop-blur-2xl
                        rounded-3xl
                        border border-white/40
                        shadow-[0_20px_60px_rgba(15,23,42,0.15)]
                        overflow-hidden
                        z-[99999]
                      ">

                        <div className="px-5 py-4 border-b border-slate-100">

                          <p className="font-bold text-slate-900 truncate">
                            {userData?.displayName}
                          </p>

                          <p className="text-sm text-slate-500 truncate mt-1">
                            {user?.email}
                          </p>

                        </div>

                        <Link
                          to="/profile"
                          onClick={closeAllMenus}
                          className="
                            flex items-center gap-3
                            px-5 py-4
                            text-slate-700
                            hover:bg-slate-50
                            transition-all
                          "
                        >
                          <FiUser />
                          Profile
                        </Link>

                        <button
                          onClick={() => {
                            handleLogout();
                            closeAllMenus();
                          }}
                          className="
                            w-full flex items-center gap-3
                            px-5 py-4
                            text-red-600
                            hover:bg-red-50
                            transition-all
                          "
                        >
                          <FiLogOut />
                          Logout
                        </button>

                      </div>

                    )}

                  </div>

                </>
              ) : (

                <div className="hidden lg:flex items-center gap-3">

                  <Link
                    to="/login"
                    className="
                      px-5 py-2.5 rounded-2xl
                      border border-violet-200
                      text-sm font-semibold
                      text-violet-700
                      hover:bg-violet-50
                      transition-all duration-300
                    "
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    className="
                      px-6 py-3 rounded-2xl
                      text-sm font-bold text-white
                      bg-gradient-to-r from-violet-600 via-cyan-500 to-blue-600
                      shadow-[0_10px_30px_rgba(59,130,246,0.35)]
                      hover:scale-105
                      transition-all duration-300
                    "
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
                className="
                  w-11 h-11 rounded-2xl
                  bg-white/70
                  border border-white/40
                  shadow-lg
                  flex items-center justify-center
                "
              >
                <FiMenu className="w-6 h-6 text-slate-700" />
              </button>

            </div>

          </div>

        </div>

      </nav>

      {/* NAVBAR SPACER */}
      <div className="h-[72px]"></div>

      {/* MOBILE MENU */}
      <div
        className={`fixed top-0 right-0 h-screen w-[85%] max-w-[340px] z-[99999]
        bg-white/85 backdrop-blur-3xl
        border-l border-white/30
        shadow-[0_20px_80px_rgba(15,23,42,0.2)]
        transform transition-transform duration-500 lg:hidden overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >

        {/* MOBILE HEADER */}
        <div className="
          flex items-center justify-between
          p-5 border-b border-slate-100
          sticky top-0 bg-white/70 backdrop-blur-xl z-10
        ">

          <div className="flex items-center gap-3">

            <img
              src={logo}
              alt="Youth Assam"
              className="w-11 h-11 object-contain"
            />

            <div>

              <p className="font-extrabold text-lg text-slate-900">
                Youth Assam
              </p>

              <p className="text-xs text-slate-500 tracking-wider uppercase">
                Student Platform
              </p>

            </div>

          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="
              w-10 h-10 rounded-2xl
              bg-white shadow-md
              flex items-center justify-center
            "
          >
            <FiX className="w-5 h-5 text-slate-700" />
          </button>

        </div>

        {/* MOBILE LINKS */}
        <div className="flex flex-col p-5 gap-3 pb-32">

          {navLinks.map((link) => (

            <Link
              key={link.name}
              to={link.path}
              onClick={closeAllMenus}
              className="
                px-5 py-4 rounded-2xl
                text-slate-700 font-semibold text-[1rem]
                hover:bg-gradient-to-r
                hover:from-violet-50
                hover:to-cyan-50
                hover:text-violet-700
                transition-all duration-300
              "
            >
              {link.name}
            </Link>

          ))}

          {isAdmin && (

            <Link
              to="/admin/dashboard"
              onClick={closeAllMenus}
              className="
                px-5 py-4 rounded-2xl
                text-violet-700 font-semibold
                bg-violet-100
              "
            >
              Admin Panel
            </Link>

          )}

          <div className="border-t border-slate-200 my-3"></div>

          {user ? (
            <>

              <Link
                to="/profile"
                onClick={closeAllMenus}
                className="
                  px-5 py-4 rounded-2xl
                  text-slate-700 font-semibold
                  bg-slate-50
                "
              >
                Profile
              </Link>

              <button
                onClick={() => {
                  handleLogout();
                  closeAllMenus();
                }}
                className="
                  w-full text-left
                  px-5 py-4 rounded-2xl
                  text-red-600 font-semibold
                  bg-red-50
                "
              >
                Logout
              </button>

            </>
          ) : (

            <div className="flex flex-col gap-4 mt-2">

              <Link
                to="/login"
                onClick={closeAllMenus}
                className="
                  w-full text-center py-4 rounded-2xl
                  border border-violet-200
                  text-violet-700 font-bold
                  bg-white/70
                "
              >
                Login
              </Link>

              <Link
                to="/signup"
                onClick={closeAllMenus}
                className="
                  w-full text-center py-4 rounded-2xl
                  text-white font-bold
                  bg-gradient-to-r from-violet-600 via-cyan-500 to-blue-600
                  shadow-[0_15px_35px_rgba(59,130,246,0.35)]
                "
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
          className="
            fixed inset-0
            bg-black/40 backdrop-blur-sm
            z-[9998] lg:hidden
          "
        />

      )}

    </>
  );
};

export default Navbar;
