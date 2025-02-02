import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" 
          onClick={onClose}
        />
        
        {/* Modal panel */}
        <div className="relative bg-white rounded-xl shadow-xl transform transition-all w-full max-w-4xl p-8">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="mt-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}