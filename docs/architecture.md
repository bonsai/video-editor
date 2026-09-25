# Architecture

video-editor is a programmable editing system rather than a GUI clone.

**intent → skill → operation → canonical state → engine → render**

## Responsibility boundary

The key design boundary is:

> **TSX/Remotion decides what is shown; JS/Rust/WASM makes it visually cool.**

### TSX / Remotion

Owns semantic visual composition:

- text and telop
- subtitles
- title cards
- kinetic typography
- layout
- layers
- timeline
- motion
- SVG / Canvas
- Composition

Text should remain inspectable and editable as structured TSX/project data rather than being baked into a pixel effect.

### JS / Rust / WASM

Own visual treatment and performance-sensitive effects:

- glitch
- RGB shift
- glow
- blur
- grain / film
- shake
- distortion
- chromatic aberration
- particles
- noise
- light leak
- scanline
- frame effects

JS is useful for lightweight/browser effects. Rust is the performance-oriented effect core. WASM is the portable runtime boundary.

## Runtime layers

1. **Intent** — what the user wants.
2. **Data** — what the project currently contains.
3. **Execution** — how pixels/media are produced.

Runtime selection:

- Text / composition / motion → TSX / Remotion
- Analysis / inference → Python
- Lightweight visual effects → JS
- Pixel / frame effects → Rust / WASM
- Codec / media I/O → FFmpeg
- Conversation → MCP
- Frontend HTTP → REST
- Durable GitHub execution → AW
- Semantic recipes → Skills

## Unified entrypoints

```text
OpenCode → MCP ───────┐
Browser  → REST ──────┼→ Skill → project.json → engines → render
GitHub   → AW ────────┤
CLI      → Skill ─────┘
```

All entrypoints must converge on the same canonical project state.

## WASM boundary

Rust effects expose a small stable interface. Semantic effect names and parameters belong to the project schema; the WASM ABI is an implementation detail.

```text
Skill: glitch
    ↓
Effect JSON
    ↓
Effect registry
    ├─ wasm
    ├─ native Rust
    ├─ JS
    └─ Remotion fallback
```

## State and history

S0 → edit → S1 → edit → S2

Store Skill/version, parameters, resolved engine and project-state transition for each important operation.

Undo is state-based rather than pixel-reversal.

## Agent-first operation

OpenCode → MCP → Skill resolution → project mutation → preview → user feedback → mutation → render

For frontend/API operation:

Browser → REST → job → Skill resolution → project mutation → render → artifact

For durable GitHub-native operation:

Issue / structured intent → AW → Skill resolution → project mutation → render → artifact + worklog

The browser is a viewer/editor for humans who want it, not a prerequisite.
