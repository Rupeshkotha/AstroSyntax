import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, getDoc, deleteDoc, getDocs } from 'firebase/firestore';
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
import { HeartIcon as HeartSolidIconOutline } from '@heroicons/react/24/solid';

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
  const [expandedDiscussionId, setExpandedDiscussionId] = useState<string | null>(null);
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
        author: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous',
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
    if (!currentUser || !newReply.discussionId) return;

    try {
      const replyData = {
        content: newReply.content,
        author: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous',
        authorId: currentUser.uid,
        timestamp: serverTimestamp(),
        reactions: []
      };

      await addDoc(collection(db, 'discussions', newReply.discussionId, 'replies'), replyData);

      setNewReply({ discussionId: '', content: '' });
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleReaction = async (discussionId: string, reactionType: string, replyId?: string) => {
    if (!currentUser) return;

    try {
      if (replyId) {
        const replyRef = doc(db, 'discussions', discussionId, 'replies', replyId);
        const replyDoc = await getDoc(replyRef);
        if (!replyDoc.exists()) return;
        const reply = replyDoc.data();
        let reactions = [...(reply.reactions || [])];
        const reactionIndex = reactions.findIndex(r => r.type === reactionType);
        if (reactionIndex === -1) {
          // Add new reaction
          reactions.push({ type: reactionType, users: [currentUser.uid] });
        } else {
          const users = reactions[reactionIndex].users;
          if (users.includes(currentUser.uid)) {
            // Unlike: remove user
            reactions[reactionIndex].users = users.filter((id: string) => id !== currentUser.uid);
            // Remove reaction if no users left
            if (reactions[reactionIndex].users.length === 0) {
              reactions.splice(reactionIndex, 1);
            }
          } else {
            // Like: add user
            reactions[reactionIndex].users.push(currentUser.uid);
          }
        }
        await updateDoc(replyRef, { reactions });
      } else {
        const discussionRef = doc(db, 'discussions', discussionId);
        const discussion = discussions.find(d => d.id === discussionId);
        if (!discussion) return;
        let reactions = [...discussion.reactions];
        const reactionIndex = reactions.findIndex(r => r.type === reactionType);
        if (reactionIndex === -1) {
          // Add new reaction
          reactions.push({ type: reactionType, users: [currentUser.uid] });
        } else {
          const users = reactions[reactionIndex].users;
          if (users.includes(currentUser.uid)) {
            // Unlike: remove user
            reactions[reactionIndex].users = users.filter((id: string) => id !== currentUser.uid);
            // Remove reaction if no users left
            if (reactions[reactionIndex].users.length === 0) {
              reactions.splice(reactionIndex, 1);
            }
          } else {
            // Like: add user
            reactions[reactionIndex].users.push(currentUser.uid);
          }
        }
        await updateDoc(discussionRef, { reactions });
      }
    } catch (error) {
      console.error('Error updating reactions:', error);
    }
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
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2">Discussions</h1>
        <p className="text-lg text-gray-300">Ask questions, share ideas, and connect with the community.</p>
      </div>

      {/* Start a Discussion Card */}
      <div className="mb-10 bg-slate-800/80 border border-white/10 rounded-2xl shadow-xl p-8 backdrop-blur-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Start a Discussion</h2>
        <form onSubmit={handleNewDiscussion} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            className="w-full px-4 py-3 rounded-lg bg-slate-900/60 border border-white/10 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
            value={newDiscussion.title}
            onChange={e => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
            required
          />
          <textarea
            placeholder="What's on your mind?"
            className="w-full px-4 py-3 rounded-lg bg-slate-900/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400 min-h-[100px]"
            value={newDiscussion.content}
            onChange={e => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
            required
          />
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-lg shadow-md hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Post Discussion
          </button>
        </form>
      </div>

      {/* Discussion List */}
      <div className="space-y-6">
        {discussions.length === 0 ? (
          <div className="text-center text-gray-400 py-12">No discussions yet. Be the first to start one!</div>
        ) : (
          discussions.map((discussion) => {
            const isExpanded = expandedDiscussionId === discussion.id;
            const userLiked = currentUser?.uid
              ? discussion.reactions?.find(r => r.type === 'like')?.users.includes(currentUser.uid) || false
              : false;
            return (
              <div
                key={discussion.id}
                className="bg-slate-800/80 border border-white/10 rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-start md:items-center gap-4 hover:shadow-2xl transition-shadow group mb-6"
              >
                {/* Avatar */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
                  {discussion.author?.[0]?.toUpperCase() || <span>?</span>}
                </div>
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors truncate">{discussion.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>by {discussion.author || 'Unknown'}</span>
                      <span className="mx-1">•</span>
                      <span>{discussion.timestamp?.toDate ? new Date(discussion.timestamp.toDate()).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                  <p className="text-gray-300 mt-2 line-clamp-2">{discussion.content}</p>
                  {/* Replies Section (Expandable) */}
                  {isExpanded && (
                    <div className="w-full mt-6 animate-fade-in">
                      <div className="space-y-4">
                        {replies[discussion.id]?.length === 0 ? (
                          <div className="text-gray-400 text-center">No replies yet.</div>
                        ) : (
                          replies[discussion.id]?.map((reply) => {
                            const replyLiked = currentUser?.uid
                              ? reply.reactions?.find(r => r.type === 'like')?.users.includes(currentUser.uid) || false
                              : false;
                            const replyLikeCount = reply.reactions?.find(r => r.type === 'like')?.users.length || 0;
                            return (
                              <div key={reply.id} className="flex items-start gap-3 bg-slate-900/60 border border-white/10 rounded-xl p-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                  {reply.author?.[0]?.toUpperCase() || <span>?</span>}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                                    <UserLink userId={reply.authorId}>{reply.author || 'Unknown'}</UserLink>
                                    <span className="mx-1">•</span>
                                    <span>{reply.timestamp?.toDate ? new Date(reply.timestamp.toDate()).toLocaleDateString() : ''}</span>
                                    {currentUser?.uid === reply.authorId && (
                                      <button
                                        onClick={() => handleDeleteReply(discussion.id, reply.id)}
                                        className="ml-2 text-red-400 hover:text-red-600"
                                        title="Delete reply"
                                      >
                                        <TrashIcon className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                  <div className="text-gray-200">{reply.content}</div>
                                </div>
                                {/* Like button for reply */}
                                <button
                                  onClick={() => handleReaction(discussion.id, 'like', reply.id)}
                                  className={`ml-2 flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${replyLiked ? 'text-pink-400 bg-pink-400/10' : 'text-gray-400 hover:text-pink-400'}`}
                                >
                                  {replyLiked ? <HeartSolidIcon className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                                  <span className="text-sm">{replyLikeCount}</span>
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                      {/* Add Reply Form */}
                      <form onSubmit={e => { setNewReply({ discussionId: discussion.id, content: newReply.content }); handleNewReply(e); }} className="mt-6 flex flex-col gap-2">
                        <textarea
                          placeholder="Write your reply..."
                          className="w-full px-4 py-3 rounded-lg bg-slate-900/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400 min-h-[60px]"
                          value={isExpanded ? newReply.content : ''}
                          onChange={e => setNewReply({ discussionId: discussion.id, content: e.target.value })}
                          required
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedDiscussionId(null)}
                            className="px-4 py-2 rounded-lg bg-slate-700 text-gray-300 hover:bg-slate-600 transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow hover:from-purple-600 hover:to-pink-600 transition-all"
                            disabled={!newReply.content.trim()}
                          >
                            Post Reply
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
                {/* Actions */}
                <div className="flex flex-col items-end gap-2 md:ml-4">
                  <div className="flex items-center gap-4 text-gray-400">
                    <span className="flex items-center gap-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2h2"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 3h-6a2 2 0 00-2 2v3h10V5a2 2 0 00-2-2z"></path></svg> {replies[discussion.id]?.length || 0}</span>
                    {/* Like button for discussion */}
                    <button
                      onClick={() => handleReaction(discussion.id, 'like')}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${userLiked ? 'text-pink-400 bg-pink-400/10' : 'text-gray-400 hover:text-pink-400'}`}
                    >
                      {userLiked ? <HeartSolidIcon className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                      <span className="text-sm">{discussion.reactions?.find(r => r.type === 'like')?.users.length || 0}</span>
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setExpandedDiscussionId(isExpanded ? null : discussion.id);
                      setNewReply({ discussionId: discussion.id, content: '' });
                    }}
                    className="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow hover:from-purple-600 hover:to-pink-600 transition-all text-sm"
                  >
                    {isExpanded ? 'Hide Replies' : 'View & Reply'}
                  </button>
                  {currentUser?.uid === discussion.authorId && (
                    <button
                      onClick={() => handleDeleteDiscussion(discussion.id)}
                      className="text-red-400 hover:text-red-600 ml-2"
                      title="Delete discussion"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Discussions; 