/* Waveform · CAVA-inspired browser visualizer. Readable source build. */

(() => {

"use strict";

const CAVA_STYLES = ":host { all: initial; position: fixed; inset: 0; z-index: 2147483647; pointer-events: none; }\n.cava-shell, .cava-shell * { box-sizing: border-box; }\n.cava-shell { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif; color: #eef2ff; line-height: 1.4; }\n.cava-canvas { position: fixed; inset: 0; z-index: 2147483640; pointer-events: none; display: block; }\n.cava-panel { position: fixed; z-index: 2147483642; top: 18px; right: 18px; width: min(390px, calc(100vw - 24px)); max-height: min(760px, calc(100vh - 36px)); display: flex; flex-direction: column; overflow: hidden; color: #eef2ff; background: rgba(13, 17, 29, .97); border: 1px solid rgba(148, 163, 184, .2); border-radius: 18px; box-shadow: 0 24px 80px rgba(0, 0, 0, .46), 0 2px 12px rgba(0, 0, 0, .2); backdrop-filter: blur(22px); transition: opacity .18s ease, transform .18s ease; pointer-events: auto; }\n.cava-panel-hidden .cava-panel { opacity: 0; transform: translateY(-8px) scale(.985); pointer-events: none; visibility: hidden; }\n.cava-fab { position: fixed; z-index: 2147483643; top: 18px; right: 18px; width: 44px; height: 44px; display: none; place-items: center; border: 1px solid rgba(143, 164, 194, .24); border-radius: 14px; background: #151c2c; color: #7cf3d1; font-family: inherit; font-size: 24px; font-weight: 700; line-height: 1; cursor: pointer; box-shadow: 0 8px 28px rgba(0, 0, 0, .32); pointer-events: auto; }\n.cava-panel-hidden .cava-fab { display: grid; }\n.cava-header { display: flex; align-items: center; justify-content: space-between; padding: 17px 18px 14px; border-bottom: 1px solid rgba(148, 163, 184, .12); }\n.cava-brand { display: flex; align-items: center; gap: 11px; }\n.cava-brand-mark { display: grid; place-items: center; width: 37px; height: 37px; border-radius: 12px; color: #06271f; background: linear-gradient(145deg, #75f7d5, #40cdb7); font-size: 27px; font-weight: 800; }\n.cava-brand strong { display: block; font-size: 12px; font-weight: 800; letter-spacing: .18em; }\n.cava-brand small { display: block; margin-top: 2px; color: #74829b; font-size: 9px; font-weight: 700; letter-spacing: .12em; }\n.cava-header-actions { display: flex; gap: 7px; }\n.cava-icon-button { width: 30px; height: 30px; border: 1px solid rgba(148, 163, 184, .15); border-radius: 9px; color: #a7b3c8; background: rgba(255,255,255,.035); font-family: inherit; font-size: 19px; font-weight: 400; line-height: 1; cursor: pointer; }\n.cava-icon-button:hover { color: #fff; background: rgba(255,255,255,.09); }\n.cava-icon-button.cava-close:hover { color: #ff9caa; border-color: rgba(248,113,113,.4); }\n.cava-status-row { display: flex; align-items: center; gap: 8px; padding: 9px 18px; color: #a5b2c7; background: rgba(255,255,255,.025); font-size: 10px; }\n.cava-status-dot { width: 7px; height: 7px; flex: 0 0 auto; border-radius: 50%; background: #6ee7b7; box-shadow: 0 0 10px rgba(110,231,183,.55); }\n.cava-status { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.cava-tabs { display: flex; gap: 3px; padding: 9px 10px 0; overflow-x: auto; scrollbar-width: none; border-bottom: 1px solid rgba(148,163,184,.12); }\n.cava-tabs::-webkit-scrollbar { display: none; }\n.cava-tabs button { flex: 0 0 auto; padding: 9px 9px 10px; border: 0; border-bottom: 2px solid transparent; color: #718099; background: transparent; font-family: inherit; font-size: 10px; font-weight: 650; line-height: 1.2; cursor: pointer; }\n.cava-tabs button:hover { color: #d7e1f2; }\n.cava-tabs button.is-active { color: #82f0d0; border-bottom-color: #49dfbd; }\n.cava-panel-body { overflow: auto; padding: 16px 18px 20px; scrollbar-width: thin; scrollbar-color: #344158 transparent; }\n.cava-page { display: none; }\n.cava-page.is-active { display: block; animation: cava-fade-in .18s ease; }\n@keyframes cava-fade-in { from { opacity: .4; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }\n.cava-section-heading { display: flex; align-items: center; justify-content: space-between; margin: 0 0 17px; }\n.cava-eyebrow { color: #5c6d87; font-size: 9px; font-weight: 800; letter-spacing: .2em; }\n.cava-section-heading h2 { margin: 3px 0 0; color: #f2f5fc; font-size: 21px; font-weight: 750; letter-spacing: -.035em; }\n.cava-section-icon { color: #5bdfc1; font-size: 25px; }\n.cava-description { margin: -5px 0 16px; color: #8796ad; font-size: 11px; line-height: 1.6; }\n.cava-control { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 42px; padding: 8px 0; border-bottom: 1px solid rgba(148,163,184,.09); color: #c4cee0; font-size: 11px; }\n.cava-control select { width: 57%; min-width: 130px; padding: 8px 9px; border: 1px solid rgba(148,163,184,.17); border-radius: 9px; outline: none; color: #e8eefb; background: #1a2334; font-family: inherit; font-size: 10px; font-weight: 600; }\n.cava-control input[type=\"color\"] { width: 47px; height: 28px; padding: 2px; border: 1px solid rgba(148,163,184,.2); border-radius: 8px; background: #202b3e; cursor: pointer; }\n.cava-toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(148,163,184,.09); cursor: pointer; }\n.cava-toggle-row strong { display: block; color: #dce5f4; font-size: 11px; font-weight: 650; }\n.cava-toggle-row small { display: block; margin-top: 2px; color: #77879f; font-size: 9px; }\n.cava-toggle-row input { position: absolute; opacity: 0; pointer-events: none; }\n.cava-toggle-row i { position: relative; width: 34px; height: 19px; flex: 0 0 auto; border-radius: 20px; background: #344155; transition: background .16s ease; }\n.cava-toggle-row i::after { content: \"\"; position: absolute; top: 3px; left: 3px; width: 13px; height: 13px; border-radius: 50%; background: #aeb9ca; transition: transform .16s ease, background .16s ease; }\n.cava-toggle-row input:checked + i { background: #1b806d; }\n.cava-toggle-row input:checked + i::after { transform: translateX(15px); background: #c2fff0; }\n.cava-toggle-row input:focus-visible + i { outline: 2px solid #62e8c7; outline-offset: 3px; }\n.cava-range-control { padding: 12px 0 10px; border-bottom: 1px solid rgba(148,163,184,.09); }\n.cava-range-control label { display: flex; justify-content: space-between; gap: 12px; color: #c4cee0; font-size: 11px; }\n.cava-range-control output { color: #69dfc2; font-variant-numeric: tabular-nums; font-weight: 700; }\n.cava-range-control input[type=\"range\"] { display: block; width: 100%; height: 18px; margin: 7px 0 0; accent-color: #54dbbc; cursor: pointer; }\n.cava-primary-button, .cava-secondary-button { width: 100%; min-height: 37px; margin-top: 12px; padding: 9px 12px; border: 1px solid rgba(91,225,193,.25); border-radius: 10px; color: #08281f; background: linear-gradient(135deg, #79f2d2, #43cdb5); font-family: inherit; font-size: 10px; font-weight: 750; cursor: pointer; transition: filter .14s ease, transform .14s ease; }\n.cava-primary-button:hover, .cava-secondary-button:hover { filter: brightness(1.08); transform: translateY(-1px); }\n.cava-secondary-button { color: #c6d4e7; border-color: rgba(148,163,184,.18); background: rgba(255,255,255,.045); }\n.cava-secondary-button:disabled { opacity: .4; cursor: not-allowed; transform: none; }\n.cava-inline-note { margin-top: 13px; padding: 10px 11px; border: 1px solid rgba(113,130,160,.15); border-radius: 10px; color: #8191a9; background: rgba(255,255,255,.025); font-size: 9px; line-height: 1.55; }\n.cava-gradient-title { display: flex; align-items: center; justify-content: space-between; margin: 17px 0 8px; color: #dae3f1; font-size: 11px; }\n.cava-text-button { padding: 5px 0 5px 8px; border: 0; color: #6de0c2; background: transparent; font-family: inherit; font-size: 10px; font-weight: 700; cursor: pointer; }\n.cava-stop-row { display: grid; grid-template-columns: 1fr 55px 27px; align-items: center; gap: 9px; padding: 6px 0; color: #98a8bf; font-size: 10px; }\n.cava-stop-row input[type=\"color\"] { width: 52px; height: 28px; padding: 2px; border: 1px solid rgba(148,163,184,.2); border-radius: 8px; background: #202b3e; cursor: pointer; }\n.cava-remove-stop { width: 26px; height: 26px; border: 1px solid rgba(148,163,184,.14); border-radius: 8px; color: #91a0b6; background: rgba(255,255,255,.035); font-size: 16px; cursor: pointer; }\n.cava-remove-stop:disabled { opacity: .25; cursor: not-allowed; }\n.cava-divider { height: 1px; margin: 17px 0 4px; background: rgba(148,163,184,.12); }\n.cava-file-control { display: block; padding: 9px 0 2px; color: #c4cee0; font-size: 11px; }\n.cava-file-control input { display: block; width: 100%; margin-top: 9px; color: #96a5bc; font-size: 10px; }\n.cava-file-control input::file-selector-button { margin-right: 9px; padding: 7px 9px; border: 1px solid rgba(148,163,184,.18); border-radius: 7px; color: #d8e5f5; background: #202b3e; cursor: pointer; }\n.cava-local-player { display: block; width: 100%; height: 34px; margin-top: 10px; filter: invert(.88) hue-rotate(160deg) saturate(.55); }\n.cava-local-player[hidden] { display: none; }\n.cava-audio-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }\n.cava-audio-actions .cava-secondary-button { margin-top: 8px; }\n.cava-audio-info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; margin-top: 15px; padding: 12px; border: 1px solid rgba(148,163,184,.12); border-radius: 11px; background: rgba(255,255,255,.025); }\n.cava-audio-info span { color: #77879f; font-size: 9px; }\n.cava-audio-info strong { overflow: hidden; color: #bfeee1; font-size: 10px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }\n.cava-footer { display: flex; justify-content: space-between; padding: 10px 18px; border-top: 1px solid rgba(148,163,184,.1); color: #596a83; font-size: 8px; font-weight: 800; letter-spacing: .1em; }\n.cava-footer i { color: #4fdbba; font-style: normal; }\n@media (max-width: 480px) {\n  .cava-panel { top: 8px; right: 8px; width: calc(100vw - 16px); max-height: calc(100vh - 16px); border-radius: 14px; }\n  .cava-header { padding: 13px 14px 11px; }\n  .cava-panel-body { padding: 13px 14px 16px; }\n  .cava-tabs { padding-left: 7px; padding-right: 7px; }\n  .cava-tabs button { padding-left: 8px; padding-right: 8px; }\n}\n";

const Cava = {};

/* Core settings, color presets, and frequency-band helpers. */
Cava.DEFAULTS = {
  enabled: true,
  position: "bottom-center",
  width: 86,
  height: 220,
  backgroundOpacity: 18,
  backgroundColor: "#080b14",
  fullscreenVisual: false,

  sensitivity: 1.55,
  bassSensitivity: 1.18,
  midSensitivity: 1.0,
  trebleSensitivity: 1.12,
  amplification: 1.15,
  noiseThreshold: 0.055,

  barCount: 48,
  barWidth: 7,
  barSpacing: 3,
  barRadius: 3,
  direction: "up",
  mirrored: false,
  stereo: true,
  peaksEnabled: true,
  peakColor: "#ffffff",
  solidColor: "#46e6c0",

  gradientPreset: "CAVA Classic",
  gradientEnabled: true,
  gradientDirection: "vertical",
  gradientPosition: "height",
  gradientIntensity: 1,
  gradientStops: ["#43f5bd", "#35b8d9", "#557ee8", "#a86de8", "#f09a8a"],

  smoothing: 0.34,
  riseSpeed: 0.78,
  fallSpeed: 0.13,
  peakHold: 430,
  peakFallSpeed: 0.58,
  animationIntensity: 1,

  lowFrequency: 38,
  highFrequency: 16000
};

Cava.PRESETS = {
  "CAVA Classic": ["#43f5bd", "#35b8d9", "#557ee8", "#a86de8", "#f09a8a"],
  Rainbow: ["#ff3b5c", "#ff9a3c", "#ffe45e", "#53e28d", "#38bdf8", "#8067f4"],
  Ocean: ["#83fff0", "#22c8d8", "#1685c8", "#164a9b"],
  Sunset: ["#ffe08a", "#ff9b54", "#fa5b72", "#a64cc5"],
  Neon: ["#36f7e7", "#4d79ff", "#a64dff", "#ff4db8"],
  Monochrome: ["#ffffff", "#b9c3d4", "#596579"],
  Fire: ["#fff36b", "#ffad32", "#f34a32", "#8f163a"],
  "Purple Haze": ["#e5b5ff", "#b56cff", "#7648d8", "#34306f"]
};

Cava.clamp = (value, min, max) => Math.min(max, Math.max(min, value));
Cava.copyDefaults = () => JSON.parse(JSON.stringify(Cava.DEFAULTS));

Cava.createFrequencyBands = function (frequencyBinCount, sampleRate, barCount, lowHz, highHz) {
  const bands = new Array(barCount);
  const binHz = sampleRate / (frequencyBinCount * 2);
  const nyquist = sampleRate / 2;
  const low = Cava.clamp(lowHz, binHz, nyquist - binHz);
  const high = Cava.clamp(highHz, low + binHz, nyquist);
  const ratio = high / low;

  for (let index = 0; index < barCount; index += 1) {
    const startHz = low * Math.pow(ratio, index / barCount);
    const endHz = low * Math.pow(ratio, (index + 1) / barCount);
    const startBin = Cava.clamp(Math.floor(startHz / binHz), 1, frequencyBinCount - 1);
    const endBin = Cava.clamp(Math.max(startBin + 1, Math.ceil(endHz / binHz)), startBin + 1, frequencyBinCount);
    bands[index] = {
      startBin,
      endBin,
      centerHz: Math.sqrt(startHz * endHz)
    };
  }
  return bands;
};

Cava.readBandLevel = function (frequencyData, band, minDb, maxDb) {
  let power = 0;
  let count = 0;
  for (let bin = band.startBin; bin < band.endBin; bin += 1) {
    // getByteFrequencyData() stores dB values mapped to the analyser's byte range.
    const db = minDb + (frequencyData[bin] / 255) * (maxDb - minDb);
    const amplitude = Math.pow(10, db / 20);
    power += amplitude * amplitude;
    count += 1;
  }
  if (!count) return 0;

  // Average band energy in the amplitude domain, then normalize back into 0..1.
  const rms = Math.sqrt(power / count);
  const rmsDb = 20 * Math.log10(Math.max(rms, 1e-12));
  return Cava.clamp((rmsDb - minDb) / (maxDb - minDb), 0, 1);
};

Cava.formatFrequency = function (frequency) {
  if (!Number.isFinite(frequency) || frequency <= 0) return "—";
  if (frequency >= 1000) return `${(frequency / 1000).toFixed(frequency >= 10000 ? 1 : 2)} kHz`;
  return `${Math.round(frequency)} Hz`;
};


/* Browser audio inputs and Web Audio analysis. */
Cava.AudioEngine = class AudioEngine {
  constructor(onStatus) {
    this.onStatus = onStatus;
    this.context = null;
    this.source = null;
    this.splitter = null;
    this.leftAnalyser = null;
    this.rightAnalyser = null;
    this.leftData = null;
    this.rightData = null;
    this.stream = null;
    this.ownedTracks = [];
    this.mediaElementSources = new WeakMap();
    this.keepSourceAudible = false;
    this.isStereo = false;
    this.sourceLabel = "No source";
    this.minDb = -90;
    this.maxDb = -18;
  }

  ensureContext() {
    if (this.context) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) throw new Error("This browser does not support the Web Audio API.");

    this.context = new AudioContextClass({ latencyHint: "interactive" });
    this.leftAnalyser = this.context.createAnalyser();
    this.rightAnalyser = this.context.createAnalyser();
    for (const analyser of [this.leftAnalyser, this.rightAnalyser]) {
      analyser.fftSize = 8192;
      analyser.minDecibels = this.minDb;
      analyser.maxDecibels = this.maxDb;
      analyser.smoothingTimeConstant = 0;
    }
    this.leftData = new Uint8Array(this.leftAnalyser.frequencyBinCount);
    this.rightData = new Uint8Array(this.rightAnalyser.frequencyBinCount);
  }

  async resume() {
    this.ensureContext();
    if (this.context.state === "suspended") await this.context.resume();
    if (this.context.state === "closed") throw new Error("The audio context has been closed. Reconnect the source.");
  }

  async connectStream(stream, label, options = {}) {
    if (!stream || stream.getAudioTracks().length === 0) {
      throw new Error("No audio track was found in this source.");
    }

    this.ensureContext();
    this.disconnectSource(false);

    this.stream = stream;
    this.source = this.context.createMediaStreamSource(stream);
    const track = stream.getAudioTracks()[0];
    const trackSettings = track.getSettings ? track.getSettings() : {};
    this.isStereo = trackSettings.channelCount == null ? true : Number(trackSettings.channelCount) > 1;

    if (this.isStereo) {
      this.splitter = this.context.createChannelSplitter(2);
      this.source.connect(this.splitter);
      this.splitter.connect(this.leftAnalyser, 0);
      this.splitter.connect(this.rightAnalyser, 1);
    } else {
      this.source.connect(this.leftAnalyser);
    }

    this.sourceLabel = label;
    if (options.ownedTracks) this.ownedTracks = options.ownedTracks;
    await this.resume();
    this.onStatus(`Connected · ${label}`);
  }


  async connectLocalMediaElement(mediaElement) {
    this.ensureContext();
    this.disconnectSource(false);

    let mediaSource = this.mediaElementSources.get(mediaElement);
    if (!mediaSource) {
      try {
        mediaSource = this.context.createMediaElementSource(mediaElement);
      } catch (error) {
        throw new Error(`The selected local audio file could not be connected to Web Audio: ${error.message}`);
      }
      this.mediaElementSources.set(mediaElement, mediaSource);
    }

    // This is our own hidden-player element, so route it through Web Audio and
    // keep a direct destination connection to preserve audible playback.
    mediaSource.disconnect();
    mediaSource.connect(this.context.destination);
    this.source = mediaSource;
    this.keepSourceAudible = true;
    this.splitter = this.context.createChannelSplitter(2);
    mediaSource.connect(this.splitter);
    this.splitter.connect(this.leftAnalyser, 0);
    this.splitter.connect(this.rightAnalyser, 1);
    this.isStereo = true;
    this.sourceLabel = "Local audio file";

    await this.resume();
    this.onStatus("Connected · Local audio file");
  }

  async connectMediaElement(mediaElement) {
    const capture = mediaElement.captureStream || mediaElement.mozCaptureStream;
    if (typeof capture !== "function") {
      throw new Error("This browser does not support captureStream() on media elements. Try a local file or microphone instead.");
    }

    let stream;
    try {
      stream = capture.call(mediaElement);
    } catch (error) {
      throw new Error(`The page media could not be captured: ${error.message}`);
    }

    let hostName = "page media";
    try {
      if (mediaElement.currentSrc) hostName = new URL(mediaElement.currentSrc, location.href).hostname || hostName;
    } catch (_) { /* keep the generic media label */ }
    const label = `${mediaElement.tagName.toLowerCase()} · ${hostName}`;
    await this.connectStream(stream, label);

    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack && audioTrack.muted) {
      this.onStatus("Connected, but the browser reports this media track as muted. CORS or protected media may be blocking analysis.");
    }
  }

  async connectMicrophone() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Microphone capture is unavailable. Use a secure HTTPS page and a supported browser.");
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      video: false
    });
    try {
      await this.connectStream(stream, "Microphone", { ownedTracks: stream.getTracks() });
    } catch (error) {
      stream.getTracks().forEach(track => track.stop());
      throw error;
    }
  }

  readFrequencyData() {
    if (!this.leftAnalyser || !this.leftData) return false;
    this.leftAnalyser.getByteFrequencyData(this.leftData);
    if (this.isStereo && this.rightAnalyser && this.rightData) {
      this.rightAnalyser.getByteFrequencyData(this.rightData);
    } else if (this.rightData !== this.leftData) {
      this.rightData.set(this.leftData);
    }
    return true;
  }

  async toggleAnalysis() {
    if (!this.context) throw new Error("Connect an audio source first.");
    if (this.context.state === "suspended") await this.context.resume();
    else await this.context.suspend();
    this.onStatus(this.context.state === "running" ? `Analyzing · ${this.sourceLabel}` : "Analysis paused");
  }

  disconnectSource(closeContext = false) {
    const previousSource = this.source;
    try { previousSource && previousSource.disconnect(); } catch (_) { /* already disconnected */ }
    try { this.splitter && this.splitter.disconnect(); } catch (_) { /* already disconnected */ }
    if (this.keepSourceAudible && previousSource && !closeContext && this.context && this.context.state !== "closed") {
      try { previousSource.connect(this.context.destination); } catch (_) { /* context may be closing */ }
    }
    this.keepSourceAudible = false;
    this.ownedTracks.forEach(track => track.stop());
    this.ownedTracks = [];
    this.source = null;
    this.splitter = null;
    this.stream = null;
    this.sourceLabel = "No source";
    this.isStereo = false;

    if (closeContext && this.context) {
      const context = this.context;
      this.context = null;
      this.leftAnalyser = null;
      this.rightAnalyser = null;
      this.leftData = null;
      this.rightData = null;
      context.close().catch(() => {});
    }
  }

  async dispose() {
    this.disconnectSource(true);
    this.onStatus("Disconnected");
  }

  getInfo() {
    return {
      sampleRate: this.context ? this.context.sampleRate : 0,
      state: this.context ? this.context.state : "not-connected",
      source: this.sourceLabel,
      stereo: this.isStereo
    };
  }
};


