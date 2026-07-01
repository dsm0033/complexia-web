// ============================================
// 🌐 PÁGINA PRINCIPAL - LANDING PÚBLICA
// ============================================
// Esta es la página que ve el cliente cuando entra
// en laimpecable.es (o la-impecable.vercel.app).
//
// Estructura:
// 1. Hero (título grande + botones)
// 2. Barra de estadísticas
// 3. Servicios (tarjetas con precios)
// 4. Proceso (cómo trabajamos)
// 5. CTA (llamada a la acción + WhatsApp)
// 6. Footer
// ============================================

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { telHref, waHref } from "@/lib/business-contact";
import ServiceCard from "@/components/ServiceCard";
import AnimatedCounter from "@/components/AnimatedCounter";

export const metadata = {
  title: "La Impecable — Cuidado Profesional del Vehículo",
  description:
    "Lavado, tapicería y detailing profesional en Sanlúcar de Barrameda. Cada detalle tratado con precisión y rigor.",
  alternates: {
    canonical: "https://laimpecable.es",
  },
};

// Datos del proceso de trabajo (las 6 fases)
const PROCESO = [
  { step: "01", title: "Recepción", desc: "Inspeccionamos y documentamos el estado de tu vehículo antes de empezar." },
  { step: "02", title: "Interior", desc: "Aspirado profundo, limpieza de salpicadero, paneles, consola y techo. 70 minutos de trabajo minucioso." },
  { step: "03", title: "Maletero", desc: "Aspirado y limpieza completa del maletero." },
  { step: "04", title: "Exterior", desc: "Lavado de carrocería y llantas con productos profesionales. Secado con microfibra." },
  { step: "05", title: "Cristales", desc: "Limpieza interior y exterior de todos los cristales y retrovisores." },
  { step: "06", title: "Entrega", desc: "Revisión final, ambientador y entrega con el trabajo explicado." },
];

