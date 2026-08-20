import { useState } from "react";
import { Server, Hash, Zap, Loader2 } from "lucide-react";

export default function ConnectionForm({ status, onConnect, onReset }) {
  const [ip, setIp] = useState("play.example-bedrock.net");
  const [port, setPort] = useState("19132");
  const [touched, setTouched] = useState(false);

  const isBusy = status === "connecting" || status === "streaming";
  const ipError = touched && ip.trim().length === 0 ? "Enter a server IP or domain" : null;
  const portNum = Number(port);
  const portError =
    touched && (!port || Number.isNaN(portNum) || portNum < 1 || portNum > 65535)
      ? "Port must be between 1–65535"
      : null;

  function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (ip.trim().length === 0 || Number.isNaN(portNum) || portNum < 1 || portNum > 65535) {
      return;
    }
    onConnect({ ip: ip.trim(), port: portNum });
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-slate-300">
          Server Connection
        </h2>
        <span className="font-mono text-[11px] text-slate-600">bedrock / raknet</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
        <div>
          <label htmlFor="server-ip" className="mb-1.5 block text-xs font-medium text-slate-400">
            Server IP / Domain
          </label>
          <div className={`field-shell ${ipError ? "border-red-500/50" : ""}`}>
            <Server className="h-4 w-4 shrink-0 text-slate-500" strokeWidth={1.75} />
            <input
              id="server-ip"
              type="text"
              value={ip}
              disabled={isBusy}
              onChange={(e) => setIp(e.target.value)}
              placeholder="play.example-bedrock.net"
              className="w-full bg-transparent font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none disabled:opacity-50"
            />
          </div>
          {ipError && <p className="mt-1.5 text-xs text-red-400">{ipError}</p>}
        </div>

        <div>
          <label htmlFor="server-port" className="mb-1.5 block text-xs font-medium text-slate-400">
            Port
          </label>
          <div className={`field-shell ${portError ? "border-red-500/50" : ""}`}>
            <Hash className="h-4 w-4 shrink-0 text-slate-500" strokeWidth={1.75} />
            <input
              id="server-port"
              type="number"
              value={port}
              disabled={isBusy}
              onChange={(e) => setPort(e.target.value)}
              placeholder="19132"
              className="w-full bg-transparent font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          {portError && <p className="mt-1.5 text-xs text-red-400">{portError}</p>}
        </div>
      </div>

      <div className="mt-5 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex gap-2.5">
          {(status === "completed" || status === "error") && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-xl border border-white/[0.08] bg-void-950/70 px-4 py-2.5 font-sans text-sm font-medium text-slate-300 transition-colors hover:border-white/20 hover:text-white"
            >
              Reset
            </button>
          )}
          <button
            type="submit"
            disabled={isBusy}
            className="group relative flex items-center justify-center gap-2 rounded-xl bg-signal-500 px-5 py-2.5 font-sans text-sm font-semibold text-void-950 shadow-glow-signal transition-all duration-200 hover:bg-signal-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
          >
            {isBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                {status === "connecting" ? "Connecting..." : "Streaming..."}
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" strokeWidth={2.25} />
                Connect &amp; Fetch
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
