'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Stethoscope, Plus, Pencil, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { toast } from 'sonner';

type Servicio = Database['public']['Tables']['servicios']['Row'];

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    duracion_minutos: 60,
    precio: '',
    activo: true,
    orden: 0,
  });

  useEffect(() => {
    loadServicios();
  }, []);

  async function loadServicios() {
    const { data } = await supabase
      .from('servicios')
      .select('*')
      .order('orden');

    if (data) setServicios(data);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dataToSave = {
        ...formData,
        precio: formData.precio ? parseFloat(formData.precio) : null,
      };

      if (editingServicio) {
        const { error } = await (supabase.from('servicios') as any).update(dataToSave).eq('id', editingServicio.id);

        if (error) throw error;
        toast.success('Servicio actualizado exitosamente');
      } else {
        const maxOrden = Math.max(...servicios.map(s => s.orden), 0);
        const { error } = await (supabase.from('servicios') as any).insert({ ...dataToSave, orden: maxOrden + 1 });

        if (error) throw error;
        toast.success('Servicio creado exitosamente');
      }

      setDialogOpen(false);
      resetForm();
      loadServicios();
    } catch (error: any) {
      toast.error('Error al guardar el servicio', {
        description: error.message
      });
    }
  };

  const handleEdit = (servicio: Servicio) => {
    setEditingServicio(servicio);
    setFormData({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || '',
      duracion_minutos: servicio.duracion_minutos,
      precio: servicio.precio?.toString() || '',
      activo: servicio.activo,
      orden: servicio.orden,
    });
    setDialogOpen(true);
  };

  const handleToggleActivo = async (servicio: Servicio) => {
    const { error } = await (supabase.from('servicios') as any).update({ activo: !servicio.activo }).eq('id', servicio.id);

    if (error) {
      toast.error('Error al actualizar el estado');
    } else {
      toast.success(`Servicio ${!servicio.activo ? 'activado' : 'desactivado'}`);
      loadServicios();
    }
  };

  const handleMoveUp = async (servicio: Servicio, index: number) => {
    if (index === 0) return;

    const prevServicio = servicios[index - 1];

    await (supabase.from('servicios') as any).update({ orden: prevServicio.orden }).eq('id', servicio.id);
    await (supabase.from('servicios') as any).update({ orden: servicio.orden }).eq('id', prevServicio.id);

    loadServicios();
  };

  const handleMoveDown = async (servicio: Servicio, index: number) => {
    if (index === servicios.length - 1) return;

    const nextServicio = servicios[index + 1];

    await (supabase.from('servicios') as any).update({ orden: nextServicio.orden }).eq('id', servicio.id);
    await (supabase.from('servicios') as any).update({ orden: servicio.orden }).eq('id', nextServicio.id);

    loadServicios();
  };

  const resetForm = () => {
    setEditingServicio(null);
    setFormData({
      nombre: '',
      descripcion: '',
      duracion_minutos: 60,
      precio: '',
      activo: true,
      orden: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Servicios</h1>
          <p className="text-gray-600 mt-2">
            Administre los servicios médicos que ofrece
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Servicio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingServicio ? 'Editar Servicio' : 'Nuevo Servicio'}
              </DialogTitle>
              <DialogDescription>
                {editingServicio ? 'Modifique la información del servicio' : 'Complete los datos del nuevo servicio'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Servicio</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  placeholder="Ej: Control del niño sano"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción detallada del servicio..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duracion">Duración (minutos)</Label>
                  <Input
                    id="duracion"
                    type="number"
                    value={formData.duracion_minutos}
                    onChange={(e) => setFormData({ ...formData, duracion_minutos: parseInt(e.target.value) })}
                    required
                    min="15"
                    step="15"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precio">Precio (opcional)</Label>
                  <Input
                    id="precio"
                    type="number"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                />
                <Label htmlFor="activo">Servicio activo</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {editingServicio ? 'Actualizar' : 'Crear'} Servicio
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Servicios Registrados</CardTitle>
          <CardDescription>
            Lista completa de servicios médicos. Use las flechas para cambiar el orden de visualización.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Orden</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-[120px]">Duración</TableHead>
                <TableHead className="w-[100px]">Estado</TableHead>
                <TableHead className="w-[150px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servicios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No hay servicios registrados
                  </TableCell>
                </TableRow>
              ) : (
                servicios.map((servicio, index) => (
                  <TableRow key={servicio.id}>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveUp(servicio, index)}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveDown(servicio, index)}
                          disabled={index === servicios.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{servicio.nombre}</TableCell>
                    <TableCell className="max-w-md truncate text-sm text-gray-600">
                      {servicio.descripcion}
                    </TableCell>
                    <TableCell>{servicio.duracion_minutos} min</TableCell>
                    <TableCell>
                      {servicio.activo ? (
                        <Badge className="bg-green-100 text-green-800">Activo</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(servicio)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActivo(servicio)}
                        >
                          {servicio.activo ? 'Desactivar' : 'Activar'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
