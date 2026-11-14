# Waveform — CAVA-inspired Browser Audio Visualizer

A vanilla JavaScript, HTML, CSS, Web Audio API, and Canvas project that runs as a bookmarklet. It draws a configurable CAVA-inspired spectrum overlay in the current page and keeps its interface inside a Shadow DOM.

## Quick start

1. Install Node.js 18 or newer.
2. From this folder, run `npm run build`.
3. Open `dist/bookmarklet.js`, copy the complete `javascript:...` URL, and create a bookmark in your browser. Name it **Waveform** and paste the URL into the bookmark's URL/location field.
4. Open a page with audio or video, then click the Waveform bookmark.
5. Open **Audio** in the settings panel and connect a detected page media element, choose a local audio file, or enable the microphone.
6. Click the bookmark again to show/hide settings. Use the × button to close and clean up the overlay.

The bookmarklet is intentionally generated as one line because bookmark URLs cannot contain ordinary source-code formatting. The source files remain readable and unminified. `dist/visualizer.bundle.js` is also readable and unminified.

## Development preview

Run a local web server from this directory (for example, `python -m http.server 8000`) and open `http://localhost:8000`. The page is a small test harness; use its file picker to put a local audio element on the page, then launch Waveform. The exact same bundle is used by the preview and bookmarklet.

## Audio sources

### Webpage audio and video

The Audio tab enumerates `<audio>` and `<video>` elements on the current page. Choose a specific element or use auto-detect, then select **Connect page media**. The implementation feature-detects `captureStream()` / `mozCaptureStream()` and analyzes the captured media stream without replacing the page's player controls.

`HTMLMediaElement.captureStream()` is not supported in every major browser. In addition, same-origin policy and media CORS rules can make an otherwise playable cross-origin media element produce a silent capture. Protected/DRM media may also be inaccessible. When capture is not available, the UI reports the problem and the local-file or microphone option remains available.

### Local audio files

Choose a file in the Audio tab. A local player appears; click **Analyze local file** to play and analyze it. The visualizer uses a `MediaElementAudioSourceNode` for its own player and routes the signal both to the analyser and the normal audio output, so playback remains audible. The file stays local to the browser session. Its temporary object URL is revoked when the visualizer closes.

### Microphone

Click **Enable microphone** and grant permission in the browser prompt. Microphone capture requires `getUserMedia()`, which requires a secure context (normally HTTPS or localhost). Click the same button again to stop the microphone; closing the visualizer also stops its microphone tracks.

### What it cannot do

A bookmarklet cannot universally inspect the mixed audio output of the current browser tab, other tabs, or the entire computer. It does not bypass CORS, origin isolation, DRM, browser permissions, or site restrictions. This project deliberately does not claim system-wide capture.

## CAVA design reference

CAVA's core processing documentation describes logarithmic frequency grouping, noise reduction, fall-off smoothing, and dynamic sensitivity. Its example config includes bar count, cutoff frequencies, mono/stereo layouts, orientation, peak-like idle behavior, and up to eight gradient stops. The browser implementation recreates the visual concepts with Web Audio analyser bins and Canvas rather than porting CAVA's FFTW-based native code.

Official references:

- https://github.com/karlstav/cava
- https://github.com/karlstav/cava/blob/master/CAVACORE.md
- https://github.com/karlstav/cava/blob/master/cavacore.c
- https://github.com/karlstav/cava/blob/master/example_files/config
- https://github.com/karlstav/cava/blob/master/output/shaders/bar_spectrum.frag

## Settings guide