/* Canvas spectrum rendering and CAVA-style bar dynamics. */
Cava.Visualizer = class Visualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d", { alpha: true, desynchronized: true });
    this.pixelRatio = 1;
    this.viewportWidth = 0;
    this.viewportHeight = 0;
    this.bands = [];
    this.bandCount = 0;
    this.levelsLeft = new Float32Array(0);
    this.levelsRight = new Float32Array(0);
    this.peaksLeft = new Float32Array(0);
    this.peaksRight = new Float32Array(0);
    this.peakTimesLeft = new Float64Array(0);
    this.peakTimesRight = new Float64Array(0);
    this.gradientKey = "";
    this.gradient = null;
    this.lastDominantFrequency = 0;
    this.lastAverageLevel = 0;
  }

  resize() {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    if (width === this.viewportWidth && height === this.viewportHeight && ratio === this.pixelRatio) return;

    this.viewportWidth = width;
    this.viewportHeight = height;
    this.pixelRatio = ratio;
    this.canvas.width = Math.round(width * ratio);
    this.canvas.height = Math.round(height * ratio);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.gradientKey = "";
  }

  ensureBuffers(settings, engine) {
    if (!engine.leftData || !engine.context) return;
    if (this.bandCount === settings.barCount && this.bands.length && this.sampleRate === engine.context.sampleRate) return;

    this.bandCount = settings.barCount;
    this.sampleRate = engine.context.sampleRate;
    this.bands = Cava.createFrequencyBands(
      engine.leftAnalyser.frequencyBinCount,
      engine.context.sampleRate,
      settings.barCount,
      settings.lowFrequency,
      settings.highFrequency
    );
    this.levelsLeft = new Float32Array(settings.barCount);
    this.levelsRight = new Float32Array(settings.barCount);
    this.peaksLeft = new Float32Array(settings.barCount);
    this.peaksRight = new Float32Array(settings.barCount);
    this.peakTimesLeft = new Float64Array(settings.barCount);
    this.peakTimesRight = new Float64Array(settings.barCount);
    this.gradientKey = "";
  }

  updateLevels(settings, engine, deltaSeconds, now) {
    engine.readFrequencyData();
    let maxLevel = 0;
    let dominantIndex = 0;
    const smoothingFactor = 1 - settings.smoothing * 0.88;
    const rise = Cava.clamp(settings.riseSpeed * smoothingFactor, 0.015, 1);
    const fall = Cava.clamp(settings.fallSpeed * smoothingFactor, 0.004, 1);
    const dtScale = Math.min(deltaSeconds * 60, 3);
    const riseAlpha = 1 - Math.pow(1 - rise, dtScale);
    const fallAlpha = 1 - Math.pow(1 - fall, dtScale);
    const sensitivityBase = settings.sensitivity * settings.amplification;
    let sum = 0;

    for (let index = 0; index < this.bandCount; index += 1) {
      const band = this.bands[index];
      let left = Cava.readBandLevel(engine.leftData, band, engine.minDb, engine.maxDb);
      let right = engine.isStereo
        ? Cava.readBandLevel(engine.rightData, band, engine.minDb, engine.maxDb)
        : left;
      const center = band.centerHz;
      const bandSensitivity = center < 250
        ? settings.bassSensitivity
        : center < 4000 ? settings.midSensitivity : settings.trebleSensitivity;
      const gain = sensitivityBase * bandSensitivity;
      const threshold = settings.noiseThreshold;

      left = left <= threshold ? 0 : Math.pow((left - threshold) / (1 - threshold), 0.82) * gain;
      right = right <= threshold ? 0 : Math.pow((right - threshold) / (1 - threshold), 0.82) * gain;
      left = Cava.clamp(left, 0, 1.4);
      right = Cava.clamp(right, 0, 1.4);

      const currentLeft = this.levelsLeft[index];
      const currentRight = this.levelsRight[index];
      this.levelsLeft[index] = currentLeft + (left - currentLeft) * (left > currentLeft ? riseAlpha : fallAlpha);
      this.levelsRight[index] = currentRight + (right - currentRight) * (right > currentRight ? riseAlpha : fallAlpha);

      if (settings.peaksEnabled) {
        this.updatePeak(index, this.levelsLeft[index], this.peaksLeft, this.peakTimesLeft, now, settings, deltaSeconds);
        this.updatePeak(index, this.levelsRight[index], this.peaksRight, this.peakTimesRight, now, settings, deltaSeconds);
      }

      const combined = engine.isStereo ? Math.max(this.levelsLeft[index], this.levelsRight[index]) : this.levelsLeft[index];
      sum += combined;
      if (combined > maxLevel) {
        maxLevel = combined;
        dominantIndex = index;
      }
    }

    this.lastAverageLevel = this.bandCount ? sum / this.bandCount : 0;
    this.lastDominantFrequency = maxLevel > 0.015 ? this.bands[dominantIndex].centerHz : 0;
  }

  updatePeak(index, level, peaks, times, now, settings, deltaSeconds) {
    if (level >= peaks[index]) {
      peaks[index] = level;
      times[index] = now;
      return;
    }
    if (now - times[index] > settings.peakHold) {
      peaks[index] = Math.max(level, peaks[index] - settings.peakFallSpeed * deltaSeconds);
    }
  }

  getBounds(settings) {
    if (settings.fullscreenVisual) {
      return { x: 0, y: 0, width: this.viewportWidth, height: this.viewportHeight };
    }

    const width = this.viewportWidth * settings.width / 100;
    const height = Math.min(settings.height, this.viewportHeight * 0.92);
    let x = (this.viewportWidth - width) / 2;
    let y = this.viewportHeight - height - 24;
    const position = settings.position;

    if (position.endsWith("left")) x = 18;
    if (position.endsWith("right")) x = this.viewportWidth - width - 18;
    if (position.startsWith("top")) y = 20;
    if (position.startsWith("middle")) y = (this.viewportHeight - height) / 2;
    return { x, y, width, height };
  }

  buildGradient(settings, bounds) {
    const key = [settings.gradientEnabled, settings.gradientDirection, settings.gradientPosition, settings.gradientIntensity,
      settings.solidColor, settings.gradientStops.join(","), Math.round(bounds.x), Math.round(bounds.y),
      Math.round(bounds.width), Math.round(bounds.height)].join("|");
    if (this.gradientKey === key) return this.gradient;

    this.gradientKey = key;
    if (!settings.gradientEnabled || settings.gradientStops.length < 2) {
      this.gradient = settings.solidColor;
      return this.gradient;
    }

    const gradientRunsAcrossBars = settings.gradientPosition === "bars" || settings.gradientDirection === "horizontal";
    const gradient = gradientRunsAcrossBars
      ? this.context.createLinearGradient(bounds.x, bounds.y, bounds.x + bounds.width, bounds.y)
      : this.context.createLinearGradient(bounds.x, bounds.y + bounds.height, bounds.x, bounds.y);

    const intensity = Cava.clamp(settings.gradientIntensity, 0, 1);
    settings.gradientStops.forEach((color, index) => {
      const position = index / (settings.gradientStops.length - 1);
      gradient.addColorStop(position, this.mixColors(settings.solidColor, color, intensity));
    });
    this.gradient = gradient;
    return gradient;
  }

  mixColors(base, color, amount) {
    const toRgb = hex => {
      const value = hex.replace("#", "");
      return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)];
    };
    const a = toRgb(base);
    const b = toRgb(color);
    const mixed = a.map((value, index) => Math.round(value + (b[index] - value) * amount));
    return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
  }

  render(settings, engine, deltaSeconds, now) {
    this.resize();
    const context = this.context;
    const width = this.viewportWidth;
    const height = this.viewportHeight;
    context.clearRect(0, 0, width, height);
    if (!settings.enabled) return;

    this.ensureBuffers(settings, engine);
    if (engine.leftData && engine.context && engine.context.state === "running") {
      this.updateLevels(settings, engine, deltaSeconds, now);
    } else {
      this.lastAverageLevel *= 0.96;
    }

    const bounds = this.getBounds(settings);
    const radius = settings.fullscreenVisual ? 0 : 18;
    if (settings.backgroundOpacity > 0) {
      context.save();
      context.globalAlpha = Cava.clamp(settings.backgroundOpacity, 0, 100) / 100;
      context.fillStyle = settings.backgroundColor;
      this.roundedRect(context, bounds.x, bounds.y, bounds.width, bounds.height, radius);
      context.fill();
      context.restore();
    }

    const fill = this.buildGradient(settings, bounds);
    context.save();
    context.globalAlpha = Cava.clamp(settings.animationIntensity, 0, 2) / 1.4;
    context.fillStyle = fill;
    context.strokeStyle = fill;

    const stereo = settings.stereo && engine.isStereo;
    const totalBars = stereo ? this.bandCount * 2 : this.bandCount;
    const slot = bounds.width / totalBars;
    const gap = Math.max(0, settings.barSpacing);
    const barWidth = Math.max(1, Math.min(settings.barWidth, slot - gap));
    const contentPadding = settings.fullscreenVisual ? 12 : 12;
    const top = bounds.y + contentPadding;
    const usableHeight = Math.max(4, bounds.height - contentPadding * 2);
    const baseline = settings.mirrored ? bounds.y + bounds.height / 2 : (settings.direction === "down" ? top : bounds.y + bounds.height - contentPadding);
    const maxBarHeight = settings.mirrored ? usableHeight / 2 : usableHeight;

    for (let visualIndex = 0; visualIndex < totalBars; visualIndex += 1) {
      let sourceIndex;
      let level;
      let peak;
      if (stereo && visualIndex < this.bandCount) {
        // Low frequencies meet in the center, matching CAVA's stereo convention.
        sourceIndex = this.bandCount - 1 - visualIndex;
        level = this.levelsLeft[sourceIndex];
        peak = this.peaksLeft[sourceIndex];
      } else if (stereo) {
        sourceIndex = visualIndex - this.bandCount;
        level = this.levelsRight[sourceIndex];
        peak = this.peaksRight[sourceIndex];
      } else {
        sourceIndex = visualIndex;
        level = settings.stereo ? (this.levelsLeft[sourceIndex] + this.levelsRight[sourceIndex]) / 2 : this.levelsLeft[sourceIndex];
        peak = Math.max(this.peaksLeft[sourceIndex], this.peaksRight[sourceIndex]);
      }

      const x = bounds.x + visualIndex * slot + (slot - barWidth) / 2;
      const h = Math.max(1.5, Math.min(maxBarHeight, level * maxBarHeight));
      const r = Math.min(settings.barRadius, barWidth / 2, h / 2);
      let barY;
      if (settings.mirrored) barY = baseline - h;
      else barY = settings.direction === "down" ? baseline : baseline - h;

      this.roundedRect(context, x, barY, barWidth, h, r);
      context.fill();
      if (settings.mirrored) {
        this.roundedRect(context, x, baseline, barWidth, h, r);
        context.fill();
      }

      if (settings.peaksEnabled && peak > 0.015) {
        context.fillStyle = settings.peakColor;
        const peakY = settings.mirrored ? baseline - Math.min(maxBarHeight, peak * maxBarHeight) - 1 :
          settings.direction === "down" ? baseline + Math.min(maxBarHeight, peak * maxBarHeight) - 2 :
            baseline - Math.min(maxBarHeight, peak * maxBarHeight) - 2;
        this.roundedRect(context, x, peakY, barWidth, 2.5, 1.2);
        context.fill();
        if (settings.mirrored) {
          this.roundedRect(context, x, baseline + Math.min(maxBarHeight, peak * maxBarHeight) - 1, barWidth, 2.5, 1.2);
          context.fill();
        }
        context.fillStyle = fill;
      }
    }
    context.restore();
  }

  roundedRect(context, x, y, width, height, radius) {
    context.beginPath();
    if (context.roundRect) context.roundRect(x, y, width, height, radius);
    else context.rect(x, y, width, height);
  }

  clear() {
    this.context.clearRect(0, 0, this.viewportWidth, this.viewportHeight);
  }
};


