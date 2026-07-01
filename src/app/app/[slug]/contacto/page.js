import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Clock, Mail, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { waHref, mapsEmbedUrl, fullAddress } from "@/lib/business-contact";
import CopyButton from "@/components/CopyButton";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("name")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  return {
    title: `Contacto | ${business?.name ?? "Contacto"}`,
    description: `Contacta con ${business?.name ?? "nosotros"}. Horario, dirección, email y WhatsApp. Te respondemos en menos de 24 horas.`,
  };
}

export default async function ContactoPage({ params }) {
  const { slug } = await params;
  const base = `/app/${slug}`;

  // Datos de contacto de Configuración → Empresa (nunca hardcodeados)
  const supabase = await createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("name, address, postal_code, city, province, email, phone")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (!business) notFound();

  const address = fullAddress(business);
  const waLink = waHref(business.phone, "Hola, me gustaría obtener más información.");
  const mapsEmbed = mapsEmbedUrl(address);

  const info = [
    address && {
      Icon: MapPin,
      label: "Dirección",
      value: address,
    },
    // TODO: leer de business_hours en vez de texto fijo (pendiente de formateo por días)
    {
      Icon: Clock,
      label: "Horario",
      value: "Lunes a viernes de 9:30 a 13:30 h",
    },
    business.email && {
      Icon: Mail,
      label: "Email",
      value: business.email,
      href: `mailto:${business.email}`,
    },
    business.phone && {
      Icon: MessageCircle,
      label: "WhatsApp",
      value: business.phone,
      href: waLink,
    },
  ].filter(Boolean);

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
            href={base}
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
          {info.map(({ Icon, label, value, href }) => (
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
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-sm font-semibold px-8 py-3.5 bg-dorado text-fondo rounded-full tracking-wide hover:bg-dorado-dim transition-colors"
            >
              Escribir por WhatsApp
            </a>
          )}
          {address && <CopyButton text={address} />}
        </div>

        {/* Mapa */}
        {mapsEmbed && (
          <div className="rounded-2xl overflow-hidden border border-borde">
            <iframe
              src={mapsEmbed}
              width="100%"
              height="380"
              style={{ border: 0, display: "block" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Ubicación de ${business.name}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
