import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agendar cita pediátrica',
  description:
    'Agenda tu cita pediátrica en línea con la Dra. Luisa Nohemí Pérez. Elige la clínica, servicio, fecha y hora para la atención de tu bebé, niño o adolescente.',
  openGraph: {
    title: 'Agendar cita pediátrica | Dra. Luisa Nohemí Pérez',
    description:
      'Agenda tu cita pediátrica en línea con atención cálida y profesional para bebés, niños y adolescentes en Guatemala.',
  },
  twitter: {
    title: 'Agendar cita pediátrica | Dra. Luisa Nohemí Pérez',
    description:
      'Agenda tu cita pediátrica en línea con atención cálida y profesional para bebés, niños y adolescentes en Guatemala.',
  },
};

export default function AgendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}