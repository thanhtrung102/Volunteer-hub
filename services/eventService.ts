import { Event, EventStatus, PaginatedResponse } from '../types';
import { MOCK_EVENTS } from '../mockData';
import * as yup from 'yup';

// Validation Schema
const eventSchema = yup.object().shape({
  title: yup.string().required('Title is required').min(3),
  description: yup.string().required('Description is required').min(10),
  location: yup.string().required('Location is required'),
  category: yup.string().required('Category is required'),
  startDate: yup.date().required().typeError('Invalid start date'),
  endDate: yup.date().required().typeError('Invalid end date').min(yup.ref('startDate')),
  imageUrl: yup.string().url().nullable(),
});

class EventService {
  private static instance: EventService;
  private events = MOCK_EVENTS;

  private constructor() {
    // Generate extra dummy events to demonstrate pagination/performance if list is short
    if (this.events.length < 20) {
        const categories = ['Environment', 'Education', 'Community', 'Health', 'Crisis Support'];
        const extraEvents = Array.from({ length: 16 }).map((_, i) => ({
            ...this.events[i % this.events.length],
            id: 100 + i,
            title: `${this.events[i % this.events.length].title} ${i + 1}`,
            category: categories[i % categories.length],
            participantCount: Math.floor(Math.random() * 50),
            startDate: new Date(Date.now() + (i * 86400000)).toISOString(),
            endDate: new Date(Date.now() + (i * 86400000) + 7200000).toISOString(),
            status: EventStatus.APPROVED,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString(),
            updatedAt: new Date(Date.now() - Math.floor(Math.random() * 100000000)).toISOString(),
        }));
        // We push to the reference to keep it in sync
        this.events.push(...extraEvents);
    }
  }

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  private async delay(ms: number = 600): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // READ: Get all events (Legacy/Admin usage)
  public async getAllEvents(): Promise<Event[]> {
    await this.delay(300);
    return [...this.events];
  }

  // READ: Get events created by specific user (Manager usage)
  public async getEventsByCreator(userId: number): Promise<Event[]> {
    await this.delay(300);
    return this.events.filter(e => e.createdBy === userId);
  }

  // READ: Get events with Pagination (Performance Optimized)
  public async getEvents(page: number = 1, limit: number = 6, searchTerm: string = '', category: string = '', startDate: string = ''): Promise<PaginatedResponse<Event>> {
    await this.delay(600); 

    let filtered = this.events.filter(e => e.status === EventStatus.APPROVED);

    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(e => 
            e.title.toLowerCase().includes(term) || 
            e.location.toLowerCase().includes(term)
        );
    }

    if (category) {
        filtered = filtered.filter(e => e.category === category);
    }

    if (startDate) {
        const filterDate = new Date(startDate).getTime();
        filtered = filtered.filter(e => new Date(e.startDate).getTime() >= filterDate);
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const items = filtered.slice(start, end);

    return { items, total, page, pageSize: limit };
  }

  // READ: Dashboard Highlights
  public async getDashboardHighlights(): Promise<{ newEvents: Event[], trendingEvents: Event[], activeEvents: Event[] }> {
    await this.delay(500);
    const approved = this.events.filter(e => e.status === EventStatus.APPROVED);
    
    // 1. New Events
    const newEvents = [...approved]
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
    
    // 2. Trending
    const trendingEvents = [...approved]
        .sort((a,b) => (b.participantCount || 0) - (a.participantCount || 0))
        .slice(0, 5);
    
    // 3. Active
    const activeEvents = [...approved]
        .sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);

    return { newEvents, trendingEvents, activeEvents };
  }

  public async getEventById(id: number): Promise<Event | undefined> {
    await this.delay(300);
    return this.events.find(e => e.id === id);
  }

  public async createEvent(data: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'participantCount' | 'status' | 'organizerName'>): Promise<Event> {
    await this.delay();
    try {
      await eventSchema.validate(data, { abortEarly: false });
    } catch (error: any) {
      throw new Error(error.inner.map((err: any) => err.message).join(', '));
    }

    const newEvent: Event = {
      ...data,
      id: Math.floor(Math.random() * 10000) + 1000,
      status: EventStatus.PENDING,
      participantCount: 0,
      organizerName: "Current User",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.events.unshift(newEvent);
    return newEvent;
  }

  public async updateEvent(id: number, data: Partial<Event>): Promise<Event> {
    await this.delay();
    const index = this.events.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Event not found');

    const eventToUpdate = { ...this.events[index], ...data };
    const updatedEvent = { ...eventToUpdate, updatedAt: new Date().toISOString() };
    this.events[index] = updatedEvent;
    return updatedEvent;
  }

  public async deleteEvent(id: number): Promise<void> {
    await this.delay(500); 
    // Mutate the array properly
    const index = this.events.findIndex(e => e.id === id);
    if (index !== -1) {
        this.events.splice(index, 1);
    }
  }

  public async exportEvents(): Promise<string> {
      await this.delay();
      const headers = "ID,Title,Category,Date,Location,Status,Participants\n";
      const rows = this.events.map(e => `${e.id},"${e.title}",${e.category},${e.startDate},"${e.location}",${e.status},${e.participantCount}`).join("\n");
      return headers + rows;
  }
}

export const eventService = EventService.getInstance();