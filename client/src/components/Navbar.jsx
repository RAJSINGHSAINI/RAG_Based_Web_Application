import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  // Escape closes the sidebar, which keyboard users expect.
  useEffect(() => {
    if (!sidebarOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeSidebar();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  const handleLogout = async () => {
    closeSidebar();
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" onClick={closeSidebar}>
          MERN Auth
        </Link>

        {/* Desktop links */}
        <nav className="nav-links" aria-label="Main">
          <NavLink to="/profile">Profile</NavLink>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </nav>

        {/* Mobile trigger */}
        <button
          type="button"
          className="menu-button"
          aria-label="Open menu"
          aria-expanded={sidebarOpen}
          onClick={() => setSidebarOpen(true)}
        >
          <span aria-hidden="true">☰</span>
        </button>
      </div>

      {/* Mobile sidebar */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "is-open" : ""}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <aside
        className={`sidebar ${sidebarOpen ? "is-open" : ""}`}
        aria-label="Menu"
        aria-hidden={!sidebarOpen}
      >
        <div className="sidebar-head">
          <span className="muted">{user?.fullName}</span>
          <button
            type="button"
            className="menu-button"
            aria-label="Close menu"
            onClick={closeSidebar}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <nav className="sidebar-links">
          <NavLink to="/" onClick={closeSidebar}>
            Home
          </NavLink>
          <NavLink to="/profile" onClick={closeSidebar}>
            Profile
          </NavLink>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </nav>
      </aside>
    </header>
  );
};

export default Navbar;
