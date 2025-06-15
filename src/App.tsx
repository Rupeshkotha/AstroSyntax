import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import LogIn from './pages/LogIn';
import AdminLogin from './pages/AdminLogin';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import IdeaGenerator from './pages/IdeaGenerator';
import Hackathons from './pages/Hackathons';
import AdminHackathons from './pages/AdminHackathons';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Resources from './pages/Resources';
import CommunityHub from './components/community/CommunityHub';
import WriteBlog from './components/community/WriteBlog';
import Discussions from './pages/Discussions';
import Messages from './pages/Messages';
import { NotificationProvider } from './contexts/NotificationContext';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <NotificationProvider>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <Home />
              </>
            }
          />
          <Route
            path="/signup"
            element={
              <>
                <Navbar />
                <SignUp />
              </>
            }
          />
          <Route
            path="/login"
            element={
              <>
                <Navbar />
                <LogIn />
              </>
            }
          />
          <Route
            path="/admin-login"
            element={
              <>
                <Navbar />
                <AdminLogin />
              </>
            }
          />

          {/* Protected Routes with Navbar */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Navbar />
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <Navbar />
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/discussions"
            element={
              <ProtectedRoute>
                <Navbar />
                <Discussions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Navbar />
                <Messages />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <Navbar />
                <Teams />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ideagenerator"
            element={
              <ProtectedRoute>
                <Navbar />
                <IdeaGenerator />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hackathons"
            element={
              <ProtectedRoute>
                <Navbar />
                <Hackathons />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <Navbar />
                <Resources />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hackathons"
            element={
              <ProtectedRoute isAdminRoute={true}>
                <Navbar />
                <AdminHackathons />
              </ProtectedRoute>
            }
          />
          
          {/* Main Navigation Pages (Top Navbar Only) */}
          <Route
            path="/discussions"
            element={
              <ProtectedRoute>
                <Navbar />
                <Discussions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <Navbar />
                <Resources />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <Navbar />
                <Teams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hackathons"
            element={
              <ProtectedRoute>
                <Navbar />
                <Hackathons />
              </ProtectedRoute>
            }
          />

          {/* Dashboard and Sidebar Layout */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Outlet />
                </DashboardLayout>
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="overview" element={<Dashboard />} />
            {/* Add other dashboard subroutes here */}
          </Route>

          {/* Protected Community Routes (without DashboardLayout) */}
          <Route
            path="/dashboard/community"
            element={
              <ProtectedRoute>
                <CommunityHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/community/write"
            element={
              <ProtectedRoute>
                <WriteBlog />
              </ProtectedRoute>
            }
          />
        </Routes>
      </NotificationProvider>
    </Router>
  );
};

export default App;