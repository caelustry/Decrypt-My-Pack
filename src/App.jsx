import { useCallback, useEffect, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import ConnectionForm from "./components/ConnectionForm.jsx";
import PacketConsole from "./components/PacketConsole.jsx";
import DownloadPanel from "./components/DownloadPanel.jsx";
import StatusSidebar from "./components/StatusSidebar.jsx";
import FaqSection from "./components/FaqSection.jsx";
import { buildTimeline, buildFailureTimeline } from "./lib/mockStream.js";

const INITIAL_STATS = { latency: 0, packetCount: 0, uptime: "00:00" };

export default function App() {
  const [status, setStatus] = useState("idle"); // idle | connecting | streaming | completed | error
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [targetIp, setTargetIp] = useState("");
  const [stats, setStats] = useState(INITIAL_STATS);

  const timeoutsRef = useRef([]);
  const startedAtRef = useRef(null);
  const uptimeIntervalRef = useRef(null);

  const clearAllTimers = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (uptimeIntervalRef.current) {
      clearInterval(uptimeIntervalRef.current);
      uptimeIntervalRef.current = null;
    }
  }, []);

  useEffect(() => () => clearAllTimers(), [clearAllTimers]);

  function startUptimeClock() {
    startedAtRef.current = Date.now();
    uptimeIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
      const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
      const ss = String(elapsed % 60).padStart(2, "0");
      setStats((s) => ({ ...s, uptime: `${mm}:${ss}` }));
    }, 1000);
  }

  function handleConnect({ ip, port, forceError }) {
    clearAllTimers();
    setLogs([]);
    setProgress(0);
    setTargetIp(ip);
    setStats({ ...INITIAL_STATS, latency: Math.floor(24 + Math.random() * 40) });
    setStatus("connecting");
    startUptimeClock();

    const timeline = forceError ? buildFailureTimeline({ ip, port }) : buildTimeline({ ip, port });
    let cumulativeDelay = 0;

    timeline.forEach((entry, idx) => {
      cumulativeDelay += entry.delay;
      const t = setTimeout(() => {
        setLogs((prev) => [...prev, { level: entry.level, text: entry.text }]);
        setStats((s) => ({ ...s, packetCount: s.packetCount + (entry.level === "PACKET" || entry.level === "STREAM" ? 1 : 0) }));

        if (entry.progress !== null) {
          setProgress(entry.progress);
        }

        const isLast = idx === timeline.length - 1;
        if (isLast) {
          if (forceError) {
            setStatus("error");
            clearInterval(uptimeIntervalRef.current);
          } else {
            setStatus("completed");
            clearInterval(uptimeIntervalRef.current);
          }
        }
      }, cumulativeDelay);
      timeoutsRef.current.push(t);
    });

    // Kick the status into "streaming" once packet-info exchange begins,
    // even before the first STREAM-level line lands.
    const streamKickoffDelay = timeline
      .slice(0, timeline.findIndex((l) => l.level === "STREAM") + 1)
      .reduce((sum, l) => sum + l.delay, 0);
    if (!forceError && streamKickoffDelay > 0) {
      const t = setTimeout(() => setStatus("streaming"), streamKickoffDelay);
      timeoutsRef.current.push(t);
    }
  }

  function handleReset() {
    clearAllTimers();
    setStatus("idle");
    setLogs([]);
    setProgress(0);
    setTargetIp("");
    setStats(INITIAL_STATS);
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] grid-backdrop" aria-hidden="true" />

      <div className="relative">
        <Header status={status} />

        <main className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-6">
              <ConnectionForm status={status} onConnect={handleConnect} onReset={handleReset} />
              <PacketConsole logs={logs} status={status} />
            </div>

            <div className="flex flex-col gap-6">
              <DownloadPanel status={status} progress={progress} ip={targetIp} />
              <StatusSidebar status={status} stats={stats} />
            </div>
          </div>
        </main>

        <FaqSection />

        <footer className="border-t border-white/[0.06] px-5 py-8 sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <p className="text-xs text-slate-600">
              Bedrock Pack Fetcher — a protocol-visualization tool. Built for learning RakNet &amp; resource-pack flow.
            </p>
            <p className="font-mono text-[11px] text-slate-700">v1.0.0</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
