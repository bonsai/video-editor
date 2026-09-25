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

GUIはあってもよいが主役ではない。OpenCodeからMCPで直接編集でき、同じSkillをCLI・REST・ブラウザ・CIでも再利用できることを目標にする。

## Core architecture

```text
                         User
                           │
                     natural language
                           ▼
                        OpenCode
                           │
                    MCP / REST / CLI
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
   TSX / Remotion      Python          Rust / JS → WASM
   composition         analysis        visual effects
   text / telop        STT / CV        style / effects
          │                │                │
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

## Responsibility boundary

**TSX/Remotion = 文字・構成・動き。RS/Rust・JS・WASM = 映像をかっこよくする効果。**

### TSX / Remotion — meaning & composition

テロップ文字はTSX/Remotionを主役にする。

- テロップ
- 字幕
- タイトル
- キネティックタイポグラフィ
- Lower Third
- CTA
- ロゴ
- SVG / Canvas
- レイアウト
- テキストアニメーション
- レイヤー
- タイムライン
- Composition

```tsx
<Telop
  text="ここがポイント"
  emphasis="strong"
  animation="pop"
/>
```

### JS / Rust / WASM — coolness & visual effects

映像の質感、勢い、スタイルを担当する。

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
- transition
- speed ramp
- frame effects

原則として、**「何を見せるか」はTSX、「どうかっこよく見せるか」はEffects**。

### Skillで統合

利用者は実装言語を意識しない。

```text
「ここ、テロップを強調してMVっぽくカッコよく」
                     │
                     ▼
                   Skill
                 ┌───┴────┐
                 ▼         ▼
              TSX text   WASM effects
                 │         │
                 └────┬────┘
                      ▼
                   Remotion
                      ▼
                    Render
```

## Separation of concerns

| Layer | Role |
|---|---|
| **OpenCode** | 自然言語による編集・制作エージェント |
| **MCP** | 会話と編集プロジェクトをつなぐインターフェース |
| **REST** | フロントから編集ジョブを呼ぶHTTPインターフェース |
| **Skills** | 「何を実現するか」を定義する再利用可能な編集知能 |
| **project.json** | 動画プロジェクトのcanonical data |
| **TSX / Remotion** | composition、timeline、layer、text、telop、motion、SVG/Canvas |
| **Python** | STT、scene/silence/beat/audio/CV/ML、分析と判断材料 |
| **JS** | 軽量なブラウザ/ランタイム向けvisual effects |
| **Rust** | 高速なframe/pixel/media処理 |
| **WASM** | Rust effectsをブラウザ等でも実行できるportable runtime |
| **FFmpeg** | codec、decode/encode、cut、concat、media I/O |
| **Browser** | preview / optional lightweight editor |
| **GitHub Actions / AW** | reproducible edit/render / artifact / CI |

### 言語の考え方

- **TSX = text / composition / motion**
- **Python = think / research / analysis**
- **JS = lightweight visual effects**
- **Rust = work / performance**
- **WASM = everywhere**
- **FFmpeg = media foundation**

Pythonで分析し、TSXで意味と構成を作り、JS/Rust/WASMで映像をかっこよくし、Remotionで最終構成する。

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
│   ├── skills/
│   │   ├── text/                 # TSX text/telop Skills
│   │   ├── effects/              # semantic visual-effect Skills
│   │   └── presets/              # style Skills
│   ├── effect-registry/          # effect metadata + backend resolution
│   ├── wasm-effects/             # Rust → WASM portable effects
│   ├── remotion-presets/         # TSX/Remotion motion presets
│   └── shared/                   # shared types/utilities
│
├── engines/
│   ├── rust/                     # native Rust media/effect engine
│   ├── python/                   # analysis / STT / CV / ML
│   ├── js/                       # lightweight visual-effect runtime
│   └── ffmpeg/                   # media execution adapters
│
├── projects/                     # canonical project JSON examples
├── examples/                     # end-to-end examples
├── docs/
├── schemas/
└── .github/workflows/
```

## REST / MCP / AW

同じSkillとproject.jsonを、会話・フロント・GitHubから利用する。

```text
Browser
   │ POST /video/edit
   ▼
REST
   │
   ├──────────→ MCP
   │
   └──────────→ GitHub Issue / AW
                         │
                         ▼
                       Skill
                         ▼
                    project.json
                         ▼
                TSX / Python / JS / WASM
                         ▼
                      Render
                         ▼
                  Artifact / Preview
```

RESTはフロント向けの薄いHTTP入口。認証やジョブ受付を担当し、編集ロジックはSkill/project.json側に寄せる。

例：

```http
POST /video/edit
Content-Type: application/json

{
  "project": "movie-001",
  "instruction": "12秒から0.5秒だけMVっぽいglitchを入れて"
}
```

