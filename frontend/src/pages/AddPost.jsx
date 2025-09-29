import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomMenu from "../components/BottomMenu";
import CommentSection from "../components/Comments";


const AddPost = () => {
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [newPostData, setNewPostData] = useState(null);
  const navigate = useNavigate();

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size must be less than 2MB");
        return;
      }

      setSelectedImage(file);

      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    document.getElementById("gallery-input").value = "";
  };

  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim() && !selectedImage) {
      setError("Please add some text or select an image");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      const userId = tokenPayload.id;

      let imageData = null;
      if (selectedImage) {
        imageData = await convertToBase64(selectedImage);
      }

      const postData = { userId, text: text.trim(), image: imageData };

      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const createdPost = await response.json();
        setNewPostData(createdPost);
        setText("");
        setSelectedImage(null);
        setImagePreview("");
        setError("");
        document.getElementById("gallery-input").value = "";
      } else {
        const errData = await response.json();
        setError(errData.message || "Failed to add post");
      }
    } catch (err) {
      console.error(err);
      setError("Error creating post");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="phone-frame">
      <Navbar />
      <div className="phone-content addpost-content">
        <h2 className="addpost-title">Create a Post</h2>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit} className="addpost-form">
          <textarea
            className="post-textarea"
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Gallery Upload */}
          <div className="upload-section">
            <input
              id="gallery-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              style={{ display: "none" }}
            />
            <label htmlFor="gallery-input" className="gallery-btn">
              📱 Choose from Gallery
            </label>
          </div>

          {/* Preview */}
          {imagePreview && (
            <div className="image-preview-section">
              <div className="preview-header">
                <span>Selected Image:</span>
                <button
                  type="button"
                  onClick={removeImage}
                  className="remove-btn"
                >
                  ❌ Remove
                </button>
              </div>
              <img src={imagePreview} alt="Preview" className="preview-image" />
            </div>
          )}

          <div className="form-buttons">
            <button
              type="submit"
              className="post-button"
              disabled={uploading || (!text.trim() && !selectedImage)}
            >
              {uploading ? "📤 Posting..." : "📝 Post"}
            </button>

            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/home")}
              disabled={uploading}
            >
              ❌ Cancel
            </button>
          </div>
        </form>

        {/* Show newly created post with comments */}
        {newPostData && (
          <div className="new-post-preview">
            <p>{newPostData.text}</p>
            {newPostData.image && (
              <img src={newPostData.image} alt="post" className="new-post-image" />
            )}
            <CommentSection postId={newPostData._id} />
          </div>
        )}
      </div>
      <BottomMenu />
    </div>
  );
};

export default AddPost;
