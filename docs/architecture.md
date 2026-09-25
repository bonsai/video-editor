# Architecture

## Core contract

The system separates **intent**, **data**, and **execution**.

```text
conversation → Skill → project.json → engine → render
```

- Skill: what should happen
- project JSON: what is currently true
- engine: how it is executed

## Engine selection

Prefer WASM for portable frame effects. Use Remotion for composition and TS-native motion. Use Python for analysis. Use FFmpeg/native Rust where codec or throughput requirements justify it.

## Reversibility

MCP mutations should produce inspectable project JSON changes. Undo should restore the previous project state rather than attempting to reverse pixels.
