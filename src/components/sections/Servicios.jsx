import { MagnifyingGlassIcon, CodeBracketIcon, CpuChipIcon, ShieldCheckIcon, ArrowRightIcon } from '@heroicons/react/20/solid';

const servicios = [
  {
    icon: CodeBracketIcon,
    titulo: 'Desarrollo Web',
    descripcion:
      'Aplicaciones web a medida con el stack más moderno. Frontend, backend, base de datos y pasarela de pagos integrada. Entregadas en sprints semanales con revisión continua.',
    slug: 'desarrollo-web',
  },
  {
    icon: CpuChipIcon,
    titulo: 'Inteligencia Artificial',
    descripcion:
      'Visión artificial, machine learning y modelos de lenguaje aplicados a tu negocio. Desde la detección de imágenes hasta chatbots con GPT-4 Vision integrados en tu plataforma.',
    slug: 'inteligencia-artificial',
  },
  {
    icon: MagnifyingGlassIcon,
    titulo: 'Consultoría CPS',
    descripcion:
      'Antes de escribir una línea de código nos integramos en tu negocio durante una semana para identificar el problema real. Diagnóstico completo y estimación definitiva antes de formalizar nada.',
    slug: 'consultoria-cps',
  },
  {
    icon: ShieldCheckIcon,
    titulo: 'Mantenimiento y Soporte',
    descripcion:
      'Contrato mensual con actualizaciones, corrección de errores, copias de seguridad y soporte técnico ante cualquier incidencia. Tu solución siempre en marcha.',
    slug: 'mantenimiento',
  },
];

export default function Servicios() {
  return (
    <section id="servicios" aria-label="Servicios de ComplexIA" className="bg-green-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">

        {/* Cabecera */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <div className="mb-4 inline-flex items-center rounded-full bg-green-100 px-4 py-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest text-green-800">
              Qué hacemos
            </span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-green-950 sm:text-5xl">
            Servicios
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-green-800">
            Cuatro áreas de trabajo pensadas para llevar a tu empresa del problema
            al resultado, sin tecnicismos ni rodeos.
          </p>
        </div>

        {/* Grid de servicios */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {servicios.map((servicio) => {
            const Icon = servicio.icon;
            return (
              <article
                key={servicio.slug}
                className="flex flex-col rounded-2xl border border-green-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Icono */}
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                  <Icon className="h-6 w-6 text-green-700" aria-hidden="true" />
                </div>

                {/* Título */}
                <h3 className="text-xl font-bold text-green-950">
                  {servicio.titulo}
                </h3>

                {/* Descripción */}
                <p className="mt-3 flex-1 text-base leading-relaxed text-green-800">
                  {servicio.descripcion}
                </p>

                {/* Link */}
                <a
                  href="#contacto"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
                >
                  Saber más
                  <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
