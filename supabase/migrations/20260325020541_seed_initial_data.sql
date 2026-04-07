/*
  # Datos Iniciales del Sistema

  ## Descripción
  Inserta los datos iniciales necesarios para el funcionamiento del sistema:
  - Servicios pediátricos ofrecidos
  - Configuración de horarios de atención

  ## Servicios Incluidos
  1. Evaluación y atención del recién nacido
  2. Control del niño (sano y enfermo)
  3. Control del crecimiento y desarrollo
  4. Esquema de vacunación completo
  5. Evaluación de enfermedades gastrointestinales y respiratorias
  6. Atención de emergencias pediátricas
  7. Asesoría en la lactancia materna

  ## Horarios
  - Lunes a Viernes: 7:00 AM - 4:00 PM
  - Sábado: 7:00 AM - 12:00 PM
  - Duración de citas: 1 hora
*/

-- Insertar servicios pediátricos
INSERT INTO servicios (nombre, descripcion, duracion_minutos, activo, orden) VALUES
  ('Evaluación y atención del recién nacido', 'Revisión completa del estado de salud del recién nacido, incluyendo examen físico y orientación a los padres.', 60, true, 1),
  ('Control del niño (sano y enfermo)', 'Consultas de seguimiento para niños sanos y atención de enfermedades comunes.', 60, true, 2),
  ('Control del crecimiento y desarrollo', 'Monitoreo del crecimiento físico y desarrollo psicomotor del niño.', 60, true, 3),
  ('Esquema de vacunación completo', 'Aplicación y seguimiento del calendario de vacunas según edad del paciente.', 60, true, 4),
  ('Evaluación de enfermedades gastrointestinales y respiratorias', 'Diagnóstico y tratamiento de problemas digestivos y respiratorios en niños.', 60, true, 5),
  ('Atención de emergencias pediátricas', 'Atención inmediata de urgencias médicas en pacientes pediátricos.', 60, true, 6),
  ('Asesoría en la lactancia materna', 'Orientación y apoyo para madres en el proceso de lactancia materna.', 60, true, 7)
ON CONFLICT DO NOTHING;