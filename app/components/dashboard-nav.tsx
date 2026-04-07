'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Stethoscope,
  LayoutDashboard,
  Calendar,
  ClipboardList,
  MapPin,
  ListChecks,
  Users,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function DashboardNav() {
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Calendario', href: '/dashboard/calendario', icon: Calendar },
    { name: 'Citas', href: '/dashboard/citas', icon: ClipboardList },
    { name: 'Pacientes', href: '/dashboard/pacientes', icon: Users },
    { name: 'Sucursales', href: '/dashboard/sucursales', icon: MapPin },
    { name: 'Servicios', href: '/dashboard/servicios', icon: ListChecks },
  ];

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900">Panel Administrativo</span>
                <span className="text-xs text-gray-600">Dra. Luisa N. Pérez</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn(
                        'flex items-center gap-2',
                        isActive && 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Salir
              </Button>
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start',
                        isActive && 'bg-blue-50 text-blue-700'
                      )}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
              <Button
                variant="ghost"
                onClick={signOut}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
