-- Vincula retroactivamente las reservas existentes con su cliente por email.
-- Solo actúa sobre reservas sin customer_id que tengan un email que coincida
-- con un cliente registrado en el mismo negocio.
UPDATE public.bookings b
SET customer_id = c.id
FROM public.customers c
WHERE b.customer_id IS NULL
  AND b.customer_email IS NOT NULL
  AND b.customer_email != ''
  AND c.email = b.customer_email
  AND c.business_id = b.business_id;
