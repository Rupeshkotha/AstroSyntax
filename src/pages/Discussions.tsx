import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, arrayUnion, getDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HandThumbUpIcon, 
  ChatBubbleLeftRightIcon,
  HeartIcon,
  RocketLaunchIcon,
  FaceSmileIcon,
  FireIcon,
  StarIcon,
  SparklesIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { 
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HeartIcon as HeartSolidIcon,
  RocketLaunchIcon as RocketLaunchSolidIcon,
  FaceSmileIcon as FaceSmileSolidIcon,
  FireIcon as FireSolidIcon,
  StarIcon as StarSolidIcon,
  SparklesIcon as SparklesSolidIcon
} from '@heroicons/react/24/solid';

interface Reaction {
  type: string;
  users: string[];
}

interface Discussion {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  timestamp: any;
  reactions: Reaction[];
}

interface Reply {
  id: string;
  content: string;
  author: string;
  authorId: string;
  timestamp: any;
  reactions: Reaction[];
}

const reactionTypes = [
  { type: 'like', icon: HandThumbUpIcon, solidIcon: HandThumbUpSolidIcon, color: 'text-blue-500' },
  { type: 'heart', icon: HeartIcon, solidIcon: HeartSolidIcon, color: 'text-red-500' },
  { type: 'rocket', icon: RocketLaunchIcon, solidIcon: RocketLaunchSolidIcon, color: 'text-purple-500' },
  { type: 'smile', icon: FaceSmileIcon, solidIcon: FaceSmileSolidIcon, color: 'text-yellow-500' },
  { type: 'fire', icon: FireIcon, solidIcon: FireSolidIcon, color: 'text-orange-500' },
  { type: 'star', icon: StarIcon, solidIcon: StarSolidIcon, color: 'text-yellow-400' },
  { type: 'sparkles', icon: SparklesIcon, solidIcon: SparklesSolidIcon, color: 'text-pink-500' },
];

