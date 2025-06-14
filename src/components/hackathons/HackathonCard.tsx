import React from 'react';
import { CalendarIcon, CodeBracketIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

interface HackathonCardProps {
  hackathon: {
    id: number;
    title: string;
    startDate: string;
    endDate: string;
    domain: string;
    platform: string;
    registrationLink: string;
    image: string;
  };
  onCardClick: () => void;
  onTeamAction: () => void;
}

const HackathonCard: React.FC<HackathonCardProps> = ({
  hackathon,
  onCardClick,
  onTeamAction,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      onClick={onCardClick}
    >
      <div className="relative h-48">
        <img
          src={hackathon.image}
          alt={hackathon.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-white">{hackathon.title}</h3>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-300">
            <CalendarIcon className="w-5 h-5 mr-2" />
            <span>{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</span>
          </div>
          
          <div className="flex items-center text-gray-300">
            <CodeBracketIcon className="w-5 h-5 mr-2" />
            <span>{hackathon.domain}</span>
          </div>
          
          <div className="flex items-center text-gray-300">
            <GlobeAltIcon className="w-5 h-5 mr-2" />
            <span>{hackathon.platform}</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <a
            href={hackathon.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 btn btn-primary text-center"
            onClick={(e) => e.stopPropagation()}
          >
            Register
          </a>
          <button
            className="flex-1 btn btn-secondary"
            onClick={(e) => {
              e.stopPropagation();
              onTeamAction();
            }}
          >
            Team
          </button>
        </div>
      </div>
    </div>
  );
};

export default HackathonCard; 