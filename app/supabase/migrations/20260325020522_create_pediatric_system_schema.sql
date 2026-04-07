/*
  # Sistema de Gestión de Citas Pediátricas - Esquema Principal

  ## Descripción General
  Este esquema crea la estructura completa para un sistema de gestión de citas
  para una clínica pediátrica con múltiples sucursales y servicios.

  ## Tablas Creadas

  ### 1. `usuarios`
  Gestiona los usuarios del sistema (doctora, secretarias, etc.)
  - id: UUID primary key
  - nombre: Nombre completo
  - email: Correo electrónico único
  - rol: Rol en el sistema (doctora, secretaria, admin)
  - activo: Estado del usuario
  - timestamps: created_at, updated_at

  ### 2. `sucursales`
  Gestiona las clínicas/sucursales donde se atiende
  - id: UUID primary key
  - nombre: Nombre de la sucursal
  - direccion: Dirección física
  - telefono: Teléfono de contacto
  - horario: Descripción del horario
  - mapa_url: URL a Waze o Google Maps
  - activo: Estado de la sucursal
  - timestamps: created_at, updated_at

  ### 3. `servicios`
  Catálogo de servicios médicos ofrecidos
  - id: UUID primary key
  - nombre: Nombre del servicio
  - descripcion: Descripción detallada
  - duracion_minutos: Duración estimada (60 minutos por defecto)
  - precio: Precio opcional
  - activo: Estado del servicio
  - orden: Orden de visualización
  - timestamps: created_at, updated_at

  ### 4. `responsables`
  Padres o tutores legales de los pacientes
  - id: UUID primary key
  - nombre_completo: Nombre del responsable
  - telefono: Teléfono de contacto (único)
  - direccion: Dirección opcional
  - email: Email opcional
  - timestamps: created_at, updated_at

  ### 5. `pacientes`
  Niños/pacientes atendidos en la clínica
  - id: UUID primary key
  - nombre_completo: Nombre del paciente
  - fecha_nacimiento: Fecha de nacimiento
  - edad_anos: Edad en años (calculada o manual)
  - genero: Masculino/Femenino/Otro
  - responsable_id: Relación con responsable
  - observaciones_medicas: Notas médicas básicas
  - timestamps: created_at, updated_at

  ### 6. `citas`
  Registro de todas las citas médicas
  - id: UUID primary key
  - paciente_id: Relación con paciente
  - responsable_id: Relación con responsable
  - sucursal_id: Sucursal donde se atiende
  - servicio_id: Servicio solicitado
  - fecha: Fecha de la cita
  - hora_inicio: Hora de inicio
  - hora_fin: Hora de finalización
  - estado: Estado actual (pendiente, confirmada, completada, cancelada, etc.)
  - observaciones: Notas adicionales
  - motivo_cancelacion: Razón si fue cancelada
  - motivo_reprogramacion: Razón si fue reprogramada
  - created_by: Usuario que creó la cita
  - timestamps: created_at, updated_at

  ### 7. `historial_estados_cita`
  Auditoría de cambios de estado de las citas
  - id: UUID primary key
  - cita_id: Relación con la cita
  - estado_anterior: Estado previo
  - estado_nuevo: Nuevo estado
  - comentario: Comentario del cambio
  - usuario_id: Usuario que realizó el cambio
  - fecha_cambio: Timestamp del cambio

  ### 8. `configuracion_horarios`
  Configuración de horarios disponibles por sucursal
  - id: UUID primary key
  - sucursal_id: Relación con sucursal
  - dia_semana: 0-6 (0=Domingo, 6=Sábado)
  - hora_inicio: Hora de inicio
  - hora_fin: Hora de finalización
  - intervalo_minutos: Intervalo entre citas (60 minutos)
  - activo: Estado de la configuración

  ### 9. `bloqueos_agenda`
  Bloqueos de horarios (vacaciones, feriados, etc.)
  - id: UUID primary key
  - sucursal_id: Sucursal afectada (null = todas)
  - fecha: Fecha del bloqueo
  - hora_inicio: Hora de inicio del bloqueo
  - hora_fin: Hora de fin del bloqueo
  - motivo: Razón del bloqueo
  - activo: Estado del bloqueo

  ## Seguridad
  - RLS habilitado en todas las tablas
  - Políticas restrictivas por defecto
  - Acceso público limitado a datos necesarios para el formulario de citas
  - Acceso completo para usuarios autenticados
*/

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  email text UNIQUE NOT NULL,
  rol text NOT NULL DEFAULT 'doctora' CHECK (rol IN ('doctora', 'secretaria', 'admin')),
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de sucursales
CREATE TABLE IF NOT EXISTS sucursales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  direccion text NOT NULL,
  telefono text NOT NULL,
  horario text NOT NULL,
  mapa_url text,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de servicios
CREATE TABLE IF NOT EXISTS servicios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  duracion_minutos integer DEFAULT 60,
  precio decimal(10,2),
  activo boolean DEFAULT true,
  orden integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de responsables
