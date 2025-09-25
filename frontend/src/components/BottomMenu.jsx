import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./BottomMenu.css";

const BottomMenu = () => {
  const location = useLocation();

  const menuItems = [
    { name: "Home", icon: "🏠", path: "/home" },
    { name: "Search", icon: "🔍", path: "/search" },
    { name: "Add", icon: "➕", path: "/addPost" },
    { name: "Profile", icon: "👤", path: "/profile" },
  ];

  return (
    <nav className="bottom-menu">
      {menuItems.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className={`bottom-menu-item ${
            location.pathname === item.path ? "active" : ""
          }`}
        >
          <span className="bottom-menu-icon">{item.icon}</span>
          <span className="bottom-menu-label">{item.name}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomMenu;
