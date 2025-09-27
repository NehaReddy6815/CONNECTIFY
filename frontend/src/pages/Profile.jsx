import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomMenu from "../components/BottomMenu";
import "./Profile.css";

const Profile = () => {
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

        const tokenPayload = JSON.parse(atob(token.split(".")[1]));
        const userId = tokenPayload.id;

        // Fetch user info
        const userResponse = await fetch(`http://localhost:5000/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserInfo(userData);
        }

        // Fetch user's posts
        const postsResponse = await fetch(`http://localhost:5000/api/posts/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setUserPosts(postsData);
        } else {
          // If no specific user posts endpoint, filter from all posts
          const allPostsResponse = await fetch("http://localhost:5000/api/posts", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (allPostsResponse.ok) {
            const allPosts = await allPostsResponse.json();
            const myPosts = allPosts.filter(post => 
              post.userId === userId || post.userId?._id === userId
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
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove post from state
        setUserPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
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
          <div className="phone-content">
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
        <div className="phone-content">
          <div className="profile-container">
            {error && <p className="error-msg">{error}</p>}
            
            {/* Profile Header */}
            <div className="profile-header">
              <div className="profile-avatar">
                👤
              </div>
              <h2 className="profile-name">{userInfo.username || "User"}</h2>
              <p className="profile-email">{userInfo.email}</p>
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-number">{userPosts.length}</span>
                  <span className="stat-label">Posts</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="profile-actions">
              <button 
                className="add-post-btn"
                onClick={() => navigate("/addPost")}
              >
                ➕ Create Post
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>

            {/* User's Posts */}
            <div className="posts-section">
              <h3 className="posts-title">My Posts</h3>
              
              {userPosts.length === 0 ? (
                <div className="no-posts">
                  <p>No posts yet!</p>
                  <button 
                    className="create-first-post-btn"
                    onClick={() => navigate("/addPost")}
                  >
                    Create your first post 🎉
                  </button>
                </div>
              ) : (
                <div className="posts-grid">
                  {userPosts.map((post) => (
                    <div key={post._id} className="profile-post-card">
                      <div className="post-header">
                        <div className="post-date">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                        <button 
                          className="delete-post-btn"
                          onClick={() => handleDeletePost(post._id)}
                          title="Delete post"
                        >
                          🗑️
                        </button>
                      </div>
                      
                      {post.text && (
                        <p className="post-text">{post.text}</p>
                      )}
                      
                      {post.image && (
                        <div className="post-image-container">
                          <img 
                            src={post.image} 
                            alt="Post content" 
                            className="post-image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
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