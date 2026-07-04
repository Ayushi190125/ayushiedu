import React, { useState, useEffect } from "react";
import "./header.css";
import { Link } from "react-router-dom";
import { FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi";

const Header = ({ isAuth, user }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header>
      <div className="logo" onClick={() => (window.location.href = "/")}>
        AyushiEdu
      </div>

      <div className={`link-container ${menuOpen ? "active" : ""}`}>
        <Link to={"/"} onClick={closeMenu}>Home</Link>
        <Link to={"/courses"} onClick={closeMenu}>Courses</Link>
        <Link to={"/about"} onClick={closeMenu}>About</Link>
        
        {isAuth && (
          <>
            {user && (user.role === "teacher" || user.role === "admin") ? (
              <Link to={"/teacher/dashboard"} onClick={closeMenu}>Workspace</Link>
            ) : (
              <Link to={`/${user?._id}/dashboard`} onClick={closeMenu}>Dashboard</Link>
            )}
          </>
        )}

        {isAuth ? (
          <Link to={"/account"} onClick={closeMenu}>Account</Link>
        ) : (
          <Link to={"/login"} onClick={closeMenu}>Login</Link>
        )}

        {/* Theme Toggle Button inside drawer/header */}
        <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
          {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
      </div>

      {/* Hamburger Toggle button for mobile */}
      <button className="mobile-menu-toggle" onClick={toggleMenu} aria-label="Toggle Menu">
        {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>
    </header>
  );
};

export default Header;
