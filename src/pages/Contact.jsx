// ============================================
// PREMIUM RESPONSIVE CONTACT PAGE
// ============================================

import React, { useState } from 'react';

import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiSend
} from 'react-icons/fi';

import toast from 'react-hot-toast';

const Contact = () => {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    setSubmitting(true);

    // SIMULATE API CALL
    setTimeout(() => {

      toast.success('Message sent successfully!');

      setFormData({
        name: '',
        email: '',
        message: ''
      });

      setSubmitting(false);

    }, 1200);

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 py-16 overflow-hidden">

      {/* TOP GLOW */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-green-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-5">

        {/* HEADING */}
        <div className="text-center mb-14">

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5">

            Contact <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
              Youth Assam
            </span>

          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">

            Need help regarding scholarships, courses,
            donations or technical issues? Reach out anytime.

          </p>

        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* LEFT SIDE */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 md:p-10 shadow-2xl border border-white/50">

            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Get in Touch
            </h2>

            <div className="space-y-7">

              {/* EMAIL */}
              <div className="flex items-start gap-4">

                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">

                  <FiMail className="text-2xl text-green-600" />

                </div>

                <div>

                  <p className="text-sm text-gray-500 mb-1">
                    Email Address
                  </p>

                  <p className="text-lg font-semibold text-gray-900 break-all">
                    support@youthassam.in
                  </p>

                </div>

              </div>

              {/* PHONE */}
              <div className="flex items-start gap-4">

                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">

                  <FiPhone className="text-2xl text-blue-600" />

                </div>

                <div>

                  <p className="text-sm text-gray-500 mb-1">
                    Phone Number
                  </p>

                  <p className="text-lg font-semibold text-gray-900">
                    +91 9693747328
                  </p>

                </div>

              </div>

              {/* ADDRESS */}
              <div className="flex items-start gap-4">

                <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center flex-shrink-0">

                  <FiMapPin className="text-2xl text-purple-600" />

                </div>

                <div>

                  <p className="text-sm text-gray-500 mb-1">
                    Office Address
                  </p>

                  <p className="text-lg font-semibold text-gray-900">
                    Guwahati, Assam, India
                  </p>

                </div>

              </div>

            </div>

            {/* EXTRA CARD */}
            <div className="mt-10 rounded-3xl bg-gradient-to-r from-green-500 to-blue-500 p-7 text-white shadow-xl">

              <h3 className="text-2xl font-bold mb-3">
                24×7 Student Support
              </h3>

              <p className="leading-relaxed opacity-95">

                Our support team is always available
                to guide students regarding scholarships,
                admissions, courses and technical problems.

              </p>

            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 md:p-10 shadow-2xl border border-white/50">

            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Send a Message
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* NAME */}
              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value
                    })
                  }
                  placeholder="Enter your full name"
                  className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  required
                />

              </div>

              {/* EMAIL */}
              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value
                    })
                  }
                  placeholder="Enter your email"
                  className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />

              </div>

              {/* MESSAGE */}
              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Message
                </label>

                <textarea
                  rows="6"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      message: e.target.value
                    })
                  }
                  placeholder="Write your message here..."
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  required
                ></textarea>

              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-green-500 to-blue-500 text-white text-lg font-bold shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-3"
              >

                {submitting ? (
                  'Sending Message...'
                ) : (
                  <>
                    <FiSend className="text-xl" />
                    Send Message
                  </>
                )}

              </button>

            </form>

          </div>

        </div>

      </div>

    </div>

  );

};

export default Contact;
