'use client';

import { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Clock, User, Phone, FileText, CircleCheck as CheckCircle2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { toast } from 'sonner';

type Cita = Database['public']['Tables']['citas']['Row'] & {
  pacientes: { nombre_completo: string } | null;
  responsables: { nombre_completo: string; telefono: string } | null;
  sucursales: { nombre: string } | null;
  servicios: { nombre: string } | null;
};

export default function CalendarioPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    loadCitas();
  }, []);

  async function loadCitas() {
    const { data, error } = await supabase
      .from('citas')
      .select(`
        *,
        pacientes(nombre_completo),
        responsables(nombre_completo, telefono),
        sucursales(nombre),
        servicios(nombre)
      `)
      .order('fecha')
      .order('hora_inicio');

    if (data) {
      setCitas(data as Cita[]);
    }
  }

  const handleEventClick = (info: any) => {
    const cita = citas.find(c => c.id === info.event.id);
    if (cita) {
      setSelectedCita(cita);
      setDialogOpen(true);
    }
  };

  const handleUpdateEstado = async (nuevoEstado: string) => {
    if (!selectedCita) return;

    try {
      await (supabase.from('citas') as any).update({ estado: nuevoEstado }).eq('id', selectedCita.id);

      toast.success('Cita actualizada exitosamente');
      setDialogOpen(false);
      loadCitas();
    } catch (error) {
      toast.error('Error al actualizar la cita');
    }
  };

  const getEventColor = (estado: string) => {
    const colors: Record<string, string> = {
      pendiente: '#f59e0b',
      confirmada: '#3b82f6',
      completada: '#10b981',
      cancelada: '#ef4444',
      reprogramada: '#a855f7',
      no_asistio: '#6b7280',
    };
    return colors[estado] || '#3b82f6';
  };

  const events = citas.map(cita => ({
    id: cita.id,
    title: `${cita.pacientes?.nombre_completo} - ${cita.servicios?.nombre}`,
    start: `${cita.fecha}T${cita.hora_inicio}`,
    end: cita.hora_fin ? `${cita.fecha}T${cita.hora_fin}` : undefined,
    backgroundColor: getEventColor(cita.estado),
    borderColor: getEventColor(cita.estado),
  }));

  const estadoColors: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    confirmada: 'bg-blue-100 text-blue-800',
    completada: 'bg-green-100 text-green-800',
    cancelada: 'bg-red-100 text-red-800',
    reprogramada: 'bg-purple-100 text-purple-800',
    no_asistio: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendario de Citas</h1>
          <p className="text-gray-600 mt-2">
            Vista completa de todas sus citas programadas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500"></div>
          <span className="text-sm text-gray-600">Pendiente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500"></div>
          <span className="text-sm text-gray-600">Confirmada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span className="text-sm text-gray-600">Completada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span className="text-sm text-gray-600">Cancelada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-500"></div>
          <span className="text-sm text-gray-600">Reprogramada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-500"></div>
          <span className="text-sm text-gray-600">No asistió</span>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="timeGridWeek"
            locale={esLocale}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            }}
            slotMinTime="07:00:00"
            slotMaxTime="17:00:00"
            allDaySlot={false}
            events={events}
            eventClick={handleEventClick}
            height="auto"
            slotDuration="01:00:00"
            nowIndicator={true}
            businessHours={[
              {
                daysOfWeek: [1, 2, 3, 4, 5],
                startTime: '07:00',
                endTime: '16:00',
              },
              {
                daysOfWeek: [6],
                startTime: '07:00',
                endTime: '12:00',
              }
            ]}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Cita</DialogTitle>
            <DialogDescription>
              Información completa y opciones de gestión
            </DialogDescription>
          </DialogHeader>

          {selectedCita && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge className={estadoColors[selectedCita.estado]}>
                  {selectedCita.estado.toUpperCase()}
                </Badge>
                <span className="text-sm text-gray-500">ID: {selectedCita.id.slice(0, 8)}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Paciente</p>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedCita.pacientes?.nombre_completo}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Responsable</p>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedCita.responsables?.nombre_completo}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Teléfono</p>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedCita.responsables?.telefono}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Fecha</p>
                      <p className="text-base font-semibold text-gray-900">
                        {new Date(selectedCita.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Hora</p>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedCita.hora_inicio} - {selectedCita.hora_fin || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Sucursal</p>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedCita.sucursales?.nombre}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Servicio</p>
                    <p className="text-base font-semibold text-gray-900">
                      {selectedCita.servicios?.nombre}
                    </p>
                  </div>
                </div>

                {selectedCita.observaciones && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Observaciones</p>
                      <p className="text-base text-gray-700">
                        {selectedCita.observaciones}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Actualizar Estado</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateEstado('confirmada')}
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirmar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateEstado('completada')}
                    className="text-green-600 hover:bg-green-50"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Completar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateEstado('cancelada')}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateEstado('reprogramada')}
                    className="text-purple-600 hover:bg-purple-50"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Reprogramar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateEstado('no_asistio')}
                    className="text-gray-600 hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    No asistió
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
