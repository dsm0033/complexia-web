export const metadata = {
  title: 'Política de privacidad — ComplexIA',
  description: 'Política de privacidad y tratamiento de datos personales de ComplexIA conforme al RGPD y la LOPDGDD.',
};

export default function Privacidad() {
  return (
    <article className="space-y-10 text-green-800">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight text-green-950 sm:text-5xl">
          Política de privacidad
        </h1>
        <p className="mt-4 text-sm text-green-600">Última actualización: mayo de 2026</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-green-950">1. Responsable del tratamiento</h2>
        <table className="w-full text-sm border-collapse">
          <tbody>
            {[
              ['Denominación', 'ComplexIA'],
              ['NIF', 'PENDIENTE — completar antes de publicar'],
              ['Domicilio', 'Calle Palmilla, 28 · 11540 Sanlúcar de Barrameda · Cádiz'],
              ['Contacto', 'contacto@complexia.es'],
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
        <h2 className="text-xl font-bold text-green-950">2. Datos que tratamos y para qué</h2>
        <p className="text-base leading-relaxed">
          Únicamente tratamos los datos que tú mismo nos facilitas a través del formulario de
          contacto de esta web:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-base leading-relaxed">
          <li><strong>Nombre y apellidos</strong> — para identificarte y dirigirnos a ti correctamente.</li>
          <li><strong>Dirección de correo electrónico</strong> — para responder a tu consulta.</li>
          <li><strong>Mensaje</strong> — para entender tu necesidad y darte una respuesta útil.</li>
          <li>
            <strong>Consentimiento informado</strong> — registramos que has aceptado expresamente
            el tratamiento de tus datos antes de enviarnos el formulario.
          </li>
        </ul>
        <p className="text-base leading-relaxed">
          No recabamos datos especialmente sensibles (salud, ideología, etc.) ni datos de menores
          de 14 años. Si eres menor de esa edad, te pedimos que no utilices el formulario.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-green-950">3. Base jurídica del tratamiento</h2>
        <p className="text-base leading-relaxed">
          El tratamiento de tus datos se basa en tu <strong>consentimiento expreso</strong>
          (art. 6.1.a del Reglamento General de Protección de Datos — RGPD), que prestas al
          marcar la casilla de aceptación antes de enviar el formulario. Puedes retirar ese
          consentimiento en cualquier momento sin que ello afecte a la licitud del tratamiento
          previo a su retirada.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-green-950">4. ¿Cuánto tiempo conservamos tus datos?</h2>
        <p className="text-base leading-relaxed">
          Conservamos tus datos durante el tiempo necesario para atender tu consulta y,
          posteriormente, durante los plazos legales de prescripción aplicables (con carácter
          general, hasta tres años para responsabilidad civil contractual conforme al Código Civil).
          Transcurrido ese plazo, los datos serán eliminados de forma segura.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-green-950">5. Destinatarios y encargados del tratamiento</h2>
        <p className="text-base leading-relaxed">
          Tus datos no se ceden a terceros con fines comerciales. Sin embargo, para prestar
          el servicio recurrimos a los siguientes proveedores tecnológicos, que actúan como
          encargados del tratamiento:
        </p>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-green-200">
              <th className="text-left font-semibold text-green-950 py-2 pr-4">Proveedor</th>
              <th className="text-left font-semibold text-green-950 py-2 pr-4">Finalidad</th>
              <th className="text-left font-semibold text-green-950 py-2">País</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Resend, Inc.', 'Envío del correo electrónico de contacto', 'EE. UU. (SCCs)'],
              ['Vercel, Inc.', 'Alojamiento del sitio web y registros de servidor', 'EE. UU. (SCCs)'],
              ['Conva Ventures Inc. (Fathom Analytics)', 'Estadísticas de visitas sin cookies ni datos personales', 'Canadá (decisión de adecuación UE)'],
            ].map(([provider, purpose, country]) => (
              <tr key={provider} className="border-b border-green-100">
                <td className="py-2 pr-4 align-top font-medium text-green-950">{provider}</td>
                <td className="py-2 pr-4 align-top">{purpose}</td>
                <td className="py-2 align-top">{country}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-base leading-relaxed">
          Las transferencias a proveedores estadounidenses (Resend y Vercel) se amparan en
          cláusulas contractuales tipo (SCCs) aprobadas por la Comisión Europea. Fathom
          Analytics opera desde Canadá, país que cuenta con decisión de adecuación de la UE.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-green-950">6. Tus derechos</h2>
        <p className="text-base leading-relaxed">
          En cualquier momento puedes ejercer los siguientes derechos escribiéndonos a{' '}
          <a href="mailto:contacto@complexia.es" className="text-green-700 underline">
            contacto@complexia.es
          </a>
          , indicando tu nombre y adjuntando copia de tu DNI u otro documento identificativo:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-base leading-relaxed">
          <li><strong>Acceso</strong> — saber qué datos tuyos tratamos.</li>
          <li><strong>Rectificación</strong> — corregir datos inexactos o incompletos.</li>
          <li><strong>Supresión</strong> — solicitar el borrado de tus datos («derecho al olvido»).</li>
          <li><strong>Limitación</strong> — restringir el tratamiento en determinadas circunstancias.</li>
          <li><strong>Portabilidad</strong> — recibir tus datos en formato estructurado y legible por máquina.</li>
          <li><strong>Oposición</strong> — oponerte al tratamiento basado en interés legítimo.</li>
          <li><strong>Retirada del consentimiento</strong> — sin efecto retroactivo.</li>
        </ul>
        <p className="text-base leading-relaxed">
          Responderemos a tu solicitud en el plazo máximo de un mes (prorrogable a tres en casos
          complejos). Si consideras que el tratamiento no es conforme a la normativa, puedes
          presentar una reclamación ante la{' '}
          <strong>Agencia Española de Protección de Datos (AEPD)</strong> en{' '}
          <a
            href="https://www.aepd.es"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-700 underline"
          >
            www.aepd.es
          </a>
          .
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-green-950">7. Seguridad</h2>
        <p className="text-base leading-relaxed">
          Adoptamos medidas técnicas y organizativas apropiadas para proteger tus datos contra
          el acceso no autorizado, la pérdida accidental o la destrucción, conforme al artículo
          32 del RGPD. La comunicación entre tu navegador y nuestros servidores se realiza
          siempre mediante cifrado TLS (HTTPS).
        </p>
      </section>
    </article>
  );
}
