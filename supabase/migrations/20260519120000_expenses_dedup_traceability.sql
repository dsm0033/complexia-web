-- F8-07b: Detección de duplicados + trazabilidad de archivos en gastos
-- Añade invoice_number (separado de notes) con índice único parcial
-- y campos para guardar el archivo origen y el modelo OCR usado.

-- 1. Nuevas columnas en expenses
ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS invoice_number    text,
  ADD COLUMN IF NOT EXISTS file_storage_path text,
  ADD COLUMN IF NOT EXISTS ocr_model         text,
  ADD COLUMN IF NOT EXISTS ocr_processed_at  timestamptz;

-- 2. Índice único parcial: evita duplicar (mismo proveedor + mismo nº factura)
-- Solo aplica cuando ambos campos están presentes; gastos sin nº factura
-- (suministros prorrateados, peajes, etc.) no se ven afectados.
CREATE UNIQUE INDEX IF NOT EXISTS idx_expenses_unique_invoice
  ON public.expenses(business_id, provider, invoice_number)
  WHERE invoice_number IS NOT NULL AND provider IS NOT NULL;

-- 3. Bucket privado para archivos originales de facturas
INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-files', 'expense-files', false)
ON CONFLICT (id) DO NOTHING;

-- 4. RLS en storage.objects: cada admin solo accede a los archivos de su business.
-- Los archivos se almacenan con path "{business_id}/{expense_id}.{ext}", por lo que
-- (storage.foldername(name))[1] devuelve el business_id propietario.

DROP POLICY IF EXISTS "admin gestiona archivos gastos" ON storage.objects;

CREATE POLICY "admin gestiona archivos gastos"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'expense-files'
    AND (storage.foldername(name))[1] = (
      SELECT business_id::text FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'expense-files'
    AND (storage.foldername(name))[1] = (
      SELECT business_id::text FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
