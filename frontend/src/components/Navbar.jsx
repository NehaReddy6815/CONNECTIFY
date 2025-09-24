import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/messages" className="navbar-right">💬</Link>
      <div className="navbar-left">❤️ Connectify</div>
    </nav>
  );
};

export default Navbar;
