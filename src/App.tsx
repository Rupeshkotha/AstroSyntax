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
import Hackathons from './pages/Hackathons';
import AdminHackathons from './pages/AdminHackathons';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Resources from './pages/Resources';
import Discussions from './pages/Discussions';
import Messages from './pages/Messages';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
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

        {/* Protected Routes */}
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
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/discussions"
          element={
            <ProtectedRoute>
              <Discussions />
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
        <Route
          path="/admin/hackathons"
          element={
            <ProtectedRoute isAdminRoute={true}>
              <Navbar />
              <AdminHackathons />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<DashboardLayout><Outlet /></DashboardLayout>}>
          <Route path="/dashboard/resources" element={<Resources />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;