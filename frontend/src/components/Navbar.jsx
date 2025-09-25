import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">❤️ Connectify</div>
      <div className="navbar-right">
        <Link to="/messages" className="navbar-icon">💬</Link>
      </div>
    </nav>
  );
};

export default Navbar;
