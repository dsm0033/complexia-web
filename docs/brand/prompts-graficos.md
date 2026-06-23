# Prompts para generar los activos gráficos de ComplexIA

Prompts en inglés (los generadores funcionan mejor así).
Cuando la herramienta lo permita, adjunta como **imagen de referencia** la guía de marca (`docs/brand/Logo-ComplexIA.png`) para mantener coherencia con el isotipo original.

## Paleta de colores

| Token | HSL | Hex aproximado | Uso |
|---|---|---|---|
| `green-700` | hsl(145, 46.7%, 33.1%) | `#2E7B4D` | Color de marca — isotipo principal |
| `green-950` | hsl(145, 46.7%, 10%) | `#0D2618` | Fondos oscuros |
| `green-300` | hsl(145, 46.7%, 70%) | `#88CCA5` | Texto sobre oscuro |

---

## 1. Isotipo "C" para fondo claro (favicon principal)

**Destino en el repo:** `app/icon.svg`
**Formato:** SVG, fondo transparente

```
Minimalist geometric vector logo: a stylized letter "C" opening to the right with a small filled solid circle (dot) sitting inside the opening at the bottom-right. The "C" is built from a thick uniform stroke with squared terminals. Color: solid forest green #2E7B4D. Pure flat design, single color, no gradients, no shadows. Transparent background. Centered composition, generous margin. Premium tech consultancy logo aesthetic. No text, no letters around it. SVG-friendly clean vector style.
```

---

## 2. Isotipo "C" para fondo oscuro (Footer, apple-icon)

**Destino en el repo:** `public/brand/isotipo-blanco.svg`
**Formato:** SVG, fondo transparente

```
Same minimalist geometric "C" logo as before: stylized letter "C" opening to the right with a small filled solid circle inside the opening. Same proportions and construction. Color: pure white #FFFFFF. Pure flat design, single color, no gradients. Transparent background. Centered, generous margin. Clean vector style.
```

---

## 3. Wordmark "ComplexIA" completo

**Destino en el repo:** `public/brand/wordmark.svg`
**Formato:** SVG, fondo transparente

```
Modern wordmark logotype reading "ComplexIA" as a single word. Typography: clean geometric sans-serif, similar to Instrument Sans or Satoshi, semi-bold weight, tight but balanced letterspacing. The "Complex" portion in dark forest green #0D2618, the "IA" portion in brighter forest green #2E7B4D to emphasize. No isotype, no icon, only the wordmark text. Transparent background. Vector style, flat, no gradients, no shadows. Premium and minimal. Horizontal composition.
```

---

## 4. Apple touch icon (PNG 180×180)

**Destino en el repo:** `app/apple-icon.png`
**Formato:** PNG opaco, 180×180 px

```
Square app icon, 180x180 pixels, designed for iOS home screen. Solid background in dark forest green #0D2618 with very subtle rounded corners. Centered isotype: a stylized white letter "C" opening to the right with a small filled white circle inside the opening, occupying 55-60% of the canvas. Single solid white color for the isotype, no gradients, no shadows. Flat premium iOS app icon aesthetic. PNG export, no transparency, opaque background.
```

---

## 5. Open Graph image (PNG 1200×630)

**Destino en el repo:** `app/opengraph-image.png`
**Formato:** PNG, 1200×630 px

```
Social media preview card, exactly 1200x630 pixels, landscape orientation. Solid background color: dark forest green #0D2618.

Left side (60% of canvas, with generous left padding ~80px):
- Large wordmark "ComplexIA" in clean geometric sans-serif typography (Instrument Sans / Satoshi style), semi-bold, white color #FFFFFF for "Complex" and bright mint green #88CCA5 for "IA".
- Directly below the wordmark, separated by ~30px: tagline text "Inteligencia aplicada. Resultados reales." in lighter weight, color #88CCA5, smaller size.

Right side (40% of canvas):
- Large stylized isotype: a white outlined "C" opening to the right with a filled white circle inside the opening, occupying around 70% of the right zone, vertically centered.

Premium tech consultancy aesthetic. Flat design only, no gradients, no glow, no shadows, no decorative noise. Generous negative space. Modern, minimal, corporate.
```

---

## Herramienta recomendada por activo

| Prompt | Herramienta | Por qué |
|---|---|---|
| 1, 2 (isotipos SVG) | **Recraft.ai** (modo "Vector Illustration" o "Logo") | Genera SVG nativo, no PNG. Evita el paso de vectorización |
| 3 (wordmark) | **Recraft.ai** o **Ideogram** | Recraft por SVG; Ideogram si necesitas iterar el texto rápido (luego vectorizar) |
| 4 (apple-icon PNG) | **Recraft.ai** o **Midjourney v7** | Cualquiera de los dos da buen resultado raster a 180×180 |
| 5 (OG image PNG) | **Ideogram** | Es el mejor renderizando texto incrustado en imagen (tagline + wordmark legibles) |

**Si tuviera que elegir UNA sola herramienta para todo:** Recraft.ai — único generador que produce SVG vectorial real, lo que es crítico para los logos. Para la OG image acepta una pérdida ligera de calidad tipográfica frente a Ideogram, pero te ahorra tener cuentas en dos sitios. ES de pago!
