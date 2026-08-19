import { useEffect, useRef } from "react";
import { TerminalSquare, Circle } from "lucide-react";

const LEVEL_STYLE = {
  INFO: "text-slate-400",
  PACKET: "text-pulse-400",
  STREAM: "text-signal-400",
  WARN: "text-amber-400",
  ERROR: "text-red-400",
  DONE: "text-signal-300 font-semibold",
};

const LEVEL_TAG_BG = {
  INFO: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  PACKET: "bg-pulse-500/10 text-pulse-400 border-pulse-500/25",
  STREAM: "bg-signal-500/10 text-signal-400 border-signal-500/25",
  WARN: "bg-amber-400/10 text-amber-400 border-amber-400/25",
  ERROR: "bg-red-500/10 text-red-400 border-red-500/25",
  DONE: "bg-signal-500/15 text-signal-300 border-signal-500/30",
};

export default function PacketConsole({ logs, status }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const isActive = status === "connecting" || status === "streaming";

  return (
    <div className="glass-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-void-950/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <TerminalSquare className="h-4 w-4 text-slate-500" strokeWidth={1.75} />
          <span className="font-mono text-xs font-medium text-slate-400">packet-stream.log</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Circle className="h-2.5 w-2.5 fill-red-500/70 text-red-500/70" />
          <Circle className="h-2.5 w-2.5 fill-amber-400/70 text-amber-400/70" />
          <Circle className="h-2.5 w-2.5 fill-signal-500/70 text-signal-500/70" />
        </div>
      </div>

      <div className="relative">
        {isActive && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-signal-400/[0.05] to-transparent animate-scanline"
            aria-hidden="true"
          />
        )}

        <div
          ref={scrollRef}
          className="console-scroll relative h-72 overflow-y-auto px-4 py-4 font-mono text-[13px] leading-relaxed sm:h-80"
        >
          {logs.length === 0 && (
            <p className="text-slate-600">
              <span className="text-signal-500">$</span> awaiting connection — enter a server IP and port, then run{" "}
              <span className="text-slate-400">Connect &amp; Fetch</span>
            </p>
          )}

          {logs.map((line, i) => (
            <div key={i} className="mb-1.5 flex animate-fade-up items-start gap-2.5 last:mb-0">
              <span
                className={`mt-[1px] shrink-0 rounded border px-1.5 py-[1px] text-[10px] font-semibold tracking-wide ${LEVEL_TAG_BG[line.level]}`}
              >
                {line.level}
              </span>
              <span className={`${LEVEL_STYLE[line.level]} break-all`}>{line.text}</span>
            </div>
          ))}

          {isActive && (
            <span className="mt-1 inline-block h-3.5 w-2 animate-blink bg-signal-400/80 align-middle" aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  );
}
