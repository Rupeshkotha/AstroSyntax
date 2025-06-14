import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, CalendarIcon, UserGroupIcon, TrophyIcon, ClockIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

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
  };
  isOpen: boolean;
  onClose: () => void;
}

const HackathonDetailsModal: React.FC<HackathonDetailsModalProps> = ({
  hackathon,
  isOpen,
  onClose,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-gray-800 p-6 shadow-xl transition-all">
                <div className="absolute top-4 right-4">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
                  {hackathon.thumbnailUrl && (
                    <img
                      src={hackathon.thumbnailUrl}
                      alt={hackathon.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                  <h2 className="absolute bottom-4 left-4 text-3xl font-bold text-white">
                    {hackathon.title}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4">Overview</h3>
                      <p className="text-gray-300">{hackathon.description}</p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4">Eligibility</h3>
                      <p className="text-gray-300">{hackathon.eligibility}</p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4">Tech Stack</h3>
                      <div className="flex flex-wrap gap-2">
                        {hackathon.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 bg-blue-500 bg-opacity-20 text-blue-400 rounded-full text-sm"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
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
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <a
                        href={hackathon.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 btn btn-primary text-center"
                      >
                        Register Now
                      </a>
                      <button className="flex-1 btn btn-secondary">
                        Share
                      </button>
                    </div>
                  </div>
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