import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomMenu from "../components/BottomMenu";
import "./Profile.css"; // reuse profile styles

const EditProfile = () => {
  const [name, setName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
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
        setProfilePicture(data.profilePicture || "");
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
        body: JSON.stringify({ name, profilePicture }),
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

  if (loading) return <div className="profile-container"><Navbar /><div>Loading...</div><BottomMenu /></div>;
  if (error) return <div className="profile-container"><Navbar /><div>{error}</div><BottomMenu /></div>;

  return (
    <div className="profile-container">
      <div className="phone-frame">
        <Navbar />
        <div className="phone-content">
          <h2>Edit Profile</h2>
          <form onSubmit={handleUpdateProfile} className="edit-profile-form">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />

            <label>Profile Picture URL:</label>
            <input
              type="text"
              value={profilePicture}
              onChange={(e) => setProfilePicture(e.target.value)}
              placeholder="Enter image URL"
            />

            <button type="submit" className="edit-profile-btn">Save Changes</button>
            <button type="button" className="logout-btn" onClick={() => navigate("/profile")}>
              Cancel
            </button>
          </form>
        </div>
        <BottomMenu />
      </div>
    </div>
  );
};

export default EditProfile;
