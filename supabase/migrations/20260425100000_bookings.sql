-- Sprint 6: Sistema de reservas con pago

CREATE TABLE public.bookings (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id       uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  service_id        uuid REFERENCES public.services(id) ON DELETE SET NULL,
  customer_name     text NOT NULL,
  license_plate     text NOT NULL,
  customer_email    text,
  date              date NOT NULL,
  time_slot         time NOT NULL,
  price             numeric NOT NULL,
  status            text NOT NULL DEFAULT 'pendiente',
  stripe_session_id text UNIQUE,
  notes             text,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin lee reservas"
  ON public.bookings FOR SELECT
  USING (
    business_id = public.get_my_business_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "admin actualiza reservas"
  ON public.bookings FOR UPDATE
  USING (business_id = public.get_my_business_id())
  WITH CHECK (business_id = public.get_my_business_id());

-- Cualquier visitante puede crear una reserva (sin login)
CREATE POLICY "público puede reservar"
  ON public.bookings FOR INSERT
  WITH CHECK (true);
