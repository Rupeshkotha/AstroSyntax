/** @jsxImportSource react */
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, orderBy, getDocs, where, doc, updateDoc, increment, arrayUnion, arrayRemove, Query as FirestoreQuery, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { MagnifyingGlassIcon, FunnelIcon, FireIcon, ClockIcon, StarIcon, BookOpenIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const TRACKS = [
  'GenAI', 'Medicare', 'Fintech', 'Web3', 'EdTech', 'Sustainability', 'IoT', 'Gaming', 'HealthTech', 'Social Impact', 'Open Innovation', 'Cybersecurity', 'AR/VR', 'Robotics', 'Smart Cities', 'Others',
];

const FILTER_TABS = [
  { label: 'All', icon: <BookOpenIcon className="w-5 h-5 mr-1" /> },
  { label: 'Trending', icon: <FireIcon className="w-5 h-5 mr-1" /> },
  { label: 'Recent', icon: <ClockIcon className="w-5 h-5 mr-1" /> },
  { label: 'Popular', icon: <StarIcon className="w-5 h-5 mr-1" /> },
];

interface Blog {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    photoURL?: string;
  };
  createdAt: Date;
  likes: number;
  comments: number;
  track: string;
  likedBy?: string[];
}

const BlogFeed: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<string>('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [expandedBlog, setExpandedBlog] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrack, activeTab]); // Add activeTab as a dependency

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      
      let queryConstraints = [];

      if (selectedTrack) {
        queryConstraints.push(where('track', '==', selectedTrack));
      }

      switch (activeTab) {
        case 'Trending':
          queryConstraints.push(orderBy('likes', 'desc'));
          break;
        case 'Recent':
          queryConstraints.push(orderBy('createdAt', 'desc'));
          break;
        case 'Popular':
          queryConstraints.push(orderBy('likes', 'desc')); // Assuming popular is also by likes for now
          break;
        case 'All':
        default:
          queryConstraints.push(orderBy('createdAt', 'desc')); // Default order
          break;
      }

      const q = query(collection(db, 'blogs'), ...queryConstraints);
      const querySnapshot = await getDocs(q);
      let blogsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Blog[];

      // Filter by search
      if (search) {
        blogsData = blogsData.filter(blog =>
          blog.title.toLowerCase().includes(search.toLowerCase()) ||
          blog.content.toLowerCase().includes(search.toLowerCase())
        );
      }
      setBlogs(blogsData);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line
  }, [search]);

  const handleLike = async (blogId: string) => {
    if (!currentUser) return;
    
    const blog = blogs.find(b => b.id === blogId);
    if (!blog) return;

    // Check if user has already liked this blog
    if (blog.likedBy?.includes(currentUser.uid)) {
      // Unlike the blog
      try {
        const blogRef = doc(db, 'blogs', blogId);
        await updateDoc(blogRef, {
          likes: increment(-1),
          likedBy: arrayRemove(currentUser.uid)
        });
        
        // Update local state
        setBlogs(blogs.map(blog => 
          blog.id === blogId 
            ? { 
                ...blog, 
                likes: blog.likes - 1,
                likedBy: blog.likedBy?.filter(id => id !== currentUser.uid) || []
              } 
            : blog
        ));
      } catch (error) {
        console.error('Error unliking blog:', error);
      }
    } else {
      // Like the blog
      try {
        const blogRef = doc(db, 'blogs', blogId);
        await updateDoc(blogRef, {
          likes: increment(1),
          likedBy: arrayUnion(currentUser.uid)
        });
        
        // Update local state
        setBlogs(blogs.map(blog => 
          blog.id === blogId 
            ? { 
                ...blog, 
                likes: blog.likes + 1,
                likedBy: [...(blog.likedBy || []), currentUser.uid]
              } 
            : blog
        ));
      } catch (error) {
        console.error('Error liking blog:', error);
      }
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!currentUser) {
      alert("You must be logged in to delete a blog.");
      return;
    }

    const blogToDelete = blogs.find(b => b.id === blogId);
    if (!blogToDelete || blogToDelete.author.id !== currentUser.uid) {
      alert("You can only delete your own blogs.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this blog?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'blogs', blogId));
      setBlogs(blogs.filter(blog => blog.id !== blogId));
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert("Failed to delete blog. Please try again.");
    }
  };

  const handleComment = (blogId: string) => {
    // Comment functionality removed
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      {/* Search and Filter Section */}
      <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-700/50 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-700/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="">All Tracks</option>
            {TRACKS.map(track => (
              <option key={track} value={track}>{track}</option>
            ))}
          </select>
          
          <button
            onClick={() => navigate('/dashboard/community/write')}
            className="group relative px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105"
          >
            <span className="relative flex items-center">
              <PencilSquareIcon className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Write Blog
            </span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`flex items-center px-4 py-2 rounded-xl text-base font-medium transition-all duration-300 ${
              activeTab === tab.label
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Blog Posts */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-16">
          <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-400 font-semibold">No blogs found for this track.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1"
            >
              <div className="flex items-center gap-4 mb-4">
                {blog.author.photoURL ? (
                  <img
                    src={blog.author.photoURL}
                    alt={blog.author.name}
                    className="w-12 h-12 rounded-full border-2 border-purple-500/50 shadow-lg shadow-purple-500/25"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full border-2 border-purple-500/50 shadow-lg shadow-purple-500/25 flex items-center justify-center bg-purple-600 text-white font-bold text-lg"
                  >
                    {blog.author.name ? blog.author.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'A'}
                  </div>
                )}
                <div>
                  <Link to={`/profile/${blog.author.id}`}>
                    <h3 className="font-semibold text-white text-lg hover:text-purple-400 transition-colors">
                      {blog.author.name || 'Anonymous User'}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-400">
                    {formatDistanceToNow(blog.createdAt, { addSuffix: true })} • {Math.ceil(blog.content.split(' ').length / 200)} min read
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                {blog.title}
              </h2>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
                  {blog.track}
                </span>
              </div>

              <p className="text-gray-300 text-base mb-6 whitespace-pre-line leading-relaxed">
                {expandedBlog === blog.id ? blog.content : blog.content.substring(0, 300) + (blog.content.length > 300 ? '...' : '')}
              </p>

              {blog.content.length > 300 && (
                <button
                  onClick={() => setExpandedBlog(expandedBlog === blog.id ? null : blog.id)}
                  className="text-purple-400 hover:text-purple-300 font-medium mb-6 transition-colors"
                >
                  {expandedBlog === blog.id ? 'Show less' : 'Read more'}
                </button>
              )}

              <div className="flex items-center gap-6 mt-4">
                <button
                  onClick={() => handleLike(blog.id)}
                  className={`flex items-center gap-2 group/like transition-all duration-300 ${
                    blog.likedBy?.includes(currentUser?.uid || '') 
                      ? 'text-pink-500' 
                      : 'text-gray-400 hover:text-pink-500'
                  }`}
                >
                  <svg 
                    className={`w-6 h-6 transition-all duration-300 ${
                      blog.likedBy?.includes(currentUser?.uid || '') 
                        ? 'fill-current scale-110' 
                        : 'group-hover/like:scale-110'
                    }`} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{blog.likes}</span>
                </button>

                {currentUser?.uid === blog.author.id && (
                  <button
                    onClick={() => handleDeleteBlog(blog.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogFeed; 