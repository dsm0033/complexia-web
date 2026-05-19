import { ArrowRightIcon, ArrowTopRightOnSquareIcon, CheckCircleIcon } from '@heroicons/react/20/solid';

const funcionalidades = [
  'Recepción digital del vehículo con checklist interactivo',
  'Sistema de reservas online con calendario de disponibilidad',
  'Pasarela de pago integrada (Stripe) y pago en local',
  'Emails automáticos de confirmación y recordatorio 24h',
  'Portal del empleado con avisos de tareas y fichaje',
  'Portal del cliente con historial y descarga de facturas',
  'Facturación automática con PDF legal',
  'Gestión de nóminas, SS e IRPF automatizados',
  'Control de vacaciones y solicitudes de empleados',
  'Análisis de facturas con IA y registro automático en contabilidad',
  'Panel de contabilidad con P&L, gastos y analytics',
];

const metricas = [
  { valor: '−50%', etiqueta: 'Tiempo de gestión y llamadas' },
  { valor: '4 semanas', etiqueta: 'De la consulta a producción' },
  { valor: '3 portales', etiqueta: 'Admin · Empleado · Cliente' },
  { valor: '10+ módulos', etiqueta: 'En una sola plataforma' },
];

export default function Casos() {
  return (
    <section id="casos" aria-label="Casos de éxito de ComplexIA" className="bg-green-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">

        {/* Cabecera */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <div className="mb-4 inline-flex items-center rounded-full bg-green-100 px-4 py-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest text-green-800">
              Casos de éxito
            </span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-green-950 sm:text-5xl">
            Resultados reales
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-green-800">
            No vendemos promesas. Aquí tienes lo que hemos construido.
          </p>
        </div>

        {/* Caso destacado */}
        <div className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* Columna izquierda — info */}
            <div className="p-8 lg:p-12">
              {/* Tag sector */}
              <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-green-700">
                Detailing · Limpieza de vehículos
              </span>

              {/* Nombre */}
              <h3 className="mt-4 text-3xl font-extrabold text-green-950">
                La Impecable
              </h3>

              {/* Descripción */}
              <p className="mt-4 text-base leading-relaxed text-green-800">
                SaaS completo que digitaliza e integra toda la operativa del negocio:
                desde la recepción del vehículo hasta la gestión de nóminas y el
                control económico, pasando por reservas online, pagos, empleados y
                clientes. Todo en una sola plataforma, en producción en cuatro semanas.
              </p>

              {/* Métricas */}
              <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-green-100 pt-8 sm:grid-cols-4">
                {metricas.map((m) => (
                  <div key={m.etiqueta}>
                    <dt className="text-xs font-medium text-green-700">{m.etiqueta}</dt>
                    <dd className="mt-1 text-xl font-extrabold text-green-950">{m.valor}</dd>
                  </div>
                ))}
              </dl>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a
                  href="#contacto"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
                >
                  Hablemos de tu proyecto
                  <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href="https://laimpecable.es"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
                >
                  Ver la web
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Columna derecha — funcionalidades */}
            <div className="bg-green-900 p-8 lg:p-12">
              <p className="mb-6 text-sm font-semibold uppercase tracking-widest text-green-300">
                Qué incluye la solución
              </p>
              <ul className="space-y-3">
                {funcionalidades.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckCircleIcon
                      className="mt-0.5 h-5 w-5 shrink-0 text-green-400"
                      aria-hidden="true"
                    />
                    <span className="text-sm leading-relaxed text-green-100">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Próximos casos */}
        <p className="mt-10 text-center text-sm text-green-700">
          ¿Tu empresa podría ser el próximo caso de éxito?{' '}
          <a href="#contacto" className="font-semibold underline underline-offset-2 hover:text-green-800 transition-colors">
            Hablemos.
          </a>
        </p>

      </div>
    </section>
  );
}
