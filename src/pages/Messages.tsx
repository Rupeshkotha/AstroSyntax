import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc,
  deleteDoc,
  DocumentData,
  QueryDocumentSnapshot,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import DashboardLayout from '../components/layout/DashboardLayout';
import { PaperAirplaneIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'react-router-dom';
import '../styles/custom.css';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: any;
}

interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  otherUser: {
    id: string;
    name: string;
    displayName: string;
    photoURL?: string;
  };
}

const Messages: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize chat with user from URL
  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId && currentUser) {
      initializeChat(userId);
    }
  }, [searchParams, currentUser]);

  // Initialize chat with a user
  const initializeChat = async (userId: string) => {
    if (!currentUser) return;

    try {
      // Get user data first
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        console.error('User not found:', userId);
        return;
      }

      const userData = userDoc.data();
      const userName = userData?.displayName || userData?.name || 'Unknown User';
      const userPhotoURL = userData?.photoURL || userData?.profilePicture || '';

      // Check if chat already exists
      const chatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', currentUser.uid)
      );
      const chatsSnapshot = await getDocs(chatsQuery);
      const existingChat = chatsSnapshot.docs.find(doc => {
        const data = doc.data();
        return data.participants.includes(userId);
      });

      if (existingChat) {
        console.log('Existing chat found:', existingChat.id); // Debug log
        setSelectedChat(existingChat.id);
        return;
      }

      // Create new chat
      const chatRef = await addDoc(collection(db, 'chats'), {
        participants: [currentUser.uid, userId],
        createdAt: serverTimestamp(),
        otherUser: {
          id: userId,
          name: userName,
          displayName: userName,
          photoURL: userPhotoURL
        }
      });

      console.log('New chat created:', chatRef.id); // Debug log
      setSelectedChat(chatRef.id);
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  // Fetch user's chats
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsData = await Promise.all(
        snapshot.docs.map(async (docSnapshot: QueryDocumentSnapshot<DocumentData>) => {
          const data = docSnapshot.data();
          const otherUserId = data.participants.find((id: string) => id !== currentUser.uid);
          
          // Get the other user's data
          const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
          const otherUserData = otherUserDoc.data();
          const otherUserName = otherUserData?.displayName || otherUserData?.name || 'Unknown User';
          const otherUserPhotoURL = otherUserData?.photoURL || otherUserData?.profilePicture || '';

          return {
            id: docSnapshot.id,
            participants: data.participants,
            lastMessage: data.lastMessage,
            otherUser: {
              id: otherUserId,
              name: otherUserName,
              displayName: otherUserName,
              photoURL: otherUserPhotoURL
            },
          };
        })
      );

      // Remove duplicate chats (keep only the most recent one for each user)
      const uniqueChats = chatsData.reduce((acc: Chat[], current) => {
        const existingChatIndex = acc.findIndex(
          chat => chat.otherUser.id === current.otherUser.id
        );

        if (existingChatIndex === -1) {
          // If no chat exists with this user, add it
          acc.push(current);
        } else {
          // If a chat exists, keep the one with the most recent message
          const existingChat = acc[existingChatIndex];
          const existingTimestamp = existingChat.lastMessage?.timestamp?.toDate?.() || 0;
          const currentTimestamp = current.lastMessage?.timestamp?.toDate?.() || 0;

          if (currentTimestamp > existingTimestamp) {
            acc[existingChatIndex] = current;
          }
        }
        return acc;
      }, []);

      // Sort chats by last message timestamp
      const sortedChats = uniqueChats.sort((a, b) => {
        if (!a.lastMessage?.timestamp) return 1;
        if (!b.lastMessage?.timestamp) return -1;
        return b.lastMessage.timestamp.toDate() - a.lastMessage.timestamp.toDate();
      });

      console.log('Unique sorted chats:', sortedChats);
      setChats(sortedChats);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat) return;

    const q = query(
      collection(db, 'chats', selectedChat, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [selectedChat]);

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedChat || !newMessage.trim()) return;

    try {
      const messageData = {
        content: newMessage,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Anonymous',
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, 'chats', selectedChat, 'messages'), messageData);

      // Update last message in chat document
      const chatRef = doc(db, 'chats', selectedChat);
      await updateDoc(chatRef, {
        lastMessage: messageData,
      });

      // Get the other user's ID from the chat document
      const chatDoc = await getDoc(chatRef);
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        const otherUserId = chatData.participants.find((id: string) => id !== currentUser.uid);
        
        if (otherUserId) {
          // Create notification for the other user
          const notificationsRef = collection(db, 'users', otherUserId, 'notifications');
          await addDoc(notificationsRef, {
            type: 'NEW_MESSAGE',
            title: 'New Message',
            message: `${currentUser.displayName || 'Anonymous'}: ${newMessage}`,
            timestamp: serverTimestamp(),
            read: false,
            link: `/messages?chat=${selectedChat}`,
            senderId: currentUser.uid,
            senderName: currentUser.displayName || 'Anonymous'
          });
        }
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Delete message function
  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedChat || !currentUser) return;

    try {
      // Delete the message
      await deleteDoc(doc(db, 'chats', selectedChat, 'messages', messageId));

      // Get the most recent message to update the chat's lastMessage
      const messagesRef = collection(db, 'chats', selectedChat, 'messages');
      const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
      const messagesSnapshot = await getDocs(messagesQuery);
      
      const chatRef = doc(db, 'chats', selectedChat);
      
      if (!messagesSnapshot.empty) {
        // Update with the new last message
        const lastMessage = messagesSnapshot.docs[0].data();
        await updateDoc(chatRef, {
          lastMessage: lastMessage
        });
      } else {
        // If no messages left, remove lastMessage
        await updateDoc(chatRef, {
          lastMessage: null
        });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Simulate typing indicator
    if (e.target.value.trim()) {
      setIsTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    } else {
      setIsTyping(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)]">
        <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-700 h-full flex overflow-hidden">
          {/* Chat List */}
          <div className="w-1/4 border-r border-gray-700 flex flex-col bg-gray-800/50">
            <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
              <h2 className="text-xl font-bold text-white">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {chats.map(chat => (
                <button
                  key={chat.id}
                  className={`w-full p-4 text-left hover:bg-gray-700/50 transition-colors duration-200 ${
                    selectedChat === chat.id ? 'bg-gray-700/50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedChat(chat.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-500">
                      {chat.otherUser.photoURL ? (
                        <img
                          src={chat.otherUser.photoURL}
                          alt={chat.otherUser.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
                          {chat.otherUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">
                        {chat.otherUser.name}
                      </div>
                      {chat.lastMessage && (
                        <div className="text-sm text-gray-400 truncate">
                          {chat.lastMessage.senderId === currentUser?.uid ? 'You: ' : ''}
                          {chat.lastMessage.content}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 flex flex-col bg-gray-900">
            {selectedChat ? (
              <>
                <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-500">
                      {chats.find(chat => chat.id === selectedChat)?.otherUser.photoURL ? (
                        <img
                          src={chats.find(chat => chat.id === selectedChat)?.otherUser.photoURL}
                          alt={chats.find(chat => chat.id === selectedChat)?.otherUser.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
                          {chats.find(chat => chat.id === selectedChat)?.otherUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {chats.find(chat => chat.id === selectedChat)?.otherUser.name}
                      </h2>
                      <p className="text-sm text-gray-400">Online</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'
                      } message-enter`}
                    >
                      <div className="relative group flex items-end gap-2">
                        {message.senderId !== currentUser?.uid && (
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                            {chats.find(chat => chat.id === selectedChat)?.otherUser.photoURL ? (
                              <img
                                src={chats.find(chat => chat.id === selectedChat)?.otherUser.photoURL}
                                alt={chats.find(chat => chat.id === selectedChat)?.otherUser.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                                {chats.find(chat => chat.id === selectedChat)?.otherUser.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] rounded-2xl p-3 message-bubble ${
                            message.senderId === currentUser?.uid
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-gray-700 text-white rounded-bl-none'
                          }`}
                        >
                          <div className="text-sm">{message.content}</div>
                          <div className="text-xs mt-1 opacity-70">
                            {new Date(message.timestamp?.toDate?.() || message.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        {message.senderId === currentUser?.uid && (
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-gray-700 transition-all duration-200"
                            title="Delete message"
                          >
                            <TrashIcon className="h-4 w-4 text-gray-400 hover:text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  )}
                </div>
                
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-700 bg-gray-800/50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      value={newMessage}
                      onChange={handleInputChange}
                    />
                    <button
                      type="submit"
                      className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!newMessage.trim()}
                    >
                      <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                    <PaperAirplaneIcon className="h-8 w-8 text-gray-500" />
                  </div>
                  <p className="text-lg">Select a chat or start a new conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages; 