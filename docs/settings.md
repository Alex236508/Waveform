# Settings reference

## General

- **Visualizer enabled:** stops/resumes drawing.
- **Position:** choose a corner or center anchor.
- **Width / Height:** size the visualizer footprint in the current viewport.
- **Background color / Background opacity:** configure the translucent backing rectangle.
- **Fullscreen visualization:** spreads bars across the full page viewport.
- **Reset all settings:** restores the original built-in defaults.

## Sensitivity

- **Overall sensitivity:** global gain after band measurement.
- **Bass sensitivity:** additional gain below 250 Hz.
- **Midrange sensitivity:** additional gain from 250 Hz to 4 kHz.
- **Treble sensitivity:** additional gain above 4 kHz.
- **Frequency amplification:** additional multiplier for all bands.
- **Noise threshold:** removes a configurable low-level floor before gain is applied.

## Appearance

- **Bars per channel:** 8–128 logarithmic bands. Stereo mode draws one set for each channel.
- **Bar width / spacing / corner radius:** adjust the bar geometry in pixels.
- **Bar direction:** bars grow from the top or bottom edge.
- **Mirrored bars:** reflects the same bar height around a horizontal centerline.
- **Stereo layout:** displays left and right channels in mirrored horizontal halves, with bass at the center. A mono source is duplicated into both sides.
- **Peak indicators:** draw small markers that hold and then fall.
- **Peak color / Solid bar color:** customize markers and the solid/gradient base color.

## Gradients

- **Preset:** CAVA Classic, Rainbow, Ocean, Sunset, Neon, Monochrome, Fire, or Purple Haze.
- **Use gradient:** turns gradient coloring on or uses the solid color.
- **Gradient direction:** vertical bottom-to-top or horizontal left-to-right.
- **Gradient positioning:** apply color by bar height or across bar positions.
- **Gradient intensity:** blends the gradient stops toward the solid color.
- **Color stops:** edit 2–8 colors, add stops, or remove extra stops.

## Animation

- **Smoothing:** lowers the rate at which bar values move toward their new levels.
- **Bar rise speed / Bar fall speed:** control attack and decay independently.
- **Peak hold / Peak fall speed:** set peak marker persistence and decay.
- **Animation intensity:** controls the rendered bars' opacity.

## Audio

- **Page audio/video element:** connect an existing media element when browser support and origin permissions allow.
- **Local audio file:** choose a file and use the embedded player. The Analyze button attempts to start playback and connect its captured stream.
- **Enable microphone / Stop microphone:** request microphone access or stop the owned tracks.
- **Pause analysis / Resume analysis:** suspend/resume the Web Audio context.
- **Audio context, sample rate, dominant band, average level:** live diagnostic information.
