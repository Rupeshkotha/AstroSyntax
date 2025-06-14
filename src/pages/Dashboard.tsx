import React, { useState, useEffect } from 'react';
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
import { getAllHackathons, getHackathonStatus } from '../utils/hackathonUtils';
import { getUserTeams } from '../utils/teamUtils';
import { Hackathon } from '../utils/types';
import HackathonListModal from '../components/HackathonListModal';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [totalHackathonsCount, setTotalHackathonsCount] = useState(0);
  const [registeredHackathonsCount, setRegisteredHackathonsCount] = useState(0);
  const [completedHackathonsCount, setCompletedHackathonsCount] = useState(0);
  const [registeredHackathonsList, setRegisteredHackathonsList] = useState<Hackathon[]>([]);
  const [completedHackathonsList, setCompletedHackathonsList] = useState<Hackathon[]>([]);
  const [showHackathonListModal, setShowHackathonListModal] = useState(false);
  const [hackathonListModalTitle, setHackathonListModalTitle] = useState('');
  const [currentHackathonsToDisplay, setCurrentHackathonsToDisplay] = useState<Hackathon[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (currentUser) {
          const profile = await getUserProfileData(currentUser.uid);
          setUserProfile(profile);
        }

        const allHackathons = await getAllHackathons();
        setTotalHackathonsCount(allHackathons.length);

        const registered: Hackathon[] = [];
        const completed: Hackathon[] = [];

        if (currentUser) {
          const userTeams = await getUserTeams(currentUser.uid);

          allHackathons.forEach(hackathon => {
            const status = getHackathonStatus(hackathon);
            if (status === 'past') {
              completed.push(hackathon);
            }
            // Check if user is registered for this hackathon
            const isRegistered = userTeams.some(team => team.hackathonId === hackathon.id);
            if (isRegistered) {
              registered.push(hackathon);
            }
          });
        }
        setRegisteredHackathonsList(registered);
        setRegisteredHackathonsCount(registered.length);
        setCompletedHackathonsList(completed);
        setCompletedHackathonsCount(completed.length);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleOpenHackathonListModal = (title: string, hackathons: Hackathon[]) => {
    setHackathonListModalTitle(title);
    setCurrentHackathonsToDisplay(hackathons);
    setShowHackathonListModal(true);
  };

  const handleCloseHackathonListModal = () => {
    setShowHackathonListModal(false);
    setHackathonListModalTitle('');
    setCurrentHackathonsToDisplay([]);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen-75">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center text-red-500 mt-8">
          <p>{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">Welcome back{userProfile?.name ? `, ${userProfile.name}` : ''}!</h1>
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
              <p className="text-sm font-medium text-text-secondary">Total Hackathons</p>
              <p className="text-2xl font-semibold text-text">{totalHackathonsCount}</p>
            </div>
          </div>
        </div>
        <div
          className="card glass border border-white/10 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => handleOpenHackathonListModal('Registered Hackathons', registeredHackathonsList)}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white">
              <UserGroupIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Registered Hackathons</p>
              <p className="text-2xl font-semibold text-text">{registeredHackathonsCount}</p>
            </div>
          </div>
        </div>
        <div
          className="card glass border border-white/10 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => handleOpenHackathonListModal('Completed Hackathons', completedHackathonsList)}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Completed Hackathons</p>
              <p className="text-2xl font-semibold text-text">{completedHackathonsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Team Invitations */}
          <div className="card glass border border-white/10">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-text mb-4">Team Invitations</h2>
              <IncomingRequests />
            </div>
          </div>
        </div>

        {/* Right Column - This column will be empty after removals, consider adjusting grid layout if no other content is intended */}
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

      {/* Hackathon List Modal */}
      <HackathonListModal
        isOpen={showHackathonListModal}
        onClose={handleCloseHackathonListModal}
        title={hackathonListModalTitle}
        hackathons={currentHackathonsToDisplay}
      />
    </DashboardLayout>
  );
};

export default Dashboard;