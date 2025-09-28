import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomMenu from "../components/BottomMenu";
import "./Profile.css";

const Profile = () => {
  const { id } = useParams(); // dynamic profile id
  const location = useLocation();
  const fromSearch = location.state?.fromSearch;

  const [userInfo, setUserInfo] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        let userId = id || JSON.parse(atob(token.split(".")[1])).id;

        // Fetch user info
        const userResponse = await fetch(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userResponse.ok) throw new Error("Failed to fetch user info");
        const userData = await userResponse.json();
        setUserInfo(userData);

        // Fetch user's posts
        const postsResponse = await fetch(`http://localhost:5000/api/posts/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setUserPosts(postsData);
        } else {
          // fallback: filter from all posts
          const allPostsResponse = await fetch("http://localhost:5000/api/posts", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (allPostsResponse.ok) {
            const allPosts = await allPostsResponse.json();
            const myPosts = allPosts.filter(
              (post) => post.userId === userId || post.userId?._id === userId
            );
            setUserPosts(myPosts);
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id, navigate]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ Are you sure you want to delete your account? This cannot be undone."))
      return;

    try {
      const token = localStorage.getItem("token");
      const userId = JSON.parse(atob(token.split(".")[1])).id;

      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        localStorage.removeItem("token");
        alert("Your account has been deleted.");
        navigate("/");
      } else {
        alert("Failed to delete account.");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      alert("Error deleting account.");
    }
  };

  // Delete a post
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setUserPosts((prev) => prev.filter((post) => post._id !== postId));
      } else {
        alert("Failed to delete post");
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Error deleting post");
    }
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="phone-frame">
          <Navbar />
          <div className="phone-content profile-content">
            <div className="loading">Loading profile...</div>
          </div>
          <BottomMenu />
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="phone-frame">
        <Navbar />
        <div className="phone-content profile-content">
          <div className="profile-back">
            <button className="back-button" onClick={() => navigate(fromSearch ? -1 : "/home")}>
              ← Back
            </button>
          </div>

          <div className="profile-container">
            {error && <p className="error-msg">{error}</p>}

            {/* Profile Header */}
            <div className="profile-header">
              <div className="profile-avatar">👤</div>
              <h2 className="profile-name">{userInfo.username || "User"}</h2>
              <p className="profile-email">{userInfo.email}</p>
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-number">{userPosts.length}</span>
                  <span className="stat-label">Posts</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{userInfo.followers?.length || 0}</span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{userInfo.following?.length || 0}</span>
                  <span className="stat-label">Following</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!id && (
              <div className="profile-actions">
                <button className="add-post-btn" onClick={() => navigate("/addPost")}>
                  ➕ Create Post
                </button>
                <button className="logout-btn" onClick={handleLogout}>
                  🚪 Logout
                </button>
                <button className="delete-account-btn" onClick={handleDeleteAccount}>
                  ❌ Delete Account
                </button>
              </div>
            )}

            {/* Posts */}
            <div className="posts-section">
              <h3 className="posts-title">{id ? `${userInfo.username}'s Posts` : "My Posts"}</h3>

              {userPosts.length === 0 ? (
                <div className="no-posts">
                  <p>No posts yet!</p>
                  {!id && (
                    <button className="create-first-post-btn" onClick={() => navigate("/addPost")}>
                      Create your first post 🎉
                    </button>
                  )}
                </div>
              ) : (
                <div className="posts-grid">
                  {userPosts.map((post) => (
                    <div key={post._id} className="profile-post-card">
                      <div className="post-header">
                        <div className="post-date">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                        {!id && (
                          <button
                            className="delete-post-btn"
                            onClick={() => handleDeletePost(post._id)}
                            title="Delete post"
                          >
                            🗑️
                          </button>
                        )}
                      </div>

                      {post.text && <p className="post-text">{post.text}</p>}

                      {post.image && (
                        <div className="post-image-container">
                          <img
                            src={post.image}
                            alt="Post content"
                            className="post-image"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <BottomMenu />
      </div>
    </div>
  );
};

export default Profile;
