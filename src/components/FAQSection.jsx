"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "¿Necesito cita previa?",
    a: "Sí, trabajamos con cita previa para garantizar la atención exclusiva a tu vehículo. Reserva por WhatsApp.",
  },
  {
    q: "¿Cuánto tarda un Lavado Completo?",
    a: "Aproximadamente 2 horas. La Tapicería Profunda requiere además 2 horas de secado.",
  },
  {
    q: "¿Dónde estáis ubicados?",
    a: "Estamos en Sanlúcar de Barrameda, Cádiz. Escríbenos por WhatsApp y te indicamos la dirección exacta.",
  },
  {
    q: "¿Qué formas de pago aceptáis?",
    a: "Efectivo y transferencia bancaria.",
  },
  {
    q: "¿Trabajáis con todo tipo de vehículos?",
    a: "Sí, turismos, SUVs, furgonetas y vehículos de empresa.",
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-borde last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-serif text-[17px] font-bold text-texto">
          {q}
        </span>
        <ChevronDown
          size={18}
          color="#C9A84C"
          strokeWidth={2}
          className={`shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-40" : "max-h-0"
        }`}
      >
        <p className="font-sans text-sm text-muted leading-relaxed pb-5">
          {a}
        </p>
      </div>
    </div>
  );
}

export default function FAQSection() {
  return (
    <div className="max-w-[820px] mx-auto px-6 pb-20">
      <div className="text-center mb-10">
        <span className="font-sans text-[11px] font-semibold tracking-[3px] uppercase text-dorado">
          FAQ
        </span>
        <h2
          className="font-serif font-black text-texto mt-3"
          style={{ fontSize: "clamp(24px, 4vw, 36px)" }}
        >
          Preguntas frecuentes
        </h2>
      </div>

      <div className="bg-tarjeta border border-borde rounded-2xl px-7">
        {FAQS.map((item, i) => (
          <FAQItem key={i} q={item.q} a={item.a} />
        ))}
      </div>
    </div>
  );
}
