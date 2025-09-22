import { useState } from "react";
import CreatePost from "../components/CreatePost";
import PostList from "../components/PostList";

const Home = ({ user }) => {
  const [posts, setPosts] = useState([]);

  const handleNewPost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="home-container">
      <div className="main-content">
        <CreatePost user={user} onPostCreate={handleNewPost} />
        <PostList posts={posts} user={user} />
      </div>
    </div>
  );
};

export default Home;