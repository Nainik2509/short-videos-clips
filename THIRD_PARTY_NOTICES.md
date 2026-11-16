# Third-party notices

The studio's own code is (c) 2026 Nainik Mehta (see `LICENSE`). It bundles no third-party source files.

It depends on open-source packages that keep their own licences and are installed by `npm install` / `pip install`:

| Package | Used for | Licence |
|---|---|---|
| Remotion (`remotion`, `@remotion/*`) | building video from React code | Remotion licence: free for individuals and teams of up to 3; larger companies need a company licence (remotion.dev/license) |
| React, React DOM | UI components | MIT |
| TypeScript | type checking | Apache-2.0 |
| Hyperframes | HTML to video | see its package licence |
| faster-whisper, PyAV | word timings (in `~/.venvs/whisper`) | MIT / BSD |

Runtime tools (not bundled): ffmpeg, yt-dlp, Google Chrome / Chromium.
