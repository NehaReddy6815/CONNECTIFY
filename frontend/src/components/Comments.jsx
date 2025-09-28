// components/Comments.jsx
import React, { useState } from "react";
import axios from "axios";

const Comments = ({ post, token, currentUserId }) => {
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${post._id}/comment`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments([...comments, res.data]);
      setNewComment("");
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  return (
    <div className="comments-section">
      {comments.map((c) => (
        <div key={c._id} className="comment">
          <strong>{c.userId?.username || "Anonymous"}:</strong> {c.text}
        </div>
      ))}

      <div className="comment-input-container">
        <input
          type="text"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button onClick={handleSubmitComment}>Submit</button>
      </div>
    </div>
  );
};

export default Comments;
