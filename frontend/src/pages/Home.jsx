import React from "react";
import Navbar from "../components/Navbar";

const posts = [
  { user: "John", content: "Just joined Connectify! 🚀" },
  { user: "Jane", content: "Excited to connect with everyone!" },
  { user: "Alex", content: "Loving this app ❤️" },
];

const Home = () => {
  return (
    <div style={{ paddingBottom: "60px" }}> {/* Extra padding so content isn’t too close to bottom */}
      <Navbar />
      <div style={{ padding: "10px" }}>
        {posts.map((post, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "10px",
              marginBottom: "10px",
              backgroundColor: "#fff",
            }}
          >
            <strong>{post.user}</strong>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
