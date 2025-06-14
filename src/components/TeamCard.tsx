import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Team, TeamMember } from '../utils/teamUtils';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfileData, UserProfileData } from '../utils/firestoreUtils';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface TeamCardProps {
  team: Team;
  onEdit?: () => void;
  onDelete?: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
  onRemoveMember?: (memberId: string) => void;
  onAcceptRequest?: (memberId: string) => void;
  onRejectRequest?: (memberId: string) => void;
  onSkillMatch?: () => void;
  onOpenChat?: () => void;
}

const TeamCard: React.FC<TeamCardProps> = ({
  team,
  onEdit,
  onDelete,
  onJoin,
  onLeave,
  onRemoveMember,
  onAcceptRequest,
  onRejectRequest,
  onSkillMatch,
  onOpenChat
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [membersWithNames, setMembersWithNames] = useState<TeamMember[]>(team.members);
  const [requestingMembers, setRequestingMembers] = useState<(UserProfileData & { id: string })[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInAnyTeam, setIsInAnyTeam] = useState(false);

  useEffect(() => {
    const checkTeamMembership = async () => {
      if (!currentUser) return;
      try {
        const teamsQuery = query(
          collection(db, 'teams'),
          where('members', 'array-contains', { id: currentUser.uid })
        );
        const teamsSnapshot = await getDocs(teamsQuery);
        
        // Check if user is in any team (either as lead or member)
        for (const doc of teamsSnapshot.docs) {
          const team = doc.data() as Team;
          if (team.members.some(member => member.id === currentUser.uid)) {
            setIsInAnyTeam(true);
            return;
          }
        }
        setIsInAnyTeam(false);
      } catch (error) {
        console.error('Error checking team membership:', error);
      }
    };
    checkTeamMembership();
  }, [currentUser]);

  useEffect(() => {
    const fetchMemberNames = async () => {
      const updatedMembers = await Promise.all(team.members.map(async (member) => {
        if (member.name === 'Anonymous' || !member.name || member.name.includes('@')) {
          const profile = await getUserProfileData(member.id);
          if (profile && profile.name) {
            return { ...member, name: profile.name, avatar: profile.profilePicture };
          } else if (currentUser?.uid === member.id && currentUser.displayName) {
            return { ...member, name: currentUser.displayName, avatar: currentUser.photoURL || member.avatar };
          }
        }
        return member;
      }));
      setMembersWithNames(updatedMembers);
    };

    fetchMemberNames();
  }, [team.members, currentUser]);

  useEffect(() => {
    const fetchRequestingMemberNames = async () => {
      if (!team.joinRequests || team.joinRequests.length === 0) {
        setRequestingMembers([]);
        return;
      }
      const profiles = await Promise.all(team.joinRequests.map(async (userId) => {
        const profile = await getUserProfileData(userId);
        return profile ? { ...profile, id: userId } : null;
      }));
      setRequestingMembers(profiles.filter(profile => profile !== null) as (UserProfileData & { id: string })[]);
    };

    fetchRequestingMemberNames();
  }, [team.joinRequests]);

  const isTeamLead = currentUser && team.members.some(member => 
    member.id === currentUser.uid && member.role === 'Team Lead'
  );

  const isMember = currentUser && team.members.some(member => member.id === currentUser.uid);

  return (
    <div className="card glass hover:scale-[1.02] transition-all duration-300 p-6 space-y-6">
      {/* Header and Actions */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold gradient-text">{team.name}</h3>
          <p className="text-text-secondary text-sm mt-1">{team.hackathonName}</p>
        </div>
        {isTeamLead && (
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="p-2 rounded-lg hover:bg-surface transition-colors"
              title="Edit Team"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg hover:bg-error/20 text-error transition-colors"
              title="Delete Team"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-text-secondary">Description</h4>
        <p className="text-text text-sm line-clamp-3">{team.description}</p>
      </div>

      {/* Required Skills */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-text-secondary">Required Skills</h4>
        <div className="flex flex-wrap gap-2 mt-2">
          {team.requiredSkills.length > 0 ? (
            team.requiredSkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30"
              >
                {skill}
              </span>
            ))
          ) : (
            <span className="text-text-secondary text-sm italic">No required skills specified.</span>
          )}
        </div>
      </div>

      {/* Members */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-text-secondary">Team Members</h4>
          <span className="text-text-secondary text-sm">
            {team?.members?.length}/{team?.maxMembers}
          </span>
        </div>
        <div className="flex -space-x-2 mt-2">
          {membersWithNames.map((member) => (
            <div
              key={member.id}
              className="relative group"
              title={`${member.name} (${member.role})`}
            >
              <img
                src={
                  member.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || '')}&background=6366f1&color=fff`
                }
                alt={`Avatar of ${member.name || 'Anonymous'}`}
                className="w-8 h-8 rounded-full border-2 border-surface object-cover"
              />
              {isTeamLead && member.id !== currentUser?.uid && (
                <button
                  onClick={() => onRemoveMember?.(member.id)}
                  className="absolute -top-1 -right-1 p-1 bg-error rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Member"
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Join Requests */}
      {isTeamLead && requestingMembers.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-text-secondary">Join Requests</h4>
          <div className="space-y-2 mt-2">
            {requestingMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-surface/50">
                <div className="flex items-center space-x-3">
                  <img
                    src={
                      member.profilePicture ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || '')}&background=6366f1&color=fff`
                    }
                    alt={`Avatar of ${member.name || 'Anonymous'}`}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-text">{member.name}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/profile/${member.id}`)}
                    className="p-1.5 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                    title="View Profile"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onAcceptRequest?.(member.id)}
                    className="p-1.5 rounded-full bg-success/20 text-success hover:bg-success/30 transition-colors"
                    title="Accept Request"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onRejectRequest?.(member.id)}
                    className="p-1.5 rounded-full bg-error/20 text-error hover:bg-error/30 transition-colors"
                    title="Reject Request"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Actions and Code */}
      <div className="flex items-center justify-between pt-4 border-t border-surface">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-text-secondary">Team Code:</span>
          <code className="px-2 py-1 rounded bg-surface text-sm font-mono text-text">{team.teamCode}</code>
        </div>
        <div className="flex space-x-2">
          {!isMember && team.members.length < team.maxMembers && !isInAnyTeam && (
            <button onClick={onJoin} className="btn btn-primary text-sm">Join Team</button>
          )}
          {isMember && !isTeamLead && (
            <button onClick={onLeave} className="btn btn-outline text-sm">Leave Team</button>
          )}
          {isTeamLead && onSkillMatch && (
            <button onClick={onSkillMatch} className="btn btn-secondary text-sm">Match Skills</button>
          )}
          {isMember && onOpenChat && (
            <button onClick={onOpenChat} className="btn btn-primary text-sm">Chat</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamCard;