CREATE TABLE IF NOT EXISTS public.expenses (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id    uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  date           date NOT NULL,
  category       text NOT NULL CHECK (category IN ('suministros','alquiler','nominas','material','publicidad','otros')),
  amount         numeric(10,2) NOT NULL CHECK (amount > 0),
  iva_rate       integer NOT NULL DEFAULT 21 CHECK (iva_rate IN (0, 4, 10, 21)),
  description    text NOT NULL,
  provider       text,
  payment_method text NOT NULL DEFAULT 'transferencia' CHECK (payment_method IN ('efectivo','transferencia','bizum','tarjeta')),
  notes          text,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin gestiona gastos"
  ON public.expenses FOR ALL
  USING (
    business_id = (
      SELECT business_id FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    business_id = (
      SELECT business_id FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_expenses_business_id ON expenses(business_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date        ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category    ON expenses(business_id, category);
