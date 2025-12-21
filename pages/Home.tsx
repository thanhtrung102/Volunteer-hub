import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_STATS } from '../mockData';
import { eventService } from '../services/eventService';
import { Event } from '../types';

const Home: React.FC = () => {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventService.getAllEvents();
        // Show first 3 active events
        setFeaturedEvents(data.filter(e => e.status === 'approved').slice(0, 3));
      } catch (error) {
        console.error('Failed to load home events');
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="relative bg-primary overflow-hidden min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-30"
            src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=2000"
            alt="Volunteers working together"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/40"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              Make a <span className="text-secondary inline-block">Real Difference</span><br />
              In Your Community
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-300 mb-10 leading-relaxed">
              Connect with local organizations, manage your volunteer schedule, and track your impact. 
              Join thousands of volunteers making the world a better place, one act of kindness at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/events"
                className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-base font-bold rounded-lg text-white bg-secondary hover:bg-secondary-light shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Start Volunteering
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex justify-center items-center px-8 py-4 border-2 border-gray-300 text-base font-bold rounded-lg text-gray-100 hover:bg-white hover:text-primary hover:border-white transition-all duration-200"
              >
                Organize an Event
              </Link>
            </div>
            
            <div className="mt-10 flex items-center gap-4 text-sm text-gray-400">
               <div className="flex -space-x-2">
                 <img className="w-8 h-8 rounded-full border-2 border-primary" src="https://ui-avatars.com/api/?background=random&name=A" alt=""/>
                 <img className="w-8 h-8 rounded-full border-2 border-primary" src="https://ui-avatars.com/api/?background=random&name=B" alt=""/>
                 <img className="w-8 h-8 rounded-full border-2 border-primary" src="https://ui-avatars.com/api/?background=random&name=C" alt=""/>
               </div>
               <p>Join <span className="text-white font-semibold">100+</span> others today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b border-gray-100 relative z-10 -mt-8 shadow-xl max-w-6xl mx-auto rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="p-8 text-center hover:bg-gray-50 transition-colors rounded-l-xl">
            <div className="text-4xl font-extrabold text-secondary mb-2">{MOCK_STATS.totalVolunteers}+</div>
            <div className="text-gray-600 font-medium uppercase tracking-wide text-sm">Active Volunteers</div>
          </div>
          <div className="p-8 text-center hover:bg-gray-50 transition-colors">
            <div className="text-4xl font-extrabold text-secondary mb-2">{MOCK_STATS.totalEvents}+</div>
            <div className="text-gray-600 font-medium uppercase tracking-wide text-sm">Monthly Events</div>
          </div>
          <div className="p-8 text-center hover:bg-gray-50 transition-colors rounded-r-xl">
            <div className="text-4xl font-extrabold text-secondary mb-2">{MOCK_STATS.hoursContributed}+</div>
            <div className="text-gray-600 font-medium uppercase tracking-wide text-sm">Hours Contributed</div>
          </div>
        </div>
      </div>

      {/* Featured Events Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex justify-between items-end mb-10 border-b border-gray-200 pb-4">
          <div>
            <span className="text-secondary font-semibold uppercase tracking-wider text-sm">Get Involved</span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mt-1">Featured Opportunities</h2>
          </div>
          <Link to="/events" className="hidden md:flex items-center text-secondary font-bold hover:text-secondary-light transition-colors">
            View all events <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredEvents.map((event) => (
            <Link key={event.id} to={`/events/${event.id}`} className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="h-56 w-full overflow-hidden relative">
                <img 
                  src={event.imageUrl} 
                  alt={event.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-bold text-primary shadow-sm uppercase tracking-wide">
                  {event.organizerName}
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center text-xs font-medium text-secondary mb-3">
                    <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {new Date(event.startDate).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}
                    </span>
                </div>
                <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors line-clamp-1">
                  {event.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-5 flex-grow leading-relaxed">
                  {event.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate max-w-[150px]">{event.location}</span>
                    </div>
                    <span className="text-secondary text-sm font-semibold group-hover:translate-x-1 transition-transform">Details &rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-12 text-center md:hidden">
           <Link to="/events" className="inline-block px-6 py-3 border border-secondary text-secondary font-bold rounded-md hover:bg-secondary hover:text-white transition-colors">
            View all events
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;