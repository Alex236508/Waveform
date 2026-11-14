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
