# CAVA reference notes

Research source: the official [CAVA repository](https://github.com/karlstav/cava), checked on 2026-11-14. Relevant files include [`CAVACORE.md`](https://github.com/karlstav/cava/blob/master/CAVACORE.md), [`cavacore.c`](https://github.com/karlstav/cava/blob/master/cavacore.c), [`cavacore.h`](https://github.com/karlstav/cava/blob/master/cavacore.h), [`example_files/config`](https://github.com/karlstav/cava/blob/master/example_files/config), and [`output/shaders/bar_spectrum.frag`](https://github.com/karlstav/cava/blob/master/output/shaders/bar_spectrum.frag).

## What CAVA does

- **Spectrum analysis:** CAVA's native core uses FFTW. It applies a Hann window to buffered audio samples, computes frequency transforms, and combines bins into bands. A longer analysis window is used for bass in the native implementation.
- **Logarithmic distribution:** band boundaries are placed exponentially between configurable low/high cutoff frequencies, reflecting the logarithmic pitch scale.
- **Normalization:** CAVA averages energy in each band and applies a frequency-dependent equalization factor. Its configuration offers linear and decibel-oriented scaling.
- **Smoothing and sensitivity:** its core uses an integral-style weighted history and a gravity/fall-off response when a new level is lower than the previous value. Automatic sensitivity decreases when bars overshoot and gradually increases during non-silent input.
- **Display behavior:** the config covers bar count, bar width/spacing, height, orientation, mono/stereo, reverse, and split-channel layouts. The documented stereo layout places low frequencies near the center.
- **Color:** the terminal and GLSL output support solid colors and multiple gradient stops. The bar spectrum shader can use a vertical gradient along bar height and a horizontal gradient across bar positions. The sample configuration supports up to eight stops.
- **Other styles:** CAVA's shader collection includes spectrum, spectrogram, Winamp-like, northern-lights, and circular/Orion visualizations. This browser build focuses on the classic bar spectrum, plus up/down, mirrored, and stereo arrangements; it does not port the GLSL shader collection.

## Browser translation

The browser version uses `AnalyserNode` to perform the FFT internally. It groups analyser bins logarithmically, converts byte-frequency values back to a normalized band level, and applies band gain, a noise floor, asymmetric rise/fall smoothing, and held peaks. Canvas renders a continuously updated gradient and bar field. This is behaviorally inspired by CAVA, not a port of `cavacore.c`; the FFT size, windowing details, frequency normalization, and dynamic sensitivity behavior are not bit-for-bit identical.

CAVA is authored by Karl Stavestrand and is MIT-licensed. This project includes no copied CAVA source; its attribution and upstream license link are recorded in `../NOTICE` and the root README.
