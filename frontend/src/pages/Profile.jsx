import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomMenu from "../components/BottomMenu";
import "./Profile.css";

const Profile = () => {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileAndPosts();
  }, []);

  const fetchProfileAndPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      const userId = tokenPayload.id;

      // Fetch profile
      const profileRes = await fetch(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch posts
      const postsRes = await fetch(`http://localhost:5000/api/posts/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (profileRes.ok) {
        const data = await profileRes.json();
        setName(data.name);
        setBio(data.bio || "");
      } else {
        setError("Failed to fetch profile");
      }

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData);
      } else {
        console.warn("Could not fetch posts");
      }
    } catch (err) {
      console.error(err);
      setError("Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="phone-frame">
        <Navbar />
        <div className="phone-content">Loading...</div>
        <BottomMenu />
      </div>
    );
  }

  if (error) {
    return (
      <div className="phone-frame">
        <Navbar />
        <div className="phone-content">{error}</div>
        <BottomMenu />
      </div>
    );
  }

  return (
    <div className="phone-frame">
      <Navbar />
      <div className="phone-content">
        {/* Emoji Avatar */}
        <div className="emoji-avatar">👤</div>

        {/* Name + Bio */}
        <h2 className="profile-name">{name}</h2>
        <p className="profile-bio">{bio ? bio : "No bio added yet."}</p>

        {/* Edit button */}
        <button
          className="edit-profile-btn"
          onClick={() => navigate("/edit-profile")}
        >
          Edit Profile
        </button>

        {/* Posts */}
        <h3 className="section-title">My Posts</h3>
        <div className="posts-list">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post._id} className="post-card">
                <p className="post-text">{post.text}</p>
                {post.image && <img src={post.image} alt="post" className="post-image" />}
                <span className="post-date">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <p className="no-posts">You haven’t posted anything yet.</p>
          )}
        </div>
      </div>
      <BottomMenu />
    </div>
  );
};

export default Profile;
