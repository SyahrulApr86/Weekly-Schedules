import { LogOut, User as UserIcon } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface NavbarProps {
  user: User;
  onSignOut: () => void;
}

export function Navbar({ user, onSignOut }: NavbarProps) {
  return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {/* Ganti dengan logo SVG */}
              <div className="bg-blue-100 p-2 rounded-lg">
                <img
                    src="/wiiks-calendar-icon.svg"
                    alt="Wiiks Logo"
                    className="w-6 h-6"
                />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Wiiks</h1>
            </div>

            <div className="flex items-center gap-6">
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
          </div>
        </div>
      </nav>
  );
}