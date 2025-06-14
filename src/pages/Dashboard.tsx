import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfileData, UserProfileData, Project } from '../utils/firestoreUtils';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
  ChartBarIcon,
  UserGroupIcon,
  LightBulbIcon,
  CalendarIcon,
  BookOpenIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import IncomingRequests from '../components/IncomingRequests';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();

  if (false) {
    return <div>Loading...</div>;
  }

  if (!true) {
    return <div>No profile data found</div>;
  }

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">Welcome back!</h1>
        <p className="mt-2 text-text-secondary">Here's what's happening with your hackathon journey.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card glass border border-white/10">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <ChartBarIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Active Projects</p>
              <p className="text-2xl font-semibold text-text">0</p>
            </div>
          </div>
        </div>
        <div className="card glass border border-white/10">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white">
              <UserGroupIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Team Members</p>
              <p className="text-2xl font-semibold text-text">0</p>
            </div>
          </div>
        </div>
        <div className="card glass border border-white/10">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Upcoming Events</p>
              <p className="text-2xl font-semibold text-text">0</p>
            </div>
          </div>
        </div>
        <div className="card glass border border-white/10">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
              <BellIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Notifications</p>
              <p className="text-2xl font-semibold text-text">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid - now simplified without tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - now directly contains relevant sections */}
        <div className="space-y-8">
          {/* Active Projects */}
          <div className="card glass border border-white/10">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-text mb-4">Active Projects</h2>
              <div className="text-center py-8">
                <p className="text-text-secondary mb-4">No active projects yet</p>
                <button className="btn btn-primary">
                  Start New Project
                </button>
              </div>
            </div>
          </div>

          {/* Team Invitations */}
          <div className="card glass border border-white/10">
            <div className="p-6">
              <IncomingRequests />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* AI Idea Generator */}
          <div className="card glass border border-white/10">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-text mb-4">AI Idea Generator</h2>
              <p className="text-text-secondary mb-6">Get AI-powered hackathon project ideas tailored to your skills and interests.</p>
              <button className="btn btn-primary">
                <LightBulbIcon className="w-5 h-5 mr-2" />
                Generate Ideas
              </button>
            </div>
          </div>

          {/* Upcoming Hackathons */}
          <div className="card glass border border-white/10">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-text mb-4">Upcoming Hackathons</h2>
              <div className="text-center py-8">
                <p className="text-text-secondary mb-4">No upcoming hackathons</p>
                <Link to="/hackathons" className="btn btn-primary">
                  Browse Hackathons
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Resources */}
          <div className="card glass border border-white/10">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-text mb-4">Quick Resources</h2>
              <div className="space-y-4">
                <Link to="/dashboard/community" className="flex items-center p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-text-secondary mr-3" />
                  <span className="text-text">Community Hub</span>
                </Link>
                <a href="#" className="flex items-center p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <BookOpenIcon className="w-5 h-5 text-text-secondary mr-3" />
                  <span className="text-text">Hackathon Preparation Guide</span>
                </a>
                <a href="#" className="flex items-center p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <BookOpenIcon className="w-5 h-5 text-text-secondary mr-3" />
                  <span className="text-text">Team Formation Tips</span>
                </a>
                <a href="#" className="flex items-center p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <BookOpenIcon className="w-5 h-5 text-text-secondary mr-3" />
                  <span className="text-text">Project Presentation Templates</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;