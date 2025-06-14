import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, UserGroupIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { Team, createTeam, getTeam, getTeamByCode, isUserInAnyTeam, addTeamMember } from '../../utils/teamUtils';
import TeamForm from '../TeamForm';

interface TeamModalProps {
  hackathon: {
    id: string;
    title: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const TeamModal: React.FC<TeamModalProps> = ({ hackathon, isOpen, onClose }) => {
  const { currentUser } = useAuth();
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
                    Team Management
                  </Dialog.Title>
                  <p className="text-gray-400">
                    Create a new team or join an existing one for {hackathon.title}
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

                <div className="flex space-x-4 mb-6">
                  <button
                    className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 ${
                      activeTab === 'create'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    onClick={() => setActiveTab('create')}
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>Create Team</span>
                  </button>
                  <button
                    className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 ${
                      activeTab === 'join'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    onClick={() => setActiveTab('join')}
                  >
                    <UserGroupIcon className="w-5 h-5" />
                    <span>Join Team</span>
                  </button>
                </div>

                {activeTab === 'create' ? (
                  <TeamForm
                    onSubmit={handleCreateTeam}
                    onCancel={onClose}
                    initialData={{
                      id: '',
                      name: '',
                      description: '',
                      hackathonId: hackathon.id,
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
                ) : (
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
                      disabled={loading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : null}
                      Join Team
                    </button>
                  </form>
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