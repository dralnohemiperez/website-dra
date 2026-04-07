/*
  # Datos de Ejemplo para Sucursales

  ## Descripción
  Inserta dos sucursales de ejemplo con sus respectivas configuraciones de horario.

  ## Sucursales Incluidas
  1. Clínica Zona 10
  2. Clínica Zona 15

  ## Configuración de Horarios
  - Lunes a Viernes: 7:00 AM - 4:00 PM (intervalos de 1 hora)
  - Sábados: 7:00 AM - 12:00 PM (intervalos de 1 hora)
*/

-- Insertar sucursales de ejemplo
INSERT INTO sucursales (nombre, direccion, telefono, horario, mapa_url, activo) VALUES
  (
    'Clínica Zona 10',
    '12 Calle 5-67, Zona 10, Edificio Médico Primer Nivel, Ciudad de Guatemala',
    '2345-6789',
    'Lunes a Viernes: 7:00 AM - 4:00 PM, Sábados: 7:00 AM - 12:00 PM',
    'https://waze.com/ul/example1',
    true
  ),
  (
    'Clínica Zona 15',
    'Avenida Las Américas 15-45, Zona 15, Vista Hermosa II, Ciudad de Guatemala',
    '2456-7890',
    'Lunes a Viernes: 7:00 AM - 4:00 PM, Sábados: 7:00 AM - 12:00 PM',
    'https://waze.com/ul/example2',
    true
  )
ON CONFLICT DO NOTHING;

-- Configurar horarios para las sucursales (Lunes a Viernes)
DO $$
DECLARE
  sucursal_record RECORD;
BEGIN
  FOR sucursal_record IN SELECT id FROM sucursales LOOP
    -- Lunes a Viernes (días 1-5)
    FOR dia IN 1..5 LOOP
      INSERT INTO configuracion_horarios (sucursal_id, dia_semana, hora_inicio, hora_fin, intervalo_minutos, activo)
      VALUES (sucursal_record.id, dia, '07:00', '16:00', 60, true)
      ON CONFLICT DO NOTHING;
    END LOOP;

    -- Sábado (día 6)
    INSERT INTO configuracion_horarios (sucursal_id, dia_semana, hora_inicio, hora_fin, intervalo_minutos, activo)
    VALUES (sucursal_record.id, 6, '07:00', '12:00', 60, true)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
