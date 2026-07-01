-- Sprint revisión SaaS — race condition en reservas
--
-- Antes: actions/booking.js leía slots disponibles y luego hacía INSERT en bookings.
-- Entre las dos operaciones cabían reservas concurrentes que se colaban por el
-- mismo slot, ya que la lectura no bloqueaba la escritura. Un cliente del SaaS
-- con tráfico real (o solo dos pulsando "Reservar" a la vez) podía generar
-- overbooking sin que nada saltase.
--
-- Esta función centraliza la regla "no más de max_concurrent_bookings reservas
-- vivas en un mismo instante" en BD y la ejecuta atómicamente dentro de una
-- transacción. Replica la lógica de getAvailableSlots (lib/availability.js)
-- pero a prueba de carreras: el SELECT ... FOR UPDATE sobre business_settings
-- serializa los chequeos del mismo negocio.

CREATE OR REPLACE FUNCTION public.crear_booking_atomico(
  p_business_id      uuid,
  p_service_id       uuid,
  p_customer_name    text,
  p_license_plate    text,
  p_customer_email   text,
  p_date             date,
  p_time_slot        time,
  p_price            numeric,
  p_vehicle_type     text,
  p_discount_percent smallint,
  p_discount_amount  numeric,
  p_status           text
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
  -- Bloquea la fila de settings del negocio para serializar reservas concurrentes
  SELECT
    COALESCE(max_concurrent_bookings, 1),
    COALESCE(slot_duration_minutes, 60)
  INTO v_max_concurrent, v_slot_duration
  FROM public.business_settings
  WHERE business_id = p_business_id
  FOR UPDATE;

  -- Si el negocio no tiene settings, asumimos defaults (max=1, slot=60min)
  IF v_max_concurrent IS NULL THEN
    v_max_concurrent := 1;
    v_slot_duration  := 60;
  END IF;

  -- Cuenta bookings activos cuya ventana [time_slot, time_slot + duración) ocupa
  -- el slot que pedimos. Usa la duración del servicio asociado o, si no hay,
  -- el slot_duration_minutes del negocio.
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
    business_id, service_id, customer_name, license_plate, customer_email,
    date, time_slot, price, vehicle_type, discount_percent, discount_amount, status
  ) VALUES (
    p_business_id, p_service_id, p_customer_name, p_license_plate, p_customer_email,
    p_date, p_time_slot, p_price, p_vehicle_type, p_discount_percent, p_discount_amount, p_status
  ) RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$;

-- Permite que la action pública (booking.js) y los webhooks puedan llamarla
GRANT EXECUTE ON FUNCTION public.crear_booking_atomico(
  uuid, uuid, text, text, text, date, time, numeric, text, smallint, numeric, text
) TO anon, authenticated, service_role;
