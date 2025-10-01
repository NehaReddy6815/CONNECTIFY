// socket/messageSocket.js
const Message = require("../models/message");

const setupMessageSocket = (io) => {
  io.on("connection", (socket) => {
    // Join a room for the user
    socket.on("joinRoom", (userId) => {
      socket.join(userId);
    });

    // Handle sending messages
    socket.on("sendMessage", async (data) => {
      try {
        const { senderId, receiverId, text } = data;

        // Save message to database
        const message = await Message.create({
          sender: senderId,
          receiver: receiverId,
          text,
        });

        // Populate sender info if needed
        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "name username")
          .populate("receiver", "name username");

        const messageData = {
          _id: populatedMessage._id,
          senderId: senderId,
          receiverId: receiverId,
          text: populatedMessage.text,
          createdAt: populatedMessage.createdAt,
        };

        // Send to receiver
        io.to(receiverId).emit("receiveMessage", messageData);

        // Confirm to sender
        socket.emit("messageSent", messageData);
      } catch (err) {
        console.error("Error saving message:", err);
        socket.emit("messageError", { error: "Failed to send message" });
      }
    });

    // Handle deleting messages
    socket.on("deleteMessage", async (data) => {
      try {
        const { messageId, receiverId } = data;

        // Notify the receiver that message was deleted
        io.to(receiverId).emit("messageDeleted", { messageId });
      } catch (err) {
        console.error("Error deleting message:", err);
      }
    });

    socket.on("disconnect", () => {
      // Silently handle disconnection
    });
  });
};

module.exports = setupMessageSocket;