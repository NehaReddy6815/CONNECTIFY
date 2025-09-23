// import { Link } from "react-router-dom";

// const Navbar = () => {
//   return (
//     <nav style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "#f5f5f5" }}>
//       <h2 style={{ margin: 0 }}>❤️ Connectify</h2>
//       <Link to="/messages" style={{ textDecoration: "none", fontWeight: "bold" }}>
//         💬 Msg
//       </Link>
//     </nav>
//   );
// };

// export default Navbar;

import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">❤️ Connectify</div>
      <Link to="/messages" className="navbar-msg">💬</Link>
    </nav>
  );
};

export default Navbar;
