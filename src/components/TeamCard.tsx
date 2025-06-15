import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Team, TeamMember } from '../utils/teamUtils';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfileData, UserProfileData } from '../utils/firestoreUtils';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { CalendarIcon, UserGroupIcon, ChatBubbleLeftIcon, SparklesIcon, UserPlusIcon, PencilIcon, TrashIcon, XMarkIcon, CheckIcon, EyeIcon } from '@heroicons/react/24/outline';

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
  const [isHovered, setIsHovered] = useState(false);

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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div 
      className="group relative bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-500 overflow-hidden backdrop-blur-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:via-pink-500/5 group-hover:to-blue-500/5 transition-all duration-700"></div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-700"></div>
      </div>

      {/* Content */}
      <div className="relative space-y-6">
        {/* Header and Actions */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
              {team.name}
            </h3>
            <p className="text-gray-400 text-sm flex items-center">
              <SparklesIcon className="w-4 h-4 mr-1 text-purple-400" />
              {team.hackathonName}
            </p>
            {(team.hackathonStartDate && team.hackathonEndDate) && (
              <p className="text-gray-500 text-xs flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                {formatDate(team.hackathonStartDate)} - {formatDate(team.hackathonEndDate)}
              </p>
            )}
          </div>
          {isTeamLead && (
            <div className="flex items-center space-x-2">
              <button
                onClick={onEdit}
                className="p-2 rounded-lg hover:bg-purple-500/20 text-purple-400 transition-all duration-300 transform hover:scale-110"
                title="Edit Team"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-all duration-300 transform hover:scale-110"
                title="Delete Team"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-400 flex items-center">
            <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
            Description
          </h4>
          <p className="text-gray-300 text-sm line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
            {team.description}
          </p>
        </div>

        {/* Required Skills */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-400 flex items-center">
            <SparklesIcon className="w-4 h-4 mr-1" />
            Required Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {team.requiredSkills.length > 0 ? (
              team.requiredSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 transform hover:scale-105"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm italic">No required skills specified.</span>
            )}
          </div>
        </div>

        {/* Members */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-400 flex items-center">
              <UserGroupIcon className="w-4 h-4 mr-1" />
              Team Members
            </h4>
            <span className="text-gray-500 text-sm">
              {team?.members?.length}/{team?.maxMembers}
            </span>
          </div>
          <div className="flex -space-x-2">
            {membersWithNames.map((member) => (
              <div
                key={member.id}
                className="relative group/member"
                title={`${member.name} (${member.role})`}
              >
                <div className="w-8 h-8 rounded-full border-2 border-slate-800 overflow-hidden transform transition-all duration-300 group-hover/member:scale-110 group-hover/member:z-10">
                  <img
                    src={
                      member.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || '')}&background=6366f1&color=fff`
                    }
                    alt={`Avatar of ${member.name || 'Anonymous'}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {isTeamLead && member.id !== currentUser?.uid && (
                  <button
                    onClick={() => onRemoveMember?.(member.id)}
                    className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover/member:opacity-100 transition-all duration-300 transform hover:scale-110"
                    title="Remove Member"
                  >
                    <XMarkIcon className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Join Requests */}
        {isTeamLead && requestingMembers.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-400 flex items-center">
              <UserPlusIcon className="w-4 h-4 mr-1" />
              Join Requests
            </h4>
            <div className="space-y-2">
              {requestingMembers.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-purple-500/10 hover:from-purple-500/10 hover:to-pink-500/10 transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        member.profilePicture ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || '')}&background=6366f1&color=fff`
                      }
                      alt={`Avatar of ${member.name || 'Anonymous'}`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium text-gray-300">{member.name}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/profile/${member.id}`)}
                      className="p-1.5 rounded-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all duration-300 transform hover:scale-110"
                      title="View Profile"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onAcceptRequest?.(member.id)}
                      className="p-1.5 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all duration-300 transform hover:scale-110"
                      title="Accept Request"
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRejectRequest?.(member.id)}
                      className="p-1.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-300 transform hover:scale-110"
                      title="Reject Request"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-white/10">
          {!isMember && !isTeamLead && (
            <button
              onClick={onJoin}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
            >
              Request to Join
            </button>
          )}
          {isMember && !isTeamLead && (
            <button
              onClick={onLeave}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
            >
              Leave Team
            </button>
          )}
          {isTeamLead && (
            <button
              onClick={onSkillMatch}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
            >
              Find Members
            </button>
          )}
          {isMember && (
            <button
              onClick={onOpenChat}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
            >
              Team Chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamCard;