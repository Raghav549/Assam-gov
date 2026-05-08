// ============================================
// PREMIUM RESPONSIVE ABOUT PAGE
// ============================================

import React from 'react';

import {
  FiTarget,
  FiBookOpen,
  FiUsers,
  FiShield,
  FiHeart,
  FiGlobe
} from 'react-icons/fi';

const About = () => {

  return (

    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 overflow-hidden py-16">

      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-green-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-5">

        {/* HERO */}
        <div className="text-center mb-16">

          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">

            About

            <span className="ml-3 bg-gradient-to-r from-green-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
              Youth Assam
            </span>

          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">

            Youth Assam is a modern digital ecosystem built to empower
            students through scholarships, free education,
            transparency and community support.

          </p>

        </div>

        {/* MAIN CARD */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[36px] p-8 md:p-14 shadow-2xl border border-white/50 mb-12">

          {/* MISSION */}
          <div className="mb-14">

            <div className="flex items-center gap-4 mb-6">

              <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">

                <FiTarget className="text-3xl text-green-600" />

              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Our Mission
              </h2>

            </div>

            <p className="text-gray-600 text-lg leading-relaxed">

              Youth Assam is dedicated to empowering the youth of Assam
              by providing easy access to educational resources,
              scholarship opportunities, career guidance,
              government information and student support systems.

              <br /><br />

              We believe every student deserves equal opportunities
              regardless of financial condition, background or location.

            </p>

          </div>

          {/* WHAT WE DO */}
          <div>

            <div className="flex items-center gap-4 mb-10">

              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">

                <FiGlobe className="text-3xl text-blue-600" />

              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                What We Do
              </h2>

            </div>

            {/* FEATURES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* FEATURE 1 */}
              <div className="bg-white rounded-3xl p-7 shadow-lg border border-gray-100 hover:-translate-y-2 transition-all duration-300">

                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-5">

                  <FiBookOpen className="text-2xl text-green-600" />

                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Scholarships
                </h3>

                <p className="text-gray-600 leading-relaxed">

                  Curating and verifying scholarships from India
                  and international platforms with direct apply links
                  and student-friendly guidance.

                </p>

              </div>

              {/* FEATURE 2 */}
              <div className="bg-white rounded-3xl p-7 shadow-lg border border-gray-100 hover:-translate-y-2 transition-all duration-300">

                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-5">

                  <FiUsers className="text-2xl text-blue-600" />

                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Student Community
                </h3>

                <p className="text-gray-600 leading-relaxed">

                  Building a safe and interactive space where students
                  can connect, discuss, learn and help each other grow.

                </p>

              </div>

              {/* FEATURE 3 */}
              <div className="bg-white rounded-3xl p-7 shadow-lg border border-gray-100 hover:-translate-y-2 transition-all duration-300">

                <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-5">

                  <FiShield className="text-2xl text-purple-600" />

                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Government Transparency
                </h3>

                <p className="text-gray-600 leading-relaxed">

                  Tracking important government projects,
                  schemes and public information for awareness
                  and transparency.

                </p>

              </div>

              {/* FEATURE 4 */}
              <div className="bg-white rounded-3xl p-7 shadow-lg border border-gray-100 hover:-translate-y-2 transition-all duration-300">

                <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-5">

                  <FiHeart className="text-2xl text-red-600" />

                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Student Support
                </h3>

                <p className="text-gray-600 leading-relaxed">

                  Providing verified donation and support systems
                  for students facing financial or educational challenges.

                </p>

              </div>

            </div>

          </div>

        </div>

        {/* CONTACT CARD */}
        <div className="rounded-[36px] bg-gradient-to-r from-green-500 via-cyan-500 to-blue-500 p-10 md:p-14 text-white shadow-2xl relative overflow-hidden">

          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,white,transparent)]"></div>

          <div className="relative z-10 text-center">

            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
              Contact Us
            </h2>

            <p className="text-lg md:text-xl opacity-95 max-w-2xl mx-auto mb-8 leading-relaxed">

              Have questions, ideas or suggestions?
              Reach out anytime and our team will help you.

            </p>

            <a
              href="mailto:support@youthassam.in"
              className="inline-flex items-center justify-center px-10 py-4 rounded-2xl bg-white text-green-600 text-lg font-bold shadow-xl hover:scale-105 transition-all duration-300"
            >

              support@youthassam.in

            </a>

          </div>

        </div>

      </div>

    </div>

  );

};

export default About;
