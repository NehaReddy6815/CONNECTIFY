import { useState } from "react";

const PostList = ({ posts, user }) => {
  return (
    <div className="post-list">
      {posts.map((post) => (
        <Post key={post.id} post={post} user={user} />
      ))}
    </div>
  );
};

const Post = ({ post, user }) => {
  const [likes, setLikes] = useState(post.likes || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });
      
      if (response.ok) {
        setLikes(likes + 1);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          userId: user.id,
        }),
      });

      const comment = await response.json();
      
      if (response.ok) {
        setComments([...comments, comment]);
        setNewComment("");
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="post">
      <div className="post-header">
        <h4>{post.author}</h4>
        <span>{post.createdAt}</span>
      </div>
      
      <div className="post-content">
        <p>{post.content}</p>
      </div>
      
      <div className="post-actions">
        <button onClick={handleLike}>
          👍 Like ({likes})
        </button>
        <button onClick={() => setShowComments(!showComments)}>
          💬 Comment ({comments.length})
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <form onSubmit={handleComment}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit">Comment</button>
          </form>
          
          <div className="comments">
            {comments.map((comment, index) => (
              <div key={index} className="comment">
                <strong>{comment.author}:</strong> {comment.content}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostList;