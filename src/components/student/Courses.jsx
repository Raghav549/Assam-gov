// ============================================
// COURSES HUB
// ============================================

import React, { useState, useEffect } from 'react';
import { getAllCourses } from '../../services/firebase';
import { coursesData } from '../../data/courses';
import { FiSearch, FiExternalLink, FiClock, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const dbCourses = await getAllCourses();
        if (dbCourses.length === 0) {
          setCourses(coursesData);
        } else {
          setCourses(dbCourses);
        }
      } catch (error) {
        console.error(error);
        setCourses(coursesData);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const categories = ['All', ...new Set(courses.map(c => c.category))];
  
  const filteredCourses = courses.filter(course => {
    const matchesCategory = filter === 'All' || course.category === filter;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 animate-fade-in-down">
          <h1 className="text-3xl font-bold text-gray-900">Free Certified Courses</h1>
          <p className="text-gray-600 mt-2">Enhance your skills with free courses from top universities and platforms.</p>
          
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    filter === cat 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="card h-64 shimmer"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {filteredCourses.map((course, index) => (
              <div key={index} className="card group hover-lift flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {course.platform}
                    </span>
                    {course.certificate && (
                      <span className="flex items-center gap-1 text-xs text-yellow-600 font-medium">
                        <FiAward className="w-3 h-3" /> Certificate
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                    {course.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <FiClock className="w-3 h-3" /> {course.duration}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">{course.level}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 mt-auto">
                  <a
                    href={course.enrollLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full py-2 px-4 bg-gray-50 hover:bg-green-50 text-green-700 font-medium rounded-lg transition-colors group-hover:bg-green-600 group-hover:text-white"
                  >
                    Enroll Now <FiExternalLink className="ml-2 w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
              <FiSearch className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
            <p className="text-gray-500">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
