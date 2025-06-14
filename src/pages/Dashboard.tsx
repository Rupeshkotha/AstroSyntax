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
  CodeBracketIcon,
  UsersIcon,
  TrophyIcon,
  PlayIcon,
  PlusIcon,
  UserIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import IncomingRequests from '../components/IncomingRequests';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchProfileData = async () => {
      if (currentUser) {
        try {
          const data = await getUserProfileData(currentUser.uid);
          setProfileData(data);
        } catch (error) {
          console.error('Error fetching profile data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfileData();
  }, [currentUser]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profileData) {
    return <div>No profile data found</div>;
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Projects */}
      <div className="bg-gray-800/50 rounded-xl p-6 space-y-4 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <CodeBracketIcon className="h-6 w-6 text-blue-500 mr-3" />
            <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
          </div>
          <button
            onClick={() => setActiveTab('projects')}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profileData.projects.slice(0, 2).map((project: Project, index: number) => (
            <div key={index} className="bg-gray-700/30 rounded-lg p-6 border border-gray-600">
              <h3 className="font-semibold text-white text-lg mb-2">{project.name}</h3>
              <p className="text-gray-300 mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech: string, techIndex: number) => (
                  <span
                    key={techIndex}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHackathons = () => (
    <div className="space-y-8">
      {/* Upcoming Hackathons */}
      <div className="bg-gray-800/50 rounded-xl p-6 space-y-4 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <TrophyIcon className="h-6 w-6 text-yellow-500 mr-3" />
            <h2 className="text-xl font-semibold text-white">Upcoming Hackathons</h2>
          </div>
          <button
            className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Find Hackathons
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sample upcoming hackathon cards - replace with actual data */}
          <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white text-lg">HackMIT 2024</h3>
                <p className="text-sm text-gray-400">MIT</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                Registration Open
              </span>
            </div>
            <p className="text-gray-300 mb-4">Join MIT's annual hackathon for a weekend of innovation and collaboration.</p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span>Oct 5-7, 2024</span>
              </div>
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-1" />
                <span>Cambridge, MA</span>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200">
                Register
              </button>
              <button className="px-4 py-2 border border-gray-600 hover:border-gray-500 text-gray-300 rounded-lg transition-colors duration-200">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Past Hackathons */}
      <div className="bg-gray-800/50 rounded-xl p-6 space-y-4 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <TrophyIcon className="h-6 w-6 text-yellow-500 mr-3" />
            <h2 className="text-xl font-semibold text-white">Past Hackathons</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profileData.hackathons?.map((hackathon, index) => (
            <div key={index} className="bg-gray-700/30 rounded-lg p-6 border border-gray-600">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white text-lg">{hackathon.name}</h3>
                  <p className="text-sm text-gray-400">{hackathon.organizer}</p>
                </div>
                {hackathon.placement && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                    {hackathon.placement}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 mb-4">
                {new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}
              </p>
              {hackathon.prize && (
                <div className="flex items-center gap-2 mb-4">
                  <TrophyIcon className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400">{hackathon.prize}</span>
                </div>
              )}
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200">
                  View Project
                </button>
                <button className="px-4 py-2 border border-gray-600 hover:border-gray-500 text-gray-300 rounded-lg transition-colors duration-200">
                  View Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Navigation Tabs */}
          <div className="flex space-x-4 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('hackathons')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'hackathons'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Hackathons
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'projects'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Projects
            </button>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'hackathons' && renderHackathons()}
          {activeTab === 'projects' && (
            <div className="bg-gray-800/50 rounded-xl p-6 space-y-4 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <CodeBracketIcon className="h-6 w-6 text-blue-500 mr-3" />
                  <h2 className="text-xl font-semibold text-white">All Projects</h2>
                </div>
                <button
                  className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Project
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profileData.projects.map((project: Project, index: number) => (
                  <div key={index} className="bg-gray-700/30 rounded-lg p-6 border border-gray-600">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-white text-lg">{project.name}</h3>
                        {project.hackathonName && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-400">{project.hackathonName}</span>
                            <span className="text-gray-600">•</span>
                            <span className="text-sm text-gray-400">{project.hackathonOrganizer}</span>
                          </div>
                        )}
                      </div>
                      {project.placement && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                          {project.placement}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-300 mb-4">{project.description}</p>

                    {project.teamSize && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <UsersIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-400">Team Size: {project.teamSize}</span>
                        </div>
                      </div>
                    )}

                    {project.keyFeatures && project.keyFeatures.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Key Features:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {project.keyFeatures.map((feature: string, i: number) => (
                            <li key={i} className="text-gray-300 text-sm">{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {project.challenges && project.challenges.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Challenges Faced:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {project.challenges.map((challenge: string, i: number) => (
                            <li key={i} className="text-gray-300 text-sm">{challenge}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech: string, techIndex: number) => (
                        <span
                          key={techIndex}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      {project.demoLink && (
                        <a
                          href={project.demoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-400 hover:text-blue-300"
                        >
                          <PlayIcon className="h-4 w-4 mr-1" />
                          Live Demo
                        </a>
                      )}
                      {project.devpostLink && (
                        <a
                          href={project.devpostLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-gray-300"
                        >
                          <CodeBracketIcon className="h-4 w-4 mr-1" />
                          View on Devpost
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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