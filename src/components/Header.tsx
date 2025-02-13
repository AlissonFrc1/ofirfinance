"use client";

import { useCallback } from "react";
import { MagnifyingGlassIcon, BellIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { useMobileMenu } from "@/contexts/MobileMenuContext";

interface HeaderProps {
  userName: string;
  notificationCount: number;
}

export function Header({ userName, notificationCount }: HeaderProps) {
  const { toggleMobileMenu } = useMobileMenu();
  const userInitial = userName.charAt(0);

  const handleMenuClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('Menu button clicked');
    toggleMobileMenu();
  }, [toggleMobileMenu]);

  return (
    <header className="h-16 md:h-20 fixed top-0 right-0 left-0 md:left-[200px] bg-white border-b border-divider z-20">
      <div className="h-full px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <button 
            type="button"
            onClick={handleMenuClick}
            className="block md:hidden p-2 -ml-2 text-text-primary hover:bg-background rounded-lg transition-colors"
            aria-label="Abrir menu"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          <div className="max-w-[400px] w-full hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full bg-background border border-divider rounded-lg pl-10 pr-4 py-2 text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary"
              />
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            className="relative p-2 text-text-primary hover:bg-background rounded-lg transition-colors"
            aria-label={`${notificationCount} notificações`}
          >
            <BellIcon className="w-6 h-6" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          <button 
            type="button"
            className="w-8 h-8 rounded-full bg-primary text-white font-medium flex items-center justify-center"
            aria-label={`Menu do usuário ${userName}`}
          >
            {userInitial}
          </button>
        </div>
      </div>
    </header>
  );
}