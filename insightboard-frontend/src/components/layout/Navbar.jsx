import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { HiOutlineDatabase, HiOutlineViewGrid, HiOutlineLogout, HiOutlineSun, HiOutlineMoon, HiOutlineUser } from 'react-icons/hi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              InsightBoard
            </span>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            <NavLink
              to="/datasets"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                }`
              }
            >
              <HiOutlineDatabase className="w-5 h-5" />
              <span className="hidden sm:inline">Datasets</span>
            </NavLink>
            <NavLink
              to="/dashboards"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                }`
              }
            >
              <HiOutlineViewGrid className="w-5 h-5" />
              <span className="hidden sm:inline">Dashboards</span>
            </NavLink>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-200"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
            </button>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-2 transition-all duration-200 ${isActive ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`
              }
              title="My Profile"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold ring-2 ring-transparent hover:ring-primary-400 transition-all">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden md:inline text-sm font-medium text-surface-700 dark:text-surface-300">
                {user?.name || 'User'}
              </span>
            </NavLink>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-surface-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-all duration-200"
              title="Logout"
            >
              <HiOutlineLogout className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
