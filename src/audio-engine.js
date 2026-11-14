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
