import { randomUUID } from "node:crypto";
import { addTextLayer } from "./project.js";
import type { Project, Skill } from "./types.js";

export const telopSkill: Skill = {
  name: "telop",
  category: "text",
  intent: "Add a text telop at a specific time",
  inputs: [
    { name: "text", type: "string", required: true, description: "Text to display" },
    { name: "start", type: "time", required: true, description: "Start time in seconds" },
    { name: "duration", type: "duration", required: true, description: "Duration in seconds" },
    { name: "emphasis", type: "enum", enum: ["normal", "strong", "pop"], default: "normal" },
    { name: "animation", type: "enum", enum: ["none", "pop", "bounce"], default: "none" },
  ],
  defaults: { emphasis: "normal", animation: "none" },
  output: { type: "project-mutation", description: "Adds a text layer to the project" },
  preferredEngine: "tsx",
  fallback: ["remotion"],
  examples: [
    "ここがポイント",
    "12秒から0.5秒だけテロップを出して",
  ],
  apply(project: Project, params: Record<string, unknown>): Project {
    if (typeof params.text !== "string") {
      throw new TypeError("telop requires text parameter");
    }
    if (typeof params.start !== "number" || typeof params.duration !== "number") {
      throw new TypeError("telop requires start and duration numbers");
    }
    return addTextLayer(project, {
      id: `telop-${cryptoRandomId()}`,
      type: "text",
      text: params.text,
      start: params.start,
      duration: params.duration,
      style: "telop",
      emphasis: params.emphasis as "normal" | "strong" | "pop",
      animation: params.animation as "none" | "pop" | "bounce",
    });
  },
};

export const glitchSkill: Skill = {
  name: "glitch",
  category: "effects",
  intent: "Apply a glitch visual effect to a time range",
  inputs: [
    { name: "start", type: "time", required: true },
    { name: "duration", type: "duration", required: true },
    { name: "intensity", type: "number", default: 0.6 },
    { name: "rgbShift", type: "number", default: 0.02 },
  ],
  defaults: { intensity: 0.6, rgbShift: 0.02 },
  output: { type: "project-mutation", description: "Adds a glitch effect layer" },
  preferredEngine: "wasm",
  fallback: ["rust", "js"],
  examples: [
    "12秒から0.5秒だけglitch",
    "MVっぽくglitch入れて",
  ],
  apply(project: Project, params: Record<string, unknown>): Project {
    if (typeof params.start !== "number" || typeof params.duration !== "number") {
      throw new TypeError("glitch requires start and duration numbers");
    }
    return addTextLayer(project, {
      id: `effect-${cryptoRandomId()}`,
      type: "effect",
      name: "glitch",
      start: params.start,
      duration: params.duration,
      params: {
        intensity: params.intensity,
        rgbShift: params.rgbShift,
      },
      engine: "wasm",
    });
  },
};

export const silenceCutSkill: Skill = {
  name: "silence-cut",
  category: "audio",
  intent: "Remove silent segments from the audio track to tighten pacing",
  inputs: [
    { name: "thresholdDb", type: "number", default: -40 },
    { name: "minDuration", type: "duration", default: 0.3 },
  ],
  defaults: { thresholdDb: -40, minDuration: 0.3 },
  output: { type: "project-mutation", description: "Adds cut markers to the audio layer" },
  preferredEngine: "python",
  fallback: ["ffmpeg"],
  examples: ["無音部分を詰めて", "ジャンプカットっぽくして"],
  apply(project: Project, _params: Record<string, unknown>): Project {
    // In a real implementation this would analyze audio and produce cuts.
    // For testing we mark the first audio layer with a placeholder cut.
    if (project.layers.audio.length === 0) {
      return project;
    }
    const [first, ...rest] = project.layers.audio;
    return {
      ...project,
      layers: {
        ...project.layers,
        audio: [
          {
            ...first,
            cuts: [...(first.cuts ?? []), { start: 1.0, duration: 0.3 }],
          },
          ...rest,
        ],
      },
    };
  },
};

function cryptoRandomId(): string {
  return randomUUID();
}
