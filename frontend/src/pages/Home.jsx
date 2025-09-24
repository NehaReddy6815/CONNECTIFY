import React from "react";
import Navbar from "../components/Navbar";
import BottomMenu from "../components/BottomMenu";
import "./Home.css";

const posts = [
  { user: "John", content: "Just joined Connectify! 🚀" },
  { user: "Jane", content: "Excited to connect with everyone!" },
  { user: "Alex", content: "Loving this app ❤️" },
];

const Home = () => {
  return (
    <div className="home-container">
      <div className="phone-frame">
        <div className="phone-content">
          <Navbar />
          <div className="posts-feed">
            {posts.map((post, index) => (
              <div key={index} className="post-card">
                <strong>{post.user}</strong>
                <p>{post.content}</p>
              </div>
            ))}
          </div>
        </div>
        <BottomMenu />
      </div>
    </div>
  );
};

export default Home;
