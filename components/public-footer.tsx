import Link from 'next/link';
import { Heart, Phone, Mail, MapPin } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-blue-100 to-pink-100 p-2 rounded-xl">
                <Heart className="h-7 w-7 text-blue-400" fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-800">Dra. Pediatra</span>
                <span className="text-xs text-gray-500">Cuidando a tus pequeños</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Atención médica pediátrica profesional y de confianza para el cuidado integral de tus hijos.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-4 text-base">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#sobre" className="text-gray-600 hover:text-blue-500 text-sm transition-colors">
                  Sobre la Doctora
                </Link>
              </li>
              <li>
                <Link href="/#servicios" className="text-gray-600 hover:text-blue-500 text-sm transition-colors">
                  Servicios
                </Link>
              </li>
              <li>
                <Link href="/#sucursales" className="text-gray-600 hover:text-blue-500 text-sm transition-colors">
                  Sucursales
                </Link>
              </li>
              <li>
                <Link href="/agendar" className="text-gray-600 hover:text-blue-500 text-sm transition-colors">
                  Agendar Cita
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-4 text-base">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-gray-600 text-sm">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <Phone className="h-4 w-4 text-blue-500" />
                </div>
                <span>+502 1234-5678</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-600 text-sm">
                <div className="bg-pink-50 p-2 rounded-lg">
                  <Mail className="h-4 w-4 text-pink-500" />
                </div>
                <span>contacto@drapediatra.com</span>
              </li>
              <li className="flex items-start space-x-2 text-gray-600 text-sm">
                <div className="bg-purple-50 p-2 rounded-lg">
                  <MapPin className="h-4 w-4 text-purple-500 mt-0.5" />
                </div>
                <span>Atención en dos sucursales</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Dra. Pediatra. Todos los derechos reservados.
            </p>
            <Link
              href="/login"
              className="text-gray-400 hover:text-gray-600 text-xs transition-colors"
            >
              Acceso Administrativo
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
