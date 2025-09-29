import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import BottomMenu from "../components/BottomMenu";
import Comments from "../components/Comments";
import { useNavigate, useParams } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState({});
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  
  // FIX HERE: Changed 'userId' to 'id' to match the route parameter in App.jsx
  const { id } = useParams(); 

  const currentUserId = token ? JSON.parse(atob(token.split(".")[1])).id : null;
  // Use 'id' from params if present, otherwise default to currentUserId
  const profileId = id || currentUserId; 

  // Fetch user info and posts
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Get user info
        const userRes = await axios.get(`http://localhost:5000/api/users/${profileId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        // Get user posts
        const postRes = await axios.get(`http://localhost:5000/api/posts/user/${profileId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(postRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (profileId) fetchData();
  }, [token, profileId, navigate, id]); // Added 'id' to dependency array for completeness

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${currentUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-gray-700">Loading...</div>
        <BottomMenu />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      {/* Navbar */}
      <div className="sticky top-0 z-40">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-3xl mx-auto p-4 flex flex-col gap-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md text-center">
          {/* Avatar */}
          <div className="w-24 h-24 mb-3 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span role="img" aria-label="profile" className="text-3xl">
                🐱
              </span>
            )}
          </div>

          {/* Name */}
          <h2 className="text-2xl font-bold text-gray-900">{user.name || "Anonymous"}</h2>

          {/* Email */}
          <p className="text-gray-500 text-sm mt-1">{user.email || "No email available"}</p>

          {/* Bio */}
          {user.bio && <p className="text-gray-600 mt-2">{user.bio}</p>}

          {/* Stats */}
          <div className="flex gap-4 mt-3 text-gray-700">
            <span>{posts.length} posts</span>
            <span>{user.followers?.length || 0} followers</span>
            <span>{user.following?.length || 0} following</span>
          </div>

          {/* Show edit/logout/delete only if it's my profile */}
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
          {posts.length === 0 && (
            <p className="text-gray-500 text-center py-4">No posts yet.</p>
          )}

          {posts.map((post) => (
            <div key={post._id} className="bg-white rounded-xl shadow p-4 flex flex-col gap-3">
              {/* Post Header */}
              <div className="flex justify-between items-center text-gray-800">
                <div>
                  <strong>{user.name || "Anonymous"}</strong>
                  <p className="text-gray-500 text-sm">{user.email || "No email available"}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Post Content */}
              {post.text && <p className="text-gray-700">{post.text}</p>}
              {post.image && (
                <img
                  src={post.image}
                  alt="Post"
                  className="w-full max-h-96 object-cover rounded-lg"
                />
              )}

              {/* Comments */}
              <Comments postId={post._id} token={token} />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Menu */}
      <div className="sticky bottom-0 z-40">
        <BottomMenu />
      </div>
    </div>
  );
};

export default Profile;