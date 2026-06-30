export const metadata = {
  title: 'Política de Cookies',
  robots: { index: false },
}

export default function CookiesPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-gray-700">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Cookies</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">¿Qué son las cookies?</h2>
        <p>
          Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas
          una web. Nos permiten recordar tus preferencias y mantener tu sesión activa.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Cookies que utilizamos</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-900">Cookie</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900">Proveedor</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900">Finalidad</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-3 font-mono text-xs">sb-*</td>
                <td className="px-4 py-3">Supabase</td>
                <td className="px-4 py-3">Mantiene tu sesión iniciada</td>
                <td className="px-4 py-3">Estrictamente necesaria</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">__stripe_*</td>
                <td className="px-4 py-3">Stripe</td>
                <td className="px-4 py-3">Procesamiento seguro de pagos</td>
                <td className="px-4 py-3">Estrictamente necesaria</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">cookie_consent</td>
                <td className="px-4 py-3">Impecable</td>
                <td className="px-4 py-3">Recuerda tu preferencia de cookies</td>
                <td className="px-4 py-3">Estrictamente necesaria</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">_ga, _ga_*</td>
                <td className="px-4 py-3">Google Analytics</td>
                <td className="px-4 py-3">Estadísticas de uso anónimas (páginas vistas, dispositivo, procedencia)</td>
                <td className="px-4 py-3">Analítica (terceros) — solo si aceptas todas</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">¿Cómo gestionar las cookies?</h2>
        <p>
          Las cookies analíticas de Google Analytics solo se cargan si pulsas «Aceptar todas» en el
          aviso de cookies; si eliges «Solo necesarias» nunca se activan. Además, puedes configurar tu
          navegador para bloquear o eliminar cookies en cualquier momento. Ten en cuenta que deshabilitar
          las cookies estrictamente necesarias puede impedir que la web funcione correctamente (por
          ejemplo, no podrás iniciar sesión ni realizar pagos).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Contacto</h2>
        <p>
          Si tienes dudas sobre nuestra política de cookies, puedes escribirnos a{' '}
          <a href="mailto:info@laimpecable.es" className="text-dorado hover:underline">
            info@laimpecable.es
          </a>
          .
        </p>
      </section>
    </main>
  )
}
