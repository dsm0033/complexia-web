// ============================================
// 🔢 COMPONENTE: AnimatedCounter
// ============================================
// Muestra un número que cuenta desde 0 hasta el
// valor objetivo con animación. Se activa cuando
// el usuario hace scroll y el número se hace visible.
//
// Uso: <AnimatedCounter target={121} />
// ============================================

"use client";
// ☝️ "use client" le dice a Next.js que este componente
// necesita JavaScript en el navegador (porque tiene
// animaciones y estado). Sin esto, Next.js intentaría
// renderizarlo en el servidor y no funcionaría.

import { useState, useEffect, useRef } from "react";

export default function AnimatedCounter({ target, duration = 1200 }) {
  // useState: guarda el número actual del contador
  // Empieza en 0 y sube hasta "target"
  const [count, setCount] = useState(0);

  // useRef: referencia al elemento HTML para detectar
  // cuándo es visible en la pantalla
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // IntersectionObserver: detecta cuándo un elemento
    // entra en la pantalla del usuario (al hacer scroll)
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let start = 0;
          const step = target / (duration / 16);
          const interval = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(interval);
            } else {
              setCount(Math.floor(start));
            }
          }, 16); // 16ms ≈ 60fps (60 fotogramas por segundo)
        }
      },
      { threshold: 0.3 } // Se activa cuando el 30% del elemento es visible
    );

    if (ref.current) observer.observe(ref.current);

    // Cleanup: desconecta el observer cuando el componente se desmonta
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}</span>;
}
