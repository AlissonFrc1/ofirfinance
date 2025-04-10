"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const userName = session?.user?.name || '';
  const userPlan = session?.user?.subscription?.plan?.name || 'Nenhum plano';
  const nameParts = userName.split(' ');
  const userInitials = nameParts.length > 1 
    ? `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase()
    : nameParts[0].charAt(0).toUpperCase();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-primary text-white font-medium flex items-center justify-center hover:bg-primary/90 transition-colors"
        aria-label={`Menu do usuário ${userName}`}
      >
        {userInitials}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card-bg rounded-lg shadow-lg border border-divider py-2 z-50">
          <div className="px-4 py-2 border-b border-divider">
            <p className="text-sm font-medium text-text-primary">{userName}</p>
            <p className="text-xs text-text-secondary">{userPlan}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full px-4 py-2 text-sm text-text-primary hover:bg-background text-left transition-colors"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
} 