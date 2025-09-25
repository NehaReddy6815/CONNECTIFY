import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomMenu from "../components/BottomMenu";
import "./AddPost.css";

const AddPost = () => {
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      const userId = tokenPayload.id;

      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, text, image }),
      });

      if (response.ok) {
        navigate("/profile"); // after posting → go back to profile
      } else {
        const errData = await response.json();
        setError(errData.message || "Failed to add post");
      }
    } catch (err) {
      console.error(err);
      setError("Error creating post");
    }
  };

  return (
    <div className="phone-frame">
      <Navbar />
      <div className="phone-content">
        <h2 className="addpost-title">Create a Post</h2>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit} className="addpost-form">
          <textarea
            className="post-textarea"
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />

          <input
            type="text"
            className="post-input"
            placeholder="Image URL (optional)"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />

          <button type="submit" className="post-btn">Post</button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/profile")}
          >
            Cancel
          </button>
        </form>
      </div>
      <BottomMenu />
    </div>
  );
};

export default AddPost;
