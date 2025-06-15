import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Team, getUserTeams, getAvailableTeams, deleteTeam, addTeamMember, removeTeamMember, getTeamByCode, TeamMember, getTeam, addJoinRequest, acceptJoinRequest, rejectJoinRequest, getTeamsWithJoinRequestFromUser, removeJoinRequest } from '../utils/teamUtils';
import TeamForm from '../components/TeamForm';
import TeamCard from '../components/TeamCard';
import { getUserProfileData } from '../utils/firestoreUtils';
import SkillMatch from '../components/SkillMatch';
import { query, collection, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import TeamChat from '../components/TeamChat';
import { PlusIcon, UserGroupIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Teams: React.FC = () => {
  const { currentUser } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [teamCode, setTeamCode] = useState('');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [showSkillMatch, setShowSkillMatch] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Team[]>([]);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatTeam, setChatTeam] = useState<Team | null>(null);

  const loadTeams = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      let teamsData: Team[] = [];
      const uniqueTeamIds = new Set<string>(); // Track unique team IDs
      
      if (currentUser) {
        // Get teams where user is a member
        const userTeams = await getUserTeams(currentUser.uid);
        userTeams.forEach(team => {
          if (!uniqueTeamIds.has(team.id)) {
            uniqueTeamIds.add(team.id);
            teamsData.push(team);
          }
        });
        
        // Get available teams (where user is not a member)
        const availableTeams = await getAvailableTeams();
        availableTeams.forEach(team => {
          if (!uniqueTeamIds.has(team.id)) {
            uniqueTeamIds.add(team.id);
            teamsData.push(team);
          }
        });
      } else {
        // If not logged in, just get all teams
        const availableTeams = await getAvailableTeams();
        availableTeams.forEach(team => {
          if (!uniqueTeamIds.has(team.id)) {
            uniqueTeamIds.add(team.id);
            teamsData.push(team);
          }
        });
      }
      
      setTeams(teamsData);
    } catch (err) {
      setError('Failed to load teams');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const loadPendingRequests = useCallback(async () => {
    if (!currentUser) return;
    try {
      const teams = await getTeamsWithJoinRequestFromUser(currentUser.uid);
      setPendingRequests(teams);
    } catch (err) {
      console.error('Error loading pending requests:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    loadTeams();
    if (currentUser) {
      loadPendingRequests();
    }
  }, [currentUser, loadTeams, loadPendingRequests]);

  const handleCreateTeam = (team: Team) => {
    // Just close the modal and reload teams. loadTeams will fetch the newly created team.
    setShowCreateModal(false);
    loadTeams();
  };

  const handleEditTeam = async (team: Team) => {
    try {
      // Close the modal
      setEditingTeam(null);
      
      // Fetch the latest team data
      const updatedTeam = await getTeam(team.id);
      if (!updatedTeam) {
        throw new Error('Failed to fetch updated team');
      }

      // Update the teams list with the new data
      setTeams(prevTeams => {
        const index = prevTeams.findIndex(t => t.id === updatedTeam.id);
        if (index !== -1) {
          const newTeams = [...prevTeams];
          newTeams[index] = updatedTeam;
          return newTeams;
        }
        return prevTeams;
      });
    } catch (err) {
      console.error('Error updating team:', err);
      setError('Failed to update team');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteTeam(teamId);
      // After deleting, reload the teams
      loadTeams();
    } catch (err) {
      setError('Failed to delete team');
      console.error(err);
    }
  };

  // New function for direct joining (via code)
  const handleDirectJoinTeam = async (team: Team) => {
    if (!currentUser) {
        setError('You must be logged in to join a team.');
        return;
    }
    setError('');
    try {
      if (team.members.some(member => member.id === currentUser.uid)) {
         setError('You are already a member of this team.');
         return;
      }

      if (team.members.length >= team.maxMembers) {
           setError('Team is full.');
           return;
      }

      const newMember: TeamMember = {
        id: currentUser.uid,
        name: currentUser.displayName || 'Anonymous',
        role: 'Member',
        skills: [],
        avatar: currentUser.photoURL || undefined
      };

      await addTeamMember(team.id, newMember);
      await loadTeams(); // Reload after successful join

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join team');
      console.error(err);
    }
  };

  // Modified function for requesting to join (via button on card)
  const handleRequestToJoinTeam = async (team: Team) => {
    if (!currentUser) {
      setError('You must be logged in to request to join a team.');
      return;
    }
    setError('');
    try {
      // First check if user is already in any team
      const teamsQuery = query(
        collection(db, 'teams')
      );
      const teamsSnapshot = await getDocs(teamsQuery);
      
      // Check if user is in any team (either as lead or member)
      for (const doc of teamsSnapshot.docs) {
        const teamData = doc.data() as Team;
        if (teamData.members && teamData.members.some(member => member.id === currentUser.uid)) {
          setError('You are already a member of a team. You cannot send join requests while being part of another team.');
          return;
        }
      }

      // Check if already a member or already requested
      if (team.members.some(member => member.id === currentUser.uid)) {
        setError('You are already a member of this team.');
        return;
      }
      if (team.joinRequests && team.joinRequests.includes(currentUser.uid)) {
        setError('You have already requested to join this team.');
        return;
      }

      await addJoinRequest(team.id, currentUser.uid);
      await loadPendingRequests(); // Reload pending requests after sending new request

      // Explicitly fetch the updated team document
      const updatedTeam = await getTeam(team.id);

      if(updatedTeam) {
        setTeams(prevTeams => {
          const index = prevTeams.findIndex(t => t.id === updatedTeam.id);
          if (index !== -1) {
            const newTeams = [...prevTeams];
            newTeams[index] = updatedTeam;
            return newTeams;
          } else {
            return [...prevTeams, updatedTeam];
          }
        });
      } else {
        await loadTeams();
      }

      setError('Request to join sent successfully!');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send join request';
      setError(errorMessage);
      console.error(err);
    }
  };

  const handleLeaveTeam = async (team: Team) => {
    if (!currentUser) {
         setError('You must be logged in to leave a team.');
         return;
    }
     // Clear any previous errors when starting a leave action
    setError('');
    try {
      await removeTeamMember(team.id, currentUser.uid);

      // After leaving, reload teams
      await loadTeams();
    } catch (err) {
      setError('Failed to leave team');
      console.error(err);
    }
  };

  // Handle accepting a join request
  const handleAcceptRequest = async (teamId: string, memberId: string) => {
    if (!currentUser) {
      setError('You must be logged in to accept a join request.');
      return;
    }
    setError('');
    try {
      // Fetch the user's profile data to create a proper TeamMember object
      const userProfile = await getUserProfileData(memberId);

      if (!userProfile) {
        setError('Could not fetch user profile data for the requested member.');
        return;
      }

      // Create the TeamMember object from the profile data, excluding undefined fields
      const memberToAdd: TeamMember = {
        id: memberId,
        name: userProfile.name || 'Anonymous',
        role: 'Member', // Default role for accepted member
        skills: userProfile.technicalSkills?.map(skill => skill.name) || [],
        // Conditionally include avatar only if profilePicture exists and is not undefined
        ...(userProfile.profilePicture !== undefined ? { avatar: userProfile.profilePicture } : {}),
      } as TeamMember;

      await acceptJoinRequest(teamId, memberToAdd);
      await loadTeams(); // Reload teams to update UI
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept join request');
      console.error(err);
    }
  };

  // Handle rejecting a join request
  const handleRejectRequest = async (teamId: string, memberId: string) => {
    if (!currentUser) {
      setError('You must be logged in to reject a join request.');
      return;
    }
    setError('');
    try {
      await rejectJoinRequest(teamId, memberId);
      await loadTeams(); // Reload teams to update UI
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject join request');
      console.error(err);
    }
  };

  const handleRemoveMember = async (teamId: string, memberId: string) => {
    if (!currentUser) {
      setError('You must be logged in to remove a member.');
      return;
    }
    setError('');
    try {
      await removeTeamMember(teamId, memberId);
      await loadTeams();
    } catch (err) {
      setError('Failed to remove member');
      console.error(err);
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!teamCode.trim()) {
        setError('Please enter a team code.');
        return;
    }

    try {
      const team = await getTeamByCode(teamCode.trim());
      if (!team) {
        setError('Invalid team code.');
        return;
      }

      // Call the new direct join function
      await handleDirectJoinTeam(team); // This includes checks for membership and fullness

      // Only close modal and clear code if handleDirectJoinTeam was successful and didn't set an error
      // We can check the error state after the async call, or rely on loadTeams triggering re-render
      // For simplicity, let's just close if no immediate error was set by handleDirectJoinTeam
      // A more robust approach might check for success state from handleDirectJoinTeam
       if (!error) {
         setShowJoinModal(false);
         setTeamCode('');
       }

    } catch (err) {
      // handleDirectJoinTeam already sets error if it fails, no need to set it here again
      console.error(err);
    }
  };

  const handleSkillMatch = (team: Team) => {
    setSelectedTeam(team);
    setShowSkillMatch(true);
  };

  const handleMatch = async (userId: string) => {
    if (!selectedTeam) return;
    try {
      // Send a join request to the matched user
      await addJoinRequest(selectedTeam.id, userId);
      alert(`Join request sent to user ${userId}!`);
    } catch (err) {
      setError('Failed to send match request');
      console.error(err);
      alert('Failed to send join request.');
    }
  };

  const handleSkip = () => {
    // Just move to the next potential member
  };

  const handleCancelRequest = async (teamId: string) => {
    if (!currentUser) return;
    try {
      await removeJoinRequest(teamId, currentUser.uid);
      await loadPendingRequests();
      alert('Join request cancelled successfully');
    } catch (err) {
      setError('Failed to cancel join request');
      console.error(err);
    }
  };

  const handleOpenChat = (team: Team) => {
    setChatTeam(team);
    setShowChatModal(true);
  };

  const handleCloseChat = () => {
    setChatTeam(null);
    setShowChatModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-purple-500 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl"></div>
          <div className="relative">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Teams
            </h1>
            <p className="mt-2 text-lg text-gray-300">
              Join forces with talented developers and build something amazing
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => {setShowJoinModal(true); setError('');}}
            className="group relative px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5 text-purple-400" />
              <span className="text-gray-200">Join Team</span>
            </div>
          </button>
          <button
            onClick={() => {setShowCreateModal(true); setError('');}}
            className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-2">
              <PlusIcon className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Create Team</span>
            </div>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 animate-fade-in">
            {error}
          </div>
        )}

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.length === 0 && !isLoading && !error && (
            <div className="col-span-full text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 mb-4">
                <SparklesIcon className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-200 mb-2">No Teams Found</h3>
              <p className="text-gray-400">Create your own team or join an existing one to get started!</p>
            </div>
          )}
          {teams.map((team) => (
            <div key={team.id} className="transform transition-all duration-300 hover:scale-[1.02]">
              <TeamCard
                team={team}
                onEdit={() => setEditingTeam(team)}
                onDelete={() => handleDeleteTeam(team.id)}
                onJoin={() => handleRequestToJoinTeam(team)}
                onLeave={() => handleLeaveTeam(team)}
                onRemoveMember={(memberId) => handleRemoveMember(team.id, memberId)}
                onAcceptRequest={(memberId) => handleAcceptRequest(team.id, memberId)}
                onRejectRequest={(memberId) => handleRejectRequest(team.id, memberId)}
                onSkillMatch={() => handleSkillMatch(team)}
                onOpenChat={() => handleOpenChat(team)}
              />
            </div>
          ))}
        </div>

        {/* Pending Requests Section */}
        {currentUser && pendingRequests.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
              Pending Join Requests
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRequests.map((team) => (
                <div
                  key={team.id}
                  className="bg-white/5 hover:bg-white/10 rounded-xl p-6 border border-white/10 transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                      <p className="text-gray-400 text-sm mt-1">{team.description}</p>
                    </div>
                    <button
                      onClick={() => handleCancelRequest(team.id)}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors duration-300"
                    >
                      Cancel Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6 pb-4 px-8 pt-8 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Create New Team
                  </h2>
                  <p className="text-gray-400 mt-1">Fill in the details to create your dream team</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-8 pb-8">
                <TeamForm
                  onSubmit={handleCreateTeam}
                  onCancel={() => setShowCreateModal(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Join Team Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-md w-full p-8 shadow-2xl border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Join Team
                </h2>
                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    setTeamCode('');
                    setError('');
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleJoinByCode} className="space-y-6">
                <div>
                  <label htmlFor="teamCode" className="block text-sm font-medium text-gray-300 mb-2">
                    Enter Team Code
                  </label>
                  <input
                    type="text"
                    id="teamCode"
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
                    placeholder="Enter the team code"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setShowJoinModal(false);
                      setTeamCode('');
                      setError('');
                    }}
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition-all duration-300"
                  >
                    Join Team
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Team Modal */}
        {editingTeam && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Edit Team
                </h2>
                <button
                  onClick={() => setEditingTeam(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <TeamForm
                initialData={editingTeam}
                onSubmit={handleEditTeam}
                onCancel={() => setEditingTeam(null)}
              />
            </div>
          </div>
        )}

        {/* Skill Match Modal */}
        {showSkillMatch && selectedTeam && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl border border-white/10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Find Team Members
                </h2>
                <button
                  onClick={() => setShowSkillMatch(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <SkillMatch
                team={selectedTeam}
                onMatch={handleMatch}
                onSkip={handleSkip}
              />
            </div>
          </div>
        )}

        {/* Team Chat Modal */}
        {showChatModal && chatTeam && (
          <div className="fixed inset-0 z-50">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 w-full h-full flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-white/10">
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {chatTeam.name} Chat
                </h2>
                <button
                  onClick={handleCloseChat}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1">
                <TeamChat teamId={chatTeam.id} teamName={chatTeam.name} teamMembers={chatTeam.members} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Teams;