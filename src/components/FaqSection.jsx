import { useState } from "react";
import { ChevronDown, BookOpen } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "What is the RakNet handshake?",
    a: "RakNet is the UDP-based networking layer Bedrock Edition runs on. Before any game data flows, the client and server exchange a short sequence of connection-request and reply packets to agree on a maximum transmission unit (MTU) and open a reliable session. Only after that handshake completes does the game protocol layer take over.",
  },
  {
    q: "What is the ResourcePacksInfo packet?",
    a: "Sent by the server right after login, ResourcePacksInfo lists every behavior and resource pack the world requires, along with each pack's UUID, version, and size. The client uses this manifest to decide what it already has cached locally versus what needs to be downloaded.",
  },
  {
    q: "What is ResourcePackDataChunk (chunked transfer)?",
    a: "Resource packs can be tens of megabytes, too large for a single packet. The server splits each pack into fixed-size chunks and streams them one at a time via ResourcePackDataChunk packets. The client acknowledges each chunk and reassembles them in order once the final chunk arrives.",
  },
  {
    q: "How does the client verify pack integrity?",
    a: "Once every chunk for a pack has been received, the client recomputes a checksum over the assembled bytes and compares it against the size and hash metadata declared earlier in ResourcePackDataInfo. A mismatch means the archive is corrupt and must be re-requested.",
  },
  {
    q: "Why does this tool default to port 19132?",
    a: "19132 is the IANA-registered default UDP port for Minecraft Bedrock Edition servers. Some hosts run on a custom port behind a proxy — in that case, enter whichever port the server operator has published.",
  },
  {
    q: "Is this a real network client?",
    a: "This interface is an educational visualization. Browsers cannot open raw UDP sockets, so the handshake and streaming log you see here are a scripted simulation of what a real RakNet session and pack transfer looks like — useful for learning the protocol flow without needing packet-capture tooling.",
  },
];

function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div className="glass-panel overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5"
      >
        <span className="font-sans text-sm font-medium text-slate-200">{item.q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-signal-400" : ""
          }`}
          strokeWidth={2}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-4 pb-4 text-sm leading-relaxed text-slate-500 sm:px-5">{item.a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8">
      <div className="mb-6 flex items-center gap-2.5">
        <BookOpen className="h-4 w-4 text-signal-400" strokeWidth={1.75} />
        <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-slate-300">
          Protocol Reference
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {FAQ_ITEMS.map((item, i) => (
          <AccordionItem
            key={item.q}
            item={item}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
          />
        ))}
      </div>
    </section>
  );
}
