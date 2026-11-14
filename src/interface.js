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
