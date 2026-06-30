import Link from "next/link";
import { Award, Eye, Handshake, BadgeCheck } from "lucide-react";

export const metadata = {
  title: "Sobre nosotros",
  description:
    "Conoce la filosofía de Impecable: un servicio profesional y de confianza en Sanlúcar de Barrameda. Resultados profesionales y sin sorpresas.",
  alternates: {
    canonical: "https://laimpecable.es/sobre-nosotros",
  },
};

const PILARES = [
  {
    Icon: Award,
    title: "Profesionalidad",
    desc: "Utilizamos productos y técnicas de nivel profesional. Cada vehículo recibe el mismo nivel de exigencia, sin atajos.",
  },
  {
    Icon: Eye,
    title: "Transparencia",
    desc: "Sin sorpresas en el precio ni en los tiempos. Lo que acordamos es lo que recibes, siempre.",
  },
  {
    Icon: Handshake,
    title: "Confianza",
    desc: "Nos dejas lo que más usas cada día. Nos tomamos esa responsabilidad en serio y lo tratamos como si fuera nuestro.",
  },
];

const WA_LINK =
  "https://wa.me/34607445305?text=Hola%2C%20quiero%20reservar%20una%20cita.";

export default function SobreNosotrosPage() {
  return (
    <div className="min-h-screen bg-fondo">

      {/* Cabecera */}
      <div className="relative pt-20 pb-16 text-center px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, hsl(var(--hsl-dorado) / 0.12) 0%, transparent 65%)",
          }}
        />
        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-sans text-xs font-semibold tracking-[3px] uppercase text-dorado mb-8 hover:text-dorado-dim transition-colors"
          >
            ← Volver
          </Link>
          <h1
            className="font-serif font-black text-texto leading-none mb-4"
            style={{ fontSize: "clamp(36px, 7vw, 64px)" }}
          >
            Sobre nosotros
          </h1>
          <div className="w-[60px] h-[2px] bg-dorado mx-auto my-5" />
          <p
            className="font-sans font-light text-muted max-w-[500px] mx-auto"
            style={{ fontSize: "clamp(15px, 2vw, 18px)" }}
          >
            Un servicio en el que puedes confiar
          </p>
        </div>
      </div>

      <div className="max-w-[820px] mx-auto px-6 pb-24 space-y-8">

        {/* Nuestra filosofía */}
        <div className="bg-tarjeta border border-borde rounded-2xl p-8 sm:p-10">
          <span className="font-sans text-[11px] font-semibold tracking-[3px] uppercase text-dorado">
            Nuestra filosofía
          </span>
          <h2
            className="font-serif font-black text-texto mt-3 mb-6"
            style={{ fontSize: "clamp(22px, 4vw, 32px)" }}
          >
            Resultados profesionales, sin sorpresas
          </h2>
          <div className="space-y-4 font-sans text-[15px] text-muted leading-relaxed">
            <p>
              En Impecable creemos que cuidar tu vehículo no debería ser complicado.
              Por eso ofrecemos un servicio claro, honesto y de calidad: sabes exactamente
              qué incluye, cuánto cuesta y cuándo estará listo.
            </p>
            <p>
              No somos un túnel de lavado. Somos un servicio de atención personalizada
              donde cada coche recibe tiempo, dedicación y los productos adecuados.
              El resultado habla por sí solo.
            </p>
            <p>
              Trabajamos con cita previa para garantizarte atención exclusiva.
              Porque tu tiempo también importa.
            </p>
          </div>
        </div>

        {/* Por qué elegirnos */}
        <div>
          <div className="text-center mb-8">
            <span className="font-sans text-[11px] font-semibold tracking-[3px] uppercase text-dorado">
              Por qué elegirnos
            </span>
            <h2
              className="font-serif font-black text-texto mt-3"
              style={{ fontSize: "clamp(22px, 4vw, 32px)" }}
            >
              Tres pilares que nos definen
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {PILARES.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="bg-tarjeta border border-borde rounded-2xl p-7"
              >
                <div className="inline-flex items-center justify-center p-[10px] rounded-[10px] bg-dorado/10 mb-5">
                  <Icon size={28} color="#C9A84C" strokeWidth={2} />
                </div>
                <h3 className="font-serif text-[19px] font-bold text-texto mb-2">
                  {title}
                </h3>
                <p className="font-sans text-sm text-muted leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Garantía */}
        <div className="rounded-2xl border border-dorado/35 bg-tarjeta-alt px-8 py-10 text-center">
          <div className="inline-flex items-center justify-center p-[14px] rounded-[14px] bg-dorado/12 mb-6">
            <BadgeCheck size={36} color="#C9A84C" strokeWidth={2} />
          </div>
          <h2
            className="font-serif font-black text-texto mb-5"
            style={{ fontSize: "clamp(22px, 4vw, 30px)" }}
          >
            Nuestra garantía
          </h2>
          <p className="font-sans text-[15px] text-muted leading-relaxed max-w-[520px] mx-auto">
            Revisamos contigo el resultado antes de que te vayas. Si algo no está
            a la altura de lo acordado, lo corregimos en el momento.{" "}
            <span className="text-texto font-medium">Sin excusas.</span>
          </p>
        </div>

        {/* CTA */}
        <div
          className="text-center px-6 py-14 rounded-2xl border border-borde"
          style={{ background: "linear-gradient(to bottom, hsl(var(--hsl-tarjeta)), hsl(var(--hsl-dorado) / 0.08))" }}
        >
          <h2
            className="font-serif font-black text-texto mb-4"
            style={{ fontSize: "clamp(22px, 4vw, 32px)" }}
          >
            ¿Listo para probarnos?
          </h2>
          <p className="font-sans text-[15px] text-muted mb-8">
            Reserva tu cita por WhatsApp y lo comprobas tú mismo.
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-sans text-[15px] font-semibold px-10 py-4 bg-dorado text-fondo rounded-full tracking-wide hover:bg-dorado-dim transition-colors"
          >
            Reservar por WhatsApp
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center px-6 py-8 border-t border-borde">
        <p className="font-sans text-xs text-sutil">
          © 2026 Impecable · Cuidado Profesional del Vehículo · Sanlúcar de Barrameda, Cádiz
        </p>
      </footer>
    </div>
  );
}
