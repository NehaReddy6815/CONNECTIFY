import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomMenu from "../components/BottomMenu";
import Comments from "../components/Comments";
import axios from "axios";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const currentUserId = token ? JSON.parse(atob(token.split(".")[1])).id : null;

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/posts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(res.data);
      } catch (err) {
        console.error(err);
        setError("Error fetching posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [token, navigate]);

  const handleLike = async (postId) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prev) =>
        prev.map((post) => (post._id === postId ? { ...post, likes: res.data.likes } : post))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Main Container - Centered with max width */}
      <div className="max-w-2xl mx-auto bg-white min-h-screen shadow-xl">
        
        <Navbar />
        
        {/* Content Area */}
        <div className="px-4 sm:px-6 py-6 pb-24 md:pb-8">
          
          {/* Page Title */}
          <div className="mb-6">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Home Feed
            </h2>
            <p className="text-gray-500 text-sm mt-1">See what your friends are sharing</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="text-gray-500 mt-4">Loading posts...</p>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
              <div className="flex items-center">
                <span className="text-red-500 text-xl mr-3">⚠️</span>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {!loading && posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts yet</h3>
              <p className="text-gray-500 text-center max-w-sm">
                Start following people to see their posts here!
              </p>
            </div>
          )}

          {/* Posts List */}
          <div className="space-y-6">
            {posts.map((post) => (
              <div 
                key={post._id} 
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* Post Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                        {(post.userId?.username || "A")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {post.userId?.username || "Anonymous"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4">
                  {post.text && (
                    <p className="text-gray-800 text-base leading-relaxed mb-4 whitespace-pre-wrap">
                      {post.text}
                    </p>
                  )}
                  {post.image && (
                    <div className="rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={post.image} 
                        alt="Post content" 
                        className="w-full object-cover max-h-96 hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="px-4 pb-4">
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-200 ${
                        post.likes?.includes(currentUserId)
                          ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md hover:shadow-lg transform hover:scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick={() => handleLike(post._id)}
                    >
                      <span className="text-lg">
                        {post.likes?.includes(currentUserId) ? "❤️" : "🤍"}
                      </span>
                      <span className="text-sm font-semibold">
                        {post.likes?.length || 0}
                      </span>
                    </button>
                    <span className="text-gray-400 text-sm">
                      {post.likes?.length === 1 ? "like" : "likes"}
                    </span>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="border-t border-gray-100">
                  <Comments post={post} token={token} currentUserId={currentUserId} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <BottomMenu />
      </div>
    </div>
  );
};

export default Home;