"use client";

import { type FormEvent, type KeyboardEvent, useRef, useState } from "react";
import type { Kind } from "@/lib/domain/platforms";
import { QUICK } from "@/lib/engine/sim";

const HISTORY_LIMIT = 20;

/**
 * Command line for one robot. Up and down arrows cycle the last 20 commands (docs: console-commands.md).
 * History is kept per mounted input, so the fleet console and each robot page remember their own.
 */
export function CommandInput({
  robotId,
  kind,
  onSend,
  autoFocus,
}: {
  robotId: string;
  kind: Kind;
  onSend: (raw: string) => void;
  autoFocus?: boolean;
}) {
  const history = useRef<string[]>([]);
  const historyIndex = useRef(-1);
  const [draft, setDraft] = useState("");
  const inputId = `command-${robotId.toLowerCase()}`;

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    history.current = [text, ...history.current.filter((h) => h !== text)].slice(0, HISTORY_LIMIT);
    historyIndex.current = -1;
    onSend(text);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    send(draft);
    setDraft("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp" && history.current.length) {
      event.preventDefault();
      const index = Math.min(historyIndex.current + 1, history.current.length - 1);
      historyIndex.current = index;
      setDraft(history.current[index]);
    } else if (event.key === "ArrowDown" && historyIndex.current >= 0) {
      event.preventDefault();
      const index = historyIndex.current - 1;
      historyIndex.current = index;
      setDraft(index >= 0 ? history.current[index] : "");
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor={inputId} className="text-[12.5px] text-haze">
        Send a command to <span className="mono text-fog">{robotId}</span>
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id={inputId}
          className="field mono text-[13px]"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          autoFocus={autoFocus}
          placeholder="Try help"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
        />
        <button type="submit" className="btn btn-primary shrink-0">
          Send
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {QUICK[kind].map((command) => (
          <button key={command} type="button" onClick={() => send(command)} className="btn btn-ghost btn-sm mono text-[12px] font-normal">
            {command}
          </button>
        ))}
      </div>
    </form>
  );
}