const Discussions: React.FC = () => {
  const { currentUser } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [replies, setReplies] = useState<{ [key: string]: Reply[] }>({});
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const [newReply, setNewReply] = useState({ discussionId: '', content: '' });
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'discussions'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const discussionsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          content: data.content,
          author: data.author,
          authorId: data.authorId,
          timestamp: data.timestamp,
          reactions: data.reactions || []
        };
      }) as Discussion[];
      setDiscussions(discussionsData);

      discussionsData.forEach(discussion => {
        fetchReplies(discussion.id);
      });
    });

    return () => unsubscribe();
  }, []);

  const fetchReplies = (discussionId: string) => {
    const repliesQuery = query(
      collection(db, 'discussions', discussionId, 'replies'),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(repliesQuery, (snapshot) => {
      const repliesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reply[];
      setReplies(prev => ({
        ...prev,
        [discussionId]: repliesData
      }));
    });
  };

  const handleNewDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const discussionData = {
        title: newDiscussion.title,
        content: newDiscussion.content,
        author: currentUser.displayName || 'Anonymous',
        authorId: currentUser.uid,
        timestamp: serverTimestamp(),
        reactions: []
      };

      await addDoc(collection(db, 'discussions'), discussionData);
      setNewDiscussion({ title: '', content: '' });
    } catch (error) {
      console.error('Error adding discussion:', error);
    }
  };

  const handleNewReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !replyingTo) return;

    try {
      const replyData = {
        content: newReply.content,
        author: currentUser.displayName || 'Anonymous',
        authorId: currentUser.uid,
        timestamp: serverTimestamp(),
        reactions: []
      };

      await addDoc(collection(db, 'discussions', replyingTo, 'replies'), replyData);

      setNewReply({ discussionId: '', content: '' });
      setReplyingTo(null);
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const startReply = (discussionId: string) => {
    setReplyingTo(discussionId);
    setNewReply({ discussionId, content: '' });
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setNewReply({ discussionId: '', content: '' });
  };

  const handleReaction = async (discussionId: string, reactionType: string, replyId?: string) => {
    if (!currentUser) return;

    try {
      if (replyId) {
        const replyRef = doc(db, 'discussions', discussionId, 'replies', replyId);
        const replyDoc = await getDoc(replyRef);
        
        if (!replyDoc.exists()) return;

        const reply = replyDoc.data();
        const reactions = [...(reply.reactions || [])];
        
        reactions.forEach(reaction => {
          reaction.users = reaction.users.filter((id: string) => id !== currentUser.uid);
        });
        
        const filteredReactions = reactions.filter(reaction => reaction.users.length > 0);
        
        const reactionIndex = filteredReactions.findIndex(r => r.type === reactionType);
        if (reactionIndex === -1) {
          filteredReactions.push({ type: reactionType, users: [currentUser.uid] });
        } else {
          filteredReactions[reactionIndex].users.push(currentUser.uid);
        }

        await updateDoc(replyRef, { reactions: filteredReactions });
      } else {
        const discussionRef = doc(db, 'discussions', discussionId);
        const discussion = discussions.find(d => d.id === discussionId);
        
        if (!discussion) return;

        const reactions = [...discussion.reactions];
        
        reactions.forEach(reaction => {
          reaction.users = reaction.users.filter((id: string) => id !== currentUser.uid);
        });
        
        const filteredReactions = reactions.filter(reaction => reaction.users.length > 0);
        
        const reactionIndex = filteredReactions.findIndex(r => r.type === reactionType);
        if (reactionIndex === -1) {
          filteredReactions.push({ type: reactionType, users: [currentUser.uid] });
        } else {
          filteredReactions[reactionIndex].users.push(currentUser.uid);
        }

        await updateDoc(discussionRef, { reactions: filteredReactions });
      }
    } catch (error) {
      console.error('Error updating reactions:', error);
    }
  };

  const ReactionButton = ({ type, count, isActive, onClick }: { type: string; count: number; isActive: boolean; onClick: () => void }) => {
    const reactionConfig = reactionTypes.find(r => r.type === type);
    if (!reactionConfig) return null;

    const Icon = isActive ? reactionConfig.solidIcon : reactionConfig.icon;

    return (
      <button
        onClick={onClick}
        className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-colors ${
          isActive ? `${reactionConfig.color} bg-${reactionConfig.color.split('-')[1]}/10` : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Icon className="w-4 h-4" />
        {count > 0 && <span className="text-sm">{count}</span>}
      </button>
    );
  };

  const UserLink: React.FC<{ userId: string; children: React.ReactNode }> = ({ userId, children }) => {
    const navigate = useNavigate();

    const handleProfileClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(`/profile/${userId}`);
    };

    return (
      <button
        onClick={handleProfileClick}
        className="text-blue-600 hover:text-blue-800 font-medium"
      >
        {children}
      </button>
    );
  };

  // Handle delete discussion
  const handleDeleteDiscussion = async (discussionId: string) => {
    if (!currentUser) return;

    try {
      const discussionRef = doc(db, 'discussions', discussionId);
      const discussionDoc = await getDoc(discussionRef);
      
      if (!discussionDoc.exists()) return;
      
      const discussion = discussionDoc.data();
      if (discussion.authorId !== currentUser.uid) {
        console.error('Only the author can delete this discussion');
        return;
      }

      // Delete all replies in the subcollection
      const repliesQuery = query(collection(db, 'discussions', discussionId, 'replies'));
      const repliesSnapshot = await getDocs(repliesQuery);
      const deletePromises = repliesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete the discussion
      await deleteDoc(discussionRef);
    } catch (error) {
      console.error('Error deleting discussion:', error);
    }
  };

  // Handle delete reply
  const handleDeleteReply = async (discussionId: string, replyId: string) => {
    if (!currentUser) return;

    try {
      const replyRef = doc(db, 'discussions', discussionId, 'replies', replyId);
      const replyDoc = await getDoc(replyRef);
      
      if (!replyDoc.exists()) return;
      
      const reply = replyDoc.data();
      if (reply.authorId !== currentUser.uid) {
        console.error('Only the author can delete this reply');
        return;
      }

      await deleteDoc(replyRef);
    } catch (error) {
      console.error('Error deleting reply:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Discussions</h1>

        {/* New Discussion Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Start a Discussion</h2>
            <form onSubmit={handleNewDiscussion}>
              <input
                type="text"
                placeholder="Title"
                className="input input-bordered w-full mb-4 bg-gray-50 text-gray-900 placeholder-gray-500"
                value={newDiscussion.title}
                onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                required
              />
              <textarea
                placeholder="What's on your mind?"
                className="textarea textarea-bordered w-full mb-4 bg-gray-50 text-gray-900 placeholder-gray-500"
                value={newDiscussion.content}
                onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                required
              />
              <button type="submit" className="btn btn-primary">
                Post Discussion
              </button>
            </form>
          </div>
        </div>

        {/* Discussions List */}
        <div className="space-y-6">
          {discussions.map((discussion) => (
            <div key={discussion.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{discussion.title}</h3>
                  {currentUser?.uid === discussion.authorId && (
                    <button
                      onClick={() => handleDeleteDiscussion(discussion.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                      title="Delete discussion"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <p className="text-gray-700 mb-4">{discussion.content}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <UserLink userId={discussion.authorId}>
                      {discussion.author}
                    </UserLink>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500 text-sm">
                      {new Date(discussion.timestamp?.toDate?.() || discussion.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    {reactionTypes.map(({ type }) => {
                      const reaction = discussion.reactions.find(r => r.type === type);
                      const count = reaction?.users.length || 0;
                      const isActive = reaction?.users.includes(currentUser?.uid || '') || false;
                      return (
                        <ReactionButton
                          key={type}
                          type={type}
                          count={count}
                          isActive={isActive}
                          onClick={() => handleReaction(discussion.id, type)}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Replies Section */}
                <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Replies</h4>
                    <button
                      onClick={() => startReply(discussion.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Reply
                    </button>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === discussion.id && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <form onSubmit={handleNewReply}>
                        <textarea
                          placeholder="Write your reply..."
                          className="textarea textarea-bordered w-full mb-4 bg-white text-gray-900 placeholder-gray-500"
                          value={newReply.content}
                          onChange={(e) => setNewReply({ ...newReply, content: e.target.value })}
                          required
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={cancelReply}
                            className="btn btn-ghost"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={!newReply.content.trim()}
                          >
                            Post Reply
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Replies List */}
                  {replies[discussion.id]?.map((reply) => (
                    <div key={reply.id} className="pl-4 border-l-2 border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-gray-700">{reply.content}</p>
                        {currentUser?.uid === reply.authorId && (
                          <button
                            onClick={() => handleDeleteReply(discussion.id, reply.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 ml-2"
                            title="Delete reply"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserLink userId={reply.authorId}>
                            {reply.author}
                          </UserLink>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-500 text-sm">
                            {new Date(reply.timestamp?.toDate?.() || reply.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          {reactionTypes.map(({ type }) => {
                            const reaction = reply.reactions.find(r => r.type === type);
                            const count = reaction?.users.length || 0;
                            const isActive = reaction?.users.includes(currentUser?.uid || '') || false;
                            return (
                              <ReactionButton
                                key={type}
                                type={type}
                                count={count}
                                isActive={isActive}
                                onClick={() => handleReaction(discussion.id, type, reply.id)}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Discussions; 