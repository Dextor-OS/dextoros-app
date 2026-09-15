"use client";

import { Fingerprint } from "@phosphor-icons/react/dist/ssr";
import { type CSSProperties, type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from "react";

const HOLD_MS = 1400;

type HoldState = "idle" | "holding" | "keep" | "done";

/** Press and hold to record a demonstration. Releasing early asks you to keep holding; completing teaches. */
export function HoldToTeach({ version, disabled, onHoldChange, onTeach }: { version: number; disabled?: boolean; onHoldChange?: (holding: boolean) => void; onTeach: () => void }) {
  const [hold, setHold] = useState<HoldState>("idle");
  const holdingRef = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const start = () => {
    if (disabled || holdingRef.current || hold === "done") return;
    holdingRef.current = true;
    setHold("holding");
    onHoldChange?.(true);
  };

  const release = () => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    onHoldChange?.(false);
    setHold("keep");
    later(() => setHold((h) => (h === "keep" ? "idle" : h)), 1500);
  };

  const complete = () => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    onHoldChange?.(false);
    setHold("done");
    onTeach();
    later(() => setHold("idle"), 1700);
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    start();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    if (!event.repeat) start();
  };

  const onKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === " " || event.key === "Enter") release();
  };

  const label = hold === "holding" ? "Recording demo" : hold === "keep" ? "Keep holding" : hold === "done" ? `Taught v${version}` : "Hold to teach";

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost hold min-w-[176px]"
        data-state={hold}
        disabled={disabled}
        aria-describedby="hold-help"
        style={{ "--hold-ms": `${HOLD_MS}ms` } as CSSProperties}
        onPointerDown={onPointerDown}
        onPointerUp={release}
        onPointerCancel={release}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={release}
        onContextMenu={(event) => event.preventDefault()}
      >
        <span
          className="hold-fill"
          aria-hidden="true"
          onTransitionEnd={(event) => {
            if (event.propertyName === "clip-path" && holdingRef.current) complete();
          }}
        >
          <Fingerprint size={18} />
          {label}
        </span>
        <Fingerprint size={18} aria-hidden="true" />
        {label}
      </button>
      <span id="hold-help" className="sr-only">
        Press and hold to record a demonstration on the teacher robot, then share it with every capable robot.
      </span>
    </>
  );
}
