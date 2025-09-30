import React, { useState, useEffect } from "react";
import axios from "axios";

const Comments = ({ postId, token, currentUserId, postOwnerId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ---------------------------
  // Fetch comments for this post
  // ---------------------------
  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/posts/${postId}/comments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId]);

  // ---------------------------
  // Add new comment
  // ---------------------------
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${postId}/comments`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => [...prev, res.data]);
      setNewComment("");
    } catch (err) {
      console.error(err);
      setError("Failed to add comment.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Delete comment
  // ---------------------------
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    setError(null);
    try {
      await axios.delete(
        `http://localhost:5000/api/posts/${postId}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error(err);
      setError("Failed to delete comment.");
    }
  };

  return (
    <div className="p-3 bg-gray-50 rounded-lg mt-2">
      <h4 className="font-semibold mb-2">Comments</h4>

      {loading && <p className="text-blue-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {comments.length === 0 && !loading && (
          <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
        )}

        {comments.map((c) => (
          <div
            key={c._id}
            className="flex justify-between items-start p-2 bg-white rounded shadow-sm"
          >
            <div>
              <p className="font-semibold">{c.userId?.name || "Anonymous"}</p>
              <p>{c.text}</p>
              <p className="text-xs text-gray-400">
                {new Date(c.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Delete button visible to comment owner or post owner */}
            {(c.userId?._id === currentUserId || postOwnerId === currentUserId) && (
              <button
                className="text-red-500 text-sm hover:underline"
                onClick={() => handleDeleteComment(c._id)}
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add new comment */}
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-grow border rounded px-2 py-1"
        />
        <button
          onClick={handleAddComment}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Post
        </button>
      </div>
    </div>
  );
};

export default Comments;
