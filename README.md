# video-editor

**OpenCode + Remotion を中心に、会話だけで動画を加工する AI-native / OSS monorepo。**

「ここにglitch」「字幕をもう少し強く」「この場面だけズーム」のような自然言語をMCPで受け取り、Skillsが編集意図を構造化し、RemotionとWASM effectsで実行する。

## Architecture

```text
User
  │ natural language
  ▼
OpenCode
  │
  ▼
MCP ────────────────┐
  │                 │
  ▼                 ▼
Skills          project.json
  │                 │
  └───────┬─────────┘
          ▼
   Effect / Edit Plan
          │
     ┌────┴──────────────┐
     ▼                   ▼
 Remotion             WASM
 TS composition       Rust effects
     │                   │
     └─────────┬─────────┘
               ▼
            Render
               │
            MP4/WebM
```

## Monorepo

```text
video-editor/
├── apps/
│   ├── remotion/          # composition / preview / render
│   └── mcp/               # conversational editing MCP
├── packages/
│   ├── schema/            # canonical project/effect schemas
│   ├── skills/            # semantic editing recipes
│   └── wasm-effects/      # Rust → WASM effect packages
├── engines/
│   ├── python/            # analysis / STT / CV / ML
│   └── rust/              # native/WASM media processing
├── projects/              # example project JSON
├── examples/
└── docs/
    ├── architecture.md
    ├── effects.md
    ├── mcp.md
    └── skills.md
```

## Roles

| Layer | Responsibility |
|---|---|
| OpenCode | natural-language editing |
| MCP | conversational interface + project operations |
| Skills | reusable editing intelligence |
| JSON | canonical project/effect data |
| Remotion / TS | composition, timeline, motion, text |
| Rust / WASM | pixel/frame effects and heavy processing |
| Python | analysis, STT, scene/silence/audio/CV/ML |
| FFmpeg | media I/O / codec operations |

## Conversation-first editing

Examples:

> 「ここ、MVっぽくglitch入れて」

> 「12秒から0.5秒だけglitch。強さは中」

> 「さっきのglitch半分にして」

> 「このセリフに合わせて字幕を出して、少し派手に」

MCP resolves the intent to a Skill, modifies canonical project data, and runs the appropriate engine. The user does not need to operate a traditional timeline UI.

## Effect model

Skills are engine-independent. An effect declares parameters and an implementation backend can be selected automatically.

```json
{
  "type": "effect",
  "name": "glitch",
  "start": 12.0,
  "duration": 0.5,
  "params": {
    "intensity": 0.6
  },
  "engine": "wasm"
}
```

The same semantic effect can later have WASM, native Rust, FFmpeg, or TS implementations without changing the user-facing Skill.

## Skills

Initial categories:

```text
skills/
├── effects/
│   ├── blur/
│   ├── glow/
│   ├── glitch/
│   ├── shake/
│   ├── zoom/
│   ├── chromatic-aberration/
│   ├── film/
│   └── color/
├── transition/
├── text/
├── audio/
├── analysis/
└── presets/
```

A preset can compose multiple Skills:

```text
youtube-short
 ├─ scene-detection
 ├─ silence-cut
 ├─ punch-in
 ├─ kinetic-text
 ├─ subtitle
 ├─ sound-ducking
 └─ color
```

## Principles

1. **Talk to edit.**
2. **MCP is the interface.**
3. **Skills express intent, not implementation.**
4. **JSON is canonical.**
5. **Remotion owns composition.**
6. **Rust/WASM owns effects.**
7. **Python owns analysis.**
8. **GUI is optional.**
9. **Every edit is inspectable and reversible.**
10. **One Skill should work across browser, CLI, MCP and CI where practical.**

## Roadmap

- [ ] monorepo workspace
- [ ] canonical project/effect schema
- [ ] minimal Remotion app
- [ ] MCP conversational edit tools
- [ ] Skill registry
- [ ] first Rust/WASM effects
- [ ] Python analysis bridge
- [ ] preview / undo
- [ ] GitHub Actions render
- [ ] browser client
