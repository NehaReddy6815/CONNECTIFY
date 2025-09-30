import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import Navbar from "../components/Navbar";
import BottomMenu from "../components/BottomMenu";

const socket = io("http://localhost:5000");

const Messages = () => {
  const { receiverId } = useParams();
  const token = localStorage.getItem("token");

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  // Extract current user ID from token
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.id);
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, [token]);

  // Join private room
  useEffect(() => {
    if (!currentUserId || !receiverId) return;
    const room = [currentUserId, receiverId].sort().join("_"); // unique room for user pair
    socket.emit("joinRoom", room);

    // Listen for incoming messages
    socket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => socket.off("receiveMessage");
  }, [currentUserId, receiverId]);

  // Fetch conversation history
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentUserId || !receiverId) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/${currentUserId}/${receiverId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };
    fetchMessages();
  }, [currentUserId, receiverId, token]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!currentUserId || !receiverId) return;

    const room = [currentUserId, receiverId].sort().join("_");
    const messageData = {
      text: newMessage,
      sender: currentUserId,
      receiver: receiverId,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Emit to socket room
    socket.emit("sendMessage", { room, message: messageData });

    // Send to backend (persist in DB)
    try {
      await axios.post(
        "http://localhost:5000/api/messages",
        { receiverId, text: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to save message:", err);
    }

    setMessages((prev) => [...prev, messageData]);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      <div className="sticky top-0 z-40">
        <Navbar />
      </div>

      <div className="flex-1 w-full max-w-3xl mx-auto p-4 pb-24 flex flex-col gap-4">
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto space-y-3 bg-white rounded-xl shadow-md p-4">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center">No messages yet. Say hi! 💬</p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl max-w-xs ${
                  msg.sender === currentUserId
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white ml-auto shadow"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <span className="block text-xs mt-1 opacity-70">{msg.time}</span>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="flex items-center bg-white shadow-md rounded-full px-3 py-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 text-sm outline-none bg-transparent"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="ml-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold shadow hover:from-pink-600 hover:to-purple-600 transition"
          >
            Send
          </button>
        </div>
      </div>

      <div className="sticky bottom-0 z-40">
        <BottomMenu />
      </div>
    </div>
  );
};

export default Messages;
