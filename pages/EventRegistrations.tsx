import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { registrationService } from '../services/registrationService';
import { eventService } from '../services/eventService';
import { Registration, RegistrationStatus, Event } from '../types';

const EventRegistrations: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(Number(id));
    }
  }, [id]);

  const loadData = async (eventId: number) => {
    setIsLoading(true);
    try {
      const [regs, evt] = await Promise.all([
        registrationService.getRegistrationsByEvent(eventId),
        eventService.getEventById(eventId)
      ]);
      setRegistrations(regs);
      setEvent(evt || null);
    } catch (error) {
      console.error(error);
      alert('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (regId: number, newStatus: RegistrationStatus) => {
    try {
      await registrationService.updateStatus(regId, newStatus);
      // Optimistic update
      setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status: newStatus } : r));
    } catch (error) {
      alert('Failed to update status');
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!event) return <div className="p-8 text-center">Event not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-primary">Manage Attendees</h1>
            <p className="text-gray-600">Event: <span className="font-semibold">{event.title}</span></p>
        </div>
        <button 
            onClick={() => navigate('/dashboard')}
            className="text-sm text-gray-500 hover:text-primary"
        >
            &larr; Back to Dashboard
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volunteer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {registrations.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-gray-500">No registrations yet.</td></tr>
                ) : registrations.map((reg) => (
                <tr key={reg.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 mr-3 overflow-hidden">
                                {reg.user?.avatarUrl && <img src={reg.user.avatarUrl} alt="" className="h-full w-full object-cover"/>}
                            </div>
                            <div className="text-sm font-medium text-gray-900">{reg.user?.fullName || 'Unknown'}</div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reg.user?.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(reg.registeredAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${reg.status === RegistrationStatus.CONFIRMED ? 'bg-green-100 text-green-800' : 
                              reg.status === RegistrationStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                              reg.status === RegistrationStatus.COMPLETED ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'}`}>
                            {reg.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {reg.status === RegistrationStatus.PENDING && (
                            <>
                                <button 
                                    onClick={() => handleStatusChange(reg.id, RegistrationStatus.CONFIRMED)}
                                    className="text-green-600 hover:text-green-900"
                                >
                                    Confirm
                                </button>
                                <button 
                                    onClick={() => handleStatusChange(reg.id, RegistrationStatus.REJECTED)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    Reject
                                </button>
                            </>
                        )}
                        {reg.status === RegistrationStatus.CONFIRMED && (
                            <>
                                <button 
                                    onClick={() => handleStatusChange(reg.id, RegistrationStatus.COMPLETED)}
                                    className="text-blue-600 hover:text-blue-900"
                                >
                                    Mark Complete
                                </button>
                                <button 
                                    onClick={() => handleStatusChange(reg.id, RegistrationStatus.REJECTED)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                        {(reg.status === RegistrationStatus.REJECTED || reg.status === RegistrationStatus.CANCELLED) && (
                             <span className="text-gray-400 cursor-not-allowed">Archived</span>
                        )}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default EventRegistrations;