import React, { useState, useEffect } from "react";

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/comments/${postId}`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    const userId = JSON.parse(atob(token.split(".")[1])).id;

    try {
      const res = await fetch("http://localhost:5000/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, userId, text: newComment }),
      });

      if (res.ok) {
        setNewComment("");
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comment-section">
      <div className="comments-list">
        {comments.map((c) => (
          <div key={c._id} className="comment">
            <strong>{c.userId.name}:</strong> {c.text}
          </div>
        ))}
      </div>
      <div className="add-comment">
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button onClick={handleAddComment} disabled={loading}>
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