```json
{
  "job_id": "edit-123",
  "status": "queued",
  "project": "movie-001"
}
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

利用者はRust/WASM/JSを知る必要がない。

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

同じEffectにRust/WASM、native Rust、JS、Remotion/TS、FFmpegなど複数backendを持てる。

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
| Text Animator | TSX/Remotion Skill |
| Shape Layer | SVG / Canvas |
| Effect | semantic effect |
| Expression | TSX expression / data |
| Adjustment Layer | effect scope |
| Transition | transition Skill |
| Render Queue | render job |
| Media Encoder | FFmpeg |
| After Effects Script | MCP / Skills |
| Plugin | engine adapter / Skill |
| Dynamic Link的連携 | canonical project data |

Adobeそのものをcloneするのではなく、**概念と編集能力をOSS/programmableに再構成する**。

## Skill categories

### Text / composition — TSX
title-card / telop / subtitle / kinetic-typography / social-caption / lower-third / logo-reveal / typewriter / pop / bounce / tracking / word-highlight

### Visual effects — JS / Rust / WASM
blur / glow / sharpen / glitch / chromatic-aberration / shake / zoom / punch-in / distortion / warp / noise / film / vignette / grain / color / pixelate

### Transition
fade / crossfade / wipe / slide / zoom / glitch / whip / match-cut

### Audio
normalize / silence-cut / ducking / fade / beat-detection / voice-music separation

### Analysis
STT / scene-detection / silence-detection / beat-detection / face-object detection / shot classification / color analysis

## Preset / Style Skills

単一Effectだけでなく、複数Skillを束ねて**編集スタイルそのものをSkill化**する。

```text
youtube-short
 ├─ scene-detection        → Python
 ├─ silence-cut            → Python/FFmpeg
 ├─ punch-in               → TSX
 ├─ kinetic-text           → TSX
 ├─ subtitle               → TSX
 ├─ sound-ducking          → Python/FFmpeg
 └─ color                  → JS/WASM

mv-style
 ├─ beat-detection         → Python
 ├─ glitch                 → WASM
 ├─ chromatic-aberration   → WASM
 ├─ zoom                   → TSX
 ├─ shake                  → TSX/WASM
 ├─ film                   → WASM
 └─ color                  → JS/WASM

talk-video
 ├─ STT                    → Python
 ├─ silence-cut            → Python/FFmpeg
 ├─ subtitle               → TSX
 ├─ punch-in               → TSX
 └─ audio-normalize        → Python/FFmpeg
```

## Python / Rust / JS / WASM strategy

### Python
分析・判断材料を作る。

```text
video → STT / scene / silence / beat / CV
     → analysis.json
     → Skill / MCP
     → project.json
```

### Rust
高速なframe/pixel処理を担当。最初はstandalone effect coreとして実装し、nativeとWASM targetを持たせる。

```text
Rust effect core
 ├─ native
 └─ wasm32
```

### JS
軽量なvisual effectやブラウザ側の即時プレビューを担当する。重い処理を必ずJSに寄せるのではなく、portable runtimeとしてWASM/Rustへ逃がせる。

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

## Browser / CLI / MCP / REST / AW / CI

同じcanonical dataとSkillを共有する。

```text
                 project.json
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
      MCP            REST           CLI
       │              │              │
       └──────────────┼──────────────┘
                      ▼
                     AW
                      │
                   Engines
                      │
                      ▼
                     CI
                      │
                      ▼
                 Artifact
```

GUIはoptional。基本はOpenCode → MCP、Browser → REST、GitHub → AWのどれからでも同じ編集状態へ到達できる。

## Reproducible rendering

Renderはproject JSON、Skill versions、engine versions、asset references、effect parametersから再現可能にする。

GitHub Actions / AWでpreview/render/artifactを生成する。

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
    Python   TSX    WASM
    analysis text   effects
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
3. **REST is the frontend HTTP interface.**
4. **Skills express intent, not implementation.**
5. **JSON is canonical.**
6. **TSX/Remotion owns text and composition.**
7. **Python owns analysis.**
8. **JS/Rust/WASM own visual style and effects.**
9. **WASM makes effects portable.**
10. **FFmpeg remains the media foundation.**
11. **GUI is optional.**
12. **Edits are inspectable, deterministic and reversible.**
13. **One Skill should be reusable across MCP/REST/CLI/browser/AW/CI where practical.**
14. **Do not make users learn the underlying engine.**
15. **Prefer small composable Skills over a monolithic editor.**
16. **Adobe compatibility is a behavioral/conceptual target, not a dependency.**

## Roadmap

### Phase 1 — Skeleton
- [x] monorepo architecture
- [x] canonical project/effect schema
- [x] Skill specification
- [x] MCP specification
- [x] Remotion-first architecture
- [x] TSX text / visual-effect responsibility boundary
- [x] REST interface concept
- [ ] GH AW execution pipeline

### Phase 2 — Talk to edit
- [ ] minimal MCP server
- [ ] REST `POST /video/edit` + job status
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
- [ ] JS effect runtime
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
- [ ] REST job API
- [ ] GitHub Actions / AW
- [ ] artifact/version management
- [ ] reproducible builds

## Non-goal

Adobeのproprietary implementationをcloneすることではない。

目標は、**会話・Skill・構造化データ・OSS runtimeによって、同等の制作概念をよりagent-nativeに実現すること**。
