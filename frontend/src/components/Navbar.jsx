import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="w-full bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 text-2xl font-bold text-pink-500">
          <span>❤️</span>
          <span className="text-gray-900">Connectify</span>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-4 text-xl">
          <Link to="/messages" className="hover:text-pink-500 transition-colors duration-200">
            💬
          </Link>
          {/* Add more icons if needed */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
