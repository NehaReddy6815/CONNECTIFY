import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import Navbar from "../components/Navbar";
import BottomMenu from "../components/BottomMenu";

const socket = io("http://localhost:5000");

const Messages = () => {
  const [users, setUsers] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    let payload;
    try {
      payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(payload.id);
    } catch (err) {
      setError("Invalid token. Please login again.");
      return;
    }

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Axios error:", err.response || err.message);
        setError("Failed to load users. Please try again later.");
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();

    // Listen for incoming messages
    socket.on("receiveMessage", (data) => {
      if (activeChatUser && data.senderId === activeChatUser._id) {
        setMessages(prev => [...prev, data]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [token, activeChatUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectUser = async (user) => {
    setActiveChatUser(user);
    setMessages([]);

    try {
      const res = await axios.get(
        `http://localhost:5000/api/messages/${user._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load chat messages.");
    }
  };

  const handleSendMessage = () => {
    if (!newMessage || !activeChatUser) return;

    const messageData = {
      senderId: currentUserId,
      receiverId: activeChatUser._id,
      text: newMessage,
      createdAt: new Date(),
    };

    socket.emit("sendMessage", messageData);
    setMessages(prev => [...prev, messageData]);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row max-w-5xl mx-auto gap-4 p-4 pb-24">
        {/* Users list / Inbox */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <h2 className="text-xl font-bold mb-2">Inbox</h2>

          {loadingUsers && <p className="text-gray-500">Loading users...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loadingUsers && !error && users.length === 0 && (
            <p className="text-gray-500">No users available.</p>
          )}

          {!loadingUsers && !error && users.map(user => (
            <button
              key={user._id}
              onClick={() => handleSelectUser(user)}
              className={`text-left p-2 rounded hover:bg-gray-100 transition ${
                activeChatUser?._id === user._id ? "bg-gray-200" : ""
              }`}
            >
              {user.name || "Anonymous"} ({user.username})
            </button>
          ))}
        </div>

        {/* Chat Window */}
        {activeChatUser && (
          <div className="w-full lg:w-2/3 bg-white rounded-xl shadow flex flex-col">
            <div className="p-4 border-b border-gray-200 font-bold text-gray-700">
              Chat with {activeChatUser.name || "Anonymous"}
            </div>

            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`max-w-xs px-3 py-2 rounded-xl ${
                    msg.senderId === currentUserId
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white self-end"
                      : "bg-gray-100 text-gray-800 self-start"
                  }`}
                >
                  {msg.text}
                  <div className="text-xs text-gray-400 mt-1 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </div>

            <div className="p-4 border-t border-gray-200 flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomMenu />
    </div>
  );
};

export default Messages;
