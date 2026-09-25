# Architecture

video-editor is a programmable editing system rather than a GUI clone.

intent → skill → operation → canonical state → engine → render

Layers:
1. Intent — what the user wants.
2. Data — what the project currently contains.
3. Execution — how pixels/media are produced.

Runtime selection:
- Composition / motion → Remotion / TypeScript
- Analysis / inference → Python
- Pixel / frame effects → Rust / WASM
- Codec / media I/O → FFmpeg
- Conversation → MCP
- Semantic recipes → Skills

## WASM boundary

Rust effects expose a small stable interface. Semantic effect names and parameters belong to the project schema; the WASM ABI is an implementation detail.

Skill: glitch → Effect JSON → Effect registry → wasm/native/remotion fallback

## State and history

S0 → edit → S1 → edit → S2

Store Skill/version, parameters, resolved engine and project-state transition for each important operation.

## Agent-first operation

OpenCode → MCP → Skill resolution → project mutation → preview → user feedback → mutation → render

The browser is a viewer/editor for humans who want it, not a prerequisite.
