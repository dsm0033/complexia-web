-- Seed del checklist de Lavado Completo
-- Migrado desde src/data/checklist.js

insert into public.checklists (business_id, name, items, active)
select
  b.id,
  'Lavado Completo',
  '[
    {"text": "Saludar al cliente y anotar datos del vehículo", "time": "1-2 min", "section": "Recepción"},
    {"text": "Inspección visual exterior: daños o arañazos previos", "time": "2 min", "section": "Recepción"},
    {"text": "Fotografiar zonas con daños pre-existentes", "time": "1 min", "section": "Recepción"},
    {"text": "Confirmar servicio elegido y extras si los hay", "time": "1 min", "section": "Recepción"},
    {"text": "Retirar objetos personales del cliente del interior", "time": "1 min", "section": "Recepción"},
    {"text": "Retirar alfombrillas y sacudir fuera del local", "time": "3 min", "section": "Interior"},
    {"text": "Aspirar suelo completo (incluyendo bajo asientos)", "time": "10 min", "section": "Interior"},
    {"text": "Aspirar asientos (costuras y pliegues)", "time": "10 min", "section": "Interior"},
    {"text": "Limpiar con paño húmedo zona bajo/alrededor asientos", "time": "8 min", "section": "Interior"},
    {"text": "Limpiar salpicadero con producto y paño microfibra", "time": "12 min", "section": "Interior"},
    {"text": "Limpiar consola central, palanca y mandos", "time": "6 min", "section": "Interior"},
    {"text": "Limpiar puertas por dentro (paneles y manivelas)", "time": "12 min", "section": "Interior"},
    {"text": "Limpiar techo interior si está sucio", "time": "4 min", "section": "Interior"},
    {"text": "Aplicar abrillantador de plásticos en salpicadero y puertas", "time": "3 min", "section": "Interior"},
    {"text": "Colocar alfombrillas limpias en su posición correcta", "time": "1 min", "section": "Interior"},
    {"text": "Revisar que no queden restos de producto en superficies", "time": "1 min", "section": "Interior"},
    {"text": "Aspirar maletero completo", "time": "3 min", "section": "Maletero"},
    {"text": "Limpiar paredes y tapa interior con paño húmedo", "time": "2 min", "section": "Maletero"},
    {"text": "Revisar que no queden objetos del cliente", "time": "1 min", "section": "Maletero"},
    {"text": "Aclarado inicial con agua a presión (eliminar suciedad gruesa)", "time": "3 min", "section": "Exterior"},
    {"text": "Aplicar champú en carrocería (de arriba a abajo)", "time": "3 min", "section": "Exterior"},
    {"text": "Lavar llantas y neumáticos con cepillo y producto específico", "time": "7 min", "section": "Exterior"},
    {"text": "Limpiar marcos de puertas y juntas", "time": "2 min", "section": "Exterior"},
    {"text": "Aclarado completo con agua a presión (sin restos de jabón)", "time": "3 min", "section": "Exterior"},
    {"text": "Secado de carrocería con microfibra (sin rayaduras)", "time": "2 min", "section": "Exterior"},
    {"text": "Limpiar todos los cristales con limpiacristales y microfibra", "time": "10 min", "section": "Cristales"},
    {"text": "Inspección visual completa: exterior e interior", "time": "3 min", "section": "Entrega"},
    {"text": "Colocar ambientador o fragancia si el cliente lo desea", "time": "1 min", "section": "Entrega"},
    {"text": "Limpiar zona de trabajo para el siguiente servicio", "time": "2 min", "section": "Entrega"},
    {"text": "Informar al cliente del trabajo realizado", "time": "2 min", "section": "Entrega"},
    {"text": "Cobrar el servicio y emitir recibo si se solicita", "time": "1 min", "section": "Entrega"}
  ]'::jsonb,
  true
from public.businesses b
limit 1;
