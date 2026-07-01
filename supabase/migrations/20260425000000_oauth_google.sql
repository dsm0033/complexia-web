-- Sprint 6: OAuth Google + base del Portal Cliente

-- 1. Enlazar customers con auth.users (para que el cliente vea su historial)
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS customers_auth_user_id_idx ON public.customers (auth_user_id);

-- 2. Permitir que un usuario inserte su propio perfil (necesario en el callback OAuth)
CREATE POLICY "usuario inserta su propio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. El cliente puede leer su propio registro en customers
CREATE POLICY "cliente lee su propio registro"
  ON public.customers FOR SELECT
  USING (auth_user_id = auth.uid());

-- 4. El cliente puede leer su propio historial de servicios
CREATE POLICY "cliente lee su historial"
  ON public.service_records FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM public.customers WHERE auth_user_id = auth.uid()
    )
  );

-- 5. Función auxiliar: devuelve el business_id por defecto (único negocio)
CREATE OR REPLACE FUNCTION public.get_default_business_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id FROM public.businesses LIMIT 1;
$$;

-- 6. Función trigger: crea perfil + customer al registrarse un nuevo usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_business_id          uuid;
  v_existing_customer_id uuid;
  v_full_name            text;
BEGIN
  SELECT id INTO v_business_id FROM public.businesses LIMIT 1;

  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.email
  );

  -- Crea perfil solo si no existe (ON CONFLICT protege a admin/employee ya creados)
  INSERT INTO public.profiles (id, business_id, full_name, role)
  VALUES (NEW.id, v_business_id, v_full_name, 'customer')
  ON CONFLICT (id) DO NOTHING;

  -- Vincula con customer existente (por email) o crea uno nuevo
  SELECT id INTO v_existing_customer_id
  FROM public.customers
  WHERE email = NEW.email AND business_id = v_business_id
  LIMIT 1;

  IF v_existing_customer_id IS NOT NULL THEN
    UPDATE public.customers
    SET auth_user_id = NEW.id
    WHERE id = v_existing_customer_id;
  ELSE
    INSERT INTO public.customers (business_id, full_name, email, auth_user_id)
    VALUES (v_business_id, v_full_name, NEW.email, NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

-- 7. Dispara la función al crear un nuevo usuario en auth
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
