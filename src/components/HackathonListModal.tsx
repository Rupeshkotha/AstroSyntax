import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Hackathon } from '../utils/types';
import { HackathonCard } from './HackathonCard';

interface HackathonListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  hackathons: Hackathon[];
}

const HackathonListModal: React.FC<HackathonListModalProps> = ({
  isOpen,
  onClose,
  title,
  hackathons,
}) => {
  // This is a no-op comment to trigger recompilation and refresh module resolution.
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

                <Dialog.Title as="h3" className="text-2xl font-bold text-white mb-6">
                  {title}
                </Dialog.Title>

                {hackathons.length === 0 ? (
                  <p className="text-gray-400">No hackathons to display in this category.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hackathons.map((hackathon) => (
                      <HackathonCard
                        key={hackathon.id || `hackathon-${Math.random()}`}
                        hackathon={{
                          id: (hackathon.id || '') as string,
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
                      />
                    ))}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default HackathonListModal; 