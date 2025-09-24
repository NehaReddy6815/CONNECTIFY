import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomMenu from "../components/BottomMenu";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      // Decode token to get user ID (simple way)
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.id;

      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setError("Failed to fetch user profile");
        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
        }
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError("Failed to load profile");
    }
  };

  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Get current user's posts
      const response = await fetch("http://localhost:5000/api/posts/my-posts", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userPosts = await response.json();
        setPosts(userPosts);
      } else {
        console.error("Failed to fetch posts");
      }
    } catch (err) {
      console.error("Posts fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="phone-frame">
          <Navbar />
          <div className="loading">Loading profile...</div>
          <BottomMenu />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="phone-frame">
          <Navbar />
          <div className="error-message">{error}</div>
          <BottomMenu />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="phone-frame">
          <Navbar />
          <div className="error-message">User not found</div>
          <BottomMenu />
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="phone-frame">
        <Navbar />
        <div className="phone-content">
          {/* Profile Info Section */}
          <div className="profile-info">
            <div className="profile-top">
              <div className="avatar">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" />
                ) : (
                  <div className="avatar-placeholder">
                    {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                  </div>
                )}
              </div>
              <div className="profile-details">
                <h2>{user.name}</h2>
                <p className="username">@{user.email.split('@')[0]}</p>
              
              </div>
            </div>
            
            <div className="profile-stats">
              <div className="stat">
                <strong>{posts.length}</strong>
                <span>Posts</span>
              </div>
              <div className="stat">
                <strong>{user.followers ? user.followers.length : 0}</strong>
                <span>Followers</span>
              </div>
              <div className="stat">
                <strong>{user.following ? user.following.length : 0}</strong>
                <span>Following</span>
              </div>
            </div>

           
            <div className="profile-actions">
              <button className="edit-profile-btn">Edit Profile</button>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </div>

          {/* Posts Section */}
          <div className="profile-posts-section">
            <h3>My Posts ({posts.length})</h3>
            {posts.length === 0 ? (
              <div className="no-posts">
                <p>No posts yet. Share something with the world! 🌟</p>
              </div>
            ) : (
              <div className="profile-posts">
                {posts.map((post) => (
                  <div key={post._id} className="post-card">
                    <div className="post-header">
                      <strong>{user.name}</strong>
                      <span className="post-date">{formatDate(post.createdAt)}</span>
                    </div>
                    <p className="post-content">{post.content}</p>
                    {post.image && (
                      <img src={post.image} alt="Post" className="post-image" />
                    )}
                    <div className="post-stats">
                      <span>❤️ {post.likes ? post.likes.length : 0}</span>
                      <span>💬 {post.comments ? post.comments.length : 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <BottomMenu />
      </div>
    </div>
  );
};

export default Profile;