import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />   {/* Login/Register handled here */}
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        


      </Routes>
    </Router>
  );
}

export default App;


// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Home from "./pages/Home";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Login />} />
//           <Route path="/" element={<Register />} />

//         <Route path="/home" element={<Home />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

