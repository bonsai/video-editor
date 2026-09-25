# MCP

MCP is the conversational editing interface.

Initial tools:

- `video.inspect`
- `video.preview`
- `video.apply`
- `video.modify`
- `video.remove`
- `video.undo`
- `video.render`

Natural language should resolve to a Skill and then to a deterministic project mutation.

Example:

```text
「00:12から0.5秒、MVっぽいglitch」
        ↓
glitch Skill
        ↓
apply effect
        ↓
project.json
        ↓
WASM
        ↓
Remotion render
```
