// api/fetch-pack.js
//
// MILESTONE 1 — diagnostic / discovery endpoint.
//
// This performs a REAL connection to the target Bedrock server using the
// bedrock-protocol library (RakNet handshake + login), then logs every
// packet related to resource packs *verbatim* as Server-Sent Events.
//
// Why verbatim, not parsed: exact field names on ResourcePacksInfo /
// ResourcePackDataInfo / ResourcePackChunkData shift slightly across
// protocol versions. Rather than guess and ship something subtly wrong,
// this endpoint's job is to show us the real shape of the data your
// target server actually sends — then we write the precise chunk-request
// and reassembly logic against that in the next milestone.
//
// Usage:
//   GET /api/fetch-pack?ip=<host>&port=<port>
//
// Test with curl so you can see the stream live (browsers buffer SSE
// differently in devtools, curl -N shows it as it arrives):
//   curl -N "https://your-app.vercel.app/api/fetch-pack?ip=play.example.net&port=19132"

import bedrock from "bedrock-protocol";

export const config = {
  runtime: "nodejs",
};

// Packets we care about at this stage of the protocol. bedrock-protocol
// emits an event per packet name for anything it decodes — see
// docs/API.md in the library repo.
const WATCHED_PACKETS = [
  "network_settings",
  "resource_packs_info",
  "resource_pack_stack",
  "resource_pack_data_info",
  "resource_pack_chunk_data",
  "resource_pack_client_response",
  "play_status",
  "disconnect",
];

export default async function handler(req, res) {
  const { ip, port } = req.query;

  if (!ip) {
    res.status(400).json({ error: "Missing required query param: ip" });
    return;
  }
  const targetPort = Number(port) || 19132;

  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // disable proxy buffering so chunks flush immediately
  });

  const send = (level, text, extra) => {
    res.write(`data: ${JSON.stringify({ level, text, extra, t: Date.now() })}\n\n`);
  };

  let client;
  let finished = false;

  const finish = (reason) => {
    if (finished) return;
    finished = true;
    send("INFO", `Closing connection (${reason})`);
    res.end();
    try {
      client?.close();
    } catch {
      // already closed — ignore
    }
  };

  // Hard ceiling so a hung connection can't run past the function's own
  // execution limit. Adjust alongside vercel.json's maxDuration for this
  // route (see accompanying vercel.json snippet).
  const hardTimeout = setTimeout(() => finish("timed out after 45s"), 45_000);

  req.on("close", () => {
    clearTimeout(hardTimeout);
    finish("client disconnected");
  });

  try {
    send("INFO", `Resolving host ${ip}:${targetPort}...`);
    send("INFO", "Opening RakNet session (bedrock-protocol)...");

    client = bedrock.createClient({
      host: ip,
      port: targetPort,
      username: "PackFetcher",
      offline: true, // no Xbox Live auth — fine for servers with online-mode off
      version: false, // let the library auto-negotiate the server's protocol version
    });

    client.on("connect_allowed", () => {
      send("PACKET", "RakNet connection accepted");
    });

    client.on("session", () => {
      send("INFO", "RakNet session established, entering login sequence...");
    });

    for (const packetName of WATCHED_PACKETS) {
      client.on(packetName, (packet) => {
        send("PACKET", `RX  ${packetName}`, packet);

        if (packetName === "resource_pack_stack") {
          send("DONE", "Reached resource_pack_stack — negotiation observed successfully.");
          finish("milestone 1 complete");
        }
        if (packetName === "disconnect") {
          send("WARN", `Server sent disconnect: ${packet?.message ?? "no reason given"}`);
          finish("server disconnected us");
        }
      });
    }

    client.on("error", (err) => {
      send("ERROR", `Connection error: ${err.message}`);
      finish("error");
    });

    client.on("close", () => {
      send("INFO", "Underlying connection closed.");
      finish("connection closed");
    });
  } catch (err) {
    send("ERROR", `Failed to start client: ${err.message}`);
    finish("startup exception");
  }
}
