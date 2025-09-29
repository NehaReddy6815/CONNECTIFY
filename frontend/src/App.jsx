import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import AddPost from "./pages/AddPost";
import Search from "./pages/Search";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile/:id?" element={<Profile />} /> {/* ID is optional */}
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/addPost" element={<AddPost />} />
        <Route path="/search" element={<Search />} />
      </Routes>
    </Router>
  );
}

<div className="min-h-screen bg-gray-100 flex items-center justify-center">
  <h1 className="text-4xl font-bold text-blue-600 underline">Hello Tailwind!</h1>
</div>


export default App;
