-- Columna para marcar si ya se envió el recordatorio 24h de la reserva
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminder_sent boolean DEFAULT false;
