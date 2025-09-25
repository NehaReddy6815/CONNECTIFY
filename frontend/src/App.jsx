import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import AddPost from "./pages/AddPost";
import Search from   "./pages/Search";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />   {/* Login/Register handled here */}
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/addPost" element={<AddPost />} />
         <Route path="/search" element={<Search />} />


      </Routes>
    </Router>
  );
}

export default App;