/* Shadow-DOM UI creation and control synchronization. */
Cava.createInterface = function () {
  const host = document.createElement("div");
  host.id = "cava-browser-visualizer-host";
  host.setAttribute("aria-label", "CAVA-inspired audio visualizer");
  (document.documentElement || document.body).appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = CAVA_STYLES;
  shadow.appendChild(style);

  const shell = document.createElement("div");
  shell.className = "cava-shell";
  shell.innerHTML = `
    <canvas class="cava-canvas" aria-label="Live audio spectrum"></canvas>
    <button class="cava-fab" type="button" data-action="toggle-panel" aria-label="Open visualizer settings" title="Visualizer settings">≋</button>
    <section class="cava-panel" aria-label="Visualizer settings">
      <header class="cava-header">
        <div class="cava-brand"><span class="cava-brand-mark">≈</span><div><strong>WAVEFORM</strong><small>BROWSER AUDIO VISUALIZER</small></div></div>
        <div class="cava-header-actions">
          <button class="cava-icon-button" type="button" data-action="hide-panel" title="Hide settings" aria-label="Hide settings">−</button>
          <button class="cava-icon-button cava-close" type="button" data-action="close" title="Close visualizer" aria-label="Close visualizer">×</button>
        </div>
      </header>
      <div class="cava-status-row"><span class="cava-status-dot"></span><span class="cava-status" id="cava-status">Looking for webpage audio…</span></div>
      <nav class="cava-tabs" aria-label="Settings sections">
        <button type="button" class="is-active" data-tab="general">General</button>
        <button type="button" data-tab="sensitivity">Sensitivity</button>
        <button type="button" data-tab="appearance">Appearance</button>
        <button type="button" data-tab="gradients">Gradients</button>
        <button type="button" data-tab="animation">Animation</button>
        <button type="button" data-tab="audio">Audio</button>
      </nav>
      <div class="cava-panel-body">
        <div class="cava-page is-active" data-page="general">
          <div class="cava-section-heading"><div><span class="cava-eyebrow">DISPLAY</span><h2>General</h2></div><span class="cava-section-icon">◫</span></div>
          <label class="cava-toggle-row"><span><strong>Visualizer enabled</strong><small>Show or pause the spectrum overlay</small></span><input type="checkbox" data-setting="enabled" checked><i></i></label>
          <label class="cava-control"><span>Position</span><select data-setting="position"><option value="bottom-center">Bottom · Center</option><option value="top-center">Top · Center</option><option value="middle-center">Middle · Center</option><option value="bottom-left">Bottom · Left</option><option value="bottom-right">Bottom · Right</option><option value="top-left">Top · Left</option><option value="top-right">Top · Right</option></select></label>
          <div class="cava-range-control"><label for="cava-width">Width <output data-output="width">86%</output></label><input id="cava-width" type="range" min="20" max="100" step="1" data-setting="width"></div>
          <div class="cava-range-control"><label for="cava-height">Height <output data-output="height">220 px</output></label><input id="cava-height" type="range" min="80" max="600" step="5" data-setting="height"></div>
          <div class="cava-range-control"><label for="cava-bg-opacity">Background opacity <output data-output="backgroundOpacity">18%</output></label><input id="cava-bg-opacity" type="range" min="0" max="100" step="1" data-setting="backgroundOpacity"></div>
          <label class="cava-control"><span>Background color</span><input type="color" data-setting="backgroundColor"></label>
          <label class="cava-toggle-row"><span><strong>Fullscreen visualization</strong><small>Expand bars to the entire webpage</small></span><input type="checkbox" data-setting="fullscreenVisual"><i></i></label>
          <button class="cava-secondary-button" type="button" data-action="reset">Reset all settings</button>
        </div>

        <div class="cava-page" data-page="sensitivity">
          <div class="cava-section-heading"><div><span class="cava-eyebrow">INPUT RESPONSE</span><h2>Sensitivity</h2></div><span class="cava-section-icon">⌁</span></div>
          <p class="cava-description">Tune how strongly each part of the spectrum reacts to the incoming signal.</p>
          <div class="cava-range-control"><label for="cava-sensitivity">Overall sensitivity <output data-output="sensitivity">1.55×</output></label><input id="cava-sensitivity" type="range" min="0.3" max="4" step="0.05" data-setting="sensitivity"></div>
          <div class="cava-range-control"><label for="cava-bass">Bass sensitivity <output data-output="bassSensitivity">1.18×</output></label><input id="cava-bass" type="range" min="0.2" max="3" step="0.05" data-setting="bassSensitivity"></div>
          <div class="cava-range-control"><label for="cava-mid">Midrange sensitivity <output data-output="midSensitivity">1.00×</output></label><input id="cava-mid" type="range" min="0.2" max="3" step="0.05" data-setting="midSensitivity"></div>
          <div class="cava-range-control"><label for="cava-treble">Treble sensitivity <output data-output="trebleSensitivity">1.12×</output></label><input id="cava-treble" type="range" min="0.2" max="3" step="0.05" data-setting="trebleSensitivity"></div>
          <div class="cava-range-control"><label for="cava-amp">Frequency amplification <output data-output="amplification">1.15×</output></label><input id="cava-amp" type="range" min="0.2" max="3.5" step="0.05" data-setting="amplification"></div>
          <div class="cava-range-control"><label for="cava-noise">Noise threshold <output data-output="noiseThreshold">0.055</output></label><input id="cava-noise" type="range" min="0" max="0.35" step="0.005" data-setting="noiseThreshold"></div>
          <div class="cava-inline-note">Tip: raise the noise threshold if idle bars remain visible. Lower it to reveal quieter sounds.</div>
        </div>

        <div class="cava-page" data-page="appearance">
          <div class="cava-section-heading"><div><span class="cava-eyebrow">SPECTRUM SHAPE</span><h2>Appearance</h2></div><span class="cava-section-icon">▥</span></div>
          <div class="cava-range-control"><label for="cava-bars">Bars per channel <output data-output="barCount">48</output></label><input id="cava-bars" type="range" min="8" max="128" step="1" data-setting="barCount"></div>
          <div class="cava-range-control"><label for="cava-bar-width">Bar width <output data-output="barWidth">7 px</output></label><input id="cava-bar-width" type="range" min="1" max="24" step="1" data-setting="barWidth"></div>
          <div class="cava-range-control"><label for="cava-spacing">Bar spacing <output data-output="barSpacing">3 px</output></label><input id="cava-spacing" type="range" min="0" max="18" step="1" data-setting="barSpacing"></div>
          <div class="cava-range-control"><label for="cava-radius">Corner radius <output data-output="barRadius">3 px</output></label><input id="cava-radius" type="range" min="0" max="12" step="1" data-setting="barRadius"></div>
          <label class="cava-control"><span>Bar direction</span><select data-setting="direction"><option value="up">Up</option><option value="down">Down</option></select></label>
          <label class="cava-toggle-row"><span><strong>Mirrored bars</strong><small>Reflect bars above and below center</small></span><input type="checkbox" data-setting="mirrored"><i></i></label>
          <label class="cava-toggle-row"><span><strong>Stereo layout</strong><small>Separate left and right channels</small></span><input type="checkbox" data-setting="stereo" checked><i></i></label>
          <label class="cava-toggle-row"><span><strong>Peak indicators</strong><small>Show short-lived level markers</small></span><input type="checkbox" data-setting="peaksEnabled" checked><i></i></label>
          <label class="cava-control"><span>Peak color</span><input type="color" data-setting="peakColor"></label>
          <label class="cava-control"><span>Solid bar color</span><input type="color" data-setting="solidColor"></label>
        </div>

        <div class="cava-page" data-page="gradients">
          <div class="cava-section-heading"><div><span class="cava-eyebrow">COLOR DESIGN</span><h2>Gradients</h2></div><span class="cava-section-icon">◈</span></div>
          <label class="cava-control"><span>Preset</span><select id="cava-preset"><option>CAVA Classic</option><option>Rainbow</option><option>Ocean</option><option>Sunset</option><option>Neon</option><option>Monochrome</option><option>Fire</option><option>Purple Haze</option><option value="Custom">Custom</option></select></label>
          <label class="cava-toggle-row"><span><strong>Use gradient</strong><small>Turn off for solid-color bars</small></span><input type="checkbox" data-setting="gradientEnabled" checked><i></i></label>
          <label class="cava-control"><span>Gradient direction</span><select data-setting="gradientDirection"><option value="vertical">Bottom to top</option><option value="horizontal">Left to right</option></select></label>
          <label class="cava-control"><span>Gradient positioning</span><select data-setting="gradientPosition"><option value="height">By bar height</option><option value="bars">By bar position</option></select></label>
          <div class="cava-range-control"><label for="cava-gradient-intensity">Gradient intensity <output data-output="gradientIntensity">100%</output></label><input id="cava-gradient-intensity" type="range" min="0" max="1" step="0.05" data-setting="gradientIntensity"></div>
          <div class="cava-gradient-title"><strong>Gradient color stops</strong><button class="cava-text-button" type="button" data-action="add-stop">+ Add stop</button></div>
          <div class="cava-gradient-stops" id="cava-gradient-stops"></div>
          <div class="cava-inline-note">The first stop is the low end of the gradient; the last stop is the high end. Up to eight stops are supported.</div>
        </div>

        <div class="cava-page" data-page="animation">
          <div class="cava-section-heading"><div><span class="cava-eyebrow">MOTION & DECAY</span><h2>Animation</h2></div><span class="cava-section-icon">⌁</span></div>
          <div class="cava-range-control"><label for="cava-smoothing">Smoothing <output data-output="smoothing">0.34</output></label><input id="cava-smoothing" type="range" min="0" max="0.95" step="0.01" data-setting="smoothing"></div>
          <div class="cava-range-control"><label for="cava-rise">Bar rise speed <output data-output="riseSpeed">0.78</output></label><input id="cava-rise" type="range" min="0.05" max="1" step="0.01" data-setting="riseSpeed"></div>
          <div class="cava-range-control"><label for="cava-fall">Bar fall speed <output data-output="fallSpeed">0.13</output></label><input id="cava-fall" type="range" min="0.01" max="0.6" step="0.01" data-setting="fallSpeed"></div>
          <div class="cava-range-control"><label for="cava-peak-hold">Peak hold <output data-output="peakHold">430 ms</output></label><input id="cava-peak-hold" type="range" min="0" max="2000" step="25" data-setting="peakHold"></div>
          <div class="cava-range-control"><label for="cava-peak-fall">Peak fall speed <output data-output="peakFallSpeed">0.58</output></label><input id="cava-peak-fall" type="range" min="0.05" max="2" step="0.05" data-setting="peakFallSpeed"></div>
          <div class="cava-range-control"><label for="cava-intensity">Animation intensity <output data-output="animationIntensity">1.00×</output></label><input id="cava-intensity" type="range" min="0.2" max="2" step="0.05" data-setting="animationIntensity"></div>
        </div>

        <div class="cava-page" data-page="audio">
          <div class="cava-section-heading"><div><span class="cava-eyebrow">INPUT & PERMISSIONS</span><h2>Audio</h2></div><span class="cava-section-icon">♫</span></div>
          <p class="cava-description">Choose one source. Page media capture is browser-dependent; protected or cross-origin audio may appear silent.</p>
          <label class="cava-control"><span>Page audio/video element</span><select id="cava-media-select"><option value="auto">Auto-detect playing media</option></select></label>
          <button class="cava-primary-button" type="button" data-action="connect-media">Connect page media</button>
          <div class="cava-divider"></div>
          <label class="cava-file-control"><span>Local audio file</span><input id="cava-file-input" type="file" accept="audio/*"></label>
          <audio id="cava-local-player" class="cava-local-player" controls hidden></audio>
          <button class="cava-secondary-button" type="button" data-action="connect-file" disabled>Analyze local file</button>
          <div class="cava-divider"></div>
          <div class="cava-audio-actions"><button class="cava-secondary-button" type="button" data-action="toggle-mic">Enable microphone</button><button class="cava-secondary-button" type="button" data-action="toggle-analysis">Pause analysis</button></div>
          <div class="cava-audio-info"><span>Audio context</span><strong id="cava-audio-context">Not connected</strong><span>Sample rate</span><strong id="cava-sample-rate">—</strong><span>Dominant band</span><strong id="cava-dominant-frequency">—</strong><span>Average level</span><strong id="cava-average-level">—</strong></div>
          <div class="cava-inline-note">Microphone access requires HTTPS (or localhost) and your permission. This bookmarklet cannot capture all browser-tab or system audio automatically.</div>
        </div>
      </div>
      <footer class="cava-footer"><span>WAVEFORM <i>·</i> CAVA-inspired</span><span>ESC to hide</span></footer>
    </section>
  `;
  shadow.appendChild(shell);

  return {
    host,
    shadow,
    shell,
    canvas: shadow.querySelector(".cava-canvas"),
    panel: shadow.querySelector(".cava-panel"),
    fab: shadow.querySelector(".cava-fab"),
    status: shadow.querySelector("#cava-status"),
    mediaSelect: shadow.querySelector("#cava-media-select"),
    fileInput: shadow.querySelector("#cava-file-input"),
    localPlayer: shadow.querySelector("#cava-local-player"),
    audioContextStatus: shadow.querySelector("#cava-audio-context"),
    sampleRate: shadow.querySelector("#cava-sample-rate"),
    dominantFrequency: shadow.querySelector("#cava-dominant-frequency"),
    averageLevel: shadow.querySelector("#cava-average-level"),
    gradientStops: shadow.querySelector("#cava-gradient-stops"),
    connectFileButton: shadow.querySelector('[data-action="connect-file"]'),
    syncControls: settings => Cava.syncControls(shadow, settings),
    setStatus: message => { shadow.querySelector("#cava-status").textContent = message; },
    setPanelVisible: visible => {
      shell.classList.toggle("cava-panel-hidden", !visible);
      if (visible) shadow.querySelector('[data-action="toggle-panel"]').focus({ preventScroll: true });
    }
  };
};

