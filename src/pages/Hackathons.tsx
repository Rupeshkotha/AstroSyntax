import React, { useEffect, useState } from 'react';
import { Tab } from '@headlessui/react';
import { useAuth } from '../contexts/AuthContext';
import { HackathonCard } from '../components/HackathonCard';
import HackathonFilters from '../components/hackathons/HackathonFilters';
import HackathonDetailsModal from '../components/hackathons/HackathonDetailsModal';
import TeamModal from '../components/hackathons/TeamModal';
import { getAllHackathons, getHackathonStatus } from '../utils/hackathonUtils';
import { Hackathon } from '../utils/types';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { getUserTeams } from '../utils/teamUtils';

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
    status: '' // Change default status filter from 'upcoming' to ''
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center shadow-md hover:bg-blue-700 transition-colors duration-200"
        >
          <FunnelIcon className="w-5 h-5 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {showFilters && (
          <div className="md:col-span-1">
            <HackathonFilters onFilterChange={handleFilterChange} />
          </div>
        )}
        <div className={showFilters ? "md:col-span-3" : "md:col-span-4"}>
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Hackathons</h2>
            {filteredAndDisplayedHackathons.length === 0 ? (
              <p className="text-gray-600">No hackathons to display for the selected filter.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndDisplayedHackathons.map(hackathon => (
                  <HackathonCard
                    key={hackathon.id || `hackathon-${Math.random()}`}
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
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {selectedHackathon && (
        <HackathonDetailsModal
          hackathon={selectedHackathon}
          isOpen={!!selectedHackathon}
          onClose={() => {
            console.log('Closing modal, selectedHackathon:', selectedHackathon);
            console.log('Selected Hackathon data passed to modal:', selectedHackathon);
            setSelectedHackathon(null);
            setIsHackathonRegistered(false); // Reset status when modal closes
            setCurrentUsersTeamId(null); // Reset team ID when modal closes
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