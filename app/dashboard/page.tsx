'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CircleCheck as CheckCircle2, Circle as XCircle, CircleAlert as AlertCircle, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Cita = Database['public']['Tables']['citas']['Row'] & {
  pacientes: { nombre_completo: string } | null;
  responsables: { nombre_completo: string; telefono: string } | null;
  sucursales: { nombre: string } | null;
  servicios: { nombre: string } | null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
    hoy: 0,
    pendientes: 0,
    completadas: 0,
    canceladas: 0,
    totalPacientes: 0,
  });
  const [citasHoy, setCitasHoy] = useState<Cita[]>([]);
  const [proximasCitas, setProximasCitas] = useState<Cita[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    const today = new Date().toISOString().split('T')[0];

    const { data: citasHoyData } = await supabase
      .from('citas')
      .select(`
        *,
        pacientes(nombre_completo),
        responsables(nombre_completo, telefono),
        sucursales(nombre),
        servicios(nombre)
      `)
      .eq('fecha', today)
      .order('hora_inicio');

    const { count: pendientesCount } = await supabase
      .from('citas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'pendiente');

    const { count: completadasCount } = await supabase
      .from('citas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'completada');

    const { count: canceladasCount } = await supabase
      .from('citas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'cancelada');

    const { count: pacientesCount } = await supabase
      .from('pacientes')
      .select('*', { count: 'exact', head: true });

    const { data: proximasData } = await supabase
      .from('citas')
      .select(`
        *,
        pacientes(nombre_completo),
        responsables(nombre_completo, telefono),
        sucursales(nombre),
        servicios(nombre)
      `)
      .gte('fecha', today)
      .neq('estado', 'cancelada')
      .order('fecha')
      .order('hora_inicio')
      .limit(5);

    setCitasHoy(citasHoyData as Cita[] || []);
    setProximasCitas(proximasData as Cita[] || []);
    setStats({
      hoy: citasHoyData?.length || 0,
      pendientes: pendientesCount || 0,
      completadas: completadasCount || 0,
      canceladas: canceladasCount || 0,
      totalPacientes: pacientesCount || 0,
    });
  }

  const estadoColors: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    confirmada: 'bg-blue-100 text-blue-800',
    completada: 'bg-green-100 text-green-800',
    cancelada: 'bg-red-100 text-red-800',
    reprogramada: 'bg-purple-100 text-purple-800',
    no_asistio: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Resumen general de su actividad
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Citas Hoy
            </CardTitle>
            <Calendar className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.hoy}</div>
            <p className="text-xs text-gray-600 mt-1">
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pendientes
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.pendientes}</div>
            <p className="text-xs text-gray-600 mt-1">
              Citas por confirmar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Completadas
            </CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.completadas}</div>
            <p className="text-xs text-gray-600 mt-1">
              Total de consultas realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pacientes
            </CardTitle>
            <Users className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalPacientes}</div>
            <p className="text-xs text-gray-600 mt-1">
              Total registrados
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Citas de Hoy
            </CardTitle>
            <CardDescription>
              Consultas programadas para el día de hoy
            </CardDescription>
          </CardHeader>
          <CardContent>
            {citasHoy.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay citas programadas para hoy
              </p>
            ) : (
              <div className="space-y-4">
                {citasHoy.map((cita) => (
                  <div
                    key={cita.id}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {cita.hora_inicio}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 font-medium">
                        {cita.pacientes?.nombre_completo}
                      </p>
                      <p className="text-xs text-gray-600">
                        {cita.servicios?.nombre}
                      </p>
                      <p className="text-xs text-gray-500">
                        {cita.sucursales?.nombre}
                      </p>
                    </div>
                    <Badge className={estadoColors[cita.estado]}>
                      {cita.estado}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Link href="/dashboard/calendario">
                <Button variant="outline" className="w-full">
                  Ver Calendario Completo
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Próximas Citas
            </CardTitle>
            <CardDescription>
              Citas programadas próximamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {proximasCitas.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay citas próximas programadas
              </p>
            ) : (
              <div className="space-y-4">
                {proximasCitas.map((cita) => (
                  <div
                    key={cita.id}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900 text-sm">
                          {new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                          })} - {cita.hora_inicio}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 font-medium">
                        {cita.pacientes?.nombre_completo}
                      </p>
                      <p className="text-xs text-gray-600">
                        {cita.servicios?.nombre}
                      </p>
                    </div>
                    <Badge className={estadoColors[cita.estado]}>
                      {cita.estado}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Link href="/dashboard/citas">
                <Button variant="outline" className="w-full">
                  Ver Todas las Citas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
