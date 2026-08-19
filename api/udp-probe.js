// api/udp-probe.js
//
// Diagnostic-only endpoint. Opens a raw UDP (dgram) socket from inside a
// Vercel Function and sends a single, well-formed DNS query to a public
// resolver (8.8.8.8:53). DNS-over-UDP is a good stand-in for "can this
// runtime do an outbound UDP round trip at all" — the same primitive a
// real RakNet handshake would need.
//
// Hit this endpoint directly in a browser or with curl after deploying:
//   https://your-app.vercel.app/api/udp-probe
//
// A JSON response with "udpOutbound": true means raw UDP works here and
// you can build the real RakNet handshake as a Vercel Function. A
// timeout/false response means Vercel's network is blocking outbound UDP
// and you'll need an always-on host elsewhere (Termux+tunnel, a small
// VPS, etc.) for the actual fetching.

import dgram from "node:dgram";

// Explicit for clarity — Node.js is already the default runtime for
// functions in an `api/` folder (as opposed to `edge`, which has no
// access to Node's `dgram` module at all).
export const config = {
  runtime: "nodejs",
};

function buildDnsQuery() {
  const id = Buffer.from([0x12, 0x34]); // transaction id
  const flags = Buffer.from([0x01, 0x00]); // standard query, recursion desired
  const counts = Buffer.from([
    0x00, 0x01, // QDCOUNT = 1
    0x00, 0x00, // ANCOUNT = 0
    0x00, 0x00, // NSCOUNT = 0
    0x00, 0x00, // ARCOUNT = 0
  ]);
  const qname = Buffer.concat([
    Buffer.from([6]), Buffer.from("google"),
    Buffer.from([3]), Buffer.from("com"),
    Buffer.from([0]),
  ]);
  const qtypeClass = Buffer.from([0x00, 0x01, 0x00, 0x01]); // type A, class IN
  return Buffer.concat([id, flags, counts, qname, qtypeClass]);
}

export default function handler(req, res) {
  const socket = dgram.createSocket("udp4");
  const query = buildDnsQuery();
  const startedAt = Date.now();
  let settled = false;

  function finish(payload) {
    if (settled) return;
    settled = true;
    clearTimeout(timeout);
    try {
      socket.close();
    } catch {
      // socket may already be closed — safe to ignore
    }
    res.status(200).json(payload);
  }

  const timeout = setTimeout(() => {
    finish({
      udpOutbound: false,
      reason: "timeout",
      elapsedMs: Date.now() - startedAt,
      note: "No reply within 4s. Outbound UDP is most likely blocked on this deployment.",
    });
  }, 4000);

  socket.once("message", (msg, rinfo) => {
    finish({
      udpOutbound: true,
      elapsedMs: Date.now() - startedAt,
      bytesReceived: msg.length,
      from: `${rinfo.address}:${rinfo.port}`,
      note: "Received a real UDP reply — raw outbound UDP sockets work on this deployment.",
    });
  });

  socket.once("error", (err) => {
    finish({
      udpOutbound: false,
      reason: "socket_error",
      error: err.message,
      elapsedMs: Date.now() - startedAt,
    });
  });

  socket.send(query, 53, "8.8.8.8", (err) => {
    if (err) {
      finish({
        udpOutbound: false,
        reason: "send_error",
        error: err.message,
        elapsedMs: Date.now() - startedAt,
      });
    }
  });
}
