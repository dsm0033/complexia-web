import { ArrowRightIcon, ArrowTopRightOnSquareIcon, CheckCircleIcon } from '@heroicons/react/20/solid';

const casos = [
  {
    sector: 'Detailing · Limpieza de vehículos',
    nombre: 'La Impecable',
    web: 'https://laimpecable.es',
    descripcion:
      'SaaS completo que digitaliza e integra toda la operativa del negocio: ' +
      'desde la recepción del vehículo hasta la gestión de nóminas y el ' +
      'control económico, pasando por reservas online, pagos, empleados y ' +
      'clientes. Todo en una sola plataforma, en producción en cuatro semanas.',
    metricas: [
      { valor: '−50%', etiqueta: 'Tiempo de gestión y llamadas' },
      { valor: '4 semanas', etiqueta: 'De la consulta a producción' },
      { valor: '3 portales', etiqueta: 'Admin · Empleado · Cliente' },
      { valor: '10+ módulos', etiqueta: 'En una sola plataforma' },
    ],
    funcionalidades: [
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
    ],
  },
  {
    sector: 'Fútbol · Portal deportivo',
    nombre: 'Ascenso A1',
    web: 'https://ascensoa1.es',
    descripcion:
      'Plataforma web que centraliza toda la actualidad de la Segunda División ' +
      'española: clasificación, resultados y calendario, playoffs de ascenso, ' +
      'fichajes, noticias y plantillas de los equipos, actualizados de forma ' +
      'automática desde múltiples fuentes. Incluye cuentas de usuario con login ' +
      'social, panel de administración propio y un minijuego con ranking ' +
      'territorial. Desarrollada de cero (Node/Express + PostgreSQL) y desplegada ' +
      'en producción con integración y despliegue automáticos.',
    metricas: [
      { valor: '8 semanas', etiqueta: 'De cero a producción' },
      { valor: '22 equipos', etiqueta: 'Toda la Segunda División' },
      { valor: 'Cada 30 min', etiqueta: 'Datos actualizados solos' },
      { valor: '5+ fuentes', etiqueta: 'Prensa, RSS y Transfermarkt' },
    ],
    funcionalidades: [
      'Clasificación en tiempo real con escudos de todos los equipos',
      'Resultados y calendario por jornadas',
      'Bracket de playoffs de ascenso',
      'Agregador de noticias multifuente (prensa deportiva y RSS de los clubes)',
      'Buscador de fichajes con detección automática de equipo',
      'Fichas de equipo con plantillas reales (datos de Transfermarkt)',
      'Registro e inicio de sesión con Google (JWT + PostgreSQL)',
      'Perfil de usuario con equipo favorito',
      'Panel de administración propio (equipos, escudos, playoffs)',
      'Minijuego con ranking nacional, provincial y por ciudad',
      'Formulario de contacto con envío por correo propio (SMTP, sin terceros)',
      'Tema claro/oscuro y diseño 100% responsive',
      'Páginas legales completas (RGPD/LSSI) y banner de cookies',
      'SEO (sitemap + Search Console) y HTTPS forzado',
    ],
  },
];

function Caso({ sector, nombre, web, descripcion, metricas, funcionalidades }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2">

        {/* Columna izquierda — info */}
        <div className="p-8 lg:p-12">
          {/* Tag sector */}
          <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-green-700">
            {sector}
          </span>

          {/* Nombre */}
          <h3 className="mt-4 text-3xl font-extrabold text-green-950">
            {nombre}
          </h3>

          {/* Descripción */}
          <p className="mt-4 text-base leading-relaxed text-green-800">
            {descripcion}
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
              href={web}
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
  );
}

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

        {/* Casos */}
        <div className="space-y-8">
          {casos.map((c) => (
            <Caso key={c.nombre} {...c} />
          ))}
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
