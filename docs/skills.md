# Skills

A Skill is a reusable semantic editing recipe.

## Contract

A Skill describes:
- name
- category
- intent
- inputs
- defaults
- constraints
- output
- preferred engine
- fallback
- examples

It must not require the caller to know whether execution happens in Rust, WASM, Python, FFmpeg, or Remotion.

## Categories

video/
effects/
transition/
text/
audio/
analysis/
presets/
export/

## Composition

Skills can call or compose other Skills.

youtube-short:
- scene-detection
- silence-cut
- punch-in
- subtitle
- kinetic-text
- sound-ducking
- color

Editing styles therefore become reusable agent capabilities.

## Resolution

natural language → skill matching → parameter extraction → validation → project mutation → engine selection → preview/render

## Versioning

Skills should be versioned independently from engine implementations. Project history records Skill/version and resolved engine so old edits remain inspectable.