export default async function HomePage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: business } = await supabase
    .from("businesses")
    .select("id, phone")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  const businessId = business?.id ?? null;
  // Teléfono desde Configuración → Empresa (nunca hardcodeado)
  const phoneHref = telHref(business?.phone);
  const whatsappHref = waHref(business?.phone);

  const { data: servicios } = businessId
    ? await supabase
        .from("services")
        .select("id, name, description, price, duration_minutes, active, icon, highlight")
        .eq("business_id", businessId)
        .order("sort_order")
    : { data: [] };

  const { data: settings } = businessId
    ? await adminSupabase
        .from("business_settings")
        .select("advance_payment_discount, cash_payment_discount")
        .eq("business_id", businessId)
        .single()
    : { data: null };

  const advanceDiscount = settings?.advance_payment_discount ?? 0;
  const cashDiscount    = settings?.cash_payment_discount    ?? 0;
  return (
    <div className="min-h-screen bg-fondo">

      {/* ════════════════════════════════════════════
          HERO - La primera impresión
          ════════════════════════════════════════════ */}
      <div className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 overflow-hidden">

        {/* Fondo con gradiente sutil */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 30% 20%, hsl(var(--hsl-dorado) / 0.15) 0%, transparent 60%),
                         radial-gradient(ellipse at 70% 80%, hsl(var(--hsl-fondo) / 0.8) 0%, transparent 60%)`,
          }}
        />

        {/* Línea decorativa superior */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-[120px]"
          style={{ background: "linear-gradient(to bottom, transparent, hsl(var(--hsl-dorado) / 0.27), transparent)" }}
        />

        {/* Contenido del hero */}
        <div className="relative z-10 max-w-[800px]">
          {/* Ubicación */}
          <div className="fade-in font-sans text-xs font-semibold tracking-[4px] uppercase text-dorado mb-6">
            Sanlúcar de Barrameda
          </div>

          {/* Título principal */}
          <h1 className="fade-in font-serif font-black text-texto leading-none mb-2 relative inline-block"
            style={{ fontSize: "clamp(42px, 8vw, 80px)", animationDelay: "0.15s" }}
          >
            <span
              className="font-script text-dorado absolute"
              style={{ fontSize: "clamp(28px, 5vw, 54px)", top: "50%", transform: "translateY(-50%) rotate(-30deg)", left: "-0.95em" }}
            >
              La
            </span>
            IMPECABLE
          </h1>

          {/* Línea dorada */}
          <div className="fade-in w-[60px] h-[2px] bg-dorado mx-auto my-5"
            style={{ animationDelay: "0.25s" }}
          />

          {/* Subtítulo */}
          <p className="fade-in font-sans font-light text-muted leading-relaxed max-w-[540px] mx-auto mb-10"
            style={{ fontSize: "clamp(16px, 2.5vw, 20px)", animationDelay: "0.35s" }}
          >
            Cuidado Profesional del Vehículo · Sanlúcar de Barrameda
            <br />
            Cada detalle tratado con{" "}
            <span className="text-dorado font-medium">precisión y rigor</span>.
          </p>

          {/* Botones de acción */}
          <div className="fade-in flex gap-4 justify-center flex-wrap"
            style={{ animationDelay: "0.5s" }}
          >
            <Link href="#servicios"
              className="font-sans text-sm font-semibold px-8 py-3.5 bg-dorado text-fondo rounded-full tracking-wide hover:bg-dorado-dim transition-colors"
            >
              Servicios
            </Link>
            {phoneHref && (
              <a href={phoneHref}
                className="font-sans text-sm font-semibold px-8 py-3.5 bg-dorado text-fondo rounded-full tracking-wide hover:bg-dorado-dim transition-colors"
              >
                Llamar ahora
              </a>
            )}
          </div>
        </div>

        {/* Indicador de scroll */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-pulse-slow">
          <span className="font-sans text-[10px] tracking-[2px] text-sutil uppercase">
            Scroll
          </span>
          <div className="w-px h-[30px]"
            style={{ background: "linear-gradient(to bottom, hsl(var(--hsl-sutil)), transparent)" }}
          />
        </div>
      </div>

      {/* ════════════════════════════════════════════
          BARRA DE ESTADÍSTICAS
          ════════════════════════════════════════════ */}
      <div className="flex justify-center gap-[clamp(24px,5vw,80px)] px-6 py-12 border-t border-b border-borde flex-wrap">
        {[
          { value: 121, label: "minutos de dedicación", suffix: "" },
          { value: 6, label: "fases de trabajo", suffix: "" },
          { value: 30, label: "puntos de control", suffix: "+" },
        ].map((stat, i) => (
          <div key={i} className="text-center min-w-[120px]">
            <div className="font-serif text-[40px] font-black text-dorado">
              <AnimatedCounter target={stat.value} />
              {stat.suffix}
            </div>
            <div className="font-sans text-[13px] text-muted mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ════════════════════════════════════════════
          SERVICIOS
          ════════════════════════════════════════════ */}
      <div id="servicios" className="max-w-[1100px] mx-auto px-6 py-20">
        {/* Encabezado de sección */}
        <div className="text-center mb-14">
          <span className="font-sans text-[11px] font-semibold tracking-[3px] uppercase text-dorado">
            Servicios
          </span>
          <h2 className="font-serif font-black text-texto mt-3"
            style={{ fontSize: "clamp(28px, 5vw, 42px)" }}
          >
            Elige tu tratamiento
          </h2>
        </div>

        {/* Grid de tarjetas de servicios */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
          {servicios?.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} advanceDiscount={advanceDiscount} cashDiscount={cashDiscount} />
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          PROCESO - CÓMO TRABAJAMOS
          ════════════════════════════════════════════ */}
      <div className="max-w-[800px] mx-auto px-6 pt-10 pb-20">
        <div className="text-center mb-12">
          <span className="font-sans text-[11px] font-semibold tracking-[3px] uppercase text-dorado">
            Proceso
          </span>
          <h2 className="font-serif font-black text-texto mt-3"
            style={{ fontSize: "clamp(24px, 4vw, 36px)" }}
          >
            Cómo trabajamos
          </h2>
        </div>

        {PROCESO.map((item, i) => (
          <div
            key={i}
            className={`flex gap-6 items-start py-6 ${
              i < PROCESO.length - 1 ? "border-b border-borde" : ""
            }`}
          >
            {/* Número del paso */}
            <span className="font-serif text-[32px] font-black text-dorado/20 min-w-[52px]">
              {item.step}
            </span>
            <div>
              <h4 className="font-serif text-lg font-bold text-texto mb-1.5">
                {item.title}
              </h4>
              <p className="font-sans text-sm text-muted leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ════════════════════════════════════════════
          CTA - LLAMADA A LA ACCIÓN
          ════════════════════════════════════════════ */}
      <div className="text-center px-6 py-16 border-t border-borde"
        style={{ background: "linear-gradient(to bottom, transparent, hsl(var(--hsl-dorado) / 0.15))" }}
      >
        <h2 className="font-serif font-black text-texto mb-4"
          style={{ fontSize: "clamp(24px, 5vw, 36px)" }}
        >
          ¿Listo para dejarlo impecable?
        </h2>
        <p className="font-sans text-[15px] text-muted mb-8">
          Sanlúcar de Barrameda · Cita previa
        </p>
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-sans text-[15px] font-semibold px-10 py-4 bg-dorado text-fondo rounded-full tracking-wide hover:bg-dorado-dim transition-colors"
          >
            Reservar por WhatsApp
          </a>
        ) : (
          <Link
            href={`/app/${slug}/reservar`}
            className="inline-flex items-center gap-2 font-sans text-[15px] font-semibold px-10 py-4 bg-dorado text-fondo rounded-full tracking-wide hover:bg-dorado-dim transition-colors"
          >
            Reservar cita
          </Link>
        )}
      </div>

    </div>
  );
}
