# Bedrock Pack Fetcher

A dark-mode, glassmorphic dashboard that visualizes the Minecraft Bedrock (RakNet)
connection handshake and resource-pack transfer flow — built for learning the
protocol, demoing UI states, or wiring up your own backend later.

> **Note on scope:** browsers cannot open raw UDP sockets, so the "connection"
> in this app is a scripted, client-side simulation (`src/lib/mockStream.js`)
> that renders a realistic packet log and progress timeline. It's designed as
> a clean UI shell you can later wire to a real backend (see
> [Wiring up a real backend](#wiring-up-a-real-backend) below).

## Tech stack

- **Vite + React 18** — fast dev server, zero-config static output for Vercel
- **Tailwind CSS** — custom dark token system (`void` background scale, `signal`/`pulse` accents)
- **lucide-react** — line icons throughout

## Project structure

```
bedrock-pack-fetcher/
├── index.html                  # Vite entry HTML (fonts, meta, root div)
├── vercel.json                 # SPA rewrite rule for Vercel
├── vite.config.js
├── tailwind.config.js          # design tokens: colors, shadows, keyframes
├── postcss.config.js
├── eslint.config.js
├── package.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx                 # React root
    ├── App.jsx                  # State machine + layout orchestration
    ├── index.css                # Tailwind layers + shared utility classes
    ├── lib/
    │   └── mockStream.js         # Scripted handshake/stream timeline data
    └── components/
        ├── Header.jsx            # Branding + live status badge
        ├── ConnectionForm.jsx    # IP/port inputs + Connect & Fetch button
        ├── PacketConsole.jsx     # Color-coded terminal log viewer
        ├── DownloadPanel.jsx     # Progress bar + Download .mcpack button
        ├── StatusSidebar.jsx     # Session diagnostics panel
        └── FaqSection.jsx        # Protocol reference accordion
```

## Local development

```bash
npm install
npm run dev       # http://localhost:5173
```

```bash
npm run build      # outputs static assets to /dist
npm run preview    # preview the production build locally
```

## Deploying to Vercel

1. Push this folder to a new GitHub repository.
2. In Vercel, click **Add New → Project** and import the repo.
3. Vercel auto-detects Vite — no config needed. Defaults it will use:
   - **Build Command:** `npm run build` (or `vite build`)
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Click **Deploy**. Every push to your default branch redeploys automatically.

`vercel.json` is included with a catch-all rewrite to `index.html`, which
keeps client-side routing safe if you later add React Router.

## App states

`App.jsx` drives a single state machine consumed by every component:

| State        | Trigger                                      | UI effect                                                        |
|---------------|-----------------------------------------------|--------------------------------------------------------------------|
| `idle`        | initial load / after **Reset**                | status badge "System Operational", console shows a hint line       |
| `connecting`  | **Connect & Fetch** submitted                 | badge → "Negotiating Handshake", spinner on the button              |
| `streaming`   | timeline reaches the resource-pack chunks     | badge → "Streaming Pack Data", progress bar animates, scanline fx  |
| `completed`   | timeline finishes successfully                | progress hits 100%, **Download .mcpack** button lights up          |
| `error`       | "Simulate timeout" checkbox was on            | badge → "Connection Failed", red progress state, Reset appears     |

## Wiring up a real backend

To turn this into a functioning fetch tool, replace the timeline simulation
with real calls to a backend service (browsers can't speak raw RakNet/UDP
directly). A typical approach:

1. Stand up a small Node/Go service that performs the actual RakNet
   handshake and resource-pack download server-side.
2. Expose it over WebSocket or Server-Sent Events so the frontend can stream
   log lines and progress the same way `mockStream.js` does now.
3. In `App.jsx`, swap the `buildTimeline`/`buildFailureTimeline` calls in
   `handleConnect` for a socket/EventSource connection to your service, and
   push incoming messages into `setLogs`/`setProgress` the same way.
4. In `DownloadPanel.jsx`, replace the placeholder `handleDownload` blob
   export with a fetch of the real assembled archive from your backend.

Keep in mind any such service should only fetch resource packs from servers
you have permission to connect to.

## License

MIT — do whatever you'd like with this scaffold.
