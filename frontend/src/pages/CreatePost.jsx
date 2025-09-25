import { useState } from "react";

const CreatePost = ({ user, onPostCreate }) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const token = localStorage.getItem("token"); // send JWT token
      if (!token) return alert("You must be logged in!");

      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text,       // use "text" to match backend schema
          image,      // optional
        }),
      });

      const newPost = await response.json();
      
      if (response.ok) {
        onPostCreate(newPost);
        setText("");
        setImage("");
      } else {
        console.error("Error creating post:", newPost.message);
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <div className="create-post">
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder={`What's on your mind, ${user.name}?`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows="3"
          required
        />
        <input
          type="text"
          placeholder="Image URL (optional)"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
        <button type="submit">Post</button>
      </form>
    </div>
  );
};

export default CreatePost;
