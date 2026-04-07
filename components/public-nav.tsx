'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Heart } from 'lucide-react';

export function PublicNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Inicio', href: '/' },
    { name: 'Sobre Mí', href: '/#sobre' },
    { name: 'Servicios', href: '/#servicios' },
    { name: 'Sucursales', href: '/#sucursales' },
    { name: 'Contacto', href: '/#contacto' },
  ];

  return (
    <nav className="bg-white border-b border-blue-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-blue-100 to-pink-100 p-2 rounded-xl group-hover:scale-105 transition-transform">
              <Heart className="h-7 w-7 text-blue-400" fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-800">
                Dra. Pediatra
              </span>
              <span className="text-xs text-gray-500">Cuidando a tus pequeños</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-blue-500 transition-colors font-medium text-sm"
              >
                {item.name}
              </Link>
            ))}
            <Link href="/agendar">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-sm hover:shadow-md transition-all rounded-lg px-5">
                Agendar Cita
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden bg-gray-50 p-2 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-50 border-t border-gray-100">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-3 text-gray-600 hover:text-blue-500 transition-colors font-medium bg-white rounded-lg px-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link href="/agendar" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-sm rounded-lg">
                Agendar Cita
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
