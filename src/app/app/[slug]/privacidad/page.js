export const metadata = {
  title: 'Política de Privacidad — Impecable',
  robots: { index: false },
}

export default function PrivacidadPage() {
  return (
    <main className="max-w-[720px] mx-auto px-6 py-20 text-texto">
      <h1 className="font-serif text-3xl font-black text-dorado mb-8 tracking-wide">
        Política de Privacidad
      </h1>

      <section className="space-y-6 text-sm leading-relaxed text-muted">
        <div>
          <h2 className="text-base font-semibold text-texto mb-2">1. Responsable del tratamiento</h2>
          <p>
            <strong className="text-texto">Impecable — Cuidado Profesional del Vehículo</strong><br />
            C. Palmilla, 28 · Sanlúcar de Barrameda (Cádiz), España<br />
            Correo:{' '}
            <a href="mailto:info@laimpecable.es" className="text-dorado hover:underline">
              info@laimpecable.es
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-texto mb-2">2. Datos que recopilamos</h2>
          <ul className="list-disc list-inside space-y-1">
            <li><strong className="text-texto">Reservas:</strong> nombre, matrícula, correo electrónico (opcional) y fecha/hora de la cita.</li>
            <li><strong className="text-texto">Pago online:</strong> gestionado íntegramente por Stripe. Impecable no almacena datos de tarjeta.</li>
            <li><strong className="text-texto">Portal de clientes/empleados:</strong> dirección de correo para autenticación (Supabase Auth).</li>
            <li><strong className="text-texto">Analítica web (opcional):</strong> si aceptas las cookies analíticas, Google Analytics recoge datos de uso anónimos (páginas vistas, tipo de dispositivo, procedencia). No te identifican personalmente.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-texto mb-2">3. Finalidad y base jurídica</h2>
          <p>
            Los datos se tratan para la gestión de citas y la prestación del servicio contratado
            (base: ejecución de contrato, art. 6.1.b RGPD). El correo electrónico se usa exclusivamente
            para confirmar la reserva o notificar cambios, sin fines publicitarios.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-texto mb-2">4. Conservación de los datos</h2>
          <p>
            Los datos de reservas se conservan durante el tiempo necesario para la prestación del servicio
            y, en su caso, para el cumplimiento de obligaciones legales (fiscales, mercantiles). Transcurrido
            ese plazo, se eliminan de forma segura.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-texto mb-2">5. Comunicación a terceros</h2>
          <p>
            Los datos no se ceden a terceros salvo obligación legal o cuando sea estrictamente necesario
            para la prestación del servicio (p. ej. pasarela de pago Stripe, servicio de envío de correo Resend
            y, si lo consientes, la herramienta de analítica Google Analytics).
            Estos proveedores ofrecen garantías adecuadas conforme al RGPD.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-texto mb-2">6. Tus derechos</h2>
          <p>
            Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, portabilidad y
            limitación del tratamiento escribiendo a{' '}
            <a href="mailto:info@laimpecable.es" className="text-dorado hover:underline">
              info@laimpecable.es
            </a>.
            También tienes derecho a presentar una reclamación ante la{' '}
            <span className="text-texto">Agencia Española de Protección de Datos (aepd.es)</span>.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-texto mb-2">7. Seguridad</h2>
          <p>
            Aplicamos medidas técnicas y organizativas apropiadas para proteger los datos frente a acceso
            no autorizado, pérdida o alteración, incluyendo cifrado en tránsito (HTTPS) y en reposo.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-texto mb-2">8. Analítica web</h2>
          <p>
            Utilizamos Google Analytics (Google Ireland Ltd.) para obtener estadísticas de uso de la web
            de forma agregada y mejorar la experiencia. Estas cookies <strong className="text-texto">solo se
            activan con tu consentimiento</strong> (botón «Aceptar todas» del aviso de cookies; base jurídica:
            consentimiento, art. 6.1.a RGPD). Puedes retirar el consentimiento borrando las cookies del
            navegador. Consulta el detalle en nuestra{' '}
            <a href="/cookies" className="text-dorado hover:underline">Política de Cookies</a>.
          </p>
        </div>

        <p className="text-xs text-sutil pt-4">Última actualización: junio de 2026.</p>
      </section>
    </main>
  )
}
