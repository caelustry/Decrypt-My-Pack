// mockStream.js
// Simulates the visual/log timeline of a Bedrock RakNet handshake and
// resource-pack transfer for demonstration purposes. No real sockets
// are opened — this only produces a scripted, illustrative log + progress
// timeline that the console and progress components render.

export const LOG_LEVELS = {
  INFO: "INFO",
  PACKET: "PACKET",
  STREAM: "STREAM",
  WARN: "WARN",
  ERROR: "ERROR",
  DONE: "DONE",
};

/**
 * Builds the scripted sequence of log lines for a given target.
 * `progress` (0-100, or null) tells the UI how far the transfer bar
 * should be after this line renders.
 */
export function buildTimeline({ ip, port }) {
  const target = `${ip}:${port}`;

  return [
    { level: LOG_LEVELS.INFO, text: `Resolving host ${target}...`, delay: 260, progress: null },
    { level: LOG_LEVELS.INFO, text: "Opening RakNet UDP socket...", delay: 420, progress: null },
    { level: LOG_LEVELS.PACKET, text: "TX  OpenConnectionRequest1 (0x05)", delay: 380, progress: null },
    { level: LOG_LEVELS.PACKET, text: "RX  OpenConnectionReply1 (0x06)", delay: 340, progress: null },
    { level: LOG_LEVELS.PACKET, text: "TX  OpenConnectionRequest2 (0x07)", delay: 300, progress: null },
    { level: LOG_LEVELS.PACKET, text: "RX  OpenConnectionReply2 (0x08)", delay: 320, progress: 6 },
    { level: LOG_LEVELS.INFO, text: "RakNet session established. MTU negotiated.", delay: 300, progress: 10 },
    { level: LOG_LEVELS.PACKET, text: "TX  ConnectionRequest (0x09)", delay: 260, progress: 13 },
    { level: LOG_LEVELS.PACKET, text: "RX  ConnectionRequestAccepted (0x10)", delay: 300, progress: 17 },
    { level: LOG_LEVELS.PACKET, text: "TX  NewIncomingConnection (0x13)", delay: 240, progress: 20 },
    { level: LOG_LEVELS.INFO, text: "Handing off to game protocol layer...", delay: 380, progress: 23 },
    { level: LOG_LEVELS.PACKET, text: "RX  ResourcePacksInfo (0x06)", delay: 420, progress: 30 },
    { level: LOG_LEVELS.INFO, text: "Server advertises 1 behavior pack, 2 resource packs.", delay: 300, progress: 33 },
    { level: LOG_LEVELS.PACKET, text: "TX  ResourcePackClientResponse — download requested", delay: 300, progress: 37 },
    { level: LOG_LEVELS.PACKET, text: "RX  ResourcePackStack (0x07)", delay: 320, progress: 41 },
    { level: LOG_LEVELS.STREAM, text: "Streaming data chunks for pack 1 of 2...", delay: 260, progress: 46 },
    { level: LOG_LEVELS.PACKET, text: "RX  ResourcePackDataInfo — 4.2 MB, 34 chunks", delay: 280, progress: 49 },
    { level: LOG_LEVELS.STREAM, text: "Chunk 8/34 received (0x08)", delay: 220, progress: 55 },
    { level: LOG_LEVELS.STREAM, text: "Chunk 19/34 received (0x08)", delay: 220, progress: 63 },
    { level: LOG_LEVELS.STREAM, text: "Chunk 34/34 received — pack 1 complete", delay: 260, progress: 70 },
    { level: LOG_LEVELS.STREAM, text: "Streaming data chunks for pack 2 of 2...", delay: 240, progress: 74 },
    { level: LOG_LEVELS.STREAM, text: "Chunk 11/18 received (0x08)", delay: 220, progress: 82 },
    { level: LOG_LEVELS.STREAM, text: "Chunk 18/18 received — pack 2 complete", delay: 260, progress: 90 },
    { level: LOG_LEVELS.INFO, text: "Verifying SHA-256 checksums for assembled archive...", delay: 360, progress: 95 },
    { level: LOG_LEVELS.DONE, text: "Archive assembled — ready for export as .mcpack", delay: 240, progress: 100 },
  ];
}

/**
 * A short, illustrative failure timeline used when the mock connection
 * is set to fail (e.g. unreachable host demo state).
 */
export function buildFailureTimeline({ ip, port }) {
  const target = `${ip}:${port}`;
  return [
    { level: LOG_LEVELS.INFO, text: `Resolving host ${target}...`, delay: 280, progress: null },
    { level: LOG_LEVELS.INFO, text: "Opening RakNet UDP socket...", delay: 420, progress: null },
    { level: LOG_LEVELS.PACKET, text: "TX  OpenConnectionRequest1 (0x05)", delay: 400, progress: null },
    { level: LOG_LEVELS.WARN, text: "No reply after 3 retries (1500ms timeout)", delay: 500, progress: null },
    { level: LOG_LEVELS.ERROR, text: "Connection failed: host unreachable or offline", delay: 200, progress: null },
  ];
}
