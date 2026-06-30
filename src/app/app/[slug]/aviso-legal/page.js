export const metadata = {
  title: 'Aviso Legal — Impecable',
  robots: { index: false },
}

export default function AvisoLegalPage() {
  return (
    <main className="max-w-[720px] mx-auto px-6 py-20 text-texto">
      <h1 className="font-serif text-3xl font-black text-dorado mb-8 tracking-wide">
        Aviso Legal
      </h1>

      <section className="space-y-6 text-sm leading-relaxed text-muted">
        <div>
          <h2 className="text-base font-semibold text-texto mb-2">1. Titular del sitio web</h2>
          <p>
            En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información
            y del Comercio Electrónico (LSSI), se informa que el presente sitio web es titularidad de
            <strong className="text-texto"> Impecable — Cuidado Profesional del Vehículo</strong>,
            con domicilio en C. Palmilla, 28, Sanlúcar de Barrameda (Cádiz), España.
          </p>
          <p className="mt-2">
            Correo de contacto:{' '}
            <a href="mailto:info@laimpecable.es" className="text-dorado hover:underline">
              info@laimpecable.es
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-texto mb-2">2. Objeto y ámbito de aplicación</h2>
          <p>
            El presente aviso legal regula el acceso y uso del sitio web laimpecable.es, así como los
            servicios accesibles a través de él. El mero acceso al sitio implica la aceptación de las
            presentes condiciones.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-texto mb-2">3. Propiedad intelectual</h2>
          <p>
            Todos los contenidos del sitio web (textos, imágenes, logotipos, diseño gráfico, código fuente)
            son propiedad de Impecable o de terceros que han autorizado su uso. Queda prohibida su
            reproducción total o parcial sin autorización expresa.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-texto mb-2">4. Responsabilidad</h2>
          <p>
            Impecable no se responsabiliza de los daños o perjuicios derivados del uso del sitio web, de
            posibles errores en los contenidos ni de la indisponibilidad temporal del servicio por causas
            técnicas ajenas a su control.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-texto mb-2">5. Ley aplicable y jurisdicción</h2>
          <p>
            Las presentes condiciones se rigen por la legislación española. Para la resolución de cualquier
            controversia, las partes se someten a los Juzgados y Tribunales de Sanlúcar de Barrameda,
            salvo que la normativa aplicable establezca otro fuero imperativo.
          </p>
        </div>

        <p className="text-xs text-sutil pt-4">Última actualización: mayo de 2026.</p>
      </section>
    </main>
  )
}
