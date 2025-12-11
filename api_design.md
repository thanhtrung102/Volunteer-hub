# VolunteerHub Database & API Design

This document outlines the database schema (designed for MySQL) and the RESTful API endpoints for the VolunteerHub application.

## 1. Database Schema

The database consists of 5 core tables. All tables include `created_at` and `updated_at` timestamps.

### 1.1 Users Table (`users`)
Stores all user accounts (Volunteers, Managers, Admins).

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT (PK) | No | Auto-incrementing User ID |
| `email` | VARCHAR(255) | No | Unique email address |
| `password_hash` | VARCHAR(255) | No | Bcrypt hashed password |
| `full_name` | VARCHAR(100) | No | Display name |
| `role` | ENUM | No | 'volunteer', 'manager', 'admin' |
| `status` | ENUM | No | 'active', 'locked' (Default: 'active') |
| `avatar_url` | VARCHAR(2048) | Yes | URL to profile image |
| `created_at` | DATETIME | No | Creation timestamp |
| `updated_at` | DATETIME | No | Last update timestamp |

### 1.2 Events Table (`events`)
Stores volunteer events managed by Event Managers.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT (PK) | No | Auto-incrementing Event ID |
| `title` | VARCHAR(255) | No | Event name |
| `description` | TEXT | No | Detailed description |
| `location` | VARCHAR(255) | No | Physical address or location name |
| `category` | VARCHAR(50) | No | e.g. 'Environment', 'Education' |
| `start_date` | DATETIME | No | Event start time |
| `end_date` | DATETIME | No | Event end time |
| `status` | ENUM | No | 'pending', 'approved', 'rejected', 'completed', 'cancelled' |
| `created_by` | INT (FK) | No | References `users.id` (Manager) |
| `image_url` | VARCHAR(2048) | Yes | Cover image URL |
| `created_at` | DATETIME | No | |
| `updated_at` | DATETIME | No | |

### 1.3 Registrations Table (`registrations`)
Links Users to Events (Many-to-Many).

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT (PK) | No | Auto-incrementing Registration ID |
| `user_id` | INT (FK) | No | References `users.id` |
| `event_id` | INT (FK) | No | References `events.id` |
| `status` | ENUM | No | 'pending', 'confirmed', 'rejected', 'cancelled', 'completed' |
| `registered_at`| DATETIME | No | |
| `updated_at` | DATETIME | No | |

### 1.4 Posts Table (`posts`)
Social feed items posted within an Event context.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT (PK) | No | Auto-incrementing Post ID |
| `event_id` | INT (FK) | No | References `events.id` |
| `user_id` | INT (FK) | No | References `users.id` (Author) |
| `content` | TEXT | No | Text content of the post |
| `image_url` | VARCHAR(2048) | Yes | Optional post image |
| `created_at` | DATETIME | No | |
| `updated_at` | DATETIME | No | |

### 1.5 Comments Table (`comments`)
Comments on Posts.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT (PK) | No | Auto-incrementing Comment ID |
| `post_id` | INT (FK) | No | References `posts.id` |
| `user_id` | INT (FK) | No | References `users.id` (Author) |
| `content` | TEXT | No | Comment text |
| `created_at` | DATETIME | No | |
| `updated_at` | DATETIME | No | |

---

## 2. API Endpoints
Base URL: `/api/v1`

### 2.1 Authentication & User Management
| Method | Endpoint | Description | Payload/Params | Access |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/auth/register` | Register new user | `{ email, password, fullName, role }` | Public |
| POST | `/auth/login` | Login | `{ email, password }` | Public |
| GET | `/auth/me` | Get current user info | - | Auth |
| GET | `/users` | List users | `?page=1&limit=10&role=volunteer` | Admin |
| GET | `/users/:id` | Get user details | - | Admin/Manager |
| PATCH | `/users/:id/status`| Lock/Unlock user | `{ status: 'locked' }` | Admin |

### 2.2 Event Management (CRUD)
| Method | Endpoint | Description | Payload/Params | Access |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/events` | List events | `?search=...&category=...&date=...` | Public |
| GET | `/events/:id` | Get event details | - | Public |
| POST | `/events` | Create event | `{ title, description, location, startDate, endDate, category, imageUrl }` | Manager |
| PUT | `/events/:id` | Update event | `{ title, description, location, startDate, endDate, category, imageUrl }` | Manager (Owner) |
| DELETE | `/events/:id` | Delete event | - | Manager (Owner) / Admin |
| PATCH | `/events/:id/status`| Approve/Reject | `{ status: 'approved' }` | Admin |

### 2.3 Registration Flow
| Method | Endpoint | Description | Payload/Params | Access |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/events/:id/register` | Register for event | - | Volunteer |
| DELETE | `/registrations/:id` | Cancel registration | - | Volunteer |
| GET | `/registrations/me` | Get my history | - | Volunteer |
| GET | `/events/:id/attendees`| List attendees | - | Manager/Admin |
| PATCH | `/registrations/:id` | Update status | `{ status: 'confirmed' }` | Manager |

### 2.4 Social Wall
| Method | Endpoint | Description | Payload/Params | Access |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/events/:id/posts` | Get event wall | - | Member (Approved) |
| POST | `/events/:id/posts` | Create post | `{ content, imageUrl }` | Member (Approved) |
| DELETE | `/posts/:id` | Delete post | - | Author/Admin |
| POST | `/posts/:id/comments` | Add comment | `{ content }` | Member (Approved) |
| DELETE | `/comments/:id` | Delete comment | - | Author/Admin |

### 2.5 Analytics & Export
| Method | Endpoint | Description | Payload/Params | Access |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/dashboard/stats` | User/Manager stats | - | Auth |
| GET | `/export/users` | Export users CSV | - | Admin |
| GET | `/export/events` | Export events CSV | - | Admin |
