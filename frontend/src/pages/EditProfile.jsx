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

  // ✅ Backend URL
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      const userId = tokenPayload.id;

      const response = await fetch(`${API_URL}/api/users/${userId}`, {
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

      const response = await fetch(`${API_URL}/api/users/${userId}`, {
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
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-gray-700">
          Loading...
        </div>
        <BottomMenu />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-red-500">
          {error}
        </div>
        <BottomMenu />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      <Navbar />

      <div className="flex-1 w-full max-w-3xl mx-auto p-4 flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-gray-900 text-center">
          Edit Profile
        </h2>

        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-4xl">
            👤
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleUpdateProfile}
          className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-md"
        >
          {/* Name */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 w-full"
            />
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-gray-700">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write something about yourself..."
              rows="3"
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 w-full resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-4 flex-wrap justify-center">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full shadow hover:from-pink-600 hover:to-purple-600 transition w-full sm:w-auto"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-full shadow hover:bg-gray-300 transition w-full sm:w-auto"
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
