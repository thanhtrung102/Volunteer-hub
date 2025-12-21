import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { Event } from '../types';
import Loading from '../components/Loading';

const Events: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  
  const [events, setEvents] = useState<Event[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const categories = ['Environment', 'Education', 'Community', 'Health', 'Crisis Support'];

  // Combine filters for debounce effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setEvents([]); // Clear current events
      setPage(1); // Reset page
      setHasMore(true);
      fetchEvents(1, searchTerm, selectedCategory, selectedDate); // Fetch new initial set
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCategory, selectedDate]);

  // Real-time updates every 15 seconds to reflect registration changes
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('[Events] Real-time polling: Refreshing events...');
      // Refresh current events without resetting page or filters
      fetchEvents(1, searchTerm, selectedCategory, selectedDate);
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, [searchTerm, selectedCategory, selectedDate]);

  const fetchEvents = async (pageNum: number, search: string, category: string, date: string) => {
    if (pageNum === 1) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const response = await eventService.getEvents(pageNum, 6, search, category, date);
      
      setEvents(prev => pageNum === 1 ? response.items : [...prev, ...response.items]);
      setHasMore(events.length + response.items.length < response.total);
    } catch (error) {
      console.error('Failed to load events', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEvents(nextPage, searchTerm, selectedCategory, selectedDate);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Explore Events</h1>
        <p className="text-gray-600 mb-6">Discover opportunities to give back in your community.</p>

        {/* Help Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Tip:</span> Use the filters below to find events that match your interests. Search by keywords, filter by category, or select a specific date.
              </p>
            </div>
          </div>
        </div>

        {/* Filters Container */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-grow w-full md:w-auto group">
                <input
                type="text"
                placeholder="Search by title or location..."
                title="Search events by title or location (e.g., 'Beach' or 'New York')"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-secondary focus:border-secondary outline-none transition-shadow"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                  Search by event title or location
                </div>
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-48 group relative">
                <select
                    className="w-full py-2 pl-3 pr-8 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    title="Filter events by category type"
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                  Filter by event category
                </div>
            </div>

            {/* Date Filter */}
            <div className="w-full md:w-auto group relative">
                 <input
                    type="date"
                    title="Filter events starting from this date"
                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm text-gray-500"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                  Show events from this date onward
                </div>
            </div>

            {/* Clear Filters */}
            {(searchTerm || selectedCategory || selectedDate) && (
                <button
                    onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('');
                        setSelectedDate('');
                    }}
                    title="Clear all active filters"
                    className="text-sm text-red-500 hover:text-red-700 whitespace-nowrap font-medium"
                >
                    Clear Filters
                </button>
            )}
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <Loading />
      ) : events.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
                <div className="relative h-48">
                  <img 
                    src={event.imageUrl} 
                    alt={event.title} 
                    className="w-full h-full object-cover"
                    loading="lazy" 
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-primary shadow-sm">
                    {event.participantCount} Volunteers
                  </div>
                  <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent w-full p-4">
                      <span className="text-white text-xs font-bold bg-secondary px-2 py-0.5 rounded-full">{event.category}</span>
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
                       <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date(event.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-primary mb-2 line-clamp-1 hover:text-secondary transition-colors">
                      <Link to={`/events/${event.id}`}>{event.title}</Link>
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
                    {event.description}
                  </p>
                  
                  <div className="space-y-3 mt-auto">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{event.location}</span>
                    </div>
                    
                    <Link 
                      to={`/events/${event.id}`}
                      className="block w-full text-center mt-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-light transition-colors text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-12 text-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 transition-all"
              >
                {isLoadingMore ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading more...
                  </span>
                ) : (
                  'Load More Events'
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg">No events found matching your criteria.</p>
          <button 
            onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedDate('');
            }}
            className="mt-4 text-secondary font-medium hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Events;