Cava.syncControls = function (shadow, settings) {
  shadow.querySelectorAll("[data-setting]").forEach(control => {
    const key = control.dataset.setting;
    if (control.type === "checkbox") control.checked = Boolean(settings[key]);
    else control.value = settings[key];
  });

  shadow.querySelectorAll("[data-output]").forEach(output => {
    const key = output.dataset.output;
    const value = settings[key];
    let formatted = String(value);
    if (["width", "backgroundOpacity", "gradientIntensity"].includes(key)) formatted = `${Math.round(Number(value) * (key === "gradientIntensity" ? 100 : 1))}%`;
    else if (key === "height" || key === "barWidth" || key === "barSpacing" || key === "barRadius") formatted = `${value} px`;
    else if (key === "peakHold") formatted = `${value} ms`;
    else if (["sensitivity", "bassSensitivity", "midSensitivity", "trebleSensitivity", "amplification", "animationIntensity"].includes(key)) formatted = `${Number(value).toFixed(2)}×`;
    else if (["smoothing", "riseSpeed", "fallSpeed", "peakFallSpeed", "noiseThreshold"].includes(key)) formatted = Number(value).toFixed(key === "noiseThreshold" ? 3 : 2);
    output.textContent = formatted;
  });

  const preset = shadow.querySelector("#cava-preset");
  preset.value = settings.gradientPreset;
  Cava.renderGradientStops(shadow, settings);
};

