/** @jsxImportSource react */
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, orderBy, getDocs, where, doc, updateDoc, increment, arrayUnion, arrayRemove, Query as FirestoreQuery, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { MagnifyingGlassIcon, FunnelIcon, FireIcon, ClockIcon, StarIcon, BookOpenIcon, TrashIcon } from '@heroicons/react/24/outline';

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
    <div className="min-h-screen bg-[#faf8ff] py-10 px-2 sm:px-0">
      <div className="max-w-4xl mx-auto">
        {/* Heading and Tabs */}
        <div className="mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#7c3aed] text-center mb-2">Blog Feed</h2>
          <p className="text-gray-500 text-center mb-6">Discover insights and stories from the community</p>
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                className={`flex items-center px-4 py-2 rounded-full text-base font-medium border transition-colors ${activeTab === tab.label ? 'bg-[#7c3aed] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center w-full sm:w-auto gap-2">
            <div className="relative w-full sm:w-72">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search blogs..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 w-full focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
              />
            </div>
            <button className="flex items-center px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100">
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filter
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="track-filter" className="text-base font-medium text-gray-700 mr-2">Track:</label>
            <select
              id="track-filter"
              value={selectedTrack}
              onChange={e => {
                setSelectedTrack(e.target.value);
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 text-base bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
            >
              <option value="">All Tracks</option>
              {TRACKS.map(track => (
                <option key={track} value={track}>{track}</option>
              ))}
            </select>
            <button
              onClick={() => navigate('/dashboard/community/write')}
              className="px-6 py-2 bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] text-white rounded-lg font-semibold shadow hover:from-[#a78bfa] hover:to-[#7c3aed] transition-all"
            >
              Write Blog
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-lg text-gray-400">Loading...</div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16 text-xl text-gray-400 font-semibold">No blogs found for this track.</div>
        ) : (
          <div className="space-y-8">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-white rounded-2xl shadow p-8 border border-gray-100 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={blog.author.photoURL || '/default-avatar.png'}
                    alt={blog.author.name}
                    className="w-10 h-10 rounded-full border border-gray-200 shadow-sm"
                  />
                  <div>
                    <Link to={`/profile/${blog.author.id}`}>
                      <h3 className="font-semibold text-gray-900 text-base hover:underline">{blog.author.name || 'Anonymous User'}</h3>
                    </Link>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(blog.createdAt, { addSuffix: true })} • {Math.ceil(blog.content.split(' ').length / 200)} min read
                    </p>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#7c3aed] transition-colors">{blog.title}</h2>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-3 py-1 bg-[#ede9fe] text-[#7c3aed] rounded-full text-xs font-medium">{blog.track}</span>
                </div>
                <p className="text-gray-700 text-base mb-6 whitespace-pre-line leading-relaxed">
                  {expandedBlog === blog.id ? blog.content : blog.content.substring(0, 300) + (blog.content.length > 300 ? '...' : '')}
                </p>
                {blog.content.length > 300 && (
                  <button
                    onClick={() => setExpandedBlog(expandedBlog === blog.id ? null : blog.id)}
                    className="text-[#7c3aed] hover:text-[#6d28d9] font-medium mb-6"
                  >
                    {expandedBlog === blog.id ? 'Show less' : 'Read more'}
                  </button>
                )}
                <div className="flex items-center gap-6 mt-4">
                  <button
                    onClick={() => handleLike(blog.id)}
                    className={`flex items-center gap-1 group/like transition-colors ${
                      blog.likedBy?.includes(currentUser?.uid || '') 
                        ? 'text-red-500' 
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <svg 
                      className={`w-5 h-5 transition-all duration-200 ${
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

                  {currentUser && blog.author.id === currentUser.uid && (
                    <button
                      onClick={() => handleDeleteBlog(blog.id)}
                      className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete Blog"
                    >
                      <TrashIcon className="w-5 h-5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogFeed; 