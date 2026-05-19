export const metadata = {
  title: 'Aviso legal — ComplexIA',
  description: 'Información legal sobre el titular del sitio web complexia.es conforme a la Ley 34/2002 (LSSI-CE).',
};

export default function AvisoLegal() {
  return (
    <article className="space-y-10 text-green-800">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight text-green-950 sm:text-5xl">
          Aviso legal
        </h1>
        <p className="mt-4 text-sm text-green-600">Última actualización: mayo de 2026</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-green-950">1. Datos identificativos del titular</h2>
        <p className="text-base leading-relaxed">
          En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la
          Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se facilitan los
          siguientes datos del titular de este sitio web:
        </p>
        <table className="w-full text-sm border-collapse">
          <tbody>
            {[
              ['Denominación comercial', 'ComplexIA'],
              ['NIF', 'PENDIENTE — completar antes de publicar'],
              ['Domicilio', 'Calle Palmilla, 28 · 11540 Sanlúcar de Barrameda · Cádiz'],
              ['Correo electrónico', 'contacto@complexia.es'],
              ['Sitio web', 'https://complexia.es'],
            ].map(([label, value]) => (
              <tr key={label} className="border-b border-green-100">
                <th className="text-left font-semibold text-green-950 py-2 pr-6 align-top w-1/3">
                  {label}
                </th>
                <td className="py-2 align-top">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-green-950">2. Objeto y ámbito de aplicación</h2>
        <p className="text-base leading-relaxed">
          El presente aviso legal regula el acceso y uso del sitio web <strong>complexia.es</strong>,
          cuya actividad es la prestación de servicios de consultoría en inteligencia artificial
          para empresas. El acceso al sitio implica la aceptación de las presentes condiciones.
        </p>
        <p className="text-base leading-relaxed">
          ComplexIA se reserva el derecho a modificar este aviso legal en cualquier momento.
          Los cambios serán efectivos desde su publicación en esta página.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-green-950">3. Propiedad intelectual e industrial</h2>
        <p className="text-base leading-relaxed">
          Todos los contenidos del sitio web —textos, imágenes, logotipos, diseño gráfico,
          código fuente y demás elementos— son titularidad de ComplexIA o de terceros que
          han autorizado su uso, y están protegidos por la normativa española e internacional
          de propiedad intelectual e industrial.
        </p>
        <p className="text-base leading-relaxed">
          Queda expresamente prohibida su reproducción, distribución, comunicación pública
          o transformación sin autorización escrita previa del titular.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-green-950">4. Exclusión de responsabilidad</h2>
        <p className="text-base leading-relaxed">
          ComplexIA no garantiza la disponibilidad ininterrumpida del sitio ni la ausencia
          de errores en sus contenidos. El acceso y uso del sitio web es responsabilidad
          exclusiva del usuario.
        </p>
        <p className="text-base leading-relaxed">
          Los enlaces a sitios web de terceros se facilitan únicamente como referencia
          informativa. ComplexIA no controla ni asume responsabilidad alguna por los
          contenidos, productos o servicios disponibles en dichos sitios.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-green-950">5. Legislación aplicable y jurisdicción</h2>
        <p className="text-base leading-relaxed">
          Las presentes condiciones se rigen por el derecho español. Para cualquier
          controversia derivada del acceso o uso de este sitio, las partes se someten,
          con renuncia expresa a cualquier otro fuero, a los juzgados y tribunales
          competentes conforme a la legislación vigente.
        </p>
      </section>
    </article>
  );
}
