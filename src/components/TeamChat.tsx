import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Message, sendTeamMessage, getTeamMessages, UserProfileData, getUserProfileData } from '../utils/firestoreUtils';
import { PaperAirplaneIcon, UsersIcon } from '@heroicons/react/24/outline';
import TeamAnnouncements from './TeamAnnouncements';

// Helper function to format timestamps
const formatTimestamp = (timestamp: any) => {
  if (!timestamp || !timestamp.toDate) return 'Sending...';

  const date = timestamp.toDate();
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) {
    return `${seconds} seconds ago`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (seconds < 604800) { // Less than a week
    const days = Math.floor(seconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
};

interface TeamChatProps {
  teamId: string;
  teamName: string;
  teamMembers: { id: string; name: string; avatar?: string; role: string }[];
}

const TeamChat: React.FC<TeamChatProps> = ({ teamId, teamName, teamMembers }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [memberProfiles, setMemberProfiles] = useState<UserProfileData[]>([]);
  const [mentionSuggestions, setMentionSuggestions] = useState<UserProfileData[]>([]);
  const [isTypingMention, setIsTypingMention] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'announcements'>('chat');

  // Fetch member details
  const fetchMemberDetails = useCallback(async () => {
    const profiles: UserProfileData[] = [];
    for (const member of teamMembers) {
      const profile = await getUserProfileData(member.id);
      if (profile) {
        profiles.push(profile);
      }
    }
    setMemberProfiles(profiles);
  }, [teamMembers]);

  useEffect(() => {
    if (!teamId) return;

    const unsubscribe = getTeamMessages(teamId, (fetchedMessages) => {
      setMessages(fetchedMessages);
    });

    fetchMemberDetails(); // Initial fetch

    return () => unsubscribe();
  }, [teamId, fetchMemberDetails]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUser) return;

    try {
      await sendTeamMessage(
        teamId,
        currentUser.uid,
        currentUser.displayName || 'Anonymous',
        newMessage.trim(),
        currentUser.photoURL || undefined
      );
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    const atIndex = value.lastIndexOf('@');
    if (atIndex !== -1 && (atIndex === 0 || value[atIndex - 1] === ' ')) {
      const mentionQuery = value.substring(atIndex + 1).toLowerCase();
      const filteredSuggestions = memberProfiles.filter(
        (member) =>
          member.name.toLowerCase().includes(mentionQuery) &&
          member.id !== currentUser?.uid
      );
      setMentionSuggestions(filteredSuggestions);
      setIsTypingMention(true);
    } else {
      setMentionSuggestions([]);
      setIsTypingMention(false);
    }
  };

  const handleMentionSelect = (member: UserProfileData) => {
    const atIndex = newMessage.lastIndexOf('@');
    const newText = newMessage.substring(0, atIndex) + `@${member.name} `;
    setNewMessage(newText);
    setMentionSuggestions([]);
    setIsTypingMention(false);
    inputRef.current?.focus();
  };

  const renderMessageContent = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const mentionedName = part.substring(1);
        const mentionedMember = memberProfiles.find(
          (member) => member.name === mentionedName
        );
        return mentionedMember ? (
          <span key={index} className="text-blue-300 font-semibold">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] bg-gray-900 rounded-lg shadow-xl border border-gray-700">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700 shadow-lg">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">{teamName} Chat</h3>
        <div className="flex items-center gap-4">
          {/* Tab Buttons */}
          <div className="flex rounded-lg bg-gray-700 p-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'chat' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-300 hover:bg-gray-600'
                }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'announcements' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-300 hover:bg-gray-600'
                }`}
            >
              Announcements
            </button>
          </div>

          {/* Members Button */}
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors shadow-md"
            title="Toggle Members List"
          >
            <UsersIcon className="h-5 w-5" />
            <span>Members</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 relative">
        {/* Main Content Area: Chat or Announcements */}
        {activeTab === 'chat' ? (
          // Existing Chat Area
          <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-gray-800">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-3 ${msg.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'
                    }`}
                >
                  {/* Sender Avatar */}
                  {msg.senderId !== currentUser?.uid && (
                    msg.senderAvatar ? (
                      <img src={msg.senderAvatar} alt={msg.senderName} className="w-9 h-9 rounded-full object-cover border border-gray-600" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-md font-semibold flex-shrink-0">
                        {msg.senderName.charAt(0).toUpperCase()}
                      </div>
                    )
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[70%] p-3 rounded-xl shadow-md flex flex-col ${msg.senderId === currentUser?.uid
                        ? 'bg-blue-600 text-white items-end'
                        : 'bg-gray-700 text-gray-200 items-start'
                      }`}
                  >
                    <div className="font-semibold text-sm mb-1">
                      {msg.senderId === currentUser?.uid ? 'You' : msg.senderName}
                    </div>
                    <div className="text-base leading-snug break-words">
                      {renderMessageContent(msg.text)}
                    </div>
                    <div className="text-xs mt-1 opacity-80">
                      {formatTimestamp(msg.timestamp)}
                    </div>
                  </div>

                  {/* Current User Avatar */}
                  {msg.senderId === currentUser?.uid && (
                    currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="You" className="w-9 h-9 rounded-full object-cover border border-blue-400" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-700 flex items-center justify-center text-white text-md font-semibold flex-shrink-0">
                        {currentUser.displayName?.charAt(0).toUpperCase() || 'Y'}
                      </div>
                    )
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          // Announcements Area
          <TeamAnnouncements teamId={teamId} />
        )}

        {/* Member List Side Panel */}
        <div
          className={`absolute inset-y-0 right-0 w-64 bg-gray-800 border-l border-gray-700 flex-shrink-0 transform ${showMembers ? 'translate-x-0' : 'translate-x-full'
            } transition-transform duration-300 ease-in-out z-20 flex flex-col`}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-700/50">
            <h4 className="text-lg font-semibold text-white">Team Members</h4>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
            {memberProfiles.map(member => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => navigate(`/profile/${member.id}`)}
              >
                {member.profilePicture ? (
                  <img src={member.profilePicture} alt={member.name} className="w-10 h-10 rounded-full object-cover border-2 border-indigo-400" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-md font-bold flex-shrink-0">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-white font-medium truncate">{member.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Input Bar - Only visible for chat tab */}
      {activeTab === 'chat' && (
        <div className="sticky bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700">
          <form onSubmit={handleSendMessage} className="p-4 flex items-center relative">
            {isTypingMention && mentionSuggestions.length > 0 && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-10 max-h-48 overflow-y-auto">
                {mentionSuggestions.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleMentionSelect(member)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2 transition-colors"
                  >
                    {member.profilePicture ? (
                      <img src={member.profilePicture} alt={member.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-white text-sm">{member.name}</span>
                  </button>
                ))}
              </div>
            )}
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
            <button
              type="submit"
              className="ml-3 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={newMessage.trim() === ''}
            >
              <PaperAirplaneIcon className="h-6 w-6" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TeamChat;