| Section | Setting | Effect |
|---|---|---|
| General | Enabled | Pauses/resumes drawing. |
| General | Position | Anchors the overlay to a screen corner or center. |
| General | Width / Height | Controls the visualizer footprint. |
| General | Background color / opacity | Sets the translucent backing behind the bars. |
| General | Fullscreen | Spreads the visualizer across the page viewport. |
| Sensitivity | Overall sensitivity | Global signal amplification. |
| Sensitivity | Bass / Midrange / Treble | Frequency-region amplification. Bass is below 250 Hz; midrange is below 4 kHz; higher frequencies use treble gain. |
| Sensitivity | Frequency amplification | Additional multiplier applied to all bands. |
| Sensitivity | Noise threshold | Suppresses low-level input. |
| Appearance | Bars per channel | Number of logarithmically spaced bars per channel. Stereo uses twice this count across the overlay. |
| Appearance | Bar width / spacing / corner radius | Controls bar geometry. |
| Appearance | Direction | Bars grow upward or downward. |
| Appearance | Mirrored | Reflects bars around the center line. |
| Appearance | Stereo | Displays left and right channels separately when the input is stereo. |
| Appearance | Peak indicators | Shows held peak markers. |
| Gradients | Preset | Loads one of eight built-in palettes. |
| Gradients | Gradient enabled | Switches between gradient and solid-color mode. |
| Gradients | Direction | Uses vertical (height) or horizontal (bar-position) coloring. |
| Gradients | Positioning | Exposes the intended height/position mode; the gradient direction determines the Canvas interpolation axis. |
| Gradients | Intensity | Blends the preset colors toward the solid color. |
| Gradients | Color stops | Add, edit, or remove stops (2–8). |
| Animation | Smoothing | Reduces rapid changes. |
| Animation | Rise speed / Fall speed | Controls how quickly bars respond and decay. |
| Animation | Peak hold / Peak fall speed | Controls peak marker persistence and fall. |
| Animation | Animation intensity | Controls the rendered bar opacity/strength. |
| Audio | Page media | Captures a page `<audio>` or `<video>` element when browser support and origin permissions allow. |
| Audio | Local file | Analyzes a file selected by the user. |
| Audio | Microphone | Requests explicit microphone permission. |
| Audio | Pause analysis | Suspends/resumes the Web Audio context. |
| Audio | Status and frequency | Shows source state, sample rate, dominant band, and average level. |

## Architecture

- `src/core.js` — defaults, color presets, logarithmic band mapping, and frequency normalization.
- `src/audio-engine.js` — Web Audio context, analyser nodes, page media, local streams, and microphone inputs.
- `src/renderer.js` — animation smoothing, peak hold/decay, gradient rendering, and Canvas drawing.
- `src/interface.js` — Shadow DOM interface, controls, and styles mounting.
- `src/app.js` — bookmarklet lifecycle, media discovery, settings events, and cleanup.
- `src/styles.css` — namespaced Shadow DOM styles.
- `scripts/build-bookmarklet.mjs` — combines readable source into a self-contained JavaScript bundle and bookmarklet URL.

## CSP and website compatibility

The Shadow DOM prevents most style collisions with the host website, and no page globals are introduced except one non-enumerable lifecycle key used to prevent duplicate instances. A strict site Content Security Policy can still block `javascript:` bookmarklets, injected inline styles, or other injected behavior. A bookmarklet cannot reliably override those policies. The host page can also replace media elements or enforce restrictions that prevent capture.

## Testing status

`npm run build` and `npm run check` pass. The generated `javascript:` URL itself was placed in a link and clicked in headless Chromium; it injected the Shadow DOM overlay without page errors. A second run decoded the same payload and verified one-instance injection, second-click panel toggling, a generated 440 Hz page-media stream (dominant band reported at approximately 443 Hz), dynamic media discovery, local WAV-file analysis through a `MediaElementAudioSourceNode`, pause/resume, gradient-stop editing, and close-time cleanup. The microphone flow was exercised with a synthetic `MediaStream`; this verifies routing and track cleanup, but does not replace a test with a physical microphone or real browser permission prompt.

This was a browser-runtime test of the built bookmarklet payload, not a cross-browser or real-website certification. Cross-browser checks, DRM sites, restrictive-CSP pages, and real microphone permissions still need manual testing in target browsers. The build check does not prove that every browser supports media-element capture or that every site's media is readable.

## Attribution and licensing

This project is an independent browser implementation inspired by CAVA's visual behavior and configuration concepts. No CAVA source code is copied into this repository. CAVA is developed by Karl Stavestrand and is MIT-licensed: https://github.com/karlstav/cava/blob/master/LICENSE. The independent code in this project is also distributed under the MIT License; see `LICENSE`.
