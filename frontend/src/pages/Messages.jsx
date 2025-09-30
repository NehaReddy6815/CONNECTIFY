import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import Navbar from "../components/Navbar";
import BottomMenu from "../components/BottomMenu";

const socket = io("http://localhost:5000");

const Messages = () => {
  const { receiverId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [currentUserId, setCurrentUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const Messages = () => {
  return <div>Messages Page</div>;
};

  // Get current user ID from token
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

  // Fetch list of users for inbox
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.filter((u) => u._id !== currentUserId)); // exclude self
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    if (currentUserId) fetchUsers();
  }, [currentUserId, token]);

  // If receiverId exists, fetch chat history and join room
  useEffect(() => {
    if (!currentUserId || !receiverId) return;

    const room = [currentUserId, receiverId].sort().join("_");
    socket.emit("joinRoom", room);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    const fetchMessages = async () => {
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

    return () => socket.off("receiveMessage");
  }, [currentUserId, receiverId, token]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !receiverId) return;

    const room = [currentUserId, receiverId].sort().join("_");
    const messageData = {
      text: newMessage,
      sender: currentUserId,
      receiver: receiverId,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    socket.emit("sendMessage", { room, message: messageData });

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

  // If no receiver selected → show inbox
  if (!receiverId) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
        <Navbar />
        <div className="flex-1 w-full max-w-3xl mx-auto p-4 flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Inbox</h2>
          {users.length === 0 ? (
            <p className="text-gray-500">No users available.</p>
          ) : (
            users.map((user) => (
              <Link
                key={user._id}
                to={`/messages/${user._id}`}
                className="flex items-center gap-3 p-3 bg-white rounded-xl shadow hover:bg-gray-50 transition"
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">👤</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                </div>
              </Link>
            ))
          )}
        </div>
        <BottomMenu />
      </div>
    );
  }

  // Otherwise → show chat with selected user
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      <Navbar />
      <div className="flex-1 w-full max-w-3xl mx-auto p-4 pb-24 flex flex-col gap-4">
        <div className="flex-1 overflow-y-auto space-y-3 bg-white rounded-xl shadow-md p-4">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center">No messages yet. Say hi! 💬</p>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
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
      <BottomMenu />
    </div>
  );
};

export default Messages;
