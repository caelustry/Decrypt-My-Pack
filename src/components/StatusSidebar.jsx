import { Activity, Gauge, Layers, ShieldCheck, Clock } from "lucide-react";

const STATE_LABEL = {
  idle: "Idle",
  connecting: "Handshaking",
  streaming: "Streaming",
  completed: "Complete",
  error: "Failed",
};

const STATE_COLOR = {
  idle: "text-slate-400",
  connecting: "text-pulse-400",
  streaming: "text-pulse-400",
  completed: "text-signal-400",
  error: "text-red-400",
};

function StatRow({ icon: Icon, label, value, valueClass }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="flex items-center gap-2 text-xs text-slate-500">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        {label}
      </span>
      <span className={`font-mono text-xs ${valueClass ?? "text-slate-300"}`}>{value}</span>
    </div>
  );
}

export default function StatusSidebar({ status, stats }) {
  return (
    <div className="glass-panel p-5 sm:p-6">
      <h2 className="mb-1 font-sans text-sm font-semibold uppercase tracking-wider text-slate-300">
        Session Diagnostics
      </h2>
      <p className="mb-3 text-[11px] text-slate-600">Live metrics for the current mock session</p>

      <div className="divide-y divide-white/[0.05]">
        <StatRow icon={Activity} label="Connection state" value={STATE_LABEL[status]} valueClass={STATE_COLOR[status]} />
        <StatRow icon={Gauge} label="Simulated latency" value={`${stats.latency} ms`} />
        <StatRow icon={Layers} label="Packets exchanged" value={stats.packetCount} />
        <StatRow icon={ShieldCheck} label="Protocol version" value="MCBE 1.21.x (776)" />
        <StatRow icon={Clock} label="Session uptime" value={stats.uptime} />
      </div>

      <div className="mt-4 rounded-xl border border-white/[0.06] bg-void-950/50 p-3.5">
        <p className="text-[11px] leading-relaxed text-slate-500">
          This console visualizes the standard RakNet handshake and Bedrock resource-pack
          exchange for learning purposes. No packets leave your browser.
        </p>
      </div>
    </div>
  );
}
