# video-editor

**Adobe After Effects / Premiere を置き換える、AI-native / OSS video editing skeleton.**

ブラウザ、CLI、MCP、Skills を入口にして、動画編集を「GUIを操作する作業」から
**構造化されたプロジェクトを生成・編集・レンダリングする作業**へ変える。

## Goal

- After Effects 的なモーショングラフィックスを TypeScript / Rust / Python で再構成
- Premiere 的なカット・結合・字幕・音声処理をコード化
- LLM/Agent から MCP 経由で編集操作
- Skills で「何を作るか」を定義し、実装エンジンから分離
- JSON を動画編集プロジェクトの canonical data とする
- GitHub Actions で render / preview / artifact generation を自動化

## Architecture

```text
User / Agent
    |
    +-- CLI
    +-- MCP
    +-- Skills
    |
    v
Project JSON
    |
    +-- timeline
    +-- layers
    +-- text
    +-- audio
    +-- effects
    +-- keyframes
    |
    +-------------------+
    |                   |
   TS                  Rust
 Remotion             FFmpeg
 motion/UI             render/core
    |
    +---------+
              |
             Python
        analysis / AI / STT
              |
              v
           MP4/WebM
```

## Language roles

### TypeScript

- timeline / composition
- browser editor
- SVG / Canvas
- text animation
- Remotion integration
- MCP server interface

### Rust

- high-performance media operations
- FFmpeg orchestration
- frame / clip processing
- batch rendering
- future native engine

### Python

- speech-to-text
- scene detection
- silence detection
- audio analysis
- computer vision
- research / ML experiments

## AE replacement map

| After Effects concept | video-editor |
|---|---|
| Composition | project / composition JSON |
| Layer | layer |
| Keyframe | keyframes |
| Text Animator | TS motion preset |
| Shape Layer | SVG / Canvas |
| Effect | effect node |
| Expression | TS expression |
| Render Queue | Rust/FFmpeg render job |
| Script / ExtendScript | MCP / Skills |
| Plugin | MCP tool / engine adapter |

## MCP

The target interface is an **After Effects-like editing MCP**.

Example intent:

```text
「30秒動画を作って。タイトルを0-2秒で出して、
2-8秒は画像をズーム、最後にCTAを表示」
```

Agent translates this into structured project operations:

```json
{
  "composition": {"duration": 30, "fps": 30},
  "layers": [
    {
      "type": "text",
      "text": "TITLE",
      "in": 0,
      "out": 2,
      "animation": "fade-up"
    }
  ]
}
```

MCP should eventually expose operations such as:

- create_project
- add_composition
- add_layer
- add_text
- add_asset
- set_keyframe
- apply_effect
- set_transition
- analyze_clip
- render
- preview
- export

## Skills

Skills are the **semantic editing recipes** above the MCP primitives.

Examples:

- `ae-title-card`
- `ae-kinetic-typography`
- `ae-lower-third`
- `ae-logo-reveal`
- `ae-chroma-key`
- `ae-zoom-cut`
- `ae-social-caption`
- `ae-youtube-intro`

A Skill describes **what the editor should achieve**.
The MCP describes **how the project is manipulated**.

```text
Skill
  ↓
intent
  ↓
MCP operations
  ↓
project.json
  ↓
TS/Rust/Python
  ↓
render
```

## Skeleton

```text
video-editor/
├── README.md
├── docs/
│   ├── architecture.md
│   ├── project-schema.md
│   └── mcp.md
├── mcp/
├── skills/
├── src/
│   ├── ts/
│   ├── rs/
│   └── py/
├── examples/
├── projects/
└── .github/
    └── workflows/
```

## Design principles

1. **JSON is data, not UI.**
2. **MCP is the editing interface.**
3. **Skills are reusable editing intelligence.**
4. **TS owns composition and motion.**
5. **Rust owns performance-critical media work.**
6. **Python owns analysis and ML.**
7. **Rendering must be reproducible.**
8. **GUI is optional; the agent can operate the editor directly.**
9. **Every important operation should be inspectable as data.**
10. **Adobe compatibility is a behavioral target, not a dependency.**

## Roadmap

- [ ] project schema
- [ ] minimal TS composition
- [ ] Rust FFmpeg renderer
- [ ] Python media-analysis tools
- [ ] MCP server
- [ ] first AE-compatible Skills
- [ ] browser timeline
- [ ] preview renderer
- [ ] GitHub Actions render pipeline
- [ ] reusable asset/effect library

## Non-goal

This project does not attempt to clone Adobe's implementation or proprietary internals.
The target is an interoperable, programmable editing workflow with comparable concepts.

## License

TBD.
