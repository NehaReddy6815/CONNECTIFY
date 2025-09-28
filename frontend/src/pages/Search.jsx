import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomMenu from "../components/BottomMenu";
import "./Search.css";

const Search = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const currentUserId = token ? JSON.parse(atob(token.split(".")[1])).id : null;

  // Fetch users from backend
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
        const response = await fetch(
          `http://localhost:5000/api/search?name=${encodeURIComponent(searchQuery)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError(`Search failed: ${error.message}`);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => fetchUsers(), 300); // debounce
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Follow / Unfollow user
  const handleFollowUser = async (userIdToFollow) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${userIdToFollow}/follow`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Update local state to reflect follow/unfollow
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userIdToFollow
              ? {
                  ...user,
                  followers: user.followers?.includes(currentUserId)
                    ? user.followers.filter((id) => id !== currentUserId) // unfollow
                    : [...(user.followers || []), currentUserId], // follow
                }
              : user
          )
        );
      }
    } catch (err) {
      console.error("Error following/unfollowing:", err);
    }
  };

  return (
    <div className="center-wrapper">
      <div className="phone-wrapper">
        <Navbar />

        <div className="search-content">
          <button className="back-button" onClick={() => navigate("/home")}>
            ← Back
          </button>

          <div className="search-container">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="results">
              {loading && <p>Searching...</p>}
              {error && <p className="error">{error}</p>}

              {!loading && users.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user._id}
                    className="user-card"
                    onClick={() => navigate(`/profile/${user._id}`)}
                  >
                    <h3>{user.username || user.name}</h3>
                    <p>{user.email}</p>
                    {user.bio && <p><em>{user.bio}</em></p>}

                    {user._id !== currentUserId && (
                      <button
                        className={`follow-btn ${
                          user.followers?.includes(currentUserId)
                            ? "following"
                            : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation(); // prevent navigating to profile
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
              ) : (
                !loading &&
                searchQuery.trim() &&
                !error && <p>No users found</p>
              )}
            </div>
          </div>
        </div>

        <BottomMenu />
      </div>
    </div>
  );
};

export default Search;
