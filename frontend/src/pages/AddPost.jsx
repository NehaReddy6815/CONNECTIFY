import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomMenu from "../components/BottomMenu";
import "./AddPost.css";

const AddPost = () => {
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // Handle image selection from gallery
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file size (max 2MB for base64)
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size must be less than 2MB");
        return;
      }

      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    document.getElementById('gallery-input').value = '';
  };

  // Convert image to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

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
        // Convert image to base64
        imageData = await convertToBase64(selectedImage);
      }

      // Send as JSON (not FormData)
      const postData = {
        userId,
        text: text.trim(),
        image: imageData // Base64 string or null
      };

      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // JSON, not FormData
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData), // JSON, not FormData
      });

      if (response.ok) {
        // Clear form
        setText("");
        setSelectedImage(null);
        setImagePreview("");
        setError("");
        document.getElementById('gallery-input').value = '';
        
        // Navigate to home to see the new post
        navigate("/home");
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
      <div className="phone-content">
        <h2 className="addpost-title">Create a Post</h2>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit} className="addpost-form">
          <textarea
            className="post-textarea"
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Gallery Upload Button */}
          <div className="upload-section">
            <input
              id="gallery-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
            <label htmlFor="gallery-input" className="gallery-btn">
              📱 Choose from Gallery
            </label>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="image-preview-section">
              <div className="preview-header">
                <span>Selected Image:</span>
                <button type="button" onClick={removeImage} className="remove-btn">
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
      </div>
      <BottomMenu />
    </div>
  );
};

export default AddPost;