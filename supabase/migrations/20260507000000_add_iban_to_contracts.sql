-- Sprint 9: IBAN del empleado en tabla employees
-- El empleado lo introduce él mismo desde su portal (/empleado/perfil)
-- El admin lo lee al generar el PDF de nómina
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS iban text;
