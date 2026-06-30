import LoginForm from './LoginForm'

export const metadata = { title: 'Acceder — ComplexIA' }

export default async function LoginPage({ searchParams }) {
  const { slug, error } = await searchParams
  return <LoginForm slug={slug ?? null} error={error ?? null} />
}
