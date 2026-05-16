const fases = [
  {
    numero: '01',
    duracion: '1 semana',
    titulo: 'Inmersión y análisis',
    descripcion:
      'Nos integramos en tu negocio para entender el problema real antes de proponer ninguna solución. Analizamos procesos, recursos, finanzas y presencia digital. Al final entregamos un diagnóstico completo con la estimación definitiva.',
  },
  {
    numero: '02',
    duracion: 'Variable',
    titulo: 'Desarrollo de la solución',
    descripcion:
      'Con el problema perfectamente definido, desarrollamos la solución bajo metodología Scrum en sprints semanales. Entregas parciales revisables en cada sprint para que siempre tengas el control del proyecto.',
  },
  {
    numero: '03',
    duracion: '1 semana',
    titulo: 'Pruebas y entrega',
    descripcion:
      'Testing funcional, de usabilidad y de rendimiento antes de la entrega final. Corrección de errores, ajustes con el cliente y formación básica sobre el uso de la plataforma y el panel de administración.',
  },
  {
    numero: '04',
    duracion: 'Mensual',
    titulo: 'Mantenimiento y soporte',
    descripcion:
      'Tras la entrega, ofrecemos un contrato de mantenimiento mensual con actualizaciones, corrección de errores, copias de seguridad y soporte técnico. Tu solución siempre actualizada y en marcha.',
  },
];

export default function Metodologia() {
  return (
    <section id="metodologia" aria-label="Metodología de trabajo de ComplexIA" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">

        {/* Cabecera */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <div className="mb-4 inline-flex items-center rounded-full bg-green-100 px-4 py-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest text-green-800">
              Cómo trabajamos
            </span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-green-950 sm:text-5xl">
            Metodología CPS
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-green-800">
            La misma metodología que usan McKinsey, BCG y Bain, aplicada a PYMEs.
            Primero entendemos el problema real. Luego lo resolvemos.
          </p>
        </div>

        {/* Pasos */}
        <div className="relative">

          {/* Línea conectora — solo desktop */}
          <div
            className="absolute left-0 right-0 top-8 hidden h-px bg-green-200 lg:block"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-4 lg:gap-8">
            {fases.map((fase, i) => (
              <div key={fase.numero} className="relative flex flex-col">

                {/* Número con círculo */}
                <div className="mb-5 flex items-center gap-4 lg:flex-col lg:items-start lg:gap-0">
                  <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-700 lg:mb-6">
                    <span className="text-xl font-extrabold text-white">
                      {fase.numero}
                    </span>
                  </div>

                  {/* Línea vertical en móvil */}
                  {i < fases.length - 1 && (
                    <div className="h-px flex-1 bg-green-200 lg:hidden" aria-hidden="true" />
                  )}
                </div>

                {/* Duración */}
                <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-green-700">
                  {fase.duracion}
                </span>

                {/* Título */}
                <h3 className="mb-3 text-lg font-bold text-green-950">
                  {fase.titulo}
                </h3>

                {/* Descripción */}
                <p className="text-sm leading-relaxed text-green-800">
                  {fase.descripcion}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA inferior */}
        <div className="mt-16 text-center">
          <a
            href="#contacto"
            className="inline-block rounded-md bg-green-700 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-green-800 transition-colors"
          >
            Hablemos de tu proyecto
          </a>
        </div>

      </div>
    </section>
  );
}
