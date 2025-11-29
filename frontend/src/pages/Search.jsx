import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomMenu from "../components/BottomMenu";

const Search = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const currentUserId = token
    ? JSON.parse(atob(token.split(".")[1])).id
    : null;

  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchQuery.trim()) {
        setUsers([]);
        setError("");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `${API_URL}/api/search?name=${encodeURIComponent(searchQuery)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, token, API_URL]);

  const handleFollowUser = async (userIdToFollow) => {
    try {
      const res = await fetch(`${API_URL}/api/users/${userIdToFollow}/follow`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userIdToFollow
              ? {
                  ...u,
                  followers: u.followers?.includes(currentUserId)
                    ? u.followers.filter((id) => id !== currentUserId)
                    : [...(u.followers || []), currentUserId],
                }
              : u
          )
        );
      }
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      {/* Navbar */}
      <div className="sticky top-0 z-40">
        <Navbar />
      </div>

      {/* Search Content */}
      <div className="flex-1 p-4 overflow-y-auto max-w-3xl mx-auto w-full">
        {/* Back + Search Input */}
        <div className="flex items-center gap-3 mb-4">
          <button
            className="px-5 py-2 bg-pink-100 text-pink-600 font-semibold rounded-full hover:bg-pink-200 transition"
            onClick={() => navigate("/home")}
          >
            ← Back
          </button>

          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        {/* Search Results */}
        <div className="flex flex-col gap-3">
          {loading && (
            <p className="text-gray-500 text-center py-4">Searching...</p>
          )}

          {error && (
            <p className="text-red-500 text-center py-4">{error}</p>
          )}

          {!loading && users.length > 0 ? (
            users.map((user) => (
              <div
                key={user._id}
                className="flex justify-between items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer"
                onClick={() =>
                  navigate(
                    user._id === currentUserId
                      ? "/profile"
                      : `/profile/${user._id}`
                  )
                }
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {user.username || user.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                  {user.bio && (
                    <p className="text-gray-600 text-sm">{user.bio}</p>
                  )}
                </div>

                {user._id !== currentUserId && (
                  <button
                    className={`px-5 py-2 rounded-full font-semibold transition-colors ${
                      user.followers?.includes(currentUserId)
                        ? "bg-white text-pink-500 border border-pink-500 hover:bg-pink-50"
                        : "bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollowUser(user._id);
                    }}
                  >
                    {user.followers?.includes(currentUserId)
                      ? "Following"
                      : "Follow"}
                  </button>
                )}
              </div>
            ))
          ) : !loading && searchQuery.trim() && !error ? (
            <p className="text-gray-500 text-center py-4">No users found</p>
          ) : null}
        </div>
      </div>

      {/* Bottom Menu */}
      <div className="sticky bottom-0 z-40">
        <BottomMenu />
      </div>
    </div>
  );
};

export default Search;
