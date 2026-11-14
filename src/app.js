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
