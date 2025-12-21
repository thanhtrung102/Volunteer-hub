import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import { registrationService } from '../services/registrationService';
import { notificationService } from '../services/notificationService';
import { UserRole, Event, Registration, RegistrationStatus } from '../types';
import CommunityPulse from '../components/dashboard/CommunityPulse';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Data State
  const [events, setEvents] = useState<Event[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [highlights, setHighlights] = useState<{ newEvents: Event[], trendingEvents: Event[], activeEvents: Event[] }>({ 
      newEvents: [], 
      trendingEvents: [], 
      activeEvents: [] 
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
      notificationService.getPermission()
  );

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  // Real-time updates for trending events
  useEffect(() => {
    if (!user) return;

    // Refresh highlights every 10 seconds to show real-time updates
    const interval = setInterval(async () => {
      console.log('[Dashboard] Real-time polling: Refreshing highlights...');
      try {
        const highlightsData = await eventService.getDashboardHighlights();
        setHighlights(highlightsData);
        console.log('[Dashboard] Highlights refreshed successfully');
      } catch (error) {
        console.error('Failed to refresh dashboard highlights', error);
      }
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
        const [highlightsData, userSpecificData] = await Promise.all([
            eventService.getDashboardHighlights(),
            user?.role === UserRole.VOLUNTEER 
                ? registrationService.getRegistrationsByUser(user.id) 
                : (user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN) 
                    ? eventService.getEventsByCreator(user.id) 
                    : Promise.resolve(null)
        ]);

        setHighlights(highlightsData);

        if (userSpecificData) {
            if (user?.role === UserRole.VOLUNTEER) {
                setMyRegistrations(userSpecificData as Registration[]);
            } else {
                setEvents(userSpecificData as Event[]);
            }
        }
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableNotifications = async () => {
      const permission = await notificationService.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
          await notificationService.subscribeToPushNotifications();
          notificationService.notify("Notifications Enabled", "You will now receive real-time updates.");
      }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!window.confirm('Are you certain you want to delete this event?')) return;

    // Optimistic UI Update
    const previousEvents = [...events];
    setEvents(current => current.filter(e => e.id !== eventId));

    try {
        await registrationService.deleteRegistrationsByEvent(eventId);
        await eventService.deleteEvent(eventId);
    } catch (apiError) {
        setEvents(previousEvents);
        alert("Failed to delete event. Please try again.");
    }
  };

  if (!user) return null;

  const isManagerOrAdmin = user.role === UserRole.MANAGER || user.role === UserRole.ADMIN;
  const now = new Date();
  
  const upcomingRegistrations = myRegistrations.filter(r => {
      const endDate = r.event ? new Date(r.event.endDate) : new Date();
      return (r.status === RegistrationStatus.CONFIRMED || r.status === RegistrationStatus.PENDING) && endDate > now;
  });

  const pastRegistrations = myRegistrations.filter(r => {
      const endDate = r.event ? new Date(r.event.endDate) : new Date();
      return r.status === RegistrationStatus.COMPLETED || 
             r.status === RegistrationStatus.REJECTED || 
             r.status === RegistrationStatus.CANCELLED ||
             endDate <= now;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="mb-8 border-b border-gray-200 pb-4 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, <span className="font-semibold text-primary">{user.fullName}</span></p>
        </div>
        {user.role === UserRole.ADMIN && (
             <Link to="/admin" className="mt-4 md:mt-0 text-white bg-secondary hover:bg-secondary-light px-4 py-2 rounded-md font-bold transition-colors">
                 System Administration
             </Link>
        )}
      </div>

      {/* Notification Banner */}
      {notificationPermission === 'default' && (
        <div className="mb-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mr-3">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-blue-900">Enable Status Notifications</h3>
                    <p className="text-sm text-blue-700">Get notified immediately when your event registration is confirmed or updated.</p>
                </div>
            </div>
            <button 
                onClick={handleEnableNotifications}
                className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
            >
                Enable Notifications
            </button>
        </div>
      )}

      {/* Community Pulse - Modular Component */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Community Pulse
        </h2>
        <CommunityPulse isLoading={isLoading} highlights={highlights} />
      </div>

      {/* Role-Specific Workspace */}
      <div className="border-t border-gray-200 pt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            My Personal Workspace
        </h2>
        
        {!isManagerOrAdmin ? (
            <div className="space-y-8">
                {/* Volunteer Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <div className="text-sm font-medium text-gray-500 mb-1">Total Hours</div>
                        <div className="text-3xl font-bold text-primary">24.5</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <div className="text-sm font-medium text-gray-500 mb-1">Events Attended</div>
                        <div className="text-3xl font-bold text-primary">{myRegistrations.filter(r => r.status === 'completed').length}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <div className="text-sm font-medium text-gray-500 mb-1">Upcoming</div>
                        <div className="text-3xl font-bold text-secondary">{upcomingRegistrations.length}</div>
                    </div>
                </div>

                {/* Volunteer Registrations List */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h3 className="text-lg font-bold text-gray-900">Your Activities</h3>
                        <div className="flex space-x-2 bg-white rounded-md p-1 border border-gray-200">
                            <button 
                                onClick={() => setActiveTab('upcoming')}
                                className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${activeTab === 'upcoming' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                Upcoming
                            </button>
                            <button 
                                onClick={() => setActiveTab('history')}
                                className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${activeTab === 'history' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                History
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {activeTab === 'upcoming' ? (
                                upcomingRegistrations.length === 0 ? (
                                    <li className="p-8 text-center text-gray-500">
                                        No upcoming events. <Link to="/events" className="text-primary hover:underline font-medium">Explore new opportunities!</Link>
                                    </li>
                                ) : (
                                    upcomingRegistrations.map(reg => <RegistrationItem key={reg.id} reg={reg} />)
                                )
                            ) : (
                                pastRegistrations.length === 0 ? (
                                    <li className="p-8 text-center text-gray-500">No participation history yet.</li>
                                ) : (
                                    pastRegistrations.map(reg => <RegistrationItem key={reg.id} reg={reg} />)
                                )
                            )}
                        </ul>
                    )}
                </div>
            </div>
        ) : (
            <div className="space-y-8">
                {/* Manager Events Table */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800">Your Managed Events</h2>
                    <Link 
                        to="/events/new"
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-light transition-colors flex items-center shadow-sm"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Event
                    </Link>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrations</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading your events...</td></tr>
                        ) : events.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">You haven't created any events yet.</td></tr>
                        ) : events.map((event) => (
                            <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-200 overflow-hidden">
                                    <img src={event.imageUrl} alt="" className="h-full w-full object-cover"/>
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 hover:text-secondary">
                                        <Link to={`/events/${event.id}`}>{event.title}</Link>
                                    </div>
                                    <div className="text-xs text-gray-500">{event.category} | {event.location}</div>
                                </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{new Date(event.startDate).toLocaleDateString()}</div>
                                <div className="text-xs text-gray-400">{new Date(event.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                event.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {event.status.toUpperCase()}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <Link to={`/events/${event.id}/registrations`} className="text-secondary font-medium hover:underline flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    Manage Attendees
                                </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                onClick={() => navigate(`/events/${event.id}/edit`)} 
                                className="text-primary hover:text-primary-light mr-4 transition-colors"
                                >
                                Edit
                                </button>
                                <button 
                                onClick={() => handleDeleteEvent(event.id)}
                                className="text-red-600 hover:text-red-900 transition-colors font-semibold"
                                >
                                Delete
                                </button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

const RegistrationItem: React.FC<{ reg: Registration }> = ({ reg }) => (
    <li className="p-6 hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary truncate mb-1">
                    {reg.event ? new Date(reg.event.startDate).toLocaleDateString() : 'Unknown Date'}
                </p>
                <p className="text-lg font-bold text-primary truncate">
                    <Link to={`/events/${reg.eventId}`} className="hover:underline">
                        {reg.event?.title || 'Unknown Event'}
                    </Link>
                </p>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {reg.event?.location}
                </p>
            </div>
            <div className="ml-4 flex-shrink-0">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium 
          ${reg.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        reg.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            reg.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {reg.status}
                </span>
            </div>
        </div>
    </li>
);

export default Dashboard;