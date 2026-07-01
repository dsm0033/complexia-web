-- Vincula reservas con clientes automáticamente.
--
-- Antes: bookings guardaba nombre/email/teléfono como strings sueltos sin FK.
-- La función buscarOCrearCliente solo buscaba por email y no actualizaba bookings.
-- Resultado: no había forma de saber si un cliente era recurrente.
--
-- Ahora: bookings.customer_id apunta a customers, y la RPC acepta el ID
-- calculado antes de insertar. Los índices UNIQUE parciales evitan duplicados
-- en customers cuando se crea automáticamente desde una reserva.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL;

-- UNIQUE parcial: permite varios nulls pero no dos clientes con mismo email en el mismo negocio
CREATE UNIQUE INDEX IF NOT EXISTS customers_business_email_key
  ON public.customers(business_id, email)
  WHERE email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS customers_business_phone_key
  ON public.customers(business_id, phone)
  WHERE phone IS NOT NULL;

-- Actualiza la RPC para aceptar customer_id (nullable — en Stripe se pasa null
-- y se actualiza después del webhook; en pago local se calcula antes y se pasa).
CREATE OR REPLACE FUNCTION public.crear_booking_atomico(
  p_business_id      uuid,
  p_service_id       uuid,
  p_customer_name    text,
  p_license_plate    text,
  p_customer_email   text,
  p_customer_phone   text,
  p_date             date,
  p_time_slot        time,
  p_price            numeric,
  p_vehicle_type     text,
  p_discount_percent smallint,
  p_discount_amount  numeric,
  p_status           text,
  p_customer_id      uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_max_concurrent integer;
  v_slot_duration  integer;
  v_count          integer;
  v_booking_id     uuid;
BEGIN
  SELECT
    COALESCE(max_concurrent_bookings, 1),
    COALESCE(slot_duration_minutes, 60)
  INTO v_max_concurrent, v_slot_duration
  FROM public.business_settings
  WHERE business_id = p_business_id
  FOR UPDATE;

  IF v_max_concurrent IS NULL THEN
    v_max_concurrent := 1;
    v_slot_duration  := 60;
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM public.bookings b
  LEFT JOIN public.services s ON s.id = b.service_id
  WHERE b.business_id = p_business_id
    AND b.date        = p_date
    AND b.status     <> 'cancelado'
    AND b.time_slot  <= p_time_slot
    AND p_time_slot   < b.time_slot + (COALESCE(s.duration_minutes, v_slot_duration) || ' minutes')::interval;

  IF v_count >= v_max_concurrent THEN
    RAISE EXCEPTION 'slot_full' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.bookings (
    business_id, service_id, customer_name, license_plate, customer_email, customer_phone,
    date, time_slot, price, vehicle_type, discount_percent, discount_amount, status, customer_id
  ) VALUES (
    p_business_id, p_service_id, p_customer_name, p_license_plate, p_customer_email, p_customer_phone,
    p_date, p_time_slot, p_price, p_vehicle_type, p_discount_percent, p_discount_amount, p_status, p_customer_id
  ) RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.crear_booking_atomico(
  uuid, uuid, text, text, text, text, date, time, numeric, text, smallint, numeric, text, uuid
) TO anon, authenticated, service_role;
