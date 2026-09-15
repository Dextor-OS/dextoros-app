"use client";

import { Check, Copy } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";

/** Copies text to the clipboard and confirms for two seconds. */
export function CopyButton({ text, label, className = "btn btn-ghost btn-sm" }: { text: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard blocked: the text is still selectable on screen.
    }
  };

  return (
    <button type="button" onClick={copy} className={className} aria-live="polite">
      {copied ? <Check size={14} weight="bold" aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      {copied ? "Copied" : label}
    </button>
  );
}
