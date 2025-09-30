import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import AddPost from "./pages/AddPost";
import Search from "./pages/Search";
import Messages from "./pages/Message"; // adjust the path if needed


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        {/* Corrected: Use a single route with an optional 'id' parameter */}
        <Route path="/profile/:id?" element={<Profile />} /> 
        <Route path="/EditProfile" element={<EditProfile />} />
        <Route path="/addPost" element={<AddPost />} />
        <Route path="/search" element={<Search />} />
        <Route path="/messages/:receiverId" element={<Messages />} />

      </Routes>
    </Router>
  );
}

export default App;