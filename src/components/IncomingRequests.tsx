import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Team, getTeamsWithJoinRequestFromUser, acceptJoinRequest, rejectJoinRequest, getTeamMemberDataFromUser } from '../utils/teamUtils';

const IncomingRequests: React.FC = () => {
  const { currentUser } = useAuth();
  const [incomingTeams, setIncomingTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError('');
        const teams = await getTeamsWithJoinRequestFromUser(currentUser.uid);
        setIncomingTeams(teams);
      } catch (err) {
        console.error('Error fetching incoming requests:', err);
        setError('Failed to load incoming requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [currentUser]);

  const handleAccept = async (team: Team) => {
    if (!currentUser) return;
    setError('');
    try {
      // We need the TeamMember data for the accepting user.
      // Assuming profile data is sufficient to construct a basic TeamMember.
      // A more robust approach might fetch user profile and skills here.
      const acceptingMemberData = getTeamMemberDataFromUser(currentUser);

      await acceptJoinRequest(team.id, acceptingMemberData);
      // Remove the accepted team from the list
      setIncomingTeams(prevTeams => prevTeams.filter(t => t.id !== team.id));
      alert(`Successfully joined team ${team.name}!`);
    } catch (err) {
      console.error('Error accepting request:', err);
      setError('Failed to accept join request.');
      alert('Failed to accept join request.');
    }
  };

  const handleReject = async (teamId: string) => {
    if (!currentUser) return;
    setError('');
    try {
      await rejectJoinRequest(teamId, currentUser.uid);
      // Remove the rejected team from the list
      setIncomingTeams(prevTeams => prevTeams.filter(t => t.id !== teamId));
      alert('Join request rejected.');
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Failed to reject join request.');
      alert('Failed to reject join request.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-error">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold gradient-text">Incoming Team Invitations</h3>
      {incomingTeams.length === 0 ? (
        <div className="text-center text-text-secondary">
          No incoming team invitations at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incomingTeams.map(team => (
            <div key={team.id} className="card glass p-4 space-y-3">
              <div>
                <h4 className="text-lg font-semibold gradient-text">{team.name}</h4>
                <p className="text-text-secondary text-sm">From hackathon: {team.hackathonName}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAccept(team)}
                  className="btn btn-primary text-sm"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(team.id)}
                  className="btn btn-outline text-sm"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IncomingRequests; 