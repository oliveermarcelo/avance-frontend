"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  label: string;
  successLabel?: string;
}

export function CopyButton({ text, label, successLabel = "Copiado!" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignora
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#1F3A2D] px-4 text-xs font-semibold text-white transition hover:bg-[#163024]"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          {successLabel}
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          {label}
        </>
      )}
    </button>
  );
}