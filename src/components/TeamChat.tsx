import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  sendTeamMessage,
  getUserProfileData,
  updateTeamMessage,
  deleteTeamMessage,
} from '../utils/firestoreUtils';
import {
  PaperAirplaneIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';

// Helper function
const formatTimestamp = (timestamp: any) => {
  if (!timestamp || !timestamp.toDate) return 'Sending...';
  const date = timestamp.toDate();
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

interface TeamChatProps {
  teamId: string;
  hackathonId: string;
}

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: any;
  edited?: boolean;
  editedAt?: any;
}

const TeamChat: React.FC<TeamChatProps> = ({ teamId, hackathonId }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberNames, setMemberNames] = useState<Record<string, string>>({});
  const [memberAvatars, setMemberAvatars] = useState<Record<string, string | undefined>>({});
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'teams', teamId, 'messages'), orderBy('timestamp', 'asc')),
      (snapshot) => {
        const newMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          text: doc.data().text || '',
          senderId: doc.data().senderId || '',
          timestamp: doc.data().timestamp,
          edited: doc.data().edited || false,
          editedAt: doc.data().editedAt
        })) as ChatMessage[];
        setMessages(newMessages);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [teamId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchMemberDetails = async () => {
      const ids = Array.from(new Set(messages.map(msg => msg.senderId)));
      const newNames: Record<string, string> = {};
      const newAvatars: Record<string, string | undefined> = {};

      for (const id of ids) {
        if (!memberNames[id] || !memberAvatars[id]) {
          const profile = await getUserProfileData(id);
          if (profile) {
            newNames[id] = profile.name;
            newAvatars[id] = profile.profilePicture;
          }
        }
      }

      setMemberNames(prev => ({ ...prev, ...newNames }));
      setMemberAvatars(prev => ({ ...prev, ...newAvatars }));
    };

    if (messages.length > 0) fetchMemberDetails();
  }, [messages, memberNames, memberAvatars]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newMessage.trim()) return;

    try {
      setError(null); // Clear any existing errors
      await sendTeamMessage(
        teamId,
        currentUser.uid,
        currentUser.displayName || 'Anonymous',
        newMessage.trim(),
        currentUser.photoURL || undefined
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editText.trim()) return;
    try {
      await updateTeamMessage(teamId, messageId, editText.trim());
      setEditingMessage(null);
      setEditText('');
    } catch {
      setError('Failed to edit message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteTeamMessage(teamId, messageId);
    } catch {
      setError('Failed to delete message');
    }
  };

  const renderMessageContent = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) =>
      part.startsWith('@') ? (
        <span key={index} className="text-blue-300 font-semibold">{part}</span>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  return (
    <div className="relative h-full bg-gray-900 rounded-xl overflow-hidden border border-white/10">
      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="absolute inset-0 bottom-[80px] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl flex items-center space-x-3">
            <XMarkIcon className="w-5 h-5 text-red-400" />
            <span>{error}</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
            <PaperAirplaneIcon className="w-16 h-16 text-purple-500/50" />
            <p className="text-lg font-semibold">No messages yet</p>
            <p className="text-sm">Start the conversation by typing a message below!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isSender = message.senderId === currentUser?.uid;
            const senderName = memberNames[message.senderId] || 'Loading...';
            const senderAvatar = memberAvatars[message.senderId];

            return (
              <div
                key={message.id}
                className={`flex items-end gap-3 ${
                  isSender ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isSender && (
                  senderAvatar ? (
                    <img src={senderAvatar} alt={senderName} className="w-10 h-10 rounded-full object-cover border-2 border-gray-600 shadow-md" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-semibold flex-shrink-0 shadow-md">
                      {senderName.charAt(0).toUpperCase()}
                    </div>
                  )
                )}
                <div className={`max-w-[75%] group relative rounded-xl p-3 shadow-lg transition-all duration-200 transform hover:scale-[1.01] ${
                  isSender 
                    ? 'bg-gradient-to-r from-purple-700 to-pink-600 text-white' 
                    : 'bg-gray-700 text-gray-200'
                }`}>
                  {editingMessage === message.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all duration-300"
                        autoFocus
                      />
                      <button
                        onClick={() => message.id && handleEditMessage(message.id)}
                        className="p-1 text-green-400 hover:text-green-300 transition-colors duration-200"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setEditingMessage(null)}
                        className="p-1 text-gray-400 hover:text-gray-300 transition-colors duration-200"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-sm font-medium ${isSender ? 'text-white' : 'text-purple-300'}`}>
                          {isSender ? 'You' : senderName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTimestamp(message.timestamp)}
                        </span>
                        {message.edited && (
                          <span className="text-xs text-gray-500 ml-1">(edited)</span>
                        )}
                      </div>
                      <p className="break-words text-base leading-snug">{renderMessageContent(message.text)}</p>
                      {isSender && (
                        <div className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1 bg-gray-800 rounded-md p-1 shadow-md">
                          <button
                            onClick={() => {
                              if (message.id) {
                                setEditingMessage(message.id);
                                setEditText(message.text);
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-purple-400 transition-colors duration-200"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => message.id && handleDeleteMessage(message.id)}
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors duration-200"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {isSender && (
                  currentUser?.photoURL ? (
                    <img src={currentUser.photoURL} alt="You" className="w-10 h-10 rounded-full object-cover border-2 border-purple-400 shadow-md" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-lg font-semibold flex-shrink-0 shadow-md">
                      {currentUser?.displayName?.charAt(0).toUpperCase() || 'Y'}
                    </div>
                  )
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[80px] p-4 border-t border-white/10 bg-gray-900/70 backdrop-blur-md">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 text-base"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2 shadow-lg"
          >
            <PaperAirplaneIcon className="w-6 h-6 -rotate-45" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeamChat;
