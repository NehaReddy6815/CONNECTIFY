import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import BottomMenu from "../components/BottomMenu";
import Comments from "../components/Comments";
import { useNavigate } from "react-router-dom";


const Profile = () => {
  const [user, setUser] = useState({});
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const currentUserId = token ? JSON.parse(atob(token.split(".")[1])).id : null;

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
        const userRes = await axios.get(`http://localhost:5000/api/users/${currentUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        // Get user posts
        const postRes = await axios.get(`http://localhost:5000/api/posts/user/${currentUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(postRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, currentUserId, navigate]);

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

  return (
    <div className="profile-container">
      <div className="phone-frame">
        <Navbar />

        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Avatar" />
            ) : (
              <span role="img" aria-label="profile" className="default-avatar">
                🐱
              </span>
            )}
          </div>
          <div className="profile-username">{user.username || "Anonymous"}</div>
          <div className="profile-stats">
            <span>{posts.length} posts</span> |{" "}
            <span>{user.followers?.length || 0} followers</span> |{" "}
            <span>{user.following?.length || 0} following</span>
          </div>
          {user.bio && <div className="profile-bio">{user.bio}</div>}

          <div className="profile-actions">
            <button className="edit-btn" onClick={() => navigate("/EditProfile")}>
              Edit Profile
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
            <button className="delete-btn" onClick={handleDeleteAccount}>
              Delete Account
            </button>
          </div>
        </div>

        {/* Posts */}
        <div className="phone-content">
          {loading && <p className="info-text">Loading posts...</p>}
          {!loading && posts.length === 0 && <p className="no-posts">No posts yet.</p>}

          {posts.map((post) => (
            <div key={post._id} className="post-card">
              <div className="post-header">
                <strong>{user.username || "Anonymous"}</strong>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="post-content">
                {post.text && <p>{post.text}</p>}
                {post.image && <img src={post.image} alt="Post" className="post-image" />}
              </div>
              <Comments postId={post._id} token={token} />
            </div>
          ))}
        </div>

        <BottomMenu />
      </div>
    </div>
  );
};

export default Profile;
