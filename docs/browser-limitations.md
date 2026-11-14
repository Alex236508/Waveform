# Browser and audio-capture limitations

This project is a page-injected visualizer, not a system audio driver. It can only analyze streams the page and browser expose to JavaScript.

## Page media elements

- The Audio tab searches the current document for `<audio>` and `<video>` elements and refreshes the list when media elements are added or removed.
- It uses `HTMLMediaElement.captureStream()` or Firefox's `mozCaptureStream()` when present. MDN currently marks `captureStream()` as limited availability, so the UI detects support rather than assuming it exists.
- Same-origin policy and CORS restrictions may mute a captured cross-origin audio track. A player can play sound normally while its captured stream contains silence. DRM/protected media can also prevent access.
- Some sites route audio through their own Web Audio graphs, replace media elements dynamically, or use rendering paths that are not exposed through ordinary media elements.

## Local files

The user selects a local audio file through the file picker. The file is played by an audio element created inside the visualizer's Shadow DOM. A `MediaElementAudioSourceNode` feeds the analyser while also keeping a direct connection to the audio destination so playback stays audible. Its temporary object URL is revoked when the visualizer closes. Browser codec support still determines whether a selected file can play.

## Microphone

Microphone input uses `getUserMedia({ audio: true })`. The browser asks for permission, and the user can stop the microphone from the Audio tab. `getUserMedia()` requires a secure context, normally HTTPS or localhost.

## What is not captured

The bookmarklet does not automatically capture the entire browser tab's mixed output, other tabs, desktop/system audio, or audio from unrelated native applications. This implementation does not try to bypass browser permissions, CORS, same-origin protections, DRM, or site restrictions.

## Content Security Policy

A site can restrict `javascript:` URL execution, inline styles, injected DOM, or related behavior with its Content Security Policy. A bookmarklet cannot reliably override those restrictions. If the script itself is blocked, no in-page error message can be shown because the bookmarklet never starts.

## Browser validation

The project has been exercised in headless Chromium for DOM injection, repeated-click behavior, dynamic media discovery, media-element stream capture, local audio file capture, the microphone stream-management path (with a synthetic stream), gradient editing, pause/resume, and cleanup. A synthetic microphone stream validates the audio routing and track cleanup but does not replace testing real microphone permissions and hardware. Cross-browser checks, DRM sites, and restrictive-CSP sites still require manual testing in the target browsers.
