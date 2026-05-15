import { ArrowRightIcon } from '@heroicons/react/20/solid';

const stats = [
  {
    value: '< 4 semanas',
    label: 'De la consulta a la primera solución funcionando',
  },
  {
    value: 'Sin inversión inicial',
    label: 'Modelos adaptados al tamaño y ritmo de tu empresa',
  },
  {
    value: 'Resultados medibles',
    label: 'Solo implementamos lo que tiene impacto real en tu negocio',
  },
];

export default function Hero() {
  return (
    <section className="bg-white" aria-label="Presentación de ComplexIA">
      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-20">
        <div className="mx-auto max-w-3xl text-center">

          {/* Tag pill */}
          <div className="mb-6 inline-flex items-center rounded-full bg-green-100 px-4 py-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest text-green-800">
              IA · CPS · Software para PYMEs
            </span>
          </div>

          {/* H1 */}
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-green-950">Simplificando lo complejo.</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-green-800">
            Ayudamos a PYMEs a dar el salto digital con soluciones de IA
            accesibles, personalizadas y orientadas a resultados reales. Sin
            tecnicismos. Sin grandes inversiones. Con acompañamiento desde el
            primer día.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="#contacto"
              className="w-full sm:w-auto rounded-md bg-green-700 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-green-800 transition-colors text-center"
            >
              Hablemos de tu negocio
            </a>
            <a
              href="#metodologia"
              className="inline-flex items-center gap-1.5 text-base font-semibold text-green-700 hover:text-green-800 transition-colors"
            >
              Ver cómo trabajamos
              <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-green-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <dl className="grid grid-cols-1 gap-y-8 sm:grid-cols-3 sm:gap-y-0 sm:divide-x sm:divide-green-800">
            {stats.map((stat) => (
              <div
                key={stat.value}
                className="flex flex-col items-center text-center sm:px-8"
              >
                <dt className="text-xl font-bold text-white">
                  {stat.value}
                </dt>
                <dd className="mt-2 text-sm font-medium text-green-300 leading-snug">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
