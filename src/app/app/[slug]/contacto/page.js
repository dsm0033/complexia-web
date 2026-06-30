import Link from "next/link";
import { MapPin, Clock, Mail, MessageCircle } from "lucide-react";
import CopyButton from "@/components/CopyButton";

export const metadata = {
  title: "Contacto",
  description:
    "Contacta con Impecable en Sanlúcar de Barrameda. Horario, dirección, email y WhatsApp. Te respondemos en menos de 24 horas.",
  alternates: {
    canonical: "https://laimpecable.es/contacto",
  },
};

const ADDRESS = "C. Palmilla, 28, 11540 Sanlúcar de Barrameda, Cádiz";
const WA_LINK =
  "https://wa.me/34607445305?text=Hola%2C%20me%20gustar%C3%ADa%20obtener%20m%C3%A1s%20informaci%C3%B3n.";
const MAPS_EMBED =
  "https://www.google.com/maps?q=C.+Palmilla,+28,+11540+Sanl%C3%BAcar+de+Barrameda,+C%C3%A1diz&output=embed&hl=es&z=16";

const INFO = [
  {
    Icon: MapPin,
    label: "Dirección",
    value: ADDRESS,
  },
  {
    Icon: Clock,
    label: "Horario",
    value: "Lunes a viernes de 9:30 a 13:30 h",
  },
  {
    Icon: Mail,
    label: "Email",
    value: "info@laimpecable.es",
    href: "mailto:info@laimpecable.es",
  },
  {
    Icon: MessageCircle,
    label: "WhatsApp",
    value: "+34 607 445 305",
    href: WA_LINK,
  },
];

export default function ContactoPage() {
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
            Contacto
          </h1>
          <div className="w-[60px] h-[2px] bg-dorado mx-auto my-5" />
          <p
            className="font-sans font-light text-muted max-w-[440px] mx-auto"
            style={{ fontSize: "clamp(15px, 2vw, 18px)" }}
          >
            Estamos aquí para ayudarte
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-[820px] mx-auto px-6 pb-24 space-y-6">

        {/* Tarjeta de datos de contacto */}
        <div className="bg-tarjeta border border-borde rounded-2xl p-7 space-y-6">
          {INFO.map(({ Icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-4">
              <div className="inline-flex items-center justify-center p-[10px] rounded-[10px] bg-dorado/10 shrink-0">
                <Icon size={22} color="#C9A84C" strokeWidth={2} />
              </div>
              <div>
                <p className="font-sans text-[11px] font-semibold tracking-[2px] uppercase text-sutil mb-0.5">
                  {label}
                </p>
                {href ? (
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="font-sans text-[15px] text-texto hover:text-dorado transition-colors"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="font-sans text-[15px] text-texto">{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4 flex-wrap">
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-sm font-semibold px-8 py-3.5 bg-dorado text-fondo rounded-full tracking-wide hover:bg-dorado-dim transition-colors"
          >
            Escribir por WhatsApp
          </a>
          <CopyButton text={ADDRESS} />
        </div>

        {/* Mapa */}
        <div className="rounded-2xl overflow-hidden border border-borde">
          <iframe
            src={MAPS_EMBED}
            width="100%"
            height="380"
            style={{ border: 0, display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación de Impecable en Sanlúcar de Barrameda"
          />
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
