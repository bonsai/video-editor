# video-editor

**OpenCode + Remotion をベースに、会話だけで動画を作り、加工し、仕上げる AI-native / OSS video-editor monorepo。**

Adobe After Effects / Premiere 的な機能を巨大なGUIとして再現するのではなく、**MCP + Skills + canonical JSON + Remotion + Python + Rust/WASM** に分解する。

> **Talk to edit.**
> 「ここglitch」「字幕をもっと強く」「この間を詰めて」「MVっぽくして」で動画を編集する。

## Vision

```text
会話
 ↓
意図理解
 ↓
Skill
 ↓
構造化された編集操作
 ↓
project.json
 ↓
Remotion / Python / Rust-WASM / FFmpeg
 ↓
Preview / Render / Export
```

GUIはあってもよいが主役ではない。OpenCodeからMCPで直接編集でき、同じSkillをCLI・ブラウザ・CIでも再利用できることを目標にする。

## Core architecture

```text
                         User
                           │
                     natural language
                           ▼
                        OpenCode
                           │
                           ▼
                          MCP
                  conversation / tools
                           │
                           ▼
                         Skills
             semantic editing recipes
                           │
                           ▼
                    project.json
                     canonical data
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
      Remotion          Python          Rust → WASM
       / TypeScript      analysis          effects
          │                │                │
          │          STT / scene / CV       │
          │          silence / beat        │
          └────────────────┼────────────────┘
                           ▼
                         FFmpeg
                     media I/O / codec
                           │
                           ▼
                    Preview / Render
                           │
                           ▼
                       MP4 / WebM
```

## Separation of concerns

| Layer | Role |
|---|---|
| **OpenCode** | 自然言語による編集・制作エージェント |
| **MCP** | 会話と編集プロジェクトをつなぐインターフェース |
| **Skills** | 「何を実現するか」を定義する再利用可能な編集知能 |
| **project.json** | 動画プロジェクトのcanonical data |
| **Remotion / TS** | composition、timeline、layer、text、motion、SVG/Canvas |
| **Python** | STT、scene/silence/beat/audio/CV/ML、分析と判断材料 |
| **Rust** | 高速なmedia/frame/pixel処理 |
| **WASM** | Rust effectsをブラウザ等でも実行できるportable runtime |
| **FFmpeg** | codec、decode/encode、cut、concat、media I/O |
| **Browser** | preview / optional lightweight editor |
| **GitHub Actions** | reproducible render / artifact / CI |

### 言語の考え方

- **TS = composition / interface**
- **Python = think / research / analysis**
- **Rust = work / performance**
- **WASM = everywhere**
- **FFmpeg = media foundation**

Pythonで分析して、Rust/WASMで重いEffectを実行し、Remotionで最終構成する。

## Monorepo

```text
video-editor/
├── apps/
│   ├── remotion/                 # Remotion composition / preview / render
│   ├── mcp/                      # conversational editing MCP
│   └── browser/                  # optional lightweight browser client
│
├── packages/
│   ├── schema/                   # project / effect / skill schemas
│   ├── skills/                   # semantic editing Skills
│   ├── effect-registry/          # effect metadata + backend resolution
│   ├── wasm-effects/             # Rust → WASM portable effects
│   ├── remotion-presets/         # TS/Remotion motion presets
│   └── shared/                   # shared types/utilities
│
├── engines/
│   ├── rust/                     # native Rust media/effect engine
│   ├── python/                   # analysis / STT / CV / ML
│   └── ffmpeg/                   # media execution adapters
│
├── projects/                     # canonical project JSON examples
├── examples/                     # end-to-end examples
├── docs/
├── schemas/
└── .github/workflows/
```

## Skill model

Skillは実装ではなく**編集意図のレシピ**。

```text
Skill
 ├─ intent
 ├─ inputs
 ├─ defaults
 ├─ constraints
 ├─ output
 ├─ preferred engine
 └─ fallback
```

利用者はRust/WASMを知る必要がない。

## Effect model

Effectはengine-independentなsemantic operation。

```json
{
  "type": "effect",
  "name": "glitch",
  "start": 12.0,
  "duration": 0.5,
  "params": {
    "intensity": 0.6,
    "rgb_shift": 0.02
  },
  "engine": "wasm"
}
```

同じEffectにRust/WASM、native Rust、Remotion/TS、FFmpegなど複数backendを持てる。

## Conversation-first editing

> 「30秒のYouTube Shortを作って。冒頭2秒でタイトル、人物の話してるところをテンポよくカット、字幕は大きめ、最後にCTA。」

> 「ここ、MVっぽくglitch入れて」

> 「12秒から0.5秒だけglitch。強さは中」

> 「さっきのglitch半分にして」

> 「無音部分を詰めて、ビートに合わせて切り替えて」

MCPは会話をSkillへ解決し、project.jsonを変更し、適切なengineを呼ぶ。

## MCP

高レベルの会話API：

- `video.inspect`
- `video.apply`
- `video.modify`
- `video.remove`
- `video.preview`
- `video.render`
- `video.export`
- `video.undo`
- `video.redo`
- `video.analyze`
- `video.list_skills`

低レベルのproject operations：

- `create_project`
- `add_composition`
- `add_layer`
- `add_asset`
- `add_text`
- `set_keyframe`
- `apply_effect`
- `set_transition`

**高レベル会話API → Skill → 低レベルproject operation** の二層構造。

## Adobe concept mapping

