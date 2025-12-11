import { Event, EventStatus, User, UserRole, UserStatus, Registration, RegistrationStatus, Post, Comment } from './types';

// ==========================================
// MOCK DATABASE
// ==========================================
// This file acts as the central "database" for the application.
// In a real app, this data would come from a backend API.

export const MOCK_USERS: User[] = [
  {
    id: 1,
    email: 'admin@volunteerhub.com',
    fullName: 'Admin User',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin+User&background=0F172A&color=fff'
  },
  {
    id: 101,
    email: 'manager@volunteerhub.com',
    fullName: 'Sarah Manager',
    role: UserRole.MANAGER,
    status: UserStatus.ACTIVE,
    createdAt: "2024-02-15T00:00:00Z",
    updatedAt: "2024-02-15T00:00:00Z",
    avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Manager&background=D97706&color=fff'
  },
  {
    id: 201,
    email: 'volunteer@volunteerhub.com',
    fullName: 'Alex Volunteer',
    role: UserRole.VOLUNTEER,
    status: UserStatus.ACTIVE,
    createdAt: "2024-03-10T00:00:00Z",
    updatedAt: "2024-03-10T00:00:00Z",
    avatarUrl: 'https://ui-avatars.com/api/?name=Alex+Volunteer&background=random'
  },
  {
    id: 202,
    email: 'john.doe@example.com',
    fullName: 'John Doe',
    role: UserRole.VOLUNTEER,
    status: UserStatus.LOCKED,
    createdAt: "2024-03-12T00:00:00Z",
    updatedAt: "2024-03-20T00:00:00Z",
    avatarUrl: 'https://ui-avatars.com/api/?name=John+Doe&background=random'
  }
];

export const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    title: "Community Beach Cleanup",
    description: "Join us for a morning of cleaning up our beautiful local shoreline. Gloves and bags provided. Refreshments served afterwards.",
    location: "Bay City Beach, FL",
    category: "Environment",
    startDate: "2025-06-15T09:00:00Z",
    endDate: "2025-06-15T12:00:00Z",
    status: EventStatus.APPROVED,
    createdBy: 101,
    imageUrl: "https://images.unsplash.com/photo-1618477461853-5f8dd68aa372?auto=format&fit=crop&q=80&w=800",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
    organizerName: "EcoWatch Florida",
    participantCount: 45
  },
  {
    id: 2,
    title: "Senior Center Tech Support",
    description: "Help local seniors learn how to use their smartphones and tablets to stay connected with loved ones.",
    location: "Sunset Senior Living",
    category: "Education",
    startDate: "2025-06-20T14:00:00Z",
    endDate: "2025-06-20T16:00:00Z",
    status: EventStatus.APPROVED,
    createdBy: 102,
    imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800",
    createdAt: "2025-01-02T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z",
    organizerName: "TechForGood",
    participantCount: 12
  },
  {
    id: 3,
    title: "Food Bank Sort & Pack",
    description: "Assist in sorting donated food items and packing boxes for distribution to families in need.",
    location: "Central Food Bank",
    category: "Community",
    startDate: "2025-06-22T08:00:00Z",
    endDate: "2025-06-22T12:00:00Z",
    status: EventStatus.APPROVED,
    createdBy: 101,
    imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800",
    createdAt: "2025-01-05T00:00:00Z",
    updatedAt: "2025-01-05T00:00:00Z",
    organizerName: "City Helpers",
    participantCount: 28
  },
  {
    id: 4,
    title: "Charity Gala Planning Meeting",
    description: "Internal planning meeting for the upcoming annual gala.",
    location: "Downtown Office",
    category: "Administrative",
    startDate: "2025-07-01T10:00:00Z",
    endDate: "2025-07-01T11:30:00Z",
    status: EventStatus.PENDING,
    createdBy: 102,
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800",
    createdAt: "2025-02-01T00:00:00Z",
    updatedAt: "2025-02-01T00:00:00Z",
    organizerName: "Admin Team",
    participantCount: 5
  }
];

export const MOCK_REGISTRATIONS: Registration[] = [
  {
    id: 1,
    userId: 201,
    eventId: 1,
    status: RegistrationStatus.CONFIRMED,
    registeredAt: "2025-01-05T10:00:00Z",
    updatedAt: "2025-01-06T10:00:00Z"
  }
];

export const MOCK_POSTS: Post[] = [
    {
        id: 1,
        eventId: 1,
        userId: 101,
        content: "Welcome everyone to the Beach Cleanup! Please bring your own water bottles. We will provide gloves and bags.",
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        authorName: "Sarah Manager",
        authorAvatar: "https://ui-avatars.com/api/?name=Sarah+Manager&background=D97706&color=fff",
        commentCount: 1,
        likeCount: 12,
        isLikedByCurrentUser: false
    }
];

export const MOCK_COMMENTS: Comment[] = [
     {
        id: 1,
        postId: 1,
        userId: 201,
        content: "Noted! Will there be parking available nearby?",
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        authorName: "Alex Volunteer",
        authorAvatar: "https://ui-avatars.com/api/?name=Alex+Volunteer&background=random"
    }
];

export const MOCK_STATS = {
  totalVolunteers: 1250,
  totalEvents: 45,
  hoursContributed: 3200
};