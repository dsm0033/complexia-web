-- Fix overbooking: la comprobación de solapamiento ignoraba la duración de la NUEVA reserva.
--
-- Antes (20260517000000 / 20260521000001) el WHERE contaba reservas existentes así:
--     b.time_slot <= p_time_slot AND p_time_slot < b.time_slot + dur_existente
-- Eso solo detecta "una reserva existente cubre el INICIO de la nueva". No detecta
-- que la nueva reserva, por su propia duración, se extienda sobre una existente
-- posterior. Caso real (17/06): Monica 10:00–11:30 ya existía; al pedir 09:00 con un
-- servicio de 90 min (09:00–10:30) la condición `10:00 <= 09:00` era falsa → no la
-- contaba → permitía la reserva, generando un solape con max_concurrent_bookings = 1.
--
-- Solapamiento real de dos intervalos [a1,a2) y [b1,b2): a1 < b2 AND b1 < a2.
-- Aplicado a nueva [p_time_slot, p_time_slot + dur_new) vs existente [b.time_slot, b.time_slot + dur_exist):
--     b.time_slot < p_time_slot + dur_new   AND   p_time_slot < b.time_slot + dur_exist
-- Nota: contar reservas que solapan el intervalo de la nueva es exacto para
-- max_concurrent = 1. Para max > 1 es ligeramente conservador (puede rechazar una
-- reserva válida cuyos solapes no coinciden en un mismo instante); aceptable por
-- ahora — un barrido por instantes se haría si algún negocio usa max > 1 en serio.

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
  v_dur_new        integer;
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

  -- Duración del servicio que se está reservando (la "nueva" reserva).
  SELECT COALESCE(duration_minutes, v_slot_duration)
  INTO v_dur_new
  FROM public.services
  WHERE id = p_service_id;
  v_dur_new := COALESCE(v_dur_new, v_slot_duration);

  -- Cuenta reservas activas cuyo intervalo solapa con [p_time_slot, p_time_slot + dur_new).
  SELECT COUNT(*) INTO v_count
  FROM public.bookings b
  LEFT JOIN public.services s ON s.id = b.service_id
  WHERE b.business_id = p_business_id
    AND b.date        = p_date
    AND b.status     <> 'cancelado'
    AND b.time_slot   < p_time_slot + (v_dur_new || ' minutes')::interval
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
