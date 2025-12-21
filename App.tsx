import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { UserRole } from './types';
import Loading from './components/Loading';

// Lazy load pages to optimize initial bundle size (Performance Criteria)
const Home = lazy(() => import('./pages/Home'));
const Events = lazy(() => import('./pages/Events'));
const EventDetails = lazy(() => import('./pages/EventDetails'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const SystemTests = lazy(() => import('./pages/SystemTests'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ManageEvent = lazy(() => import('./pages/ManageEvent'));
const EventRegistrations = lazy(() => import('./pages/EventRegistrations'));
const NotFound = lazy(() => import('./pages/NotFound'));

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              
              {/* Public Routes */}
              <Route path="events" element={<Events />} />
              <Route path="events/:id" element={<EventDetails />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route 
                path="admin" 
                element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="admin/tests" 
                element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <SystemTests />
                  </ProtectedRoute>
                } 
              />

              {/* Manager/Admin Routes */}
              <Route 
                path="events/new" 
                element={
                  <ProtectedRoute allowedRoles={[UserRole.MANAGER, UserRole.ADMIN]}>
                    <ManageEvent />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="events/:id/edit" 
                element={
                  <ProtectedRoute allowedRoles={[UserRole.MANAGER, UserRole.ADMIN]}>
                    <ManageEvent />
                  </ProtectedRoute>
                } 
              />
               <Route 
                path="events/:id/registrations" 
                element={
                  <ProtectedRoute allowedRoles={[UserRole.MANAGER, UserRole.ADMIN]}>
                    <EventRegistrations />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;