CREATE TABLE IF NOT EXISTS responsables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo text NOT NULL,
  telefono text UNIQUE NOT NULL,
  direccion text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo text NOT NULL,
  fecha_nacimiento date,
  edad_anos integer,
  genero text CHECK (genero IN ('Masculino', 'Femenino', 'Otro')),
  responsable_id uuid REFERENCES responsables(id) ON DELETE RESTRICT,
  observaciones_medicas text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de citas
CREATE TABLE IF NOT EXISTS citas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid REFERENCES pacientes(id) ON DELETE RESTRICT,
  responsable_id uuid REFERENCES responsables(id) ON DELETE RESTRICT,
  sucursal_id uuid REFERENCES sucursales(id) ON DELETE RESTRICT,
  servicio_id uuid REFERENCES servicios(id) ON DELETE RESTRICT,
  fecha date NOT NULL,
  hora_inicio time NOT NULL,
  hora_fin time,
  estado text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'completada', 'cancelada', 'reprogramada', 'no_asistio')),
  observaciones text,
  motivo_cancelacion text,
  motivo_reprogramacion text,
  created_by uuid REFERENCES usuarios(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear índices para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
CREATE INDEX IF NOT EXISTS idx_citas_sucursal ON citas(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_responsable ON pacientes(responsable_id);
CREATE INDEX IF NOT EXISTS idx_responsables_telefono ON responsables(telefono);

-- Crear tabla de historial de estados
CREATE TABLE IF NOT EXISTS historial_estados_cita (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cita_id uuid REFERENCES citas(id) ON DELETE CASCADE,
  estado_anterior text,
  estado_nuevo text NOT NULL,
  comentario text,
  usuario_id uuid REFERENCES usuarios(id),
  fecha_cambio timestamptz DEFAULT now()
);

-- Crear tabla de configuración de horarios
CREATE TABLE IF NOT EXISTS configuracion_horarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sucursal_id uuid REFERENCES sucursales(id) ON DELETE CASCADE,
  dia_semana integer NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
  hora_inicio time NOT NULL,
  hora_fin time NOT NULL,
  intervalo_minutos integer DEFAULT 60,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de bloqueos de agenda
CREATE TABLE IF NOT EXISTS bloqueos_agenda (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sucursal_id uuid REFERENCES sucursales(id) ON DELETE CASCADE,
  fecha date NOT NULL,
  hora_inicio time,
  hora_fin time,
  motivo text NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE responsables ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_estados_cita ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE bloqueos_agenda ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios (solo usuarios autenticados pueden ver)
CREATE POLICY "Authenticated users can view usuarios"
  ON usuarios FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para sucursales
CREATE POLICY "Anyone can view active sucursales"
  ON sucursales FOR SELECT
  TO public
  USING (activo = true);

CREATE POLICY "Authenticated users can view all sucursales"
  ON sucursales FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sucursales"
  ON sucursales FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sucursales"
  ON sucursales FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para servicios
CREATE POLICY "Anyone can view active servicios"
  ON servicios FOR SELECT
  TO public
  USING (activo = true);

CREATE POLICY "Authenticated users can view all servicios"
  ON servicios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert servicios"
  ON servicios FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update servicios"
  ON servicios FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para responsables
CREATE POLICY "Anyone can insert responsables"
  ON responsables FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view responsables"
  ON responsables FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update responsables"
  ON responsables FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para pacientes
CREATE POLICY "Anyone can insert pacientes"
  ON pacientes FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view pacientes"
  ON pacientes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update pacientes"
  ON pacientes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para citas
CREATE POLICY "Anyone can insert citas"
  ON citas FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view citas"
  ON citas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update citas"
  ON citas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para historial
CREATE POLICY "Authenticated users can view historial"
  ON historial_estados_cita FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert historial"
  ON historial_estados_cita FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Políticas para configuración de horarios
CREATE POLICY "Anyone can view active configuracion_horarios"
  ON configuracion_horarios FOR SELECT
  TO public
  USING (activo = true);

CREATE POLICY "Authenticated users can manage configuracion_horarios"
  ON configuracion_horarios FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para bloqueos
CREATE POLICY "Anyone can view active bloqueos"
  ON bloqueos_agenda FOR SELECT
  TO public
  USING (activo = true);

CREATE POLICY "Authenticated users can manage bloqueos"
  ON bloqueos_agenda FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sucursales_updated_at BEFORE UPDATE ON sucursales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servicios_updated_at BEFORE UPDATE ON servicios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_responsables_updated_at BEFORE UPDATE ON responsables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON pacientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_citas_updated_at BEFORE UPDATE ON citas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para registrar cambios de estado automáticamente
CREATE OR REPLACE FUNCTION log_cita_estado_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    INSERT INTO historial_estados_cita (cita_id, estado_anterior, estado_nuevo, comentario)
    VALUES (NEW.id, OLD.estado, NEW.estado, 'Cambio automático de estado');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar cambios de estado
CREATE TRIGGER log_cita_estado_change_trigger
  AFTER UPDATE ON citas
  FOR EACH ROW
  EXECUTE FUNCTION log_cita_estado_change();