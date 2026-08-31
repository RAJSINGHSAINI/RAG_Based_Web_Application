import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ThemeToggle = ({ theme, onToggleTheme }) => (
  <button
    type="button"
    className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-all duration-300 ${
      theme === "dark"
        ? "border-indigo-400/60 bg-indigo-500 shadow-[0_0_18px_rgba(99,102,241,0.35)]"
        : "border-slate-200 bg-slate-200"
    }`}
    aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    aria-pressed={theme === "dark"}
    onClick={onToggleTheme}
  >
    <span
      className={`absolute left-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] shadow-md transition-transform duration-300 ${
        theme === "dark" ? "translate-x-5 text-amber-500" : "translate-x-0 text-slate-500"
      }`}
      aria-hidden="true"
    >
      {theme === "dark" ? "☀" : "☾"}
    </span>
  </button>
);

const navLinkClass = ({ isActive }) =>
  `rounded-xl px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
  }`;

const Navbar = ({ theme, onToggleTheme }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

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
    <div className="w-full top-0 sticky max-w-full overflow-x-hidden">
      {/* w-full max-w-full overflow-x-hidden keeps the viewport from creating mobile-only horizontal scrollbars. */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-3 md:h-20">
            <Link to="/" className="flex shrink-0 items-center gap-3" onClick={closeSidebar}>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/25">
                M
              </span>
              <span className="text-base font-semibold tracking-tight text-slate-800 dark:text-slate-100">
                MERN Auth
              </span>
            </Link>

            <div className="hidden flex-1 items-center justify-center md:flex md:pl-4">
              <label className="relative block w-full max-w-xl">
                <span className="sr-only">Search</span>
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                  🔎
                </span>
                <input
                  type="search"
                  placeholder="Search"
                  className="w-full min-w-0 box-border rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
                />
              </label>
            </div>

            <nav className="hidden items-center gap-3 md:flex" aria-label="Main navigation">
              <NavLink to="/profile" className={navLinkClass}>
                Profile
              </NavLink>
              <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
              <button
                type="button"
                className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                onClick={handleLogout}
              >
                Log out
              </button>
            </nav>

            <div className="ml-auto flex items-center gap-2 md:hidden">
              <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
              <button
                type="button"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                aria-label="Open menu"
                aria-expanded={sidebarOpen}
                onClick={() => setSidebarOpen(true)}
              >
                ☰
              </button>
            </div>
          </div>

          <div className="pb-3 md:hidden">
            {/* pb-3 only on mobile keeps the search region from adding extra vertical space beyond the viewport. */}
            <label className="relative block w-full">
              <span className="sr-only">Search</span>
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                🔎
              </span>
              <input
                type="search"
                placeholder="Search"
                className="w-full min-w-0 box-border rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
              />
            </label>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 ${
          sidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 z-40 h-[100dvh] max-h-[calc(100dvh-4rem)] w-[82vw] max-w-[320px] overflow-y-auto border-l border-slate-200/80 bg-white/70 p-4 shadow-2xl backdrop-blur-xl transition-transform duration-200 dark:border-slate-700 dark:bg-slate-950/75 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Mobile menu"
      >
        {/* max-h-[calc(100dvh-4rem)] keeps the mobile flyout within the viewport and lets the menu scroll internally instead of pushing the page taller. */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {user?.fullName || "Account"}
          </span>
          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            aria-label="Close menu"
            onClick={closeSidebar}
          >
            ×
          </button>
        </div>

        <label className="relative mb-4 block w-full">
          <span className="sr-only">Search menu</span>
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            🔎
          </span>
          {/* min-w-0 prevents flex overflow; box-border keeps padding and borders inside the input width on narrow screens. */}
          <input
            type="search"
            placeholder="Search"
            className="w-full min-w-0 box-border rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
          />
        </label>

        <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
          <NavLink to="/" onClick={closeSidebar} className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/profile" onClick={closeSidebar} className={navLinkClass}>
            Profile
          </NavLink>
          <div className="pt-2">
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
          </div>
          <button
            type="button"
            className="mt-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            onClick={handleLogout}
          >
            Log out
          </button>
        </nav>
      </aside>
    </div>
  );
};

export default Navbar;
