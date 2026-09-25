# glitch

Apply a stylized digital glitch to a clip or time range.

## Intent

Use when the user asks for glitch, digital distortion, RGB separation, signal break, or an MV-style digital hit.

## Inputs

- source clip
- start
- duration
- intensity (0..1)

## Engine

Preferred: WASM (Rust)

Fallback: Remotion/FFmpeg implementation

## Example

「ここだけMVっぽくglitch」

→ create a glitch effect operation in project JSON.
