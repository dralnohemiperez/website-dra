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
    observaciones: '',
  });

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

  const generateTimeSlots = () => {
    const slots = [];
    const today = new Date(formData.fecha);
    const dayOfWeek = today.getDay();

    const startHour = 7;
    const endHour = dayOfWeek === 6 ? 12 : 16;

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    return slots;
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

      const horaFin = parseInt(formData.hora.split(':')[0]) + 1;
      const horaFinStr = `${horaFin.toString().padStart(2, '0')}:00`;

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
          observaciones: formData.observaciones || null,
        }] as any);

      if (appointmentError) throw appointmentError;

      toast.success('Cita agendada exitosamente', {
        description: 'Nos pondremos en contacto para confirmar su cita.',
      });

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
                      setFormData({ ...formData, sucursal_id: value })
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
                      disabled={!formData.fecha}
                    >
                      <SelectTrigger className="border-gray-200">
                        <SelectValue placeholder="Seleccione una hora" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateTimeSlots().map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Alert className="mt-4 bg-blue-50 border border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    <strong>Horarios de atención:</strong> Lunes a Viernes 7:00 AM - 4:00 PM, Sábados 7:00 AM - 12:00 PM
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
