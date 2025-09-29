import React from "react";
import { Link, useLocation } from "react-router-dom";

const BottomMenu = () => {
  const location = useLocation();

  const menuItems = [
    { name: "Home", iconClass: "bi bi-house-door-fill", path: "/home" },
    { name: "Search", iconClass: "bi bi-search-heart", path: "/search" },
    { name: "Add", iconClass: "bi bi-plus-square", path: "/addPost" },
    { name: "Profile", iconClass: "bi bi-person-circle", path: "/profile" },
  ];

  return (
    <>
      {/* Mobile BottomMenu */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-inner z-50 md:hidden">
        <div className="flex justify-around items-center py-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`text-2xl transition-colors duration-200 ${
                location.pathname === item.path
                  ? "text-pink-500"
                  : "text-gray-500 hover:text-pink-500"
              }`}
            >
              <i className={item.iconClass}></i>
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop BottomMenu */}
      <nav className="hidden md:flex fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-inner z-50">
        <div className="flex justify-around items-center py-2 max-w-4xl mx-auto w-full">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center text-sm transition-colors duration-200 ${
                location.pathname === item.path
                  ? "text-pink-500 font-semibold"
                  : "text-gray-500 hover:text-pink-500"
              }`}
            >
              <i className={`text-2xl ${item.iconClass}`}></i>
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default BottomMenu;
