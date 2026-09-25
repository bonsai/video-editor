# Effects

Effects are semantic operations, independent of their implementation language.

Example:

```json
{
  "name": "chromatic-aberration",
  "params": {
    "amount": 0.02
  },
  "engine": "wasm"
}
```

## Rust/WASM

Rust is the preferred implementation language for portable, performance-sensitive pixel effects. Compile the effect core to WASM and expose a small stable interface.

Initial targets:

- blur
- glow
- glitch
- shake
- zoom
- chromatic aberration
- film/noise
- color transforms
