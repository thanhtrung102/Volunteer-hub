import { Registration, RegistrationStatus } from '../types';
import { eventService } from './eventService';
import { userService } from './userService';
import { notificationService } from './notificationService';
import { MOCK_REGISTRATIONS } from '../mockData';
import { db } from '../utils/database';

class RegistrationService {
  private static instance: RegistrationService;
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): RegistrationService {
    if (!RegistrationService.instance) {
      RegistrationService.instance = new RegistrationService();
    }
    return RegistrationService.instance;
  }

  /**
   * Initialize the registration service with database
   * Loads existing registrations or seeds with demo data
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Check if we have registrations in the database
      const existingRegistrations = await db.getAllRegistrations<Registration>();

      if (existingRegistrations.length === 0) {
        // First time - seed with demo data
        console.log(`[RegistrationService] Seeding database with ${MOCK_REGISTRATIONS.length} demo registrations`);

        for (const registration of MOCK_REGISTRATIONS) {
          await db.addRegistration(registration);
        }

        console.log('[RegistrationService] Demo registrations initialized');
      } else {
        console.log(`[RegistrationService] Loaded ${existingRegistrations.length} registrations from database`);

        // Check if we need to add missing registrations (should be 90 total)
        const expectedCount = MOCK_REGISTRATIONS.length;
        if (existingRegistrations.length < expectedCount) {
          const existingIds = existingRegistrations.map(r => r.id);
          const missingRegs = MOCK_REGISTRATIONS.filter(r => !existingIds.includes(r.id));

          if (missingRegs.length > 0) {
            console.log(`[RegistrationService] Adding ${missingRegs.length} missing registrations`);

            for (const registration of missingRegs) {
              await db.addRegistration(registration);
            }

            console.log(`[RegistrationService] Added ${missingRegs.length} registrations`);
          }
        }
      }

      this.initialized = true;
    } catch (error) {
      console.error('[RegistrationService] Initialization failed:', error);
      throw error;
    }
  }

  private async delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async registerForEvent(userId: number, eventId: number): Promise<Registration> {
    await this.delay();

    // 1. Check if event exists
    const event = await eventService.getEventById(eventId);
    if (!event) throw new Error('Event not found');

    // 2. Check duplicate registration from database
    const registrations = await db.getRegistrationsByUser<Registration>(userId);
    const existing = registrations.find(r => r.eventId === eventId);
    if (existing) {
        if (existing.status === RegistrationStatus.CANCELLED) {
            existing.status = RegistrationStatus.PENDING;
            existing.updatedAt = new Date().toISOString();
            await db.updateRegistration(existing);
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

    // Add to database
    await db.addRegistration(newRegistration);

    // 4. Simulate Backend Async Process - Auto-confirm after 2 seconds
    setTimeout(async () => {
        const regToUpdate = await db.getRegistration<Registration>(newRegistration.id);
        if (regToUpdate && regToUpdate.status === RegistrationStatus.PENDING) {
            regToUpdate.status = RegistrationStatus.CONFIRMED;
            regToUpdate.updatedAt = new Date().toISOString();
            await db.updateRegistration(regToUpdate);
            console.log(`[RegistrationService] Auto-confirmed registration ${newRegistration.id} for event ${eventId}`);

            if (notificationService.getPermission() === 'granted') {
                notificationService.notify(
                    'Registration Confirmed! 🎉',
                    `Great news! Your spot for "${event.title}" has been confirmed. Tap to view details.`
                );
            }
        }
    }, 2000); // Reduced to 2 seconds for faster updates

    return newRegistration;
  }

  public async cancelRegistration(registrationId: number): Promise<void> {
    await this.delay();
    const reg = await db.getRegistration<Registration>(registrationId);
    if (!reg) throw new Error('Registration not found');

    if (reg.status === RegistrationStatus.COMPLETED) {
        throw new Error('Cannot cancel a completed event');
    }

    reg.status = RegistrationStatus.CANCELLED;
    reg.updatedAt = new Date().toISOString();
    await db.updateRegistration(reg);
  }

  public async updateStatus(registrationId: number, status: RegistrationStatus): Promise<Registration> {
    await this.delay();
    const reg = await db.getRegistration<Registration>(registrationId);
    if (!reg) throw new Error('Registration not found');

    reg.status = status;
    reg.updatedAt = new Date().toISOString();
    await db.updateRegistration(reg);

    return reg;
  }

  public async getRegistrationsByUser(userId: number): Promise<Registration[]> {
    await this.delay();
    const regs = await db.getRegistrationsByUser<Registration>(userId);
    const filtered = regs.filter(r => r.status !== RegistrationStatus.CANCELLED);

    // Join Event Data
    const populated = await Promise.all(filtered.map(async (r) => {
        const event = await eventService.getEventById(r.eventId);
        return { ...r, event };
    }));

    return populated.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
  }

  public async getRegistrationsByEvent(eventId: number): Promise<Registration[]> {
    await this.delay();
    const regs = await db.getRegistrationsByEvent<Registration>(eventId);

    // Join User Data
    const populated = await Promise.all(regs.map(async (r) => {
        const user = await userService.getUserById(r.userId);
        return { ...r, user };
    }));

    return populated;
  }

  public async getRegistrationForUserAndEvent(userId: number, eventId: number): Promise<Registration | undefined> {
      const registrations = await db.getRegistrationsByUser<Registration>(userId);
      return registrations.find(r => r.eventId === eventId && r.status !== RegistrationStatus.CANCELLED);
  }

  public async deleteRegistrationsByEvent(eventId: number): Promise<void> {
    await this.delay(300);
    const regs = await db.getRegistrationsByEvent<Registration>(eventId);
    for (const reg of regs) {
      await db.deleteRegistration(reg.id);
    }
  }
}

export const registrationService = RegistrationService.getInstance();