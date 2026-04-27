'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PublicNav } from '@/components/public-nav';
import { PublicFooter } from '@/components/public-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Baby, Stethoscope, Shield, Phone, MessageCircle, MapPin, Clock, CircleCheck as CheckCircle2, Award, BookOpen, Users, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import Image from 'next/image';

type Servicio = Database['public']['Tables']['servicios']['Row'];
type Sucursal = Database['public']['Tables']['sucursales']['Row'];


function ElephantDecoration({
  className = '',
  size = 120,
  flip = false,
}: {
  className?: string;
  size?: number;
  flip?: boolean;
}) {
  return (
    <div
      className={`pointer-events-none absolute opacity-90 ${className}`}
      style={{
        width: size,
        height: size,
        transform: flip ? 'scaleX(-1)' : undefined,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Orejas */}
        <circle cx="70" cy="92" r="34" fill="#93C5FD" />
        <circle cx="128" cy="92" r="34" fill="#93C5FD" />

        {/* Cabeza */}
        <circle cx="100" cy="95" r="38" fill="#BFDBFE" />

        {/* Trompa */}
        <path
          d="M94 118C94 118 88 135 95 151C101 164 117 164 120 151C122 142 117 137 112 138C106 140 106 148 111 151"
          stroke="#BFDBFE"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Ojos */}
        <circle cx="88" cy="92" r="4" fill="#1F2937" />
        <circle cx="112" cy="92" r="4" fill="#1F2937" />

        {/* Mejillas */}
        <circle cx="80" cy="106" r="5" fill="#F9A8D4" opacity="0.8" />
        <circle cx="120" cy="106" r="5" fill="#F9A8D4" opacity="0.8" />

        {/* Sombrerito médico */}
        <rect x="78" y="42" width="44" height="18" rx="6" fill="#FFFFFF" />
        <rect x="95" y="46" width="10" height="10" rx="2" fill="#60A5FA" />
        <rect x="91" y="50" width="18" height="2.5" rx="1.25" fill="#60A5FA" />
        <rect x="98" y="43" width="2.5" height="16" rx="1.25" fill="#60A5FA" />

        {/* Corazoncito */}
        <path
          d="M146 55C146 49 151 45 156 45C160 45 163 47 165 50C167 47 170 45 174 45C179 45 184 49 184 55C184 66 165 78 165 78C165 78 146 66 146 55Z"
          fill="#F472B6"
        />
      </svg>
    </div>
  );
}