Cava.renderGradientStops = function (shadow, settings) {
  const container = shadow.querySelector("#cava-gradient-stops");
  container.replaceChildren();
  settings.gradientStops.forEach((color, index) => {
    const row = document.createElement("div");
    row.className = "cava-stop-row";
    const label = document.createElement("span");
    label.textContent = index === 0 ? "Start" : index === settings.gradientStops.length - 1 ? "End" : `Stop ${index + 1}`;
    const input = document.createElement("input");
    input.type = "color";
    input.value = color;
    input.dataset.stopIndex = String(index);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "cava-remove-stop";
    remove.dataset.action = "remove-stop";
    remove.dataset.stopIndex = String(index);
    remove.textContent = "×";
    remove.disabled = settings.gradientStops.length <= 2;
    remove.setAttribute("aria-label", `Remove color stop ${index + 1}`);
    row.append(label, input, remove);
    container.appendChild(row);
  });
};

Cava.setActiveTab = function (shadow, tabName) {
  shadow.querySelectorAll("[data-tab]").forEach(button => button.classList.toggle("is-active", button.dataset.tab === tabName));
  shadow.querySelectorAll("[data-page]").forEach(page => page.classList.toggle("is-active", page.dataset.page === tabName));
};


/* Bookmarklet lifecycle, page-media discovery, and UI event handling. */
Cava.initializeVisualizer = function () {
  const GLOBAL_KEY = "__CAVA_BROWSER_VISUALIZER_V1__";
  const running = window[GLOBAL_KEY];
  if (running) {
    running.togglePanel();
    return;
  }

  const settings = Cava.copyDefaults();
  const ui = Cava.createInterface();
  const engine = new Cava.AudioEngine(message => ui.setStatus(message));
  const visualizer = new Cava.Visualizer(ui.canvas);
  let frameHandle = 0;
  let previousFrameTime = 0;
  let lastInfoUpdate = 0;
  let panelVisible = true;
  let mediaElements = [];
  let selectedFileUrl = null;
  let microphoneConnected = false;
  let observer = null;
  let destroyed = false;

  const app = {
    togglePanel() {
      panelVisible = !panelVisible;
      ui.setPanelVisible(panelVisible);
    },
    destroyVisualizer,
    updateSettings,
    get isRunning() { return !destroyed; }
  };
  Object.defineProperty(window, GLOBAL_KEY, { value: app, configurable: true, writable: false, enumerable: false });

  function showError(error) {
    const message = error && error.message ? error.message : String(error);
    ui.setStatus(message);
  }

  function scheduleFrame() {
    if (destroyed || !settings.enabled || frameHandle) return;
    frameHandle = requestAnimationFrame(renderFrame);
  }

  function renderFrame(timestamp) {
    frameHandle = 0;
    if (destroyed || !settings.enabled) return;
    const delta = previousFrameTime ? Math.min((timestamp - previousFrameTime) / 1000, 0.05) : 1 / 60;
    previousFrameTime = timestamp;
    visualizer.render(settings, engine, delta, timestamp);

    if (timestamp - lastInfoUpdate > 500) {
      updateAudioInfo();
      lastInfoUpdate = timestamp;
    }
    frameHandle = requestAnimationFrame(renderFrame);
  }

  function updateAudioInfo() {
    const info = engine.getInfo();
    ui.audioContextStatus.textContent = info.state === "not-connected" ? "Not connected" : `${info.state} · ${info.source}`;
    ui.sampleRate.textContent = info.sampleRate ? `${Math.round(info.sampleRate / 1000)} kHz${info.stereo ? " · stereo" : " · mono"}` : "—";
    ui.dominantFrequency.textContent = Cava.formatFrequency(visualizer.lastDominantFrequency);
    ui.averageLevel.textContent = `${Math.round(visualizer.lastAverageLevel * 100)}%`;
  }

  function updateSettings(key, value) {
    settings[key] = value;
    if (key === "enabled") {
      if (value) scheduleFrame();
      else {
        if (frameHandle) cancelAnimationFrame(frameHandle);
        frameHandle = 0;
        visualizer.clear();
      }
    }
    if (["barCount", "lowFrequency", "highFrequency"].includes(key)) visualizer.bandCount = 0;
    if (["gradientStops", "gradientPreset", "gradientEnabled", "gradientDirection", "gradientIntensity", "solidColor", "backgroundColor"].includes(key)) visualizer.gradientKey = "";
  }

  function detectAudioElements() {
    return Array.from(document.querySelectorAll("audio, video"));
  }

  function refreshAudioElements() {
    const selectedValue = ui.mediaSelect.value || "auto";
    mediaElements = detectAudioElements();
    ui.mediaSelect.replaceChildren();
    const autoOption = document.createElement("option");
    autoOption.value = "auto";
    autoOption.textContent = "Auto-detect playing media";
    ui.mediaSelect.appendChild(autoOption);

    mediaElements.forEach((element, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      const title = element.getAttribute("aria-label") || element.getAttribute("title") || element.currentSrc || element.src || "media element";
      let host = "";
      try { host = title.startsWith("http") ? new URL(title).hostname : ""; } catch (_) { /* non-URL label */ }
      option.textContent = `${element.tagName.toLowerCase()} ${index + 1}${host ? ` · ${host}` : ""}${element.paused ? " · paused" : " · playing"}`;
      ui.mediaSelect.appendChild(option);
    });
    if ([...ui.mediaSelect.options].some(option => option.value === selectedValue)) ui.mediaSelect.value = selectedValue;
  }

  function chooseMediaElement() {
    const selected = ui.mediaSelect.value;
    if (selected !== "auto") return mediaElements[Number(selected)] || null;
    return mediaElements.find(element => !element.paused && !element.ended && element.readyState >= 2) ||
      mediaElements.find(element => element.readyState >= 2) || null;
  }

  async function connectSelectedMedia() {
    refreshAudioElements();
    const element = chooseMediaElement();
    if (!element) throw new Error("No playable audio or video element was found on this page. Start playback or choose a local file.");
    await engine.connectMediaElement(element);
    microphoneConnected = false;
    ui.shadow.querySelector('[data-action="toggle-mic"]').textContent = "Enable microphone";
    scheduleFrame();
  }

  async function connectLocalFile() {
    const player = ui.localPlayer;
    if (!player.src) throw new Error("Choose an audio file first.");
    let playbackError = null;
    let playbackPromise = Promise.resolve();
    if (player.paused) {
      try {
        // Request playback synchronously from the click gesture before awaiting AudioContext.resume().
        playbackPromise = player.play().catch(error => { playbackError = error; });
      } catch (error) {
        playbackError = error;
      }
    }
    await engine.connectLocalMediaElement(player);
    await playbackPromise;
    if (playbackError) ui.setStatus("Connected · Local audio file — press Play in the player to start audio.");
    microphoneConnected = false;
    ui.shadow.querySelector('[data-action="toggle-mic"]').textContent = "Enable microphone";
    scheduleFrame();
  }

  async function toggleMicrophone() {
    if (microphoneConnected) {
      engine.disconnectSource(false);
      microphoneConnected = false;
      ui.shadow.querySelector('[data-action="toggle-mic"]').textContent = "Enable microphone";
      ui.setStatus("Microphone disconnected");
      updateAudioInfo();
      return;
    }
    await engine.connectMicrophone();
    microphoneConnected = true;
    ui.shadow.querySelector('[data-action="toggle-mic"]').textContent = "Stop microphone";
    scheduleFrame();
  }

  async function onAction(action, target) {
    try {
      if (action === "toggle-panel") {
        panelVisible = !panelVisible;
        ui.setPanelVisible(panelVisible);
      } else if (action === "hide-panel") {
        panelVisible = false;
        ui.setPanelVisible(false);
      } else if (action === "close") {
        await destroyVisualizer();
      } else if (action === "reset") {
        Object.assign(settings, Cava.copyDefaults());
        ui.syncControls(settings);
        visualizer.bandCount = 0;
        visualizer.gradientKey = "";
        scheduleFrame();
      } else if (action === "connect-media") {
        await connectSelectedMedia();
      } else if (action === "connect-file") {
        await connectLocalFile();
      } else if (action === "toggle-mic") {
        await toggleMicrophone();
      } else if (action === "toggle-analysis") {
        await engine.toggleAnalysis();
        const button = ui.shadow.querySelector('[data-action="toggle-analysis"]');
        button.textContent = engine.context && engine.context.state === "suspended" ? "Resume analysis" : "Pause analysis";
      } else if (action === "add-stop") {
        if (settings.gradientStops.length < 8) {
          settings.gradientStops.splice(settings.gradientStops.length - 1, 0, "#8b80e8");
          settings.gradientPreset = "Custom";
          ui.syncControls(settings);
          updateSettings("gradientStops", settings.gradientStops);
        }
      } else if (action === "remove-stop") {
        const index = Number(target.dataset.stopIndex);
        if (settings.gradientStops.length > 2) {
          settings.gradientStops.splice(index, 1);
          settings.gradientPreset = "Custom";
          ui.syncControls(settings);
          updateSettings("gradientStops", settings.gradientStops);
        }
      }
    } catch (error) {
      showError(error);
    }
  }

  function handleControlInput(event) {
    const control = event.target;
    if (control.matches("[data-setting]")) {
      const key = control.dataset.setting;
      const value = control.type === "checkbox" ? control.checked :
        control.type === "range" ? Number(control.value) : control.value;
      updateSettings(key, value);
      ui.syncControls(settings);
      if (key === "stereo" || key === "barCount") visualizer.bandCount = 0;
      if (key === "enabled" && value) scheduleFrame();
    } else if (control.matches("[data-stop-index]")) {
      settings.gradientStops[Number(control.dataset.stopIndex)] = control.value;
      settings.gradientPreset = "Custom";
      updateSettings("gradientStops", settings.gradientStops);
      ui.shadow.querySelector("#cava-preset").value = "Custom";
    }
  }

  function handlePresetChange(event) {
    if (event.target.id !== "cava-preset") return;
    const presetName = event.target.value;
    if (Cava.PRESETS[presetName]) {
      settings.gradientStops = Cava.PRESETS[presetName].slice();
      settings.gradientPreset = presetName;
      settings.gradientEnabled = true;
      ui.syncControls(settings);
      updateSettings("gradientStops", settings.gradientStops);
      updateSettings("gradientEnabled", true);
    }
  }

  function onFileSelected(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (selectedFileUrl) URL.revokeObjectURL(selectedFileUrl);
    selectedFileUrl = URL.createObjectURL(file);
    ui.localPlayer.src = selectedFileUrl;
    ui.localPlayer.hidden = false;
    ui.connectFileButton.disabled = false;
    ui.setStatus(`Local file ready · ${file.name}. Press play, then connect it.`);
  }

  function onKeyDown(event) {
    if (event.key === "Escape" && panelVisible) {
      panelVisible = false;
      ui.setPanelVisible(false);
    }
  }

  function onDocumentPlay() {
    refreshAudioElements();
  }

  function onMutations(records) {
    const mediaChanged = records.some(record => [...record.addedNodes, ...record.removedNodes].some(node => {
      if (!(node instanceof Element)) return false;
      return node.matches("audio, video") || Boolean(node.querySelector("audio, video"));
    }));
    if (mediaChanged) refreshAudioElements();
  }

  async function destroyVisualizer() {
    if (destroyed) return;
    destroyed = true;
    if (frameHandle) cancelAnimationFrame(frameHandle);
    frameHandle = 0;
    if (observer) observer.disconnect();
    document.removeEventListener("play", onDocumentPlay, true);
    document.removeEventListener("pause", onDocumentPlay, true);
    document.removeEventListener("keydown", onKeyDown, true);
    window.removeEventListener("resize", onResize);
    ui.shadow.removeEventListener("click", onClick);
    ui.shadow.removeEventListener("input", handleControlInput);
    ui.shadow.removeEventListener("change", handlePresetChange);
    ui.fileInput.removeEventListener("change", onFileSelected);
    await engine.dispose();
    ui.localPlayer.pause();
    ui.localPlayer.removeAttribute("src");
    ui.localPlayer.load();
    if (selectedFileUrl) URL.revokeObjectURL(selectedFileUrl);
    ui.host.remove();
    try { delete window[GLOBAL_KEY]; } catch (_) { /* non-configurable page property */ }
  }

  function onClick(event) {
    const actionButton = event.composedPath().find(node => node && node.dataset && node.dataset.action);
    if (actionButton) onAction(actionButton.dataset.action, actionButton);
    const tabButton = event.composedPath().find(node => node && node.dataset && node.dataset.tab);
    if (tabButton) Cava.setActiveTab(ui.shadow, tabButton.dataset.tab);
  }

  function onResize() {
    visualizer.resize();
    visualizer.gradientKey = "";
  }

  ui.shadow.addEventListener("click", onClick);
  ui.shadow.addEventListener("input", handleControlInput);
  ui.shadow.addEventListener("change", handlePresetChange);
  ui.fileInput.addEventListener("change", onFileSelected);
  document.addEventListener("play", onDocumentPlay, true);
  document.addEventListener("pause", onDocumentPlay, true);
  document.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("resize", onResize);
  observer = new MutationObserver(onMutations);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  ui.syncControls(settings);
  refreshAudioElements();
  ui.setPanelVisible(true);
  ui.setStatus(mediaElements.length ? `${mediaElements.length} media element(s) found · connect one in Audio` : "Ready · choose an audio source in Audio");
  scheduleFrame();
};

Cava.initializeVisualizer();


})();

