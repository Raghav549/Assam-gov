// ============================================
// ULTRA PREMIUM MODERN HOME PAGE - FINAL
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';

import {
  FiBook,
  FiUsers,
  FiTrendingUp,
  FiHeart,
  FiArrowRight,
  FiShield,
  FiAward
} from 'react-icons/fi';

const Home = () => {

  return (

    <div className="min-h-screen overflow-hidden bg-[#f4f7ff]">

      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 -z-10 overflow-hidden">

        <div className="absolute top-[-200px] left-[-120px] w-[420px] h-[420px] rounded-full bg-violet-400/20 blur-[120px]"></div>

        <div className="absolute top-[20%] right-[-120px] w-[350px] h-[350px] rounded-full bg-cyan-400/20 blur-[120px]"></div>

        <div className="absolute bottom-[-120px] left-[20%] w-[300px] h-[300px] rounded-full bg-blue-500/20 blur-[120px]"></div>

      </div>

      {/* HERO SECTION */}
      <section className="relative pt-24 md:pt-32 pb-20 md:pb-28">

        <div className="max-w-7xl mx-auto px-5">

          <div className="grid lg:grid-cols-2 gap-14 items-center">

            {/* LEFT SIDE */}
            <div>

              {/* TAG */}
              <div className="
                inline-flex items-center gap-2
                px-4 py-2 mb-7
                rounded-full
                bg-white/80 backdrop-blur-xl
                border border-white/50
                shadow-lg
              ">

                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>

                <span className="text-sm font-semibold text-slate-700">
                  Assam's Smart Student Platform
                </span>

              </div>

              {/* HEADING */}
              <h1 className="
                text-[3rem] leading-[1.05]
                sm:text-[4.5rem]
                md:text-[5.5rem]
                font-black
                tracking-[-2px]
                text-slate-900
                mb-7
              ">

                Empowering

                <br />

                <span className="
                  bg-gradient-to-r
                  from-violet-600
                  via-cyan-500
                  to-blue-600
                  bg-clip-text
                  text-transparent
                ">
                  Assam's Youth
                </span>

              </h1>

              {/* TEXT */}
              <p className="
                text-lg md:text-2xl
                leading-relaxed
                text-slate-600
                max-w-2xl
                mb-10
              ">

                Scholarships, free courses,
                student community, government tracking,
                and verified support — all in one modern platform.

              </p>

              {/* BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-5">

                <Link
                  to="/signup"
                  className="
                    group
                    inline-flex items-center justify-center
                    px-9 py-5
                    rounded-[22px]
                    text-lg font-bold text-white
                    bg-gradient-to-r
                    from-violet-600
                    via-cyan-500
                    to-blue-600
                    shadow-[0_18px_50px_rgba(59,130,246,0.35)]
                    hover:scale-[1.03]
                    transition-all duration-300
                  "
                >

                  Get Started

                  <FiArrowRight className="
                    ml-3 text-2xl
                    group-hover:translate-x-1
                    transition-all
                  " />

                </Link>

                <Link
                  to="/login"
                  className="
                    inline-flex items-center justify-center
                    px-9 py-5
                    rounded-[22px]
                    border border-white/60
                    bg-white/70 backdrop-blur-xl
                    text-slate-800 text-lg font-bold
                    shadow-xl
                    hover:bg-white
                    transition-all duration-300
                  "
                >
                  Login
                </Link>

              </div>

              {/* STATS */}
              <div className="flex flex-wrap gap-7 mt-14">

                <div>
                  <h3 className="text-4xl font-black text-slate-900">
                    50+
                  </h3>

                  <p className="text-slate-600 mt-1">
                    Scholarships
                  </p>
                </div>

                <div>
                  <h3 className="text-4xl font-black text-slate-900">
                    100+
                  </h3>

                  <p className="text-slate-600 mt-1">
                    Free Courses
                  </p>
                </div>

                <div>
                  <h3 className="text-4xl font-black text-slate-900">
                    24/7
                  </h3>

                  <p className="text-slate-600 mt-1">
                    Student Support
                  </p>
                </div>

              </div>

            </div>

            {/* RIGHT SIDE CARD */}
            <div className="relative">

              <div className="
                relative
                rounded-[40px]
                p-7 md:p-9
                bg-white/70 backdrop-blur-2xl
                border border-white/50
                shadow-[0_30px_80px_rgba(15,23,42,0.12)]
                overflow-hidden
              ">

                {/* GLOW */}
                <div className="
                  absolute top-[-100px] right-[-100px]
                  w-[250px] h-[250px]
                  bg-cyan-400/20
                  rounded-full
                  blur-[100px]
                "></div>

                {/* MINI CARDS */}
                <div className="space-y-5 relative z-10">

                  {/* CARD 1 */}
                  <div className="
                    flex items-center gap-5
                    p-5 rounded-3xl
                    bg-white/80
                    shadow-lg
                  ">

                    <div className="
                      w-16 h-16 rounded-2xl
                      bg-emerald-100
                      flex items-center justify-center
                    ">
                      <FiBook className="text-3xl text-emerald-600" />
                    </div>

                    <div>

                      <h3 className="text-xl font-bold text-slate-900">
                        Scholarships
                      </h3>

                      <p className="text-slate-600 mt-1">
                        Apply directly with verified guides
                      </p>

                    </div>

                  </div>

                  {/* CARD 2 */}
                  <div className="
                    flex items-center gap-5
                    p-5 rounded-3xl
                    bg-white/80
                    shadow-lg
                  ">

                    <div className="
                      w-16 h-16 rounded-2xl
                      bg-violet-100
                      flex items-center justify-center
                    ">
                      <FiAward className="text-3xl text-violet-600" />
                    </div>

                    <div>

                      <h3 className="text-xl font-bold text-slate-900">
                        Certified Courses
                      </h3>

                      <p className="text-slate-600 mt-1">
                        Learn from top platforms for free
                      </p>

                    </div>

                  </div>

                  {/* CARD 3 */}
                  <div className="
                    flex items-center gap-5
                    p-5 rounded-3xl
                    bg-white/80
                    shadow-lg
                  ">

                    <div className="
                      w-16 h-16 rounded-2xl
                      bg-cyan-100
                      flex items-center justify-center
                    ">
                      <FiShield className="text-3xl text-cyan-600" />
                    </div>

                    <div>

                      <h3 className="text-xl font-bold text-slate-900">
                        Trusted Platform
                      </h3>

                      <p className="text-slate-600 mt-1">
                        Safe community and verified support
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* FEATURES SECTION */}
      <section className="pb-24">

        <div className="max-w-7xl mx-auto px-5">

          <div className="text-center mb-16">

            <h2 className="
              text-4xl md:text-6xl
              font-black
              tracking-[-2px]
              text-slate-900
              mb-5
            ">
              Why Choose Us?
            </h2>

            <p className="
              text-slate-600
              text-lg md:text-xl
              max-w-3xl mx-auto
            ">
              Built specially for students with a premium,
              modern and easy-to-use experience.
            </p>

          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">

            {/* CARD */}
            <div className="
              group
              relative
              rounded-[32px]
              p-8
              bg-white/70 backdrop-blur-xl
              border border-white/60
              shadow-[0_20px_60px_rgba(15,23,42,0.08)]
              hover:-translate-y-3
              transition-all duration-500
              overflow-hidden
            ">

              <div className="
                absolute inset-0 opacity-0
                group-hover:opacity-100
                transition-all duration-500
                bg-gradient-to-br from-emerald-50 to-cyan-50
              "></div>

              <div className="relative z-10">

                <div className="
                  w-20 h-20 rounded-3xl
                  bg-emerald-100
                  flex items-center justify-center
                  mb-7
                ">
                  <FiBook className="text-4xl text-emerald-600" />
                </div>

                <h3 className="text-3xl font-black text-slate-900 mb-5">
                  Scholarships
                </h3>

                <p className="text-slate-600 leading-relaxed text-lg">
                  Discover verified scholarships
                  with detailed guides and direct apply links.
                </p>

              </div>

            </div>

            {/* CARD */}
            <div className="
              group relative rounded-[32px]
              p-8 bg-white/70 backdrop-blur-xl
              border border-white/60
              shadow-[0_20px_60px_rgba(15,23,42,0.08)]
              hover:-translate-y-3
              transition-all duration-500
              overflow-hidden
            ">

              <div className="
                absolute inset-0 opacity-0
                group-hover:opacity-100
                transition-all duration-500
                bg-gradient-to-br from-violet-50 to-blue-50
              "></div>

              <div className="relative z-10">

                <div className="
                  w-20 h-20 rounded-3xl
                  bg-violet-100
                  flex items-center justify-center
                  mb-7
                ">
                  <FiTrendingUp className="text-4xl text-violet-600" />
                </div>

                <h3 className="text-3xl font-black text-slate-900 mb-5">
                  Free Courses
                </h3>

                <p className="text-slate-600 leading-relaxed text-lg">
                  Learn from Coursera,
                  edX, NPTEL and more completely free.
                </p>

              </div>

            </div>

            {/* CARD */}
            <div className="
              group relative rounded-[32px]
              p-8 bg-white/70 backdrop-blur-xl
              border border-white/60
              shadow-[0_20px_60px_rgba(15,23,42,0.08)]
              hover:-translate-y-3
              transition-all duration-500
              overflow-hidden
            ">

              <div className="
                absolute inset-0 opacity-0
                group-hover:opacity-100
                transition-all duration-500
                bg-gradient-to-br from-cyan-50 to-blue-50
              "></div>

              <div className="relative z-10">

                <div className="
                  w-20 h-20 rounded-3xl
                  bg-cyan-100
                  flex items-center justify-center
                  mb-7
                ">
                  <FiUsers className="text-4xl text-cyan-600" />
                </div>

                <h3 className="text-3xl font-black text-slate-900 mb-5">
                  Community
                </h3>

                <p className="text-slate-600 leading-relaxed text-lg">
                  Connect with students,
                  ask doubts and grow together.
                </p>

              </div>

            </div>

            {/* CARD */}
            <div className="
              group relative rounded-[32px]
              p-8 bg-white/70 backdrop-blur-xl
              border border-white/60
              shadow-[0_20px_60px_rgba(15,23,42,0.08)]
              hover:-translate-y-3
              transition-all duration-500
              overflow-hidden
            ">

              <div className="
                absolute inset-0 opacity-0
                group-hover:opacity-100
                transition-all duration-500
                bg-gradient-to-br from-rose-50 to-orange-50
              "></div>

              <div className="relative z-10">

                <div className="
                  w-20 h-20 rounded-3xl
                  bg-rose-100
                  flex items-center justify-center
                  mb-7
                ">
                  <FiHeart className="text-4xl text-rose-600" />
                </div>

                <h3 className="text-3xl font-black text-slate-900 mb-5">
                  Support
                </h3>

                <p className="text-slate-600 leading-relaxed text-lg">
                  Verified donation and
                  student help support system.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="pb-28">

        <div className="max-w-6xl mx-auto px-5">

          <div className="
            relative overflow-hidden
            rounded-[40px]
            p-10 md:p-16
            bg-gradient-to-r
            from-violet-600
            via-cyan-500
            to-blue-600
            text-center
            shadow-[0_30px_90px_rgba(59,130,246,0.35)]
          ">

            {/* LIGHT */}
            <div className="
              absolute top-[-100px] left-[-100px]
              w-[250px] h-[250px]
              rounded-full bg-white/20 blur-[100px]
            "></div>

            <div className="relative z-10">

              <h2 className="
                text-4xl md:text-6xl
                font-black
                text-white
                mb-6
                tracking-[-2px]
              ">
                Ready to Start
                <br />
                Your Journey?
              </h2>

              <p className="
                text-lg md:text-2xl
                text-white/90
                max-w-3xl mx-auto
                mb-10
              ">

                Join thousands of students already
                using Youth Assam every day.

              </p>

              <Link
                to="/signup"
                className="
                  inline-flex items-center justify-center
                  px-10 py-5
                  rounded-[24px]
                  bg-white
                  text-violet-700
                  text-xl font-black
                  shadow-2xl
                  hover:scale-105
                  transition-all duration-300
                "
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
