import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, CalendarIcon, UserGroupIcon, TrophyIcon, ClockIcon, GlobeAltIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface HackathonDetailsModalProps {
  hackathon: {
    title: string;
    startDate: string;
    endDate: string;
    domain: string;
    platform: string;
    registrationLink: string;
    description: string;
    eligibility: string;
    prize: string;
    timeline: string;
    teamSize: string;
    techStack: string[];
    thumbnailUrl: string;
    status: 'upcoming' | 'ongoing' | 'past';
    overview: string;
  };
  isOpen: boolean;
  onClose: () => void;
  isRegistered: boolean;
  userTeamId: string | null;
  onTeamAction: (hackathon: any) => void;
}

const HackathonDetailsModal: React.FC<HackathonDetailsModalProps> = ({
  hackathon,
  isOpen,
  onClose,
  isRegistered,
  userTeamId,
  onTeamAction
}) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleViewTeam = () => {
    if (userTeamId) {
      onClose(); // Close the modal before navigating
      navigate(`/teams?teamId=${userTeamId}`);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gray-800 p-6 shadow-xl transition-all">
                <div className="absolute top-4 right-4">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <Dialog.Title as="h3" className="text-2xl font-bold text-white mb-2">
                    {hackathon.title}
                  </Dialog.Title>
                  <p className="text-gray-400">
                    {hackathon.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <img
                      src={hackathon.thumbnailUrl}
                      alt={hackathon.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <CalendarIcon className="w-5 h-5 text-blue-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-400">Date</p>
                            <p className="text-white">
                              {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <ClockIcon className="w-5 h-5 text-blue-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-400">Timeline</p>
                            <p className="text-white">{hackathon.timeline}</p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <GlobeAltIcon className="w-5 h-5 text-blue-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-400">Platform</p>
                            <p className="text-white">{hackathon.platform}</p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <UserGroupIcon className="w-5 h-5 text-blue-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-400">Team Size</p>
                            <p className="text-white">{hackathon.teamSize}</p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <TrophyIcon className="w-5 h-5 text-blue-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-400">Prize</p>
                            <p className="text-white">{hackathon.prize}</p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <CodeBracketIcon className="w-5 h-5 text-blue-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-400">Tech Stack</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {hackathon.techStack.map((tech, index) => (
                                <span key={index} className="bg-blue-600/20 text-blue-200 px-3 py-1 rounded-full text-xs font-medium">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-xl font-bold text-white mb-2">Overview</h4>
                  <p className="text-gray-300">{hackathon.overview}</p>
                </div>

                <div className="mb-6">
                  <h4 className="text-xl font-bold text-white mb-2">Eligibility</h4>
                  <p className="text-gray-300">{hackathon.eligibility}</p>
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                  {isRegistered ? (
                    <>
                      <button
                        className="flex-1 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors duration-300 text-center font-semibold"
                        onClick={handleViewTeam}
                      >
                        View Team
                      </button>
                      <span className="flex-1 bg-gray-700 text-gray-300 px-6 py-3 rounded-md text-center font-semibold flex items-center justify-center">
                        Registered
                      </span>
                    </>
                  ) : (
                    <>
                      <a
                        href={hackathon.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-300 text-center font-semibold"
                        onClick={(e) => onClose()} // Close modal when navigating to external link
                      >
                        Register Now
                      </a>
                      <button
                        type="button"
                        className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors duration-300 text-center font-semibold"
                        onClick={() => {
                          onClose(); // Close the details modal first
                          onTeamAction(hackathon); // Then trigger the team action
                        }}
                      >
                        Team
                      </button>
                    </>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default HackathonDetailsModal; 