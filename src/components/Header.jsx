import { Box, Radio } from "lucide-react";

const STATUS_COPY = {
  idle: { label: "System Operational", color: "signal" },
  connecting: { label: "Negotiating Handshake", color: "pulse" },
  streaming: { label: "Streaming Pack Data", color: "pulse" },
  completed: { label: "Transfer Complete", color: "signal" },
  error: { label: "Connection Failed", color: "amber" },
};

const DOT_COLOR = {
  signal: "bg-signal-400",
  pulse: "bg-pulse-400",
  amber: "bg-amber-400",
};

const RING_COLOR = {
  signal: "bg-signal-400",
  pulse: "bg-pulse-400",
  amber: "bg-amber-400",
};

const TEXT_COLOR = {
  signal: "text-signal-400",
  pulse: "text-pulse-400",
  amber: "text-amber-400",
};

export default function Header({ status }) {
  const meta = STATUS_COPY[status] ?? STATUS_COPY.idle;

  return (
    <header className="relative">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 pt-10 sm:px-8 sm:pt-14 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-signal-500/25 bg-signal-500/10 shadow-glow-signal">
            <Box className="h-5 w-5 text-signal-400" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="font-sans text-xl font-bold tracking-tight text-slate-50 sm:text-2xl">
              Bedrock Pack Fetcher
            </h1>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
              <Radio className="h-3 w-3" strokeWidth={2} />
              RakNet inspector &amp; resource-pack retrieval console
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-white/[0.08] bg-void-900/70 py-1.5 pl-3 pr-4 backdrop-blur-md md:self-auto">
          <span className="badge-dot">
            <span className={`absolute inline-flex h-full w-full animate-pulse-ring rounded-full ${RING_COLOR[meta.color]}`} />
            <span className={`relative inline-flex h-2 w-2 rounded-full ${DOT_COLOR[meta.color]}`} />
          </span>
          <span className={`font-mono text-[11px] font-medium uppercase tracking-wider ${TEXT_COLOR[meta.color]}`}>
            {meta.label}
          </span>
        </div>
      </div>
    </header>
  );
}
