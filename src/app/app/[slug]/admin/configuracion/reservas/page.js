import { getAdminPageCtx } from '@/lib/admin-context'
import HorarioSemana from './_components/HorarioSemana'
import ConfigGeneral from './_components/ConfigGeneral'
import DescuentoAdelantado from './_components/DescuentoAdelantado'
import DescuentoEfectivo from './_components/DescuentoEfectivo'
import FestivosNacionales from './_components/FestivosNacionales'
import DiasBloqueados from './_components/DiasBloqueados'
import {
  guardarHorarioNegocio,
  guardarConfiguracion,
  guardarDescuento,
  guardarDescuentoEfectivo,
  guardarOpcionesFestivos,
  importarFestivos,
  bloquearFecha,
  desbloquearFecha,
} from './actions'

export const metadata = { title: 'Configuración de reservas · Admin IMPECABLE' }

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default async function ConfiguracionReservasPage() {
  const { supabase, businessId } = await getAdminPageCtx()

  const [
    { data: rawHours },
    { data: settings },
    { data: blockedDates },
  ] = await Promise.all([
    supabase
      .from('business_hours')
      .select('*')
      .eq('business_id', businessId)
      .order('day_of_week'),
    supabase
      .from('business_settings')
      .select('*')
      .eq('business_id', businessId)
      .single(),
    supabase
      .from('blocked_dates')
      .select('*')
      .eq('business_id', businessId)
      .order('date'),
  ])

  // Construir array completo de 7 días con valores por defecto si faltan registros
  const horario = DIAS.map((nombre, i) => {
    const row = rawHours?.find(h => h.day_of_week === i)
    return {
      day_of_week:       i,
      nombre,
      is_open:           row?.is_open           ?? (i < 5),
      open_time:         row?.open_time?.slice(0, 5) ?? '09:00',
      close_time:        row?.close_time?.slice(0, 5) ?? '18:00',
      lunch_break_start: row?.lunch_break_start?.slice(0, 5) ?? '',
      lunch_break_end:   row?.lunch_break_end?.slice(0, 5)   ?? '',
    }
  })

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración de reservas</h1>
        <p className="text-sm text-gray-500 mt-1">
          Horario del negocio, capacidad y días no disponibles.
        </p>
      </div>

      <HorarioSemana horario={horario} action={guardarHorarioNegocio} />

      <ConfigGeneral settings={settings} action={guardarConfiguracion} />

      <DescuentoAdelantado settings={settings} action={guardarDescuento} />

      <DescuentoEfectivo settings={settings} action={guardarDescuentoEfectivo} />

      <FestivosNacionales
        settings={settings}
        blockedCount={blockedDates?.filter(d => d.source !== 'manual').length ?? 0}
        actionOpciones={guardarOpcionesFestivos}
        actionImportar={importarFestivos}
      />

      <DiasBloqueados
        dates={blockedDates ?? []}
        actionBloquear={bloquearFecha}
        actionDesbloquear={desbloquearFecha}
      />
    </div>
  )
}
