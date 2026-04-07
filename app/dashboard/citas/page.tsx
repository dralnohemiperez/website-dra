'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Calendar, MapPin, User, Phone, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Cita = Database['public']['Tables']['citas']['Row'] & {
  pacientes: { nombre_completo: string } | null;
  responsables: { nombre_completo: string; telefono: string } | null;
  sucursales: { nombre: string } | null;
  servicios: { nombre: string } | null;
};

type Sucursal = Database['public']['Tables']['sucursales']['Row'];

export default function CitasPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [filteredCitas, setFilteredCitas] = useState<Cita[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [sucursalFilter, setSucursalFilter] = useState('todos');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCitas();
  }, [searchTerm, estadoFilter, sucursalFilter, citas]);

  async function loadData() {
    const { data: citasData } = await supabase
      .from('citas')
      .select(`
        *,
        pacientes(nombre_completo),
        responsables(nombre_completo, telefono),
        sucursales(nombre),
        servicios(nombre)
      `)
      .order('fecha', { ascending: false })
      .order('hora_inicio', { ascending: false });

    const { data: sucursalesData } = await supabase
      .from('sucursales')
      .select('*')
      .eq('activo', true);

    if (citasData) setCitas(citasData as Cita[]);
    if (sucursalesData) setSucursales(sucursalesData);
  }

  function filterCitas() {
    let filtered = [...citas];

    if (searchTerm) {
      filtered = filtered.filter(cita =>
        cita.pacientes?.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.responsables?.telefono.includes(searchTerm)
      );
    }

    if (estadoFilter !== 'todos') {
      filtered = filtered.filter(cita => cita.estado === estadoFilter);
    }

    if (sucursalFilter !== 'todos') {
      filtered = filtered.filter(cita => cita.sucursal_id === sucursalFilter);
    }

    setFilteredCitas(filtered);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Citas</h1>
        <p className="text-gray-600 mt-2">
          Busque y administre todas las citas del sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
          <CardDescription>
            Utilice los filtros para encontrar citas específicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por paciente o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="confirmada">Confirmada</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
                <SelectItem value="reprogramada">Reprogramada</SelectItem>
                <SelectItem value="no_asistio">No asistió</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sucursalFilter} onValueChange={setSucursalFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Sucursal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las sucursales</SelectItem>
                {sucursales.map(sucursal => (
                  <SelectItem key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultados ({filteredCitas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Sucursal</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCitas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No se encontraron citas con los filtros seleccionados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCitas.map(cita => (
                    <TableRow key={cita.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>{cita.hora_inicio}</TableCell>
                      <TableCell>{cita.pacientes?.nombre_completo}</TableCell>
                      <TableCell>{cita.responsables?.nombre_completo}</TableCell>
                      <TableCell>{cita.responsables?.telefono}</TableCell>
                      <TableCell className="text-sm">{cita.servicios?.nombre}</TableCell>
                      <TableCell className="text-sm">{cita.sucursales?.nombre}</TableCell>
                      <TableCell>
                        <Badge className={estadoColors[cita.estado]}>
                          {cita.estado}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
