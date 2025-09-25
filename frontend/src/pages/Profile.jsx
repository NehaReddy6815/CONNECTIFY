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

  // Fetch user profile and posts on mount
  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      const userId = tokenPayload.id;

      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setError("Failed to fetch profile");
        if (response.status === 401) localStorage.removeItem("token");
      }
    } catch (err) {
      console.error(err);
      setError("Error loading profile");
    }
  };

  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://localhost:5000/api/posts/my-posts", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        console.error("Failed to fetch posts");
      }
    } catch (err) {
      console.error(err);
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
    return (
      date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  if (loading) return <div className="profile-container"><Navbar /><div>Loading...</div><BottomMenu /></div>;
  if (error) return <div className="profile-container"><Navbar /><div>{error}</div><BottomMenu /></div>;
  if (!user) return <div className="profile-container"><Navbar /><div>User not found</div><BottomMenu /></div>;

  return (
    <div className="profile-container">
      <div className="phone-frame">
        <Navbar />
        <div className="phone-content">
          {/* Profile Header */}
          <div className="profile-info">
            <div className="profile-top">
              <div className="avatar">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" />
                ) : (
                  <div className="avatar-placeholder">{user.name ? user.name.charAt(0).toUpperCase() : "👤"}</div>
                )}
              </div>
              <div className="profile-details">
                <h2>{user.name}</h2>
                <p>@{user.email.split("@")[0]}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="profile-stats">
              <div className="stat"><strong>{posts.length}</strong><span>Posts</span></div>
              <div className="stat"><strong>{user.followers?.length || 0}</strong><span>Followers</span></div>
              <div className="stat"><strong>{user.following?.length || 0}</strong><span>Following</span></div>
            </div>

            {/* Actions */}
            <div className="profile-actions">
              <button className="edit-profile-btn" onClick={() => navigate("/edit-profile")}>Edit Profile</button>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </div>

          {/* Posts */}
          <div className="profile-posts-section">
            <h3>My Posts ({posts.length})</h3>
            {posts.length === 0 ? (
              <div className="no-posts">No posts yet. Share something with the world! 🌟</div>
            ) : (
              <div className="profile-posts">
                {posts.map((post) => (
                  <div key={post._id} className="post-card">
                    <div className="post-header">
                      <strong>{user.name}</strong>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    <p>{post.content}</p>
                    {post.image && <img src={post.image} alt="Post" className="post-image" />}
                    <div className="post-stats">
                      <span>❤️ {post.likes?.length || 0}</span>
                      <span>💬 {post.comments?.length || 0}</span>
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
