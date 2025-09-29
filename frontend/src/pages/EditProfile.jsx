import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomMenu from "../components/BottomMenu";


const EditProfile = () => {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      const userId = tokenPayload.id;

      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setName(data.name);
        setBio(data.bio || "");
      } else {
        setError("Failed to fetch profile");
      }
    } catch (err) {
      console.error(err);
      setError("Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      const userId = tokenPayload.id;

      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, bio }),
      });

      if (response.ok) {
        navigate("/profile");
      } else {
        const errData = await response.json();
        setError(errData.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Error updating profile");
    }
  };

  if (loading) {
    return (
      <div className="phone-frame">
        <Navbar />
        <div className="phone-content">Loading...</div>
        <BottomMenu />
      </div>
    );
  }

  if (error) {
    return (
      <div className="phone-frame">
        <Navbar />
        <div className="phone-content">{error}</div>
        <BottomMenu />
      </div>
    );
  }

  return (
    <div className="phone-frame">
      <Navbar />
      <div className="phone-content">
        <h2 className="title">Edit Profile</h2>

        {/* Emoji Avatar */}
        <div className="emoji-avatar">👤</div>

        <form onSubmit={handleUpdateProfile} className="edit-profile-form">
          {/* Name */}
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />

          {/* Bio */}
          <label>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write something about yourself..."
            rows="3"
          />

          {/* Buttons */}
          <div className="button-group">
            <button type="submit" className="save-btn">Save</button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/profile")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <BottomMenu />
    </div>
  );
};

export default EditProfile;
