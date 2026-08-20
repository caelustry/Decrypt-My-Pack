import { useCallback, useEffect, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import ConnectionForm from "./components/ConnectionForm.jsx";
import PacketConsole from "./components/PacketConsole.jsx";
import DownloadPanel from "./components/DownloadPanel.jsx";
import StatusSidebar from "./components/StatusSidebar.jsx";
import FaqSection from "./components/FaqSection.jsx";

const INITIAL_STATS = { latency: 0, packetCount: 0, uptime: "00:00" };

// Set this in Vercel's Environment Variables as VITE_FETCH_BACKEND_URL
// (Project Settings → Environment Variables), pointing at your Render
// service, e.g. https://bedrock-pack-fetcher-backend.onrender.com
// Vite only exposes env vars prefixed with VITE_ to the client bundle.
const BACKEND_URL = import.meta.env.VITE_FETCH_BACKEND_URL;

// Rough, honest progress mapping — this reflects how far the *handshake
// and pack-list negotiation* has gotten, not real byte-download progress.
// Actual chunk-by-chunk download progress gets wired in once that part
// of the backend exists.
const PACKET_PROGRESS = {
  network_settings: 15,
  resource_packs_info: 40,
  resource_pack_client_response: 50,
  resource_pack_stack: 60,
};

export default function App() {
  const [status, setStatus] = useState("idle"); // idle | connecting | streaming | completed | error
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [targetIp, setTargetIp] = useState("");
  const [stats, setStats] = useState(INITIAL_STATS);

  const eventSourceRef = useRef(null);
  const startedAtRef = useRef(null);
  const uptimeIntervalRef = useRef(null);

  const stopUptimeClock = useCallback(() => {
    if (uptimeIntervalRef.current) {
      clearInterval(uptimeIntervalRef.current);
      uptimeIntervalRef.current = null;
    }
  }, []);

  const closeConnection = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    stopUptimeClock();
  }, [stopUptimeClock]);

  useEffect(() => () => closeConnection(), [closeConnection]);

  function startUptimeClock() {
    startedAtRef.current = Date.now();
    uptimeIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
      const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
      const ss = String(elapsed % 60).padStart(2, "0");
      setStats((s) => ({ ...s, uptime: `${mm}:${ss}` }));
    }, 1000);
  }

  function handleConnect({ ip, port }) {
    closeConnection();
    setLogs([]);
    setProgress(0);
    setTargetIp(ip);
    setStats(INITIAL_STATS);

    if (!BACKEND_URL) {
      setStatus("error");
      setLogs([
        {
          level: "ERROR",
          text: "VITE_FETCH_BACKEND_URL is not set. Add it in Vercel's Environment Variables, pointing at your Render backend URL, then redeploy.",
        },
      ]);
      return;
    }

    setStatus("connecting");
    startUptimeClock();

    const url = `${BACKEND_URL.replace(/\/$/, "")}/fetch-pack?ip=${encodeURIComponent(ip)}&port=${encodeURIComponent(port)}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    setLogs([
      {
        level: "INFO",
        text: "Contacting backend... (Render's free tier can take 30-60s to wake up from a cold start)",
      },
    ]);

    es.onmessage = (event) => {
      let payload;
      try {
        payload = JSON.parse(event.data);
      } catch {
        return;
      }

      const { level, text } = payload;
      setLogs((prev) => [...prev, { level, text }]);

      setStats((s) => ({
        ...s,
        packetCount: s.packetCount + (level === "PACKET" ? 1 : 0),
      }));

      if (level === "PACKET" && status !== "error") {
        setStatus("streaming");
      }

      const matchedPacket = Object.keys(PACKET_PROGRESS).find((name) => text.includes(name));
      if (matchedPacket) {
        setProgress(PACKET_PROGRESS[matchedPacket]);
      }

      if (level === "DONE") {
        setStatus("completed");
        stopUptimeClock();
      }
      if (level === "ERROR") {
        setStatus("error");
        stopUptimeClock();
        es.close();
      }
    };

    es.onerror = () => {
      setLogs((prev) => [
        ...prev,
        {
          level: "ERROR",
          text: "Lost connection to backend (network issue, backend asleep/down, or CORS misconfiguration).",
        },
      ]);
      setStatus("error");
      stopUptimeClock();
      es.close();
    };
  }

  function handleReset() {
    closeConnection();
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
              Bedrock Pack Fetcher — connects to a real Bedrock server via a backend bot client.
              Chunk download &amp; archive assembly coming soon.
            </p>
            <p className="font-mono text-[11px] text-slate-700">v1.1.0</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
