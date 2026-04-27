'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PublicNav } from '@/components/public-nav';
import { PublicFooter } from '@/components/public-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Stethoscope, User, Phone, Baby, CircleAlert as AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Servicio = Database['public']['Tables']['servicios']['Row'];
type Sucursal = Database['public']['Tables']['sucursales']['Row'];
type Responsable = Database['public']['Tables']['responsables']['Row'];

export default function AgendarPage() {
  const router = useRouter();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sucursal_id: '',
    servicio_id: '',
    paciente_nombre: '',
    paciente_edad: '',
    responsable_nombre: '',
    responsable_telefono: '',
    fecha: '',
    hora: '',
    direccion_domicilio: '',
    observaciones: '',
  });

  const sucursalSeleccionada = sucursales.find(
  (sucursal) => sucursal.id === formData.sucursal_id
);

const esCitaDomicilio =
  sucursalSeleccionada?.nombre?.toLowerCase() === 'cita a domicilio';


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

  useEffect(() => {
    async function cargarHorariosDisponibles() {
      if (!formData.sucursal_id || !formData.fecha) {
        setHorariosDisponibles([]);
        return;
      }

      setLoadingHorarios(true);

      const { data, error } = await (supabase as any).rpc('obtener_horarios_disponibles', {
        p_sucursal_id: formData.sucursal_id,
        p_fecha: formData.fecha,
      });

      if (error) {
        console.error('Error cargando horarios:', error);
        toast.error('No se pudieron cargar los horarios disponibles');
        setHorariosDisponibles([]);
      } else {
        setHorariosDisponibles((data || []).map((item: any) => item.hora));
      }

      setLoadingHorarios(false);
    }

    cargarHorariosDisponibles();
  }, [formData.sucursal_id, formData.fecha]);

  
  const generarGoogleCalendarUrl = ({
  titulo,
  fecha,
  horaInicio,
  horaFin,
  ubicacion,
  descripcion,
}: {
  titulo: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  ubicacion: string;
  descripcion: string;
}) => {
  const limpiarFechaHora = (hora: string) =>
    `${fecha.replace(/-/g, '')}T${hora.replace(':', '')}00`;

  const start = limpiarFechaHora(horaInicio);
  const end = limpiarFechaHora(horaFin);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: titulo,
    dates: `${start}/${end}`,
    details: descripcion,
    location: ubicacion,
    ctz: 'America/Guatemala',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: existingGuardian } = await supabase
        .from('responsables')
        .select('*')
        .eq('telefono', formData.responsable_telefono)
        .maybeSingle();

      let responsableId: string;

      if (existingGuardian) {
        responsableId = (existingGuardian as any).id;
      } else {
        const { data: newGuardian, error: guardianError } = await supabase
          .from('responsables')
          .insert([{
            nombre_completo: formData.responsable_nombre,
            telefono: formData.responsable_telefono,
          }] as any)
          .select()
          .single();

        if (guardianError) throw guardianError;
        responsableId = (newGuardian as any).id;
      }

      const { data: newPatient, error: patientError } = await supabase
        .from('pacientes')
        .insert([{
          nombre_completo: formData.paciente_nombre,
          edad_anos: parseInt(formData.paciente_edad),
          responsable_id: responsableId,
        }] as any)
        .select()
        .single();

      if (patientError) throw patientError;

      if (!horariosDisponibles.includes(formData.hora)) {
        toast.error('Horario no disponible', {
          description: 'Ese horario ya no está disponible. Seleccione otro.',
        });
        setLoading(false);
        return;
      }

      const [hora, minuto] = formData.hora.split(':').map(Number);
      const fechaHora = new Date(2000, 0, 1, hora, minuto);

      fechaHora.setHours(fechaHora.getHours() + 1);

      const horaFinStr = `${fechaHora
        .getHours()
        .toString()
        .padStart(2, '0')}:${fechaHora
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;

    if (esCitaDomicilio && !formData.direccion_domicilio.trim()) {
      toast.error('Dirección requerida', {
        description: 'Debe ingresar la dirección para la cita a domicilio.',
      });
      setLoading(false);
      return;
    }

      const { error: appointmentError } = await supabase
        .from('citas')
        .insert([{
     
          paciente_id: (newPatient as any).id,
          responsable_id: responsableId,
          sucursal_id: formData.sucursal_id,
          servicio_id: formData.servicio_id,
          fecha: formData.fecha,
          hora_inicio: formData.hora,
          hora_fin: horaFinStr,
          estado: 'pendiente',
          observaciones: esCitaDomicilio
            ? [
                'CITA A DOMICILIO - SUJETO A APROBACIÓN',
                `Dirección: ${formData.direccion_domicilio}`,
                formData.observaciones ? `Observaciones: ${formData.observaciones}` : null,
              ]
                .filter(Boolean)
                .join('\n')
            : formData.observaciones || null,
        }] as any);

      const servicioSeleccionado = servicios.find(
        (servicio) => servicio.id === formData.servicio_id
      );

      const googleCalendarUrl = generarGoogleCalendarUrl({
        titulo: `Cita pediátrica - ${servicioSeleccionado?.nombre || 'Consulta'}`,
        fecha: formData.fecha,
        horaInicio: formData.hora,
        horaFin: horaFinStr,
        ubicacion: esCitaDomicilio
          ? formData.direccion_domicilio
          : sucursalSeleccionada?.direccion || 'Clínica pediátrica',
        descripcion: esCitaDomicilio
          ? `Cita a domicilio sujeta a aprobación.\nPaciente: ${formData.paciente_nombre}`
          : `Cita pediátrica.\nPaciente: ${formData.paciente_nombre}`,
      });

      toast.success('Cita agendada exitosamente', {
        description: 'Se abrirá Google Calendar para que puedas agregarla.',
      });

      window.open(googleCalendarUrl, '_blank');

     

      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error: any) {
      console.error('Error al agendar cita:', error);
      toast.error('Error al agendar la cita', {
        description: error.message || 'Por favor, intente nuevamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Agendar Cita
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Completa el formulario y nos pondremos en contacto contigo para confirmar tu reserva
          </p>
        </div>

        <Card className="shadow-sm border border-gray-200 bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl border-b border-gray-100">
            <CardTitle className="text-2xl font-semibold text-gray-900">Información de la Cita</CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Todos los campos son obligatorios excepto observaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sucursal">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Sucursal
                  </Label>
                  <Select
                    value={formData.sucursal_id}
                    onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      sucursal_id: value,
                      hora: '',
                      direccion_domicilio: '',
                    })
                  }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una sucursal" />
                    </SelectTrigger>
                    <SelectContent>
                      {sucursales.map((sucursal) => (
                        <SelectItem key={sucursal.id} value={sucursal.id}>
                          {sucursal.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servicio">
                    <Stethoscope className="h-4 w-4 inline mr-2" />
                    Servicio
                  </Label>
                  <Select
                    value={formData.servicio_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, servicio_id: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {servicios.map((servicio) => (
                        <SelectItem key={servicio.id} value={servicio.id}>
                          {servicio.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {esCitaDomicilio && (
                <div className="border-t border-gray-100 pt-6 mt-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center">
                    <div className="bg-amber-50 p-2 rounded-lg mr-2">
                      <MapPin className="h-5 w-5 text-amber-600" />
                    </div>
                    Dirección de la Cita a Domicilio
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="direccion_domicilio" className="text-gray-700">
                      Dirección completa
                    </Label>
                    <Textarea
                      id="direccion_domicilio"
                      className="border-gray-200"
                      value={formData.direccion_domicilio}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          direccion_domicilio: e.target.value,
                        })
                      }
                      required={esCitaDomicilio}
                      placeholder="Ej: Colonia, zona, casa, referencias, municipio..."
                      rows={3}
                    />
                  </div>

                  <Alert className="mt-4 bg-amber-50 border border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 text-sm">
                      <strong>Importante:</strong> Las citas a domicilio están sujetas a aprobación.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <div className="border-t border-gray-100 pt-6 mt-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center">
                  <div className="bg-blue-50 p-2 rounded-lg mr-2">
                    <Baby className="h-5 w-5 text-blue-600" />
                  </div>
                  Datos del Paciente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="paciente_nombre" className="text-gray-700">Nombre Completo del Niño/Niña</Label>
                    <Input
                      id="paciente_nombre"
                      value={formData.paciente_nombre}
                      onChange={(e) =>
                        setFormData({ ...formData, paciente_nombre: e.target.value })
                      }
                      required
                      placeholder="Ej: María José López"
                      className="border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paciente_edad" className="text-gray-700">Edad (años)</Label>
                    <Input
                      id="paciente_edad"
                      type="number"
                      min="0"
                      max="18"
                      value={formData.paciente_edad}
                      onChange={(e) =>
                        setFormData({ ...formData, paciente_edad: e.target.value })
                      }
                      required
                      placeholder="Ej: 5"
                      className="border-gray-200"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 mt-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center">
                  <div className="bg-pink-50 p-2 rounded-lg mr-2">
                    <User className="h-5 w-5 text-pink-600" />
                  </div>
                  Datos del Padre/Madre o Encargado
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="responsable_nombre" className="text-gray-700">Nombre Completo</Label>
                    <Input
                      id="responsable_nombre"
                      value={formData.responsable_nombre}
                      onChange={(e) =>
                        setFormData({ ...formData, responsable_nombre: e.target.value })
                      }
                      required
                      placeholder="Ej: Ana López"
                      className="border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responsable_telefono" className="text-gray-700">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Teléfono de Contacto
                    </Label>
                    <Input
                      id="responsable_telefono"
                      type="tel"
                      value={formData.responsable_telefono}
                      onChange={(e) =>
                        setFormData({ ...formData, responsable_telefono: e.target.value })
                      }
                      required
                      placeholder="Ej: 1234-5678"
                      className="border-gray-200"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 mt-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center">
                  <div className="bg-purple-50 p-2 rounded-lg mr-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  Fecha y Hora
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fecha" className="text-gray-700">Fecha Solicitada</Label>
                    <Input
                      id="fecha"
                      type="date"
                      min={minDate}
                      value={formData.fecha}
                      onChange={(e) =>
                        setFormData({ ...formData, fecha: e.target.value, hora: '' })
                      }
                      required
                      className="border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hora" className="text-gray-700">
                      <Clock className="h-4 w-4 inline mr-2" />
                      Hora Solicitada
                    </Label>
                    <Select
                      value={formData.hora}
                      onValueChange={(value) =>
                        setFormData({ ...formData, hora: value })
                      }
                      required
                      disabled={!formData.fecha || !formData.sucursal_id || loadingHorarios}
                    >
                      <SelectTrigger className="border-gray-200">
                        <SelectValue
                          placeholder={
                            loadingHorarios
                              ? 'Cargando horarios...'
                              : 'Seleccione una hora'
                          }
                        />
                      </SelectTrigger>

                      <SelectContent>
                        {horariosDisponibles.length > 0 ? (
                          horariosDisponibles.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="sin-horarios" disabled>
                            No hay horarios disponibles
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Alert className="mt-4 bg-blue-50 border border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    <strong>Horarios de atención:</strong> Lunes a Viernes 7:00 AM - 4:00 PM, Sábados 7:00 AM - 12:00 PM, fuera de ese horario se tomarán como emergencia.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-6 mt-6">
                <Label htmlFor="observaciones" className="text-gray-700">Observaciones (opcional)</Label>
                <Textarea
                  id="observaciones"
                  className="border-gray-200"
                  value={formData.observaciones}
                  onChange={(e) =>
                    setFormData({ ...formData, observaciones: e.target.value })
                  }
                  placeholder="Indique cualquier información adicional que considere relevante..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="flex-1 border border-gray-300 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-sm hover:shadow-md transition-all"
                >
                  {loading ? 'Agendando...' : 'Agendar Cita'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <PublicFooter />
    </div>
  );
}
