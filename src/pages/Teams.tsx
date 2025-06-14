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
      
      if (currentUser) {
        // Get teams where user is a member
        const userTeams = await getUserTeams(currentUser.uid);
        teamsData = [...userTeams];
        
        // Get available teams (where user is not a member)
        const availableTeams = await getAvailableTeams();
        teamsData = [...teamsData, ...availableTeams];
      } else {
        // If not logged in, just get all teams
        const availableTeams = await getAvailableTeams();
        teamsData = availableTeams;
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your teams and join others</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => {setShowJoinModal(true); setError('');}} // Clear previous errors on opening
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Join Team
          </button>
          <button
            onClick={() => {setShowCreateModal(true); setError('');}} // Clear previous errors on opening
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Team
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {teams.length === 0 && !isLoading && !error && (
          <div className="col-span-full text-center text-gray-500">
            No teams found. Create one or join an existing team!
          </div>
        )}
        {teams.map((team) => (
          <TeamCard
            key={team.id}
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
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-background to-surface/50 rounded-xl max-w-2xl w-full shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 px-8 pt-8">
              <div>
                <h2 className="text-2xl font-bold gradient-text">Create New Team</h2>
                <p className="text-text-secondary mt-1">Fill in the details to create your dream team</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-text-secondary hover:text-text transition-colors"
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

      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-background to-surface/50 rounded-xl max-w-md w-full p-8 shadow-2xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text">Join Team</h2>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setTeamCode('');
                  setError('');
                }}
                className="text-text-secondary hover:text-text transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleJoinByCode} className="space-y-6">
              <div>
                <label htmlFor="teamCode" className="block text-sm font-medium text-text-secondary mb-2">
                  Team Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="teamCode"
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit code"
                    className="input w-full pl-10 text-center tracking-widest font-mono text-lg"
                    maxLength={6}
                    required
                  />
                  <svg className="w-5 h-5 text-text-secondary absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <p className="mt-2 text-sm text-text-secondary">
                  Enter the 6-digit team code provided by your team lead
                </p>
              </div>
              {error && (
                <div className="p-4 rounded-xl bg-error/20 border border-error/30 text-error flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-4 border-t border-surface">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setTeamCode('');
                    setError('');
                  }}
                  className="btn btn-outline hover:bg-surface/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Join Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingTeam && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"> {/* Added z-index */}
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"> {/* Added max height and overflow */}
            <h2 className="text-xl font-semibold mb-4">Edit Team</h2>
            <TeamForm
              initialData={editingTeam}
              onSubmit={handleEditTeam}
              onCancel={() => setEditingTeam(null)}
            />
          </div>
        </div>
      )}

      {showSkillMatch && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Find Team Members</h2>
              <button
                onClick={() => setShowSkillMatch(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
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

      {showChatModal && chatTeam && (
        <div className="fixed inset-0 z-50">
          <div className="bg-gray-900 w-full h-full flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              {/* <h2 className="text-xl font-bold text-white">{chatTeam.name} Chat</h2> Remove or comment out this line */}
              <button
                onClick={handleCloseChat}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1">
              <TeamChat teamId={chatTeam.id} teamName={chatTeam.name} teamMembers={chatTeam.members} />
            </div>
          </div>
        </div>
      )}

      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Pending Join Requests</h2>
          <div className="grid grid-cols-1 gap-4">
            {pendingRequests.map((team) => (
              <div key={team.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{team.name}</h3>
                    <p className="text-gray-400">{team.description}</p>
                  </div>
                  <button
                    onClick={() => handleCancelRequest(team.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Cancel Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;