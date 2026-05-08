// ============================================
// PREMIUM RESPONSIVE HOME PAGE
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';

import {
  FiBook,
  FiUsers,
  FiTrendingUp,
  FiHeart,
  FiArrowRight
} from 'react-icons/fi';

const Home = () => {

  return (

    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 overflow-hidden">

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24">

        {/* BACKGROUND GLOW */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-5">

          <div className="text-center max-w-4xl mx-auto">

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-gray-900 mb-6">

              Empowering <br />

              <span className="bg-gradient-to-r from-green-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Assam's Youth
              </span>

            </h1>

            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-10">

              A unified digital ecosystem for students.
              Access scholarships, free courses,
              government tracking, and community support.

            </p>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">

              <Link
                to="/signup"
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-blue-500 text-white text-lg font-bold shadow-xl hover:scale-105 transition-all duration-300"
              >

                Get Started

                <FiArrowRight className="ml-2 text-xl" />

              </Link>

              <Link
                to="/login"
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-2xl border-2 border-green-500 text-green-600 text-lg font-bold bg-white/80 backdrop-blur-sm hover:bg-green-50 transition-all duration-300"
              >
                Login
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* FEATURES */}
      <section className="py-16 md:py-24">

        <div className="max-w-7xl mx-auto px-5">

          <div className="text-center mb-14">

            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-5">
              Why Choose Youth Assam?
            </h2>

            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We provide comprehensive tools to help
              you succeed in your education and career.
            </p>

          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* CARD 1 */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 hover:-translate-y-2 transition-all duration-300">

              <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-6">
                <FiBook className="text-3xl text-green-600" />
              </div>

              <h3 className="text-2xl font-bold text-center mb-4">
                Scholarships
              </h3>

              <p className="text-gray-600 text-center leading-relaxed">
                Discover 50+ active scholarships
                with direct apply links and detailed guides.
              </p>

            </div>

            {/* CARD 2 */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 hover:-translate-y-2 transition-all duration-300">

              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-6">
                <FiTrendingUp className="text-3xl text-blue-600" />
              </div>

              <h3 className="text-2xl font-bold text-center mb-4">
                Free Courses
              </h3>

              <p className="text-gray-600 text-center leading-relaxed">
                Access free certified courses
                from Coursera, edX, NPTEL and more.
              </p>

            </div>

            {/* CARD 3 */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 hover:-translate-y-2 transition-all duration-300">

              <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-6">
                <FiUsers className="text-3xl text-purple-600" />
              </div>

              <h3 className="text-2xl font-bold text-center mb-4">
                Community
              </h3>

              <p className="text-gray-600 text-center leading-relaxed">
                Connect with fellow students,
                ask questions and grow together.
              </p>

            </div>

            {/* CARD 4 */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 hover:-translate-y-2 transition-all duration-300">

              <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-6">
                <FiHeart className="text-3xl text-red-600" />
              </div>

              <h3 className="text-2xl font-bold text-center mb-4">
                Support
              </h3>

              <p className="text-gray-600 text-center leading-relaxed">
                Help others or request support
                through our verified donation system.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* CTA SECTION */}
      <section className="py-20">

        <div className="max-w-5xl mx-auto px-5">

          <div className="rounded-[40px] bg-gradient-to-r from-green-500 via-cyan-500 to-blue-500 p-10 md:p-16 text-center shadow-2xl text-white relative overflow-hidden">

            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,white,transparent)]"></div>

            <div className="relative z-10">

              <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
                Ready to Start Your Journey?
              </h2>

              <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto">
                Join thousands of students already
                using Youth Assam.
              </p>

              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-10 py-4 rounded-2xl bg-white text-green-600 text-lg font-bold shadow-xl hover:scale-105 transition-all duration-300"
              >

                Create Free Account

              </Link>

            </div>

          </div>

        </div>

      </section>

    </div>

  );

};

export default Home;