| Adobe concept | video-editor |
|---|---|
| Premiere timeline | project/timeline JSON + Remotion |
| Composition | composition |
| Layer | layer |
| Keyframe | keyframes |
| Text Animator | TS/Remotion Skill |
| Shape Layer | SVG / Canvas |
| Effect | semantic effect |
| Expression | TS expression / data |
| Adjustment Layer | effect scope |
| Transition | transition Skill |
| Render Queue | render job |
| Media Encoder | FFmpeg |
| After Effects Script | MCP / Skills |
| Plugin | engine adapter / Skill |
| Dynamic Link的連携 | canonical project data |

Adobeそのものをcloneするのではなく、**概念と編集能力をOSS/programmableに再構成する**。

## Skill categories

### Visual effects
blur / glow / sharpen / glitch / chromatic-aberration / shake / zoom / punch-in / distortion / warp / noise / film / vignette / grain / color / pixelate

### Transition
fade / crossfade / wipe / slide / zoom / glitch / whip / match-cut

### Text / Motion
title-card / kinetic-typography / subtitle / social-caption / lower-third / logo-reveal / typewriter / pop / bounce / tracking / word-highlight

### Audio
normalize / silence-cut / ducking / fade / beat-detection / voice-music separation

### Analysis
STT / scene-detection / silence-detection / beat-detection / face-object detection / shot classification / color analysis

## Preset / Style Skills

単一Effectだけでなく、複数Skillを束ねて**編集スタイルそのものをSkill化**する。

```text
youtube-short
 ├─ scene-detection
 ├─ silence-cut
 ├─ punch-in
 ├─ kinetic-text
 ├─ subtitle
 ├─ sound-ducking
 └─ color

mv-style
 ├─ beat-detection
 ├─ glitch
 ├─ chromatic-aberration
 ├─ zoom
 ├─ shake
 ├─ film
 └─ color

talk-video
 ├─ STT
 ├─ silence-cut
 ├─ subtitle
 ├─ punch-in
 └─ audio-normalize
```

## Python / Rust / WASM strategy

### Python
分析・判断材料を作る。

```text
video → STT / scene / silence / beat / CV
     → analysis.json
     → Skill / MCP
     → project.json
```

### Rust
高速なframe/pixel処理を担当。最初はstandalone CLIとして実装し、後からWASM targetを追加する。

```text
Rust effect core
 ├─ native
 └─ wasm32
```

### WASM
**portable effect runtime**。同じEffectをbrowser / Node / desktop / server / CIで可能な限り共通利用する。

## Canonical data / history

JSONをsource of truthにする。

```text
assets
compositions
timeline
layers
text
audio
effects
transitions
keyframes
analysis
metadata
history
```

重要な編集はproject.jsonの差分として追跡可能にする。

Undoはピクセルを逆演算するのではなく、**編集状態を戻す**。

## Browser / CLI / MCP / CI

同じcanonical dataとSkillを共有する。

```text
              project.json
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
      MCP         CLI       Browser
       │           │           │
       └───────────┼───────────┘
                   ▼
                Engines
                   │
                   ▼
                  CI
```

GUIはoptional。基本はOpenCode → MCP → project.json → renderで完結する。

## Reproducible rendering

Renderはproject JSON、Skill versions、engine versions、asset references、effect parametersから再現可能にする。

GitHub Actionsでpreview/render/artifactを生成する。

## End-to-end

```text
「この動画をYouTube Shortっぽくして。
無音を詰めて、字幕を付けて、重要なところだけ
少しzoomして、最後にCTAを出して」
             │
             ▼
          OpenCode
             │
             ▼
            MCP
             │
             ▼
      youtube-short Skill
             │
       ┌─────┼──────┐
       ▼     ▼      ▼
    Python   TS    WASM
    analysis motion effects
       │     │      │
       └─────┼──────┘
             ▼
        project.json
             │
             ▼
          Remotion
             │
           FFmpeg
             │
             ▼
          MP4/WebM
```

## Principles

1. **Talk to edit.**
2. **MCP is the conversational interface.**
3. **Skills express intent, not implementation.**
4. **JSON is canonical.**
5. **Remotion owns composition.**
6. **Python owns analysis.**
7. **Rust owns performance-critical processing.**
8. **WASM makes effects portable.**
9. **FFmpeg remains the media foundation.**
10. **GUI is optional.**
11. **Edits are inspectable, deterministic and reversible.**
12. **One Skill should be reusable across MCP/CLI/browser/CI where practical.**
13. **Do not make users learn the underlying engine.**
14. **Prefer small composable Skills over a monolithic editor.**
15. **Adobe compatibility is a behavioral/conceptual target, not a dependency.**

## Roadmap

### Phase 1 — Skeleton
- [x] monorepo architecture
- [x] canonical project/effect schema
- [x] Skill specification
- [x] MCP specification
- [x] Remotion-first architecture

### Phase 2 — Talk to edit
- [ ] minimal MCP server
- [ ] video.inspect/apply/modify/remove/undo
- [ ] Skill registry
- [ ] project state/history

### Phase 3 — Effects
- [ ] glitch
- [ ] blur
- [ ] glow
- [ ] shake
- [ ] chromatic aberration
- [ ] color / film
- [ ] Rust effect core
- [ ] Rust → WASM build

### Phase 4 — Intelligence
- [ ] Python STT
- [ ] scene detection
- [ ] silence detection
- [ ] beat detection
- [ ] automatic effect placement
- [ ] style/preset Skills

### Phase 5 — Production
- [ ] Remotion preview
- [ ] render/export
- [ ] browser client
- [ ] GitHub Actions
- [ ] artifact/version management
- [ ] reproducible builds

## Non-goal

Adobeのproprietary implementationをcloneすることではない。

目標は、**会話・Skill・構造化データ・OSS runtimeによって、同等の制作概念をよりagent-nativeに実現すること**。
