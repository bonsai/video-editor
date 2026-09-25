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

It must not require the caller to know whether execution happens in Rust, WASM, JS, Python, FFmpeg, or Remotion.

## Responsibility-oriented categories

### Text / composition

These Skills resolve to structured TSX/Remotion composition.

- telop
- subtitle
- title-card
- kinetic-typography
- social-caption
- lower-third
- logo-reveal
- typewriter
- pop
- bounce
- tracking
- word-highlight

**Principle: text is content and composition, not a pixel effect.**

### Visual effects

These Skills resolve to JS, Rust, WASM, or a suitable fallback.

- blur
- glow
- sharpen
- glitch
- chromatic-aberration
- shake
- zoom
- punch-in
- distortion
- warp
- noise
- film
- vignette
- grain
- color
- pixelate

**Principle: effects are responsible for visual style and “coolness”.**

### Transition

- fade
- crossfade
- wipe
- slide
- zoom
- glitch
- whip
- match-cut

### Audio

- normalize
- silence-cut
- ducking
- fade
- beat-detection
- voice-music separation

### Analysis

- STT
- scene-detection
- silence-detection
- beat-detection
- face-object detection
- shot classification
- color analysis

### Presets / styles

A preset composes multiple Skills without exposing their implementation details.

```text
mv-style
 ├─ beat-detection       → Python
 ├─ kinetic-text         → TSX
 ├─ glitch               → WASM
 ├─ chromatic-aberration → WASM
 ├─ zoom                 → TSX
 ├─ shake                → TSX/WASM
 ├─ film                 → WASM
 └─ color                → JS/WASM
```

## Resolution

```text
natural language
    ↓
skill matching
    ↓
parameter extraction
    ↓
validation
    ↓
project mutation
    ↓
engine selection
    ↓
preview / render
```

The caller should say **what they want**, not which runtime to execute.

## Composition example

```text
「ここ、テロップを強調してMVっぽくカッコよく」

                    ↓

             style / edit Skill
                ┌────┴────┐
                ↓         ↓
          TSX telop    WASM effects
                └────┬────┘
                     ↓
                  Remotion
                     ↓
                   Render
```

A single user intent may therefore produce both a TSX text operation and one or more visual-effect operations.

## Backend resolution

The semantic Skill remains stable while its implementation can change.

```text
glitch
 ↓
effect-registry
 ├─ WASM
 ├─ native Rust
 ├─ JS
 └─ Remotion fallback
```

Skill versioning is independent from engine implementations. Project history records Skill/version and resolved engine so old edits remain inspectable.
