import { describe, expect, it } from "vitest";
import {
  createProject,
  assertProject,
  InMemorySkillRegistry,
  telopSkill,
  glitchSkill,
  silenceCutSkill,
} from "./index.js";

describe("project state", () => {
  it("creates an empty project with required layers", () => {
    const project = createProject({ duration: 30, fps: 30 });

    expect(project.version).toBe("0.0.1");
    expect(project.composition.duration).toBe(30);
    expect(project.layers.audio).toEqual([]);
    expect(project.layers.image).toEqual([]);
    expect(project.layers.textEffects).toEqual([]);
  });

  it("validates a well-formed project", () => {
    const project = createProject({ duration: 30, fps: 30 });
    expect(() => assertProject(project)).not.toThrow();
  });

  it("rejects a project without composition", () => {
    expect(() => assertProject({})).toThrow("project.composition is required");
  });

  it("rejects a project without layers", () => {
    expect(() =>
      assertProject({ composition: { duration: 10, fps: 30 } })
    ).toThrow("project.layers is required");
  });

  it("rejects non-positive fps", () => {
    expect(() =>
      assertProject(
        createProject({ duration: 10, fps: 0 }, { layers: { audio: [], image: [], textEffects: [] } })
      )
    ).toThrow("project.composition.fps must be a positive number");
  });
});

describe("skill registry", () => {
  it("registers and retrieves a skill by name", () => {
    const registry = new InMemorySkillRegistry();
    registry.register(telopSkill);

    expect(registry.get("telop")).toBe(telopSkill);
    expect(registry.get("missing")).toBeUndefined();
  });

  it("lists skills by category", () => {
    const registry = new InMemorySkillRegistry();
    registry.register(telopSkill);
    registry.register(glitchSkill);
    registry.register(silenceCutSkill);

    expect(registry.list("text")).toHaveLength(1);
    expect(registry.list("effects")).toHaveLength(1);
    expect(registry.list("audio")).toHaveLength(1);
    expect(registry.list()).toHaveLength(3);
  });

  it("resolves a skill from natural-language-like input", () => {
    const registry = new InMemorySkillRegistry();
    registry.register(glitchSkill);

    expect(registry.resolve("glitch")).toBe(glitchSkill);
    expect(registry.resolve("MVっぽくglitch入れて")).toBe(glitchSkill);
  });

  it("throws when executing an unknown skill", () => {
    const registry = new InMemorySkillRegistry();
    const project = createProject({ duration: 30, fps: 30 });

    expect(() => registry.execute("unknown", project)).toThrow(
      "Skill not found: unknown"
    );
  });
});

describe("telop skill", () => {
  it("adds a text layer to the project", () => {
    const registry = new InMemorySkillRegistry();
    registry.register(telopSkill);

    const project = createProject({ duration: 30, fps: 30 });
    const result = registry.execute("telop", project, {
      text: "ここがポイント",
      start: 12,
      duration: 1.5,
      emphasis: "strong",
      animation: "pop",
    });

    expect(result.skill).toBe("telop");
    expect(result.resolvedEngines).toContain("tsx");
    expect(result.resolvedEngines).toContain("remotion");
    expect(result.project.layers.textEffects).toHaveLength(1);

    const layer = result.project.layers.textEffects[0];
    expect(layer.type).toBe("text");
    if (layer.type !== "text") throw new Error("expected text layer");
    expect(layer.text).toBe("ここがポイント");
    expect(layer.start).toBe(12);
    expect(layer.duration).toBe(1.5);
    expect(layer.style).toBe("telop");
    expect(layer.emphasis).toBe("strong");
    expect(layer.animation).toBe("pop");
  });

  it("uses defaults for optional params", () => {
    const registry = new InMemorySkillRegistry();
    registry.register(telopSkill);

    const project = createProject({ duration: 30, fps: 30 });
    const result = registry.execute("telop", project, {
      text: "hello",
      start: 0,
      duration: 1,
    });

    const layer = result.project.layers.textEffects[0];
    expect(layer.type).toBe("text");
    if (layer.type !== "text") throw new Error("expected text layer");
    expect(layer.emphasis).toBe("normal");
    expect(layer.animation).toBe("none");
  });

  it("throws when required params are missing", () => {
    const registry = new InMemorySkillRegistry();
    registry.register(telopSkill);

    const project = createProject({ duration: 30, fps: 30 });
    expect(() => registry.execute("telop", project, { text: "only text" })).toThrow(
      "telop requires start and duration numbers"
    );
  });
});

