import { useState, useEffect } from 'react';
import { eventService } from '../services/eventService';
import { registrationService } from '../services/registrationService';
import { Event, Registration, UserRole, User } from '../types';

interface UseEventDetailsReturn {
  event: Event | null;
  registration: Registration | null;
  isLoading: boolean;
  isProcessing: boolean;
  refreshRegistration: () => Promise<void>;
  register: () => Promise<void>;
  cancelRegistration: () => Promise<void>;
}

export const useEventDetails = (eventId: string | undefined, user: User | null): UseEventDetailsReturn => {
  const [event, setEvent] = useState<Event | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (eventId) {
        try {
          const eventData = await eventService.getEventById(Number(eventId));
          setEvent(eventData || null);

          if (user && user.role === UserRole.VOLUNTEER) {
             const regData = await registrationService.getRegistrationForUserAndEvent(user.id, Number(eventId));
             setRegistration(regData || null);
          }
        } catch (error) {
          console.error('Failed to load details', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [eventId, user]);

  // Real-time updates every 10 seconds to reflect participant count changes
  useEffect(() => {
    if (!eventId) return;

    const interval = setInterval(async () => {
      console.log(`[useEventDetails] Real-time polling: Refreshing event ${eventId}...`);
      try {
        const eventData = await eventService.getEventById(Number(eventId));
        if (eventData) {
          setEvent(eventData);
          console.log(`[useEventDetails] Event ${eventId} refreshed, participant count: ${eventData.participantCount}`);
        }
      } catch (error) {
        console.error('Failed to refresh event data', error);
      }
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [eventId]);

  const refreshRegistration = async () => {
      if (user && eventId) {
          const regData = await registrationService.getRegistrationForUserAndEvent(user.id, Number(eventId));
          setRegistration(regData || null);
      }
  };

  const register = async () => {
      if (!user || !eventId) return;
      setIsProcessing(true);
      try {
          const newReg = await registrationService.registerForEvent(user.id, Number(eventId));
          setRegistration(newReg);
      } finally {
          setIsProcessing(false);
      }
  };

  const cancelRegistration = async () => {
      if (!registration) return;
      setIsProcessing(true);
      try {
          await registrationService.cancelRegistration(registration.id);
          setRegistration(null);
      } finally {
          setIsProcessing(false);
      }
  };

  return { 
      event, 
      registration, 
      isLoading, 
      isProcessing, 
      refreshRegistration, 
      register, 
      cancelRegistration 
  };
};