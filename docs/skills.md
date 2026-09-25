# Skills

A Skill is a reusable semantic recipe for editing.

A Skill must define:

- name
- intent
- inputs
- defaults
- output
- preferred engine
- fallback engine where possible

Example:

```yaml
name: glitch
type: effect

input:
  source: clip
  duration: 0.4
  intensity: 0.7

engine:
  preferred: wasm
  fallback: ffmpeg

output:
  type: effect
```

Skills should not require the caller to know whether the implementation is Rust, WASM, Python, FFmpeg, or Remotion.
