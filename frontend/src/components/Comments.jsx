import React, { useState, useEffect } from "react";
import axios from "axios";

const Comments = ({ postId, token }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // Fetch comments for this post on mount
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/${postId}/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComments(res.data);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };
    fetchComments();
  }, [postId, token]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${postId}/comment`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([...comments, res.data]);
      setNewComment("");
    } catch (err) {
      console.error(err);
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
