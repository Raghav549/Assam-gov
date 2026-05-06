// ============================================
// SCHOLARSHIPS PORTAL
// ============================================

import React, { useState, useEffect } from 'react';
import { getAllScholarships } from '../../services/firebase';
import { scholarshipsData } from '../../data/scholarships';
import { FiSearch, FiFilter, FiExternalLink, FiCalendar, FiMapPin } from 'react-icons/fi';
import { formatCurrency } from '../../utils/helpers';

const Scholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        // In a real app, fetch from Firebase. Here we merge static data for demo if DB is empty
        const dbScholarships = await getAllScholarships();
        if (dbScholarships.length === 0) {
          setScholarships(scholarshipsData);
        } else {
          setScholarships(dbScholarships);
        }
      } catch (error) {
        console.error(error);
        setScholarships(scholarshipsData); // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchScholarships();
  }, []);

  const filteredScholarships = scholarships.filter(s => {
    const matchesCategory = filter === 'All' || s.category === filter;
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', ...new Set(scholarships.map(s => s.category))];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="mb-8 animate-fade-in-down">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scholarship Opportunities</h1>
          <p className="text-gray-600 mb-6">Find the best scholarships for your education in India and abroad.</p>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search scholarships..."
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

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card h-64 shimmer"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {filteredScholarships.map((scholarship, index) => (
              <div key={index} className="card group hover-lift flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      scholarship.country === 'India' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {scholarship.category}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <FiCalendar className="w-3 h-3" /> {scholarship.deadline.split('-')[0]}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                    {scholarship.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {scholarship.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <FiMapPin className="w-3 h-3" /> {scholarship.country}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 mt-auto">
                  <a
                    href={scholarship.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full py-2 px-4 bg-gray-50 hover:bg-green-50 text-green-700 font-medium rounded-lg transition-colors group-hover:bg-green-600 group-hover:text-white"
                  >
                    View Details <FiExternalLink className="ml-2 w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredScholarships.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
              <FiSearch className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No scholarships found</h3>
            <p className="text-gray-500">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scholarships;
