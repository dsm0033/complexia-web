export const metadata = {
  title: 'Política de cookies — ComplexIA',
  description: 'Información sobre el uso de cookies y tecnologías similares en complexia.es, conforme a la LSSI-CE y la guía de la AEPD.',
  alternates: { canonical: '/legal/cookies' },
};

export default function Cookies() {
  return (
    <article className="space-y-10 text-green-800">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight text-green-950 sm:text-5xl">
          Política de cookies
        </h1>
        <p className="mt-4 text-sm text-green-600">Última actualización: mayo de 2026</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-green-950">1. ¿Qué son las cookies?</h2>
        <p className="text-base leading-relaxed">
          Las cookies son pequeños archivos de texto que un sitio web deposita en tu
          dispositivo cuando lo visitas. Cumplen funciones como recordar tus preferencias
          o permitir que el sitio funcione correctamente. La normativa española (art. 22.2
          LSSI-CE) y europea (Directiva ePrivacy) exigen informarte sobre su uso.
        </p>
        <p className="text-base leading-relaxed">
          Esta política se aplica también al{' '}
          <strong>almacenamiento local (localStorage)</strong>, que funciona de forma
          análoga a las cookies y está sujeto a las mismas obligaciones informativas.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-green-950">2. Cookies que utilizamos</h2>

        <h3 className="text-base font-semibold text-green-950">2.1 Cookies técnicas (exentas de consentimiento)</h3>
        <p className="text-base leading-relaxed">
          Son estrictamente necesarias para el funcionamiento del sitio. Sin ellas no podrías
          navegar correctamente. Al ser imprescindibles, no requieren tu consentimiento previo.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-green-200">
                <th className="text-left font-semibold text-green-950 py-2 pr-4">Nombre</th>
                <th className="text-left font-semibold text-green-950 py-2 pr-4">Tecnología</th>
                <th className="text-left font-semibold text-green-950 py-2 pr-4">Finalidad</th>
                <th className="text-left font-semibold text-green-950 py-2 pr-4">Duración</th>
                <th className="text-left font-semibold text-green-950 py-2">Titular</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-green-100">
                <td className="py-2 pr-4 align-top font-mono text-xs">complexia-cookie-notice</td>
                <td className="py-2 pr-4 align-top">localStorage</td>
                <td className="py-2 pr-4 align-top">Recuerda que ya has visto el aviso de cookies para no mostrarlo de nuevo.</td>
                <td className="py-2 pr-4 align-top">Permanente (hasta borrar datos del navegador)</td>
                <td className="py-2 align-top">ComplexIA</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mt-6 text-base font-semibold text-green-950">2.2 Cookies analíticas (requieren consentimiento)</h3>
        <p className="text-base leading-relaxed">
          Si aceptas las cookies analíticas, esta web utiliza <strong>Google Analytics 4</strong>{' '}
          (Google LLC) para medir el tráfico de forma agregada. Solo se activan cuando das tu
          consentimiento explícito en el aviso de cookies; si los rechazas, no se instala
          ninguna cookie de este tipo. Si quieres saber más, visita{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-700 underline"
          >
            policies.google.com/privacy
          </a>
          .
        </p>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-green-200">
                <th className="text-left font-semibold text-green-950 py-2 pr-4">Nombre</th>
                <th className="text-left font-semibold text-green-950 py-2 pr-4">Tecnología</th>
                <th className="text-left font-semibold text-green-950 py-2 pr-4">Finalidad</th>
                <th className="text-left font-semibold text-green-950 py-2 pr-4">Duración</th>
                <th className="text-left font-semibold text-green-950 py-2">Titular</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-green-100">
                <td className="py-2 pr-4 align-top font-mono text-xs">_ga</td>
                <td className="py-2 pr-4 align-top">Cookie</td>
                <td className="py-2 pr-4 align-top">Distinguir usuarios únicos para estadísticas de visitas.</td>
                <td className="py-2 pr-4 align-top">2 años</td>
                <td className="py-2 align-top">Google LLC</td>
              </tr>
              <tr className="border-b border-green-100">
                <td className="py-2 pr-4 align-top font-mono text-xs">_ga_GDHJTV4LZX</td>
                <td className="py-2 pr-4 align-top">Cookie</td>
                <td className="py-2 pr-4 align-top">Mantener el estado de sesión para Google Analytics 4.</td>
                <td className="py-2 pr-4 align-top">2 años</td>
                <td className="py-2 align-top">Google LLC</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mt-6 text-base font-semibold text-green-950">2.3 Cookies publicitarias</h3>
        <p className="text-base leading-relaxed">
          Esta web <strong>no utiliza cookies publicitarias</strong> ni de seguimiento con
          fines comerciales de ningún tipo.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-green-950">3. Cómo gestionar las cookies de tu navegador</h2>
        <p className="text-base leading-relaxed">
          Puedes configurar tu navegador para bloquear o eliminar cookies en cualquier momento.
          Ten en cuenta que bloquear las cookies técnicas puede afectar al funcionamiento del sitio.
          Aquí tienes las instrucciones de los navegadores más habituales:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-base leading-relaxed">
          <li>
            <a
              href="https://support.google.com/chrome/answer/95647"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 underline"
            >
              Google Chrome
            </a>
          </li>
          <li>
            <a
              href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 underline"
            >
              Mozilla Firefox
            </a>
          </li>
          <li>
            <a
              href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 underline"
            >
              Safari
            </a>
          </li>
          <li>
            <a
              href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 underline"
            >
              Microsoft Edge
            </a>
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-green-950">4. Actualizaciones de esta política</h2>
        <p className="text-base leading-relaxed">
          Podemos actualizar esta política cuando cambie la legislación aplicable o cuando
          modifiquemos las tecnologías que utilizamos. La fecha de la última actualización
          aparece al inicio de esta página. Te recomendamos revisarla periódicamente.
        </p>
        <p className="text-base leading-relaxed">
          Si tienes alguna duda sobre el uso de cookies en este sitio, puedes contactarnos en{' '}
          <a href="mailto:contacto@complexia.es" className="text-green-700 underline">
            contacto@complexia.es
          </a>
          .
        </p>
      </section>
    </article>
  );
}
