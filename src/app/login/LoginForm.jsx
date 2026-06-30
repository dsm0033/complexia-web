'use client'

import { useActionState } from 'react'
import { login, loginWithGoogle, loginWithMagicLink } from '@/app/actions/auth'

export default function LoginForm({ slug, error: initialError }) {
  const [state,       action,       pending]       = useActionState(login,             undefined)
  const [googleState, googleAction, googlePending] = useActionState(loginWithGoogle,   undefined)
  const [magicState,  magicAction,  magicPending]  = useActionState(loginWithMagicLink, undefined)

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-4">

        {initialError === 'no-tenant' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
            Accede desde el enlace de invitación de tu negocio.
          </div>
        )}

        {/* Panel empleados / admin */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Acceder</h1>
          <p className="text-sm text-gray-500 mb-6">
            {slug ? `Acceso para ${slug}` : 'ComplexIA'}
          </p>

          {/* Google OAuth */}
          <form action={googleAction} className="mb-4">
            <input type="hidden" name="slug" value={slug ?? ''} />
            <button
              type="submit"
              disabled={googlePending}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <GoogleIcon />
              {googlePending ? 'Redirigiendo...' : 'Continuar con Google'}
            </button>
          </form>

          {googleState?.error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">{googleState.error}</p>
          )}

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-xs text-gray-400">o con email y contraseña</span>
            </div>
          </div>

          {/* Email + password */}
          <form action={action} className="space-y-4">
            <input type="hidden" name="slug" value={slug ?? ''} />
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email" name="email" type="email" required
                placeholder="tu@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                id="password" name="password" type="password" required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {state?.error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
            )}
            <button
              type="submit" disabled={pending}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {pending ? 'Accediendo...' : 'Acceder'}
            </button>
          </form>
        </div>

        {/* Magic link para clientes */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-1">¿Eres cliente?</p>
          <p className="text-xs text-gray-400 mb-4">Accede a tu historial sin contraseña.</p>

          {magicState?.success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
              Enlace enviado. Revisa tu email y haz clic para entrar.
            </div>
          ) : (
            <form action={magicAction} className="flex gap-2">
              <input type="hidden" name="slug" value={slug ?? ''} />
              <input
                name="email" type="email" required
                placeholder="tu@email.com"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit" disabled={magicPending}
                className="shrink-0 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {magicPending ? '...' : 'Enviar'}
              </button>
            </form>
          )}

          {magicState?.error && (
            <p className="text-sm text-red-600 mt-2">{magicState.error}</p>
          )}
        </div>

      </div>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}
