// ============================================
// GOVERNMENT TRACKER
// ============================================

import React, { useState, useEffect } from 'react';
import { getAllGovtWorks } from '../../services/firebase';
import { govtWorksData } from '../../data/govtWorks';
import { FiMapPin, FiCalendar, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';
import { formatCurrency, calculateProgress, getStatusBadgeClass } from '../../utils/helpers';

const GovtTracker = () => {
  const [works, setWorks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const dbWorks = await getAllGovtWorks();
        if (dbWorks.length === 0) {
          setWorks(govtWorksData); // Fallback to static data
        } else {
          setWorks(dbWorks);
        }
      } catch (error) {
        console.error(error);
        setWorks(govtWorksData);
      } finally {
        setLoading(false);
      }
    };
    fetchWorks();
  }, []);

  const statuses = ['All', 'Running', 'Completed', 'Delayed'];
  const filteredWorks = filter === 'All' ? works : works.filter(w => w.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 animate-fade-in-down">
          <h1 className="text-3xl font-bold text-gray-900">Government Project Tracker</h1>
          <p className="text-gray-600 mt-2">Transparency in public spending and project progress across Assam.</p>
          
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {statuses.map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === status 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="card h-64 shimmer"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {filteredWorks.map((work, index) => (
              <div key={index} className="card group hover-lift">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(work.status)}`}>
                    {work.status}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" /> Est. {work.expectedCompletion?.split('-')[0]}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  {work.title}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {work.description}
                </p>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Budget Allocated</span>
                    <span className="font-medium text-gray-900">{formatCurrency(work.budgetAllocated)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fund Used</span>
                    <span className="font-medium text-green-600">{formatCurrency(work.fundUsed)}</span>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-bold text-gray-900">{calculateProgress(work.fundUsed, work.budgetAllocated)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-1000" 
                        style={{ width: `${calculateProgress(work.fundUsed, work.budgetAllocated)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <FiMapPin className="w-3 h-3" /> {work.location}
                  </span>
                  <span className="truncate max-w-[150px]">{work.department}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GovtTracker;
