// ==================== src/pages/Messages.jsx ====================
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import Navbar from "../components/Navbar";
import BottomMenu from "../components/BottomMenu";

const socket = io("http://localhost:5000");

const Messages = () => {
  const [followedUsers, setFollowedUsers] = useState([]);
  const [notFollowedUsers, setNotFollowedUsers] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [error, setError] = useState(null);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);

  const token = localStorage.getItem("token");
  const messagesEndRef = useRef(null);

  // Initial load (users + socket setup)
  useEffect(() => {
    if (!token) {
      setError("Please login to access messages");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(payload.id);
      socket.emit("joinRoom", payload.id);
    } catch {
      setError("Invalid token");
    }

    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/messages/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowedUsers(res.data.followed || []);
        setNotFollowedUsers(res.data.notFollowed || []);
      } catch {
        setError("Failed to load users");
      }
    };
    fetchUsers();

    const handleReceiveMessage = (data) => {
      if (activeChatUser && data.senderId === activeChatUser._id) {
        setMessages((prev) => [...prev, data]);
      }
    };

    const handleMessageDeleted = (data) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== data.messageId));
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageDeleted", handleMessageDeleted);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageDeleted", handleMessageDeleted);
    };
  }, [token, activeChatUser]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Select user
  const handleSelectUser = async (user) => {
    setActiveChatUser(user);
    setMessages([]);
    setError(null);

    try {
      const res = await axios.get(
        `http://localhost:5000/api/messages/${currentUserId}/${user._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data || []);
    } catch {
      setError("Failed to load chat messages");
    }
  };

  // Send message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChatUser || !currentUserId) return;

    const messageData = {
      senderId: currentUserId,
      receiverId: activeChatUser._id,
      text: newMessage.trim(),
    };

    socket.emit("sendMessage", messageData);

    setMessages((prev) => [
      ...prev,
      { ...messageData, createdAt: new Date(), _id: `temp-${Date.now()}` },
    ]);

    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`http://localhost:5000/api/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      socket.emit("deleteMessage", {
        messageId,
        receiverId: activeChatUser._id,
      });

      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch {
      setError("Failed to delete message");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Time formatting
  const formatTime = (date) => {
    try {
      return new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      <Navbar />

      {/* MAIN LAYOUT - leaves space for fixed Navbar & BottomMenu */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto gap-2 lg:gap-4 p-2 lg:p-4
                      pt-16 pb-20 lg:pt-[72px] lg:pb-[72px] overflow-hidden">
        
        {/* Inbox Sidebar (Desktop) */}
        <div className="hidden lg:flex lg:w-1/3 xl:w-1/4 bg-white rounded-xl shadow p-4 flex-col gap-2 overflow-y-auto">
          <h2 className="text-xl font-bold mb-2 text-gray-800">Inbox</h2>
          {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
          
          {followedUsers.length > 0 && (
            <div className="mb-2">
              <h3 className="font-semibold text-gray-600 mb-2 text-sm">Following</h3>
              {followedUsers.map((u) => (
                <button
                  key={u._id}
                  onClick={() => handleSelectUser(u)}
                  className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition flex items-center gap-3 ${
                    activeChatUser?._id === u._id ? "bg-pink-50 border border-pink-200" : ""
                  }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-sm text-white font-semibold">
                    {u.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">{u.name}</div>
                    <div className="text-xs text-gray-500 truncate">@{u.username}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {notFollowedUsers.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-600 mb-2 text-sm">Other Users</h3>
              {notFollowedUsers.map((u) => (
                <button
                  key={u._id}
                  onClick={() => handleSelectUser(u)}
                  className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition flex items-center gap-3 ${
                    activeChatUser?._id === u._id ? "bg-pink-50 border border-pink-200" : ""
                  }`}
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm text-gray-600 font-semibold">
                    {u.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">{u.name}</div>
                    <div className="text-xs text-gray-500 truncate">@{u.username}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {followedUsers.length === 0 && notFollowedUsers.length === 0 && !error && (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">👥</div>
              <p>No users available</p>
            </div>
          )}
        </div>

        {/* Chat Area */}
        {activeChatUser ? (
          <div className="flex-1 bg-white rounded-xl shadow flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-3 lg:p-4 border-b border-gray-200 flex items-center gap-3 bg-gradient-to-r from-pink-50 to-purple-50 flex-shrink-0">
              <button
                onClick={() => setActiveChatUser(null)}
                className="lg:hidden p-2 hover:bg-white rounded-full transition"
              >
                ←
              </button>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {activeChatUser.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-800 text-base lg:text-lg truncate">{activeChatUser.name}</div>
                <div className="text-xs lg:text-sm text-gray-500 truncate">@{activeChatUser.username}</div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-3 lg:p-4 overflow-y-auto flex flex-col gap-2 lg:gap-3">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <div className="text-5xl lg:text-6xl mb-4">💬</div>
                  <p className="text-base lg:text-lg">No messages yet</p>
                  <p className="text-xs lg:text-sm">Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={msg._id || idx}
                    className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                    onMouseEnter={() => setHoveredMessageId(msg._id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    <div className="relative group">
                      <div
                        className={`max-w-[80%] lg:max-w-[75%] px-3 py-2 lg:px-4 lg:py-3 rounded-2xl break-words shadow-sm ${
                          msg.senderId === currentUserId
                            ? "bg-pink-500 text-white rounded-br-none"
                            : "bg-gray-100 text-gray-800 rounded-bl-none"
                        }`}
                      >
                        <div className="leading-relaxed text-sm lg:text-base">{msg.text}</div>
                        <div className={`text-xs mt-1 ${msg.senderId === currentUserId ? "text-pink-100" : "text-gray-400"}`}>
                          {formatTime(msg.createdAt)}
                        </div>
                      </div>

                      {msg.senderId === currentUserId && hoveredMessageId === msg._id && (
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition shadow-lg z-10"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef}></div>
            </div>

            {/* Input */}
            <div className="p-3 lg:p-4 border-t border-gray-200 bg-white flex-shrink-0">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 lg:px-4 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full hover:from-pink-600 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-xl shadow flex items-center justify-center">
            <div className="text-center p-4">
              <div className="text-5xl lg:text-7xl mb-4">💬</div>
              <p className="text-lg lg:text-xl text-gray-600 font-medium">Select a user to start chatting</p>
              <p className="text-xs lg:text-sm text-gray-400 mt-2">Choose from your contacts</p>
            </div>
          </div>
        )}
      </div>

      <BottomMenu />
    </div>
  );
};

export default Messages;
