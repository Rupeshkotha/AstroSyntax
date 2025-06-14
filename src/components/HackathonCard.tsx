import React, { useState, useEffect } from 'react';
import { CalendarIcon, CodeBracketIcon, GlobeAltIcon, UserGroupIcon, TrophyIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUserTeams } from '../utils/teamUtils';

interface HackathonCardProps {
  hackathon: {
    id?: string;
    title: string;
    startDate: string;
    endDate: string;
    location: string;
    description: string;
    registrationLink: string;
    status: 'upcoming' | 'ongoing' | 'past';
    thumbnailUrl: string;
    overview: string;
    eligibility: string;
    techStack: string[];
    timeline: string;
    teamSize: string;
    prize: string;
    platform: string;
    domain: string;
  };
  onCardClick?: () => void;
  onTeamAction?: () => void;
}

export const HackathonCard: React.FC<HackathonCardProps> = ({
  hackathon,
  onCardClick,
  onTeamAction,
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);
  const [userTeamId, setUserTeamId] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRegistration = async () => {
      if (!currentUser || !hackathon.id) {
        console.log('HackathonCard: Not checking registration. currentUser:', currentUser, 'hackathon.id:', hackathon.id);
        return;
      }
      
      console.log('HackathonCard: Checking registration for hackathon.id:', hackathon.id);

      try {
        const userTeams = await getUserTeams(currentUser.uid);
        console.log('HackathonCard: Fetched userTeams:', userTeams);
        const teamForHackathon = userTeams.find(team => team.hackathonId === hackathon.id);
        
        if (teamForHackathon) {
          console.log('HackathonCard: Found team for hackathon:', teamForHackathon);
          setIsRegistered(true);
          setUserTeamId(teamForHackathon.id);
        } else {
          console.log('HackathonCard: No team found for this hackathon.');
          setIsRegistered(false);
          setUserTeamId(null);
        }
      } catch (error) {
        console.error('HackathonCard: Error checking user registration:', error);
      }
    };

    checkUserRegistration();
  }, [currentUser, hackathon.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleViewTeam = () => {
    if (userTeamId) {
      navigate(`/teams?teamId=${userTeamId}`);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={onCardClick}
    >
      {hackathon.thumbnailUrl && (
        <div className="relative h-48">
          <img
            src={hackathon.thumbnailUrl}
            alt={hackathon.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900">{hackathon.title}</h3>
          <span className={`px-3 py-1 rounded-full text-sm ${
            hackathon.status === 'upcoming' 
              ? 'bg-green-100 text-green-800' 
              : hackathon.status === 'ongoing'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
          }`}>
            {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <CalendarIcon className="w-5 h-5 mr-2" />
            <span>{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <ClockIcon className="w-5 h-5 mr-2" />
            <span>{hackathon.timeline}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <UserGroupIcon className="w-5 h-5 mr-2" />
            <span>{hackathon.teamSize}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <TrophyIcon className="w-5 h-5 mr-2" />
            <span>{hackathon.prize}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <GlobeAltIcon className="w-5 h-5 mr-2" />
            <span>{hackathon.location}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <CodeBracketIcon className="w-5 h-5 mr-2" />
            <div className="flex flex-wrap gap-1">
              {hackathon.techStack.map((tech, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </div>
          
          <p className="text-gray-700 line-clamp-2">{hackathon.overview}</p>
          
          <div className="flex space-x-3 pt-4">
            {isRegistered ? (
              <>
                <button
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-300 text-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewTeam();
                  }}
                >
                  View Team
                </button>
                <span className="flex-1 bg-gray-100 text-gray-600 px-4 py-2 rounded-md text-center">
                  Registered
                </span>
              </>
            ) : (
              <>
                <a
                  href={hackathon.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  Register Now
                </a>
                {onTeamAction && (
                  <button
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTeamAction();
                    }}
                  >
                    Team
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 