import { Event, EventStatus, User, UserRole, UserStatus, Registration, RegistrationStatus, Post, Comment } from './types';

// ==========================================
// MOCK DATABASE
// ==========================================
// This file acts as the central "database" for the application.
// In a real app, this data would come from a backend API.

// Generate 100 volunteer accounts
const generateVolunteers = (): User[] => {
  const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'Logan',
    'Mia', 'Lucas', 'Charlotte', 'Alexander', 'Amelia', 'Elijah', 'Harper', 'James', 'Evelyn', 'Benjamin',
    'Abigail', 'William', 'Emily', 'Michael', 'Elizabeth', 'Daniel', 'Sofia', 'Henry', 'Avery', 'Jackson',
    'Ella', 'Sebastian', 'Scarlett', 'Aiden', 'Grace', 'Matthew', 'Chloe', 'Samuel', 'Victoria', 'David',
    'Riley', 'Joseph', 'Aria', 'Carter', 'Lily', 'Owen', 'Aubrey', 'Wyatt', 'Zoey', 'John'];

  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
    'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

  const volunteers: User[] = [];
  const baseDate = new Date('2024-03-01T00:00:00Z');

  for (let i = 0; i < 100; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / 2) % lastNames.length];
    const fullName = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 49 ? i - 49 : ''}@volunteer.com`;
    const createdDate = new Date(baseDate.getTime() + i * 86400000); // Add i days

    volunteers.push({
      id: 300 + i,
      email,
      fullName,
      role: UserRole.VOLUNTEER,
      status: UserStatus.ACTIVE,
      createdAt: createdDate.toISOString(),
      updatedAt: createdDate.toISOString(),
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`
    });
  }

  return volunteers;
};

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
    id: 102,
    email: 'manager2@volunteerhub.com',
    fullName: 'Mike Thompson',
    role: UserRole.MANAGER,
    status: UserStatus.ACTIVE,
    createdAt: "2024-02-20T00:00:00Z",
    updatedAt: "2024-02-20T00:00:00Z",
    avatarUrl: 'https://ui-avatars.com/api/?name=Mike+Thompson&background=D97706&color=fff'
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
  },
  ...generateVolunteers()
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
    imageUrl: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&q=80&w=800",
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
  },
  {
    id: 5,
    title: "Hospital Children's Ward Art Session",
    description: "Bring joy to pediatric patients through interactive art activities. Paint, draw, and create crafts with children recovering in the hospital. Art supplies provided.",
    location: "Memorial Children's Hospital, Boston, MA",
    category: "Health",
    startDate: "2025-06-25T13:00:00Z",
    endDate: "2025-06-25T17:00:00Z",
    status: EventStatus.APPROVED,
    createdBy: 101,
    imageUrl: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800",
    createdAt: "2025-01-08T00:00:00Z",
    updatedAt: "2025-01-08T00:00:00Z",
    organizerName: "Healing Hearts Foundation",
    participantCount: 0
  },
  {
    id: 6,
    title: "Urban Tree Planting Initiative",
    description: "Help green our city by planting native trees in designated urban areas. Learn about local ecosystems and make a lasting environmental impact. All equipment and training provided.",
    location: "Riverside Park, Portland, OR",
    category: "Environment",
    startDate: "2025-06-28T07:00:00Z",
    endDate: "2025-06-28T11:00:00Z",
    status: EventStatus.APPROVED,
    createdBy: 102,
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
    createdAt: "2025-01-10T00:00:00Z",
    updatedAt: "2025-01-10T00:00:00Z",
    organizerName: "Green City Coalition",
    participantCount: 0
  },
  {
    id: 7,
    title: "Youth Literacy Tutoring Program",
    description: "Mentor elementary school students in reading and writing skills. Help build confidence and foster a love of learning in children from underserved communities.",
    location: "Lincoln Elementary School, Chicago, IL",
    category: "Education",
    startDate: "2025-07-02T15:30:00Z",
    endDate: "2025-07-02T18:00:00Z",
    status: EventStatus.APPROVED,
    createdBy: 101,
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800",
    createdAt: "2025-01-12T00:00:00Z",
    updatedAt: "2025-01-12T00:00:00Z",
    organizerName: "Read Together Initiative",
    participantCount: 0
  },
  {
    id: 8,
    title: "Homeless Shelter Meal Service",
    description: "Prepare and serve nutritious meals to individuals experiencing homelessness. Help create a welcoming atmosphere and provide dignity to those in need.",
    location: "Hope Shelter, Seattle, WA",
    category: "Community",
    startDate: "2025-06-30T17:00:00Z",
    endDate: "2025-06-30T20:00:00Z",
    status: EventStatus.APPROVED,
    createdBy: 102,
    imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",
    createdAt: "2025-01-15T00:00:00Z",
    updatedAt: "2025-01-15T00:00:00Z",
    organizerName: "Community Care Network",
    participantCount: 0
  },
  {
    id: 9,
    title: "Animal Shelter Dog Walking & Socialization",
    description: "Spend quality time with rescue dogs, providing exercise, socialization, and love. Help prepare shelter animals for their forever homes.",
    location: "Paws & Claws Animal Rescue, Austin, TX",
    category: "Community",
    startDate: "2025-07-05T09:00:00Z",
    endDate: "2025-07-05T12:00:00Z",
    status: EventStatus.APPROVED,
    createdBy: 101,
    imageUrl: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80&w=800",
    createdAt: "2025-01-18T00:00:00Z",
    updatedAt: "2025-01-18T00:00:00Z",
    organizerName: "Animal Friends Society",
    participantCount: 0
  },
  {
    id: 10,
    title: "Disaster Relief Supply Organization",
    description: "Organize emergency supplies for recent natural disaster victims. Sort, pack, and prepare essential items including food, water, clothing, and hygiene products for immediate deployment.",
    location: "Red Cross Distribution Center, Houston, TX",
    category: "Crisis Support",
    startDate: "2025-06-27T08:00:00Z",
    endDate: "2025-06-27T16:00:00Z",
    status: EventStatus.APPROVED,
    createdBy: 102,
    imageUrl: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=800",
    createdAt: "2025-01-20T00:00:00Z",
    updatedAt: "2025-01-20T00:00:00Z",
    organizerName: "Emergency Response Team",
    participantCount: 0
  },
  {
    id: 11,
    title: "Veterans Mental Health Support Workshop",
    description: "Facilitate group activities and provide companionship for military veterans dealing with PTSD and mental health challenges. Training provided for all volunteers.",
    location: "Veterans Support Center, San Diego, CA",
    category: "Health",
    startDate: "2025-07-08T13:00:00Z",
    endDate: "2025-07-08T17:00:00Z",
    status: EventStatus.APPROVED,
    createdBy: 101,
    imageUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=800",
    createdAt: "2025-01-22T00:00:00Z",
    updatedAt: "2025-01-22T00:00:00Z",
    organizerName: "Honor & Healing",
    participantCount: 0
  }
];

