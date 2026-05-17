'use client';

import { useState } from 'react';
import { EnvelopeIcon } from '@heroicons/react/20/solid';

const INITIAL = { nombre: '', email: '', empresa: '', mensaje: '', consentimiento: false };

export default function Contacto() {
  const [form, setForm] = useState(INITIAL);
  const [estado, setEstado] = useState('idle'); // 'idle' | 'loading' | 'ok' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setEstado('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error desconocido');
      setEstado('ok');
      setForm(INITIAL);
    } catch (err) {
      setErrorMsg(err.message);
      setEstado('error');
    }
  }

  return (
    <section id="contacto" aria-label="Formulario de contacto" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">

          {/* Columna izquierda — info */}
          <div>
            <div className="mb-4 inline-flex items-center rounded-full bg-green-100 px-4 py-1.5">
              <span className="text-xs font-semibold uppercase tracking-widest text-green-800">
                Hablemos
              </span>
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-green-950 sm:text-5xl">
              ¿Tienes un proyecto?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-green-800">
              Cuéntanos el problema. En menos de 48 horas te respondemos con una
              primera valoración sin compromiso.
            </p>

            <dl className="mt-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <EnvelopeIcon className="h-5 w-5 text-green-700" aria-hidden="true" />
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-green-700">Email</dt>
                  <dd>
                    <a href="mailto:contacto@complexia.es" className="text-base font-medium text-green-950 hover:text-green-700 transition-colors">
                      contacto@complexia.es
                    </a>
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          {/* Columna derecha — formulario */}
          <div>
            {estado === 'ok' ? (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-green-100 bg-green-50 p-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-700">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-green-950">¡Mensaje enviado!</h3>
                <p className="mt-2 text-base text-green-800">
                  Nos pondremos en contacto contigo en menos de 48 horas.
                </p>
                <button
                  onClick={() => setEstado('idle')}
                  className="mt-6 text-sm font-semibold text-green-700 underline underline-offset-2 hover:text-green-800 transition-colors"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-semibold text-green-950">
                      Nombre <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="nombre"
                      name="nombre"
                      type="text"
                      required
                      autoComplete="name"
                      value={form.nombre}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-lg border border-green-200 bg-white px-4 py-2.5 text-sm text-green-950 placeholder-green-300 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/20"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label htmlFor="empresa" className="block text-sm font-semibold text-green-950">
                      Empresa <span className="font-normal text-green-600">(opcional)</span>
                    </label>
                    <input
                      id="empresa"
                      name="empresa"
                      type="text"
                      autoComplete="organization"
                      value={form.empresa}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-lg border border-green-200 bg-white px-4 py-2.5 text-sm text-green-950 placeholder-green-300 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/20"
                      placeholder="Tu empresa"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-green-950">
                    Email <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-lg border border-green-200 bg-white px-4 py-2.5 text-sm text-green-950 placeholder-green-300 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/20"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="mensaje" className="block text-sm font-semibold text-green-950">
                    Mensaje <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    required
                    rows={5}
                    value={form.mensaje}
                    onChange={handleChange}
                    className="mt-2 block w-full resize-none rounded-lg border border-green-200 bg-white px-4 py-2.5 text-sm text-green-950 placeholder-green-300 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/20"
                    placeholder="Cuéntanos tu proyecto o problema..."
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    id="consentimiento"
                    name="consentimiento"
                    type="checkbox"
                    required
                    checked={form.consentimiento}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-green-300 text-green-700 focus:ring-2 focus:ring-green-700/30"
                  />
                  <label htmlFor="consentimiento" className="text-xs leading-relaxed text-green-800">
                    He leído y acepto la{' '}
                    <a
                      href="/legal/privacidad"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-green-700 underline underline-offset-2 hover:text-green-800 transition-colors"
                    >
                      política de privacidad
                    </a>
                    . <span aria-hidden="true">*</span>
                  </label>
                </div>

                {estado === 'error' && (
                  <p role="alert" className="text-sm font-medium text-red-600">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={estado === 'loading' || !form.consentimiento}
                  className="w-full rounded-lg bg-green-700 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
                >
                  {estado === 'loading' ? 'Enviando…' : 'Enviar mensaje'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