export default function HomePage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);

  const doctorImages = ['/images/doctora.jpeg', '/images/doctora2.jpeg'];
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % doctorImages.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + doctorImages.length) % doctorImages.length);
  };

  useEffect(() => {
    async function loadData() {
      const { data: serviciosData } = await supabase
        .from('servicios')
        .select('*')
        .eq('activo', true)
        .order('orden');

      const { data: sucursalesData } = await supabase
        .from('sucursales')
        .select('*')
        .eq('activo', true);

      if (serviciosData) setServicios(serviciosData);
      if (sucursalesData) setSucursales(sucursalesData);
    }

    loadData();
  }, []);

  

  return (
    <div className="min-h-screen fun-pattern">
      <PublicNav />

<section className="relative overflow-hidden py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
  <ElephantDecoration className="top-8 left-4 md:left-10" size={95} />
  <ElephantDecoration className="bottom-6 right-4 md:right-12" size={110} flip />
  <ElephantDecoration className="top-20 right-[42%] hidden xl:block" size={70} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="mb-4 bg-blue-100 text-blue-700 border-0 text-sm px-4 py-2">
                Atención Pediátrica Profesional
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight text-gray-900">
                Cuidando a tus
                <br />
                <span className="text-blue-500">Pequeños con Amor</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Especialista en pediatría dedicada a la salud y felicidad de los niños.
                Atención médica con calidez humana y profesionalismo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/agendar">
                  <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-sm hover:shadow-md transition-all w-full sm:w-auto text-base rounded-lg px-8">
                    <Heart className="mr-2 h-5 w-5" />
                    Agendar Cita
                  </Button>
                </Link>
                <a href="https://wa.me/50212345678" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="border-2 border-green-500 text-green-600 hover:bg-green-50 font-medium w-full sm:w-auto text-base rounded-lg px-8">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    WhatsApp
                  </Button>
                </a>
                <a
                  href="https://www.doctoranytime.gt/d/pediatra/luisa-perez"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-blue-400 text-blue-600 hover:bg-blue-50 font-medium w-full sm:w-auto text-base rounded-lg px-8"
                  >
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Ver perfil médico
                  </Button>
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <Baby className="h-8 w-8 text-blue-600 mb-2" />
                      <CardTitle className="text-3xl font-bold text-blue-700">500+</CardTitle>
                      <CardDescription className="font-medium text-blue-600">Pacientes Felices</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <Award className="h-8 w-8 text-purple-600 mb-2" />
                      <CardTitle className="text-3xl font-bold text-purple-700">10+</CardTitle>
                      <CardDescription className="font-medium text-purple-600">Años de Experiencia</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <Stethoscope className="h-8 w-8 text-pink-600 mb-2" />
                      <CardTitle className="text-3xl font-bold text-pink-700">7</CardTitle>
                      <CardDescription className="font-medium text-pink-600">Servicios</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <MapPin className="h-8 w-8 text-teal-600 mb-2" />
                      <CardTitle className="text-3xl font-bold text-teal-700">2</CardTitle>
                      <CardDescription className="font-medium text-teal-600">Sucursales</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="sobre" className="relative overflow-hidden py-20 bg-white">
        <ElephantDecoration className="top-10 right-6 md:right-20 opacity-20" size={120} flip />
        <ElephantDecoration className="bottom-10 left-4 md:left-16 opacity-15" size={95} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Sobre la Doctora
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Médica pediatra dedicada al cuidado integral de la salud infantil
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[500px] w-full rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white">
              <Image
                src={doctorImages[currentImage]}
                alt={`Dra. Luisa Nohemí Pérez ${currentImage + 1}`}
                fill
                className="object-contain bg-white transition-opacity duration-500"
                priority
              />

              <button
                type="button"
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow-md transition"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow-md transition"
                aria-label="Siguiente imagen"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {doctorImages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentImage(index)}
                    className={`h-2.5 w-2.5 rounded-full transition ${
                      currentImage === index ? 'bg-blue-500' : 'bg-white/70'
                    }`}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900">
                Dra. Luisa Nohemí Pérez
              </h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Médica y cirujana  graduada de la  Universidad de San Carlos de Guatemala, cuento 
                con una Maestría en Ciencias Médicas con Especialidad en Pediatría,  así como una 
                especialidad en  Asesoría  de  Lactancia  Materna.   Cuento con más de 10 años de 
                experiencia profesional en el cuidado de la salud de los más pequeñitos del hogar
              </p>

              <div className="space-y-3">
                <div className="flex items-start space-x-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-base">Formación Especializada</h4>
                    <p className="text-gray-600 text-sm">
                      Especialista en Pediatría con formación continua en medicina infantil
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 bg-pink-50 p-4 rounded-xl border border-pink-100">
                  <div className="bg-pink-100 p-2 rounded-lg">
                    <Heart className="h-5 w-5 text-pink-600 flex-shrink-0" fill="currentColor" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-base">Enfoque Humanizado</h4>
                    <p className="text-gray-600 text-sm">
                      Atención personalizada con empatía y respeto hacia cada familia
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 bg-purple-50 p-4 rounded-xl border border-purple-100">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-base">Compromiso con la Excelencia</h4>
                    <p className="text-gray-600 text-sm">
                      Actualización constante en técnicas y protocolos médicos modernos
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 bg-teal-50 p-4 rounded-xl border border-teal-100">
                  <div className="bg-teal-100 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-teal-600 flex-shrink-0" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-base">Filosofía de Atención</h4>
                    <p className="text-gray-600 text-sm" >
                      Trabajo en equipo con los padres para el bienestar integral de los niños
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <a
              href="https://www.doctoranytime.gt/d/pediatra/luisa-perez"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button className="bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg shadow-sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver perfil en Doctoranytime
              </Button>
            </a>

          </div>
        </div>
      </section>

      <section id="servicios" className="relative overflow-hidden py-20 bg-gray-50">
        <ElephantDecoration className="top-8 left-8 opacity-20" size={100} />
        <ElephantDecoration className="top-1/2 right-4 md:right-12 opacity-15" size={130} flip />
        <ElephantDecoration className="bottom-8 left-[45%] hidden lg:block opacity-10" size={90} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Servicios Médicos
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Atención pediátrica integral para todas las etapas del desarrollo infantil
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicios.map((servicio, index) => {
              const colors = [
                { bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', icon: 'bg-blue-100', iconColor: 'text-blue-600' },
                { bg: 'from-pink-50 to-pink-100', border: 'border-pink-200', icon: 'bg-pink-100', iconColor: 'text-pink-600' },
                { bg: 'from-purple-50 to-purple-100', border: 'border-purple-200', icon: 'bg-purple-100', iconColor: 'text-purple-600' },
                { bg: 'from-teal-50 to-teal-100', border: 'border-teal-200', icon: 'bg-teal-100', iconColor: 'text-teal-600' },
                { bg: 'from-orange-50 to-orange-100', border: 'border-orange-200', icon: 'bg-orange-100', iconColor: 'text-orange-600' },
                { bg: 'from-green-50 to-green-100', border: 'border-green-200', icon: 'bg-green-100', iconColor: 'text-green-600' },
                { bg: 'from-indigo-50 to-indigo-100', border: 'border-indigo-200', icon: 'bg-indigo-100', iconColor: 'text-indigo-600' },
              ];
              const color = colors[index % colors.length];

              return (
                <Card key={servicio.id} className={`relative overflow-hidden bg-gradient-to-br ${color.bg} border ${color.border} shadow-sm hover:shadow-md transition-shadow`}>
                    <ElephantDecoration className="-top-6 -right-6 opacity-15" size={85} flip />
                  <CardHeader>
                    <div className={`w-12 h-12 ${color.icon} rounded-lg flex items-center justify-center mb-3`}>
                      <Stethoscope className={`h-6 w-6 ${color.iconColor}`} />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-800">{servicio.nombre}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">{servicio.descripcion}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link href="/agendar">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-sm hover:shadow-md transition-all rounded-lg px-8">
                Solicitar Consulta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="sucursales" className="relative overflow-hidden py-20 bg-white">
        <ElephantDecoration className="top-10 right-8 opacity-20" size={110} flip />
        <ElephantDecoration className="bottom-10 left-8 opacity-15" size={120} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Nuestras Sucursales
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Dos ubicaciones estratégicas para tu comodidad
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sucursales.map((sucursal, index) => {
              const gradients = [
                'from-blue-50 to-teal-50',
                'from-pink-50 to-purple-50'
              ];
              const borders = ['border-blue-200', 'border-pink-200'];

              return (
                <Card key={sucursal.id} className={`relative overflow-hidden bg-gradient-to-br ${gradients[index]} border ${borders[index]} shadow-sm hover:shadow-md transition-shadow`}>
                    <ElephantDecoration className="-bottom-8 -right-6 opacity-15" size={100} flip />
                    <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
                      <div className="bg-white p-2 rounded-lg shadow-sm mr-3">
                        <MapPin className="h-6 w-6 text-blue-500" />
                      </div>
                      {sucursal.nombre}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 space-y-3">
                    <div className="flex items-start space-x-3 bg-white p-3 rounded-lg">
                      <MapPin className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600 text-sm">{sucursal.direccion}</p>
                    </div>
                    <div className="flex items-center space-x-3 bg-white p-3 rounded-lg">
                      <Phone className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <p className="text-gray-600 text-sm">{sucursal.telefono}</p>
                    </div>
                    <div className="flex items-start space-x-3 bg-white p-3 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600 text-sm">{sucursal.horario}</p>
                    </div>
                    {sucursal.mapa_url && (
                      <a
                        href={sucursal.mapa_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                      >
                        <Button className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-sm text-sm">
                          <MapPin className="h-4 w-4 mr-2" />
                          Ver en Mapa
                        </Button>
                      </a>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="contacto" className="relative overflow-hidden py-20 bg-gray-50">
          <ElephantDecoration className="top-8 left-8 opacity-20" size={100} />
          <ElephantDecoration className="bottom-8 right-8 opacity-20" size={120} flip />
          <ElephantDecoration className="top-1/2 left-1/2 hidden lg:block opacity-10" size={150} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Contáctenos
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Estamos aquí para atender tus consultas y agendar tu cita
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <Card className="text-center bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="bg-blue-50 p-4 rounded-full inline-block mx-auto mb-3">
                  <Phone className="h-10 w-10 text-blue-500" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-800">Teléfono</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">+502 3001-5348</p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="bg-green-50 p-4 rounded-full inline-block mx-auto mb-3">
                  <MessageCircle className="h-10 w-10 text-green-500" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-800">WhatsApp</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href="https://wa.me/50230015348"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 text-sm hover:underline"
                >
                  Enviar Mensaje
                </a>
              </CardContent>
            </Card>

            <Card className="text-center bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="bg-pink-50 p-4 rounded-full inline-block mx-auto mb-3">
                  <BookOpen className="h-10 w-10 text-pink-500" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-800">Agendar Cita</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/agendar" className="text-pink-600 hover:text-pink-700 text-sm hover:underline">
                  Solicitar Cita
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link href="/agendar">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-sm hover:shadow-md transition-all rounded-lg px-8">
                <Heart className="mr-2 h-5 w-5" />
                Agendar Cita Ahora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