// Generate registrations to match participant counts
const generateRegistrations = (): Registration[] => {
  const registrations: Registration[] = [];
  let regId = 1;
  const baseDate = new Date('2025-01-05T10:00:00Z');

  // Event 1: Community Beach Cleanup - 45 participants
  const event1VolunteerIds = [201, ...Array.from({ length: 44 }, (_, i) => 300 + i)];
  for (const userId of event1VolunteerIds) {
    const regDate = new Date(baseDate.getTime() + (regId * 3600000)); // Each hour apart
    registrations.push({
      id: regId++,
      userId,
      eventId: 1,
      status: RegistrationStatus.CONFIRMED,
      registeredAt: regDate.toISOString(),
      updatedAt: regDate.toISOString()
    });
  }

  // Event 2: Senior Center Tech Support - 12 participants
  const event2VolunteerIds = Array.from({ length: 12 }, (_, i) => 344 + i);
  for (const userId of event2VolunteerIds) {
    const regDate = new Date(baseDate.getTime() + (regId * 3600000));
    registrations.push({
      id: regId++,
      userId,
      eventId: 2,
      status: RegistrationStatus.CONFIRMED,
      registeredAt: regDate.toISOString(),
      updatedAt: regDate.toISOString()
    });
  }

  // Event 3: Food Bank Sort & Pack - 28 participants
  const event3VolunteerIds = Array.from({ length: 28 }, (_, i) => 356 + i);
  for (const userId of event3VolunteerIds) {
    const regDate = new Date(baseDate.getTime() + (regId * 3600000));
    registrations.push({
      id: regId++,
      userId,
      eventId: 3,
      status: RegistrationStatus.CONFIRMED,
      registeredAt: regDate.toISOString(),
      updatedAt: regDate.toISOString()
    });
  }

  // Event 4: Charity Gala Planning Meeting - 5 participants (PENDING event)
  const event4VolunteerIds = Array.from({ length: 5 }, (_, i) => 384 + i);
  for (const userId of event4VolunteerIds) {
    const regDate = new Date(baseDate.getTime() + (regId * 3600000));
    registrations.push({
      id: regId++,
      userId,
      eventId: 4,
      status: RegistrationStatus.PENDING,
      registeredAt: regDate.toISOString(),
      updatedAt: regDate.toISOString()
    });
  }

  return registrations;
};

export const MOCK_REGISTRATIONS: Registration[] = generateRegistrations();

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
  totalVolunteers: 100,
  totalEvents: 45,
  hoursContributed: 3200
};