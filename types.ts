// User Roles and Status
export enum UserRole {
  VOLUNTEER = 'volunteer',
  MANAGER = 'manager',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  LOCKED = 'locked',
}

// User Entity
export interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Event Entity
export enum EventStatus {
  PENDING = 'pending', // Waiting for Admin approval
  APPROVED = 'approved', // Live for registration
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  category: string; // New field for filtering
  startDate: string; // ISO Date String
  endDate: string; // ISO Date String
  status: EventStatus;
  createdBy: number; // User ID (Manager)
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  
  // Aggregated fields for UI
  organizerName?: string;
  participantCount?: number;
}

// Registration Entity (Relationship between User and Event)
export enum RegistrationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled', // By volunteer
  COMPLETED = 'completed', // Attended and finished
}

export interface Registration {
  id: number;
  userId: number;
  eventId: number;
  status: RegistrationStatus;
  registeredAt: string;
  updatedAt: string;
  
  // Joined fields
  user?: User;
  event?: Event;
}

// Social Wall Entities
export interface Post {
  id: number;
  eventId: number;
  userId: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  
  // Joined
  authorName: string;
  authorAvatar?: string;
  commentCount: number;
  likeCount: number;
  isLikedByCurrentUser?: boolean;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  
  // Joined
  authorName: string;
  authorAvatar?: string;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: 'registration_update' | 'event_update' | 'system';
}

// API Response Wrappers
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}