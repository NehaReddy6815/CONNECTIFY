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

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size must be less than 2MB");
        // Clear any previously selected image
        setSelectedImage(null);
        setImagePreview("");
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

      const postData = {
        userId,
        text: text.trim(),
        image: imageData,
      };

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
        // Log the response details
        console.error("Response status:", response.status);
        console.error("Response statusText:", response.statusText);
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errData = await response.json();
          setError(errData.message || "Failed to add post");
        } else {
          const textResponse = await response.text();
          console.error("Non-JSON response:", textResponse.substring(0, 500));
          setError(`Server error (${response.status}): Backend returned HTML instead of JSON. Check if the API endpoint exists.`);
        }
      }
    } catch (err) {
      console.error("Full error:", err);
      setError(`Error creating post: ${err.message || err.toString()}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      {/* Navbar */}
      <div className="sticky top-0 z-40">
        <Navbar />
      </div>

      {/* Content */}
      <div className="flex-1 w-full p-4 pb-32 flex flex-col overflow-y-auto max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">Create a Post</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Debug info - Remove this after testing */}
        <div className="mb-4 p-2 bg-blue-50 border border-blue-300 rounded text-xs">
          <p>Image selected: {selectedImage ? "Yes ✓" : "No ✗"}</p>
          <p>Text length: {text.length}</p>
          <p>Button disabled: {(uploading || (!text.trim() && !selectedImage)) ? "Yes" : "No"}</p>
          <p className="font-bold text-red-600">👇 SCROLL DOWN - POST BUTTON SHOULD BE BELOW 👇</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          {/* Textarea */}
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none min-h-[100px] max-h-[200px] overflow-y-auto"
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Gallery Upload */}
          <div>
            <input
              id="gallery-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              style={{ display: "none" }}
            />
            <label
              htmlFor="gallery-input"
              className="inline-block px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full cursor-pointer hover:opacity-90 transition"
            >
              Choose Image
            </label>
          </div>

          {/* Preview */}
          {imagePreview && (
            <div className="relative mt-2 w-full border rounded-lg p-2 bg-white shadow-sm">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full rounded-lg"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 shadow-lg"
              >
                ✕
              </button>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-3 bg-yellow-200 border-4 border-red-500 p-4">
            <p className="w-full text-center text-red-600 font-bold mb-2">🚨 BUTTONS SECTION - IF YOU SEE THIS YELLOW BOX, BUTTONS ARE HERE 🚨</p>
            <button
              type="submit"
              disabled={uploading || (!text.trim() && !selectedImage)}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full shadow-lg border-2 border-pink-600 hover:from-pink-600 hover:to-purple-600 hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:border-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
            >
              {uploading ? "⏳ Posting..." : "✨ Post"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/home")}
              disabled={uploading}
              className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-full shadow hover:bg-gray-300 disabled:opacity-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Newly created post */}
        {newPostData && (
          <div className="mt-6 border rounded-lg p-4 bg-white shadow w-full">
            <p className="mb-2">{newPostData.text}</p>
            {newPostData.image && (
              <img
                src={newPostData.image}
                alt="post"
                className="w-full rounded-lg mb-2"
              />
            )}
            <CommentSection postId={newPostData._id} />
          </div>
        )}
      </div>

      {/* Bottom Menu */}
      <div className="sticky bottom-0 z-40">
        <BottomMenu />
      </div>
    </div>
  );
};

export default AddPost;