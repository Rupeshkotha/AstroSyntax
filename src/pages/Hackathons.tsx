import React, { useEffect, useState } from 'react';
import { Tab } from '@headlessui/react';
import { useAuth } from '../contexts/AuthContext';
import { HackathonCard } from '../components/HackathonCard';
import HackathonFilters from '../components/hackathons/HackathonFilters';
import HackathonDetailsModal from '../components/hackathons/HackathonDetailsModal';
import TeamModal from '../components/hackathons/TeamModal';
import { getAllHackathons, getHackathonStatus } from '../utils/hackathonUtils';
import { Hackathon } from '../utils/types';
import { FunnelIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { getUserTeams } from '../utils/teamUtils';
import { motion, AnimatePresence } from 'framer-motion';

export const Hackathons: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    techStack: '',
    duration: '',
    platform: '',
    location: '',
    domain: '',
    status: ''
  });
  const [upcomingHackathons, setUpcomingHackathons] = useState<Hackathon[]>([]);
  const [pastHackathons, setPastHackathons] = useState<Hackathon[]>([]);
  const [ongoingHackathons, setOngoingHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHackathonRegistered, setIsHackathonRegistered] = useState(false);
  const [currentUsersTeamId, setCurrentUsersTeamId] = useState<string | null>(null);

  const handleFilterChange = (newFilters: any) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  const handleHackathonClick = async (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon);
    // Check if the current user is registered for THIS hackathon
    if (currentUser && hackathon.id) {
      try {
        const userTeams = await getUserTeams(currentUser.uid);
        const teamForThisHackathon = userTeams.find(team => team.hackathonId === hackathon.id);
        if (teamForThisHackathon) {
          setIsHackathonRegistered(true);
          setCurrentUsersTeamId(teamForThisHackathon.id);
        } else {
          setIsHackathonRegistered(false);
          setCurrentUsersTeamId(null);
        }
      } catch (err) {
        console.error('Error checking hackathon registration status:', err);
        setIsHackathonRegistered(false);
        setCurrentUsersTeamId(null);
      }
    }
  };

  const handleTeamAction = (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon);
    setIsTeamModalOpen(true);
  };

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      const all = await getAllHackathons();
      
      const upcoming: Hackathon[] = [];
      const ongoing: Hackathon[] = [];
      const past: Hackathon[] = [];

      all.forEach(hackathon => {
        const status = getHackathonStatus(hackathon);
        if (status === 'upcoming') {
          upcoming.push(hackathon);
        } else if (status === 'ongoing') {
          ongoing.push(hackathon);
        } else {
          past.push(hackathon);
        }
      });

      setUpcomingHackathons(upcoming);
      setPastHackathons(past);
      setOngoingHackathons(ongoing);

      console.log('Fetched All Hackathons:', all);
      console.log('Categorized Upcoming Hackathons:', upcoming);
      console.log('Categorized Ongoing Hackathons:', ongoing);
      console.log('Categorized Past Hackathons:', past);
      setError(null);
    } catch (err) {
      console.error('Error fetching hackathons:', err);
      setError('Failed to fetch hackathons. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  const allHackathons = [...upcomingHackathons, ...ongoingHackathons, ...pastHackathons];

  const filteredAndDisplayedHackathons = allHackathons.filter(hackathon => {
    // Dynamically determine status for filtering
    const currentStatus = getHackathonStatus(hackathon);

    // Filter by status
    if (filters.status && currentStatus !== filters.status) {
      return false;
    }
    // Filter by Tech Stack
    if (filters.techStack && !hackathon.techStack.map(t => t.toLowerCase()).includes(filters.techStack.toLowerCase())) {
      return false;
    }
    // Filter by Duration
    if (filters.duration && hackathon.timeline !== filters.duration) {
      return false;
    }
    // Filter by Platform
    if (filters.platform && hackathon.platform.toLowerCase() !== filters.platform.toLowerCase()) {
      return false;
    }
    // Filter by Location
    if (filters.location && !hackathon.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    // Filter by Domain
    if (filters.domain && !hackathon.domain.toLowerCase().includes(filters.domain.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-400">Loading hackathons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
            Discover Hackathons
          </h1>
          <p className="text-gray-400 text-lg">
            Find and join exciting hackathons that match your interests
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl"
          >
            {error}
          </motion.div>
        )}

        <div className="flex justify-end mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-800/50 text-gray-300 px-6 py-3 rounded-xl flex items-center gap-2 border border-gray-700 hover:bg-gray-800 transition-all duration-300"
          >
            <FunnelIcon className="w-5 h-5" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="md:col-span-1"
              >
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <HackathonFilters onFilterChange={handleFilterChange} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${showFilters ? 'md:col-span-3' : 'md:col-span-4'}`}
          >
            <section className="space-y-6">
              {filteredAndDisplayedHackathons.length === 0 ? (
                <div className="text-center py-12">
                  <SparklesIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No hackathons found matching your criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndDisplayedHackathons.map((hackathon, index) => (
                    <motion.div
                      key={hackathon.id || `hackathon-${Math.random()}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <HackathonCard
                        hackathon={{
                          id: hackathon.id || '',
                          title: hackathon.title,
                          startDate: hackathon.startDate,
                          endDate: hackathon.endDate,
                          location: hackathon.location,
                          description: hackathon.description,
                          registrationLink: hackathon.registrationLink,
                          status: hackathon.status,
                          thumbnailUrl: hackathon.thumbnailUrl,
                          overview: hackathon.overview,
                          eligibility: hackathon.eligibility,
                          techStack: hackathon.techStack,
                          timeline: hackathon.timeline,
                          teamSize: hackathon.teamSize,
                          prize: hackathon.prize,
                          platform: hackathon.platform,
                          domain: hackathon.domain
                        }}
                        onCardClick={() => handleHackathonClick(hackathon)}
                        onTeamAction={() => handleTeamAction(hackathon)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </motion.div>
        </div>
      </div>

      {selectedHackathon && (
        <HackathonDetailsModal
          hackathon={selectedHackathon}
          isOpen={!!selectedHackathon}
          onClose={() => {
            setSelectedHackathon(null);
            setIsHackathonRegistered(false);
            setCurrentUsersTeamId(null);
          }}
          isRegistered={isHackathonRegistered}
          userTeamId={currentUsersTeamId}
          onTeamAction={handleTeamAction}
        />
      )}

      {isTeamModalOpen && selectedHackathon && (
        <TeamModal
          hackathon={selectedHackathon}
          isOpen={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
          isRegisteredForThisHackathon={isHackathonRegistered}
          userTeamIdForThisHackathon={currentUsersTeamId}
        />
      )}
    </div>
  );
};

export default Hackathons; 