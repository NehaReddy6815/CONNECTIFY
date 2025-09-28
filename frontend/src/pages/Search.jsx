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
          `http://localhost:5000/api/search?name=${encodeURIComponent(searchQuery)}`,
          { headers: { Authorization: `Bearer ${token}` } }
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
  }, [searchQuery]);

  const handleFollowUser = async (userIdToFollow) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userIdToFollow}/follow`, {
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
      console.error(err);
    }
  };

  return (
    <div className="search-container">
      <div className="search-phone-frame">
        <div className="search-navbar-wrapper">
          <Navbar />
        </div>
        <div className="search-phone-content">
          <div className="search-header">
            <button className="search-back-button" onClick={() => navigate("/home")}>
              ← Back
            </button>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="search-results">
            {loading && <p className="search-info-text">Searching...</p>}
            {error && <p className="search-error">{error}</p>}

            {!loading && users.length > 0
              ? users.map((user) => (
                  <div key={user._id} className="search-user-card">
                    <div
                      className="search-user-info"
                      onClick={() =>
                        navigate(`/profile/${user._id}`, { state: { fromSearch: true } })
                      }
                    >
                      <h3 className="search-user-name">{user.username || user.name}</h3>
                      <p className="search-user-email">{user.email}</p>
                      {user.bio && <p className="search-user-bio">{user.bio}</p>}
                    </div>
                    {user._id !== currentUserId && (
                      <button
                        className={`search-follow-btn ${
                          user.followers?.includes(currentUserId) ? "search-following" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowUser(user._id);
                        }}
                      >
                        {user.followers?.includes(currentUserId) ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                ))
              : !loading && searchQuery.trim() && !error && (
                  <p className="search-info-text">No users found</p>
                )}
          </div>
        </div>
        <div className="search-bottom-menu-wrapper">
          <BottomMenu />
        </div>
      </div>
    </div>
  );
};

export default Search;