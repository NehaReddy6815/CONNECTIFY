import { useState } from "react";

const CreatePost = ({ user, onPostCreate }) => {
  const [content, setContent] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      // API call to create post
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
        },
        body: JSON.stringify({
          content,
          userId: user.id,
        }),
      });

      const newPost = await response.json();
      
      if (response.ok) {
        onPostCreate(newPost);
        setContent("");
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="create-post">
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder={`What's on your mind, ${user.name}?`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="3"
        />
        <button type="submit">Post</button>
      </form>
    </div>
  );
};

export default CreatePost;