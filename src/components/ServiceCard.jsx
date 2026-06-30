"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Droplets, Armchair, Sparkles, Gem, Lightbulb, Wind,
  Wrench, Car, Shield, Star, Brush, Zap, Settings
} from "lucide-react";

const ICONS = {
  Droplets, Armchair, Sparkles, Gem, Lightbulb, Wind,
  Wrench, Car, Shield, Star, Brush, Zap, Settings,
};

function formatDuration(minutes) {
  if (!minutes) return null;
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `~${h}h ${m}min` : `~${h}h`;
}

export default function ServiceCard({ service, index, advanceDiscount = 0, cashDiscount = 0 }) {
  const [hovered, setHovered] = useState(false);
  const Icon = ICONS[service.icon] ?? Wrench;
  const duration = formatDuration(service.duration_minutes);

  const Wrapper = service.active ? Link : 'div'
  const wrapperProps = service.active ? { href: `/reservar?servicio=${service.id}` } : {}

  return (
    <Wrapper
      {...wrapperProps}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        block relative overflow-hidden rounded-2xl p-7
        border transition-all duration-500 ease-out
        ${!service.active
          ? "bg-tarjeta-osc border-borde opacity-70 cursor-default"
          : service.highlight
          ? "bg-gradient-to-br from-tarjeta to-dorado/15 border-dorado cursor-pointer"
          : "bg-tarjeta border-borde cursor-pointer"
        }
        ${hovered && service.active
          ? "-translate-y-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.4),0_0_40px_rgba(201,168,76,0.15)]"
          : "shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
        }
      `}
    >
      {!service.active && (
        <div className="absolute top-3 right-4 bg-borde text-sutil text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-sans">
          Próximamente
        </div>
      )}
      {service.active && service.highlight && (
        <div className="absolute top-3 right-4 bg-dorado text-fondo text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-sans">
          Más popular
        </div>
      )}

      <div className="mb-4 inline-flex items-center justify-center p-[10px] rounded-[10px] bg-dorado/10">
        <Icon size={36} color="#C9A84C" strokeWidth={2} />
      </div>

      <h3 className="font-serif text-[22px] font-bold text-texto mb-2">
        {service.name}
      </h3>

      {service.active && (
        <div className="flex items-baseline gap-1.5 mb-4">
          {service.price != null && (
            <>
              <span className="font-sans text-sm text-muted">desde</span>
              <span className="font-serif text-[32px] font-black text-dorado leading-none">
                {service.price}€
              </span>
            </>
          )}
          {duration && (
            <span className="font-sans text-[13px] text-muted">
              · {duration}
            </span>
          )}
        </div>
      )}

      {service.active && (advanceDiscount > 0 || cashDiscount > 0) && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {advanceDiscount > 0 && (
            <span className="inline-flex items-center font-sans text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-400/8 text-green-400 border border-green-400/20">
              -{advanceDiscount}% online
            </span>
          )}
          {cashDiscount > 0 && (
            <span className="inline-flex items-center font-sans text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-400/8 text-green-400 border border-green-400/20">
              -{cashDiscount}% efectivo
            </span>
          )}
        </div>
      )}

      <p className="font-sans text-sm leading-relaxed text-muted">
        {service.description}
      </p>
    </Wrapper>
  );
}
