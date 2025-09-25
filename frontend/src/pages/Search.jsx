import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar"; // adjust path
import BottomMenu from "../components/BottomMenu"; // adjust path
import "./Search.css";

const Search = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
          `http://localhost:5000/api/search?name=${encodeURIComponent(searchQuery)}`
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
                  <div key={user._id} className="user-card">
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                    {user.bio && <p><em>{user.bio}</em></p>}
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
