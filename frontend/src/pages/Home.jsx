import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import BottomMenu from "../components/BottomMenu";
import "./Home.css";

const Home = () => {
  const [posts, setPosts] = useState([]);

  // fetch posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/posts");
        const data = await res.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="home-container">
      <div className="phone-frame">
        <Navbar />
        <div className="phone-content">
          <div className="posts-feed">
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <div key={index} className="post-card">
                  <strong>{post.user?.name || "Anonymous"}</strong>
                  <p>{post.content}</p>
                </div>
              ))
            ) : (
              <p className="no-posts">No posts yet.</p>
            )}
          </div>
        </div>
        <BottomMenu />
      </div>
    </div>
  );
};

export default Home;
