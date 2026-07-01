-- Añadir mínimo personal al motor de IRPF (Art. 57 LIRPF)
-- Necesario para calcular la cuota de mínimo personal que se resta a la cuota íntegra
INSERT INTO public.payroll_settings (year, key, value) VALUES
  (2026, 'minimo_personal', 5550.00)
ON CONFLICT (year, key) DO UPDATE SET value = EXCLUDED.value;
