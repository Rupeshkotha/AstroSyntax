import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, arrayUnion } from 'firebase/firestore';
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
  SparklesIcon
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
  replies: Reply[];
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
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const [newReply, setNewReply] = useState({ discussionId: '', content: '' });
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
          reactions: data.reactions || [],
          replies: (data.replies || []).map((reply: any) => ({
            ...reply,
            authorId: reply.authorId
          }))
        };
      }) as Discussion[];
      setDiscussions(discussionsData);
    });

    return () => unsubscribe();
  }, []);

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
        reactions: [],
        replies: []
      };

      await addDoc(collection(db, 'discussions'), discussionData);
      setNewDiscussion({ title: '', content: '' });
    } catch (error) {
      console.error('Error adding discussion:', error);
    }
  };

  const handleNewReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newReply.discussionId) return;

    try {
      const discussionRef = doc(db, 'discussions', newReply.discussionId);
      const reply = {
        id: Date.now().toString(),
        content: newReply.content,
        author: currentUser.displayName || 'Anonymous',
        authorId: currentUser.uid,
        timestamp: serverTimestamp(),
        reactions: []
      };

      await updateDoc(discussionRef, {
        replies: arrayUnion(reply)
      });
      setNewReply({ discussionId: '', content: '' });
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleReaction = async (discussionId: string, reactionType: string, replyId?: string) => {
    if (!currentUser) return;

    try {
      const discussionRef = doc(db, 'discussions', discussionId);
      const discussion = discussions.find(d => d.id === discussionId);
      
      if (!discussion) return;

      if (replyId) {
        // React to a reply
        const updatedReplies = discussion.replies.map(reply => {
          if (reply.id === replyId) {
            const reactions = [...reply.reactions];
            const reactionIndex = reactions.findIndex(r => r.type === reactionType);
            
            if (reactionIndex === -1) {
              reactions.push({ type: reactionType, users: [currentUser.uid] });
            } else {
              const reaction = reactions[reactionIndex];
              if (reaction.users.includes(currentUser.uid)) {
                reaction.users = reaction.users.filter(id => id !== currentUser.uid);
                if (reaction.users.length === 0) {
                  reactions.splice(reactionIndex, 1);
                }
              } else {
                reaction.users.push(currentUser.uid);
              }
            }
            return { ...reply, reactions };
          }
          return reply;
        });

        await updateDoc(discussionRef, { replies: updatedReplies });
      } else {
        // React to a discussion
        const reactions = [...discussion.reactions];
        const reactionIndex = reactions.findIndex(r => r.type === reactionType);
        
        if (reactionIndex === -1) {
          reactions.push({ type: reactionType, users: [currentUser.uid] });
        } else {
          const reaction = reactions[reactionIndex];
          if (reaction.users.includes(currentUser.uid)) {
            reaction.users = reaction.users.filter(id => id !== currentUser.uid);
            if (reaction.users.length === 0) {
              reactions.splice(reactionIndex, 1);
            }
          } else {
            reaction.users.push(currentUser.uid);
          }
        }

        await updateDoc(discussionRef, { reactions });
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
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      navigate(`/profile/${userId}`);
    };

    return (
      <button
        onClick={handleClick}
        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
      >
        {children}
      </button>
    );
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
              <button type="submit" className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white">
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{discussion.title}</h3>
                <p className="text-gray-700 mb-4">{discussion.content}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <UserLink userId={discussion.authorId}>
                      {discussion.author}
                    </UserLink>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500 text-sm">
                      {new Date(discussion.timestamp).toLocaleDateString()}
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

                {/* Replies */}
                <div className="space-y-4 mt-6">
                  <h4 className="font-semibold text-gray-900">Replies</h4>
                  {discussion.replies.map((reply) => (
                    <div key={reply.id} className="pl-4 border-l-2 border-gray-200">
                      <p className="text-gray-700 mb-2">{reply.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserLink userId={reply.authorId}>
                            {reply.author}
                          </UserLink>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-500 text-sm">
                            {new Date(reply.timestamp).toLocaleDateString()}
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

                  {/* Reply Form */}
                  <form onSubmit={handleNewReply} className="mt-4">
                    <textarea
                      placeholder="Write a reply..."
                      className="textarea textarea-bordered w-full mb-2 bg-gray-50 text-gray-900 placeholder-gray-500"
                      value={newReply.discussionId === discussion.id ? newReply.content : ''}
                      onChange={(e) => setNewReply({ discussionId: discussion.id, content: e.target.value })}
                      required
                    />
                    <button type="submit" className="btn btn-primary btn-sm bg-blue-600 hover:bg-blue-700 text-white">
                      Reply
                    </button>
                  </form>
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