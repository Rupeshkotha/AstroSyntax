import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, UserGroupIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { Team, createTeam, getTeam, getTeamByCode, isUserInAnyTeam, addTeamMember } from '../../utils/teamUtils';
import TeamForm from '../TeamForm';
import { useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';

interface TeamModalProps {
  hackathon: {
    id?: string;
    title: string;
  };
  isOpen: boolean;
  onClose: () => void;
  isRegisteredForThisHackathon: boolean;
  userTeamIdForThisHackathon: string | null;
}

const TeamModal: React.FC<TeamModalProps> = ({
  hackathon,
  isOpen,
  onClose,
  isRegisteredForThisHackathon,
  userTeamIdForThisHackathon
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [teamCode, setTeamCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      console.log('TeamModal: Modal opened. Resetting state.');
      setActiveTab('create');
      setTeamCode('');
      setError('');
      setSuccess('');
      setLoading(false);
    }
  }, [isOpen]);

  const handleCreateTeam = async (team: Team) => {
    console.log('TeamModal: handleCreateTeam invoked. Current loading state:', loading);
    if (loading) {
      console.log('TeamModal: Already loading, preventing duplicate invocation.');
      return;
    }
    if (!currentUser) {
      setError('You must be logged in to create a team.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const userInTeam = await isUserInAnyTeam(currentUser.uid);
      if (userInTeam) {
        setError('You are already a member of a team. You cannot create another team.');
        setLoading(false);
        return;
      }
      
      console.log('TeamModal: Team data received from TeamForm:', team);
      // The team is already created by TeamForm, so we just use the received team data
      setSuccess(`Team created successfully! Your team code is: ${team.teamCode}`);
      console.log('TeamModal: Success message set. Team code:', team.teamCode);
      console.log('TeamModal: Team created, calling onClose.');
      setTimeout(() => {
        onClose();
        console.log('TeamModal: Modal closed after delay.');
      }, 1500); // Close after 1.5 seconds
    } catch (err) {
      console.error('TeamModal: Error during team creation (after initial checks):', err);
      setError(err instanceof Error ? err.message : 'Failed to create team');
      console.log('TeamModal: Error message set.');
    } finally {
      setLoading(false);
      console.log('TeamModal: handleCreateTeam finished. Loading state reset.');
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!currentUser) {
      setError('You must be logged in to join a team.');
      setLoading(false);
      return;
    }

    if (!teamCode.trim()) {
      setError('Please enter a team code');
      setLoading(false);
      return;
    }

    try {
      const userInTeam = await isUserInAnyTeam(currentUser.uid);
      if (userInTeam) {
        setError('You are already a member of a team. You cannot join another team.');
        setLoading(false);
        return;
      }

      const teamToJoin = await getTeamByCode(teamCode);
      if (!teamToJoin) {
        setError('Invalid team code. Team not found.');
        setLoading(false);
        return;
      }

      if (teamToJoin.members.some(member => member.id === currentUser.uid)) {
        setError('You are already a member of this team.');
        setLoading(false);
        return;
      }

      if (teamToJoin.members.length >= teamToJoin.maxMembers) {
        setError('Team is full.');
        setLoading(false);
        return;
      }

      const newMember = {
        id: currentUser.uid,
        name: currentUser.displayName || 'Anonymous',
        role: 'Member',
        skills: [],
        ...(currentUser.photoURL ? { avatar: currentUser.photoURL } : {})
      };

      await addTeamMember(teamToJoin.id, newMember);
      setSuccess(`Successfully joined team ${teamToJoin.name}!`);
      onClose();
    } catch (err) {
      console.error('TeamModal: Error joining team:', err);
      setError(err instanceof Error ? err.message : 'Failed to join team');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTeam = () => {
    if (userTeamIdForThisHackathon) {
      onClose(); // Close the modal before navigating
      navigate(`/teams?teamId=${userTeamIdForThisHackathon}`);
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
                    Team Management for {hackathon.title}
                  </Dialog.Title>
                  <p className="text-gray-400">
                    {isRegisteredForThisHackathon ? (
                      'You are already part of a team for this hackathon.'
                    ) : (
                      'Create a new team or join an existing one.'
                    )}
                  </p>
                </div>

                {error && (
                  <div className="mb-4 bg-red-900/50 text-red-200 p-4 rounded-lg">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 bg-green-900/50 text-green-200 p-4 rounded-lg">
                    {success}
                  </div>
                )}

                {isRegisteredForThisHackathon ? (
                  <div className="flex justify-center mt-6">
                    <button
                      className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors duration-300 text-center font-semibold"
                      onClick={handleViewTeam}
                    >
                      View My Team
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center mb-6">
                    <Tab.Group>
                      <Tab.List className="flex space-x-1 rounded-xl bg-gray-700 p-1">
                        <Tab
                          className={({ selected }) =>
                            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-100
                              ${selected
                                ? 'bg-white text-blue-700 shadow'
                                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                              }`
                          }
                          onClick={() => setActiveTab('create')}
                        >
                          <PlusIcon className="w-5 h-5 inline-block mr-2" /> Create Team
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-100
                              ${selected
                                ? 'bg-white text-blue-700 shadow'
                                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                              }`
                          }
                          onClick={() => setActiveTab('join')}
                        >
                          <UserGroupIcon className="w-5 h-5 inline-block mr-2" /> Join Team
                        </Tab>
                      </Tab.List>
                      <Tab.Panels className="mt-2">
                        <Tab.Panel className="rounded-xl bg-gray-800 p-3 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2">
                          <TeamForm
                            onSubmit={handleCreateTeam}
                            onCancel={onClose}
                            initialData={{
                              id: '',
                              name: '',
                              description: '',
                              hackathonId: hackathon.id || '',
                              hackathonName: hackathon.title,
                              teamCode: '',
                              members: [],
                              requiredSkills: [],
                              maxMembers: 4,
                              createdAt: new Date(),
                              createdBy: currentUser?.uid || '',
                              joinRequests: []
                            }}
                            loading={loading}
                          />
                        </Tab.Panel>
                        <Tab.Panel className="rounded-xl bg-gray-800 p-3 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2">
                          <form onSubmit={handleJoinTeam} className="space-y-4">
                            <div>
                              <label htmlFor="teamCode" className="block text-sm font-medium text-gray-300 mb-2">
                                Team Code
                              </label>
                              <input
                                type="text"
                                id="teamCode"
                                value={teamCode}
                                onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                                placeholder="Enter team code"
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <button
                              type="submit"
                              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                              disabled={loading}
                            >
                              {loading ? 'Joining...' : 'Join Team'}
                            </button>
                            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                          </form>
                        </Tab.Panel>
                      </Tab.Panels>
                    </Tab.Group>
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

export default TeamModal; 