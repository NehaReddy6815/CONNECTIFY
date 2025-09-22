import React, { useState } from "react";
import { Search, Send, Smile, Paperclip, MoreVertical, Phone, Video, MessageCircle } from "lucide-react";

const Message = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");

  // Mock data for conversations
  const conversations = [
    {
      id: 1,
      name: "Sarah Johnson",
      lastMessage: "Hey! How are you doing?",
      time: "2m ago",
      unread: 2,
      avatar: "SJ"
    },
    {
      id: 2,
      name: "Mike Chen",
      lastMessage: "Thanks for the help with the project!",
      time: "1h ago",
      unread: 0,
      avatar: "MC"
    },
    {
      id: 3,
      name: "Emily Davis",
      lastMessage: "See you tomorrow at the meeting",
      time: "3h ago",
      unread: 1,
      avatar: "ED"
    },
    {
      id: 4,
      name: "Alex Rodriguez",
      lastMessage: "The new design looks amazing!",
      time: "1d ago",
      unread: 0,
      avatar: "AR"
    }
  ];

  const messages = [
    { id: 1, text: "Hey! How are you doing?", sender: "other", time: "2:30 PM" },
    { id: 2, text: "I'm doing great! Just working on some new projects. How about you?", sender: "me", time: "2:32 PM" },
    { id: 3, text: "That sounds exciting! I'm also busy with some interesting work.", sender: "other", time: "2:35 PM" },
    { id: 4, text: "We should catch up soon!", sender: "me", time: "2:36 PM" }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      // Here you would send the message to the backend
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[600px] flex">
          {/* Conversations Sidebar */}
          <div className="w-1/3 border-r border-gray-100 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedChat(conversation)}
                  className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedChat?.id === conversation.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">{conversation.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">{conversation.name}</h3>
                        <span className="text-xs text-gray-500">{conversation.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                        {conversation.unread > 0 && (
                          <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{selectedChat.avatar}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedChat.name}</h3>
                      <p className="text-sm text-gray-500">Online</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          msg.sender === 'me'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-100">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <button type="button" className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full px-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800">
                        <Smile className="w-5 h-5" />
                      </button>
                    </div>
                    <button
                      type="submit"
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* No Chat Selected */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a conversation</h3>
                  <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;

