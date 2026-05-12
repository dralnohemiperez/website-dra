import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Dra. Luisa Nohemí Pérez | Pediatra en Guatemala',
    template: '%s | Dra. Luisa Nohemí Pérez',
  },
  description:
    'Atención pediátrica cálida y profesional para bebés, niños y adolescentes en Guatemala. Agenda tu cita en línea en cualquiera de sus dos clínicas.',
  keywords: [
    'Dra. Luisa Nohemí Pérez',
    'pediatra en Guatemala',
    'pediatra Guatemala',
    'pediatría Guatemala',
    'consulta pediátrica',
    'pediatra para bebés',
    'pediatra para niños',
    'agendar cita pediátrica',
  ],
  openGraph: {
    title: 'Dra. Luisa Nohemí Pérez | Pediatra en Guatemala',
    description:
      'Atención pediátrica cálida y profesional para bebés, niños y adolescentes en Guatemala. Agenda tu cita en línea en cualquiera de sus dos clínicas.',
    siteName: 'Dra. Luisa Nohemí Pérez',
    locale: 'es_GT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dra. Luisa Nohemí Pérez | Pediatra en Guatemala',
    description:
      'Atención pediátrica cálida y profesional para bebés, niños y adolescentes en Guatemala. Agenda tu cita en línea en cualquiera de sus dos clínicas.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-GT">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}