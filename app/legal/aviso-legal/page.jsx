export const metadata = {
  title: 'Aviso legal — ComplexIA',
  description: 'Aviso legal de ComplexIA.',
};

export default function AvisoLegal() {
  return (
    <article>
      <h1 className="text-4xl font-extrabold tracking-tight text-green-950 sm:text-5xl">
        Aviso legal
      </h1>
      <p className="mt-8 text-base leading-relaxed text-green-800">
        Esta página está <strong>en redacción</strong>. Próximamente publicaremos
        el texto legal completo conforme a la Ley 34/2002 de Servicios de la
        Sociedad de la Información y de Comercio Electrónico (LSSI-CE).
      </p>
    </article>
  );
}
