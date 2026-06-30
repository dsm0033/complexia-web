"use client";

import { useState } from "react";

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="font-sans text-sm font-semibold px-6 py-3 bg-transparent text-dorado rounded-full tracking-wide border border-dorado/50 hover:bg-dorado/10 transition-colors"
    >
      {copied ? "¡Copiado!" : "Copiar dirección"}
    </button>
  );
}
