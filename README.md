# VolunteerHub 🤝

A comprehensive volunteer management platform built with React, TypeScript, and modern web technologies. This application connects volunteers with charitable organizations, manages events, and tracks volunteer activities.

![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-06B6D4)
![Vite](https://img.shields.io/badge/Vite-6.4.1-646CFF)

## ✨ Features

### 👥 Three User Roles

#### 🙋 Volunteer
- Secure account registration and login
- Discover and filter events by category, location, and date
- Register for events with real-time confirmations
- Web Push notifications for updates
- Social features: posts, comments, and likes on event channels
- Personal dashboard with activity tracking
- Profile management

#### 👔 Event Manager
- Create, edit, and delete events with comprehensive validation
- Approve or reject volunteer registrations
- Mark participants as completed
- Export participant lists (CSV)
- Dashboard with event analytics
- Manage event discussion channels
- Profile management

#### 👨‍💼 Administrator
- Approve or reject new events
- Lock/unlock user accounts
- Export system data (CSV)
- System-wide dashboard overview
- Full access to all features

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Modern browser (Chrome, Edge, Firefox)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/volunteerhub.git
cd volunteerhub

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser to `http://localhost:3001`

### Build for Production

```bash
npm run build
npm run preview
```

## 🔑 Demo Accounts

All demo accounts use the password: `demo123`

| Role | Email | Name |
|------|-------|------|
| Admin | admin@volunteerhub.com | Admin User |
| Manager | manager@volunteerhub.com | Sarah Manager |
| Manager | manager2@volunteerhub.com | Mike Thompson |
| Volunteer | volunteer@volunteerhub.com | Alex Volunteer |

**Plus 100 additional volunteer accounts** with emails like `emma.smith@volunteer.com`

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Routing:** React Router v6
- **Validation:** Yup
- **Build Tool:** Vite
- **Database:** IndexedDB (client-side)
- **Security:** SHA-256 password hashing, JWT tokens

## 📚 Documentation

- [Architecture Guide](./ARCHITECTURE.md) - System design patterns
- [Grading Checklist](./GRADING_CHECKLIST.md) - Implementation compliance
- [Security Implementation](./SECURITY_IMPLEMENTATION.md) - Security features
- [Demo Presentation Plan](./DEMO_PRESENTATION_PLAN.md) - Presentation guide

## 🔒 Security Features

✅ SHA-256 password hashing with salt
✅ JWT authentication
✅ XSS protection
✅ CSRF tokens
✅ Role-based access control
✅ HTTPS enforcement

## 📈 Performance

- Bundle size: 310 KB (97 KB gzipped)
- 15 lazy-loaded components
- Real-time updates every 10-15s
- Code splitting with Vite

## 🧪 Testing

**Clear database for fresh start:**
```javascript
// Open browser console (F12)
localStorage.clear();
indexedDB.deleteDatabase('VolunteerHubDB');
location.reload();
```

## 📞 Contact

Academic project for Web Application Development course.

---

**Built with ❤️ using React + TypeScript**
*Making a difference, together* 🤝
