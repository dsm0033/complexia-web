-- Vehicle pricing per type (turismo_pequeno, turismo, suv, furgoneta, caravana)
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS vehicle_pricing JSONB DEFAULT '{}'::jsonb;

-- Track vehicle type on each booking
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS vehicle_type TEXT;
