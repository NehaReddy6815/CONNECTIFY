import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">❤️ Connectify</div>
      <Link to="/messages" className="navbar-right">💬</Link>
    </nav>
  );
};

export default Navbar;
