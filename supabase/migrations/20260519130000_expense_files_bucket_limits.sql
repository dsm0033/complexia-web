-- Limites del bucket expense-files: tamaño y MIME types permitidos.
-- 8 MB es margen amplio sobre los ~250 KB típicos tras el downscale a 1500px
-- en cliente; cubre también PDFs vectoriales sin redimensionar.

UPDATE storage.buckets
SET file_size_limit    = 8388608,  -- 8 MB
    allowed_mime_types = ARRAY[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf'
    ]
WHERE id = 'expense-files';
