// pages/Home.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomMenu from "../components/BottomMenu";
import Comments from "../components/Comments";
import axios from "axios";
import "./Home.css";

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
      console.error("Error liking post:", err);
    }
  };

  return (
    <div className="home-container">
      <div className="phone-frame">
        <Navbar />
        <div className="phone-content">
          <h2 className="home-title">Home Feed</h2>

          {loading && <p className="info-text">Loading posts...</p>}
          {error && <p className="error-text">{error}</p>}

          {!loading && posts.length === 0 && (
            <div className="no-posts">
              <p>No posts yet from people you follow.</p>
            </div>
          )}

          {!loading &&
            posts.map((post) => (
              <div key={post._id} className="post-card">
                <div className="post-header">
                  <strong className="post-user">{post.userId?.username || "Anonymous"}</strong>
                  <span className="post-date">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="post-content">
                  {post.text && <p>{post.text}</p>}
                  {post.image && <img src={post.image} alt="Post" className="post-image" />}
                </div>

                <div className="post-actions">
                  <button
                    className={`like-btn ${post.likes?.includes(currentUserId) ? "liked" : ""}`}
                    onClick={() => handleLike(post._id)}
                  >
                    {post.likes?.includes(currentUserId) ? "❤️" : "🤍"} {post.likes?.length || 0}
                  </button>
                </div>

                <Comments post={post} token={token} currentUserId={currentUserId} />
              </div>
            ))}
        </div>
        <BottomMenu />
      </div>
    </div>
  );
};

export default Home;
