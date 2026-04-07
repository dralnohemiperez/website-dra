export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          nombre: string
          email: string
          rol: 'doctora' | 'secretaria' | 'admin'
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          email: string
          rol?: 'doctora' | 'secretaria' | 'admin'
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          email?: string
          rol?: 'doctora' | 'secretaria' | 'admin'
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sucursales: {
        Row: {
          id: string
          nombre: string
          direccion: string
          telefono: string
          horario: string
          mapa_url: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          direccion: string
          telefono: string
          horario: string
          mapa_url?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          direccion?: string
          telefono?: string
          horario?: string
          mapa_url?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      servicios: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          duracion_minutos: number
          precio: number | null
          activo: boolean
          orden: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          duracion_minutos?: number
          precio?: number | null
          activo?: boolean
          orden?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          duracion_minutos?: number
          precio?: number | null
          activo?: boolean
          orden?: number
          created_at?: string
          updated_at?: string
        }
      }
      responsables: {
        Row: {
          id: string
          nombre_completo: string
          telefono: string
          direccion: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre_completo: string
          telefono: string
          direccion?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre_completo?: string
          telefono?: string
          direccion?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pacientes: {
        Row: {
          id: string
          nombre_completo: string
          fecha_nacimiento: string | null
          edad_anos: number | null
          genero: 'Masculino' | 'Femenino' | 'Otro' | null
          responsable_id: string
          observaciones_medicas: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre_completo: string
          fecha_nacimiento?: string | null
          edad_anos?: number | null
          genero?: 'Masculino' | 'Femenino' | 'Otro' | null
          responsable_id: string
          observaciones_medicas?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre_completo?: string
          fecha_nacimiento?: string | null
          edad_anos?: number | null
          genero?: 'Masculino' | 'Femenino' | 'Otro' | null
          responsable_id?: string
          observaciones_medicas?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      citas: {
        Row: {
          id: string
          paciente_id: string
          responsable_id: string
          sucursal_id: string
          servicio_id: string
          fecha: string
          hora_inicio: string
          hora_fin: string | null
          estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'reprogramada' | 'no_asistio'
          observaciones: string | null
          motivo_cancelacion: string | null
          motivo_reprogramacion: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          paciente_id: string
          responsable_id: string
          sucursal_id: string
          servicio_id: string
          fecha: string
          hora_inicio: string
          hora_fin?: string | null
          estado?: 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'reprogramada' | 'no_asistio'
          observaciones?: string | null
          motivo_cancelacion?: string | null
          motivo_reprogramacion?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          paciente_id?: string
          responsable_id?: string
          sucursal_id?: string
          servicio_id?: string
          fecha?: string
          hora_inicio?: string
          hora_fin?: string | null
          estado?: 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'reprogramada' | 'no_asistio'
          observaciones?: string | null
          motivo_cancelacion?: string | null
          motivo_reprogramacion?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      historial_estados_cita: {
        Row: {
          id: string
          cita_id: string
          estado_anterior: string | null
          estado_nuevo: string
          comentario: string | null
          usuario_id: string | null
          fecha_cambio: string
        }
        Insert: {
          id?: string
          cita_id: string
          estado_anterior?: string | null
          estado_nuevo: string
          comentario?: string | null
          usuario_id?: string | null
          fecha_cambio?: string
        }
        Update: {
          id?: string
          cita_id?: string
          estado_anterior?: string | null
          estado_nuevo?: string
          comentario?: string | null
          usuario_id?: string | null
          fecha_cambio?: string
        }
      }
      configuracion_horarios: {
        Row: {
          id: string
          sucursal_id: string
          dia_semana: number
          hora_inicio: string
          hora_fin: string
          intervalo_minutos: number
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sucursal_id: string
          dia_semana: number
          hora_inicio: string
          hora_fin: string
          intervalo_minutos?: number
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sucursal_id?: string
          dia_semana?: number
          hora_inicio?: string
          hora_fin?: string
          intervalo_minutos?: number
          activo?: boolean
          created_at?: string
        }
      }
      bloqueos_agenda: {
        Row: {
          id: string
          sucursal_id: string | null
          fecha: string
          hora_inicio: string | null
          hora_fin: string | null
          motivo: string
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sucursal_id?: string | null
          fecha: string
          hora_inicio?: string | null
          hora_fin?: string | null
          motivo: string
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sucursal_id?: string | null
          fecha?: string
          hora_inicio?: string | null
          hora_fin?: string | null
          motivo?: string
          activo?: boolean
          created_at?: string
        }
      }
    }
  }
}
