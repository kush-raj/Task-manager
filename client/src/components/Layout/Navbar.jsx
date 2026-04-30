import React, { useState, useEffect } from 'react';
import { Moon, Sun, Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ toggleMobileMenu }) => {
  const { user } = useAuth();

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <header
      className="h-20 glass border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 w-full"
    >
      {/* Left: Page context greeting */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleMobileMenu}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
        >
          <Menu size={24} />
        </button>
        <div className="min-w-0">
          <p className="hidden md:block text-xs text-slate-400 font-medium uppercase tracking-widest">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h2 className="text-lg font-bold truncate">
            Welcome back, <span className="text-indigo-500">{user?.name?.split(' ')[0]}</span>
          </h2>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">

        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* User chip */}
        <div className="flex items-center gap-3 pl-1">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold leading-none">{user?.name}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
