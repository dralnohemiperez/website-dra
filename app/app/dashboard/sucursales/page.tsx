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
import { MapPin, Phone, Clock, Plus, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { toast } from 'sonner';

type Sucursal = Database['public']['Tables']['sucursales']['Row'];

export default function SucursalesPage() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSucursal, setEditingSucursal] = useState<Sucursal | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    horario: '',
    mapa_url: '',
    activo: true,
  });

  useEffect(() => {
    loadSucursales();
  }, []);

  async function loadSucursales() {
    const { data } = await supabase
      .from('sucursales')
      .select('*')
      .order('nombre');

    if (data) setSucursales(data);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSucursal) {
        const { error } = await (supabase.from('sucursales') as any).update(formData).eq('id', editingSucursal.id);

        if (error) throw error;
        toast.success('Sucursal actualizada exitosamente');
      } else {
        const { error } = await (supabase.from('sucursales') as any).insert(formData);

        if (error) throw error;
        toast.success('Sucursal creada exitosamente');
      }

      setDialogOpen(false);
      resetForm();
      loadSucursales();
    } catch (error: any) {
      toast.error('Error al guardar la sucursal', {
        description: error.message
      });
    }
  };

  const handleEdit = (sucursal: Sucursal) => {
    setEditingSucursal(sucursal);
    setFormData({
      nombre: sucursal.nombre,
      direccion: sucursal.direccion,
      telefono: sucursal.telefono,
      horario: sucursal.horario,
      mapa_url: sucursal.mapa_url || '',
      activo: sucursal.activo,
    });
    setDialogOpen(true);
  };

  const handleToggleActivo = async (sucursal: Sucursal) => {
    const { error } = await (supabase.from('sucursales') as any).update({ activo: !sucursal.activo }).eq('id', sucursal.id);

    if (error) {
      toast.error('Error al actualizar el estado');
    } else {
      toast.success(`Sucursal ${!sucursal.activo ? 'activada' : 'desactivada'}`);
      loadSucursales();
    }
  };

  const resetForm = () => {
    setEditingSucursal(null);
    setFormData({
      nombre: '',
      direccion: '',
      telefono: '',
      horario: '',
      mapa_url: '',
      activo: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Sucursales</h1>
          <p className="text-gray-600 mt-2">
            Administre las ubicaciones de su clínica
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Sucursal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSucursal ? 'Editar Sucursal' : 'Nueva Sucursal'}
              </DialogTitle>
              <DialogDescription>
                {editingSucursal ? 'Modifique la información de la sucursal' : 'Complete los datos de la nueva sucursal'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la Sucursal</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  placeholder="Ej: Clínica Zona 10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección Completa</Label>
                <Textarea
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  required
                  placeholder="Ej: 12 Calle 5-67, Zona 10, Ciudad de Guatemala"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    required
                    placeholder="Ej: 2345-6789"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horario">Horario de Atención</Label>
                  <Input
                    id="horario"
                    value={formData.horario}
                    onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                    required
                    placeholder="Ej: L-V 7am-4pm, S 7am-12pm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mapa_url">URL del Mapa (Waze o Google Maps)</Label>
                <Input
                  id="mapa_url"
                  value={formData.mapa_url}
                  onChange={(e) => setFormData({ ...formData, mapa_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                />
                <Label htmlFor="activo">Sucursal activa</Label>
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
                  {editingSucursal ? 'Actualizar' : 'Crear'} Sucursal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sucursales.map((sucursal) => (
          <Card key={sucursal.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    {sucursal.nombre}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {sucursal.activo ? (
                      <Badge className="bg-green-100 text-green-800">Activa</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Inactiva</Badge>
                    )}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(sucursal)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">{sucursal.direccion}</p>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <p className="text-sm text-gray-600">{sucursal.telefono}</p>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <p className="text-sm text-gray-600">{sucursal.horario}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActivo(sucursal)}
                  className="flex-1"
                >
                  {sucursal.activo ? 'Desactivar' : 'Activar'}
                </Button>
                {sucursal.mapa_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(sucursal.mapa_url!, '_blank')}
                    className="flex-1"
                  >
                    Ver Mapa
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sucursales.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No hay sucursales registradas</p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Sucursal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
