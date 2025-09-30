import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import BottomMenu from "../components/BottomMenu";
import Comments from "../components/Comments";
import { useNavigate, useParams } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { id } = useParams();

  let currentUserId = null;
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      currentUserId = payload.id;
    }
  } catch (err) {
    console.error("Invalid token:", err);
  }

  const profileId = id || currentUserId;

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch user data
        const userRes = await axios.get(
          `http://localhost:5000/api/users/${profileId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(userRes.data);

        // Fetch user's posts
        const postRes = await axios.get(
          `http://localhost:5000/api/posts/user/${profileId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPosts(Array.isArray(postRes.data) ? postRes.data : []);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (profileId) fetchData();
  }, [profileId, token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${currentUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      navigate("/");
    } catch (err) {
      console.error("Error deleting account:", err);
      alert("Failed to delete account. Please try again.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(posts.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post. Please try again.");
    }
  };

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
      console.error("Error liking post:", err);
    }
  };

  // Helper function to get post owner ID
  const getPostOwnerId = (post) => {
    if (!post.userId) return null;
    // If userId is an object (populated)
    if (typeof post.userId === 'object' && post.userId._id) {
      return post.userId._id;
    }
    // If userId is just a string ID
    return post.userId.toString();
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-gray-700">
          Loading...
        </div>
        <BottomMenu />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-gray-700">
          User not found
        </div>
        <BottomMenu />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      <div className="sticky top-0 z-40">
        <Navbar />
      </div>

      <div className="flex-1 w-full max-w-3xl mx-auto p-4 pb-24 flex flex-col gap-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md text-center">
          <div className="w-24 h-24 mb-3 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span role="img" aria-label="profile" className="text-3xl">
                🐱
              </span>
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900">{user.name || "Anonymous"}</h2>
          <p className="text-gray-500 text-sm mt-1">{user.email || "No email available"}</p>
          {user.bio && <p className="text-gray-600 mt-2">{user.bio}</p>}

          <div className="flex gap-4 mt-3 text-gray-700">
            <span>{posts.length} posts</span>
            <span>{user.followers?.length || 0} followers</span>
            <span>{user.following?.length || 0} following</span>
          </div>

          {profileId === currentUserId && (
            <div className="flex gap-3 mt-4 flex-wrap justify-center">
              <button
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full shadow hover:from-pink-600 hover:to-purple-600 transition"
                onClick={() => navigate("/EditProfile")}
              >
                Edit Profile
              </button>
              <button
                className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-full shadow hover:bg-gray-300 transition"
                onClick={handleLogout}
              >
                Logout
              </button>
              <button
                className="px-6 py-2 bg-red-500 text-white font-semibold rounded-full shadow hover:bg-red-600 transition"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            </div>
          )}
        </div>

        {/* Posts */}
        <div className="flex flex-col gap-4">
          {posts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No posts yet.</p>
          ) : (
            posts.map((post) => {
              const postOwnerId = getPostOwnerId(post);
              const isOwnPost = postOwnerId === currentUserId;

              return (
                <div key={post._id} className="bg-white rounded-xl shadow p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-gray-800">
                    <div>
                      <strong>{user.name || "Anonymous"}</strong>
                      <p className="text-gray-500 text-sm">{user.email || "No email available"}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {post.text && <p className="text-gray-700">{post.text}</p>}
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post"
                      className="w-full max-h-96 object-cover rounded-lg"
                    />
                  )}

                  {/* Likes Section */}
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
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
                    <span className="text-gray-500 text-sm">
                      {post.likes?.length === 1 ? "like" : "likes"}
                    </span>
                    <span className="text-gray-400 text-sm">•</span>
                    <span className="text-gray-500 text-sm">
                      {post.comments?.length || 0} {post.comments?.length === 1 ? "comment" : "comments"}
                    </span>
                  </div>

                  {/* Delete Post Button - Only show for own posts */}
                  {isOwnPost && (
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded-full text-sm self-end hover:bg-red-600 transition"
                      onClick={() => handleDeletePost(post._id)}
                    >
                      🗑️ Delete Post
                    </button>
                  )}

                  {/* Comments Component */}
                  <Comments
                    postId={post._id}
                    token={token}
                    currentUserId={currentUserId}
                    postOwnerId={postOwnerId}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="sticky bottom-0 z-40">
        <BottomMenu />
      </div>
    </div>
  );
};

export default Profile;