'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Baby, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Paciente = Database['public']['Tables']['pacientes']['Row'] & {
  responsables: { nombre_completo: string; telefono: string } | null;
};

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [filteredPacientes, setFilteredPacientes] = useState<Paciente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPacientes();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredPacientes(
        pacientes.filter(p =>
          p.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.responsables?.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.responsables?.telefono.includes(searchTerm)
        )
      );
    } else {
      setFilteredPacientes(pacientes);
    }
  }, [searchTerm, pacientes]);

  async function loadPacientes() {
    const { data } = await supabase
      .from('pacientes')
      .select(`
        *,
        responsables(nombre_completo, telefono)
      `)
      .order('created_at', { ascending: false });

    if (data) setPacientes(data as Paciente[]);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Pacientes</h1>
        <p className="text-gray-600 mt-2">
          Base de datos de pacientes registrados
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Pacientes
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{pacientes.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Pacientes</CardTitle>
          <CardDescription>
            Busque por nombre del paciente, responsable o teléfono
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultados ({filteredPacientes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Género</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Registro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPacientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No se encontraron pacientes
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPacientes.map(paciente => (
                    <TableRow key={paciente.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Baby className="h-4 w-4 text-blue-600" />
                          {paciente.nombre_completo}
                        </div>
                      </TableCell>
                      <TableCell>{paciente.edad_anos} años</TableCell>
                      <TableCell>
                        {paciente.genero && (
                          <Badge variant="outline">{paciente.genero}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {paciente.responsables?.nombre_completo}
                        </div>
                      </TableCell>
                      <TableCell>{paciente.responsables?.telefono}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(paciente.created_at).toLocaleDateString('es-ES')}
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
