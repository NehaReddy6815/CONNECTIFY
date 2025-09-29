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
        prev.map((post) =>
          post._id === postId ? { ...post, likes: res.data.likes } : post
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      {/* Navbar fixed at top */}
      <div className="sticky top-0 z-10">
        <Navbar />
      </div>

      {/* Main content scrollable */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-6 max-w-2xl mx-auto w-full">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" />
            <p className="text-gray-500 mt-4">Loading posts...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-red-700 font-medium text-sm">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="flex flex-col items-center py-20">
            <div className="text-6xl mb-3">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts yet</h3>
            <p className="text-gray-500 text-center max-w-xs">
              Start following people to see their posts here!
            </p>
          </div>
        )}

        {/* Posts */}
        {posts.map((post) => (
          <div key={post._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition duration-200">
            {/* Post Header */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                {(post.userId?.username || "A")[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{post.userId?.username || "Anonymous"}</p>
                <p className="text-xs text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* Post Content */}
            <div className="p-4 space-y-3">
              {post.text && <p className="text-gray-800">{post.text}</p>}
              {post.image && (
                <div className="rounded-lg overflow-hidden bg-gray-100">
                  <img src={post.image} alt="Post" className="w-full object-cover max-h-96 hover:scale-105 transition-transform duration-300"/>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 flex items-center gap-3">
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  post.likes?.includes(currentUserId)
                    ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md hover:shadow-lg transform hover:scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => handleLike(post._id)}
              >
                <span>{post.likes?.includes(currentUserId) ? "❤️" : "🤍"}</span>
                <span>{post.likes?.length || 0}</span>
              </button>
              <span className="text-gray-400 text-sm">{post.likes?.length === 1 ? "like" : "likes"}</span>
            </div>

            {/* Comments */}
            <div className="border-t border-gray-100">
              <Comments post={post} token={token} currentUserId={currentUserId} />
            </div>
          </div>
        ))}
      </main>

      {/* Bottom Menu fixed at bottom */}
      <div className="sticky bottom-0 z-10">
        <BottomMenu />
      </div>
    </div>
  );
};

export default Home;
