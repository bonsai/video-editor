# Effects

Effects are semantic operations over video frames, clips, layers, audio, or time.

## Backend priority

1. Rust/WASM for portable pixel/frame effects.
2. Remotion/TS for composition-aware visual effects and motion.
3. FFmpeg for codec/media primitives.
4. Native Rust where WASM is not appropriate.
5. Python for analysis rather than hot-path rendering.

## Initial visual effects

blur / glow / sharpen / glitch / chromatic-aberration / shake / zoom / punch-in / distortion / warp / noise / film / vignette / grain / color / pixelate

## Rust/WASM

Start with a standalone Rust effect core and compile the same core to native and wasm32.

The first WASM milestone should be a deterministic effect callable from both browser and render pipeline.

## Effect model

The project JSON names the semantic operation; the effect registry resolves the implementation. The same semantic effect may have WASM, native Rust, Remotion or FFmpeg backends.
