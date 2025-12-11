import { Registration, RegistrationStatus } from '../types';
import { eventService } from './eventService';
import { userService } from './userService';
import { notificationService } from './notificationService';
import { MOCK_REGISTRATIONS } from '../mockData';

class RegistrationService {
  private static instance: RegistrationService;
  private registrations = MOCK_REGISTRATIONS;

  private constructor() {}

  public static getInstance(): RegistrationService {
    if (!RegistrationService.instance) {
      RegistrationService.instance = new RegistrationService();
    }
    return RegistrationService.instance;
  }

  private async delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async registerForEvent(userId: number, eventId: number): Promise<Registration> {
    await this.delay();

    // 1. Check if event exists
    const event = await eventService.getEventById(eventId);
    if (!event) throw new Error('Event not found');

    // 2. Check duplicate registration
    const existing = this.registrations.find(r => r.userId === userId && r.eventId === eventId);
    if (existing) {
        if (existing.status === RegistrationStatus.CANCELLED) {
            existing.status = RegistrationStatus.PENDING;
            existing.updatedAt = new Date().toISOString();
            return existing;
        }
        throw new Error('Already registered for this event');
    }

    // 3. Create Registration
    const newRegistration: Registration = {
      id: Math.floor(Math.random() * 10000) + 1,
      userId,
      eventId,
      status: RegistrationStatus.PENDING,
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.registrations.push(newRegistration);

    // 4. Simulate Backend Async Process
    if (notificationService.getPermission() === 'granted') {
        setTimeout(() => {
            const regToUpdate = this.registrations.find(r => r.id === newRegistration.id);
            if (regToUpdate && regToUpdate.status === RegistrationStatus.PENDING) {
                regToUpdate.status = RegistrationStatus.CONFIRMED;
                regToUpdate.updatedAt = new Date().toISOString();
                
                notificationService.notify(
                    'Registration Confirmed! 🎉',
                    `Great news! Your spot for "${event.title}" has been confirmed. Tap to view details.`
                );
            }
        }, 5000);
    }

    return newRegistration;
  }

  public async cancelRegistration(registrationId: number): Promise<void> {
    await this.delay();
    const index = this.registrations.findIndex(r => r.id === registrationId);
    if (index === -1) throw new Error('Registration not found');

    const reg = this.registrations[index];
    if (reg.status === RegistrationStatus.COMPLETED) {
        throw new Error('Cannot cancel a completed event');
    }

    reg.status = RegistrationStatus.CANCELLED;
    reg.updatedAt = new Date().toISOString();
    this.registrations[index] = reg;
  }

  public async updateStatus(registrationId: number, status: RegistrationStatus): Promise<Registration> {
    await this.delay();
    const index = this.registrations.findIndex(r => r.id === registrationId);
    if (index === -1) throw new Error('Registration not found');

    const reg = this.registrations[index];
    reg.status = status;
    reg.updatedAt = new Date().toISOString();
    this.registrations[index] = reg;

    return reg;
  }

  public async getRegistrationsByUser(userId: number): Promise<Registration[]> {
    await this.delay();
    const regs = this.registrations.filter(r => r.userId === userId && r.status !== RegistrationStatus.CANCELLED);
    
    // Join Event Data
    const populated = await Promise.all(regs.map(async (r) => {
        const event = await eventService.getEventById(r.eventId);
        return { ...r, event };
    }));

    return populated.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
  }

  public async getRegistrationsByEvent(eventId: number): Promise<Registration[]> {
    await this.delay();
    const regs = this.registrations.filter(r => r.eventId === eventId); 

    // Join User Data
    const populated = await Promise.all(regs.map(async (r) => {
        const user = await userService.getUserById(r.userId);
        return { ...r, user };
    }));

    return populated;
  }

  public async getRegistrationForUserAndEvent(userId: number, eventId: number): Promise<Registration | undefined> {
      return this.registrations.find(r => r.userId === userId && r.eventId === eventId && r.status !== RegistrationStatus.CANCELLED);
  }

  public async deleteRegistrationsByEvent(eventId: number): Promise<void> {
    await this.delay(300);
    // Filter in place
    const remaining = this.registrations.filter(r => r.eventId !== eventId);
    // Clear and push (hack to keep reference if necessary, but reassigning works if exported as const module in mockData)
    // Since we import a const array from mockData, we must mutate it.
    this.registrations.length = 0;
    this.registrations.push(...remaining);
  }
}

export const registrationService = RegistrationService.getInstance();