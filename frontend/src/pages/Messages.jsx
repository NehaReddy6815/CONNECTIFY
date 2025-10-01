
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
  const [isTyping, setIsTyping] = useState(false);

  const token = localStorage.getItem("token");
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!token) {
      setError("Please login to access messages");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(payload.id);
      
      // Join socket room for this user
      socket.emit("joinRoom", payload.id);
    } catch (err) {
      setError("Invalid token");
    }

    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/messages/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowedUsers(res.data.followed || []);
        setNotFollowedUsers(res.data.notFollowed || []);
      } catch (err) {
        setError("Failed to load users");
      }
    };
    fetchUsers();

    // Socket event listeners
    const handleReceiveMessage = (data) => {
      if (activeChatUser && data.senderId === activeChatUser._id) {
        setMessages(prev => [...prev, data]);
      }
    };

    const handleMessageSent = (data) => {
      // Message sent successfully
    };

    const handleMessageError = (data) => {
      setError(data.error);
      setTimeout(() => setError(null), 3000);
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageSent", handleMessageSent);
    socket.on("messageError", handleMessageError);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageSent", handleMessageSent);
      socket.off("messageError", handleMessageError);
    };
  }, [token, activeChatUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    } catch (err) {
      console.error("Load messages error:", err);
      setError("Failed to load chat messages");
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChatUser || !currentUserId) {
      console.log("Cannot send message:", { newMessage, activeChatUser, currentUserId });
      return;
    }

    const messageData = {
      senderId: currentUserId,
      receiverId: activeChatUser._id,
      text: newMessage.trim(),
    };

    console.log("Sending message:", messageData);
    socket.emit("sendMessage", messageData);
    
    // Optimistically add message to UI
    setMessages(prev => [...prev, {
      ...messageData,
      createdAt: new Date(),
      _id: `temp-${Date.now()}` // temporary ID
    }]);
    
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    try {
      return new Date(date).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      <Navbar />

      {/* Main container */}
      <div className="flex flex-1 flex-col lg:flex-row w-full max-w-full mx-auto gap-2 lg:gap-6 p-2 lg:p-6 pb-24">
        {/* Inbox / Users Sidebar */}
        <div className="w-full lg:w-1/3 xl:w-1/4 bg-white rounded-xl shadow p-4 flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-160px)]">
          <h2 className="text-xl font-bold mb-2 text-gray-800">Inbox</h2>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* Followed Users */}
          {followedUsers.length > 0 && (
            <div className="mb-2">
              <h3 className="font-semibold text-gray-600 mb-2 text-sm">Following</h3>
              {followedUsers.map(u => (
                <button
                  key={u._id}
                  onClick={() => handleSelectUser(u)}
                  className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition flex items-center gap-3 ${
                    activeChatUser?._id === u._id ? "bg-pink-50 border border-pink-200" : ""
                  }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-sm text-white font-semibold flex-shrink-0">
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

          {/* Not Followed Users */}
          {notFollowedUsers.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-600 mb-2 text-sm">Other Users</h3>
              {notFollowedUsers.map(u => (
                <button
                  key={u._id}
                  onClick={() => handleSelectUser(u)}
                  className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition flex items-center gap-3 ${
                    activeChatUser?._id === u._id ? "bg-pink-50 border border-pink-200" : ""
                  }`}
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm text-gray-600 font-semibold flex-shrink-0">
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

          {/* No users message */}
          {followedUsers.length === 0 && notFollowedUsers.length === 0 && !error && (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">👥</div>
              <p>No users available</p>
            </div>
          )}
        </div>

        {/* Chat Area */}
        {activeChatUser ? (
          <div className="w-full lg:w-2/3 xl:w-3/4 bg-white rounded-xl shadow flex flex-col h-[calc(100vh-160px)] lg:h-[calc(100vh-100px)]">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-gradient-to-r from-pink-50 to-purple-50">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {activeChatUser.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-800 text-lg">{activeChatUser.name}</div>
                <div className="text-sm text-gray-500">@{activeChatUser.username}</div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-lg">No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={msg._id || idx}
                    className={`flex ${
                      msg.senderId === currentUserId ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-3 rounded-2xl break-words shadow-sm ${
                        msg.senderId === currentUserId
                          ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <div className="leading-relaxed">{msg.text}</div>
                      <div
                        className={`text-xs mt-1.5 ${
                          msg.senderId === currentUserId ? "text-pink-100" : "text-gray-400"
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef}></div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full hover:from-pink-600 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full lg:w-2/3 xl:w-3/4 bg-white rounded-xl shadow flex items-center justify-center h-[calc(100vh-160px)] lg:h-[calc(100vh-100px)]">
            <div className="text-center">
              <div className="text-7xl mb-4">💬</div>
              <p className="text-xl text-gray-600 font-medium">Select a user to start chatting</p>
              <p className="text-sm text-gray-400 mt-2">Choose from your contacts on the left</p>
            </div>
          </div>
        )}
      </div>

      <BottomMenu />
    </div>
  );
};

export default Messages;

