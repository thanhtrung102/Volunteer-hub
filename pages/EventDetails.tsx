import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole, EventStatus } from '../types';
import SocialWall from '../components/SocialWall';
import { useEventDetails } from '../hooks/useEventDetails';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Logic extracted to hook
  const { 
      event, 
      registration, 
      isLoading, 
      isProcessing, 
      register, 
      cancelRegistration 
  } = useEventDetails(id, user);

  const handleRegister = async () => {
      if (!user) {
          navigate('/login', { state: { from: location } });
          return;
      }
      try {
          await register();
          alert('Registration successful!');
      } catch (e: any) {
          alert(e.message);
      }
  };

  const handleCancelRegistration = async () => {
      if (window.confirm('Are you sure you want to cancel your registration?')) {
          try {
              await cancelRegistration();
          } catch (e: any) {
              alert(e.message);
          }
      }
  }

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!event) return <div className="p-8 text-center">Event not found</div>;

  const isVolunteer = user?.role === UserRole.VOLUNTEER;

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Header Image */}
      <div className="h-64 md:h-80 w-full relative">
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 text-white max-w-7xl mx-auto">
          <Link to="/events" className="text-gray-300 hover:text-white text-sm mb-4 inline-block">&larr; Back to Events</Link>
          <h1 className="text-3xl md:text-5xl font-bold">{event.title}</h1>
          <div className="flex items-center mt-2 text-gray-200">
            <span className={`px-2 py-1 rounded text-xs font-bold text-white mr-3 ${event.status === EventStatus.APPROVED ? 'bg-secondary' : 'bg-gray-500'}`}>
                {event.status.toUpperCase()}
            </span>
            <span>Organized by {event.organizerName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Details & Wall */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-primary mb-4">About this Event</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {event.status === EventStatus.APPROVED ? (
             <SocialWall eventId={event.id} />
          ) : (
             <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Discussion Channel Locked</h3>
                <p className="mt-1 text-sm text-gray-500">
                    The community wall will be available once this event is approved.
                </p>
             </div>
          )}
        </div>

        {/* Right Column: Action Box */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-secondary sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Event Details</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8">
                  <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Date</p>
                  <p className="text-sm text-gray-600">{new Date(event.startDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8">
                  <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Time</p>
                  <p className="text-sm text-gray-600">
                    {new Date(event.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(event.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8">
                  <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">{event.location}</p>
                </div>
              </div>
            </div>

            {isAuthenticated && isVolunteer ? (
                registration ? (
                    <div className="space-y-3">
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3 rounded-r">
                            <div className="flex items-start gap-2">
                                <svg className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className="text-sm text-blue-700 font-medium">You're registered!</p>
                                    <p className="text-xs text-blue-600 mt-0.5">The event manager will review your registration.</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full py-3 px-4 rounded bg-green-50 text-green-700 text-center font-bold border border-green-200">
                            Status: {registration.status.toUpperCase()}
                        </div>
                         {registration.status !== 'completed' && (
                             <button
                                onClick={handleCancelRegistration}
                                disabled={isProcessing}
                                title="Cancel your registration for this event"
                                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded border border-gray-300 shadow-sm transition-colors text-sm"
                             >
                                {isProcessing ? 'Processing...' : 'Cancel Registration'}
                             </button>
                         )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r">
                            <div className="flex items-start gap-2">
                                <svg className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className="text-sm text-green-700 font-medium">Spots available!</p>
                                    <p className="text-xs text-green-600 mt-0.5">Join {event.participantCount} volunteers already signed up.</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleRegister}
                            disabled={isProcessing}
                            title="Register for this volunteer event"
                            className="w-full bg-primary hover:bg-primary-light text-white font-bold py-3 px-4 rounded shadow-md transition-all hover:shadow-lg flex justify-center items-center"
                        >
                            {isProcessing ? 'Processing...' : 'Register Now'}
                        </button>
                    </div>
                )
            ) : isAuthenticated ? (
                 <div className="w-full py-3 px-4 rounded bg-gray-100 text-gray-500 text-center text-sm">
                    {user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN ? 'Manage via Dashboard' : 'Please log in as a volunteer'}
                 </div>
            ) : (
                <div className="space-y-3">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r">
                        <div className="flex items-start gap-2">
                            <svg className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="text-sm text-yellow-700 font-medium">Login required</p>
                                <p className="text-xs text-yellow-600 mt-0.5">Create an account or sign in to register for this event.</p>
                            </div>
                        </div>
                    </div>
                    <Link to="/login" className="block w-full bg-secondary hover:bg-secondary-light text-white font-bold py-3 px-4 rounded shadow-md transition-all hover:shadow-lg text-center">
                        Log in to Register
                    </Link>
                </div>
            )}

            <p className="text-center text-xs text-gray-500 mt-3">
              {Math.max(0, 50 - (event.participantCount || 0))} spots remaining
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EventDetails;