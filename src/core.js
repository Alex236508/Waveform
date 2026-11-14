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
