import { Download, PackageCheck, FileArchive, CircleX } from "lucide-react";

export default function DownloadPanel({ status, progress, ip }) {
  const isDone = status === "completed";
  const isError = status === "error";
  const fileName = ip ? `${ip.replace(/[^a-z0-9.-]/gi, "_")}.mcpack` : "resource-pack.mcpack";

  // Real chunk-by-chunk download and .mcpack assembly isn't built yet —
  // this milestone only confirms the handshake and pack list. Keeping
  // the button disabled here (rather than handing over a fake file)
  // until that's actually implemented.

  return (
    <div className="glass-panel p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-slate-300">
          Transfer Status
        </h2>
        {isDone && <PackageCheck className="h-4 w-4 text-signal-400" strokeWidth={2} />}
        {isError && <CircleX className="h-4 w-4 text-red-400" strokeWidth={2} />}
      </div>

      <div className="mb-2 flex items-center justify-between font-mono text-xs">
        <span className="text-slate-500">Handshake &amp; negotiation progress</span>
        <span className={isError ? "text-red-400" : "text-slate-300"}>
          {isError ? "interrupted" : `${progress}%`}
        </span>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-void-950 ring-1 ring-white/[0.06]">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${
            isError
              ? "bg-red-500/70"
              : isDone
              ? "bg-gradient-to-r from-signal-500 to-signal-400 shadow-glow-signal"
              : "bg-gradient-to-r from-pulse-500 to-pulse-400"
          }`}
          style={{ width: `${isError ? Math.min(progress, 100) : progress}%` }}
        />
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-void-950/50 px-3.5 py-3">
        <FileArchive className="h-4 w-4 shrink-0 text-slate-500" strokeWidth={1.75} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-xs text-slate-300">{fileName}</p>
          <p className="text-[11px] text-slate-600">
            {isDone ? "pack list negotiated — chunk download not yet implemented" : "awaiting handshake completion"}
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled
        title="Chunk download & archive assembly is the next milestone — not built yet"
        className="mt-5 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-transparent px-4 py-3 font-sans text-sm font-semibold text-slate-600"
      >
        <Download className="h-4 w-4" strokeWidth={2.25} />
        Download .mcpack (coming soon)
      </button>
      <p className="mt-2.5 text-center text-[11px] text-slate-600">
        This milestone confirms the real handshake and pack list. Actual chunk
        download and archive assembly is the next piece to build.
      </p>
    </div>
  );
}
