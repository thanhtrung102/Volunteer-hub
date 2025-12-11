import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import { userService } from '../services/userService';
import { registrationService } from '../services/registrationService';
import { Event, User, UserStatus, EventStatus, UserRole } from '../types';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'events' | 'users'>('events');
  
  // State for Events
  const [events, setEvents] = useState<Event[]>([]);
  const [eventFilter, setEventFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // State for Users
  const [users, setUsers] = useState<User[]>([]);
  const [userFilter, setUserFilter] = useState<'all' | 'active' | 'locked'>('all');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    loadEvents();
    loadUsers();
  }, []);

  const loadEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Event Actions
  const handleApproveEvent = async (id: number) => {
    try {
      await eventService.updateEvent(id, { status: EventStatus.APPROVED });
      loadEvents(); 
    } catch (error) {
      alert('Failed to approve event');
    }
  };

  const handleRejectEvent = async (id: number) => {
    try {
        await eventService.updateEvent(id, { status: EventStatus.REJECTED });
        loadEvents();
    } catch (error) {
        alert('Failed to reject event');
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (window.confirm('WARNING: Are you sure you want to delete this event? This will also remove all attendee registrations.')) {
      try {
        // Optimistic update
        setEvents(current => current.filter(e => e.id !== id));
        
        await registrationService.deleteRegistrationsByEvent(id);
        await eventService.deleteEvent(id);
      } catch (error) {
        console.error("Delete event failed", error);
        alert('Failed to delete event');
        loadEvents();
      }
    }
  };

  const handleExportEvents = async () => {
      const csv = await eventService.exportEvents();
      downloadCsv(csv, 'events_export.csv');
  };

  // User Actions
  const handleToggleUserStatus = async (user: User) => {
    const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.LOCKED : UserStatus.ACTIVE;
    try {
      await userService.updateUserStatus(user.id, newStatus);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch (error) {
      alert('Failed to update user status');
      loadUsers();
    }
  };

  const handleExportUsers = async () => {
      const csv = await userService.exportUsers();
      downloadCsv(csv, 'users_export.csv');
  };

  const downloadCsv = (content: string, fileName: string) => {
      const blob = new Blob([content], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', fileName);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  const filteredEvents = events.filter(e => {
      if (eventFilter === 'all') return true;
      return e.status === eventFilter;
  });

  const filteredUsers = users.filter(u => {
      if (userFilter === 'all') return true;
      return u.status === userFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 border-b border-gray-200 pb-4 flex flex-col md:flex-row justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-primary">System Administration</h1>
            <p className="text-gray-600 mt-2">
            Manage system-wide events and user accounts.
            </p>
        </div>
        <div className="mt-4 md:mt-0">
            <Link 
                to="/admin/tests" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-secondary bg-orange-100 hover:bg-orange-200 transition-colors"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Run System Tests
            </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm ${
            activeTab === 'events'
              ? 'bg-secondary text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Event Management
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm ${
            activeTab === 'users'
              ? 'bg-secondary text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          User Management
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {activeTab === 'events' && (
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-2">
                     <span className="text-sm font-medium text-gray-700">Filter:</span>
                     <select 
                        value={eventFilter}
                        onChange={(e) => setEventFilter(e.target.value as any)}
                        className="border border-gray-300 rounded-md text-sm p-1 bg-white"
                     >
                         <option value="all">All Events</option>
                         <option value="pending">Pending Approval</option>
                         <option value="approved">Approved</option>
                         <option value="rejected">Rejected</option>
                     </select>
                </div>
                <button onClick={handleExportEvents} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-medium transition-colors">Export CSV</button>
            </div>
            
            {isLoadingEvents ? (
               <div className="text-center py-10 text-gray-500">Loading events...</div>
            ) : (
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizer (ID)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEvents.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">
                                <Link to={`/events/${event.id}`} className="hover:text-secondary">{event.title}</Link>
                            </div>
                            <div className="text-xs text-gray-500">{event.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(event.startDate).toLocaleDateString()}
                        </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {event.organizerName} <span className="text-xs text-gray-400">({event.createdBy})</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                event.status === EventStatus.APPROVED ? 'bg-green-100 text-green-800' :
                                event.status === EventStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                            {event.status.toUpperCase()}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                            {event.status === EventStatus.PENDING ? (
                                <>
                                    <button onClick={() => handleApproveEvent(event.id)} className="text-green-600 hover:text-green-900 font-bold">Approve</button>
                                    <button onClick={() => handleRejectEvent(event.id)} className="text-yellow-600 hover:text-yellow-900">Reject</button>
                                </>
                            ) : (
                                <span className="text-gray-400 italic text-xs mr-2">Decided</span>
                            )}
                            <button onClick={() => handleDeleteEvent(event.id)} className="text-red-600 hover:text-red-900 font-semibold">Delete</button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {filteredEvents.length === 0 && <div className="p-8 text-center text-gray-500">No events found matching filter.</div>}
                </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-2">
                     <span className="text-sm font-medium text-gray-700">Filter:</span>
                     <select 
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value as any)}
                        className="border border-gray-300 rounded-md text-sm p-1 bg-white"
                     >
                         <option value="all">All Users</option>
                         <option value="active">Active</option>
                         <option value="locked">Locked</option>
                     </select>
                </div>
                <button onClick={handleExportUsers} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-medium transition-colors">Export CSV</button>
            </div>

            {isLoadingUsers ? (
               <div className="text-center py-10 text-gray-500">Loading users...</div>
            ) : (
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((u) => (
                        <tr key={u.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 mr-3 overflow-hidden">
                                {u.avatarUrl && <img src={u.avatarUrl} alt="" className="h-full w-full object-cover" />}
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900">{u.fullName}</div>
                                <div className="text-xs text-gray-500">{u.email}</div>
                            </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                             <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                                {u.role}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.status === UserStatus.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {u.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                            {u.id !== user?.id ? (
                                <>
                                    <button 
                                        onClick={() => handleToggleUserStatus(u)}
                                        className={`${u.status === UserStatus.ACTIVE ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                                    >
                                        {u.status === UserStatus.ACTIVE ? 'Lock' : 'Unlock'}
                                    </button>
                                </>
                            ) : (
                                <span className="text-gray-400 italic text-xs">Current User</span>
                            )}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && <div className="p-8 text-center text-gray-500">No users found matching filter.</div>}
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;