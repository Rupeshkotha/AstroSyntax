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
      if (!currentUser || !hackathon.id) return;
      
      try {
        const userTeams = await getUserTeams(currentUser.uid);
        const teamForHackathon = userTeams.find(team => team.hackathonId === hackathon.id);
        
        if (teamForHackathon) {
          setIsRegistered(true);
          setUserTeamId(teamForHackathon.id);
        } else {
          setIsRegistered(false);
          setUserTeamId(null);
        }
      } catch (error) {
        console.error('Error checking user registration:', error);
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
      className="relative group bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] cursor-pointer"
      onClick={onCardClick}
    >
      {/* Glowing background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {hackathon.thumbnailUrl && (
        <div className="relative h-48">
          <img
            src={hackathon.thumbnailUrl}
            alt={hackathon.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        </div>
      )}

      <div className="p-6 relative">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
            {hackathon.title}
          </h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            hackathon.status === 'upcoming' 
              ? 'bg-green-500/20 text-green-400' 
              : hackathon.status === 'ongoing'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-slate-500/20 text-slate-400'
          }`}>
            {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
          </span>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-slate-300">
            <CalendarIcon className="w-5 h-5 mr-2 text-indigo-400" />
            <span>{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</span>
          </div>
          
          <div className="flex items-center text-slate-300">
            <ClockIcon className="w-5 h-5 mr-2 text-indigo-400" />
            <span>{hackathon.timeline}</span>
          </div>

          <div className="flex items-center text-slate-300">
            <UserGroupIcon className="w-5 h-5 mr-2 text-indigo-400" />
            <span>{hackathon.teamSize}</span>
          </div>

          <div className="flex items-center text-slate-300">
            <TrophyIcon className="w-5 h-5 mr-2 text-indigo-400" />
            <span>{hackathon.prize}</span>
          </div>
          
          <div className="flex items-center text-slate-300">
            <GlobeAltIcon className="w-5 h-5 mr-2 text-indigo-400" />
            <span>{hackathon.location}</span>
          </div>

          <div className="flex items-center text-slate-300">
            <CodeBracketIcon className="w-5 h-5 mr-2 text-indigo-400" />
            <div className="flex flex-wrap gap-1">
              {hackathon.techStack.map((tech, index) => (
                <span key={index} className="bg-slate-800/50 text-slate-300 px-2 py-1 rounded-md text-sm border border-slate-700">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <p className="text-slate-400 line-clamp-2 mb-6">{hackathon.overview}</p>
        
        <div className="flex gap-3">
          {isRegistered ? (
            <>
              <button
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 text-center font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewTeam();
                }}
              >
                View Team
              </button>
              <span className="flex-1 bg-slate-800/50 text-slate-400 px-4 py-2 rounded-lg text-center font-medium border border-slate-700">
                Registered
              </span>
            </>
          ) : (
            <>
              <a
                href={hackathon.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 text-center font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                Register Now
              </a>
              {onTeamAction && (
                <button
                  className="flex-1 bg-slate-800/50 text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-800 transition-all duration-300 font-medium border border-slate-700"
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
  );
}; 