describe("glitch skill", () => {
  it("adds a wasm effect layer", () => {
    const registry = new InMemorySkillRegistry();
    registry.register(glitchSkill);

    const project = createProject({ duration: 30, fps: 30 });
    const result = registry.execute("glitch", project, {
      start: 12,
      duration: 0.5,
      intensity: 0.8,
      rgbShift: 0.03,
    });

    expect(result.skill).toBe("glitch");
    expect(result.resolvedEngines).toContain("wasm");
    expect(result.resolvedEngines).toContain("rust");
    expect(result.resolvedEngines).toContain("js");
    expect(result.project.layers.textEffects).toHaveLength(1);

    const layer = result.project.layers.textEffects[0];
    expect(layer.type).toBe("effect");
    if (layer.type !== "effect") throw new Error("expected effect layer");
    expect(layer.name).toBe("glitch");
    expect(layer.start).toBe(12);
    expect(layer.duration).toBe(0.5);
    expect(layer.engine).toBe("wasm");
    expect(layer.params).toEqual({ intensity: 0.8, rgbShift: 0.03 });
  });
});

describe("silence-cut skill", () => {
  it("does nothing when no audio layer exists", () => {
    const registry = new InMemorySkillRegistry();
    registry.register(silenceCutSkill);

    const project = createProject({ duration: 30, fps: 30 });
    const result = registry.execute("silence-cut", project, {});

    expect(result.resolvedEngines).toContain("python");
    expect(result.resolvedEngines).toContain("ffmpeg");
    expect(result.project.layers.audio).toHaveLength(0);
  });

  it("marks a cut on the first audio layer", () => {
    const registry = new InMemorySkillRegistry();
    registry.register(silenceCutSkill);

    const project = createProject(
      { duration: 30, fps: 30 },
      {
        layers: {
          audio: [
            {
              id: "audio-1",
              type: "audio",
              assetId: "asset-1",
              start: 0,
              duration: 30,
              volume: 1,
            },
          ],
          image: [],
          textEffects: [],
        },
      }
    );

    const result = registry.execute("silence-cut", project, {
      thresholdDb: -45,
      minDuration: 0.25,
    });

    expect(result.project.layers.audio[0].cuts).toEqual([
      { start: 1.0, duration: 0.3 },
    ]);
  });
});

describe("layer separation", () => {
  it("keeps audio, image and text/effect layers isolated", () => {
    const registry = new InMemorySkillRegistry();
    registry.register(telopSkill);
    registry.register(glitchSkill);
    registry.register(silenceCutSkill);

    let project = createProject(
      { duration: 30, fps: 30 },
      {
        layers: {
          audio: [
            {
              id: "audio-1",
              type: "audio",
              assetId: "asset-1",
              start: 0,
              duration: 30,
            },
          ],
          image: [
            {
              id: "image-1",
              type: "video",
              assetId: "asset-2",
              start: 0,
              duration: 30,
            },
          ],
          textEffects: [],
        },
      }
    );

    project = registry.execute("telop", project, {
      text: "タイトル",
      start: 0,
      duration: 2,
    }).project;
    project = registry.execute("glitch", project, {
      start: 5,
      duration: 0.5,
    }).project;
    project = registry.execute("silence-cut", project, {}).project;

    expect(project.layers.audio).toHaveLength(1);
    expect(project.layers.image).toHaveLength(1);
    expect(project.layers.textEffects).toHaveLength(2);
    expect(project.layers.audio[0].cuts).toHaveLength(1);
  });
});
