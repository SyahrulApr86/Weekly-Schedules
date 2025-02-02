import React from 'react';
import { LogOut, User as UserIcon, Menu } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface NavbarProps {
  user: User;
  onSignOut: () => void;
}

export function Navbar({ user, onSignOut }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <img
                    src="/wiiks-calendar-icon.svg"
                    alt="Wiiks Logo"
                    className="w-6 h-6"
                />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Wiiks</h1>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="bg-gray-100 p-2 rounded-full">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{user.email}</span>
              </div>
              <button
                  onClick={onSignOut}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-800"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
              <div className="md:hidden py-4 border-t border-gray-100">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <UserIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.email}</span>
                  </div>
                  <button
                      onClick={onSignOut}
                      className="flex items-center gap-2 px-2 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
          )}
        </div>
      </nav>
  );
}